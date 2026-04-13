import express from 'express'
import {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  searchUsers,
  getMyProjects
} from '../controllers/userController.js'
import { sendSetupPasswordLink } from '../controllers/authController.js'
import { protect, admin } from '../middleware/authMiddleware.js'

const router = express.Router()

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users (Admin only)
 *     description: Returns users enriched with `projects` (derived from properties/apartments/memberships). Optional filters by role and projectId.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: role
 *         schema: { type: string, enum: [superadmin, admin, user] }
 *       - in: query
 *         name: projectId
 *         schema: { type: string }
 *         description: Only users related to this project (P1/P2) are returned
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
 *     description: Any authenticated user. Requires projectId to return only users related to that project. With q (min 2 chars) searches by email/name; without q returns up to 100 users for dropdowns.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: projectId
 *         required: true
 *         schema: { type: string }
 *         description: Project ID used to isolate results by project.
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
 * /api/users/me/projects:
 *   get:
 *     summary: Proyectos accesibles para el usuario actual
 *     description: |
 *       - **user (residente):** proyectos donde tiene Property o Apartment visible (dueño/share) o entradas en `projectMemberships`.
 *       - **admin / superadmin:** todos los proyectos (selector de gestión).
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de proyectos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MyProjectsResponse'
 *       401:
 *         description: No autorizado
 */
router.get('/me/projects', protect, getMyProjects)

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
 * Admin only. Resends SMS con enlace para establecer contraseña.
 * Body opcional: { "projectId": "<ObjectId>" } — valida que el proyecto exista; la URL del enlace se elige por proyecto (slug o Project.frontendBaseUrl).
 * Si el usuario aún no tiene membresía explícita en `projectMemberships`, se agrega automáticamente.
 * Sin projectId se usa FRONTEND_URL del servidor.
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
