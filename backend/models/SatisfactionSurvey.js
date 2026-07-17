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
      default: null,
      index: true
    },
    apartmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Apartment',
      default: null,
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

satisfactionSurveySchema.pre('validate', function validateUnit(next) {
  if (!this.propertyId && !this.apartmentId) {
    return next(new Error('Either propertyId or apartmentId is required'))
  }
  if (this.propertyId && this.apartmentId) {
    return next(new Error('Provide only one of propertyId or apartmentId'))
  }
  next()
})

satisfactionSurveySchema.index({ projectId: 1, type: 1 })
satisfactionSurveySchema.index({ propertyId: 1, type: 1 })
satisfactionSurveySchema.index({ apartmentId: 1, type: 1 })

const SatisfactionSurvey = mongoose.model('SatisfactionSurvey', satisfactionSurveySchema)

export default SatisfactionSurvey
