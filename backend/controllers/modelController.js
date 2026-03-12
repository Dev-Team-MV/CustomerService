import Model from '../models/Model.js'
import { normalizeImageArray } from '../utils/imageUtils.js'
import { hydrateUrlsInObject } from '../services/urlResolverService.js'

// Helper: format images to { exterior: [{ url, isPublic }], interior: [...] }
const formatImages = (images) => {
  if (!images) return { exterior: [], interior: [] }
  if (images.exterior !== undefined || images.interior !== undefined) {
    return {
      exterior: normalizeImageArray(images.exterior),
      interior: normalizeImageArray(images.interior)
    }
  }
  if (Array.isArray(images)) {
    return { exterior: normalizeImageArray(images), interior: [] }
  }
  return { exterior: [], interior: [] }
}

// Helper: format blueprints (cada array como [{ url, isPublic }])
const formatBlueprints = (blueprints) => {
  const empty = {
    default: [],
    withBalcony: [],
    withStorage: [],
    withBalconyAndStorage: []
  }
  if (!blueprints || typeof blueprints !== 'object') return empty
  return {
    default: normalizeImageArray(blueprints.default),
    withBalcony: normalizeImageArray(blueprints.withBalcony),
    withStorage: normalizeImageArray(blueprints.withStorage),
    withBalconyAndStorage: normalizeImageArray(blueprints.withBalconyAndStorage)
  }
}

// Normaliza imágenes en el documento (legacy strings → { url, isPublic }) antes de guardar
function normalizeModelBeforeSave (model) {
  if (model.images) {
    if (Array.isArray(model.images.exterior)) {
      const hasLegacy = model.images.exterior.some((x) => typeof x === 'string')
      if (hasLegacy) model.images.exterior = normalizeImageArray(model.images.exterior)
    }
    if (Array.isArray(model.images.interior)) {
      const hasLegacy = model.images.interior.some((x) => typeof x === 'string')
      if (hasLegacy) model.images.interior = normalizeImageArray(model.images.interior)
    }
  }
  if (model.blueprints && typeof model.blueprints === 'object') {
    const variants = ['default', 'withBalcony', 'withStorage', 'withBalconyAndStorage']
    variants.forEach((key) => {
      if (Array.isArray(model.blueprints[key]) && model.blueprints[key].some((x) => typeof x === 'string')) {
        model.blueprints[key] = normalizeImageArray(model.blueprints[key])
      }
    })
  }
  if (Array.isArray(model.balconies)) {
    model.balconies.forEach((b) => {
      if (b.images) {
        if (Array.isArray(b.images.exterior) && b.images.exterior.some((x) => typeof x === 'string')) {
          b.images.exterior = normalizeImageArray(b.images.exterior)
        }
        if (Array.isArray(b.images.interior) && b.images.interior.some((x) => typeof x === 'string')) {
          b.images.interior = normalizeImageArray(b.images.interior)
        }
      }
    })
  }
  if (Array.isArray(model.upgrades)) {
    model.upgrades.forEach((u) => {
      if (u.images) {
        if (Array.isArray(u.images.exterior) && u.images.exterior.some((x) => typeof x === 'string')) {
          u.images.exterior = normalizeImageArray(u.images.exterior)
        }
        if (Array.isArray(u.images.interior) && u.images.interior.some((x) => typeof x === 'string')) {
          u.images.interior = normalizeImageArray(u.images.interior)
        }
      }
    })
  }
  if (Array.isArray(model.storages)) {
    model.storages.forEach((s) => {
      if (s.images) {
        if (Array.isArray(s.images.exterior) && s.images.exterior.some((x) => typeof x === 'string')) {
          s.images.exterior = normalizeImageArray(s.images.exterior)
        }
        if (Array.isArray(s.images.interior) && s.images.interior.some((x) => typeof x === 'string')) {
          s.images.interior = normalizeImageArray(s.images.interior)
        }
      }
    })
  }
}

