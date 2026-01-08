import axios from 'axios'

const API_URL = '/api/auth'

export const authService = {
  login: async (email, password) => {
    const response = await axios.post(`${API_URL}/login`, { email, password })
    return response.data
  },

  register: async (firstName, lastName, email, password, phoneNumber) => {
    const response = await axios.post(`${API_URL}/register`, { firstName, lastName, email, password, phoneNumber })
    return response.data
  },

  logout: () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }
}
