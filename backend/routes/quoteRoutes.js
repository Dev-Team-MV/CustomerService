import express from 'express'
import {
  createQuote,
  generateQuotePreview,
  getQuotes,
  getQuoteById,
  updateQuote,
  deleteQuote,
  downloadQuotePdf,
  sendQuote,
  convertQuoteToSale,
  getQuotesByLead,
  getExpiredQuotes
} from '../controllers/quoteController.js'
import { protect, admin } from '../middleware/authMiddleware.js'

const router = express.Router()

router.use(protect, admin)

/**
 * @swagger
 * /api/quotes/preview:
 *   post:
 *     summary: Preview amortization schedule without saving
 *     tags: [Quotes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/QuotePreviewRequest'
 *     responses:
 *       200:
 *         description: Schedule preview
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AmortizationSchedule'
 */
router.post('/preview', generateQuotePreview)

/**
 * @swagger
 * /api/quotes/expired:
 *   get:
 *     summary: List expired quotes (also auto-marks past validUntil)
 *     tags: [Quotes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: projectId
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Expired quotes
 */
router.get('/expired', getExpiredQuotes)

/**
 * @swagger
 * /api/quotes/by-lead/{leadId}:
 *   get:
 *     summary: Quotes for a lead
 *     tags: [Quotes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: leadId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Quote list
 */
router.get('/by-lead/:leadId', getQuotesByLead)

/**
 * @swagger
 * /api/quotes:
 *   get:
 *     summary: List quotes
 *     tags: [Quotes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: projectId
 *         schema: { type: string }
 *       - in: query
 *         name: leadId
 *         schema: { type: string }
 *       - in: query
 *         name: clientId
 *         schema: { type: string }
 *       - in: query
 *         name: lotId
 *         schema: { type: string }
 *       - in: query
 *         name: buildingId
 *         schema: { type: string }
 *       - in: query
 *         name: apartmentId
 *         schema: { type: string }
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [draft, sent, accepted, expired, converted]
 *       - in: query
 *         name: page
 *         schema: { type: integer }
 *       - in: query
 *         name: limit
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Paginated quotes
 *   post:
 *     summary: Create a quote (lot OR apartment) with amortization schedule
 *     tags: [Quotes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/QuoteCreate'
 *           examples:
 *             lotQuote:
 *               summary: Lot-based quote
 *               value:
 *                 projectId: 69a73ce5b20401b061da6451
 *                 lotId: 69a73ce5b20401b061da6452
 *                 modelId: 69a73ce5b20401b061da6453
 *                 clientId: 698c91e893a47a1c786a6d4b
 *                 totalPrice: 250000
 *                 downPayment: 50000
 *                 interestRate: 8
 *                 termMonths: 60
 *             apartmentQuote:
 *               summary: Apartment-based quote (no lotId)
 *               value:
 *                 projectId: 69b9b2188186434073c6b13d
 *                 buildingId: 69bc65b85720650a73c7259e
 *                 apartmentId: 69bc70554857c845306adc0c
 *                 clientId: 698c91e893a47a1c786a6d4b
 *                 totalPrice: 200
 *                 downPayment: 0
 *                 interestRate: 5
 *                 termMonths: 5
 *                 amortizationMethod: fixed
 *                 status: draft
 *     responses:
 *       201:
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Quote'
 */
router.get('/', getQuotes)
router.post('/', createQuote)

/**
 * @swagger
 * /api/quotes/{id}:
 *   get:
 *     summary: Get quote by id
 *     tags: [Quotes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Quote
 *   put:
 *     summary: Update a quote (recalculates schedule if financing fields change)
 *     tags: [Quotes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/QuoteUpdate'
 *     responses:
 *       200:
 *         description: Updated
 *   delete:
 *     summary: Delete a quote (not converted)
 *     tags: [Quotes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Deleted
 */
router.get('/:id', getQuoteById)
router.put('/:id', updateQuote)
router.delete('/:id', deleteQuote)

/**
 * @swagger
 * /api/quotes/{id}/pdf:
 *   get:
 *     summary: Download quote PDF
 *     tags: [Quotes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: PDF file
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 */
router.get('/:id/pdf', downloadQuotePdf)

/**
 * @swagger
 * /api/quotes/{id}/send:
 *   post:
 *     summary: Send quote via email and/or SMS (generates PDF to GCS)
 *     tags: [Quotes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [method]
 *             properties:
 *               method:
 *                 type: string
 *                 enum: [email, sms, both]
 *               email: { type: string }
 *               phone: { type: string }
 *     responses:
 *       200:
 *         description: Quote sent
 *       400:
 *         description: Missing recipient or invalid method
 */
router.post('/:id/send', sendQuote)

/**
 * @swagger
 * /api/quotes/{id}/convert-to-sale:
 *   post:
 *     summary: Mark quote as converted (optionally link propertyId)
 *     tags: [Quotes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               propertyId:
 *                 type: string
 *                 description: Existing property to link; if omitted returns create hint
 *     responses:
 *       200:
 *         description: Converted
 */
router.post('/:id/convert-to-sale', convertQuoteToSale)

export default router
