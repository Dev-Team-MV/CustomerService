import api from './api'
const PROJECT_ID = '69a73ce5b20401b061da6451'

const projectService = {
  getByIdLakewood: async () => {
    try {
      const response = await api.get(`/projects/${PROJECT_ID}`)
      return response.data
    } catch (error) {
      console.error('Error fetching project by ID:', error)
      return null
    }
  },

  update: async (data) => {
    try {
      const response = await api.put(`/projects/${PROJECT_ID}`, data)
      return response.data
    } catch (error) {
      console.error('Error updating project:', error)
      throw error
    }
  },
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
  }
}

export default projectService