// Normaliza imágenes de un modelo (y balconies/upgrades/storages) para respuesta API
function normalizeModelForResponse (model) {
  const doc = model.toObject ? model.toObject() : { ...model }
  if (doc.images) {
    doc.images = {
      exterior: normalizeImageArray(doc.images.exterior),
      interior: normalizeImageArray(doc.images.interior)
    }
  }
  if (doc.blueprints) {
    doc.blueprints = {
      default: normalizeImageArray(doc.blueprints.default),
      withBalcony: normalizeImageArray(doc.blueprints.withBalcony),
      withStorage: normalizeImageArray(doc.blueprints.withStorage),
      withBalconyAndStorage: normalizeImageArray(doc.blueprints.withBalconyAndStorage)
    }
  }
  if (Array.isArray(doc.balconies)) {
    doc.balconies = doc.balconies.map((b) => {
      const out = b.toObject ? b.toObject() : { ...b }
      if (out.images) {
        out.images = {
          exterior: normalizeImageArray(out.images.exterior),
          interior: normalizeImageArray(out.images.interior)
        }
      }
      return out
    })
  }
  if (Array.isArray(doc.upgrades)) {
    doc.upgrades = doc.upgrades.map((u) => {
      const out = u.toObject ? u.toObject() : { ...u }
      if (out.images) {
        out.images = {
          exterior: normalizeImageArray(out.images.exterior),
          interior: normalizeImageArray(out.images.interior)
        }
      }
      return out
    })
  }
  if (Array.isArray(doc.storages)) {
    doc.storages = doc.storages.map((s) => {
      const out = s.toObject ? s.toObject() : { ...s }
      if (out.images) {
        out.images = {
          exterior: normalizeImageArray(out.images.exterior),
          interior: normalizeImageArray(out.images.interior)
        }
      }
      return out
    })
  }
  return doc
}

export const getAllModels = async (req, res) => {
  try {
    const { status, projectId } = req.query
    const filter = {}
    if (projectId) filter.project = projectId
    if (status) filter.status = status

    const models = await Model.find(filter).sort({ model: 1 })
    const data = models.map(normalizeModelForResponse)
    await hydrateUrlsInObject(data)
    res.json(data)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const getModelById = async (req, res) => {
  try {
    const model = await Model.findById(req.params.id)
    
    if (model) {
      const data = normalizeModelForResponse(model)
      await hydrateUrlsInObject(data)
      res.json(data)
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
    
    const response = {
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
    }
    await hydrateUrlsInObject(response)
    res.json(response)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const createModel = async (req, res) => {
  try {
    const {
      projectId,
      project,
      model,
      modelNumber,
      price,
      bedrooms,
      bathrooms,
      sqft,
      stories,
      images,
      blueprints,
      description,
      status,
      balconies,
      upgrades,
      storages
    } = req.body

    const projId = projectId || project
    if (!projId) {
      return res.status(400).json({ message: 'projectId (or project) is required' })
    }

    // Validar campos requeridos del modelo
    if (!model || !price || bedrooms === undefined || bathrooms === undefined || sqft === undefined) {
      return res.status(400).json({
        message: 'Missing required fields: model, price, bedrooms, bathrooms, and sqft are required'
      })
    }

    // Verificar si el modelo ya existe en este proyecto
    const modelExists = await Model.findOne({ project: projId, model })
    if (modelExists) {
      return res.status(400).json({ message: 'Model already exists in this project' })
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
      project: projId,
      model,
      modelNumber,
      price,
      bedrooms,
      bathrooms,
      sqft,
      stories,
      images: formatImages(images),
      blueprints: formatBlueprints(blueprints),
      description: description || '',
      status: status || 'active',
      balconies: validatedBalconies,
      upgrades: validatedUpgrades,
      storages: validatedStorages
    })
    
    const modelData = normalizeModelForResponse(newModel)
    await hydrateUrlsInObject(modelData)
    res.status(201).json({
      message: 'Model created successfully',
      model: modelData
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
    if (req.body.blueprints !== undefined) model.blueprints = formatBlueprints(req.body.blueprints)
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

    normalizeModelBeforeSave(model)

    const updatedModel = await model.save()
    const modelData = normalizeModelForResponse(updatedModel)
    await hydrateUrlsInObject(modelData)
    res.json({
      message: 'Model updated successfully',
      model: modelData
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
