import mongoose from 'mongoose'
import { getProjectIdsForUser } from './projectAccess.js'

const GLOBAL_ROLES = ['admin', 'superadmin', 'owner']

const toObjectId = (id) => {
  if (!id) return null
  const str = String(id)
  if (!mongoose.Types.ObjectId.isValid(str)) return null
  return new mongoose.Types.ObjectId(str)
}

export const normalizeUserIds = (ids = []) => {
  const unique = new Set()
  for (const id of ids) {
    const objectId = toObjectId(id)
    if (objectId) unique.add(objectId.toString())
  }
  return [...unique].map((id) => new mongoose.Types.ObjectId(id))
}

const emptyTargetUserIdsFilter = {
  $or: [
    { targetUserIds: { $exists: false } },
    { targetUserIds: { $size: 0 } }
  ]
}

export const buildAudienceFilter = (userId, role) => {
  const userObjectId = toObjectId(userId)
  if (!userObjectId) {
    return { _id: null }
  }

  const personal = { targetUserIds: userObjectId }

  if (!role) {
    return personal
  }

  const roleBroadcast = {
    $and: [
      emptyTargetUserIdsFilter,
      {
        $or: [
          { targetRoles: role },
          { audience: role }
        ]
      }
    ]
  }

  return { $or: [personal, roleBroadcast] }
}

const noProjectClause = {
  $and: [
    {
      $or: [
        { projectId: { $exists: false } },
        { projectId: null }
      ]
    },
    {
      $or: [
        { 'payload.projectId': { $exists: false } },
        { 'payload.projectId': null }
      ]
    }
  ]
}

const projectInClause = (projectIds) => ({
  $or: [
    { projectId: { $in: projectIds } },
    { 'payload.projectId': { $in: projectIds } }
  ]
})

export const getNotificationProjectId = (notification) => {
  const doc = notification.toObject ? notification.toObject() : notification
  return doc.projectId || doc.payload?.projectId || null
}

export const buildProjectFilter = async (userId, role) => {
  if (GLOBAL_ROLES.includes(role)) {
    return null
  }

  const projectIds = await getProjectIdsForUser(userId)
  if (!projectIds.length) {
    return noProjectClause
  }

  return {
    $or: [
      noProjectClause,
      projectInClause(projectIds)
    ]
  }
}

export const notificationMatchesProject = async (notification, userId, role) => {
  if (GLOBAL_ROLES.includes(role)) {
    return true
  }

  const projectId = getNotificationProjectId(notification)
  if (!projectId) {
    return true
  }

  const projectIds = await getProjectIdsForUser(userId)
  return projectIds.some((id) => String(id) === String(projectId))
}

export const formatNotificationForUser = (notification, userId) => {
  const doc = notification.toObject ? notification.toObject() : { ...notification }
  const uid = String(userId)
  const read = (doc.readBy || []).some((id) => String(id) === uid)

  return {
    id: doc._id,
    _id: doc._id,
    title: doc.title,
    body: doc.body || '',
    description: doc.body || '',
    type: doc.type,
    audience: doc.audience,
    targetUserIds: doc.targetUserIds,
    targetRoles: doc.targetRoles,
    readBy: doc.readBy,
    read,
    projectId: doc.projectId || doc.payload?.projectId || null,
    payload: doc.payload,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt
  }
}

export const shouldDeliverToUser = (notification, userId, role) => {
  const uid = String(userId)
  const targetUserIds = (notification.targetUserIds || []).map((id) => String(id))

  if (targetUserIds.includes(uid)) return true

  // Role-wide notifications only when not addressed to specific users
  if (targetUserIds.length > 0) return false

  if (role && (notification.targetRoles || []).includes(role)) return true
  if (role && notification.audience === role) return true
  return false
}
