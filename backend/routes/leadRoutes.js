import express from 'express'
import {
  getLeads,
  createLead,
  updateLead,
  updateLeadStage,
  deleteLead,
  convertLead
} from '../controllers/leadController.js'
import { protect, superadmin } from '../middleware/authMiddleware.js'

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
router.post('/', createLead)

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
router.put('/:id/stage', updateLeadStage)

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
router.put('/:id', updateLead)
router.delete('/:id', deleteLead)

/**
 * @swagger
 * /api/crm/leads/{id}/convert:
 *   post:
 *     summary: Convert lead to User and send setup-password SMS
 *     tags: [CRM Leads]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       201:
 *         description: Lead converted to client user
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CrmLeadConvertResponse'
 *       400:
 *         description: Lead already converted, or missing email/phone, or user exists
 *       404:
 *         description: Lead not found
 */
router.post('/:id/convert', convertLead)

export default router
