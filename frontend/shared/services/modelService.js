// @/Users/oficina/MV-CRM/CustomerService/frontend/shared/services/modelService.js

import api from './api'

const modelService = {
  getAll: async (filters = {}) => {
    try {
      const params = {}
      if (filters.projectId) params.projectId = filters.projectId
      if (filters.status) params.status = filters.status
      const response = await api.get('/models', { params })
      return response.data
    } catch (error) {
      console.error('❌ Error fetching models:', error)
      throw new Error(error.response?.data?.message || 'Failed to fetch models')
    }
  },

  getById: async (id) => {
    try {
      const response = await api.get(`/models/${id}`)
      return response.data
    } catch (error) {
      console.error('❌ Error fetching model:', error)
      throw new Error(error.response?.data?.message || 'Failed to fetch model')
    }
  },

  create: async (modelData) => {
    try {
      const payload = {
        projectId: modelData.projectId,
        model: modelData.model,
        modelNumber: modelData.modelNumber,
        price: Number(modelData.price),
        bedrooms: Number(modelData.bedrooms) || 0,
        bathrooms: Number(modelData.bathrooms) || 0,
        sqft: Number(modelData.sqft) || 0,
        stories: Number(modelData.stories) || 4,
        status: modelData.status || 'active'
      }
      const response = await api.post('/models', payload)
      return response.data
    } catch (error) {
      console.error('❌ Error creating model:', error)
      throw new Error(error.response?.data?.message || 'Failed to create model')
    }
  },

  update: async (id, modelData) => {
    try {
      const payload = {}
      if (modelData.model !== undefined) payload.model = modelData.model
      if (modelData.modelNumber !== undefined) payload.modelNumber = modelData.modelNumber
      if (modelData.price !== undefined) payload.price = Number(modelData.price)
      if (modelData.bedrooms !== undefined) payload.bedrooms = Number(modelData.bedrooms)
      if (modelData.bathrooms !== undefined) payload.bathrooms = Number(modelData.bathrooms)
      if (modelData.sqft !== undefined) payload.sqft = Number(modelData.sqft)
      if (modelData.stories !== undefined) payload.stories = Number(modelData.stories)
      if (modelData.status !== undefined) payload.status = modelData.status
      const response = await api.put(`/models/${id}`, payload)
      return response.data
    } catch (error) {
      console.error('❌ Error updating model:', error)
      throw new Error(error.response?.data?.message || 'Failed to update model')
    }
  },

  delete: async (id) => {
    try {
      const response = await api.delete(`/models/${id}`)
      return response.data
    } catch (error) {
      console.error('❌ Error deleting model:', error)
      throw new Error(error.response?.data?.message || 'Failed to delete model')
    }
  }
}

export default modelService