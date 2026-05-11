// @/Users/oficina/MV-CRM/CustomerService/frontend/apps/6town-houses/src/Components/quote/LotSelector/hooks/useResolveReferences.js

import { useState, useEffect } from 'react'

export const useResolveReferences = (building, models, lots, modelsLoading, lotsLoading) => {
  const [resolvedData, setResolvedData] = useState({
    modelName: 'N/A',
    modelPrice: 0,
    lotPrice: 0,
    totalPrice: 0,
    loading: true,
    error: null
  })

  useEffect(() => {
    if (modelsLoading || lotsLoading) {
      return
    }

    try {
      let modelName = 'N/A'
      let modelPrice = 0
      let lotPrice = 0

      console.log('🔍 Resolving building:', building)
      console.log('📦 quoteRef:', building.quoteRef)
      console.log('📚 Available models:', models)
      console.log('📍 Available lots:', lots)

      // Resolver referencia del modelo
      if (building.quoteRef?.model) {
        const modelRef = building.quoteRef.model
        console.log('🏠 Model reference:', modelRef, 'Type:', typeof modelRef)

        if (typeof modelRef === 'object' && modelRef !== null) {
          modelName = modelRef.name || modelRef.modelName || modelRef.title || 'N/A'
          modelPrice = modelRef.basePrice || modelRef.price || modelRef.modelPrice || 0
          console.log('✅ Model from object:', { modelName, modelPrice })
        } else if (typeof modelRef === 'string') {
          const foundModel = models.find(m => m._id === modelRef || m.id === modelRef)
          if (foundModel) {
            modelName = foundModel.name || foundModel.modelName || 'N/A'
            modelPrice = foundModel.basePrice || foundModel.price || foundModel.modelPrice || 0
            console.log('✅ Model found in hook:', { modelName, modelPrice })
          } else {
            modelName = `Model ${modelRef.slice(-6)}`
            console.warn('⚠️ Model not found in loaded models:', modelRef)
          }
        } else {
          modelName = String(modelRef)
          console.log('✅ Model as string:', modelName)
        }
      }

      // Resolver referencia del lote
      if (building.quoteRef?.lot) {
        const lotRef = building.quoteRef.lot
        console.log('📍 Lot reference:', lotRef, 'Type:', typeof lotRef)

        if (typeof lotRef === 'object' && lotRef !== null) {
          lotPrice = lotRef.price || lotRef.lotPrice || lotRef.basePrice || 0
          console.log('✅ Lot from object:', { lotPrice })
        } else if (typeof lotRef === 'string') {
          const foundLot = lots.find(l => l._id === lotRef || l.id === lotRef)
          if (foundLot) {
            lotPrice = foundLot.price || foundLot.lotPrice || foundLot.basePrice || 0
            console.log('✅ Lot found in hook:', { lotPrice })
          } else {
            console.warn('⚠️ Lot not found in loaded lots:', lotRef)
          }
        }
      }

      const totalPrice = modelPrice + lotPrice

      console.log('📊 Final resolved data:', { modelName, modelPrice, lotPrice, totalPrice })

      setResolvedData({
        modelName,
        modelPrice,
        lotPrice,
        totalPrice,
        loading: false,
        error: null
      })
    } catch (error) {
      console.error('Error resolving references:', error)
      setResolvedData(prev => ({
        ...prev,
        loading: false,
        error: error.message
      }))
    }
  }, [building?._id, models, lots, modelsLoading, lotsLoading])

  return resolvedData
}