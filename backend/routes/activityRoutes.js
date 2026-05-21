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
  deleteActivity,
  addActivitySubtask,
  updateActivitySubtask,
  deleteActivitySubtask,
  addActivityThreadMessage
} from '../controllers/activityController.js'
import { protect, admin } from '../middleware/authMiddleware.js'

const router = express.Router()

/**
 * @swagger
 * /api/activities/columns:
 *   get:
 *     summary: List kanban columns (project board or global board)
 *     tags: [Activities]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: projectId
 *         required: false
 *         schema:
 *           type: string
 *         example: 6650f1a2a47f4b9f7296f1ab
 *         description: Optional. If provided returns that project board; if omitted returns global board.
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
 *                   color: { type: string, example: '#9c27b0' }
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
 *             required: [key, name]
 *             properties:
 *               projectId: { type: string }
 *               key: { type: string, example: blocked }
 *               name: { type: string, example: Bloqueadas }
 *               color: { type: string, example: '#9c27b0' }
 *               order: { type: number, example: 2 }
 *           example:
 *             name: test
 *             key: test
 *             color: '#9c27b0'
 *             order: 1
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
 *               color: { type: string, example: '#9c27b0' }
 *               order: { type: number, example: 2 }
 *           example:
 *             name: En progreso
 *             color: '#9c27b0'
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
 *     summary: Get kanban board grouped by columns (project or global)
 *     tags: [Activities]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: projectId
 *         required: false
 *         schema:
 *           type: string
 *         example: 6650f1a2a47f4b9f7296f1ab
 *         description: Optional. Omit to use global board.
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
 *     summary: List activities (project board or global board)
 *     tags: [Activities]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: projectId
 *         required: false
 *         schema:
 *           type: string
 *         example: 6650f1a2a47f4b9f7296f1ab
 *         description: Optional. Omit to query global board.
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
 *       - in: query
 *         name: relatedProjectId
 *         schema:
 *           type: string
 *         example: 6650f1a2a47f4b9f7296f1ab
 *         description: Optional. Filter activities linked to this project id.
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
 *             required: [title]
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
 *               contact:
 *                 type: object
 *                 properties:
 *                   user: { type: string, description: User ID registrado }
 *                   name: { type: string }
 *                   phone: { type: string }
 *                   email: { type: string }
 *               tags:
 *                 type: array
 *                 items: { type: string }
 *               relatedProjects:
 *                 type: array
 *                 items: { type: string }
 *               projectIds:
 *                 type: array
 *                 description: Alias of relatedProjects
 *                 items: { type: string }
 *               subtasks:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required: [title]
 *                   properties:
 *                     title: { type: string }
 *                     completed: { type: boolean }
 *                     dueDate:
 *                       type: string
 *                       format: date-time
 *                     assignedTo: { type: string }
 *                     contact:
 *                       type: object
 *                       properties:
 *                         user: { type: string }
 *                         name: { type: string }
 *                         phone: { type: string }
 *                         email: { type: string }
 *                     description: { type: string }
 *                     order: { type: number }
 *           example:
 *             title: Confirmar firma de contrato
 *             description: Llamar al cliente y coordinar firma electronica
 *             columnId: 6650f7a7d31d9c9b1e60a021
 *             position: 0
 *             priority: high
 *             dueDate: 2026-05-20T17:00:00.000Z
 *             assignedTo: 6648e3df9a9ed2f35f1234ab
 *             contact:
 *               user: 6648e3df9a9ed2f35f1234ab
 *               name: Carlos Cardona
 *               phone: "+573001112233"
 *               email: carlos@demo.com
 *             tags:
 *               - legal
 *               - onboarding
 *             relatedProjects:
 *               - 6650f1a2a47f4b9f7296f1ab
 *               - 6650f1a2a47f4b9f7296f1ac
 *             subtasks:
 *               - title: Validar documentos del cliente
 *                 description: Revisar cedula y formulario firmado
 *                 completed: false
 *               - title: Coordinar cita con notaria
 *                 description: Ajustar fecha con agenda del cliente
 *                 dueDate: 2026-05-19T16:00:00.000Z
 *                 assignedTo: 6648e3df9a9ed2f35f1234ab
 *                 contact:
 *                   name: Laura Perez
 *                   phone: "+573102223344"
 *                   email: laura@mail.com
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
 *               contact:
 *                 type: object
 *                 properties:
 *                   user: { type: string, description: User ID registrado }
 *                   name: { type: string }
 *                   phone: { type: string }
 *                   email: { type: string }
 *               tags:
 *                 type: array
 *                 items: { type: string }
 *               relatedProjects:
 *                 type: array
 *                 items: { type: string }
 *               projectIds:
 *                 type: array
 *                 description: Alias of relatedProjects
 *                 items: { type: string }
 *               subtasks:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required: [title]
 *                   properties:
 *                     title: { type: string }
 *                     completed: { type: boolean }
 *                     dueDate:
 *                       type: string
 *                       format: date-time
 *                     assignedTo: { type: string }
 *                     contact:
 *                       type: object
 *                       properties:
 *                         user: { type: string }
 *                         name: { type: string }
 *                         phone: { type: string }
 *                         email: { type: string }
 *                     description: { type: string }
 *                     order: { type: number }
 *           example:
 *             title: Confirmar firma con notaria
 *             description: Cliente solicita mover firma para manana
 *             columnId: 6650f7a7d31d9c9b1e60a022
 *             position: 1
 *             priority: urgent
 *             dueDate: 2026-05-21T14:30:00.000Z
 *             assignedTo: 6648e3df9a9ed2f35f1234ab
 *             contact:
 *               name: Contacto externo notaria
 *               phone: "+573209876543"
 *               email: notaria@mail.com
 *             tags:
 *               - legal
 *               - follow-up
 *             relatedProjects:
 *               - 6650f1a2a47f4b9f7296f1ac
 *             subtasks:
 *               - title: Enviar recordatorio por WhatsApp
 *                 description: Mensaje 24h antes de la cita
 *                 completed: true
 *               - title: Cerrar seguimiento
 *                 description: Marcar negocio en CRM
 *                 completed: false
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

/**
 * @swagger
 * /api/activities/{id}/subtasks:
 *   post:
 *     summary: Add subtask to an activity (Admin only)
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
 *             required: [title]
 *             properties:
 *               title: { type: string }
 *               description: { type: string }
 *               completed: { type: boolean }
 *               dueDate:
 *                 type: string
 *                 format: date-time
 *               assignedTo: { type: string }
 *               contact:
 *                 type: object
 *                 properties:
 *                   user: { type: string, description: User ID registrado }
 *                   name: { type: string }
 *                   phone: { type: string }
 *                   email: { type: string }
 *           example:
 *             title: Confirmar disponibilidad del cliente
 *             description: Llamar y definir horario final
 *             dueDate: 2026-05-21T14:00:00.000Z
 *             assignedTo: 6648e3df9a9ed2f35f1234ab
 *             contact:
 *               user: 6648e3df9a9ed2f35f1234ab
 *               name: Carlos Cardona
 *               phone: "+573001112233"
 *               email: carlos@demo.com
 *     responses:
 *       201:
 *         description: Subtask added
 */
