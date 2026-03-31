// import { useState, useEffect, useCallback } from 'react'
// import api from '../../../shared/services/api'

// // Puedes personalizar los títulos de fases si lo necesitas
// const PHASE_TITLES = [
//   'Site Preparation', 'Foundation', 'Framing', 'Roofing',
//   'MEP Installation', 'Drywall & Insulation', 'Interior Finishes',
//   'Exterior Completion', 'Final Inspection',
// ]

// const useMyApartment = () => {
//   const [loading, setLoading] = useState(true)
//   const [error, setError] = useState(null)
//   const [apartments, setApartments] = useState([])
//   const [selectedApartment, setSelectedApartment] = useState(null)
//   const [apartmentDetails, setApartmentDetails] = useState(null)
//   const [financialSummary, setFinancialSummary] = useState(null)
//   const [phases, setPhases] = useState([])
//   const [loadingPhases, setLoadingPhases] = useState(false)
//   const [payloads, setPayloads] = useState([])
//   const [loadingPayloads, setLoadingPayloads] = useState(false)
//   const [activeTab, setActiveTab] = useState(0)
//   const [hoveredCard, setHoveredCard] = useState(null)
//   const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0)

//   // ── initial load ───────────────────────────────────────────
//   const fetchData = useCallback(async () => {
//     try {
//       setLoading(true)
//       setError(null)
//       // Ajusta el endpoint según tu backend
//       const [aptsRes, summaryRes] = await Promise.all([
//         api.get('/apartments/my'), // endpoint para mis departamentos
//         api.get('/apartments/financial-summary'), // endpoint para resumen financiero
//       ])
//       setApartments(aptsRes.data)
//       setFinancialSummary(summaryRes.data)
//       // auto-select si sólo hay un apartment
//       if (aptsRes.data.length === 1) {
//         await selectApartment(aptsRes.data[0]._id)
//       }
//     } catch (err) {
//       setError(err.message || 'Failed to load apartments')
//     } finally {
//       setLoading(false)
//     }
//   }, [])

//   useEffect(() => { fetchData() }, [fetchData])

//   // ── select apartment ───────────────────────────────────────
//   const selectApartment = useCallback(async (apartmentId) => {
//     try {
//       setLoading(true)
//       const detailsRes = await api.get(`/apartments/${apartmentId}`)
//       setApartmentDetails(detailsRes.data)
//       setSelectedApartment(apartmentId)
//       setActiveTab(0)
//     } catch (err) {
//       setError(err.message || 'Failed to load apartment details')
//     } finally {
//       setLoading(false)
//     }
//   }, [])

//   const deselectApartment = useCallback(() => {
//     setSelectedApartment(null)
//     setApartmentDetails(null)
//     setActiveTab(0)
//   }, [])

//   // ── phases ─────────────────────────────────────────────────
//   const fetchPhases = useCallback(async () => {
//     if (!selectedApartment) return
//     try {
//       setLoadingPhases(true)
//       const { data: existingPhases } = await api.get(`/phases/apartment/${selectedApartment}`)
//       const allPhases = Array.from({ length: 9 }, (_, i) => {
//         const num = i + 1
//         const found = existingPhases.find(p => p.phaseNumber === num)
//         return found ?? {
//           phaseNumber: num,
//           title: PHASE_TITLES[i],
//           constructionPercentage: 0,
//           mediaItems: [],
//           apartment: selectedApartment,
//         }
//       })
//       setPhases(allPhases)
//     } catch {
//       // silent — phases may not exist yet
//     } finally {
//       setLoadingPhases(false)
//     }
//   }, [selectedApartment])

//   // ── payloads ───────────────────────────────────────────────
//   const fetchPayloads = useCallback(async () => {
//     if (!selectedApartment) return
//     try {
//       setLoadingPayloads(true)
//       const { data } = await api.get(`/payloads?apartment=${selectedApartment}`)
//       setPayloads(data)
//     } catch {
//       // silent
//     } finally {
//       setLoadingPayloads(false)
//     }
//   }, [selectedApartment])

//   useEffect(() => {
//     if (selectedApartment) {
//       fetchPhases()
//       fetchPayloads()
//     }
//   }, [selectedApartment, fetchPhases, fetchPayloads])

//   // ── current phase index ────────────────────────────────────
//   useEffect(() => {
//     if (phases.length > 0) {
//       const first = phases.findIndex(p => p.constructionPercentage < 100)
//       setCurrentPhaseIndex(first === -1 ? 0 : first)
//     }
//   }, [phases])

//   return {
//     // state
//     loading, error,
//     apartments, financialSummary,
//     selectedApartment, apartmentDetails,
//     phases, loadingPhases,
//     payloads, loadingPayloads,
//     activeTab, setActiveTab,
//     hoveredCard, setHoveredCard,
//     currentPhaseIndex,
//     // actions
//     selectApartment,
//     deselectApartment,
//     fetchPayloads,
//   }
// }

