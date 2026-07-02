import express from 'express'
import { getCrmBalance, getCrmClients } from '../controllers/crmController.js'
import {
  getCrmClientById,
  getCrmClientPayments,
  addCrmClientNote
} from '../controllers/crmClientController.js'
import { getCrmPayments, getCrmPaymentsSummary } from '../controllers/crmPaymentController.js'
import { getCrmAgents, getCrmAgentMetrics } from '../controllers/crmAgentController.js'
import {
  exportCrmClients,
  exportCrmPayments,
  exportCrmLeads
} from '../controllers/reportController.js'
import {
  getCrmNotifications,
  getCrmNotificationsCount,
  markCrmNotificationAsRead
} from '../controllers/crmNotificationController.js'
import { searchCrm } from '../controllers/crmSearchController.js'
import { protect, superadmin } from '../middleware/authMiddleware.js'
import leadRoutes from './leadRoutes.js'
import appointmentRoutes from './appointmentRoutes.js'
import automationRoutes from './automationRoutes.js'

const router = express.Router()

router.use('/leads', leadRoutes)
router.use('/appointments', appointmentRoutes)
router.use('/automations', automationRoutes)

/**
 * @swagger
 * /api/crm/search:
 *   get:
 *     summary: Unified CRM search across clients, leads, activities and projects
 *     tags: [CRM]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema: { type: string, minLength: 2 }
 *       - in: query
 *         name: types
 *         schema: { type: string, example: 'clients,leads,activities,projects' }
 *         description: Comma-separated entity types to search (default all)
 *     responses:
 *       200:
 *         description: Results grouped by type (max 5 per category)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CrmSearchResult'
 */
router.get('/search', protect, superadmin, searchCrm)

/**
 * @swagger
 * /api/crm/agents:
 *   get:
 *     summary: List CRM agents (admin and superadmin users)
 *     tags: [CRM Agents]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Active admin/superadmin users
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CrmAgentsList'
 *       403:
 *         description: Not authorized as superadmin
 */
router.get('/agents', protect, superadmin, getCrmAgents)

/**
 * @swagger
 * /api/crm/agents/{id}/metrics:
 *   get:
 *     summary: Agent performance metrics (leads, activities, clients served)
 *     tags: [CRM Agents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         description: Agent (User) ID
 *     responses:
 *       200:
 *         description: Agent metrics for current month
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CrmAgentMetrics'
 *       404:
 *         description: Agent not found
 */
router.get('/agents/:id/metrics', protect, superadmin, getCrmAgentMetrics)

/**
 * @swagger
 * /api/crm/reports/clients/export:
 *   get:
 *     summary: Export clients report as JSON or CSV
 *     tags: [CRM Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: projectId
 *         schema: { type: string }
 *         description: Optional project filter
 *       - in: query
 *         name: format
 *         schema: { type: string, enum: [json, csv], default: json }
 *     responses:
 *       200:
 *         description: JSON export or CSV file download
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CrmExportResult'
 *           text/csv:
 *             schema:
 *               type: string
 *               format: binary
 */
router.get('/reports/clients/export', protect, superadmin, exportCrmClients)

/**
 * @swagger
 * /api/crm/reports/payments/export:
 *   get:
 *     summary: Export payments in date range as JSON or CSV
 *     tags: [CRM Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: dateFrom
 *         required: true
 *         schema: { type: string, format: date-time }
 *       - in: query
 *         name: dateTo
 *         required: true
 *         schema: { type: string, format: date-time }
 *       - in: query
 *         name: projectId
 *         schema: { type: string }
 *       - in: query
 *         name: format
 *         schema: { type: string, enum: [json, csv], default: json }
 *     responses:
 *       200:
 *         description: JSON export or CSV file download
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CrmExportResult'
 *           text/csv:
 *             schema:
 *               type: string
 *               format: binary
 *       400:
 *         description: dateFrom and dateTo are required
 */
router.get('/reports/payments/export', protect, superadmin, exportCrmPayments)

/**
 * @swagger
 * /api/crm/reports/leads/export:
 *   get:
 *     summary: Export leads report as JSON or CSV
 *     tags: [CRM Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: fromDate
 *         schema: { type: string, format: date-time }
 *       - in: query
 *         name: toDate
 *         schema: { type: string, format: date-time }
 *       - in: query
 *         name: projectId
 *         schema: { type: string }
 *       - in: query
 *         name: stage
 *         schema:
 *           type: string
 *           enum: [nuevo, contactado, visita_agendada, propuesta, vendido, perdido]
 *       - in: query
 *         name: assignedTo
 *         schema: { type: string }
 *         description: Filter by agent user ID
 *       - in: query
 *         name: format
 *         schema: { type: string, enum: [json, csv], default: json }
 *     responses:
 *       200:
 *         description: JSON export or CSV file download
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CrmExportResult'
 *           text/csv:
 *             schema:
 *               type: string
 *               format: binary
 */
router.get('/reports/leads/export', protect, superadmin, exportCrmLeads)

/**
 * @swagger
 * /api/crm/notifications/count:
 *   get:
 *     summary: Total count of active CRM alerts (sidebar badge)
 *     tags: [CRM Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Total alert count computed on-demand
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CrmAlertsCount'
 */
router.get('/notifications/count', protect, superadmin, getCrmNotificationsCount)

/**
 * @swagger
 * /api/crm/notifications/{alertType}/{entityId}/read:
 *   post:
 *     summary: Mark a computed CRM alert as read for the authenticated user
 *     tags: [CRM Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: alertType
 *         required: true
 *         schema:
 *           type: string
 *           enum: [overdue_payment, upcoming_activity, stale_lead]
 *       - in: path
 *         name: entityId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Alert marked as read
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: OK
 *                 message:
 *                   type: string
 *                   example: CRM notification marked as read
 */
router.post('/notifications/:alertType/:entityId/read', protect, superadmin, markCrmNotificationAsRead)

/**
 * @swagger
 * /api/crm/notifications/{alertType}/{entityId}/read/raw:
 *   post:
 *     summary: Mark a computed CRM alert as read using a raw entityId without prefix
 *     tags: [CRM Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: alertType
 *         required: true
 *         schema:
 *           type: string
 *           enum: [overdue_payment, upcoming_activity, stale_lead]
 *       - in: path
 *         name: entityId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Alert marked as read
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: OK
 *                 message:
 *                   type: string
 *                   example: CRM notification marked as read
 */
router.post('/notifications/:alertType/:entityId/read/raw', protect, superadmin, markCrmNotificationAsRead)

/**
 * @swagger
 * /api/crm/notifications:
 *   get:
 *     summary: Active CRM alerts computed on-demand (not persisted)
 *     tags: [CRM Notifications]
 *     security:
 *       - bearerAuth: []
 *     description: |
 *       Returns overdue pending payments, activities due in the next 3 days
 *       assigned to the current user, and stale leads (7+ days without update)
 *       assigned to the current user.
 *     responses:
 *       200:
 *         description: Grouped and flat alert lists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CrmAlerts'
 */
router.get('/notifications', protect, superadmin, getCrmNotifications)

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
