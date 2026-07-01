import Appointment, { APPOINTMENT_TYPES, APPOINTMENT_STATUSES } from '../models/Appointment.js'
import Lead from '../models/Lead.js'
import User from '../models/User.js'
import Project from '../models/Project.js'
import { isValidObjectId } from '../utils/crmHelpers.js'
import { runAutomationEngineAsync } from '../services/automationEngine.js'

const POPULATE_FIELDS = [
  { path: 'projectId', select: 'name slug title' },
  { path: 'assignedTo', select: 'firstName lastName email phoneNumber' },
  { path: 'leadId', select: 'name email phone stage' },
  { path: 'clientId', select: 'firstName lastName email phoneNumber' }
]

function buildAppointmentFilter(query) {
  const { assignedTo, projectId, status, dateFrom, dateTo } = query
  const filter = {}

  if (assignedTo) filter.assignedTo = assignedTo
  if (projectId) filter.projectId = projectId
  if (status) filter.status = status

  if (dateFrom || dateTo) {
    filter.startDate = {}
    if (dateFrom) filter.startDate.$gte = new Date(dateFrom)
    if (dateTo) filter.startDate.$lte = new Date(dateTo)
  }

  return filter
}

async function validateRefs({ projectId, assignedTo, leadId, clientId, type, status }) {
  if (type && !APPOINTMENT_TYPES.includes(type)) {
    return { error: `Invalid type. Allowed: ${APPOINTMENT_TYPES.join(', ')}` }
  }

  if (status && !APPOINTMENT_STATUSES.includes(status)) {
    return { error: `Invalid status. Allowed: ${APPOINTMENT_STATUSES.join(', ')}` }
  }

  if (projectId) {
    const exists = await Project.exists({ _id: projectId })
    if (!exists) return { error: 'Project not found', status: 404 }
  }

  if (assignedTo) {
    const exists = await User.exists({ _id: assignedTo })
    if (!exists) return { error: 'Assigned user not found', status: 404 }
  }

  if (leadId) {
    const exists = await Lead.exists({ _id: leadId })
    if (!exists) return { error: 'Lead not found', status: 404 }
  }

  if (clientId) {
    const exists = await User.exists({ _id: clientId })
    if (!exists) return { error: 'Client not found', status: 404 }
  }

  return { error: null }
}

function validateDates(startDate, endDate) {
  if (!startDate || !endDate) {
    return 'startDate and endDate are required'
  }
  const start = new Date(startDate)
  const end = new Date(endDate)
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return 'Invalid startDate or endDate'
  }
  if (end < start) {
    return 'endDate must be on or after startDate'
  }
  return null
}

export const getAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find(buildAppointmentFilter(req.query))
      .populate(POPULATE_FIELDS)
      .sort({ startDate: 1 })
      .lean()

    res.json({ appointments, total: appointments.length })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const createAppointment = async (req, res) => {
  try {
    const {
      type,
      leadId,
      clientId,
      projectId,
      assignedTo,
      title,
      notes,
      startDate,
      endDate,
      status
    } = req.body

    if (!type || !title?.trim() || !projectId || !assignedTo) {
      return res.status(400).json({
        message: 'type, title, projectId and assignedTo are required'
      })
    }

    const dateError = validateDates(startDate, endDate)
    if (dateError) return res.status(400).json({ message: dateError })

    const refCheck = await validateRefs({ projectId, assignedTo, leadId, clientId, type, status })
    if (refCheck.error) {
      return res.status(refCheck.status || 400).json({ message: refCheck.error })
    }

    const appointment = await Appointment.create({
      type,
      leadId: leadId || undefined,
      clientId: clientId || undefined,
      projectId,
      assignedTo,
      title: title.trim(),
      notes,
      startDate,
      endDate,
      status: status || 'pendiente'
    })

    await appointment.populate(POPULATE_FIELDS)

    runAutomationEngineAsync('appointment_created', {
      appointment: appointment.toObject(),
      actor: req.user
    })

    res.status(201).json(appointment)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const updateAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' })

    const {
      type,
      leadId,
      clientId,
      projectId,
      assignedTo,
      title,
      notes,
      startDate,
      endDate,
      status
    } = req.body

    const refCheck = await validateRefs({
      projectId: projectId ?? appointment.projectId,
      assignedTo: assignedTo ?? appointment.assignedTo,
      leadId: leadId === null ? null : (leadId ?? appointment.leadId),
      clientId: clientId === null ? null : (clientId ?? appointment.clientId),
      type: type ?? appointment.type,
      status: status ?? appointment.status
    })
    if (refCheck.error) {
      return res.status(refCheck.status || 400).json({ message: refCheck.error })
    }

    const nextStart = startDate !== undefined ? startDate : appointment.startDate
    const nextEnd = endDate !== undefined ? endDate : appointment.endDate
    const dateError = validateDates(nextStart, nextEnd)
    if (dateError) return res.status(400).json({ message: dateError })

    if (type !== undefined) appointment.type = type
    if (leadId !== undefined) appointment.leadId = leadId || undefined
    if (clientId !== undefined) appointment.clientId = clientId || undefined
    if (projectId !== undefined) appointment.projectId = projectId
    if (assignedTo !== undefined) appointment.assignedTo = assignedTo
    if (title !== undefined) appointment.title = title.trim()
    if (notes !== undefined) appointment.notes = notes
    if (startDate !== undefined) appointment.startDate = startDate
    if (endDate !== undefined) appointment.endDate = endDate
    if (status !== undefined) appointment.status = status

    await appointment.save()
    await appointment.populate(POPULATE_FIELDS)
    res.json(appointment)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const updateAppointmentStatus = async (req, res) => {
  try {
    const { status } = req.body

    if (!status || !APPOINTMENT_STATUSES.includes(status)) {
      return res.status(400).json({
        message: `Invalid status. Allowed: ${APPOINTMENT_STATUSES.join(', ')}`
      })
    }

    const appointment = await Appointment.findById(req.params.id)
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' })

    appointment.status = status
    await appointment.save()
    await appointment.populate(POPULATE_FIELDS)
    res.json(appointment)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const deleteAppointment = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid appointment id' })
    }

    const appointment = await Appointment.findById(req.params.id)
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' })

    await appointment.deleteOne()
    res.json({ message: 'Appointment deleted' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}
