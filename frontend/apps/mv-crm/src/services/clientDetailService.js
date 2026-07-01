// apps/mv-crm/src/services/clientDetailService.js
import api from '@shared/services/api'

const clientDetailService = {
  // GET /api/crm/clients/:id
  getDetail: async (clientId, params = {}) => {
    const res = await api.get(`/crm/clients/${clientId}`, { params })
    return res.data
  },

  // GET /api/crm/clients/:id/payments
  getPayments: async (clientId, params = {}) => {
    const res = await api.get(`/crm/clients/${clientId}/payments`, { params })
    return res.data
  },

  // POST /api/crm/clients/:id/notes
  addNote: async (clientId, noteData) => {
    const res = await api.post(`/crm/clients/${clientId}/notes`, noteData)
    return res.data
  }
}

export default clientDetailService