router.post('/:id/subtasks', protect, admin, addActivitySubtask)

/**
 * @swagger
 * /api/activities/{id}/subtasks/{subtaskId}:
 *   put:
 *     summary: Update subtask (Admin only)
 *     tags: [Activities]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: subtaskId
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
 *               completed: { type: boolean }
 *               dueDate:
 *                 type: string
 *                 format: date-time
 *               assignedTo: { type: string }
 *               contact:
 *                 type: object
 *                 properties:
 *                   user: { type: string, description: User ID registrado }
 *                   name: { type: string }
 *                   phone: { type: string }
 *                   email: { type: string }
 *               order: { type: number }
 *           example:
 *             completed: true
 *             title: Cliente confirmado por llamada
 *             description: Cliente acepta firma el viernes
 *             contact:
 *               name: Cliente alterno
 *               phone: "+573188887777"
 *               email: cliente@mail.com
 *     responses:
 *       200:
 *         description: Subtask updated
 *   delete:
 *     summary: Delete subtask (Admin only)
 *     tags: [Activities]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: subtaskId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Subtask deleted
 */
router.put('/:id/subtasks/:subtaskId', protect, admin, updateActivitySubtask)
router.delete('/:id/subtasks/:subtaskId', protect, admin, deleteActivitySubtask)

/**
 * @swagger
 * /api/activities/{id}/threads:
 *   post:
 *     summary: Add message to activity thread (authenticated users)
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
 *             required: [message]
 *             properties:
 *               message: { type: string }
 *           example:
 *             message: Cliente disponible el viernes a las 4pm para firma.
 *     responses:
 *       201:
 *         description: Thread message added
 */
router.post('/:id/threads', protect, addActivityThreadMessage)

export default router
