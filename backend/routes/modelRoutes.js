import express from 'express'
import {
  getAllModels,
  getModelById,
  createModel,
  updateModel,
  deleteModel
} from '../controllers/modelController.js'
import { protect, admin } from '../middleware/authMiddleware.js'

const router = express.Router()

// Public routes - anyone can view models
router.get('/', getAllModels)
router.get('/:id', getModelById)

// Protected routes - only authenticated users can modify
router.post('/', protect, admin, createModel)
router.put('/:id', protect, admin, updateModel)
router.delete('/:id', protect, admin, deleteModel)

export default router
