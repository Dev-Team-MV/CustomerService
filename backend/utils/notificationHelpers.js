import mongoose from 'mongoose'

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

export const buildAudienceFilter = (userId, role) => {
  const userObjectId = toObjectId(userId)
  if (!userObjectId) {
    return { _id: null }
  }

  const orConditions = [
    { targetUserIds: userObjectId }
  ]

  if (role) {
    orConditions.push({ targetRoles: role })
    orConditions.push({ audience: role })
  }

  return { $or: orConditions }
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
    payload: doc.payload,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt
  }
}

export const shouldDeliverToUser = (notification, userId, role) => {
  const uid = String(userId)
  const targetUserIds = (notification.targetUserIds || []).map((id) => String(id))

  if (targetUserIds.includes(uid)) return true
  if (role && (notification.targetRoles || []).includes(role)) return true
  if (role && notification.audience === role) return true
  return false
}
