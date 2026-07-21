import mongoose from 'mongoose'

/** Reward types accepted when creating/updating programs */
export const REFERRAL_PROGRAM_REWARD_TYPES = ['cash', 'property_discount']

/** Includes legacy values still present on older documents */
export const REFERRAL_REWARD_TYPES = [
  ...REFERRAL_PROGRAM_REWARD_TYPES,
  'payment_credit',
  'amenity_access'
]

export const REFERRAL_DISCOUNT_BASES = ['original_100', 'after_first_10']

const localizedStringSchema = {
  en: { type: String, trim: true, default: '' },
  es: { type: String, trim: true, default: '' }
}

const referralProgramSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'projectId is required'],
      index: true
    },
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true
    },
    /** Flat cash amount when rewardType is cash */
    rewardPerReferral: {
      type: Number,
      min: 0,
      default: 0
    },
    rewardType: {
      type: String,
      enum: REFERRAL_REWARD_TYPES,
      default: 'cash'
    },
    /** Percent of referrer unit price when rewardType is property_discount */
    discountPercent: {
      type: Number,
      min: 0,
      max: 100,
      default: null
    },
    isActive: {
      type: Boolean,
      default: true
    },
    termsAndConditions: {
      type: localizedStringSchema,
      default: () => ({ en: '', es: '' })
    },
    maxReferralsPerUser: {
      type: Number,
      min: 1,
      default: null
    }
  },
  {
    timestamps: true
  }
)

referralProgramSchema.pre('validate', function validateRewardConfig(next) {
  if (this.rewardType === 'cash') {
    if (this.rewardPerReferral == null || Number(this.rewardPerReferral) < 0) {
      return next(new Error('rewardPerReferral must be a non-negative number for cash rewards'))
    }
  }
  if (this.rewardType === 'property_discount') {
    if (this.discountPercent == null || Number(this.discountPercent) <= 0) {
      return next(new Error('discountPercent is required for property_discount rewards'))
    }
  }
  next()
})

referralProgramSchema.index({ projectId: 1, isActive: 1 })

const ReferralProgram = mongoose.model('ReferralProgram', referralProgramSchema)

export default ReferralProgram
