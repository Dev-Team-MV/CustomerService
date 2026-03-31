import mongoose from 'mongoose'
import Property from '../models/Property.js'
import Apartment from '../models/Apartment.js'
import User from '../models/User.js'
import { getVisiblePropertyIdsForUser, getVisibleApartmentIdsForUser } from './propertyVisibility.js'

function sameId(a, b) {
  const sa = a != null && a.toString ? a.toString() : String(a)
  const sb = b != null && b.toString ? b.toString() : String(b)
  return sa === sb
}

/**
 * IDs de proyecto en los que el usuario tiene presencia como residente:
 * - Propiedades visibles (dueño / share / grupo)
 * - Apartamentos visibles → edificio → proyecto
 * - Membresías explícitas en user.projectMemberships (opcional)
 *
 * No incluye rol admin: para UI de “mis proyectos” del residente.
 *
 * @param {mongoose.Types.ObjectId|string} userId
 * @returns {Promise<mongoose.Types.ObjectId[]>}
 */
export async function getProjectIdsForUser(userId) {
  const [propIds, aptIds] = await Promise.all([
    getVisiblePropertyIdsForUser(userId),
    getVisibleApartmentIdsForUser(userId)
  ])

  const [projectsFromProps, aptDocs] = await Promise.all([
    propIds.length
      ? Property.find({ _id: { $in: propIds } }).distinct('project')
      : [],
    aptIds.length
      ? Apartment.find({ _id: { $in: aptIds } })
        .select('building')
        .populate('building', 'project')
      : []
  ])

  const set = new Set()
  for (const p of projectsFromProps) {
    if (p) set.add(p.toString())
  }
  for (const a of aptDocs) {
    const proj = a.building?.project
    if (proj) set.add(proj.toString())
  }

  const userDoc = await User.findById(userId).select('projectMemberships').lean()
  for (const m of userDoc?.projectMemberships || []) {
    if (m?.project) set.add(m.project.toString())
  }

  return Array.from(set).map((id) => new mongoose.Types.ObjectId(id))
}

/**
 * ¿Puede el usuario operar en este proyecto?
 * - admin / superadmin: sí (gestión global)
 * - user: sí si tiene al menos un vínculo (propiedad/apartamento visible o projectMemberships)
 *
 * @param {mongoose.Types.ObjectId|string} userId
 * @param {mongoose.Types.ObjectId|string|null|undefined} projectId
 * @param {{ role?: string }} [options] rol del usuario (req.user.role)
 * @returns {Promise<boolean>}
 */
export async function canUserAccessProject(userId, projectId, options = {}) {
  const { role } = options
  if (role === 'admin' || role === 'superadmin') {
    return true
  }
  if (projectId == null || projectId === '') {
    return false
  }
  const ids = await getProjectIdsForUser(userId)
  return ids.some((id) => sameId(id, projectId))
}
