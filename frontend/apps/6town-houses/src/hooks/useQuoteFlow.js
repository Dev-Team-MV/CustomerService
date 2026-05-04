import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useCatalogConfig } from '@shared/hooks/useCatalogConfig'
import api from '@shared/services/api'
import { useAuth } from '@shared/context/AuthContext'
import { usePropertyBuilding } from '@shared/context/ProperyQuoteContext'
import quoteService from '@shared/services/quoteService'
import { calculateEstimatedPrice } from '@shared/utils/pricingEngine'

const useQuoteFlow = () => {
  const navigate = useNavigate()
  const { t } = useTranslation(['quote', 'common'])
  const projectId = import.meta.env.VITE_PROJECT_ID
  const { isAuthenticated } = useAuth()
  const { catalogConfig, loading: loadingConfig } = useCatalogConfig(projectId, { activeOnly: true })

  const {
    financials,
    updateFinancials,
    setSelectedBuilding: setContextBuilding,
    setSelectedApartment: setContextApartment,
    setSelectedProject,
    setSelectedOptions: setContextOptions,
  } = usePropertyBuilding()

  const [currentStep, setCurrentStep] = useState(0)
  const [selectedBuilding, setSelectedBuilding] = useState(null)
  const [selectedOptions, setSelectedOptions] = useState({})
  const [customizationData, setCustomizationData] = useState(null)
  const [quoteResult, setQuoteResult] = useState(null)
  const [loadingQuote, setLoadingQuote] = useState(false)
  const [error, setError] = useState(null)
  const [residentExpanded, setResidentExpanded] = useState(false)
  const [modelFloors, setModelFloors] = useState([])
  const [projectData, setProjectData] = useState(null)

  const STEPS = [
    t('steps.selectHouse'),
    t('steps.customize'),
    t('steps.quote'),
    t('steps.assignResident')
  ]

  useEffect(() => {
    if (selectedOptions && Object.keys(selectedOptions).length > 0) {
      setContextOptions(selectedOptions)
    }
  }, [selectedOptions, setContextOptions])

  useEffect(() => {
    if (projectId) {
      setSelectedProject(projectId)
    }
  }, [projectId, setSelectedProject])

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await api.get(`/projects/${projectId}`)
        setProjectData(response.data)
      } catch (err) {
        console.error('Error fetching project:', err)
      }
    }
    
    fetchProject()
  }, [projectId])

  useEffect(() => {
    const fetchModelFloors = async () => {
      if (!selectedBuilding?.model?._id) return
      
      try {
        const response = await api.get(`/models/${selectedBuilding.model._id}/floors`)
        setModelFloors(response.data.floors || [])
      } catch (err) {
        console.error('Error fetching model floors:', err)
      }
    }
    
    fetchModelFloors()
  }, [selectedBuilding])

  const facadeEnabled = projectData?.facadeEnabled ?? true
 
  const basePrice = useMemo(() => {
    if (!selectedBuilding) return 0
    
    console.log('🏠 ===== CALCULANDO BASE PRICE =====')
    console.log('📦 selectedBuilding completo:', selectedBuilding)
    console.log('📍 Lote:', selectedBuilding.lot)
    console.log('🏗️ Modelo:', selectedBuilding.model)
    console.log('🎨 Fachada:', selectedBuilding.facade)
    console.log('⚙️ facadeEnabled:', facadeEnabled)
    
    const lotPrice = selectedBuilding.lot?.price || 0
    const modelPrice = selectedBuilding.model?.price || 0
    const facadePrice = facadeEnabled && selectedBuilding.facade?.price ? selectedBuilding.facade.price : 0
    
    console.log('💰 Precio Lote:', lotPrice)
    console.log('💰 Precio Modelo:', modelPrice)
    console.log('💰 Precio Fachada:', facadePrice)
    console.log('💰 BASE PRICE TOTAL:', lotPrice + modelPrice + facadePrice)
    console.log('=====================================')
    
    return lotPrice + modelPrice + facadePrice
  }, [selectedBuilding, facadeEnabled])

  const estimatedPrice = useMemo(() => {
    if (!catalogConfig || !selectedBuilding || Object.keys(selectedOptions).length === 0) return null
    
    return calculateEstimatedPrice({
      basePrice,
      pricingRules: catalogConfig?.pricingRules || [],
      selectedOptions
    })
  }, [basePrice, catalogConfig, selectedOptions, selectedBuilding])

  const mockApartment = useMemo(() => {
    if (!selectedBuilding) return null
    
    const price = estimatedPrice?.totalPrice || quoteResult?.totals?.totalPrice || basePrice || 0
    
    return {
      _id: selectedBuilding._id,
      apartmentNumber: selectedBuilding.name,
      price: price,
      apartmentModel: {
        name: selectedBuilding.model?.model || t('quote:priceBreakdown.model'),
        _id: selectedBuilding.model?._id
      },
      floorNumber: 1,
      pending: 0
    }
  }, [selectedBuilding, estimatedPrice, quoteResult, basePrice, t])

  useEffect(() => {
    if (mockApartment) {
      setContextApartment(mockApartment)
    }
  }, [mockApartment, setContextApartment])

  useEffect(() => {
    if (selectedBuilding && basePrice > 0) {
      const downPaymentPercent = financials.downPaymentPercent || 20
      const initialDownPaymentPercent = financials.initialDownPaymentPercent || 10
      const monthlyPaymentPercent = financials.monthlyPaymentPercent || 0
      
      const discount = (basePrice * (financials.discountPercent || 0)) / 100
      const presalePrice = basePrice - discount
      const totalDownPayment = (presalePrice * downPaymentPercent) / 100
      const initialDownPayment = (presalePrice * initialDownPaymentPercent) / 100
      const mortgage = presalePrice - totalDownPayment
      const monthlyPayment = (mortgage * monthlyPaymentPercent) / 100
      
      updateFinancials({
        listPrice: basePrice,
        discount,
        discountPercent: financials.discountPercent || 0,
        presalePrice,
        totalDownPayment,
        downPaymentPercent,
        initialDownPayment,
        initialDownPaymentPercent,
        monthlyPayment,
        monthlyPaymentPercent,
        mortgage,
        pending: presalePrice - initialDownPayment
      })
      
      console.log('✅ Financials actualizados con base price preservando porcentajes del usuario')
      console.log('====================================================')
    }
  }, [selectedBuilding, basePrice])

  useEffect(() => {
    if (estimatedPrice && currentStep >= 1) {
      const totalPrice = estimatedPrice.totalPrice
      
      const downPaymentPercent = financials.downPaymentPercent || 20
      const initialDownPaymentPercent = financials.initialDownPaymentPercent || 10
      const monthlyPaymentPercent = financials.monthlyPaymentPercent || 0
      
      const discount = (totalPrice * (financials.discountPercent || 0)) / 100
      const presalePrice = totalPrice - discount
      const totalDownPayment = (presalePrice * downPaymentPercent) / 100
      const initialDownPayment = (presalePrice * initialDownPaymentPercent) / 100
      const mortgage = presalePrice - totalDownPayment
      const monthlyPayment = (mortgage * monthlyPaymentPercent) / 100
      
      updateFinancials({
        listPrice: totalPrice,
        discount,
        discountPercent: financials.discountPercent || 0,
        presalePrice,
        totalDownPayment,
        downPaymentPercent,
        initialDownPayment,
        initialDownPaymentPercent,
        monthlyPayment,
        monthlyPaymentPercent,
        mortgage,
        pending: presalePrice - initialDownPayment
      })
    }
  }, [estimatedPrice, currentStep])

  const handleBuildingSelect = async (building) => {
    console.log('🎯 ===== CASA SELECCIONADA =====')
    console.log('🏠 Building completo:', building)
    console.log('📋 Building name:', building.name)
    console.log('🔗 Building quoteRef:', building.quoteRef)
    console.log('📍 Lote ID:', building.quoteRef?.lot)
    console.log('🏗️ Modelo ID:', building.quoteRef?.model)
    console.log('🎨 Fachada ID:', building.quoteRef?.facade)
    
    try {
      const lotId = building.quoteRef?.lot
      const modelId = building.quoteRef?.model
      const facadeId = building.quoteRef?.facade
      
      console.log('🔄 Fetching datos completos...')
      
      const [lotData, modelData, facadeData] = await Promise.all([
        lotId ? api.get(`/lots/${lotId}`).then(res => res.data).catch(err => {
          console.error('Error fetching lot:', err)
          return null
        }) : Promise.resolve(null),
        modelId ? api.get(`/models/${modelId}`).then(res => res.data).catch(err => {
          console.error('Error fetching model:', err)
          return null
        }) : Promise.resolve(null),
        facadeId ? api.get(`/facades/${facadeId}`).then(res => res.data).catch(err => {
          console.error('Error fetching facade:', err)
          return null
        }) : Promise.resolve(null)
      ])
      
      console.log('✅ Datos obtenidos:')
      console.log('📍 Lote:', lotData)
      console.log('🏗️ Modelo:', modelData)
      console.log('🎨 Fachada:', facadeData)
      console.log('💰 Lote price:', lotData?.price)
      console.log('💰 Modelo price:', modelData?.price)
      console.log('💰 Fachada price:', facadeData?.price)
      
      const populatedBuilding = {
        ...building,
        lot: lotData,
        model: modelData,
        facade: facadeData
      }
      
      console.log('🏠 Building poblado:', populatedBuilding)
      console.log('================================')
      
      setSelectedBuilding(populatedBuilding)
      setContextBuilding(populatedBuilding)
      setCurrentStep(1)
      setError(null)
    } catch (error) {
      console.error('❌ Error al obtener datos de la casa:', error)
      setError(t('errors.loadingBuilding'))
    }
  }

  const handleCustomizationComplete = async (data) => {
    try {
      setLoadingQuote(true)
      setError(null)
      setCustomizationData(data)

      const quotePayload = {
        projectId,
        lot: selectedBuilding.quoteRef?.lot,
        model: selectedBuilding.quoteRef?.model,
        selectedOptions: data.selectedOptions
      }

      if (facadeEnabled && selectedBuilding.quoteRef?.facade) {
        quotePayload.facade = selectedBuilding.quoteRef.facade
      }

      console.log('📤 Quote payload:', quotePayload)

      const response = await quoteService.getHouseQuote(quotePayload)

      setQuoteResult(response)

      if (response.totals?.totalPrice) {
        const totalPrice = response.totals.totalPrice
        updateFinancials({
          listPrice: totalPrice,
          discount: 0,
          discountPercent: 0,
          presalePrice: totalPrice,
          totalDownPayment: totalPrice * 0.2,
          downPaymentPercent: 20,
          initialDownPayment: totalPrice * 0.1,
          initialDownPaymentPercent: 10,
          monthlyPayment: 0,
          monthlyPaymentPercent: 0,
          mortgage: totalPrice * 0.8,
          pending: 0
        })
      }

      setCurrentStep(2)
    } catch (err) {
      console.error('Error calculating quote:', err)
      setError(t('errors.calculatingQuote'))
    } finally {
      setLoadingQuote(false)
    }
  }

  const handleOptionsChange = (options) => {
    setSelectedOptions(options)
  }

  const handleContinue = () => {
    if (currentStep === 2 && isAuthenticated) {
      setCurrentStep(3)
      setResidentExpanded(true)
    } else if (currentStep === 2 && !isAuthenticated) {
      navigate('/login')
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  return {
    currentStep,
    selectedBuilding,
    selectedOptions,
    customizationData,
    quoteResult,
    loadingQuote,
    error,
    residentExpanded,
    modelFloors,
    projectData,
    catalogConfig,
    loadingConfig,
    facadeEnabled,
    basePrice,
    estimatedPrice,
    mockApartment,
    isAuthenticated,
    STEPS,
    projectId,
    handleBuildingSelect,
    handleCustomizationComplete,
    handleOptionsChange,
    handleContinue,
    handleBack,
    setResidentExpanded,
    setCurrentStep,
    setSelectedBuilding,
    setError
  }
}

export default useQuoteFlow