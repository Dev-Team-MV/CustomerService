import Quote, { QUOTE_STATUSES } from '../models/Quote.js'
import Project from '../models/Project.js'
import Lot from '../models/Lot.js'
import Model from '../models/Model.js'
import Facade from '../models/Facade.js'
import Lead from '../models/Lead.js'
import User from '../models/User.js'
import Property from '../models/Property.js'
import { isValidObjectId, parsePagination, buildPaginationMeta } from '../utils/crmHelpers.js'
import { generateSchedule } from '../services/amortizationService.js'
import { generateQuotePdf, generateQuotePdfBuffer } from '../services/quotePdfService.js'
import { uploadFile } from '../services/storageService.js'
import { sendEmail, isEmailConfigured } from '../services/emailService.js'
import { sendSMSWithValidation } from '../services/twilioService.js'

const QUOTE_POPULATE = [
  { path: 'projectId', select: 'name slug title logo brandColors' },
  { path: 'lotId', select: 'number price status' },
  { path: 'modelId', select: 'model modelNumber price' },
  { path: 'facadeId', select: 'title price' },
  { path: 'leadId', select: 'name email phone stage' },
  { path: 'clientId', select: 'firstName lastName email phoneNumber' },
  { path: 'createdBy', select: 'firstName lastName email' },
  { path: 'convertedToPropertyId', select: 'price status' }
]

async function buildQuotePdfPayload(quote) {
  const populated =
    quote.populate
      ? await quote.populate(QUOTE_POPULATE)
      : await Quote.findById(quote._id).populate(QUOTE_POPULATE)

  const doc = populated.toObject ? populated.toObject() : populated
  return {
    quote: doc,
    project: doc.projectId && typeof doc.projectId === 'object' ? doc.projectId : null,
    lot: doc.lotId && typeof doc.lotId === 'object' ? doc.lotId : null,
    model: doc.modelId && typeof doc.modelId === 'object' ? doc.modelId : null,
    facade: doc.facadeId && typeof doc.facadeId === 'object' ? doc.facadeId : null,
    lead: doc.leadId && typeof doc.leadId === 'object' ? doc.leadId : null,
    client: doc.clientId && typeof doc.clientId === 'object' ? doc.clientId : null,
    termsAndConditions: doc.termsAndConditions
  }
}

function applyScheduleToQuote(quote, scheduleResult) {
  quote.totalPrice = scheduleResult.totalPrice
  quote.downPayment = scheduleResult.downPayment
  quote.downPaymentPercentage = scheduleResult.downPaymentPercentage
  quote.financedAmount = scheduleResult.financedAmount
  quote.interestRate = scheduleResult.interestRate
  quote.termMonths = scheduleResult.termMonths
  quote.monthlyPayment = scheduleResult.monthlyPayment
  quote.schedule = scheduleResult.schedule
  quote.amortizationMethod = scheduleResult.method
  quote.balloonAmount = scheduleResult.balloonAmount
  quote.balloonMonth = scheduleResult.balloonMonth
}

