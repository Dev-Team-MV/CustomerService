// @shared/services/newsService.js
import api from './api'

const newsService = {
  // ✅ Get all news (Admin) - with optional projectId filter
  getAllNews: async (params = {}) => {
    try {
      const response = await api.get('/news', { params })
      return response.data
    } catch (error) {
      console.error('❌ Error fetching all news:', error)
      throw error.response?.data?.message || 'Error fetching news'
    }
  },

  // ✅ Get published news (Public) - with optional projectId filter
  getPublishedNews: async (params = {}) => {
    try {
      const response = await api.get('/news/published', { params })
      return response.data
    } catch (error) {
      console.error('❌ Error fetching published news:', error)
      throw error.response?.data?.message || 'Error fetching published news'
    }
  },

  // ✅ Get news by ID
  getNewsById: async (id) => {
    try {
      const response = await api.get(`/news/${id}`)
      return response.data
    } catch (error) {
      console.error('❌ Error fetching news by ID:', error)
      throw error.response?.data?.message || 'Error fetching news'
    }
  },

  // ✅ Create news
  createNews: async (newsData) => {
    try {
      const response = await api.post('/news', newsData)
      return response.data
    } catch (error) {
      console.error('❌ Error creating news:', error)
      throw error.response?.data?.message || 'Error creating news'
    }
  },

  // ✅ Update news
  updateNews: async (id, newsData) => {
    try {
      const response = await api.put(`/news/${id}`, newsData)
      return response.data
    } catch (error) {
      console.error('❌ Error updating news:', error)
      throw error.response?.data?.message || 'Error updating news'
    }
  },

  // ✅ Delete news
  deleteNews: async (id) => {
    try {
      const response = await api.delete(`/news/${id}`)
      return response.data
    } catch (error) {
      console.error('❌ Error deleting news:', error)
      throw error.response?.data?.message || 'Error deleting news'
    }
  }
}

export default newsService