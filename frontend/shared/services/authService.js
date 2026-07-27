// /Users/oficina/MV-CRM/CustomerService/frontend/shared/services/authService.js

import api from './api'

export const authService = {
  me: async (token) => {
    const response = await api.get('/auth/profile', {
      headers: { Authorization: `Bearer ${token}` }
    })
    return response.data
  },

  login: async (emailOrPhone, password, isPhone = false) => {
    const payload = isPhone 
      ? { phoneNumber: emailOrPhone, password }
      : { email: emailOrPhone, password }
    
    console.log('📤 Login payload:', payload)
    
    const response = await api.post('/auth/login', payload)
    return response.data
  },

  register: async (firstName, lastName, email, password, phoneNumber, skipPasswordSetup = false) => {
    return await api.post('/auth/register', {
      firstName,
      lastName,
      email,
      password,
      phoneNumber,
      skipPasswordSetup
    })
  },

  logout: () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  },

  changePassword: async (currentPassword, newPassword) => {
    const response = await api.put('/auth/change-password', {
      currentPassword,
      newPassword
    })
    return response.data
  },

  getProfile: async () => {
    const response = await api.get('/auth/profile')
    return response.data
  },

   /**
   * Establecer nueva contraseña cuando mustChangePassword es true 
   * (NO requiere currentPassword)
   * @param {string} newPassword - La nueva contraseña
   * @returns {Promise<Object>} Respuesta con el nuevo payload de autenticación
   */
  completeRequiredPassword: async (newPassword) => {
    try {
      const response = await api.put('/auth/complete-required-password', {
        newPassword
      })
      return response.data
    } catch (error) {
      console.error('Error completing required password change:', error)
      throw error
    }
  },

  // ═══════════════════════════════════════════════════════════════
  // ✅ RECUPERACIÓN DE CONTRASEÑA
  // ═══════════════════════════════════════════════════════════════

  /**
   * Solicitar recuperación de contraseña
   * Envía código 2FA por SMS o email según el canal especificado
   * @param {string} email - Email del usuario
   * @param {string} channel - Canal de envío: 'sms' | 'email'
   * @returns {Promise<Object>} Respuesta genérica (no revela si el email existe)
   */
  forgotPassword: async (email, channel = 'email') => {
    try {
      const response = await api.post('/auth/forgot-password', {
        email,
        channel
      })
      return response.data
    } catch (error) {
      console.error('Error requesting password reset:', error)
      throw error
    }
  },

  /**
   * Verificar código 2FA de recuperación
   * @param {string} email - Email del usuario
   * @param {string} code - Código de 6 dígitos
   * @returns {Promise<Object>} { message, resetToken, expiresInMinutes }
   */
  verifyResetCode: async (email, code) => {
    try {
      const response = await api.post('/auth/forgot-password/verify', {
        email,
        code
      })
      return response.data
    } catch (error) {
      console.error('Error verifying reset code:', error)
      throw error
    }
  },

  /**
   * Establecer nueva contraseña usando el resetToken
   * @param {string} resetToken - Token obtenido al verificar el código
   * @param {string} password - Nueva contraseña
   * @returns {Promise<Object>} Respuesta con JWT para login inmediato
   */
  resetPassword: async (resetToken, password) => {
    try {
      const response = await api.post('/auth/reset-password', {
        resetToken,
        password
      })
      return response.data
    } catch (error) {
      console.error('Error resetting password:', error)
      throw error
    }
  },


  // ═══════════════════════════════════════════════════════════════
  // ✅ IMPERSONACIÓN (SOLO SUPERADMIN)
  // ═══════════════════════════════════════════════════════════════

  /**
   * Iniciar impersonación de un usuario
   * Solo disponible para superadmin
   * @param {string} userId - ID del usuario a impersonar
   * @returns {Promise<Object>} { token, user, impersonation: { active, impersonatedBy } }
   */
  startImpersonation: async (userId) => {
    try {
      const response = await api.post(`/auth/impersonate/${userId}`)
      return response.data
    } catch (error) {
      console.error('Error starting impersonation:', error)
      throw error
    }
  },

  /**
   * Detener impersonación y restaurar sesión de superadmin
   * @returns {Promise<Object>} { token, user, impersonation }
   */
  stopImpersonation: async () => {
    try {
      const response = await api.post('/auth/impersonate/stop')
      return response.data
    } catch (error) {
      console.error('Error stopping impersonation:', error)
      throw error
    }
  },

  /**
   * Verificar estado de impersonación (desde el perfil)
   * @returns {Promise<Object|null>} Datos de impersonación o null
   */
  getImpersonationStatus: async () => {
    try {
      const response = await api.get('/auth/profile')
      return response.data.impersonation || null
    } catch (error) {
      console.error('Error checking impersonation status:', error)
      return null
    }
  }
}