import express from 'express'
import {
  getAllPayloads,
  getPayloadById,
  createPayload,
  updatePayload,
  deletePayload,
  getPayloadStats
} from '../controllers/payloadController.js'
import { protect, admin } from '../middleware/authMiddleware.js'

const router = express.Router()

router.route('/')
  .get(protect, getAllPayloads)
  .post(protect, admin, createPayload)

router.get('/stats', protect, getPayloadStats)

router.route('/:id')
  .get(protect, getPayloadById)
  .put(protect, admin, updatePayload)
  .delete(protect, admin, deletePayload)

export default router
