import express from 'express'
import {
  getAutomations,
  getAutomationById,
  createAutomation,
  updateAutomation,
  deleteAutomation,
  testAutomation
} from '../controllers/automationController.js'
import { protect, superadmin } from '../middleware/authMiddleware.js'

const router = express.Router()

router.use(protect, superadmin)

/**
 * @swagger
 * /api/crm/automations:
 *   get:
 *     summary: List CRM automation rules
 *     tags: [CRM Automations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: trigger
 *         schema:
 *           type: string
 *           enum: [lead_stage_changed, payment_overdue, appointment_created, inactivity_7days]
 *       - in: query
 *         name: isActive
 *         schema: { type: boolean }
 *     responses:
 *       200:
 *         description: Automation list
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 automations:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Automation'
 *                 total:
 *                   type: integer
 *   post:
 *     summary: Create CRM automation rule
 *     tags: [CRM Automations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AutomationCreateRequest'
 *     responses:
 *       201:
 *         description: Automation created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Automation'
 */
router.get('/', getAutomations)
router.post('/', createAutomation)

/**
 * @swagger
 * /api/crm/automations/{id}/test:
 *   post:
 *     summary: Test an automation rule manually
 *     tags: [CRM Automations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AutomationTestRequest'
 *     responses:
 *       200:
 *         description: Test result
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AutomationTestResponse'
 */
router.post('/:id/test', testAutomation)

/**
 * @swagger
 * /api/crm/automations/{id}:
 *   get:
 *     summary: Get automation rule by ID
 *     tags: [CRM Automations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Automation found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Automation'
 *   put:
 *     summary: Update automation rule
 *     tags: [CRM Automations]
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
 *             $ref: '#/components/schemas/AutomationUpdateRequest'
 *     responses:
 *       200:
 *         description: Automation updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Automation'
 *   delete:
 *     summary: Delete automation rule
 *     tags: [CRM Automations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Automation deleted
 */
router.get('/:id', getAutomationById)
router.put('/:id', updateAutomation)
router.delete('/:id', deleteAutomation)

export default router
