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
// Crear payload (multipart)
createPayload: async (data, files = []) => {
  const formData = new FormData()
  
  // ✅ Extraer projectId para enviarlo como query param
  const projectId = data.projectId || import.meta.env.VITE_PROJECT_ID
  
  // Agregar todos los campos EXCEPTO projectId al FormData
  Object.entries(data).forEach(([key, value]) => {
    if (key !== 'projectId' && value !== undefined && value !== null) {
      formData.append(key, value)
    }
  })
  
  files.forEach(file => formData.append('images', file))
  
  // ✅ Enviar projectId como query parameter en la URL
  const response = await api.post('/payloads', formData, {
    params: { projectId },  // ← AQUÍ va el projectId
    headers: { 'Content-Type': 'multipart/form-data' }
  })
  return response.data
},

  // Actualizar payload
// Actualizar payload
// Actualizar payload
updatePayload: async (id, data, files = []) => {
  const formData = new FormData()
  
  // ✅ Extraer projectId para enviarlo como query param
  const projectId = data.projectId || import.meta.env.VITE_PROJECT_ID
  
  // Agregar todos los campos EXCEPTO projectId al FormData
  Object.entries(data).forEach(([key, value]) => {
    if (key !== 'projectId' && value !== undefined && value !== null) {
      formData.append(key, value)
    }
  })
  
  files.forEach(file => formData.append('images', file))
  
  // ✅ Enviar projectId como query parameter en la URL
  const response = await api.put(`/payloads/${id}`, formData, {
    params: { projectId },  // ← AQUÍ va el projectId
    headers: { 'Content-Type': 'multipart/form-data' }
  })
  return response.data
},
  // Eliminar payload
  deletePayload: async (id) => {
    const response = await api.delete(`/payloads/${id}`, {
      params: { projectId: import.meta.env.VITE_PROJECT_ID }
    })
    return response.data
  }
}

export default payloadService