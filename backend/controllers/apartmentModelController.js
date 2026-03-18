import ApartmentModel from '../models/ApartmentModel.js'
import Building from '../models/Building.js'

function toIdStr(val) {
  if (val == null) return ''
  if (typeof val === 'string') return val
  if (val._id != null) return val._id.toString()
  return String(val)
}

function sameId(a, b) {
  return toIdStr(a).toLowerCase() === toIdStr(b).toLowerCase()
}

export const getAllApartmentModels = async (req, res) => {
  try {
    const { buildingId, projectId } = req.query
    const filter = {}
    if (projectId) {
      const buildings = await Building.find({ project: projectId }).select('_id')
      const buildingIds = buildings.map(b => b._id)
      filter.building = buildingId ? (buildingIds.some(b => b.toString() === buildingId) ? buildingId : 'none') : { $in: buildingIds }
      if (filter.building === 'none') return res.json([])
    } else if (buildingId) {
      filter.building = buildingId
    }

    const models = await ApartmentModel.find(filter)
      .populate('building', 'name section floors project')
      .sort({ name: 1 })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const getApartmentModelById = async (req, res) => {
  try {
    const model = await ApartmentModel.findById(req.params.id)
      .populate('building', 'name section floors project')

    if (model) {
      res.json(model)
    } else {
      res.status(404).json({ message: 'Apartment model not found' })
    }
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const createApartmentModel = async (req, res) => {
  try {
    const { buildingId, building, name, modelNumber, floorPlan, sqft, bedrooms, bathrooms, apartmentCount } = req.body
    const buildId = buildingId || building
    if (!buildId) {
      return res.status(400).json({ message: 'buildingId (or building) is required' })
    }

    const buildingExists = await Building.findById(buildId)
    if (!buildingExists) {
      return res.status(404).json({ message: 'Building not found' })
    }

    const model = await ApartmentModel.create({
      building: buildId,
      name,
      modelNumber,
      floorPlan,
      sqft: sqft || 0,
      bedrooms: bedrooms || 0,
      bathrooms: bathrooms || 0,
      apartmentCount: apartmentCount || 0
    })

    res.status(201).json(model)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const updateApartmentModel = async (req, res) => {
  try {
    const model = await ApartmentModel.findById(req.params.id)
    if (!model) {
      return res.status(404).json({ message: 'Apartment model not found' })
    }

    const { name, modelNumber, floorPlan, sqft, bedrooms, bathrooms, apartmentCount, status } = req.body
    if (name != null) model.name = name
    if (modelNumber != null) model.modelNumber = modelNumber
    if (floorPlan != null) model.floorPlan = floorPlan
    if (sqft != null) model.sqft = sqft
    if (bedrooms != null) model.bedrooms = bedrooms
    if (bathrooms != null) model.bathrooms = bathrooms
    if (apartmentCount != null) model.apartmentCount = apartmentCount
    if (status != null) model.status = status

    await model.save()
    res.json(model)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const deleteApartmentModel = async (req, res) => {
  try {
    const model = await ApartmentModel.findById(req.params.id)
    if (!model) {
      return res.status(404).json({ message: 'Apartment model not found' })
    }
    await model.deleteOne()
    res.json({ message: 'Apartment model deleted successfully' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}
