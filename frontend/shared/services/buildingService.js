// @shared/services/buildingService.js
import api from './api'

const buildingService = {
  // ── BUILDINGS ──────────────────────────────────────────────
  getAll: async (filters = {}) => {
    try {
      const params = {}
      if (filters.projectId) params.projectId = filters.projectId
      if (filters.status) params.status = filters.status
      const response = await api.get('/buildings', { params })
      return response.data
    } catch (error) {
      console.error('❌ Error fetching buildings:', error)
      throw new Error(error.response?.data?.message || 'Failed to fetch buildings')
    }
  },

  getById: async (id) => {
    try {
      const response = await api.get(`/buildings/${id}`)
      return response.data
    } catch (error) {
      console.error('❌ Error fetching building:', error)
      throw new Error(error.response?.data?.message || 'Failed to fetch building')
    }
  },

  create: async (buildingData) => {
    try {
      const payload = {
        projectId: buildingData.project || buildingData.projectId,
        name: buildingData.name,
        section: buildingData.section,
        floors: Number(buildingData.floors),
        totalApartments: Number(buildingData.totalApartments) || 0,
        floorPlans: buildingData.floorPlans || [],
        exteriorRenders: buildingData.exteriorRenders || [],
        polygon: buildingData.polygon || [],
        buildingFloorPolygons: buildingData.buildingFloorPolygons || [],
        status: buildingData.status || 'active',
        quoteRef: buildingData.quoteRef || {}  // ✅ Agregar quoteRef
      }
      const response = await api.post('/buildings', payload)
      return response.data
    } catch (error) {
      console.error('❌ Error creating building:', error)
      throw new Error(error.response?.data?.message || 'Failed to create building')
    }
  },

  update: async (id, buildingData) => {
    try {
      const payload = {}
      if (buildingData.name !== undefined) payload.name = buildingData.name
      if (buildingData.section !== undefined) payload.section = buildingData.section
      if (buildingData.floors !== undefined) payload.floors = Number(buildingData.floors)
      if (buildingData.totalApartments !== undefined) payload.totalApartments = Number(buildingData.totalApartments)
      if (buildingData.floorPlans !== undefined) payload.floorPlans = buildingData.floorPlans
      if (buildingData.exteriorRenders !== undefined) payload.exteriorRenders = buildingData.exteriorRenders
      if (buildingData.buildingFloorPolygons !== undefined) payload.buildingFloorPolygons = buildingData.buildingFloorPolygons
      if (buildingData.polygon !== undefined) payload.polygon = buildingData.polygon
      if (buildingData.polygonColor !== undefined) payload.polygonColor = buildingData.polygonColor
      if (buildingData.polygonStrokeColor !== undefined) payload.polygonStrokeColor = buildingData.polygonStrokeColor
      if (buildingData.polygonOpacity !== undefined) payload.polygonOpacity = buildingData.polygonOpacity
      if (buildingData.status !== undefined) payload.status = buildingData.status
      if (buildingData.quoteRef !== undefined) payload.quoteRef = buildingData.quoteRef  // ✅ Agregar quoteRef

      const response = await api.put(`/buildings/${id}`, payload)
      return response.data
    } catch (error) {
      console.error('❌ Error updating building:', error)
      throw new Error(error.response?.data?.message || 'Failed to update building')
    }
  },

  delete: async (id) => {
    try {
      const response = await api.delete(`/buildings/${id}`)
      return response.data
    } catch (error) {
      console.error('❌ Error deleting building:', error)
      throw new Error(error.response?.data?.message || 'Failed to delete building')
    }
  },

  // ── FLOOR PLANS ────────────────────────────────────────────
  getFloorPlans: async (buildingId) => {
    try {
      const response = await api.get(`/buildings/${buildingId}/floor-plans`)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch floor plans')
    }
  },

  createOrReplaceFloorPlan: async (buildingId, floorPlanData) => {
    try {
      const payload = {
        floorNumber: Number(floorPlanData.floorNumber),
        url: floorPlanData.url,
        polygons: floorPlanData.polygons || []
      }
      const response = await api.post(`/buildings/${buildingId}/floor-plans`, payload)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to save floor plan')
    }
  },

  updateFloorPlan: async (buildingId, floorNumber, updates) => {
    try {
      const response = await api.put(`/buildings/${buildingId}/floor-plans/${floorNumber}`, updates)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update floor plan')
    }
  },

  deleteFloorPlan: async (buildingId, floorNumber) => {
    try {
      const response = await api.delete(`/buildings/${buildingId}/floor-plans/${floorNumber}`)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete floor plan')
    }
  },

  saveAllFloorPlans: async (buildingId, floorPlansData) => {
    try {
      const promises = floorPlansData.map(fp =>
        buildingService.createOrReplaceFloorPlan(buildingId, fp)
      )
      return await Promise.all(promises)
    } catch (error) {
      throw new Error(error.message || 'Failed to save all floor plans')
    }
  },

  // ── POLYGONS ───────────────────────────────────────────────
  getFloorPlanPolygons: async (buildingId, floorNumber) => {
    try {
      const response = await api.get(`/buildings/${buildingId}/floor-plans/${floorNumber}/polygons`)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch polygons')
    }
  },

  createPolygon: async (buildingId, floorNumber, polygonData) => {
    try {
      const response = await api.post(`/buildings/${buildingId}/floor-plans/${floorNumber}/polygons`, polygonData)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to create polygon')
    }
  },

  updatePolygon: async (buildingId, floorNumber, polygonId, updates) => {
    try {
      const response = await api.put(`/buildings/${buildingId}/floor-plans/${floorNumber}/polygons/${polygonId}`, updates)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update polygon')
    }
  },

  deletePolygon: async (buildingId, floorNumber, polygonId) => {
    try {
      const response = await api.delete(`/buildings/${buildingId}/floor-plans/${floorNumber}/polygons/${polygonId}`)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete polygon')
    }
  },

  // ── APARTMENT MODELS ───────────────────────────────────────
  getApartmentModels: async (buildingId) => {
    try {
      const response = await api.get('/apartment-models', { params: { buildingId } })
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch apartment models')
    }
  },

  createApartmentModel: async (modelData) => {
    try {
      const payload = {
        buildingId: modelData.building || modelData.buildingId,
        name: modelData.name,
        modelNumber: modelData.modelNumber,
        floorPlan: modelData.floorPlan,
        sqft: Number(modelData.sqft) || 0,
        bedrooms: Number(modelData.bedrooms) || 0,
        bathrooms: Number(modelData.bathrooms) || 0,
        apartmentCount: Number(modelData.apartmentCount) || 0
      }
      const response = await api.post('/apartment-models', payload)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to create apartment model')
    }
  },

  updateApartmentModel: async (id, modelData) => {
    try {
      const response = await api.put(`/apartment-models/${id}`, modelData)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update apartment model')
    }
  },

  deleteApartmentModel: async (id) => {
    try {
      const response = await api.delete(`/apartment-models/${id}`)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete apartment model')
    }
  },

  // ── APARTMENTS ─────────────────────────────────────────────

  getApartments: async (buildingId = null, projectId = null) => {
    try {
      const params = {}
      if (buildingId) params.buildingId = buildingId
      if (projectId) params.projectId = projectId
      const response = await api.get('/apartments', { params })
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch apartments')
    }
  },

  createApartment: async (apartmentData) => {
    try {
      const payload = {
        apartmentModelId: apartmentData.apartmentModel || apartmentData.apartmentModelId,
        floorNumber: Number(apartmentData.floorNumber),
        apartmentNumber: apartmentData.apartmentNumber,
        price: Number(apartmentData.price) || 0,
        initialPayment: Number(apartmentData.initialPayment) || 0,
        interiorRendersBasic: apartmentData.interiorRendersBasic || [],
        interiorRendersUpgrade: apartmentData.interiorRendersUpgrade || [],
        polygon: apartmentData.polygon || [],
        users: apartmentData.users || [],
        status: apartmentData.status || 'available',
        floorPlanPolygonId: apartmentData.floorPlanPolygonId || null,
        selectedRenderType: apartmentData.selectedRenderType || null
      }
      const response = await api.post('/apartments', payload)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to create apartment')
    }
  },

  updateApartment: async (id, apartmentData) => {
    try {
      const payload = {
        ...apartmentData,
        selectedRenderType: apartmentData.selectedRenderType || null
      }
      const response = await api.put(`/apartments/${id}`, payload)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update apartment')
    }
  },

  deleteApartment: async (id) => {
    try {
      const response = await api.delete(`/apartments/${id}`)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete apartment')
    }
  },


/**
 * Adquirir o renovar lock de quote para un building
 * @param {string} buildingId - ID del building
 * @param {string|null} quoteId - ID único del quote (null si el backend debe generarlo)
 * @param {number} lockMinutes - Duración del lock en minutos (default: 15)
 * @param {string} reason - Razón del lock
 * @returns {Promise} Respuesta del servidor con quoteId generado
 */
acquireQuoteLock: async (buildingId, quoteId = null, lockMinutes = 15, reason = 'Cotización en progreso') => {
  try {
    const payload = {
      lockMinutes,
      reason
    }
    
    // Solo incluir quoteId si existe (para renovaciones)
    if (quoteId) {
      payload.quoteId = quoteId
    }
    
    const response = await api.post(`/buildings/${buildingId}/quote-lock`, payload)
    
    // Backend debe retornar: { quoteId: "...", expiresAt: "...", ... }
    return response.data
  } catch (error) {
    console.error('Error acquiring quote lock:', error)
    throw error
  }
},
 
  /**
   * Liberar lock de quote para un building
   * @param {string} buildingId - ID del building
   * @param {string} quoteId - ID único del quote
   * @param {boolean} force - Forzar liberación (solo admin)
   * @returns {Promise} Respuesta del servidor
   */
  releaseQuoteLock: async (buildingId, quoteId, force = false) => {
    try {
      const response = await api.delete(`/buildings/${buildingId}/quote-lock`, {
        data: { 
          quoteId, 
          force 
        }
      })
      return response.data
    } catch (error) {
      console.error('Error releasing quote lock:', error)
      throw error
    }
  },
 
  /**
   * Actualizar estado de disponibilidad comercial (admin)
   * @param {string} buildingId - ID del building
   * @param {string} availabilityStatus - Estado: 'available' | 'reserved' | 'assigned' | 'sold' | 'disabled'
   * @param {string} availabilityReason - Razón del cambio
   * @param {object} assignment - Datos de asignación (opcional)
   * @returns {Promise} Respuesta del servidor
   */
  updateAvailability: async (buildingId, availabilityStatus, availabilityReason = '', assignment = null) => {
    try {
      const payload = {
        availabilityStatus,
        availabilityReason
      }
 
      if (assignment) {
        payload.assignment = {
          propertyId: assignment.propertyId,
          customerId: assignment.customerId,
          assignedAt: assignment.assignedAt || new Date().toISOString()
        }
      }
 
      const response = await api.put(`/buildings/${buildingId}/availability`, payload)
      return response.data
    } catch (error) {
      console.error('Error updating availability:', error)
      throw error
    }
  },
 
  /**
   * Renovar lock automáticamente (helper)
   * @param {string} buildingId - ID del building
   * @param {string} quoteId - ID único del quote
   * @param {number} lockMinutes - Duración del lock en minutos
   * @returns {Promise} Respuesta del servidor
   */
  renewQuoteLock: async (buildingId, quoteId, lockMinutes = 15) => {
    return buildingService.acquireQuoteLock(buildingId, quoteId, lockMinutes, 'Renovación automática')
  }
}

export default buildingService