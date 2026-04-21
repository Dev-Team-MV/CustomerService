import OutdoorAmenities from '../models/OutdoorAmenities.js'
import { normalizeImageArray } from '../utils/imageUtils.js'
import { hydrateUrlsInObject } from '../services/urlResolverService.js'

function normalizeFloorNumber (value) {
  if (value === undefined || value === null || value === '') return null
  const floor = Number(value)
  if (!Number.isInteger(floor) || floor < 1) return null
  return floor
}

function isInvalidProvidedFloor (value) {
  return value !== undefined && value !== null && value !== '' && normalizeFloorNumber(value) === null
}

/**
 * @param {object} a - amenity object (may have id, name, images as strings or [{ url, isPublic }])
 * @param {number} [defaultId] - when id is missing or invalid (e.g. in "replace all" payload)
 */
function normalizeAmenity (a, defaultId) {
  const numId = Number(a.id)
  const id = (a.id !== undefined && a.id !== null && !Number.isNaN(numId)) ? numId : (defaultId ?? 0)
  return {
    id,
    name: typeof a.name === 'string' ? a.name : '',
    floorNumber: normalizeFloorNumber(a.floorNumber),
    images: normalizeImageArray(a.images)
  }
}

function nextId (amenities) {
  if (!amenities.length) return 1
  return Math.max(...amenities.map((a) => Number(a.id) || 0), 0) + 1
}

/** Normaliza images de todos los amenities (legacy → { url, isPublic }) antes de guardar */
function normalizeAmenitiesBeforeSave (doc) {
  if (!doc.amenities || !Array.isArray(doc.amenities)) return
  let changed = false
  doc.amenities.forEach((a) => {
    if (!Array.isArray(a.images)) return
    const hasLegacy = a.images.some((x) => typeof x === 'string')
    if (hasLegacy) {
      a.images = normalizeImageArray(a.images)
      changed = true
    }
  })
  if (changed) doc.markModified('amenities')
}

/**
 * GET all outdoor amenities (singleton document).
 * Returns { _id, amenities: [{ id, name, images: [{ url, isPublic }] }, ...], createdAt, updatedAt }.
 */
export const getOutdoorAmenities = async (req, res) => {
  try {
    const floorFilter = req.query.floorNumber
    if (floorFilter !== undefined && normalizeFloorNumber(floorFilter) === null) {
      return res.status(400).json({ message: 'floorNumber must be an integer >= 1' })
    }

    let doc = await OutdoorAmenities.findOne()
    if (!doc) {
      doc = await OutdoorAmenities.create({ amenities: [] })
    }
    const payload = doc.toObject ? doc.toObject() : doc
    if (Array.isArray(payload.amenities)) {
      payload.amenities = payload.amenities.map((a) => ({
        ...a,
        floorNumber: normalizeFloorNumber(a.floorNumber),
        images: normalizeImageArray(a.images)
      }))
      if (floorFilter !== undefined) {
        const floorNumber = normalizeFloorNumber(floorFilter)
        payload.amenities = payload.amenities.filter((a) => a.floorNumber === floorNumber)
      }
    }
    await hydrateUrlsInObject(payload)
    res.json(payload)
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
    const payload = amenity.toObject ? amenity.toObject() : { ...amenity }
    payload.images = normalizeImageArray(amenity.images)
    await hydrateUrlsInObject(payload)
    res.json(payload)
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
    const { amenities: bodyAmenities, id, name, images, floorNumber } = req.body

    if (isInvalidProvidedFloor(floorNumber)) {
      return res.status(400).json({ message: 'floorNumber must be an integer >= 1 or null' })
    }

    let doc = await OutdoorAmenities.findOne()
    if (!doc) {
      doc = await OutdoorAmenities.create({ amenities: [] })
    }

    if (Array.isArray(bodyAmenities)) {
      const invalidAmenity = bodyAmenities.find((a) => isInvalidProvidedFloor(a?.floorNumber))
      if (invalidAmenity) {
        return res.status(400).json({ message: 'Each amenity.floorNumber must be an integer >= 1 or null' })
      }
      doc.amenities = bodyAmenities.map((a, i) => normalizeAmenity(a, i + 1))
      doc.markModified('amenities')
      normalizeAmenitiesBeforeSave(doc)
      await doc.save()
      const data = doc.toObject()
      await hydrateUrlsInObject(data)
      return res.status(200).json({
        message: 'Amenities list updated',
        data
      })
    }

    // Create one (no id)
    if (id === undefined || id === null) {
      const newId = nextId(doc.amenities)
      const newAmenity = normalizeAmenity({
        id: newId,
        name: name ?? '',
        floorNumber,
        images: images ?? []
      })
      doc.amenities.push(newAmenity)
      doc.markModified('amenities')
      normalizeAmenitiesBeforeSave(doc)
      await doc.save()
      const data = doc.toObject()
      await hydrateUrlsInObject(data)
      return res.status(201).json({
        message: `Amenity created with id ${newId}`,
        data,
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
      floorNumber: floorNumber !== undefined ? floorNumber : (existing?.floorNumber ?? null),
      images: Array.isArray(images) ? images : (existing?.images ?? [])
    })

    if (index >= 0) {
      doc.amenities[index] = payload
    } else {
      doc.amenities.push(payload)
    }
    doc.markModified('amenities')
    normalizeAmenitiesBeforeSave(doc)
    await doc.save()

    const data = doc.toObject()
    await hydrateUrlsInObject(data)
    res.status(200).json({
      message: `Amenity id ${numId} updated`,
      data
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
    const { name, images, floorNumber } = req.body
    if (isInvalidProvidedFloor(floorNumber)) {
      return res.status(400).json({ message: 'floorNumber must be an integer >= 1 or null' })
    }

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
      floorNumber: floorNumber !== undefined ? normalizeFloorNumber(floorNumber) : normalizeFloorNumber(current.floorNumber),
      images: Array.isArray(images) ? normalizeImageArray(images) : current.images
    }
    doc.amenities[index] = updated
    doc.markModified('amenities')
    normalizeAmenitiesBeforeSave(doc)
    await doc.save()

    const data = doc.toObject()
    await hydrateUrlsInObject(data)
    res.status(200).json({
      message: `Amenity id ${id} updated`,
      data,
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
    normalizeAmenitiesBeforeSave(doc)
    await doc.save()

    const data = doc.toObject()
    await hydrateUrlsInObject(data)
    res.status(200).json({
      message: `Amenity id ${id} deleted`,
      data,
      removed
    })
  } catch (error) {
    console.error('OutdoorAmenities delete error:', error)
    res.status(500).json({ message: error.message })
  }
}
