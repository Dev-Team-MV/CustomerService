// frontend/apps/mv-crm/src/services/activityService.js
import api from '@shared/services/api'

const activityService = {
  // ==================== COLUMNS ====================
  
  // Obtener columnas (global o por proyecto)
  getColumns: async (projectId = null) => {
    const params = {}
    if (projectId) params.projectId = projectId
    const res = await api.get('/activities/columns', { params })
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
  
  // Obtener tablero completo (global o por proyecto)
  getBoard: async (projectId = null) => {
    const params = {}
    if (projectId) params.projectId = projectId
    const res = await api.get('/activities/board', { params })
    return res.data
  },

  // ==================== ACTIVITIES ====================
  
  // Listar actividades con filtros opcionales
  getAll: async (filters = {}) => {
    const { projectId, columnId, assignedTo, priority, relatedProjectId } = filters
    const params = {}
    if (projectId) params.projectId = projectId
    if (columnId) params.columnId = columnId
    if (assignedTo) params.assignedTo = assignedTo
    if (priority) params.priority = priority
    if (relatedProjectId) params.relatedProjectId = relatedProjectId  // Nuevo filtro
    
    const res = await api.get('/activities', { params })
    return res.data
  },

  // Obtener actividad por ID
  getById: async (id) => {
    const res = await api.get(`/activities/${id}`)
    return res.data
  },

  // Crear actividad (ahora acepta relatedProjects/projectIds y subtasks)
  create: async (data) => {
    const res = await api.post('/activities', data)
    return res.data
  },

  // Actualizar actividad (ahora acepta relatedProjects/projectIds y subtasks)
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
  },

  // ==================== SUBTASKS ====================

  // Crear subtask
  createSubtask: async (activityId, data) => {
    const res = await api.post(`/activities/${activityId}/subtasks`, data)
    return res.data
  },

  // Actualizar subtask
  updateSubtask: async (activityId, subtaskId, data) => {
    const res = await api.put(`/activities/${activityId}/subtasks/${subtaskId}`, data)
    return res.data
  },

  // Eliminar subtask
  deleteSubtask: async (activityId, subtaskId) => {
    const res = await api.delete(`/activities/${activityId}/subtasks/${subtaskId}`)
    return res.data
  },

  // ==================== THREADS (Comentarios/Mensajes) ====================

  // Agregar mensaje al hilo
  addThreadMessage: async (activityId, data) => {
    const res = await api.post(`/activities/${activityId}/threads`, data)
    return res.data
  }
}

export default activityService