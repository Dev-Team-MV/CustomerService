import express from 'express'
import {
  getAllBuildings,
  getBuildingById,
  createBuilding,
  updateBuilding,
  deleteBuilding,
  acquireBuildingQuoteLock,
  releaseBuildingQuoteLock,
  setBuildingAvailability,
  getBuildingFloorPlans,
  createOrReplaceBuildingFloorPlan,
  updateBuildingFloorPlan,
  deleteBuildingFloorPlan,
  getFloorPlanPolygons,
  createFloorPlanPolygon,
  updateFloorPlanPolygon,
  deleteFloorPlanPolygon
} from '../controllers/buildingController.js'
import { protect, admin } from '../middleware/authMiddleware.js'

const router = express.Router()

/**
 * @swagger
 * /api/buildings:
 *   get:
 *     summary: List buildings
 *     tags: [Buildings]
 *     responses:
 *       200:
 *         description: Buildings list
 *   post:
 *     summary: Create building
 *     tags: [Buildings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               polygonColor:
 *                 type: string
 *                 example: '#8CA551'
 *               polygonStrokeColor:
 *                 type: string
 *                 example: '#1F2937'
 *               polygonOpacity:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 1
 *                 example: 0.35
 *     responses:
 *       201:
 *         description: Building created
 */
router.route('/')
  .get(getAllBuildings)
  .post(protect, admin, createBuilding)

/**
 * @swagger
 * /api/buildings/{id}:
 *   get:
 *     summary: Get building by ID
 *     tags: [Buildings]
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
 *         description: Building detail
 *   put:
 *     summary: Update building
 *     tags: [Buildings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               polygonColor:
 *                 type: string
 *                 example: '#8CA551'
 *               polygonStrokeColor:
 *                 type: string
 *                 example: '#1F2937'
 *               polygonOpacity:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 1
 *                 example: 0.35
 *     responses:
 *       200:
 *         description: Building updated
 *   delete:
 *     summary: Delete building
 *     tags: [Buildings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Building deleted
 */
router.route('/:id')
  .get(protect, getBuildingById)
  .put(protect, admin, updateBuilding)
  .delete(protect, admin, deleteBuilding)

/**
 * @swagger
 * /api/buildings/{id}/quote-lock:
 *   post:
 *     summary: Acquire or renew quote lock for one building
 *     tags: [Buildings]
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
 *             required: [quoteId]
 *             properties:
 *               quoteId:
 *                 type: string
 *                 description: External or internal quote identifier
 *               lockMinutes:
 *                 type: number
 *                 description: Lock duration in minutes (default 15, max 240)
 *               reason:
 *                 type: string
 *                 description: Optional lock reason shown to UI
 *     responses:
 *       200:
 *         description: Lock acquired
 *       404:
 *         description: Building not found
 *       409:
 *         description: Building not available to lock
 *   delete:
 *     summary: Release quote lock for one building
 *     tags: [Buildings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               quoteId:
 *                 type: string
 *                 description: Required when lock belongs to a specific quote
 *               force:
 *                 type: boolean
 *                 description: Force unlock (admin/superadmin only)
 *     responses:
 *       200:
 *         description: Lock released
 *       404:
 *         description: Building not found
 *       409:
 *         description: Lock belongs to another quote
 */
router.post('/:id/quote-lock', protect, acquireBuildingQuoteLock)
router.delete('/:id/quote-lock', protect, releaseBuildingQuoteLock)

/**
 * @swagger
 * /api/buildings/{id}/availability:
 *   put:
 *     summary: Update commercial availability status for one building (admin)
 *     tags: [Buildings]
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
 *             required: [availabilityStatus]
 *             properties:
 *               availabilityStatus:
 *                 type: string
 *                 enum: [available, reserved, assigned, sold, disabled]
 *               availabilityReason:
 *                 type: string
 *               assignment:
 *                 type: object
 *                 properties:
 *                   propertyId:
 *                     type: string
 *                   customerId:
 *                     type: string
 *                   assignedAt:
 *                     type: string
 *                     format: date-time
 *     responses:
 *       200:
 *         description: Availability updated
 *       400:
 *         description: Invalid availabilityStatus or invalid body
 *       404:
 *         description: Building not found
 */
router.put('/:id/availability', protect, admin, setBuildingAvailability)

/**
 * @swagger
 * /api/buildings/{id}/floor-plans:
 *   get:
 *     summary: Get floor plans for building
 *     tags: [Buildings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Floor plans payload { count, data }
 *   post:
 *     summary: Create or replace one floor plan by floorNumber
 *     tags: [Buildings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Floor plan replaced
 *       201:
 *         description: Floor plan created
 */
router.route('/:id/floor-plans')
  .get(protect, getBuildingFloorPlans)
  .post(protect, admin, createOrReplaceBuildingFloorPlan)

/**
 * @swagger
 * /api/buildings/{id}/floor-plans/{floorNumber}:
 *   put:
 *     summary: Update a floor plan
 *     tags: [Buildings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: floorNumber
 *         required: true
 *         schema:
 *           type: number
 *     responses:
 *       200:
 *         description: Floor plan updated
 *   delete:
 *     summary: Delete a floor plan
 *     tags: [Buildings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Floor plan deleted
 */
router.route('/:id/floor-plans/:floorNumber')
  .put(protect, admin, updateBuildingFloorPlan)
  .delete(protect, admin, deleteBuildingFloorPlan)

/**
 * @swagger
 * /api/buildings/{id}/floor-plans/{floorNumber}/polygons:
 *   get:
 *     summary: List polygons for one floor plan
 *     tags: [Buildings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Polygon list for floor plan
 *   post:
 *     summary: Create polygon on one floor plan
 *     tags: [Buildings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Polygon created
 */
router.route('/:id/floor-plans/:floorNumber/polygons')
  .get(protect, getFloorPlanPolygons)
  .post(protect, admin, createFloorPlanPolygon)

/**
 * @swagger
 * /api/buildings/{id}/floor-plans/{floorNumber}/polygons/{polygonId}:
 *   put:
 *     summary: Update polygon on one floor plan
 *     tags: [Buildings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Polygon updated
 *   delete:
 *     summary: Delete polygon on one floor plan
 *     tags: [Buildings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Polygon deleted
 */
router.route('/:id/floor-plans/:floorNumber/polygons/:polygonId')
  .put(protect, admin, updateFloorPlanPolygon)
  .delete(protect, admin, deleteFloorPlanPolygon)

export default router
