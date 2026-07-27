import WarrantyClaim, {
  WARRANTY_CATEGORIES,
  WARRANTY_PRIORITIES,
  WARRANTY_STATUSES
} from '../models/WarrantyClaim.js'
import { isStaffRole } from '../utils/roles.js'
import { isValidObjectId } from '../utils/crmHelpers.js'
import { runAutomationEngineAsync } from '../services/automationEngine.js'

const POPULATE = [
  { path: 'propertyId', select: 'price status lot model' },
  { path: 'apartmentId', select: 'apartmentNumber floorNumber building status' },
  { path: 'clientId', select: 'firstName lastName email phoneNumber' },
  { path: 'projectId', select: 'name slug title' }
]

function isAdminUser(user) {
  return isStaffRole(user?.role)
}

/**
 * Valida que venga exactamente uno de propertyId / apartmentId.
 * Devuelve { error } o { propertyId, apartmentId } listos para guardar.
 */
function resolveUnitRefs({ propertyId, apartmentId }) {
  const hasProperty = propertyId != null && propertyId !== ''
  const hasApartment = apartmentId != null && apartmentId !== ''

  if (!hasProperty && !hasApartment) {
    return { error: 'Either propertyId or apartmentId is required' }
  }
  if (hasProperty && hasApartment) {
    return { error: 'Provide only one of propertyId or apartmentId' }
  }
  if (hasProperty && !isValidObjectId(propertyId)) {
    return { error: 'Invalid propertyId' }
  }
  if (hasApartment && !isValidObjectId(apartmentId)) {
    return { error: 'Invalid apartmentId' }
  }
  return {
    propertyId: hasProperty ? propertyId : null,
    apartmentId: hasApartment ? apartmentId : null
  }
}

