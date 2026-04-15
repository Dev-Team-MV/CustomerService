import api from './api'

const parkingSpotService = {
  // Get all parking spots with optional filters
  getAll: async (filters = {}) => {
    const params = new URLSearchParams()
    if (filters.buildingId) params.append('buildingId', filters.buildingId)
    if (filters.floorNumber) params.append('floorNumber', filters.floorNumber)
    if (filters.status) params.append('status', filters.status)
    if (filters.spotType) params.append('spotType', filters.spotType)
    
    const response = await api.get(`/parking-spots?${params.toString()}`)
    return response.data
  },

  // Get by building
  getByBuilding: async (buildingId) => {
    const response = await api.get(`/parking-spots?buildingId=${buildingId}`)
    return response.data
  },

  // Get by floor
  getByFloor: async (buildingId, floorNumber) => {
    const response = await api.get(`/parking-spots?buildingId=${buildingId}&floorNumber=${floorNumber}`)
    return response.data
  },

  // Get single spot
  getById: async (id) => {
    const response = await api.get(`/parking-spots/${id}`)
    return response.data
  },

  // Create parking spot
  create: async (spotData) => {
    const response = await api.post('/parking-spots', spotData)
    return response.data
  },

  // Update parking spot
  update: async (id, spotData) => {
    const response = await api.put(`/parking-spots/${id}`, spotData)
    return response.data
  },

  // Delete parking spot
  delete: async (id) => {
    const response = await api.delete(`/parking-spots/${id}`)
    return response.data
  },

  // Bulk create spots (useful for initial setup)
  bulkCreate: async (spotsArray) => {
    const response = await api.post('/parking-spots/bulk', { spots: spotsArray })
    return response.data
  },

  // Assign spot to apartment
  assignToApartment: async (spotId, apartmentId) => {
    const response = await api.put(`/parking-spots/${spotId}`, {
      apartment: apartmentId,
      status: 'occupied'
    })
    return response.data
  },

  // Release spot
  releaseSpot: async (spotId) => {
    const response = await api.put(`/parking-spots/${spotId}`, {
      apartment: null,
      status: 'available'
    })
    return response.data
  }
}

export default parkingSpotService