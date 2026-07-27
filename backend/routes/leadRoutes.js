import express from 'express'
import {
  getLeads,
  createLead,
  updateLead,
  updateLeadStage,
  markLeadSmsResponded,
  deleteLead,
  convertLead
} from '../controllers/leadController.js'
import { protect, superadmin } from '../middleware/authMiddleware.js'
import { logAction } from '../middleware/logAction.js'
import { fetchLead } from '../utils/auditEntityFetchers.js'

const router = express.Router()

router.use(protect, superadmin)

/**
 * @swagger
 * /api/crm/leads:
 *   get:
 *     summary: List CRM leads with optional filters (Superadmin only)
 *     tags: [CRM Leads]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: projectId
 *         schema: { type: string }
 *         description: Filter by project
 *       - in: query
 *         name: stage
 *         schema:
 *           type: string
 *           enum: [nuevo, contactado, visita_agendada, propuesta, vendido, perdido]
 *       - in: query
 *         name: assignedTo
 *         schema: { type: string }
 *         description: Filter by assigned user ID
 *       - in: query
 *         name: fromDate
 *         schema: { type: string, format: date-time }
 *         description: Filter leads created on or after this date
 *       - in: query
 *         name: toDate
 *         schema: { type: string, format: date-time }
 *         description: Filter leads created on or before this date
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [score]
 *         description: Sort by lead score (descending) for priority queue
 *     responses:
 *       200:
 *         description: List of leads
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CrmLeadsList'
 *       403:
 *         description: Not authorized as superadmin
 *   post:
 *     summary: Create a new lead (Superadmin only)
 *     tags: [CRM Leads]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CrmLeadCreate'
 *           example:
 *             name: María González
 *             phone: "+15551234567"
 *             email: maria@example.com
 *             source: web
 *             projectId: 664abc111111111111111111
 *             stage: nuevo
 *             assignedTo: 664def111111111111111111
 *             notes: Interesada en lote frente al lago
 *     responses:
 *       201:
 *         description: Lead created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Lead'
 *       400:
 *         description: Validation error
 *       403:
 *         description: Not authorized as superadmin
 */
router.get('/', getLeads)
router.post(
  '/',
  logAction({
    action: 'created',
    entity: 'Lead',
    getEntityId: (_, body) => body?._id
  }),
  createLead
)

/**
 * @swagger
 * /api/crm/leads/{id}/stage:
 *   put:
 *     summary: Move lead to a pipeline stage (Kanban drag & drop)
 *     tags: [CRM Leads]
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
 *             type: object
 *             required: [stage]
 *             properties:
 *               stage:
 *                 type: string
 *                 enum: [nuevo, contactado, visita_agendada, propuesta, vendido, perdido]
 *               lostReason:
 *                 type: string
 *                 description: Optional reason when stage is perdido
 *           example:
 *             stage: visita_agendada
 *     responses:
 *       200:
 *         description: Lead stage updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Lead'
 *       400:
 *         description: Invalid stage
 *       404:
 *         description: Lead not found
 */
router.put(
  '/:id/stage',
  logAction({
    action: 'stage_changed',
    entity: 'Lead',
    fetchBefore: fetchLead,
    buildAfter: (_, body) => ({ stage: body?.stage, lostReason: body?.lostReason })
  }),
  updateLeadStage
)

/**
 * @swagger
 * /api/crm/leads/{id}/sms-responded:
 *   put:
 *     summary: Mark whether a lead responded to SMS (recalculates score)
 *     tags: [CRM Leads]
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
 *             $ref: '#/components/schemas/CrmLeadSmsRespondedRequest'
 *           example:
 *             smsResponded: true
 *     responses:
 *       200:
 *         description: Lead updated with new score
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Lead'
 *       400:
 *         description: smsResponded must be a boolean
 *       404:
 *         description: Lead not found
 */
router.put('/:id/sms-responded', markLeadSmsResponded)

/**
 * @swagger
 * /api/crm/leads/{id}:
 *   put:
 *     summary: Update a lead (including stage change)
 *     tags: [CRM Leads]
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
 *             $ref: '#/components/schemas/CrmLeadUpdate'
 *     responses:
 *       200:
 *         description: Lead updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Lead'
 *       404:
 *         description: Lead not found
 *   delete:
 *     summary: Delete a lead
 *     tags: [CRM Leads]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Lead deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string, example: Lead deleted }
 *       404:
 *         description: Lead not found
 */
router.put(
  '/:id',
  logAction({ action: 'updated', entity: 'Lead', fetchBefore: fetchLead }),
  updateLead
)
router.delete(
  '/:id',
  logAction({
    action: 'deleted',
    entity: 'Lead',
    fetchBefore: fetchLead,
    buildAfter: () => null
  }),
  deleteLead
)

/**
 * @swagger
 * /api/crm/leads/{id}/convert:
 *   post:
 *     summary: Convert lead to User, send setup SMS, and optionally create pending Commission
 *     tags: [CRM Leads]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               saleAmount:
 *                 type: number
 *                 description: If provided (and lead has assignedTo + projectId), creates a pending Commission
 *               structureId:
 *                 type: string
 *               overrideRate:
 *                 type: number
 *               overrideAmount:
 *                 type: number
 *               splits:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     agentId: { type: string }
 *                     percentage: { type: number }
 *               propertyId:
 *                 type: string
 *               commissionNotes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Lead converted to client user (commission included when saleAmount provided)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CrmLeadConvertResponse'
 *       400:
 *         description: Lead already converted, or missing email/phone, or user exists
 *       404:
 *         description: Lead not found
 */
router.post(
  '/:id/convert',
  logAction({
    action: 'updated',
    entity: 'Lead',
    fetchBefore: fetchLead,
    getEntityId: (req, body) => body?.lead?._id || req.params.id
  }),
  convertLead
)

export default router
