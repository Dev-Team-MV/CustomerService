import axios from 'axios'

// Use production URL by default, local only in development
const isLocalDev = import.meta.env.DEV || window.location.hostname === 'localhost'
const baseURL = isLocalDev ? '/api' : 'https://customerservice-hy6v.onrender.com/api'

console.log('API Base URL:', baseURL, 'isDev:', import.meta.env.DEV, 'hostname:', window.location.hostname)

const api = axios.create({
  baseURL: baseURL,
})

// Force the baseURL to be set correctly
api.defaults.baseURL = baseURL

api.interceptors.request.use(
  (config) => {
    // Ensure baseURL is always correct on every request
    if (!config.url.startsWith('http')) {
      config.baseURL = baseURL
    }
    
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    console.log('Making request to:', config.baseURL + config.url)
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api
