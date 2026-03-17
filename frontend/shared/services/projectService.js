import api from './api'

const projectService = {
  getAll: async () => {
    try {
      const response = await api.get('/projects')
      return Array.isArray(response.data) ? response.data : []
    } catch (error) {
      console.error('Error fetching projects:', error)
      return []
    }
  },

  getBySlug: async (slug) => {
    try {
      const response = await api.get(`/projects/slug/${slug}`)
      return response.data
    } catch (error) {
      console.error('Error fetching project by slug:', error)
      return null
    }
  },

  getById: async (id) => {
    try {
      const response = await api.get(`/projects/${id}`)
      return response.data
    } catch (error) {
      console.error('Error fetching project by ID:', error)
      return null
    }
  },
  create: async (data) => {
    try {
      const response = await api.post('/projects', data)
      return response.data
    } catch (error) {
      console.error('Error creating project:', error)
      throw error
    }
  },
  update: async (id, data) => {
    try {
      const response = await api.put(`/projects/${id}`, data)
      return response.data
    } catch (error) {
      console.error('Error updating project:', error)
      throw error
    }
  },
    delete: async (id) => {
    try {
      const response = await api.delete(`/projects/${id}`)
      return response.data
    } catch (error) {
      console.error('Error deleting project:', error)
      throw error
    }
  },
}

export default projectService