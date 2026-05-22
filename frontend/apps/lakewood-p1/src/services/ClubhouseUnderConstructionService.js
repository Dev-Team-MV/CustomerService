// frontend/apps/lakewood-p1/src/services/ClubhouseUnderConstructionService.js
import api from '@shared/services/api'

const ClubhouseUnderConstructionService = {
  getAll: async () => {
    const res = await api.get('/clubhouse/timeline')
    return res.data
  },

  create: async (data) => {
    const res = await api.post('/clubhouse/timeline', data)  // Sin headers
    return res.data
  },

  update: async (stepId, data) => {
    const res = await api.put(`/clubhouse/timeline/${stepId}`, data)
    return res.data
  },

  delete: async (stepId) => {
    const res = await api.delete(`/clubhouse/timeline/${stepId}`)
    return res.data
  }
}

export default ClubhouseUnderConstructionService