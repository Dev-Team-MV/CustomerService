import mongoose from 'mongoose'

const lotSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'Project is required']
    },
    number: {
      type: String,
      required: [true, 'Lot number is required'],
      trim: true
    },
    color: {
      type: String,
      trim: true
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: 0
    },
    model: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Model',
      required: false
    },
    status: {
      type: String,
      enum: ['available', 'pending', 'sold'],
      default: 'available'
    },
    assignedUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  {
    timestamps: true
  }
)

lotSchema.index({ project: 1, number: 1 }, { unique: true })
lotSchema.index({ project: 1 })
lotSchema.index({ project: 1, status: 1 })

const Lot = mongoose.model('Lot', lotSchema)

export default Lot
