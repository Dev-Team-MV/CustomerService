import ClubHouse, { DEFAULT_INTERIOR_KEYS } from '../models/ClubHouse.js'
import { uploadFile } from '../services/storageService.js'
import crypto from 'crypto'
import path from 'path'

const GCS_FOLDER = 'clubhouse'

/**
 * GET Club House (singleton). Returns the single document with exterior, blueprints, interior.
 */
export const getClubHouse = async (req, res) => {
  try {
    let doc = await ClubHouse.findOne()
    if (!doc) {
      doc = await ClubHouse.create({})
    }
    res.json(doc)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

/**
 * POST Upload images to Club House.
 * Body (form-data): section = 'exterior' | 'blueprints' | 'interior'
 *   - If section = 'interior', required: interiorKey (e.g. 'Reception', 'Managers Office', ...)
 * Files: 'images' (array of files) or 'image' (single file)
 * Appends URLs to the corresponding array.
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

    const makePublic = process.env.GCS_MAKE_PUBLIC === 'true' || false
    const uploadedUrls = []

    for (const file of files) {
      const fileExtension = path.extname(file.originalname)
      const fileName = `${crypto.randomBytes(16).toString('hex')}${Date.now()}${fileExtension}`
      const result = await uploadFile(
        file.buffer,
        fileName,
        file.mimetype,
        makePublic,
        GCS_FOLDER
      )
      const url = result.publicUrl || result.signedUrl
      uploadedUrls.push(url)
    }

    if (section === 'exterior') {
      doc.exterior = doc.exterior || []
      doc.exterior.push(...uploadedUrls)
    } else if (section === 'blueprints') {
      doc.blueprints = doc.blueprints || []
      doc.blueprints.push(...uploadedUrls)
    } else {
      const key = req._clubHouseInteriorKey
      if (!doc.interior) doc.interior = {}
      if (!Array.isArray(doc.interior[key])) doc.interior[key] = []
      doc.interior[key].push(...uploadedUrls)
    }

    await doc.save()

    res.status(200).json({
      message: `${uploadedUrls.length} image(s) uploaded successfully`,
      section,
      ...(section === 'interior' && { interiorKey: req._clubHouseInteriorKey }),
      uploadedUrls,
      clubHouse: doc
    })
  } catch (error) {
    console.error('ClubHouse upload error:', error)
    res.status(500).json({ message: error.message || 'Error uploading images' })
  }
}

/**
 * GET list of valid interior keys (for admin UI).
 */
export const getClubHouseInteriorKeys = (req, res) => {
  res.json({ interiorKeys: DEFAULT_INTERIOR_KEYS })
}
