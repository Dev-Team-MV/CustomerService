import mongoose from 'mongoose'

export const SURVEY_TYPES = ['post_sale', 'post_construction', 'post_warranty', 'annual']

const surveyResponseSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: true,
      trim: true
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: null
    },
    comment: {
      type: String,
      trim: true,
      default: ''
    }
  },
  { _id: false }
)

const satisfactionSurveySchema = new mongoose.Schema(
  {
    propertyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Property',
      required: [true, 'propertyId is required'],
      index: true
    },
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'clientId is required'],
      index: true
    },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'projectId is required'],
      index: true
    },
    type: {
      type: String,
      enum: SURVEY_TYPES,
      required: [true, 'type is required'],
      index: true
    },
    responses: {
      type: [surveyResponseSchema],
      default: []
    },
    overallRating: {
      type: Number,
      min: 1,
      max: 5,
      default: null
    },
    npsScore: {
      type: Number,
      min: 0,
      max: 10,
      default: null
    }
  },
  {
    timestamps: true
  }
)

satisfactionSurveySchema.index({ projectId: 1, type: 1 })
satisfactionSurveySchema.index({ propertyId: 1, type: 1 })

const SatisfactionSurvey = mongoose.model('SatisfactionSurvey', satisfactionSurveySchema)

export default SatisfactionSurvey
