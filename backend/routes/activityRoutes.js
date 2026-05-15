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
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string, example: Doing }
 *               order: { type: number, example: 2 }
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
 *       - in: query
 *         name: columnId
 *         schema:
 *           type: string
 *       - in: query
 *         name: assignedTo
 *         schema:
 *           type: string
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [low, medium, high, urgent]
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
 *     responses:
 *       200:
 *         description: Activity moved
 */
router.patch('/:id/move', protect, admin, moveActivity)

export default router
