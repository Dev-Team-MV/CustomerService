import express from 'express'
import { getMasterPlan } from '../controllers/masterPlanController.js'
import { protect } from '../middleware/authMiddleware.js'

const router = express.Router()

/**
 * @swagger
 * /api/master-plan:
 *   get:
 *     summary: Get master plan data for one project
 *     tags: [Master Plan]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         description: Project ID to load master plan
 *       - in: query
 *         name: onlyWithPolygon
 *         required: false
 *         schema:
 *           type: string
 *           enum: ['true', 'false', '1', '0']
 *         description: If true, only buildings with at least one master-plan polygon point are returned
 *     responses:
 *       200:
 *         description: Master plan payload with project image and building polygons
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 project:
 *                   type: object
 *                 masterPlanImage:
 *                   type: string
 *                   nullable: true
 *                 masterPlanGallery:
 *                   type: array
 *                   items:
 *                     type: string
 *                 buildings:
 *                   type: array
 *                   items:
 *                     type: object
 *       400:
 *         description: Missing projectId
 *       404:
 *         description: Project not found
 */
router.get('/', protect, getMasterPlan)

export default router

