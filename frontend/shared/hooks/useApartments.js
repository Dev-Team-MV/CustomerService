// @shared/hooks/useApartments.js
import { useState, useEffect, useCallback } from 'react'
import buildingService from '@shared/services/buildingService'

export function useApartments(buildingId = null, projectId = null) {
  const [apartments, setApartments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchApartments = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await buildingService.getApartments(buildingId, projectId)
      setApartments(data || [])
    } catch (err) {
      setError(err.message)
      setApartments([])
    } finally {
      setLoading(false)
    }
  }, [buildingId, projectId])

  useEffect(() => { fetchApartments() }, [fetchApartments])

  const assigned  = apartments.filter(a => Array.isArray(a.users) && a.users.length > 0)
  const available = apartments.filter(a => !Array.isArray(a.users) || a.users.length === 0)

  return { apartments, assigned, available, loading, error, refresh: fetchApartments, setApartments }
}