// import { createContext, useState, useContext, useEffect } from 'react'
// import { propertyService } from '../services/propertyService'

// const PropertyContext = createContext(null)

// export const useProperty = () => {
//   const context = useContext(PropertyContext)
//   if (!context) {
//     throw new Error('useProperty must be used within a PropertyProvider')
//   }
//   return context
// }

// export const PropertyProvider = ({ children }) => {
//   // Selection state
//   const [selectedLot, setSelectedLot] = useState(null)
//   const [selectedModel, setSelectedModel] = useState(null)
//   const [selectedFacade, setSelectedFacade] = useState(null)
  
//   // Data from backend
//   const [lots, setLots] = useState([])
//   const [models, setModels] = useState([])
//   const [facades, setFacades] = useState([])
  
//   // Loading states
//   const [loading, setLoading] = useState(true)
//   const [error, setError] = useState(null)
  
//   // Options
//   const [options, setOptions] = useState({
//     storage: false
//   })
  
//   // Financial calculations
//   const [financials, setFinancials] = useState({
//     listPrice: 0,
//     discount: 0,
//     discountPercent: 0,
//     presalePrice: 0,
//     downPaymentPercent: 10,
//     totalDownPayment: 0,
//     initialDownPaymentPercent: 3,
//     initialDownPayment: 0,
//     monthlyPaymentPercent: 2,
//     monthlyPayment: 0,
//     mortgage: 0
//   })
  
//   // Profits calculations
//   const [profits, setProfits] = useState({
//     phaseI: {
//       price: 0,
//       discountPercent: 10,
//       discount: 0,
//       purchasePrice: 0,
//       appreciationPercent: 0,
//       downPaymentPercent: 10,
//       downPayment: 0,
//       roi: 0
//     },
//     phaseII: {
//       discountPercent: 0,
//       discount: 0,
//       purchasePrice: 0,
//       appreciationPercent: 0,
//       downPayment: 0
//     }
//   })

//   // Load initial data
//   useEffect(() => {
//     loadData()
//   }, [])

//   const loadData = async () => {
//     try {
//       setLoading(true)
//       const [lotsData, modelsData] = await Promise.all([
//         propertyService.getLots(),
//         propertyService.getModels()
//       ])
      
//       setLots(lotsData)
//       setModels(modelsData)
//       setError(null)
//     } catch (err) {
//       setError(err.message)
//       console.error('Error loading property data:', err)
//     } finally {
//       setLoading(false)
//     }
//   }

//   // Select lot
//   const selectLot = (lot) => {
//     setSelectedLot(lot)
//     updateFinancials({ lotPrice: lot?.price || 0 })
//   }

//   // // Select model
//   // const selectModel = (model) => {
//   //   setSelectedModel(model)
//   //   // Load facades for this model (for now, we'll use mock data)
//   //   const modelFacades = propertyService.getFacades(model?.modelNumber)
//   //   setFacades(modelFacades)
//   //   setSelectedFacade(null) // Reset facade selection
    
//   //   // Update list price based on lot + model
//   //   const lotPrice = selectedLot?.price || 0
//   //   const modelPrice = model?.price || 0
//   //   updateFinancials({ listPrice: lotPrice + modelPrice })
//   // }

//   // // Select facade
//   // const selectFacade = (facade) => {
//   //   setSelectedFacade(facade)
//   //   // Apply facade price modifier if any
//   //   const modifier = facade?.priceModifier || 0
//   //   const currentListPrice = financials.listPrice
//   //   updateFinancials({ listPrice: currentListPrice + modifier })
//   // }

//     // Select model
//   const selectModel = async (model) => {
//     setSelectedModel(model)
//     setSelectedFacade(null) // Reset facade selection
    
//     // Load facades from backend for this model
//     try {
//       const modelFacades = await propertyService.getFacadesByModel(model._id)
//       setFacades(modelFacades)
//     } catch (err) {
//       console.error('Error loading facades:', err)
//       setFacades([])
//     }
    
//     updateFinancials({ modelPrice: model?.price || 0, facadePrice: 0 })
//   }

//   // Select facade
//   const selectFacade = (facade) => {
//     setSelectedFacade(facade)
//     updateFinancials({ facadePrice: facade?.price || 0 })
//   }


//   // Update financial calculations
//   const updateFinancials = (updates) => {
//     setFinancials(prev => {
//       const updated = { ...prev, ...updates }
      
//       // Calculate presale price
//       if (updates.listPrice !== undefined || updates.discount !== undefined || updates.discountPercent !== undefined) {
//         if (updates.discountPercent !== undefined) {
//           updated.discount = (updated.listPrice * updated.discountPercent) / 100
//         } else if (updates.discount !== undefined) {
//           updated.discountPercent = (updated.discount / updated.listPrice) * 100
//         }
//         updated.presalePrice = updated.listPrice - updated.discount
//       }
      
//       // Calculate total down payment
//       if (updates.presalePrice !== undefined || updates.downPaymentPercent !== undefined) {
//         updated.totalDownPayment = (updated.presalePrice * updated.downPaymentPercent) / 100
//       }
      
