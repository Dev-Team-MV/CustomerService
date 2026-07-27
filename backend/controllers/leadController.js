import mongoose from 'mongoose'
import Lead, { LEAD_STAGES, LEAD_SOURCES } from '../models/Lead.js'
import User from '../models/User.js'
import Project from '../models/Project.js'
import {
  runAutomationEngineAsync
} from '../services/automationEngine.js'
import {
  touchLeadStage,
  updateLeadScore
} from '../services/leadScoringService.js'
import { ensureLeadConvertedToUser } from '../services/ensureLeadUserService.js'
import { createPendingCommissionFromLead } from './commissionController.js'

const POPULATE_FIELDS = [
  { path: 'projectId', select: 'name slug title' },
  { path: 'assignedTo', select: 'firstName lastName email' },
  { path: 'convertedToUserId', select: 'firstName lastName email phoneNumber' }
]

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
    const sort =
      req.query.sortBy === 'score'
        ? { score: -1, updatedAt: -1 }
        : { updatedAt: -1 }

    const leads = await Lead.find(buildLeadFilter(req.query))
      .populate(POPULATE_FIELDS)
      .sort(sort)
      .lean()

    res.json({ leads, total: leads.length })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const createLead = async (req, res) => {
  try {
    const { name, phone, email, country, source, projectId, stage, assignedTo, notes } = req.body

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
      country,
      source: source || 'web',
      projectId: projectId || undefined,
      stage: stage || 'nuevo',
      assignedTo: assignedTo || undefined,
      notes,
      stageEnteredAt: new Date()
    })

    await updateLeadScore(lead)
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

    const { name, phone, email, country, source, projectId, stage, assignedTo, notes, lostReason } = req.body

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

    const previousStage = lead.stage

    if (name !== undefined) lead.name = name.trim()
    if (phone !== undefined) lead.phone = phone
    if (email !== undefined) lead.email = email
    if (country !== undefined) lead.country = country
    if (source !== undefined) lead.source = source
    if (projectId !== undefined) lead.projectId = projectId || undefined
    if (stage !== undefined && stage !== lead.stage) {
      lead.stage = stage
      touchLeadStage(lead)
    }
    if (assignedTo !== undefined) lead.assignedTo = assignedTo || undefined
    if (notes !== undefined) lead.notes = notes
    if (lostReason !== undefined) lead.lostReason = lostReason

    await updateLeadScore(lead)
    await lead.populate(POPULATE_FIELDS)

    if (stage !== undefined && previousStage !== lead.stage) {
      runAutomationEngineAsync('lead_stage_changed', {
        lead: lead.toObject(),
        previousStage,
        actor: req.user
      })
    }

    res.json(lead)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const markLeadSmsResponded = async (req, res) => {
  try {
    const { smsResponded } = req.body

    if (typeof smsResponded !== 'boolean') {
      return res.status(400).json({ message: 'smsResponded must be a boolean' })
    }

    const lead = await Lead.findById(req.params.id)
    if (!lead) return res.status(404).json({ message: 'Lead not found' })

    lead.smsResponded = smsResponded
    await updateLeadScore(lead)
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

    const previousStage = lead.stage
    lead.stage = stage
    if (previousStage !== stage) {
      touchLeadStage(lead)
    }
    if (stage === 'perdido' && lostReason !== undefined) {
      lead.lostReason = lostReason
    }

    await updateLeadScore(lead)
    await lead.populate(POPULATE_FIELDS)

    if (previousStage !== lead.stage) {
      runAutomationEngineAsync('lead_stage_changed', {
        lead: lead.toObject(),
        previousStage,
        actor: req.user
      })
    }

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

    const result = await ensureLeadConvertedToUser(lead, {
      sendSms: true,
      actor: req.user,
      markVendido: true,
      linkExistingEmail: false
    })
    if (!result.ok) {
      return res.status(result.status).json({
        message: result.message,
        userId: result.userId
      })
    }

    await lead.populate(POPULATE_FIELDS)
    const user = result.user

    // Auto-generate pending commission when converting to sale
    let commission = null
    try {
      const {
        saleAmount,
        structureId,
        overrideRate,
        overrideAmount,
        splits,
        propertyId,
        commissionNotes
      } = req.body || {}

      if (saleAmount != null && lead.assignedTo && lead.projectId) {
        commission = await createPendingCommissionFromLead(lead, {
          saleAmount,
          structureId,
          overrideRate,
          overrideAmount,
          splits,
          propertyId,
          notes: commissionNotes
        })
      }
    } catch (commissionError) {
      console.error('Auto-commission on lead convert failed:', commissionError.message)
    }

    res.status(201).json({
      lead,
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        country: user.country,
        role: user.role
      },
      smsSent: result.smsSent,
      setupLink: result.setupLink,
      commission
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
