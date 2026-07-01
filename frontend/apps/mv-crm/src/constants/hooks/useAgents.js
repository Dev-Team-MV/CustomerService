// apps/mv-crm/src/constants/hooks/useAgents.js
import { useState, useEffect, useCallback } from 'react'
import crmAgentsService from '../../services/crmAgentsService'

export const useAgents = () => {
  const [agents, setAgents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchAgents = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { agents: agentsData } = await crmAgentsService.getAll()
      
      // Cargar métricas de cada agente en paralelo
      const agentsWithMetrics = await Promise.all(
        agentsData.map(async (agent) => {
          const metrics = await crmAgentsService.getMetricsSafe(agent._id)
          return { ...agent, metrics }
        })
      )
      
      setAgents(agentsWithMetrics)
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar agentes')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAgents()
  }, [fetchAgents])

  // Stats
  const stats = {
    total: agents.length,
    superadmins: agents.filter(a => a.role === 'superadmin').length,
    admins: agents.filter(a => a.role === 'admin').length,
    totalLeads: agents.reduce((sum, a) => sum + (a.metrics?.leads?.total || 0), 0),
    totalConverted: agents.reduce((sum, a) => sum + (a.metrics?.leads?.converted || 0), 0)
  }

  return {
    agents,
    loading,
    error,
    stats,
    refresh: fetchAgents
  }
}

export default useAgents