import mongoose from 'mongoose'

const smsTemplateSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Template name is required'],
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    category: {
      type: String,
      trim: true,
      default: 'general'
    },
    template: {
      type: String,
      required: [true, 'Template content is required'],
      trim: true,
      maxlength: [1600, 'Template cannot exceed 1600 characters']
    },
    placeholders: {
      type: [String],
      default: []
    },
    isActive: {
      type: Boolean,
      default: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  {
    timestamps: true
  }
)

const SMSTemplate = mongoose.model('SMSTemplate', smsTemplateSchema)

export default SMSTemplate
