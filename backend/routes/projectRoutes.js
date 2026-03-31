import express from 'express'
import {
  getAllProjects,
  getProjectById,
  getProjectBySlug,
  getProjectOutdoorAmenities,
  getProjectOutdoorAmenitiesBySlug,
  updateProjectOutdoorAmenities,
  createProject,
  updateProject,
  deleteProject
} from '../controllers/projectController.js'
import { protect, admin } from '../middleware/authMiddleware.js'

const router = express.Router()

// Debug: confirm router is mounted (GET /api/projects/ping)
router.get('/ping', (req, res) => res.json({ ok: true, message: 'projects router mounted' }))

/**
 * @swagger
 * /api/projects:
 *   get:
 *     summary: Get all projects
 *     tags: [Projects]
 *     parameters:
 *       - in: query
 *         name: activeOnly
 *         schema:
 *           type: string
 *           enum: ['true', '1']
 *         description: If set, only active projects are returned
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive, coming_soon, sold_out]
 *         description: Filter by project status
 *     responses:
 *       200:
 *         description: List of projects
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Project'
 *   post:
 *     summary: Create a new project (Admin only)
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - slug
 *             properties:
 *               slug:
 *                 type: string
 *                 description: Unique slug (e.g. lakewood-oaks-on-lake-conroe-phase-I)
 *               name:
 *                 type: string
 *               phase:
 *                 type: string
 *                 example: 'I'
 *               title:
 *                 type: object
 *                 properties:
 *                   en: { type: string }
 *                   es: { type: string }
 *               subtitle:
 *                 type: object
 *                 properties:
 *                   en: { type: string }
 *                   es: { type: string }
 *               description:
 *                 type: object
 *                 properties:
 *                   en: { type: string }
 *                   es: { type: string }
 *               fullDescription:
 *                 type: object
 *                 properties:
 *                   en: { type: string }
 *                   es: { type: string }
 *               image:
 *                 type: string
 *                 description: Main image URL
 *               gallery:
 *                 type: array
 *                 items: { type: string }
 *                 description: Gallery image URLs
 *               features:
 *                 type: object
 *                 properties:
 *                   en: { type: array, items: { type: string } }
 *                   es: { type: array, items: { type: string } }
 *               type:
 *                 type: string
 *                 enum: [residential_lots, apartments, other]
 *               status:
 *                 type: string
 *                 enum: [active, inactive, coming_soon, sold_out]
 *               isActive:
 *                 type: boolean
 *               externalUrl:
 *                 type: string
 *               location:
 *                 type: string
 *               area:
 *                 type: string
 *               videos:
 *                 type: array
 *                 items: { type: string }
 *     responses:
 *       201:
 *         description: Project created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Project'
 */
router.route('/')
  .get(getAllProjects)
  .post(protect, admin, createProject)

// Also handle base path when Express passes '' (no leading slash) to the router
router.post('', protect, admin, createProject)

/**
 * @swagger
 * /api/projects/slug/{slug}:
 *   get:
 *     summary: Get project by slug
 *     tags: [Projects]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Project details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Project'
 *       404:
 *         description: Project not found
 */
router.get('/slug/:slug', getProjectBySlug)
router.get('/slug/:slug/outdoor-amenities', getProjectOutdoorAmenitiesBySlug)

/**
 * @swagger
 * /api/projects/{id}:
 *   get:
 *     summary: Get project by ID
 *     tags: [Projects]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Project details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Project'
 *       404:
 *         description: Project not found
 *   put:
 *     summary: Update project (Admin only)
 *     tags: [Projects]
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
 *               name: { type: string }
 *               slug: { type: string }
 *               phase: { type: string }
 *               title: { type: object, properties: { en: { type: string }, es: { type: string } } }
 *               subtitle: { type: object, properties: { en: { type: string }, es: { type: string } } }
 *               description: { type: object, properties: { en: { type: string }, es: { type: string } } }
 *               fullDescription: { type: object, properties: { en: { type: string }, es: { type: string } } }
 *               image: { type: string }
 *               gallery: { type: array, items: { type: string } }
 *               features: { type: object, properties: { en: { type: array }, es: { type: array } } }
 *               type: { type: string, enum: [residential_lots, apartments, other] }
 *               status: { type: string, enum: [active, inactive, coming_soon, sold_out] }
 *               isActive: { type: boolean }
 *               externalUrl: { type: string }
 *               location: { type: string }
 *               area: { type: string }
 *               videos: { type: array, items: { type: string } }
 *     responses:
 *       200:
 *         description: Project updated
 *       404:
 *         description: Project not found
 *   delete:
 *     summary: Delete project (Admin only)
 *     tags: [Projects]
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
 *         description: Project deleted
 *       404:
 *         description: Project not found
 */
router.route('/:id')
  .get(getProjectById)
  .put(protect, admin, updateProject)
  .delete(protect, admin, deleteProject)

router.get('/:id/outdoor-amenities', getProjectOutdoorAmenities)
router.put('/:id/outdoor-amenities', protect, admin, updateProjectOutdoorAmenities)

export default router
