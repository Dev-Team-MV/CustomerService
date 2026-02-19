import OutdoorAmenities from '../models/OutdoorAmenities.js'

function normalizeAmenity (a) {
  return {
    id: Number(a.id) ?? 0,
    name: typeof a.name === 'string' ? a.name : '',
    images: Array.isArray(a.images) ? a.images.filter((u) => typeof u === 'string') : []
  }
}

function nextId (amenities) {
  if (!amenities.length) return 1
  return Math.max(...amenities.map((a) => Number(a.id) || 0), 0) + 1
}

/**
 * GET all outdoor amenities (singleton document).
 * Returns { _id, amenities: [{ id, name, images }, ...], createdAt, updatedAt }.
 */
export const getOutdoorAmenities = async (req, res) => {
  try {
    let doc = await OutdoorAmenities.findOne()
    if (!doc) {
      doc = await OutdoorAmenities.create({ amenities: [] })
    }
    res.json(doc)
  } catch (error) {
    console.error('OutdoorAmenities get error:', error)
    res.status(500).json({ message: error.message })
  }
}

/**
 * GET one outdoor amenity by id.
 * GET /api/outdoor-amenities/:id
 */
export const getOutdoorAmenityById = async (req, res) => {
  try {
    const id = Number(req.params.id)
    if (Number.isNaN(id)) {
      return res.status(400).json({ message: 'Invalid amenity id' })
    }
    const doc = await OutdoorAmenities.findOne()
    if (!doc || !doc.amenities || !doc.amenities.length) {
      return res.status(404).json({ message: 'Outdoor amenities not found' })
    }
    const amenity = doc.amenities.find((a) => a.id === id)
    if (!amenity) {
      return res.status(404).json({ message: `Amenity with id ${id} not found` })
    }
    res.json(amenity)
  } catch (error) {
    console.error('OutdoorAmenities getById error:', error)
    res.status(500).json({ message: error.message })
  }
}

/**
 * POST outdoor amenities.
 * Modes:
 * 1) Replace all: body { amenities: [{ id, name, images }, ...] }
 * 2) Create one: body { name?, images? } (no id) — assigns next id
 * 3) Update/upsert one: body { id, name?, images? }
 */
export const createOrUpdateOutdoorAmenities = async (req, res) => {
  try {
    const { amenities: bodyAmenities, id, name, images } = req.body

    let doc = await OutdoorAmenities.findOne()
    if (!doc) {
      doc = await OutdoorAmenities.create({ amenities: [] })
    }

    if (Array.isArray(bodyAmenities)) {
      doc.amenities = bodyAmenities.map(normalizeAmenity)
      doc.markModified('amenities')
      await doc.save()
      return res.status(200).json({
        message: 'Amenities list updated',
        data: doc
      })
    }

    // Create one (no id)
    if (id === undefined || id === null) {
      const newId = nextId(doc.amenities)
      const newAmenity = normalizeAmenity({
        id: newId,
        name: name ?? '',
        images: images ?? []
      })
      doc.amenities.push(newAmenity)
      doc.markModified('amenities')
      await doc.save()
      return res.status(201).json({
        message: `Amenity created with id ${newId}`,
        data: doc,
        amenity: newAmenity
      })
    }

    // Update/upsert one by id
    const numId = Number(id)
    const index = doc.amenities.findIndex((a) => a.id === numId)
    const existing = index >= 0 ? doc.amenities[index] : null
    const payload = normalizeAmenity({
      id: numId,
      name: name !== undefined && name !== null ? name : (existing?.name ?? ''),
      images: Array.isArray(images) ? images.filter((u) => typeof u === 'string') : (existing?.images ?? [])
    })

    if (index >= 0) {
      doc.amenities[index] = payload
    } else {
      doc.amenities.push(payload)
    }
    doc.markModified('amenities')
    await doc.save()

    res.status(200).json({
      message: `Amenity id ${numId} updated`,
      data: doc
    })
  } catch (error) {
    console.error('OutdoorAmenities post error:', error)
    res.status(500).json({ message: error.message })
  }
}

/**
 * PUT one outdoor amenity by id.
 * Body: { name?, images? } — only sent fields are updated.
 */
export const updateOutdoorAmenity = async (req, res) => {
  try {
    const id = Number(req.params.id)
    if (Number.isNaN(id)) {
      return res.status(400).json({ message: 'Invalid amenity id' })
    }
    const { name, images } = req.body

    const doc = await OutdoorAmenities.findOne()
    if (!doc || !doc.amenities) {
      return res.status(404).json({ message: 'Outdoor amenities not found' })
    }
    const index = doc.amenities.findIndex((a) => a.id === id)
    if (index < 0) {
      return res.status(404).json({ message: `Amenity with id ${id} not found` })
    }

    const current = doc.amenities[index]
    const updated = {
      id: current.id,
      name: name !== undefined && name !== null ? String(name) : current.name,
      images: Array.isArray(images) ? images.filter((u) => typeof u === 'string') : current.images
    }
    doc.amenities[index] = updated
    doc.markModified('amenities')
    await doc.save()

    res.status(200).json({
      message: `Amenity id ${id} updated`,
      data: doc,
      amenity: updated
    })
  } catch (error) {
    console.error('OutdoorAmenities put error:', error)
    res.status(500).json({ message: error.message })
  }
}

/**
 * DELETE one outdoor amenity by id.
 */
export const deleteOutdoorAmenity = async (req, res) => {
  try {
    const id = Number(req.params.id)
    if (Number.isNaN(id)) {
      return res.status(400).json({ message: 'Invalid amenity id' })
    }

    const doc = await OutdoorAmenities.findOne()
    if (!doc || !doc.amenities) {
      return res.status(404).json({ message: 'Outdoor amenities not found' })
    }
    const index = doc.amenities.findIndex((a) => a.id === id)
    if (index < 0) {
      return res.status(404).json({ message: `Amenity with id ${id} not found` })
    }

    const removed = doc.amenities.splice(index, 1)[0]
    doc.markModified('amenities')
    await doc.save()

    res.status(200).json({
      message: `Amenity id ${id} deleted`,
      data: doc,
      removed
    })
  } catch (error) {
    console.error('OutdoorAmenities delete error:', error)
    res.status(500).json({ message: error.message })
  }
}
