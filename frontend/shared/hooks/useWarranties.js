// constants/hooks/useWarranties.js
import { useState, useEffect, useCallback } from 'react'
import warrantyService from '../services/warrantyService'

export const useWarranties = (filters = {}) => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchWarranties = useCallback(async () => {
    setLoading(true)
    try {
      // Limpia los filtros vacíos para no enviar ?projectId=
      const cleanFilters = Object.fromEntries(
        Object.entries(filters).filter(([_, v]) => v !== '' && v !== null && v !== undefined)
      )
      
      const response = await warrantyService.getList(cleanFilters)
      
      // ✅ Normaliza la respuesta: maneja array directo o objeto anidado
      const dataArray = Array.isArray(response) 
        ? response 
        : (response.data || response.items || response.warranties || [])
        
      setData(dataArray)
    } catch (err) {
      setError(err)
      console.error('Error fetching warranties:', err)
      setData([])
    } finally {
      setLoading(false)
    }
  }, [JSON.stringify(filters)]) // ✅ Se dispara cada vez que los filtros cambian

  useEffect(() => {
    fetchWarranties()
  }, [fetchWarranties])

  return { data, loading, error, refresh: fetchWarranties }
}