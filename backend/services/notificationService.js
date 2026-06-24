import Notification from '../models/Notification.js'
import {
  buildAudienceFilter,
  formatNotificationForUser,
  normalizeUserIds
} from '../utils/notificationHelpers.js'
import { broadcastNotification } from './notificationWebSocket.js'

export { formatNotificationForUser } from '../utils/notificationHelpers.js'

export const createNotification = async (data) => {
  const notification = await Notification.create({
    title: data.title,
    body: data.body || '',
    type: data.type || 'INFO',
    audience: data.audience,
    targetUserIds: normalizeUserIds(data.targetUserIds || []),
    targetRoles: data.targetRoles || [],
    readBy: [],
    payload: data.payload
  })

  broadcastNotification(notification)
  return notification
}

export const notifyUser = async (userId, { title, body, type = 'INFO', audience = 'user', payload } = {}) => {
  return createNotification({
    title,
    body,
    type,
    audience,
    targetUserIds: [userId],
    payload
  })
}

export const notifyUsers = async (userIds, options) => {
  if (!userIds?.length) return null
  return createNotification({
    ...options,
    targetUserIds: userIds
  })
}

export const notifyRole = async (role, { title, body, type = 'INFO', payload } = {}) => {
  return createNotification({
    title,
    body,
    type,
    audience: role,
    targetRoles: [role],
    payload
  })
}

export const markAsRead = async (notificationId, userId) => {
  const userObjectId = normalizeUserIds([userId])[0]
  if (!userObjectId) {
    throw new Error('Invalid user id')
  }

  return Notification.findByIdAndUpdate(
    notificationId,
    { $addToSet: { readBy: userObjectId } },
    { new: true }
  )
}

export const getLatestForUser = async (userId, role, size = 20) => {
  const limit = Math.max(1, Math.min(Number(size) || 20, 200))
  const filter = buildAudienceFilter(userId, role)

  const notifications = await Notification.find(filter)
    .sort({ createdAt: -1 })
    .limit(limit)

  return notifications.map((n) => formatNotificationForUser(n, userId))
}

export const existsByFingerprint = async (type, fingerprint) => {
  if (!fingerprint) return false
  const count = await Notification.countDocuments({
    type,
    'payload.fingerprint': fingerprint
  })
  return count > 0
}
