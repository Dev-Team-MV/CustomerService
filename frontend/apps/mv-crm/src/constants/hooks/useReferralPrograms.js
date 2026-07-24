import { useState, useEffect, useCallback } from 'react'
import referralService from '../../../../../shared/services/referralService'

export const useReferralPrograms = (filters = {}) => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchPrograms = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const cleanFilters = Object.fromEntries(
        Object.entries(filters).filter(([_, v]) => v !== '' && v !== null && v !== undefined)
      )
      
      const response = await referralService.getPrograms(cleanFilters)
      const dataArray = Array.isArray(response) ? response : (response.data || [])
      setData(dataArray)
    } catch (err) {
      console.error('Error fetching referral programs:', err)
      setError(err.message || 'Error al cargar los programas')
      setData([])
    } finally {
      setLoading(false)
    }
  }, [JSON.stringify(filters)])

  useEffect(() => {
    fetchPrograms()
  }, [fetchPrograms])

  return { data, loading, error, refresh: fetchPrograms }
}