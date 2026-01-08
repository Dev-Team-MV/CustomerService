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

router.route('/')
  .get(protect, getAllModels)
  .post(protect, admin, createModel)

router.route('/:id')
  .get(protect, getModelById)
  .put(protect, admin, updateModel)
  .delete(protect, admin, deleteModel)

export default router
