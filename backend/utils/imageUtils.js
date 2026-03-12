import { normalizePathForStorage } from '../services/urlResolverService.js'

/**
 * Normaliza un ítem de imagen (legacy string o { url, isPublic }) a { url, isPublic }.
 * Guarda path en lugar de URL completa para evitar caducidad de signed URLs.
 * @param {string|{ url: string, isPublic?: boolean }|null} item
 * @returns {{ url: string, isPublic: boolean }|null}
 */
export function normalizeImageItem (item) {
  if (item == null) return null
  let url
  let isPublic = true
  if (typeof item === 'string') {
    url = normalizePathForStorage(item)
  } else if (typeof item === 'object' && typeof item.url === 'string') {
    url = normalizePathForStorage(item.url)
    isPublic = item.isPublic !== false
  } else {
    return null
  }
  return url ? { url, isPublic } : null
}

/**
 * Normaliza un array de imágenes a [{ url, isPublic }].
 * @param {Array<string|{ url: string, isPublic?: boolean }>|undefined} arr
 * @returns {Array<{ url: string, isPublic: boolean }>}
 */
export function normalizeImageArray (arr) {
  if (!Array.isArray(arr)) return []
  return arr.map(normalizeImageItem).filter(Boolean)
}
