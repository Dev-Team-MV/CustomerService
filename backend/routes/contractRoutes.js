import express from 'express'
import {
  getAllContracts,
  getContractsByPropertyId,
  getContractById,
  createContract,
  updateContract,
  updateContractByPropertyId,
  deleteContract,
  downloadContractByPropertyAndType
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
 * /api/contracts/property/{propertyId}:
 *   put:
 *     summary: Add or update contract types for a property (Admin only). Merges by type; send only the type(s) to add or update.
 *     tags: [Contracts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: propertyId
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
 *       200:
 *         description: Contracts merged (added/updated by type)
 *       404:
 *         description: No contracts for this property; use POST to create first
 */
router.put('/property/:propertyId', protect, admin, updateContractByPropertyId)

/**
 * @swagger
 * /api/contracts/property/{propertyId}/download/{type}:
 *   get:
 *     summary: Download contract file by property and type (proxy; avoids CORS)
 *     tags: [Contracts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: propertyId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *           enum: [promissoryNote, purchaseContract, agreement]
 *     responses:
 *       200:
 *         description: File stream (attachment)
 *       404:
 *         description: No contract found for this property/type
 */
router.get('/property/:propertyId/download/:type', protect, downloadContractByPropertyAndType)

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
 *                 description: Items to add or update by type (merge). Send only the type(s) you want to add or change.
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
 *       200:
 *         description: Contract updated (merged by type)
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
