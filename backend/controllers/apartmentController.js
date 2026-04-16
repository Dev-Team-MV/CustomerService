import mongoose from 'mongoose'
import Apartment from '../models/Apartment.js'
import ApartmentModel from '../models/ApartmentModel.js'
import Building from '../models/Building.js'
import User from '../models/User.js'
import Phase from '../models/Phase.js'
import { getVisibleApartmentIdsForUser, canUserAccessApartment } from '../utils/propertyVisibility.js'

function toIdStr(val) {
  if (val == null) return ''
  if (typeof val === 'string') return val
  if (val._id != null) return val._id.toString()
  return String(val)
}

function sameId(a, b) {
  return toIdStr(a).toLowerCase() === toIdStr(b).toLowerCase()
}

function getSelectedApartmentRenders(apartmentLike) {
  const selectedType = apartmentLike?.selectedRenderType === 'upgrade' ? 'upgrade' : 'basic'
  const basic = Array.isArray(apartmentLike?.interiorRendersBasic) ? apartmentLike.interiorRendersBasic : []
  const upgrade = Array.isArray(apartmentLike?.interiorRendersUpgrade) ? apartmentLike.interiorRendersUpgrade : []
  return selectedType === 'upgrade' ? upgrade : basic
}

const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(value)

const DEFAULT_PHASES = [
  { phaseNumber: 1, title: 'Site Preparation and Groundbreaking', constructionPercentage: 0 },
  { phaseNumber: 2, title: 'Foundation, Framing & Windows', constructionPercentage: 0 },
  { phaseNumber: 3, title: 'Exterior Cladding and Roofing Installation', constructionPercentage: 0 },
  { phaseNumber: 4, title: "All MEP's starts rough in work", constructionPercentage: 0 },
  { phaseNumber: 5, title: 'Drywall Work and Paint', constructionPercentage: 0 },
  { phaseNumber: 6, title: 'Flooring and Millwork', constructionPercentage: 0 },
  { phaseNumber: 7, title: 'Kitchen and Bathrooms', constructionPercentage: 0 },
  { phaseNumber: 8, title: 'Interior Finishes, Driveway Applainces & Landscaping', constructionPercentage: 0 },
  { phaseNumber: 9, title: 'Inspections (Delays)', constructionPercentage: 0 }
]

const ensureApartmentPhases = async (apartmentId) => {
  if (!apartmentId) return
  const existingCount = await Phase.countDocuments({ apartment: apartmentId })
  if (existingCount > 0) return

  await Phase.insertMany(
    DEFAULT_PHASES.map(phase => ({
      apartment: apartmentId,
      phaseNumber: phase.phaseNumber,
      title: phase.title,
      constructionPercentage: phase.constructionPercentage,
      mediaItems: []
    }))
  )
}

const normalizePolygonId = (value) => {
  if (value == null) return null
  const str = String(value).trim()
  return str.length > 0 ? str : null
}

const validateApartmentPlacement = async ({ buildingId, floorNumber, floorPlanPolygonId }) => {
  const normalizedPolygonId = normalizePolygonId(floorPlanPolygonId)
  if (!normalizedPolygonId) return { ok: true }

  if (!buildingId || !isValidObjectId(buildingId)) {
    return { ok: false, message: 'building (or valid model->building) is required when floorPlanPolygonId is provided' }
  }

  const floor = Number(floorNumber)
  if (!Number.isFinite(floor) || floor < 1) {
    return { ok: false, message: 'floorNumber must be >= 1 when floorPlanPolygonId is provided' }
  }

  const building = await Building.findById(buildingId).select('floorPlans')
  if (!building) return { ok: false, message: 'Building not found' }

  const floorPlan = (building.floorPlans || []).find((fp) => Number(fp.floorNumber) === floor)
  if (!floorPlan) {
    return { ok: false, message: `Floor plan not found for floor ${floor}` }
  }

  const polygonExists = (floorPlan.polygons || []).some((poly) => poly.id === normalizedPolygonId)
  if (!polygonExists) {
    return { ok: false, message: `Polygon ${normalizedPolygonId} not found on floor ${floor}` }
  }

  return { ok: true }
}