// export default useMyApartment

import { useState, useEffect, useCallback } from 'react'
import api from '@shared/services/api'
import { useAuth } from '@shared/context/AuthContext'

// Puedes personalizar los títulos de fases si lo necesitas
const PHASE_TITLES = [
  'Site Preparation', 'Foundation', 'Framing', 'Roofing',
  'MEP Installation', 'Drywall & Insulation', 'Interior Finishes',
  'Exterior Completion', 'Final Inspection',
]

const useMyApartment = () => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [apartments, setApartments] = useState([])
  const [selectedApartment, setSelectedApartment] = useState(null)
  const [apartmentDetails, setApartmentDetails] = useState(null)
  const [financialSummary, setFinancialSummary] = useState(null)
  const [phases, setPhases] = useState([])
  const [loadingPhases, setLoadingPhases] = useState(false)
  const [payloads, setPayloads] = useState([])
  const [loadingPayloads, setLoadingPayloads] = useState(false)
  const [activeTab, setActiveTab] = useState(0)
  const [hoveredCard, setHoveredCard] = useState(null)
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0)

  // ── initial load ───────────────────────────────────────────
  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      let allApts = []
      // Si el usuario tiene proyectos, busca los apartamentos visibles en cada uno
      if (user?.projects?.length) {
        for (const project of user.projects) {
          const res = await api.get('/apartments', {
            params: { visible: true, projectId: project._id }
          })
          allApts = allApts.concat(res.data)
        }
      }
      setApartments(allApts)
      // Trae el resumen financiero solo si hay apartamentos
      let summary = null
      if (allApts.length > 0) {
        const summaryRes = await api.get('/apartments/financial-summary')
        summary = summaryRes.data
      }
      setFinancialSummary(summary)
      // auto-select si sólo hay un apartment
      if (allApts.length === 1) {
        await selectApartment(allApts[0]._id)
      }
    } catch (err) {
      setError(err.message || 'Failed to load apartments')
    } finally {
      setLoading(false)
    }
  // eslint-disable-next-line
  }, [user?.projects])

  useEffect(() => { fetchData() }, [fetchData])

  // ── select apartment ───────────────────────────────────────
  const selectApartment = useCallback(async (apartmentId) => {
    try {
      setLoading(true)
      const detailsRes = await api.get(`/apartments/${apartmentId}`)
      setApartmentDetails(detailsRes.data)
      setSelectedApartment(apartmentId)
      setActiveTab(0)
    } catch (err) {
      setError(err.message || 'Failed to load apartment details')
    } finally {
      setLoading(false)
    }
  }, [])

  const deselectApartment = useCallback(() => {
    setSelectedApartment(null)
    setApartmentDetails(null)
    setActiveTab(0)
  }, [])

  // ── phases ─────────────────────────────────────────────────
  const fetchPhases = useCallback(async () => {
    if (!selectedApartment) return
    try {
      setLoadingPhases(true)
      const { data: existingPhases } = await api.get(`/phases/apartment/${selectedApartment}`)
      const allPhases = Array.from({ length: 9 }, (_, i) => {
        const num = i + 1
        const found = existingPhases.find(p => p.phaseNumber === num)
        return found ?? {
          phaseNumber: num,
          title: PHASE_TITLES[i],
          constructionPercentage: 0,
          mediaItems: [],
          apartment: selectedApartment,
        }
      })
      setPhases(allPhases)
    } catch {
      // silent — phases may not exist yet
    } finally {
      setLoadingPhases(false)
    }
  }, [selectedApartment])

  // ── payloads ───────────────────────────────────────────────
  const fetchPayloads = useCallback(async () => {
    if (!selectedApartment) return
    try {
      setLoadingPayloads(true)
      const { data } = await api.get(`/payloads?apartment=${selectedApartment}`)
      setPayloads(data)
    } catch {
      // silent
    } finally {
      setLoadingPayloads(false)
    }
  }, [selectedApartment])

  useEffect(() => {
    if (selectedApartment) {
      fetchPhases()
      fetchPayloads()
    }
  }, [selectedApartment, fetchPhases, fetchPayloads])

  // ── current phase index ────────────────────────────────────
  useEffect(() => {
    if (phases.length > 0) {
      const first = phases.findIndex(p => p.constructionPercentage < 100)
      setCurrentPhaseIndex(first === -1 ? 0 : first)
    }
  }, [phases])

  return {
    // state
    loading, error,
    apartments, financialSummary,
    selectedApartment, apartmentDetails,
    phases, loadingPhases,
    payloads, loadingPayloads,
    activeTab, setActiveTab,
    hoveredCard, setHoveredCard,
    currentPhaseIndex,
    // actions
    selectApartment,
    deselectApartment,
    fetchPayloads,
  }
}

export default useMyApartment