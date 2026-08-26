import api from '@shared/services/api'

// ─── CONSTANTES DE UI Y ESTADOS ────────────────────────────────────────────────

export const LOAN_PIPELINE_STAGES = [
  // FASE 1: Inicio y Aplicación
  { id: 'new_loan_buyer_added', name: 'New Loan / Buyer Added', phase: 'Application', order: 1 },
  { id: 'loan_application_started', name: 'Application Started', phase: 'Application', order: 2 },
  { id: 'loan_application_completed', name: 'Application Completed', phase: 'Application', order: 3 },
  { id: 'pre_qualified', name: 'Pre-Qualified', phase: 'Application', order: 4 },
  { id: 'pre_approved', name: 'Pre-Approved', phase: 'Application', order: 5 },
  
  // FASE 2: Procesamiento
  { id: 'processing', name: 'Processing', phase: 'Processing', order: 6 },
  { id: 'documents_received', name: 'Documents Received', phase: 'Processing', order: 7 },
  { id: 'additional_documents_requested', name: 'Additional Docs Requested', phase: 'Processing', order: 8 },
  { id: 'appraisal_ordered', name: 'Appraisal Ordered', phase: 'Processing', order: 9 },
  { id: 'appraisal_received', name: 'Appraisal Received', phase: 'Processing', order: 10 },
  
  // FASE 3: Underwriting
  { id: 'submitted_to_underwriting', name: 'Submitted to UW', phase: 'Underwriting', order: 11 },
  { id: 'underwriting_review', name: 'UW Review', phase: 'Underwriting', order: 12 },
  { id: 'conditional_approval', name: 'Conditional Approval', phase: 'Underwriting', order: 13 },
  { id: 'conditions_submitted', name: 'Conditions Submitted', phase: 'Underwriting', order: 14 },
  { id: 'clear_to_close', name: 'Clear to Close', phase: 'Underwriting', order: 15 },
  
  // FASE 4: Cierre
  { id: 'closing_disclosure_issued', name: 'CD Issued', phase: 'Closing', order: 16 },
  { id: 'closing_scheduled', name: 'Closing Scheduled', phase: 'Closing', order: 17 },
  { id: 'closing_documents_signed', name: 'Docs Signed', phase: 'Closing', order: 18 },
  { id: 'loan_funded', name: 'Loan Funded', phase: 'Closing', order: 19 },
  
  // FASE 5: Completado
  { id: 'title_confirmed_closed', name: 'Title Confirmed / Closed', phase: 'Completed', order: 20 },
  { id: 'completed', name: 'Completed', phase: 'Completed', order: 21 }
]

export const LOAN_SPECIAL_STATUSES = [
  { key: 'on_hold', label: 'On Hold', color: '#ff9800' },
  { key: 'missing_documents', label: 'Missing Documents', color: '#e91e63' },
  { key: 'buyer_action_required', label: 'Buyer Action Required', color: '#f44336' },
  { key: 'financing_issue', label: 'Financing Issue', color: '#9c27b0' },
  { key: 'cancelled', label: 'Cancelled', color: '#757575' }
]

export const LOAN_DOCUMENT_TYPES = [
  { key: 'bank_statements', label: 'Bank Statements', color: '#ff9800' },
  { key: 'paystubs', label: 'Paystubs', color: '#2196f3' },
  { key: 'tax_returns', label: 'Tax Returns', color: '#4caf50' },
  { key: 'id_proof', label: 'ID Proof', color: '#9e9e9e' },
  { key: 'employment_letter', label: 'Employment Letter', color: '#00bcd4' }
]

export const STAGE_COLORS = {
  'Application': '#9e9e9e',
  'Processing': '#2196f3',
  'Underwriting': '#ff9800',
  'Closing': '#9c27b0',
  'Completed': '#4caf50',
  'Denied': '#f44336',
  'Cancelled': '#757575'
}

// ─── SERVICIO API (100% Alineado con la nueva spec de Swagger) ───────────────

const loanService = {
  // GET /api/loans?projectId=&stage=&status=&buyer=&assignedTo=&fromDate=&toDate=&page=1&limit=20
  getAll: async (filters = {}) => {
    const res = await api.get('/loans', { params: filters })
    return { 
      loans: Array.isArray(res.data) ? res.data : (res.data.loans || []), 
      total: res.data.total || (Array.isArray(res.data) ? res.data.length : 0) 
    }
  },

  // GET /api/loans/:id
  getById: async (id) => {
    const res = await api.get(`/loans/${id}`)
    return res.data
  },

  // POST /api/loans
  create: async (data) => {
    const res = await api.post('/loans', data)
    return res.data
  },

  // PUT /api/loans/:id
  update: async (id, data) => {
    const res = await api.put(`/loans/${id}`, data)
    return res.data
  },

  // DELETE /api/loans/:id
  delete: async (id) => {
    await api.delete(`/loans/${id}`)
  },

  // ✅ CORREGIDO: PUT /api/loans/:id/stage  ->  { "stage": "pre_approved" }
  updateStage: async (id, stage) => {
    const res = await api.put(`/loans/${id}/stage`, { stage })
    return res.data
  },

  // ✅ CORREGIDO: PUT /api/loans/:id/status  ->  { "status": "on_hold" } o null
  updateSpecialStatus: async (id, status) => {
    const res = await api.put(`/loans/${id}/status`, { status })
    return res.data
  },

  // PUT /api/loans/:id/documents/:docType  ->  { "status": "requested" }
  updateDocumentItem: async (loanId, docType, data) => {
    const res = await api.put(`/loans/${loanId}/documents/${docType}`, data)
    return res.data
  },

  // POST /api/loans/:id/documents/:docType/upload (multipart/form-data)
  uploadDocument: async (loanId, docType, file) => {
    const formData = new FormData()
    formData.append('file', file)
    
    const res = await api.post(`/loans/${loanId}/documents/${docType}/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return res.data
  },

  // DELETE /api/loans/:id/documents/:docType/file
  deleteDocumentFile: async (loanId, docType) => {
    await api.delete(`/loans/${loanId}/documents/${docType}/file`)
  },

  // PUT /api/loans/:id/next-action
  updateNextAction: async (id, actionData) => {
    const res = await api.put(`/loans/${id}/next-action`, actionData)
    return res.data
  },

  // ✅ CORREGIDO: POST /api/loans/:id/notes  ->  { "note": "string" }
  addNote: async (id, noteText) => {
    const res = await api.post(`/loans/${id}/notes`, { note: noteText })
    return res.data
  },

  // GET /api/loans/:id/timeline?page=1&limit=20
  getTimeline: async (id, page = 1, limit = 20) => {
    const res = await api.get(`/loans/${id}/timeline`, { params: { page, limit } })
    return res.data
  },

  // GET /api/loans/dashboard?projectId=...
  getDashboardKPIs: async (filters = {}) => {
    const res = await api.get('/loans/dashboard', { params: filters })
    return res.data
  },

  // ✅ CORREGIDO: GET /api/loans/alerts?projectId=...
  getAlerts: async (filters = {}) => {
    const res = await api.get('/loans/alerts', { params: filters })
    return res.data
  }
}

export default loanService