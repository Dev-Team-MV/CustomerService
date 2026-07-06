import mongoose from 'mongoose'
import Campaign from '../models/Campaign.js'
import Lead from '../models/Lead.js'
import User from '../models/User.js'
import Property from '../models/Property.js'
import Apartment from '../models/Apartment.js'
import Building from '../models/Building.js'
import ApartmentModel from '../models/ApartmentModel.js'
import SMSTemplate from '../models/SMSTemplate.js'
import { sendSMSWithValidation } from './twilioService.js'

const activeSends = new Set()

function getTemplateValue(variables, key) {
  return key.split('.').reduce((acc, part) => {
    if (acc === null || acc === undefined) return undefined
    return acc[part]
  }, variables)
}

export function renderTemplate(template, variables = {}) {
  return template.replace(/\{\{\s*([a-zA-Z0-9_.-]+)\s*\}\}/g, (_match, key) => {
    const value = getTemplateValue(variables, key)
    return value === undefined || value === null ? '' : String(value)
  })
}

function buildLeadFilter(audience) {
  const filter = { phone: { $exists: true, $ne: '' } }
  if (audience.projectId) filter.projectId = audience.projectId
  if (audience.stage) filter.stage = audience.stage
  if (audience.filters?.assignedTo) filter.assignedTo = audience.filters.assignedTo
  if (audience.filters?.source) filter.source = audience.filters.source
  return filter
}

async function getClientUserIdsForProject(projectId) {
  if (!projectId) {
    const [propertyUserIds, apartmentUserIds] = await Promise.all([
      Property.distinct('users'),
      Apartment.distinct('users')
    ])
    return [...new Set([...propertyUserIds, ...apartmentUserIds].map(String))]
  }

  const propertyUserIds = await Property.distinct('users', { project: projectId })
  const buildings = await Building.find({ project: projectId }).select('_id').lean()
  const models = buildings.length
    ? await ApartmentModel.find({ building: { $in: buildings.map((b) => b._id) } }).select('_id').lean()
    : []
  const apartmentIds = models.length
    ? await Apartment.distinct('_id', { apartmentModel: { $in: models.map((m) => m._id) } })
    : []
  const apartments = apartmentIds.length
    ? await Apartment.find({ _id: { $in: apartmentIds } }).select('users').lean()
    : []
  const apartmentUserIds = apartments.flatMap((a) => (a.users || []).map(String))

  return [...new Set([...propertyUserIds.map(String), ...apartmentUserIds])]
}

export async function resolveCampaignRecipients(audience) {
  if (!audience?.type) return []

  if (audience.type === 'leads') {
    const leads = await Lead.find(buildLeadFilter(audience))
      .select('name phone email stage source')
      .lean()

    return leads.map((lead) => ({
      leadId: lead._id,
      phone: lead.phone,
      label: lead.name,
      status: 'pending',
      variables: {
        name: lead.name,
        leadName: lead.name,
        email: lead.email || '',
        phone: lead.phone || '',
        stage: lead.stage || ''
      }
    }))
  }

  const userIds = await getClientUserIdsForProject(audience.projectId)
  if (!userIds.length) return []

  const objectIds = userIds
    .filter((id) => mongoose.Types.ObjectId.isValid(id))
    .map((id) => new mongoose.Types.ObjectId(id))

  const users = await User.find({
    _id: { $in: objectIds },
    isActive: { $ne: false },
    phoneNumber: { $exists: true, $ne: '' }
  })
    .select('firstName lastName email phoneNumber')
    .lean()

  return users.map((user) => ({
    userId: user._id,
    phone: user.phoneNumber,
    label: [user.firstName, user.lastName].filter(Boolean).join(' ').trim() || user.email,
    status: 'pending',
    variables: {
      name: [user.firstName, user.lastName].filter(Boolean).join(' ').trim(),
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      phone: user.phoneNumber || ''
    }
  }))
}

