import mongoose from 'mongoose'
import Property from '../models/Property.js'
import Apartment from '../models/Apartment.js'
import ApartmentModel from '../models/ApartmentModel.js'
import Building from '../models/Building.js'
import Payload from '../models/Payload.js'
import User from '../models/User.js'
import Project from '../models/Project.js'

/**
 * Balance consolidado por proyecto y total (para CRM superadmin).
 * Incluye Property (F1) y Apartment (F2).
 */
export const getCrmBalance = async (req, res) => {
  try {
    const projectIds = await Project.find({ isActive: true }).select('_id name slug title').lean()
    const pendingByProject = new Map(projectIds.map(p => [p._id.toString(), 0]))
    let globalPending = 0

    // Properties (F1)
    const properties = await Property.find({
      status: { $in: ['active', 'pending', 'sold'] },
      project: { $exists: true, $ne: null }
    })
      .select('project price pending')
      .lean()

    const propertyIdsByProject = new Map()
    for (const p of properties) {
      const projId = (p.project && p.project._id) ? p.project._id.toString() : (p.project || '').toString()
      if (!projId) continue
      if (!propertyIdsByProject.has(projId)) propertyIdsByProject.set(projId, [])
      propertyIdsByProject.get(projId).push(p._id)
      const pend = p.pending || 0
      pendingByProject.set(projId, (pendingByProject.get(projId) || 0) + pend)
      globalPending += pend
    }

    // Apartments (F2) - project via Building
    const buildings = await Building.find({ project: { $in: projectIds.map(p => p._id) } }).select('_id project').lean()
    const buildingByProject = new Map()
    for (const b of buildings) {
      const projId = (b.project && b.project._id) ? b.project._id.toString() : (b.project || '').toString()
      if (!buildingByProject.has(projId)) buildingByProject.set(projId, [])
      buildingByProject.get(projId).push(b._id)
    }
    const allBuildingIds = buildings.map(b => b._id)
    const models = await ApartmentModel.find({ building: { $in: allBuildingIds } }).select('_id building').lean()
    const modelBuildingMap = new Map(models.map(m => [m._id.toString(), m.building?.toString()]))
    const apartmentIdsByProject = new Map()
    const apartments = await Apartment.find({
      status: { $in: ['active', 'pending', 'sold'] },
      apartmentModel: { $in: models.map(m => m._id) }
    })
      .select('apartmentModel pending')
      .lean()

    for (const a of apartments) {
      const buildId = modelBuildingMap.get((a.apartmentModel || '').toString())
      const projId = buildings.find(b => b._id.toString() === buildId)?.project?.toString()
      if (!projId) continue
      if (!apartmentIdsByProject.has(projId)) apartmentIdsByProject.set(projId, [])
      apartmentIdsByProject.get(projId).push(a._id)
      const pend = a.pending || 0
      pendingByProject.set(projId, (pendingByProject.get(projId) || 0) + pend)
      globalPending += pend
    }

    const allPropertyIds = properties.map(p => p._id)
    const allApartmentIds = apartments.map(a => a._id)
    const [signedPropertyPayloads, signedApartmentPayloads] = await Promise.all([
      Payload.aggregate([
        { $match: { property: { $in: allPropertyIds }, status: 'signed' } },
        { $group: { _id: '$property', total: { $sum: '$amount' } } }
      ]),
      Payload.aggregate([
        { $match: { apartment: { $in: allApartmentIds }, status: 'signed' } },
        { $group: { _id: '$apartment', total: { $sum: '$amount' } } }
      ])
    ])
    const collectedByProperty = new Map(signedPropertyPayloads.map(x => [x._id.toString(), x.total]))
    const collectedByApartment = new Map(signedApartmentPayloads.map(x => [x._id.toString(), x.total]))

    const collectedByProject = new Map()
    let globalCollected = 0
    for (const [projId, propIds] of propertyIdsByProject) {
      let sum = 0
      for (const pid of propIds) sum += collectedByProperty.get(pid.toString()) || 0
      collectedByProject.set(projId, (collectedByProject.get(projId) || 0) + sum)
    }
    for (const [projId, aptIds] of apartmentIdsByProject) {
      let sum = 0
      for (const aid of aptIds) sum += collectedByApartment.get(aid.toString()) || 0
      collectedByProject.set(projId, (collectedByProject.get(projId) || 0) + sum)
    }
    for (const [, v] of collectedByProject) globalCollected += v

    const byProject = projectIds.map(({ _id, name, slug, title }) => {
      const id = _id.toString()
      return {
        projectId: id,
        name: title?.en || name || slug || 'Project',
        slug,
        totalCollected: collectedByProject.get(id) || 0,
        totalPending: pendingByProject.get(id) || 0
      }
    })

    res.json({
      byProject,
      global: { totalCollected: globalCollected, totalPending: globalPending }
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

/**
 * Lista de clientes únicos (usuarios que son propietarios en Property o Apartment).
 * Opcional: projectId para filtrar por proyecto.
 */
export const getCrmClients = async (req, res) => {
  try {
    const { projectId } = req.query
    let propertyUserIds = []
    let apartmentUserIds = []

    if (projectId) {
      propertyUserIds = await Property.distinct('users', { project: projectId })
      const buildings = await Building.find({ project: projectId }).select('_id')
      const models = await ApartmentModel.find({ building: { $in: buildings.map(b => b._id) } }).select('_id')
      const apartments = await Apartment.find({ apartmentModel: { $in: models.map(m => m._id) } }).select('users').lean()
      apartmentUserIds = [...new Set(apartments.flatMap(a => (a.users || []).map(u => u.toString())))]
    } else {
      propertyUserIds = await Property.distinct('users', {})
      apartmentUserIds = await Apartment.distinct('users', {})
    }

    const allUserIds = [...new Set([...propertyUserIds.map(String), ...apartmentUserIds.map(String)])]
    if (allUserIds.length === 0) return res.json({ clients: [], total: 0 })

    const users = await User.find({ _id: { $in: allUserIds }, isActive: { $ne: false } })
      .select('firstName lastName email phoneNumber')
      .lean()

    const propertyCounts = await Property.aggregate([
      ...(projectId ? [{ $match: { project: new mongoose.Types.ObjectId(projectId) } }] : []),
      { $unwind: '$users' },
      { $group: { _id: '$users', count: { $sum: 1 } } }
    ])

    let apartmentCounts = []
    if (projectId) {
      const buildings = await Building.find({ project: projectId }).select('_id')
      const models = await ApartmentModel.find({ building: { $in: buildings.map(b => b._id) } }).select('_id')
      apartmentCounts = await Apartment.aggregate([
        { $match: { apartmentModel: { $in: models.map(m => m._id) } } },
        { $unwind: '$users' },
        { $group: { _id: '$users', count: { $sum: 1 } } }
      ])
    } else {
      apartmentCounts = await Apartment.aggregate([
        { $unwind: '$users' },
        { $group: { _id: '$users', count: { $sum: 1 } } }
      ])
    }

    const countMap = new Map()
    for (const x of propertyCounts) countMap.set(x._id.toString(), (countMap.get(x._id.toString()) || 0) + x.count)
    for (const x of apartmentCounts) countMap.set(x._id.toString(), (countMap.get(x._id.toString()) || 0) + x.count)

    const clients = users.map(u => ({
      ...u,
      propertyCount: countMap.get(u._id.toString()) || 0
    }))

    res.json({ clients, total: clients.length })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}
