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
      ref: 'Property',
      unique: true,
      sparse: true
    },
    apartment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Apartment',
      unique: true,
      sparse: true
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

const Contract = mongoose.model('Contract', contractSchema)

export default Contract
