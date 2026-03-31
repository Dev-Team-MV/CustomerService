import { useState, useEffect, useCallback } from 'react'
import buildingService from '../../Services/buildingService'

export function useApartments(buildingId = null) {
  const [apartments, setApartments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchApartments = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await buildingService.getApartments(buildingId)
      setApartments(data || [])
    } catch (err) {
      setError(err.message)
      setApartments([])
    } finally {
      setLoading(false)
    }
  }, [buildingId])

  useEffect(() => {
    fetchApartments()
  }, [fetchApartments])

  // Apartamentos asignados (tienen al menos un usuario)
  const assigned = apartments.filter(a => Array.isArray(a.users) && a.users.length > 0)

  // Apartamentos disponibles (sin usuarios)
  const available = apartments.filter(a => !Array.isArray(a.users) || a.users.length === 0)

  return {
    apartments,
    assigned,
    available,
    loading,
    error,
    refresh: fetchApartments,
    setApartments
  }
}