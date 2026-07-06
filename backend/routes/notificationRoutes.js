import express from 'express'
import {
  create,
  createForRole,
  createForUser,
  latest,
  markNotificationAsRead,
  wsDocs
} from '../controllers/notificationController.js'
import { protect, admin } from '../middleware/authMiddleware.js'

const router = express.Router()

/**
 * @swagger
 * /api/notifications/latest:
 *   get:
 *     summary: Get latest notifications for the authenticated user
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: size
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: List of notifications
 */
router.get('/latest', protect, latest)

/**
 * @swagger
 * /api/notifications/ws/notifications:
 *   get:
 *     summary: WebSocket documentation endpoint
 *     tags: [Notifications]
 *     responses:
 *       200:
 *         description: WebSocket connection info
 */
router.get('/ws/notifications', wsDocs)

/**
 * @swagger
 * /api/notifications/{notificationId}/read:
 *   post:
 *     summary: Mark a notification as read
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 */
router.post('/:notificationId/read', protect, markNotificationAsRead)

/**
 * @swagger
 * /api/notifications/role/{role}:
 *   post:
 *     summary: Create a notification for a role
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 */
router.post('/role/:role', protect, admin, createForRole)

/**
 * @swagger
 * /api/notifications/user/{userId}:
 *   post:
 *     summary: Create a notification for a user
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 */
router.post('/user/:userId', protect, admin, createForUser)

/**
 * @swagger
 * /api/notifications:
 *   post:
 *     summary: Create a notification
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 */
router.post('/', protect, admin, create)

export default router
