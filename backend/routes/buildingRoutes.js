import express from 'express'
import {
  getAllBuildings,
  getBuildingById,
  createBuilding,
  updateBuilding,
  deleteBuilding
} from '../controllers/buildingController.js'
import { protect, admin } from '../middleware/authMiddleware.js'

const router = express.Router()

router.route('/')
  .get(protect, getAllBuildings)
  .post(protect, admin, createBuilding)

router.route('/:id')
  .get(protect, getBuildingById)
  .put(protect, admin, updateBuilding)
  .delete(protect, admin, deleteBuilding)

export default router
