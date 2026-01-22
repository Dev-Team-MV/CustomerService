// import { createContext, useContext, useState, useEffect } from 'react'
// import { propertyService } from '../services/propertyService'

// const PropertyContext = createContext()

// export const useProperty = () => {
//   const context = useContext(PropertyContext)
//   if (!context) {
//     throw new Error('useProperty must be used within a PropertyProvider')
//   }
//   return context
// }

// export const PropertyProvider = ({ children }) => {
//   const [lots, setLots] = useState([])
//   const [models, setModels] = useState([])
//   const [facades, setFacades] = useState([])
//   const [selectedLot, setSelectedLot] = useState(null)
//   const [selectedModel, setSelectedModel] = useState(null)
//   const [selectedFacade, setSelectedFacade] = useState(null)
//   const [options, setOptions] = useState({
//     storage: false
//   })
//   const [loading, setLoading] = useState(true)
//   const [error, setError] = useState(null)

//   const [financials, setFinancials] = useState({
//     listPrice: 0,
//     discount: 0,
//     discountPercent: 10,
//     presalePrice: 0,
//     totalDownPayment: 0,
//     downPaymentPercent: 10,
//     initialDownPayment: 0,
//     initialDownPaymentPercent: 3,
//     monthlyPayment: 0,
//     monthlyPaymentPercent: 2,
//     mortgage: 0
//   })

//   // Load initial data
//   useEffect(() => {
//     loadData()
//   }, [])

//   // Recalculate financials whenever selections or percentages change
//   useEffect(() => {
//     calculateFinancials()
//   }, [selectedLot, selectedModel, selectedFacade, financials.discountPercent, financials.downPaymentPercent, financials.initialDownPaymentPercent, financials.monthlyPaymentPercent])

//   const loadData = async () => {
//     try {
//       setLoading(true)
//       const [lotsData, modelsData] = await Promise.all([
//         propertyService.getLots(),
//         propertyService.getModels()
//       ])
//       setLots(lotsData)
//       setModels(modelsData)
//     } catch (err) {
//       setError(err.message)
//       console.error('Error loading data:', err)
//     } finally {
//       setLoading(false)
//     }
//   }

//   const calculateFinancials = () => {
//     // Calculate listPrice from selections
//     const lotPrice = selectedLot?.price || 0
//     const modelPrice = selectedModel?.price || 0
//     const facadePrice = selectedFacade?.price || 0 // Cambiado de priceModifier a price

//     const calculatedListPrice = lotPrice + modelPrice + facadePrice

//     // Calculate all financial values
//     const discount = (calculatedListPrice * financials.discountPercent) / 100
//     const presalePrice = calculatedListPrice - discount
//     const totalDownPayment = (presalePrice * financials.downPaymentPercent) / 100
//     const initialDownPayment = (presalePrice * financials.initialDownPaymentPercent) / 100
//     const remaining = presalePrice - totalDownPayment
//     const monthlyPayment = (remaining * financials.monthlyPaymentPercent) / 100
//     const mortgage = presalePrice - totalDownPayment

//     setFinancials(prev => ({
//       ...prev,
//       listPrice: calculatedListPrice,
//       discount,
//       presalePrice,
//       totalDownPayment,
//       initialDownPayment,
//       monthlyPayment,
//       mortgage
//     }))
//   }

//   const selectLot = (lot) => {
//     setSelectedLot(lot)
//   }

//   const selectModel = async (model) => {
//     setSelectedModel(model)
//     setSelectedFacade(null) // ✅ Reset facade cuando cambia el modelo
    
//     try {
//       const modelFacades = await propertyService.getFacadesByModel(model._id)
//       setFacades(modelFacades)
//     } catch (err) {
//       console.error('Error loading facades:', err)
//       setFacades([])
//     }
//   }

//   const selectFacade = (facade) => {
//     // ✅ Toggle selection: si clickea la misma, deselecciona
//     if (selectedFacade?._id === facade._id) {
//       setSelectedFacade(null)
//     } else {
//       setSelectedFacade(facade)
//     }
//   }

//   const updateFinancials = (updates) => {
//     setFinancials(prev => ({
//       ...prev,
//       ...updates
//     }))
//   }

//   const value = {
//     lots,
//     models,
//     facades,
//     selectedLot,
//     selectedModel,
//     selectedFacade,
//     options,
//     setOptions,
//     financials,
//     loading,
//     error,
//     selectLot,
//     selectModel,
//     selectFacade,
//     updateFinancials
//   }

//   return (
//     <PropertyContext.Provider value={value}>
//       {children}
//     </PropertyContext.Provider>
//   )
// }


