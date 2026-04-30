import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api'

const sanitizeQueryParams = (params) => {
  if (!params || typeof params !== 'object') return params

  const cleaned = {}
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null) continue
    if (typeof value === 'string') {
      const normalized = value.trim()
      if (normalized === '' || normalized === 'undefined' || normalized === 'null') continue
      cleaned[key] = normalized
      continue
    }
    cleaned[key] = value
  }
  return cleaned
}

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// ✅ Interceptor para agregar el token automáticamente a cada request
api.interceptors.request.use(
  (config) => {
    if (config.params) {
      config.params = sanitizeQueryParams(config.params)
    }

    console.log('📡 Making request to:', config.url)
    
    // Obtener token del localStorage
    const token = localStorage.getItem('token')
    
    // Si existe token, agregarlo a los headers
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

// Interceptor para manejar errores de respuesta
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    console.error('❌ API Error:', error.response?.status, error.response?.data)
    
    // Si el token expiró o es inválido, redirigir al login
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    
    return Promise.reject(error)
  }
)

export default api