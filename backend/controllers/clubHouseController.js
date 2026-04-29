import ClubHouse, { DEFAULT_INTERIOR_KEYS } from '../models/ClubHouse.js'
import { uploadFile, deleteFile } from '../services/storageService.js'
import { processImageForUpload } from '../services/imageProcessingService.js'
import { hydrateUrlsInObject, normalizePathForStorage } from '../services/urlResolverService.js'
import crypto from 'crypto'
import path from 'path'

const GCS_FOLDER = 'clubhouse'
const INTERIOR_KEY_RENAMES = [
  ['Conference room', 'Meeting Room'],
  ['Conference Room', 'Meeting Room'],
  ['Meeting room', 'Meeting Room'],
  ['Multi-purpose room', 'Mixed-use Room'],
  ['Multi-Purpose Room', 'Mixed-use Room'],
  ['Mixed-use room', 'Mixed-use Room'],
  ['Managers Office', 'Manager Office'],
  ['Manager office', 'Manager Office'],
  ['Reception', 'Property Management'],
  ['property management', 'Property Management'],
  ['Property management', 'Property Management'],
  ['Counter', 'Concierge'],
  ['front desk', 'Concierge'],
  ['Lakeside', 'Boat Dock'],
  ['boat dock', 'Boat Dock'],
  ['Boat dock', 'Boat Dock'],
  ['Bathroom', 'Bathrooms & Lockers'],
  ['Bathrooms', 'Bathrooms & Lockers'],
  ['bathrooms & lockers', 'Bathrooms & Lockers'],
  ['Bathrooms & lockers', 'Bathrooms & Lockers'],
  ['Machines', 'Mechanical Room'],
  ['mechanical room', 'Mechanical Room'],
  ['Mechanical room', 'Mechanical Room'],
  ['Counter Hallway', 'Use-mixed Hallway'],
  ['Use-mixed hallway', 'Use-mixed Hallway']
]
const INTERIOR_KEY_RENAME_MAP = new Map(INTERIOR_KEY_RENAMES)
const INTERIOR_RESPONSE_ALIASES = [
  ['Property management', 'Property Management'],
  ['Manager office', 'Manager Office'],
  ['Meeting room', 'Meeting Room'],
  ['Mixed-use room', 'Mixed-use Room'],
  ['Bathrooms & lockers', 'Bathrooms & Lockers'],
  ['Boat dock', 'Boat Dock'],
  ['Mechanical room', 'Mechanical Room'],
  ['Use-mixed hallway', 'Use-mixed Hallway']
]

/** Extrae el nombre de archivo de una URL (último segmento del path, sin query). */
function getFilenameFromUrl (url) {
  if (typeof url !== 'string' || !url) return null
  const pathPart = url.split('?')[0].trim()
  return pathPart.includes('/') ? pathPart.split('/').pop() : pathPart
}

/** Normaliza un ítem de imagen (legacy string o { url, isPublic, name? }) a { url, isPublic, name? }. Guarda path en lugar de URL. */
function normalizeImageItem (item) {
  if (item == null) return null
  let url
  let isPublic = true
  let name
  if (typeof item === 'string') {
    url = normalizePathForStorage(item)
  } else if (typeof item === 'object' && typeof item.url === 'string') {
    url = normalizePathForStorage(item.url)
    isPublic = item.isPublic !== false
    name = typeof item.name === 'string' ? item.name.trim() || undefined : undefined
  } else {
    return null
  }
  if (!url) return null
  return { url, isPublic, ...(name !== undefined && { name }) }
}

/** Normaliza un array de imágenes (exterior/blueprints o cada array de interior). */
function normalizeImageArray (arr) {
  if (!Array.isArray(arr)) return []
  return arr.map(normalizeImageItem).filter(Boolean)
}

function mergeImageArraysUniqueByUrl (target = [], source = []) {
  const out = Array.isArray(target) ? [...target] : []
  const seen = new Set(out.map((item) => item?.url).filter(Boolean))

  for (const item of Array.isArray(source) ? source : []) {
    const key = item?.url
    if (!key || seen.has(key)) continue
    out.push(item)
    seen.add(key)
  }
  return out
}

