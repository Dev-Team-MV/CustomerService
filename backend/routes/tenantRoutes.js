import express from 'express'
import {
  getAllTenants,
  getTenantById,
  createTenant,
  updateTenant,
  deleteTenant
} from '../controllers/tenantController.js'
import { protect, superadmin } from '../middleware/authMiddleware.js'

const router = express.Router()

router.route('/')
  .get(protect, getAllTenants)
  .post(protect, superadmin, createTenant)

router.route('/:id')
  .get(protect, getTenantById)
  .put(protect, superadmin, updateTenant)
  .delete(protect, superadmin, deleteTenant)

export default router
