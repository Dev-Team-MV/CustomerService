import express from 'express'
import {
  createCommissionStructure,
  getCommissionStructures,
  getCommissionStructureById,
  updateCommissionStructure,
  deleteCommissionStructure
} from '../controllers/commissionController.js'
import { protect, admin } from '../middleware/authMiddleware.js'

const router = express.Router()

router.use(protect, admin)

/**
 * @swagger
 * /api/commission-structures:
 *   get:
 *     summary: List commission structures
 *     tags: [Commission Structures]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: projectId
 *         schema: { type: string }
 *       - in: query
 *         name: isDefault
 *         schema: { type: boolean }
 *     responses:
 *       200:
 *         description: Structure list
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 structures:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/CommissionStructure'
 *                 total: { type: integer }
 *   post:
 *     summary: Create a commission structure
 *     tags: [Commission Structures]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CommissionStructureCreate'
 *     responses:
 *       201:
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CommissionStructure'
 */
router.get('/', getCommissionStructures)
router.post('/', createCommissionStructure)

/**
 * @swagger
 * /api/commission-structures/{id}:
 *   get:
 *     summary: Get commission structure by id
 *     tags: [Commission Structures]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Structure
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CommissionStructure'
 *       404:
 *         description: Not found
 *   put:
 *     summary: Update commission structure
 *     tags: [Commission Structures]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CommissionStructureUpdate'
 *     responses:
 *       200:
 *         description: Updated
 *   delete:
 *     summary: Delete commission structure
 *     tags: [Commission Structures]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Deleted
 */
router.get('/:id', getCommissionStructureById)
router.put('/:id', updateCommissionStructure)
router.delete('/:id', deleteCommissionStructure)

export default router
