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
    uploadedAt: null,
    notes: '',
    gcsFileName: null,
    statusChangedAt: now
  }))
}

const documentChecklistItemSchema = new mongoose.Schema(
  {
    documentType: { type: String, enum: LOAN_DOCUMENT_TYPES, required: true },
    status: { type: String, enum: LOAN_DOCUMENT_STATUSES, default: 'not_applicable' },
    fileUrl: { type: String },
    uploadedAt: { type: Date },
    notes: { type: String, trim: true },
    gcsFileName: { type: String, trim: true, default: null },
    statusChangedAt: { type: Date, default: Date.now }
  },
  { _id: true }
)

const timelineEntrySchema = new mongoose.Schema(
  {
    action: { type: String, required: true },
    description: { type: String },
    performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    timestamp: { type: Date, default: Date.now },
    metadata: { type: mongoose.Schema.Types.Mixed }
  },
  { _id: true }
)

const nextActionSchema = new mongoose.Schema(
  {
    description: { type: String, trim: true },
    responsiblePerson: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    deadline: { type: Date }
  },
  { _id: false }
)

const loanSchema = new mongoose.Schema(
  {
    buyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    coBuyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    buyerContactInfo: { type: String, trim: true },

    projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
    propertyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Property' },
    propertyAddress: { type: String, trim: true },

    purchasePrice: { type: Number },
    loanAmount: { type: Number },
    downPayment: { type: Number },
    downPaymentPercent: { type: Number },
    loanType: { type: String, enum: LOAN_TYPES },
    interestRate: { type: Number },
    estimatedMonthlyPayment: { type: Number },

    contractDate: { type: Date },
    estimatedClosingDate: { type: Date },

    lender: { type: String, trim: true },
    loanOfficer: { type: String, trim: true },
    loanOfficerContact: { type: String, trim: true },
    processor: { type: String, trim: true },
    underwriter: { type: String, trim: true },
    titleCompany: { type: String, trim: true },
    insuranceCompany: { type: String, trim: true },
    appraisalCompany: { type: String, trim: true },

    pipelineStage: {
      type: String,
      enum: LOAN_PIPELINE_STAGES,
      default: 'new_loan_buyer_added'
    },
    specialStatus: {
      type: String,
      enum: [...LOAN_SPECIAL_STATUSES, null],
      default: null
    },
    percentComplete: { type: Number, default: 0, min: 0, max: 100 },
    stageEnteredAt: { type: Date, default: Date.now },

    nextAction: { type: nextActionSchema },

    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

    internalNotes: { type: String, trim: true },

    documentChecklist: [documentChecklistItemSchema],

    timeline: [timelineEntrySchema]
  },
  { timestamps: true }
)

loanSchema.index({ buyer: 1 })
loanSchema.index({ projectId: 1 })
loanSchema.index({ propertyId: 1 })
loanSchema.index({ pipelineStage: 1 })
loanSchema.index({ specialStatus: 1 })
loanSchema.index({ assignedTo: 1 })
loanSchema.index({ estimatedClosingDate: 1 })
loanSchema.index({ projectId: 1, pipelineStage: 1 })

export default mongoose.model('Loan', loanSchema)
