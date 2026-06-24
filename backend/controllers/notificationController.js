import {
  createNotification,
  formatNotificationForUser,
  getLatestForUser,
  markAsRead
} from '../services/notificationService.js'
import { USER_ROLES } from '../models/Notification.js'

export const create = async (req, res) => {
  try {
    const { title, body, type, audience, targetUserIds, targetRoles, payload } = req.body

    if (!title?.trim()) {
      return res.status(400).json({ message: 'Title is required' })
    }

    const notification = await createNotification({
      title: title.trim(),
      body,
      type,
      audience,
      targetUserIds,
      targetRoles,
      payload
    })

    res.status(201).json(formatNotificationForUser(notification, req.user._id))
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const createForRole = async (req, res) => {
  try {
    const { role } = req.params
    if (!USER_ROLES.includes(role)) {
      return res.status(400).json({ message: 'Invalid role' })
    }

    const { title, body, type = 'INFO', payload } = req.body
    if (!title?.trim()) {
      return res.status(400).json({ message: 'Title is required' })
    }

    const notification = await createNotification({
      title: title.trim(),
      body,
      type,
      audience: role,
      targetRoles: [role],
      payload
    })

    res.status(201).json(formatNotificationForUser(notification, req.user._id))
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const createForUser = async (req, res) => {
  try {
    const { userId } = req.params
    const { title, body, type = 'INFO', audience = 'user', payload } = req.body

    if (!title?.trim()) {
      return res.status(400).json({ message: 'Title is required' })
    }

    const notification = await createNotification({
      title: title.trim(),
      body,
      type,
      audience,
      targetUserIds: [userId],
      payload
    })

    res.status(201).json(formatNotificationForUser(notification, req.user._id))
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const latest = async (req, res) => {
  try {
    const size = req.query.size
    const notifications = await getLatestForUser(req.user._id, req.user.role, size)

    res.json({
      status: 'OK',
      message: 'Notifications retrieved successfully',
      data: notifications
    })
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: error.message,
      data: []
    })
  }
}

export const markNotificationAsRead = async (req, res) => {
  try {
    const userId = req.query.userId || req.user._id
    const notification = await markAsRead(req.params.notificationId, userId)

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' })
    }

    res.json({
      status: 'OK',
      message: 'Notification marked as read'
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const wsDocs = (_req, res) => {
  res.json({
    message: 'WebSocket at /ws/notifications (Authorization: Bearer <jwt> or ?token=<jwt>)'
  })
}
