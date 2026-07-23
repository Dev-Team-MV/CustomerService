import Quote, { QUOTE_STATUSES } from '../models/Quote.js'
import Project from '../models/Project.js'
import Lot from '../models/Lot.js'
import Model from '../models/Model.js'
import Facade from '../models/Facade.js'
import Building from '../models/Building.js'
import Apartment from '../models/Apartment.js'
import ApartmentModel from '../models/ApartmentModel.js'
import Lead from '../models/Lead.js'
import User from '../models/User.js'
import Property from '../models/Property.js'
import { isValidObjectId, parsePagination, buildPaginationMeta } from '../utils/crmHelpers.js'
import { generateSchedule } from '../services/amortizationService.js'
import { generateQuotePdf, generateQuotePdfBuffer } from '../services/quotePdfService.js'
import { uploadFile } from '../services/storageService.js'
import { sendEmail, isEmailConfigured } from '../services/emailService.js'
import { sendSMSWithValidation } from '../services/twilioService.js'
import { resolveApartmentSalePrice } from '../services/apartmentPricingService.js'
import { normalizeHouseOptions } from '../utils/houseOptions.js'
import { resolveSaleOwnerIds } from '../services/ensureLeadUserService.js'

const QUOTE_POPULATE = [
  { path: 'projectId', select: 'name slug title logo brandColors' },
  { path: 'lotId', select: 'number price status' },
  { path: 'modelId', select: 'model modelNumber price' },
  { path: 'facadeId', select: 'title price' },
  { path: 'buildingId', select: 'name project' },
  {
    path: 'apartmentId',
    select: 'apartmentNumber floorNumber price upgradePrice status building apartmentModel selectedRenderType'
  },
  { path: 'leadId', select: 'name email phone stage' },
  { path: 'clientId', select: 'firstName lastName email phoneNumber' },
  { path: 'createdBy', select: 'firstName lastName email' },
  { path: 'convertedToPropertyId', select: 'price status' },
  {
    path: 'convertedToApartmentId',
    select: 'apartmentNumber floorNumber price status selectedRenderType'
  }
]

/** Normalize optional ObjectId from front ("" / null / undefined → null) */
function optionalObjectId(value, fieldName) {
  if (value == null || value === '' || value === 'null' || value === 'undefined') {
    return { value: null }
  }
  if (typeof value === 'object' && value._id != null) value = value._id
  const id = String(value).trim()
  if (!id) return { value: null }
  if (!isValidObjectId(id)) return { error: `Invalid ${fieldName}` }
  return { value: id }
}

function optionalBalloonMonth(value) {
  if (value == null || value === '' || Number(value) < 1) return null
  return Number(value)
}

function normalizeSelectedRenderType(value) {
  if (value == null || value === '') return 'basic'
  const normalized = String(value).trim().toLowerCase()
  if (normalized === 'upgrade') return 'upgrade'
  if (normalized === 'basic') return 'basic'
  return { error: 'selectedRenderType must be basic or upgrade' }
}

function normalizeSelectedOptions(value) {
  if (value == null || value === '') return {}
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value)
      return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {}
    } catch {
      return {}
    }
  }
  if (typeof value === 'object' && !Array.isArray(value)) return value
  return {}
}

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
    building: doc.buildingId && typeof doc.buildingId === 'object' ? doc.buildingId : null,
    apartment: doc.apartmentId && typeof doc.apartmentId === 'object' ? doc.apartmentId : null,
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

/**
 * Resolve lot OR apartment target. Returns { error, status } or resolved ids.
 */
