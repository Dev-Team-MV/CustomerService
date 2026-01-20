import express from 'express'
import {
  getAllPayloads,
  getPayloadById,
  createPayload,
  updatePayload,
  deletePayload,
  getPayloadStats,
  getApprovedPayloadsThisMonth
} from '../controllers/payloadController.js'
import { protect, admin } from '../middleware/authMiddleware.js'

const router = express.Router()

/**
 * @swagger
 * /api/payloads:
 *   get:
 *     summary: Get all payloads
 *     tags: [Payloads]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: property
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of payloads
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Payload'
 *   post:
 *     summary: Create a new payload (Admin only)
 *     tags: [Payloads]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - property
 *               - amount
 *               - date
 *             properties:
 *               property:
 *                 type: string
 *               amount:
 *                 type: number
 *               date:
 *                 type: string
 *                 format: date
 *               support:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [pending, cleared, rejected]
 *                 default: pending
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Payload created
 */
router.route('/')
  .get(protect, getAllPayloads)
  .post(protect, admin, createPayload)

/**
 * @swagger
 * /api/payloads/stats:
 *   get:
 *     summary: Get payload statistics
 *     tags: [Payloads]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Payload statistics
 */
router.get('/stats', protect, getPayloadStats)

/**
 * @swagger
 * /api/payloads/approved/this-month:
 *   get:
 *     summary: Get approved payloads from this month
 *     tags: [Payloads]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of approved payloads from this month
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 count:
 *                   type: number
 *                   description: Number of approved payloads this month
 *                 totalAmount:
 *                   type: number
 *                   description: Total amount of approved payloads this month
 *                 payloads:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Payload'
 */
router.get('/approved/this-month', protect, getApprovedPayloadsThisMonth)

/**
 * @swagger
 * /api/payloads/{id}:
 *   get:
 *     summary: Get payload by ID
 *     tags: [Payloads]
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
 *         description: Payload details
 *       404:
 *         description: Payload not found
 *   put:
 *     summary: Update payload (Admin only)
 *     tags: [Payloads]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: number
 *               date:
 *                 type: string
 *                 format: date
 *               support:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [pending, cleared, rejected]
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Payload updated
 *       404:
 *         description: Payload not found
 *   delete:
 *     summary: Delete payload (Admin only)
 *     tags: [Payloads]
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
 *         description: Payload deleted
 *       404:
 *         description: Payload not found
 */
router.route('/:id')
  .get(protect, getPayloadById)
  .put(protect, admin, updatePayload)
  .delete(protect, admin, deletePayload)

export default router
