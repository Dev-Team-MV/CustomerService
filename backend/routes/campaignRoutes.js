import express from 'express'
import {
  createCampaign,
  getCampaigns,
  previewCampaign,
  sendCampaign,
  getCampaignStatsById
} from '../controllers/campaignController.js'
import { protect, superadmin } from '../middleware/authMiddleware.js'
import { logAction } from '../middleware/logAction.js'
import { fetchCampaign } from '../utils/auditEntityFetchers.js'

const router = express.Router()

router.use(protect, superadmin)

/**
 * @swagger
 * /api/crm/campaigns:
 *   get:
 *     summary: List SMS campaigns with stats
 *     tags: [CRM Campaigns]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [borrador, programada, enviando, completada, fallida]
 *       - in: query
 *         name: projectId
 *         schema: { type: string }
 *         description: Filter by audience.projectId
 *     responses:
 *       200:
 *         description: Campaign list
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CampaignsList'
 *       403:
 *         description: Not authorized as superadmin
 *   post:
 *     summary: Create an SMS campaign
 *     tags: [CRM Campaigns]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CampaignCreateRequest'
 *           example:
 *             name: Promo visitas marzo
 *             templateId: 664abc111111111111111111
 *             audience:
 *               type: leads
 *               projectId: 664def111111111111111111
 *               stage: contactado
 *               filters:
 *                 source: web
 *             status: borrador
 *     responses:
 *       201:
 *         description: Campaign created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Campaign'
 *       400:
 *         description: Validation error
 *       404:
 *         description: Template or project not found
 */
router.get('/', getCampaigns)
router.post(
  '/',
  logAction({
    action: 'created',
    entity: 'Campaign',
    getEntityId: (_, body) => body?._id
  }),
  createCampaign
)

/**
 * @swagger
 * /api/crm/campaigns/{id}/preview:
 *   post:
 *     summary: Preview campaign recipients and rendered messages
 *     tags: [CRM Campaigns]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Recipient preview (no SMS sent)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CampaignPreviewResponse'
 *       404:
 *         description: Campaign not found
 */
router.post('/:id/preview', previewCampaign)

/**
 * @swagger
 * /api/crm/campaigns/{id}/send:
 *   post:
 *     summary: Start campaign SMS send in background
 *     tags: [CRM Campaigns]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       202:
 *         description: Send job started
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CampaignSendResponse'
 *       400:
 *         description: Already sending, completed, or no recipients
 *       404:
 *         description: Campaign or template not found
 */
router.post(
  '/:id/send',
  logAction({
    action: 'sms_sent',
    entity: 'Campaign',
    fetchBefore: fetchCampaign,
    getEntityId: (req, body) => body?.campaignId || req.params.id,
    buildAfter: (_, body) => ({ status: body?.status, stats: body?.stats })
  }),
  sendCampaign
)

/**
 * @swagger
 * /api/crm/campaigns/{id}/stats:
 *   get:
 *     summary: Real-time campaign send progress
 *     tags: [CRM Campaigns]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Campaign progress
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CampaignStatsResponse'
 *       404:
 *         description: Campaign not found
 */
router.get('/:id/stats', getCampaignStatsById)

export default router
