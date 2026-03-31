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
      ref: 'Property'
    },
    apartment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Apartment'
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
    mediaItems: [mediaItemSchema]
  },
  {
    timestamps: true
  }
)

phaseSchema.index(
  { property: 1, phaseNumber: 1 },
  {
    unique: true,
    partialFilterExpression: { property: { $type: 'objectId' } }
  }
)
phaseSchema.index(
  { apartment: 1, phaseNumber: 1 },
  {
    unique: true,
    partialFilterExpression: { apartment: { $type: 'objectId' } }
  }
)

phaseSchema.pre('validate', function (next) {
  const hasProperty = this.property != null
  const hasApartment = this.apartment != null
  if (hasProperty === hasApartment) {
    next(new Error('Exactly one of property or apartment is required'))
  } else {
    next()
  }
})

const Phase = mongoose.model('Phase', phaseSchema)

export default Phase
