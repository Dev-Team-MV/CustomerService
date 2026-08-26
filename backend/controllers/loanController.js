import crypto from 'crypto'
import path from 'path'
import mongoose from 'mongoose'
import Loan, {
  LOAN_PIPELINE_STAGES,
  LOAN_SPECIAL_STATUSES,
  LOAN_DOCUMENT_TYPES,
  LOAN_DOCUMENT_STATUSES,
  LOAN_TYPES,
  calcPercentComplete,
  buildDefaultDocumentChecklist
} from '../models/Loan.js'
import User from '../models/User.js'
import Project from '../models/Project.js'
import Property from '../models/Property.js'
import Apartment from '../models/Apartment.js'
import Building from '../models/Building.js'
import { isValidObjectId, parsePagination, buildPaginationMeta } from '../utils/crmHelpers.js'
import { uploadFile, deleteFile } from '../services/storageService.js'
import { computeLoanAlerts } from '../services/loanAlertService.js'

const USER_SELECT = 'firstName lastName email phoneNumber'
const MS_DAY = 24 * 60 * 60 * 1000
const TERMINAL_STATUSES = ['loan_denied', 'buyer_withdrawn', 'cancelled']

const POPULATE_FIELDS = [
  { path: 'buyer', select: USER_SELECT },
  { path: 'coBuyer', select: USER_SELECT },
  {
    path: 'propertyId',
    select: 'price status lot model project',
    populate: [
      { path: 'lot', select: 'number' },
      { path: 'model', select: 'model name' }
    ]
  },
  {
    path: 'apartmentId',
    select: 'apartmentNumber floorNumber price status building apartmentModel',
    populate: [
      { path: 'building', select: 'name project' },
      { path: 'apartmentModel', select: 'name modelNumber' }
    ]
  },
  { path: 'buildingId', select: 'name project' },
  { path: 'projectId', select: 'name slug title' },
  { path: 'assignedTo', select: USER_SELECT },
  { path: 'nextAction.responsiblePerson', select: USER_SELECT },
  { path: 'timeline.performedBy', select: USER_SELECT }
]

const PROFILE_FIELDS = [
  'buyer',
  'coBuyer',
  'buyerContactInfo',
  'projectId',
  'propertyId',
  'apartmentId',
  'buildingId',
  'propertyAddress',
  'purchasePrice',
  'loanAmount',
  'downPayment',
  'downPaymentPercent',
  'interestRate',
  'estimatedMonthlyPayment',
  'contractDate',
  'estimatedClosingDate',
  'loanType',
  'lender',
  'loanOfficer',
  'loanOfficerContact',
  'processor',
  'underwriter',
  'titleCompany',
  'insuranceCompany',
  'appraisalCompany',
  'assignedTo',
  'internalNotes'
]

function actorId(req) {
  return req.user?._id || null
}

function pushTimeline(loan, { action, description, performedBy, metadata = {} }) {
  loan.timeline.push({
    action,
    description,
    performedBy: performedBy || null,
    timestamp: new Date(),
    metadata
  })
}

function parseOptionalDate(value) {
  if (value === undefined) return { skip: true }
  if (value === null || value === '') return { value: null }
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return { error: 'Invalid date' }
  return { value: date }
}

const NEXT_ACTION_KEYS = ['description', 'responsiblePerson', 'deadline']

function isBareNextActionBody(body = {}) {
  const keys = Object.keys(body)
  if (!keys.length) return false
  return keys.every((key) => NEXT_ACTION_KEYS.includes(key))
}

function currentNextAction(loan) {
  const raw = loan.nextAction?.toObject?.({ depopulate: true }) || loan.nextAction || {}
  return {
    description: raw.description || '',
    responsiblePerson: raw.responsiblePerson || null,
    deadline: raw.deadline || null
  }
}

