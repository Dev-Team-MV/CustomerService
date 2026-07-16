import mongoose from 'mongoose'

export const WARRANTY_CATEGORIES = [
  'structural',
  'plumbing',
  'electrical',
  'finish',
  'appliance',
  'landscaping',
  'other'
]

export const WARRANTY_PRIORITIES = ['low', 'medium', 'high', 'emergency']

export const WARRANTY_STATUSES = [
  'submitted',
  'under_review',
  'approved',
  'in_progress',
  'resolved',
  'rejected'
]

const warrantyClaimSchema = new mongoose.Schema(
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
    category: {
      type: String,
      enum: WARRANTY_CATEGORIES,
      required: [true, 'category is required']
    },
    description: {
      type: String,
      required: [true, 'description is required'],
      trim: true
    },
    photoUrls: {
      type: [String],
      default: []
    },
    priority: {
      type: String,
      enum: WARRANTY_PRIORITIES,
      default: 'medium'
    },
    status: {
      type: String,
      enum: WARRANTY_STATUSES,
      default: 'submitted',
      index: true
    },
    assignedContractor: {
      type: String,
      trim: true,
      default: ''
    },
    resolution: {
      type: String,
      trim: true,
      default: ''
    },
    resolvedAt: {
      type: Date,
      default: null
    },
    satisfactionRating: {
      type: Number,
      min: 1,
      max: 5,
      default: null
    }
  },
  {
    timestamps: true
  }
)

warrantyClaimSchema.index({ projectId: 1, status: 1 })
warrantyClaimSchema.index({ propertyId: 1, createdAt: -1 })

const WarrantyClaim = mongoose.model('WarrantyClaim', warrantyClaimSchema)

export default WarrantyClaim
