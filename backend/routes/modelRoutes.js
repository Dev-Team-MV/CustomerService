import express from 'express'
import {
  getAllModels,
  getModelById,
  createModel,
  updateModel,
  deleteModel
} from '../controllers/modelController.js'
import { protect, admin } from '../middleware/authMiddleware.js'

const router = express.Router()

/**
 * @swagger
 * /api/models:
 *   get:
 *     summary: Get all models
 *     tags: [Models]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of models
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Model'
 *   post:
 *     summary: Create a new model (Admin only)
 *     tags: [Models]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - model
 *               - price
 *               - bedrooms
 *               - bathrooms
 *               - sqft
 *             properties:
 *               model:
 *                 type: string
 *               modelNumber:
 *                 type: string
 *               price:
 *                 type: number
 *               bedrooms:
 *                 type: number
 *               bathrooms:
 *                 type: number
 *               sqft:
 *                 type: number
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *               description:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [active, draft, inactive]
 *     responses:
 *       201:
 *         description: Model created
 */
router.route('/')
  .get(protect, getAllModels)
  .post(protect, admin, createModel)

/**
 * @swagger
 * /api/models/{id}:
 *   get:
 *     summary: Get model by ID
 *     tags: [Models]
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
 *         description: Model details
 *       404:
 *         description: Model not found
 *   put:
 *     summary: Update model (Admin only)
 *     tags: [Models]
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
 *               model:
 *                 type: string
 *               modelNumber:
 *                 type: string
 *               price:
 *                 type: number
 *               bedrooms:
 *                 type: number
 *               bathrooms:
 *                 type: number
 *               sqft:
 *                 type: number
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *               description:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [active, draft, inactive]
 *     responses:
 *       200:
 *         description: Model updated
 *       404:
 *         description: Model not found
 *   delete:
 *     summary: Delete model (Admin only)
 *     tags: [Models]
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
 *         description: Model deleted
 *       404:
 *         description: Model not found
 */
router.route('/:id')
  .get(protect, getModelById)
  .put(protect, admin, updateModel)
  .delete(protect, admin, deleteModel)

export default router
