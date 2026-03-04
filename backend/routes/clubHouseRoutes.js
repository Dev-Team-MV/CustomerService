import express from 'express'
import { getClubHouse, getClubHousePublic, uploadClubHouseImages, getClubHouseInteriorKeys, updateClubHouseImageVisibility, deleteClubHouseImages } from '../controllers/clubHouseController.js'
import { protect, admin } from '../middleware/authMiddleware.js'
import { upload } from '../controllers/uploadController.js'

const router = express.Router()

/**
 * @swagger
 * /api/clubhouse:
 *   get:
 *     summary: Get Club House content (exterior, blueprints, deck, interior images)
 *     tags: [ClubHouse]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Club House document with exterior[], blueprints[], deck[], interior{ amenityName: [urls] }
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ClubHouse'
 */
router.get('/', protect, getClubHouse)

/**
 * @swagger
 * /api/clubhouse/public:
 *   get:
 *     summary: Get Club House (public)
 *     description: Returns clubhouse content with only public images (isPublic true). No authentication required.
 *     tags: [ClubHouse]
 *     responses:
 *       200:
 *         description: Club house with exterior[], blueprints[], deck[], interior{} and optional recorridoVisibility (only public images included)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 exterior:
 *                   type: array
 *                   items: { type: object, properties: { url: { type: string }, isPublic: { type: boolean } } }
 *                 blueprints:
 *                   type: array
 *                   items: { type: object, properties: { url: { type: string }, isPublic: { type: boolean } } }
 *                 deck:
 *                   type: array
 *                   items: { type: object, properties: { url: { type: string }, isPublic: { type: boolean } } }
 *                 interior:
 *                   type: object
 *                   additionalProperties:
 *                     type: array
 *                     items: { type: object, properties: { url: { type: string }, isPublic: { type: boolean } } }
 *                 recorridoVisibility:
 *                   type: object
 *                   description: Optional. Map of filename -> boolean for recorrido folder images.
 */
router.get('/public', getClubHousePublic)

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
 *                 enum: [exterior, blueprints, deck, interior]
 *               interiorKey:
 *                 type: string
 *                 description: Required when section=interior. Use one of GET /api/clubhouse/interior-keys (e.g. Reception, Managers Office, Conference Room)
 *                 example: Reception
 *               isPublic:
 *                 type: boolean
 *                 description: Si la(s) imagen(es) se pueden mostrar sin token (pública). Por defecto true.
 *                 default: true
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       200:
 *         description: Images uploaded and URLs added to Club House (each item has url and isPublic)
 *       400:
 *         description: Missing section, interiorKey (for interior), or files
 */
router.post('/images', protect, admin, upload.array('images', 20), uploadClubHouseImages)

/**
 * @swagger
 * /api/clubhouse/images/visibility:
 *   patch:
 *     summary: Update visibility (isPublic) of a Club House image (Admin only)
 *     tags: [ClubHouse]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - section
 *               - index
 *               - isPublic
 *             properties:
 *               section:
 *                 type: string
 *                 enum: [exterior, blueprints, deck, interior]
 *               interiorKey:
 *                 type: string
 *                 description: Required when section=interior
 *               index:
 *                 type: integer
 *                 minimum: 0
 *                 description: Index of the image in the section (or in interior[interiorKey])
 *               isPublic:
 *                 type: boolean
 *                 description: true = mostrar sin token (pública), false = requiere token
 *     responses:
 *       200:
 *         description: Image visibility updated
 *       400:
 *         description: Invalid section, index or missing interiorKey for interior
 *       404:
 *         description: No image at index
 */
router.patch('/images/visibility', protect, admin, updateClubHouseImageVisibility)

/**
 * @swagger
 * /api/clubhouse/images:
 *   delete:
 *     summary: Delete Club House images by filename and/or custom name (Admin only)
 *     tags: [ClubHouse]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               filenames:
 *                 type: array
 *                 items: { type: string }
 *                 description: File names (e.g. "abc123.jpg") — last segment of image URL. Images with matching url are removed.
 *               names:
 *                 type: array
 *                 items: { type: string }
 *                 description: Custom names (item.name). Images with matching name are removed.
 *               deleteFromStorage:
 *                 type: boolean
 *                 default: false
 *                 description: If true, also deletes the file from GCS (clubhouse folder).
 *     responses:
 *       200:
 *         description: Images removed from document (and optionally from GCS). Returns removedCount, removedFilenames, clubHouse.
 *       400:
 *         description: Missing both filenames and names
 */
router.delete('/images', protect, admin, deleteClubHouseImages)

export default router
