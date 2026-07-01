import Activity from '../models/Activity.js'
import ActivityColumn, { DEFAULT_ACTIVITY_COLUMNS } from '../models/ActivityColumn.js'
import Automation, { AUTOMATION_TRIGGERS } from '../models/Automation.js'
import Lead from '../models/Lead.js'
import SMSTemplate from '../models/SMSTemplate.js'
import { sendSMSWithValidation } from './twilioService.js'
import { notifyUser, existsByFingerprint } from './notificationService.js'
import { enrichPayloadsForCrm } from '../utils/crmHelpers.js'

const CLOSED_LEAD_STAGES = ['vendido', 'perdido']

const runAsync = (task) => {
  Promise.resolve(task()).catch((error) => {
    console.error('[AutomationEngine]', error.message)
  })
}

function startOfDay(date = new Date()) {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

function getTemplateValue(variables, key) {
  return key.split('.').reduce((acc, part) => {
    if (acc === null || acc === undefined) return undefined
    return acc[part]
  }, variables)
}

function renderTemplate(template, variables = {}) {
  return template.replace(/\{\{\s*([a-zA-Z0-9_.-]+)\s*\}\}/g, (_match, key) => {
    const value = getTemplateValue(variables, key)
    return value === undefined || value === null ? '' : String(value)
  })
}

function projectIdFromContext(context) {
  const lead = context.lead
  const appointment = context.appointment
  const payload = context.enrichedPayload || context.payload

  if (lead?.projectId) return String(lead.projectId._id || lead.projectId)
  if (appointment?.projectId) return String(appointment.projectId._id || appointment.projectId)
  if (payload?.projectId) return String(payload.projectId)
  return null
}

export function matchesAutomationCondition(automation, context) {
  const condition = automation.condition || {}

  if (condition.projectId) {
    const ctxProjectId = projectIdFromContext(context)
    if (!ctxProjectId || ctxProjectId !== String(condition.projectId)) return false
  }

  if (condition.stage && context.lead) {
    const leadStage = context.lead.stage
    if (leadStage !== condition.stage) return false
  }

  if (automation.trigger === 'lead_stage_changed' && condition.stage) {
    if (!context.lead || context.lead.stage !== condition.stage) return false
  }

  if (automation.trigger === 'inactivity_7days' && context.lead) {
    const days = condition.daysInactive || 7
    const threshold = startOfDay(new Date())
    threshold.setDate(threshold.getDate() - days)
    if (new Date(context.lead.updatedAt) >= threshold) return false
    if (CLOSED_LEAD_STAGES.includes(context.lead.stage)) return false
  }

  return true
}

async function ensureBoardColumns(scope) {
  const filter =
    scope.boardType === 'project'
      ? { boardType: 'project', projectId: scope.projectId }
      : { boardType: 'global' }

  let columns = await ActivityColumn.find(filter).sort({ order: 1 })
  if (columns.length > 0) return columns

  await ActivityColumn.insertMany(
    DEFAULT_ACTIVITY_COLUMNS.map((column) => ({
      ...scope,
      ...column
    }))
  )

  return ActivityColumn.find(filter).sort({ order: 1 })
}

async function createAutomationActivity({ projectId, assignedTo, title, description, contact, createdBy }) {
  const scope =
    projectId
      ? { boardType: 'project', projectId }
      : { boardType: 'global' }

  const columns = await ensureBoardColumns(scope)
  const todoColumn = columns.find((c) => c.key === 'todo') || columns[0]
  const columnFilter =
    scope.boardType === 'project'
      ? { boardType: 'project', projectId: scope.projectId, columnId: todoColumn._id }
      : { boardType: 'global', columnId: todoColumn._id }

  const position = await Activity.countDocuments(columnFilter)

  return Activity.create({
    ...scope,
    title,
    description: description || '',
    columnId: todoColumn._id,
    position,
    priority: 'medium',
    assignedTo,
    contact: contact || {},
    createdBy: createdBy || assignedTo,
    tags: ['automation']
  })
}

function buildTemplateVariables(context) {
  const lead = context.lead
  const appointment = context.appointment
  const payload = context.enrichedPayload || context.payload
  const client = context.client

  return {
    leadName: lead?.name || '',
    leadStage: lead?.stage || '',
    leadPhone: lead?.phone || '',
    leadEmail: lead?.email || '',
    appointmentTitle: appointment?.title || '',
    appointmentType: appointment?.type || '',
    clientName: client
      ? [client.firstName, client.lastName].filter(Boolean).join(' ')
      : lead?.name || '',
    amount: payload?.amount ?? '',
    projectName: payload?.projectName || ''
  }
}

function resolveNotifyUserId(automation, context) {
  const fromPayload = automation.actionPayload?.assignedTo
  if (fromPayload) return fromPayload
  if (context.lead?.assignedTo) return context.lead.assignedTo._id || context.lead.assignedTo
  if (context.appointment?.assignedTo) {
    return context.appointment.assignedTo._id || context.appointment.assignedTo
  }
  return null
}

function resolvePhone(context) {
  if (context.lead?.phone) return context.lead.phone
  if (context.client?.phoneNumber) return context.client.phoneNumber
  if (context.appointment?.leadId?.phone) return context.appointment.leadId.phone
  return null
}

export async function executeAutomation(automation, context, options = {}) {
  const { dryRun = false, fingerprint } = options
  const actionPayload = automation.actionPayload || {}
  const variables = buildTemplateVariables(context)

  if (dryRun) {
    return {
      automationId: automation._id,
      action: automation.action,
      dryRun: true,
      wouldRun: true
    }
  }

  if (fingerprint) {
    const alreadyRan = await existsByFingerprint('CUSTOM', fingerprint)
    if (alreadyRan) {
      return { automationId: automation._id, skipped: true, reason: 'already_executed' }
    }
  }

  switch (automation.action) {
    case 'send_sms': {
      const phone = resolvePhone(context)
      if (!phone) {
        return { automationId: automation._id, success: false, error: 'No phone number in context' }
      }

      let message = actionPayload.message || ''
      if (actionPayload.templateId) {
        const template = await SMSTemplate.findById(actionPayload.templateId).lean()
        if (!template) {
          return { automationId: automation._id, success: false, error: 'SMS template not found' }
        }
        message = renderTemplate(template.template, variables)
      }

      if (!message.trim()) {
        return { automationId: automation._id, success: false, error: 'SMS message is empty' }
      }

      await sendSMSWithValidation(phone, message.trim())
      return { automationId: automation._id, success: true, action: 'send_sms', phone }
    }

    case 'create_activity': {
      const projectId = projectIdFromContext(context)
      const assignedTo = resolveNotifyUserId(automation, context)
      const actorId = context.actor?._id || assignedTo
      const title =
        actionPayload.title ||
        `Automatización: ${automation.name || automation.trigger}`
      const description =
        actionPayload.description ||
        actionPayload.message ||
        `Disparada por ${automation.trigger}`

      let contact = {}
      if (context.lead) {
        contact = {
          user: context.lead.convertedToUserId,
          name: context.lead.name,
          phone: context.lead.phone,
          email: context.lead.email
        }
      } else if (context.client) {
        contact = {
          user: context.client._id,
          name: [context.client.firstName, context.client.lastName].filter(Boolean).join(' '),
          phone: context.client.phoneNumber,
          email: context.client.email
        }
      }

      const activity = await createAutomationActivity({
        projectId,
        assignedTo,
        title,
        description,
        contact,
        createdBy: actorId
      })

      return { automationId: automation._id, success: true, action: 'create_activity', activityId: activity._id }
    }

    case 'notify_agent': {
      const userId = resolveNotifyUserId(automation, context)
      if (!userId) {
        return { automationId: automation._id, success: false, error: 'No agent to notify' }
      }

      const title = actionPayload.title || `Automatización: ${automation.trigger}`
      const body =
        actionPayload.message ||
        actionPayload.description ||
        'Se ejecutó una regla de automatización del CRM.'

      await notifyUser(userId, {
        title,
        body,
        type: 'INFO',
        audience: 'admin',
        projectId: projectIdFromContext(context) || undefined,
        payload: {
          event: 'AUTOMATION_TRIGGERED',
          automationId: automation._id,
          trigger: automation.trigger,
          fingerprint
        }
      })

      return { automationId: automation._id, success: true, action: 'notify_agent', userId }
    }

    default:
      return { automationId: automation._id, success: false, error: 'Unknown action' }
  }
}

async function runInactivityScan() {
  const automations = await Automation.find({
    trigger: 'inactivity_7days',
    isActive: true
  }).lean()

  const results = []
  for (const automation of automations) {
    const days = automation.condition?.daysInactive || 7
    const staleBefore = startOfDay(new Date())
    staleBefore.setDate(staleBefore.getDate() - days)

    const filter = {
      stage: { $nin: CLOSED_LEAD_STAGES },
      updatedAt: { $lt: staleBefore }
    }
    if (automation.condition?.projectId) filter.projectId = automation.condition.projectId
    if (automation.condition?.stage) filter.stage = automation.condition.stage

    const leads = await Lead.find(filter).limit(100).lean()
    for (const lead of leads) {
      const context = { lead }
      if (!matchesAutomationCondition(automation, context)) continue

      const fingerprint = `automation:${automation._id}:lead:${lead._id}:inactivity`
      const result = await executeAutomation(automation, context, { fingerprint })
      results.push(result)
    }
  }
  return results
}

export async function runAutomationEngine(trigger, context = {}) {
  if (!AUTOMATION_TRIGGERS.includes(trigger)) {
    throw new Error(`Invalid automation trigger: ${trigger}`)
  }

  if (trigger === 'inactivity_7days') {
    return runInactivityScan()
  }

  const automations = await Automation.find({ trigger, isActive: true }).lean()
  const results = []

  for (const automation of automations) {
    if (!matchesAutomationCondition(automation, context)) continue
    const result = await executeAutomation(automation, context)
    results.push(result)
  }

  return results
}

export function runAutomationEngineAsync(trigger, context = {}) {
  runAsync(() => runAutomationEngine(trigger, context))
}

export function isPayloadOverdue(payload) {
  if (!payload || payload.status !== 'pending') return false
  return new Date(payload.date) < startOfDay(new Date())
}

export async function buildPaymentOverdueContext(payload, actor) {
  const enriched = await enrichPayloadsForCrm([payload])
  return {
    payload,
    enrichedPayload: enriched[0],
    actor
  }
}

export async function buildTestContext(automation, sample = {}) {
  switch (automation.trigger) {
    case 'lead_stage_changed':
    case 'inactivity_7days': {
      const lead = sample.leadId
        ? await Lead.findById(sample.leadId).lean()
        : await Lead.findOne().sort({ updatedAt: -1 }).lean()
      if (!lead) throw new Error('No lead available for test context')
      return { lead, previousStage: sample.previousStage || 'nuevo', actor: sample.actor }
    }
    case 'payment_overdue': {
      const Payload = (await import('../models/Payload.js')).default
      const payload = sample.payloadId
        ? await Payload.findById(sample.payloadId).lean()
        : await Payload.findOne({ status: 'pending' }).sort({ date: 1 }).lean()
      if (!payload) throw new Error('No payload available for test context')
      return buildPaymentOverdueContext(payload, sample.actor)
    }
    case 'appointment_created': {
      const Appointment = (await import('../models/Appointment.js')).default
      const appointment = sample.appointmentId
        ? await Appointment.findById(sample.appointmentId)
            .populate('leadId', 'name phone email')
            .populate('clientId', 'firstName lastName phoneNumber email')
            .lean()
        : await Appointment.findOne().sort({ createdAt: -1 })
            .populate('leadId', 'name phone email')
            .populate('clientId', 'firstName lastName phoneNumber email')
            .lean()
      if (!appointment) throw new Error('No appointment available for test context')
      return { appointment, actor: sample.actor }
    }
    default:
      return sample
  }
}

export async function testAutomationById(automationId, sample = {}) {
  const automation = await Automation.findById(automationId).lean()
  if (!automation) return null

  const context = await buildTestContext(automation, sample)
  const matched = matchesAutomationCondition(automation, context)
  if (!matched) {
    return {
      automation,
      matched: false,
      context,
      result: null
    }
  }

  const result = await executeAutomation(automation, context)
  return { automation, matched: true, context, result }
}
