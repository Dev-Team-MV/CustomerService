import express from 'express'
import {
  getAllContracts,
  getContractsByPropertyId,
  getContractById,
  createContract,
  updateContract,
  deleteContract
} from '../controllers/contractController.js'
import { protect, admin } from '../middleware/authMiddleware.js'

const router = express.Router()

/**
 * @swagger
 * /api/contracts:
 *   get:
 *     summary: Get all contracts (optional filter by propertyId)
 *     tags: [Contracts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: propertyId
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of contract documents
 *   post:
 *     summary: Create or update contracts for a property (Admin only)
 *     tags: [Contracts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - propertyId
 *             properties:
 *               propertyId:
 *                 type: string
 *               contracts:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - type
 *                     - fileUrl
 *                   properties:
 *                     type:
 *                       type: string
 *                       enum: [promissoryNote, purchaseContract, agreement]
 *                     fileUrl:
 *                       type: string
 *                     uploadedAt:
 *                       type: string
 *                       format: date-time
 *     responses:
 *       201:
 *         description: Contracts created or updated
 *       404:
 *         description: Property not found
 */
router
  .route('/')
  .get(protect, getAllContracts)
  .post(protect, admin, createContract)

/**
 * @swagger
 * /api/contracts/property/{propertyId}:
 *   get:
 *     summary: Get contracts by property ID
 *     tags: [Contracts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: propertyId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Contract document for the property
 *       404:
 *         description: No contracts found for this property
 */
router.get('/property/:propertyId', protect, getContractsByPropertyId)

/**
 * @swagger
 * /api/contracts/{id}:
 *   get:
 *     summary: Get contract document by ID
 *     tags: [Contracts]
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
 *         description: Contract details
 *       404:
 *         description: Contract not found
 *   put:
 *     summary: Update contract (Admin only)
 *     tags: [Contracts]
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
 *               contracts:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     type:
 *                       type: string
 *                       enum: [promissoryNote, purchaseContract, agreement]
 *                     fileUrl:
 *                       type: string
 *                     uploadedAt:
 *                       type: string
 *                       format: date-time
 *     responses:
 *       200:
 *         description: Contract updated
 *       404:
 *         description: Contract not found
 *   delete:
 *     summary: Delete contract document (Admin only)
 *     tags: [Contracts]
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
 *         description: Contract deleted
 *       404:
 *         description: Contract not found
 */
router
  .route('/:id')
  .get(protect, getContractById)
  .put(protect, admin, updateContract)
  .delete(protect, admin, deleteContract)

export default router
