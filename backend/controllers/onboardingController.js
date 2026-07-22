import OnboardingChecklist, {
  ONBOARDING_STATUSES,
  buildDefaultOnboardingItems
} from '../models/OnboardingChecklist.js'
import SatisfactionSurvey from '../models/SatisfactionSurvey.js'
import SurveyTemplate from '../models/SurveyTemplate.js'
import { isStaffRole } from '../utils/roles.js'
import { isValidObjectId } from '../utils/crmHelpers.js'
import { runAutomationEngineAsync } from '../services/automationEngine.js'

const POPULATE = [
  { path: 'propertyId', select: 'price status lot model' },
  { path: 'apartmentId', select: 'apartmentNumber floorNumber building status' },
  { path: 'clientId', select: 'firstName lastName email phoneNumber' },
  { path: 'projectId', select: 'name slug title' },
  { path: 'items.completedBy', select: 'firstName lastName email' },
  { path: 'items.requiredDocumentId', select: 'title category fileUrl' }
]

const SURVEY_POPULATE = [
  { path: 'propertyId', select: 'price status lot model' },
  { path: 'apartmentId', select: 'apartmentNumber floorNumber building status' },
  { path: 'clientId', select: 'firstName lastName email phoneNumber' },
  { path: 'projectId', select: 'name slug title' },
  { path: 'templateId', select: 'name type questions isActive' }
]

function isAdminUser(user) {
  return isStaffRole(user?.role)
}

function resolveUnitRefs({ propertyId, apartmentId }) {
  const hasProperty = propertyId != null && propertyId !== ''
  const hasApartment = apartmentId != null && apartmentId !== ''

  if (!hasProperty && !hasApartment) {
    return { error: 'Either propertyId or apartmentId is required' }
  }
  if (hasProperty && hasApartment) {
    return { error: 'Provide only one of propertyId or apartmentId' }
  }
  if (hasProperty && !isValidObjectId(propertyId)) {
    return { error: 'Invalid propertyId' }
  }
  if (hasApartment && !isValidObjectId(apartmentId)) {
    return { error: 'Invalid apartmentId' }
  }
  return {
    propertyId: hasProperty ? propertyId : null,
    apartmentId: hasApartment ? apartmentId : null
  }
}

function deriveStatus(items = []) {
  if (!items.length) return 'not_started'
  const completedCount = items.filter((i) => i.completed).length
  if (completedCount === 0) return 'not_started'
  if (completedCount === items.length) return 'completed'
  return 'in_progress'
}

function questionSnapshot(question) {
  return question.text_es?.trim() || question.text_en?.trim() || question.key
}

/**
 * Assigns the project's active post_sale survey template to the client+unit.
 * Creates a pending SatisfactionSurvey (empty ratings) the client can complete via PUT.
 * Does not fail onboarding if no template exists.
 */
async function assignPostSaleSurvey({ propertyId, apartmentId, clientId, projectId }) {
  const template = await SurveyTemplate.findOne({
    projectId,
    type: 'post_sale',
    isActive: true
  }).sort({ createdAt: -1 })

  if (!template) {
    return {
      survey: null,
      skipped: 'No active post_sale survey template for this project'
    }
  }

  const unitFilter = propertyId
    ? { propertyId }
    : { apartmentId }

  const existing = await SatisfactionSurvey.findOne({
    clientId,
    templateId: template._id,
    ...unitFilter
  })
  if (existing) {
    const populated = await SatisfactionSurvey.findById(existing._id).populate(SURVEY_POPULATE)
    return { survey: populated, alreadyExisted: true }
  }

  const responses = (template.questions || []).map((q) => ({
    questionKey: q.key,
    question: questionSnapshot(q),
    rating: null,
    comment: ''
  }))

  const survey = await SatisfactionSurvey.create({
    propertyId: propertyId || null,
    apartmentId: apartmentId || null,
    clientId,
    projectId,
    templateId: template._id,
    type: 'post_sale',
    responses,
    overallRating: null,
    npsScore: null
  })

  const populated = await SatisfactionSurvey.findById(survey._id).populate(SURVEY_POPULATE)
  return { survey: populated, alreadyExisted: false }
}

export const getChecklists = async (req, res) => {
  try {
    const filter = {}
    for (const key of ['projectId', 'propertyId', 'apartmentId', 'clientId']) {
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

export const getChecklistByApartment = async (req, res) => {
  try {
    const { apartmentId } = req.params
    if (!isValidObjectId(apartmentId)) {
      return res.status(400).json({ message: 'Invalid apartmentId' })
    }

    const filter = { apartmentId }
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
    const { propertyId, apartmentId, clientId, projectId, items } = req.body

    const unit = resolveUnitRefs({ propertyId, apartmentId })
    if (unit.error) {
      return res.status(400).json({ message: unit.error })
    }
    if (!clientId || !isValidObjectId(clientId)) {
      return res.status(400).json({ message: 'Valid clientId is required' })
    }
    if (!projectId || !isValidObjectId(projectId)) {
      return res.status(400).json({ message: 'Valid projectId is required' })
    }

    const unitFilter = unit.propertyId
      ? { propertyId: unit.propertyId }
      : { apartmentId: unit.apartmentId }
    const existing = await OnboardingChecklist.findOne({ ...unitFilter, clientId })
    if (existing) {
      return res.status(400).json({ message: 'Checklist already exists for this unit and client' })
    }

    const checklist = await OnboardingChecklist.create({
      propertyId: unit.propertyId,
      apartmentId: unit.apartmentId,
      clientId,
      projectId,
      items: Array.isArray(items) && items.length ? items : buildDefaultOnboardingItems(),
      status: 'not_started'
    })

    const populated = await OnboardingChecklist.findById(checklist._id).populate(POPULATE)

    // First post-sale satisfaction survey for this unit+client (same propertyId/apartmentId)
    let postSaleSurvey = null
    let postSaleSurveyNote = null
    try {
      const assigned = await assignPostSaleSurvey({
        propertyId: unit.propertyId,
        apartmentId: unit.apartmentId,
        clientId,
        projectId
      })
      postSaleSurvey = assigned.survey
      if (assigned.skipped) postSaleSurveyNote = assigned.skipped
      else if (assigned.alreadyExisted) {
        postSaleSurveyNote = 'post_sale survey already existed for this unit and client'
      }
    } catch (surveyError) {
      console.error('Auto-assign post_sale survey on onboarding create failed:', surveyError.message)
      postSaleSurveyNote = `Failed to assign post_sale survey: ${surveyError.message}`
    }

    const payload = populated.toObject()
    payload.postSaleSurvey = postSaleSurvey
    if (postSaleSurveyNote) payload.postSaleSurveyNote = postSaleSurveyNote

    res.status(201).json(payload)
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Checklist already exists for this unit and client' })
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
