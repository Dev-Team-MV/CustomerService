import ClubHouse, { DEFAULT_INTERIOR_KEYS } from '../models/ClubHouse.js'
import { uploadFile } from '../services/storageService.js'
import { processImageForUpload } from '../services/imageProcessingService.js'
import crypto from 'crypto'
import path from 'path'

const GCS_FOLDER = 'clubhouse'

/** Normaliza un ítem de imagen (legacy string o { url, isPublic }) a { url, isPublic }. */
function normalizeImageItem (item) {
  if (item == null) return null
  if (typeof item === 'string') return { url: item, isPublic: true }
  if (typeof item === 'object' && typeof item.url === 'string') {
    return { url: item.url, isPublic: item.isPublic !== false }
  }
  return null
}

/** Normaliza un array de imágenes (exterior/blueprints o cada array de interior). */
function normalizeImageArray (arr) {
  if (!Array.isArray(arr)) return []
  return arr.map(normalizeImageItem).filter(Boolean)
}

/** Migra y normaliza el documento: strings -> { url, isPublic: true }. Guarda si hubo cambios. */
async function migrateAndNormalize (doc) {
  let changed = false

  if (Array.isArray(doc.exterior)) {
    const normalized = normalizeImageArray(doc.exterior)
    const hasLegacy = doc.exterior.some((x) => typeof x === 'string')
    if (hasLegacy || (normalized.length > 0 && typeof doc.exterior[0] === 'string')) {
      doc.exterior = normalized
      changed = true
    }
  }

  if (Array.isArray(doc.blueprints)) {
    const normalized = normalizeImageArray(doc.blueprints)
    const hasLegacy = doc.blueprints.some((x) => typeof x === 'string')
    if (hasLegacy || (normalized.length > 0 && typeof doc.blueprints[0] === 'string')) {
      doc.blueprints = normalized
      changed = true
    }
  }

  if (doc.interior && typeof doc.interior === 'object') {
    for (const key of Object.keys(doc.interior)) {
      const arr = doc.interior[key]
      if (!Array.isArray(arr)) continue
      const normalized = normalizeImageArray(arr)
      const hasLegacy = arr.some((x) => typeof x === 'string')
      if (hasLegacy || (normalized.length > 0 && typeof arr[0] === 'string')) {
        doc.interior[key] = normalized
        changed = true
      }
    }
    if (changed) doc.markModified('interior')
  }

  if (changed) await doc.save()
  return doc
}

/**
 * GET Club House (singleton). Returns the single document with exterior, blueprints, interior.
 * Cada imagen es { url, isPublic }. isPublic = true si se puede mostrar sin token.
 */
export const getClubHouse = async (req, res) => {
  try {
    let doc = await ClubHouse.findOne()
    if (!doc) {
      doc = await ClubHouse.create({})
    }
    doc = await migrateAndNormalize(doc)
    res.json(doc)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

/**
 * POST Upload images to Club House.
 * Body (form-data): section = 'exterior' | 'blueprints' | 'interior'
 *   - If section = 'interior', required: interiorKey (e.g. 'Reception', 'Managers Office', ...)
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
    if (!['exterior', 'blueprints', 'interior'].includes(section)) {
      return res.status(400).json({
        message: "section is required and must be one of: exterior, blueprints, interior"
      })
    }

    const isPublic = req.body.isPublic !== undefined && req.body.isPublic !== ''
      ? req.body.isPublic === 'true' || req.body.isPublic === true
      : true

    if (section === 'interior') {
      const interiorKey = req.body.interiorKey || req.body.interior_key
      if (!interiorKey || typeof interiorKey !== 'string') {
        return res.status(400).json({
          message: 'interiorKey is required when section is interior (e.g. Reception, Managers Office, Conference Room)'
        })
      }
      req._clubHouseInteriorKey = interiorKey.trim()
    }

    let doc = await ClubHouse.findOne()
    if (!doc) {
      doc = await ClubHouse.create({})
    }

    doc = await migrateAndNormalize(doc)

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
      const url = result.publicUrl || result.signedUrl
      uploadedItems.push({ url, isPublic })
    }

    if (section === 'exterior') {
      doc.exterior = doc.exterior || []
      doc.exterior.push(...uploadedItems)
    } else if (section === 'blueprints') {
      doc.blueprints = doc.blueprints || []
      doc.blueprints.push(...uploadedItems)
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
    if (!['exterior', 'blueprints', 'interior'].includes(sec)) {
      return res.status(400).json({
        message: "section is required and must be one of: exterior, blueprints, interior"
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
    else {
      const key = (interiorKey || req.body.interior_key || '').trim()
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
      ...(sec === 'interior' && { interiorKey: (interiorKey || req.body.interior_key || '').trim() }),
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
