import api from '@shared/services/api'

const userService = {
  getAll: async () => {
    try {
      const response = await api.get('/users')
      return Array.isArray(response.data) ? response.data : []
    } catch (error) {
      console.error('Error fetching users:', error)
      return []
    }
  },

  getById: async (id) => {
    try {
      const response = await api.get(`/users/${id}`)
      return response.data
    } catch (error) {
      console.error('Error fetching user by ID:', error)
      return null
    }
  },

  search: async (query) => {
    try {
      const response = await api.get('/users/search', { params: { q: query } })
      return Array.isArray(response.data) ? response.data : []
    } catch (error) {
      console.error('Error searching users:', error)
      return []
    }
  },

  update: async (id, data) => {
    try {
      const response = await api.put(`/users/${id}`, data)
      return { success: true, data: response.data }
    } catch (error) {
      console.error('Error updating user:', error)
      return { success: false, error: error?.response?.data?.message || 'Update failed' }
    }
  },

    updateProfile: async (id, data) => {
    try {
      const response = await api.put(`/users/${id}`, {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phoneNumber: data.phoneNumber,
        birthday: data.birthday
      })
      return response.data
    } catch (error) {
      console.error('Error updating profile:', error)
      throw error
    }
  },

  delete: async (id) => {
    try {
      await api.delete(`/users/${id}`)
      return { success: true }
    } catch (error) {
      console.error('Error deleting user:', error)
      return { success: false, error: error?.response?.data?.message || 'Delete failed' }
    }
  },

    getMyProjects: async () => {
    try {
      const response = await api.get('/users/me/projects')
      return Array.isArray(response.data) ? response.data : []
    } catch (error) {
      console.error('Error fetching user projects:', error)
      return []
    }
  },
}

export default userService