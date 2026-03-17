import express from 'express'
import {
  getAllApartments,
  getApartmentById,
  createApartment,
  updateApartment,
  deleteApartment,
  getApartmentStats
} from '../controllers/apartmentController.js'
import {
  shareApartment,
  revokeApartmentShare,
  revokeApartmentShareByGroup,
  getApartmentShares
} from '../controllers/propertyShareController.js'
import { protect, admin } from '../middleware/authMiddleware.js'

const router = express.Router()

router.route('/')
  .get(protect, getAllApartments)
  .post(protect, admin, createApartment)

router.get('/stats', protect, getApartmentStats)

router.get('/:id/shares', protect, getApartmentShares)
router.post('/:id/share', protect, shareApartment)
router.delete('/:id/share/group/:familyGroupId', protect, revokeApartmentShareByGroup)
router.delete('/:id/share/:userId', protect, revokeApartmentShare)

router.route('/:id')
  .get(protect, getApartmentById)
  .put(protect, admin, updateApartment)
  .delete(protect, admin, deleteApartment)

export default router
