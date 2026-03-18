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
          const [propertiesRes, profileRes] = await Promise.all([
            api.get('/properties'),
            api.get('/auth/profile')
          ])
    
          const allProperties = propertiesRes.data
          const profile = profileRes.data
    
          // Admins y superadmins ven todo por rol — nunca marcar como shared
          if (profile.role === 'superadmin' || profile.role === 'admin') {
            return allProperties.map(property => ({
              ...property,
              isOwned: true,
              isShared: true  // aunque no es relevante para admins, lo dejamos true para evitar confusión
            }))
          }
    
          // Para usuarios normales: comparar por lotes
          const lotIds = new Set(
            (profile.lots || []).map(lot =>
              typeof lot === 'object' ? lot._id : lot
            )
          )
    
          return allProperties.map(property => {
            const propertyLotId = typeof property.lot === 'object'
              ? property.lot?._id
              : property.lot
            const isOwned = lotIds.has(propertyLotId)
            return {
              ...property,
              isOwned,
              isShared: !isOwned  // solo usuarios normales pueden tener shared
            }
          })
        } catch (error) {
          throw error.response?.data || { message: 'Failed to fetch properties' }
        }
      },
    
    // ...existing code...
  
  // ...existing code...

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
      const properties = await userPropertyService.getMyProperties()
      console.log('MY PROPERTIES:', properties)
      const propertyIds = properties.map(prop => prop._id)
      if (propertyIds.length === 0) {
        return []
      }
      const response = await api.get('/payloads')
      console.log('ALL PAYLOADS:', response.data)
      const allPayloads = response.data
      const userPayloads = allPayloads.filter(payload => {
        const payloadPropertyId = typeof payload.property === 'object' 
          ? payload.property._id 
          : payload.property
        return propertyIds.includes(payloadPropertyId)
      })
      return userPayloads
    } catch (error) {
      console.error('GET MY PAYLOADS ERROR:', error)
      throw error.response?.data || { message: 'Failed to fetch payloads' }
    }
  },

  /**
   * Obtener información financiera consolidada
   */
  getFinancialSummary: async () => {
    try {
    const properties = await userPropertyService.getMyProperties()
    console.log('PROPERTIES:', properties)
    const payloads = await userPropertyService.getMyPayloads()
    console.log('PAYLOADS:', payloads)

      // Calcular totales
      const totalInvestment = properties.reduce((sum, prop) => sum + (prop.price || 0), 0)
      const totalPaid = payloads
        .filter(p => p.status === 'signed')
        .reduce((sum, p) => sum + (p.amount || 0), 0)
      const totalPending = totalInvestment - totalPaid

      // Contar pagos
      const clearedPayments = payloads.filter(p => p.status === 'signed').length
      const pendingPayments = payloads.filter(p => p.status === 'pending').length
      const rejectedPayments = payloads.filter(p => p.status === 'rejected').length

      return {
        totalInvestment,
        totalPaid,
        totalPending,
        paymentProgress: totalInvestment > 0 ? (totalPaid / totalInvestment) * 100 : 0,
        payments: {
          total: payloads.length,
          signed: clearedPayments,
          pending: pendingPayments,
          rejected: rejectedPayments
        },
        properties: properties.length
      }
    } catch (error) {
          console.error('FINANCIAL SUMMARY ERROR:', error)

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
        .filter(p => p.status === 'signed')
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