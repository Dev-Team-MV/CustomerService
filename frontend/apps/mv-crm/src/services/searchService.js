// apps/mv-crm/src/services/searchService.js
import api from '@shared/services/api'

const searchService = {
  /**
   * GET /api/crm/search
   * Búsqueda global en el CRM
   * @param {string} query - Término de búsqueda
   * @param {Object} options - Opciones de búsqueda
   * @param {string[]} [options.types] - Tipos a buscar: ['clients', 'leads', 'activities', 'appointments']
   * @param {number} [options.limit=10] - Límite de resultados por tipo
   * @returns {Promise<Object>}
   */
  search: async (query, options = {}) => {
    const params = {
      q: query,
      limit: options.limit || 10
    }
    
    if (options.types && options.types.length > 0) {
      params.types = options.types.join(',')
    }
    
    const res = await api.get('/crm/search', { params })
    return res.data
  },

  /**
   * Búsqueda específica por tipo
   */
  searchClients: async (query, limit = 10) => {
    const res = await api.get('/crm/search', { params: { q: query, types: 'clients', limit } })
    return res.data.clients || []
  },

  searchLeads: async (query, limit = 10) => {
    const res = await api.get('/crm/search', { params: { q: query, types: 'leads', limit } })
    return res.data.leads || []
  },

  searchActivities: async (query, limit = 10) => {
    const res = await api.get('/crm/search', { params: { q: query, types: 'activities', limit } })
    return res.data.activities || []
  },

  searchAppointments: async (query, limit = 10) => {
    const res = await api.get('/crm/search', { params: { q: query, types: 'appointments', limit } })
    return res.data.appointments || []
  }
}

export default searchService