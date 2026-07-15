// apps/mv-crm/src/constants/hooks/useAutomations.js
import { useState, useEffect, useCallback } from 'react'
import automationService from '../../services/automationService'

export const useAutomations = ({ enabled = true } = {}) => {
  const [automations, setAutomations] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchAutomations = useCallback(async (filters = {}) => {
    if (!enabled) return
    
    setLoading(true)
    setError(null)
    
    try {
      const data = await automationService.getAll(filters)
      setAutomations(data.automations || [])
      setTotal(data.total || 0)
    } catch (err) {
      console.error('[Automations] Error fetching:', err)
      setError(err.response?.data?.message || err.message)
    } finally {
      setLoading(false)
    }
  }, [enabled])

  const createAutomation = useCallback(async (data) => {
    try {
      const newAutomation = await automationService.create(data)
      setAutomations(prev => [newAutomation, ...prev])
      setTotal(prev => prev + 1)
      return newAutomation
    } catch (err) {
      console.error('[Automations] Error creating:', err)
      throw err
    }
  }, [])

  const updateAutomation = useCallback(async (id, data) => {
    try {
      const updated = await automationService.update(id, data)
      setAutomations(prev => prev.map(a => a._id === id ? updated : a))
      return updated
    } catch (err) {
      console.error('[Automations] Error updating:', err)
      throw err
    }
  }, [])

  const deleteAutomation = useCallback(async (id) => {
    try {
      await automationService.delete(id)
      setAutomations(prev => prev.filter(a => a._id !== id))
      setTotal(prev => prev - 1)
      return { success: true }
    } catch (err) {
      console.error('[Automations] Error deleting:', err)
      throw err
    }
  }, [])

  const toggleAutomation = useCallback(async (id, isActive) => {
    try {
      const updated = await automationService.toggleActive(id, isActive)
      setAutomations(prev => prev.map(a => a._id === id ? updated : a))
      return updated
    } catch (err) {
      console.error('[Automations] Error toggling:', err)
      throw err
    }
  }, [])

  const testAutomation = useCallback(async (id, testData) => {
    try {
      const result = await automationService.test(id, testData)
      return result
    } catch (err) {
      console.error('[Automations] Error testing:', err)
      throw err
    }
  }, [])

  useEffect(() => {
    if (enabled) {
      fetchAutomations()
    }
  }, [enabled, fetchAutomations])

  return {
    automations,
    total,
    loading,
    error,
    fetchAutomations,
    createAutomation,
    updateAutomation,
    deleteAutomation,
    toggleAutomation,
    testAutomation
  }
}

export default useAutomations