async function applyNextActionFields(loan, payload, req) {
  const source =
    payload?.nextAction && typeof payload.nextAction === 'object' ? payload.nextAction : payload
  const { description, responsiblePerson, deadline } = source || {}

  const refs = await validateRefs({ responsiblePerson })
  if (refs.error) return refs

  const parsedDeadline = parseOptionalDate(deadline)
  if (parsedDeadline.error) return { error: parsedDeadline.error, status: 400 }

  const next = currentNextAction(loan)
  if (description !== undefined) next.description = description
  if (responsiblePerson !== undefined) {
    next.responsiblePerson =
      responsiblePerson === '' || responsiblePerson === null ? null : responsiblePerson
  }
  if (!parsedDeadline.skip) next.deadline = parsedDeadline.value

  loan.nextAction = next
  loan.markModified('nextAction')

  pushTimeline(loan, {
    action: 'next_action_updated',
    description: next.description || 'Next action updated',
    performedBy: actorId(req),
    metadata: {
      description: next.description,
      responsiblePerson: next.responsiblePerson,
      deadline: next.deadline
    }
  })

  return { error: null }
}

function applyFinancialDefaults(data) {
  const purchasePrice = Number(data.purchasePrice) || 0
  const downPayment = Number(data.downPayment) || 0
  if (purchasePrice > 0 && data.downPaymentPercent == null) {
    data.downPaymentPercent = Math.round((downPayment / purchasePrice) * 10000) / 100
  }
  if (data.loanAmount == null && purchasePrice > 0) {
    data.loanAmount = Math.max(0, purchasePrice - downPayment)
  }
  return data
}

function emptyToNull(value) {
  if (value === undefined) return undefined
  if (value === null || value === '') return null
  return value
}

async function resolveUnitRefs({ propertyId, apartmentId, buildingId } = {}) {
  const hasProp = propertyId !== undefined
  const hasApt = apartmentId !== undefined
  const hasBld = buildingId !== undefined
  if (!hasProp && !hasApt && !hasBld) return { skip: true }

  let prop = hasProp ? emptyToNull(propertyId) : undefined
  let apt = hasApt ? emptyToNull(apartmentId) : undefined
  let bld = hasBld ? emptyToNull(buildingId) : undefined

  if (prop) {
    if (!isValidObjectId(prop)) return { error: 'Invalid propertyId', status: 400 }
    const propertyExists = await Property.exists({ _id: prop })
    if (!propertyExists) {
      const apartment = await Apartment.findById(prop).select('building').lean()
      if (!apartment) {
        return { error: 'Property or apartment not found', status: 404 }
      }
      apt = apt || prop
      prop = null
      if (bld === undefined && apartment.building) bld = apartment.building
    } else {
      apt = apt ?? null
      bld = bld ?? null
    }
  }

  if (apt) {
    if (!isValidObjectId(apt)) return { error: 'Invalid apartmentId', status: 400 }
    const apartment = await Apartment.findById(apt).select('building').lean()
    if (!apartment) return { error: 'Apartment not found', status: 404 }
    if (!bld) bld = apartment.building || null
    if (prop === undefined) prop = null
  }

  if (bld) {
    if (!isValidObjectId(bld)) return { error: 'Invalid buildingId', status: 400 }
    const exists = await Building.exists({ _id: bld })
    if (!exists) return { error: 'Building not found', status: 404 }
  }

  return {
    propertyId: prop === undefined ? null : prop,
    apartmentId: apt === undefined ? null : apt,
    buildingId: bld === undefined ? null : bld
  }
}

async function validateRefs({ buyer, coBuyer, projectId, responsiblePerson, assignedTo }) {
  if (buyer !== undefined) {
    if (!isValidObjectId(buyer)) return { error: 'Invalid buyer', status: 400 }
    const exists = await User.exists({ _id: buyer })
    if (!exists) return { error: 'Buyer not found', status: 404 }
  }

  if (coBuyer !== undefined && coBuyer !== null && coBuyer !== '') {
    if (!isValidObjectId(coBuyer)) return { error: 'Invalid coBuyer', status: 400 }
    const exists = await User.exists({ _id: coBuyer })
    if (!exists) return { error: 'Co-buyer not found', status: 404 }
  }

  if (projectId !== undefined) {
    if (!isValidObjectId(projectId)) return { error: 'Invalid projectId', status: 400 }
    const exists = await Project.exists({ _id: projectId })
    if (!exists) return { error: 'Project not found', status: 404 }
  }

  if (responsiblePerson !== undefined && responsiblePerson !== null && responsiblePerson !== '') {
    if (!isValidObjectId(responsiblePerson)) {
      return { error: 'Invalid responsiblePerson', status: 400 }
    }
    const exists = await User.exists({ _id: responsiblePerson })
    if (!exists) return { error: 'Responsible person not found', status: 404 }
  }

  if (assignedTo !== undefined && assignedTo !== null && assignedTo !== '') {
    if (!isValidObjectId(assignedTo)) return { error: 'Invalid assignedTo', status: 400 }
    const exists = await User.exists({ _id: assignedTo })
    if (!exists) return { error: 'Assigned user not found', status: 404 }
  }

  return { error: null }
}

