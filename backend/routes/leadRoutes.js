import express from 'express'
import {
  getLeads,
  createLead,
  updateLead,
  updateLeadStage,
  deleteLead,
  convertLead
} from '../controllers/leadController.js'
import { protect, superadmin } from '../middleware/authMiddleware.js'

const router = express.Router()

router.use(protect, superadmin)

router.get('/', getLeads)
router.post('/', createLead)
router.put('/:id/stage', updateLeadStage)
router.put('/:id', updateLead)
router.delete('/:id', deleteLead)
router.post('/:id/convert', convertLead)

export default router
