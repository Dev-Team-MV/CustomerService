// @/Users/oficina/MV-CRM/CustomerService/frontend/shared/services/lotService.js

import api from './api'

const lotService = {
  getAll: async (filters = {}) => {
    try {
      const params = {}
      if (filters.projectId) params.projectId = filters.projectId
      if (filters.status) params.status = filters.status
      const response = await api.get('/lots', { params })
      return response.data
    } catch (error) {
      console.error('❌ Error fetching lots:', error)
      throw new Error(error.response?.data?.message || 'Failed to fetch lots')
    }
  },

  getById: async (id) => {
    try {
      const response = await api.get(`/lots/${id}`)
      return response.data
    } catch (error) {
      console.error('❌ Error fetching lot:', error)
      throw new Error(error.response?.data?.message || 'Failed to fetch lot')
    }
  },

  create: async (lotData) => {
    try {
      const payload = {
        projectId: lotData.projectId,
        number: lotData.number,
        price: Number(lotData.price),
        status: lotData.status || 'available'
      }
      const response = await api.post('/lots', payload)
      return response.data
    } catch (error) {
      console.error('❌ Error creating lot:', error)
      throw new Error(error.response?.data?.message || 'Failed to create lot')
    }
  },

  update: async (id, lotData) => {
    try {
      const payload = {}
      if (lotData.number !== undefined) payload.number = lotData.number
      if (lotData.price !== undefined) payload.price = Number(lotData.price)
      if (lotData.status !== undefined) payload.status = lotData.status
      const response = await api.put(`/lots/${id}`, payload)
      return response.data
    } catch (error) {
      console.error('❌ Error updating lot:', error)
      throw new Error(error.response?.data?.message || 'Failed to update lot')
    }
  },

  delete: async (id) => {
    try {
      const response = await api.delete(`/lots/${id}`)
      return response.data
    } catch (error) {
      console.error('❌ Error deleting lot:', error)
      throw new Error(error.response?.data?.message || 'Failed to delete lot')
    }
  }
}

export default lotService