// @/Users/oficina/MV-CRM/CustomerService/frontend/shared/services/facadeService.js

import api from './api'

const facadeService = {
  getAll: async (filters = {}) => {
    try {
      const params = {}
      if (filters.modelId) params.model = filters.modelId
      if (filters.projectId) params.projectId = filters.projectId
      const response = await api.get('/facades', { params })
      return response.data
    } catch (error) {
      console.error('❌ Error fetching facades:', error)
      throw new Error(error.response?.data?.message || 'Failed to fetch facades')
    }
  },

  getById: async (id) => {
    try {
      const response = await api.get(`/facades/${id}`)
      return response.data
    } catch (error) {
      console.error('❌ Error fetching facade:', error)
      throw new Error(error.response?.data?.message || 'Failed to fetch facade')
    }
  },

// @/Users/oficina/MV-CRM/CustomerService/frontend/shared/services/facadeService.js

create: async (facadeData) => {
  try {
    const payload = {
      model: facadeData.model,
      title: facadeData.title,
      price: Number(facadeData.price),
      url: facadeData.url || [],
      projectId: facadeData.projectId  // ✅ Agregar projectId
    }
    const response = await api.post('/facades', payload)
    return response.data
  } catch (error) {
    console.error('❌ Error creating facade:', error)
    throw new Error(error.response?.data?.message || 'Failed to create facade')
  }
},

  update: async (id, facadeData) => {
    try {
      const payload = {}
      if (facadeData.title !== undefined) payload.title = facadeData.title
      if (facadeData.price !== undefined) payload.price = Number(facadeData.price)
      if (facadeData.url !== undefined) payload.url = facadeData.url
      const response = await api.put(`/facades/${id}`, payload)
      return response.data
    } catch (error) {
      console.error('❌ Error updating facade:', error)
      throw new Error(error.response?.data?.message || 'Failed to update facade')
    }
  },

  delete: async (id) => {
    try {
      const response = await api.delete(`/facades/${id}`)
      return response.data
    } catch (error) {
      console.error('❌ Error deleting facade:', error)
      throw new Error(error.response?.data?.message || 'Failed to delete facade')
    }
  }
}

export default facadeService