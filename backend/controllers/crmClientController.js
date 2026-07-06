import mongoose from 'mongoose'
import Activity from '../models/Activity.js'
import ActivityColumn, { DEFAULT_ACTIVITY_COLUMNS } from '../models/ActivityColumn.js'
import Payload from '../models/Payload.js'
import {
  assertClientExists,
  buildPaginationMeta,
  buildPayloadFilterForUnits,
  enrichPayloadsForCrm,
  getClientApartments,
  getClientProperties,
  getClientUnitIds,
  isValidObjectId,
  parsePagination
} from '../utils/crmHelpers.js'

const populateActivity = (query) =>
  query
    .populate('assignedTo', 'firstName lastName email')
    .populate('createdBy', 'firstName lastName email')
    .populate('contact.user', 'firstName lastName email phoneNumber')
    .populate('columnId', 'name key order')
    .populate('projectId', 'name slug title')

const ensureGlobalColumns = async () => {
  const filter = { boardType: 'global' }
  const existing = await ActivityColumn.find(filter).sort({ order: 1 })
  if (existing.length > 0) return existing

  await ActivityColumn.insertMany(
    DEFAULT_ACTIVITY_COLUMNS.map((column) => ({
      boardType: 'global',
      ...column
    }))
  )

  return ActivityColumn.find(filter).sort({ order: 1 })
}

async function fetchClientPayments(userId, { page, limit, skip, status }) {
  const { propertyIds, apartmentIds } = await getClientUnitIds(userId)
  const filter = buildPayloadFilterForUnits({ propertyIds, apartmentIds })
  if (filter._id === null) {
    return { payments: [], pagination: buildPaginationMeta(0, page, limit) }
  }

  if (status) filter.status = status

  const [total, payloads] = await Promise.all([
    Payload.countDocuments(filter),
    Payload.find(filter).sort({ date: -1 }).skip(skip).limit(limit).lean()
  ])

  const payments = await enrichPayloadsForCrm(payloads)
  return { payments, pagination: buildPaginationMeta(total, page, limit) }
}

async function fetchClientActivities(userId, { page, limit, skip, tagsFilter }) {
  const filter = { 'contact.user': new mongoose.Types.ObjectId(userId) }
  if (tagsFilter === 'excludeNota') {
    filter.tags = { $ne: 'nota' }
  } else if (tagsFilter === 'nota') {
    filter.tags = 'nota'
  } else if (tagsFilter === 'sms') {
    filter.tags = 'sms'
  }

  const [total, activities] = await Promise.all([
    Activity.countDocuments(filter),
    populateActivity(Activity.find(filter))
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
  ])

  return {
    activities,
    pagination: buildPaginationMeta(total, page, limit)
  }
}

export const getCrmClientById = async (req, res) => {
  try {
    const { id } = req.params
    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid client id' })
    }

    const user = await assertClientExists(id)
    if (!user) return res.status(404).json({ message: 'Client not found' })

    const paymentsPagination = parsePagination(req.query, { defaultLimit: 10 })
    const activitiesPagination = parsePagination(
      { page: req.query.activitiesPage, limit: req.query.activitiesLimit },
      { defaultLimit: 20 }
    )
    const smsPagination = parsePagination(
      { page: req.query.smsPage, limit: req.query.smsLimit },
      { defaultLimit: 10 }
    )
    const notesPagination = parsePagination(
      { page: req.query.notesPage, limit: req.query.notesLimit },
      { defaultLimit: 20 }
    )

    const [properties, apartments, paymentsResult, activitiesResult, smsResult, notesResult] =
      await Promise.all([
        getClientProperties(id),
        getClientApartments(id),
        fetchClientPayments(id, { ...paymentsPagination, status: req.query.paymentStatus }),
        fetchClientActivities(id, { ...activitiesPagination, tagsFilter: 'excludeNota' }),
        fetchClientActivities(id, { ...smsPagination, tagsFilter: 'sms' }),
        fetchClientActivities(id, { ...notesPagination, tagsFilter: 'nota' })
      ])

    res.json({
      client: user,
      properties: [...properties, ...apartments],
      payments: paymentsResult.payments,
      paymentsPagination: paymentsResult.pagination,
      activities: activitiesResult.activities,
      activitiesPagination: activitiesResult.pagination,
      sms: smsResult.activities,
      smsPagination: smsResult.pagination,
      notes: notesResult.activities,
      notesPagination: notesResult.pagination
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const getCrmClientPayments = async (req, res) => {
  try {
    const { id } = req.params
    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid client id' })
    }

    const user = await assertClientExists(id)
    if (!user) return res.status(404).json({ message: 'Client not found' })

    const { page, limit, skip } = parsePagination(req.query)
    const result = await fetchClientPayments(id, {
      page,
      limit,
      skip,
      status: req.query.status
    })

    res.json(result)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const addCrmClientNote = async (req, res) => {
  try {
    const { id } = req.params
    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid client id' })
    }

    const user = await assertClientExists(id)
    if (!user) return res.status(404).json({ message: 'Client not found' })

    const { text, title, projectId } = req.body
    if (!text?.trim()) {
      return res.status(400).json({ message: 'text is required' })
    }

    if (projectId && !isValidObjectId(projectId)) {
      return res.status(400).json({ message: 'Invalid projectId' })
    }

    const columns = await ensureGlobalColumns()
    const doneColumn = columns.find((c) => c.key === 'done') || columns[columns.length - 1]

    const position = await Activity.countDocuments({
      boardType: 'global',
      columnId: doneColumn._id
    })

    const activity = await Activity.create({
      boardType: 'global',
      title: title?.trim() || 'Nota interna',
      description: text.trim(),
      columnId: doneColumn._id,
      position,
      priority: 'low',
      assignedTo: req.user._id,
      contact: {
        user: user._id,
        name: [user.firstName, user.lastName].filter(Boolean).join(' ').trim(),
        phone: user.phoneNumber,
        email: user.email
      },
      createdBy: req.user._id,
      tags: ['nota'],
      relatedProjects: projectId ? [projectId] : []
    })

    const populated = await populateActivity(Activity.findById(activity._id))
    res.status(201).json(populated)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}
