// apps/mv-crm/src/services/documentService.js
import api from '@shared/services/api'

const documentService = {
  getDocuments: async (params = {}) => {
    const res = await api.get('/documents', { params })
    return res.data
  },

  searchDocuments: async (params = {}) => {
    const res = await api.get('/documents/search', { params })
    return res.data
  },

  getDocumentById: async (id) => {
    const res = await api.get(`/documents/${id}`)
    return res.data
  },

  uploadDocument: async (formData) => {
    // formData debe ser una instancia de FormData
    const res = await api.post('/documents', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return res.data
  },

  updateDocument: async (id, data) => {
    const res = await api.put(`/documents/${id}`, data)
    return res.data
  },

  deleteDocument: async (id) => {
    const res = await api.delete(`/documents/${id}`)
    return res.data
  },

  uploadVersion: async (id, formData) => {
    const res = await api.post(`/documents/${id}/versions`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return res.data
  },

  archiveDocument: async (id) => {
    const res = await api.post(`/documents/${id}/archive`)
    return res.data
  },

  getExpiringDocuments: async (params = {}) => {
    const res = await api.get('/documents/expiring', { params })
    return res.data
  },

  triggerExpiringScan: async (daysAhead = 30) => {
    const res = await api.post('/documents/expiring/scan', { daysAhead })
    return res.data
  },

  getByProperty: async (propertyId, params = {}) => {
    const res = await api.get(`/documents/by-property/${propertyId}`, { params })
    return res.data
  },

  getByClient: async (clientId, params = {}) => {
    const res = await api.get(`/documents/by-client/${clientId}`, { params })
    return res.data
  },

  getByProject: async (projectId, params = {}) => {
    const res = await api.get(`/documents/by-project/${projectId}`, { params })
    return res.data
  }
}

export default documentService