import mongoose from 'mongoose'

const contractItemSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      enum: ['promissoryNote', 'purchaseContract', 'agreement']
    },
    fileUrl: {
      type: String,
      required: [true, 'File URL is required'],
      trim: true
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  },
  { _id: true }
)

const contractSchema = new mongoose.Schema(
  {
    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Property'
    },
    apartment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Apartment'
    },
    contracts: {
      type: [contractItemSchema],
      default: []
    }
  },
  {
    timestamps: true
  }
)

contractSchema.pre('validate', function (next) {
  const hasProperty = this.property != null
  const hasApartment = this.apartment != null
  if (hasProperty === hasApartment) {
    next(new Error('Exactly one of property or apartment is required'))
  } else {
    next()
  }
})

// Enforce uniqueness only when the link field exists and is not null.
contractSchema.index(
  { property: 1 },
  { unique: true, partialFilterExpression: { property: { $exists: true, $ne: null } } }
)
contractSchema.index(
  { apartment: 1 },
  { unique: true, partialFilterExpression: { apartment: { $exists: true, $ne: null } } }
)

const Contract = mongoose.model('Contract', contractSchema)

export default Contract
