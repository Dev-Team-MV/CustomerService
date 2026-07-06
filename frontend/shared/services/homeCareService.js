// @/Users/oficina/MV-CRM/CustomerService/frontend/shared/services/homecareService.js
import axios from 'axios'

const homecareApi = axios.create({
  baseURL: 'https://apihcdev.michelangelodelvalle.com/api',
  headers: {
    'Content-Type': 'application/json'
  }
})

homecareApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

const EMPTY_STATUS = {
  assetType: null,
  assetId: null,
  propertyId: null,
  apartmentId: null,
  activeStatus: null,
  activeAppointmentId: null,
  activeScheduledAt: null,
  activeServiceId: null,
  total: 0,
  counts: {
    pending: 0,
    confirmed: 0,
    in_progress: 0,
    completed: 0,
    cancelled: 0
  }
}

export const homecareService = {
  async getPropertyStatus(propertyId, projectId = null) {
    try {
      const params = { propertyId }
      if (projectId) params.projectId = projectId
      
      const response = await homecareApi.get('/appointments/property-status', { params })
      
      console.log('🏠 [homecareService] getPropertyStatus response:', response.data)
      
      // El endpoint devuelve un array, tomar el primer elemento
      const data = Array.isArray(response.data) ? response.data[0] : response.data
      
      console.log('🏠 [homecareService] Extracted data:', data)
      
      return data || { ...EMPTY_STATUS, propertyId }
    } catch (error) {
      console.error('❌ [homecareService] getPropertyStatus error:', error)
      return { ...EMPTY_STATUS, propertyId }
    }
  },

  async getApartmentStatus(apartmentId, projectId = null) {
    try {
      const params = { apartmentId }
      if (projectId) params.projectId = projectId
      
      const response = await homecareApi.get('/appointments/property-status', { params })
      const data = Array.isArray(response.data) ? response.data[0] : response.data
      
      return data || { ...EMPTY_STATUS, apartmentId }
    } catch (error) {
      return { ...EMPTY_STATUS, apartmentId }
    }
  },

  async getMultiplePropertyStatus(propertyIds, projectId = null) {
    console.log('🏠 [homecareService] getMultiplePropertyStatus - IDs:', propertyIds)
    
    if (!propertyIds || propertyIds.length === 0) {
      console.log('⚠️ [homecareService] No propertyIds provided')
      return {}
    }
    
    const results = await Promise.all(
      propertyIds.map(async (propertyId) => {
        const status = await this.getPropertyStatus(propertyId, projectId)
        console.log(`🏠 [homecareService] Property ${propertyId} status:`, status)
        return { propertyId, status }
      })
    )
    
    const statusMap = results.reduce((acc, { propertyId, status }) => {
      acc[propertyId] = status
      return acc
    }, {})
    
    console.log('✅ [homecareService] Final statusMap:', statusMap)
    return statusMap
  },

  async getMultipleApartmentStatus(apartmentIds, projectId = null) {
    if (!apartmentIds || apartmentIds.length === 0) return {}
    
    const results = await Promise.all(
      apartmentIds.map(async (apartmentId) => {
        const status = await this.getApartmentStatus(apartmentId, projectId)
        return { apartmentId, status }
      })
    )
    
    return results.reduce((acc, { apartmentId, status }) => {
      acc[apartmentId] = status
      return acc
    }, {})
  }
}

export default homecareService