export async function previewCampaignRecipients(campaign) {
  const template = await SMSTemplate.findById(campaign.templateId).lean()
  if (!template) throw new Error('SMS template not found')

  const recipients = await resolveCampaignRecipients(campaign.audience)
  return {
    total: recipients.length,
    recipients: recipients.map((r) => ({
      userId: r.userId,
      leadId: r.leadId,
      phone: r.phone,
      label: r.label,
      previewMessage: renderTemplate(template.template, r.variables)
    }))
  }
}

async function getRecipientVariables(recipient) {
  if (recipient.leadId) {
    const lead = await Lead.findById(recipient.leadId).select('name email phone stage').lean()
    if (!lead) return {}
    return {
      name: lead.name,
      leadName: lead.name,
      email: lead.email || '',
      phone: lead.phone || '',
      stage: lead.stage || ''
    }
  }

  if (recipient.userId) {
    const user = await User.findById(recipient.userId)
      .select('firstName lastName email phoneNumber')
      .lean()
    if (!user) return {}
    return {
      name: [user.firstName, user.lastName].filter(Boolean).join(' '),
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      phone: user.phoneNumber || ''
    }
  }

  return {}
}

async function processCampaignSend(campaignId) {
  const campaign = await Campaign.findById(campaignId)
  if (!campaign || campaign.status !== 'enviando') {
    activeSends.delete(String(campaignId))
    return
  }

  const template = await SMSTemplate.findById(campaign.templateId).lean()
  if (!template) {
    campaign.status = 'fallida'
    await campaign.save()
    activeSends.delete(String(campaignId))
    return
  }

  let sent = 0
  let failed = 0

  for (const recipient of campaign.recipients) {
    if (recipient.status === 'sent') {
      sent += 1
      continue
    }

    try {
      const variables = await getRecipientVariables(recipient)
      const message = renderTemplate(template.template, variables)
      await sendSMSWithValidation(recipient.phone, message)

      recipient.status = 'sent'
      recipient.sentAt = new Date()
      recipient.error = undefined
      sent += 1
    } catch (error) {
      recipient.status = 'failed'
      recipient.error = error.message
      failed += 1
    }

    campaign.stats = {
      total: campaign.recipients.length,
      sent,
      failed
    }
    await campaign.save()
  }

  campaign.stats = {
    total: campaign.recipients.length,
    sent,
    failed
  }
  campaign.status = failed === campaign.recipients.length && campaign.recipients.length > 0
    ? 'fallida'
    : 'completada'
  if (!campaign.sentAt) campaign.sentAt = new Date()

  await campaign.save()
  activeSends.delete(String(campaignId))
}

export async function startCampaignSend(campaignId) {
  if (activeSends.has(String(campaignId))) {
    throw new Error('Campaign is already sending')
  }

  const campaign = await Campaign.findById(campaignId)
  if (!campaign) throw new Error('Campaign not found')
  if (campaign.status === 'enviando') throw new Error('Campaign is already sending')
  if (campaign.status === 'completada') throw new Error('Campaign already completed')

  const template = await SMSTemplate.findById(campaign.templateId)
  if (!template) throw new Error('SMS template not found')

  const resolved = await resolveCampaignRecipients(campaign.audience)
  if (!resolved.length) throw new Error('No recipients match campaign audience')

  campaign.recipients = resolved.map((r) => ({
    userId: r.userId,
    leadId: r.leadId,
    phone: r.phone,
    status: 'pending'
  }))
  campaign.stats = { total: campaign.recipients.length, sent: 0, failed: 0 }
  campaign.status = 'enviando'
  await campaign.save()

  activeSends.add(String(campaignId))
  setImmediate(() => {
    processCampaignSend(campaignId).catch((err) => {
      console.error('[CampaignSend]', err.message)
      activeSends.delete(String(campaignId))
    })
  })

  return campaign
}

export function getCampaignStats(campaign) {
  const pending = campaign.recipients.filter((r) => r.status === 'pending').length
  return {
    campaignId: campaign._id,
    status: campaign.status,
    stats: campaign.stats,
    pending,
    progressPercent:
      campaign.stats.total > 0
        ? Math.round(((campaign.stats.sent + campaign.stats.failed) / campaign.stats.total) * 1000) / 10
        : 0,
    sentAt: campaign.sentAt,
    scheduledAt: campaign.scheduledAt
  }
}
