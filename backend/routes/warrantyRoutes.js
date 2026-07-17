import express from 'express'
import {
  getWarranties,
  getWarrantyById,
  createWarranty,
  updateWarranty,
  resolveWarranty,
  deleteWarranty
} from '../controllers/warrantyController.js'
import { protect, admin } from '../middleware/authMiddleware.js'

const router = express.Router()

/**
 * @swagger
 * /api/warranties:
 *   get:
 *     summary: List warranty claims
 *     description: Non-admin users only see their own claims.
 *     tags: [Warranties]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: projectId
 *         schema: { type: string }
 *       - in: query
 *         name: propertyId
 *         schema: { type: string }
 *       - in: query
 *         name: clientId
 *         schema: { type: string }
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [submitted, under_review, approved, in_progress, resolved, rejected]
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [structural, plumbing, electrical, finish, appliance, landscaping, other]
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [low, medium, high, emergency]
 *     responses:
 *       200:
 *         description: Claim list
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/WarrantyClaim'
 *   post:
 *     summary: Submit warranty claim
 *     description: Fires warranty_submitted automation on create.
 *     tags: [Warranties]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/WarrantyClaimCreate'
 *     responses:
 *       201:
 *         description: Claim created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/WarrantyClaim'
 */
router.get('/', protect, getWarranties)
router.post('/', protect, createWarranty)

/**
 * @swagger
 * /api/warranties/{id}/resolve:
 *   post:
 *     summary: Resolve or reject warranty claim (Admin)
 *     tags: [Warranties]
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
 *               resolution: { type: string }
 *               status: { type: string, enum: [resolved, rejected], default: resolved }
 *     responses:
 *       200:
 *         description: Claim resolved
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/WarrantyClaim'
 */
router.post('/:id/resolve', protect, admin, resolveWarranty)

/**
 * @swagger
 * /api/warranties/{id}:
 *   get:
 *     summary: Get warranty claim by ID
 *     tags: [Warranties]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Claim found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/WarrantyClaim'
 *       403:
 *         description: Not authorized
 *       404:
 *         description: Not found
 *   put:
 *     summary: Update warranty claim
 *     description: Users can edit description/photos only while status is submitted. Admins can update all fields.
 *     tags: [Warranties]
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
 *               category:
 *                 type: string
 *                 enum: [structural, plumbing, electrical, finish, appliance, landscaping, other]
 *               description: { type: string }
 *               photoUrls: { type: array, items: { type: string } }
 *               priority: { type: string, enum: [low, medium, high, emergency] }
 *               status:
 *                 type: string
 *                 enum: [submitted, under_review, approved, in_progress, resolved, rejected]
 *               assignedContractor: { type: string }
 *               resolution: { type: string }
 *               satisfactionRating: { type: integer, minimum: 1, maximum: 5 }
 *     responses:
 *       200:
 *         description: Claim updated
 *   delete:
 *     summary: Delete warranty claim (Admin)
 *     tags: [Warranties]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Claim deleted
 */
router.get('/:id', protect, getWarrantyById)
router.put('/:id', protect, updateWarranty)
router.delete('/:id', protect, admin, deleteWarranty)

export default router
