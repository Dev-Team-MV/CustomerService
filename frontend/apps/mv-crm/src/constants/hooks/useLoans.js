import { useState, useEffect, useCallback, useMemo } from 'react'
import loanService, { LOAN_PIPELINE_STAGES, STAGE_COLORS } from '../../services/loanService'

export const useLoans = (initialFilters = {}) => {
  const [loans, setLoans] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filters, setFilters] = useState(initialFilters)
  
  const [dashboardKPIs, setDashboardKPIs] = useState(null)
  const [alerts, setAlerts] = useState([])

  const phases = useMemo(() => {
    const phaseMap = {}
    LOAN_PIPELINE_STAGES.forEach(stage => {
      if (!phaseMap[stage.phase]) {
        phaseMap[stage.phase] = {
          name: stage.phase,
          color: STAGE_COLORS[stage.phase] || '#757575',
          stages: []
        }
      }
      phaseMap[stage.phase].stages.push(stage)
    })
    return Object.values(phaseMap).sort((a, b) => a.stages[0].order - b.stages[0].order)
  }, [])

  const fetchLoans = useCallback(async (customFilters = {}) => {
    setLoading(true)
    setError(null)
    try {
      const searchFilters = { ...filters, ...customFilters }
      const { loans: loansData } = await loanService.getAll(searchFilters)
      
      const enrichedLoans = (loansData || []).map(loan => {
        const stageInfo = LOAN_PIPELINE_STAGES.find(s => s.id === loan.pipelineStage || s.id === loan.stage)
        return {
          ...loan,
          phase: stageInfo ? stageInfo.phase : 'Unknown',
          borrower: loan.buyer || loan.borrower,
          loanAmount: Number(loan.loanAmount) || 0
        }
      })
      
      setLoans(enrichedLoans)
    } catch (err) {
      setError(err.response?.data?.message || err.message)
    } finally {
      setLoading(false)
    }
  }, [filters])

const fetchDashboardKPIs = useCallback(async (customFilters = {}) => {
  try {
    const data = await loanService.getDashboardKPIs(customFilters)
    console.log('🔄 [useLoans] Fetched KPIs:', data) // ← Agrega este log
    setDashboardKPIs(data)
  } catch (err) {
    console.error('Error fetching KPIs:', err)
  }
}, [])

  // ✅ CORREGIDO: Ahora acepta y pasa filters (ej. projectId) a las alertas
  const fetchAlerts = useCallback(async (customFilters = {}) => {
    try {
      const data = await loanService.getAlerts(customFilters)
      setAlerts(data || [])
    } catch (err) {
      console.error('Error fetching alerts:', err)
    }
  }, [])

  useEffect(() => {
    fetchLoans()
    fetchDashboardKPIs(filters)
    fetchAlerts(filters)
  }, [fetchLoans, fetchDashboardKPIs, fetchAlerts, filters])

  const groupedByStage = useMemo(() => {
    const groups = {}
    LOAN_PIPELINE_STAGES.forEach(stage => { groups[stage.id] = [] })
    loans.forEach(loan => {
      const stageId = loan.pipelineStage || loan.stage
      if (groups[stageId]) groups[stageId].push(loan)
    })
    Object.keys(groups).forEach(stageId => {
      groups[stageId].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    })
    return groups
  }, [loans])

  // ==================== CRUD & ACCIONES ====================

  const createLoan = async (data) => {
    try {
      const newLoan = await loanService.create(data)
      setLoans(prev => [newLoan, ...prev])
      fetchDashboardKPIs(filters)
      fetchAlerts(filters)
      return newLoan
    } catch (err) {
      setError(err.response?.data?.message || err.message)
      throw err
    }
  }

  const updateLoan = async (id, data) => {
    try {
      const updated = await loanService.update(id, data)
      setLoans(prev => prev.map(l => l._id === id ? updated : l))
      return updated
    } catch (err) {
      setError(err.response?.data?.message || err.message)
      throw err
    }
  }

  // ✅ CORREGIDO: Mapea el estado interno 'pipelineStage' al 'stage' que pide la API
  const updateStage = async (id, pipelineStage) => {
    const previousLoans = [...loans]
    setLoans(prev => prev.map(l => l._id === id ? { ...l, pipelineStage } : l))
    
    try {
      await loanService.updateStage(id, pipelineStage) // El servicio lo envía como { stage: pipelineStage }
      fetchLoans()
    } catch (err) {
      setLoans(previousLoans)
      setError(err.response?.data?.message || err.message)
      throw err
    }
  }

  // ✅ CORREGIDO: Mapea el estado interno 'specialStatus' al 'status' que pide la API
  const updateSpecialStatus = async (id, specialStatus) => {
    try {
      const updated = await loanService.updateSpecialStatus(id, specialStatus) // El servicio lo envía como { status: specialStatus }
      setLoans(prev => prev.map(l => l._id === id ? updated : l))
      fetchAlerts(filters)
      return updated
    } catch (err) {
      setError(err.response?.data?.message || err.message)
      throw err
    }
  }

  const deleteLoan = async (id) => {
    try {
      await loanService.delete(id)
      setLoans(prev => prev.filter(l => l._id !== id))
      fetchDashboardKPIs(filters)
      fetchAlerts(filters)
    } catch (err) {
      setError(err.response?.data?.message || err.message)
      throw err
    }
  }

  const updateDocumentItem = async (loanId, docType, data) => {
    try {
      const updated = await loanService.updateDocumentItem(loanId, docType, data)
      fetchLoans()
      fetchAlerts(filters)
      return updated
    } catch (err) {
      setError(err.response?.data?.message || err.message)
      throw err
    }
  }

  const uploadDocument = async (loanId, docType, file) => {
    try {
      const res = await loanService.uploadDocument(loanId, docType, file)
      fetchLoans()
      fetchAlerts(filters)
      return res
    } catch (err) {
      setError(err.response?.data?.message || err.message)
      throw err
    }
  }

  const deleteDocumentFile = async (loanId, docType) => {
    try {
      await loanService.deleteDocumentFile(loanId, docType)
      fetchLoans()
      fetchAlerts(filters)
    } catch (err) {
      setError(err.response?.data?.message || err.message)
      throw err
    }
  }

  const updateNextAction = async (id, actionData) => {
    try {
      const updated = await loanService.updateNextAction(id, actionData)
      setLoans(prev => prev.map(l => l._id === id ? updated : l))
      return updated
    } catch (err) {
      setError(err.response?.data?.message || err.message)
      throw err
    }
  }

  // ✅ CORREGIDO: Acepta un string de texto y lo envía como { note: text }
  const addNote = async (id, noteText) => {
    try {
      const res = await loanService.addNote(id, noteText)
      fetchLoans()
      return res
    } catch (err) {
      setError(err.response?.data?.message || err.message)
      throw err
    }
  }

  const getTimeline = async (id, page = 1, limit = 20) => {
    try {
      return await loanService.getTimeline(id, page, limit)
    } catch (err) {
      setError(err.response?.data?.message || err.message)
      throw err
    }
  }

  return {
    loans,
    loading,
    error,
    filters,
    setFilters,
    fetchLoans,
    createLoan,
    updateLoan,
    deleteLoan,
    updateStage,
    updateSpecialStatus,
    updateDocumentItem,
    uploadDocument,
    deleteDocumentFile,
    updateNextAction,
    addNote,
    getTimeline,
    groupedByStage,
    phases,
    dashboardKPIs,
    alerts,
    fetchDashboardKPIs,
    fetchAlerts
  }
}

export default useLoans