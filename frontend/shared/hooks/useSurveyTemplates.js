import { useState, useEffect, useCallback } from 'react'
import surveyService from '@shared/services/surveyService'

export const useSurveyTemplates = (filters = {}) => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchTemplates = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const cleanFilters = Object.fromEntries(
        Object.entries(filters).filter(([_, v]) => v !== '' && v !== null && v !== undefined)
      )
      
      const response = await surveyService.getTemplates(cleanFilters)
      const dataArray = Array.isArray(response) ? response : (response.data || [])
      setData(dataArray)
    } catch (err) {
      setError(err)
      console.error('Error fetching survey templates:', err)
      setData([])
    } finally {
      setLoading(false)
    }
  }, [JSON.stringify(filters)])

  useEffect(() => { fetchTemplates() }, [fetchTemplates])
  return { data, loading, error, refresh: fetchTemplates }
}