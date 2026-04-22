import api from './api'
import buildingService from './buildingService'

export const propertyService = {
  // ─── Lakewood (Lots / Models / Facades) ────────────────────────────────────
// @/Users/oficina/MV-CRM/CustomerService/frontend/shared/services/propertyService.js
// Agregar después de deleteProperty (línea 110):

getAll: async (params = {}) => {
  try {
    const response = await api.get('/properties', { params })
    return Array.isArray(response.data) ? response.data : []
  } catch (error) {
    console.error('Error fetching properties:', error)
    return []
  }
},

getByProject: async (projectId) => {
  try {
    const response = await api.get('/properties', { params: { projectId } })
    return Array.isArray(response.data) ? response.data : []
  } catch (error) {
    console.error('Error fetching properties by project:', error)
    return []
  }
},
  getLots: async () => {
    try {
      const response = await api.get('/lots')
      return Array.isArray(response.data) ? response.data : []
    } catch (error) {
      console.error('Error fetching lots:', error)
      return []
    }
  },

  getModels: async () => {
    try {
      const response = await api.get('/models')
      return Array.isArray(response.data) ? response.data : []
    } catch (error) {
      console.error('Error fetching models:', error)
      return []
    }
  },

  getFacadesByModel: async (modelId) => {
    try {
      const response = await api.get(`/facades/model/${modelId}`)
      return Array.isArray(response.data) ? response.data : []
    } catch (error) {
      console.error('Error fetching facades:', error)
      return []
    }
  },

  getModelPricingOptions: async (modelId) => {
    try {
      const response = await api.get(`/models/${modelId}/pricing-options`)
      return response.data
    } catch (error) {
      console.error('Error fetching pricing options:', error)
      return null
    }
  },

  getFacades: async (modelId = null) => {
    try {
      const url = modelId ? `/facades?model=${modelId}` : '/facades'
      const response = await api.get(url)
      return Array.isArray(response.data) ? response.data : []
    } catch (error) {
      console.error('Error fetching facades:', error)
      return []
    }
  },

  getLotById: async (id) => {
    try {
      const response = await api.get(`/lots/${id}`)
      return response.data
    } catch (error) {
      console.error('Error fetching lot by ID:', error)
      return null
    }
  },

  getModelById: async (id) => {
    const response = await api.get(`/models/${id}`)
    return response.data
  },

  getFacadeById: async (id) => {
    const response = await api.get(`/facades/${id}`)
    return response.data
  },

  getLotStats: async () => {
    const response = await api.get('/lots/stats')
    return response.data
  },

  getPropertyStats: async () => {
    const response = await api.get('/properties/stats')
    return response.data
  },

  createProperty: async (propertyData) => {
    const response = await api.post('/properties', {
      ...propertyData,
      project:   propertyData.projectId || propertyData.project || undefined,
      projectId: propertyData.projectId || undefined,
    })
    return response.data
  },

  getPropertyById: async (id) => {
    const response = await api.get(`/properties/${id}`)
    return response.data
  },

  updateProperty: async (id, propertyData) => {
    const response = await api.put(`/properties/${id}`, propertyData)
    return response.data
  },

  deleteProperty: async (id) => {
    const response = await api.delete(`/properties/${id}`)
    return response.data
  },

  getPhasesByProperty: async (propertyId) => {
    const response = await api.get(`/phases/property/${propertyId}`)
    return response.data
  },

  getPhaseByNumber: async (propertyId, phaseNumber) => {
    const response = await api.get(`/phases/property/${propertyId}/phase/${phaseNumber}`)
    return response.data
  },

  calculateProgressiveDiscount: (baseDiscount, housesSold) => {
    const reductions = Math.floor(housesSold / 10)
    const discountReduction = reductions * 2
    return Math.max(0, baseDiscount - discountReduction)
  },

  calculateFinancials: (params) => {
    const {
      listPrice = 0,
      discountPercent = 0,
      downPaymentPercent = 10,
      initialDownPaymentPercent = 3,
      monthlyPaymentPercent = 2
    } = params

    const discount            = (listPrice * discountPercent) / 100
    const presalePrice        = listPrice - discount
    const totalDownPayment    = (presalePrice * downPaymentPercent) / 100
    const initialDownPayment  = (totalDownPayment * initialDownPaymentPercent) / 100
    const remaining           = presalePrice - totalDownPayment
    const monthlyPayment      = (remaining * monthlyPaymentPercent) / 100
    const mortgage            = presalePrice - totalDownPayment

    return {
      listPrice, discount, discountPercent, presalePrice,
      totalDownPayment, downPaymentPercent,
      initialDownPayment, initialDownPaymentPercent,
      monthlyPayment, monthlyPaymentPercent,
      mortgage
    }
  },

  // ─── Phase-2 / ISQ Apartment Quote ─────────────────────────────────────────

  getMasterPlan: async (projectId, onlyWithPolygon = false) => {
    try {
      const response = await api.get('/master-plan', {
        params: { projectId, onlyWithPolygon: onlyWithPolygon.toString() }
      })
      return response.data
    } catch (error) {
      console.error('Error fetching master plan:', error)
      throw error
    }
  },

  assignApartment: async (assignmentData) => {
    const {
      apartmentId,
      projectId,
      apartmentModelId,
      floorNumber,
      apartmentNumber,
      userId,
      price,
      initialPayment,
      floorPlanPolygonId,
      status = 'pending',
      selectedRenderType,
    } = assignmentData

    const payload = {
      projectId,
      apartmentModelId,
      floorNumber,
      apartmentNumber,
      user: userId,
      users: [userId],
      price,
      initialPayment,
      floorPlanPolygonId,
      status,
      selectedRenderType,
    }

    try {
      const response = apartmentId
        ? await buildingService.updateApartment(apartmentId, payload)
        : await buildingService.createApartment(payload)
      return response
    } catch (error) {
      console.error('Error assigning apartment:', error)
      throw error
    }
  },

  calculateApartmentFinancials: (params) => {
    const {
      listPrice = 0,
      discountPercent = 0,
      downPaymentPercent = 10,
      initialDownPaymentPercent = 3,
      monthlyPaymentPercent = 2,
      pending = 0,
    } = params

    const discount            = (listPrice * discountPercent) / 100
    const presalePrice        = listPrice - discount
    const totalDownPayment    = (presalePrice * downPaymentPercent) / 100
    const initialDownPayment  = (presalePrice * initialDownPaymentPercent) / 100
    const remaining           = presalePrice - totalDownPayment
    const monthlyPayment      = (remaining * monthlyPaymentPercent) / 100
    const mortgage            = presalePrice - totalDownPayment

    return {
      listPrice, discount, discountPercent,
      presalePrice, totalDownPayment, downPaymentPercent,
      initialDownPayment, initialDownPaymentPercent,
      monthlyPayment, monthlyPaymentPercent,
      mortgage, pending,
    }
  },
}

export default propertyService