//       // Calculate initial down payment
//       if (updates.totalDownPayment !== undefined || updates.initialDownPaymentPercent !== undefined) {
//         updated.initialDownPayment = (updated.totalDownPayment * updated.initialDownPaymentPercent) / 100
//       }
      
//       // Calculate monthly payment
//       if (updates.presalePrice !== undefined || updates.totalDownPayment !== undefined || updates.monthlyPaymentPercent !== undefined) {
//         const remaining = updated.presalePrice - updated.totalDownPayment
//         updated.monthlyPayment = (remaining * updated.monthlyPaymentPercent) / 100
//       }
      
//       // Calculate mortgage
//       updated.mortgage = updated.presalePrice - updated.totalDownPayment
      
//       return updated
//     })
//   }

//   // Update profits calculations
//   const updateProfits = (phase, updates) => {
//     setProfits(prev => {
//       const updated = { ...prev }
//       updated[phase] = { ...updated[phase], ...updates }
      
//       if (phase === 'phaseI') {
//         // Calculate Phase I
//         if (updates.price !== undefined || updates.discountPercent !== undefined) {
//           updated.phaseI.discount = (updated.phaseI.price * updated.phaseI.discountPercent) / 100
//           updated.phaseI.purchasePrice = updated.phaseI.price - updated.phaseI.discount
//         }
        
//         if (updates.purchasePrice !== undefined || updates.downPaymentPercent !== undefined) {
//           updated.phaseI.downPayment = (updated.phaseI.purchasePrice * updated.phaseI.downPaymentPercent) / 100
//         }
        
//         // Calculate ROI (simplified - would need appreciation and time period for real calculation)
//         if (updated.phaseI.downPayment > 0) {
//           const appreciation = (updated.phaseI.purchasePrice * updated.phaseI.appreciationPercent) / 100
//           updated.phaseI.roi = (appreciation / updated.phaseI.downPayment) * 100
//         }
//       }
      
//       if (phase === 'phaseII') {
//         // Calculate Phase II
//         if (updates.discountPercent !== undefined) {
//           updated.phaseII.discount = (financials.presalePrice * updated.phaseII.discountPercent) / 100
//           updated.phaseII.purchasePrice = financials.presalePrice - updated.phaseII.discount
//         }
//       }
      
//       return updated
//     })
//   }

//   // Reset selection
//   const resetSelection = () => {
//     setSelectedLot(null)
//     setSelectedModel(null)
//     setSelectedFacade(null)
//     setOptions({ storage: false })
//     setFinancials({
//       listPrice: 0,
//       discount: 0,
//       discountPercent: 0,
//       presalePrice: 0,
//       downPaymentPercent: 10,
//       totalDownPayment: 0,
//       initialDownPaymentPercent: 3,
//       initialDownPayment: 0,
//       monthlyPaymentPercent: 2,
//       monthlyPayment: 0,
//       mortgage: 0
//     })
//   }

//   // Get lot counts by status
//   const getLotCounts = () => {
//     const counts = {
//       hold: 0,
//       available: 0,
//       sold: 0
//     }
    
//     lots.forEach(lot => {
//       if (lot.status === 'pending') counts.hold++
//       else if (lot.status === 'available') counts.available++
//       else if (lot.status === 'sold') counts.sold++
//     })
    
//     return counts
//   }

//   const value = {
//     // State
//     selectedLot,
//     selectedModel,
//     selectedFacade,
//     lots,
//     models,
//     facades,
//     options,
//     financials,
//     profits,
//     loading,
//     error,
    
//     // Actions
//     selectLot,
//     selectModel,
//     selectFacade,
//     setOptions,
//     updateFinancials,
//     updateProfits,
//     resetSelection,
//     getLotCounts,
//     refreshData: loadData
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
  const [options, setOptions] = useState({
    storage: false
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

  // Recalculate financials whenever selections or percentages change
  useEffect(() => {
    calculateFinancials()
  }, [selectedLot, selectedModel, selectedFacade, financials.discountPercent, financials.downPaymentPercent, financials.initialDownPaymentPercent, financials.monthlyPaymentPercent])

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
    // Calculate listPrice from selections
    const lotPrice = selectedLot?.price || 0
    const modelPrice = selectedModel?.price || 0
    const facadePrice = selectedFacade?.price || 0 // Cambiado de priceModifier a price

    const calculatedListPrice = lotPrice + modelPrice + facadePrice

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
    setSelectedModel(model)
    setSelectedFacade(null) // ✅ Reset facade cuando cambia el modelo
    
    try {
      const modelFacades = await propertyService.getFacadesByModel(model._id)
      setFacades(modelFacades)
    } catch (err) {
      console.error('Error loading facades:', err)
      setFacades([])
    }
  }

  const selectFacade = (facade) => {
    // ✅ Toggle selection: si clickea la misma, deselecciona
    if (selectedFacade?._id === facade._id) {
      setSelectedFacade(null)
    } else {
      setSelectedFacade(facade)
    }
  }

  const updateFinancials = (updates) => {
    setFinancials(prev => ({
      ...prev,
      ...updates
    }))
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
    updateFinancials
  }

  return (
    <PropertyContext.Provider value={value}>
      {children}
    </PropertyContext.Provider>
  )
}