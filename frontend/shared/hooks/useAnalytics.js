import { useState, useEffect, useCallback } from 'react'
import api from '@shared/services/api'

const useAnalytics = ({ projectId, autoFetch = true }) => {
  const [stats, setStats] = useState({
    totalLots: 0,
    soldLots: 0,
    pendingLots: 0,
    availableLots: 0,
    occupancyRate: 0,
    targetRate: 92,
    avgLotPrice: 0,
    modelStats: [],
    // Financieros
    totalRevenue: 0,
    pendingPayments: 0,
    collectedPayments: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchAnalytics = useCallback(async () => {
    if (!projectId) {
      setError('Project ID is required')
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const [lotsRes, propertiesRes, payloadsStatsRes] = await Promise.all([
        api.get('/lots', { params: { projectId } }),
        api.get('/properties', { params: { projectId } }),
        api.get('/payloads/stats', { params: { projectId } }).catch(() => ({ data: {} }))
      ])

      const lots = Array.isArray(lotsRes.data) ? lotsRes.data : []
      const properties = Array.isArray(propertiesRes.data) ? propertiesRes.data : []
      const payloadsStats = payloadsStatsRes.data || {}

      // Estadísticas de lotes
      const totalLots = lots.length
      const soldLots = lots.filter(l => l.status === 'sold').length
      const pendingLots = lots.filter(l => l.status === 'pending').length
      const availableLots = lots.filter(l => l.status === 'available').length
      const occupancyRate = totalLots > 0 ? Math.round((soldLots / totalLots) * 100) : 0

      // Precio promedio
      const lotsWithPrice = lots.filter(l => l.price)
      const avgLotPrice = lotsWithPrice.length > 0
        ? lotsWithPrice.reduce((sum, l) => sum + l.price, 0) / lotsWithPrice.length
        : 0

      // Estadísticas por modelo
      const modelMap = {}
      properties.forEach(property => {
        const modelName = typeof property.model === 'object'
          ? (property.model?.model || property.model?.name || 'Unknown')
          : (property.model || 'Unknown')

        let lotStatus = 'available'
        if (property.lot) {
          const lotId = typeof property.lot === 'object' ? property.lot._id : property.lot
          const associatedLot = lots.find(l => l._id === lotId)
          if (associatedLot) lotStatus = associatedLot.status
        }

        if (!modelMap[modelName]) {
          modelMap[modelName] = { name: modelName, total: 0, sold: 0, pending: 0 }
        }
        modelMap[modelName].total++
        if (lotStatus === 'sold') modelMap[modelName].sold++
        else if (lotStatus === 'pending') modelMap[modelName].pending++
      })

      const modelStats = Object.values(modelMap)
        .filter(m => m.name !== 'Unknown')
        .map(m => ({
          ...m,
          soldPercentage: m.total > 0 ? Math.round((m.sold / m.total) * 100) : 0,
          pendingPercentage: m.total > 0 ? Math.round((m.pending / m.total) * 100) : 0
        }))
        .sort((a, b) => b.total - a.total)

      setStats({
        totalLots,
        soldLots,
        pendingLots,
        availableLots,
        occupancyRate,
        targetRate: 92,
        avgLotPrice,
        modelStats,
        totalRevenue: payloadsStats.totalCollected || 0,
        pendingPayments: payloadsStats.pendingPayloads || 0,
        collectedPayments: payloadsStats.signedPayloads || 0
      })
    } catch (err) {
      console.error('Error fetching analytics:', err)
      setError(err.message || 'Failed to load analytics')
    } finally {
      setLoading(false)
    }
  }, [projectId])

  useEffect(() => {
    if (autoFetch && projectId) {
      fetchAnalytics()
    }
  }, [autoFetch, projectId, fetchAnalytics])

  return {
    stats,
    loading,
    error,
    refetch: fetchAnalytics
  }
}

export default useAnalytics