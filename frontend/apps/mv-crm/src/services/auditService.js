// apps/mv-crm/src/services/auditService.js
import api from '@shared/services/api'

// ═══════════════════════════════════════════════════════════════
// CONSTANTES
// ═══════════════════════════════════════════════════════════════

export const AUDIT_ENTITIES = ['Lead', 'Client', 'Activity', 'Appointment', 'Campaign']

export const AUDIT_ACTIONS = ['created', 'updated', 'deleted', 'stage_changed', 'sms_sent', 'login']

// ═══════════════════════════════════════════════════════════════
// SERVICIO
// ═══════════════════════════════════════════════════════════════

const auditService = {
  /**
   * Obtener audit log con filtros y paginación
   * Todos los parámetros son opcionales
   * @param {Object} params
   * @param {string} params.entity - Lead | Client | Activity | Appointment | Campaign
   * @param {string} params.entityId - ID de la entidad específica
   * @param {string} params.userId - ID del usuario
   * @param {string} params.action - created | updated | deleted | stage_changed | sms_sent | login
   * @param {string} params.dateFrom - Fecha desde (ISO)
   * @param {string} params.dateTo - Fecha hasta (ISO)
   * @param {number} params.page - Página (default: 1)
   * @param {number} params.limit - Límite (default: 20)
   * @returns {Promise<{logs: Array, pagination: Object}>}
   */
  getLogs: async (params = {}) => {
    try {
      // Limpiar parámetros vacíos/null/undefined
      const cleanParams = Object.entries(params).reduce((acc, [key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          acc[key] = value
        }
        return acc
      }, {})

      const res = await api.get('/crm/audit', { params: cleanParams })
      
      return {
        logs: res.data.logs || [],
        pagination: res.data.pagination || {
          page: 1,
          limit: 20,
          total: 0,
          totalPages: 0
        }
      }
    } catch (error) {
      console.error('Error fetching audit logs:', error)
      throw error
    }
  },

  /**
   * Obtener audit log de una entidad específica
   * @param {string} entity - Tipo de entidad
   * @param {string} entityId - ID de la entidad
   * @param {Object} options - Opciones adicionales
   */
  getEntityLogs: async (entity, entityId, options = {}) => {
    return auditService.getLogs({
      entity,
      entityId,
      ...options
    })
  },

  /**
   * Obtener audit log de un usuario específico
   * @param {string} userId - ID del usuario
   * @param {Object} options - Opciones adicionales
   */
  getUserLogs: async (userId, options = {}) => {
    return auditService.getLogs({
      userId,
      ...options
    })
  },

  /**
   * Obtener solo cambios de etapa de una entidad
   * @param {string} entity - Tipo de entidad
   * @param {string} entityId - ID de la entidad
   */
  getStageChanges: async (entity, entityId, options = {}) => {
    return auditService.getLogs({
      entity,
      entityId,
      action: 'stage_changed',
      ...options
    })
  }
}

export default auditService