import express from 'express'
import { getMasterPlan } from '../controllers/masterPlanController.js'

const router = express.Router()

/**
 * @swagger
 * /api/master-plan:
 *   get:
 *     summary: Get master plan data for one project
 *     tags: [Master Plan]
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
 *                     properties:
 *                       polygon:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             x: { type: number }
 *                             y: { type: number }
 *                       polygonColor:
 *                         type: string
 *                         example: '#8CA551'
 *                       polygonStrokeColor:
 *                         type: string
 *                         example: '#1F2937'
 *                       polygonOpacity:
 *                         type: number
 *                         minimum: 0
 *                         maximum: 1
 *                         example: 0.35
 *       400:
 *         description: Missing projectId
 *       404:
 *         description: Project not found
 */
router.get('/', getMasterPlan)

export default router

