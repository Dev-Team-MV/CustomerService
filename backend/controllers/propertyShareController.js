import Property from '../models/Property.js'
import PropertyShare from '../models/PropertyShare.js'
import FamilyGroup from '../models/FamilyGroup.js'

function isPropertyOwner(property, userId) {
  return property.users?.some(id => id.toString() === userId.toString())
}

export const shareProperty = async (req, res) => {
  try {
    const { id: propertyId } = req.params
    const { sharedWithUserId, familyGroupId } = req.body
    if (!sharedWithUserId) {
      return res.status(400).json({ message: 'sharedWithUserId is required' })
    }

    const property = await Property.findById(propertyId)
    if (!property) {
      return res.status(404).json({ message: 'Property not found' })
    }
    const isAdmin = req.user.role === 'superadmin'
    const isOwner = isPropertyOwner(property, req.user._id)
    let canShare = isAdmin || isOwner
    if (!canShare && familyGroupId) {
      const group = await FamilyGroup.findById(familyGroupId)
      canShare = group && (group.createdBy?.toString() === req.user._id.toString() || group.members?.some(m => m.user?.toString() === req.user._id.toString() && m.role === 'admin'))
    }
    if (!canShare) {
      return res.status(403).json({ message: 'Only property owners or group admins can share this property' })
    }

    const existing = await PropertyShare.findOne({ property: propertyId, sharedWith: sharedWithUserId })
    if (existing) {
      return res.status(400).json({ message: 'Property is already shared with this user' })
    }

    const share = await PropertyShare.create({
      property: propertyId,
      sharedWith: sharedWithUserId,
      sharedBy: req.user._id,
      familyGroup: familyGroupId || undefined
    })
    await share.populate('sharedWith', 'firstName lastName email')
    await share.populate('sharedBy', 'firstName lastName email')
    if (share.familyGroup) await share.populate('familyGroup', 'name')
    res.status(201).json(share)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const revokePropertyShare = async (req, res) => {
  try {
    const { id: propertyId, userId: sharedWithUserId } = req.params
    const property = await Property.findById(propertyId)
    if (!property) {
      return res.status(404).json({ message: 'Property not found' })
    }
    const isOwner = isPropertyOwner(property, req.user._id)
    const isAdmin = req.user.role === 'superadmin'
    const share = await PropertyShare.findOne({ property: propertyId, sharedWith: sharedWithUserId })
    if (!share) {
      return res.status(404).json({ message: 'Share not found' })
    }
    let canRevoke = isAdmin || isOwner || share.sharedBy.toString() === req.user._id.toString()
    if (!canRevoke && share.familyGroup) {
      const group = await FamilyGroup.findById(share.familyGroup)
      canRevoke = group && (group.createdBy?.toString() === req.user._id.toString() || group.members?.some(m => m.user?.toString() === req.user._id.toString() && m.role === 'admin'))
    }
    if (!canRevoke) {
      return res.status(403).json({ message: 'Not allowed to revoke this share' })
    }
    await share.deleteOne()
    res.json({ message: 'Share revoked successfully' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const getPropertyShares = async (req, res) => {
  try {
    const { id: propertyId } = req.params
    const property = await Property.findById(propertyId)
    if (!property) {
      return res.status(404).json({ message: 'Property not found' })
    }
    const isOwner = isPropertyOwner(property, req.user._id)
    const isAdmin = req.user.role === 'superadmin'
    if (!isOwner && !isAdmin) {
      const share = await PropertyShare.findOne({ property: propertyId, sharedWith: req.user._id })
      if (!share) {
        return res.status(403).json({ message: 'Not allowed to list shares for this property' })
      }
      const group = share.familyGroup ? await FamilyGroup.findById(share.familyGroup) : null
      const isGroupAdmin = group && (group.createdBy?.toString() === req.user._id.toString() || group.members?.some(m => m.user?.toString() === req.user._id.toString() && m.role === 'admin'))
      if (!isGroupAdmin) {
        return res.status(403).json({ message: 'Only property owners or group admins can list shares' })
      }
    }
    const shares = await PropertyShare.find({ property: propertyId })
      .populate('sharedWith', 'firstName lastName email')
      .populate('sharedBy', 'firstName lastName email')
      .populate('familyGroup', 'name')
    res.json(shares)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}