export const getAllApartments = async (req, res) => {
  try {
    const { status, user, projectId, buildingId, apartmentModelId, floorNumber, floorPlanPolygonId } = req.query
    const filter = {}
    const visibleOnly = String(req.query.visible).toLowerCase() === 'true' || req.query.visible === '1'
    const isPublicCatalog = !req.user
    const isSuperadmin = req.user?.role === 'superadmin'

    if (isPublicCatalog && !buildingId && !projectId) {
      return res.status(400).json({ message: 'projectId or buildingId is required without authentication' })
    }

    if (apartmentModelId) filter.apartmentModel = apartmentModelId
    if (projectId) {
      const buildings = await Building.find({ project: projectId }).select('_id')
      const buildIds = buildings.map(b => b._id)
      filter.building = { $in: buildIds }
    }
    if (buildingId) {
      filter.building = buildingId
    }
    if (status) filter.status = status
    if (floorNumber != null && floorNumber !== '') {
      const floor = Number(floorNumber)
      if (!Number.isFinite(floor) || floor < 1) {
        return res.status(400).json({ message: 'floorNumber must be a number >= 1' })
      }
      filter.floorNumber = floor
    }
    if (floorPlanPolygonId != null && floorPlanPolygonId !== '') {
      filter.floorPlanPolygonId = String(floorPlanPolygonId).trim()
    }

    if (isPublicCatalog) {
      // Public quote / catalog: scoped by building or project only (no per-user visibility).
    } else if (!visibleOnly && isSuperadmin) {
      // Superadmin "management" view: return all apartments (optionally filtered by owner user).
      if (user && mongoose.Types.ObjectId.isValid(user)) {
        filter.users = user
      }
    } else {
      // User/admin view (and MyApartments visible-only view):
      const visibleIds = await getVisibleApartmentIdsForUser(req.user._id)
      filter._id = { $in: visibleIds }

      if (user && mongoose.Types.ObjectId.isValid(user)) {
        filter.users = user
      }
    }

    const apartments = await Apartment.find(filter)
      .populate('apartmentModel', 'name modelNumber floorPlan sqft bedrooms bathrooms')
      .populate({
        path: 'apartmentModel',
        populate: { path: 'building', select: 'name section floors project' }
      })
      .populate('users', 'firstName lastName email phoneNumber')
      .populate({
        path: 'parkingSpots',
        select: 'building floorNumber code spotType status apartment notes createdAt updatedAt',
        options: { sort: { floorNumber: 1, code: 1 } }
      })
      .populate({
        path: 'phases',
        options: { sort: { phaseNumber: 1 } }
      })
      .sort({ floorNumber: 1, apartmentNumber: 1 })

    // Self-heal legacy apartments assigned to users without phases (authenticated only; avoid writes on public GET).
    if (!isPublicCatalog) {
      const apartmentsMissingPhases = apartments.filter(a =>
        Array.isArray(a.users) && a.users.length > 0 && (!Array.isArray(a.phases) || a.phases.length === 0)
      )
      if (apartmentsMissingPhases.length > 0) {
        await Promise.all(apartmentsMissingPhases.map(a => ensureApartmentPhases(a._id)))
        await Promise.all(apartmentsMissingPhases.map(a => a.populate({ path: 'phases', options: { sort: { phaseNumber: 1 } } }))
      )}
    }

    const result = apartments.map(a => {
      const obj = a.toObject()
      obj.totalConstructionPercentage = a.totalConstructionPercentage || 0
      obj.selectedRenders = getSelectedApartmentRenders(obj)
      obj.parkingSpot = Array.isArray(obj.parkingSpots) && obj.parkingSpots.length > 0
        ? obj.parkingSpots[0]
        : null
      if (isPublicCatalog) {
        delete obj.users
        if (Array.isArray(obj.parkingSpots)) {
          obj.parkingSpots = obj.parkingSpots.map((ps) => {
            const p = typeof ps?.toObject === 'function' ? ps.toObject() : { ...ps }
            delete p.notes
            return p
          })
        }
        if (obj.parkingSpot && typeof obj.parkingSpot === 'object') {
          delete obj.parkingSpot.notes
        }
      }
      return obj
    })
    res.json(result)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const getApartmentById = async (req, res) => {
  try {
    const apartment = await Apartment.findById(req.params.id)
      .populate('apartmentModel', 'name modelNumber floorPlan sqft bedrooms bathrooms')
      .populate({
        path: 'apartmentModel',
        populate: { path: 'building', select: 'name section floors project' }
      })
      .populate('users', 'firstName lastName email phoneNumber birthday')
      .populate({
        path: 'parkingSpots',
        select: 'building floorNumber code spotType status apartment notes createdAt updatedAt',
        options: { sort: { floorNumber: 1, code: 1 } }
      })
      .populate({
        path: 'payloads',
        options: { sort: { date: -1 } }
      })
      .populate({
        path: 'phases',
        options: { sort: { phaseNumber: 1 } }
      })

    if (!apartment) {
      return res.status(404).json({ message: 'Apartment not found' })
    }

    const visibleOnly = String(req.query.visible).toLowerCase() === 'true' || req.query.visible === '1'
    const isSuperadmin = req.user.role === 'superadmin'

    const canAccess = visibleOnly
      ? await canUserAccessApartment(req.user._id, apartment._id)
      : isSuperadmin
        ? true
        : await canUserAccessApartment(req.user._id, apartment._id)
    if (!canAccess) {
      return res.status(403).json({ message: 'You do not have access to this apartment' })
    }

    if (Array.isArray(apartment.users) && apartment.users.length > 0 && (!Array.isArray(apartment.phases) || apartment.phases.length === 0)) {
      await ensureApartmentPhases(apartment._id)
      await apartment.populate({
        path: 'phases',
        options: { sort: { phaseNumber: 1 } }
      })
    }

    const obj = apartment.toObject()
    obj.totalConstructionPercentage = apartment.totalConstructionPercentage || 0
    obj.selectedRenders = getSelectedApartmentRenders(obj)
    obj.parkingSpot = Array.isArray(obj.parkingSpots) && obj.parkingSpots.length > 0
      ? obj.parkingSpots[0]
      : null
    res.json(obj)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const getApartmentQuote = async (req, res) => {
  try {
    const {
      apartmentId,
      apartmentModelId,
      apartmentModel,
      building,
      floorNumber,
      apartmentNumber,
      selectedRenderType,
      price,
      initialPayment
    } = req.body

    const modelId = apartmentModelId || apartmentModel
    const normalizedInitialPayment = Number(initialPayment || 0)
    if (!Number.isFinite(normalizedInitialPayment) || normalizedInitialPayment < 0) {
      return res.status(400).json({ message: 'initialPayment must be a number >= 0' })
    }

    if (apartmentId) {
      if (!isValidObjectId(apartmentId)) {
        return res.status(400).json({ message: 'Invalid apartmentId' })
      }

      const apartment = await Apartment.findById(apartmentId)
        .populate('apartmentModel', 'name modelNumber bedrooms bathrooms sqft building')

      if (!apartment) {
        return res.status(404).json({ message: 'Apartment not found' })
      }

      const basePrice = Number(apartment.price || 0)
      const pending = basePrice - normalizedInitialPayment
      const renderType = selectedRenderType || apartment.selectedRenderType || 'basic'

      return res.json({
        apartmentId: apartment._id,
        building: apartment.building,
        apartmentModel: apartment.apartmentModel,
        floorNumber: apartment.floorNumber,
        apartmentNumber: apartment.apartmentNumber,
        selectedRenderType: renderType,
        totals: {
          price: basePrice,
          initialPayment: normalizedInitialPayment,
          pending
        }
      })
    }

    if (!modelId) {
      return res.status(400).json({ message: 'apartmentId or apartmentModelId (or apartmentModel) is required' })
    }

    const modelExists = await ApartmentModel.findById(modelId).populate('building', 'name section floors project')
    if (!modelExists) {
      return res.status(404).json({ message: 'Apartment model not found' })
    }

    const buildingId = building || modelExists.building?._id || modelExists.building
    if (!buildingId) {
      return res.status(400).json({ message: 'building could not be resolved for apartment model' })
    }
    if (!sameId(buildingId, modelExists.building?._id || modelExists.building)) {
      return res.status(400).json({ message: 'building must match apartment model building' })
    }

    if (floorNumber != null || apartmentNumber != null) {
      const filter = {
        apartmentModel: modelId,
        building: buildingId
      }
      if (floorNumber != null && floorNumber !== '') filter.floorNumber = Number(floorNumber)
      if (apartmentNumber != null && apartmentNumber !== '') filter.apartmentNumber = String(apartmentNumber)

      const existingApartment = await Apartment.findOne(filter)
      if (existingApartment) {
        const basePrice = Number(existingApartment.price || 0)
        const pending = basePrice - normalizedInitialPayment
        const renderType = selectedRenderType || existingApartment.selectedRenderType || 'basic'
        return res.json({
          apartmentId: existingApartment._id,
          building: existingApartment.building,
          apartmentModel: modelExists,
          floorNumber: existingApartment.floorNumber,
          apartmentNumber: existingApartment.apartmentNumber,
          selectedRenderType: renderType,
          totals: {
            price: basePrice,
            initialPayment: normalizedInitialPayment,
            pending
          }
        })
      }
    }

    const basePrice = Number(price ?? 0)
    if (!Number.isFinite(basePrice) || basePrice < 0) {
      return res.status(400).json({ message: 'price is required (>= 0) when apartment is not found by apartmentId or floor/apartmentNumber' })
    }
    const pending = basePrice - normalizedInitialPayment

    return res.json({
      apartmentId: null,
      building: buildingId,
      apartmentModel: modelExists,
      floorNumber: floorNumber != null && floorNumber !== '' ? Number(floorNumber) : null,
      apartmentNumber: apartmentNumber != null && apartmentNumber !== '' ? String(apartmentNumber) : null,
      selectedRenderType: selectedRenderType || 'basic',
      totals: {
        price: basePrice,
        initialPayment: normalizedInitialPayment,
        pending
      }
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const createApartment = async (req, res) => {
  try {
    const {
      apartmentModelId,
      apartmentModel,
      floorNumber,
      apartmentNumber,
      building,
      floorPlanPolygonId,
      interiorRendersBasic,
      interiorRendersUpgrade,
      polygon,
      selectedRenderType,
      user,
      users,
      price,
      initialPayment
    } = req.body

    const modelId = apartmentModelId || apartmentModel
    if (!modelId) {
      return res.status(400).json({ message: 'apartmentModelId (or apartmentModel) is required' })
    }

    const ownerIds = users && Array.isArray(users) && users.length > 0
      ? users
      : user ? [user] : []

    const modelExists = await ApartmentModel.findById(modelId)
    if (!modelExists) {
      return res.status(404).json({ message: 'Apartment model not found' })
    }

    const buildingId = building || modelExists.building
    if (!buildingId) {
      return res.status(400).json({ message: 'building could not be resolved for apartment model' })
    }
    if (!sameId(buildingId, modelExists.building)) {
      return res.status(400).json({ message: 'building must match apartment model building' })
    }

    const placementValidation = await validateApartmentPlacement({
      buildingId,
      floorNumber,
      floorPlanPolygonId
    })
    if (!placementValidation.ok) {
      return res.status(400).json({ message: placementValidation.message })
    }

    const existing = await Apartment.findOne({ apartmentModel: modelId, apartmentNumber })
    if (existing) {
      return res.status(400).json({ message: 'Apartment number already exists for this model' })
    }

    const priceVal = price ?? 0
    const initialVal = initialPayment || 0
    const pendingVal = priceVal - initialVal

    const apartment = await Apartment.create({
      apartmentModel: modelId,
      building: buildingId,
      floorNumber,
      apartmentNumber,
      floorPlanPolygonId: normalizePolygonId(floorPlanPolygonId),
      interiorRendersBasic: interiorRendersBasic || [],
      interiorRendersUpgrade: interiorRendersUpgrade || [],
      selectedRenderType: selectedRenderType || 'basic',
      polygon: polygon || [],
      users: ownerIds,
      price: priceVal,
      pending: pendingVal,
      initialPayment: initialVal,
      status: ownerIds.length > 0 ? 'pending' : 'available'
    })

    if (ownerIds.length > 0) {
      await ensureApartmentPhases(apartment._id)
    }

    const populated = await Apartment.findById(apartment._id)
      .populate('apartmentModel', 'name modelNumber floorPlan sqft bedrooms bathrooms')
      .populate({
        path: 'apartmentModel',
        populate: { path: 'building', select: 'name section floors project' }
      })
      .populate('users', 'firstName lastName email phoneNumber')
      .populate({
        path: 'parkingSpots',
        select: 'building floorNumber code spotType status apartment notes createdAt updatedAt',
        options: { sort: { floorNumber: 1, code: 1 } }
      })
      .populate({
        path: 'phases',
        options: { sort: { phaseNumber: 1 } }
      })

    const obj = populated.toObject()
    obj.totalConstructionPercentage = populated.totalConstructionPercentage || 0
    obj.selectedRenders = getSelectedApartmentRenders(obj)
    obj.parkingSpot = Array.isArray(obj.parkingSpots) && obj.parkingSpots.length > 0
      ? obj.parkingSpots[0]
      : null
    res.status(201).json(obj)
  } catch (error) {
    if (error?.code === 11000 && error?.keyPattern?.floorPlanPolygonId) {
      return res.status(400).json({ message: 'floorPlanPolygonId is already assigned to another apartment on this floor/building' })
    }
    res.status(500).json({ message: error.message })
  }
}

const ALLOWED_APARTMENT_UPDATES = [
  'floorNumber', 'apartmentNumber', 'interiorRendersBasic', 'interiorRendersUpgrade',
  'selectedRenderType', 'polygon', 'users', 'price', 'pending', 'initialPayment', 'status', 'saleDate',
  'floorPlanPolygonId'
]

export const updateApartment = async (req, res) => {
  try {
    const apartment = await Apartment.findById(req.params.id)
    if (!apartment) {
      return res.status(404).json({ message: 'Apartment not found' })
    }

    if (req.body.building !== undefined) {
      return res.status(400).json({ message: 'building cannot be updated directly; it is derived from apartment model' })
    }

    if (req.body.floorPlanPolygonId !== undefined) {
      apartment.floorPlanPolygonId = normalizePolygonId(req.body.floorPlanPolygonId)
    }

    for (const key of ALLOWED_APARTMENT_UPDATES) {
      if (key === 'floorPlanPolygonId') continue
      if (req.body[key] !== undefined) {
        apartment[key] = req.body[key]
      }
    }

    const modelForUpdate = await ApartmentModel.findById(apartment.apartmentModel).select('building')
    if (!modelForUpdate) {
      return res.status(404).json({ message: 'Apartment model not found' })
    }
    apartment.building = modelForUpdate.building

    const placementValidation = await validateApartmentPlacement({
      buildingId: apartment.building,
      floorNumber: apartment.floorNumber,
      floorPlanPolygonId: apartment.floorPlanPolygonId
    })
    if (!placementValidation.ok) {
      return res.status(400).json({ message: placementValidation.message })
    }

    await apartment.save()

    if (Array.isArray(apartment.users) && apartment.users.length > 0) {
      await ensureApartmentPhases(apartment._id)
    }

    const populated = await Apartment.findById(apartment._id)
      .populate('apartmentModel', 'name modelNumber floorPlan sqft bedrooms bathrooms')
      .populate({
        path: 'apartmentModel',
        populate: { path: 'building', select: 'name section floors project' }
      })
      .populate('users', 'firstName lastName email phoneNumber')
      .populate({
        path: 'parkingSpots',
        select: 'building floorNumber code spotType status apartment notes createdAt updatedAt',
        options: { sort: { floorNumber: 1, code: 1 } }
      })
      .populate({
        path: 'phases',
        options: { sort: { phaseNumber: 1 } }
      })

    const obj = populated.toObject()
    obj.totalConstructionPercentage = populated.totalConstructionPercentage || 0
    obj.selectedRenders = getSelectedApartmentRenders(obj)
    obj.parkingSpot = Array.isArray(obj.parkingSpots) && obj.parkingSpots.length > 0
      ? obj.parkingSpots[0]
      : null
    res.json(obj)
  } catch (error) {
    if (error?.code === 11000 && error?.keyPattern?.floorPlanPolygonId) {
      return res.status(400).json({ message: 'floorPlanPolygonId is already assigned to another apartment on this floor/building' })
    }
    res.status(500).json({ message: error.message })
  }
}

export const deleteApartment = async (req, res) => {
  try {
    const apartment = await Apartment.findById(req.params.id)
    if (!apartment) {
      return res.status(404).json({ message: 'Apartment not found' })
    }
    await apartment.deleteOne()
    res.json({ message: 'Apartment deleted successfully' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const getApartmentStats = async (req, res) => {
  try {
    const { projectId, buildingId } = req.query
    const filter = {}

    if (projectId) {
      const buildings = await Building.find({ project: projectId }).select('_id')
      const buildIds = buildings.map(b => b._id)
      filter.building = { $in: buildIds }
    }
    if (buildingId) {
      filter.building = buildingId
    }

    const total = await Apartment.countDocuments(filter)
    const available = await Apartment.countDocuments({ ...filter, status: 'available' })
    const pending = await Apartment.countDocuments({ ...filter, status: 'pending' })
    const sold = await Apartment.countDocuments({ ...filter, status: 'sold' })

    const [totalRevenue, totalPending] = await Promise.all([
      Apartment.aggregate([
        { $match: { ...filter, status: 'sold' } },
        { $group: { _id: null, sum: { $sum: '$price' } } }
      ]),
      Apartment.aggregate([
        { $match: { ...filter, status: { $in: ['pending', 'active'] } } },
        { $group: { _id: null, sum: { $sum: '$pending' } } }
      ])
    ])

    res.json({
      totalApartments: total,
      availableApartments: available,
      pendingApartments: pending,
      soldApartments: sold,
      totalRevenue: totalRevenue[0]?.sum || 0,
      totalPending: totalPending[0]?.sum || 0
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}
