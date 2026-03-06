import express from 'express'
import {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  searchUsers
} from '../controllers/userController.js'
import { sendSetupPasswordLink } from '../controllers/authController.js'
import { protect, admin } from '../middleware/authMiddleware.js'

const router = express.Router()

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 */
router.route('/').get(protect, admin, getAllUsers)

/**
 * @swagger
 * /api/users/search:
 *   get:
 *     summary: Search users (for adding to family groups, etc.)
 *     description: Any authenticated user. With q (min 2 chars) searches by email/name; without q returns up to 100 users for dropdowns.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         schema: { type: string }
 *         description: Search term (optional; if provided, min 2 chars for search)
 *     responses:
 *       200:
 *         description: Array of users { _id, firstName, lastName, email }
 */
router.get('/search', protect, searchUsers)

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Get user by ID
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found
 *   put:
 *     summary: Update user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               email:
 *                 type: string
 *               phoneNumber:
 *                 type: string
 *               birthday:
 *                 type: string
 *                 format: date
 *     responses:
 *       200:
 *         description: User updated
 *       404:
 *         description: User not found
 *   delete:
 *     summary: Delete user (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User deleted
 *       404:
 *         description: User not found
 */
/**
 * POST /api/users/:id/send-password-sms
 * Admin only. Resends SMS to user with link to set password.
 */
router.post('/:id/send-password-sms', protect, admin, (req, res, next) => {
  req.body = { ...req.body, userId: req.params.id }
  return sendSetupPasswordLink(req, res, next)
})
router.route('/:id')
  .get(protect, getUserById)
  .put(protect, updateUser)
  .delete(protect, admin, deleteUser)

export default router
