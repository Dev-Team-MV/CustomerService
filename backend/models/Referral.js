import mongoose from 'mongoose'
import {
  REFERRAL_REWARD_TYPES,
  REFERRAL_DISCOUNT_BASES
} from './ReferralProgram.js'

export const REFERRAL_STATUSES = [
  'pending',
  'contacted',
  'qualified',
  'converted',
  'reward_pending',
  'reward_paid',
  'expired'
]

const referralSchema = new mongoose.Schema(
  {
    referrerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'referrerId is required'],
      index: true
    },
    referredLeadId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lead',
      default: null,
      index: true
    },
    referredName: {
      type: String,
      required: [true, 'referredName is required'],
      trim: true
    },
    referredPhone: {
      type: String,
      trim: true,
      default: ''
    },
    referredEmail: {
      type: String,
      lowercase: true,
      trim: true,
      default: '',
      match: [/^\S+@\S+\.\S+$|^$/, 'Please enter a valid email']
    },
    referredCountry: {
      type: String,
      trim: true,
      default: ''
    },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'projectId is required'],
      index: true
    },
    status: {
      type: String,
      enum: REFERRAL_STATUSES,
      default: 'pending',
      index: true
    },
    rewardType: {
      type: String,
      enum: REFERRAL_REWARD_TYPES,
      default: 'cash'
    },
    /** Cash amount, or computed discount dollars after approval */
    rewardAmount: {
      type: Number,
      min: 0,
      default: 0
    },
    discountPercent: {
      type: Number,
      min: 0,
      max: 100,
      default: null
    },
    /** Admin-selected base when applying property_discount */
    discountBase: {
      type: String,
      enum: REFERRAL_DISCOUNT_BASES,
      default: null
    },
    /** Unit price (or 90%) used to compute the discount */
    discountBaseAmount: {
      type: Number,
      min: 0,
      default: null
    },
    /** Dollar discount applied (same as rewardAmount for property_discount once paid) */
    discountAmount: {
      type: Number,
      min: 0,
      default: null
    },
    rewardPaidAt: {
      type: Date,
      default: null
    },
    /** Unit belonging to the referred sale */
    conversionPropertyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Property',
      default: null
    },
    conversionApartmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Apartment',
      default: null
    },
    /** Unit belonging to the referrer that receives the discount credit */
    rewardPropertyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Property',
      default: null
    },
    rewardApartmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Apartment',
      default: null
    },
    rewardPayloadId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Payload',
      default: null
    },
    referralCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true
    },
    notes: {
      type: String,
      trim: true,
      default: ''
    }
  },
  {
    timestamps: true
  }
)

referralSchema.pre('validate', function validateConversionUnit(next) {
  if (this.conversionPropertyId && this.conversionApartmentId) {
    return next(new Error('Provide only one of conversionPropertyId or conversionApartmentId'))
  }
  if (this.rewardPropertyId && this.rewardApartmentId) {
    return next(new Error('Provide only one of rewardPropertyId or rewardApartmentId'))
  }
  next()
})

referralSchema.index({ projectId: 1, status: 1 })
referralSchema.index({ referrerId: 1, projectId: 1 })
referralSchema.index({ rewardPayloadId: 1 }, { sparse: true })

const Referral = mongoose.model('Referral', referralSchema)

export default Referral
