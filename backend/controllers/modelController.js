import Model from '../models/Model.js'

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
    const balconyPrice = model.balconyPrice || 0
    const upgradePrice = model.upgradePrice || 0
    const storagePrice = model.storagePrice || 0
    
    // Generate all pricing combinations
    const pricingOptions = []
    
    // Basic model options
    const basicOptions = [
      {
        modelType: 'basic',
        hasBalcony: false,
        hasStorage: false,
        price: basePrice,
        label: 'Basic - Sin Balcón - Sin Storage'
      },
      {
        modelType: 'basic',
        hasBalcony: false,
        hasStorage: true,
        price: basePrice + storagePrice,
        label: 'Basic - Sin Balcón - Con Storage'
      },
      {
        modelType: 'basic',
        hasBalcony: true,
        hasStorage: false,
        price: basePrice + balconyPrice,
        label: 'Basic - Con Balcón - Sin Storage'
      },
      {
        modelType: 'basic',
        hasBalcony: true,
        hasStorage: true,
        price: basePrice + balconyPrice + storagePrice,
        label: 'Basic - Con Balcón - Con Storage'
      }
    ]
    
    // Upgrade model options
    const upgradeOptions = [
      {
        modelType: 'upgrade',
        hasBalcony: false,
        hasStorage: false,
        price: basePrice + upgradePrice,
        label: 'Upgrade - Sin Balcón - Sin Storage'
      },
      {
        modelType: 'upgrade',
        hasBalcony: false,
        hasStorage: true,
        price: basePrice + upgradePrice + storagePrice,
        label: 'Upgrade - Sin Balcón - Con Storage'
      },
      {
        modelType: 'upgrade',
        hasBalcony: true,
        hasStorage: false,
        price: basePrice + upgradePrice + balconyPrice,
        label: 'Upgrade - Con Balcón - Sin Storage'
      },
      {
        modelType: 'upgrade',
        hasBalcony: true,
        hasStorage: true,
        price: basePrice + upgradePrice + balconyPrice + storagePrice,
        label: 'Upgrade - Con Balcón - Con Storage'
      }
    ]
    
    // Group by model type for easier frontend display
    const pricingByType = {
      basic: basicOptions,
      upgrade: upgradeOptions
    }
    
    // Also provide a flat list
    const allOptions = [...basicOptions, ...upgradeOptions]
    
    res.json({
      modelId: model._id,
      modelName: model.model,
      basePrice: basePrice,
      priceComponents: {
        balconyPrice: balconyPrice,
        upgradePrice: upgradePrice,
        storagePrice: storagePrice
      },
      pricingByType: pricingByType,
      allOptions: allOptions,
      minPrice: Math.min(...allOptions.map(opt => opt.price)),
      maxPrice: Math.max(...allOptions.map(opt => opt.price))
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
      images, 
      description, 
      status,
      balconyPrice,
      upgradePrice,
      storagePrice
    } = req.body
    
    const modelExists = await Model.findOne({ model })
    if (modelExists) {
      return res.status(400).json({ message: 'Model already exists' })
    }
    
    const newModel = await Model.create({
      model,
      modelNumber,
      price,
      bedrooms,
      bathrooms,
      sqft,
      images: images || [],
      description,
      status: status || 'active',
      balconyPrice: balconyPrice || 0,
      upgradePrice: upgradePrice || 0,
      storagePrice: storagePrice || 0
    })
    
    res.status(201).json(newModel)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const updateModel = async (req, res) => {
  try {
    const model = await Model.findById(req.params.id)
    
    if (model) {
      model.model = req.body.model || model.model
      model.modelNumber = req.body.modelNumber || model.modelNumber
      model.price = req.body.price !== undefined ? req.body.price : model.price
      model.bedrooms = req.body.bedrooms !== undefined ? req.body.bedrooms : model.bedrooms
      model.bathrooms = req.body.bathrooms !== undefined ? req.body.bathrooms : model.bathrooms
      model.sqft = req.body.sqft !== undefined ? req.body.sqft : model.sqft
      model.images = req.body.images || model.images
      model.description = req.body.description || model.description
      model.status = req.body.status || model.status
      
      // Update pricing options
      if (req.body.balconyPrice !== undefined) {
        model.balconyPrice = req.body.balconyPrice
      }
      if (req.body.upgradePrice !== undefined) {
        model.upgradePrice = req.body.upgradePrice
      }
      if (req.body.storagePrice !== undefined) {
        model.storagePrice = req.body.storagePrice
      }
      
      const updatedModel = await model.save()
      res.json(updatedModel)
    } else {
      res.status(404).json({ message: 'Model not found' })
    }
  } catch (error) {
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
