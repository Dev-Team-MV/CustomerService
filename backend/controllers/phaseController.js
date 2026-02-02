import Phase from '../models/Phase.js'
import Property from '../models/Property.js'

// Get all phases for a specific property
export const getPhasesByProperty = async (req, res) => {
  try {
    const { propertyId } = req.params
    
    const property = await Property.findOne({ _id: propertyId, tenant: req.tenantId })
    if (!property) {
      return res.status(404).json({ message: 'Property not found' })
    }
    const phases = await Phase.find({ tenant: req.tenantId, property: propertyId })
      .sort({ phaseNumber: 1 })
      .populate('property', 'lot model user price status')
    
    res.json(phases)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Get a single phase by ID
export const getPhaseById = async (req, res) => {
  try {
    const phase = await Phase.findOne({ _id: req.params.id, tenant: req.tenantId })
      .populate('property', 'lot model user price status')
    if (phase) {
      res.json(phase)
    } else {
      res.status(404).json({ message: 'Phase not found' })
    }
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Get phase by property and phase number
export const getPhaseByNumber = async (req, res) => {
  try {
    const { propertyId, phaseNumber } = req.params
    
    const phase = await Phase.findOne({
      tenant: req.tenantId,
      property: propertyId,
      phaseNumber: parseInt(phaseNumber)
    }).populate('property', 'lot model user price status')
    if (phase) {
      res.json(phase)
    } else {
      res.status(404).json({ message: 'Phase not found' })
    }
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Update a phase (title, constructionPercentage)
export const updatePhase = async (req, res) => {
  try {
    const phase = await Phase.findById(req.params.id)
    
    if (!phase) {
      return res.status(404).json({ message: 'Phase not found' })
    }
    
    if (req.body.title !== undefined) {
      phase.title = req.body.title
    }
    
    if (req.body.constructionPercentage !== undefined) {
      phase.constructionPercentage = req.body.constructionPercentage
    }
    
    const updatedPhase = await phase.save()
    const populatedPhase = await Phase.findById(updatedPhase._id)
      .populate('property', 'lot model user price status')
    
    res.json(populatedPhase)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Add media item to a phase
export const addMediaItem = async (req, res) => {
  try {
    const phase = await Phase.findOne({ _id: req.params.id, tenant: req.tenantId })
    if (!phase) {
      return res.status(404).json({ message: 'Phase not found' })
    }
    
    const { url, title, percentage, mediaType } = req.body
    
    if (!url || !title || percentage === undefined) {
      return res.status(400).json({ 
        message: 'URL, title, and percentage are required' 
      })
    }
    
    if (percentage < 0 || percentage > 100) {
      return res.status(400).json({ 
        message: 'Percentage must be between 0 and 100' 
      })
    }
    
    phase.mediaItems.push({
      url,
      title,
      percentage,
      mediaType: mediaType || 'image'
    })
    
    const updatedPhase = await phase.save()
    const populatedPhase = await Phase.findById(updatedPhase._id)
      .populate('property', 'lot model user price status')
    
    res.status(201).json(populatedPhase)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Update a media item in a phase
export const updateMediaItem = async (req, res) => {
  try {
    const { id, mediaItemId } = req.params
    const phase = await Phase.findOne({ _id: id, tenant: req.tenantId })
    if (!phase) {
      return res.status(404).json({ message: 'Phase not found' })
    }
    const mediaItem = phase.mediaItems.id(mediaItemId)
    if (!mediaItem) {
      return res.status(404).json({ message: 'Media item not found' })
    }
    
    if (req.body.url !== undefined) {
      mediaItem.url = req.body.url
    }
    if (req.body.title !== undefined) {
      mediaItem.title = req.body.title
    }
    if (req.body.percentage !== undefined) {
      if (req.body.percentage < 0 || req.body.percentage > 100) {
        return res.status(400).json({ 
          message: 'Percentage must be between 0 and 100' 
        })
      }
      mediaItem.percentage = req.body.percentage
    }
    if (req.body.mediaType !== undefined) {
      mediaItem.mediaType = req.body.mediaType
    }
    
    const updatedPhase = await phase.save()
    const populatedPhase = await Phase.findById(updatedPhase._id)
      .populate('property', 'lot model user price status')
    
    res.json(populatedPhase)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Delete a media item from a phase
export const deleteMediaItem = async (req, res) => {
  try {
    const { id, mediaItemId } = req.params
    const phase = await Phase.findOne({ _id: id, tenant: req.tenantId })
    if (!phase) {
      return res.status(404).json({ message: 'Phase not found' })
    }
    const mediaItem = phase.mediaItems.id(mediaItemId)
    if (!mediaItem) {
      return res.status(404).json({ message: 'Media item not found' })
    }
    
    phase.mediaItems.pull(mediaItemId)
    const updatedPhase = await phase.save()
    const populatedPhase = await Phase.findById(updatedPhase._id)
      .populate('property', 'lot model user price status')
    
    res.json(populatedPhase)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Get all phases (admin only - for management)
export const getAllPhases = async (req, res) => {
  try {
    const { property } = req.query
    const filter = { tenant: req.tenantId }
    if (property) filter.property = property

    const phases = await Phase.find(filter)
      .populate('property', 'lot model user price status')
      .sort({ property: 1, phaseNumber: 1 })
    
    res.json(phases)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}
