import mongoose from 'mongoose'

export const CAMPAIGN_STATUSES = [
  'borrador',
  'programada',
  'enviando',
  'completada',
  'fallida'
]

export const CAMPAIGN_AUDIENCE_TYPES = ['clients', 'leads']

const recipientSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    leadId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lead'
    },
    phone: {
      type: String,
      required: true,
      trim: true
    },
    status: {
      type: String,
      enum: ['pending', 'sent', 'failed'],
      default: 'pending'
    },
    sentAt: {
      type: Date
    },
    error: {
      type: String,
      trim: true
    }
  },
  { _id: true }
)

const campaignSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Campaign name is required'],
      trim: true
    },
    templateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SMSTemplate',
      required: [true, 'SMS template is required']
    },
    audience: {
      type: {
        type: String,
        enum: CAMPAIGN_AUDIENCE_TYPES,
        required: true
      },
      projectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project'
      },
      stage: {
        type: String,
        trim: true
      },
      filters: {
        type: mongoose.Schema.Types.Mixed,
        default: () => ({})
      }
    },
    status: {
      type: String,
      enum: CAMPAIGN_STATUSES,
      default: 'borrador'
    },
    scheduledAt: {
      type: Date
    },
    sentAt: {
      type: Date
    },
    stats: {
      total: { type: Number, default: 0 },
      sent: { type: Number, default: 0 },
      failed: { type: Number, default: 0 }
    },
    recipients: {
      type: [recipientSchema],
      default: []
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  {
    timestamps: true
  }
)

campaignSchema.index({ status: 1, createdAt: -1 })
campaignSchema.index({ 'audience.projectId': 1 })

const Campaign = mongoose.model('Campaign', campaignSchema)

export default Campaign
