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

export const getModelUpgrades = async (req, res) => {
  try {
    const model = await Model.findById(req.params.id)
    
    if (!model) {
      return res.status(404).json({ message: 'Model not found' })
    }
    
    res.json(model.upgrades)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const addModelUpgrade = async (req, res) => {
  try {
    const model = await Model.findById(req.params.id)
    
    if (!model) {
      return res.status(404).json({ message: 'Model not found' })
    }
    
    const { name, price, description, features, images, status } = req.body
    
    if (!name || price === undefined) {
      return res.status(400).json({ message: 'Name and price are required' })
    }
    
    model.upgrades.push({
      name,
      price,
      description,
      features: features || [],
      images: formatImages(images),
      status: status || 'active'
    })
    
    await model.save()
    res.status(201).json(model.upgrades[model.upgrades.length - 1])
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const updateModelUpgrade = async (req, res) => {
  try {
    const model = await Model.findById(req.params.id)
    
    if (!model) {
      return res.status(404).json({ message: 'Model not found' })
    }
    
    const upgrade = model.upgrades.id(req.params.upgradeId)
    
    if (!upgrade) {
      return res.status(404).json({ message: 'Upgrade not found' })
    }
    
    if (req.body.name !== undefined) upgrade.name = req.body.name
    if (req.body.price !== undefined) upgrade.price = req.body.price
    if (req.body.description !== undefined) upgrade.description = req.body.description
    if (req.body.features !== undefined) upgrade.features = req.body.features
    if (req.body.images !== undefined) upgrade.images = formatImages(req.body.images)
    if (req.body.status !== undefined) upgrade.status = req.body.status
    
    await model.save()
    res.json(upgrade)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const deleteModelUpgrade = async (req, res) => {
  try {
    const model = await Model.findById(req.params.id)
    
    if (!model) {
      return res.status(404).json({ message: 'Model not found' })
    }
    
    const upgrade = model.upgrades.id(req.params.upgradeId)
    
    if (!upgrade) {
      return res.status(404).json({ message: 'Upgrade not found' })
    }
    
    upgrade.deleteOne()
    await model.save()
    res.json({ message: 'Upgrade deleted successfully' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}
