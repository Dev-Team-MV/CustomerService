import express from 'express'
import { getOutdoorAmenities, setOutdoorAmenitiesSection } from '../controllers/outdoorAmenitiesController.js'
import { protect, admin } from '../middleware/authMiddleware.js'

const router = express.Router()

/**
 * @swagger
 * /api/outdoor-amenities:
 *   get:
 *     summary: Get outdoor amenities (singleton)
 *     tags: [Outdoor Amenities]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Document with sections: { sectionName: [urls], ... }
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id: { type: string }
 *                 sections:
 *                   type: object
 *                   additionalProperties:
 *                     type: array
 *                     items: { type: string }
 *                   example: { "Pool": ["https://..."], "BBQ": ["https://..."] }
 *                 createdAt: { type: string, format: date-time }
 *                 updatedAt: { type: string, format: date-time }
 */
router.get('/', protect, getOutdoorAmenities)

/**
 * @swagger
 * /api/outdoor-amenities:
 *   post:
 *     summary: Set URLs for one section (Admin). Same shape as ClubHouse exterior: section + array of URLs.
 *     tags: [Outdoor Amenities]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [section]
 *             properties:
 *               section:
 *                 type: string
 *                 example: Pool
 *               urls:
 *                 type: array
 *                 items: { type: string }
 *                 example: ["https://storage.googleapis.com/...", "https://..."]
 *     responses:
 *       200:
 *         description: Section updated
 *       400:
 *         description: section required
 */
router.post('/', protect, admin, setOutdoorAmenitiesSection)

export default router
