import Appointment from '../models/Appointment.js'

const SOURCE_SCORES = {
  web: 20,
  referido: 30,
  visita: 40,
  llamada: 15
}

const STALE_STAGE_DAYS = 7
const STALE_PENALTY_PER_DAY = 5
const APPOINTMENT_BONUS = 25
const SMS_RESPONDED_BONUS = 15

const FRESH_LEAD_BONUSES = [
  { maxDays: 3, points: 15 },
  { maxDays: 7, points: 8 }
]

function daysBetween(fromDate, toDate = new Date()) {
  const start = new Date(fromDate)
  const end = new Date(toDate)
  return Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
}

function freshLeadBonus(createdAt) {
  const ageDays = daysBetween(createdAt)
  for (const tier of FRESH_LEAD_BONUSES) {
    if (ageDays <= tier.maxDays) return tier.points
  }
  return 0
}

function stageStagnationPenalty(stageEnteredAt) {
  const daysInStage = daysBetween(stageEnteredAt)
  if (daysInStage <= STALE_STAGE_DAYS) return 0
  return (daysInStage - STALE_STAGE_DAYS) * STALE_PENALTY_PER_DAY
}

async function hasScheduledAppointment(leadId) {
  const now = new Date()
  return Appointment.exists({
    leadId,
    status: { $in: ['pendiente', 'confirmada'] },
    startDate: { $gte: now }
  })
}

/**
 * Calcula el score de un lead sin persistir.
 */
export async function calculateLeadScore(lead) {
  if (!lead) return 0

  let score = SOURCE_SCORES[lead.source] || 0
  score += freshLeadBonus(lead.createdAt)

  const stageEnteredAt = lead.stageEnteredAt || lead.updatedAt || lead.createdAt
  score -= stageStagnationPenalty(stageEnteredAt)

  if (await hasScheduledAppointment(lead._id)) {
    score += APPOINTMENT_BONUS
  }

  if (lead.smsResponded) {
    score += SMS_RESPONDED_BONUS
  }

  return Math.max(0, Math.round(score))
}

/**
 * Recalcula y guarda el score de un lead.
 */
export async function updateLeadScore(lead) {
  const doc = lead.save ? lead : null
  const target = doc || lead
  target.score = await calculateLeadScore(target)
  if (doc) await doc.save()
  return target.score
}

/**
 * Recalcula scores de todos los leads activos (cron diario).
 */
export async function recalculateAllLeadScores() {
  const Lead = (await import('../models/Lead.js')).default
  const leads = await Lead.find({ stage: { $nin: ['vendido', 'perdido'] } })
  let updated = 0

  for (const lead of leads) {
    const previous = lead.score
    const next = await calculateLeadScore(lead)
    if (previous !== next) {
      lead.score = next
      await lead.save()
      updated += 1
    }
  }

  return { total: leads.length, updated }
}

export function touchLeadStage(lead) {
  lead.stageEnteredAt = new Date()
}
