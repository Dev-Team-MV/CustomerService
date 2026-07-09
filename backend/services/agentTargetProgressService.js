import mongoose from 'mongoose'
import Lead from '../models/Lead.js'
import Appointment from '../models/Appointment.js'
import Campaign from '../models/Campaign.js'
import AuditLog from '../models/AuditLog.js'
import { getMonthBounds } from '../utils/crmHelpers.js'

export function resolveMonthYear(query) {
  const now = new Date()
  const month = Math.min(12, Math.max(1, Number.parseInt(query.month, 10) || now.getMonth() + 1))
  const year = Number.parseInt(query.year, 10) || now.getFullYear()
  return { month, year }
}

export function getMonthBoundsFor(month, year) {
  return getMonthBounds(new Date(year, month - 1, 1))
}

function completionPercent(actual, target) {
  if (!target || target <= 0) return null
  return Math.round((actual / target) * 1000) / 10
}

export async function computeAgentProgress(agentId, month, year, targets = null) {
  const oid = new mongoose.Types.ObjectId(agentId)
  const { start, end } = getMonthBoundsFor(month, year)

  const [leads, conversions, appointments, auditSms, campaigns] = await Promise.all([
    Lead.countDocuments({ assignedTo: oid, createdAt: { $gte: start, $lte: end } }),
    Lead.countDocuments({
      assignedTo: oid,
      convertedToUserId: { $ne: null },
      updatedAt: { $gte: start, $lte: end }
    }),
    Appointment.countDocuments({
      assignedTo: oid,
      status: 'completada',
      startDate: { $gte: start, $lte: end }
    }),
    AuditLog.countDocuments({
      userId: oid,
      action: 'sms_sent',
      timestamp: { $gte: start, $lte: end }
    }),
    Campaign.find({
      createdBy: oid,
      sentAt: { $gte: start, $lte: end }
    })
      .select('stats')
      .lean()
  ])

  const campaignSms = campaigns.reduce((sum, campaign) => sum + (campaign.stats?.sent || 0), 0)

  const progress = {
    leads,
    conversions,
    appointments,
    smsCount: auditSms + campaignSms
  }

  const completion = targets
    ? {
        leads: completionPercent(progress.leads, targets.leads),
        conversions: completionPercent(progress.conversions, targets.conversions),
        appointments: completionPercent(progress.appointments, targets.appointments),
        smsCount: completionPercent(progress.smsCount, targets.smsCount)
      }
    : null

  return {
    progress,
    completion,
    period: { start, end }
  }
}
