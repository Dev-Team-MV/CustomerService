import express from 'express'
import {
  getAllApartments,
  getApartmentById,
  createApartment,
  updateApartment,
  deleteApartment,
  getApartmentStats
} from '../controllers/apartmentController.js'
import {
  shareApartment,
  revokeApartmentShare,
  revokeApartmentShareByGroup,
  getApartmentShares
} from '../controllers/propertyShareController.js'
import { protect, admin } from '../middleware/authMiddleware.js'

const router = express.Router()

/**
 * @swagger
 * /api/apartments:
 *   get:
 *     summary: Get all apartments (optionally filtered)
 *     tags: [Apartments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: projectId
 *         schema:
 *           type: string
 *         description: Filter apartments by project ID
 *       - in: query
 *         name: buildingId
 *         schema:
 *           type: string
 *         description: Filter apartments by building ID
 *       - in: query
 *         name: apartmentModelId
 *         schema:
 *           type: string
 *         description: Filter apartments by apartment model ID
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [available, pending, sold, cancelled]
 *       - in: query
 *         name: user
 *         schema:
 *           type: string
 *         description: Filter by owner user ID
 *       - in: query
 *         name: floorNumber
 *         schema:
 *           type: number
 *         description: Filter by floor number (>= 1)
 *       - in: query
 *         name: floorPlanPolygonId
 *         schema:
 *           type: string
 *         description: Filter by floor plan polygon ID
 *       - in: query
 *         name: visible
 *         schema:
 *           type: boolean
 *         description: Restrict to apartments visible to current user
 *     responses:
 *       200:
 *         description: List of apartments
 *   post:
 *     summary: Create a new apartment (Admin only)
 *     tags: [Apartments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - apartmentModelId
 *               - floorNumber
 *               - apartmentNumber
 *               - price
 *             properties:
 *               apartmentModelId:
 *                 type: string
 *                 description: Apartment model ID (or use apartmentModel)
 *               apartmentModel:
 *                 type: string
 *                 description: Apartment model ID (alternative to apartmentModelId)
 *               building:
 *                 type: string
 *                 description: Optional building ID; must match apartment model building
 *               floorNumber:
 *                 type: number
 *                 minimum: 1
 *               apartmentNumber:
 *                 type: string
 *               floorPlanPolygonId:
 *                 type: string
 *                 description: Optional polygon ID in the floor plan for this floor
 *               interiorRendersBasic:
 *                 type: array
 *                 items:
 *                   type: string
 *               interiorRendersUpgrade:
 *                 type: array
 *                 items:
 *                   type: string
 *               polygon:
 *                 type: array
 *                 description: Polygon points [{x,y}, ...]
 *                 items:
 *                   type: object
 *                   properties:
 *                     x:
 *                       type: number
 *                     y:
 *                       type: number
 *               user:
 *                 type: string
 *                 description: Single owner user ID
 *               users:
 *                 type: array
 *                 description: Owner user IDs
 *                 items:
 *                   type: string
 *               price:
 *                 type: number
 *               initialPayment:
 *                 type: number
 *           examples:
 *             createApartmentWithUser:
 *               summary: Create and assign apartment to one user
 *               value:
 *                 apartmentModelId: 65f1a2b3c4d5e6f7890a1001
 *                 building: 65f1a2b3c4d5e6f7890a2001
 *                 floorNumber: 3
 *                 apartmentNumber: "301"
 *                 floorPlanPolygonId: poly-3-07
 *                 user: 65f1a2b3c4d5e6f7890a3001
 *                 price: 250000
 *                 initialPayment: 20000
 *             createApartmentWithMultipleOwners:
 *               summary: Create apartment with multiple owners
 *               value:
 *                 apartmentModelId: 65f1a2b3c4d5e6f7890a1001
 *                 floorNumber: 5
 *                 apartmentNumber: "502"
 *                 users:
 *                   - 65f1a2b3c4d5e6f7890a3001
 *                   - 65f1a2b3c4d5e6f7890a3002
 *                 price: 315000
 *                 initialPayment: 45000
 *     responses:
 *       201:
 *         description: Apartment created (9 phases are created automatically)
 */
