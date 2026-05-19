import express from 'express'
import { getUploadTracker } from '../controllers/reportController.js'
import { protect } from '../middleware/authMiddleware.js'

const router = express.Router()

router.get('/upload-tracker', protect, getUploadTracker)

export default router
