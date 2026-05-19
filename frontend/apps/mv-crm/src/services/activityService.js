// frontend/apps/mv-crm/src/services/activityService.js
import api from '@shared/services/api'

const activityService = {
  // ==================== COLUMNS ====================
  
  // Obtener columnas del proyecto
  getColumns: async (projectId) => {
    const res = await api.get('/activities/columns', { params: { projectId } })
    return res.data
  },

  // Crear columna (Admin)
  createColumn: async (data) => {
    const res = await api.post('/activities/columns', data)
    return res.data
  },

  // Actualizar columna (Admin)
  updateColumn: async (id, data) => {
    const res = await api.put(`/activities/columns/${id}`, data)
    return res.data
  },

  // Eliminar columna (Admin)
  deleteColumn: async (id) => {
    const res = await api.delete(`/activities/columns/${id}`)
    return res.data
  },

  // ==================== BOARD ====================
  
  // Obtener tablero completo (columnas + actividades agrupadas)
  getBoard: async (projectId) => {
    const res = await api.get('/activities/board', { params: { projectId } })
    return res.data
  },

  // ==================== ACTIVITIES ====================
  
  // Listar actividades con filtros opcionales
  getAll: async (filters = {}) => {
    const { projectId, columnId, assignedTo, priority } = filters
    const params = { projectId }
    if (columnId) params.columnId = columnId
    if (assignedTo) params.assignedTo = assignedTo
    if (priority) params.priority = priority
    
    const res = await api.get('/activities', { params })
    return res.data
  },

  // Obtener actividad por ID
  getById: async (id) => {
    const res = await api.get(`/activities/${id}`)
    return res.data
  },

  // Crear actividad
  create: async (data) => {
    const res = await api.post('/activities', data)
    return res.data
  },

  // Actualizar actividad
  update: async (id, data) => {
    const res = await api.put(`/activities/${id}`, data)
    return res.data
  },

  // Mover actividad (cambiar columna/posición)
  move: async (id, columnId, position = null) => {
    const payload = { columnId }
    if (position !== null) payload.position = position
    const res = await api.patch(`/activities/${id}/move`, payload)
    return res.data
  },

  // Eliminar actividad
  delete: async (id) => {
    const res = await api.delete(`/activities/${id}`)
    return res.data
  }
}

export default activityService