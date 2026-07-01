import Automation, { AUTOMATION_ACTIONS, AUTOMATION_TRIGGERS } from '../models/Automation.js'
import Project from '../models/Project.js'
import User from '../models/User.js'
import SMSTemplate from '../models/SMSTemplate.js'
import { isValidObjectId } from '../utils/crmHelpers.js'
import { testAutomationById } from '../services/automationEngine.js'

const POPULATE_FIELDS = [
  { path: 'condition.projectId', select: 'name slug title' },
  { path: 'actionPayload.templateId', select: 'name template' },
  { path: 'actionPayload.assignedTo', select: 'firstName lastName email' },
  { path: 'createdBy', select: 'firstName lastName email' }
]

async function validateAutomationBody(body, { isUpdate = false } = {}) {
  const { trigger, action, condition, actionPayload, isActive, name } = body

  if (!isUpdate) {
    if (!trigger || !AUTOMATION_TRIGGERS.includes(trigger)) {
      return { error: `trigger is required. Allowed: ${AUTOMATION_TRIGGERS.join(', ')}` }
    }
    if (!action || !AUTOMATION_ACTIONS.includes(action)) {
      return { error: `action is required. Allowed: ${AUTOMATION_ACTIONS.join(', ')}` }
    }
  }

  if (trigger && !AUTOMATION_TRIGGERS.includes(trigger)) {
    return { error: `Invalid trigger. Allowed: ${AUTOMATION_TRIGGERS.join(', ')}` }
  }

  if (action && !AUTOMATION_ACTIONS.includes(action)) {
    return { error: `Invalid action. Allowed: ${AUTOMATION_ACTIONS.join(', ')}` }
  }

  if (condition?.projectId) {
    const exists = await Project.exists({ _id: condition.projectId })
    if (!exists) return { error: 'Project not found in condition', status: 404 }
  }

  if (actionPayload?.assignedTo) {
    const exists = await User.exists({ _id: actionPayload.assignedTo })
    if (!exists) return { error: 'User not found in actionPayload.assignedTo', status: 404 }
  }

  if (actionPayload?.templateId) {
    const exists = await SMSTemplate.exists({ _id: actionPayload.templateId })
    if (!exists) return { error: 'SMS template not found', status: 404 }
  }

  if (condition?.daysInactive !== undefined) {
    const days = Number(condition.daysInactive)
    if (!Number.isFinite(days) || days < 1) {
      return { error: 'condition.daysInactive must be a number >= 1' }
    }
  }

  return { error: null, data: { trigger, action, condition, actionPayload, isActive, name } }
}

export const getAutomations = async (req, res) => {
  try {
    const { trigger, isActive } = req.query
    const filter = {}
    if (trigger) filter.trigger = trigger
    if (isActive !== undefined) filter.isActive = isActive === 'true'

    const automations = await Automation.find(filter)
      .populate(POPULATE_FIELDS)
      .sort({ createdAt: -1 })
      .lean()

    res.json({ automations, total: automations.length })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const getAutomationById = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid automation id' })
    }

    const automation = await Automation.findById(req.params.id).populate(POPULATE_FIELDS).lean()
    if (!automation) return res.status(404).json({ message: 'Automation not found' })
    res.json(automation)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const createAutomation = async (req, res) => {
  try {
    const validation = await validateAutomationBody(req.body)
    if (validation.error) {
      return res.status(validation.status || 400).json({ message: validation.error })
    }

    const { trigger, action, condition, actionPayload, isActive, name } = validation.data

    const automation = await Automation.create({
      name: name?.trim() || `${trigger} → ${action}`,
      trigger,
      action,
      condition: condition || {},
      actionPayload: actionPayload || {},
      isActive: isActive !== false,
      createdBy: req.user._id
    })

    await automation.populate(POPULATE_FIELDS)
    res.status(201).json(automation)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const updateAutomation = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid automation id' })
    }

    const automation = await Automation.findById(req.params.id)
    if (!automation) return res.status(404).json({ message: 'Automation not found' })

    const validation = await validateAutomationBody(req.body, { isUpdate: true })
    if (validation.error) {
      return res.status(validation.status || 400).json({ message: validation.error })
    }

    const { trigger, action, condition, actionPayload, isActive, name } = validation.data
    if (trigger !== undefined) automation.trigger = trigger
    if (action !== undefined) automation.action = action
    if (condition !== undefined) automation.condition = condition
    if (actionPayload !== undefined) automation.actionPayload = actionPayload
    if (isActive !== undefined) automation.isActive = isActive
    if (name !== undefined) automation.name = name.trim()

    await automation.save()
    await automation.populate(POPULATE_FIELDS)
    res.json(automation)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const deleteAutomation = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid automation id' })
    }

    const automation = await Automation.findById(req.params.id)
    if (!automation) return res.status(404).json({ message: 'Automation not found' })

    await automation.deleteOne()
    res.json({ message: 'Automation deleted' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const testAutomation = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid automation id' })
    }

    const output = await testAutomationById(req.params.id, {
      ...req.body,
      actor: req.user
    })

    if (!output) return res.status(404).json({ message: 'Automation not found' })

    res.json(output)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}
