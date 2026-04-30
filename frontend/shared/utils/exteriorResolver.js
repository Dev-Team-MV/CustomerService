/**
 * Resuelve las imágenes exteriores basándose en las opciones seleccionadas
 * según la configuración del catálogo (assetsSchema.exteriorByLevelOption)
 * 
 * Lógica de prioridad:
 * 1. Buscar en assetsSchema.exteriorByLevelOption[levelKey.optionId]
 * 2. Si no existe, usar assetsSchema.exteriorDefault
 * 3. Si no existe, usar building.exteriorRenders (fallback final)
 * 
 * @param {Object} selectedOptions - Opciones seleccionadas { level1: 'parking', level2: 'living-dining' }
 * @param {Object} catalogConfig - Configuración del catálogo con assetsSchema
 * @param {Object} building - Objeto building con exteriorRenders como fallback
 * @returns {Array} Array de URLs de imágenes exteriores
 */
export const getExteriorImages = (selectedOptions = {}, catalogConfig = null, building = null) => {
  console.log('🎨 [exteriorResolver] Resolving exterior images...')
  console.log('📦 [exteriorResolver] Selected options:', selectedOptions)
  console.log('📋 [exteriorResolver] Catalog assetsSchema:', catalogConfig?.assetsSchema)
  
  // Si no hay catálogo, usar fallback del building
  if (!catalogConfig?.assetsSchema) {
    console.log('⚠️ [exteriorResolver] No catalog config, using building fallback')
    const fallback = building?.exteriorRenders || []
    console.log(`🏠 [exteriorResolver] Returning ${fallback.length} building exteriors`)
    return fallback
  }

  const assetsSchema = catalogConfig.assetsSchema
  const exteriorByLevelOption = assetsSchema.exteriorByLevelOption || {}
  const exteriorDefault = assetsSchema.exteriorDefault || []

  // Intentar encontrar exteriores para cada opción seleccionada
  // Prioridad: primero level1, luego level2, etc.
  const levelKeys = Object.keys(selectedOptions).sort() // Ordenar para consistencia
  
  for (const levelKey of levelKeys) {
    const optionId = selectedOptions[levelKey]
    
    // Construir la key: "level1.parking"
    const key = `${levelKey}.${optionId}`
    console.log(`🔍 [exteriorResolver] Checking key: ${key}`)
    
    // Buscar en el mapa de exteriores
    const exteriors = exteriorByLevelOption[key]
    
    if (exteriors && Array.isArray(exteriors) && exteriors.length > 0) {
      console.log(`✅ [exteriorResolver] Found ${exteriors.length} exterior(s) for ${key}`)
      return exteriors
    }
  }

  // Si no encontró nada específico, usar exteriorDefault
  if (exteriorDefault && Array.isArray(exteriorDefault) && exteriorDefault.length > 0) {
    console.log(`📌 [exteriorResolver] Using default exteriors (${exteriorDefault.length})`)
    return exteriorDefault
  }

  // Fallback final: building.exteriorRenders
  const fallback = building?.exteriorRenders || []
  console.log(`🏠 [exteriorResolver] Using building fallback (${fallback.length} exteriors)`)
  return fallback
}

/**
 * Normaliza las imágenes exteriores a formato de URL string
 * Algunas veces vienen como objetos { url: '...' }, otras como strings
 * 
 * @param {Array} images - Array de imágenes (strings o objetos)
 * @returns {Array} Array de URLs normalizadas
 */
export const normalizeExteriorImages = (images = []) => {
  if (!Array.isArray(images)) {
    console.warn('⚠️ [exteriorResolver] normalizeExteriorImages received non-array:', images)
    return []
  }
  
  const normalized = images.map(img => {
    if (typeof img === 'string') return img
    if (img && typeof img === 'object' && img.url) return img.url
    return null
  }).filter(Boolean)
  
  console.log(`🔄 [exteriorResolver] Normalized ${images.length} images to ${normalized.length} URLs`)
  return normalized
}