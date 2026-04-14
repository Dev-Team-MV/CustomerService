import { useState, useEffect, useCallback } from 'react'
import buildingService from '@shared/services/buildingService'
import propertyService from '@shared/services/propertyService'
import { getPropertyConfig } from '@shared/config/propertyConfig'

export function usePropertyQuote(projectSlug) {
  const config = getPropertyConfig(projectSlug)

  // ── Data ─────────────────────────────────────────────────────────────────
  const [buildings, setBuildings]             = useState([])
  const [apartments, setApartments]           = useState([])
  const [apartmentModels, setApartmentModels] = useState([])

  // ── Loading / error ───────────────────────────────────────────────────────
  const [loadingBuildings, setLoadingBuildings] = useState(false)
  const [loadingFloor, setLoadingFloor]         = useState(false)
  const [error, setError]                       = useState(null)

  // ── Selections ────────────────────────────────────────────────────────────
  const [selectedBuilding, setSelectedBuilding]   = useState(null)
  const [selectedFloor, setSelectedFloor]         = useState(null)
  const [selectedApartment, setSelectedApartment] = useState(null)
  const [apartmentType, setApartmentType]         = useState(null)
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

  // ─────────────────────────────────────────────────────────────────────────
  // Load buildings
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

  const loadBuildings = useCallback(async () => {
    setLoadingBuildings(true)
    setError(null)
    try {
      const data = await buildingService.getAll()
      setBuildings(data.map(normalizeBuilding))
    } catch (err) {
      console.error('usePropertyQuote – loadBuildings:', err)
      setError(err.message)
    } finally {
      setLoadingBuildings(false)
    }
  }, [])

  useEffect(() => { loadBuildings() }, [loadBuildings])

  // ─────────────────────────────────────────────────────────────────────────
  // Recalculate financials when apartment or percentages change
  // ─────────────────────────────────────────────────────────────────────────
  useEffect(() => {
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

  const updateFinancials = useCallback((updates) => {
    setFinancials(prev => ({ ...prev, ...updates }))
  }, [])

  // ─────────────────────────────────────────────────────────────────────────
  // Auto-advance stepper based on selections
  // ─────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!selectedBuilding)       setStepIndex(0)
    else if (!selectedFloor)     setStepIndex(1)
    else if (!selectedApartment) setStepIndex(2)
    else                         setStepIndex(3)
  }, [selectedBuilding, selectedFloor, selectedApartment])

  // ─────────────────────────────────────────────────────────────────────────
  // Step 1 — Select building
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
      console.error('usePropertyQuote – selectBuilding:', err)
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
  // Step 3 — Select apartment
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
  // Manual step control
  // ─────────────────────────────────────────────────────────────────────────
  const setCurrentStep = useCallback((idx) => {
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
    } else {
      setApartmentType(null)
    }
    setStepIndex(idx)
  }, [])

  const goToPrevStep = useCallback(() => {
    setCurrentStep(Math.max(stepIndex - 1, 0))
  }, [stepIndex, setCurrentStep])

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
    const byPolygonId = floorApts.find(a => a.floorPlanPolygonId === polygon.id)
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

  return {
    // Data
    buildings, apartments, apartmentModels,
    // Loading
    loadingBuildings, loadingFloor, error,
    // Selections
    selectedBuilding, setSelectedBuilding,
    selectedFloor, setSelectedFloor,
    selectedApartment, setSelectedApartment,
    apartmentType, setApartmentType,
    selectedRenderType, setSelectedRenderType,
    // Financials
    financials, updateFinancials,
    // Stepper
    currentStep: stepIndex,
    setCurrentStep,
    goToPrevStep,
    isQuoteComplete: Boolean(selectedBuilding && selectedFloor && selectedApartment && apartmentType),
    // Actions
    selectBuilding, selectFloor, selectApartment, selectApartmentType, resetQuote,
    // Utilities
    getApartmentsForFloor, resolveApartmentForPolygon,
    refreshBuildings: loadBuildings,
    // Config
    config,
  }
}