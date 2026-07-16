import express from 'express'
import {
  getChecklists,
  getChecklistById,
  getChecklistByProperty,
  createChecklist,
  updateChecklist,
  completeChecklistItem,
  deleteChecklist
} from '../controllers/onboardingController.js'
import { protect, admin } from '../middleware/authMiddleware.js'

const router = express.Router()

router.get('/', protect, getChecklists)
router.post('/', protect, admin, createChecklist)
router.get('/property/:propertyId', protect, getChecklistByProperty)

router.post('/:id/items/:key/complete', protect, admin, completeChecklistItem)

router.get('/:id', protect, getChecklistById)
router.put('/:id', protect, admin, updateChecklist)
router.delete('/:id', protect, admin, deleteChecklist)

export default router
