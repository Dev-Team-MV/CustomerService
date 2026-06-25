import mongoose from 'mongoose'
import Lead, { LEAD_STAGES, LEAD_SOURCES } from '../models/Lead.js'
import User from '../models/User.js'
import Project from '../models/Project.js'
import { sendSMSWithValidation } from '../services/twilioService.js'
import { resolveFrontendBaseUrl } from '../services/resolveFrontendBaseUrl.js'
import { notifyUserCreatedByAdmin } from '../utils/notificationTriggers.js'

const POPULATE_FIELDS = [
  { path: 'projectId', select: 'name slug title' },
  { path: 'assignedTo', select: 'firstName lastName email' },
  { path: 'convertedToUserId', select: 'firstName lastName email phoneNumber' }
]

function splitName(name) {
  const parts = (name || '').trim().split(/\s+/)
  const firstName = parts[0] || 'Lead'
  const lastName = parts.slice(1).join(' ') || '-'
  return { firstName, lastName }
}

function buildLeadFilter(query) {
  const { projectId, stage, assignedTo, fromDate, toDate } = query
  const filter = {}

  if (projectId) filter.projectId = projectId
  if (stage) filter.stage = stage
  if (assignedTo) filter.assignedTo = assignedTo

  if (fromDate || toDate) {
    filter.createdAt = {}
    if (fromDate) filter.createdAt.$gte = new Date(fromDate)
    if (toDate) filter.createdAt.$lte = new Date(toDate)
  }

  return filter
}

