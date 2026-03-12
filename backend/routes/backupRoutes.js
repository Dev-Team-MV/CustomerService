import express from 'express'
import { runManualBackup, enableBucketVersioning } from '../controllers/backupController.js'
import { protect, admin } from '../middleware/authMiddleware.js'

const router = express.Router()

/**
 * @swagger
 * /api/backup/run:
 *   post:
 *     summary: Run GCS backup manually (Admin only)
 *     tags: [Backup]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Backup completed successfully
 *       207:
 *         description: Backup completed with some errors
 *       500:
 *         description: Backup failed
 */
router.post('/run', protect, admin, runManualBackup)

/**
 * @swagger
 * /api/backup/enable-versioning:
 *   post:
 *     summary: Enable object versioning on GCS bucket (Admin only)
 *     tags: [Backup]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Versioning enabled
 *       500:
 *         description: Failed to enable versioning
 */
router.post('/enable-versioning', protect, admin, enableBucketVersioning)

export default router
