import api from './api'
import { getApiUrl } from './apiUrl'

const notificationService = {
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
  }
}

export default notificationService
