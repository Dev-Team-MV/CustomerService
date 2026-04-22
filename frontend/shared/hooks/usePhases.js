import { useState, useEffect } from 'react'
import api from '../services/api'

/**
 * Hook genérico para manejar fases de construcción
 * @param {Object} config - Configuración
 * @param {string} config.entityType - 'property' o 'apartment'
 * @param {string} config.entityId - ID de la property o apartment
 */
export const usePhases = ({ entityType, entityId }) => {
  const [phases, setPhases] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Fetch phases
  const fetchPhases = async () => {
    if (!entityId) return
    
    setLoading(true)
    setError(null)
    try {
      const response = await api.get(`/phases/${entityType}/${entityId}`)
      setPhases(response.data)
    } catch (err) {
      setError(err.message)
      console.error(`Error fetching ${entityType} phases:`, err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPhases()
  }, [entityId, entityType])

  // Add media item
// @/Users/oficina/MV-CRM/CustomerService/frontend/shared/hooks/usePhases.js
// Líneas 36-48:

// Add media item
const addMediaItem = async (phaseNumber, mediaData) => {
  try {
    let endpoint
    
    if (entityType === 'property') {
      // Para properties, necesitamos el _id de la fase
      const phase = phases.find(p => p.phaseNumber === phaseNumber)
      if (!phase?._id) {
        throw new Error('Phase not found')
      }
      endpoint = `/phases/${phase._id}/media`
    } else {
      // Para apartments, usar el endpoint específico
      endpoint = `/phases/${entityType}/${entityId}/phase/${phaseNumber}/media`
    }
    
    const response = await api.post(endpoint, mediaData)
    await fetchPhases() // Refresh
    return response.data
  } catch (err) {
    throw new Error(err.response?.data?.message || 'Error adding media')
  }
}

// @/Users/oficina/MV-CRM/CustomerService/frontend/shared/hooks/usePhases.js
// Líneas 65-90:

// Update media item
const updateMediaItem = async (phaseNumber, mediaItemId, mediaData) => {
  try {
    let endpoint
    
    if (entityType === 'property') {
      // Para properties, usar endpoint genérico por phase ID
      const phase = phases.find(p => p.phaseNumber === phaseNumber)
      if (!phase?._id) {
        throw new Error('Phase not found')
      }
      endpoint = `/phases/${phase._id}/media/${mediaItemId}`
    } else {
      // Para apartments, usar el endpoint específico
      endpoint = `/phases/${entityType}/${entityId}/phase/${phaseNumber}/media/${mediaItemId}`
    }
    
    const response = await api.put(endpoint, mediaData)
    await fetchPhases() // Refresh
    return response.data
  } catch (err) {
    throw new Error(err.response?.data?.message || 'Error updating media')
  }
}

// Delete media item
const deleteMediaItem = async (phaseNumber, mediaItemId) => {
  try {
    let endpoint
    
    if (entityType === 'property') {
      // Para properties, usar endpoint genérico por phase ID
      const phase = phases.find(p => p.phaseNumber === phaseNumber)
      if (!phase?._id) {
        throw new Error('Phase not found')
      }
      endpoint = `/phases/${phase._id}/media/${mediaItemId}`
    } else {
      // Para apartments, usar el endpoint específico
      endpoint = `/phases/${entityType}/${entityId}/phase/${phaseNumber}/media/${mediaItemId}`
    }
    
    const response = await api.delete(endpoint)
    await fetchPhases() // Refresh
    return response.data
  } catch (err) {
    throw new Error(err.response?.data?.message || 'Error deleting media')
  }
}

  return {
    phases,
    loading,
    error,
    fetchPhases,
    addMediaItem,
    updateMediaItem,
    deleteMediaItem
  }
}