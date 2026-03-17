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

export const getAllApartments = async (req, res) => {
  try {
    const { status, user, projectId, buildingId, apartmentModelId } = req.query
    const isAdmin = req.user.role === 'admin' || req.user.role === 'superadmin'
    const filter = {}

    if (apartmentModelId) filter.apartmentModel = apartmentModelId
    if (buildingId) {
      const models = await ApartmentModel.find({ building: buildingId }).select('_id')
      filter.apartmentModel = { $in: models.map(m => m._id) }
    }
    if (projectId) {
      const buildings = await Building.find({ project: projectId }).select('_id')
      const buildIds = buildings.map(b => b._id)
      const models = await ApartmentModel.find({ building: { $in: buildIds } }).select('_id')
      filter.apartmentModel = { $in: models.map(m => m._id) }
    }
    if (status) filter.status = status

    if (user && isAdmin) {
      filter.users = user
    } else if (!isAdmin) {
      const visibleIds = await getVisibleApartmentIdsForUser(req.user._id)
      filter._id = { $in: visibleIds }
    }

    const apartments = await Apartment.find(filter)
      .populate('apartmentModel', 'name modelNumber floorPlan sqft bedrooms bathrooms')
      .populate({
        path: 'apartmentModel',
        populate: { path: 'building', select: 'name section floors project' }
      })
      .populate('users', 'firstName lastName email phoneNumber')
      .populate({
        path: 'phases',
        options: { sort: { phaseNumber: 1 } }
      })
      .sort({ floorNumber: 1, apartmentNumber: 1 })

    const result = apartments.map(a => {
      const obj = a.toObject()
      obj.totalConstructionPercentage = a.totalConstructionPercentage || 0
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

    const isAdmin = req.user.role === 'admin' || req.user.role === 'superadmin'
    const canAccess = isAdmin || (await canUserAccessApartment(req.user._id, apartment._id))
    if (!canAccess) {
      return res.status(403).json({ message: 'You do not have access to this apartment' })
    }

    const obj = apartment.toObject()
    obj.totalConstructionPercentage = apartment.totalConstructionPercentage || 0
    res.json(obj)
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
      interiorRendersBasic,
      interiorRendersUpgrade,
      polygon,
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

    const existing = await Apartment.findOne({ apartmentModel: modelId, apartmentNumber })
    if (existing) {
      return res.status(400).json({ message: 'Apartment number already exists for this model' })
    }

    const priceVal = price ?? 0
    const initialVal = initialPayment || 0
    const pendingVal = priceVal - initialVal

    const apartment = await Apartment.create({
      apartmentModel: modelId,
      floorNumber,
      apartmentNumber,
      interiorRendersBasic: interiorRendersBasic || [],
      interiorRendersUpgrade: interiorRendersUpgrade || [],
      polygon: polygon || [],
      users: ownerIds,
      price: priceVal,
      pending: pendingVal,
      initialPayment: initialVal,
      status: ownerIds.length > 0 ? 'pending' : 'available'
    })

    const populated = await Apartment.findById(apartment._id)
      .populate('apartmentModel', 'name modelNumber floorPlan sqft bedrooms bathrooms')
      .populate({
        path: 'apartmentModel',
        populate: { path: 'building', select: 'name section floors project' }
      })
      .populate('users', 'firstName lastName email phoneNumber')
      .populate({
        path: 'phases',
        options: { sort: { phaseNumber: 1 } }
      })

    const obj = populated.toObject()
    obj.totalConstructionPercentage = populated.totalConstructionPercentage || 0
    res.status(201).json(obj)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

const ALLOWED_APARTMENT_UPDATES = [
  'floorNumber', 'apartmentNumber', 'interiorRendersBasic', 'interiorRendersUpgrade',
  'polygon', 'users', 'price', 'pending', 'initialPayment', 'status', 'saleDate'
]

export const updateApartment = async (req, res) => {
  try {
    const apartment = await Apartment.findById(req.params.id)
    if (!apartment) {
      return res.status(404).json({ message: 'Apartment not found' })
    }

    for (const key of ALLOWED_APARTMENT_UPDATES) {
      if (req.body[key] !== undefined) {
        apartment[key] = req.body[key]
      }
    }

    await apartment.save()

    const populated = await Apartment.findById(apartment._id)
      .populate('apartmentModel', 'name modelNumber floorPlan sqft bedrooms bathrooms')
      .populate({
        path: 'apartmentModel',
        populate: { path: 'building', select: 'name section floors project' }
      })
      .populate('users', 'firstName lastName email phoneNumber')
      .populate({
        path: 'phases',
        options: { sort: { phaseNumber: 1 } }
      })

    const obj = populated.toObject()
    obj.totalConstructionPercentage = populated.totalConstructionPercentage || 0
    res.json(obj)
  } catch (error) {
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
      const models = await ApartmentModel.find({ building: { $in: buildIds } }).select('_id')
      filter.apartmentModel = { $in: models.map(m => m._id) }
    }
    if (buildingId) {
      const models = await ApartmentModel.find({ building: buildingId }).select('_id')
      filter.apartmentModel = { $in: models.map(m => m._id) }
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
