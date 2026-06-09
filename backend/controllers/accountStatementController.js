import Property from '../models/Property.js'
import Payload from '../models/Payload.js'
import Project from '../models/Project.js'
import Phase from '../models/Phase.js'
import { canUserAccessProperty } from '../utils/propertyVisibility.js'
import { canUserAccessProject } from '../utils/projectAccess.js'
import {
  generatePropertyStatementPdf,
  generateProjectStatementPdf,
  generateBulkCombinedStatementPdf,
  generateBalanceGeneralPdf
} from '../services/accountStatementPdfService.js'

const PHASE_WEIGHTS = { 1: 10, 2: 15, 3: 15, 4: 15, 5: 10, 6: 10, 7: 10, 8: 10, 9: 5 }

function sumAmounts(payments = []) {
  return payments.reduce((acc, payment) => acc + Number(payment.amount || 0), 0)
}

function getOwnerNames(users = []) {
  return users
    .map((user) => `${user?.firstName || ''} ${user?.lastName || ''}`.trim())
    .filter(Boolean)
    .join(', ')
}

export const downloadPropertyStatementPdf = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id)
      .populate('project', 'name slug')
      .populate('lot', 'number')
      .populate('model', 'model')
      .populate('users', 'firstName lastName')
      .lean()

    if (!property) {
      return res.status(404).json({ message: 'Property not found' })
    }

    const isAdmin = req.user.role === 'admin' || req.user.role === 'superadmin' || req.user.role === 'owner'
    if (!isAdmin) {
      const canAccess = await canUserAccessProperty(req.user._id, property._id)
      if (!canAccess) {
        return res.status(403).json({ message: 'You do not have access to this property' })
      }
    }

    const payments = await Payload.find({ property: property._id })
      .sort({ date: 1, createdAt: 1 })
      .lean()

    const phases = await Phase.find({ property: property._id })
      .sort({ phaseNumber: 1 })
      .lean()

    const totalConstructionPercentage = phases.reduce(
      (acc, p) => acc + (p.constructionPercentage * (PHASE_WEIGHTS[p.phaseNumber] ?? 0)) / 100,
      0
    )

    const signedPayments = payments.filter((payment) => payment.status === 'signed')
    const pendingPayments = payments.filter((payment) => payment.status === 'pending')
    const rejectedPayments = payments.filter((payment) => payment.status === 'rejected')

    generatePropertyStatementPdf(res, {
      property,
      projectName: property.project?.name || '-',
      lotNumber: property.lot?.number || '-',
      modelName: property.model?.model || '-',
      ownerNames: getOwnerNames(property.users),
      totals: {
        totalPrice: Number(property.price || 0),
        initialPayment: Number(property.initialPayment || 0),
        signedPayments: sumAmounts(signedPayments),
        pendingPayments: sumAmounts(pendingPayments),
        rejectedPayments: sumAmounts(rejectedPayments),
        outstandingBalance: Number(property.pending || 0)
      },
      payments,
      phases,
      totalConstructionPercentage
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

async function fetchPropertyData(propertyId) {
  const property = await Property.findById(propertyId)
    .populate('project', 'name slug')
    .populate('lot', 'number')
    .populate('model', 'model')
    .populate('users', 'firstName lastName')
    .lean()
  if (!property) return null

  const [payments, phases] = await Promise.all([
    Payload.find({ property: property._id }).sort({ date: 1, createdAt: 1 }).lean(),
    Phase.find({ property: property._id }).sort({ phaseNumber: 1 }).lean()
  ])

  const totalConstructionPercentage = phases.reduce(
    (acc, p) => acc + (p.constructionPercentage * (PHASE_WEIGHTS[p.phaseNumber] ?? 0)) / 100,
    0
  )

  const signedPayments   = payments.filter((p) => p.status === 'signed')
  const pendingPayments  = payments.filter((p) => p.status === 'pending')
  const rejectedPayments = payments.filter((p) => p.status === 'rejected')

  return {
    property,
    projectName: property.project?.name || '-',
    lotNumber:   property.lot?.number   || '-',
    modelName:   property.model?.model  || '-',
    ownerNames:  getOwnerNames(property.users),
    totals: {
      totalPrice:         Number(property.price         || 0),
      initialPayment:     Number(property.initialPayment || 0),
      signedPayments:     sumAmounts(signedPayments),
      pendingPayments:    sumAmounts(pendingPayments),
      rejectedPayments:   sumAmounts(rejectedPayments),
      outstandingBalance: Number(property.pending || 0)
    },
    payments,
    phases,
    totalConstructionPercentage
  }
}

export const downloadBulkCombinedStatementPdf = async (req, res) => {
  try {
    const { propertyIds } = req.body
    if (!Array.isArray(propertyIds) || propertyIds.length === 0) {
      return res.status(400).json({ message: 'propertyIds array is required' })
    }

    const propertiesData = await Promise.all(propertyIds.map((id) => fetchPropertyData(id)))
    const valid = propertiesData.filter(Boolean)
    if (valid.length === 0) return res.status(404).json({ message: 'No properties found' })

    generateBulkCombinedStatementPdf(res, valid)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const downloadBalanceGeneralPdf = async (req, res) => {
  try {
    const { propertyIds } = req.body
    if (!Array.isArray(propertyIds) || propertyIds.length === 0) {
      return res.status(400).json({ message: 'propertyIds array is required' })
    }

    const propertiesData = await Promise.all(propertyIds.map((id) => fetchPropertyData(id)))
    const valid = propertiesData.filter(Boolean)
    if (valid.length === 0) return res.status(404).json({ message: 'No properties found' })

    const projectName = valid[0]?.projectName || '-'
    const totals = {
      totalPrice:         valid.reduce((s, p) => s + p.totals.totalPrice,         0),
      signedPayments:     valid.reduce((s, p) => s + p.totals.signedPayments,     0),
      pendingPayments:    valid.reduce((s, p) => s + p.totals.pendingPayments,     0),
      outstandingBalance: valid.reduce((s, p) => s + p.totals.outstandingBalance, 0)
    }
    const properties = valid.map((p) => ({
      lotNumber:          p.lotNumber,
      modelName:          p.modelName,
      ownerNames:         p.ownerNames,
      totalPrice:         p.totals.totalPrice,
      signedPayments:     p.totals.signedPayments,
      outstandingBalance: p.totals.outstandingBalance,
      constructionPct:    p.totalConstructionPercentage
    }))

    generateBalanceGeneralPdf(res, { projectName, totalProperties: valid.length, totals, properties })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const downloadProjectStatementPdf = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).select('_id name slug').lean()
    if (!project) {
      return res.status(404).json({ message: 'Project not found' })
    }

    const canAccess = await canUserAccessProject(req.user._id, project._id, { role: req.user.role })
    if (!canAccess) {
      return res.status(403).json({ message: 'No access to this project' })
    }

    const properties = await Property.find({ project: project._id })
      .populate('lot', 'number')
      .populate('users', 'firstName lastName')
      .lean()

    const propertyIds = properties.map((property) => property._id)
    const payments = propertyIds.length
      ? await Payload.find({ property: { $in: propertyIds } }).sort({ date: 1, createdAt: 1 }).lean()
      : []

    const signedPayments = payments.filter((payment) => payment.status === 'signed')
    const pendingPayments = payments.filter((payment) => payment.status === 'pending')
    const rejectedPayments = payments.filter((payment) => payment.status === 'rejected')

    const lotByPropertyId = new Map(
      properties.map((property) => [String(property._id), property.lot?.number || '-'])
    )
    const ownerByPropertyId = new Map(
      properties.map((property) => [String(property._id), getOwnerNames(property.users)])
    )

    const signedSumByPropertyId = new Map()
    signedPayments.forEach((payment) => {
      const key = String(payment.property)
      const current = signedSumByPropertyId.get(key) || 0
      signedSumByPropertyId.set(key, current + Number(payment.amount || 0))
    })

    const propertiesSummary = properties.map((property) => {
      const propertyId = String(property._id)
      return {
        lotNumber: property.lot?.number || '-',
        ownerNames: getOwnerNames(property.users),
        price: Number(property.price || 0),
        signedPayments: Number(signedSumByPropertyId.get(propertyId) || 0),
        pending: Number(property.pending || 0)
      }
    })

    const projectPayments = payments.map((payment) => {
      const propertyId = String(payment.property)
      return {
        ...payment,
        lotNumber: lotByPropertyId.get(propertyId) || '-',
        ownerName: ownerByPropertyId.get(propertyId) || '-'
      }
    })

    const totals = {
      totalPrice: propertiesSummary.reduce((acc, property) => acc + Number(property.price || 0), 0),
      initialPayment: properties.reduce((acc, property) => acc + Number(property.initialPayment || 0), 0),
      signedPayments: sumAmounts(signedPayments),
      pendingPayments: sumAmounts(pendingPayments),
      rejectedPayments: sumAmounts(rejectedPayments),
      outstandingBalance: properties.reduce((acc, property) => acc + Number(property.pending || 0), 0)
    }

    generateProjectStatementPdf(res, {
      project,
      properties: propertiesSummary,
      totals,
      payments: projectPayments
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}