function buildLoanFilter(query) {
  const {
    projectId,
    stage,
    pipelineStage,
    status,
    specialStatus,
    buyer,
    assignedTo,
    propertyId,
    apartmentId,
    fromDate,
    toDate,
    dateFrom,
    dateTo
  } = query
  const filter = {}

  if (projectId) {
    if (!isValidObjectId(projectId)) return { error: 'Invalid projectId' }
    filter.projectId = projectId
  }
  if (stage || pipelineStage) {
    const value = stage || pipelineStage
    if (!LOAN_PIPELINE_STAGES.includes(value)) {
      return { error: `Invalid stage. Allowed: ${LOAN_PIPELINE_STAGES.join(', ')}` }
    }
    filter.pipelineStage = value
  }
  if (status || specialStatus) {
    const value = status || specialStatus
    if (!LOAN_SPECIAL_STATUSES.includes(value)) {
      return { error: `Invalid status. Allowed: ${LOAN_SPECIAL_STATUSES.join(', ')}` }
    }
    filter.specialStatus = value
  }
  if (buyer) {
    if (!isValidObjectId(buyer)) return { error: 'Invalid buyer' }
    filter.buyer = buyer
  }
  if (assignedTo) {
    if (!isValidObjectId(assignedTo)) return { error: 'Invalid assignedTo' }
    filter.assignedTo = assignedTo
  }
  if (propertyId) {
    if (!isValidObjectId(propertyId)) return { error: 'Invalid propertyId' }
    filter.propertyId = propertyId
  }
  if (apartmentId) {
    if (!isValidObjectId(apartmentId)) return { error: 'Invalid apartmentId' }
    filter.apartmentId = apartmentId
  }

  const start = fromDate || dateFrom
  const end = toDate || dateTo
  if (start || end) {
    filter.createdAt = {}
    if (start) filter.createdAt.$gte = new Date(start)
    if (end) filter.createdAt.$lte = new Date(end)
  }

  return { filter }
}

async function findLoanOr404(id, res) {
  if (!isValidObjectId(id)) {
    res.status(400).json({ message: 'Invalid id' })
    return null
  }
  const loan = await Loan.findById(id)
  if (!loan) {
    res.status(404).json({ message: 'Loan not found' })
    return null
  }
  return loan
}

function findChecklistItem(loan, docType) {
  return loan.documentChecklist.find((item) => item.documentType === docType)
}

