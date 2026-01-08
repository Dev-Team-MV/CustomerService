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

export const createModel = async (req, res) => {
  try {
    const { model, modelNumber, price, bedrooms, bathrooms, sqft, images, description, status } = req.body
    
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
      status: status || 'active'
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
