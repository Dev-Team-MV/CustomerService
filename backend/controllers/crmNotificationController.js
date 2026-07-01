import Payload from '../models/Payload.js'
import Activity from '../models/Activity.js'
import ActivityColumn from '../models/ActivityColumn.js'
import Lead from '../models/Lead.js'
import { enrichPayloadsForCrm } from '../utils/crmHelpers.js'

const STALE_LEAD_DAYS = 7
const UPCOMING_ACTIVITY_DAYS = 3
const CLOSED_LEAD_STAGES = ['vendido', 'perdido']

function startOfDay(date = new Date()) {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

function endOfDay(date = new Date()) {
  const d = new Date(date)
  d.setHours(23, 59, 59, 999)
  return d
}

function addDays(date, days) {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

export async function computeCrmAlerts(userId) {
  const now = new Date()
  const todayStart = startOfDay(now)
  const activityDueEnd = endOfDay(addDays(now, UPCOMING_ACTIVITY_DAYS))
  const staleBefore = startOfDay(addDays(now, -STALE_LEAD_DAYS))

  const doneColumnIds = await ActivityColumn.distinct('_id', { key: 'done' })

  const [overduePayloads, upcomingActivities, staleLeads] = await Promise.all([
    Payload.find({
      status: 'pending',
      date: { $lt: todayStart }
    })
      .sort({ date: 1 })
      .limit(100)
      .lean(),
    Activity.find({
      assignedTo: userId,
      dueDate: { $gte: todayStart, $lte: activityDueEnd },
      columnId: { $nin: doneColumnIds }
    })
      .populate('contact.user', 'firstName lastName')
      .populate('projectId', 'name slug title')
      .sort({ dueDate: 1 })
      .limit(100)
      .lean(),
    Lead.find({
      assignedTo: userId,
      stage: { $nin: CLOSED_LEAD_STAGES },
      updatedAt: { $lt: staleBefore }
    })
      .populate('projectId', 'name slug title')
      .populate('assignedTo', 'firstName lastName email')
      .sort({ updatedAt: 1 })
      .limit(100)
      .lean()
  ])

  const enrichedPayments = await enrichPayloadsForCrm(overduePayloads)

  const overduePayments = enrichedPayments.map((p) => ({
    type: 'overdue_payment',
    id: String(p._id),
    title: 'Pago vencido',
    message: `${p.clientName || 'Cliente'} — ${p.unitLabel || 'Unidad'} — $${Number(p.amount || 0).toLocaleString('en-US')}`,
    dueDate: p.date,
    payload: {
      payloadId: p._id,
      amount: p.amount,
      status: p.status,
      clientName: p.clientName,
      unitLabel: p.unitLabel,
      projectId: p.projectId,
      projectName: p.projectName
    }
  }))

  const upcomingActivityAlerts = upcomingActivities.map((a) => ({
    type: 'upcoming_activity',
    id: String(a._id),
    title: a.title,
    message: a.contact?.name
      ? `Vence pronto — contacto: ${a.contact.name}`
      : 'Actividad con fecha límite próxima',
    dueDate: a.dueDate,
    payload: {
      activityId: a._id,
      projectId: a.projectId?._id || a.projectId,
      projectName: a.projectId?.title?.en || a.projectId?.name || null,
      priority: a.priority
    }
  }))

  const staleLeadAlerts = staleLeads.map((lead) => ({
    type: 'stale_lead',
    id: String(lead._id),
    title: lead.name,
    message: `Sin movimiento desde ${new Date(lead.updatedAt).toISOString().split('T')[0]} — etapa: ${lead.stage}`,
    dueDate: lead.updatedAt,
    payload: {
      leadId: lead._id,
      stage: lead.stage,
      source: lead.source,
      projectId: lead.projectId?._id || lead.projectId,
      projectName: lead.projectId?.title?.en || lead.projectId?.name || null,
      assignedTo: lead.assignedTo
        ? {
            _id: lead.assignedTo._id,
            name: [lead.assignedTo.firstName, lead.assignedTo.lastName].filter(Boolean).join(' ')
          }
        : null
    }
  }))

  const alerts = [...overduePayments, ...upcomingActivityAlerts, ...staleLeadAlerts]

  return {
    alerts,
    byType: {
      overduePayments,
      upcomingActivities: upcomingActivityAlerts,
      staleLeads: staleLeadAlerts
    },
    counts: {
      overduePayments: overduePayments.length,
      upcomingActivities: upcomingActivityAlerts.length,
      staleLeads: staleLeadAlerts.length,
      total: alerts.length
    }
  }
}

export const getCrmNotifications = async (req, res) => {
  try {
    const data = await computeCrmAlerts(req.user._id)
    res.json({
      alerts: data.alerts,
      byType: data.byType,
      counts: data.counts
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const getCrmNotificationsCount = async (req, res) => {
  try {
    const data = await computeCrmAlerts(req.user._id)
    res.json({ count: data.counts.total })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}
