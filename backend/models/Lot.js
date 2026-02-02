import mongoose from 'mongoose'

const lotSchema = new mongoose.Schema(
  {
    tenant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tenant',
      required: [true, 'Tenant is required']
    },
    number: {
      type: String,
      required: [true, 'Lot number is required'],
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

// Número de lote único por tenant
lotSchema.index({ tenant: 1, number: 1 }, { unique: true })

const Lot = mongoose.model('Lot', lotSchema)

export default Lot
