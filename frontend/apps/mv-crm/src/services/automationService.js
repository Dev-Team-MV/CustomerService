// apps/mv-crm/src/services/automationService.js
import api from '@shared/services/api'

const automationService = {
  /**
   * GET /api/crm/automations
   * Listar todas las automatizaciones con filtros opcionales
   * @param {Object} filters
   * @param {string} [filters.trigger] - lead_stage_changed | payment_overdue | appointment_created | inactivity_7days
   * @param {boolean} [filters.isActive] - Filtrar por estado activo/inactivo
   * @returns {Promise<{ automations: Array, total: number }>}
   */
  getAll: async (filters = {}) => {
    const res = await api.get('/crm/automations', { params: filters })
    return res.data
  },

  /**
   * GET /api/crm/automations/:id
   * Obtener una automatización específica
   * @param {string} id
   * @returns {Promise<Object>}
   */
  getById: async (id) => {
    const res = await api.get(`/crm/automations/${id}`)
    return res.data
  },

  /**
   * POST /api/crm/automations
   * Crear nueva automatización
   * @param {Object} data
   * @returns {Promise<Object>}
   */
  create: async (data) => {
    const res = await api.post('/crm/automations', data)
    return res.data
  },

  /**
   * PUT /api/crm/automations/:id
   * Actualizar automatización
   * @param {string} id
   * @param {Object} data
   * @returns {Promise<Object>}
   */
  update: async (id, data) => {
    const res = await api.put(`/crm/automations/${id}`, data)
    return res.data
  },

  /**
   * DELETE /api/crm/automations/:id
   * Eliminar automatización
   * @param {string} id
   * @returns {Promise<Object>}
   */
  delete: async (id) => {
    const res = await api.delete(`/crm/automations/${id}`)
    return res.data
  },

  /**
   * POST /api/crm/automations/:id/test
   * Probar automatización manualmente
   * @param {string} id
   * @param {Object} testData - { leadId, payloadId, appointmentId, previousStage }
   * @returns {Promise<Object>}
   */
  test: async (id, testData = {}) => {
    const res = await api.post(`/crm/automations/${id}/test`, testData)
    return res.data
  },

  /**
   * PUT /api/crm/automations/:id (solo isActive)
   * Activar/desactivar automatización
   * @param {string} id
   * @param {boolean} isActive
   * @returns {Promise<Object>}
   */
  toggleActive: async (id, isActive) => {
    const res = await api.put(`/crm/automations/${id}`, { isActive })
    return res.data
  }
}

export default automationService