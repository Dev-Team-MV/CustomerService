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

router.route('/')
  .get(protect, getAllLots)
  .post(protect, admin, createLot)

router.get('/stats', protect, getLotStats)

router.route('/:id')
  .get(protect, getLotById)
  .put(protect, admin, updateLot)
  .delete(protect, admin, deleteLot)

export default router
