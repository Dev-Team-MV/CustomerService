import { useState, useEffect } from 'react'
import referralService from '../services/referralService'

export const useReferralStats = (projectId) => {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!projectId) {
      setStats(null)
      return
    }

    const fetchStats = async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await referralService.getStats(projectId)
        setStats(response)
      } catch (err) {
        console.error('Error fetching referral stats:', err)
        setError(err.message || 'Error al cargar estadísticas')
        setStats(null)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [projectId])

  return { stats, loading, error }
}