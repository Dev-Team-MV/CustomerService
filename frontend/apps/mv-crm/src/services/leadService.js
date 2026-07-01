// apps/mv-crm/src/services/leadService.js
import api from '@shared/services/api'

// Enums fijos del backend
export const LEAD_STAGES = ['nuevo', 'contactado', 'visita_agendada', 'propuesta', 'vendido', 'perdido']
export const LEAD_SOURCES = ['web', 'referido', 'visita', 'llamada']

// Colores para cada stage
export const STAGE_COLORS = {
  nuevo: '#9e9e9e',
  contactado: '#2196f3',
  visita_agendada: '#ff9800',
  propuesta: '#9c27b0',
  vendido: '#4caf50',
  perdido: '#f44336'
}

const leadService = {
  // GET /api/crm/leads
  getAll: async (filters = {}) => {
    const res = await api.get('/crm/leads', { params: filters })
    return {
      leads: res.data.leads || [],
      total: res.data.total || 0
    }
  },

  // GET /api/crm/leads/:id
  getById: async (id) => {
    const res = await api.get(`/crm/leads/${id}`)
    return res.data
  },

  // POST /api/crm/leads
  create: async (data) => {
    const res = await api.post('/crm/leads', data)
    return res.data
  },

  // PUT /api/crm/leads/:id
  update: async (id, data) => {
    const res = await api.put(`/crm/leads/${id}`, data)
    return res.data
  },

  // PUT /api/crm/leads/:id/stage (drag & drop)
  move: async (id, stage, lostReason = null) => {
    const payload = { stage }
    if (stage === 'perdido' && lostReason) {
      payload.lostReason = lostReason
    }
    const res = await api.put(`/crm/leads/${id}/stage`, payload)
    return res.data
  },

  // DELETE /api/crm/leads/:id
  delete: async (id) => {
    await api.delete(`/crm/leads/${id}`)
  },

  // POST /api/crm/leads/:id/convert
  convertToCustomer: async (id) => {
    const res = await api.post(`/crm/leads/${id}/convert`)
    return res.data // { lead, user, smsSent, setupLink }
  }
}

export default leadService