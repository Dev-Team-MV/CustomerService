import express from 'express'
import {
  getAllProperties,
  getPropertyById,
  createProperty,
  updateProperty,
  deleteProperty,
  getPropertyStats
} from '../controllers/propertyController.js'
import { protect, admin } from '../middleware/authMiddleware.js'

const router = express.Router()

/**
 * @swagger
 * /api/properties:
 *   get:
 *     summary: Get all properties
 *     tags: [Properties]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, pending, sold, cancelled]
 *       - in: query
 *         name: user
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of properties
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Property'
 *   post:
 *     summary: Create a new property (Admin only)
 *     tags: [Properties]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - lot
 *               - model
 *               - facade
 *             properties:
 *               lot:
 *                 type: string
 *               model:
 *                 type: string
 *               facade:
 *                 type: string
 *               user:
 *                 type: string
 *                 description: Single owner (use users for multiple)
 *               users:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Owner user IDs (at least one of user or users required)
 *               initialPayment:
 *                 type: number
 *                 description: Initial payment amount (price and pending will be calculated automatically as lot.price + model.price + facade.price)
 *     responses:
 *       201:
 *         description: Property created (9 phases will be automatically created)
 */
router.route('/')
  .get(protect, getAllProperties)
  .post(protect, admin, createProperty)

/**
 * @swagger
 * /api/properties/stats:
 *   get:
 *     summary: Get property statistics
 *     tags: [Properties]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Property statistics
 */
router.get('/stats', protect, getPropertyStats)

/**
 * @swagger
 * /api/properties/{id}:
 *   get:
 *     summary: Get property by ID (includes phases)
 *     tags: [Properties]
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
 *         description: Property details with phases
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Property'
 *                 - type: object
 *                   properties:
 *                     phases:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Phase'
 *       404:
 *         description: Property not found
 *   put:
 *     summary: Update property (Admin only)
 *     tags: [Properties]
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
 *               lot:
 *                 type: string
 *               model:
 *                 type: string
 *               facade:
 *                 type: string
 *               users:
 *                 type: array
 *                 items:
 *                   type: string
 *               price:
 *                 type: number
 *               pending:
 *                 type: number
 *               initialPayment:
 *                 type: number
 *               status:
 *                 type: string
 *                 enum: [active, pending, sold, cancelled]
 *               saleDate:
 *                 type: string
 *                 format: date-time
 *               hasBalcony:
 *                 type: boolean
 *               modelType:
 *                 type: string
 *                 enum: [basic, upgrade]
 *               hasStorage:
 *                 type: boolean
 *             description: Any combination of the above fields; only provided fields are updated.
 *     responses:
 *       200:
 *         description: Property updated
 *       404:
 *         description: Property not found
 *   delete:
 *     summary: Delete property (Admin only)
 *     tags: [Properties]
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
 *         description: Property deleted
 *       404:
 *         description: Property not found
 */
router.route('/:id')
  .get(protect, getPropertyById)
  .put(protect, admin, updateProperty)
  .delete(protect, admin, deleteProperty)

export default router
