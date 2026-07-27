import { useState, useEffect, useCallback } from 'react'
import referralService from '../services/referralService'

export const useReferrals = (filters = {}) => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchReferrals = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      // Limpiar filtros vacíos (null, undefined, '')
      const cleanFilters = Object.fromEntries(
        Object.entries(filters).filter(([_, v]) => v !== '' && v !== null && v !== undefined)
      )
      
      const response = await referralService.getList(cleanFilters)
      const dataArray = Array.isArray(response) ? response : (response.data || response.items || [])
      setData(dataArray)
    } catch (err) {
      console.error('Error fetching referrals:', err)
      setError(err.message || 'Error al cargar los referidos')
      setData([])
    } finally {
      setLoading(false)
    }
  }, [JSON.stringify(filters)]) // Se re-ejecuta solo si los filtros cambian

  useEffect(() => {
    fetchReferrals()
  }, [fetchReferrals])

  return { data, loading, error, refresh: fetchReferrals }
}