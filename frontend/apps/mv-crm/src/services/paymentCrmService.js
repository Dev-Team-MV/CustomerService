// apps/mv-crm/src/services/paymentCrmService.js
import api from '@shared/services/api'

const paymentCrmService = {
  // GET /api/crm/payments/summary
  getSummary: async () => {
    const res = await api.get('/crm/payments/summary')
    return res.data
  },

  // GET /api/crm/payments
  getAll: async (filters = {}) => {
    const { projectId, status, dateFrom, dateTo, page = 1, limit = 20 } = filters
    const params = { page, limit }
    
    if (projectId) params.projectId = projectId
    if (status) params.status = status
    if (dateFrom) params.dateFrom = dateFrom
    if (dateTo) params.dateTo = dateTo

    const res = await api.get('/crm/payments', { params })
    return {
      payments: res.data.payments || [],
      pagination: res.data.pagination || { page: 1, limit: 20, total: 0, totalPages: 0 }
    }
  },

  // Enviar SMS recordatorio (reutilizar smsService existente)
  sendReminder: async (paymentId, phoneNumber, clientName, amount, dueDate) => {
    const message = `Hola ${clientName}, te recordamos que tu pago de $${amount.toLocaleString()} vence el ${new Date(dueDate).toLocaleDateString()}. Por favor realiza el pago a tiempo.`
    
    // Reutilizar el endpoint de SMS existente
    const res = await api.post('/sms/send', {
      to: phoneNumber,
      message
    })
    return res.data
  }
}

export default paymentCrmService