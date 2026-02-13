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
      required: [true, 'Property is required'],
      unique: true
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

const Contract = mongoose.model('Contract', contractSchema)

export default Contract
