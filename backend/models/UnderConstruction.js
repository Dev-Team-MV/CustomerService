import mongoose from 'mongoose'

const mediaItemSchema = new mongoose.Schema(
  {
    url: { type: String, required: true, trim: true },
    name: { type: String, trim: true, default: '' },
    order: { type: Number, required: true, min: 1 }
  },
  { _id: false }
)

const underConstructionSchema = new mongoose.Schema(
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
    images: {
      type: [mediaItemSchema],
      default: []
    },
    videos: {
      type: [mediaItemSchema],
      default: []
    }
  },
  {
    timestamps: true
  }
)

underConstructionSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id?.toString()
    delete ret._id
    delete ret.__v
    return ret
  }
})

underConstructionSchema.virtual('id').get(function () {
  return this._id?.toString()
})

const UnderConstruction = mongoose.model('UnderConstruction', underConstructionSchema)

export default UnderConstruction
