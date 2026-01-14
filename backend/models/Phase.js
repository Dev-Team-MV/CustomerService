import mongoose from 'mongoose'

const mediaItemSchema = new mongoose.Schema({
  url: {
    type: String,
    required: [true, 'Media URL is required'],
    trim: true
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },
  percentage: {
    type: Number,
    required: [true, 'Percentage is required'],
    min: 0,
    max: 100
  },
  mediaType: {
    type: String,
    enum: ['image', 'video'],
    default: 'image'
  }
}, { _id: true })

const phaseSchema = new mongoose.Schema(
  {
    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Property',
      required: [true, 'Property is required']
    },
    phaseNumber: {
      type: Number,
      required: [true, 'Phase number is required'],
      min: 1,
      max: 9
    },
    title: {
      type: String,
      trim: true
    },
    constructionPercentage: {
      type: Number,
      required: [true, 'Construction percentage is required'],
      min: 0,
      max: 100
    },
    mediaItems: [mediaItemSchema],
    facades: [{
      type: String,
      trim: true
    }]
  },
  {
    timestamps: true
  }
)

// Ensure unique phase number per property
phaseSchema.index({ property: 1, phaseNumber: 1 }, { unique: true })

const Phase = mongoose.model('Phase', phaseSchema)

export default Phase
