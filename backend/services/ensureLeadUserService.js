import Lead from '../models/Lead.js'
import User from '../models/User.js'
import Quote from '../models/Quote.js'
import { sendSMSWithValidation } from './twilioService.js'
import { resolveFrontendBaseUrl } from './resolveFrontendBaseUrl.js'
import { notifyUserCreatedByAdmin } from '../utils/notificationTriggers.js'
import { touchLeadStage, updateLeadScore } from './leadScoringService.js'
import { runAutomationEngineAsync } from './automationEngine.js'

export function splitLeadName(name) {
  const parts = (name || '').trim().split(/\s+/)
  const firstName = parts[0] || 'Lead'
  const lastName = parts.slice(1).join(' ') || '-'
  return { firstName, lastName }
}

function toIdStr(val) {
  if (val == null) return ''
  if (typeof val === 'string') return val
  if (val._id != null) return String(val._id)
  return String(val)
}

/**
 * Ensure a lead is linked to a User account.
 * - If already converted, returns that user.
 * - If email matches an existing user and linkExistingEmail, links the lead.
 * - Otherwise creates a new user (optional setup SMS).
 */
export async function ensureLeadConvertedToUser(
  lead,
  {
    sendSms = true,
    actor = null,
    markVendido = true,
    linkExistingEmail = true
  } = {}
) {
  if (!lead) {
    return { ok: false, status: 404, message: 'Lead not found' }
  }

  if (lead.convertedToUserId) {
    const existing = await User.findById(lead.convertedToUserId)
    if (existing) {
      return { ok: true, user: existing, lead, created: false, linkedExisting: false }
    }
  }

  if (!lead.email) {
    return { ok: false, status: 400, message: 'Lead email is required to convert to user' }
  }
  if (!lead.phone) {
    return { ok: false, status: 400, message: 'Lead phone is required to convert to user' }
  }

  const email = String(lead.email).toLowerCase()
  const existingUser = await User.findOne({ email })
  if (existingUser) {
    if (!linkExistingEmail) {
      return {
        ok: false,
        status: 400,
        message: 'A user with this email already exists',
        userId: existingUser._id
      }
    }
    const previousStage = lead.stage
    lead.convertedToUserId = existingUser._id
    if (markVendido && lead.stage !== 'vendido') {
      lead.stage = 'vendido'
      touchLeadStage(lead)
    }
    await updateLeadScore(lead)
    if (markVendido && previousStage !== 'vendido') {
      runAutomationEngineAsync('lead_stage_changed', {
        lead: lead.toObject ? lead.toObject() : lead,
        previousStage,
        actor
      })
    }
    return {
      ok: true,
      user: existingUser,
      lead,
      created: false,
      linkedExisting: true,
      smsSent: false
    }
  }

  const { firstName, lastName } = splitLeadName(lead.name)
  const userData = {
    firstName,
    lastName,
    email,
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
  if (sendSms) {
    try {
      const frontendUrl = await resolveFrontendBaseUrl(lead.projectId)
      setupLink = `${frontendUrl}/setup-password/${setupToken}`
      const message = `Hi ${firstName}, your account has been created. Please set your password by visiting this link: ${setupLink}`
      await sendSMSWithValidation(lead.phone, message)
      smsSent = true
    } catch (smsError) {
      console.error('Error sending setup SMS for converted lead:', smsError.message)
      setupLink = setupLink || null
    }
  } else {
    try {
      const frontendUrl = await resolveFrontendBaseUrl(lead.projectId)
      setupLink = `${frontendUrl}/setup-password/${setupToken}`
    } catch {
      setupLink = null
    }
  }

  const previousStage = lead.stage
  lead.convertedToUserId = user._id
  if (markVendido) {
    lead.stage = 'vendido'
    if (previousStage !== 'vendido') {
      touchLeadStage(lead)
    }
  }
  await updateLeadScore(lead)

  if (markVendido && previousStage !== 'vendido') {
    runAutomationEngineAsync('lead_stage_changed', {
      lead: lead.toObject ? lead.toObject() : lead,
      previousStage,
      actor
    })
  }

  return {
    ok: true,
    user,
    lead,
    created: true,
    linkedExisting: false,
    smsSent,
    setupLink: smsSent ? undefined : setupLink
  }
}

/**
 * Resolve property/apartment owner User IDs from:
 * - explicit user / users / userId
 * - leadId (or lead IDs mistakenly sent as users)
 * - quote.clientId / quote.leadId when quoteId is present
 */
export async function resolveSaleOwnerIds({
  ownerIds = [],
  leadId = null,
  quoteId = null,
  autoConvertLead = true,
  sendSms = true,
  actor = null
} = {}) {
  const candidates = []
  const seen = new Set()

  const pushCandidate = (raw) => {
    const id = toIdStr(raw)
    if (!id || !/^[a-fA-F0-9]{24}$/.test(id) || seen.has(id)) return
    seen.add(id)
    candidates.push(id)
  }

  for (const id of ownerIds) pushCandidate(id)
  pushCandidate(leadId)

  let quote = null
  if (quoteId && /^[a-fA-F0-9]{24}$/.test(String(quoteId))) {
    quote = await Quote.findById(quoteId).select('clientId leadId').lean()
    if (quote) {
      pushCandidate(quote.clientId)
      pushCandidate(quote.leadId)
    }
  }

  if (candidates.length === 0) {
    return {
      ok: false,
      status: 400,
      message: 'At least one owner (user, users, userId, or leadId) is required'
    }
  }

  const resolved = []
  const resolvedSeen = new Set()
  const conversions = []

  for (const id of candidates) {
    const user = await User.findById(id)
    if (user) {
      const uid = String(user._id)
      if (!resolvedSeen.has(uid)) {
        resolvedSeen.add(uid)
        resolved.push(user._id)
      }
      continue
    }

    const lead = await Lead.findById(id)
    if (!lead) {
      return {
        ok: false,
        status: 404,
        message: `Owner not found as user or lead: ${id}`
      }
    }

    if (!autoConvertLead && !lead.convertedToUserId) {
      return {
        ok: false,
        status: 400,
        message: 'Lead must be converted to a user before assigning a property',
        leadId: lead._id
      }
    }

    const result = await ensureLeadConvertedToUser(lead, {
      sendSms,
      actor,
      markVendido: true,
      linkExistingEmail: true
    })
    if (!result.ok) {
      return {
        ok: false,
        status: result.status,
        message: result.message,
        userId: result.userId,
        leadId: lead._id
      }
    }

    conversions.push({
      leadId: lead._id,
      userId: result.user._id,
      created: result.created,
      linkedExisting: result.linkedExisting,
      smsSent: result.smsSent,
      setupLink: result.setupLink
    })

    const uid = String(result.user._id)
    if (!resolvedSeen.has(uid)) {
      resolvedSeen.add(uid)
      resolved.push(result.user._id)
    }

    // Keep quote.clientId in sync when we resolved via quote lead
    if (quote && quoteId) {
      await Quote.findByIdAndUpdate(quoteId, { clientId: result.user._id })
    }
  }

  return {
    ok: true,
    ownerIds: resolved,
    conversions,
    quote
  }
}
