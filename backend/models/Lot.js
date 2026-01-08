import mongoose from 'mongoose'

const lotSchema = new mongoose.Schema(
  {
    number: {
      type: String,
      required: [true, 'Lot number is required'],
      unique: true,
      trim: true
    },
    section: {
      type: String,
      trim: true
    },
    size: {
      type: String,
      trim: true
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: 0
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

const Lot = mongoose.model('Lot', lotSchema)

export default Lot
