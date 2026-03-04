import express from 'express'
import { getCrmBalance, getCrmClients } from '../controllers/crmController.js'
import { protect, superadmin } from '../middleware/authMiddleware.js'

const router = express.Router()

/**
 * @swagger
 * /api/crm/balance:
 *   get:
 *     summary: Get consolidated balance by project and global (Superadmin only)
 *     tags: [CRM]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Balance by project and global totals (totalCollected from signed payloads, totalPending from properties)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CrmBalance'
 *       403:
 *         description: Not authorized as superadmin
 */
router.get('/balance', protect, superadmin, getCrmBalance)

/**
 * @swagger
 * /api/crm/clients:
 *   get:
 *     summary: Get unique clients (owners) across projects (Superadmin only)
 *     tags: [CRM]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: projectId
 *         schema:
 *           type: string
 *         description: Optional. Filter clients that own at least one property in this project.
 *     responses:
 *       200:
 *         description: List of unique clients with property count
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CrmClients'
 *       403:
 *         description: Not authorized as superadmin
 */
router.get('/clients', protect, superadmin, getCrmClients)

export default router
