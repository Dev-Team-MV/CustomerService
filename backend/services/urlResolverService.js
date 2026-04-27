import { getSignedUrl } from './storageService.js'

const BUCKET_NAME = process.env.GCS_BUCKET_NAME || 'customer-service-7cc'
const GCS_PATTERNS = [
  new RegExp(`https://storage\\.googleapis\\.com/${BUCKET_NAME}/([^?]+)`, 'i'),
  new RegExp(`https://storage\\.cloud\\.google\\.com/${BUCKET_NAME}/([^?]+)`, 'i'),
  new RegExp(`https://[^/]+\\.googleapis\\.com/${BUCKET_NAME}/([^?]+)`, 'i')
]

/**
 * Extract GCS path from a full URL.
 * @param {string} urlOrPath - Full GCS URL or already a path
 * @returns {string|null} Path like "pdn/models/xxx.jpg" or null
 */
export function extractPathFromUrl (urlOrPath) {
  if (!urlOrPath || typeof urlOrPath !== 'string') return null
  const s = urlOrPath.trim()
  if (!s) return null
  // Already a path (no protocol)
  if (!s.startsWith('http://') && !s.startsWith('https://')) {
    const clean = s.replace(/^\/+/, '')
    return clean.length > 0 ? clean : null
  }
  for (const re of GCS_PATTERNS) {
    const m = s.match(re)
    if (m && m[1]) return decodeURIComponent(m[1])
  }
  return null
}

/**
 * Check if string looks like a GCS path (not a full URL).
 */
export function isPath (str) {
  if (!str || typeof str !== 'string') return false
  const s = str.trim()
  return s.length > 0 && !s.startsWith('http://') && !s.startsWith('https://')
}

/**
 * Resolve path or URL to a fresh signed URL.
 * @param {string} pathOrUrl - GCS path or full URL
 * @param {number} expiresIn - ms (default 1 year for display)
 * @returns {Promise<string|null>} Signed URL or null on error
 */
export async function resolveToSignedUrl (pathOrUrl, expiresIn = 365 * 24 * 60 * 60 * 1000) {
  const path = extractPathFromUrl(pathOrUrl)
  if (!path) return pathOrUrl || null
  try {
    return await getSignedUrl(path, expiresIn)
  } catch (e) {
    console.error('resolveToSignedUrl error:', e.message)
    return null
  }
}

/** Keys that hold URL/path values to resolve. */
const URL_KEYS = ['url', 'fileUrl']

/**
 * Recursively hydrate url/fileUrl fields in an object with fresh signed URLs.
 * Mutates the object in place.
 * @param {any} obj - Object, array, or primitive
 * @param {number} expiresIn - ms for signed URL
 */
export async function hydrateUrlsInObject (
  obj,
  expiresIn = 365 * 24 * 60 * 60 * 1000,
  visited = new WeakSet()
) {
  if (obj == null) return
  if (typeof obj === 'object') {
    if (visited.has(obj)) return
    visited.add(obj)
  }
  if (Array.isArray(obj)) {
    for (let i = 0; i < obj.length; i++) {
      const v = obj[i]
      if (typeof v === 'string') {
        const resolved = await resolveToSignedUrl(v, expiresIn)
        if (resolved) obj[i] = resolved
      } else if (typeof v === 'object' && v !== null) {
        await hydrateUrlsInObject(v, expiresIn, visited)
      }
    }
    return
  }
  if (typeof obj !== 'object') return
  for (const key of Object.keys(obj)) {
    const val = obj[key]
    if (URL_KEYS.includes(key) && typeof val === 'string') {
      const resolved = await resolveToSignedUrl(val, expiresIn)
      if (resolved) obj[key] = resolved
    } else if ((key === 'url' || key === 'urls') && Array.isArray(val)) {
      for (let i = 0; i < val.length; i++) {
        if (typeof val[i] === 'string') {
          const resolved = await resolveToSignedUrl(val[i], expiresIn)
          if (resolved) val[i] = resolved
        }
      }
    } else if (typeof val === 'object' && val !== null) {
      await hydrateUrlsInObject(val, expiresIn, visited)
    }
  }
}

/**
 * Normalize incoming fileUrl/url for storage: store path only.
 * If client sends full URL, extract path. If path, use as-is.
 */
export function normalizePathForStorage (urlOrPath) {
  const path = extractPathFromUrl(urlOrPath)
  return path || (typeof urlOrPath === 'string' ? urlOrPath.trim() : null) || null
}
