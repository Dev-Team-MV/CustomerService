import Facade from '../models/Facade.js'
import Model from '../models/Model.js'
import { hydrateUrlsInObject, normalizePathForStorage } from '../services/urlResolverService.js'

/** Normalize ref/id to string; safe when value is undefined. */
function toIdStr(val) {
  if (val == null) return ''
  if (typeof val === 'string') return val
  if (val._id != null) return val._id.toString()
  return String(val)
}

export const getAllFacades = async (req, res) => {
  try {
    const { model, projectId } = req.query
    const filter = {}

    if (projectId) filter.project = projectId
    if (model) filter.model = model

    const facades = await Facade.find(filter)
      .populate('project', 'name slug')
      .populate('model', 'model modelNumber price')
      .sort({ title: 1 })

    const data = facades.map((f) => f.toObject())
    await hydrateUrlsInObject(data)
    res.json(data)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const getFacadeById = async (req, res) => {
  try {
    const facade = await Facade.findById(req.params.id)
      .populate('model', 'model modelNumber price bedrooms bathrooms sqft images description')
    
    if (facade) {
      const data = facade.toObject()
      await hydrateUrlsInObject(data)
      res.json(data)
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
    
    const data = facades.map((f) => f.toObject())
    await hydrateUrlsInObject(data)
    res.json(data)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const createFacade = async (req, res) => {
  try {
    const { projectId, project, model, title, url, price, decks } = req.body
    const projId = projectId || project
    if (!projId) {
      return res.status(400).json({ message: 'projectId (or project) is required' })
    }

    const modelExists = await Model.findById(model)
    if (!modelExists) {
      return res.status(404).json({ message: 'Model not found' })
    }
    if (modelExists.project == null || toIdStr(modelExists.project) !== toIdStr(projId)) {
      return res.status(400).json({ message: 'Model does not belong to this project' })
    }

    // Validar y preparar decks si se proporcionan
    const validatedDecks = []
    if (decks && Array.isArray(decks)) {
      for (const deck of decks) {
        if (!deck.name || deck.price === undefined) {
          return res.status(400).json({
            message: 'Each deck must have name and price'
          })
        }
        validatedDecks.push({
          name: deck.name,
          price: deck.price,
          description: deck.description || '',
          images: Array.isArray(deck.images) ? deck.images.map((u) => normalizePathForStorage(u)).filter(Boolean) : [],
          status: deck.status || 'active'
        })
      }
    }

    const urlPaths = Array.isArray(url) ? url.map((u) => normalizePathForStorage(u)).filter(Boolean) : (url ? [normalizePathForStorage(url)] : [])
    const facade = await Facade.create({
      project: projId,
      model,
      title,
      url: urlPaths.length ? urlPaths : url,
      price,
      decks: validatedDecks
    })
    
    const populatedFacade = await Facade.findById(facade._id)
      .populate('model', 'model modelNumber price')
    
    const data = populatedFacade.toObject()
    await hydrateUrlsInObject(data)
    res.status(201).json(data)
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
      const arr = Array.isArray(req.body.url) ? req.body.url : [req.body.url]
      facade.url = arr.map((u) => normalizePathForStorage(u)).filter(Boolean)
    }
    
    if (req.body.price !== undefined) {
      facade.price = req.body.price
    }
    
    // Validar y actualizar decks si se proporcionan
    if (req.body.decks !== undefined) {
      if (!Array.isArray(req.body.decks)) {
        return res.status(400).json({ message: 'Decks must be an array' })
      }
      
      const validatedDecks = []
      for (const deck of req.body.decks) {
        if (!deck.name || deck.price === undefined) {
          return res.status(400).json({ 
            message: 'Each deck must have name and price' 
          })
        }
        validatedDecks.push({
          name: deck.name,
          price: deck.price,
          description: deck.description || '',
          images: Array.isArray(deck.images) ? deck.images.map((u) => normalizePathForStorage(u)).filter(Boolean) : [],
          status: deck.status || 'active'
        })
      }
      facade.decks = validatedDecks
    }
    
    const updatedFacade = await facade.save()
    const populatedFacade = await Facade.findById(updatedFacade._id)
      .populate('model', 'model modelNumber price')
    
    const data = populatedFacade.toObject()
    await hydrateUrlsInObject(data)
    res.json(data)
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
