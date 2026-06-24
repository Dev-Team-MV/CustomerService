// @shared/services/notificationService.js
import api from './api'
import { getApiUrl } from './apiUrl'

const notificationService = {
  // ═══════════════════════════════════════════════════════════
  // MÉTODOS EXISTENTES
  // ═══════════════════════════════════════════════════════════
  getLatest: async (size = 20) => {
    const response = await api.get('/notifications/latest', { params: { size } })
    return response.data?.data || []
  },

  markAsRead: async (notificationId) => {
    await api.post(`/notifications/${notificationId}/read`)
  },

  getWebSocketUrl: () => {
    const token = localStorage.getItem('token')
    if (!token) return null

    const apiUrl = getApiUrl()
    const base = apiUrl.replace(/\/api\/?$/, '')
    const protocol = base.startsWith('https') ? 'wss' : 'ws'
    const host = base.replace(/^https?:\/\//, '')
    return `${protocol}://${host}/ws/notifications?token=${encodeURIComponent(token)}`
  },

  // ═══════════════════════════════════════════════════════════
  // ✅ NUEVOS MÉTODOS PARA CREAR NOTIFICACIONES
  // ═══════════════════════════════════════════════════════════
  
  /**
   * Crear notificación general
   * @param {Object} data - { title, body, type, audience, targetUserIds, targetRoles, payload }
   */
  create: async (data) => {
    const response = await api.post('/notifications', data)
    return response.data
  },

  /**
   * Crear notificación para un rol específico
   * @param {string} role - 'superadmin' | 'admin' | 'owner' | 'user'
   * @param {Object} data - { title, body, type, payload }
   */
  createForRole: async (role, data) => {
    const response = await api.post(`/notifications/role/${role}`, data)
    return response.data
  },

  /**
   * Crear notificación para un usuario específico
   * @param {string} userId - ID del usuario
   * @param {Object} data - { title, body, type, audience, payload }
   */
  createForUser: async (userId, data) => {
    const response = await api.post(`/notifications/user/${userId}`, data)
    return response.data
  },

  /**
   * Crear notificación masiva para múltiples usuarios
   * @param {Array<string>} userIds - Array de IDs de usuarios
   * @param {Object} data - { title, body, type, payload }
   */
  createForMultipleUsers: async (userIds, data) => {
    const response = await api.post('/notifications', {
      ...data,
      targetUserIds: userIds
    })
    return response.data
  },

  /**
   * Crear notificación para múltiples roles
   * @param {Array<string>} roles - Array de roles
   * @param {Object} data - { title, body, type, payload }
   */
  createForMultipleRoles: async (roles, data) => {
    const response = await api.post('/notifications', {
      ...data,
      targetRoles: roles
    })
    return response.data
  }
}

export default notificationService