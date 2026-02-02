import Model from '../models/Model.js'

// Helper function to validate and format images structure
const formatImages = (images) => {
  if (!images) {
    return { exterior: [], interior: [] }
  }
  
  if (images.exterior !== undefined || images.interior !== undefined) {
    return {
      exterior: Array.isArray(images.exterior) ? images.exterior : [],
      interior: Array.isArray(images.interior) ? images.interior : []
    }
  }
  
  if (Array.isArray(images)) {
    return {
      exterior: images,
      interior: []
    }
  }
  
  return { exterior: [], interior: [] }
}

export const getModelStorages = async (req, res) => {
  try {
    const model = await Model.findOne({ _id: req.params.id, tenant: req.tenantId })
    
    if (!model) {
      return res.status(404).json({ message: 'Model not found' })
    }
    
    res.json(model.storages)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const addModelStorage = async (req, res) => {
  try {
    const model = await Model.findOne({ _id: req.params.id, tenant: req.tenantId })
    
    if (!model) {
      return res.status(404).json({ message: 'Model not found' })
    }
    
    const { name, price, description, sqft, images, status } = req.body
    
    if (!name || price === undefined) {
      return res.status(400).json({ message: 'Name and price are required' })
    }
    
    model.storages.push({
      name,
      price,
      description,
      sqft,
      images: formatImages(images),
      status: status || 'active'
    })
    
    await model.save()
    res.status(201).json(model.storages[model.storages.length - 1])
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const updateModelStorage = async (req, res) => {
  try {
    const model = await Model.findOne({ _id: req.params.id, tenant: req.tenantId })
    
    if (!model) {
      return res.status(404).json({ message: 'Model not found' })
    }
    
    const storage = model.storages.id(req.params.storageId)
    
    if (!storage) {
      return res.status(404).json({ message: 'Storage not found' })
    }
    
    if (req.body.name !== undefined) storage.name = req.body.name
    if (req.body.price !== undefined) storage.price = req.body.price
    if (req.body.description !== undefined) storage.description = req.body.description
    if (req.body.sqft !== undefined) storage.sqft = req.body.sqft
    if (req.body.images !== undefined) storage.images = formatImages(req.body.images)
    if (req.body.status !== undefined) storage.status = req.body.status
    
    await model.save()
    res.json(storage)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const deleteModelStorage = async (req, res) => {
  try {
    const model = await Model.findOne({ _id: req.params.id, tenant: req.tenantId })
    
    if (!model) {
      return res.status(404).json({ message: 'Model not found' })
    }
    
    const storage = model.storages.id(req.params.storageId)
    
    if (!storage) {
      return res.status(404).json({ message: 'Storage not found' })
    }
    
    storage.deleteOne()
    await model.save()
    res.json({ message: 'Storage deleted successfully' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}