export const getWarranties = async (req, res) => {
  try {
    const filter = {}
    for (const key of ['projectId', 'propertyId', 'apartmentId', 'clientId']) {
      if (req.query[key]) {
        if (!isValidObjectId(req.query[key])) {
          return res.status(400).json({ message: `Invalid ${key}` })
        }
        filter[key] = req.query[key]
      }
    }
    if (req.query.status) {
      if (!WARRANTY_STATUSES.includes(req.query.status)) {
        return res.status(400).json({
          message: `Invalid status. Allowed: ${WARRANTY_STATUSES.join(', ')}`
        })
      }
      filter.status = req.query.status
    }
    if (req.query.category) {
      if (!WARRANTY_CATEGORIES.includes(req.query.category)) {
        return res.status(400).json({
          message: `Invalid category. Allowed: ${WARRANTY_CATEGORIES.join(', ')}`
        })
      }
      filter.category = req.query.category
    }
    if (req.query.priority) {
      if (!WARRANTY_PRIORITIES.includes(req.query.priority)) {
        return res.status(400).json({
          message: `Invalid priority. Allowed: ${WARRANTY_PRIORITIES.join(', ')}`
        })
      }
      filter.priority = req.query.priority
    }

    if (!isAdminUser(req.user)) {
      filter.clientId = req.user._id
    }

    const claims = await WarrantyClaim.find(filter)
      .populate(POPULATE)
      .sort({ createdAt: -1 })
    res.json(claims)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const getWarrantyById = async (req, res) => {
  try {
    const claim = await WarrantyClaim.findById(req.params.id).populate(POPULATE)
    if (!claim) return res.status(404).json({ message: 'Warranty claim not found' })

    if (
      !isAdminUser(req.user) &&
      String(claim.clientId._id || claim.clientId) !== String(req.user._id)
    ) {
      return res.status(403).json({ message: 'Not authorized to view this claim' })
    }

    res.json(claim)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const createWarranty = async (req, res) => {
  try {
    const {
      propertyId,
      apartmentId,
      clientId,
      projectId,
      category,
      description,
      photoUrls,
      priority
    } = req.body

    const unit = resolveUnitRefs({ propertyId, apartmentId })
    if (unit.error) {
      return res.status(400).json({ message: unit.error })
    }
    if (!projectId || !isValidObjectId(projectId)) {
      return res.status(400).json({ message: 'Valid projectId is required' })
    }
    if (!category || !WARRANTY_CATEGORIES.includes(category)) {
      return res.status(400).json({
        message: `Valid category is required. Allowed: ${WARRANTY_CATEGORIES.join(', ')}`
      })
    }
    if (!description?.trim()) {
      return res.status(400).json({ message: 'description is required' })
    }
    if (priority && !WARRANTY_PRIORITIES.includes(priority)) {
      return res.status(400).json({
        message: `Invalid priority. Allowed: ${WARRANTY_PRIORITIES.join(', ')}`
      })
    }

    const resolvedClientId =
      isAdminUser(req.user) && clientId ? clientId : req.user._id

    if (!isValidObjectId(resolvedClientId)) {
      return res.status(400).json({ message: 'Invalid clientId' })
    }

    const claim = await WarrantyClaim.create({
      propertyId: unit.propertyId,
      apartmentId: unit.apartmentId,
      clientId: resolvedClientId,
      projectId,
      category,
      description: description.trim(),
      photoUrls: Array.isArray(photoUrls) ? photoUrls : [],
      priority: priority || 'medium',
      status: 'submitted'
    })

    runAutomationEngineAsync('warranty_submitted', {
      warranty: claim,
      actor: req.user
    })

    const populated = await WarrantyClaim.findById(claim._id).populate(POPULATE)
    res.status(201).json(populated)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const updateWarranty = async (req, res) => {
  try {
    const claim = await WarrantyClaim.findById(req.params.id)
    if (!claim) return res.status(404).json({ message: 'Warranty claim not found' })

    if (
      !isAdminUser(req.user) &&
      String(claim.clientId) !== String(req.user._id)
    ) {
      return res.status(403).json({ message: 'Not authorized to update this claim' })
    }

    const {
      category,
      description,
      photoUrls,
      priority,
      status,
      assignedContractor,
      resolution,
      satisfactionRating
    } = req.body

    // Users can only update description/photos while submitted
    if (!isAdminUser(req.user)) {
      if (claim.status !== 'submitted') {
        return res.status(400).json({ message: 'Can only edit claims in submitted status' })
      }
      if (description !== undefined) claim.description = description.trim()
      if (photoUrls !== undefined) claim.photoUrls = photoUrls
      if (satisfactionRating !== undefined) {
        const rating = Number(satisfactionRating)
        if (rating < 1 || rating > 5) {
          return res.status(400).json({ message: 'satisfactionRating must be between 1 and 5' })
        }
        claim.satisfactionRating = rating
      }
    } else {
      if (category !== undefined) {
        if (!WARRANTY_CATEGORIES.includes(category)) {
          return res.status(400).json({
            message: `Invalid category. Allowed: ${WARRANTY_CATEGORIES.join(', ')}`
          })
        }
        claim.category = category
      }
      if (description !== undefined) claim.description = description.trim()
      if (photoUrls !== undefined) claim.photoUrls = photoUrls
      if (priority !== undefined) {
        if (!WARRANTY_PRIORITIES.includes(priority)) {
          return res.status(400).json({
            message: `Invalid priority. Allowed: ${WARRANTY_PRIORITIES.join(', ')}`
          })
        }
        claim.priority = priority
      }
      if (status !== undefined) {
        if (!WARRANTY_STATUSES.includes(status)) {
          return res.status(400).json({
            message: `Invalid status. Allowed: ${WARRANTY_STATUSES.join(', ')}`
          })
        }
        claim.status = status
        if (status === 'resolved' && !claim.resolvedAt) {
          claim.resolvedAt = new Date()
        }
      }
      if (assignedContractor !== undefined) claim.assignedContractor = assignedContractor
      if (resolution !== undefined) claim.resolution = resolution
      if (satisfactionRating !== undefined) {
        if (satisfactionRating == null) {
          claim.satisfactionRating = null
        } else {
          const rating = Number(satisfactionRating)
          if (rating < 1 || rating > 5) {
            return res.status(400).json({ message: 'satisfactionRating must be between 1 and 5' })
          }
          claim.satisfactionRating = rating
        }
      }
    }

    await claim.save()
    const populated = await WarrantyClaim.findById(claim._id).populate(POPULATE)
    res.json(populated)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const resolveWarranty = async (req, res) => {
  try {
    const claim = await WarrantyClaim.findById(req.params.id)
    if (!claim) return res.status(404).json({ message: 'Warranty claim not found' })

    const { resolution, status } = req.body
    claim.status = status === 'rejected' ? 'rejected' : 'resolved'
    claim.resolution = resolution?.trim() || claim.resolution
    claim.resolvedAt = new Date()
    await claim.save()

    const populated = await WarrantyClaim.findById(claim._id).populate(POPULATE)
    res.json(populated)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const deleteWarranty = async (req, res) => {
  try {
    const claim = await WarrantyClaim.findById(req.params.id)
    if (!claim) return res.status(404).json({ message: 'Warranty claim not found' })
    await claim.deleteOne()
    res.json({ message: 'Warranty claim deleted' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}
