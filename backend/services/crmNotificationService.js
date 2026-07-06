import CrmNotificationRead, { CRM_NOTIFICATION_TYPES } from '../models/CrmNotificationRead.js'
import { normalizeUserIds } from '../utils/notificationHelpers.js'

export { CRM_NOTIFICATION_TYPES }

export const normalizeCrmAlertEntityId = (alertType, entityId) => {
  const id = String(entityId || '')
  const prefix = `${alertType}:`
  return id.startsWith(prefix) ? id.slice(prefix.length) : id
}

export const buildCrmAlertKey = (alertType, entityId) => `${alertType}:${String(entityId)}`

export const getCrmReadAlertKeysForUser = async (userId) => {
  const userObjectId = normalizeUserIds([userId])[0]
  if (!userObjectId) {
    throw new Error('Invalid user id')
  }

  const records = await CrmNotificationRead.find({ userId: userObjectId }).lean()
  return records.map((record) => buildCrmAlertKey(record.alertType, normalizeCrmAlertEntityId(record.alertType, record.entityId)))
}

export const markCrmAlertAsRead = async (userId, alertType, entityId) => {
  const userObjectId = normalizeUserIds([userId])[0]
  if (!userObjectId) {
    throw new Error('Invalid user id')
  }

  if (!CRM_NOTIFICATION_TYPES.includes(alertType)) {
    throw new Error('Invalid CRM alert type')
  }

  const normalizedEntityId = normalizeCrmAlertEntityId(alertType, entityId)

  return CrmNotificationRead.findOneAndUpdate(
    {
      userId: userObjectId,
      alertType,
      entityId: normalizedEntityId
    },
    {
      $setOnInsert: {
        readAt: new Date()
      }
    },
    {
      new: true,
      upsert: true
    }
  )
}
