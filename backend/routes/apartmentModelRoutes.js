import express from 'express'
import {
  getAllApartmentModels,
  getApartmentModelById,
  createApartmentModel,
  updateApartmentModel,
  deleteApartmentModel
} from '../controllers/apartmentModelController.js'
import { protect, admin } from '../middleware/authMiddleware.js'

const router = express.Router()

/**
 * @swagger
 * /api/apartment-models:
 *   get:
 *     summary: List apartment models
 *     description: Public endpoint. You can filter by `buildingId` and/or `projectId`.
 *     tags: [Apartment Models]
 *     parameters:
 *       - in: query
 *         name: buildingId
 *         schema:
 *           type: string
 *         description: Filter models by building ID
 *       - in: query
 *         name: projectId
 *         schema:
 *           type: string
 *         description: Filter models by project ID (resolves project buildings first)
 *     responses:
 *       200:
 *         description: Apartment models list
 *   post:
 *     summary: Create apartment model (Admin only)
 *     tags: [Apartment Models]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Apartment model created
 */
router.route('/')
  .get(getAllApartmentModels)
  .post(protect, admin, createApartmentModel)

/**
 * @swagger
 * /api/apartment-models/{id}:
 *   get:
 *     summary: Get apartment model by ID
 *     tags: [Apartment Models]
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
 *         description: Apartment model detail
 *       404:
 *         description: Apartment model not found
 *   put:
 *     summary: Update apartment model (Admin only)
 *     tags: [Apartment Models]
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
 *         description: Apartment model updated
 *   delete:
 *     summary: Delete apartment model (Admin only)
 *     tags: [Apartment Models]
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
 *         description: Apartment model deleted
 */
router.route('/:id')
  .get(protect, getApartmentModelById)
  .put(protect, admin, updateApartmentModel)
  .delete(protect, admin, deleteApartmentModel)

export default router
