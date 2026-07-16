import OnboardingChecklist, {
  ONBOARDING_STATUSES,
  buildDefaultOnboardingItems
} from '../models/OnboardingChecklist.js'
import { isStaffRole } from '../utils/roles.js'
import { isValidObjectId } from '../utils/crmHelpers.js'
import { runAutomationEngineAsync } from '../services/automationEngine.js'

const POPULATE = [
  { path: 'propertyId', select: 'price status lot model' },
  { path: 'clientId', select: 'firstName lastName email phoneNumber' },
  { path: 'projectId', select: 'name slug title' },
  { path: 'items.completedBy', select: 'firstName lastName email' },
  { path: 'items.requiredDocumentId', select: 'title category fileUrl' }
]

function isAdminUser(user) {
  return isStaffRole(user?.role)
}

function deriveStatus(items = []) {
  if (!items.length) return 'not_started'
  const completedCount = items.filter((i) => i.completed).length
  if (completedCount === 0) return 'not_started'
  if (completedCount === items.length) return 'completed'
  return 'in_progress'
}

export const getChecklists = async (req, res) => {
  try {
    const filter = {}
    for (const key of ['projectId', 'propertyId', 'clientId']) {
      if (req.query[key]) {
        if (!isValidObjectId(req.query[key])) {
          return res.status(400).json({ message: `Invalid ${key}` })
        }
        filter[key] = req.query[key]
      }
    }
    if (req.query.status) {
      if (!ONBOARDING_STATUSES.includes(req.query.status)) {
        return res.status(400).json({
          message: `Invalid status. Allowed: ${ONBOARDING_STATUSES.join(', ')}`
        })
      }
      filter.status = req.query.status
    }

    if (!isAdminUser(req.user)) {
      filter.clientId = req.user._id
    }

    const checklists = await OnboardingChecklist.find(filter)
      .populate(POPULATE)
      .sort({ createdAt: -1 })
    res.json(checklists)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const getChecklistById = async (req, res) => {
  try {
    const checklist = await OnboardingChecklist.findById(req.params.id).populate(POPULATE)
    if (!checklist) return res.status(404).json({ message: 'Onboarding checklist not found' })

    if (
      !isAdminUser(req.user) &&
      String(checklist.clientId._id || checklist.clientId) !== String(req.user._id)
    ) {
      return res.status(403).json({ message: 'Not authorized to view this checklist' })
    }

    res.json(checklist)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const getChecklistByProperty = async (req, res) => {
  try {
    const { propertyId } = req.params
    if (!isValidObjectId(propertyId)) {
      return res.status(400).json({ message: 'Invalid propertyId' })
    }

    const filter = { propertyId }
    if (!isAdminUser(req.user)) {
      filter.clientId = req.user._id
    } else if (req.query.clientId) {
      if (!isValidObjectId(req.query.clientId)) {
        return res.status(400).json({ message: 'Invalid clientId' })
      }
      filter.clientId = req.query.clientId
    }

    const checklist = await OnboardingChecklist.findOne(filter).populate(POPULATE)
    if (!checklist) return res.status(404).json({ message: 'Onboarding checklist not found' })
    res.json(checklist)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const createChecklist = async (req, res) => {
  try {
    const { propertyId, clientId, projectId, items } = req.body

    if (!propertyId || !isValidObjectId(propertyId)) {
      return res.status(400).json({ message: 'Valid propertyId is required' })
    }
    if (!clientId || !isValidObjectId(clientId)) {
      return res.status(400).json({ message: 'Valid clientId is required' })
    }
    if (!projectId || !isValidObjectId(projectId)) {
      return res.status(400).json({ message: 'Valid projectId is required' })
    }

    const existing = await OnboardingChecklist.findOne({ propertyId, clientId })
    if (existing) {
      return res.status(400).json({ message: 'Checklist already exists for this property and client' })
    }

    const checklist = await OnboardingChecklist.create({
      propertyId,
      clientId,
      projectId,
      items: Array.isArray(items) && items.length ? items : buildDefaultOnboardingItems(),
      status: 'not_started'
    })

    const populated = await OnboardingChecklist.findById(checklist._id).populate(POPULATE)
    res.status(201).json(populated)
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Checklist already exists for this property and client' })
    }
    res.status(500).json({ message: error.message })
  }
}

export const updateChecklist = async (req, res) => {
  try {
    const checklist = await OnboardingChecklist.findById(req.params.id)
    if (!checklist) return res.status(404).json({ message: 'Onboarding checklist not found' })

    const previousStatus = checklist.status
    const { items, status } = req.body

    if (items !== undefined) {
      if (!Array.isArray(items)) {
        return res.status(400).json({ message: 'items must be an array' })
      }
      checklist.items = items
      checklist.status = deriveStatus(items)
    }

    if (status !== undefined && items === undefined) {
      if (!ONBOARDING_STATUSES.includes(status)) {
        return res.status(400).json({
          message: `Invalid status. Allowed: ${ONBOARDING_STATUSES.join(', ')}`
        })
      }
      checklist.status = status
    }

    await checklist.save()

    if (checklist.status === 'completed' && previousStatus !== 'completed') {
      runAutomationEngineAsync('onboarding_completed', {
        onboarding: checklist,
        actor: req.user
      })
    }

    const populated = await OnboardingChecklist.findById(checklist._id).populate(POPULATE)
    res.json(populated)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const completeChecklistItem = async (req, res) => {
  try {
    const checklist = await OnboardingChecklist.findById(req.params.id)
    if (!checklist) return res.status(404).json({ message: 'Onboarding checklist not found' })

    const { key } = req.params
    const item = checklist.items.find((i) => i.key === key)
    if (!item) return res.status(404).json({ message: `Item "${key}" not found` })

    const previousStatus = checklist.status
    const { completed, notes, requiredDocumentId } = req.body

    const markCompleted = completed !== false
    item.completed = markCompleted
    item.completedAt = markCompleted ? new Date() : null
    item.completedBy = markCompleted ? req.user._id : null
    if (notes !== undefined) item.notes = notes
    if (requiredDocumentId !== undefined) {
      if (requiredDocumentId && !isValidObjectId(requiredDocumentId)) {
        return res.status(400).json({ message: 'Invalid requiredDocumentId' })
      }
      item.requiredDocumentId = requiredDocumentId || null
    }

    checklist.status = deriveStatus(checklist.items)
    await checklist.save()

    if (checklist.status === 'completed' && previousStatus !== 'completed') {
      runAutomationEngineAsync('onboarding_completed', {
        onboarding: checklist,
        actor: req.user
      })
    }

    const populated = await OnboardingChecklist.findById(checklist._id).populate(POPULATE)
    res.json(populated)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const deleteChecklist = async (req, res) => {
  try {
    const checklist = await OnboardingChecklist.findById(req.params.id)
    if (!checklist) return res.status(404).json({ message: 'Onboarding checklist not found' })
    await checklist.deleteOne()
    res.json({ message: 'Onboarding checklist deleted' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}
