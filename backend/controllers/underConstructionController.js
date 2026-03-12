import UnderConstruction from '../models/UnderConstruction.js'
import { hydrateUrlsInObject, normalizePathForStorage } from '../services/urlResolverService.js'

/**
 * Ordena por `order` y asigna nombre: base-1, base-2, ...
 * La base se obtiene del name que envía el front (ej. "cualquiera-1" → "cualquiera") o del title del doc.
 */
function getBaseFromName (name) {
  if (!name || typeof name !== 'string') return null
  const match = name.trim().match(/^(.+)-\d+$/)
  return match ? match[1].trim() : null
}

function normalizeMedia (items, title) {
  if (!Array.isArray(items) || items.length === 0) return []
  const sorted = [...items]
    .filter((item) => item && typeof item.order === 'number' && ['image', 'video'].includes(item.type))
    .sort((a, b) => a.order - b.order)
  const firstBase = sorted.length ? getBaseFromName(sorted[0].name) : null
  const fallback = (title || 'item').replace(/[/\\?*:]/g, '').trim() || 'item'
  const base = firstBase || fallback
  return sorted.map((item, index) => ({
    type: item.type,
    url: normalizePathForStorage(item.url) || '',
    name: `${base}-${index + 1}`,
    order: index + 1,
    isPublic: item.isPublic !== false
  }))
}

export const getAllUnderConstruction = async (req, res) => {
  try {
    const items = await UnderConstruction.find().sort({ createdAt: -1 })
    const data = items.map((i) => i.toObject())
    await hydrateUrlsInObject(data)
    res.json(data)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const getUnderConstructionById = async (req, res) => {
  try {
    const item = await UnderConstruction.findById(req.params.id)
    if (item) {
      const data = item.toObject()
      await hydrateUrlsInObject(data)
      res.json(data)
    } else {
      res.status(404).json({ message: 'UnderConstruction not found' })
    }
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const createUnderConstruction = async (req, res) => {
  try {
    const { title, description, media = [] } = req.body

    const normalizedMedia = normalizeMedia(media, title)

    const doc = await UnderConstruction.create({
      title: title || '',
      description: description || '',
      media: normalizedMedia
    })

    const data = doc.toObject()
    await hydrateUrlsInObject(data)
    res.status(201).json(data)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const updateUnderConstruction = async (req, res) => {
  try {
    const doc = await UnderConstruction.findById(req.params.id)
    if (!doc) {
      return res.status(404).json({ message: 'UnderConstruction not found' })
    }

    const { title, description, media } = req.body

    if (title !== undefined) doc.title = title
    if (description !== undefined) doc.description = description
    if (media !== undefined) doc.media = normalizeMedia(media, doc.title)

    const updated = await doc.save()
    const data = updated.toObject()
    await hydrateUrlsInObject(data)
    res.json(data)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

/**
 * PATCH Update visibility (isPublic) of a single media item by index.
 * PATCH /api/under-construction/:id/media/:index/visibility — Body: { isPublic }
 */
export const updateUnderConstructionMediaVisibility = async (req, res) => {
  try {
    const doc = await UnderConstruction.findById(req.params.id)
    if (!doc) {
      return res.status(404).json({ message: 'UnderConstruction not found' })
    }
    const index = parseInt(req.params.index, 10)
    if (Number.isNaN(index) || index < 0) {
      return res.status(400).json({ message: 'Valid media index is required' })
    }
    if (!Array.isArray(doc.media) || index >= doc.media.length) {
      return res.status(404).json({ message: 'Media item not found at index' })
    }
    const wantPublic = req.body.isPublic === true || req.body.isPublic === 'true'
    doc.media[index].isPublic = wantPublic
    doc.markModified('media')
    const updated = await doc.save()
    const data = updated.toObject()
    await hydrateUrlsInObject(data)
    res.json(data)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const deleteUnderConstruction = async (req, res) => {
  try {
    const doc = await UnderConstruction.findById(req.params.id)
    if (doc) {
      await doc.deleteOne()
      res.json({ message: 'UnderConstruction deleted successfully' })
    } else {
      res.status(404).json({ message: 'UnderConstruction not found' })
    }
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}
