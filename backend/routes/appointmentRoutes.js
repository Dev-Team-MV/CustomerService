import express from 'express'
import {
  getAppointments,
  createAppointment,
  updateAppointment,
  updateAppointmentStatus,
  deleteAppointment
} from '../controllers/appointmentController.js'
import { protect, superadmin } from '../middleware/authMiddleware.js'

const router = express.Router()

router.use(protect, superadmin)

/**
 * @swagger
 * /api/crm/appointments:
 *   get:
 *     summary: List CRM appointments
 *     tags: [CRM Appointments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: assignedTo
 *         schema: { type: string }
 *         description: Filter by assigned advisor user ID
 *       - in: query
 *         name: projectId
 *         schema: { type: string }
 *         description: Filter by project ID
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pendiente, confirmada, completada, cancelada]
 *       - in: query
 *         name: dateFrom
 *         schema: { type: string, format: date-time }
 *       - in: query
 *         name: dateTo
 *         schema: { type: string, format: date-time }
 *     responses:
 *       200:
 *         description: List of appointments
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 appointments:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Appointment'
 *                 total:
 *                   type: integer
 *   post:
 *     summary: Create a CRM appointment
 *     tags: [CRM Appointments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AppointmentCreateRequest'
 *     responses:
 *       201:
 *         description: Appointment created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Appointment'
 *       400:
 *         description: Invalid payload
 * */
router.get('/', getAppointments)
router.post('/', createAppointment)

/**
 * @swagger
 * /api/crm/appointments/{id}/status:
 *   put:
 *     summary: Update appointment status
 *     tags: [CRM Appointments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AppointmentStatusUpdateRequest'
 *     responses:
 *       200:
 *         description: Appointment status updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Appointment'
 * */
router.put('/:id/status', updateAppointmentStatus)

/**
 * @swagger
 * /api/crm/appointments/{id}:
 *   put:
 *     summary: Update an appointment
 *     tags: [CRM Appointments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AppointmentUpdateRequest'
 *     responses:
 *       200:
 *         description: Appointment updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Appointment'
 *   delete:
 *     summary: Delete an appointment
 *     tags: [CRM Appointments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Appointment deleted
 */
router.put('/:id', updateAppointment)
router.delete('/:id', deleteAppointment)

export default router
