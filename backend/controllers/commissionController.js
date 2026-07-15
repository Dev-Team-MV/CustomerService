import mongoose from 'mongoose'
import Commission, { COMMISSION_STATUSES } from '../models/Commission.js'
import CommissionStructure, {
  COMMISSION_STRUCTURE_TYPES
} from '../models/CommissionStructure.js'
import Project from '../models/Project.js'
import User from '../models/User.js'
import { isValidObjectId, parsePagination, buildPaginationMeta } from '../utils/crmHelpers.js'
import { calculateCommission } from '../services/commissionCalculationService.js'

const COMMISSION_POPULATE = [
  { path: 'agentId', select: 'firstName lastName email role' },
  { path: 'approvedBy', select: 'firstName lastName email' },
  { path: 'projectId', select: 'name slug title' },
  { path: 'propertyId', select: 'price status' },
  { path: 'leadId', select: 'name email phone stage' },
  { path: 'structureId', select: 'name type' },
  { path: 'splitWith.agentId', select: 'firstName lastName email' }
]

async function findAgent(agentId) {
  return User.findOne({
    _id: agentId,
    role: { $in: ['admin', 'superadmin'] },
    isActive: { $ne: false }
  }).select('_id')
}

async function resolveStructure(projectId, structureId) {
  if (structureId) {
    const structure = await CommissionStructure.findById(structureId)
    if (!structure) return { error: 'Commission structure not found', status: 404 }
    if (String(structure.projectId) !== String(projectId)) {
      return { error: 'Structure does not belong to this project', status: 400 }
    }
    return { structure }
  }

  const structure = await CommissionStructure.findOne({ projectId, isDefault: true })
  return { structure: structure || null }
}

function parseDateRange(query) {
  const filter = {}
  if (query.from) {
    const from = new Date(query.from)
    if (Number.isNaN(from.getTime())) return { error: 'Invalid from date' }
    filter.$gte = from
  }
  if (query.to) {
    const to = new Date(query.to)
    if (Number.isNaN(to.getTime())) return { error: 'Invalid to date' }
    filter.$lte = to
  }
  return Object.keys(filter).length ? { createdAt: filter } : {}
}

// ─── Commission Structure CRUD ───────────────────────────────────────────────

