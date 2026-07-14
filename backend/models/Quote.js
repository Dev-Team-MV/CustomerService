import mongoose from 'mongoose'

export const QUOTE_STATUSES = ['draft', 'sent', 'accepted', 'expired', 'converted']
export const QUOTE_SENT_VIA = ['email', 'sms', 'both', 'download', 'none']

const scheduleItemSchema = new mongoose.Schema(
  {
    monthNumber: { type: Number, required: true, min: 1 },
    date: { type: Date, required: true },
    principal: { type: Number, required: true, min: 0 },
    interest: { type: Number, required: true, min: 0 },
    payment: { type: Number, required: true, min: 0 },
    balance: { type: Number, required: true, min: 0 },
    isBalloon: { type: Boolean, default: false }
  },
  { _id: false }
)

const quoteSchema = new mongoose.Schema(
  {
    leadId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lead',
      default: null,
      index: true
    },
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true
    },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
      index: true
    },
    lotId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lot',
      required: true
    },
    modelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Model',
      default: null
    },
    facadeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Facade',
      default: null
    },
    totalPrice: {
      type: Number,
      required: true,
      min: 0
    },
    downPayment: {
      type: Number,
      required: true,
      min: 0
    },
    downPaymentPercentage: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    financedAmount: {
      type: Number,
      required: true,
      min: 0
    },
    interestRate: {
      type: Number,
      required: true,
      min: 0,
      default: 0
    },
    termMonths: {
      type: Number,
      required: true,
      min: 1
    },
    monthlyPayment: {
      type: Number,
      required: true,
      min: 0
    },
    /** fixed = cuota fija; declining = saldo insoluto */
    amortizationMethod: {
      type: String,
      enum: ['fixed', 'declining'],
      default: 'fixed'
    },
    balloonAmount: {
      type: Number,
      min: 0,
      default: 0
    },
    balloonMonth: {
      type: Number,
      min: 1,
      default: null
    },
    schedule: {
      type: [scheduleItemSchema],
      default: []
    },
    status: {
      type: String,
      enum: QUOTE_STATUSES,
      default: 'draft',
      index: true
    },
    validUntil: {
      type: Date,
      default: null,
      index: true
    },
    convertedToPropertyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Property',
      default: null
    },
    pdfUrl: {
      type: String,
      trim: true,
      default: null
    },
    sentVia: {
      type: String,
      enum: QUOTE_SENT_VIA,
      default: 'none'
    },
    termsAndConditions: {
      type: String,
      trim: true,
      default: ''
    },
    notes: {
      type: String,
      trim: true,
      default: ''
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  { timestamps: true }
)

quoteSchema.index({ projectId: 1, status: 1, createdAt: -1 })
quoteSchema.index({ leadId: 1, createdAt: -1 })
quoteSchema.index({ validUntil: 1, status: 1 })

export default mongoose.model('Quote', quoteSchema)
