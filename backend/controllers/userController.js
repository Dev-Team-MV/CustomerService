import User from '../models/User.js'
import Project from '../models/Project.js'
import { getProjectIdsForUser, canUserAccessProject } from '../utils/projectAccess.js'
import Property from '../models/Property.js'
import Apartment from '../models/Apartment.js'

function toIdStr(val) {
  if (val == null) return ''
  if (typeof val === 'string') return val
  if (val._id != null) return val._id.toString()
  return String(val)
}

async function buildUserProjectsMap(userDocs) {
  const userIds = userDocs.map((u) => u._id)
  if (userIds.length === 0) return new Map()

  const [properties, apartments] = await Promise.all([
    Property.find({ users: { $in: userIds } }).select('project users').lean(),
    Apartment.find({ users: { $in: userIds } })
      .select('building users')
      .populate('building', 'project')
      .lean()
  ])

  const perUserProjectIds = new Map()
  for (const u of userDocs) {
    perUserProjectIds.set(toIdStr(u._id), new Set())
  }

  for (const p of properties) {
    if (!p.project) continue
    const projectId = toIdStr(p.project)
    for (const uid of p.users || []) {
      const key = toIdStr(uid)
      if (perUserProjectIds.has(key)) perUserProjectIds.get(key).add(projectId)
    }
  }

  for (const a of apartments) {
    const projectId = a.building?.project ? toIdStr(a.building.project) : ''
    if (!projectId) continue
    for (const uid of a.users || []) {
      const key = toIdStr(uid)
      if (perUserProjectIds.has(key)) perUserProjectIds.get(key).add(projectId)
    }
  }

  for (const u of userDocs) {
    const key = toIdStr(u._id)
    const set = perUserProjectIds.get(key) || new Set()
    for (const m of u.projectMemberships || []) {
      if (m?.project) set.add(toIdStr(m.project))
    }
    perUserProjectIds.set(key, set)
  }

  const allProjectIds = Array.from(
    new Set(
      Array.from(perUserProjectIds.values()).flatMap((set) => Array.from(set))
    )
  )

  const projects = allProjectIds.length
    ? await Project.find({ _id: { $in: allProjectIds } }).select('name slug phase type').lean()
    : []
  const byProjectId = new Map(projects.map((p) => [toIdStr(p._id), p]))

  const result = new Map()
  for (const [uid, set] of perUserProjectIds.entries()) {
    const list = Array.from(set)
      .map((pid) => byProjectId.get(pid))
      .filter(Boolean)
      .sort((a, b) => (a.name || '').localeCompare(b.name || ''))
    result.set(uid, list)
  }
  return result
}

/**
 * Search users by email, firstName or lastName. Available to any authenticated user
 * (e.g. for adding members to family groups). Returns minimal fields.
 * Use q= for search (min 2 chars), or omit q to get a limited list for dropdowns.
 */
export const searchUsers = async (req, res) => {
  try {
    const { q, projectId } = req.query
    if (!projectId) {
      return res.status(400).json({ message: 'projectId is required' })
    }
    const query = typeof q === 'string' ? q.trim() : ''
    let filter = {}
    if (query.length >= 2) {
      const regex = new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i')
      filter = {
        $or: [
          { email: regex },
          { firstName: regex },
          { lastName: regex }
        ]
      }
    }

    const exists = await Project.exists({ _id: projectId })
    if (!exists) {
      return res.status(404).json({ message: 'Project not found' })
    }

    if (req.user) {
      const allowed = await canUserAccessProject(req.user._id, projectId, { role: req.user.role })
      if (!allowed) {
        return res.status(403).json({ message: 'No access to this project' })
      }
    }

    const users = await User.find(filter)
      .select('_id firstName lastName email projectMemberships')
      .limit(query.length >= 2 ? 50 : 100)
      .sort({ lastName: 1, firstName: 1 })
      .lean()

    const projectsMap = await buildUserProjectsMap(users)
    const filtered = users.filter((u) =>
      (projectsMap.get(toIdStr(u._id)) || []).some((p) => toIdStr(p._id) === toIdStr(projectId))
    )
    res.json(filtered.map((u) => ({
      _id: u._id,
      firstName: u.firstName,
      lastName: u.lastName,
      email: u.email
    })))
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

/**
 * Proyectos en los que el usuario tiene presencia (P1 vía Property, P2 vía Apartment, o projectMemberships).
 * admin/superadmin: listan todos los proyectos (gestión).
 */
export const getMyProjects = async (req, res) => {
  try {
    if (req.user.role === 'admin' || req.user.role === 'superadmin') {
      const all = await Project.find({})
        .select('name slug phase type')
        .sort({ name: 1 })
      return res.json(all)
    }
    const ids = await getProjectIdsForUser(req.user._id)
    if (ids.length === 0) {
      return res.json([])
    }
    const projects = await Project.find({ _id: { $in: ids } })
      .select('name slug phase type')
      .sort({ name: 1 })
    res.json(projects)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const getAllUsers = async (req, res) => {
  try {
    const { role, projectId } = req.query
    const isAdmin = req.user && (req.user.role === 'admin' || req.user.role === 'superadmin')

    if (!isAdmin && !projectId) {
      return res.status(400).json({ message: 'projectId is required' })
    }
    const filter = (isAdmin && role) ? { role } : {}

    let usersQuery = User.find(filter)

    if (isAdmin) {
      usersQuery = usersQuery
        .select('-password')
        .populate('lots', 'number')
        .populate('projectMemberships.project', 'name slug phase type')
    } else {
      usersQuery = usersQuery
        .select('_id firstName lastName email projectMemberships')
    }

    let users = await usersQuery.lean()

    const projectsMap = await buildUserProjectsMap(users)
    const usersWithProjects = users.map((u) => ({
      ...u,
      projects: projectsMap.get(toIdStr(u._id)) || []
    }))

    if (projectId) {
      const filtered = usersWithProjects.filter((u) => (u.projects || []).some((p) => toIdStr(p._id) === toIdStr(projectId)))
      if (!isAdmin) {
        return res.json(filtered.map((u) => ({
          _id: u._id,
          firstName: u.firstName,
          lastName: u.lastName,
          email: u.email
        })))
      }
      return res.json(filtered)
    }

    if (!isAdmin) {
      return res.status(403).json({ message: 'Not authorized as admin' })
    }
    res.json(usersWithProjects)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password').populate('lots')
    
    if (user) {
      res.json(user)
    } else {
      res.status(404).json({ message: 'User not found' })
    }
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)

    if (user) {
      user.firstName = req.body.firstName || user.firstName
      user.lastName = req.body.lastName || user.lastName
      user.email = req.body.email || user.email
      user.phoneNumber = req.body.phoneNumber || user.phoneNumber
      user.birthday = req.body.birthday || user.birthday
      
      if (req.body.password) {
        user.password = req.body.password
      }

      const updatedUser = await user.save()

      res.json({
        _id: updatedUser._id,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        email: updatedUser.email,
        phoneNumber: updatedUser.phoneNumber,
        birthday: updatedUser.birthday,
        role: updatedUser.role
      })
    } else {
      res.status(404).json({ message: 'User not found' })
    }
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)

    if (user) {
      await user.deleteOne()
      res.json({ message: 'User deleted successfully' })
    } else {
      res.status(404).json({ message: 'User not found' })
    }
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}
