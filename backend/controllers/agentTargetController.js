import User from '../models/User.js'
import AgentTarget from '../models/AgentTarget.js'
import { isValidObjectId } from '../utils/crmHelpers.js'
import {
  computeAgentProgress,
  resolveMonthYear
} from '../services/agentTargetProgressService.js'

const TARGET_FIELDS = ['leads', 'conversions', 'appointments', 'smsCount']

async function findAgent(agentId) {
  return User.findOne({
    _id: agentId,
    role: { $in: ['admin', 'superadmin'] },
    isActive: { $ne: false }
  })
    .select('firstName lastName email phoneNumber role')
    .lean()
}

function parseTargets(body) {
  const source = body.targets && typeof body.targets === 'object' ? body.targets : body
  const targets = {}

  for (const field of TARGET_FIELDS) {
    if (source[field] === undefined) continue
    const value = Number(source[field])
    if (!Number.isFinite(value) || value < 0) {
      return { error: `${field} must be a non-negative number` }
    }
    targets[field] = value
  }

  if (!Object.keys(targets).length) {
    return { error: 'At least one target field is required' }
  }

  return { targets }
}

export const getAgentTargets = async (req, res) => {
  try {
    const { id } = req.params
    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid agent id' })
    }

    const agent = await findAgent(id)
    if (!agent) return res.status(404).json({ message: 'Agent not found' })

    const { month, year } = resolveMonthYear(req.query)

    const targetDoc = await AgentTarget.findOne({ agentId: id, month, year }).lean()
    const targets = targetDoc?.targets || null

    const { progress, completion, period } = await computeAgentProgress(id, month, year, targets)

    res.json({
      agent,
      agentId: id,
      month,
      year,
      targets,
      progress,
      completion,
      period
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const upsertAgentTargets = async (req, res) => {
  try {
    const { id } = req.params
    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid agent id' })
    }

    const agent = await findAgent(id)
    if (!agent) return res.status(404).json({ message: 'Agent not found' })

    const { month, year } = resolveMonthYear(req.body)
    const { targets, error } = parseTargets(req.body)
    if (error) return res.status(400).json({ message: error })

    const targetDoc = await AgentTarget.findOneAndUpdate(
      { agentId: id, month, year },
      {
        $set: Object.fromEntries(
          Object.entries(targets).map(([key, value]) => [`targets.${key}`, value])
        )
      },
      { new: true, upsert: true, runValidators: true }
    ).lean()

    const mergedTargets = targetDoc.targets
    const { progress, completion, period } = await computeAgentProgress(
      id,
      month,
      year,
      mergedTargets
    )

    res.json({
      agent,
      agentId: id,
      month,
      year,
      targets: mergedTargets,
      progress,
      completion,
      period
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}
