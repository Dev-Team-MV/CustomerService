import EagleView from '../models/EagleView.js'
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

export const getAllEagleViews = async (req, res) => {
  try {
    const items = await EagleView.find().sort({ createdAt: -1 })
    const data = items.map((i) => i.toObject())
    await hydrateUrlsInObject(data)
    res.json(data)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const getEagleViewById = async (req, res) => {
  try {
    const item = await EagleView.findById(req.params.id)
    if (item) {
      const data = item.toObject()
      await hydrateUrlsInObject(data)
      res.json(data)
    } else {
      res.status(404).json({ message: 'EagleView not found' })
    }
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const createEagleView = async (req, res) => {
  try {
    const { title, description, date, media = [] } = req.body

    if (!date) {
      return res.status(400).json({ message: 'Date is required' })
    }

    const normalizedMedia = normalizeMedia(media, title)

    const doc = await EagleView.create({
      title: title || '',
      description: description || '',
      date: new Date(date),
      media: normalizedMedia
    })

    const data = doc.toObject()
    await hydrateUrlsInObject(data)
    res.status(201).json(data)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const updateEagleView = async (req, res) => {
  try {
    const doc = await EagleView.findById(req.params.id)
    if (!doc) {
      return res.status(404).json({ message: 'EagleView not found' })
    }

    const { title, description, date, media } = req.body

    if (title !== undefined) doc.title = title
    if (description !== undefined) doc.description = description
    if (date !== undefined) doc.date = date
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
 * PATCH /api/eagle-view/:id/media/:index/visibility — Body: { isPublic }
 */
export const updateEagleViewMediaVisibility = async (req, res) => {
  try {
    const doc = await EagleView.findById(req.params.id)
    if (!doc) {
      return res.status(404).json({ message: 'EagleView not found' })
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

export const deleteEagleView = async (req, res) => {
  try {
    const doc = await EagleView.findById(req.params.id)
    if (doc) {
      await doc.deleteOne()
      res.json({ message: 'EagleView deleted successfully' })
    } else {
      res.status(404).json({ message: 'EagleView not found' })
    }
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}
