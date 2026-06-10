// @shared/config/homeCareConfig.js

/**
 * Configuración de URLs para HomeCare por ambiente
 */
export const homeCareConfig = {
  development: {
    baseUrl: 'http://localhost:5179',  // Puerto de HomeCare en local
    path: '/portal'
  },
  staging: {
    baseUrl: 'https://staging-homecare.example.com',
    path: '/portal'
  },
  production: {
    baseUrl: 'https://homecare.example.com',
    path: '/portal'
  }
}

/**
 * Obtiene la URL base de HomeCare según el ambiente
 * @param {string} environment - Ambiente (development, staging, production)
 * @returns {string} URL base de HomeCare
 */
export const getHomeCareBaseUrl = (environment = process.env.NODE_ENV || 'development') => {
  const config = homeCareConfig[environment] || homeCareConfig.development
  return config.baseUrl
}

/**
 * Construye la URL de redirección a HomeCare con el token y datos de la propiedad
 * @param {string} token - Token de autenticación del usuario
 * @param {Object} propertyData - Datos de la propiedad { propertyId, propertyName }
 * @param {string} environment - Ambiente (development, staging, production)
 * @returns {string} URL completa para redireccionar a HomeCare
 */
export const getHomeCareRedirectUrl = (token, propertyData = {}, environment = process.env.NODE_ENV || 'development') => {
  const config = homeCareConfig[environment] || homeCareConfig.development
  const params = new URLSearchParams({
    token: token,
    source: 'customer-service'
  })
  
  // Agregar parámetros de la propiedad si existen
  if (propertyData.propertyId) {
    params.append('propertyId', propertyData.propertyId)
  }
  if (propertyData.propertyName) {
    params.append('propertyName', propertyData.propertyName)
  }
  
  return `${config.baseUrl}${config.path}?${params.toString()}`
}