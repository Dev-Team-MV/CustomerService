// @/Users/oficina/MV-CRM/CustomerService/frontend/shared/hooks/useHouseQuote.js

import { useState, useEffect, useCallback, useMemo } from 'react'
import quoteService from '@shared/services/quoteService'
import catalogConfigService from '@shared/services/catalogConfigService'
import propertyService from '@shared/services/propertyService'

/**
 * Hook para gestionar cotización de casas con catalog-config (6Town Houses)
 * @param {string} projectId - ID del proyecto
 * @param {string} projectSlug - Slug del proyecto
 */
export function useHouseQuote(projectId, projectSlug) {
  // Catalog Config
  const [catalogConfig, setCatalogConfig] = useState(null)
  const [loadingConfig, setLoadingConfig] = useState(false)

  // Datos disponibles
  const [lots, setLots] = useState([])
  const [models, setModels] = useState([])
  const [facades, setFacades] = useState([])
  const [loadingData, setLoadingData] = useState(false)

  // Selecciones del usuario
  const [selectedLot, setSelectedLot] = useState(null)
  const [selectedModel, setSelectedModel] = useState(null)
  const [selectedFacade, setSelectedFacade] = useState(null)
  const [selectedOptions, setSelectedOptions] = useState({})

  // Financials
  const [financials, setFinancials] = useState({
    discountPercent: 10,
    downPaymentPercent: 15,
    initialDownPaymentPercent: 5,
    monthlyPaymentPercent: 2
  })

  // Quote
  const [quoteResult, setQuoteResult] = useState(null)
  const [loadingQuote, setLoadingQuote] = useState(false)
  const [error, setError] = useState(null)

  // Cargar catalog-config activo
  const loadCatalogConfig = useCallback(async () => {
    if (!projectId) return

    setLoadingConfig(true)
    setError(null)
    try {
      const config = await catalogConfigService.getActiveCatalogConfig(projectId)
      setCatalogConfig(config)
    } catch (err) {
      console.error('Error loading catalog config:', err)
      setError(err.message)
    } finally {
      setLoadingConfig(false)
    }
  }, [projectId])

  // Cargar lotes, modelos, fachadas
  const loadPropertyData = useCallback(async () => {
    if (!projectId) return

    setLoadingData(true)
    try {
      const [lotsData, modelsData, facadesData] = await Promise.all([
        propertyService.getLots(projectId),
        propertyService.getModels(projectId),
        propertyService.getFacades(projectId)
      ])

      setLots(lotsData || [])
      setModels(modelsData || [])
      setFacades(facadesData || [])
    } catch (err) {
      console.error('Error loading property data:', err)
      setError(err.message)
    } finally {
      setLoadingData(false)
    }
  }, [projectId])

  // Cargar datos iniciales
  useEffect(() => {
    if (projectId) {
      loadCatalogConfig()
      loadPropertyData()
    }
  }, [projectId, loadCatalogConfig, loadPropertyData])

  // Actualizar opción de un level
  const setLevelOption = useCallback((levelKey, optionId) => {
    setSelectedOptions(prev => ({
      ...prev,
      [levelKey]: optionId
    }))
  }, [])

  // Resetear selección de un level
  const resetLevelOption = useCallback((levelKey) => {
    setSelectedOptions(prev => {
      const newOptions = { ...prev }
      delete newOptions[levelKey]
      return newOptions
    })
  }, [])

  // Resetear todas las opciones
  const resetAllOptions = useCallback(() => {
    setSelectedOptions({})
  }, [])

  // Calcular precio estimado (antes de quote oficial)
  const estimatedPrice = useMemo(() => {
    if (!catalogConfig || !selectedLot || !selectedModel) return 0

    let basePrice = (selectedLot.price || 0) + (selectedModel.price || 0)

    // Agregar precio de fachada si existe
    if (selectedFacade?.price) {
      basePrice += selectedFacade.price
    }

    // Aplicar adjustments basados en selectedOptions
    const adjustments = catalogConfigService.calculateAdjustments(catalogConfig, selectedOptions)
    const totalAdjustments = adjustments.reduce((sum, adj) => sum + adj.amount, 0)

    return basePrice + totalAdjustments
  }, [catalogConfig, selectedLot, selectedModel, selectedFacade, selectedOptions])

  // Calcular adjustments actuales
  const currentAdjustments = useMemo(() => {
    if (!catalogConfig || !selectedOptions) return []
    return catalogConfigService.calculateAdjustments(catalogConfig, selectedOptions)
  }, [catalogConfig, selectedOptions])

  // Calcular financials basados en precio estimado
  const calculatedFinancials = useMemo(() => {
    const price = estimatedPrice
    const discount = (price * financials.discountPercent) / 100
    const priceAfterDiscount = price - discount
    const downPayment = (priceAfterDiscount * financials.downPaymentPercent) / 100
    const initialDownPayment = (priceAfterDiscount * financials.initialDownPaymentPercent) / 100
    const monthlyPayment = (priceAfterDiscount * financials.monthlyPaymentPercent) / 100

    return {
      basePrice: price,
      discount,
      priceAfterDiscount,
      downPayment,
      initialDownPayment,
      monthlyPayment,
      financingAmount: priceAfterDiscount - downPayment
    }
  }, [estimatedPrice, financials])

  // Actualizar financials
  const updateFinancials = useCallback((updates) => {
    setFinancials(prev => ({ ...prev, ...updates }))
  }, [])

  // Obtener cotización oficial
  const getQuote = useCallback(async () => {
    if (!selectedLot || !selectedModel) {
      setError('Selecciona lote y modelo')
      return null
    }

    // Validar selectedOptions
    const isValid = quoteService.validateSelectedOptions(selectedOptions, catalogConfig)
    if (!isValid) {
      setError('Las opciones seleccionadas no son válidas')
      return null
    }

    setLoadingQuote(true)
    setError(null)
    try {
      const quoteData = {
        projectId,
        lot: selectedLot._id,
        model: selectedModel._id,
        facade: selectedFacade?._id,
        initialPayment: calculatedFinancials.initialDownPayment,
        selectedOptions // 🆕 Nuevo formato con catalog-config
      }

      const result = await quoteService.getPropertyQuote(quoteData)
      setQuoteResult(result)
      return result
    } catch (err) {
      console.error('Error getting quote:', err)
      setError(err.message || 'Error al obtener cotización')
      return null
    } finally {
      setLoadingQuote(false)
    }
  }, [projectId, selectedLot, selectedModel, selectedFacade, selectedOptions, catalogConfig, calculatedFinancials])

  // Resetear todo
  const reset = useCallback(() => {
    setSelectedLot(null)
    setSelectedModel(null)
    setSelectedFacade(null)
    setSelectedOptions({})
    setQuoteResult(null)
    setError(null)
  }, [])

  // Helpers para obtener opciones de un level
  const getLevelOptions = useCallback((levelKey) => {
    return catalogConfigService.getLevelOptions(catalogConfig, levelKey)
  }, [catalogConfig])

  // Verificar si un level tiene opciones seleccionadas
  const hasLevelSelection = useCallback((levelKey) => {
    return !!selectedOptions[levelKey]
  }, [selectedOptions])

  // Verificar si todas las selecciones están completas
  const isSelectionComplete = useMemo(() => {
    if (!catalogConfig?.structure?.levels) return false
    
    const requiredLevels = Object.keys(catalogConfig.structure.levels)
    return requiredLevels.every(levelKey => selectedOptions[levelKey])
  }, [catalogConfig, selectedOptions])

  return {
    // Config
    catalogConfig,
    loadingConfig,
    refreshConfig: loadCatalogConfig,

    // Data
    lots,
    models,
    facades,
    loadingData,
    refreshData: loadPropertyData,

    // Selections
    selectedLot,
    setSelectedLot,
    selectedModel,
    setSelectedModel,
    selectedFacade,
    setSelectedFacade,
    selectedOptions,
    setSelectedOptions,
    setLevelOption,
    resetLevelOption,
    resetAllOptions,

    // Financials
    financials,
    updateFinancials,
    calculatedFinancials,

    // Quote
    quoteResult,
    loadingQuote,
    getQuote,

    // Calculations
    estimatedPrice,
    currentAdjustments,

    // Helpers
    getLevelOptions,
    hasLevelSelection,
    isSelectionComplete,

    // State
    error,
    reset,
    loading: loadingConfig || loadingData || loadingQuote
  }
}

export default useHouseQuote