function normalizeInteriorKey (key) {
  const trimmed = typeof key === 'string' ? key.trim() : ''
  if (!trimmed) return ''
  return INTERIOR_KEY_RENAME_MAP.get(trimmed) || trimmed
}

function addLegacyInteriorAliases (interior) {
  if (!interior || typeof interior !== 'object') return
  for (const [legacyKey, canonicalKey] of INTERIOR_RESPONSE_ALIASES) {
    if (interior[legacyKey] !== undefined) continue
    if (!Array.isArray(interior[canonicalKey])) continue
    interior[legacyKey] = interior[canonicalKey]
  }
}

/** Migra y normaliza el documento: strings -> { url, isPublic: true }. Elimina ítems sin url válido. Guarda si hubo cambios. */
async function migrateAndNormalize (doc) {
  let changed = false

  if (Array.isArray(doc.exterior)) {
    const normalized = normalizeImageArray(doc.exterior)
    const same = normalized.length === doc.exterior.length && normalized.every((n, i) => {
      const o = doc.exterior[i]
      return (typeof o === 'string' ? o === n.url : o?.url === n.url) && o?.isPublic === n.isPublic && (o?.name ?? null) === (n.name ?? null)
    })
    if (!same) {
      doc.exterior = normalized
      changed = true
    }
  }

  if (Array.isArray(doc.blueprints)) {
    const normalized = normalizeImageArray(doc.blueprints)
    const same = normalized.length === doc.blueprints.length && normalized.every((n, i) => {
      const o = doc.blueprints[i]
      return (typeof o === 'string' ? o === n.url : o?.url === n.url) && o?.isPublic === n.isPublic && (o?.name ?? null) === (n.name ?? null)
    })
    if (!same) {
      doc.blueprints = normalized
      changed = true
    }
  }

  if (Array.isArray(doc.deck)) {
    const normalized = normalizeImageArray(doc.deck)
    const same = normalized.length === doc.deck.length && normalized.every((n, i) => {
      const o = doc.deck[i]
      return (typeof o === 'string' ? o === n.url : o?.url === n.url) && o?.isPublic === n.isPublic && (o?.name ?? null) === (n.name ?? null)
    })
    if (!same) {
      doc.deck = normalized
      changed = true
    }
  }

  if (doc.interior && typeof doc.interior === 'object') {
    for (const key of Object.keys(doc.interior)) {
      const arr = doc.interior[key]
      if (!Array.isArray(arr)) continue
      const normalized = normalizeImageArray(arr)
      const same = normalized.length === arr.length && normalized.every((n, i) => {
        const o = arr[i]
        return (typeof o === 'string' ? o === n.url : o?.url === n.url) && o?.isPublic === n.isPublic && (o?.name ?? null) === (n.name ?? null)
      })
      if (!same) {
        doc.interior[key] = normalized
        changed = true
      }
    }
    // Re-link legacy interior keys to current canonical names to keep images visible
    for (const [oldKey, newKey] of INTERIOR_KEY_RENAMES) {
      if (oldKey === newKey) continue
      const oldArr = doc.interior[oldKey]
      if (!Array.isArray(oldArr) || oldArr.length === 0) continue

      doc.interior[newKey] = mergeImageArraysUniqueByUrl(doc.interior[newKey], oldArr)
      delete doc.interior[oldKey]
      changed = true
    }
    if (changed) doc.markModified('interior')
  }

  if (changed) await doc.save()
  return doc
}

/**
 * GET Club House (singleton). Returns the single document with exterior, blueprints, interior, deck.
 * Cada imagen es { url, isPublic }. isPublic = true si se puede mostrar sin token.
 */
