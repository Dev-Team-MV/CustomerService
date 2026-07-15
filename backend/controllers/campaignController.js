import mongoose from 'mongoose'
import Campaign, { CAMPAIGN_AUDIENCE_TYPES, CAMPAIGN_STATUSES } from '../models/Campaign.js'
import SMSTemplate from '../models/SMSTemplate.js'
import Project from '../models/Project.js'
import {
  getCampaignStats,
  previewCampaignRecipients,
  startCampaignSend
} from '../services/campaignService.js'
import { assertTemplateProjectMatch } from '../services/projectVariableResolverService.js'

const POPULATE_FIELDS = [
  { path: 'templateId', select: 'name template category projectId' },
  { path: 'audience.projectId', select: 'name slug title' },
  { path: 'createdBy', select: 'firstName lastName email' }
]

function validateAudience(audience) {
  if (!audience?.type || !CAMPAIGN_AUDIENCE_TYPES.includes(audience.type)) {
    return 'audience.type must be clients or leads'
  }
  return null
}

export const createCampaign = async (req, res) => {
  try {
    const { name, templateId, audience, status, scheduledAt } = req.body

    if (!name?.trim()) {
      return res.status(400).json({ message: 'Campaign name is required' })
    }

    if (!templateId || !mongoose.Types.ObjectId.isValid(templateId)) {
      return res.status(400).json({ message: 'Valid templateId is required' })
    }

    const audienceError = validateAudience(audience)
    if (audienceError) {
      return res.status(400).json({ message: audienceError })
    }

    const template = await SMSTemplate.findById(templateId)
    if (!template) return res.status(404).json({ message: 'SMS template not found' })

    if (audience.projectId) {
      const projectExists = await Project.exists({ _id: audience.projectId })
      if (!projectExists) return res.status(404).json({ message: 'Project not found' })
    }

    const projectMismatch = assertTemplateProjectMatch(template.projectId, audience.projectId)
    if (projectMismatch) {
      return res.status(400).json({ message: projectMismatch })
    }

    if (status && !CAMPAIGN_STATUSES.includes(status)) {
      return res.status(400).json({ message: `Invalid status. Allowed: ${CAMPAIGN_STATUSES.join(', ')}` })
    }

    const campaign = await Campaign.create({
      name: name.trim(),
      templateId,
      audience: {
        type: audience.type,
        projectId: audience.projectId || undefined,
        stage: audience.stage || undefined,
        filters: audience.filters || {}
      },
      status: status || 'borrador',
      scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined,
      createdBy: req.user._id
    })

    await campaign.populate(POPULATE_FIELDS)
    res.status(201).json(campaign)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const getCampaigns = async (req, res) => {
  try {
    const filter = {}
    if (req.query.status) filter.status = req.query.status
    if (req.query.projectId) filter['audience.projectId'] = req.query.projectId

    const campaigns = await Campaign.find(filter)
      .populate(POPULATE_FIELDS)
      .sort({ createdAt: -1 })
      .lean()

    res.json({
      campaigns,
      total: campaigns.length
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const previewCampaign = async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id).lean()
    if (!campaign) return res.status(404).json({ message: 'Campaign not found' })

    const preview = await previewCampaignRecipients(campaign)
    res.json(preview)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const sendCampaign = async (req, res) => {
  try {
    const campaign = await startCampaignSend(req.params.id)
    res.status(202).json({
      message: 'Campaign send started',
      campaignId: campaign._id,
      status: campaign.status,
      stats: campaign.stats
    })
  } catch (error) {
    const clientErrors = [
      'Campaign not found',
      'SMS template not found',
      'No recipients match campaign audience',
      'Campaign is already sending',
      'Campaign already completed'
    ]
    if (clientErrors.includes(error.message)) {
      const status = error.message === 'Campaign not found' || error.message === 'SMS template not found'
        ? 404
        : 400
      return res.status(status).json({ message: error.message })
    }
    res.status(500).json({ message: error.message })
  }
}

export const getCampaignStatsById = async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id)
    if (!campaign) return res.status(404).json({ message: 'Campaign not found' })

    res.json(getCampaignStats(campaign))
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}
