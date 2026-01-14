import Facade from '../models/Facade.js'
import Model from '../models/Model.js'

export const getAllFacades = async (req, res) => {
  try {
    const { model } = req.query
    const filter = {}
    
    if (model) {
      filter.model = model
    }
    
    const facades = await Facade.find(filter)
      .populate('model', 'model modelNumber price')
      .sort({ title: 1 })
    
    res.json(facades)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const getFacadeById = async (req, res) => {
  try {
    const facade = await Facade.findById(req.params.id)
      .populate('model', 'model modelNumber price bedrooms bathrooms sqft images description')
    
    if (facade) {
      res.json(facade)
    } else {
      res.status(404).json({ message: 'Facade not found' })
    }
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const getFacadesByModel = async (req, res) => {
  try {
    const { modelId } = req.params
    
    const modelExists = await Model.findById(modelId)
    if (!modelExists) {
      return res.status(404).json({ message: 'Model not found' })
    }
    
    const facades = await Facade.find({ model: modelId })
      .sort({ title: 1 })
    
    res.json(facades)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const createFacade = async (req, res) => {
  try {
    const { model, title, url, price } = req.body
    
    const modelExists = await Model.findById(model)
    if (!modelExists) {
      return res.status(404).json({ message: 'Model not found' })
    }
    
    const facade = await Facade.create({
      model,
      title,
      url,
      price
    })
    
    const populatedFacade = await Facade.findById(facade._id)
      .populate('model', 'model modelNumber price')
    
    res.status(201).json(populatedFacade)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const updateFacade = async (req, res) => {
  try {
    const facade = await Facade.findById(req.params.id)
    
    if (!facade) {
      return res.status(404).json({ message: 'Facade not found' })
    }
    
    if (req.body.model !== undefined) {
      const modelExists = await Model.findById(req.body.model)
      if (!modelExists) {
        return res.status(404).json({ message: 'Model not found' })
      }
      facade.model = req.body.model
    }
    
    if (req.body.title !== undefined) {
      facade.title = req.body.title
    }
    
    if (req.body.url !== undefined) {
      facade.url = req.body.url
    }
    
    if (req.body.price !== undefined) {
      facade.price = req.body.price
    }
    
    const updatedFacade = await facade.save()
    const populatedFacade = await Facade.findById(updatedFacade._id)
      .populate('model', 'model modelNumber price')
    
    res.json(populatedFacade)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const deleteFacade = async (req, res) => {
  try {
    const facade = await Facade.findById(req.params.id)
    
    if (!facade) {
      return res.status(404).json({ message: 'Facade not found' })
    }
    
    await facade.deleteOne()
    res.json({ message: 'Facade deleted successfully' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}
