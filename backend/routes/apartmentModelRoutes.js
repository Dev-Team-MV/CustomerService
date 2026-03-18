import express from 'express'
import {
  getAllApartmentModels,
  getApartmentModelById,
  createApartmentModel,
  updateApartmentModel,
  deleteApartmentModel
} from '../controllers/apartmentModelController.js'
import { protect, admin } from '../middleware/authMiddleware.js'

const router = express.Router()

router.route('/')
  .get(protect, getAllApartmentModels)
  .post(protect, admin, createApartmentModel)

router.route('/:id')
  .get(protect, getApartmentModelById)
  .put(protect, admin, updateApartmentModel)
  .delete(protect, admin, deleteApartmentModel)

export default router