export const createCommissionStructure = async (req, res) => {
  try {
    const { projectId, name, type, flatAmount, percentageRate, tiers, bonusRules, isDefault } =
      req.body

    if (!isValidObjectId(projectId)) {
      return res.status(400).json({ message: 'Valid projectId is required' })
    }
    if (!name?.trim()) return res.status(400).json({ message: 'Name is required' })
    if (!COMMISSION_STRUCTURE_TYPES.includes(type)) {
      return res.status(400).json({
        message: `type must be one of: ${COMMISSION_STRUCTURE_TYPES.join(', ')}`
      })
    }

    const projectExists = await Project.exists({ _id: projectId })
    if (!projectExists) return res.status(404).json({ message: 'Project not found' })

    if (isDefault) {
      await CommissionStructure.updateMany({ projectId, isDefault: true }, { isDefault: false })
    }

    const structure = await CommissionStructure.create({
      projectId,
      name: name.trim(),
      type,
      flatAmount: flatAmount ?? 0,
      percentageRate: percentageRate ?? 0,
      tiers: tiers || [],
      bonusRules: bonusRules || [],
      isDefault: Boolean(isDefault)
    })

    res.status(201).json(structure)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const getCommissionStructures = async (req, res) => {
  try {
    const filter = {}
    if (req.query.projectId) {
      if (!isValidObjectId(req.query.projectId)) {
        return res.status(400).json({ message: 'Invalid projectId' })
      }
      filter.projectId = req.query.projectId
    }
    if (req.query.isDefault === 'true') filter.isDefault = true
    if (req.query.isDefault === 'false') filter.isDefault = false

    const structures = await CommissionStructure.find(filter).sort({ createdAt: -1 }).lean()
    res.json({ structures, total: structures.length })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const getCommissionStructureById = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid id' })
    }
    const structure = await CommissionStructure.findById(req.params.id).lean()
    if (!structure) return res.status(404).json({ message: 'Commission structure not found' })
    res.json(structure)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const updateCommissionStructure = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid id' })
    }

    const structure = await CommissionStructure.findById(req.params.id)
    if (!structure) return res.status(404).json({ message: 'Commission structure not found' })

    const { name, type, flatAmount, percentageRate, tiers, bonusRules, isDefault } = req.body

    if (name !== undefined) structure.name = String(name).trim()
    if (type !== undefined) {
      if (!COMMISSION_STRUCTURE_TYPES.includes(type)) {
        return res.status(400).json({
          message: `type must be one of: ${COMMISSION_STRUCTURE_TYPES.join(', ')}`
        })
      }
      structure.type = type
    }
    if (flatAmount !== undefined) structure.flatAmount = flatAmount
    if (percentageRate !== undefined) structure.percentageRate = percentageRate
    if (tiers !== undefined) structure.tiers = tiers
    if (bonusRules !== undefined) structure.bonusRules = bonusRules
    if (isDefault === true) {
      await CommissionStructure.updateMany(
        { projectId: structure.projectId, isDefault: true, _id: { $ne: structure._id } },
        { isDefault: false }
      )
      structure.isDefault = true
    } else if (isDefault === false) {
      structure.isDefault = false
    }

    await structure.save()
    res.json(structure)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const deleteCommissionStructure = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid id' })
    }
    const structure = await CommissionStructure.findByIdAndDelete(req.params.id)
    if (!structure) return res.status(404).json({ message: 'Commission structure not found' })
    res.json({ message: 'Commission structure deleted', id: structure._id })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// ─── Commission calculation (preview) ────────────────────────────────────────

export const calculateCommissionPreview = async (req, res) => {
  try {
    const {
      saleAmount,
      projectId,
      structureId,
      overrideRate,
      overrideAmount,
      splits,
      primaryAgentId
    } = req.body

    if (saleAmount == null || !Number.isFinite(Number(saleAmount))) {
      return res.status(400).json({ message: 'saleAmount is required' })
    }

    let structure = null
    if (structureId || projectId) {
      if (projectId && !isValidObjectId(projectId)) {
        return res.status(400).json({ message: 'Invalid projectId' })
      }
      if (structureId && !isValidObjectId(structureId)) {
        return res.status(400).json({ message: 'Invalid structureId' })
      }
      const resolved = await resolveStructure(projectId, structureId)
      if (resolved.error) return res.status(resolved.status).json({ message: resolved.error })
      structure = resolved.structure
    }

    const result = calculateCommission({
      saleAmount,
      structure,
      overrideRate,
      overrideAmount,
      splits: splits || [],
      primaryAgentId
    })

    res.json(result)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// ─── Commission CRUD ─────────────────────────────────────────────────────────

export const createCommission = async (req, res) => {
  try {
    const {
      propertyId,
      projectId,
      agentId,
      leadId,
      saleAmount,
      structureId,
      overrideRate,
      overrideAmount,
      splits,
      notes
    } = req.body

    if (!isValidObjectId(projectId)) {
      return res.status(400).json({ message: 'Valid projectId is required' })
    }
    if (!isValidObjectId(agentId)) {
      return res.status(400).json({ message: 'Valid agentId is required' })
    }
    if (saleAmount == null || !Number.isFinite(Number(saleAmount)) || Number(saleAmount) < 0) {
      return res.status(400).json({ message: 'Valid saleAmount is required' })
    }

    const projectExists = await Project.exists({ _id: projectId })
    if (!projectExists) return res.status(404).json({ message: 'Project not found' })

    const agent = await findAgent(agentId)
    if (!agent) return res.status(404).json({ message: 'Agent not found' })

    const resolved = await resolveStructure(projectId, structureId)
    if (resolved.error) return res.status(resolved.status).json({ message: resolved.error })

    const calc = calculateCommission({
      saleAmount,
      structure: resolved.structure,
      overrideRate,
      overrideAmount,
      splits: splits || [],
      primaryAgentId: agentId
    })

    const commission = await Commission.create({
      propertyId: propertyId || null,
      projectId,
      agentId,
      leadId: leadId || null,
      saleAmount: calc.saleAmount,
      commissionRate: calc.commissionRate,
      commissionAmount: calc.commissionAmount,
      bonusAmount: calc.bonusAmount,
      splitWith: calc.splitWith.filter((s) => String(s.agentId) !== String(agentId)),
      status: 'pending',
      structureId: resolved.structure?._id || null,
      notes: notes || ''
    })

    await commission.populate(COMMISSION_POPULATE)
    res.status(201).json(commission)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const getCommissions = async (req, res) => {
  try {
    const filter = {}
    if (req.query.projectId) {
      if (!isValidObjectId(req.query.projectId)) {
        return res.status(400).json({ message: 'Invalid projectId' })
      }
      filter.projectId = req.query.projectId
    }
    if (req.query.agentId) {
      if (!isValidObjectId(req.query.agentId)) {
        return res.status(400).json({ message: 'Invalid agentId' })
      }
      filter.agentId = req.query.agentId
    }
    if (req.query.status) {
      if (!COMMISSION_STATUSES.includes(req.query.status)) {
        return res.status(400).json({ message: `Invalid status. Allowed: ${COMMISSION_STATUSES.join(', ')}` })
      }
      filter.status = req.query.status
    }
    if (req.query.leadId) {
      if (!isValidObjectId(req.query.leadId)) {
        return res.status(400).json({ message: 'Invalid leadId' })
      }
      filter.leadId = req.query.leadId
    }

    const dateFilter = parseDateRange(req.query)
    if (dateFilter.error) return res.status(400).json({ message: dateFilter.error })
    if (dateFilter.createdAt) filter.createdAt = dateFilter.createdAt

    const { page, limit, skip } = parsePagination(req.query)
    const [commissions, total] = await Promise.all([
      Commission.find(filter)
        .populate(COMMISSION_POPULATE)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Commission.countDocuments(filter)
    ])

    res.json({
      commissions,
      pagination: buildPaginationMeta(total, page, limit)
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const getCommissionById = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid id' })
    }
    const commission = await Commission.findById(req.params.id).populate(COMMISSION_POPULATE).lean()
    if (!commission) return res.status(404).json({ message: 'Commission not found' })
    res.json(commission)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const updateCommission = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid id' })
    }

    const commission = await Commission.findById(req.params.id)
    if (!commission) return res.status(404).json({ message: 'Commission not found' })

    if (['paid'].includes(commission.status)) {
      return res.status(400).json({ message: 'Paid commissions cannot be edited' })
    }

    const {
      saleAmount,
      structureId,
      overrideRate,
      overrideAmount,
      splits,
      notes,
      propertyId,
      status
    } = req.body

    if (status && COMMISSION_STATUSES.includes(status) && status !== commission.status) {
      if (status === 'approved' || status === 'paid') {
        return res.status(400).json({
          message: 'Use /approve or /mark-paid endpoints for those status changes'
        })
      }
      commission.status = status
    }

    if (notes !== undefined) commission.notes = notes
    if (propertyId !== undefined) commission.propertyId = propertyId || null

    const needsRecalc =
      saleAmount !== undefined ||
      structureId !== undefined ||
      overrideRate !== undefined ||
      overrideAmount !== undefined ||
      splits !== undefined

    if (needsRecalc) {
      const resolved = await resolveStructure(
        commission.projectId,
        structureId !== undefined ? structureId : commission.structureId
      )
      if (resolved.error) return res.status(resolved.status).json({ message: resolved.error })

      const calc = calculateCommission({
        saleAmount: saleAmount !== undefined ? saleAmount : commission.saleAmount,
        structure: resolved.structure,
        overrideRate,
        overrideAmount,
        splits: splits !== undefined ? splits : commission.splitWith,
        primaryAgentId: commission.agentId
      })

      commission.saleAmount = calc.saleAmount
      commission.commissionRate = calc.commissionRate
      commission.commissionAmount = calc.commissionAmount
      commission.bonusAmount = calc.bonusAmount
      commission.splitWith = calc.splitWith.filter(
        (s) => String(s.agentId) !== String(commission.agentId)
      )
      if (resolved.structure) commission.structureId = resolved.structure._id
    }

    await commission.save()
    await commission.populate(COMMISSION_POPULATE)
    res.json(commission)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const deleteCommission = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid id' })
    }
    const commission = await Commission.findById(req.params.id)
    if (!commission) return res.status(404).json({ message: 'Commission not found' })
    if (commission.status === 'paid') {
      return res.status(400).json({ message: 'Paid commissions cannot be deleted' })
    }
    await commission.deleteOne()
    res.json({ message: 'Commission deleted', id: commission._id })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const approveCommission = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid id' })
    }
    const commission = await Commission.findById(req.params.id)
    if (!commission) return res.status(404).json({ message: 'Commission not found' })
    if (commission.status !== 'pending' && commission.status !== 'disputed') {
      return res.status(400).json({
        message: `Cannot approve commission with status "${commission.status}"`
      })
    }

    commission.status = 'approved'
    commission.approvedBy = req.user._id
    await commission.save()
    await commission.populate(COMMISSION_POPULATE)
    res.json(commission)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const markCommissionPaid = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid id' })
    }
    const commission = await Commission.findById(req.params.id)
    if (!commission) return res.status(404).json({ message: 'Commission not found' })
    if (commission.status !== 'approved') {
      return res.status(400).json({
        message: 'Only approved commissions can be marked as paid'
      })
    }

    commission.status = 'paid'
    commission.paidAt = req.body.paidAt ? new Date(req.body.paidAt) : new Date()
    if (Number.isNaN(commission.paidAt.getTime())) {
      return res.status(400).json({ message: 'Invalid paidAt date' })
    }
    await commission.save()
    await commission.populate(COMMISSION_POPULATE)
    res.json(commission)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const getAgentCommissionSummary = async (req, res) => {
  try {
    const { agentId } = req.params
    if (!isValidObjectId(agentId)) {
      return res.status(400).json({ message: 'Invalid agentId' })
    }

    const agent = await findAgent(agentId)
    if (!agent) return res.status(404).json({ message: 'Agent not found' })

    const match = {
      $or: [{ agentId: agent._id }, { 'splitWith.agentId': agent._id }]
    }

    const dateFilter = parseDateRange(req.query)
    if (dateFilter.error) return res.status(400).json({ message: dateFilter.error })
    if (dateFilter.createdAt) match.createdAt = dateFilter.createdAt
    if (req.query.projectId) {
      if (!isValidObjectId(req.query.projectId)) {
        return res.status(400).json({ message: 'Invalid projectId' })
      }
      match.projectId = new mongoose.Types.ObjectId(req.query.projectId)
    }

    const commissions = await Commission.find(match).lean()

    const byStatus = Object.fromEntries(COMMISSION_STATUSES.map((s) => [s, { count: 0, amount: 0 }]))
    let totalEarned = 0
    let totalPending = 0
    let totalPaid = 0

    for (const c of commissions) {
      let agentShare = 0
      if (String(c.agentId) === String(agentId)) {
        const splitsTotal = (c.splitWith || []).reduce((sum, s) => sum + (s.amount || 0), 0)
        agentShare = round2((c.commissionAmount || 0) + (c.bonusAmount || 0) - splitsTotal)
      } else {
        const split = (c.splitWith || []).find((s) => String(s.agentId) === String(agentId))
        agentShare = split?.amount || 0
      }

      byStatus[c.status].count += 1
      byStatus[c.status].amount = round2(byStatus[c.status].amount + agentShare)
      totalEarned = round2(totalEarned + agentShare)
      if (c.status === 'pending' || c.status === 'approved') {
        totalPending = round2(totalPending + agentShare)
      }
      if (c.status === 'paid') totalPaid = round2(totalPaid + agentShare)
    }

    res.json({
      agentId,
      dateRange: { from: req.query.from || null, to: req.query.to || null },
      totals: {
        count: commissions.length,
        earned: totalEarned,
        pending: totalPending,
        paid: totalPaid
      },
      byStatus
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

function round2(n) {
  return Math.round((Number(n) || 0) * 100) / 100
}

export const getProjectCommissionReport = async (req, res) => {
  try {
    const { projectId } = req.params
    if (!isValidObjectId(projectId)) {
      return res.status(400).json({ message: 'Invalid projectId' })
    }

    const projectExists = await Project.exists({ _id: projectId })
    if (!projectExists) return res.status(404).json({ message: 'Project not found' })

    const match = { projectId }
    const dateFilter = parseDateRange(req.query)
    if (dateFilter.error) return res.status(400).json({ message: dateFilter.error })
    if (dateFilter.createdAt) match.createdAt = dateFilter.createdAt

    match.projectId = new mongoose.Types.ObjectId(projectId)

    const [byStatus, byAgent, totals] = await Promise.all([
      Commission.aggregate([
        { $match: match },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            saleAmount: { $sum: '$saleAmount' },
            commissionAmount: { $sum: { $add: ['$commissionAmount', { $ifNull: ['$bonusAmount', 0] }] } }
          }
        }
      ]),
      Commission.aggregate([
        { $match: match },
        {
          $group: {
            _id: '$agentId',
            count: { $sum: 1 },
            saleAmount: { $sum: '$saleAmount' },
            commissionAmount: { $sum: { $add: ['$commissionAmount', { $ifNull: ['$bonusAmount', 0] }] } }
          }
        },
        {
          $lookup: {
            from: 'users',
            localField: '_id',
            foreignField: '_id',
            as: 'agent'
          }
        },
        { $unwind: { path: '$agent', preserveNullAndEmptyArrays: true } },
        {
          $project: {
            agentId: '$_id',
            count: 1,
            saleAmount: 1,
            commissionAmount: 1,
            agent: {
              firstName: '$agent.firstName',
              lastName: '$agent.lastName',
              email: '$agent.email'
            }
          }
        },
        { $sort: { commissionAmount: -1 } }
      ]),
      Commission.aggregate([
        { $match: match },
        {
          $group: {
            _id: null,
            count: { $sum: 1 },
            saleAmount: { $sum: '$saleAmount' },
            commissionAmount: { $sum: { $add: ['$commissionAmount', { $ifNull: ['$bonusAmount', 0] }] } }
          }
        }
      ])
    ])

    res.json({
      projectId,
      dateRange: { from: req.query.from || null, to: req.query.to || null },
      totals: totals[0] || { count: 0, saleAmount: 0, commissionAmount: 0 },
      byStatus,
      byAgent
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

/**
 * Create a pending commission from a converted lead (non-throwing helper for hooks).
 */
export async function createPendingCommissionFromLead(lead, options = {}) {
  if (!lead?.assignedTo || !lead?.projectId) {
    return null
  }

  const saleAmount = Number(options.saleAmount)
  if (!Number.isFinite(saleAmount) || saleAmount < 0) {
    return null
  }

  const agent = await findAgent(lead.assignedTo)
  if (!agent) return null

  const resolved = await resolveStructure(lead.projectId, options.structureId)
  if (resolved.error) return null

  const calc = calculateCommission({
    saleAmount,
    structure: resolved.structure,
    overrideRate: options.overrideRate,
    overrideAmount: options.overrideAmount,
    splits: options.splits || [],
    primaryAgentId: lead.assignedTo
  })

  const commission = await Commission.create({
    propertyId: options.propertyId || null,
    projectId: lead.projectId,
    agentId: lead.assignedTo,
    leadId: lead._id,
    saleAmount: calc.saleAmount,
    commissionRate: calc.commissionRate,
    commissionAmount: calc.commissionAmount,
    bonusAmount: calc.bonusAmount,
    splitWith: calc.splitWith.filter((s) => String(s.agentId) !== String(lead.assignedTo)),
    status: 'pending',
    structureId: resolved.structure?._id || null,
    notes: options.notes || 'Auto-generated on lead conversion'
  })

  return commission
}
