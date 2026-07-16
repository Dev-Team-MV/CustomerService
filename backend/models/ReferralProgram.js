import mongoose from 'mongoose'

export const REFERRAL_REWARD_TYPES = ['cash', 'payment_credit', 'amenity_access']

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
    rewardPerReferral: {
      type: Number,
      required: [true, 'rewardPerReferral is required'],
      min: 0
    },
    rewardType: {
      type: String,
      enum: REFERRAL_REWARD_TYPES,
      default: 'cash'
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

referralProgramSchema.index({ projectId: 1, isActive: 1 })

const ReferralProgram = mongoose.model('ReferralProgram', referralProgramSchema)

export default ReferralProgram
