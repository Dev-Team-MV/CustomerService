import express from 'express'
import {
  createFamilyGroup,
  getMyFamilyGroups,
  getFamilyGroupById,
  updateFamilyGroup,
  addMemberToFamilyGroup,
  removeMemberFromFamilyGroup,
  deleteFamilyGroup
} from '../controllers/familyGroupController.js'
import { protect } from '../middleware/authMiddleware.js'

const router = express.Router()

router.route('/')
  .get(protect, getMyFamilyGroups)
  .post(protect, createFamilyGroup)

router.route('/:id')
  .get(protect, getFamilyGroupById)
  .put(protect, updateFamilyGroup)
  .delete(protect, deleteFamilyGroup)

router.post('/:id/members', protect, addMemberToFamilyGroup)
router.delete('/:id/members/:userId', protect, removeMemberFromFamilyGroup)

export default router
