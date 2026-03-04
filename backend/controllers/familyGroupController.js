import FamilyGroup from '../models/FamilyGroup.js'
import PropertyShare from '../models/PropertyShare.js'
import User from '../models/User.js'

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
    const { name } = req.body
    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Group name is required' })
    }
    const group = await FamilyGroup.create({
      name: name.trim(),
      createdBy: req.user._id,
      members: []
    })
    await group.populate('createdBy', 'firstName lastName email')
    res.status(201).json(group)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const getMyFamilyGroups = async (req, res) => {
  try {
    const userId = req.user._id
    const groups = await FamilyGroup.find({
      $or: [
        { createdBy: userId },
        { 'members.user': userId }
      ]
    })
      .populate('createdBy', 'firstName lastName email')
      .populate('members.user', 'firstName lastName email')
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
      group.name = typeof name === 'string' ? name.trim() : group.name
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
    res.json(group)
  } catch (error) {
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
    await group.populate('createdBy', 'firstName lastName email')
    await group.populate('members.user', 'firstName lastName email')
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
    await group.populate('createdBy', 'firstName lastName email')
    await group.populate('members.user', 'firstName lastName email')
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
