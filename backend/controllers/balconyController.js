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

export const getModelBalconies = async (req, res) => {
  try {
    const model = await Model.findById(req.params.id)
    
    if (!model) {
      return res.status(404).json({ message: 'Model not found' })
    }
    
    res.json(model.balconies)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const addModelBalcony = async (req, res) => {
  try {
    const model = await Model.findById(req.params.id)
    
    if (!model) {
      return res.status(404).json({ message: 'Model not found' })
    }
    
    const { name, price, description, sqft, images, status } = req.body
    
    if (!name || price === undefined) {
      return res.status(400).json({ message: 'Name and price are required' })
    }
    
    model.balconies.push({
      name,
      price,
      description,
      sqft,
      images: formatImages(images),
      status: status || 'active'
    })
    
    await model.save()
    res.status(201).json(model.balconies[model.balconies.length - 1])
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const updateModelBalcony = async (req, res) => {
  try {
    const model = await Model.findById(req.params.id)
    
    if (!model) {
      return res.status(404).json({ message: 'Model not found' })
    }
    
    const balcony = model.balconies.id(req.params.balconyId)
    
    if (!balcony) {
      return res.status(404).json({ message: 'Balcony not found' })
    }
    
    if (req.body.name !== undefined) balcony.name = req.body.name
    if (req.body.price !== undefined) balcony.price = req.body.price
    if (req.body.description !== undefined) balcony.description = req.body.description
    if (req.body.sqft !== undefined) balcony.sqft = req.body.sqft
    if (req.body.images !== undefined) balcony.images = formatImages(req.body.images)
    if (req.body.status !== undefined) balcony.status = req.body.status
    
    await model.save()
    res.json(balcony)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const deleteModelBalcony = async (req, res) => {
  try {
    const model = await Model.findById(req.params.id)
    
    if (!model) {
      return res.status(404).json({ message: 'Model not found' })
    }
    
    const balcony = model.balconies.id(req.params.balconyId)
    
    if (!balcony) {
      return res.status(404).json({ message: 'Balcony not found' })
    }
    
    balcony.deleteOne()
    await model.save()
    res.json({ message: 'Balcony deleted successfully' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}
