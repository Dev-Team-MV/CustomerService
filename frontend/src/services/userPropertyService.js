import api from './api'

/**
 * Servicio para gestionar las propiedades del usuario
 * Relaciona lots, properties, payloads y models
 */
const userPropertyService = {
  /**
   * Obtener el perfil completo del usuario con lotes
   */
  getProfile: async () => {
    try {
      const response = await api.get('/auth/profile')
      return response.data
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch profile' }
    }
  },

  /**
   * Obtener todas las propiedades del usuario usando los lotes
   */
  getMyProperties: async () => {
    try {
      // 1. Obtener perfil con lotes
      const profile = await userPropertyService.getProfile()
      const lotIds = profile.lots.map(lot => lot._id)
      
      if (lotIds.length === 0) {
        return []
      }

      // 2. Buscar propiedades que tengan esos lotes
      const response = await api.get('/properties')
      const allProperties = response.data
      
      // ✅ FILTRAR solo las propiedades que pertenecen a los lotes del usuario
      const userProperties = allProperties.filter(property => {
        // Verificar si el lot de la propiedad está en los lotIds del usuario
        const propertyLotId = typeof property.lot === 'object' ? property.lot._id : property.lot
        return lotIds.includes(propertyLotId)
      })
      
      return userProperties
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch properties' }
    }
  },

  /**
   * Obtener una propiedad específica por ID de lote
   */
  getPropertyByLotId: async (lotId) => {
    try {
      const properties = await userPropertyService.getMyProperties()
      
      // Buscar la propiedad que tenga ese lote
      const property = properties.find(prop => {
        const propertyLotId = typeof prop.lot === 'object' ? prop.lot._id : prop.lot
        return propertyLotId === lotId
      })
      
      return property || null
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch property' }
    }
  },

  /**
   * Obtener payloads relacionados con los lotes del usuario
   */
  getMyPayloads: async () => {
    try {
      // 1. Obtener propiedades del usuario
      const properties = await userPropertyService.getMyProperties()
      const propertyIds = properties.map(prop => prop._id)

      if (propertyIds.length === 0) {
        return []
      }

      // 2. Obtener TODOS los payloads
      const response = await api.get('/payloads')
      const allPayloads = response.data

      // ✅ FILTRAR solo los payloads que pertenecen a las propiedades del usuario
      const userPayloads = allPayloads.filter(payload => {
        const payloadPropertyId = typeof payload.property === 'object' 
          ? payload.property._id 
          : payload.property
        return propertyIds.includes(payloadPropertyId)
      })
      
      return userPayloads
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch payloads' }
    }
  },

  /**
   * Obtener información financiera consolidada
   */
  getFinancialSummary: async () => {
    try {
      const properties = await userPropertyService.getMyProperties()
      const payloads = await userPropertyService.getMyPayloads()

      // Calcular totales
      const totalInvestment = properties.reduce((sum, prop) => sum + (prop.price || 0), 0)
      const totalPaid = payloads
        .filter(p => p.status === 'cleared')
        .reduce((sum, p) => sum + (p.amount || 0), 0)
      const totalPending = totalInvestment - totalPaid

      // Contar pagos
      const clearedPayments = payloads.filter(p => p.status === 'cleared').length
      const pendingPayments = payloads.filter(p => p.status === 'pending').length
      const rejectedPayments = payloads.filter(p => p.status === 'rejected').length

      return {
        totalInvestment,
        totalPaid,
        totalPending,
        paymentProgress: totalInvestment > 0 ? (totalPaid / totalInvestment) * 100 : 0,
        payments: {
          total: payloads.length,
          cleared: clearedPayments,
          pending: pendingPayments,
          rejected: rejectedPayments
        },
        properties: properties.length
      }
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch financial summary' }
    }
  },

  /**
   * ✅ Obtener el estado de construcción de una propiedad usando el endpoint correcto
   */
  getConstructionStatus: async (propertyId) => {
    try {
      // ✅ Usar el endpoint específico para obtener fases de una propiedad
      const response = await api.get(`/phases/property/${propertyId}`)
      const phases = response.data
      
      const completedPhases = phases.filter(p => p.status === 'completed').length
      const totalPhases = 9 // Siempre 9 fases
      const progress = (completedPhases / totalPhases) * 100

      return {
        phases,
        completedPhases,
        totalPhases,
        progress,
        currentPhase: phases.find(p => p.status === 'in-progress') || null,
        restricted: false
      }
    } catch (error) {
      // Si es 403 o 404, retornar datos vacíos
      if (error.response?.status === 403 || error.response?.status === 404) {
        console.warn('User does not have permission to view phases or phases not found')
        return {
          phases: [],
          completedPhases: 0,
          totalPhases: 9,
          progress: 0,
          currentPhase: null,
          restricted: true
        }
      }
      throw error.response?.data || { message: 'Failed to fetch construction status' }
    }
  },

  /**
   * Obtener detalles completos de una propiedad con todo relacionado
   */
  getPropertyDetails: async (propertyId) => {
    try {
      // Obtener propiedad
      const propResponse = await api.get(`/properties/${propertyId}`)
      const property = propResponse.data

      // Obtener modelo
      let model = null
      if (property.model) {
        const modelId = typeof property.model === 'object' ? property.model._id : property.model
        try {
          const modelResponse = await api.get(`/models/${modelId}`)
          model = modelResponse.data
        } catch (error) {
          console.warn('Could not fetch model:', error)
        }
      }

      // Obtener fachada
      let facade = null
      if (property.facade) {
        const facadeId = typeof property.facade === 'object' ? property.facade._id : property.facade
        try {
          const facadeResponse = await api.get(`/facades/${facadeId}`)
          facade = facadeResponse.data
        } catch (error) {
          console.warn('Could not fetch facade:', error)
        }
      }

      // ✅ Obtener fases de construcción usando el propertyId correcto
      const construction = await userPropertyService.getConstructionStatus(propertyId)

      // Obtener payloads de esta propiedad
      const allPayloads = await userPropertyService.getMyPayloads()
      const payloads = allPayloads.filter(payload => {
        const payloadPropertyId = typeof payload.property === 'object' 
          ? payload.property._id 
          : payload.property
        return payloadPropertyId === propertyId
      })

      // Calcular información de pago
      const totalPaid = payloads
        .filter(p => p.status === 'cleared')
        .reduce((sum, p) => sum + p.amount, 0)
      const totalPending = property.price - totalPaid

      return {
        property,
        model,
        facade,
        construction,
        payloads,
        payment: {
          totalPaid,
          totalPending,
          totalPrice: property.price,
          progress: property.price > 0 ? (totalPaid / property.price) * 100 : 0
        }
      }
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch property details' }
    }
  }
}

export default userPropertyService