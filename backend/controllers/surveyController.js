import mongoose from 'mongoose'
import SatisfactionSurvey, { SURVEY_TYPES } from '../models/SatisfactionSurvey.js'
import SurveyTemplate from '../models/SurveyTemplate.js'
import { isStaffRole } from '../utils/roles.js'
import { isValidObjectId } from '../utils/crmHelpers.js'

const POPULATE = [
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

function validateRatingValue(value, field, min, max) {
  if (value == null) return { value: null }
  const num = Number(value)
  if (!Number.isFinite(num) || num < min || num > max) {
    return { error: `${field} must be between ${min} and ${max}` }
  }
  return { value: num }
}

function questionSnapshot(question) {
  return question.text_es?.trim() || question.text_en?.trim() || question.key
}

/** Builds responses from a template + user answers keyed by questionKey */
function buildTemplateResponses(template, answers = []) {
  const answerMap = new Map()
  for (const answer of Array.isArray(answers) ? answers : []) {
    const key = answer.questionKey ?? answer.key
    if (key != null) answerMap.set(String(key), answer)
  }

  const responses = []
  for (const question of template.questions) {
    const answer = answerMap.get(String(question.key))
    const rating = validateRatingValue(answer?.rating, `rating (${question.key})`, 1, 5)
    if (rating.error) return { error: rating.error }
    responses.push({
      questionKey: question.key,
      question: questionSnapshot(question),
      rating: rating.value,
      comment: typeof answer?.comment === 'string' ? answer.comment.trim() : ''
    })
  }
  return { responses }
}

// ─── Survey template CRUD (questions managed by admin) ──────────────────────

export const getSurveyTemplates = async (req, res) => {
  try {
    const filter = {}
    if (req.query.projectId) {
      if (!isValidObjectId(req.query.projectId)) {
        return res.status(400).json({ message: 'Invalid projectId' })
      }
      filter.projectId = req.query.projectId
    }
    if (req.query.type) {
      if (!SURVEY_TYPES.includes(req.query.type)) {
        return res.status(400).json({
          message: `Invalid type. Allowed: ${SURVEY_TYPES.join(', ')}`
        })
      }
      filter.type = req.query.type
    }
    if (req.query.isActive !== undefined) {
      filter.isActive = req.query.isActive === 'true'
    }

    // Non-admin users only see active templates (to answer them)
    if (!isAdminUser(req.user)) {
      filter.isActive = true
    }

    const templates = await SurveyTemplate.find(filter)
      .populate('projectId', 'name slug title')
      .sort({ createdAt: -1 })
    res.json(templates)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const getSurveyTemplateById = async (req, res) => {
  try {
    const template = await SurveyTemplate.findById(req.params.id).populate(
      'projectId',
      'name slug title'
    )
    if (!template) return res.status(404).json({ message: 'Survey template not found' })

    if (!isAdminUser(req.user) && !template.isActive) {
      return res.status(403).json({ message: 'Template is not active' })
    }

    res.json(template)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

function normalizeQuestions(questions) {
  if (!Array.isArray(questions) || questions.length === 0) {
    return { error: 'questions must be a non-empty array' }
  }
  const normalized = questions.map((q, index) => ({
    key: q.key?.trim() || `q${index + 1}`,
    text_en: q.text_en?.trim() || '',
    text_es: q.text_es?.trim() || ''
  }))
  return { questions: normalized }
}

export const createSurveyTemplate = async (req, res) => {
  try {
    const { projectId, type, name, questions, isActive } = req.body

    if (!projectId || !isValidObjectId(projectId)) {
      return res.status(400).json({ message: 'Valid projectId is required' })
    }
    if (!type || !SURVEY_TYPES.includes(type)) {
      return res.status(400).json({
        message: `Valid type is required. Allowed: ${SURVEY_TYPES.join(', ')}`
      })
    }
    if (!name?.trim()) {
      return res.status(400).json({ message: 'name is required' })
    }

    const normalized = normalizeQuestions(questions)
    if (normalized.error) {
      return res.status(400).json({ message: normalized.error })
    }

    const template = await SurveyTemplate.create({
      projectId,
      type,
      name: name.trim(),
      questions: normalized.questions,
      isActive: isActive !== undefined ? Boolean(isActive) : true,
      createdBy: req.user._id
    })

    res.status(201).json(template)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const updateSurveyTemplate = async (req, res) => {
  try {
    const template = await SurveyTemplate.findById(req.params.id)
    if (!template) return res.status(404).json({ message: 'Survey template not found' })

    const { name, type, questions, isActive } = req.body

    if (name !== undefined) template.name = name.trim()
    if (type !== undefined) {
      if (!SURVEY_TYPES.includes(type)) {
        return res.status(400).json({
          message: `Invalid type. Allowed: ${SURVEY_TYPES.join(', ')}`
        })
      }
      template.type = type
    }
    if (questions !== undefined) {
      const normalized = normalizeQuestions(questions)
      if (normalized.error) {
        return res.status(400).json({ message: normalized.error })
      }
      template.questions = normalized.questions
    }
    if (isActive !== undefined) template.isActive = Boolean(isActive)

    const updated = await template.save()
    res.json(updated)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const deleteSurveyTemplate = async (req, res) => {
  try {
    const template = await SurveyTemplate.findById(req.params.id)
    if (!template) return res.status(404).json({ message: 'Survey template not found' })
    await template.deleteOne()
    res.json({ message: 'Survey template deleted' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// ─── Survey responses ────────────────────────────────────────────────────────

export const getSurveys = async (req, res) => {
  try {
    const filter = {}
    for (const key of ['projectId', 'propertyId', 'apartmentId', 'clientId', 'templateId']) {
      if (req.query[key]) {
        if (!isValidObjectId(req.query[key])) {
          return res.status(400).json({ message: `Invalid ${key}` })
        }
        filter[key] = req.query[key]
      }
    }
    if (req.query.type) {
      if (!SURVEY_TYPES.includes(req.query.type)) {
        return res.status(400).json({
          message: `Invalid type. Allowed: ${SURVEY_TYPES.join(', ')}`
        })
      }
      filter.type = req.query.type
    }

    if (!isAdminUser(req.user)) {
      filter.clientId = req.user._id
    }

    const surveys = await SatisfactionSurvey.find(filter)
      .populate(POPULATE)
      .sort({ createdAt: -1 })
    res.json(surveys)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const getSurveyById = async (req, res) => {
  try {
    const survey = await SatisfactionSurvey.findById(req.params.id).populate(POPULATE)
    if (!survey) return res.status(404).json({ message: 'Survey not found' })

    if (
      !isAdminUser(req.user) &&
      String(survey.clientId._id || survey.clientId) !== String(req.user._id)
    ) {
      return res.status(403).json({ message: 'Not authorized to view this survey' })
    }

    res.json(survey)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const createSurvey = async (req, res) => {
  try {
    const {
      propertyId,
      apartmentId,
      clientId,
      projectId,
      templateId,
      type,
      responses,
      overallRating,
      npsScore
    } = req.body

    const admin = isAdminUser(req.user)

    const unit = resolveUnitRefs({ propertyId, apartmentId })
    if (unit.error) {
      return res.status(400).json({ message: unit.error })
    }

    const resolvedClientId = admin && clientId ? clientId : req.user._id
    if (!isValidObjectId(resolvedClientId)) {
      return res.status(400).json({ message: 'Invalid clientId' })
    }

    const overall = validateRatingValue(overallRating, 'overallRating', 1, 5)
    if (overall.error) return res.status(400).json({ message: overall.error })
    const nps = validateRatingValue(npsScore, 'npsScore', 0, 10)
    if (nps.error) return res.status(400).json({ message: nps.error })

    // Users must answer an admin-defined template; free-form is admin-only
    if (!admin && !templateId) {
      return res.status(400).json({
        message: 'templateId is required. Surveys are answered from an admin-defined template'
      })
    }

    let template = null
    if (templateId) {
      if (!isValidObjectId(templateId)) {
        return res.status(400).json({ message: 'Invalid templateId' })
      }
      template = await SurveyTemplate.findById(templateId)
      if (!template) return res.status(404).json({ message: 'Survey template not found' })
      if (!template.isActive) {
        return res.status(400).json({ message: 'Survey template is not active' })
      }
      if (projectId && String(template.projectId) !== String(projectId)) {
        return res.status(400).json({ message: 'Template does not belong to this project' })
      }
    }

    const resolvedProjectId = template ? template.projectId : projectId
    if (!resolvedProjectId || !isValidObjectId(String(resolvedProjectId))) {
      return res.status(400).json({ message: 'Valid projectId is required' })
    }

    const resolvedType = template ? template.type : type
    if (!resolvedType || !SURVEY_TYPES.includes(resolvedType)) {
      return res.status(400).json({
        message: `Valid type is required. Allowed: ${SURVEY_TYPES.join(', ')}`
      })
    }

    let finalResponses = []
    if (template) {
      // One response per client + template + unit
      const duplicateFilter = {
        clientId: resolvedClientId,
        templateId: template._id,
        ...(unit.propertyId
          ? { propertyId: unit.propertyId }
          : { apartmentId: unit.apartmentId })
      }
      const existing = await SatisfactionSurvey.findOne(duplicateFilter)
      if (existing) {
        return res.status(400).json({
          message: 'This survey has already been answered for this unit'
        })
      }

      const built = buildTemplateResponses(template, responses)
      if (built.error) return res.status(400).json({ message: built.error })
      finalResponses = built.responses
    } else {
      finalResponses = Array.isArray(responses) ? responses : []
    }

    const survey = await SatisfactionSurvey.create({
      propertyId: unit.propertyId,
      apartmentId: unit.apartmentId,
      clientId: resolvedClientId,
      projectId: resolvedProjectId,
      templateId: template ? template._id : null,
      type: resolvedType,
      responses: finalResponses,
      overallRating: overall.value,
      npsScore: nps.value
    })

    const populated = await SatisfactionSurvey.findById(survey._id).populate(POPULATE)
    res.status(201).json(populated)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const updateSurvey = async (req, res) => {
  try {
    const survey = await SatisfactionSurvey.findById(req.params.id)
    if (!survey) return res.status(404).json({ message: 'Survey not found' })

    const admin = isAdminUser(req.user)

    if (!admin && String(survey.clientId) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Not authorized to update this survey' })
    }

    const { type, responses, overallRating, npsScore } = req.body

    if (type !== undefined) {
      if (!admin) {
        return res.status(403).json({ message: 'Only admins can change the survey type' })
      }
      if (!SURVEY_TYPES.includes(type)) {
        return res.status(400).json({
          message: `Invalid type. Allowed: ${SURVEY_TYPES.join(', ')}`
        })
      }
      survey.type = type
    }

    if (responses !== undefined) {
      if (!Array.isArray(responses)) {
        return res.status(400).json({ message: 'responses must be an array' })
      }

      if (admin) {
        survey.responses = responses
      } else if (survey.templateId) {
        // Users can only update rating/comment on existing template questions
        const answerMap = new Map()
        for (const answer of responses) {
          const key = answer.questionKey ?? answer.key
          if (key != null) answerMap.set(String(key), answer)
        }
        for (const item of survey.responses) {
          const answer = item.questionKey ? answerMap.get(String(item.questionKey)) : null
          if (!answer) continue
          const rating = validateRatingValue(
            answer.rating,
            `rating (${item.questionKey})`,
            1,
            5
          )
          if (rating.error) return res.status(400).json({ message: rating.error })
          if (answer.rating !== undefined) item.rating = rating.value
          if (typeof answer.comment === 'string') item.comment = answer.comment.trim()
        }
        survey.markModified('responses')
      } else {
        // Legacy free-form survey without template
        survey.responses = responses
      }
    }

    if (overallRating !== undefined) {
      const overall = validateRatingValue(overallRating, 'overallRating', 1, 5)
      if (overall.error) return res.status(400).json({ message: overall.error })
      survey.overallRating = overall.value
    }
    if (npsScore !== undefined) {
      const nps = validateRatingValue(npsScore, 'npsScore', 0, 10)
      if (nps.error) return res.status(400).json({ message: nps.error })
      survey.npsScore = nps.value
    }

    await survey.save()
    const populated = await SatisfactionSurvey.findById(survey._id).populate(POPULATE)
    res.json(populated)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const deleteSurvey = async (req, res) => {
  try {
    const survey = await SatisfactionSurvey.findById(req.params.id)
    if (!survey) return res.status(404).json({ message: 'Survey not found' })
    await survey.deleteOne()
    res.json({ message: 'Survey deleted' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const getSurveyStats = async (req, res) => {
  try {
    const { projectId } = req.params
    if (!isValidObjectId(projectId)) {
      return res.status(400).json({ message: 'Invalid projectId' })
    }

    const match = {
      projectId: new mongoose.Types.ObjectId(projectId)
    }
    if (req.query.type) {
      if (!SURVEY_TYPES.includes(req.query.type)) {
        return res.status(400).json({
          message: `Invalid type. Allowed: ${SURVEY_TYPES.join(', ')}`
        })
      }
      match.type = req.query.type
    }
    if (req.query.templateId) {
      if (!isValidObjectId(req.query.templateId)) {
        return res.status(400).json({ message: 'Invalid templateId' })
      }
      match.templateId = new mongoose.Types.ObjectId(req.query.templateId)
    }

    const [byType, summary, byQuestion] = await Promise.all([
      SatisfactionSurvey.aggregate([
        { $match: match },
        {
          $group: {
            _id: '$type',
            count: { $sum: 1 },
            avgOverallRating: { $avg: '$overallRating' },
            avgNps: { $avg: '$npsScore' }
          }
        }
      ]),
      SatisfactionSurvey.aggregate([
        { $match: match },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            avgOverallRating: { $avg: '$overallRating' },
            avgNps: { $avg: '$npsScore' }
          }
        }
      ]),
      SatisfactionSurvey.aggregate([
        { $match: match },
        { $unwind: '$responses' },
        { $match: { 'responses.rating': { $ne: null } } },
        {
          $group: {
            _id: {
              questionKey: '$responses.questionKey',
              question: '$responses.question'
            },
            count: { $sum: 1 },
            avgRating: { $avg: '$responses.rating' }
          }
        },
        { $sort: { '_id.questionKey': 1 } }
      ])
    ])

    res.json({
      projectId,
      total: summary[0]?.total || 0,
      avgOverallRating: summary[0]?.avgOverallRating ?? null,
      avgNps: summary[0]?.avgNps ?? null,
      byType: byType.map((row) => ({
        type: row._id,
        count: row.count,
        avgOverallRating: row.avgOverallRating ?? null,
        avgNps: row.avgNps ?? null
      })),
      byQuestion: byQuestion.map((row) => ({
        questionKey: row._id.questionKey,
        question: row._id.question,
        count: row.count,
        avgRating: row.avgRating ?? null
      }))
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}
