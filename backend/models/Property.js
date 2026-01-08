import mongoose from 'mongoose'

const propertySchema = new mongoose.Schema(
  {
    lot: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lot',
      required: [true, 'Lot is required']
    },
    model: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Model',
      required: [true, 'Model is required']
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required']
    },
    price: {
      type: Number,
      required: [true, 'Total price is required'],
      min: 0
    },
    pending: {
      type: Number,
      required: [true, 'Pending amount is required'],
      min: 0
    },
    initialPayment: {
      type: Number,
      default: 0,
      min: 0
    },
    status: {
      type: String,
      enum: ['active', 'pending', 'sold', 'cancelled'],
      default: 'pending'
    },
    saleDate: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
)

propertySchema.virtual('payloads', {
  ref: 'Payload',
  localField: '_id',
  foreignField: 'property'
})

propertySchema.set('toJSON', { virtuals: true })
propertySchema.set('toObject', { virtuals: true })

const Property = mongoose.model('Property', propertySchema)

export default Property
