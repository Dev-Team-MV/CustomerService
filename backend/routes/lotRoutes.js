import express from 'express'
import {
  getAllLots,
  getLotById,
  createLot,
  updateLot,
  deleteLot,
  getLotStats
} from '../controllers/lotController.js'
import { protect, admin } from '../middleware/authMiddleware.js'

const router = express.Router()

/**
 * @swagger
 * /api/lots:
 *   get:
 *     summary: Get all lots
 *     tags: [Lots]
 *     responses:
 *       200:
 *         description: List of lots
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Lot'
 *   post:
 *     summary: Create a new lot (Admin only)
 *     tags: [Lots]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - number
 *               - price
 *             properties:
 *               number:
 *                 type: string
 *               price:
 *                 type: number
 *               status:
 *                 type: string
 *                 enum: [available, pending, sold]
 *     responses:
 *       201:
 *         description: Lot created
 */
router.route('/')
  .get(getAllLots)
  .post(protect, admin, createLot)

/**
 * @swagger
 * /api/lots/stats:
 *   get:
 *     summary: Get lot statistics
 *     tags: [Lots]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lot statistics
 */
router.get('/stats', protect, getLotStats)

/**
 * @swagger
 * /api/lots/{id}:
 *   get:
 *     summary: Get lot by ID
 *     tags: [Lots]
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
 *         description: Lot details
 *       404:
 *         description: Lot not found
 *   put:
 *     summary: Update lot (Admin only)
 *     tags: [Lots]
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
 *               number:
 *                 type: string
 *               price:
 *                 type: number
 *               status:
 *                 type: string
 *                 enum: [available, pending, sold]
 *     responses:
 *       200:
 *         description: Lot updated
 *       404:
 *         description: Lot not found
 *   delete:
 *     summary: Delete lot (Admin only)
 *     tags: [Lots]
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
 *         description: Lot deleted
 *       404:
 *         description: Lot not found
 */
router.route('/:id')
  .get(protect, getLotById)
  .put(protect, admin, updateLot)
  .delete(protect, admin, deleteLot)

export default router
