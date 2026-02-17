import express from 'express'
import { getClubHouse, uploadClubHouseImages, getClubHouseInteriorKeys } from '../controllers/clubHouseController.js'
import { protect, admin } from '../middleware/authMiddleware.js'
import { upload } from '../controllers/uploadController.js'

const router = express.Router()

/**
 * @swagger
 * /api/clubhouse:
 *   get:
 *     summary: Get Club House content (exterior, blueprints, interior images)
 *     tags: [ClubHouse]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Club House document with exterior[], blueprints[], interior{ amenityName: [urls] }
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ClubHouse'
 */
router.get('/', protect, getClubHouse)

/**
 * @swagger
 * /api/clubhouse/interior-keys:
 *   get:
 *     summary: Get list of valid interior amenity keys (for admin UI)
 *     tags: [ClubHouse]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of interior keys (Reception, Managers Office, etc.)
 */
router.get('/interior-keys', protect, getClubHouseInteriorKeys)

/**
 * @swagger
 * /api/clubhouse/images:
 *   post:
 *     summary: Upload images to Club House (Admin only)
 *     tags: [ClubHouse]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - section
 *             properties:
 *               section:
 *                 type: string
 *                 enum: [exterior, blueprints, interior]
 *               interiorKey:
 *                 type: string
 *                 description: Required when section=interior (e.g. Reception, Managers Office)
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       200:
 *         description: Images uploaded and URLs added to Club House
 *       400:
 *         description: Missing section, interiorKey (for interior), or files
 */
router.post('/images', protect, admin, upload.array('images', 20), uploadClubHouseImages)

export default router
