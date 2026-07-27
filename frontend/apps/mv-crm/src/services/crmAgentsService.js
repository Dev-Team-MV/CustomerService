// apps/mv-crm/src/services/crmAgentsService.js
import api from '@shared/services/api'

const crmAgentsService = {
  /**
   * GET /api/crm/agents
   * Lista todos los agentes activos (admin y superadmin)
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
   * Métricas de rendimiento de un agente específico (mes actual)
   */
  getMetrics: async (agentId) => {
    const res = await api.get(`/crm/agents/${agentId}/metrics`)
    return res.data
  },

  /**
   * GET /api/crm/agents/:id/metrics - versión segura para hooks
   */
  getMetricsSafe: async (agentId) => {
    try {
      const res = await api.get(`/crm/agents/${agentId}/metrics`)
      return res.data
    } catch (error) {
      console.error('[CRM Agents] Error fetching metrics:', error)
      return null
    }
  },

  // ═══════════════════════════════════════════════════════════════
  // ✅ NUEVOS MÉTODOS PARA TARGETS (METAS)
  // ═══════════════════════════════════════════════════════════════

  /**
   * GET /api/crm/agents/:id/targets
   * Obtener metas y progreso de un agente para un mes específico
   * @param {string} agentId - ID del agente
   * @param {Object} options - { month, year } (opcionales, default: mes actual)
   * @returns {Promise<Object|null>}
   */
  getTargets: async (agentId, options = {}) => {
    try {
      const params = {}
      if (options.month) params.month = options.month
      if (options.year) params.year = options.year
      
      const res = await api.get(`/crm/agents/${agentId}/targets`, { params })
      return res.data
    } catch (error) {
      console.error('[CRM Agents] Error fetching targets:', error)
      return null
    }
  },

  /**
   * POST /api/crm/agents/:id/targets
   * Crear o actualizar metas mensuales de un agente
   * @param {string} agentId - ID del agente
   * @param {Object} data - { month, year, leads, conversions, appointments, smsCount }
   * @returns {Promise<Object>} Respuesta con targets + progress + completion actualizados
   */
  setTargets: async (agentId, data) => {
    const res = await api.post(`/crm/agents/${agentId}/targets`, data)
    return res.data
  }
}

export default crmAgentsService