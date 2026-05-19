import express from 'express'
import {
  getActivityColumns,
  createActivityColumn,
  updateActivityColumn,
  deleteActivityColumn,
  getActivities,
  getActivityBoard,
  getActivityById,
  createActivity,
  updateActivity,
  moveActivity,
  deleteActivity
} from '../controllers/activityController.js'
import { protect, admin } from '../middleware/authMiddleware.js'

const router = express.Router()

/**
 * @swagger
 * /api/activities/columns:
 *   get:
 *     summary: List kanban columns for a project (creates defaults if missing)
 *     tags: [Activities]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         example: 6650f1a2a47f4b9f7296f1ab
 *         description: Project ID
 *     responses:
 *       200:
 *         description: Columns for the project
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id: { type: string }
 *                   projectId: { type: string }
 *                   key: { type: string, example: todo }
 *                   name: { type: string, example: Por hacer }
 *                   order: { type: number, example: 1 }
 *       400:
 *         description: Invalid projectId
 *   post:
 *     summary: Create a kanban column (Admin only)
 *     tags: [Activities]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [projectId, key, name]
 *             properties:
 *               projectId: { type: string }
 *               key: { type: string, example: blocked }
 *               name: { type: string, example: Bloqueadas }
 *               order: { type: number, example: 2 }
 *           example:
 *             projectId: 6650f1a2a47f4b9f7296f1ab
 *             key: review
 *             name: En revision
 *             order: 3
 *     responses:
 *       201:
 *         description: Column created
 *       409:
 *         description: Column key already exists
 */
router.get('/columns', protect, getActivityColumns)
router.post('/columns', protect, admin, createActivityColumn)

/**
 * @swagger
 * /api/activities/columns/{id}:
 *   put:
 *     summary: Update column name/order (Admin only)
 *     tags: [Activities]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: 6650f7a7d31d9c9b1e60a021
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string, example: Doing }
 *               order: { type: number, example: 2 }
 *           example:
 *             name: En progreso
 *             order: 2
 *     responses:
 *       200:
 *         description: Column updated
 *       404:
 *         description: Column not found
 *   delete:
 *     summary: Delete a column (Admin only)
 *     tags: [Activities]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: 6650f7a7d31d9c9b1e60a021
 *     responses:
 *       200:
 *         description: Column deleted
 *       409:
 *         description: Cannot delete a column with activities
 */
router.put('/columns/:id', protect, admin, updateActivityColumn)
router.delete('/columns/:id', protect, admin, deleteActivityColumn)

/**
 * @swagger
 * /api/activities/board:
 *   get:
 *     summary: Get kanban board grouped by columns
 *     tags: [Activities]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         example: 6650f1a2a47f4b9f7296f1ab
 *     responses:
 *       200:
 *         description: Board with columns and activities
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 projectId: { type: string }
 *                 columns:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id: { type: string }
 *                       key: { type: string }
 *                       name: { type: string }
 *                       order: { type: number }
 *                       activities:
 *                         type: array
 *                         items:
 *                           type: object
 */
router.get('/board', protect, getActivityBoard)

/**
 * @swagger
 * /api/activities:
 *   get:
 *     summary: List activities by project (optional filters)
 *     tags: [Activities]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         example: 6650f1a2a47f4b9f7296f1ab
 *       - in: query
 *         name: columnId
 *         schema:
 *           type: string
 *         example: 6650f7a7d31d9c9b1e60a021
 *       - in: query
 *         name: assignedTo
 *         schema:
 *           type: string
 *         example: 6648e3df9a9ed2f35f1234ab
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [low, medium, high, urgent]
 *         example: high
 *     responses:
 *       200:
 *         description: Activities list
 *   post:
 *     summary: Create activity (Admin only)
 *     tags: [Activities]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [projectId, title]
 *             properties:
 *               projectId: { type: string }
 *               title: { type: string }
 *               description: { type: string }
 *               columnId: { type: string }
 *               position: { type: number }
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high, urgent]
 *               dueDate:
 *                 type: string
 *                 format: date-time
 *               assignedTo: { type: string }
 *               tags:
 *                 type: array
 *                 items: { type: string }
 *           example:
 *             projectId: 6650f1a2a47f4b9f7296f1ab
 *             title: Confirmar firma de contrato
 *             description: Llamar al cliente y coordinar firma electronica
 *             columnId: 6650f7a7d31d9c9b1e60a021
 *             position: 0
 *             priority: high
 *             dueDate: 2026-05-20T17:00:00.000Z
 *             assignedTo: 6648e3df9a9ed2f35f1234ab
 *             tags:
 *               - legal
 *               - onboarding
 *     responses:
 *       201:
 *         description: Activity created
 */
router
  .route('/')
  .get(protect, getActivities)
  .post(protect, admin, createActivity)

/**
 * @swagger
 * /api/activities/{id}:
 *   get:
 *     summary: Get activity by id
 *     tags: [Activities]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: 6651033f7ab5d67c62d102ef
 *     responses:
 *       200:
 *         description: Activity details
 *       404:
 *         description: Activity not found
 *   put:
 *     summary: Update activity (Admin only)
 *     tags: [Activities]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: 6651033f7ab5d67c62d102ef
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title: { type: string }
 *               description: { type: string }
 *               columnId: { type: string }
 *               position: { type: number }
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high, urgent]
 *               dueDate:
 *                 type: string
 *                 format: date-time
 *               assignedTo: { type: string }
 *               tags:
 *                 type: array
 *                 items: { type: string }
 *           example:
 *             title: Confirmar firma con notaria
 *             description: Cliente solicita mover firma para manana
 *             columnId: 6650f7a7d31d9c9b1e60a022
 *             position: 1
 *             priority: urgent
 *             dueDate: 2026-05-21T14:30:00.000Z
 *             assignedTo: 6648e3df9a9ed2f35f1234ab
 *             tags:
 *               - legal
 *               - follow-up
 *     responses:
 *       200:
 *         description: Activity updated
 *   delete:
 *     summary: Delete activity (Admin only)
 *     tags: [Activities]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: 6651033f7ab5d67c62d102ef
 *     responses:
 *       200:
 *         description: Activity deleted
 */
router
  .route('/:id')
  .get(protect, getActivityById)
  .put(protect, admin, updateActivity)
  .delete(protect, admin, deleteActivity)

/**
 * @swagger
 * /api/activities/{id}/move:
 *   patch:
 *     summary: Move activity between columns/position (Admin only)
 *     tags: [Activities]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: 6651033f7ab5d67c62d102ef
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [columnId]
 *             properties:
 *               columnId: { type: string }
 *               position: { type: number, example: 0 }
 *           example:
 *             columnId: 6650f7a7d31d9c9b1e60a023
 *             position: 0
 *     responses:
 *       200:
 *         description: Activity moved
 */
router.patch('/:id/move', protect, admin, moveActivity)

export default router
