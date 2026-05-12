import Property from '../models/Property.js'
import Payload from '../models/Payload.js'
import Project from '../models/Project.js'
import { canUserAccessProperty } from '../utils/propertyVisibility.js'
import { canUserAccessProject } from '../utils/projectAccess.js'
import {
  generatePropertyStatementPdf,
  generateProjectStatementPdf
} from '../services/accountStatementPdfService.js'

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
      .populate('users', 'firstName lastName')
      .lean()

    if (!property) {
      return res.status(404).json({ message: 'Property not found' })
    }

    const isAdmin = req.user.role === 'admin' || req.user.role === 'superadmin'
    if (!isAdmin) {
      const canAccess = await canUserAccessProperty(req.user._id, property._id)
      if (!canAccess) {
        return res.status(403).json({ message: 'You do not have access to this property' })
      }
    }

    const payments = await Payload.find({ property: property._id })
      .sort({ date: 1, createdAt: 1 })
      .lean()

    const signedPayments = payments.filter((payment) => payment.status === 'signed')
    const pendingPayments = payments.filter((payment) => payment.status === 'pending')
    const rejectedPayments = payments.filter((payment) => payment.status === 'rejected')

    generatePropertyStatementPdf(res, {
      property,
      projectName: property.project?.name || '-',
      lotNumber: property.lot?.number || '-',
      ownerNames: getOwnerNames(property.users),
      totals: {
        totalPrice: Number(property.price || 0),
        initialPayment: Number(property.initialPayment || 0),
        signedPayments: sumAmounts(signedPayments),
        pendingPayments: sumAmounts(pendingPayments),
        rejectedPayments: sumAmounts(rejectedPayments),
        outstandingBalance: Number(property.pending || 0)
      },
      payments
    })
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
