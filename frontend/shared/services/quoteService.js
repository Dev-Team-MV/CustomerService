import api from './api'

export const quoteService = {
  /**
   * Obtener cotización para propiedades (Lakewood, 6Town Houses)
   * Soporta tanto formato legacy como nuevo con selectedOptions
   * 
   * @param {Object} quoteData - Datos de cotización
   * @param {string} quoteData.projectId - ID del proyecto
   * @param {string} quoteData.lot - ID del lote
   * @param {string} quoteData.model - ID del modelo
   * @param {string} [quoteData.facade] - ID de la fachada (opcional)
   * @param {string} [quoteData.quoteId] - ID del quote para validar lock (NUEVO)
   * @param {number} [quoteData.initialPayment] - Pago inicial
   * 
   * LEGACY (Lakewood actual):
   * @param {boolean} [quoteData.hasBalcony] - Tiene balcón
   * @param {string} [quoteData.modelType] - 'basic' | 'upgrade'
   * @param {boolean} [quoteData.hasStorage] - Tiene storage
   * 
   * NUEVO (6Town Houses y futuro):
   * @param {Object} [quoteData.selectedOptions] - Opciones seleccionadas por level
   * @param {string} [quoteData.selectedOptions.level1] - Opción del piso 1
   * @param {string} [quoteData.selectedOptions.level2] - Opción del piso 2
   * @param {string} [quoteData.selectedOptions.terrace] - Opción de terraza
   * 
   * @returns {Promise<Object>} Resultado de cotización
   * @returns {Object} result.breakdown - Desglose de precios
   * @returns {number} result.breakdown.basePrice - Precio base
   * @returns {number} result.breakdown.totalPrice - Precio total
   * @returns {Array} result.breakdown.adjustments - Ajustes aplicados (NUEVO)
   * @returns {Object} result.pricingConfig - Configuración de precios
   * @returns {number} result.pricingConfig.version - Versión de config usada (NUEVO)
   */
  getPropertyQuote: async (quoteData) => {
    try {
      const response = await api.post('/properties/quote', quoteData)
      
      // La respuesta ahora incluye:
      // - breakdown.adjustments: Array de ajustes aplicados
      // - pricingConfig.version: Versión de la configuración usada
      return response.data
    } catch (error) {
      console.error('Error getting property quote:', error)
      throw error
    }
  },

  /**
   * Obtener cotización para apartamentos (Phase-2, ISQ, Sheperd)
   * Sin cambios - mantiene compatibilidad total
   * 
   * @param {Object} quoteData - Datos de cotización
   * @returns {Promise<Object>} Resultado de cotización
   */
  getApartmentQuote: async (quoteData) => {
    try {
      const response = await api.post('/apartments/quote', quoteData)
      return response.data
    } catch (error) {
      console.error('Error getting apartment quote:', error)
      throw error
    }
  },

  /**
   * Helper: Validar estructura de selectedOptions
   * @param {Object} selectedOptions - Opciones seleccionadas
   * @param {Object} catalogConfig - Configuración de catálogo
   * @returns {boolean} true si es válido
   */
  validateSelectedOptions: (selectedOptions, catalogConfig) => {
    if (!selectedOptions || !catalogConfig?.structure?.levels) {
      return true // Si no hay selectedOptions, es válido (legacy)
    }

    const levels = catalogConfig.structure.levels
    
    // Verificar que todas las opciones seleccionadas existan en el catálogo
    for (const [levelKey, optionId] of Object.entries(selectedOptions)) {
      const level = levels[levelKey]
      if (!level) {
        console.warn(`Level ${levelKey} no existe en catalog-config`)
        return false
      }

      const optionExists = level.options.some(opt => opt.id === optionId)
      if (!optionExists) {
        console.warn(`Opción ${optionId} no existe en level ${levelKey}`)
        return false
      }
    }

    return true
  },

  /**
   * Obtener cotización para casas (6Town Houses)
   * Alias específico de getPropertyQuote para mayor claridad
   * 
   * @param {Object} quoteData - Datos de cotización
   * @param {string} quoteData.projectId - ID del proyecto
   * @param {string} quoteData.lot - ID del building/casa
   * @param {string} quoteData.model - ID del modelo
   * @param {string} [quoteData.facade] - ID de la fachada (opcional)
   * @param {string} [quoteData.quoteId] - ID del quote para validar lock (NUEVO)
   * @param {Object} quoteData.selectedOptions - Opciones seleccionadas por level
   * @returns {Promise<Object>} Resultado de cotización
   */
  getHouseQuote: async (quoteData) => {
    try {
      // Validar que tenga la estructura correcta
      if (!quoteData.lot) {
        throw new Error('Se requiere el ID del lote (building)')
      }
      
      if (!quoteData.selectedOptions) {
        throw new Error('Se requieren las opciones seleccionadas (selectedOptions)')
      }

      console.log('📤 Enviando quote con quoteId:', quoteData.quoteId)

      // Usar el mismo endpoint que properties, incluyendo quoteId si existe
      const response = await api.post('/properties/quote', quoteData)
      return response.data
    } catch (error) {
      console.error('❌ Error getting house quote:', error)
      
      // Propagar errores específicos de lock (409)
      if (error.response?.status === 409) {
        throw error
      }
      
      throw new Error(error.response?.data?.message || error.message || 'Failed to get house quote')
    }
  },

  /**
   * Obtener preview de cotización con media por floor
   * Nuevo endpoint que devuelve quote + mediaByFloor
   * 
   * @param {Object} quoteData - Datos de cotización
   * @param {string} quoteData.projectId - ID del proyecto
   * @param {string} quoteData.lot - ID del lote
   * @param {string} quoteData.model - ID del modelo
   * @param {string} [quoteData.facade] - ID de la fachada (opcional)
   * @param {string} [quoteData.quoteId] - ID del quote para validar lock (NUEVO)
   * @param {Object} quoteData.selectedOptions - Opciones seleccionadas por level
   * @returns {Promise<Object>} Resultado con quote y mediaByFloor
   * @returns {Object} result.quote - Cotización completa
   * @returns {Object} result.mediaByFloor - Media organizada por floor
   */
  getQuotePreview: async (quoteData) => {
    try {
      const response = await api.post('/properties/quote-preview', quoteData)
      
      // Respuesta esperada:
      // {
      //   quote: { breakdown: {...}, pricingConfig: {...} },
      //   mediaByFloor: {
      //     piso1: { renders: [...], isometrics: [...], blueprints: [...] },
      //     piso2: { ... },
      //     ...
      //   }
      // }
      return response.data
    } catch (error) {
      console.error('❌ Error getting quote preview:', error)
      throw new Error(error.response?.data?.message || error.message || 'Failed to get quote preview')
    }
  }
}

export default quoteService