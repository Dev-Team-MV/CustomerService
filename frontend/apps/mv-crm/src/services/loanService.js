import api from '@shared/services/api'

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

export const LOAN_TYPES = ['Conventional', 'FHA', 'VA', 'USDA', 'Jumbo', 'DSCR', 'Other']

export const STAGE_LABELS = {
  new_loan_buyer_added: 'New Loan / Buyer Added',
  loan_application_sent: 'Loan Application Sent',
  loan_application_started: 'Loan Application Started',
  loan_application_completed: 'Loan Application Completed',
  initial_documents_requested: 'Initial Documents Requested',
  documents_received: 'Documents Received',
  documents_missing_pending: 'Documents Missing / Pending',
  pre_qualification_in_review: 'Pre-Qualification in Review',
  pre_qualified: 'Pre-Qualified',
  pre_approval_in_review: 'Pre-Approval in Review',
  pre_approved: 'Pre-Approved',
  property_unit_selected: 'Property / Unit Selected',
  purchase_contract_executed: 'Purchase Contract Executed',
  contract_sent_to_lender: 'Contract Sent to Lender',
  loan_estimate_issued: 'Loan Estimate Issued',
  disclosures_sent: 'Disclosures Sent',
  disclosures_signed: 'Disclosures Signed',
  processing: 'Processing',
  additional_documents_requested: 'Additional Documents Requested',
  submitted_to_underwriting: 'Submitted to Underwriting',
  underwriting_review: 'Underwriting Review',
  conditional_approval: 'Conditional Approval',
  conditions_outstanding: 'Conditions Outstanding',
  conditions_submitted: 'Conditions Submitted',
  appraisal_ordered: 'Appraisal Ordered',
  appraisal_scheduled: 'Appraisal Scheduled',
  appraisal_completed: 'Appraisal Completed',
  appraisal_received: 'Appraisal Received',
  appraisal_approved: 'Appraisal Approved',
  title_ordered_title_review: 'Title Ordered / Title Review',
  insurance_requested: 'Insurance Requested',
  insurance_received: 'Insurance Received',
  final_underwriting: 'Final Underwriting',
  clear_to_close: 'Clear to Close',
  closing_disclosure_issued: 'Closing Disclosure Issued',
  closing_disclosure_signed: 'Closing Disclosure Signed',
  closing_scheduled: 'Closing Scheduled',
  buyer_funds_due: 'Buyer Funds Due',
  closing_documents_signed: 'Closing / Documents Signed',
  loan_funded: 'Loan Funded',
  title_confirmed_closed: 'Title Confirmed / Closed',
  completed: 'Completed'
}

export const SPECIAL_STATUS_LABELS = {
  on_hold: 'On Hold',
  buyer_action_required: 'Buyer Action Required',
  lender_action_required: 'Lender Action Required',
  developer_action_required: 'Developer Action Required',
  missing_documents: 'Missing Documents',
  financing_issue: 'Financing Issue',
  appraisal_issue: 'Appraisal Issue',
  title_issue: 'Title Issue',
  loan_denied: 'Loan Denied',
  buyer_withdrawn: 'Buyer Withdrawn',
  cancelled: 'Cancelled'
}

export const DOCUMENT_TYPE_LABELS = {
  loan_application: 'Loan Application',
  government_id_passport: 'Government ID / Passport',
  ssn_itin: 'Social Security / ITIN',
  proof_of_address: 'Proof of Address',
  bank_statements: 'Bank Statements',
  proof_of_funds: 'Proof of Funds',
  income_verification: 'Income Verification',
  pay_stubs: 'Pay Stubs',
  w2s: 'W-2s',
  tax_returns: 'Tax Returns',
  pl_statements: 'P&L Statements',
  cpa_letter: 'CPA Letter',
  employment_verification: 'Employment Verification',
  credit_authorization: 'Credit Authorization',
  purchase_agreement: 'Purchase Agreement',
  amendments: 'Amendments',
  earnest_money_receipt: 'Earnest Money Receipt',
  down_payment_verification: 'Down Payment Verification',
  gift_letter: 'Gift Letter',
  loan_estimate: 'Loan Estimate',
  signed_disclosures: 'Signed Disclosures',
  appraisal: 'Appraisal',
  homeowners_insurance: 'Homeowners Insurance',
  title_commitment: 'Title Commitment',
  closing_disclosure: 'Closing Disclosure',
  clear_to_close: 'Clear to Close',
  final_closing_documents: 'Final Closing Documents'
}

export const DOCUMENT_STATUS_LABELS = {
  requested: 'Requested',
  received: 'Received',
  missing: 'Missing',
  under_review: 'Under Review',
  approved: 'Approved',
  not_applicable: 'N/A'
}

