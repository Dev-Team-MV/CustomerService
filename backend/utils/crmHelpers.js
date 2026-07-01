import mongoose from 'mongoose'
import Property from '../models/Property.js'
import Apartment from '../models/Apartment.js'
import Building from '../models/Building.js'
import Payload from '../models/Payload.js'
import User from '../models/User.js'
import Project from '../models/Project.js'

export const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(value)

export const parsePagination = (query, { defaultLimit = 20, maxLimit = 100 } = {}) => {
  const page = Math.max(1, Number.parseInt(query.page, 10) || 1)
  const limit = Math.max(1, Math.min(Number.parseInt(query.limit, 10) || defaultLimit, maxLimit))
  const skip = (page - 1) * limit
  return { page, limit, skip }
}

export const buildPaginationMeta = (total, page, limit) => ({
  page,
  limit,
  total,
  totalPages: Math.ceil(total / limit) || 0
})

export async function getClientUnitIds(userId) {
  const uid = new mongoose.Types.ObjectId(userId)
  const [properties, apartments] = await Promise.all([
    Property.find({ users: uid }).select('_id').lean(),
    Apartment.find({ users: uid }).select('_id').lean()
  ])
  return {
    propertyIds: properties.map((p) => p._id),
    apartmentIds: apartments.map((a) => a._id)
  }
}

export function buildPayloadFilterForUnits({ propertyIds, apartmentIds }) {
  const or = []
  if (propertyIds.length) or.push({ property: { $in: propertyIds } })
  if (apartmentIds.length) or.push({ apartment: { $in: apartmentIds } })
  if (!or.length) return { _id: null }
  return or.length === 1 ? or[0] : { $or: or }
}

export async function resolvePayloadScopeByProject(projectId) {
  const [propertyIds, buildingIds] = await Promise.all([
    Property.distinct('_id', { project: projectId }),
    Building.distinct('_id', { project: projectId })
  ])
  const apartmentIds = buildingIds.length
    ? await Apartment.distinct('_id', { building: { $in: buildingIds } })
    : []

  const or = []
  if (propertyIds.length) or.push({ property: { $in: propertyIds } })
  if (apartmentIds.length) or.push({ apartment: { $in: apartmentIds } })
  if (!or.length) return { _id: null }
  return or.length === 1 ? or[0] : { $or: or }
}

export function buildCrmPaymentStatusFilter(status) {
  const now = new Date()
  if (!status) return {}

  if (status === 'signed') return { status: 'signed' }
  if (status === 'pending') return { status: 'pending' }
  if (status === 'overdue') {
    return { status: { $ne: 'signed' }, date: { $lt: now } }
  }
  return { status }
}

export function buildDateRangeFilter(dateFrom, dateTo) {
  if (!dateFrom && !dateTo) return {}
  const range = {}
  if (dateFrom) range.$gte = new Date(dateFrom)
  if (dateTo) range.$lte = new Date(dateTo)
  return { date: range }
}

async function loadSignedTotals(propertyIds, apartmentIds) {
  const matchOr = []
  if (propertyIds.length) matchOr.push({ property: { $in: propertyIds } })
  if (apartmentIds.length) matchOr.push({ apartment: { $in: apartmentIds } })
  if (!matchOr.length) return { property: new Map(), apartment: new Map() }

  const rows = await Payload.aggregate([
    { $match: { status: 'signed', $or: matchOr } },
    {
      $group: {
        _id: { property: '$property', apartment: '$apartment' },
        total: { $sum: '$amount' }
      }
    }
  ])

  const property = new Map()
  const apartment = new Map()
  for (const row of rows) {
    if (row._id.property) property.set(String(row._id.property), row.total)
    if (row._id.apartment) apartment.set(String(row._id.apartment), row.total)
  }
  return { property, apartment }
}

export async function getClientProperties(userId) {
  const uid = new mongoose.Types.ObjectId(userId)
  const properties = await Property.find({ users: uid })
    .populate('lot', 'number')
    .populate('project', 'name slug title')
    .populate('model', 'model name')
    .select('price pending status lot project model')
    .lean()

  const propertyIds = properties.map((p) => p._id)
  const signedByProperty = (await loadSignedTotals(propertyIds, [])).property

  return properties.map((p) => {
    const collected = signedByProperty.get(String(p._id)) || 0
    const project = p.project
    return {
      type: 'property',
      _id: p._id,
      lotNumber: p.lot?.number || null,
      modelName: p.model?.model || p.model?.name || null,
      projectId: project?._id || null,
      projectName: project?.title?.en || project?.name || project?.slug || null,
      price: p.price,
      pending: p.pending,
      balance: collected,
      status: p.status
    }
  })
}

