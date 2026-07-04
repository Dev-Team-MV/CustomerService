// apps/mv-crm/src/services/crmAgentsService.js
import api from '@shared/services/api'

const crmAgentsService = {
  /**
   * GET /api/crm/agents
   * Lista todos los agentes activos (admin y superadmin)
   * @returns {Promise<{ agents: Array, total: number }>}
   */
  getAll: async () => {
    const res = await api.get('/crm/agents')
    return {
      agents: res.data.agents || [],
      total: res.data.total || 0
    }
  },

  /**
   * GET /api/crm/agents/:id/metrics
   * Obtiene métricas de rendimiento de un agente específico (mes actual)
   * @param {string} agentId - ID del agente
   * @returns {Promise<Object>} Métricas del agente (leads, activities, clientsServed, period)
   */
  getMetrics: async (agentId) => {
    const res = await api.get(`/crm/agents/${agentId}/metrics`)
    return res.data
  },

  /**
   * GET /api/crm/agents/:id/metrics
   * Versión con manejo de error para usar en hooks
   * @param {string} agentId - ID del agente
   * @returns {Promise<Object|null>}
   */
  getMetricsSafe: async (agentId) => {
    try {
      const res = await api.get(`/crm/agents/${agentId}/metrics`)
      return res.data
    } catch (error) {
      console.error('[CRM Agents] Error fetching metrics:', error)
      return null
    }
  }
}

export default crmAgentsService