// @/Users/oficina/MV-CRM/CustomerService/frontend/shared/hooks/useCatalogConfig.js

import { useState, useEffect, useCallback } from 'react'
import catalogConfigService from '@shared/services/catalogConfigService'

/**
 * Hook para gestionar catalog-config de un proyecto
 * @param {string} projectId - ID del proyecto
 * @param {Object} options - Opciones del hook
 * @param {boolean} [options.autoLoad=true] - Cargar automáticamente al montar
 * @param {boolean} [options.activeOnly=true] - Solo configuración activa
 */
export function useCatalogConfig(projectId, options = {}) {
  const { autoLoad = true, activeOnly = true } = options

  // Estado
  const [catalogConfig, setCatalogConfig] = useState(null)
  const [allVersions, setAllVersions] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)

  // Cargar configuración activa
// Modificación en líneas 24-40

const loadActiveCatalogConfig = useCallback(async () => {
  if (!projectId) return

  setLoading(true)
  setError(null)
  try {
    const config = await catalogConfigService.getActiveCatalogConfig(projectId)
    setCatalogConfig(config)
    return config
  } catch (err) {
    console.error('Error loading active catalog config:', err)
    
    // Si es 404, no hay config activa (normal)
    if (err.response?.status === 404 || err.message?.includes('not found')) {
      setCatalogConfig(null)
      setError(null)
      return null
    }
    
    setError(err.message || 'Error al cargar configuración')
    return null
  } finally {
    setLoading(false)
  }
}, [projectId])

  // Cargar todas las versiones
// Modificación en líneas 43-59 de useCatalogConfig.js

const loadAllVersions = useCallback(async () => {
  if (!projectId) return

  setLoading(true)
  setError(null)
  try {
    const versions = await catalogConfigService.getAllVersions(projectId)
    setAllVersions(versions)
    return versions
  } catch (err) {
    console.error('Error loading catalog config versions:', err)
    
    // Si es 404, significa que no hay configuración todavía (es normal para proyectos nuevos)
    if (err.response?.status === 404 || err.message?.includes('not found')) {
      setAllVersions([])
      setError(null) // No es un error real
      return []
    }
    
    // Solo setear error si NO es 404
    setError(err.message || 'Error al cargar versiones')
    return []
  } finally {
    setLoading(false)
  }
}, [projectId])

  // Cargar versión específica
  const loadVersion = useCallback(async (version) => {
    if (!projectId) return

    setLoading(true)
    setError(null)
    try {
      const config = await catalogConfigService.getCatalogConfig(projectId, { version })
      setCatalogConfig(config)
      return config
    } catch (err) {
      console.error('Error loading catalog config version:', err)
      setError(err.message || 'Error al cargar versión')
      return null
    } finally {
      setLoading(false)
    }
  }, [projectId])

  // Crear nueva configuración
  const createConfig = useCallback(async (configData) => {
    if (!projectId) return

    // Validar estructura
  // Validar estructura
  const validation = catalogConfigService.validateConfigStructure(configData)
  console.log('🔍 Validación:', validation) // ← AGREGAR ESTO
  if (!validation.valid) {
    console.error('❌ Validación fallida:', validation.errors) // ← AGREGAR ESTO
    setError(`Validación fallida: ${validation.errors.join(', ')}`)
    return null
  }

    setSaving(true)
    setError(null)
    try {
      const newConfig = await catalogConfigService.createCatalogConfig(projectId, configData)
      setCatalogConfig(newConfig)
      await loadAllVersions() // Recargar lista de versiones
      return newConfig
    } catch (err) {
      console.error('Error creating catalog config:', err)
      setError(err.message || 'Error al crear configuración')
      throw err
    } finally {
      setSaving(false)
    }
  }, [projectId, loadAllVersions])

  // Actualizar configuración existente
  const updateConfig = useCallback(async (configData) => {
    if (!projectId) return

    // Validar estructura
    const validation = catalogConfigService.validateConfigStructure(configData)
    if (!validation.valid) {
      setError(`Validación fallida: ${validation.errors.join(', ')}`)
      return null
    }

    setSaving(true)
    setError(null)
    try {
      const updatedConfig = await catalogConfigService.updateCatalogConfig(projectId, configData)
      setCatalogConfig(updatedConfig)
      await loadAllVersions() // Recargar lista de versiones
      return updatedConfig
    } catch (err) {
      console.error('Error updating catalog config:', err)
      setError(err.message || 'Error al actualizar configuración')
      throw err
    } finally {
      setSaving(false)
    }
  }, [projectId, loadAllVersions])

  // Publicar versión
  const publishVersion = useCallback(async (version) => {
    if (!projectId) return

    setSaving(true)
    setError(null)
    try {
      const publishedConfig = await catalogConfigService.publishCatalogConfig(projectId, version)
      setCatalogConfig(publishedConfig)
      await loadAllVersions() // Recargar lista de versiones
      return publishedConfig
    } catch (err) {
      console.error('Error publishing catalog config:', err)
      setError(err.message || 'Error al publicar configuración')
      throw err
    } finally {
      setSaving(false)
    }
  }, [projectId, loadAllVersions])

  // Función helper para transformar catálogo -> floors
const transformCatalogToFloors = (catalogConfig) => {
  if (!catalogConfig?.levels || !Array.isArray(catalogConfig.levels)) {
    return []
  }

  return catalogConfig.levels.map((level, index) => ({
    key: level.key || `floor-${index + 1}`,
    label: level.label || `Nivel ${index + 1}`,
    level: level.level || index + 1,
    isCustomizable: level.isCustomizable || false,
    options: (level.options || []).map(option => ({
      key: option.key,
      label: option.label,
      status: option.status || 'active',
      media: {
        renders: [],
        isometrics: [],
        blueprints: [],
        cinematics: [],
        exterior: []
      }
    })),
    media: {
      renders: [],
      isometrics: [],
      blueprints: [],
      cinematics: [],
      exterior: []
    }
  }))
}

  // Helpers
  const getLevelOptions = useCallback((levelKey) => {
    return catalogConfigService.getLevelOptions(catalogConfig, levelKey)
  }, [catalogConfig])

  const calculateAdjustments = useCallback((selectedOptions) => {
    return catalogConfigService.calculateAdjustments(catalogConfig, selectedOptions)
  }, [catalogConfig])

  const validateSelectedOptions = useCallback((selectedOptions) => {
    if (!catalogConfig) return false
    return catalogConfigService.validateSelectedOptions(selectedOptions, catalogConfig)
  }, [catalogConfig])

  // Auto-load al montar
  useEffect(() => {
    if (autoLoad && projectId) {
      if (activeOnly) {
        loadActiveCatalogConfig()
      } else {
        loadAllVersions()
      }
    }
  }, [autoLoad, activeOnly, projectId, loadActiveCatalogConfig, loadAllVersions])

  return {
    // Estado
    catalogConfig,
    allVersions,
    loading,
    error,
    saving,

    // Métodos CRUD
    loadActiveCatalogConfig,
    loadAllVersions,
    loadVersion,
    createConfig,
    updateConfig,
    publishVersion,
    transformCatalogToFloors,

    // Helpers
    getLevelOptions,
    calculateAdjustments,
    validateSelectedOptions,

    // Utilidades
    hasConfig: !!catalogConfig,
    isPublished: catalogConfig?.status === 'published',
    currentVersion: catalogConfig?.version
  }
}

export default useCatalogConfig