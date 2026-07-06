// apps/mv-crm/src/constants/hooks/useLeads.js
import { useState, useEffect, useCallback, useMemo } from 'react'
import leadService, { LEAD_STAGES, STAGE_COLORS } from '../../services/leadService'

export const useLeads = () => {
  const [leads, setLeads] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Crear stages fijos desde el enum
  const stages = useMemo(() => {
    return LEAD_STAGES.map((stageKey, index) => ({
      _id: stageKey,
      name: stageKey.charAt(0).toUpperCase() + stageKey.slice(1).replace('_', ' '),
      key: stageKey,
      color: STAGE_COLORS[stageKey] || '#757575',
      order: index
    }))
  }, [])

  const fetchLeads = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      const { leads: leadsData } = await leadService.getAll()
      setLeads(leadsData || [])
    } catch (err) {
      setError(err.response?.data?.message || err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchLeads()
  }, [fetchLeads])

  // Agrupar leads por stage
  const groupedByStage = useMemo(() => {
    const groups = {}
    stages.forEach(stage => {
      groups[stage.key] = []
    })
    leads.forEach(lead => {
      const stageKey = lead.stage
      if (groups[stageKey]) {
        groups[stageKey].push(lead)
      }
    })
    // Ordenar por fecha de creación (más reciente primero)
    Object.keys(groups).forEach(stageKey => {
      groups[stageKey].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    })
    return groups
  }, [leads, stages])

  // ==================== CRUD LEADS ====================

  const createLead = async (data) => {
    try {
      const payload = {
        name: data.name,
        phone: data.phone || '',
        email: data.email || '',
        source: data.source || 'web',
        projectId: data.projectId || null,
        stage: data.stage || 'nuevo',
        assignedTo: data.assignedTo || null,
        notes: data.notes || ''
      }
      
      const newLead = await leadService.create(payload)
      setLeads(prev => [...prev, newLead])
      return newLead
    } catch (err) {
      setError(err.response?.data?.message || err.message)
      throw err
    }
  }

  const updateLead = async (id, data) => {
    try {
      const payload = { ...data }
      
      const updated = await leadService.update(id, payload)
      setLeads(prev => prev.map(l => l._id === id ? updated : l))
      return updated
    } catch (err) {
      setError(err.response?.data?.message || err.message)
      throw err
    }
  }

  const moveLead = async (id, stage, lostReason = null) => {
    // Optimistic update
    const previousLeads = [...leads]
    setLeads(prev => prev.map(l => 
      l._id === id ? { ...l, stage } : l
    ))
    
    try {
      await leadService.move(id, stage, lostReason)
      await fetchLeads() // Refetch para sincronizar
    } catch (err) {
      setLeads(previousLeads)
      setError(err.response?.data?.message || err.message)
      throw err
    }
  }

  const deleteLead = async (id) => {
    try {
      await leadService.delete(id)
      setLeads(prev => prev.filter(l => l._id !== id))
    } catch (err) {
      setError(err.response?.data?.message || err.message)
      throw err
    }
  }

  const convertToCustomer = async (id) => {
    try {
      const result = await leadService.convertToCustomer(id)
      setLeads(prev => prev.filter(l => l._id !== id))
      return result
    } catch (err) {
      setError(err.response?.data?.message || err.message)
      throw err
    }
  }

  return {
    stages,
    leads,
    groupedByStage,
    loading,
    error,
    fetchLeads,
    createLead,
    updateLead,
    moveLead,
    deleteLead,
    convertToCustomer
  }
}

export default useLeads