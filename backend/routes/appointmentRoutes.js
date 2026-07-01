import express from 'express'
import {
  getAppointments,
  createAppointment,
  updateAppointment,
  updateAppointmentStatus,
  deleteAppointment
} from '../controllers/appointmentController.js'
import { protect, superadmin } from '../middleware/authMiddleware.js'

const router = express.Router()

router.use(protect, superadmin)

router.get('/', getAppointments)
router.post('/', createAppointment)
router.put('/:id/status', updateAppointmentStatus)
router.put('/:id', updateAppointment)
router.delete('/:id', deleteAppointment)

export default router
