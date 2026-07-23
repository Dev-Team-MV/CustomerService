import { useState, useEffect, useCallback } from 'react'
import surveyService from '@shared/services/surveyService'

export const useSurveys = (filters = {}) => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchSurveys = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const cleanFilters = Object.fromEntries(
        Object.entries(filters).filter(([_, v]) => v !== '' && v !== null && v !== undefined)
      )
      
      const response = await surveyService.getList(cleanFilters)
      const dataArray = Array.isArray(response) ? response : (response.data || response.items || [])
      setData(dataArray)
    } catch (err) {
      setError(err)
      console.error('Error fetching surveys:', err)
      setData([])
    } finally {
      setLoading(false)
    }
  }, [JSON.stringify(filters)])

  useEffect(() => { fetchSurveys() }, [fetchSurveys])
  return { data, loading, error, refresh: fetchSurveys }
}