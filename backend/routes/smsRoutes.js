import express from 'express'
import { sendSMS } from '../controllers/smsController.js'
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

export default router
