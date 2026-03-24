import express from 'express'
import {
  getAllContracts,
  getContractsByPropertyId,
  getContractsByApartmentId,
  getContractById,
  createContract,
  updateContract,
  updateContractByPropertyId,
  updateContractByApartmentId,
  deleteContract,
  downloadContractByPropertyAndType,
  downloadContractByApartmentAndType
} from '../controllers/contractController.js'
import { protect, admin } from '../middleware/authMiddleware.js'

const router = express.Router()

/**
 * @swagger
 * /api/contracts:
 *   get:
 *     summary: Get all contracts (optional filter by propertyId or apartmentId)
 *     tags: [Contracts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: propertyId
 *         schema:
 *           type: string
 *         description: Filter by Property (lotes/casas)
 *       - in: query
 *         name: apartmentId
 *         schema:
 *           type: string
 *         description: Filter by Apartment (phase 2)
 *     responses:
 *       200:
 *         description: List of contract documents
 *   post:
 *     summary: Create or merge contracts for a property OR an apartment (Admin only)
 *     description: Send exactly one of propertyId or apartmentId (not both).
 *     tags: [Contracts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               propertyId:
 *                 type: string
 *                 description: Property _id (lotes/casas). Mutually exclusive with apartmentId.
 *               apartmentId:
 *                 type: string
 *                 description: Apartment _id. Mutually exclusive with propertyId.
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
 *           examples:
 *             forProperty:
 *               summary: Contratos para una Property
 *               value:
 *                 propertyId: 65f1a2b3c4d5e6f7890a1111
 *                 contracts:
 *                   - type: purchaseContract
 *                     fileUrl: contracts/property-abc.pdf
 *             forApartment:
 *               summary: Contratos para un Apartment
 *               value:
 *                 apartmentId: 65f1a2b3c4d5e6f7890a2222
 *                 contracts:
 *                   - type: promissoryNote
 *                     fileUrl: contracts/apt-301.pdf
 *     responses:
 *       201:
 *         description: Contracts created or updated
 *       400:
 *         description: Exactly one of propertyId or apartmentId required
 *       404:
 *         description: Property or Apartment not found
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
 * /api/contracts/apartment/{apartmentId}:
 *   get:
 *     summary: Get contracts by apartment ID
 *     tags: [Contracts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: apartmentId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Contract document for the apartment
 *       404:
 *         description: No contracts found for this apartment
 */
router.get('/apartment/:apartmentId', protect, getContractsByApartmentId)

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
 * /api/contracts/apartment/{apartmentId}:
 *   put:
 *     summary: Add or update contract types for an apartment (Admin only). Merges by type.
 *     tags: [Contracts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: apartmentId
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
 *         description: No contracts for this apartment; use POST to create first
 */
router.put('/apartment/:apartmentId', protect, admin, updateContractByApartmentId)

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
 * /api/contracts/apartment/{apartmentId}/download/{type}:
 *   get:
 *     summary: Download contract file by apartment and type (proxy; avoids CORS)
 *     tags: [Contracts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: apartmentId
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
 *         description: No contract found for this apartment/type
 */
router.get('/apartment/:apartmentId/download/:type', protect, downloadContractByApartmentAndType)

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
