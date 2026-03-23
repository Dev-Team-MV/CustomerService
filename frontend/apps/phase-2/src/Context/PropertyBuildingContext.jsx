import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import buildingService from '../Services/buildingService'

// ─────────────────────────────────────────────────────────────────────────────
// Context definition
// ─────────────────────────────────────────────────────────────────────────────
const PropertyBuildingContext = createContext(null)

export const usePropertyBuilding = () => {
  const ctx = useContext(PropertyBuildingContext)
  if (!ctx) throw new Error('usePropertyBuilding must be used within a PropertyBuildingProvider')
  return ctx
}

// ─────────────────────────────────────────────────────────────────────────────
// Provider
// ─────────────────────────────────────────────────────────────────────────────
export const PropertyBuildingProvider = ({ children }) => {

  // ── Raw data ────────────────────────────────────────────────────────────────
  const [buildings, setBuildings]             = useState([])
  const [apartments, setApartments]           = useState([])
  const [apartmentModels, setApartmentModels] = useState([])

  // ── Loading / error ──────────────────────────────────────────────────────────
  const [loadingBuildings, setLoadingBuildings] = useState(false)
  const [loadingFloor, setLoadingFloor]         = useState(false)
  const [error, setError]                       = useState(null)

  // ── Step selections ───────────────────────────────────────────────────────────
  const [selectedBuilding, setSelectedBuilding]   = useState(null)
  const [selectedFloor, setSelectedFloor]         = useState(null)
  const [selectedApartment, setSelectedApartment] = useState(null)
  const [apartmentType, setApartmentType]         = useState(null)

  // ── Financials ────────────────────────────────────────────────────────────────
  const [financials, setFinancials] = useState({
    listPrice:                  0,
    discount:                   0,
    discountPercent:            10,   // editable
    presalePrice:               0,
    totalDownPayment:           0,
    downPaymentPercent:         10,   // editable
    initialDownPayment:         0,
    initialDownPaymentPercent:  3,    // editable
    monthlyPayment:             0,
    monthlyPaymentPercent:      2,    // editable
    mortgage:                   0,
    pending:                    0,    // from apartment record
  })

  // ── Stepper manual control ────────────────────────────────────────────────────
  const [stepIndex, setStepIndex] = useState(0)

  // Sincroniza el stepIndex con las selecciones (avanza automáticamente)
  useEffect(() => {
    if (!selectedBuilding)      setStepIndex(0)
    else if (!selectedFloor)    setStepIndex(1)
    else if (!selectedApartment)setStepIndex(2)
    else                        setStepIndex(3)
  }, [selectedBuilding, selectedFloor, selectedApartment])

  // Permite ir a un step anterior y limpia selecciones posteriores
  const setCurrentStep = (idx) => {
    setStepIndex(idx)
    if (idx < 1) {
      setSelectedFloor(null)
      setSelectedApartment(null)
      setApartmentType(null)
    } else if (idx < 2) {
      setSelectedApartment(null)
      setApartmentType(null)
    } else if (idx < 3) {
      setApartmentType(null)
    }
  }

  // Botón "Back"
  const goToPrevStep = () => setCurrentStep(Math.max(stepIndex - 1, 0))

  // ─────────────────────────────────────────────────────────────────────────────
  // Load all buildings on mount
  // ─────────────────────────────────────────────────────────────────────────────
  const loadBuildings = useCallback(async () => {
    setLoadingBuildings(true)
    setError(null)
    try {
      const data = await buildingService.getAll()
      setBuildings(data.map(normalizeBuilding))
    } catch (err) {
      console.error('❌ PropertyBuildingContext – loadBuildings:', err)
      setError(err.message)
    } finally {
      setLoadingBuildings(false)
    }
  }, [])

  useEffect(() => {
    loadBuildings()
  }, [loadBuildings])

  // ─────────────────────────────────────────────────────────────────────────────
  // Recalculate whenever apartment, type, or any editable percentage changes
  // ─────────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    calculateFinancials()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    selectedApartment,
    apartmentType,
    financials.discountPercent,
    financials.downPaymentPercent,
    financials.initialDownPaymentPercent,
    financials.monthlyPaymentPercent,
  ])

  // ─────────────────────────────────────────────────────────────────────────────
  // Helpers
  // ─────────────────────────────────────────────────────────────────────────────

  const normalizeBuilding = (b) => ({
    ...b,
    floorPlans: Array.isArray(b.floorPlans)
      ? b.floorPlans
      : (b.floorPlans?.data ?? []),
    exteriorRenders: Array.isArray(b.exteriorRenders)
      ? b.exteriorRenders
      : (b.exteriorRenders?.urls ?? []),
  })

  const calculateFinancials = () => {
    if (!selectedApartment) {
      setFinancials(prev => ({
        ...prev,
        listPrice:          0,
        discount:           0,
        presalePrice:       0,
        totalDownPayment:   0,
        initialDownPayment: 0,
        monthlyPayment:     0,
        mortgage:           0,
        pending:            0,
      }))
      return
    }

    const listPrice = selectedApartment.price || 0
    const pendingRaw = selectedApartment.pending || 0

    const discount = (listPrice * financials.discountPercent) / 100
    const presalePrice = listPrice - discount

    const totalDownPayment = (presalePrice * financials.downPaymentPercent) / 100
    const initialDownPayment = (presalePrice * financials.initialDownPaymentPercent) / 100

    const remaining = presalePrice - totalDownPayment
    const monthlyPayment = (remaining * financials.monthlyPaymentPercent) / 100

    const mortgage = presalePrice - totalDownPayment

    setFinancials(prev => ({
      ...prev,
      listPrice,
      discount,
      presalePrice,
      totalDownPayment,
      initialDownPayment,
      monthlyPayment,
      mortgage,
      pending: pendingRaw,
    }))
  }

  const updateFinancials = (updates) => {
    setFinancials(prev => ({ ...prev, ...updates }))
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // STEP 1 – Select a building
  // ─────────────────────────────────────────────────────────────────────────────
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
      console.error('❌ PropertyBuildingContext – selectBuilding fetch:', err)
      setError(err.message)
    } finally {
      setLoadingFloor(false)
    }
  }, [])

  // ─────────────────────────────────────────────────────────────────────────────
  // STEP 2 – Select a floor
  // ─────────────────────────────────────────────────────────────────────────────
  const selectFloor = useCallback((floorPlan) => {
    setSelectedApartment(null)
    setApartmentType(null)
    setSelectedFloor(prev =>
      prev?.floorNumber === floorPlan?.floorNumber ? null : floorPlan
    )
  }, [])

  // ─────────────────────────────────────────────────────────────────────────────
  // STEP 3 – Select an apartment
  // ─────────────────────────────────────────────────────────────────────────────
  const selectApartment = useCallback((apartment) => {
    setApartmentType(null)
    const model = apartmentModels.find(
      m => m._id === (apartment.apartmentModel?._id ?? apartment.apartmentModel)
    )
    const enriched = model
      ? { ...apartment, apartmentModel: model }
      : apartment

    setSelectedApartment(prev =>
      prev?._id === enriched._id ? null : enriched
    )
  }, [apartmentModels])

  // ─────────────────────────────────────────────────────────────────────────────
  // STEP 4 – Select apartment type (basic | upgrade)
  // ─────────────────────────────────────────────────────────────────────────────
  const selectApartmentType = useCallback((type) => {
    setApartmentType(prev => prev === type ? null : type)
  }, [])

  // ─────────────────────────────────────────────────────────────────────────────
  // Utilities
  // ─────────────────────────────────────────────────────────────────────────────

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
        a => (a.apartmentModel?._id ?? a.apartmentModel) === modelId &&
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

  // El step actual para el Stepper y el contenido
  const currentStep = stepIndex

  const isQuoteComplete = Boolean(
    selectedBuilding && selectedFloor && selectedApartment && apartmentType
  )

  // ─────────────────────────────────────────────────────────────────────────────
  // Context value
  // ─────────────────────────────────────────────────────────────────────────────
  const value = {
    // ── Data
    buildings,
    apartments,
    apartmentModels,

    // ── Loading / error
    loadingBuildings,
    loadingFloor,
    error,

    // ── Selections
    selectedBuilding,
    setSelectedBuilding,
    selectedFloor,
    setSelectedFloor,
    selectedApartment,
    setSelectedApartment,
    apartmentType,
    setApartmentType,

    // ── Financials
    financials,
    updateFinancials,

    // ── Step helpers
    currentStep,
    setCurrentStep,
    goToPrevStep,
    isQuoteComplete,

    // ── Actions (step by step)
    selectBuilding,
    selectFloor,
    selectApartment,
    selectApartmentType,
    resetQuote,

    // ── Utilities
    getApartmentsForFloor,
    resolveApartmentForPolygon,

    // ── Refresh
    refreshBuildings: loadBuildings,
  }

  return (
    <PropertyBuildingContext.Provider value={value}>
      {children}
    </PropertyBuildingContext.Provider>
  )
}

export default PropertyBuildingContext