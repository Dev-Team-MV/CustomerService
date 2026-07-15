import express from 'express'
import {
  calculateCommissionPreview,
  createCommission,
  getCommissions,
  getCommissionById,
  updateCommission,
  deleteCommission,
  approveCommission,
  markCommissionPaid,
  getAgentCommissionSummary,
  getProjectCommissionReport
} from '../controllers/commissionController.js'
import { protect, admin } from '../middleware/authMiddleware.js'

const router = express.Router()

router.use(protect, admin)

/**
 * @swagger
 * /api/commissions/calculate:
 *   post:
 *     summary: Preview commission calculation (tiered/flat/percentage + splits + bonuses)
 *     tags: [Commissions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CommissionCalculateRequest'
 *     responses:
 *       200:
 *         description: Calculation result
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CommissionCalculateResult'
 */
router.post('/calculate', calculateCommissionPreview)

/**
 * @swagger
 * /api/commissions/agents/{agentId}/summary:
 *   get:
 *     summary: Agent commission summary for a date range
 *     tags: [Commissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: agentId
 *         required: true
 *         schema: { type: string }
 *       - in: query
 *         name: from
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: to
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: projectId
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Summary totals by status
 */
router.get('/agents/:agentId/summary', getAgentCommissionSummary)

/**
 * @swagger
 * /api/commissions/projects/{projectId}/report:
 *   get:
 *     summary: Project commission report
 *     tags: [Commissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema: { type: string }
 *       - in: query
 *         name: from
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: to
 *         schema: { type: string, format: date }
 *     responses:
 *       200:
 *         description: Aggregated report
 */
router.get('/projects/:projectId/report', getProjectCommissionReport)

/**
 * @swagger
 * /api/commissions:
 *   get:
 *     summary: List commissions
 *     tags: [Commissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: projectId
 *         schema: { type: string }
 *       - in: query
 *         name: agentId
 *         schema: { type: string }
 *       - in: query
 *         name: leadId
 *         schema: { type: string }
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, approved, paid, disputed]
 *       - in: query
 *         name: from
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: to
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *     responses:
 *       200:
 *         description: Paginated commission list
 *   post:
 *     summary: Create a commission
 *     tags: [Commissions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CommissionCreate'
 *     responses:
 *       201:
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Commission'
 */
router.get('/', getCommissions)
router.post('/', createCommission)

/**
 * @swagger
 * /api/commissions/{id}:
 *   get:
 *     summary: Get commission by id
 *     tags: [Commissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Commission
 *       404:
 *         description: Not found
 *   put:
 *     summary: Update a commission
 *     tags: [Commissions]
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
 *             $ref: '#/components/schemas/CommissionUpdate'
 *     responses:
 *       200:
 *         description: Updated
 *   delete:
 *     summary: Delete a commission (not paid)
 *     tags: [Commissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Deleted
 */
router.get('/:id', getCommissionById)
router.put('/:id', updateCommission)
router.delete('/:id', deleteCommission)

/**
 * @swagger
 * /api/commissions/{id}/approve:
 *   post:
 *     summary: Approve a pending or disputed commission
 *     tags: [Commissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Approved
 *       400:
 *         description: Invalid status transition
 */
router.post('/:id/approve', approveCommission)

/**
 * @swagger
 * /api/commissions/{id}/mark-paid:
 *   post:
 *     summary: Mark an approved commission as paid
 *     tags: [Commissions]
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
 *               paidAt:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Marked paid
 *       400:
 *         description: Must be approved first
 */
router.post('/:id/mark-paid', markCommissionPaid)

export default router
