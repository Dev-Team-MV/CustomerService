import CrmNotificationRead, { CRM_NOTIFICATION_TYPES } from '../models/CrmNotificationRead.js'
import { normalizeUserIds } from '../utils/notificationHelpers.js'

export const buildCrmAlertKey = (alertType, entityId) => `${alertType}:${String(entityId)}`

export const getCrmReadAlertKeysForUser = async (userId) => {
  const userObjectId = normalizeUserIds([userId])[0]
  if (!userObjectId) {
    throw new Error('Invalid user id')
  }

  const records = await CrmNotificationRead.find({ userId: userObjectId }).lean()
  return records.map((record) => buildCrmAlertKey(record.alertType, record.entityId))
}

export const markCrmAlertAsRead = async (userId, alertType, entityId) => {
  const userObjectId = normalizeUserIds([userId])[0]
  if (!userObjectId) {
    throw new Error('Invalid user id')
  }

  if (!CRM_NOTIFICATION_TYPES.includes(alertType)) {
    throw new Error('Invalid CRM alert type')
  }

  return CrmNotificationRead.findOneAndUpdate(
    {
      userId: userObjectId,
      alertType,
      entityId: String(entityId)
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
