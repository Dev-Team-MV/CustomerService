import express from 'express'
import {
  getChecklists,
  getChecklistById,
  getChecklistByProperty,
  getChecklistByApartment,
  createChecklist,
  updateChecklist,
  completeChecklistItem,
  deleteChecklist
} from '../controllers/onboardingController.js'
import { protect, admin } from '../middleware/authMiddleware.js'

const router = express.Router()

/**
 * @swagger
 * /api/onboarding:
 *   get:
 *     summary: List onboarding checklists
 *     description: Non-admin users only see their own checklists (as clientId).
 *     tags: [Onboarding]
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
 *         name: status
 *         schema:
 *           type: string
 *           enum: [not_started, in_progress, completed]
 *     responses:
 *       200:
 *         description: Checklist list
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/OnboardingChecklist'
 *   post:
 *     summary: Create onboarding checklist (Admin)
 *     description: >
 *       Creates checklist with default items if items not provided.
 *       Also auto-assigns the project's active post_sale survey template to the same
 *       client + propertyId/apartmentId as a pending SatisfactionSurvey (empty ratings).
 *       Client completes it later via PUT /api/surveys/{id}. If no active post_sale template
 *       exists, onboarding still succeeds and postSaleSurvey is null.
 *     tags: [Onboarding]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/OnboardingChecklistCreate'
 *     responses:
 *       201:
 *         description: Checklist created (includes postSaleSurvey when a template exists)
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/OnboardingChecklist'
 *                 - type: object
 *                   properties:
 *                     postSaleSurvey:
 *                       nullable: true
 *                       description: Pending post_sale survey linked to the same unit/client
 *                       allOf:
 *                         - $ref: '#/components/schemas/SatisfactionSurvey'
 *                     postSaleSurveyNote:
 *                       type: string
 *                       description: Present when survey was skipped or already existed
 *       400:
 *         description: Already exists or validation error
 */
router.get('/', protect, getChecklists)
router.post('/', protect, admin, createChecklist)

/**
 * @swagger
 * /api/onboarding/property/{propertyId}:
 *   get:
 *     summary: Get checklist by property
 *     tags: [Onboarding]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: propertyId
 *         required: true
 *         schema: { type: string }
 *       - in: query
 *         name: clientId
 *         schema: { type: string }
 *         description: Admin only; users are scoped to themselves
 *     responses:
 *       200:
 *         description: Checklist found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/OnboardingChecklist'
 *       404:
 *         description: Not found
 */
router.get('/property/:propertyId', protect, getChecklistByProperty)

/**
 * @swagger
 * /api/onboarding/apartment/{apartmentId}:
 *   get:
 *     summary: Get checklist by apartment
 *     tags: [Onboarding]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: apartmentId
 *         required: true
 *         schema: { type: string }
 *       - in: query
 *         name: clientId
 *         schema: { type: string }
 *         description: Admin only; users are scoped to themselves
 *     responses:
 *       200:
 *         description: Checklist found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/OnboardingChecklist'
 *       404:
 *         description: Not found
 */
router.get('/apartment/:apartmentId', protect, getChecklistByApartment)

/**
 * @swagger
 * /api/onboarding/{id}/items/{key}/complete:
 *   post:
 *     summary: Mark checklist item complete/incomplete (Admin)
 *     description: When all items are completed, fires onboarding_completed automation.
 *     tags: [Onboarding]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *       - in: path
 *         name: key
 *         required: true
 *         schema: { type: string }
 *         description: Item key e.g. contrato_firmado, llaves_entregadas
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               completed: { type: boolean, default: true }
 *               notes: { type: string }
 *               requiredDocumentId: { type: string, nullable: true }
 *     responses:
 *       200:
 *         description: Checklist updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/OnboardingChecklist'
 *       404:
 *         description: Checklist or item not found
 */
router.post('/:id/items/:key/complete', protect, admin, completeChecklistItem)

/**
 * @swagger
 * /api/onboarding/{id}:
 *   get:
 *     summary: Get checklist by ID
 *     tags: [Onboarding]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Checklist found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/OnboardingChecklist'
 *       403:
 *         description: Not authorized
 *       404:
 *         description: Not found
 *   put:
 *     summary: Update checklist (Admin)
 *     tags: [Onboarding]
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
 *               items:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/OnboardingChecklistItem'
 *               status:
 *                 type: string
 *                 enum: [not_started, in_progress, completed]
 *     responses:
 *       200:
 *         description: Checklist updated
 *   delete:
 *     summary: Delete checklist (Admin)
 *     tags: [Onboarding]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Checklist deleted
 */
router.get('/:id', protect, getChecklistById)
router.put('/:id', protect, admin, updateChecklist)
router.delete('/:id', protect, admin, deleteChecklist)

export default router