async function resolveQuoteTarget({
  projectId,
  lotId,
  modelId,
  facadeId,
  buildingId,
  apartmentId
}) {
  const lotNorm = optionalObjectId(lotId, 'lotId')
  if (lotNorm.error) return { error: lotNorm.error, status: 400 }
  const apartmentNorm = optionalObjectId(apartmentId, 'apartmentId')
  if (apartmentNorm.error) return { error: apartmentNorm.error, status: 400 }
  const buildingNorm = optionalObjectId(buildingId, 'buildingId')
  if (buildingNorm.error) return { error: buildingNorm.error, status: 400 }
  const modelNorm = optionalObjectId(modelId, 'modelId')
  if (modelNorm.error) return { error: modelNorm.error, status: 400 }
  const facadeNorm = optionalObjectId(facadeId, 'facadeId')
  if (facadeNorm.error) return { error: facadeNorm.error, status: 400 }

  const hasLot = Boolean(lotNorm.value)
  const hasApartment = Boolean(apartmentNorm.value)

  if (hasLot === hasApartment) {
    return {
      error: 'Provide exactly one of lotId (lot quote) or apartmentId (apartment quote)',
      status: 400
    }
  }

  if (hasLot) {
    const lotExists = await Lot.exists({ _id: lotNorm.value })
    if (!lotExists) return { error: 'Lot not found', status: 404 }
    if (modelNorm.value && !(await Model.exists({ _id: modelNorm.value }))) {
      return { error: 'Model not found', status: 404 }
    }
    if (facadeNorm.value && !(await Facade.exists({ _id: facadeNorm.value }))) {
      return { error: 'Facade not found', status: 404 }
    }
    return {
      lotId: lotNorm.value,
      modelId: modelNorm.value,
      facadeId: facadeNorm.value,
      buildingId: null,
      apartmentId: null
    }
  }

  // Apartment quote
  const apartment = await Apartment.findById(apartmentNorm.value)
    .select('building apartmentModel')
    .lean()
  if (!apartment) return { error: 'Apartment not found', status: 404 }

  let resolvedBuildingId = buildingNorm.value || (apartment.building ? String(apartment.building) : null)
  if (!resolvedBuildingId) {
    return { error: 'Apartment has no building; buildingId is required', status: 400 }
  }

  const building = await Building.findById(resolvedBuildingId).select('project').lean()
  if (!building) return { error: 'Building not found', status: 404 }

  if (String(building.project) !== String(projectId)) {
    return { error: 'Building does not belong to this project', status: 400 }
  }

  if (
    apartment.building &&
    String(apartment.building) !== String(resolvedBuildingId)
  ) {
    return { error: 'Apartment does not belong to the given building', status: 400 }
  }

  return {
    lotId: null,
    modelId: null,
    facadeId: null,
    buildingId: resolvedBuildingId,
    apartmentId: apartmentNorm.value
  }
}

