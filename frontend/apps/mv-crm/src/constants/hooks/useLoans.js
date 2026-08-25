import { useState, useEffect, useCallback, useMemo } from 'react'
import loanService, {
  LOAN_PIPELINE_STAGES,
  STAGE_LABELS,
  STAGE_PHASE_MAP,
  PHASE_COLORS
} from '../../services/loanService'

export const useLoans = () => {
  const [loans, setLoans] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filters, setFilters] = useState({})
  const [dashboardKPIs, setDashboardKPIs] = useState(null)
  const [alerts, setAlerts] = useState(null)

  const stages = useMemo(() => {
    return LOAN_PIPELINE_STAGES.map((key, index) => ({
      _id: key,
      key,
      name: STAGE_LABELS[key] || key,
      phase: STAGE_PHASE_MAP[key],
      color: PHASE_COLORS[STAGE_PHASE_MAP[key]] || '#757575',
      order: index
    }))
  }, [])

  const fetchLoans = useCallback(async (customFilters) => {
    setLoading(true)
    setError(null)
    try {
      const { loans: data } = await loanService.getAll(customFilters || filters)
      setLoans(data || [])
    } catch (err) {
      setError(err.response?.data?.message || err.message)
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    fetchLoans()
  }, [fetchLoans])

  const groupedByStage = useMemo(() => {
    const groups = {}
    stages.forEach(stage => {
      groups[stage.key] = []
    })
    loans.forEach(loan => {
      const key = loan.pipelineStage
      if (groups[key]) {
        groups[key].push(loan)
      }
    })
    Object.keys(groups).forEach(key => {
      groups[key].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    })
    return groups
  }, [loans, stages])

  const createLoan = async (data) => {
    try {
      const newLoan = await loanService.create(data)
      setLoans(prev => [...prev, newLoan])
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

  const deleteLoan = async (id) => {
    try {
      await loanService.delete(id)
      setLoans(prev => prev.filter(l => l._id !== id))
    } catch (err) {
      setError(err.response?.data?.message || err.message)
      throw err
    }
  }

  const updateStage = async (id, stage) => {
    const previousLoans = [...loans]
    setLoans(prev => prev.map(l =>
      l._id === id ? { ...l, pipelineStage: stage } : l
    ))
    try {
      const updated = await loanService.updateStage(id, stage)
      setLoans(prev => prev.map(l => l._id === id ? updated : l))
      return updated
    } catch (err) {
      setLoans(previousLoans)
      setError(err.response?.data?.message || err.message)
      throw err
    }
  }

  const updateSpecialStatus = async (id, status) => {
    try {
      const updated = await loanService.updateSpecialStatus(id, status)
      setLoans(prev => prev.map(l => l._id === id ? updated : l))
      return updated
    } catch (err) {
      setError(err.response?.data?.message || err.message)
      throw err
    }
  }

  const updateDocumentItem = async (id, docType, data) => {
    try {
      const updated = await loanService.updateDocumentItem(id, docType, data)
      setLoans(prev => prev.map(l => l._id === id ? updated : l))
      return updated
    } catch (err) {
      setError(err.response?.data?.message || err.message)
      throw err
    }
  }

  const uploadDocument = async (id, docType, file) => {
    try {
      const updated = await loanService.uploadDocument(id, docType, file)
      setLoans(prev => prev.map(l => l._id === id ? updated : l))
      return updated
    } catch (err) {
      setError(err.response?.data?.message || err.message)
      throw err
    }
  }

  const deleteDocumentFile = async (id, docType) => {
    try {
      const updated = await loanService.deleteDocumentFile(id, docType)
      setLoans(prev => prev.map(l => l._id === id ? updated : l))
      return updated
    } catch (err) {
      setError(err.response?.data?.message || err.message)
      throw err
    }
  }

  const updateNextAction = async (id, data) => {
    try {
      const updated = await loanService.updateNextAction(id, data)
      setLoans(prev => prev.map(l => l._id === id ? updated : l))
      return updated
    } catch (err) {
      setError(err.response?.data?.message || err.message)
      throw err
    }
  }

  const addNote = async (id, note) => {
    try {
      const updated = await loanService.addNote(id, note)
      setLoans(prev => prev.map(l => l._id === id ? updated : l))
      return updated
    } catch (err) {
      setError(err.response?.data?.message || err.message)
      throw err
    }
  }

  const fetchDashboardKPIs = useCallback(async (customFilters) => {
    try {
      const data = await loanService.getDashboardKPIs(customFilters || filters)
      setDashboardKPIs(data)
      return data
    } catch (err) {
      setError(err.response?.data?.message || err.message)
      throw err
    }
  }, [filters])

  const fetchAlerts = useCallback(async (customFilters) => {
    try {
      const data = await loanService.getAlerts(customFilters || filters)
      setAlerts(data)
      return data
    } catch (err) {
      setError(err.response?.data?.message || err.message)
      throw err
    }
  }, [filters])

  return {
    loans,
    stages,
    groupedByStage,
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
    dashboardKPIs,
    alerts,
    fetchDashboardKPIs,
    fetchAlerts
  }
}

export default useLoans
