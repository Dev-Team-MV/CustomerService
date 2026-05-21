import mongoose from 'mongoose'

const mediaItemSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      enum: ['image', 'video']
    },
    url: { type: String, required: true, trim: true },
    name: { type: String, trim: true, default: '' },
    order: { type: Number, required: true, min: 1 },
    isPublic: { type: Boolean, default: true }
  },
  { _id: false }
)

const eagleViewSchema = new mongoose.Schema(
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
    date: {
      type: Date,
      required: [true, 'Date is required']
    },
    media: {
      type: [mediaItemSchema],
      default: []
    }
  },
  {
    timestamps: true
  }
)

eagleViewSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id?.toString()
    delete ret._id
    delete ret.__v
    return ret
  }
})

eagleViewSchema.virtual('id').get(function () {
  return this._id?.toString()
})

const EagleView = mongoose.model('EagleView', eagleViewSchema)

export default EagleView
