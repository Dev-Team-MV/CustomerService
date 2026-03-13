import { useState, useEffect, useCallback } from 'react'
import api                       from '../services/api'
import userPropertyService       from '../services/userPropertyService'

const PHASE_TITLES = [
  'Site Preparation', 'Foundation', 'Framing', 'Roofing',
  'MEP Installation', 'Drywall & Insulation', 'Interior Finishes',
  'Exterior Completion', 'Final Inspection',
]

const MODEL_10_ID = '6977c7bbd1f24768968719de'

const useMyProperty = () => {
  const [loading,          setLoading]          = useState(true)
  const [error,            setError]            = useState(null)
  const [properties,       setProperties]       = useState([])
  const [selectedProperty, setSelectedProperty] = useState(null)
  const [propertyDetails,  setPropertyDetails]  = useState(null)
  const [financialSummary, setFinancialSummary] = useState(null)
  const [phases,           setPhases]           = useState([])
  const [loadingPhases,    setLoadingPhases]    = useState(false)
  const [payloads,         setPayloads]         = useState([])
  const [loadingPayloads,  setLoadingPayloads]  = useState(false)
  const [activeTab,        setActiveTab]        = useState(0)
  const [hoveredCard,      setHoveredCard]      = useState(null)
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0)

  // ── initial load ───────────────────────────────────────────
  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const [props, summary] = await Promise.all([
        userPropertyService.getMyProperties(),
        userPropertyService.getFinancialSummary(),
      ])
      setProperties(props)
      setFinancialSummary(summary)
      // auto-select si sólo hay una propiedad
      if (props.length === 1) {
        await selectProperty(props[0]._id)
      }
    } catch (err) {
      setError(err.message || 'Failed to load properties')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  // ── select property ────────────────────────────────────────
  const selectProperty = useCallback(async (propertyId) => {
    try {
      setLoading(true)
      const details = await userPropertyService.getPropertyDetails(propertyId)
      setPropertyDetails(details)
      setSelectedProperty(propertyId)
      setActiveTab(0)
    } catch (err) {
      setError(err.message || 'Failed to load property details')
    } finally {
      setLoading(false)
    }
  }, [])

  const deselectProperty = useCallback(() => {
    setSelectedProperty(null)
    setPropertyDetails(null)
    setActiveTab(0)
  }, [])

  // ── phases ─────────────────────────────────────────────────
  const fetchPhases = useCallback(async () => {
    if (!selectedProperty) return
    try {
      setLoadingPhases(true)
      const { data: existingPhases } = await api.get(`/phases/property/${selectedProperty}`)
      const allPhases = Array.from({ length: 9 }, (_, i) => {
        const num   = i + 1
        const found = existingPhases.find(p => p.phaseNumber === num)
        return found ?? {
          phaseNumber: num,
          title: PHASE_TITLES[i],
          constructionPercentage: 0,
          mediaItems: [],
          property: selectedProperty,
        }
      })
      setPhases(allPhases)
    } catch {
      // silent — phases may not exist yet
    } finally {
      setLoadingPhases(false)
    }
  }, [selectedProperty])

  // ── payloads ───────────────────────────────────────────────
  const fetchPayloads = useCallback(async () => {
    if (!selectedProperty) return
    try {
      setLoadingPayloads(true)
      const { data } = await api.get(`/payloads?property=${selectedProperty}`)
      setPayloads(data)
    } catch {
      // silent
    } finally {
      setLoadingPayloads(false)
    }
  }, [selectedProperty])

  useEffect(() => {
    if (selectedProperty) {
      fetchPhases()
      fetchPayloads()
    }
  }, [selectedProperty, fetchPhases, fetchPayloads])

  // ── current phase index ────────────────────────────────────
  useEffect(() => {
    if (phases.length > 0) {
      const first = phases.findIndex(p => p.constructionPercentage < 100)
      setCurrentPhaseIndex(first === -1 ? 0 : first)
    }
  }, [phases])

  // ── model 10 derived ───────────────────────────────────────
  const isModel10 = propertyDetails?.model?._id === MODEL_10_ID

  return {
    // state
    loading, error,
    properties, financialSummary,
    selectedProperty, propertyDetails,
    phases, loadingPhases,
    payloads, loadingPayloads,
    activeTab, setActiveTab,
    hoveredCard, setHoveredCard,
    currentPhaseIndex,
    isModel10,
    // actions
    selectProperty,
    deselectProperty,
    fetchPayloads,
  }
}

export default useMyProperty