import express from 'express'
import {
  getSurveys,
  getSurveyById,
  createSurvey,
  updateSurvey,
  deleteSurvey,
  getSurveyStats,
  getSurveyTemplates,
  getSurveyTemplateById,
  createSurveyTemplate,
  updateSurveyTemplate,
  deleteSurveyTemplate
} from '../controllers/surveyController.js'
import { protect, admin } from '../middleware/authMiddleware.js'

const router = express.Router()

/**
 * @swagger
 * /api/surveys/templates:
 *   get:
 *     summary: List survey templates
 *     description: Admins see all templates; users only see active ones (to answer them).
 *     tags: [Surveys]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: projectId
 *         schema: { type: string }
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [post_sale, post_construction, post_warranty, annual]
 *       - in: query
 *         name: isActive
 *         schema: { type: boolean }
 *     responses:
 *       200:
 *         description: Template list
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/SurveyTemplate'
 *   post:
 *     summary: Create survey template (Admin)
 *     description: Admin defines the questions users will answer.
 *     tags: [Surveys]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SurveyTemplateCreate'
 *     responses:
 *       201:
 *         description: Template created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SurveyTemplate'
 */
router.get('/templates', protect, getSurveyTemplates)
router.post('/templates', protect, admin, createSurveyTemplate)

/**
 * @swagger
 * /api/surveys/templates/{id}:
 *   get:
 *     summary: Get survey template by ID
 *     description: Users can only fetch active templates.
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
 *         description: Template found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SurveyTemplate'
 *       403:
 *         description: Template not active
 *       404:
 *         description: Not found
 *   put:
 *     summary: Update survey template (Admin)
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
 *             $ref: '#/components/schemas/SurveyTemplateCreate'
 *     responses:
 *       200:
 *         description: Template updated
 *   delete:
 *     summary: Delete survey template (Admin)
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
 *         description: Template deleted
 */
router.get('/templates/:id', protect, getSurveyTemplateById)
router.put('/templates/:id', protect, admin, updateSurveyTemplate)
router.delete('/templates/:id', protect, admin, deleteSurveyTemplate)

/**
 * @swagger
 * /api/surveys/stats/{projectId}:
 *   get:
 *     summary: Survey stats for a project (Admin)
 *     description: Averages and NPS. Users never see these numbers.
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
 *       - in: query
 *         name: templateId
 *         schema: { type: string }
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
 *     description: Non-admin users only see their own surveys (never aggregated stats).
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
 *         name: templateId
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
 *     summary: Answer satisfaction survey
 *     description: |
 *       Users must send templateId (admin-defined questions) and answer via responses keyed by questionKey.
 *       One response per client + template + unit. Free-form surveys (no templateId) are admin-only.
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
 *     description: |
 *       Users can only update rating/comment of their template answers plus overallRating/npsScore.
 *       Question text and type can only be changed by admins.
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
 *                 description: Admin only
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
