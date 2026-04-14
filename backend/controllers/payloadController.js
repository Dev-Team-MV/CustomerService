import Payload from '../models/Payload.js'
import Property from '../models/Property.js'
import Apartment from '../models/Apartment.js'
import Building from '../models/Building.js'
import Project from '../models/Project.js'
import Lot from '../models/Lot.js'
import { canUserAccessProperty, canUserAccessApartment } from '../utils/propertyVisibility.js'
import { canUserAccessProject } from '../utils/projectAccess.js'
import { uploadFile } from '../services/storageService.js'
import { processImageForUpload } from '../services/imageProcessingService.js'
import { hydrateUrlsInObject, normalizePathForStorage } from '../services/urlResolverService.js'
import crypto from 'crypto'
import path from 'path'

async function resolvePayloadScopeByProject(projectId) {
  const [propertyIds, buildingIds] = await Promise.all([
    Property.distinct('_id', { project: projectId }),
    Building.distinct('_id', { project: projectId })
  ])
  const apartmentIds = buildingIds.length
    ? await Apartment.distinct('_id', { building: { $in: buildingIds } })
    : []

  return {
    $or: [
      { property: { $in: propertyIds } },
      { apartment: { $in: apartmentIds } }
    ]
  }
}

async function validateProjectAccessFromQuery(req, res, options = {}) {
  const { required = false } = options
  const { projectId } = req.query
  if (!projectId) {
    if (required) {
      res.status(400).json({ message: 'projectId is required' })
      return { ok: false }
    }
    return { ok: true, projectId: null }
  }

  const exists = await Project.exists({ _id: projectId })
  if (!exists) {
    res.status(404).json({ message: 'Project not found' })
    return { ok: false }
  }

  const allowed = await canUserAccessProject(req.user._id, projectId, { role: req.user.role })
  if (!allowed) {
    res.status(403).json({ message: 'No access to this project' })
    return { ok: false }
  }

  return { ok: true, projectId }
}

async function resolveProjectIdForPayload(payloadDoc) {
  if (payloadDoc.property) {
    const prop = await Property.findById(payloadDoc.property).select('project').lean()
    return prop?.project ? prop.project.toString() : null
  }

  if (payloadDoc.apartment) {
    const apt = await Apartment.findById(payloadDoc.apartment)
      .select('building')
      .populate('building', 'project')
      .lean()
    const project = apt?.building?.project
    return project ? project.toString() : null
  }

  return null
}