router.route('/')
  .get(protect, getAllApartments)
  .post(protect, admin, createApartment)

/**
 * @swagger
 * /api/apartments/stats:
 *   get:
 *     summary: Get apartment statistics (optionally filtered)
 *     tags: [Apartments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: projectId
 *         schema:
 *           type: string
 *         description: Filter statistics by project ID
 *       - in: query
 *         name: buildingId
 *         schema:
 *           type: string
 *         description: Filter statistics by building ID
 *     responses:
 *       200:
 *         description: Apartment statistics (total, available, pending, sold, revenue, pending balance)
 */
router.get('/stats', protect, getApartmentStats)

/**
 * @swagger
 * /api/apartments/{id}/shares:
 *   get:
 *     summary: List shares for an apartment
 *     tags: [Apartments]
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
 *         description: List apartment shares
 */
router.get('/:id/shares', protect, getApartmentShares)

/**
 * @swagger
 * /api/apartments/{id}/share:
 *   post:
 *     summary: Share apartment with a user or family group
 *     tags: [Apartments]
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
 *               sharedWithUserId:
 *                 type: string
 *               familyGroupId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Share(s) created
 */
router.post('/:id/share', protect, shareApartment)

/**
 * @swagger
 * /api/apartments/{id}/share/group/{familyGroupId}:
 *   delete:
 *     summary: Revoke all apartment shares for a family group
 *     tags: [Apartments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: familyGroupId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Group shares revoked
 */
router.delete('/:id/share/group/:familyGroupId', protect, revokeApartmentShareByGroup)

/**
 * @swagger
 * /api/apartments/{id}/share/{userId}:
 *   delete:
 *     summary: Revoke apartment share for one user
 *     tags: [Apartments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Share revoked
 */
router.delete('/:id/share/:userId', protect, revokeApartmentShare)

/**
 * @swagger
 * /api/apartments/{id}:
 *   get:
 *     summary: Get apartment by ID
 *     tags: [Apartments]
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
 *         description: Apartment details (includes phases)
 *       404:
 *         description: Apartment not found
 *   put:
 *     summary: Update apartment (Admin only)
 *     tags: [Apartments]
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
 *               floorNumber:
 *                 type: number
 *               apartmentNumber:
 *                 type: string
 *               floorPlanPolygonId:
 *                 type: string
 *               interiorRendersBasic:
 *                 type: array
 *                 items:
 *                   type: string
 *               interiorRendersUpgrade:
 *                 type: array
 *                 items:
 *                   type: string
 *               polygon:
 *                 type: array
 *                 items:
 *                   type: object
 *               users:
 *                 type: array
 *                 items:
 *                   type: string
 *               price:
 *                 type: number
 *               pending:
 *                 type: number
 *               initialPayment:
 *                 type: number
 *               status:
 *                 type: string
 *                 enum: [available, pending, sold, cancelled]
 *               saleDate:
 *                 type: string
 *                 format: date-time
 *           examples:
 *             assignApartmentToUser:
 *               summary: Assign an existing apartment to one user
 *               value:
 *                 users:
 *                   - 65f1a2b3c4d5e6f7890a3001
 *                 status: pending
 *             updateFinancialsAndPolygon:
 *               summary: Update pricing and floor polygon assignment
 *               value:
 *                 floorPlanPolygonId: poly-4-03
 *                 price: 260000
 *                 initialPayment: 30000
 *                 pending: 230000
 *     responses:
 *       200:
 *         description: Apartment updated
 *       404:
 *         description: Apartment not found
 *   delete:
 *     summary: Delete apartment (Admin only)
 *     tags: [Apartments]
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
 *         description: Apartment deleted
 *       404:
 *         description: Apartment not found
 */
router.route('/:id')
  .get(protect, getApartmentById)
  .put(protect, admin, updateApartment)
  .delete(protect, admin, deleteApartment)

export default router
