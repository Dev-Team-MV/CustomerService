import api from './api'

export const authService = {
  login: async (emailOrPhone, password, isPhone = false) => {
    // ✅ Determinar si es email o teléfono
    const payload = isPhone 
      ? { phoneNumber: emailOrPhone, password }
      : { email: emailOrPhone, password }
    
    console.log('📤 Login payload:', payload)
    
    const response = await api.post('/auth/login', payload)
    return response.data
  },


  register: async (firstName, lastName, email, password, phoneNumber) => {
    const response = await api.post('/auth/register', { firstName, lastName, email, password, phoneNumber })
    return response.data
  },

  logout: () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  },

    changePassword: async (currentPassword, newPassword) => {
    // Asegúrate que la URL sea relativa al backend, no al frontend
    const response = await api.put('/auth/change-password', {
      currentPassword,
      newPassword
    })
    return response.data
  }
}