export async function getClientApartments(userId) {
  const uid = new mongoose.Types.ObjectId(userId)
  const apartments = await Apartment.find({ users: uid })
    .populate({
      path: 'building',
      select: 'name project',
      populate: { path: 'project', select: 'name slug title' }
    })
    .populate('apartmentModel', 'name modelNumber')
    .select('apartmentNumber floorNumber price pending status building apartmentModel')
    .lean()

  const apartmentIds = apartments.map((a) => a._id)
  const signedByApartment = (await loadSignedTotals([], apartmentIds)).apartment

  return apartments.map((a) => {
    const collected = signedByApartment.get(String(a._id)) || 0
    const project = a.building?.project
    return {
      type: 'apartment',
      _id: a._id,
      apartmentNumber: a.apartmentNumber,
      floorNumber: a.floorNumber,
      buildingName: a.building?.name || null,
      modelName: a.apartmentModel?.name || null,
      projectId: project?._id || null,
      projectName: project?.title?.en || project?.name || project?.slug || null,
      price: a.price,
      pending: a.pending,
      balance: collected,
      status: a.status
    }
  })
}

function formatUserName(user) {
  if (!user) return null
  const name = [user.firstName, user.lastName].filter(Boolean).join(' ').trim()
  return name || user.email || null
}

export async function enrichPayloadsForCrm(payloads) {
  if (!payloads.length) return []

  const propertyIds = [...new Set(payloads.filter((p) => p.property).map((p) => String(p.property)))]
  const apartmentIds = [...new Set(payloads.filter((p) => p.apartment).map((p) => String(p.apartment)))]

  const [properties, apartments] = await Promise.all([
    propertyIds.length
      ? Property.find({ _id: { $in: propertyIds } })
          .populate('lot', 'number')
          .populate('project', 'name slug title')
          .populate('users', 'firstName lastName email')
          .select('lot project users')
          .lean()
      : [],
    apartmentIds.length
      ? Apartment.find({ _id: { $in: apartmentIds } })
          .populate({
            path: 'building',
            select: 'name project',
            populate: { path: 'project', select: 'name slug title' }
          })
          .populate('users', 'firstName lastName email')
          .select('apartmentNumber building users')
          .lean()
      : []
  ])

  const propertyMap = new Map(properties.map((p) => [String(p._id), p]))
  const apartmentMap = new Map(apartments.map((a) => [String(a._id), a]))

  return payloads.map((payload) => {
    const doc = payload.toObject ? payload.toObject() : { ...payload }

    if (doc.property) {
      const property = propertyMap.get(String(doc.property))
      const project = property?.project
      const owners = (property?.users || []).map(formatUserName).filter(Boolean)
      return {
        _id: doc._id,
        amount: doc.amount,
        status: doc.status,
        type: doc.type,
        date: doc.date,
        dueDate: doc.date,
        notes: doc.notes,
        propertyId: property?._id || doc.property,
        apartmentId: null,
        clientName: owners.join(', ') || null,
        unitLabel: property?.lot?.number ? `Lot ${property.lot.number}` : null,
        projectId: project?._id || null,
        projectName: project?.title?.en || project?.name || project?.slug || null,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt
      }
    }

    if (doc.apartment) {
      const apartment = apartmentMap.get(String(doc.apartment))
      const project = apartment?.building?.project
      const owners = (apartment?.users || []).map(formatUserName).filter(Boolean)
      return {
        _id: doc._id,
        amount: doc.amount,
        status: doc.status,
        type: doc.type,
        date: doc.date,
        dueDate: doc.date,
        notes: doc.notes,
        propertyId: null,
        apartmentId: apartment?._id || doc.apartment,
        clientName: owners.join(', ') || null,
        unitLabel: apartment?.apartmentNumber ? `Apt ${apartment.apartmentNumber}` : null,
        projectId: project?._id || null,
        projectName: project?.title?.en || project?.name || project?.slug || null,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt
      }
    }

    return {
      _id: doc._id,
      amount: doc.amount,
      status: doc.status,
      type: doc.type,
      date: doc.date,
      dueDate: doc.date,
      notes: doc.notes,
      propertyId: null,
      apartmentId: null,
      clientName: null,
      unitLabel: null,
      projectId: null,
      projectName: null,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt
    }
  })
}

export async function assertClientExists(userId) {
  if (!isValidObjectId(userId)) return null
  return User.findOne({ _id: userId, isActive: { $ne: false } })
    .select('firstName lastName email phoneNumber birthday role projectMemberships createdAt updatedAt')
    .lean()
}

export function getMonthBounds(reference = new Date()) {
  const start = new Date(reference.getFullYear(), reference.getMonth(), 1)
  const end = new Date(reference.getFullYear(), reference.getMonth() + 1, 0, 23, 59, 59, 999)
  return { start, end }
}
