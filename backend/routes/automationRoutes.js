import express from 'express'
import {
  getAutomations,
  getAutomationById,
  createAutomation,
  updateAutomation,
  deleteAutomation,
  testAutomation
} from '../controllers/automationController.js'
import { protect, superadmin } from '../middleware/authMiddleware.js'

const router = express.Router()

router.use(protect, superadmin)

router.get('/', getAutomations)
router.post('/', createAutomation)
router.post('/:id/test', testAutomation)
router.get('/:id', getAutomationById)
router.put('/:id', updateAutomation)
router.delete('/:id', deleteAutomation)

export default router
