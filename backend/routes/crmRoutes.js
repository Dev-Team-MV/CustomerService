import express from 'express'
import { getCrmBalance, getCrmClients } from '../controllers/crmController.js'
import {
  getCrmClientById,
  getCrmClientPayments,
  addCrmClientNote
} from '../controllers/crmClientController.js'
import { getCrmPayments, getCrmPaymentsSummary } from '../controllers/crmPaymentController.js'
import { protect, superadmin } from '../middleware/authMiddleware.js'
import leadRoutes from './leadRoutes.js'

const router = express.Router()

router.use('/leads', leadRoutes)

/**
 * @swagger
 * /api/crm/balance:
 *   get:
 *     summary: Get consolidated balance by project and global (Superadmin only)
 *     tags: [CRM]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Balance by project and global totals (totalCollected from signed payloads, totalPending from properties)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CrmBalance'
 *       403:
 *         description: Not authorized as superadmin
 */
router.get('/balance', protect, superadmin, getCrmBalance)

/**
 * @swagger
 * /api/crm/payments/summary:
 *   get:
 *     summary: Payment totals grouped by project and current month (Superadmin only)
 *     tags: [CRM Payments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Pending, overdue and current-month collection summary
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CrmPaymentsSummary'
 *       403:
 *         description: Not authorized as superadmin
 */
router.get('/payments/summary', protect, superadmin, getCrmPaymentsSummary)

/**
 * @swagger
 * /api/crm/payments:
 *   get:
 *     summary: List payments across all projects with filters (Superadmin only)
 *     tags: [CRM Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: projectId
 *         schema: { type: string }
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, signed, overdue]
 *         description: overdue = date in the past and status is not signed
 *       - in: query
 *         name: dateFrom
 *         schema: { type: string, format: date-time }
 *       - in: query
 *         name: dateTo
 *         schema: { type: string, format: date-time }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20, maximum: 100 }
 *     responses:
 *       200:
 *         description: Paginated payments enriched with client and unit info
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CrmPaymentsPaginated'
 *       403:
 *         description: Not authorized as superadmin
 */
router.get('/payments', protect, superadmin, getCrmPayments)

/**
 * @swagger
 * /api/crm/clients:
 *   get:
 *     summary: Get unique clients (owners) across projects (Superadmin only)
 *     tags: [CRM]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: projectId
 *         schema:
 *           type: string
 *         description: Optional. Filter clients that own at least one property in this project.
 *     responses:
 *       200:
 *         description: List of unique clients with property count
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CrmClients'
 *       403:
 *         description: Not authorized as superadmin
 */
router.get('/clients', protect, superadmin, getCrmClients)

/**
 * @swagger
 * /api/crm/clients/{id}/payments:
 *   get:
 *     summary: Paginated payments for a specific client (Superadmin only)
 *     tags: [CRM Clients]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         description: Client (User) ID
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, signed, rejected]
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20, maximum: 100 }
 *     responses:
 *       200:
 *         description: Client payments
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CrmPaymentsPaginated'
 *       404:
 *         description: Client not found
 */
router.get('/clients/:id/payments', protect, superadmin, getCrmClientPayments)

/**
 * @swagger
 * /api/crm/clients/{id}/notes:
 *   post:
 *     summary: Add an internal note for a client (creates Activity with tag nota)
 *     tags: [CRM Clients]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         description: Client (User) ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CrmClientNoteCreate'
 *           example:
 *             text: Cliente muy interesado en upgrade de fachada
 *             title: Seguimiento
 *             projectId: 664abc111111111111111111
 *     responses:
 *       201:
 *         description: Note activity created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Activity'
 *       400:
 *         description: text is required
 *       404:
 *         description: Client not found
 */
router.post('/clients/:id/notes', protect, superadmin, addCrmClientNote)

/**
 * @swagger
 * /api/crm/clients/{id}:
 *   get:
 *     summary: Full client detail — profile, properties, payments, activities, SMS, notes
 *     tags: [CRM Clients]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         description: Client (User) ID
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *         description: Payments page
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *         description: Payments page size
 *       - in: query
 *         name: paymentStatus
 *         schema:
 *           type: string
 *           enum: [pending, signed, rejected]
 *       - in: query
 *         name: activitiesPage
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: activitiesLimit
 *         schema: { type: integer, default: 20 }
 *       - in: query
 *         name: smsPage
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: smsLimit
 *         schema: { type: integer, default: 10 }
 *       - in: query
 *         name: notesPage
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: notesLimit
 *         schema: { type: integer, default: 20 }
 *     responses:
 *       200:
 *         description: Client detail with paginated sections
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CrmClientDetail'
 *       404:
 *         description: Client not found
 */
router.get('/clients/:id', protect, superadmin, getCrmClientById)

export default router
