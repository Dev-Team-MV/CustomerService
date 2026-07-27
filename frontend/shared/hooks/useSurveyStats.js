import { useState, useEffect } from 'react'
import surveyService from '@shared/services/surveyService'

export const useSurveyStats = (projectId, params = {}) => {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!projectId) {
      setStats(null)
      return
    }

    const fetchStats = async () => {
      setLoading(true)
      try {
        const res = await surveyService.getStats(projectId, params)
        setStats(res)
      } catch (err) {
        console.error('Error fetching survey stats:', err)
        setStats(null)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [projectId, JSON.stringify(params)])

  return { stats, loading }
}