export const getClubHouse = async (req, res) => {
  try {
    let doc = await ClubHouse.findOne()
    if (!doc) {
      doc = await ClubHouse.create({})
    }
    doc = await migrateAndNormalize(doc)
    const data = doc.toObject ? doc.toObject() : doc
    addLegacyInteriorAliases(data.interior)
    await hydrateUrlsInObject(data)
    res.json(data)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

/** Filtra un array de imágenes dejando solo las que tienen isPublic === true. */
function filterPublicImages (arr) {
  if (!Array.isArray(arr)) return []
  return arr.map(normalizeImageItem).filter(Boolean).filter((item) => item.isPublic === true)
}

/**
 * GET Club House (public). Returns clubhouse with only public images (isPublic: true).
 * No authentication required. For public site, landing, etc.
 */
export const getClubHousePublic = async (req, res) => {
  try {
    let doc = await ClubHouse.findOne()
    if (!doc) {
      doc = await ClubHouse.create({})
    }
    doc = await migrateAndNormalize(doc)

    const publicPayload = {
      exterior: filterPublicImages(doc.exterior),
      blueprints: filterPublicImages(doc.blueprints),
      deck: filterPublicImages(doc.deck),
      interior: {}
    }
    if (doc.interior && typeof doc.interior === 'object') {
      for (const key of Object.keys(doc.interior)) {
        publicPayload.interior[key] = filterPublicImages(doc.interior[key])
      }
    }
    addLegacyInteriorAliases(publicPayload.interior)
    if (doc.recorridoVisibility && typeof doc.recorridoVisibility === 'object') {
      publicPayload.recorridoVisibility = doc.recorridoVisibility
    }

    await hydrateUrlsInObject(publicPayload)
    res.json(publicPayload)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

/**
 * POST Upload images to Club House.
 * Body (form-data): section = 'exterior' | 'blueprints' | 'deck' | 'interior'
 *   - If section = 'interior', required: interiorKey (e.g. 'Property Management', 'Manager Office', ...)
 *   - isPublic = 'true' | 'false' (opcional): si la(s) imagen(es) se pueden mostrar sin token. Por defecto true.
 * Files: 'images' (array of files) or 'image' (single file)
 * Appends { url, isPublic } to the corresponding array.
 */
export const uploadClubHouseImages = async (req, res) => {
  try {
    const files = req.files && req.files.length
      ? req.files
      : req.file
        ? [req.file]
        : []

    if (files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' })
    }

    const section = (req.body.section || '').toLowerCase()
    if (!['exterior', 'blueprints', 'deck', 'interior'].includes(section)) {
      return res.status(400).json({
        message: "section is required and must be one of: exterior, blueprints, deck, interior"
      })
    }

    const isPublic = req.body.isPublic !== undefined && req.body.isPublic !== ''
      ? req.body.isPublic === 'true' || req.body.isPublic === true
      : true

    if (section === 'interior') {
      const interiorKey = req.body.interiorKey || req.body.interior_key
      if (!interiorKey || typeof interiorKey !== 'string') {
        return res.status(400).json({
          message: 'interiorKey is required when section is interior (e.g. Property Management, Manager Office, Meeting Room)'
        })
      }
      req._clubHouseInteriorKey = normalizeInteriorKey(interiorKey)
    }

    let doc = await ClubHouse.findOne()
    if (!doc) {
      doc = await ClubHouse.create({})
    }

    doc = await migrateAndNormalize(doc)

    // Asegurar arrays válidos por si la DB tenía ítems sin url (evitar fallo de validación al guardar)
    doc.exterior = normalizeImageArray(doc.exterior || [])
    doc.blueprints = normalizeImageArray(doc.blueprints || [])
    doc.deck = normalizeImageArray(doc.deck || [])
    if (doc.interior && typeof doc.interior === 'object') {
      for (const k of Object.keys(doc.interior)) {
        if (Array.isArray(doc.interior[k])) doc.interior[k] = normalizeImageArray(doc.interior[k])
      }
      doc.markModified('interior')
    }

    const makePublic = process.env.GCS_MAKE_PUBLIC === 'true' || false
    const uploadedItems = []

    for (const file of files) {
      const processed = await processImageForUpload(file.buffer, file.originalname, file.mimetype)
      const fileName = `${crypto.randomBytes(16).toString('hex')}${Date.now()}${processed.extension}`
      const result = await uploadFile(
        processed.buffer,
        fileName,
        processed.mimeType,
        makePublic,
        GCS_FOLDER
      )
      uploadedItems.push({ url: result.fileName, isPublic })
    }

    if (section === 'exterior') {
      doc.exterior = doc.exterior || []
      doc.exterior.push(...uploadedItems)
    } else if (section === 'blueprints') {
      doc.blueprints = doc.blueprints || []
      doc.blueprints.push(...uploadedItems)
    } else if (section === 'deck') {
      doc.deck = doc.deck || []
      doc.deck.push(...uploadedItems)
    } else {
      const key = req._clubHouseInteriorKey
      if (!doc.interior) doc.interior = {}
      if (!Array.isArray(doc.interior[key])) doc.interior[key] = []
      doc.interior[key].push(...uploadedItems)
      doc.markModified('interior')
    }

    await doc.save()

    res.status(200).json({
      message: `${uploadedItems.length} image(s) uploaded successfully`,
      section,
      ...(section === 'interior' && { interiorKey: req._clubHouseInteriorKey }),
      uploadedUrls: uploadedItems.map((i) => i.url),
      uploadedItems,
      clubHouse: doc
    })
  } catch (error) {
    console.error('ClubHouse upload error:', error)
    res.status(500).json({ message: error.message || 'Error uploading images' })
  }
}

/**
 * PATCH Update visibility (isPublic) of a single Club House image.
 * Body: { section, index, isPublic } or { section, interiorKey, index, isPublic } for interior.
 * isPublic: true = se puede mostrar sin token; false = requiere token.
 */
export const updateClubHouseImageVisibility = async (req, res) => {
  try {
    const { section, interiorKey, index, isPublic } = req.body
    const sec = (section || '').toLowerCase()
    if (!['exterior', 'blueprints', 'deck', 'interior'].includes(sec)) {
      return res.status(400).json({
        message: "section is required and must be one of: exterior, blueprints, deck, interior"
      })
    }
    const idx = index !== undefined && index !== '' ? parseInt(index, 10) : -1
    if (Number.isNaN(idx) || idx < 0) {
      return res.status(400).json({ message: 'index is required and must be a non-negative integer' })
    }
    const wantPublic = isPublic === true || isPublic === 'true'

    let doc = await ClubHouse.findOne()
    if (!doc) {
      doc = await ClubHouse.create({})
    }
    doc = await migrateAndNormalize(doc)

    let arr = null
    if (sec === 'exterior') arr = doc.exterior || []
    else if (sec === 'blueprints') arr = doc.blueprints || []
    else if (sec === 'deck') arr = doc.deck || []
    else {
      const key = normalizeInteriorKey(interiorKey || req.body.interior_key || '')
      if (!key) {
        return res.status(400).json({ message: 'interiorKey is required when section is interior' })
      }
      if (!doc.interior[key]) doc.interior[key] = []
      arr = doc.interior[key]
      doc.markModified('interior')
    }

    if (idx >= arr.length) {
      return res.status(404).json({ message: `No image at index ${idx} in ${sec}` })
    }

    const item = normalizeImageItem(arr[idx])
    if (!item) {
      return res.status(400).json({ message: 'Invalid image item at index' })
    }
    item.isPublic = wantPublic
    arr[idx] = item

    await doc.save()

    res.status(200).json({
      message: 'Image visibility updated',
      section: sec,
      ...(sec === 'interior' && { interiorKey: normalizeInteriorKey(interiorKey || req.body.interior_key || '') }),
      index: idx,
      isPublic: wantPublic,
      clubHouse: doc
    })
  } catch (error) {
    console.error('ClubHouse update visibility error:', error)
    res.status(500).json({ message: error.message })
  }
}

/**
 * GET list of valid interior keys (for admin UI).
 */
export const getClubHouseInteriorKeys = (req, res) => {
  res.json({ interiorKeys: DEFAULT_INTERIOR_KEYS })
}

/**
 * DELETE Club House images by filename and/or custom name.
 * Body: { filenames?: string[], names?: string[], deleteFromStorage?: boolean }
 *
 * Uso con filenames (nombres de archivo del listado GCS):
 *   1. GET /api/upload/files?folder=clubhouse → cada item tiene "name" (ej. "clubhouse/abc123.jpg" o solo "abc123.jpg").
 *   2. Extraé el nombre de archivo (ej. "abc123.jpg") y pasalo en filenames.
 *   Ejemplo: { "filenames": ["abc123.jpg", "def456.png"], "deleteFromStorage": true }
 *
 * Uso con names (nombres custom de cada imagen en el doc ClubHouse):
 *   1. GET /api/clubhouse → cada imagen puede tener "name" (ej. "Recepción", "Vista deck").
 *   2. Pasá esos nombres en el array names.
 *   Ejemplo: { "names": ["Recepción principal", "Vista deck"], "deleteFromStorage": true }
 *
 * - filenames: nombres de archivo (ej. "abc123.jpg") extraídos de la URL; se matchea con el último segmento del path.
 * - names: nombres custom (item.name) que quieras borrar.
 * - deleteFromStorage: si true, además borra el archivo en GCS (carpeta clubhouse). Default false.
 * Elimina de exterior, blueprints, deck e interior las que coincidan. Devuelve cuántas se quitaron y desde qué secciones.
 */
/** Normalize to last path segment so "clubhouse/abc.jpg" and "abc.jpg" both match. */
function toLastSegment (p) {
  const s = String(p).trim()
  return s.includes('/') ? s.split('/').pop() : s
}

export const deleteClubHouseImages = async (req, res) => {
  try {
    const { filenames = [], names = [], deleteFromStorage = false } = req.body
    const filenameSet = new Set(
      Array.isArray(filenames)
        ? filenames.map((f) => toLastSegment(f)).filter(Boolean)
        : []
    )
    const nameSet = new Set(Array.isArray(names) ? names.map((n) => String(n).trim()).filter(Boolean) : [])
    if (filenameSet.size === 0 && nameSet.size === 0) {
      return res.status(400).json({
        message: 'Send at least one of: filenames (array) or names (array)'
      })
    }

    const matches = (item) => {
      const url = typeof item === 'string' ? item : item?.url
      const fn = getFilenameFromUrl(url)
      const customName = typeof item === 'object' && item !== null && typeof item.name === 'string' ? item.name.trim() : null
      return (fn && filenameSet.has(fn)) || (customName && nameSet.has(customName))
    }

    let doc = await ClubHouse.findOne()
    if (!doc) {
      doc = await ClubHouse.create({})
    }
    doc = await migrateAndNormalize(doc)

    const removedFilenames = new Set()
    let removedCount = 0

    const filterAndCollect = (arr) => {
      if (!Array.isArray(arr)) return []
      const kept = []
      for (const item of arr) {
        if (matches(item)) {
          removedCount++
          const url = typeof item === 'string' ? item : item?.url
          const fn = getFilenameFromUrl(url)
          if (fn) removedFilenames.add(fn)
        } else {
          kept.push(item)
        }
      }
      return kept
    }

    doc.exterior = filterAndCollect(doc.exterior || [])
    doc.blueprints = filterAndCollect(doc.blueprints || [])
    doc.deck = filterAndCollect(doc.deck || [])
    if (doc.interior && typeof doc.interior === 'object') {
      for (const key of Object.keys(doc.interior)) {
        doc.interior[key] = filterAndCollect(doc.interior[key] || [])
      }
      doc.markModified('interior')
    }

    await doc.save()

    if (deleteFromStorage && removedFilenames.size > 0) {
      for (const fn of removedFilenames) {
        const fullPath = `${GCS_FOLDER}/${fn}`
        await deleteFile(fullPath).catch((err) => console.warn('GCS delete failed for', fullPath, err.message))
      }
    }

    res.status(200).json({
      message: `${removedCount} image(s) removed from Club House`,
      removedCount,
      removedFilenames: [...removedFilenames],
      deleteFromStorage: deleteFromStorage && removedFilenames.size > 0,
      clubHouse: doc
    })
  } catch (error) {
    console.error('ClubHouse delete images error:', error)
    res.status(500).json({ message: error.message || 'Error deleting images' })
  }
}
