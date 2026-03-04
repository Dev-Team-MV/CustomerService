import Property from '../models/Property.js'
import PropertyShare from '../models/PropertyShare.js'
import FamilyGroup from '../models/FamilyGroup.js'

function isPropertyOwner(property, userId) {
  return property.users?.some(id => id.toString() === userId.toString())
}

/** Get all user IDs that are members of the group (createdBy + members) */
function getFamilyGroupMemberIds(group) {
  if (!group) return []
  const ids = new Set()
  if (group.createdBy) ids.add(group.createdBy.toString())
  for (const m of group.members || []) {
    if (m.user) ids.add(m.user.toString())
  }
  return Array.from(ids)
}

export const shareProperty = async (req, res) => {
  try {
    const { id: propertyId } = req.params
    const { sharedWithUserId, familyGroupId } = req.body
    const shareWithUser = !!sharedWithUserId
    const shareWithGroup = !!familyGroupId
    if (!shareWithUser && !shareWithGroup) {
      return res.status(400).json({ message: 'sharedWithUserId or familyGroupId is required' })
    }
    if (shareWithUser && shareWithGroup) {
      // Single user + group tag (existing behavior)
    } else if (shareWithGroup) {
      // Share with entire group: create one share per group member (except owners)
      const property = await Property.findById(propertyId)
      if (!property) {
        return res.status(404).json({ message: 'Property not found' })
      }
      const group = await FamilyGroup.findById(familyGroupId).populate('members.user')
      if (!group) {
        return res.status(404).json({ message: 'Family group not found' })
      }
      const isAdmin = req.user.role === 'superadmin'
      const isOwner = isPropertyOwner(property, req.user._id)
      const isGroupAdmin = group.createdBy?.toString() === req.user._id.toString() ||
        group.members?.some(m => m.user && m.user.toString() === req.user._id.toString() && m.role === 'admin')
      if (!isAdmin && !isOwner && !isGroupAdmin) {
        return res.status(403).json({ message: 'Only property owners or group admins can share this property' })
      }
      const memberIds = getFamilyGroupMemberIds(group)
      const ownerIds = new Set((property.users || []).map(id => id.toString()))
      const toShare = memberIds.filter(id => !ownerIds.has(id))
      const existing = await PropertyShare.find({
        property: propertyId,
        sharedWith: { $in: toShare },
        familyGroup: familyGroupId
      }).distinct('sharedWith')
      const existingSet = new Set(existing.map(id => id.toString()))
      const toCreate = toShare.filter(id => !existingSet.has(id))
      const created = []
      for (const userId of toCreate) {
        const share = await PropertyShare.create({
          property: propertyId,
          sharedWith: userId,
          sharedBy: req.user._id,
          familyGroup: familyGroupId
        })
        created.push(share)
      }
      await PropertyShare.populate(created, [
        { path: 'sharedWith', select: 'firstName lastName email' },
        { path: 'sharedBy', select: 'firstName lastName email' },
        { path: 'familyGroup', select: 'name' }
      ])
      return res.status(201).json({
        message: toCreate.length ? `Shared with ${toCreate.length} group member(s)` : 'All group members already have access or are owners',
        count: created.length,
        shares: created
      })
    }

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

/** Revoke all shares for this property that belong to the given family group. */
export const revokePropertyShareByGroup = async (req, res) => {
  try {
    const { id: propertyId, familyGroupId } = req.params
    const property = await Property.findById(propertyId)
    if (!property) {
      return res.status(404).json({ message: 'Property not found' })
    }
    const group = await FamilyGroup.findById(familyGroupId)
    if (!group) {
      return res.status(404).json({ message: 'Family group not found' })
    }
    const isOwner = isPropertyOwner(property, req.user._id)
    const isAdmin = req.user.role === 'superadmin'
    const isGroupAdmin = group.createdBy?.toString() === req.user._id.toString() ||
      group.members?.some(m => m.user && m.user.toString() === req.user._id.toString() && m.role === 'admin')
    const canRevoke = isAdmin || isOwner || isGroupAdmin
    if (!canRevoke) {
      return res.status(403).json({ message: 'Only property owners or group admins can revoke group shares' })
    }
    const result = await PropertyShare.deleteMany({
      property: propertyId,
      familyGroup: familyGroupId
    })
    res.json({
      message: `Revoked ${result.deletedCount} share(s) for this group`,
      deletedCount: result.deletedCount
    })
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
