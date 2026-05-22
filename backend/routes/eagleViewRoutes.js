import express from 'express'
import {
  getAllEagleViews,
  getEagleViewById,
  createEagleView,
  updateEagleView,
  updateEagleViewMediaVisibility,
  deleteEagleView
} from '../controllers/eagleViewController.js'
import { protect, admin } from '../middleware/authMiddleware.js'

const router = express.Router()

/**
 * @swagger
 * /api/eagle-view:
 *   get:
 *     summary: List all eagle view items (public)
 *     tags: [EagleView]
 *     responses:
 *       200:
 *         description: List of eagle view items
 *   post:
 *     summary: Create eagle view item (Admin only)
 *     tags: [EagleView]
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
 *               - date
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date-time
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
 *         description: Eagle view item created
 */
router
  .route('/')
  .get(getAllEagleViews)
  .post(protect, admin, createEagleView)

/**
 * @swagger
 * /api/eagle-view/{id}:
 *   get:
 *     summary: Get eagle view by ID (public)
 *     tags: [EagleView]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Eagle view item
 *       404:
 *         description: Not found
 *   put:
 *     summary: Update eagle view (Admin only)
 *     tags: [EagleView]
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
 *               date:
 *                 type: string
 *                 format: date-time
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
 *     summary: Delete eagle view (Admin only)
 *     tags: [EagleView]
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
  .get(getEagleViewById)
  .put(protect, admin, updateEagleView)
  .delete(protect, admin, deleteEagleView)

/**
 * PATCH /api/eagle-view/:id/media/:index/visibility — Body: { isPublic }. Admin only.
 */
router.patch('/:id/media/:index/visibility', protect, admin, updateEagleViewMediaVisibility)

export default router
