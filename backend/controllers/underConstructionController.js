import UnderConstruction from '../models/UnderConstruction.js'

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
    url: item.url || '',
    name: `${base}-${index + 1}`,
    order: index + 1
  }))
}

export const getAllUnderConstruction = async (req, res) => {
  try {
    const items = await UnderConstruction.find().sort({ createdAt: -1 })
    res.json(items)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const getUnderConstructionById = async (req, res) => {
  try {
    const item = await UnderConstruction.findById(req.params.id)
    if (item) {
      res.json(item)
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

    res.status(201).json(doc)
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
    res.json(updated)
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