import { createContext, useContext, useState, useEffect } from 'react'
import { propertyService } from '../services/propertyService'

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
  }, [])

  // ✅ Recalculate financials whenever selections or percentages change
  useEffect(() => {
    calculateFinancials()
  }, [
    selectedLot, 
    selectedModel, 
    selectedFacade, 
    selectedPricingOption,
    options.balcony,  // ✅ Agregar dependencias individuales
    options.storage,  // ✅ para que detecte cambios
    options.upgrade,  // ✅ en cada opción
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

  const calculateFinancials = () => {
    const lotPrice = selectedLot?.price || 0
    
    // ✅ Calcular precio del modelo con las opciones seleccionadas
    let modelPrice = 0
    
    if (selectedPricingOption) {
      // Si hay una opción de pricing seleccionada, usar su precio
      modelPrice = selectedPricingOption.price || 0
      console.log('Using pricing option price:', modelPrice)
    } else if (selectedModel) {
      // Si no hay opción seleccionada, calcular manualmente
      modelPrice = selectedModel.price || 0
      
      // ✅ Agregar precios de opciones individuales
      if (options.upgrade && selectedModel.upgradePrice) {
        modelPrice += selectedModel.upgradePrice
        console.log('Adding upgrade:', selectedModel.upgradePrice)
      }
      if (options.balcony && selectedModel.balconyPrice) {
        modelPrice += selectedModel.balconyPrice
        console.log('Adding balcony:', selectedModel.balconyPrice)
      }
      if (options.storage && selectedModel.storagePrice) {
        modelPrice += selectedModel.storagePrice
        console.log('Adding storage:', selectedModel.storagePrice)
      }
      
      console.log('Calculated model price:', modelPrice)
    }
    
    const facadePrice = selectedFacade?.price || 0

    const calculatedListPrice = lotPrice + modelPrice + facadePrice

    console.log('Calculating financials:', {
      lotPrice,
      modelPrice,
      facadePrice,
      totalListPrice: calculatedListPrice,
      options
    })

    // Calculate all financial values
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

  const selectLot = (lot) => {
    setSelectedLot(lot)
  }

  const selectModel = async (model) => {
    console.log('Selecting model:', model)
    setSelectedModel(model)
    setSelectedFacade(null)
    setSelectedPricingOption(null)
    setModelPricingOptions(null)
    
    // Reset options cuando cambia el modelo
    setOptions({
      storage: false,
      balcony: false,
      upgrade: false
    })
    
    try {
      // Load facades
      const modelFacades = await propertyService.getFacadesByModel(model._id)
      setFacades(modelFacades)
      
      // Load pricing options si el modelo tiene opciones
      if (model.balconyPrice > 0 || model.upgradePrice > 0 || model.storagePrice > 0) {
        const pricingOptions = await propertyService.getModelPricingOptions(model._id)
        setModelPricingOptions(pricingOptions)
        console.log('Pricing options loaded:', pricingOptions)
      }
    } catch (err) {
      console.error('Error loading model data:', err)
      setFacades([])
      setModelPricingOptions(null)
    }
  }

  const selectFacade = (facade) => {
    if (selectedFacade?._id === facade._id) {
      setSelectedFacade(null)
    } else {
      setSelectedFacade(facade)
    }
  }

  // Seleccionar una opción de pricing específica
  const selectPricingOption = (option) => {
    console.log('Selecting pricing option:', option)
    setSelectedPricingOption(option)
    
    // Actualizar los toggles de opciones basado en la opción seleccionada
    setOptions({
      storage: option.hasStorage || false,
      balcony: option.hasBalcony || false,
      upgrade: option.modelType === 'upgrade'
    })
  }

  // ✅ Toggle manual de opciones (para UI interactiva)
  const toggleOption = (optionName) => {
    console.log('Toggling option:', optionName, 'Current value:', options[optionName])
    const newOptions = { ...options, [optionName]: !options[optionName] }
    setOptions(newOptions)
    
    console.log('New options:', newOptions)
    
    // Buscar la opción de pricing que coincida con las opciones seleccionadas
    if (modelPricingOptions && modelPricingOptions.allOptions) {
      const matchingOption = modelPricingOptions.allOptions.find(opt => {
        const isUpgradeMatch = newOptions.upgrade ? opt.modelType === 'upgrade' : opt.modelType === 'basic'
        const isBalconyMatch = opt.hasBalcony === newOptions.balcony
        const isStorageMatch = opt.hasStorage === newOptions.storage
        
        return isUpgradeMatch && isBalconyMatch && isStorageMatch
      })
      
      if (matchingOption) {
        console.log('Found matching option:', matchingOption)
        setSelectedPricingOption(matchingOption)
      } else {
        console.log('No matching option found, clearing selectedPricingOption')
        setSelectedPricingOption(null)
      }
    }
  }

  const updateFinancials = (updates) => {
    setFinancials(prev => ({
      ...prev,
      ...updates
    }))
  }

  // Obtener información de pricing del modelo actual
  const getModelPricingInfo = () => {
    if (!selectedModel) return null
    
    return {
      hasBalcony: (selectedModel.balconyPrice || 0) > 0,
      hasUpgrade: (selectedModel.upgradePrice || 0) > 0,
      hasStorage: (selectedModel.storagePrice || 0) > 0,
      balconyPrice: selectedModel.balconyPrice || 0,
      upgradePrice: selectedModel.upgradePrice || 0,
      storagePrice: selectedModel.storagePrice || 0
    }
  }

  const value = {
    lots,
    models,
    facades,
    selectedLot,
    selectedModel,
    selectedFacade,
    options,
    setOptions,
    financials,
    loading,
    error,
    selectLot,
    selectModel,
    selectFacade,
    updateFinancials,
    
    // Pricing options
    modelPricingOptions,
    selectedPricingOption,
    selectPricingOption,
    toggleOption,
    getModelPricingInfo
  }

  return (
    <PropertyContext.Provider value={value}>
      {children}
    </PropertyContext.Provider>
  )
}