export const createQuote = async (req, res) => {
  try {
    const {
      leadId,
      clientId,
      projectId,
      lotId,
      modelId,
      facadeId,
      totalPrice,
      downPayment,
      interestRate,
      termMonths,
      amortizationMethod,
      balloonAmount,
      balloonMonth,
      startDate,
      validUntil,
      termsAndConditions,
      notes,
      status
    } = req.body

    if (!isValidObjectId(projectId)) {
      return res.status(400).json({ message: 'Valid projectId is required' })
    }
    if (!isValidObjectId(lotId)) {
      return res.status(400).json({ message: 'Valid lotId is required' })
    }
    if (totalPrice == null || !Number.isFinite(Number(totalPrice))) {
      return res.status(400).json({ message: 'totalPrice is required' })
    }
    if (termMonths == null || Number(termMonths) < 1) {
      return res.status(400).json({ message: 'termMonths must be >= 1' })
    }

    const [projectExists, lotExists] = await Promise.all([
      Project.exists({ _id: projectId }),
      Lot.exists({ _id: lotId })
    ])
    if (!projectExists) return res.status(404).json({ message: 'Project not found' })
    if (!lotExists) return res.status(404).json({ message: 'Lot not found' })

    if (modelId && !(await Model.exists({ _id: modelId }))) {
      return res.status(404).json({ message: 'Model not found' })
    }
    if (facadeId && !(await Facade.exists({ _id: facadeId }))) {
      return res.status(404).json({ message: 'Facade not found' })
    }
    if (leadId && !(await Lead.exists({ _id: leadId }))) {
      return res.status(404).json({ message: 'Lead not found' })
    }
    if (clientId && !(await User.exists({ _id: clientId }))) {
      return res.status(404).json({ message: 'Client not found' })
    }

    if (status && !QUOTE_STATUSES.includes(status)) {
      return res.status(400).json({ message: `Invalid status. Allowed: ${QUOTE_STATUSES.join(', ')}` })
    }

    let scheduleResult
    try {
      scheduleResult = generateSchedule(
        totalPrice,
        downPayment ?? 0,
        interestRate ?? 0,
        termMonths,
        {
          method: amortizationMethod === 'declining' ? 'declining' : 'fixed',
          balloonAmount: balloonAmount || 0,
          balloonMonth: balloonMonth || null,
          startDate: startDate || undefined
        }
      )
    } catch (calcErr) {
      return res.status(400).json({ message: calcErr.message })
    }

    const quote = new Quote({
      leadId: leadId || null,
      clientId: clientId || null,
      projectId,
      lotId,
      modelId: modelId || null,
      facadeId: facadeId || null,
      status: status || 'draft',
      validUntil: validUntil ? new Date(validUntil) : null,
      termsAndConditions: termsAndConditions || '',
      notes: notes || '',
      createdBy: req.user._id
    })
    applyScheduleToQuote(quote, scheduleResult)
    await quote.save()
    await quote.populate(QUOTE_POPULATE)
    res.status(201).json(quote)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

/** Preview amortization without saving */
export const generateQuotePreview = async (req, res) => {
  try {
    const {
      totalPrice,
      downPayment,
      interestRate,
      termMonths,
      amortizationMethod,
      balloonAmount,
      balloonMonth,
      startDate
    } = req.body

    if (totalPrice == null || termMonths == null) {
      return res.status(400).json({ message: 'totalPrice and termMonths are required' })
    }

    try {
      const result = generateSchedule(
        totalPrice,
        downPayment ?? 0,
        interestRate ?? 0,
        termMonths,
        {
          method: amortizationMethod === 'declining' ? 'declining' : 'fixed',
          balloonAmount: balloonAmount || 0,
          balloonMonth: balloonMonth || null,
          startDate: startDate || undefined
        }
      )
      res.json(result)
    } catch (calcErr) {
      return res.status(400).json({ message: calcErr.message })
    }
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const getQuotes = async (req, res) => {
  try {
    const filter = {}
    for (const key of ['projectId', 'leadId', 'clientId', 'lotId']) {
      if (req.query[key]) {
        if (!isValidObjectId(req.query[key])) {
          return res.status(400).json({ message: `Invalid ${key}` })
        }
        filter[key] = req.query[key]
      }
    }
    if (req.query.status) {
      if (!QUOTE_STATUSES.includes(req.query.status)) {
        return res.status(400).json({ message: `Invalid status. Allowed: ${QUOTE_STATUSES.join(', ')}` })
      }
      filter.status = req.query.status
    }

    const { page, limit, skip } = parsePagination(req.query)
    const [quotes, total] = await Promise.all([
      Quote.find(filter)
        .populate(QUOTE_POPULATE)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Quote.countDocuments(filter)
    ])

    res.json({ quotes, pagination: buildPaginationMeta(total, page, limit) })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const getQuoteById = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid id' })
    }
    const quote = await Quote.findById(req.params.id).populate(QUOTE_POPULATE).lean()
    if (!quote) return res.status(404).json({ message: 'Quote not found' })
    res.json(quote)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const updateQuote = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid id' })
    }
    const quote = await Quote.findById(req.params.id)
    if (!quote) return res.status(404).json({ message: 'Quote not found' })
    if (quote.status === 'converted') {
      return res.status(400).json({ message: 'Converted quotes cannot be edited' })
    }

    const {
      leadId,
      clientId,
      modelId,
      facadeId,
      totalPrice,
      downPayment,
      interestRate,
      termMonths,
      amortizationMethod,
      balloonAmount,
      balloonMonth,
      startDate,
      validUntil,
      termsAndConditions,
      notes,
      status
    } = req.body

    if (status !== undefined) {
      if (!QUOTE_STATUSES.includes(status)) {
        return res.status(400).json({ message: `Invalid status. Allowed: ${QUOTE_STATUSES.join(', ')}` })
      }
      if (status === 'converted') {
        return res.status(400).json({ message: 'Use /convert-to-sale to convert a quote' })
      }
      quote.status = status
    }

    if (leadId !== undefined) quote.leadId = leadId || null
    if (clientId !== undefined) quote.clientId = clientId || null
    if (modelId !== undefined) quote.modelId = modelId || null
    if (facadeId !== undefined) quote.facadeId = facadeId || null
    if (validUntil !== undefined) quote.validUntil = validUntil ? new Date(validUntil) : null
    if (termsAndConditions !== undefined) quote.termsAndConditions = termsAndConditions
    if (notes !== undefined) quote.notes = notes

    const needsRecalc =
      totalPrice !== undefined ||
      downPayment !== undefined ||
      interestRate !== undefined ||
      termMonths !== undefined ||
      amortizationMethod !== undefined ||
      balloonAmount !== undefined ||
      balloonMonth !== undefined ||
      startDate !== undefined

    if (needsRecalc) {
      try {
        const scheduleResult = generateSchedule(
          totalPrice !== undefined ? totalPrice : quote.totalPrice,
          downPayment !== undefined ? downPayment : quote.downPayment,
          interestRate !== undefined ? interestRate : quote.interestRate,
          termMonths !== undefined ? termMonths : quote.termMonths,
          {
            method:
              (amortizationMethod || quote.amortizationMethod) === 'declining'
                ? 'declining'
                : 'fixed',
            balloonAmount:
              balloonAmount !== undefined ? balloonAmount : quote.balloonAmount,
            balloonMonth:
              balloonMonth !== undefined ? balloonMonth : quote.balloonMonth,
            startDate: startDate || undefined
          }
        )
        applyScheduleToQuote(quote, scheduleResult)
      } catch (calcErr) {
        return res.status(400).json({ message: calcErr.message })
      }
    }

    await quote.save()
    await quote.populate(QUOTE_POPULATE)
    res.json(quote)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const deleteQuote = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid id' })
    }
    const quote = await Quote.findById(req.params.id)
    if (!quote) return res.status(404).json({ message: 'Quote not found' })
    if (quote.status === 'converted') {
      return res.status(400).json({ message: 'Converted quotes cannot be deleted' })
    }
    await quote.deleteOne()
    res.json({ message: 'Quote deleted', id: quote._id })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const downloadQuotePdf = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid id' })
    }
    const quote = await Quote.findById(req.params.id)
    if (!quote) return res.status(404).json({ message: 'Quote not found' })

    const payload = await buildQuotePdfPayload(quote)
    generateQuotePdf(res, payload)
  } catch (error) {
    if (!res.headersSent) {
      res.status(500).json({ message: error.message })
    }
  }
}

