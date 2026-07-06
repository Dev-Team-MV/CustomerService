import mongoose from 'mongoose'
import User from '../models/User.js'
import Lead, { LEAD_STAGES } from '../models/Lead.js'
import Activity from '../models/Activity.js'
import ActivityColumn from '../models/ActivityColumn.js'
import { getMonthBounds, isValidObjectId } from '../utils/crmHelpers.js'

export const getCrmAgents = async (req, res) => {
  try {
    const agents = await User.find({
      role: { $in: ['admin', 'superadmin'] },
      isActive: { $ne: false }
    })
      .select('firstName lastName email phoneNumber role createdAt updatedAt')
      .sort({ firstName: 1, lastName: 1 })
      .lean()

    res.json({ agents, total: agents.length })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const getCrmAgentMetrics = async (req, res) => {
  try {
    const { id } = req.params
    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid agent id' })
    }

    const agent = await User.findOne({
      _id: id,
      role: { $in: ['admin', 'superadmin'] },
      isActive: { $ne: false }
    })
      .select('firstName lastName email phoneNumber role')
      .lean()

    if (!agent) return res.status(404).json({ message: 'Agent not found' })

    const agentId = new mongoose.Types.ObjectId(id)
    const { start: monthStart, end: monthEnd } = getMonthBounds()

    const [leadStageAgg, leadsTotal, convertedLeads, doneColumnIds] = await Promise.all([
      Lead.aggregate([
        { $match: { assignedTo: agentId } },
        { $group: { _id: '$stage', count: { $sum: 1 } } }
      ]),
      Lead.countDocuments({ assignedTo: agentId }),
      Lead.countDocuments({ assignedTo: agentId, convertedToUserId: { $ne: null } }),
      ActivityColumn.distinct('_id', { key: 'done' })
    ])

    const leadsByStage = Object.fromEntries(LEAD_STAGES.map((s) => [s, 0]))
    for (const { _id, count } of leadStageAgg) {
      if (_id in leadsByStage) leadsByStage[_id] = count
    }

    const [activitiesCompletedThisMonth, clientsServedTotal, clientsServedThisMonth] =
      await Promise.all([
        Activity.countDocuments({
          assignedTo: agentId,
          columnId: { $in: doneColumnIds },
          updatedAt: { $gte: monthStart, $lte: monthEnd }
        }),
        Activity.distinct('contact.user', {
          assignedTo: agentId,
          'contact.user': { $exists: true, $ne: null }
        }),
        Activity.distinct('contact.user', {
          assignedTo: agentId,
          'contact.user': { $exists: true, $ne: null },
          updatedAt: { $gte: monthStart, $lte: monthEnd }
        })
      ])

    res.json({
      agent,
      leads: {
        total: leadsTotal,
        converted: convertedLeads,
        byStage: leadsByStage
      },
      activitiesCompletedThisMonth,
      clientsServed: {
        total: clientsServedTotal.length,
        thisMonth: clientsServedThisMonth.length
      },
      period: { monthStart, monthEnd }
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}
