import express from 'express'
import {
  getAllFacades,
  getFacadeById,
  getFacadesByModel,
  createFacade,
  updateFacade,
  deleteFacade
} from '../controllers/facadeController.js'
import {
  getFacadeDecks,
  addFacadeDeck,
  updateFacadeDeck,
  deleteFacadeDeck
} from '../controllers/deckController.js'
import { protect, admin } from '../middleware/authMiddleware.js'

const router = express.Router()

/**
 * @swagger
 * /api/facades:
 *   get:
 *     summary: Get all facades
 *     tags: [Facades]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: model
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of facades
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Facade'
 *   post:
 *     summary: Create a new facade (Admin only)
 *     tags: [Facades]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - model
 *               - title
 *               - url
 *               - price
 *             properties:
 *               model:
 *                 type: string
 *               title:
 *                 type: string
 *               url:
 *                 type: string
 *               price:
 *                 type: number
 *     responses:
 *       201:
 *         description: Facade created
 */
router.route('/')
  .get(protect, getAllFacades)
  .post(protect, admin, createFacade)

/**
 * @swagger
 * /api/facades/model/{modelId}:
 *   get:
 *     summary: Get all facades for a specific model
 *     tags: [Facades]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: modelId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of facades for the model
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Facade'
 *       404:
 *         description: Model not found
 */
router.get('/model/:modelId', protect, getFacadesByModel)

/**
 * @swagger
 * /api/facades/{id}:
 *   get:
 *     summary: Get facade by ID
 *     tags: [Facades]
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
 *         description: Facade details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Facade'
 *       404:
 *         description: Facade not found
 *   put:
 *     summary: Update facade (Admin only)
 *     tags: [Facades]
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
 *               model:
 *                 type: string
 *               title:
 *                 type: string
 *               url:
 *                 type: string
 *               price:
 *                 type: number
 *     responses:
 *       200:
 *         description: Facade updated
 *       404:
 *         description: Facade not found
 *   delete:
 *     summary: Delete facade (Admin only)
 *     tags: [Facades]
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
 *         description: Facade deleted
 *       404:
 *         description: Facade not found
 */
router.route('/:id')
  .get(protect, getFacadeById)
  .put(protect, admin, updateFacade)
  .delete(protect, admin, deleteFacade)

// ========== DECKS ROUTES ==========

/**
 * @swagger
 * /api/facades/{id}/decks:
 *   get:
 *     summary: Get all decks for a facade
 *     tags: [Facades]
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
 *         description: List of decks
 *       404:
 *         description: Facade not found
 *   post:
 *     summary: Add a deck to a facade (Admin only)
 *     tags: [Facades]
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
 *             required:
 *               - name
 *               - price
 *             properties:
 *               name:
 *                 type: string
 *               price:
 *                 type: number
 *               description:
 *                 type: string
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *               status:
 *                 type: string
 *                 enum: [active, inactive]
 *     responses:
 *       201:
 *         description: Deck added
 */
router.route('/:id/decks')
  .get(protect, getFacadeDecks)
  .post(protect, admin, addFacadeDeck)

/**
 * @swagger
 * /api/facades/{id}/decks/{deckId}:
 *   put:
 *     summary: Update a deck (Admin only)
 *     tags: [Facades]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: deckId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Deck updated
 *       404:
 *         description: Facade or Deck not found
 *   delete:
 *     summary: Delete a deck (Admin only)
 *     tags: [Facades]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: deckId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Deck deleted
 *       404:
 *         description: Facade or Deck not found
 */
router.route('/:id/decks/:deckId')
  .put(protect, admin, updateFacadeDeck)
  .delete(protect, admin, deleteFacadeDeck)

export default router
