import api from './api'

export const authService = {
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password })
    return response.data
  },

  register: async (firstName, lastName, email, password, phoneNumber) => {
    const response = await api.post('/auth/register', { firstName, lastName, email, password, phoneNumber })
    return response.data
  },

  logout: () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }
}
