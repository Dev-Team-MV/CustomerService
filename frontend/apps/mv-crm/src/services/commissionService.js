// apps/mv-crm/src/services/commissionService.js
import api from '@shared/services/api'

const commissionService = {
  // ─── COMISIONES ───
  getCommissions: async (params = {}) => {
    const res = await api.get('/commissions', { params })
    return res.data
  },

  getCommissionById: async (id) => {
    const res = await api.get(`/commissions/${id}`)
    return res.data
  },

  createCommission: async (data) => {
    const res = await api.post('/commissions', data)
    return res.data
  },

  updateCommission: async (id, data) => {
    const res = await api.put(`/commissions/${id}`, data)
    return res.data
  },

  deleteCommission: async (id) => {
    const res = await api.delete(`/commissions/${id}`)
    return res.data
  },

  calculateCommission: async (data) => {
    const res = await api.post('/commissions/calculate', data)
    return res.data
  },

  approveCommission: async (id) => {
    const res = await api.post(`/commissions/${id}/approve`)
    return res.data
  },

  markPaidCommission: async (id, paidAt = new Date().toISOString()) => {
    const res = await api.post(`/commissions/${id}/mark-paid`, { paidAt })
    return res.data
  },

  getAgentSummary: async (agentId, params = {}) => {
    const res = await api.get(`/commissions/agents/${agentId}/summary`, { params })
    return res.data
  },

  getProjectReport: async (projectId, params = {}) => {
    const res = await api.get(`/commissions/projects/${projectId}/report`, { params })
    return res.data
  },

  // ─── ESTRUCTURAS DE COMISIÓN ───
  getStructures: async (params = {}) => {
    const res = await api.get('/commission-structures', { params })
    return res.data
  },

  getStructureById: async (id) => {
    const res = await api.get(`/commission-structures/${id}`)
    return res.data
  },

  createStructure: async (data) => {
    const res = await api.post('/commission-structures', data)
    return res.data
  },

  updateStructure: async (id, data) => {
    const res = await api.put(`/commission-structures/${id}`, data)
    return res.data
  },

  deleteStructure: async (id) => {
    const res = await api.delete(`/commission-structures/${id}`)
    return res.data
  }
}

export default commissionService