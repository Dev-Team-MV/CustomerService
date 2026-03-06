import { createContext, useContext, useState, useEffect } from 'react'
import { propertyService } from '../services/propertyService'
import projectService from '../services/projectService'

const PropertyContext = createContext()

export const useProperty = () => {
  const context = useContext(PropertyContext)
  if (!context) {
    throw new Error('useProperty must be used within a PropertyProvider')
  }
  return context
}

export const PropertyProvider = ({ children }) => {
  const [lots, setLots] = useState([])
  const [models, setModels] = useState([])
  const [facades, setFacades] = useState([])
  const [selectedLot, setSelectedLot] = useState(null)
  const [selectedModel, setSelectedModel] = useState(null)
  const [selectedFacade, setSelectedFacade] = useState(null)
  const [selectedDeck, setSelectedDeck] = useState(null)

  // ✅ Proyectos
  const [projects, setProjects] = useState([])
  const [selectedProject, setSelectedProject] = useState('')
  const [loadingProjects, setLoadingProjects] = useState(false)

  // Opciones de pricing del modelo
  const [modelPricingOptions, setModelPricingOptions] = useState(null)
  const [selectedPricingOption, setSelectedPricingOption] = useState(null)

  const [options, setOptions] = useState({
    storage: false,
    balcony: false,
    upgrade: false
  })

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [financials, setFinancials] = useState({
    listPrice: 0,
    discount: 0,
    discountPercent: 10,
    presalePrice: 0,
    totalDownPayment: 0,
    downPaymentPercent: 10,
    initialDownPayment: 0,
    initialDownPaymentPercent: 3,
    monthlyPayment: 0,
    monthlyPaymentPercent: 2,
    mortgage: 0
  })

  // Load initial data
  useEffect(() => {
    loadData()
    loadProjects()
  }, [])

  // Recalculate financials whenever selections or percentages change
  useEffect(() => {
    calculateFinancials()
  }, [
    selectedLot,
    selectedModel,
    selectedFacade,
    selectedDeck,
    selectedPricingOption,
    options.balcony,
    options.storage,
    options.upgrade,
    financials.discountPercent,
    financials.downPaymentPercent,
    financials.initialDownPaymentPercent,
    financials.monthlyPaymentPercent
  ])

  const loadData = async () => {
    try {
      setLoading(true)
      const [lotsData, modelsData] = await Promise.all([
        propertyService.getLots(),
        propertyService.getModels()
      ])
      setLots(lotsData)
      setModels(modelsData)
    } catch (err) {
      setError(err.message)
      console.error('Error loading data:', err)
    } finally {
      setLoading(false)
    }
  }

  // ✅ Cargar proyectos
  const loadProjects = async () => {
    try {
      setLoadingProjects(true)
      const data = await projectService.getAll()
      setProjects(data)
      // Auto-seleccionar si solo hay uno
      if (data.length === 1) {
        setSelectedProject(data[0]._id)
      }
    } catch (err) {
      console.error('Error loading projects:', err)
    } finally {
      setLoadingProjects(false)
    }
  }

  const calculateFinancials = () => {
    const lotPrice = selectedLot?.price || 0

    let modelPrice = 0

    if (selectedPricingOption) {
      modelPrice = selectedPricingOption.price || 0
    } else if (selectedModel) {
      modelPrice = selectedModel.price || 0

      if (options.upgrade && selectedModel.upgrades?.[0]) {
        modelPrice += selectedModel.upgrades[0].price
      }
      if (options.balcony && selectedModel.balconies?.[0]) {
        modelPrice += selectedModel.balconies[0].price
      }
      if (options.storage && selectedModel.storages?.[0]) {
        modelPrice += selectedModel.storages[0].price
      }
    }

    const facadePrice = selectedFacade?.price || 0
    const deckPrice = selectedDeck?.price || 0
    const calculatedListPrice = lotPrice + modelPrice + facadePrice + deckPrice

    const discount = (calculatedListPrice * financials.discountPercent) / 100
    const presalePrice = calculatedListPrice - discount
    const totalDownPayment = (presalePrice * financials.downPaymentPercent) / 100
    const initialDownPayment = (presalePrice * financials.initialDownPaymentPercent) / 100
    const remaining = presalePrice - totalDownPayment
    const monthlyPayment = (remaining * financials.monthlyPaymentPercent) / 100
    const mortgage = presalePrice - totalDownPayment

    setFinancials(prev => ({
      ...prev,
      listPrice: calculatedListPrice,
      discount,
      presalePrice,
      totalDownPayment,
      initialDownPayment,
      monthlyPayment,
      mortgage
    }))
  }

  const selectLot = (lot) => setSelectedLot(lot)

  const selectModel = async (model) => {
    setSelectedModel(model)
    setSelectedFacade(null)
    setSelectedDeck(null)
    setSelectedPricingOption(null)
    setModelPricingOptions(null)
    setOptions({ storage: false, balcony: false, upgrade: false })

    try {
      const modelFacades = await propertyService.getFacadesByModel(model._id)
      setFacades(modelFacades)

      if (model.balconyPrice > 0 || model.upgradePrice > 0 || model.storagePrice > 0) {
        const pricingOptions = await propertyService.getModelPricingOptions(model._id)
        setModelPricingOptions(pricingOptions)
      }
    } catch (err) {
      console.error('Error loading model data:', err)
      setFacades([])
      setModelPricingOptions(null)
    }
  }

  const selectFacade = (facade) => {
    if (!facade) {
      setSelectedFacade(null)
      setSelectedDeck(null)
      return
    }
    if (selectedFacade?._id === facade._id) {
      setSelectedFacade(null)
    } else {
      setSelectedFacade(facade)
    }
    setSelectedDeck(null)
  }

  const selectDeck = (deck) => {
    if (selectedDeck?.name === deck.name) {
      setSelectedDeck(null)
    } else {
      setSelectedDeck(deck)
    }
  }

  const selectPricingOption = (option) => {
    setSelectedPricingOption(option)
    setOptions({
      storage: option.hasStorage || false,
      balcony: option.hasBalcony || false,
      upgrade: option.modelType === 'upgrade'
    })
  }

  const toggleOption = (optionName) => {
    const newOptions = { ...options, [optionName]: !options[optionName] }
    setOptions(newOptions)

    if (modelPricingOptions && modelPricingOptions.allOptions) {
      const matchingOption = modelPricingOptions.allOptions.find(opt => {
        const isUpgradeMatch = newOptions.upgrade ? opt.modelType === 'upgrade' : opt.modelType === 'basic'
        const isBalconyMatch = opt.hasBalcony === newOptions.balcony
        const isStorageMatch = opt.hasStorage === newOptions.storage
        return isUpgradeMatch && isBalconyMatch && isStorageMatch
      })

      if (matchingOption) {
        setSelectedPricingOption(matchingOption)
      } else {
        setSelectedPricingOption(null)
      }
    }
  }

  const updateFinancials = (updates) => {
    setFinancials(prev => ({ ...prev, ...updates }))
  }

  const getModelPricingInfo = () => {
    if (!selectedModel) return null
    return {
      hasBalcony: Array.isArray(selectedModel.balconies) && selectedModel.balconies.length > 0,
      hasUpgrade: Array.isArray(selectedModel.upgrades) && selectedModel.upgrades.length > 0,
      hasStorage: Array.isArray(selectedModel.storages) && selectedModel.storages.length > 0,
      balconyPrice: selectedModel.balconies?.[0]?.price || 0,
      upgradePrice: selectedModel.upgrades?.[0]?.price || 0,
      storagePrice: selectedModel.storages?.[0]?.price || 0
    }
  }

  const value = {
    // Data
    lots,
    models,
    facades,
    // Selections
    selectedLot,
    selectedModel,
    selectedFacade,
    selectedDeck,
    // ✅ Proyectos
    projects,
    selectedProject,
    setSelectedProject,
    loadingProjects,
    // Options
    options,
    setOptions,
    // Financials
    financials,
    updateFinancials,
    // Status
    loading,
    error,
    // Actions
    selectLot,
    selectModel,
    selectFacade,
    selectDeck,
    // Pricing options
    modelPricingOptions,
    selectedPricingOption,
    selectPricingOption,
    toggleOption,
    getModelPricingInfo,
  }

  return (
    <PropertyContext.Provider value={value}>
      {children}
    </PropertyContext.Provider>
  )
}
