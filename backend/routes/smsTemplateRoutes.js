import express from 'express'
import {
  getAllSMSTemplates,
  getSMSTemplateById,
  createSMSTemplate,
  updateSMSTemplate,
  deleteSMSTemplate
} from '../controllers/smsTemplateController.js'
import { protect, admin } from '../middleware/authMiddleware.js'

const router = express.Router()

/**
 * @swagger
 * /api/sms-templates:
 *   get:
 *     summary: Get SMS templates (Admin only)
 *     tags: [SMS Templates]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter templates by category
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filter templates by active status
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by name, description or template content
 *     responses:
 *       200:
 *         description: List of SMS templates
 *   post:
 *     summary: Create SMS template (Admin only)
 *     tags: [SMS Templates]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - template
 *             properties:
 *               name:
 *                 type: string
 *                 example: Payment reminder
 *               description:
 *                 type: string
 *                 example: Reminder before payment due date
 *               category:
 *                 type: string
 *                 example: payments
 *               template:
 *                 type: string
 *                 example: "Hola {{name}}, tu pago de {{amount}} vence el {{dueDate}}."
 *               isActive:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       201:
 *         description: SMS template created
 *       400:
 *         description: Validation error
 */
router
  .route('/')
  .get(protect, admin, getAllSMSTemplates)
  .post(protect, admin, createSMSTemplate)

/**
 * @swagger
 * /api/sms-templates/{id}:
 *   get:
 *     summary: Get SMS template by ID (Admin only)
 *     tags: [SMS Templates]
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
 *         description: SMS template details
 *       404:
 *         description: SMS template not found
 *   put:
 *     summary: Update SMS template (Admin only)
 *     tags: [SMS Templates]
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
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               category:
 *                 type: string
 *               template:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: SMS template updated
 *       404:
 *         description: SMS template not found
 *   delete:
 *     summary: Delete SMS template (Admin only)
 *     tags: [SMS Templates]
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
 *         description: SMS template deleted
 *       404:
 *         description: SMS template not found
 */
router
  .route('/:id')
  .get(protect, admin, getSMSTemplateById)
  .put(protect, admin, updateSMSTemplate)
  .delete(protect, admin, deleteSMSTemplate)

export default router
