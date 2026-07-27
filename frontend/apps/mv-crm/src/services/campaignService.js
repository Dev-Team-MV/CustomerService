// apps/mv-crm/src/services/campaignService.js
import api from '@shared/services/api'

const campaignService = {
  /**
   * GET /api/crm/campaigns
   * Listar campañas con filtros
   * @param {Object} filters
   * @param {string} [filters.status] - borrador | programada | enviando | completada | fallida
   * @param {string} [filters.projectId] - Filtrar por proyecto
   * @returns {Promise<{ campaigns: Array, total: number }>}
   */
  getAll: async (filters = {}) => {
    const res = await api.get('/crm/campaigns', { params: filters })
    return res.data
  },

  /**
   * GET /api/crm/campaigns/:id
   * Obtener campaña específica
   * @param {string} id
   * @returns {Promise<Object>}
   */
  getById: async (id) => {
    const res = await api.get(`/crm/campaigns/${id}`)
    return res.data
  },

  /**
   * POST /api/crm/campaigns
   * Crear campaña
   * @param {Object} data
   * @returns {Promise<Object>}
   */
  create: async (data) => {
    const res = await api.post('/crm/campaigns', data)
    return res.data
  },

  /**
   * PUT /api/crm/campaigns/:id
   * Actualizar campaña
   * @param {string} id
   * @param {Object} data
   * @returns {Promise<Object>}
   */
  update: async (id, data) => {
    const res = await api.put(`/crm/campaigns/${id}`, data)
    return res.data
  },

  /**
   * DELETE /api/crm/campaigns/:id
   * Eliminar campaña
   * @param {string} id
   * @returns {Promise<Object>}
   */
  delete: async (id) => {
    const res = await api.delete(`/crm/campaigns/${id}`)
    return res.data
  },

  /**
   * POST /api/crm/campaigns/:id/preview
   * Preview de destinatarios
   * @param {string} id
   * @returns {Promise<{ total: number, recipients: Array }>}
   */
  preview: async (id) => {
    const res = await api.post(`/crm/campaigns/${id}/preview`)
    return res.data
  },

  /**
   * POST /api/crm/campaigns/:id/send
   * Iniciar envío
   * @param {string} id
   * @returns {Promise<Object>}
   */
  send: async (id) => {
    const res = await api.post(`/crm/campaigns/${id}/send`)
    return res.data
  },

  /**
   * GET /api/crm/campaigns/:id/stats
   * Progreso en tiempo real
   * @param {string} id
   * @returns {Promise<Object>}
   */
  getStats: async (id) => {
    const res = await api.get(`/crm/campaigns/${id}/stats`)
    return res.data
  }
}

export default campaignService