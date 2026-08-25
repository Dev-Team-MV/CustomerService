import mongoose from 'mongoose'

export const LOAN_PIPELINE_STAGES = [
  'new_loan_buyer_added',
  'loan_application_sent',
  'loan_application_started',
  'loan_application_completed',
  'initial_documents_requested',
  'documents_received',
  'documents_missing_pending',
  'pre_qualification_in_review',
  'pre_qualified',
  'pre_approval_in_review',
  'pre_approved',
  'property_unit_selected',
  'purchase_contract_executed',
  'contract_sent_to_lender',
  'loan_estimate_issued',
  'disclosures_sent',
  'disclosures_signed',
  'processing',
  'additional_documents_requested',
  'submitted_to_underwriting',
  'underwriting_review',
  'conditional_approval',
  'conditions_outstanding',
  'conditions_submitted',
  'appraisal_ordered',
  'appraisal_scheduled',
  'appraisal_completed',
  'appraisal_received',
  'appraisal_approved',
  'title_ordered_title_review',
  'insurance_requested',
  'insurance_received',
  'final_underwriting',
  'clear_to_close',
  'closing_disclosure_issued',
  'closing_disclosure_signed',
  'closing_scheduled',
  'buyer_funds_due',
  'closing_documents_signed',
  'loan_funded',
  'title_confirmed_closed',
  'completed'
]

export const LOAN_SPECIAL_STATUSES = [
  'on_hold',
  'buyer_action_required',
  'lender_action_required',
  'developer_action_required',
  'missing_documents',
  'financing_issue',
  'appraisal_issue',
  'title_issue',
  'loan_denied',
  'buyer_withdrawn',
  'cancelled'
]

export const LOAN_DOCUMENT_TYPES = [
  'loan_application',
  'government_id_passport',
  'ssn_itin',
  'proof_of_address',
  'bank_statements',
  'proof_of_funds',
  'income_verification',
  'pay_stubs',
  'w2s',
  'tax_returns',
  'pl_statements',
  'cpa_letter',
  'employment_verification',
  'credit_authorization',
  'purchase_agreement',
  'amendments',
  'earnest_money_receipt',
  'down_payment_verification',
  'gift_letter',
  'loan_estimate',
  'signed_disclosures',
  'appraisal',
  'homeowners_insurance',
  'title_commitment',
  'closing_disclosure',
  'clear_to_close',
  'final_closing_documents'
]

export const LOAN_DOCUMENT_STATUSES = [
  'requested',
  'received',
  'missing',
  'under_review',
  'approved',
  'not_applicable'
]

export const LOAN_TYPES = ['Conventional', 'FHA', 'VA', 'USDA', 'Jumbo', 'Other']

export function calcPercentComplete(stage) {
  const idx = LOAN_PIPELINE_STAGES.indexOf(stage)
  if (idx < 0) return 0
  if (stage === 'completed') return 100
  return Math.round((idx / LOAN_PIPELINE_STAGES.length) * 100)
}

export function buildDefaultDocumentChecklist() {
  const now = new Date()
  return LOAN_DOCUMENT_TYPES.map((documentType) => ({
    documentType,
    status: 'not_applicable',
    fileUrl: null,
    gcsFileName: null,
    uploadedAt: null,
    notes: '',
    statusChangedAt: now
  }))
}

const documentChecklistItemSchema = new mongoose.Schema(
  {
    documentType: {
      type: String,
      enum: LOAN_DOCUMENT_TYPES,
      required: true
    },
    status: {
      type: String,
      enum: LOAN_DOCUMENT_STATUSES,
      default: 'not_applicable'
    },
    fileUrl: {
      type: String,
      trim: true,
      default: null
    },
    gcsFileName: {
      type: String,
      trim: true,
      default: null
    },
    uploadedAt: {
      type: Date,
      default: null
    },
    notes: {
      type: String,
      trim: true,
      default: ''
    },
    statusChangedAt: {
      type: Date,
      default: Date.now
    }
  },
  { _id: true }
)

const timelineItemSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      trim: true,
      default: ''
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  { _id: true }
)

const nextActionSchema = new mongoose.Schema(
  {
    description: {
      type: String,
      trim: true,
      default: ''
    },
    responsiblePerson: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    deadline: {
      type: Date,
      default: null
    }
  },
  { _id: false }
)

const loanSchema = new mongoose.Schema(
  {
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Buyer is required'],
      index: true
    },
    coBuyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'Project is required'],
      index: true
    },
    propertyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Property',
      default: null,
      index: true
    },
    purchasePrice: {
      type: Number,
      min: 0,
      default: 0
    },
    loanAmount: {
      type: Number,
      min: 0,
      default: 0
    },
    downPayment: {
      type: Number,
      min: 0,
      default: 0
    },
    downPaymentPercent: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    interestRate: {
      type: Number,
      min: 0,
      default: 0
    },
    estimatedMonthlyPayment: {
      type: Number,
      min: 0,
      default: 0
    },
    contractDate: {
      type: Date,
      default: null
    },
    estimatedClosingDate: {
      type: Date,
      default: null,
      index: true
    },
    loanType: {
      type: String,
      enum: LOAN_TYPES,
      default: 'Conventional'
    },
    lender: { type: String, trim: true, default: '' },
    loanOfficer: { type: String, trim: true, default: '' },
    loanOfficerContact: { type: String, trim: true, default: '' },
    processor: { type: String, trim: true, default: '' },
    underwriter: { type: String, trim: true, default: '' },
    titleCompany: { type: String, trim: true, default: '' },
    insuranceCompany: { type: String, trim: true, default: '' },
    appraisalCompany: { type: String, trim: true, default: '' },
    pipelineStage: {
      type: String,
      enum: LOAN_PIPELINE_STAGES,
      default: 'new_loan_buyer_added',
      index: true
    },
    specialStatus: {
      type: String,
      enum: [...LOAN_SPECIAL_STATUSES, null],
      default: null,
      index: true
    },
    percentComplete: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    stageEnteredAt: {
      type: Date,
      default: Date.now
    },
    internalNotes: {
      type: String,
      trim: true,
      default: ''
    },
    nextAction: {
      type: nextActionSchema,
      default: () => ({})
    },
    documentChecklist: {
      type: [documentChecklistItemSchema],
      default: []
    },
    timeline: {
      type: [timelineItemSchema],
      default: []
    }
  },
  { timestamps: true }
)

loanSchema.index({ buyer: 1, projectId: 1 })
loanSchema.index({ projectId: 1, pipelineStage: 1 })
loanSchema.index({ projectId: 1, specialStatus: 1 })
loanSchema.index({ pipelineStage: 1, stageEnteredAt: 1 })
loanSchema.index({ estimatedClosingDate: 1, pipelineStage: 1 })
loanSchema.index({ createdAt: -1 })

const Loan = mongoose.model('Loan', loanSchema)

export default Loan
