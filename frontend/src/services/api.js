import axios from 'axios'

// Determine API base URL based on environment
const getBaseURL = () => {
  // If we're in production (Vercel), use Render backend
  if (window.location.hostname.includes('vercel.app')) {
    return 'https://customerservice-hy6v.onrender.com/api'
  }
  // Otherwise use environment variable or local proxy
  return import.meta.env.VITE_API_URL || '/api'
}

const api = axios.create({
  baseURL: getBaseURL(),
})

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
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
