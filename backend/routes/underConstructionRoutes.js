import express from 'express'
import {
  getAllUnderConstruction,
  getUnderConstructionById,
  createUnderConstruction,
  updateUnderConstruction,
  deleteUnderConstruction
} from '../controllers/underConstructionController.js'
import { protect, admin } from '../middleware/authMiddleware.js'

const router = express.Router()

/**
 * @swagger
 * /api/under-construction:
 *   get:
 *     summary: List all under construction items (public)
 *     tags: [UnderConstruction]
 *     responses:
 *       200:
 *         description: List of under construction items
 *   post:
 *     summary: Create under construction item (Admin only)
 *     tags: [UnderConstruction]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               media:
 *                 type: array
 *                 description: Lista ordenada (imagen-1, video-2, imagen-3, etc.)
 *                 items:
 *                   type: object
 *                   required: [type, url, order]
 *                   properties:
 *                     type: { type: string, enum: [image, video] }
 *                     url: { type: string }
 *                     name: { type: string }
 *                     order: { type: number }
 *     responses:
 *       201:
 *         description: Under construction item created
 */
router
  .route('/')
  .get(getAllUnderConstruction)
  .post(protect, admin, createUnderConstruction)

/**
 * @swagger
 * /api/under-construction/{id}:
 *   get:
 *     summary: Get under construction by ID (public)
 *     tags: [UnderConstruction]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Under construction item
 *       404:
 *         description: Not found
 *   put:
 *     summary: Update under construction (Admin only)
 *     tags: [UnderConstruction]
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
 *               title: { type: string }
 *               description: { type: string }
 *               media:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     type: { type: string, enum: [image, video] }
 *                     url: { type: string }
 *                     name: { type: string }
 *                     order: { type: number }
 *     responses:
 *       200:
 *         description: Updated
 *       404:
 *         description: Not found
 *   delete:
 *     summary: Delete under construction (Admin only)
 *     tags: [UnderConstruction]
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
 *         description: Deleted
 *       404:
 *         description: Not found
 */
router
  .route('/:id')
  .get(getUnderConstructionById)
  .put(protect, admin, updateUnderConstruction)
  .delete(protect, admin, deleteUnderConstruction)

export default router
