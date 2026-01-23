import Model from '../models/Model.js'

// Helper function to validate and format images structure
const formatImages = (images) => {
  if (!images) {
    return { exterior: [], interior: [] }
  }
  
  // If it's already in the correct format
  if (images.exterior !== undefined || images.interior !== undefined) {
    return {
      exterior: Array.isArray(images.exterior) ? images.exterior : [],
      interior: Array.isArray(images.interior) ? images.interior : []
    }
  }
  
  // If it's an old array format, convert to new format (backward compatibility)
  if (Array.isArray(images)) {
    return {
      exterior: images,
      interior: []
    }
  }
  
  return { exterior: [], interior: [] }
}

export const getAllModels = async (req, res) => {
  try {
    const { status } = req.query
    const filter = status ? { status } : {}
    
    const models = await Model.find(filter).sort({ model: 1 })
    res.json(models)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const getModelById = async (req, res) => {
  try {
    const model = await Model.findById(req.params.id)
    
    if (model) {
      res.json(model)
    } else {
      res.status(404).json({ message: 'Model not found' })
    }
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const getModelPricingOptions = async (req, res) => {
  try {
    const model = await Model.findById(req.params.id)
    
    if (!model) {
      return res.status(404).json({ message: 'Model not found' })
    }
    
    const basePrice = model.price
    const activeBalconies = model.balconies.filter(b => b.status === 'active')
    const activeUpgrades = model.upgrades.filter(u => u.status === 'active')
    const activeStorages = model.storages.filter(s => s.status === 'active')
    
    // Generate pricing combinations with all available options
    const allOptions = []
    
    // If no upgrades, provide basic model with all combinations
    if (activeUpgrades.length === 0) {
      // No balcony, no storage
      allOptions.push({
        modelType: 'basic',
        balcony: null,
        storage: null,
        price: basePrice,
        label: 'Basic - Sin Balcón - Sin Storage'
      })
      
      // With storages
      activeStorages.forEach(storage => {
        allOptions.push({
          modelType: 'basic',
          balcony: null,
          storage: storage,
          price: basePrice + storage.price,
          label: `Basic - Sin Balcón - ${storage.name}`
        })
      })
      
      // With balconies
      activeBalconies.forEach(balcony => {
        allOptions.push({
          modelType: 'basic',
          balcony: balcony,
          storage: null,
          price: basePrice + balcony.price,
          label: `Basic - ${balcony.name} - Sin Storage`
        })
        
        // With balconies and storages
        activeStorages.forEach(storage => {
          allOptions.push({
            modelType: 'basic',
            balcony: balcony,
            storage: storage,
            price: basePrice + balcony.price + storage.price,
            label: `Basic - ${balcony.name} - ${storage.name}`
          })
        })
      })
    } else {
      // With upgrades
      activeUpgrades.forEach(upgrade => {
        // No balcony, no storage
        allOptions.push({
          modelType: 'upgrade',
          upgrade: upgrade,
          balcony: null,
          storage: null,
          price: basePrice + upgrade.price,
          label: `${upgrade.name} - Sin Balcón - Sin Storage`
        })
        
        // With storages
        activeStorages.forEach(storage => {
          allOptions.push({
            modelType: 'upgrade',
            upgrade: upgrade,
            balcony: null,
            storage: storage,
            price: basePrice + upgrade.price + storage.price,
            label: `${upgrade.name} - Sin Balcón - ${storage.name}`
          })
        })
        
        // With balconies
        activeBalconies.forEach(balcony => {
          allOptions.push({
            modelType: 'upgrade',
            upgrade: upgrade,
            balcony: balcony,
            storage: null,
            price: basePrice + upgrade.price + balcony.price,
            label: `${upgrade.name} - ${balcony.name} - Sin Storage`
          })
          
          // With balconies and storages
          activeStorages.forEach(storage => {
            allOptions.push({
              modelType: 'upgrade',
              upgrade: upgrade,
              balcony: balcony,
              storage: storage,
              price: basePrice + upgrade.price + balcony.price + storage.price,
              label: `${upgrade.name} - ${balcony.name} - ${storage.name}`
            })
          })
        })
      })
    }
    
    res.json({
      modelId: model._id,
      modelName: model.model,
      basePrice: basePrice,
      availableOptions: {
        balconies: activeBalconies,
        upgrades: activeUpgrades,
        storages: activeStorages
      },
      allOptions: allOptions,
      minPrice: allOptions.length > 0 ? Math.min(...allOptions.map(opt => opt.price)) : basePrice,
      maxPrice: allOptions.length > 0 ? Math.max(...allOptions.map(opt => opt.price)) : basePrice
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const createModel = async (req, res) => {
  try {
    const { 
      model, 
      modelNumber, 
      price, 
      bedrooms, 
      bathrooms, 
      sqft,
      stories,
      images, 
      description, 
      status,
      balconies,
      upgrades,
      storages
    } = req.body
    
    // Validar campos requeridos del modelo
    if (!model || !price || bedrooms === undefined || bathrooms === undefined || sqft === undefined) {
      return res.status(400).json({ 
        message: 'Missing required fields: model, price, bedrooms, bathrooms, and sqft are required' 
      })
    }
    
    // Verificar si el modelo ya existe
    const modelExists = await Model.findOne({ model })
    if (modelExists) {
      return res.status(400).json({ message: 'Model already exists' })
    }
    
    // Validar y preparar balcones
    const validatedBalconies = []
    if (balconies && Array.isArray(balconies)) {
      for (const balcony of balconies) {
        if (!balcony.name || balcony.price === undefined) {
          return res.status(400).json({ 
            message: 'Each balcony must have name and price' 
          })
        }
        validatedBalconies.push({
          name: balcony.name,
          price: balcony.price,
          description: balcony.description || '',
          sqft: balcony.sqft || 0,
          images: Array.isArray(balcony.images) ? balcony.images : [],
          status: balcony.status || 'active'
        })
      }
    }
    
    // Validar y preparar upgrades
    const validatedUpgrades = []
    if (upgrades && Array.isArray(upgrades)) {
      for (const upgrade of upgrades) {
        if (!upgrade.name || upgrade.price === undefined) {
          return res.status(400).json({ 
            message: 'Each upgrade must have name and price' 
          })
        }
        validatedUpgrades.push({
          name: upgrade.name,
          price: upgrade.price,
          description: upgrade.description || '',
          features: Array.isArray(upgrade.features) ? upgrade.features : [],
          images: Array.isArray(upgrade.images) ? upgrade.images : [],
          status: upgrade.status || 'active'
        })
      }
    }
    
    // Validar y preparar storages
    const validatedStorages = []
    if (storages && Array.isArray(storages)) {
      for (const storage of storages) {
        if (!storage.name || storage.price === undefined) {
          return res.status(400).json({ 
            message: 'Each storage must have name and price' 
          })
        }
        validatedStorages.push({
          name: storage.name,
          price: storage.price,
          description: storage.description || '',
          sqft: storage.sqft || 0,
          images: Array.isArray(storage.images) ? storage.images : [],
          status: storage.status || 'active'
        })
      }
    }
    
    // Crear el modelo con todas las opciones validadas
    const newModel = await Model.create({
      model,
      modelNumber,
      price,
      bedrooms,
      bathrooms,
      sqft,
      stories,
      images: formatImages(images),
      description: description || '',
      status: status || 'active',
      balconies: validatedBalconies,
      upgrades: validatedUpgrades,
      storages: validatedStorages
    })
    
    res.status(201).json({
      message: 'Model created successfully',
      model: newModel
    })
  } catch (error) {
    // Manejar errores de validación de Mongoose
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message)
      return res.status(400).json({ 
        message: 'Validation error', 
        errors 
      })
    }
    
    // Manejar errores de duplicado
    if (error.code === 11000) {
      return res.status(400).json({ 
        message: 'Model with this name already exists' 
      })
    }
    
    res.status(500).json({ message: error.message })
  }
}

export const updateModel = async (req, res) => {
  try {
    const model = await Model.findById(req.params.id)
    
    if (!model) {
      return res.status(404).json({ message: 'Model not found' })
    }
    
    // Actualizar campos básicos del modelo
    if (req.body.model !== undefined) model.model = req.body.model
    if (req.body.modelNumber !== undefined) model.modelNumber = req.body.modelNumber
    if (req.body.price !== undefined) model.price = req.body.price
    if (req.body.bedrooms !== undefined) model.bedrooms = req.body.bedrooms
    if (req.body.bathrooms !== undefined) model.bathrooms = req.body.bathrooms
    if (req.body.sqft !== undefined) model.sqft = req.body.sqft
    if (req.body.stories !== undefined) model.stories = req.body.stories
    if (req.body.images !== undefined) model.images = formatImages(req.body.images)
    if (req.body.description !== undefined) model.description = req.body.description
    if (req.body.status !== undefined) model.status = req.body.status
    
    // Validar y actualizar balcones si se proporcionan
    if (req.body.balconies !== undefined) {
      if (!Array.isArray(req.body.balconies)) {
        return res.status(400).json({ message: 'Balconies must be an array' })
      }
      
      const validatedBalconies = []
      for (const balcony of req.body.balconies) {
        if (!balcony.name || balcony.price === undefined) {
          return res.status(400).json({ 
            message: 'Each balcony must have name and price' 
          })
        }
        validatedBalconies.push({
          name: balcony.name,
          price: balcony.price,
          description: balcony.description || '',
          sqft: balcony.sqft || 0,
          images: formatImages(balcony.images),
          status: balcony.status || 'active'
        })
      }
      model.balconies = validatedBalconies
    }
    
    // Validar y actualizar upgrades si se proporcionan
    if (req.body.upgrades !== undefined) {
      if (!Array.isArray(req.body.upgrades)) {
        return res.status(400).json({ message: 'Upgrades must be an array' })
      }
      
      const validatedUpgrades = []
      for (const upgrade of req.body.upgrades) {
        if (!upgrade.name || upgrade.price === undefined) {
          return res.status(400).json({ 
            message: 'Each upgrade must have name and price' 
          })
        }
        validatedUpgrades.push({
          name: upgrade.name,
          price: upgrade.price,
          description: upgrade.description || '',
          features: Array.isArray(upgrade.features) ? upgrade.features : [],
          images: formatImages(upgrade.images),
          status: upgrade.status || 'active'
        })
      }
      model.upgrades = validatedUpgrades
    }
    
    // Validar y actualizar storages si se proporcionan
    if (req.body.storages !== undefined) {
      if (!Array.isArray(req.body.storages)) {
        return res.status(400).json({ message: 'Storages must be an array' })
      }
      
      const validatedStorages = []
      for (const storage of req.body.storages) {
        if (!storage.name || storage.price === undefined) {
          return res.status(400).json({ 
            message: 'Each storage must have name and price' 
          })
        }
        validatedStorages.push({
          name: storage.name,
          price: storage.price,
          description: storage.description || '',
          sqft: storage.sqft || 0,
          images: formatImages(storage.images),
          status: storage.status || 'active'
        })
      }
      model.storages = validatedStorages
    }
    
    const updatedModel = await model.save()
    res.json({
      message: 'Model updated successfully',
      model: updatedModel
    })
  } catch (error) {
    // Manejar errores de validación de Mongoose
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message)
      return res.status(400).json({ 
        message: 'Validation error', 
        errors 
      })
    }
    
    // Manejar errores de duplicado
    if (error.code === 11000) {
      return res.status(400).json({ 
        message: 'Model with this name already exists' 
      })
    }
    
    res.status(500).json({ message: error.message })
  }
}

export const deleteModel = async (req, res) => {
  try {
    const model = await Model.findById(req.params.id)
    
    if (model) {
      await model.deleteOne()
      res.json({ message: 'Model deleted successfully' })
    } else {
      res.status(404).json({ message: 'Model not found' })
    }
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}