export const STAGE_PHASE_MAP = {
  new_loan_buyer_added: 'application',
  loan_application_sent: 'application',
  loan_application_started: 'application',
  loan_application_completed: 'application',
  initial_documents_requested: 'application',
  documents_received: 'application',
  documents_missing_pending: 'application',
  pre_qualification_in_review: 'application',
  pre_qualified: 'application',
  pre_approval_in_review: 'application',
  pre_approved: 'application',
  property_unit_selected: 'processing',
  purchase_contract_executed: 'processing',
  contract_sent_to_lender: 'processing',
  loan_estimate_issued: 'processing',
  disclosures_sent: 'processing',
  disclosures_signed: 'processing',
  processing: 'processing',
  additional_documents_requested: 'processing',
  submitted_to_underwriting: 'underwriting',
  underwriting_review: 'underwriting',
  conditional_approval: 'underwriting',
  conditions_outstanding: 'underwriting',
  conditions_submitted: 'underwriting',
  appraisal_ordered: 'underwriting',
  appraisal_scheduled: 'underwriting',
  appraisal_completed: 'underwriting',
  appraisal_received: 'underwriting',
  appraisal_approved: 'underwriting',
  title_ordered_title_review: 'underwriting',
  insurance_requested: 'underwriting',
  insurance_received: 'underwriting',
  final_underwriting: 'underwriting',
  clear_to_close: 'closing',
  closing_disclosure_issued: 'closing',
  closing_disclosure_signed: 'closing',
  closing_scheduled: 'closing',
  buyer_funds_due: 'closing',
  closing_documents_signed: 'closing',
  loan_funded: 'closing',
  title_confirmed_closed: 'closing',
  completed: 'closing'
}

export const PHASE_COLORS = {
  application: '#2196f3',
  processing: '#ff9800',
  underwriting: '#9c27b0',
  closing: '#4caf50'
}

export const PHASE_LABELS = {
  application: 'Application',
  processing: 'Processing',
  underwriting: 'Underwriting',
  closing: 'Closing'
}

export const SPECIAL_STATUS_COLORS = {
  on_hold: '#ff9800',
  buyer_action_required: '#e91e63',
  lender_action_required: '#9c27b0',
  developer_action_required: '#673ab7',
  missing_documents: '#f44336',
  financing_issue: '#d32f2f',
  appraisal_issue: '#e65100',
  title_issue: '#bf360c',
  loan_denied: '#b71c1c',
  buyer_withdrawn: '#616161',
  cancelled: '#424242'
}

export const DOCUMENT_STATUS_COLORS = {
  requested: '#ff9800',
  received: '#2196f3',
  missing: '#f44336',
  under_review: '#9c27b0',
  approved: '#4caf50',
  not_applicable: '#9e9e9e'
}

const loanService = {
  getAll: async (filters = {}) => {
    const res = await api.get('/loans', { params: filters })
    return {
      loans: res.data.loans || [],
      pagination: res.data.pagination || {}
    }
  },

  getById: async (id) => {
    const res = await api.get(`/loans/${id}`)
    return res.data
  },

  create: async (data) => {
    const res = await api.post('/loans', data)
    return res.data
  },

  update: async (id, data) => {
    const res = await api.put(`/loans/${id}`, data)
    return res.data
  },

  delete: async (id) => {
    await api.delete(`/loans/${id}`)
  },

  updateStage: async (id, stage) => {
    const res = await api.put(`/loans/${id}/stage`, { stage })
    return res.data
  },

  updateSpecialStatus: async (id, status) => {
    const res = await api.put(`/loans/${id}/status`, { status })
    return res.data
  },

  updateDocumentItem: async (id, docType, data) => {
    const res = await api.put(`/loans/${id}/documents/${docType}`, data)
    return res.data
  },

  uploadDocument: async (id, docType, file) => {
    const formData = new FormData()
    formData.append('file', file)
    const res = await api.post(`/loans/${id}/documents/${docType}/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return res.data
  },

  deleteDocumentFile: async (id, docType) => {
    const res = await api.delete(`/loans/${id}/documents/${docType}/file`)
    return res.data
  },

  updateNextAction: async (id, data) => {
    const res = await api.put(`/loans/${id}/next-action`, data)
    return res.data
  },

  addNote: async (id, note) => {
    const res = await api.post(`/loans/${id}/notes`, { note })
    return res.data
  },

  getTimeline: async (id, params = {}) => {
    const res = await api.get(`/loans/${id}/timeline`, { params })
    return {
      timeline: res.data.timeline || [],
      pagination: res.data.pagination || {}
    }
  },

  getDashboardKPIs: async (filters = {}) => {
    const res = await api.get('/loans/dashboard', { params: filters })
    return {
      kpis: res.data.kpis || {},
      byStage: res.data.byStage || {}
    }
  },

  getAlerts: async (filters = {}) => {
    const res = await api.get('/loans/alerts', { params: filters })
    return {
      alerts: res.data.alerts || [],
      byType: res.data.byType || {},
      counts: res.data.counts || {}
    }
  }
}

export default loanService
