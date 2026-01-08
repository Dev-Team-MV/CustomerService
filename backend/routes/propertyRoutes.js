import express from 'express'
import {
  getAllProperties,
  getPropertyById,
  createProperty,
  updateProperty,
  deleteProperty,
  getPropertyStats
} from '../controllers/propertyController.js'
import { protect, admin } from '../middleware/authMiddleware.js'

const router = express.Router()

router.route('/')
  .get(protect, getAllProperties)
  .post(protect, admin, createProperty)

router.get('/stats', protect, getPropertyStats)

router.route('/:id')
  .get(protect, getPropertyById)
  .put(protect, admin, updateProperty)
  .delete(protect, admin, deleteProperty)

export default router
