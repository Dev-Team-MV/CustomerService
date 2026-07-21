import express from 'express'
import {
  getReferralPrograms,
  getReferralProgramById,
  createReferralProgram,
  updateReferralProgram,
  deleteReferralProgram,
  getReferrals,
  getReferralById,
  createReferral,
  updateReferral,
  deleteReferral,
  submitReferral,
  convertReferral,
  approveReward,
  getReferralsByReferrer,
  getReferralStats
} from '../controllers/referralController.js'
import { protect, admin } from '../middleware/authMiddleware.js'

const router = express.Router()

/**
 * @swagger
 * /api/referrals/programs:
 *   get:
 *     summary: List referral programs
 *     tags: [Referrals]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: projectId
 *         schema: { type: string }
 *       - in: query
 *         name: isActive
 *         schema: { type: boolean }
 *     responses:
 *       200:
 *         description: Program list
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ReferralProgram'
 *   post:
 *     summary: Create referral program (Admin)
 *     tags: [Referrals]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ReferralProgramCreate'
 *     responses:
 *       201:
 *         description: Program created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ReferralProgram'
 */
router.get('/programs', protect, admin, getReferralPrograms)
router.post('/programs', protect, admin, createReferralProgram)

/**
 * @swagger
 * /api/referrals/programs/{id}:
 *   get:
 *     summary: Get referral program by ID
 *     tags: [Referrals]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Program found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ReferralProgram'
 *       404:
 *         description: Not found
 *   put:
 *     summary: Update referral program (Admin)
 *     tags: [Referrals]
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
 *             $ref: '#/components/schemas/ReferralProgramCreate'
 *     responses:
 *       200:
 *         description: Program updated
 *   delete:
 *     summary: Delete referral program (Admin)
 *     tags: [Referrals]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Program deleted
 */
router.get('/programs/:id', protect, admin, getReferralProgramById)
router.put('/programs/:id', protect, admin, updateReferralProgram)
router.delete('/programs/:id', protect, admin, deleteReferralProgram)

/**
 * @swagger
 * /api/referrals/submit:
 *   post:
 *     summary: Submit a referral (User or Admin)
 *     description: Creates a referral and a Lead with source referido. Requires an active program for the project.
 *     tags: [Referrals]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ReferralSubmit'
 *     responses:
 *       201:
 *         description: Referral submitted
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Referral'
 *       400:
 *         description: Validation error or no active program / max referrals reached
 */
router.post('/submit', protect, submitReferral)

/**
 * @swagger
 * /api/referrals/by-referrer/{userId}:
 *   get:
 *     summary: List referrals by referrer
 *     description: Users can only query their own userId; admins can query any.
 *     tags: [Referrals]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema: { type: string }
 *       - in: query
 *         name: projectId
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Referral list
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Referral'
 */
router.get('/by-referrer/:userId', protect, getReferralsByReferrer)

/**
 * @swagger
 * /api/referrals/stats/{projectId}:
 *   get:
 *     summary: Referral stats for a project (Admin)
 *     tags: [Referrals]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Stats
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ReferralStats'
 */
router.get('/stats/:projectId', protect, admin, getReferralStats)

/**
 * @swagger
 * /api/referrals:
 *   get:
 *     summary: List referrals
 *     description: Non-admin users only see their own referrals.
 *     tags: [Referrals]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: projectId
 *         schema: { type: string }
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, contacted, qualified, converted, reward_pending, reward_paid, expired]
 *       - in: query
 *         name: referrerId
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Referral list
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Referral'
 *   post:
 *     summary: Create referral manually (Admin)
 *     description: Also creates a CRM Lead (source referido) linked via referredLeadId, same as /submit. Active program is optional; its reward is used when rewardType/rewardAmount are omitted.
 *     tags: [Referrals]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [projectId, referredName]
 *             properties:
 *               referrerId: { type: string }
 *               projectId: { type: string }
 *               referredName: { type: string }
 *               referredPhone: { type: string }
 *               referredEmail: { type: string }
 *               rewardType: { type: string, enum: [cash, property_discount] }
 *               rewardAmount: { type: number }
 *               discountPercent: { type: number }
 *               status: { type: string }
 *               notes: { type: string }
 *     responses:
 *       201:
 *         description: Referral created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Referral'
 */
router.get('/', protect, getReferrals)
router.post('/', protect, admin, createReferral)

/**
 * @swagger
 * /api/referrals/{id}/convert:
 *   post:
 *     summary: Convert referral to sale (Admin)
 *     description: Sets status to converted, links sold property or apartment, fires referral_converted automation.
 *     tags: [Referrals]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ReferralConvert'
 *     responses:
 *       200:
 *         description: Referral converted
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Referral'
 */
router.post('/:id/convert', protect, admin, convertReferral)

/**
 * @swagger
 * /api/referrals/{id}/approve-reward:
 *   post:
 *     summary: Approve reward (Admin)
 *     description: |
 *       Cash: only allowed when the referrer has fully paid all their units (no pending balance); marks reward_paid.
 *       property_discount: requires discountBase (original_100|after_first_10) and the referrer's
 *       rewardPropertyId or rewardApartmentId. discountPercent is configured per project on the
 *       referral program and can be overridden in the request. Creates a signed Payload type
 *       "referral bonus" (UI label: Bonificación por referido) and reduces unit pending.
 *     tags: [Referrals]
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
 *             $ref: '#/components/schemas/ReferralApproveReward'
 *     responses:
 *       200:
 *         description: Reward approved
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Referral'
 */
router.post('/:id/approve-reward', protect, admin, approveReward)

/**
 * @swagger
 * /api/referrals/{id}:
 *   get:
 *     summary: Get referral by ID
 *     tags: [Referrals]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Referral found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Referral'
 *       403:
 *         description: Not authorized
 *       404:
 *         description: Not found
 *   put:
 *     summary: Update referral (Admin)
 *     tags: [Referrals]
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
 *               referredName: { type: string }
 *               referredPhone: { type: string }
 *               referredEmail: { type: string }
 *               status:
 *                 type: string
 *                 enum: [pending, contacted, qualified, converted, reward_pending, reward_paid, expired]
 *               rewardType: { type: string, enum: [cash, property_discount] }
 *               rewardAmount: { type: number }
 *               discountPercent: { type: number }
 *               referredLeadId: { type: string }
 *               notes: { type: string }
 *     responses:
 *       200:
 *         description: Referral updated
 *   delete:
 *     summary: Delete referral (Admin)
 *     tags: [Referrals]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Referral deleted
 */
router.get('/:id', protect, getReferralById)
router.put('/:id', protect, admin, updateReferral)
router.delete('/:id', protect, admin, deleteReferral)

export default router
