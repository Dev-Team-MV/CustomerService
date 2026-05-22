// frontend/apps/lakewood-p1/src/services/EagleViewService.js
import api from '@shared/services/api'

const EagleViewService = {
  getAll: async () => {
    const res = await api.get('/eagle-view')
    return res.data
  },

  getById: async (id) => {
    const res = await api.get(`/eagle-view/${id}`)
    return res.data
  },

  create: async (data) => {
    const res = await api.post('/eagle-view', data)  // Sin headers
    return res.data
  },

  update: async (id, data) => {
    const res = await api.put(`/eagle-view/${id}`, data)
    return res.data
  },

  delete: async (id) => {
    const res = await api.delete(`/eagle-view/${id}`)
    return res.data
  },

  updateMediaVisibility: async (id, mediaIndex, isPublic) => {
    const res = await api.patch(`/eagle-view/${id}/media/${mediaIndex}/visibility`, { isPublic })
    return res.data
  }
}

export default EagleViewService