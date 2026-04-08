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
import { upload } from '../controllers/uploadController.js'

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
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         description: Project ID. Required to keep payloads isolated by project.
 *       - in: query
 *         name: property
 *         schema:
 *           type: string
 *         description: Filter by Property ID
 *       - in: query
 *         name: apartment
 *         schema:
 *           type: string
 *         description: Filter by Apartment ID
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, signed, rejected]
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
 *     summary: Create a new payload (Property or Apartment)
 *     description: |
 *       Multipart: send exactly one of `property` or `apartment` (form field). Optional `images` files (field name `images`).
 *       Same rules as model — not both IDs, not neither.
 *     tags: [Payloads]
 *     security:
 *       - bearerAuth: []
 *     consumes:
 *       - multipart/form-data
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *             properties:
 *               property:
 *                 type: string
 *                 description: Property _id (lotes/casas). Mutually exclusive with apartment.
 *               apartment:
 *                 type: string
 *                 description: Apartment _id. Mutually exclusive with property.
 *               amount:
 *                 type: number
 *               date:
 *                 type: string
 *                 format: date
 *               support:
 *                 type: string
 *               urls:
 *                 type: string
 *                 description: JSON array string of existing paths/URLs (optional)
 *               status:
 *                 type: string
 *                 enum: [pending, signed, rejected]
 *                 description: Only admins can set signed; users default to pending.
 *               type:
 *                 type: string
 *                 enum: [initial down payment, complementary down payment, monthly payment, additional payment, closing payment]
 *               notes:
 *                 type: string
 *               folder:
 *                 type: string
 *                 description: GCS folder for uploaded images (default payloads)
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Receipt images (field name images, max 20)
 *     responses:
 *       201:
 *         description: Payload created
 *       400:
 *         description: Exactly one of property or apartment required
 *       403:
 *         description: No access to property/apartment
 *       404:
 *         description: Property or Apartment not found
 */
router.route('/')
  .get(protect, getAllPayloads)
  .post(protect, upload.array('images', 20), createPayload)

/**
 * @swagger
 * /api/payloads/stats:
 *   get:
 *     summary: Get payload statistics
 *     tags: [Payloads]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         description: Project ID. Required to compute stats per project.
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
 *     parameters:
 *       - in: query
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         description: Project ID. Required to list approved payloads by project.
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
 *       - in: query
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         description: Project ID used to validate payload scope.
 *     responses:
 *       200:
 *         description: Payload details
 *       404:
 *         description: Payload not found
 *   put:
 *     summary: Update payload (Only admins can approve/reject)
 *     tags: [Payloads]
 *     security:
 *       - bearerAuth: []
 *     consumes:
 *       - multipart/form-data
 *       - application/json
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         description: Project ID used to validate payload scope.
 *       - in: formData
 *         name: images
 *         type: file
 *         description: New image files to upload (optional)
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
 *               urls:
 *                 type: array
 *                 items:
 *                   type: string
 *               status:
 *                 type: string
 *                 enum: [pending, signed, rejected]
 *                 description: Only admins can set status to 'signed' or 'rejected'
 *               notes:
 *                 type: string
 *               folder:
 *                 type: string
 *                 description: Folder name in GCS for new images (e.g., 'payloads', 'payments', 'receipts')
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
 *       - in: query
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         description: Project ID used to validate payload scope.
 *     responses:
 *       200:
 *         description: Payload deleted
 *       404:
 *         description: Payload not found
 */
router.route('/:id')
  .get(protect, getPayloadById)
  .put(protect, admin, upload.array('images', 20), updatePayload)
  .delete(protect, admin, deletePayload)

export default router
