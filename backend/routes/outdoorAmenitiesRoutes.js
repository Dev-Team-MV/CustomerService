import express from 'express'
import {
  getOutdoorAmenities,
  getOutdoorAmenityById,
  createOrUpdateOutdoorAmenities,
  updateOutdoorAmenity,
  deleteOutdoorAmenity
} from '../controllers/outdoorAmenitiesController.js'
import { protect, admin } from '../middleware/authMiddleware.js'

const router = express.Router()

/**
 * @swagger
 * /api/outdoor-amenities:
 *   get:
 *     summary: Get all outdoor amenities (singleton document)
 *     tags: [Outdoor Amenities]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Document with amenities array
 */
router.get('/', protect, getOutdoorAmenities)

/**
 * @swagger
 * /api/outdoor-amenities/{id}:
 *   get:
 *     summary: Get one outdoor amenity by id
 *     tags: [Outdoor Amenities]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Single amenity { id, name, images }
 *       404:
 *         description: Amenity not found
 */
router.get('/:id', protect, getOutdoorAmenityById)

/**
 * @swagger
 * /api/outdoor-amenities:
 *   post:
 *     summary: Create or update outdoor amenities (Admin)
 *     tags: [Outdoor Amenities]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             oneOf:
 *               - type: object
 *                 properties:
 *                   amenities: { type: array, items: { type: object, properties: { id, name, images } } }
 *               - type: object
 *                 description: Create one (no id)
 *                 properties:
 *                   name: { type: string }
 *                   images: { type: array, items: { type: string } }
 *               - type: object
 *                 description: Update/upsert one
 *                 properties:
 *                   id: { type: number }
 *                   name: { type: string }
 *                   images: { type: array, items: { type: string } }
 *     responses:
 *       200:
 *         description: Updated
 *       201:
 *         description: Amenity created
 */
router.post('/', protect, admin, createOrUpdateOutdoorAmenities)

/**
 * @swagger
 * /api/outdoor-amenities/{id}:
 *   put:
 *     summary: Update one outdoor amenity by id (Admin)
 *     tags: [Outdoor Amenities]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               images: { type: array, items: { type: string } }
 *     responses:
 *       200:
 *         description: Amenity updated
 *       404:
 *         description: Amenity not found
 */
router.put('/:id', protect, admin, updateOutdoorAmenity)

/**
 * @swagger
 * /api/outdoor-amenities/{id}:
 *   delete:
 *     summary: Delete one outdoor amenity by id (Admin)
 *     tags: [Outdoor Amenities]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Amenity deleted
 *       404:
 *         description: Amenity not found
 */
router.delete('/:id', protect, admin, deleteOutdoorAmenity)

export default router
