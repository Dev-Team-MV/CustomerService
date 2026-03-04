import mongoose from 'mongoose'
import Property from '../models/Property.js'
import Payload from '../models/Payload.js'
import User from '../models/User.js'
import Project from '../models/Project.js'

/**
 * Balance consolidado por proyecto y total (para CRM superadmin).
 * totalCollected = suma de payloads con status 'signed'.
 * totalPending = suma de Property.pending (por proyecto o global).
 */
export const getCrmBalance = async (req, res) => {
  try {
    const projectIds = await Project.find({ isActive: true }).select('_id name slug').lean()
    const projectMap = new Map(projectIds.map(p => [p._id.toString(), { name: p.name, slug: p.slug }]))

    const properties = await Property.find({
      status: { $in: ['active', 'pending', 'sold'] },
      project: { $exists: true, $ne: null }
    })
      .select('project price pending')
      .lean()

    const propertyIdsByProject = new Map()
    const pendingByProject = new Map()
    let globalPending = 0

    for (const p of properties) {
      const projId = (p.project && p.project._id) ? p.project._id.toString() : (p.project || '').toString()
      if (!projId) continue
      if (!propertyIdsByProject.has(projId)) {
        propertyIdsByProject.set(projId, [])
        pendingByProject.set(projId, 0)
      }
      propertyIdsByProject.get(projId).push(p._id)
      const pend = p.pending || 0
      pendingByProject.set(projId, pendingByProject.get(projId) + pend)
      globalPending += pend
    }

    const allPropertyIds = properties.map(p => p._id)
    const signedPayloads = await Payload.aggregate([
      { $match: { property: { $in: allPropertyIds }, status: 'signed' } },
      { $group: { _id: '$property', total: { $sum: '$amount' } } }
    ])
    const collectedByProperty = new Map(signedPayloads.map(x => [x._id.toString(), x.total]))

    const collectedByProject = new Map()
    let globalCollected = 0
    for (const [projId, propIds] of propertyIdsByProject) {
      let sum = 0
      for (const pid of propIds) {
        sum += collectedByProperty.get(pid.toString()) || 0
      }
      collectedByProject.set(projId, sum)
      globalCollected += sum
    }

    const byProject = projectIds.map(({ _id, name, slug }) => {
      const id = _id.toString()
      return {
        projectId: id,
        name,
        slug,
        totalCollected: collectedByProject.get(id) || 0,
        totalPending: pendingByProject.get(id) || 0
      }
    })

    res.json({
      byProject,
      global: {
        totalCollected: globalCollected,
        totalPending: globalPending
      }
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

/**
 * Lista de clientes únicos (usuarios que son propietarios en al menos una propiedad).
 * Opcional: projectId para filtrar por proyecto.
 */
export const getCrmClients = async (req, res) => {
  try {
    const { projectId } = req.query
    const match = {}
    if (projectId) match.project = new mongoose.Types.ObjectId(projectId)

    const userIds = await Property.distinct('users', Object.keys(match).length ? match : {})
    if (userIds.length === 0) {
      return res.json({ clients: [], total: 0 })
    }

    const users = await User.find({ _id: { $in: userIds }, isActive: { $ne: false } })
      .select('firstName lastName email phoneNumber')
      .lean()

    const propertyCountByUser = await Property.aggregate([
      ...(Object.keys(match).length ? [{ $match: match }] : []),
      { $unwind: '$users' },
      { $group: { _id: '$users', count: { $sum: 1 } } }
    ])
    const countMap = new Map(propertyCountByUser.map(x => [x._id.toString(), x.count]))

    const clients = users.map(u => ({
      ...u,
      propertyCount: countMap.get(u._id.toString()) || 0
    }))

    res.json({
      clients,
      total: clients.length
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}