export const getLoans = async (req, res) => {
  try {
    const built = buildLoanFilter(req.query)
    if (built.error) return res.status(400).json({ message: built.error })

    const { page, limit, skip } = parsePagination(req.query)
    const [total, loans] = await Promise.all([
      Loan.countDocuments(built.filter),
      Loan.find(built.filter)
        .populate(POPULATE_FIELDS)
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit)
    ])

    res.json({
      loans,
      pagination: buildPaginationMeta(total, page, limit)
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const getLoanById = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid id' })
    }
    const loan = await Loan.findById(req.params.id).populate(POPULATE_FIELDS)
    if (!loan) return res.status(404).json({ message: 'Loan not found' })
    res.json(loan)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const createLoan = async (req, res) => {
  try {
    const body = { ...req.body }
    const { buyer, projectId } = body

    if (!buyer) return res.status(400).json({ message: 'Buyer is required' })
    if (!projectId) return res.status(400).json({ message: 'projectId is required' })

    if (body.loanType && !LOAN_TYPES.includes(body.loanType)) {
      return res.status(400).json({ message: `Invalid loanType. Allowed: ${LOAN_TYPES.join(', ')}` })
    }
    if (body.pipelineStage && !LOAN_PIPELINE_STAGES.includes(body.pipelineStage)) {
      return res.status(400).json({
        message: `Invalid pipelineStage. Allowed: ${LOAN_PIPELINE_STAGES.join(', ')}`
      })
    }
    if (body.specialStatus && !LOAN_SPECIAL_STATUSES.includes(body.specialStatus)) {
      return res.status(400).json({
        message: `Invalid specialStatus. Allowed: ${LOAN_SPECIAL_STATUSES.join(', ')}`
      })
    }

    const refs = await validateRefs({
      buyer,
      coBuyer: body.coBuyer,
      projectId,
      assignedTo: body.assignedTo
    })
    if (refs.error) return res.status(refs.status).json({ message: refs.error })

    const unit = await resolveUnitRefs({
      propertyId: body.propertyId,
      apartmentId: body.apartmentId,
      buildingId: body.buildingId
    })
    if (unit.error) return res.status(unit.status).json({ message: unit.error })

    applyFinancialDefaults(body)

    const pipelineStage = body.pipelineStage || 'new_loan_buyer_added'
    const loan = await Loan.create({
      buyer,
      coBuyer: body.coBuyer || null,
      buyerContactInfo: body.buyerContactInfo || '',
      projectId,
      propertyId: unit.skip ? null : unit.propertyId,
      apartmentId: unit.skip ? null : unit.apartmentId,
      buildingId: unit.skip ? null : unit.buildingId,
      propertyAddress: body.propertyAddress || '',
      assignedTo: body.assignedTo || null,
      purchasePrice: body.purchasePrice || 0,
      loanAmount: body.loanAmount || 0,
      downPayment: body.downPayment || 0,
      downPaymentPercent: body.downPaymentPercent || 0,
      interestRate: body.interestRate || 0,
      estimatedMonthlyPayment: body.estimatedMonthlyPayment || 0,
      contractDate: body.contractDate || null,
      estimatedClosingDate: body.estimatedClosingDate || null,
      loanType: body.loanType || 'Conventional',
      lender: body.lender || '',
      loanOfficer: body.loanOfficer || '',
      loanOfficerContact: body.loanOfficerContact || '',
      processor: body.processor || '',
      underwriter: body.underwriter || '',
      titleCompany: body.titleCompany || '',
      insuranceCompany: body.insuranceCompany || '',
      appraisalCompany: body.appraisalCompany || '',
      pipelineStage,
      specialStatus: body.specialStatus || null,
      percentComplete: calcPercentComplete(pipelineStage),
      stageEnteredAt: new Date(),
      internalNotes: body.internalNotes || '',
      nextAction: body.nextAction || {},
      documentChecklist: buildDefaultDocumentChecklist(),
      timeline: [
        {
          action: 'created',
          description: 'Loan created',
          performedBy: actorId(req),
          timestamp: new Date(),
          metadata: { pipelineStage }
        }
      ]
    })

    await loan.populate(POPULATE_FIELDS)
    res.status(201).json(loan)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const updateLoan = async (req, res) => {
  try {
    const loan = await findLoanOr404(req.params.id, res)
    if (!loan) return

    const body = req.body || {}
    const nextActionOnly = isBareNextActionBody(body)

    if (body.loanType !== undefined && !LOAN_TYPES.includes(body.loanType)) {
      return res.status(400).json({ message: `Invalid loanType. Allowed: ${LOAN_TYPES.join(', ')}` })
    }

    const refs = await validateRefs({
      buyer: body.buyer,
      coBuyer: body.coBuyer,
      projectId: body.projectId,
      assignedTo: body.assignedTo,
      responsiblePerson: body.nextAction?.responsiblePerson
    })
    if (refs.error) return res.status(refs.status).json({ message: refs.error })

    if (
      body.propertyId !== undefined ||
      body.apartmentId !== undefined ||
      body.buildingId !== undefined
    ) {
      const unit = await resolveUnitRefs({
        propertyId: body.propertyId,
        apartmentId: body.apartmentId,
        buildingId: body.buildingId
      })
      if (unit.error) return res.status(unit.status).json({ message: unit.error })
      if (!unit.skip) {
        body.propertyId = unit.propertyId
        body.apartmentId = unit.apartmentId
        body.buildingId = unit.buildingId
      }
    }

    let nextActionTouched = false
    if (nextActionOnly || body.nextAction !== undefined) {
      const nextResult = await applyNextActionFields(loan, body, req)
      if (nextResult.error) return res.status(nextResult.status).json({ message: nextResult.error })
      nextActionTouched = true
    }

    const changes = {}
    if (!nextActionOnly) {
      for (const field of PROFILE_FIELDS) {
        if (body[field] === undefined) continue
        if (
          ['coBuyer', 'propertyId', 'apartmentId', 'buildingId', 'assignedTo', 'contractDate', 'estimatedClosingDate'].includes(field) &&
          body[field] === ''
        ) {
          loan[field] = null
          changes[field] = null
          continue
        }
        loan[field] = body[field]
        changes[field] = body[field]
      }

      applyFinancialDefaults(loan)
    }

    if (Object.keys(changes).length) {
      pushTimeline(loan, {
        action: 'updated',
        description: 'Loan profile updated',
        performedBy: actorId(req),
        metadata: { fields: Object.keys(changes) }
      })
    }

    if (!Object.keys(changes).length && !nextActionTouched) {
      await loan.populate(POPULATE_FIELDS)
      return res.json(loan)
    }

    await loan.save()
    await loan.populate(POPULATE_FIELDS)
    res.json(loan)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const deleteLoan = async (req, res) => {
  try {
    const loan = await findLoanOr404(req.params.id, res)
    if (!loan) return

    for (const item of loan.documentChecklist) {
      if (item.gcsFileName) {
        try {
          await deleteFile(item.gcsFileName)
        } catch (err) {
          console.error('Failed to delete loan document from GCS:', err.message)
        }
      }
    }

    await loan.deleteOne()
    res.json({ message: 'Loan deleted', id: loan._id })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const updateLoanStage = async (req, res) => {
  try {
    const loan = await findLoanOr404(req.params.id, res)
    if (!loan) return

    const { stage, pipelineStage } = req.body || {}
    const nextStage = stage || pipelineStage
    if (!nextStage || !LOAN_PIPELINE_STAGES.includes(nextStage)) {
      return res.status(400).json({
        message: `Invalid stage. Allowed: ${LOAN_PIPELINE_STAGES.join(', ')}`
      })
    }

    const previousStage = loan.pipelineStage
    loan.pipelineStage = nextStage
    loan.percentComplete = calcPercentComplete(nextStage)
    loan.stageEnteredAt = new Date()

    pushTimeline(loan, {
      action: 'stage_changed',
      description: `Pipeline stage changed from ${previousStage} to ${nextStage}`,
      performedBy: actorId(req),
      metadata: {
        from: previousStage,
        to: nextStage,
        percentComplete: loan.percentComplete
      }
    })

    await loan.save()
    await loan.populate(POPULATE_FIELDS)
    res.json(loan)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const updateLoanSpecialStatus = async (req, res) => {
  try {
    const loan = await findLoanOr404(req.params.id, res)
    if (!loan) return

    const raw = req.body?.specialStatus !== undefined ? req.body.specialStatus : req.body?.status
    let nextStatus = raw
    if (nextStatus === '' || nextStatus === undefined) nextStatus = null

    if (nextStatus !== null && !LOAN_SPECIAL_STATUSES.includes(nextStatus)) {
      return res.status(400).json({
        message: `Invalid status. Allowed: ${LOAN_SPECIAL_STATUSES.join(', ')} or null`
      })
    }

    const previous = loan.specialStatus
    loan.specialStatus = nextStatus

    pushTimeline(loan, {
      action: 'status_changed',
      description: nextStatus
        ? `Special status set to ${nextStatus}`
        : 'Special status cleared',
      performedBy: actorId(req),
      metadata: { from: previous, to: nextStatus }
    })

    await loan.save()
    await loan.populate(POPULATE_FIELDS)
    res.json(loan)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const updateLoanStatus = updateLoanSpecialStatus

export const updateDocumentChecklistItem = async (req, res) => {
  try {
    const loan = await findLoanOr404(req.params.id, res)
    if (!loan) return

    const { docType } = req.params
    if (!LOAN_DOCUMENT_TYPES.includes(docType)) {
      return res.status(400).json({
        message: `Invalid docType. Allowed: ${LOAN_DOCUMENT_TYPES.join(', ')}`
      })
    }

    const { status, notes } = req.body || {}
    if (status && !LOAN_DOCUMENT_STATUSES.includes(status)) {
      return res.status(400).json({
        message: `Invalid document status. Allowed: ${LOAN_DOCUMENT_STATUSES.join(', ')}`
      })
    }

    let item = findChecklistItem(loan, docType)
    if (!item) {
      loan.documentChecklist.push({
        documentType: docType,
        status: status || 'not_applicable',
        notes: notes || '',
        statusChangedAt: new Date()
      })
      item = loan.documentChecklist[loan.documentChecklist.length - 1]
    } else {
      if (status && status !== item.status) {
        item.status = status
        item.statusChangedAt = new Date()
      }
      if (notes !== undefined) item.notes = notes
    }

    pushTimeline(loan, {
      action: 'document_updated',
      description: `Document ${docType} status set to ${item.status}`,
      performedBy: actorId(req),
      metadata: { docType, status: item.status }
    })

    await loan.save()
    await loan.populate(POPULATE_FIELDS)
    res.json(loan)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const updateLoanDocumentStatus = updateDocumentChecklistItem

export const updateNextAction = async (req, res) => {
  try {
    const loan = await findLoanOr404(req.params.id, res)
    if (!loan) return

    const nextResult = await applyNextActionFields(loan, req.body || {}, req)
    if (nextResult.error) return res.status(nextResult.status).json({ message: nextResult.error })

    await loan.save()
    await loan.populate(POPULATE_FIELDS)
    res.json(loan)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const updateLoanNextAction = updateNextAction

export const addLoanNote = async (req, res) => {
  try {
    const loan = await findLoanOr404(req.params.id, res)
    if (!loan) return

    const note = req.body?.note ?? req.body?.text
    if (!note?.trim()) return res.status(400).json({ message: 'note is required' })

    const trimmed = note.trim()
    loan.internalNotes = loan.internalNotes
      ? `${loan.internalNotes}\n${trimmed}`
      : trimmed

    pushTimeline(loan, {
      action: 'note_added',
      description: trimmed,
      performedBy: actorId(req),
      metadata: { note: trimmed }
    })

    await loan.save()
    await loan.populate(POPULATE_FIELDS)
    res.status(201).json(loan)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const getLoanTimeline = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid id' })
    }
    const loan = await Loan.findById(req.params.id)
      .select('timeline')
      .populate('timeline.performedBy', USER_SELECT)
    if (!loan) return res.status(404).json({ message: 'Loan not found' })

    const { page, limit, skip } = parsePagination(req.query)
    const sorted = [...loan.timeline].sort(
      (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
    )
    const total = sorted.length
    const items = sorted.slice(skip, skip + limit)

    res.json({
      timeline: items,
      pagination: buildPaginationMeta(total, page, limit)
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const getLoanDashboardKPIs = async (req, res) => {
  try {
    const { projectId } = req.query
    const match = {}
    if (projectId) {
      if (!isValidObjectId(projectId)) {
        return res.status(400).json({ message: 'Invalid projectId' })
      }
      match.projectId = new mongoose.Types.ObjectId(projectId)
    }

    const now = new Date()
    const in7d = new Date(now.getTime() + 7 * MS_DAY)
    const ago24h = new Date(now.getTime() - MS_DAY)
    const staleBefore = new Date(now.getTime() - 7 * MS_DAY)
    const requestedBefore = new Date(now.getTime() - 3 * MS_DAY)

    const [result] = await Loan.aggregate([
      { $match: match },
      {
        $facet: {
          totals: [
            {
              $group: {
                _id: null,
                totalLoans: { $sum: 1 },
                activeLoans: {
                  $sum: {
                    $cond: [
                      {
                        $and: [
                          { $ne: ['$pipelineStage', 'completed'] },
                          { $not: { $in: ['$specialStatus', TERMINAL_STATUSES] } }
                        ]
                      },
                      1,
                      0
                    ]
                  }
                },
                completedLoans: {
                  $sum: { $cond: [{ $eq: ['$pipelineStage', 'completed'] }, 1, 0] }
                },
                fundedLast24h: {
                  $sum: {
                    $cond: [
                      {
                        $and: [
                          { $eq: ['$pipelineStage', 'loan_funded'] },
                          { $gte: ['$stageEnteredAt', ago24h] }
                        ]
                      },
                      1,
                      0
                    ]
                  }
                },
                clearToClose: {
                  $sum: { $cond: [{ $eq: ['$pipelineStage', 'clear_to_close'] }, 1, 0] }
                },
                closingWithin7Days: {
                  $sum: {
                    $cond: [
                      {
                        $and: [
                          { $gte: ['$estimatedClosingDate', now] },
                          { $lte: ['$estimatedClosingDate', in7d] }
                        ]
                      },
                      1,
                      0
                    ]
                  }
                },
                overdueDeadlines: {
                  $sum: {
                    $cond: [
                      {
                        $and: [
                          { $ne: ['$nextAction.deadline', null] },
                          { $lt: ['$nextAction.deadline', now] }
                        ]
                      },
                      1,
                      0
                    ]
                  }
                },
                staleStages: {
                  $sum: {
                    $cond: [
                      {
                        $and: [
                          { $ne: ['$pipelineStage', 'completed'] },
                          { $lt: ['$stageEnteredAt', staleBefore] }
                        ]
                      },
                      1,
                      0
                    ]
                  }
                },
                onHold: {
                  $sum: { $cond: [{ $eq: ['$specialStatus', 'on_hold'] }, 1, 0] }
                },
                buyerActionRequired: {
                  $sum: {
                    $cond: [{ $eq: ['$specialStatus', 'buyer_action_required'] }, 1, 0]
                  }
                },
                lenderActionRequired: {
                  $sum: {
                    $cond: [{ $eq: ['$specialStatus', 'lender_action_required'] }, 1, 0]
                  }
                },
                loanDenied: {
                  $sum: { $cond: [{ $eq: ['$specialStatus', 'loan_denied'] }, 1, 0] }
                },
                cancelledOrWithdrawn: {
                  $sum: {
                    $cond: [
                      { $in: ['$specialStatus', ['cancelled', 'buyer_withdrawn']] },
                      1,
                      0
                    ]
                  }
                },
                averagePercentComplete: { $avg: '$percentComplete' }
              }
            }
          ],
          byStage: [{ $group: { _id: '$pipelineStage', count: { $sum: 1 } } }],
          requestedOverdue: [
            { $unwind: { path: '$documentChecklist', preserveNullAndEmptyArrays: false } },
            {
              $match: {
                'documentChecklist.status': 'requested',
                'documentChecklist.statusChangedAt': { $lt: requestedBefore }
              }
            },
            { $group: { _id: '$_id' } },
            { $count: 'count' }
          ]
        }
      }
    ])

    const totals = result?.totals?.[0] || {}
    const byStage = {}
    for (const stage of LOAN_PIPELINE_STAGES) byStage[stage] = 0
    for (const row of result?.byStage || []) {
      if (row._id) byStage[row._id] = row.count
    }

    res.json({
      kpis: {
        totalLoans: totals.totalLoans || 0,
        activeLoans: totals.activeLoans || 0,
        completedLoans: totals.completedLoans || 0,
        fundedLast24h: totals.fundedLast24h || 0,
        clearToClose: totals.clearToClose || 0,
        closingWithin7Days: totals.closingWithin7Days || 0,
        overdueDeadlines: totals.overdueDeadlines || 0,
        staleStages: totals.staleStages || 0,
        requestedDocumentsOverdue: result?.requestedOverdue?.[0]?.count || 0,
        onHold: totals.onHold || 0,
        buyerActionRequired: totals.buyerActionRequired || 0,
        lenderActionRequired: totals.lenderActionRequired || 0,
        loanDenied: totals.loanDenied || 0,
        cancelledOrWithdrawn: totals.cancelledOrWithdrawn || 0,
        averagePercentComplete: Math.round((totals.averagePercentComplete || 0) * 100) / 100
      },
      byStage
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const getLoanDashboard = getLoanDashboardKPIs

export const getLoanAlerts = async (req, res) => {
  try {
    const data = await computeLoanAlerts({ projectId: req.query.projectId })
    if (data.error) return res.status(400).json({ message: data.error })
    res.json({
      alerts: data.alerts,
      byType: data.byType,
      counts: data.counts
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

async function uploadLoanFileToGcs(file) {
  const ext = path.extname(file.originalname || '').toLowerCase() || ''
  const safeExt = ext.replace(/[^a-z0-9.]/gi, '') || ''
  const hash = crypto.randomBytes(16).toString('hex')
  const fileName = `${Date.now()}-${hash}${safeExt}`
  const result = await uploadFile(file.buffer, fileName, file.mimetype, false, 'loans')
  if (!result.success) {
    throw new Error(result.error || 'Failed to upload file to storage')
  }
  return {
    fileUrl: result.publicUrl || result.signedUrl,
    gcsFileName: result.fileName
  }
}

export const uploadLoanDocument = async (req, res) => {
  try {
    const loan = await findLoanOr404(req.params.id, res)
    if (!loan) return

    const { docType } = req.params
    if (!LOAN_DOCUMENT_TYPES.includes(docType)) {
      return res.status(400).json({
        message: `Invalid docType. Allowed: ${LOAN_DOCUMENT_TYPES.join(', ')}`
      })
    }
    if (!req.file) return res.status(400).json({ message: 'File is required' })

    let item = findChecklistItem(loan, docType)
    if (!item) {
      loan.documentChecklist.push({
        documentType: docType,
        status: 'not_applicable'
      })
      item = loan.documentChecklist[loan.documentChecklist.length - 1]
    }

    if (item.gcsFileName) {
      try {
        await deleteFile(item.gcsFileName)
      } catch (err) {
        console.error('Failed to replace previous loan document:', err.message)
      }
    }

    const uploaded = await uploadLoanFileToGcs(req.file)
    item.fileUrl = uploaded.fileUrl
    item.gcsFileName = uploaded.gcsFileName
    item.uploadedAt = new Date()
    item.status = 'received'
    item.statusChangedAt = new Date()
    if (req.body?.notes !== undefined) item.notes = req.body.notes

    pushTimeline(loan, {
      action: 'document_uploaded',
      description: `Document ${docType} uploaded`,
      performedBy: actorId(req),
      metadata: { docType, fileUrl: item.fileUrl }
    })

    await loan.save()
    await loan.populate(POPULATE_FIELDS)
    res.json(loan)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const deleteLoanDocument = async (req, res) => {
  try {
    const loan = await findLoanOr404(req.params.id, res)
    if (!loan) return

    const { docType } = req.params
    if (!LOAN_DOCUMENT_TYPES.includes(docType)) {
      return res.status(400).json({
        message: `Invalid docType. Allowed: ${LOAN_DOCUMENT_TYPES.join(', ')}`
      })
    }

    const item = findChecklistItem(loan, docType)
    if (!item) return res.status(404).json({ message: 'Document type not found on loan' })
    if (!item.fileUrl && !item.gcsFileName) {
      return res.status(404).json({ message: 'No file to delete' })
    }

    if (item.gcsFileName) {
      try {
        await deleteFile(item.gcsFileName)
      } catch (err) {
        console.error('Failed to delete loan document from GCS:', err.message)
      }
    }

    item.fileUrl = null
    item.gcsFileName = null
    item.uploadedAt = null
    item.status = 'missing'
    item.statusChangedAt = new Date()

    pushTimeline(loan, {
      action: 'document_deleted',
      description: `Document ${docType} file deleted`,
      performedBy: actorId(req),
      metadata: { docType }
    })

    await loan.save()
    await loan.populate(POPULATE_FIELDS)
    res.json(loan)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const deleteLoanDocumentFile = deleteLoanDocument