export const createQuote = async (req, res) => {
  try {
    const {
      projectId,
      lotId,
      modelId,
      facadeId,
      buildingId,
      apartmentId,
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

    const projectNorm = optionalObjectId(projectId, 'projectId')
    if (projectNorm.error || !projectNorm.value) {
      return res.status(400).json({ message: projectNorm.error || 'Valid projectId is required' })
    }

    const leadNorm = optionalObjectId(req.body.leadId, 'leadId')
    if (leadNorm.error) return res.status(400).json({ message: leadNorm.error })
    const clientNorm = optionalObjectId(req.body.clientId, 'clientId')
    if (clientNorm.error) return res.status(400).json({ message: clientNorm.error })

    if (termMonths == null || Number(termMonths) < 1) {
      return res.status(400).json({ message: 'termMonths must be >= 1' })
    }

    const projectExists = await Project.exists({ _id: projectNorm.value })
    if (!projectExists) return res.status(404).json({ message: 'Project not found' })

    const target = await resolveQuoteTarget({
      projectId: projectNorm.value,
      lotId,
      modelId,
      facadeId,
      buildingId,
      apartmentId
    })
    if (target.error) return res.status(target.status).json({ message: target.error })

    if (leadNorm.value && !(await Lead.exists({ _id: leadNorm.value }))) {
      return res.status(404).json({ message: 'Lead not found' })
    }
    if (clientNorm.value && !(await User.exists({ _id: clientNorm.value }))) {
      return res.status(404).json({ message: 'Client not found' })
    }

    if (status && !QUOTE_STATUSES.includes(status)) {
      return res.status(400).json({ message: `Invalid status. Allowed: ${QUOTE_STATUSES.join(', ')}` })
    }

    const renderType = normalizeSelectedRenderType(req.body.selectedRenderType)
    if (renderType.error) return res.status(400).json({ message: renderType.error })

    const deckNorm = optionalObjectId(req.body.deckId, 'deckId')
    if (deckNorm.error) return res.status(400).json({ message: deckNorm.error })

    const houseOptions = normalizeHouseOptions(req.body)

    let resolvedTotalPrice = totalPrice
    if (
      (resolvedTotalPrice == null || resolvedTotalPrice === '') &&
      target.apartmentId
    ) {
      const apt = await Apartment.findById(target.apartmentId)
        .populate('apartmentModel', 'basePrice upgradePrice')
        .lean()
      if (!apt) return res.status(404).json({ message: 'Apartment not found' })
      const pricing = resolveApartmentSalePrice(apt, apt.apartmentModel, renderType)
      resolvedTotalPrice = pricing.listPrice
    }

    if (resolvedTotalPrice == null || !Number.isFinite(Number(resolvedTotalPrice))) {
      return res.status(400).json({ message: 'totalPrice is required' })
    }

    let scheduleResult
    try {
      scheduleResult = generateSchedule(
        resolvedTotalPrice,
        downPayment ?? 0,
        interestRate ?? 0,
        termMonths,
        {
          method: amortizationMethod === 'declining' ? 'declining' : 'fixed',
          balloonAmount: balloonAmount || 0,
          balloonMonth: optionalBalloonMonth(balloonMonth),
          startDate: startDate || undefined
        }
      )
    } catch (calcErr) {
      return res.status(400).json({ message: calcErr.message })
    }

    const quote = new Quote({
      leadId: leadNorm.value,
      clientId: clientNorm.value,
      projectId: projectNorm.value,
      lotId: target.lotId,
      modelId: target.modelId,
      facadeId: target.facadeId,
      buildingId: target.buildingId,
      apartmentId: target.apartmentId,
      selectedRenderType: target.apartmentId ? renderType : 'basic',
      selectedOptions: houseOptions.selectedOptions,
      hasBalcony: target.lotId ? houseOptions.hasBalcony : false,
      hasStorage: target.lotId ? houseOptions.hasStorage : false,
      modelType: target.lotId ? houseOptions.modelType : 'basic',
      deckId: deckNorm.value,
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
          balloonMonth: optionalBalloonMonth(balloonMonth),
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
    for (const key of ['projectId', 'leadId', 'clientId', 'lotId', 'buildingId', 'apartmentId']) {
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

    if (leadId !== undefined) {
      const norm = optionalObjectId(leadId, 'leadId')
      if (norm.error) return res.status(400).json({ message: norm.error })
      quote.leadId = norm.value
    }
    if (clientId !== undefined) {
      const norm = optionalObjectId(clientId, 'clientId')
      if (norm.error) return res.status(400).json({ message: norm.error })
      quote.clientId = norm.value
    }
    if (modelId !== undefined) {
      const norm = optionalObjectId(modelId, 'modelId')
      if (norm.error) return res.status(400).json({ message: norm.error })
      quote.modelId = norm.value
    }
    if (facadeId !== undefined) {
      const norm = optionalObjectId(facadeId, 'facadeId')
      if (norm.error) return res.status(400).json({ message: norm.error })
      quote.facadeId = norm.value
    }
    if (validUntil !== undefined) quote.validUntil = validUntil ? new Date(validUntil) : null
    if (termsAndConditions !== undefined) quote.termsAndConditions = termsAndConditions
    if (notes !== undefined) quote.notes = notes

    if (req.body.selectedRenderType !== undefined) {
      const renderType = normalizeSelectedRenderType(req.body.selectedRenderType)
      if (renderType.error) return res.status(400).json({ message: renderType.error })
      quote.selectedRenderType = renderType
    }
    if (req.body.selectedOptions !== undefined ||
      req.body.hasBalcony !== undefined ||
      req.body.hasStorage !== undefined ||
      req.body.modelType !== undefined ||
      req.body.modelBalconyId !== undefined ||
      req.body.modelStorageId !== undefined ||
      req.body.modelUpgradeId !== undefined
    ) {
      const houseOptions = normalizeHouseOptions({
        ...req.body,
        selectedOptions:
          req.body.selectedOptions !== undefined
            ? req.body.selectedOptions
            : quote.selectedOptions,
        hasBalcony:
          req.body.hasBalcony !== undefined ? req.body.hasBalcony : quote.hasBalcony,
        hasStorage:
          req.body.hasStorage !== undefined ? req.body.hasStorage : quote.hasStorage,
        modelType:
          req.body.modelType !== undefined ? req.body.modelType : quote.modelType
      })
      quote.selectedOptions = houseOptions.selectedOptions
      quote.hasBalcony = houseOptions.hasBalcony
      quote.hasStorage = houseOptions.hasStorage
      quote.modelType = houseOptions.modelType
      quote.markModified('selectedOptions')
    }
    if (req.body.deckId !== undefined) {
      const deckNorm = optionalObjectId(req.body.deckId, 'deckId')
      if (deckNorm.error) return res.status(400).json({ message: deckNorm.error })
      quote.deckId = deckNorm.value
    }

    if (
      req.body.lotId !== undefined ||
      req.body.apartmentId !== undefined ||
      req.body.buildingId !== undefined
    ) {
      const target = await resolveQuoteTarget({
        projectId: quote.projectId,
        lotId: req.body.lotId !== undefined ? req.body.lotId : quote.lotId,
        modelId: req.body.modelId !== undefined ? req.body.modelId : quote.modelId,
        facadeId: req.body.facadeId !== undefined ? req.body.facadeId : quote.facadeId,
        buildingId: req.body.buildingId !== undefined ? req.body.buildingId : quote.buildingId,
        apartmentId: req.body.apartmentId !== undefined ? req.body.apartmentId : quote.apartmentId
      })
      if (target.error) return res.status(target.status).json({ message: target.error })
      quote.lotId = target.lotId
      quote.modelId = target.modelId
      quote.facadeId = target.facadeId
      quote.buildingId = target.buildingId
      quote.apartmentId = target.apartmentId
    }

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
              balloonMonth !== undefined
                ? optionalBalloonMonth(balloonMonth)
                : quote.balloonMonth,
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

    const { propertyId, apartmentId: convertedApartmentId, applyApartmentSale } = req.body
    if (propertyId) {
      if (!isValidObjectId(propertyId)) {
        return res.status(400).json({ message: 'Invalid propertyId' })
      }
      const propertyExists = await Property.exists({ _id: propertyId })
      if (!propertyExists) return res.status(404).json({ message: 'Property not found' })
      quote.convertedToPropertyId = propertyId
    }

    let updatedApartment = null
    const isApartmentQuote = Boolean(quote.apartmentId)

    if (convertedApartmentId) {
      const aptNorm = optionalObjectId(convertedApartmentId, 'apartmentId')
      if (aptNorm.error) return res.status(400).json({ message: aptNorm.error })
      const apartmentExists = await Apartment.exists({ _id: aptNorm.value })
      if (!apartmentExists) return res.status(404).json({ message: 'Apartment not found' })
      quote.convertedToApartmentId = aptNorm.value
    }

    // Apply quoted options to the apartment sale when converting an apartment quote
    // (selectedRenderType basic/upgrade, negotiated price, client assignment).
    const shouldApplyApartment =
      isApartmentQuote &&
      applyApartmentSale !== false &&
      (convertedApartmentId || quote.apartmentId)

    // Resolve owner: clientId, or convert/link lead → User when quote was for a lead only
    const ownersResolved = await resolveSaleOwnerIds({
      ownerIds: quote.clientId ? [quote.clientId] : [],
      leadId: quote.clientId ? null : (quote.leadId || null),
      quoteId: quote._id,
      autoConvertLead: true,
      sendSms: true,
      actor: req.user
    })
    if (!ownersResolved.ok && (quote.clientId || quote.leadId)) {
      return res.status(ownersResolved.status).json({
        message: ownersResolved.message,
        leadId: ownersResolved.leadId,
        userId: ownersResolved.userId
      })
    }
    const ownerUserId = ownersResolved.ok ? ownersResolved.ownerIds[0] : null
    if (ownerUserId && !quote.clientId) {
      quote.clientId = ownerUserId
    }

    if (shouldApplyApartment) {
      const targetApartmentId = quote.convertedToApartmentId || quote.apartmentId
      const apartment = await Apartment.findById(targetApartmentId)
      if (!apartment) {
        return res.status(404).json({ message: 'Apartment not found for quote conversion' })
      }

      apartment.selectedRenderType = quote.selectedRenderType === 'upgrade' ? 'upgrade' : 'basic'
      const contracted = Number(quote.totalPrice)
      if (Number.isFinite(contracted) && contracted >= 0) {
        if (apartment.selectedRenderType === 'upgrade') {
          apartment.upgradePrice = contracted
        } else {
          apartment.price = contracted
        }
      }
      apartment.initialPayment = Number(quote.downPayment) || 0
      const model = await ApartmentModel.findById(apartment.apartmentModel)
        .select('basePrice upgradePrice')
        .lean()
      const pricing = resolveApartmentSalePrice(apartment, model, apartment.selectedRenderType)
      apartment.pending = Math.max(0, pricing.listPrice - apartment.initialPayment)
      if (ownerUserId) {
        const clientIdStr = String(ownerUserId)
        const existingUsers = (apartment.users || []).map((id) => String(id))
        if (!existingUsers.includes(clientIdStr)) {
          apartment.users = [...(apartment.users || []), ownerUserId]
        }
      }
      if (apartment.status === 'available') {
        apartment.status = 'pending'
      }
      await apartment.save()
      quote.convertedToApartmentId = apartment._id
      updatedApartment = apartment
    }

    quote.status = 'converted'
    await quote.save()
    await quote.populate(QUOTE_POPULATE)

    if (updatedApartment) {
      await updatedApartment.populate([
        { path: 'apartmentModel', select: 'name modelNumber' },
        { path: 'users', select: 'firstName lastName email' }
      ])
    }

    res.json({
      quote,
      apartment: updatedApartment,
      leadConversions: ownersResolved.ok ? ownersResolved.conversions : [],
      propertyCreateHint:
        propertyId || isApartmentQuote
          ? null
          : {
              projectId: quote.projectId,
              lot: quote.lotId,
              model: quote.modelId,
              facade: quote.facadeId,
              user: ownerUserId,
              users: ownerUserId ? [ownerUserId] : [],
              userId: ownerUserId,
              leadId: quote.leadId || null,
              initialPayment: quote.downPayment,
              price: quote.totalPrice,
              hasBalcony: quote.hasBalcony === true,
              hasStorage: quote.hasStorage === true,
              modelType: quote.modelType || 'basic',
              selectedOptions: quote.selectedOptions || {},
              deckId: quote.deckId || null,
              quoteId: quote._id
            },
      apartmentSaleHint: !isApartmentQuote
        ? null
        : {
            projectId: quote.projectId,
            buildingId: quote.buildingId,
            apartmentId: quote.apartmentId,
            user: ownerUserId,
            users: ownerUserId ? [ownerUserId] : [],
            userId: ownerUserId,
            leadId: quote.leadId || null,
            initialPayment: quote.downPayment,
            price: quote.totalPrice,
            selectedRenderType: quote.selectedRenderType || 'basic',
            quoteId: quote._id,
            applied: Boolean(updatedApartment)
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
