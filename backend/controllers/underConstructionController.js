import UnderConstruction from '../models/UnderConstruction.js'

/**
 * Ordena los ítems por `order` y asigna nombre consistente: {title}-{posición}.
 * Así al reordenar desde el front, en el back guardamos siempre nombre por orden (ej: "prueba crear-1", "prueba crear-2").
 */
function normalizeMediaItems (items, title) {
  if (!Array.isArray(items) || items.length === 0) return []
  const sorted = [...items]
    .filter((item) => item && typeof item.order === 'number')
    .sort((a, b) => a.order - b.order)
  const safeTitle = (title || 'item').replace(/[/\\?*:]/g, '').trim() || 'item'
  return sorted.map((item, index) => ({
    url: item.url || '',
    name: `${safeTitle}-${index + 1}`,
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
    const { title, description, images = [], videos = [] } = req.body

    const normalizedImages = normalizeMediaItems(images, title)
    const normalizedVideos = normalizeMediaItems(videos, title)

    const doc = await UnderConstruction.create({
      title: title || '',
      description: description || '',
      images: normalizedImages,
      videos: normalizedVideos
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

    const { title, description, images, videos } = req.body

    if (title !== undefined) doc.title = title
    if (description !== undefined) doc.description = description
    if (images !== undefined) doc.images = normalizeMediaItems(images, doc.title)
    if (videos !== undefined) doc.videos = normalizeMediaItems(videos, doc.title)

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