export const getLeads = async (req, res) => {
  try {
    const leads = await Lead.find(buildLeadFilter(req.query))
      .populate(POPULATE_FIELDS)
      .sort({ updatedAt: -1 })
      .lean()

    res.json({ leads, total: leads.length })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const createLead = async (req, res) => {
  try {
    const { name, phone, email, source, projectId, stage, assignedTo, notes } = req.body

    if (!name?.trim()) {
      return res.status(400).json({ message: 'Name is required' })
    }

    if (source && !LEAD_SOURCES.includes(source)) {
      return res.status(400).json({ message: `Invalid source. Allowed: ${LEAD_SOURCES.join(', ')}` })
    }

    if (stage && !LEAD_STAGES.includes(stage)) {
      return res.status(400).json({ message: `Invalid stage. Allowed: ${LEAD_STAGES.join(', ')}` })
    }

    if (projectId) {
      const exists = await Project.exists({ _id: projectId })
      if (!exists) return res.status(404).json({ message: 'Project not found' })
    }

    if (assignedTo) {
      const userExists = await User.exists({ _id: assignedTo })
      if (!userExists) return res.status(404).json({ message: 'Assigned user not found' })
    }

    const lead = await Lead.create({
      name: name.trim(),
      phone,
      email,
      source: source || 'web',
      projectId: projectId || undefined,
      stage: stage || 'nuevo',
      assignedTo: assignedTo || undefined,
      notes
    })

    await lead.populate(POPULATE_FIELDS)
    res.status(201).json(lead)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const updateLead = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id)
    if (!lead) return res.status(404).json({ message: 'Lead not found' })

    const { name, phone, email, source, projectId, stage, assignedTo, notes, lostReason } = req.body

    if (source !== undefined && !LEAD_SOURCES.includes(source)) {
      return res.status(400).json({ message: `Invalid source. Allowed: ${LEAD_SOURCES.join(', ')}` })
    }

    if (stage !== undefined && !LEAD_STAGES.includes(stage)) {
      return res.status(400).json({ message: `Invalid stage. Allowed: ${LEAD_STAGES.join(', ')}` })
    }

    if (projectId !== undefined && projectId) {
      const exists = await Project.exists({ _id: projectId })
      if (!exists) return res.status(404).json({ message: 'Project not found' })
    }

    if (assignedTo !== undefined && assignedTo) {
      const userExists = await User.exists({ _id: assignedTo })
      if (!userExists) return res.status(404).json({ message: 'Assigned user not found' })
    }

    if (name !== undefined) lead.name = name.trim()
    if (phone !== undefined) lead.phone = phone
    if (email !== undefined) lead.email = email
    if (source !== undefined) lead.source = source
    if (projectId !== undefined) lead.projectId = projectId || undefined
    if (stage !== undefined) lead.stage = stage
    if (assignedTo !== undefined) lead.assignedTo = assignedTo || undefined
    if (notes !== undefined) lead.notes = notes
    if (lostReason !== undefined) lead.lostReason = lostReason

    await lead.save()
    await lead.populate(POPULATE_FIELDS)
    res.json(lead)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const updateLeadStage = async (req, res) => {
  try {
    const { stage, lostReason } = req.body

    if (!stage || !LEAD_STAGES.includes(stage)) {
      return res.status(400).json({ message: `Invalid stage. Allowed: ${LEAD_STAGES.join(', ')}` })
    }

    const lead = await Lead.findById(req.params.id)
    if (!lead) return res.status(404).json({ message: 'Lead not found' })

    lead.stage = stage
    if (stage === 'perdido' && lostReason !== undefined) {
      lead.lostReason = lostReason
    }

    await lead.save()
    await lead.populate(POPULATE_FIELDS)
    res.json(lead)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const deleteLead = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id)
    if (!lead) return res.status(404).json({ message: 'Lead not found' })

    await lead.deleteOne()
    res.json({ message: 'Lead deleted' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const convertLead = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id)
    if (!lead) return res.status(404).json({ message: 'Lead not found' })

    if (lead.convertedToUserId) {
      return res.status(400).json({ message: 'Lead already converted to user' })
    }

    if (!lead.email) {
      return res.status(400).json({ message: 'Lead email is required to convert to user' })
    }

    if (!lead.phone) {
      return res.status(400).json({ message: 'Lead phone is required to convert to user' })
    }

    const existingUser = await User.findOne({ email: lead.email.toLowerCase() })
    if (existingUser) {
      return res.status(400).json({
        message: 'A user with this email already exists',
        userId: existingUser._id
      })
    }

    const { firstName, lastName } = splitName(lead.name)

    const userData = {
      firstName,
      lastName,
      email: lead.email,
      phoneNumber: lead.phone,
      role: 'user'
    }

    if (lead.projectId) {
      userData.projectMemberships = [{ project: lead.projectId, role: 'resident' }]
    }

    const user = new User(userData)
    const setupToken = user.generateSetupToken()
    await user.save()

    notifyUserCreatedByAdmin({ user })

    let smsSent = false
    let setupLink = null

    try {
      const frontendUrl = await resolveFrontendBaseUrl(lead.projectId)
      setupLink = `${frontendUrl}/setup-password/${setupToken}`
      const message = `Hi ${firstName}, your account has been created. Please set your password by visiting this link: ${setupLink}`
      await sendSMSWithValidation(lead.phone, message)
      smsSent = true
    } catch (smsError) {
      console.error('Error sending setup SMS for converted lead:', smsError.message)
    }

    lead.convertedToUserId = user._id
    lead.stage = 'vendido'
    await lead.save()
    await lead.populate(POPULATE_FIELDS)

    res.status(201).json({
      lead,
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role
      },
      smsSent,
      setupLink: smsSent ? undefined : setupLink
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

/**
 * Métricas de leads para el balance CRM.
 */
export async function getLeadMetrics() {
  const [stageAgg, total, converted] = await Promise.all([
    Lead.aggregate([{ $group: { _id: '$stage', count: { $sum: 1 } } }]),
    Lead.countDocuments(),
    Lead.countDocuments({ convertedToUserId: { $ne: null } })
  ])

  const byStage = Object.fromEntries(LEAD_STAGES.map(s => [s, 0]))
  for (const { _id, count } of stageAgg) {
    if (_id in byStage) byStage[_id] = count
  }

  const conversionRate = total > 0 ? Math.round((converted / total) * 1000) / 10 : 0

  return { total, byStage, converted, conversionRate }
}