export const getAllPayloads = async (req, res) => {
  try {
    const access = await validateProjectAccessFromQuery(req, res, { required: true })
    if (!access.ok) return

    const { status, property, apartment, projectId } = req.query
    const filter = {}
    
    if (status) filter.status = status
    if (property) filter.property = property
    if (apartment) filter.apartment = apartment
    if (projectId) {
      Object.assign(filter, await resolvePayloadScopeByProject(projectId))
    }
    
    const payloads = await Payload.find(filter)
      .populate({
        path: 'property',
        populate: [
          { path: 'lot', select: 'number' },
          { path: 'model', select: 'model' },
          { path: 'facade', select: 'title' },
          { path: 'users', select: 'firstName lastName email' }
        ]
      })
      .populate({
        path: 'apartment',
        populate: [
          { path: 'apartmentModel', select: 'name apartmentNumber' },
          { path: 'users', select: 'firstName lastName email' }
        ]
      })
      .populate('processedBy', 'firstName lastName')
      .sort({ date: -1 })

    const data = payloads.map((p) => p.toObject())
    await hydrateUrlsInObject(data)
    res.json(data)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const getPayloadById = async (req, res) => {
  try {
    const access = await validateProjectAccessFromQuery(req, res, { required: true })
    if (!access.ok) return

    const payload = await Payload.findById(req.params.id)
      .populate({
        path: 'property',
        populate: [
          { path: 'lot' },
          { path: 'model' },
          { path: 'facade' },
          { path: 'users' }
        ]
      })
      .populate({
        path: 'apartment',
        populate: [
          { path: 'apartmentModel' },
          { path: 'users' }
        ]
      })
      .populate('processedBy', 'firstName lastName')
    
    if (payload) {
      const payloadProjectId = await resolveProjectIdForPayload(payload)
      if (!payloadProjectId || payloadProjectId !== access.projectId.toString()) {
        return res.status(404).json({ message: 'Payload not found in this project' })
      }
      const data = payload.toObject()
      await hydrateUrlsInObject(data)
      res.json(data)
    } else {
      res.status(404).json({ message: 'Payload not found' })
    }
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const createPayload = async (req, res) => {
  try {
    const { property, apartment, date, amount, support, urls, status, type, notes, folder } = req.body
    
    if ((property && apartment) || (!property && !apartment)) {
      return res.status(400).json({ message: 'Exactly one of property or apartment is required' })
    }

    let unitDoc = null
    if (property) {
      unitDoc = await Property.findById(property)
      if (!unitDoc) return res.status(404).json({ message: 'Property not found' })
      const isAdmin = req.user.role === 'admin' || req.user.role === 'superadmin'
      if (!isAdmin && !(await canUserAccessProperty(req.user._id, property))) {
        return res.status(403).json({ message: 'You do not have access to this property' })
      }
    } else {
      unitDoc = await Apartment.findById(apartment)
      if (!unitDoc) return res.status(404).json({ message: 'Apartment not found' })
      const isAdmin = req.user.role === 'admin' || req.user.role === 'superadmin'
      if (!isAdmin && !(await canUserAccessApartment(req.user._id, apartment))) {
        return res.status(403).json({ message: 'You do not have access to this apartment' })
      }
    }

    const isAdmin = req.user.role === 'admin' || req.user.role === 'superadmin'
    let finalStatus = status || 'pending'
    if (!isAdmin && finalStatus === 'signed') finalStatus = 'pending'

    let uploadedUrls = urls || []
    if (req.files && req.files.length > 0) {
      const makePublic = process.env.GCS_MAKE_PUBLIC === 'true' || false
      const folderPath = folder || 'payloads'
      const uploadPromises = req.files.map(async (file) => {
        const processed = await processImageForUpload(file.buffer, file.originalname, file.mimetype)
        const fileName = `${crypto.randomBytes(16).toString('hex')}${Date.now()}${processed.extension}`
        const result = await uploadFile(processed.buffer, fileName, processed.mimeType, makePublic, folderPath)
        return result.fileName
      })
      const newPaths = await Promise.all(uploadPromises)
      uploadedUrls = [...uploadedUrls, ...newPaths]
    }

    const pathsToSave = uploadedUrls.map((u) => normalizePathForStorage(u)).filter(Boolean)

    const payloadData = {
      date: date || Date.now(),
      amount,
      support,
      urls: pathsToSave,
      status: finalStatus,
      type: type || undefined,
      notes,
      processedBy: req.user._id
    }
    if (property) payloadData.property = property
    else payloadData.apartment = apartment

    const payload = await Payload.create(payloadData)
    
    if (finalStatus === 'signed') {
      unitDoc.pending = Math.max(0, unitDoc.pending - amount)
      if (unitDoc.pending === 0) {
        unitDoc.status = 'sold'
        if (unitDoc.lot) {
          await Lot.findByIdAndUpdate(unitDoc.lot, { status: 'sold' })
        }
      }
      await unitDoc.save()
    }
    
    const populatedPayload = await Payload.findById(payload._id)
      .populate({
        path: 'property',
        populate: [
          { path: 'lot' },
          { path: 'model' },
          { path: 'facade' },
          { path: 'users' }
        ]
      })
      .populate({
        path: 'apartment',
        populate: [
          { path: 'apartmentModel' },
          { path: 'users' }
        ]
      })
      .populate('processedBy')

    const data = populatedPayload.toObject()
    await hydrateUrlsInObject(data)
    res.status(201).json(data)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const updatePayload = async (req, res) => {
  try {
    const access = await validateProjectAccessFromQuery(req, res, { required: true })
    if (!access.ok) return

    const payload = await Payload.findById(req.params.id)
    
    if (payload) {
      const payloadProjectId = await resolveProjectIdForPayload(payload)
      if (!payloadProjectId || payloadProjectId !== access.projectId.toString()) {
        return res.status(404).json({ message: 'Payload not found in this project' })
      }
      const oldStatus = payload.status
      const oldAmount = payload.amount
      const { folder } = req.body
      
      // Verificar si el usuario es admin o superadmin
      const isAdmin = req.user.role === 'admin' || req.user.role === 'superadmin'
      
      // Solo los administradores pueden cambiar el status a 'signed' o 'rejected'
      let newStatus = req.body.status !== undefined ? req.body.status : payload.status
      if (!isAdmin && (newStatus === 'signed' || newStatus === 'rejected')) {
        return res.status(403).json({ 
          message: 'Only administrators can approve or reject payloads' 
        })
      }
      
      // Procesar nuevas imágenes si se subieron
      let updatedUrls = req.body.urls !== undefined ? req.body.urls : payload.urls

      if (req.files && req.files.length > 0) {
        const makePublic = process.env.GCS_MAKE_PUBLIC === 'true' || false
        const folderPath = folder || 'payloads'

        const uploadPromises = req.files.map(async (file) => {
          const processed = await processImageForUpload(file.buffer, file.originalname, file.mimetype)
          const fileName = `${crypto.randomBytes(16).toString('hex')}${Date.now()}${processed.extension}`

          const result = await uploadFile(
            processed.buffer,
            fileName,
            processed.mimeType,
            makePublic,
            folderPath
          )

          return result.fileName
        })

        const newPaths = await Promise.all(uploadPromises)
        updatedUrls = [...updatedUrls, ...newPaths]
      }

      const pathsToSave = updatedUrls.map((u) => normalizePathForStorage(u)).filter(Boolean)
      
      payload.date = req.body.date || payload.date
      payload.amount = req.body.amount !== undefined ? req.body.amount : payload.amount
      payload.support = req.body.support || payload.support
      payload.urls = pathsToSave
      payload.status = newStatus
      if (req.body.type !== undefined) payload.type = req.body.type
      payload.notes = req.body.notes || payload.notes
      payload.processedBy = req.user._id
      
      const updatedPayload = await payload.save()
      
      if (oldStatus !== updatedPayload.status || oldAmount !== updatedPayload.amount) {
        const unitId = payload.property || payload.apartment
        const unit = payload.property
          ? await Property.findById(unitId)
          : await Apartment.findById(unitId)
        
        if (unit) {
          if (oldStatus === 'signed') {
            unit.pending += oldAmount
          }
          if (updatedPayload.status === 'signed') {
            unit.pending = Math.max(0, unit.pending - updatedPayload.amount)
            if (unit.pending === 0) {
              unit.status = 'sold'
              if (unit.lot) {
                await Lot.findByIdAndUpdate(unit.lot, { status: 'sold' })
              }
            }
          }
          await unit.save()
        }
      }
      
      const populatedPayload = await Payload.findById(updatedPayload._id)
        .populate({
          path: 'property',
          populate: [
            { path: 'lot' },
            { path: 'model' },
            { path: 'users' }
          ]
        })
        .populate({
          path: 'apartment',
          populate: [
            { path: 'apartmentModel' },
            { path: 'users' }
          ]
        })
        .populate('processedBy')
      
      res.json(populatedPayload)
    } else {
      res.status(404).json({ message: 'Payload not found' })
    }
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const deletePayload = async (req, res) => {
  try {
    const access = await validateProjectAccessFromQuery(req, res, { required: true })
    if (!access.ok) return

    const payload = await Payload.findById(req.params.id)
    
    if (payload) {
      const payloadProjectId = await resolveProjectIdForPayload(payload)
      if (!payloadProjectId || payloadProjectId !== access.projectId.toString()) {
        return res.status(404).json({ message: 'Payload not found in this project' })
      }
      if (payload.status === 'signed') {
        const unitId = payload.property || payload.apartment
        const unit = payload.property
          ? await Property.findById(unitId)
          : await Apartment.findById(unitId)
        if (unit) {
          unit.pending += payload.amount
          await unit.save()
        }
      }
      
      await payload.deleteOne()
      res.json({ message: 'Payload deleted successfully' })
    } else {
      res.status(404).json({ message: 'Payload not found' })
    }
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const getPayloadStats = async (req, res) => {
  try {
    const access = await validateProjectAccessFromQuery(req, res, { required: true })
    if (!access.ok) return

    const projectScope = access.projectId
      ? await resolvePayloadScopeByProject(access.projectId)
      : {}

    const totalCollected = await Payload.aggregate([
      { $match: { ...projectScope, status: 'signed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ])
    
    const pendingPayloads = await Payload.countDocuments({ ...projectScope, status: 'pending' })
    const rejectedPayloads = await Payload.countDocuments({ ...projectScope, status: 'rejected' })
    
    const recentFailures = await Payload.aggregate([
      { $match: { ...projectScope, status: 'rejected' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ])
    
    res.json({
      totalCollected: totalCollected[0]?.total || 0,
      pendingPayloads,
      rejectedPayloads,
      recentFailures: recentFailures[0]?.total || 0
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const getApprovedPayloadsThisMonth = async (req, res) => {
  try {
    const access = await validateProjectAccessFromQuery(req, res, { required: true })
    if (!access.ok) return

    const projectScope = access.projectId
      ? await resolvePayloadScopeByProject(access.projectId)
      : {}

    // Obtener el primer y último día del mes actual
    const now = new Date()
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)
    
    // Filtrar pagos aprobados (signed) del mes actual
    const payloads = await Payload.find({
      ...projectScope,
      status: 'signed',
      date: {
        $gte: firstDayOfMonth,
        $lte: lastDayOfMonth
      }
    })
      .populate({
        path: 'property',
        populate: [
          { path: 'lot', select: 'number' },
          { path: 'model', select: 'model modelNumber price' },
          { path: 'facade', select: 'title url price' },
          { path: 'users', select: 'firstName lastName email phoneNumber' }
        ]
      })
      .populate({
        path: 'apartment',
        populate: [
          { path: 'apartmentModel', select: 'name apartmentNumber' },
          { path: 'users', select: 'firstName lastName email phoneNumber' }
        ]
      })
      .populate('processedBy', 'firstName lastName')
      .sort({ date: -1 })
    
    // Calcular el total de pagos aprobados este mes
    const totalAmount = payloads.reduce((sum, payload) => sum + payload.amount, 0)
    
    const payloadsData = payloads.map((p) => p.toObject())
    await hydrateUrlsInObject(payloadsData)
    res.json({
      count: payloads.length,
      totalAmount,
      payloads: payloadsData
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}
