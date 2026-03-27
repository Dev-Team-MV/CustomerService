import Property from '../models/Property.js'
import Apartment from '../models/Apartment.js'
import PropertyShare from '../models/PropertyShare.js'
import FamilyGroup from '../models/FamilyGroup.js'
import mongoose from 'mongoose'

function isPropertyOwner(property, userId) {
  return property?.users?.some(id => id.toString() === userId.toString())
}

function isApartmentOwner(apartment, userId) {
  return apartment?.users?.some(id => id.toString() === userId.toString())
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

function normalizeUserId(userInput) {
  if (!userInput) return null

  if (typeof userInput === 'object') {
    const candidateId = userInput._id ?? userInput.id ?? null
    return candidateId ? normalizeUserId(candidateId) : null
  }

  const raw = String(userInput).trim()
  if (!raw) return null

  if (mongoose.Types.ObjectId.isValid(raw)) return raw

  // Some clients may send a serialized object instead of an ID.
  const objectIdMatch = raw.match(/[a-fA-F0-9]{24}/)
  if (objectIdMatch && mongoose.Types.ObjectId.isValid(objectIdMatch[0])) {
    return objectIdMatch[0]
  }

  return null
}

/** Family groups are scoped per project; resource must belong to the same project. */
function familyGroupMatchesProject(group, resourceProjectId) {
  if (!group?.project || resourceProjectId == null) return false
  return group.project.toString() === resourceProjectId.toString()
}

function respondFamilyGroupProjectMismatch(res) {
  return res.status(400).json({ message: 'Family group does not belong to this property project' })
}

function getApartmentProjectIdFromDoc(apartmentDoc) {
  if (!apartmentDoc?.building) return null
  const b = apartmentDoc.building
  const proj = typeof b === 'object' && b.project != null ? b.project : null
  return proj ? proj.toString() : null
}

export const shareProperty = async (req, res) => {
  try {
    const { id: propertyId } = req.params
    const { sharedWithUserId, familyGroupId } = req.body
    const normalizedSharedWithUserId = normalizeUserId(sharedWithUserId)
    const shareWithUser = !!normalizedSharedWithUserId
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
      if (!familyGroupMatchesProject(group, property.project)) {
        return respondFamilyGroupProjectMismatch(res)
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

    if (!normalizedSharedWithUserId) {
      return res.status(400).json({ message: 'sharedWithUserId is required' })
    }

    const property = await Property.findById(propertyId)
    if (!property) {
      return res.status(404).json({ message: 'Property not found' })
    }
    if (familyGroupId) {
      const group = await FamilyGroup.findById(familyGroupId)
      if (!group) {
        return res.status(404).json({ message: 'Family group not found' })
      }
      if (!familyGroupMatchesProject(group, property.project)) {
        return respondFamilyGroupProjectMismatch(res)
      }
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

    const existing = await PropertyShare.findOne({ property: propertyId, sharedWith: normalizedSharedWithUserId })
    if (existing) {
      return res.status(400).json({ message: 'Property is already shared with this user' })
    }

    const share = await PropertyShare.create({
      property: propertyId,
      sharedWith: normalizedSharedWithUserId,
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
      const projectOk = group && familyGroupMatchesProject(group, property.project)
      canRevoke = projectOk && (group.createdBy?.toString() === req.user._id.toString() || group.members?.some(m => m.user?.toString() === req.user._id.toString() && m.role === 'admin'))
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
    if (!familyGroupMatchesProject(group, property.project)) {
      return respondFamilyGroupProjectMismatch(res)
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

// Apartment share (same logic, different model)
export const shareApartment = async (req, res) => {
  try {
    const { id: apartmentId } = req.params
    const { sharedWithUserId, familyGroupId } = req.body
    const normalizedSharedWithUserId = normalizeUserId(sharedWithUserId)
    const shareWithUser = !!normalizedSharedWithUserId
    const shareWithGroup = !!familyGroupId
    if (!shareWithUser && !shareWithGroup) {
      return res.status(400).json({ message: 'sharedWithUserId or familyGroupId is required' })
    }
    if (shareWithGroup) {
      const apartment = await Apartment.findById(apartmentId).populate({ path: 'building', select: 'project' })
      if (!apartment) return res.status(404).json({ message: 'Apartment not found' })
      const aptProjectId = getApartmentProjectIdFromDoc(apartment)
      if (!aptProjectId) {
        return res.status(400).json({ message: 'Apartment must belong to a building with a project to use a family group' })
      }
      const group = await FamilyGroup.findById(familyGroupId).populate('members.user')
      if (!group) return res.status(404).json({ message: 'Family group not found' })
      if (!familyGroupMatchesProject(group, aptProjectId)) {
        return respondFamilyGroupProjectMismatch(res)
      }
      const isAdmin = req.user.role === 'superadmin'
      const isOwner = isApartmentOwner(apartment, req.user._id)
      const isGroupAdmin = group.createdBy?.toString() === req.user._id.toString() ||
        group.members?.some(m => m.user && m.user.toString() === req.user._id.toString() && m.role === 'admin')
      if (!isAdmin && !isOwner && !isGroupAdmin) {
        return res.status(403).json({ message: 'Only apartment owners or group admins can share this apartment' })
      }
      const memberIds = getFamilyGroupMemberIds(group)
      const ownerIds = new Set((apartment.users || []).map(id => id.toString()))
      const toShare = memberIds.filter(id => !ownerIds.has(id))
      const existing = await PropertyShare.find({
        apartment: apartmentId,
        sharedWith: { $in: toShare },
        familyGroup: familyGroupId
      }).distinct('sharedWith')
      const existingSet = new Set(existing.map(id => id.toString()))
      const toCreate = toShare.filter(id => !existingSet.has(id))
      const created = []
      for (const userId of toCreate) {
        const share = await PropertyShare.create({
          apartment: apartmentId,
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
    if (!normalizedSharedWithUserId) return res.status(400).json({ message: 'sharedWithUserId is required' })
    const apartment = await Apartment.findById(apartmentId).populate({ path: 'building', select: 'project' })
    if (!apartment) return res.status(404).json({ message: 'Apartment not found' })
    if (familyGroupId) {
      const aptProjectId = getApartmentProjectIdFromDoc(apartment)
      if (!aptProjectId) {
        return res.status(400).json({ message: 'Apartment must belong to a building with a project to use a family group' })
      }
      const group = await FamilyGroup.findById(familyGroupId)
      if (!group) return res.status(404).json({ message: 'Family group not found' })
      if (!familyGroupMatchesProject(group, aptProjectId)) {
        return respondFamilyGroupProjectMismatch(res)
      }
    }
    const isAdmin = req.user.role === 'superadmin'
    const isOwner = isApartmentOwner(apartment, req.user._id)
    let canShare = isAdmin || isOwner
    if (!canShare && familyGroupId) {
      const group = await FamilyGroup.findById(familyGroupId)
      canShare = group && (group.createdBy?.toString() === req.user._id.toString() || group.members?.some(m => m.user?.toString() === req.user._id.toString() && m.role === 'admin'))
    }
    if (!canShare) return res.status(403).json({ message: 'Only apartment owners or group admins can share this apartment' })
    const existing = await PropertyShare.findOne({ apartment: apartmentId, sharedWith: normalizedSharedWithUserId })
    if (existing) return res.status(400).json({ message: 'Apartment is already shared with this user' })
    const share = await PropertyShare.create({
      apartment: apartmentId,
      sharedWith: normalizedSharedWithUserId,
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

export const revokeApartmentShare = async (req, res) => {
  try {
    const { id: apartmentId, userId: sharedWithUserId } = req.params
    const apartment = await Apartment.findById(apartmentId).populate({ path: 'building', select: 'project' })
    if (!apartment) return res.status(404).json({ message: 'Apartment not found' })
    const isOwner = isApartmentOwner(apartment, req.user._id)
    const isAdmin = req.user.role === 'superadmin'
    const share = await PropertyShare.findOne({ apartment: apartmentId, sharedWith: sharedWithUserId })
    if (!share) return res.status(404).json({ message: 'Share not found' })
    let canRevoke = isAdmin || isOwner || share.sharedBy.toString() === req.user._id.toString()
    if (!canRevoke && share.familyGroup) {
      const group = await FamilyGroup.findById(share.familyGroup)
      const aptProjectId = getApartmentProjectIdFromDoc(apartment)
      const projectOk = group && aptProjectId && familyGroupMatchesProject(group, aptProjectId)
      canRevoke = projectOk && (group.createdBy?.toString() === req.user._id.toString() || group.members?.some(m => m.user?.toString() === req.user._id.toString() && m.role === 'admin'))
    }
    if (!canRevoke) return res.status(403).json({ message: 'Not allowed to revoke this share' })
    await share.deleteOne()
    res.json({ message: 'Share revoked successfully' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const revokeApartmentShareByGroup = async (req, res) => {
  try {
    const { id: apartmentId, familyGroupId } = req.params
    const apartment = await Apartment.findById(apartmentId).populate({ path: 'building', select: 'project' })
    if (!apartment) return res.status(404).json({ message: 'Apartment not found' })
    const aptProjectId = getApartmentProjectIdFromDoc(apartment)
    if (!aptProjectId) {
      return res.status(400).json({ message: 'Apartment must belong to a building with a project to use a family group' })
    }
    const group = await FamilyGroup.findById(familyGroupId)
    if (!group) return res.status(404).json({ message: 'Family group not found' })
    if (!familyGroupMatchesProject(group, aptProjectId)) {
      return respondFamilyGroupProjectMismatch(res)
    }
    const isOwner = isApartmentOwner(apartment, req.user._id)
    const isAdmin = req.user.role === 'superadmin'
    const isGroupAdmin = group.createdBy?.toString() === req.user._id.toString() ||
      group.members?.some(m => m.user && m.user.toString() === req.user._id.toString() && m.role === 'admin')
    if (!isAdmin && !isOwner && !isGroupAdmin) return res.status(403).json({ message: 'Only apartment owners or group admins can revoke group shares' })
    const result = await PropertyShare.deleteMany({ apartment: apartmentId, familyGroup: familyGroupId })
    res.json({ message: `Revoked ${result.deletedCount} share(s) for this group`, deletedCount: result.deletedCount })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const getApartmentShares = async (req, res) => {
  try {
    const { id: apartmentId } = req.params
    const apartment = await Apartment.findById(apartmentId)
    if (!apartment) return res.status(404).json({ message: 'Apartment not found' })
    const isOwner = isApartmentOwner(apartment, req.user._id)
    const isAdmin = req.user.role === 'superadmin'
    if (!isOwner && !isAdmin) {
      const share = await PropertyShare.findOne({ apartment: apartmentId, sharedWith: req.user._id })
      if (!share) return res.status(403).json({ message: 'Not allowed to list shares for this apartment' })
      const group = share.familyGroup ? await FamilyGroup.findById(share.familyGroup) : null
      const isGroupAdmin = group && (group.createdBy?.toString() === req.user._id.toString() || group.members?.some(m => m.user?.toString() === req.user._id.toString() && m.role === 'admin'))
      if (!isGroupAdmin) return res.status(403).json({ message: 'Only apartment owners or group admins can list shares' })
    }
    const shares = await PropertyShare.find({ apartment: apartmentId })
      .populate('sharedWith', 'firstName lastName email')
      .populate('sharedBy', 'firstName lastName email')
      .populate('familyGroup', 'name')
    res.json(shares)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}
