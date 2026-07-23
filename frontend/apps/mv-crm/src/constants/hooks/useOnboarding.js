import { useState, useEffect, useCallback } from 'react'
import api from '@shared/services/api'

export const useOnboarding = (filters = {}) => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchOnboarding = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      // Limpiar filtros vacíos para no enviar ?projectId=
      const cleanFilters = Object.fromEntries(
        Object.entries(filters).filter(([_, v]) => v !== '' && v !== null && v !== undefined)
      )
      
      const res = await api.get('/onboarding', { params: cleanFilters })
      
      // Manejar respuesta como array directo o objeto anidado
      const dataArray = Array.isArray(res.data) 
        ? res.data 
        : (res.data.data || res.data.items || [])
        
      setData(dataArray)
    } catch (err) {
      console.error('Error fetching onboarding:', err)
      setError(err.message)
      setData([])
    } finally {
      setLoading(false)
    }
  }, [JSON.stringify(filters)]) // Se re-ejecuta cuando los filtros cambian

  useEffect(() => {
    fetchOnboarding()
  }, [fetchOnboarding])

  return { data, loading, error, refresh: fetchOnboarding }
}