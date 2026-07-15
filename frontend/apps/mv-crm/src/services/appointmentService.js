// apps/mv-crm/src/services/appointmentService.js
import api from '@shared/services/api'

const appointmentService = {
  /**
   * GET /api/crm/appointments
   * Obtener todas las citas con filtros opcionales
   * @param {Object} filters
   * @param {string} [filters.assignedTo] - ID del asesor asignado
   * @param {string} [filters.projectId] - ID del proyecto
   * @param {string} [filters.status] - pendiente | confirmada | completada | cancelada
   * @param {string} [filters.dateFrom] - Fecha inicio (ISO string)
   * @param {string} [filters.dateTo] - Fecha fin (ISO string)
   * @returns {Promise<{ appointments: Array, total: number }>}
   */
  getAll: async (filters = {}) => {
    const params = {}
    
    if (filters.assignedTo) params.assignedTo = filters.assignedTo
    if (filters.projectId) params.projectId = filters.projectId
    if (filters.status) params.status = filters.status
    if (filters.dateFrom) params.dateFrom = new Date(filters.dateFrom).toISOString()
    if (filters.dateTo) params.dateTo = new Date(filters.dateTo).toISOString()
    
    const res = await api.get('/crm/appointments', { params })
    return res.data
  },

  /**
   * POST /api/crm/appointments
   * Crear nueva cita
   * @param {Object} data
   * @param {string} data.type - visita | llamada | reunion
   * @param {string} [data.leadId] - ID del lead
   * @param {string} [data.clientId] - ID del cliente
   * @param {string} [data.projectId] - ID del proyecto
   * @param {string} [data.assignedTo] - ID del asesor asignado
   * @param {string} data.title - Título de la cita
   * @param {string} [data.notes] - Notas
   * @param {string} data.startDate - Fecha inicio (ISO string)
   * @param {string} data.endDate - Fecha fin (ISO string)
   * @param {string} [data.status='pendiente'] - Status inicial
   * @returns {Promise<Object>}
   */
  create: async (data) => {
    const res = await api.post('/crm/appointments', data)
    return res.data
  },

  /**
   * PUT /api/crm/appointments/:id
   * Actualizar cita completa
   * @param {string} id - ID de la cita
   * @param {Object} data - Datos a actualizar
   * @returns {Promise<Object>}
   */
  update: async (id, data) => {
    const res = await api.put(`/crm/appointments/${id}`, data)
    return res.data
  },

  /**
   * PUT /api/crm/appointments/:id/status
   * Actualizar solo el status de la cita
   * @param {string} id - ID de la cita
   * @param {string} status - pendiente | confirmada | completada | cancelada
   * @returns {Promise<Object>}
   */
  updateStatus: async (id, status) => {
    const res = await api.put(`/crm/appointments/${id}/status`, { status })
    return res.data
  },

  /**
   * DELETE /api/crm/appointments/:id
   * Eliminar cita
   * @param {string} id - ID de la cita
   * @returns {Promise<Object>}
   */
  delete: async (id) => {
    const res = await api.delete(`/crm/appointments/${id}`)
    return res.data
  }
}

export default appointmentService