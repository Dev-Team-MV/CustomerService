// apps/mv-crm/src/constants/hooks/useCrmAgents.js
import { useState, useEffect, useCallback } from 'react'
import crmAgentsService from '../../services/crmAgentsService'

export const useCrmAgents = () => {
  const [agents, setAgents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchAgents = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await crmAgentsService.getAll()
      setAgents(data.agents || [])
    } catch (err) {
      setError(err.response?.data?.message || err.message)
      console.error('[CRM Agents] Error fetching agents:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAgents()
  }, [fetchAgents])

  const getAgentMetrics = async (agentId) => {
    try {
      return await crmAgentsService.getMetrics(agentId)
    } catch (err) {
      console.error('[CRM Agents] Error fetching metrics:', err)
      return null
    }
  }

  return {
    agents,
    loading,
    error,
    fetchAgents,
    getAgentMetrics
  }
}

export default useCrmAgents