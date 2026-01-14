import express from 'express'
import {
  getAllLots,
  getLotById,
  createLot,
  updateLot,
  deleteLot,
  getLotStats
} from '../controllers/lotController.js'
import { protect, admin } from '../middleware/authMiddleware.js'

const router = express.Router()

// Public routes - anyone can view lots
router.get('/', getAllLots)
router.get('/stats', getLotStats)
router.get('/:id', getLotById)

// Protected routes - only authenticated users can modify
router.post('/', protect, admin, createLot)
router.put('/:id', protect, admin, updateLot)
router.delete('/:id', protect, admin, deleteLot)

export default router
