import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import buildingService from '@shared/services/buildingService'
import userService from '@shared/services/userService'
import projectService from '@shared/services/projectService'
import propertyService from '@shared/services/propertyService'
import { getPropertyConfig } from '@shared/config/propertyConfig'

// ─────────────────────────────────────────────────────────────────────────────
// Context definition
// ─────────────────────────────────────────────────────────────────────────────
const PropertyQuoteContext = createContext(null)

export const usePropertyQuoteContext = () => {
  const ctx = useContext(PropertyQuoteContext)
  if (!ctx) throw new Error('usePropertyQuoteContext must be used within a PropertyQuoteProvider')
  return ctx
}

// Alias for backwards compatibility with Phase-2 components
export const usePropertyBuilding = usePropertyQuoteContext

// ─────────────────────────────────────────────────────────────────────────────
// Provider
// ─────────────────────────────────────────────────────────────────────────────
export const PropertyQuoteProvider = ({ projectSlug, projectId, children }) => {
  const config = getPropertyConfig(projectSlug)

  // ── Raw data ──────────────────────────────────────────────────────────────
  const [buildings, setBuildings]             = useState([])
  const [apartments, setApartments]           = useState([])
  const [apartmentModels, setApartmentModels] = useState([])

  // ── Loading / error ───────────────────────────────────────────────────────
  const [loadingBuildings, setLoadingBuildings] = useState(false)
  const [loadingFloor, setLoadingFloor]         = useState(false)
  const [error, setError]                       = useState(null)

  // ── Step selections ───────────────────────────────────────────────────────
  const [selectedBuilding, setSelectedBuilding]     = useState(null)
  const [selectedFloor, setSelectedFloor]           = useState(null)
  const [selectedApartment, setSelectedApartment]   = useState(null)
  const [apartmentType, setApartmentType]           = useState(null)
  const [selectedRenderType, setSelectedRenderType] = useState(null)

  // ── Financials ────────────────────────────────────────────────────────────
  const [financials, setFinancials] = useState({
    listPrice:                  0,
    discount:                   0,
    discountPercent:            config.financials.discountPercent,
    presalePrice:               0,
    totalDownPayment:           0,
    downPaymentPercent:         config.financials.downPaymentPercent,
    initialDownPayment:         0,
    initialDownPaymentPercent:  config.financials.initialDownPaymentPercent,
    monthlyPayment:             0,
    monthlyPaymentPercent:      config.financials.monthlyPaymentPercent,
    mortgage:                   0,
    pending:                    0,
  })

  // ── Stepper ───────────────────────────────────────────────────────────────
  const [stepIndex, setStepIndex] = useState(0)

  // ── Users & Projects (for ResidentAssignment) ─────────────────────────────
  const [selectedUser, setSelectedUser]       = useState(null)
  const [users, setUsers]                     = useState([])
  const [projects, setProjects]               = useState([])
  const [selectedProject, setSelectedProject] = useState('')
  const [loadingProjects, setLoadingProjects] = useState(false)

  // ── Load users ────────────────────────────────────────────────────────────
  const refreshUsers = useCallback(async () => {
    try {
      const data = await userService.getAll()
      setUsers(Array.isArray(data) ? data : [])
    } catch {
      setUsers([])
    }
  }, [])

  // ── Load projects ─────────────────────────────────────────────────────────
  const refreshProjects = useCallback(async () => {
    setLoadingProjects(true)
    try {
      const data = await projectService.getAll()
      setProjects(Array.isArray(data) ? data : [])
    } catch {
      setProjects([])
    } finally {
      setLoadingProjects(false)
    }
  }, [])

  // ─────────────────────────────────────────────────────────────────────────
  // Normalize building data
  // ─────────────────────────────────────────────────────────────────────────
  const normalizeBuilding = (b) => ({
    ...b,
    floorPlans: Array.isArray(b.floorPlans)
      ? b.floorPlans
      : (b.floorPlans?.data ?? []),
    exteriorRenders: Array.isArray(b.exteriorRenders)
      ? b.exteriorRenders
      : (b.exteriorRenders?.urls ?? []),
  })

  // ─────────────────────────────────────────────────────────────────────────
  // Load all buildings on mount
  // ─────────────────────────────────────────────────────────────────────────
  const loadBuildings = useCallback(async () => {
    setLoadingBuildings(true)
    setError(null)
    try {
      const data = await buildingService.getAll(projectId ? { projectId } : {})
      setBuildings(data.map(normalizeBuilding))
    } catch (err) {
      console.error('❌ PropertyQuoteContext – loadBuildings:', err)
      setError(err.message)
    } finally {
      setLoadingBuildings(false)
    }
  }, [projectId])

  useEffect(() => {
    loadBuildings()
  }, [loadBuildings])

  // ─────────────────────────────────────────────────────────────────────────
  // Recalculate financials when apartment or percentages change
  // ─────────────────────────────────────────────────────────────────────────
  const calculateFinancials = useCallback(() => {
    if (!selectedApartment) {
      setFinancials(prev => ({
        ...prev,
        listPrice: 0, discount: 0, presalePrice: 0,
        totalDownPayment: 0, initialDownPayment: 0,
        monthlyPayment: 0, mortgage: 0, pending: 0,
      }))
      return
    }

    const calculated = propertyService.calculateApartmentFinancials({
      listPrice:                  selectedApartment.price || 0,
      discountPercent:            financials.discountPercent,
      downPaymentPercent:         financials.downPaymentPercent,
      initialDownPaymentPercent:  financials.initialDownPaymentPercent,
      monthlyPaymentPercent:      financials.monthlyPaymentPercent,
      pending:                    selectedApartment.pending || 0,
    })

    setFinancials(prev => ({ ...prev, ...calculated }))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    selectedApartment,
    financials.discountPercent,
    financials.downPaymentPercent,
    financials.initialDownPaymentPercent,
    financials.monthlyPaymentPercent,
  ])

  useEffect(() => {
    calculateFinancials()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    selectedApartment,
    financials.discountPercent,
    financials.downPaymentPercent,
    financials.initialDownPaymentPercent,
    financials.monthlyPaymentPercent,
  ])

  const updateFinancials = (updates) => {
    setFinancials(prev => ({ ...prev, ...updates }))
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Auto-advance stepper based on selections
  // ─────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!selectedBuilding)       setStepIndex(0)
    else if (!selectedFloor)     setStepIndex(1)
    else if (!selectedApartment) setStepIndex(2)
    else                         setStepIndex(3)
  }, [selectedBuilding, selectedFloor, selectedApartment])

  // Manual step control — clears selections forward of the target step
  const setCurrentStep = (idx) => {
    if (idx < 1) {
      setSelectedBuilding(null)
      setSelectedFloor(null)
      setSelectedApartment(null)
      setApartmentType(null)
    } else if (idx < 2) {
      setSelectedFloor(null)
      setSelectedApartment(null)
      setApartmentType(null)
    } else if (idx < 3) {
      setSelectedApartment(null)
      setApartmentType(null)
    } else if (idx < 4) {
      setApartmentType(null)
    }
    setStepIndex(idx)
  }

  const goToPrevStep = () => setCurrentStep(Math.max(stepIndex - 1, 0))

  // ─────────────────────────────────────────────────────────────────────────
  // Step 1 — Select building (loads apartments + models)
  // ─────────────────────────────────────────────────────────────────────────
  const selectBuilding = useCallback(async (building) => {
    setSelectedFloor(null)
    setSelectedApartment(null)
    setApartmentType(null)
    setApartments([])
    setApartmentModels([])
    setSelectedBuilding(building)
    setLoadingFloor(true)
    setError(null)
    try {
      const [aptsData, modelsData] = await Promise.all([
        buildingService.getApartments(building._id),
        buildingService.getApartmentModels(building._id),
      ])
      setApartments(aptsData || [])
      setApartmentModels(modelsData || [])
    } catch (err) {
      console.error('❌ PropertyQuoteContext – selectBuilding:', err)
      setError(err.message)
    } finally {
      setLoadingFloor(false)
    }
  }, [])

  // ─────────────────────────────────────────────────────────────────────────
  // Step 2 — Select floor
  // ─────────────────────────────────────────────────────────────────────────
  const selectFloor = useCallback((floorPlan) => {
    setSelectedApartment(null)
    setApartmentType(null)
    setSelectedFloor(prev =>
      prev?.floorNumber === floorPlan?.floorNumber ? null : floorPlan
    )
  }, [])

  // ─────────────────────────────────────────────────────────────────────────
  // Step 3 — Select apartment (enriches with full model data)
  // ─────────────────────────────────────────────────────────────────────────
  const selectApartment = useCallback((apartment) => {
    setApartmentType(null)
    const model = apartmentModels.find(
      m => m._id === (apartment.apartmentModel?._id ?? apartment.apartmentModel)
    )
    const enriched = model ? { ...apartment, apartmentModel: model } : apartment
    setSelectedApartment(prev =>
      prev?._id === enriched._id ? null : enriched
    )
  }, [apartmentModels])

  // ─────────────────────────────────────────────────────────────────────────
  // Step 4 — Select apartment type (basic | upgrade)
  // ─────────────────────────────────────────────────────────────────────────
  const selectApartmentType = useCallback((type) => {
    setApartmentType(prev => prev === type ? null : type)
  }, [])

  // ─────────────────────────────────────────────────────────────────────────
  // Utilities
  // ─────────────────────────────────────────────────────────────────────────
  const getApartmentsForFloor = useCallback((floorNumber) => {
    return apartments.filter(a => Number(a.floorNumber) === Number(floorNumber))
  }, [apartments])

  const resolveApartmentForPolygon = useCallback((polygon, floorNumber) => {
    if (!polygon?.id) return null
    const floorApts = apartments.filter(
      a => Number(a.floorNumber) === Number(floorNumber)
    )
    const byPolygonId = floorApts.find(
      a => a.floorPlanPolygonId === polygon.id
    )
    if (byPolygonId) return byPolygonId
    if (polygon.apartmentModel && polygon.name) {
      const modelId = polygon.apartmentModel?._id ?? polygon.apartmentModel
      return floorApts.find(
        a =>
          (a.apartmentModel?._id ?? a.apartmentModel) === modelId &&
          a.apartmentNumber === polygon.name
      ) || null
    }
    return null
  }, [apartments])

  const resetQuote = useCallback(() => {
    setSelectedBuilding(null)
    setSelectedFloor(null)
    setSelectedApartment(null)
    setApartmentType(null)
    setApartments([])
    setApartmentModels([])
    setFinancials(prev => ({
      ...prev,
      listPrice: 0, discount: 0, presalePrice: 0,
      totalDownPayment: 0, initialDownPayment: 0,
      monthlyPayment: 0, mortgage: 0, pending: 0,
    }))
    setError(null)
    setStepIndex(0)
  }, [])

  // ─────────────────────────────────────────────────────────────────────────
  // Context value — same shape as Phase-2's PropertyBuildingContext
  // ─────────────────────────────────────────────────────────────────────────
  const value = {
    // Data
    buildings,
    apartments,
    apartmentModels,

    // Loading / error
    loadingBuildings,
    loadingFloor,
    error,

    // Selections
    selectedBuilding,   setSelectedBuilding,
    selectedFloor,      setSelectedFloor,
    selectedApartment,  setSelectedApartment,
    apartmentType,      setApartmentType,
    selectedRenderType, setSelectedRenderType,

    // Financials
    financials,
    updateFinancials,

    // Stepper
    currentStep: stepIndex,
    setCurrentStep,
    goToPrevStep,
    isQuoteComplete: Boolean(
      selectedBuilding && selectedFloor && selectedApartment && apartmentType
    ),

    // Actions (step by step)
    selectBuilding,
    selectFloor,
    selectApartment,
    selectApartmentType,
    resetQuote,

    // Utilities
    getApartmentsForFloor,
    resolveApartmentForPolygon,
    refreshBuildings: loadBuildings,

    // Users & Projects (for ResidentAssignment)
    selectedUser,       setSelectedUser,
    users,              setUsers,
    refreshUsers,
    projects,           setProjects,
    selectedProject,    setSelectedProject,
    loadingProjects,
    refreshProjects,

    // Config (project-specific settings)
    projectSlug,
    config,
  }

  return (
    <PropertyQuoteContext.Provider value={value}>
      {children}
    </PropertyQuoteContext.Provider>
  )
}

export default PropertyQuoteContext