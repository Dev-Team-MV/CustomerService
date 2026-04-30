// @shared/config/resourceConfig.js

// ── LAKEWOOD BUSINESS CONSTANTS ────────────────────────────────
export const MODEL_10_ID = '6977c7bbd1f24768968719de'

export const RESOURCE_TYPES = {
  PROPERTY: 'property',
  APARTMENT: 'apartment'
}

export const resourceConfigs = {
  property: {
    type: RESOURCE_TYPES.PROPERTY,
    
    // API endpoints
    endpoints: {
      list: '/properties?visible=true',
      profile: '/auth/profile',
      details: (id) => `/properties/${id}?visible=true`,
      financialSummary: '/user-properties/financial-summary',
      phases: (id) => `/phases/property/${id}`,
      payloads: (id) => `/payloads?property=${id}`,
      model: (id) => `/models/${id}`,
      facade: (id) => `/facades/${id}`
    },
    
    // Translation keys
    i18n: {
      namespace: 'myProperty',
      keys: {
        title: 'title',
        welcome: 'welcome',
        investor: 'investor',
        selectTitle: 'selectProperty',
        backButton: 'backToProperties',
        noItems: 'noProperties',
        loading: 'loading',
        goToDashboard: 'goToDashboard',
        property: 'property',
        properties: 'properties',
        totalInvestment: 'totalInvestment',
        totalPaid: 'totalPaid',
        pendingAmount: 'pendingAmount',
        propertiesOwned: 'propertiesOwned',
        completed: 'completed',
        constructionTab: 'constructionTab',
        paymentTab: 'paymentTab',
        detailsTab: 'detailsTab'
      }
    },
    
    // Field mappings
    fields: {
      id: '_id',
      name: 'name',
      lot: 'lot',
      model: 'model',
      facade: 'facade',
      address: 'address',
      price: 'price',
      area: 'area',
      bedrooms: 'bedrooms',
      bathrooms: 'bathrooms',
      balcony: 'balcony',
      isShared: 'isShared',
      isOwned: 'isOwned',
      modelType: 'modelType',
      hasBalcony: 'hasBalcony',
      hasStorage: 'hasStorage'
    },
    
    // Colors
    colors: {
      primary: '#333F1F',
      secondary: '#8CA551',
      accent: '#E5863C',
      border: '#e8f5ee',
      gradient: 'linear-gradient(90deg, #333F1F, #8CA551, #333F1F)'
    },
    
    // Data transformers
// @/Users/oficina/MV-CRM/CustomerService/frontend/shared/config/resourceConfig.js
// Línea 169 (después de cerrar toCard): Agregar toFinancialSummary

transformers: {
  toCard: (property) => {
    console.log(`🔄 [Transformer:property] Input property:`, property)
    console.log(`🔄 [Transformer:property] Property lot:`, property.lot)
    console.log(`🔄 [Transformer:property] Property model:`, property.model)
    console.log(`🔄 [Transformer:property] Property modelType:`, property.modelType)
    console.log(`🔄 [Transformer:property] Property hasBalcony:`, property.hasBalcony)
    console.log(`🔄 [Transformer:property] Property hasStorage:`, property.hasStorage)
    console.log(`🔄 [Transformer:property] Property mediaByFloor:`, property.mediaByFloor)
    
    // Extract nested objects
    const lot = typeof property.lot === 'object' ? property.lot : null
    const model = typeof property.model === 'object' ? property.model : null
    const facade = typeof property.facade === 'object' ? property.facade : null
    
    // ✅ NUEVO: Si tiene mediaByFloor, obtener primera imagen exterior de ahí
    let modelImage = null
    
    if (property.mediaByFloor && Array.isArray(property.mediaByFloor) && property.mediaByFloor.length > 0) {
      // Buscar la primera imagen exterior en mediaByFloor
      for (const floor of property.mediaByFloor) {
        const exteriors = floor?.media?.exterior || []
        if (exteriors.length > 0) {
          const firstExterior = exteriors[0]
          modelImage = typeof firstExterior === 'string' ? firstExterior : firstExterior?.url
          if (modelImage) {
            console.log(`🔄 [Transformer:property] Using exterior from mediaByFloor:`, modelImage)
            break
          }
        }
      }
    }
    
    // Si no se encontró en mediaByFloor, usar property.images (comportamiento anterior)
    if (!modelImage) {
      const propertyImages = property.images || {}
      modelImage = propertyImages.exterior?.[0]?.url || 
                  propertyImages.interior?.[0]?.url ||
                  model?.images?.exterior?.[0]?.url || 
                  model?.images?.interior?.[0]?.url ||
                  facade?.url?.[0]
      console.log(`🔄 [Transformer:property] Using image from property.images:`, modelImage)
    }
    
    // Detect Model 10
    const isModel10 = model?._id === MODEL_10_ID
    
    const transformed = {
      id: property._id,
      title: lot?.number ? `Lot ${lot.number}` : 'Property',
      subtitle: model?.model || 'No Model',
      model: model?.model || '',
      modelImage: modelImage,
      isShared: property.isShared || false,
      isOwned: property.isOwned !== false,
      
      // ✅ Metadata adicional para Lakewood
      modelType: property.modelType || 'basic',
      hasBalcony: property.hasBalcony || false,
      hasStorage: property.hasStorage || false,
      isModel10: isModel10,
      
      specs: {
        area: property.sqft || model?.sqft || 0,
        bedrooms: property.bedrooms || model?.bedrooms || 0,
        bathrooms: property.bathrooms || model?.bathrooms || 0,
        balcony: property.hasBalcony || false,
        storage: property.hasStorage || false
      }
    }
    
    console.log(`🔄 [Transformer:property] Output card data:`, transformed)
    return transformed
  },
  
  // ✅ AGREGAR ESTA FUNCIÓN
  toFinancialSummary: (properties, payloads) => {
    console.log(`📊 [Transformer:property] Computing financial summary...`)
    console.log(`📊 [Transformer:property] Properties:`, properties.length)
    console.log(`📊 [Transformer:property] Payloads:`, payloads.length)
    
    const totalInvestment = properties.reduce((sum, prop) => {
      const price = prop.price || 0
      console.log(`  💵 Property ${prop._id} price: ${price}`)
      return sum + price
    }, 0)
    
    const totalPaid = payloads
      .filter(p => p.status === 'signed')
      .reduce((sum, p) => sum + (p.amount || 0), 0)
    
    const totalPending = totalInvestment - totalPaid
    const paymentProgress = totalInvestment > 0 
      ? (totalPaid / totalInvestment) * 100 
      : 0
    
    const summary = {
      totalInvestment,
      totalPaid,
      totalPending,
      paymentProgress,
      properties: properties.length
    }
    
    console.log(`📊 [Transformer:property] Final summary:`, summary)
    return summary
  }
}
  },
  

apartment: {
  type: 'apartment',
  
  endpoints: {
    list: '/apartments?visible=true',
    details: (id) => `/apartments/${id}?visible=true`,
    profile: '/auth/profile',
    phases: (id) => `/phases/apartment/${id}`,
    payloads: (id) => `/payloads?apartment=${id}`,
    financialSummary: '/user-apartments/financial-summary',
    model: (id) => `/apartment-models/${id}`,
    building: (id) => `/buildings/${id}`
  },
  
  i18n: {
    namespace: 'myApartment',
    keys: {
      title: 'title',
      welcome: 'welcome',
      investor: 'investor',
      selectTitle: 'selectApartment',
      backButton: 'backToApartments',
      noItems: 'noApartments',
      loading: 'loadingApartments',
      goToDashboard: 'backToDashboard',
      property: 'apartment',
      properties: 'apartments',
      totalInvestment: 'totalInvestment',
      totalPaid: 'totalPaid',
      pendingAmount: 'pendingAmount',
      propertiesOwned: 'apartmentsOwned',
      completed: 'completed',
      constructionTab: 'constructionTab',
      paymentTab: 'paymentTab',
      detailsTab: 'detailsTab'
    }
  },
  
  fields: {
    id: '_id',
    number: 'apartmentNumber',
    model: 'apartmentModel',
    building: 'building',
    floor: 'floorNumber',
    area: 'area',
    bedrooms: 'bedrooms',
    bathrooms: 'bathrooms',
    price: 'price',
    selectedRenders: 'selectedRenders',
    selectedRenderType: 'selectedRenderType',
    modelType: 'modelType',
    isShared: 'isShared',
    isOwned: 'isOwned'
  },
  
  colors: {
    primary: '#1a237e',
    secondary: '#43a047',
    accent: '#ff6f00',
    border: '#e3f2fd',
    gradient: 'linear-gradient(90deg, #1a237e, #43a047, #1a237e)'
  },
  
  transformers: {
    toCard: (apartment) => {
      console.log(`🔄 [Transformer:apartment] Input apartment:`, apartment)
      console.log(`🔄 [Transformer:apartment] Apartment model:`, apartment.apartmentModel)
      console.log(`🔄 [Transformer:apartment] Apartment selectedRenderType:`, apartment.selectedRenderType)
      
      const model = typeof apartment.apartmentModel === 'object' ? apartment.apartmentModel : null
      const building = model?.building || apartment.building
      
      // Get first render based on selectedRenderType
      const apartmentImage = apartment.selectedRenders?.[0] || 
                            model?.images?.exterior?.[0]?.url ||
                            model?.images?.interior?.[0]?.url
      
      const transformed = {
        id: apartment._id,
        title: apartment.apartmentNumber ? `Apt ${apartment.apartmentNumber}` : 'Apartment',
        subtitle: building?.name || building?.address || model?.name || '',
        model: model?.name || '',
        modelImage: apartmentImage,
        isShared: apartment.isShared || false,
        isOwned: apartment.isOwned !== false,
        
        // ✅ Usar selectedRenderType en lugar de modelType para apartments
        modelType: apartment.selectedRenderType || 'basic',
        
        specs: {
          area: apartment.apartmentModel?.sqft || model?.sqft || 0,
          bedrooms: apartment.apartmentModel?.bedrooms || model?.bedrooms || 0,
          bathrooms: apartment.apartmentModel?.bathrooms || model?.bathrooms || 0,
          floor: apartment.floorNumber || 0
        }
      }
      
      console.log(`🔄 [Transformer:apartment] Output card data:`, transformed)
      return transformed
    },
    
    toFinancialSummary: (apartments, payloads) => {
      console.log(`📊 [Transformer:apartment] Computing financial summary...`)
      console.log(`📊 [Transformer:apartment] Apartments:`, apartments.length)
      console.log(`📊 [Transformer:apartment] Payloads:`, payloads.length)
      
      const totalInvestment = apartments.reduce((sum, apt) => {
        const price = apt.price || 0
        console.log(`  💵 Apartment ${apt._id} price: ${price}`)
        return sum + price
      }, 0)
      
      const totalPaid = payloads
        .filter(p => p.status === 'signed')
        .reduce((sum, p) => sum + (p.amount || 0), 0)
      
      const totalPending = totalInvestment - totalPaid
      const paymentProgress = totalInvestment > 0 
        ? (totalPaid / totalInvestment) * 100 
        : 0
      
      const summary = {
        totalInvestment,
        totalPaid,
        totalPending,
        paymentProgress,
        apartments: apartments.length
      }
      
      console.log(`📊 [Transformer:apartment] Final summary:`, summary)
      return summary
    }
  }
}
}