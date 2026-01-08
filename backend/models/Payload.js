import mongoose from 'mongoose'

const payloadSchema = new mongoose.Schema(
  {
    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Property',
      required: [true, 'Property is required']
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
    status: {
      type: String,
      enum: ['pending', 'cleared', 'rejected'],
      default: 'pending'
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

const Payload = mongoose.model('Payload', payloadSchema)

export default Payload
