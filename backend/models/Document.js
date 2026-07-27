import mongoose from 'mongoose'

export const DOCUMENT_CATEGORIES = [
  'contract',
  'id_document',
  'deed',
  'appraisal',
  'receipt',
  'insurance',
  'permit',
  'blueprint',
  'other'
]

const documentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true
    },
    description: {
      type: String,
      trim: true,
      default: ''
    },
    category: {
      type: String,
      enum: DOCUMENT_CATEGORIES,
      required: true,
      index: true
    },
    fileUrl: {
      type: String,
      required: [true, 'File URL is required'],
      trim: true
    },
    thumbnailUrl: {
      type: String,
      trim: true,
      default: null
    },
    mimeType: {
      type: String,
      trim: true,
      default: ''
    },
    fileSize: {
      type: Number,
      min: 0,
      default: 0
    },
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
      default: null,
      index: true
    },
    leadId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lead',
      default: null,
      index: true
    },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
      index: true
    },
    tags: {
      type: [String],
      default: [],
      index: true
    },
    version: {
      type: Number,
      default: 1,
      min: 1
    },
    previousVersion: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Document',
      default: null
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    expiresAt: {
      type: Date,
      default: null,
      index: true
    },
    isArchived: {
      type: Boolean,
      default: false,
      index: true
    },
    gcsFileName: {
      type: String,
      trim: true,
      default: null
    }
  },
  { timestamps: true }
)

documentSchema.index({ title: 'text', tags: 'text' })
documentSchema.index({ projectId: 1, category: 1, isArchived: 1 })
documentSchema.index({ expiresAt: 1, isArchived: 1, category: 1 })

export default mongoose.model('Document', documentSchema)
