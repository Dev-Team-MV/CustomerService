import mongoose from 'mongoose'

const payloadSchema = new mongoose.Schema(
  {
    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Property'
    },
    apartment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Apartment'
    },
    date: {
      type: Date,
      required: [true, 'Payment date is required'],
      default: Date.now
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: 0
    },
    support: {
      type: String,
      trim: true
    },
    urls: {
      type: [String],
      default: []
    },
    status: {
      type: String,
      enum: ['pending', 'signed', 'rejected'],
      default: 'pending'
    },
    type: {
      type: String,
      enum: [
        'initial down payment',
        'complementary down payment',
        'monthly payment',
        'additional payment',
        'closing payment'
      ],
      trim: true
    },
    notes: {
      type: String,
      trim: true
    },
    processedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  {
    timestamps: true
  }
)

payloadSchema.pre('validate', function (next) {
  const hasProperty = this.property != null
  const hasApartment = this.apartment != null
  if (hasProperty === hasApartment) {
    next(new Error('Exactly one of property or apartment is required'))
  } else {
    next()
  }
})

payloadSchema.index({ property: 1 })
payloadSchema.index({ apartment: 1 })
payloadSchema.index({ property: 1, date: -1 })
payloadSchema.index({ apartment: 1, date: -1 })
payloadSchema.index({ status: 1, date: -1 })

const Payload = mongoose.model('Payload', payloadSchema)

export default Payload
