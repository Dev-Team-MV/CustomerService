import express from 'express'
import { sendSMS, sendSMSTemplate, sendSMSByTemplateId, previewSMSByTemplateId } from '../controllers/smsController.js'
import { protect, admin } from '../middleware/authMiddleware.js'

const router = express.Router()

/**
 * @swagger
 * /api/sms/send:
 *   post:
 *     summary: Send SMS message (Admin only)
 *     tags: [SMS]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - to
 *               - message
 *             properties:
 *               to:
 *                 type: string
 *                 description: Phone number in E.164 format (e.g., +1234567890)
 *                 example: "+1234567890"
 *               message:
 *                 type: string
 *                 description: SMS message body (max 1600 characters)
 *                 example: "Hello, this is a test message"
 *     responses:
 *       200:
 *         description: SMS sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     messageSid:
 *                       type: string
 *                     status:
 *                       type: string
 *                     to:
 *                       type: string
 *                     from:
 *                       type: string
 *       400:
 *         description: Invalid request data
 *       500:
 *         description: Error sending SMS
 */
router.post('/send', protect, admin, sendSMS)

/**
 * @swagger
 * /api/sms/send-template:
 *   post:
 *     summary: Send SMS from template and variables (Admin only)
 *     tags: [SMS]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - to
 *               - template
 *             properties:
 *               to:
 *                 type: string
 *                 description: Phone number in E.164 format (e.g., +1234567890)
 *                 example: "+1234567890"
 *               template:
 *                 type: string
 *                 description: SMS template using {{variable}} placeholders
 *                 example: "Hola {{name}}, tu codigo es {{code}}."
 *               variables:
 *                 type: object
 *                 additionalProperties: true
 *                 description: Key-value data used to replace placeholders
 *                 example:
 *                   name: "Juan"
 *                   code: "123456"
 *     responses:
 *       200:
 *         description: Template SMS sent successfully
 *       400:
 *         description: Missing/invalid fields or template variables
 *       500:
 *         description: Error sending SMS
 */
router.post('/send-template', protect, admin, sendSMSTemplate)

/**
 * @swagger
 * /api/sms/send-by-template:
 *   post:
 *     summary: Send SMS using stored templateId and variables (Admin only)
 *     tags: [SMS]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - to
 *               - templateId
 *             properties:
 *               to:
 *                 type: string
 *                 description: Phone number in E.164 format (e.g., +1234567890)
 *                 example: "+1234567890"
 *               templateId:
 *                 type: string
 *                 description: Existing SMS template ID from /api/sms-templates
 *                 example: "682ced40f6b7d5db2f4dcd12"
 *               variables:
 *                 type: object
 *                 additionalProperties: true
 *                 description: Data used to replace template placeholders
 *                 example:
 *                   name: "Juan"
 *                   amount: "$1,250"
 *                   dueDate: "2026-05-25"
 *     responses:
 *       200:
 *         description: Template SMS sent successfully
 *       400:
 *         description: Missing/invalid fields or template variables
 *       404:
 *         description: Template not found
 *       500:
 *         description: Error sending SMS
 */
router.post('/send-by-template', protect, admin, sendSMSByTemplateId)

/**
 * @swagger
 * /api/sms/preview-template:
 *   post:
 *     summary: Preview SMS using stored templateId and variables without sending (Admin only)
 *     tags: [SMS]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - templateId
 *             properties:
 *               templateId:
 *                 type: string
 *                 description: Existing SMS template ID from /api/sms-templates
 *                 example: "682ced40f6b7d5db2f4dcd12"
 *               variables:
 *                 type: object
 *                 additionalProperties: true
 *                 description: Data used to replace template placeholders
 *                 example:
 *                   name: "Juan"
 *                   amount: "$1,250"
 *                   dueDate: "2026-05-25"
 *     responses:
 *       200:
 *         description: Template preview generated successfully
 *       400:
 *         description: Missing/invalid fields
 *       404:
 *         description: Template not found
 */
router.post('/preview-template', protect, admin, previewSMSByTemplateId)

export default router
