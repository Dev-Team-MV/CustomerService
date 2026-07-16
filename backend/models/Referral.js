import mongoose from 'mongoose'
import { REFERRAL_REWARD_TYPES } from './ReferralProgram.js'

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
    rewardAmount: {
      type: Number,
      min: 0,
      default: 0
    },
    rewardPaidAt: {
      type: Date,
      default: null
    },
    conversionPropertyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Property',
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

referralSchema.index({ projectId: 1, status: 1 })
referralSchema.index({ referrerId: 1, projectId: 1 })

const Referral = mongoose.model('Referral', referralSchema)

export default Referral
