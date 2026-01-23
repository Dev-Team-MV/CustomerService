import axios from 'axios'

// PRODUCTION URL - hardcoded for Vercel deployment
const PRODUCTION_API_URL = 'https://customerservice-hy6v.onrender.com/api'

const api = axios.create({
  baseURL: PRODUCTION_API_URL,
})

console.log('🚀 API configured with baseURL:', PRODUCTION_API_URL)

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    console.log('📡 Making request to:', config.baseURL + config.url)
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
