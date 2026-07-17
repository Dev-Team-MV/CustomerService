import express from 'express'
import {
  getSurveys,
  getSurveyById,
  createSurvey,
  updateSurvey,
  deleteSurvey,
  getSurveyStats
} from '../controllers/surveyController.js'
import { protect, admin } from '../middleware/authMiddleware.js'

const router = express.Router()

/**
 * @swagger
 * /api/surveys/stats/{projectId}:
 *   get:
 *     summary: Survey stats for a project (Admin)
 *     tags: [Surveys]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema: { type: string }
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [post_sale, post_construction, post_warranty, annual]
 *     responses:
 *       200:
 *         description: Stats
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SurveyStats'
 */
router.get('/stats/:projectId', protect, admin, getSurveyStats)

/**
 * @swagger
 * /api/surveys:
 *   get:
 *     summary: List satisfaction surveys
 *     description: Non-admin users only see their own surveys.
 *     tags: [Surveys]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: projectId
 *         schema: { type: string }
 *       - in: query
 *         name: propertyId
 *         schema: { type: string }
 *       - in: query
 *         name: apartmentId
 *         schema: { type: string }
 *       - in: query
 *         name: clientId
 *         schema: { type: string }
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [post_sale, post_construction, post_warranty, annual]
 *     responses:
 *       200:
 *         description: Survey list
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/SatisfactionSurvey'
 *   post:
 *     summary: Submit satisfaction survey
 *     tags: [Surveys]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SatisfactionSurveyCreate'
 *     responses:
 *       201:
 *         description: Survey created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SatisfactionSurvey'
 */
router.get('/', protect, getSurveys)
router.post('/', protect, createSurvey)

/**
 * @swagger
 * /api/surveys/{id}:
 *   get:
 *     summary: Get survey by ID
 *     tags: [Surveys]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Survey found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SatisfactionSurvey'
 *       403:
 *         description: Not authorized
 *       404:
 *         description: Not found
 *   put:
 *     summary: Update survey
 *     tags: [Surveys]
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
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [post_sale, post_construction, post_warranty, annual]
 *               responses:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/SurveyResponseItem'
 *               overallRating: { type: integer, minimum: 1, maximum: 5 }
 *               npsScore: { type: integer, minimum: 0, maximum: 10 }
 *     responses:
 *       200:
 *         description: Survey updated
 *   delete:
 *     summary: Delete survey (Admin)
 *     tags: [Surveys]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Survey deleted
 */
router.get('/:id', protect, getSurveyById)
router.put('/:id', protect, updateSurvey)
router.delete('/:id', protect, admin, deleteSurvey)

export default router
