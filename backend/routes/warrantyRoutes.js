import express from 'express'
import {
  getWarranties,
  getWarrantyById,
  createWarranty,
  updateWarranty,
  resolveWarranty,
  deleteWarranty
} from '../controllers/warrantyController.js'
import { protect, admin } from '../middleware/authMiddleware.js'

const router = express.Router()

router.get('/', protect, getWarranties)
router.post('/', protect, createWarranty)

router.post('/:id/resolve', protect, admin, resolveWarranty)

router.get('/:id', protect, getWarrantyById)
router.put('/:id', protect, updateWarranty)
router.delete('/:id', protect, admin, deleteWarranty)

export default router
