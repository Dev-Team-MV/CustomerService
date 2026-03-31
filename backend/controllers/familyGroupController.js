import mongoose from 'mongoose'
import FamilyGroup from '../models/FamilyGroup.js'
import PropertyShare from '../models/PropertyShare.js'
import User from '../models/User.js'
import Property from '../models/Property.js'
import Apartment from '../models/Apartment.js'
import Project from '../models/Project.js'

const POPULATE_PROJECT = { path: 'project', select: 'name slug' }

function isGroupAdmin(group, userId) {
  if (!group || !userId) return false
  const id = userId.toString()
  if (group.createdBy && group.createdBy.toString() === id) return true
  const member = group.members?.find(m => m.user && m.user.toString() === id)
  return member?.role === 'admin'
}

function isGroupMember(group, userId) {
  if (!group || !userId) return false
  const id = userId.toString()
  if (group.createdBy && group.createdBy.toString() === id) return true
  return group.members?.some(m => m.user && m.user.toString() === id)
}

export const createFamilyGroup = async (req, res) => {
  try {
    const { name, projectId } = req.body
    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Group name is required' })
    }
    let pid = projectId || req.body.project
    if (pid && !mongoose.Types.ObjectId.isValid(pid)) {
      return res.status(400).json({ message: 'Valid projectId is required' })
    }
    if (!pid) {
      const fallback = await Project.findOne().sort({ _id: 1 }).select('_id').lean()
      if (!fallback) {
        return res.status(400).json({ message: 'No project exists; create a project or send projectId' })
      }
      pid = fallback._id
    }
    const projectExists = await Project.exists({ _id: pid })
    if (!projectExists) {
      return res.status(404).json({ message: 'Project not found' })
    }
    const trimmed = name.trim()
    const group = await FamilyGroup.create({
      project: pid,
      name: trimmed,
      createdBy: req.user._id,
      members: []
    })
    await group.populate('createdBy', 'firstName lastName email')
    await group.populate(POPULATE_PROJECT)
    res.status(201).json(group)
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: 'A family group with this name already exists in this project' })
    }
    res.status(500).json({ message: error.message })
  }
}

