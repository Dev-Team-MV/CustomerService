// @/Users/oficina/MV-CRM/CustomerService/frontend/shared/services/catalogConfigService.js

import api from './api'

/**
 * Servicio para gestión de configuraciones de catálogo por proyecto
 * Maneja versiones, publicación y estructura de opciones (levels, pricing rules)
 */
const catalogConfigService = {
  /**
   * Obtener configuración de catálogo de un proyecto
   * @param {string} projectId - ID del proyecto
   * @param {Object} filters - Filtros opcionales
   * @param {number} [filters.version] - Versión específica
   * @param {string} [filters.status] - Estado: 'draft' | 'published'
   * @param {boolean} [filters.activeOnly] - Solo configuración activa
   * @returns {Promise<Object|Array>} Configuración(es) del catálogo
   */
  getCatalogConfig: async (projectId, filters = {}) => {
    try {
      const params = new URLSearchParams()
      if (filters.version) params.append('version', filters.version)
      if (filters.status) params.append('status', filters.status)
      if (filters.activeOnly) params.append('activeOnly', 'true')
      
      const queryString = params.toString()
      const url = `/projects/${projectId}/catalog-config${queryString ? `?${queryString}` : ''}`
      
      const response = await api.get(url)
      return response.data
    } catch (error) {
      console.error('Error fetching catalog config:', error)
      throw error
    }
  },

  /**
   * Obtener configuración activa (publicada) de un proyecto
   * @param {string} projectId - ID del proyecto
   * @returns {Promise<Object|null>} Configuración activa o null
   */
  getActiveCatalogConfig: async (projectId) => {
    try {
      const response = await api.get(
        `/projects/${projectId}/catalog-config?activeOnly=true`
      )
      return response.data
    } catch (error) {
      console.error('Error fetching active catalog config:', error)
      return null
    }
  },

  /**
   * Obtener todas las versiones de configuración de un proyecto
   * @param {string} projectId - ID del proyecto
   * @returns {Promise<Array>} Array de configuraciones
   */
  getAllVersions: async (projectId) => {
    try {
      const response = await api.get(`/projects/${projectId}/catalog-config`)
      return Array.isArray(response.data) ? response.data : [response.data]
    } catch (error) {
      console.error('Error fetching all catalog config versions:', error)
      return []
    }
  },

  /**
   * Crear nueva versión de configuración de catálogo
   * @param {string} projectId - ID del proyecto
   * @param {Object} configData - Datos de configuración
   * @param {string} configData.catalogType - 'apartments' | 'houses'
   * @param {Object} configData.structure - Estructura de opciones
   * @param {Object} configData.assetsSchema - Esquema de assets
   * @param {Array} configData.pricingRules - Reglas de precio
   * @returns {Promise<Object>} Configuración creada
   */
  createCatalogConfig: async (projectId, configData) => {
    try {
      const response = await api.post(
        `/projects/${projectId}/catalog-config`,
        configData
      )
      return response.data
    } catch (error) {
      console.error('Error creating catalog config:', error)
      throw error
    }
  },

  /**
   * Actualizar configuración existente (solo si está en draft)
   * @param {string} projectId - ID del proyecto
   * @param {Object} configData - Datos de configuración (debe incluir version)
   * @returns {Promise<Object>} Configuración actualizada
   */
  updateCatalogConfig: async (projectId, configData) => {
    try {
      const response = await api.put(
        `/projects/${projectId}/catalog-config`,
        configData
      )
      return response.data
    } catch (error) {
      console.error('Error updating catalog config:', error)
      throw error
    }
  },

  /**
   * Publicar una versión de configuración (la marca como activa)
   * @param {string} projectId - ID del proyecto
   * @param {number} version - Número de versión a publicar
   * @returns {Promise<Object>} Configuración publicada
   */
  publishCatalogConfig: async (projectId, version) => {
    try {
      const response = await api.post(
        `/projects/${projectId}/catalog-config/publish`,
        { version }
      )
      return response.data
    } catch (error) {
      console.error('Error publishing catalog config:', error)
      throw error
    }
  },

  /**
   * Helper: Validar estructura de catalog-config antes de guardar
   * @param {Object} configData - Datos de configuración
   * @returns {Object} { valid: boolean, errors: Array }
   */
  validateConfigStructure: (configData) => {
    const errors = []

    // Validar catalogType
    if (!configData.catalogType) {
      errors.push('catalogType es requerido')
    } else if (!['apartments', 'houses'].includes(configData.catalogType)) {
      errors.push('catalogType debe ser "apartments" o "houses"')
    }

    // Validar structure
    if (!configData.structure) {
      errors.push('structure es requerida')
    } else {
      // Para houses, validar levels
      if (configData.catalogType === 'houses' && !configData.structure.levels) {
        errors.push('structure.levels es requerido para catalogType "houses"')
      }

      // Validar que cada level tenga options
      if (configData.structure.levels) {
        Object.entries(configData.structure.levels).forEach(([levelKey, level]) => {
          if (!level.label) {
            errors.push(`level "${levelKey}" debe tener un label`)
          }
          if (!Array.isArray(level.options) || level.options.length === 0) {
            errors.push(`level "${levelKey}" debe tener al menos una opción`)
          }
          // Validar cada opción
          level.options?.forEach((option, idx) => {
            if (!option.id) {
              errors.push(`level "${levelKey}" opción ${idx}: falta id`)
            }
            if (!option.label) {
              errors.push(`level "${levelKey}" opción ${idx}: falta label`)
            }
            // if (typeof option.price !== 'number') {
            //   errors.push(`level "${levelKey}" opción ${idx}: price debe ser un número`)
            // }
          })
        })
      }
    }

    // Validar pricingRules
    if (configData.pricingRules && Array.isArray(configData.pricingRules)) {
      configData.pricingRules.forEach((rule, idx) => {
        if (!rule.code) {
          errors.push(`pricingRule ${idx}: falta code`)
        }
        if (!rule.condition || typeof rule.condition !== 'object') {
          errors.push(`pricingRule ${idx}: condition debe ser un objeto`)
        }
        if (typeof rule.adjustment !== 'number') {
          errors.push(`pricingRule ${idx}: adjustment debe ser un número`)
        }
      })
    }

    return {
      valid: errors.length === 0,
      errors
    }
  },

  /**
   * Helper: Obtener opciones disponibles para un level específico
   * @param {Object} catalogConfig - Configuración de catálogo
   * @param {string} levelKey - Key del level (ej: 'level1', 'level2', 'terrace')
   * @returns {Array} Array de opciones del level
   */
  getLevelOptions: (catalogConfig, levelKey) => {
    if (!catalogConfig?.structure?.levels?.[levelKey]) {
      return []
    }
    return catalogConfig.structure.levels[levelKey].options || []
  },

  /**
   * Helper: Calcular adjustments basados en selectedOptions
   * @param {Object} catalogConfig - Configuración de catálogo
   * @param {Object} selectedOptions - Opciones seleccionadas por el usuario
   * @returns {Array} Array de adjustments aplicables
   */
  calculateAdjustments: (catalogConfig, selectedOptions) => {
    if (!catalogConfig?.pricingRules || !selectedOptions) {
      return []
    }

    const adjustments = []

    catalogConfig.pricingRules.forEach(rule => {
      // Verificar si la condición se cumple
      const conditionMet = Object.entries(rule.condition).every(
        ([key, value]) => selectedOptions[key] === value
      )

      if (conditionMet) {
        adjustments.push({
          code: rule.code,
          label: rule.label || rule.code,
          amount: rule.adjustment
        })
      }
    })

    return adjustments
  }
}

export default catalogConfigService