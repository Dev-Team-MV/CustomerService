import mongoose from 'mongoose'
import { SURVEY_TYPES } from './SatisfactionSurvey.js'

const templateQuestionSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      trim: true
    },
    text_en: {
      type: String,
      trim: true,
      default: ''
    },
    text_es: {
      type: String,
      trim: true,
      default: ''
    }
  },
  { _id: false }
)

const surveyTemplateSchema = new mongoose.Schema(
  {
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
    name: {
      type: String,
      required: [true, 'name is required'],
      trim: true
    },
    questions: {
      type: [templateQuestionSchema],
      default: []
    },
    isActive: {
      type: Boolean,
      default: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    }
  },
  {
    timestamps: true
  }
)

surveyTemplateSchema.pre('validate', function validateQuestions(next) {
  if (!Array.isArray(this.questions) || this.questions.length === 0) {
    return next(new Error('At least one question is required'))
  }
  const keys = this.questions.map((q) => q.key)
  if (new Set(keys).size !== keys.length) {
    return next(new Error('Question keys must be unique'))
  }
  for (const q of this.questions) {
    if (!q.text_en?.trim() && !q.text_es?.trim()) {
      return next(new Error(`Question "${q.key}" must have text_en or text_es`))
    }
  }
  next()
})

surveyTemplateSchema.index({ projectId: 1, type: 1, isActive: 1 })

const SurveyTemplate = mongoose.model('SurveyTemplate', surveyTemplateSchema)

export default SurveyTemplate
