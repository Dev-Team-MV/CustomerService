// @/Users/oficina/MV-CRM/CustomerService/frontend/shared/services/api.js
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// ✅ Interceptor para agregar el token automáticamente a cada request
api.interceptors.request.use(
  (config) => {
    console.log('📡 Making request to:', config.url)
    
    const token = localStorage.getItem('token')
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
      console.log('🔐 Token added to request')
    }
    
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// ✅ Interceptor mejorado - NO redirige automáticamente en login/register
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    console.error('❌ API Error:', error.response?.status, error.response?.data)
    
    // Solo redirigir a login si:
    // 1. Es un 401
    // 2. NO es una petición de login/register/me
    // 3. El usuario ya estaba autenticado (tiene token)
    const isAuthEndpoint = error.config?.url?.includes('/auth/login') || 
                          error.config?.url?.includes('/auth/register') ||
                          error.config?.url?.includes('/users/me/projects')
    
    if (error.response?.status === 401 && !isAuthEndpoint) {
      const hadToken = localStorage.getItem('token')
      if (hadToken) {
        console.warn('🔒 Token expired or invalid, redirecting to login')
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        // Solo redirigir si no estamos ya en login
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login'
        }
      }
    }
    
    return Promise.reject(error)
  }
)

export default api