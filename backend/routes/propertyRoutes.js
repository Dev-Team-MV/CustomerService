import express from 'express'
import {
  getAllProperties,
  getPropertyById,
  getPropertyQuote,
  createProperty,
  updateProperty,
  deleteProperty,
  getPropertyStats
} from '../controllers/propertyController.js'
import {
  shareProperty,
  revokePropertyShare,
  revokePropertyShareByGroup,
  getPropertyShares
} from '../controllers/propertyShareController.js'
import { protect, admin } from '../middleware/authMiddleware.js'

const router = express.Router()

/**
 * @swagger
 * /api/properties:
 *   get:
 *     summary: Get all properties (optionally filter by project)
 *     tags: [Properties]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: projectId
 *         schema:
 *           type: string
 *         description: Filter properties by project ID (multi-tenant)
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, pending, sold, cancelled]
 *       - in: query
 *         name: user
 *         schema:
 *           type: string
 *         description: Filter by owner user ID (admin only)
 *     responses:
 *       200:
 *         description: List of properties
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Property'
 *   post:
 *     summary: Create a new property (Admin only)
 *     tags: [Properties]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - projectId
 *               - lot
 *               - model
 *               - facade
 *             properties:
 *               projectId:
 *                 type: string
 *                 description: Project ID (or use "project"). Lot, model and facade must belong to this project.
 *               project:
 *                 type: string
 *                 description: Project ID (alternative to projectId)
 *               lot:
 *                 type: string
 *               model:
 *                 type: string
 *               facade:
 *                 type: string
 *               user:
 *                 type: string
 *                 description: Single owner (use users for multiple)
 *               users:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Owner user IDs (at least one of user or users required)
 *               initialPayment:
 *                 type: number
 *                 description: Initial payment amount (price and pending will be calculated automatically as lot.price + model.price + facade.price)
 *     responses:
 *       201:
 *         description: Property created (9 phases will be automatically created)
 */
router.route('/')
  .get(protect, getAllProperties)
  .post(protect, admin, createProperty)

/**
 * @swagger
 * /api/properties/quote:
 *   post:
 *     summary: Calculate property quote without creating it
 *     tags: [Properties]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PropertyQuoteRequest'
 *     responses:
 *       200:
 *         description: Quote calculated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PropertyQuoteResponse'
 */
router.post('/quote', getPropertyQuote)

/**
 * @swagger
 * /api/properties/stats:
 *   get:
 *     summary: Get property statistics (optionally by project)
 *     tags: [Properties]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: projectId
 *         schema:
 *           type: string
 *         description: Filter stats by project ID
 *     responses:
 *       200:
 *         description: Property statistics (total, active, pending, sold, totalRevenue, pendingPayments)
 */
router.get('/stats', protect, getPropertyStats)

/**
 * @swagger
 * /api/properties/{id}/shares:
 *   get:
 *     summary: List shares for a property
 *     description: Property owners, superadmin, or (if the property is shared with you via a family group) group admins can list all shares.
 *     tags: [Properties]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         description: Property ID
 *     responses:
 *       200:
 *         description: List of shares (sharedWith, sharedBy, familyGroup)
 *       403:
 *         description: Not allowed to list shares for this property
 */
/**
 * @swagger
 * /api/properties/{id}/share:
 *   post:
 *     summary: Share property with a user or with a family group
 *     description: |
 *       Two modes:
 *       1) Share with one user (optional group tag): send sharedWithUserId; optionally familyGroupId to tag the share.
 *       2) Share with entire group: send only familyGroupId. Creates one share per group member (except owners). Idempotent for already-shared members.
 *     tags: [Properties]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         description: Property ID
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               sharedWithUserId:
 *                 type: string
 *                 description: User ID to share with (use this for single-user share)
 *               familyGroupId:
 *                 type: string
 *                 description: Family group ID; if sent alone, shares with all group members
 *     responses:
 *       201:
 *         description: Share(s) created (single share object, or { message, count, shares } for group share)
 *       400:
 *         description: sharedWithUserId or familyGroupId required / already shared
 *       403:
 *         description: Only property owners or group admins can share
 *       404:
 *         description: Property / family group not found
 */
/**
 * @swagger
 * /api/properties/{id}/share/group/{familyGroupId}:
 *   delete:
 *     summary: Revoke all shares for this property for a family group
 *     description: Removes access for every group member in one call. Allowed for property owner, group admin, or superadmin.
 *     tags: [Properties]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *       - in: path
 *         name: familyGroupId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Revoked N share(s) for this group
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string }
 *                 deletedCount: { type: number }
 *       403:
 *         description: Only property owners or group admins can revoke
 *       404:
 *         description: Property or family group not found
 */
/**
 * @swagger
 * /api/properties/{id}/share/{userId}:
 *   delete:
 *     summary: Revoke share for one user
 *     tags: [Properties]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *       - in: path
 *         name: userId
 *         required: true
 *         schema: { type: string }
 *         description: sharedWith user ID
 *     responses:
 *       200:
 *         description: Share revoked successfully
 *       403:
 *         description: Not allowed to revoke this share
 *       404:
 *         description: Share not found
 */
// Share routes (must be before /:id)
router.get('/:id/shares', protect, getPropertyShares)
router.post('/:id/share', protect, shareProperty)
router.delete('/:id/share/group/:familyGroupId', protect, revokePropertyShareByGroup)
router.delete('/:id/share/:userId', protect, revokePropertyShare)

/**
 * @swagger
 * /api/properties/{id}:
 *   get:
 *     summary: Get property by ID (includes phases)
 *     tags: [Properties]
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
 *         description: Property details with phases
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Property'
 *                 - type: object
 *                   properties:
 *                     phases:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Phase'
 *       404:
 *         description: Property not found
 *   put:
 *     summary: Update property (Admin only)
 *     tags: [Properties]
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
 *               lot:
 *                 type: string
 *               model:
 *                 type: string
 *               facade:
 *                 type: string
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
 *                 enum: [active, pending, sold, cancelled]
 *               saleDate:
 *                 type: string
 *                 format: date-time
 *               hasBalcony:
 *                 type: boolean
 *               modelType:
 *                 type: string
 *                 enum: [basic, upgrade]
 *               hasStorage:
 *                 type: boolean
 *             description: Any combination of the above fields; only provided fields are updated.
 *     responses:
 *       200:
 *         description: Property updated
 *       404:
 *         description: Property not found
 *   delete:
 *     summary: Delete property (Admin only)
 *     tags: [Properties]
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
 *         description: Property deleted
 *       404:
 *         description: Property not found
 */
router.route('/:id')
  .get(protect, getPropertyById)
  .put(protect, admin, updateProperty)
  .delete(protect, admin, deleteProperty)

export default router
