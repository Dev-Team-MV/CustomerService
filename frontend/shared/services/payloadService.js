// shared/services/payloadService.js
import api from './api'

const payloadService = {
  // Listar payloads por recurso
getPayloadsByResource: async (resourceType, resourceId) => {
  const params = { projectId: import.meta.env.VITE_PROJECT_ID }
  if (resourceType === 'apartment' && resourceId) params.apartment = resourceId
  else if (resourceType === 'property' && resourceId) params.property = resourceId
  const response = await api.get('/payloads', { params })
  return response.data
},

  // Crear payload (multipart)
  createPayload: async (data, files = []) => {
    const formData = new FormData()
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) formData.append(key, value)
    })
    files.forEach(file => formData.append('images', file))
    const response = await api.post('/payloads', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return response.data
  },

  // Actualizar payload
  updatePayload: async (id, data, files = []) => {
    const formData = new FormData()
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) formData.append(key, value)
    })
    files.forEach(file => formData.append('images', file))
    const response = await api.put(`/payloads/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return response.data
  },

  // Eliminar payload
  deletePayload: async (id) => {
    const response = await api.delete(`/payloads/${id}`)
    return response.data
  }
}

export default payloadService