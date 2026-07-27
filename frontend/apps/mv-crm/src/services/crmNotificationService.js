// apps/mv-crm/src/services/crmNotificationService.js
import api from '@shared/services/api'

const crmNotificationService = {
  /**
   * GET /api/crm/notifications/count
   * Obtiene solo el conteo total de alertas (para el badge)
   * @returns {Promise<{ count: number }>}
   */
  getCount: async () => {
    const res = await api.get('/crm/notifications/count')
    return res.data
  },

  /**
   * GET /api/crm/notifications
   * Obtiene todas las alertas agrupadas por tipo
   * @returns {Promise<Object>} { alerts, byType, counts }
   */
  getAll: async () => {
    const res = await api.get('/crm/notifications')
    return res.data
  },

  /**
   * POST /api/crm/notifications/{alertType}/{entityId}/read
   * Marca una alerta específica como leída en el backend
   * @param {string} alertType - 'overdue_payment' | 'upcoming_activity' | 'stale_lead'
   * @param {string} entityId - ID de la entidad (payment, activity, lead)
   * @returns {Promise<Object>}
   */
  markAsRead: async (alertType, entityId) => {
    const res = await api.post(`/crm/notifications/${alertType}/${entityId}/read`)
    return res.data
  }
}

export default crmNotificationService