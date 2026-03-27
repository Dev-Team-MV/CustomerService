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
  const addMediaItem = async (phaseNumber, mediaData) => {
    try {
      const response = await api.post(
        `/phases/${entityType}/${entityId}/phase/${phaseNumber}/media`,
        mediaData
      )
      await fetchPhases() // Refresh
      return response.data
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Error adding media')
    }
  }

  // Update media item
  const updateMediaItem = async (phaseNumber, mediaItemId, mediaData) => {
    try {
      const response = await api.put(
        `/phases/${entityType}/${entityId}/phase/${phaseNumber}/media/${mediaItemId}`,
        mediaData
      )
      await fetchPhases() // Refresh
      return response.data
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Error updating media')
    }
  }

  // Delete media item
  const deleteMediaItem = async (phaseNumber, mediaItemId) => {
    try {
      const response = await api.delete(
        `/phases/${entityType}/${entityId}/phase/${phaseNumber}/media/${mediaItemId}`
      )
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