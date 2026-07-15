import mongoose from 'mongoose'

export const COMMISSION_STRUCTURE_TYPES = ['flat', 'percentage', 'tiered']

const tierSchema = new mongoose.Schema(
  {
    minAmount: { type: Number, required: true, min: 0 },
    maxAmount: { type: Number, default: null, min: 0 },
    rate: { type: Number, required: true, min: 0 }
  },
  { _id: false }
)

const bonusRuleSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true },
    /** flat amount or percentage of sale/commission */
    bonusType: {
      type: String,
      enum: ['flat', 'percentage_of_sale', 'percentage_of_commission'],
      default: 'flat'
    },
    value: { type: Number, required: true, min: 0 },
    /** Optional gate: only apply when saleAmount >= this */
    minSaleAmount: { type: Number, min: 0, default: 0 },
    /** Optional gate: only apply when saleAmount <= this (null = no max) */
    maxSaleAmount: { type: Number, min: 0, default: null }
  },
  { _id: false }
)

const commissionStructureSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
      index: true
    },
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true
    },
    type: {
      type: String,
      enum: COMMISSION_STRUCTURE_TYPES,
      required: true
    },
    /** Used when type === 'flat' (fixed commission amount) */
    flatAmount: {
      type: Number,
      min: 0,
      default: 0
    },
    /** Used when type === 'percentage' (percent of sale) */
    percentageRate: {
      type: Number,
      min: 0,
      default: 0
    },
    tiers: {
      type: [tierSchema],
      default: []
    },
    bonusRules: {
      type: [bonusRuleSchema],
      default: []
    },
    isDefault: {
      type: Boolean,
      default: false,
      index: true
    }
  },
  { timestamps: true }
)

commissionStructureSchema.index({ projectId: 1, isDefault: 1 })
commissionStructureSchema.index({ projectId: 1, name: 1 })

export default mongoose.model('CommissionStructure', commissionStructureSchema)
