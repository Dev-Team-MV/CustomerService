import express from 'express'
import {
  getAllPhases,
  getPhasesByProperty,
  getPhaseById,
  getPhaseByNumber,
  updatePhase,
  addMediaItem,
  updateMediaItem,
  deleteMediaItem
} from '../controllers/phaseController.js'
import { protect, admin } from '../middleware/authMiddleware.js'

const router = express.Router()

/**
 * @swagger
 * /api/phases:
 *   get:
 *     summary: Get all phases (Admin only)
 *     tags: [Phases]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: property
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of phases
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Phase'
 */
router.get('/', protect, admin, getAllPhases)

/**
 * @swagger
 * /api/phases/property/{propertyId}:
 *   get:
 *     summary: Get all phases for a specific property
 *     tags: [Phases]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: propertyId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of phases for the property
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Phase'
 *       404:
 *         description: Property not found
 */
router.get('/property/:propertyId', protect, getPhasesByProperty)

/**
 * @swagger
 * /api/phases/property/{propertyId}/phase/{phaseNumber}:
 *   get:
 *     summary: Get phase by property ID and phase number
 *     tags: [Phases]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: propertyId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: phaseNumber
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 9
 *     responses:
 *       200:
 *         description: Phase details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Phase'
 *       404:
 *         description: Phase not found
 */
router.get('/property/:propertyId/phase/:phaseNumber', protect, getPhaseByNumber)

/**
 * @swagger
 * /api/phases/{id}:
 *   get:
 *     summary: Get phase by ID
 *     tags: [Phases]
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
 *         description: Phase details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Phase'
 *       404:
 *         description: Phase not found
 *   put:
 *     summary: Update phase (title, constructionPercentage) (Admin only)
 *     tags: [Phases]
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
 *               title:
 *                 type: string
 *               constructionPercentage:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 100
 *               facades:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of facade image URLs
 *     responses:
 *       200:
 *         description: Phase updated
 *       404:
 *         description: Phase not found
 */
router.get('/:id', protect, getPhaseById)
router.put('/:id', protect, admin, updatePhase)

/**
 * @swagger
 * /api/phases/{id}/media:
 *   post:
 *     summary: Add media item (image/video) to a phase (Admin only)
 *     tags: [Phases]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - url
 *               - title
 *               - percentage
 *             properties:
 *               url:
 *                 type: string
 *               title:
 *                 type: string
 *               percentage:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 100
 *               mediaType:
 *                 type: string
 *                 enum: [image, video]
 *                 default: image
 *     responses:
 *       201:
 *         description: Media item added
 *       400:
 *         description: Invalid data
 *       404:
 *         description: Phase not found
 */
router.post('/:id/media', protect, admin, addMediaItem)

/**
 * @swagger
 * /api/phases/{id}/media/{mediaItemId}:
 *   put:
 *     summary: Update a media item in a phase (Admin only)
 *     tags: [Phases]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: mediaItemId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               url:
 *                 type: string
 *               title:
 *                 type: string
 *               percentage:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 100
 *               mediaType:
 *                 type: string
 *                 enum: [image, video]
 *     responses:
 *       200:
 *         description: Media item updated
 *       404:
 *         description: Phase or media item not found
 *   delete:
 *     summary: Delete a media item from a phase (Admin only)
 *     tags: [Phases]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: mediaItemId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Media item deleted
 *       404:
 *         description: Phase or media item not found
 */
router.put('/:id/media/:mediaItemId', protect, admin, updateMediaItem)
router.delete('/:id/media/:mediaItemId', protect, admin, deleteMediaItem)

export default router
