import Phase from '../models/Phase.js'
import Property from '../models/Property.js'
import Apartment from '../models/Apartment.js'
import { hydrateUrlsInObject, normalizePathForStorage } from '../services/urlResolverService.js'

const populatePhase = (query) =>
  query
    .populate('property', 'lot model users price status')
    .populate('apartment', 'apartmentModel apartmentNumber floorNumber users price status')

const recalcConstructionPercentageFromMedia = (phase) => {
  // El frontend guarda el progreso como suma de `mediaItems[].percentage`.
  // Por eso recalculamos `constructionPercentage` cuando cambia la media.
  const items = Array.isArray(phase.mediaItems) ? phase.mediaItems : []
  const sum = items.reduce((acc, item) => {
    const val = Number(item?.percentage)
    return acc + (Number.isFinite(val) ? val : 0)
  }, 0)

  // Clamp 0..100 para respetar rango.
  phase.constructionPercentage = Math.max(0, Math.min(100, sum))
}

// Get all phases for a specific property
export const getPhasesByProperty = async (req, res) => {
  try {
    const { propertyId } = req.params
    const property = await Property.findById(propertyId)
    if (!property) return res.status(404).json({ message: 'Property not found' })
    
    const phases = await populatePhase(Phase.find({ property: propertyId }).sort({ phaseNumber: 1 }))
    const data = phases.map((p) => p.toObject())
    await hydrateUrlsInObject(data)
    res.json(data)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Get all phases for a specific apartment
export const getPhasesByApartment = async (req, res) => {
  try {
    const { apartmentId } = req.params
    const apartment = await Apartment.findById(apartmentId)
    if (!apartment) return res.status(404).json({ message: 'Apartment not found' })
    
    const phases = await populatePhase(Phase.find({ apartment: apartmentId }).sort({ phaseNumber: 1 }))
    const data = phases.map((p) => p.toObject())
    await hydrateUrlsInObject(data)
    res.json(data)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Get a single phase by ID
export const getPhaseById = async (req, res) => {
  try {
    const phase = await populatePhase(Phase.findById(req.params.id))
    if (phase) {
      const data = phase.toObject()
      await hydrateUrlsInObject(data)
      res.json(data)
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
    const phase = await populatePhase(Phase.findOne({
      property: propertyId,
      phaseNumber: parseInt(phaseNumber)
    }))
    if (phase) {
      const data = phase.toObject()
      await hydrateUrlsInObject(data)
      res.json(data)
    } else {
      res.status(404).json({ message: 'Phase not found' })
    }
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Get phase by apartment and phase number
export const getPhaseByApartmentAndNumber = async (req, res) => {
  try {
    const { apartmentId, phaseNumber } = req.params
    const phase = await populatePhase(Phase.findOne({
      apartment: apartmentId,
      phaseNumber: parseInt(phaseNumber)
    }))
    if (phase) {
      const data = phase.toObject()
      await hydrateUrlsInObject(data)
      res.json(data)
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
    const populatedPhase = await populatePhase(Phase.findById(updatedPhase._id))
    const data = populatedPhase.toObject()
    await hydrateUrlsInObject(data)
    res.json(data)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Add media item to a phase
export const addMediaItem = async (req, res) => {
  try {
    const phase = await Phase.findById(req.params.id)
    
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
      url: normalizePathForStorage(url),
      title,
      percentage,
      mediaType: mediaType || 'image'
    })
    
    recalcConstructionPercentageFromMedia(phase)
    const updatedPhase = await phase.save()
    const populatedPhase = await populatePhase(Phase.findById(updatedPhase._id))
    const data = populatedPhase.toObject()
    await hydrateUrlsInObject(data)
    res.status(201).json(data)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Add media item using apartment ID + phase number
export const addMediaItemByApartmentAndNumber = async (req, res) => {
  try {
    const { apartmentId, phaseNumber } = req.params
    const phase = await Phase.findOne({
      apartment: apartmentId,
      phaseNumber: parseInt(phaseNumber)
    })

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
      url: normalizePathForStorage(url),
      title,
      percentage,
      mediaType: mediaType || 'image'
    })

    recalcConstructionPercentageFromMedia(phase)
    const updatedPhase = await phase.save()
    const populatedPhase = await populatePhase(Phase.findById(updatedPhase._id))
    const data = populatedPhase.toObject()
    await hydrateUrlsInObject(data)
    res.status(201).json(data)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Update a media item in a phase
export const updateMediaItem = async (req, res) => {
  try {
    const { id, mediaItemId } = req.params
    const phase = await Phase.findById(id)
    
    if (!phase) {
      return res.status(404).json({ message: 'Phase not found' })
    }
    
    const mediaItem = phase.mediaItems.id(mediaItemId)
    if (!mediaItem) {
      return res.status(404).json({ message: 'Media item not found' })
    }
    
    if (req.body.url !== undefined) {
      mediaItem.url = normalizePathForStorage(req.body.url)
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
    
    recalcConstructionPercentageFromMedia(phase)
    const updatedPhase = await phase.save()
    const populatedPhase = await populatePhase(Phase.findById(updatedPhase._id))
    const data = populatedPhase.toObject()
    await hydrateUrlsInObject(data)
    res.json(data)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Delete a media item from a phase
export const deleteMediaItem = async (req, res) => {
  try {
    const { id, mediaItemId } = req.params
    const phase = await Phase.findById(id)
    
    if (!phase) {
      return res.status(404).json({ message: 'Phase not found' })
    }
    
    const mediaItem = phase.mediaItems.id(mediaItemId)
    if (!mediaItem) {
      return res.status(404).json({ message: 'Media item not found' })
    }
    
    phase.mediaItems.pull(mediaItemId)
    recalcConstructionPercentageFromMedia(phase)
    const updatedPhase = await phase.save()
    const populatedPhase = await populatePhase(Phase.findById(updatedPhase._id))
    const data = populatedPhase.toObject()
    await hydrateUrlsInObject(data)
    res.json(data)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Update a media item using apartment ID + phase number
export const updateMediaItemByApartmentAndNumber = async (req, res) => {
  try {
    const { apartmentId, phaseNumber, mediaItemId } = req.params
    const phase = await Phase.findOne({
      apartment: apartmentId,
      phaseNumber: parseInt(phaseNumber)
    })

    if (!phase) {
      return res.status(404).json({ message: 'Phase not found' })
    }

    const mediaItem = phase.mediaItems.id(mediaItemId)
    if (!mediaItem) {
      return res.status(404).json({ message: 'Media item not found' })
    }

    if (req.body.url !== undefined) {
      mediaItem.url = normalizePathForStorage(req.body.url)
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

    recalcConstructionPercentageFromMedia(phase)
    const updatedPhase = await phase.save()
    const populatedPhase = await populatePhase(Phase.findById(updatedPhase._id))
    const data = populatedPhase.toObject()
    await hydrateUrlsInObject(data)
    res.json(data)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Delete a media item using apartment ID + phase number
export const deleteMediaItemByApartmentAndNumber = async (req, res) => {
  try {
    const { apartmentId, phaseNumber, mediaItemId } = req.params
    const phase = await Phase.findOne({
      apartment: apartmentId,
      phaseNumber: parseInt(phaseNumber)
    })

    if (!phase) {
      return res.status(404).json({ message: 'Phase not found' })
    }

    const mediaItem = phase.mediaItems.id(mediaItemId)
    if (!mediaItem) {
      return res.status(404).json({ message: 'Media item not found' })
    }

    phase.mediaItems.pull(mediaItemId)
    recalcConstructionPercentageFromMedia(phase)
    const updatedPhase = await phase.save()
    const populatedPhase = await populatePhase(Phase.findById(updatedPhase._id))
    const data = populatedPhase.toObject()
    await hydrateUrlsInObject(data)
    res.json(data)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Get all phases (admin only - for management)
export const getAllPhases = async (req, res) => {
  try {
    const { property, apartment } = req.query
    const filter = {}
    if (property) filter.property = property
    if (apartment) filter.apartment = apartment
    
    const phases = await populatePhase(Phase.find(filter))
      .sort({ phaseNumber: 1 })

    const data = phases.map((p) => p.toObject())
    await hydrateUrlsInObject(data)
    res.json(data)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}
