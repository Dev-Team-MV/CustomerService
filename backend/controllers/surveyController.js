import mongoose from 'mongoose'
import SatisfactionSurvey, { SURVEY_TYPES } from '../models/SatisfactionSurvey.js'
import { isStaffRole } from '../utils/roles.js'
import { isValidObjectId } from '../utils/crmHelpers.js'

const POPULATE = [
  { path: 'propertyId', select: 'price status lot model' },
  { path: 'clientId', select: 'firstName lastName email phoneNumber' },
  { path: 'projectId', select: 'name slug title' }
]

function isAdminUser(user) {
  return isStaffRole(user?.role)
}

export const getSurveys = async (req, res) => {
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
      clientId,
      projectId,
      type,
      responses,
      overallRating,
      npsScore
    } = req.body

    if (!propertyId || !isValidObjectId(propertyId)) {
      return res.status(400).json({ message: 'Valid propertyId is required' })
    }
    if (!projectId || !isValidObjectId(projectId)) {
      return res.status(400).json({ message: 'Valid projectId is required' })
    }
    if (!type || !SURVEY_TYPES.includes(type)) {
      return res.status(400).json({
        message: `Valid type is required. Allowed: ${SURVEY_TYPES.join(', ')}`
      })
    }

    const resolvedClientId =
      isAdminUser(req.user) && clientId ? clientId : req.user._id

    if (!isValidObjectId(resolvedClientId)) {
      return res.status(400).json({ message: 'Invalid clientId' })
    }

    if (overallRating != null) {
      const rating = Number(overallRating)
      if (rating < 1 || rating > 5) {
        return res.status(400).json({ message: 'overallRating must be between 1 and 5' })
      }
    }
    if (npsScore != null) {
      const nps = Number(npsScore)
      if (nps < 0 || nps > 10) {
        return res.status(400).json({ message: 'npsScore must be between 0 and 10' })
      }
    }

    const survey = await SatisfactionSurvey.create({
      propertyId,
      clientId: resolvedClientId,
      projectId,
      type,
      responses: Array.isArray(responses) ? responses : [],
      overallRating: overallRating != null ? Number(overallRating) : null,
      npsScore: npsScore != null ? Number(npsScore) : null
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

    if (
      !isAdminUser(req.user) &&
      String(survey.clientId) !== String(req.user._id)
    ) {
      return res.status(403).json({ message: 'Not authorized to update this survey' })
    }

    const { type, responses, overallRating, npsScore } = req.body

    if (type !== undefined) {
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
      survey.responses = responses
    }
    if (overallRating !== undefined) {
      if (overallRating == null) {
        survey.overallRating = null
      } else {
        const rating = Number(overallRating)
        if (rating < 1 || rating > 5) {
          return res.status(400).json({ message: 'overallRating must be between 1 and 5' })
        }
        survey.overallRating = rating
      }
    }
    if (npsScore !== undefined) {
      if (npsScore == null) {
        survey.npsScore = null
      } else {
        const nps = Number(npsScore)
        if (nps < 0 || nps > 10) {
          return res.status(400).json({ message: 'npsScore must be between 0 and 10' })
        }
        survey.npsScore = nps
      }
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

    const [byType, summary] = await Promise.all([
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
      }))
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}
