import express from 'express'
import {
  getSurveys,
  getSurveyById,
  createSurvey,
  updateSurvey,
  deleteSurvey,
  getSurveyStats
} from '../controllers/surveyController.js'
import { protect, admin } from '../middleware/authMiddleware.js'

const router = express.Router()

router.get('/stats/:projectId', protect, admin, getSurveyStats)

router.get('/', protect, getSurveys)
router.post('/', protect, createSurvey)

router.get('/:id', protect, getSurveyById)
router.put('/:id', protect, updateSurvey)
router.delete('/:id', protect, admin, deleteSurvey)

export default router
