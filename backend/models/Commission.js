import mongoose from 'mongoose'

export const COMMISSION_STATUSES = ['pending', 'approved', 'paid', 'disputed']

const splitSchema = new mongoose.Schema(
  {
    agentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    percentage: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },
    amount: {
      type: Number,
      required: true,
      min: 0
    }
  },
  { _id: false }
)

const commissionSchema = new mongoose.Schema(
  {
    propertyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Property',
      default: null,
      index: true
    },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
      index: true
    },
    agentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    leadId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lead',
      default: null,
      index: true
    },
    saleAmount: {
      type: Number,
      required: true,
      min: 0
    },
    commissionRate: {
      type: Number,
      required: true,
      min: 0
    },
    commissionAmount: {
      type: Number,
      required: true,
      min: 0
    },
    bonusAmount: {
      type: Number,
      default: 0,
      min: 0
    },
    splitWith: {
      type: [splitSchema],
      default: []
    },
    status: {
      type: String,
      enum: COMMISSION_STATUSES,
      default: 'pending',
      index: true
    },
    paidAt: {
      type: Date,
      default: null
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    structureId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CommissionStructure',
      default: null
    },
    notes: {
      type: String,
      trim: true,
      default: ''
    }
  },
  { timestamps: true }
)

commissionSchema.index({ agentId: 1, status: 1, createdAt: -1 })
commissionSchema.index({ projectId: 1, status: 1, createdAt: -1 })
commissionSchema.index({ leadId: 1 }, { sparse: true })

export default mongoose.model('Commission', commissionSchema)
