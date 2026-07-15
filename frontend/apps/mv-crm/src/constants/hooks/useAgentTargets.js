// apps/mv-crm/src/constants/hooks/useAgentTargets.js
import { useState, useEffect, useCallback } from 'react'
import crmAgentsService from '../../services/crmAgentsService'

/**
 * Hook para gestionar las metas mensuales de un agente
 * @param {string} agentId - ID del agente
 * @param {Object} options - { month, year } (opcionales)
 */
export const useAgentTargets = (agentId, options = {}) => {
  const [targets, setTargets] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchTargets = useCallback(async () => {
    if (!agentId) return
    
    setLoading(true)
    setError(null)
    
    try {
      const data = await crmAgentsService.getTargets(agentId, options)
      setTargets(data)
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar metas')
      setTargets(null)
    } finally {
      setLoading(false)
    }
  }, [agentId, options.month, options.year])

  useEffect(() => {
    fetchTargets()
  }, [fetchTargets])

  /**
   * Guardar nuevas metas
   * @param {Object} data - { month, year, leads, conversions, appointments, smsCount }
   */
  const saveTargets = async (data) => {
    if (!agentId) throw new Error('Agent ID is required')
    
    setLoading(true)
    setError(null)
    
    try {
      const response = await crmAgentsService.setTargets(agentId, data)
      setTargets(response)
      return response
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Error al guardar metas'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return {
    targets,
    loading,
    error,
    refresh: fetchTargets,
    saveTargets
  }
}

export default useAgentTargets