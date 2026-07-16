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

// ─── Programs (admin) ────────────────────────────────────────────────────────
router.get('/programs', protect, admin, getReferralPrograms)
router.post('/programs', protect, admin, createReferralProgram)
router.get('/programs/:id', protect, admin, getReferralProgramById)
router.put('/programs/:id', protect, admin, updateReferralProgram)
router.delete('/programs/:id', protect, admin, deleteReferralProgram)

// ─── User-accessible ─────────────────────────────────────────────────────────
router.post('/submit', protect, submitReferral)
router.get('/by-referrer/:userId', protect, getReferralsByReferrer)
router.get('/stats/:projectId', protect, admin, getReferralStats)

// ─── Referral CRUD ───────────────────────────────────────────────────────────
router.get('/', protect, getReferrals)
router.post('/', protect, admin, createReferral)

router.post('/:id/convert', protect, admin, convertReferral)
router.post('/:id/approve-reward', protect, admin, approveReward)

router.get('/:id', protect, getReferralById)
router.put('/:id', protect, admin, updateReferral)
router.delete('/:id', protect, admin, deleteReferral)

export default router