export const sendQuote = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid id' })
    }

    const method = req.body.method || req.body.sentVia
    if (!method || !['email', 'sms', 'both'].includes(method)) {
      return res.status(400).json({ message: 'method must be email, sms, or both' })
    }

    const quote = await Quote.findById(req.params.id)
    if (!quote) return res.status(404).json({ message: 'Quote not found' })
    if (quote.status === 'expired' || quote.status === 'converted') {
      return res.status(400).json({ message: `Cannot send quote with status "${quote.status}"` })
    }

    const payload = await buildQuotePdfPayload(quote)
    const pdfBuffer = await generateQuotePdfBuffer(payload)

    const uploadResult = await uploadFile(
      pdfBuffer,
      `quote-${quote._id}-${Date.now()}.pdf`,
      'application/pdf',
      false,
      'quotes'
    )
    quote.pdfUrl = uploadResult.publicUrl || uploadResult.signedUrl

    const recipient = payload.client || payload.lead || {}
    const email = recipient.email || req.body.email
    const phone = recipient.phoneNumber || recipient.phone || req.body.phone
    const name =
      [recipient.firstName, recipient.lastName].filter(Boolean).join(' ') ||
      recipient.name ||
      'Customer'

    const results = { email: null, sms: null }

    if (method === 'email' || method === 'both') {
      if (!email) {
        return res.status(400).json({ message: 'No email available for recipient' })
      }
      if (!isEmailConfigured()) {
        return res.status(503).json({ message: 'Email service is not configured' })
      }
      // Plain text with link; PDF uploaded to GCS
      results.email = await sendEmail({
        to: email,
        subject: `Your quote from ${payload.project?.name || 'Lakewood Oaks'}`,
        text:
          `Hi ${name},\n\nPlease find your sales quote below.\n\n` +
          `Total: $${Number(quote.totalPrice).toLocaleString()}\n` +
          `Monthly payment: $${Number(quote.monthlyPayment).toLocaleString()}\n` +
          `Valid until: ${quote.validUntil ? new Date(quote.validUntil).toLocaleDateString() : 'N/A'}\n\n` +
          `PDF: ${quote.pdfUrl}\n\nThank you.`
      })
    }

    if (method === 'sms' || method === 'both') {
      if (!phone) {
        return res.status(400).json({ message: 'No phone available for recipient' })
      }
      const message =
        `Hi ${name}, your quote is ready. Total $${Number(quote.totalPrice).toLocaleString()}, ` +
        `monthly $${Number(quote.monthlyPayment).toLocaleString()}. ` +
        (quote.pdfUrl ? `PDF: ${quote.pdfUrl}` : '')
      results.sms = await sendSMSWithValidation(phone, message)
    }

    quote.sentVia = method
    if (quote.status === 'draft') quote.status = 'sent'
    await quote.save()
    await quote.populate(QUOTE_POPULATE)

    res.json({ quote, sent: results })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const convertQuoteToSale = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid id' })
    }
    const quote = await Quote.findById(req.params.id)
    if (!quote) return res.status(404).json({ message: 'Quote not found' })
    if (quote.status === 'converted') {
      return res.status(400).json({ message: 'Quote already converted' })
    }
    if (quote.status === 'expired') {
      return res.status(400).json({ message: 'Expired quotes cannot be converted' })
    }

    const { propertyId } = req.body
    if (propertyId) {
      if (!isValidObjectId(propertyId)) {
        return res.status(400).json({ message: 'Invalid propertyId' })
      }
      const propertyExists = await Property.exists({ _id: propertyId })
      if (!propertyExists) return res.status(404).json({ message: 'Property not found' })
      quote.convertedToPropertyId = propertyId
    }

    quote.status = 'converted'
    await quote.save()
    await quote.populate(QUOTE_POPULATE)

    res.json({
      quote,
      propertyCreateHint: propertyId
        ? null
        : {
            projectId: quote.projectId,
            lot: quote.lotId,
            model: quote.modelId,
            facade: quote.facadeId,
            user: quote.clientId,
            initialPayment: quote.downPayment,
            quoteId: quote._id
          }
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const getQuotesByLead = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.leadId)) {
      return res.status(400).json({ message: 'Invalid leadId' })
    }
    const quotes = await Quote.find({ leadId: req.params.leadId })
      .populate(QUOTE_POPULATE)
      .sort({ createdAt: -1 })
      .lean()
    res.json({ quotes, total: quotes.length })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const getExpiredQuotes = async (req, res) => {
  try {
    const now = new Date()
    const filter = {
      $or: [
        { status: 'expired' },
        {
          status: { $in: ['draft', 'sent', 'accepted'] },
          validUntil: { $ne: null, $lt: now }
        }
      ]
    }
    if (req.query.projectId) {
      if (!isValidObjectId(req.query.projectId)) {
        return res.status(400).json({ message: 'Invalid projectId' })
      }
      filter.projectId = req.query.projectId
    }

    const quotes = await Quote.find(filter)
      .populate(QUOTE_POPULATE)
      .sort({ validUntil: 1 })
      .lean()

    // Auto-mark as expired if past validUntil
    const idsToExpire = quotes
      .filter((q) => q.status !== 'expired' && q.validUntil && new Date(q.validUntil) < now)
      .map((q) => q._id)
    if (idsToExpire.length) {
      await Quote.updateMany({ _id: { $in: idsToExpire } }, { status: 'expired' })
      for (const q of quotes) {
        if (idsToExpire.some((id) => String(id) === String(q._id))) q.status = 'expired'
      }
    }

    res.json({ quotes, total: quotes.length })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}