export const getMyFamilyGroups = async (req, res) => {
  try {
    const { projectId } = req.query
    const userId = req.user._id

    const baseFilter = {
      $or: [
        { createdBy: userId },
        { 'members.user': userId }
      ]
    }

    if (projectId) {
      if (!mongoose.Types.ObjectId.isValid(projectId)) {
        return res.status(400).json({ message: 'Query parameter projectId must be valid' })
      }
      const projectExists = await Project.exists({ _id: projectId })
      if (!projectExists) {
        return res.status(404).json({ message: 'Project not found' })
      }
      baseFilter.project = projectId
    }

    const groups = await FamilyGroup.find(baseFilter)
      .populate('createdBy', 'firstName lastName email')
      .populate('members.user', 'firstName lastName email')
      .populate(POPULATE_PROJECT)
      .sort({ updatedAt: -1 })
    res.json(groups)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const getFamilyGroupById = async (req, res) => {
  try {
    const group = await FamilyGroup.findById(req.params.id)
      .populate('createdBy', 'firstName lastName email')
      .populate('members.user', 'firstName lastName email')
      .populate(POPULATE_PROJECT)
    if (!group) {
      return res.status(404).json({ message: 'Family group not found' })
    }
    if (!isGroupMember(group, req.user._id)) {
      return res.status(403).json({ message: 'Not a member of this group' })
    }
    res.json(group)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const updateFamilyGroup = async (req, res) => {
  try {
    const group = await FamilyGroup.findById(req.params.id)
    if (!group) {
      return res.status(404).json({ message: 'Family group not found' })
    }
    const isAdmin = req.user.role === 'superadmin' || isGroupAdmin(group, req.user._id)
    if (!isAdmin) {
      return res.status(403).json({ message: 'Only group admins can update the group' })
    }

    const { name, members } = req.body

    if (name !== undefined && name !== null) {
      const nextName = typeof name === 'string' ? name.trim() : group.name
      if (typeof name === 'string' && nextName) {
        const dup = await FamilyGroup.findOne({
          _id: { $ne: group._id },
          project: group.project,
          name: nextName
        }).select('_id').lean()
        if (dup) {
          return res.status(409).json({ message: 'A family group with this name already exists in this project' })
        }
      }
      group.name = nextName
    }

    if (Array.isArray(members)) {
      const newMembers = members.map(m => ({
        user: m.user || m,
        role: m.role === 'admin' ? 'admin' : 'member'
      }))
      const createdById = group.createdBy?.toString()
      const hasCreator = newMembers.some(m => (m.user?.toString?.() || m.user) === createdById)
      if (!hasCreator) {
        return res.status(400).json({ message: 'Group creator must remain in the group' })
      }
      group.members = newMembers
      group.markModified('members')
    }

    await group.save()
    await group.populate('createdBy', 'firstName lastName email')
    await group.populate('members.user', 'firstName lastName email')
    await group.populate(POPULATE_PROJECT)
    res.json(group)
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: 'A family group with this name already exists in this project' })
    }
    res.status(500).json({ message: error.message })
  }
}

export const addMemberToFamilyGroup = async (req, res) => {
  try {
    const group = await FamilyGroup.findById(req.params.id)
    if (!group) {
      return res.status(404).json({ message: 'Family group not found' })
    }
    if (!isGroupAdmin(group, req.user._id) && req.user.role !== 'superadmin') {
      return res.status(403).json({ message: 'Only group admins can add members' })
    }
    const { userId, role } = req.body
    if (!userId) {
      return res.status(400).json({ message: 'userId is required' })
    }
    const userExists = await User.findById(userId)
    if (!userExists) {
      return res.status(404).json({ message: 'User not found' })
    }
    const idStr = userId.toString()
    if (group.createdBy && group.createdBy.toString() === idStr) {
      return res.status(400).json({ message: 'Creator is already in the group' })
    }
    if (group.members?.some(m => m.user && m.user.toString() === idStr)) {
      return res.status(400).json({ message: 'User is already a member' })
    }
    group.members = group.members || []
    group.members.push({ user: userId, role: role === 'admin' ? 'admin' : 'member' })
    group.markModified('members')
    await group.save()

    // Sync shares for the newly added member:
    // - when a group was already sharing properties/apartments,
    // - we must grant access to the user who just joined the group.
    const familyGroupId = group._id

    // Shared targets that already exist for this family group.
    const [sharedPropertyIds, sharedApartmentIds] = await Promise.all([
      PropertyShare.distinct('property', {
        familyGroup: familyGroupId,
        property: { $exists: true, $ne: null }
      }),
      PropertyShare.distinct('apartment', {
        familyGroup: familyGroupId,
        apartment: { $exists: true, $ne: null }
      })
    ])

    const [ownedPropertyDocs, ownedApartmentDocs] = await Promise.all([
      Property.find(
        { _id: { $in: sharedPropertyIds } , users: userId },
      ).select('_id').lean(),
      Apartment.find(
        { _id: { $in: sharedApartmentIds }, users: userId },
      ).select('_id').lean()
    ])

    const ownedPropertyIdSet = new Set(ownedPropertyDocs.map(d => d._id.toString()))
    const ownedApartmentIdSet = new Set(ownedApartmentDocs.map(d => d._id.toString()))

    const propertyIdsToShare = (sharedPropertyIds || []).filter(id => !ownedPropertyIdSet.has(id.toString()))
    const apartmentIdsToShare = (sharedApartmentIds || []).filter(id => !ownedApartmentIdSet.has(id.toString()))

    const bulkOps = []

    for (const propertyId of propertyIdsToShare) {
      bulkOps.push({
        updateOne: {
          filter: { property: propertyId, sharedWith: userId },
          update: {
            $setOnInsert: {
              property: propertyId,
              sharedWith: userId,
              sharedBy: req.user._id,
              familyGroup: familyGroupId
            },
            // If a share existed without familyGroup tag, set it so UI shows it under this group.
            $set: { familyGroup: familyGroupId }
          },
          upsert: true
        }
      })
    }

    for (const apartmentId of apartmentIdsToShare) {
      bulkOps.push({
        updateOne: {
          filter: { apartment: apartmentId, sharedWith: userId },
          update: {
            $setOnInsert: {
              apartment: apartmentId,
              sharedWith: userId,
              sharedBy: req.user._id,
              familyGroup: familyGroupId
            },
            $set: { familyGroup: familyGroupId }
          },
          upsert: true
        }
      })
    }

    if (bulkOps.length) {
      await PropertyShare.bulkWrite(bulkOps, { ordered: false })
    }

    await group.populate('createdBy', 'firstName lastName email')
    await group.populate('members.user', 'firstName lastName email')
    await group.populate(POPULATE_PROJECT)
    res.json(group)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const removeMemberFromFamilyGroup = async (req, res) => {
  try {
    const group = await FamilyGroup.findById(req.params.id)
    if (!group) {
      return res.status(404).json({ message: 'Family group not found' })
    }
    if (!isGroupAdmin(group, req.user._id) && req.user.role !== 'superadmin') {
      return res.status(403).json({ message: 'Only group admins can remove members' })
    }
    const memberUserId = req.params.userId
    const creatorId = group.createdBy?.toString()
    if (memberUserId === creatorId) {
      return res.status(400).json({ message: 'Cannot remove the group creator' })
    }
    group.members = (group.members || []).filter(m => m.user && m.user.toString() !== memberUserId)
    group.markModified('members')
    await group.save()

    // Revoke shared access for the removed member (only the shares tagged to this family group).
    // Ownership access (Property.users / Apartment.users) is still handled by Property/Apartment models.
    await PropertyShare.deleteMany({
      familyGroup: group._id,
      sharedWith: memberUserId
    })

    await group.populate('createdBy', 'firstName lastName email')
    await group.populate('members.user', 'firstName lastName email')
    await group.populate(POPULATE_PROJECT)
    res.json(group)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const deleteFamilyGroup = async (req, res) => {
  try {
    const group = await FamilyGroup.findById(req.params.id)
    if (!group) {
      return res.status(404).json({ message: 'Family group not found' })
    }
    if (!isGroupAdmin(group, req.user._id) && req.user.role !== 'superadmin') {
      return res.status(403).json({ message: 'Only group admins can delete the group' })
    }
    await PropertyShare.deleteMany({ familyGroup: group._id })
    await group.deleteOne()
    res.json({ message: 'Family group deleted successfully' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}
