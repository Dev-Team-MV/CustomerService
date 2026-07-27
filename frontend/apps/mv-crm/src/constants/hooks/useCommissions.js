// apps/mv-crm/src/constants/hooks/useCommissions.js
import { useState, useEffect, useCallback, useMemo } from 'react'
import commissionService from '../../services/commissionService'

export const useCommissions = (initialParams = {}) => {
  const [commissions, setCommissions] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 })
  const [filters, setFilters] = useState(initialParams)

  const fetchCommissions = useCallback(async (page = 1) => {
    setLoading(true)
    setError(null)
    try {
      const data = await commissionService.getCommissions({ ...filters, page, limit: pagination.limit })
      setCommissions(data.commissions || [])
      setPagination(prev => ({
        ...prev,
        page: data.pagination?.page || page,
        total: data.pagination?.total || 0,
        totalPages: data.pagination?.totalPages || 0
      }))
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar comisiones')
    } finally {
      setLoading(false)
    }
  }, [filters, pagination.limit])

  useEffect(() => {
    fetchCommissions(1)
  }, [fetchCommissions])

  const updateFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  // ✅ Estadísticas REALES calculadas desde el array de comisiones
  const stats = useMemo(() => {
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()

    let totalPending = 0
    let paidThisMonth = 0
    let totalRateSum = 0
    let rateCount = 0
    const agentEarnings = {}

    commissions.forEach(c => {
      if (c.status === 'pending' || c.status === 'disputed') {
        totalPending += c.commissionAmount || 0
      }
      if (c.status === 'paid' && c.paidAt) {
        const paidDate = new Date(c.paidAt)
        if (paidDate.getMonth() === currentMonth && paidDate.getFullYear() === currentYear) {
          paidThisMonth += c.commissionAmount || 0
        }
      }
      if (c.commissionRate) {
        totalRateSum += c.commissionRate
        rateCount++
      }
      
      // ✅ CORRECCIÓN: Extraer el nombre correctamente si agentId es un objeto populado
      const agent = c.agentId
      const agentName = agent && typeof agent === 'object' 
        ? `${agent.firstName || ''} ${agent.lastName || ''}`.trim() || agent.email || 'Desconocido'
        : (c.agentName || (typeof agent === 'string' ? agent : 'Desconocido'))

      agentEarnings[agentName] = (agentEarnings[agentName] || 0) + (c.commissionAmount || 0)
    })

    const topEarner = Object.entries(agentEarnings).sort((a, b) => b[1] - a[1])[0]

    return {
      totalPending,
      paidThisMonth,
      avgRate: rateCount > 0 ? (totalRateSum / rateCount).toFixed(1) : 0,
      topEarnerName: topEarner ? topEarner[0] : 'N/A',
      topEarnerAmount: topEarner ? topEarner[1] : 0
    }
  }, [commissions])

  return {
    commissions,
    loading,
    error,
    pagination,
    filters,
    stats,
    updateFilter,
    refresh: fetchCommissions,
    setPagination
  }
}

export default useCommissions