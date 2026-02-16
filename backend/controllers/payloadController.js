import Payload from '../models/Payload.js'
import Property from '../models/Property.js'
import { uploadFile } from '../services/storageService.js'
import crypto from 'crypto'
import path from 'path'

export const getAllPayloads = async (req, res) => {
  try {
    const { status, property } = req.query
    const filter = {}
    
    if (status) filter.status = status
    if (property) filter.property = property
    
    const payloads = await Payload.find(filter)
      .populate({
        path: 'property',
        populate: [
          { path: 'lot', select: 'number' },
          { path: 'model', select: 'model' },
          { path: 'facade', select: 'title' },
          { path: 'user', select: 'firstName lastName email' }
        ]
      })
      .populate('processedBy', 'firstName lastName')
      .sort({ date: -1 })
    
    res.json(payloads)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const getPayloadById = async (req, res) => {
  try {
    const payload = await Payload.findById(req.params.id)
      .populate({
        path: 'property',
        populate: [
          { path: 'lot' },
          { path: 'model' },
          { path: 'facade' },
          { path: 'user' }
        ]
      })
      .populate('processedBy', 'firstName lastName')
    
    if (payload) {
      res.json(payload)
    } else {
      res.status(404).json({ message: 'Payload not found' })
    }
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const createPayload = async (req, res) => {
  try {
    const { property, date, amount, support, urls, status, type, notes, folder } = req.body
    
    const propertyExists = await Property.findById(property)
    if (!propertyExists) {
      return res.status(404).json({ message: 'Property not found' })
    }

    // Verificar si el usuario es admin o superadmin
    const isAdmin = req.user.role === 'admin' || req.user.role === 'superadmin'
    
    // Solo los administradores pueden crear payloads con status 'signed'
    // Los usuarios normales siempre crearán con status 'pending'
    let finalStatus = status || 'pending'
    if (!isAdmin && finalStatus === 'signed') {
      finalStatus = 'pending'
    }

    // Procesar imágenes si se subieron
    let uploadedUrls = urls || []
    
    // Si hay archivos subidos (multipart/form-data)
    if (req.files && req.files.length > 0) {
      const makePublic = process.env.GCS_MAKE_PUBLIC === 'true' || false
      const folderPath = folder || 'payloads' // Carpeta por defecto: 'payloads'
      
      const uploadPromises = req.files.map(async (file) => {
        const fileExtension = path.extname(file.originalname)
        const fileName = `${crypto.randomBytes(16).toString('hex')}${Date.now()}${fileExtension}`
        
        const result = await uploadFile(
          file.buffer,
          fileName,
          file.mimetype,
          makePublic,
          folderPath
        )

        return result.publicUrl || result.signedUrl
      })

      const newUrls = await Promise.all(uploadPromises)
      uploadedUrls = [...uploadedUrls, ...newUrls]
    }
    
    const payload = await Payload.create({
      property,
      date: date || Date.now(),
      amount,
      support,
      urls: uploadedUrls,
      status: finalStatus,
      type: type || undefined,
      notes,
      processedBy: req.user._id
    })
    
    if (finalStatus === 'signed') {
      propertyExists.pending = Math.max(0, propertyExists.pending - amount)
      
      if (propertyExists.pending === 0) {
        propertyExists.status = 'sold'
      }
      
      await propertyExists.save()
    }
    
    const populatedPayload = await Payload.findById(payload._id)
      .populate({
        path: 'property',
        populate: [
          { path: 'lot' },
          { path: 'model' },
          { path: 'facade' },
          { path: 'user' }
        ]
      })
      .populate('processedBy')
    
    res.status(201).json(populatedPayload)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const updatePayload = async (req, res) => {
  try {
    const payload = await Payload.findById(req.params.id)
    
    if (payload) {
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
          const fileExtension = path.extname(file.originalname)
          const fileName = `${crypto.randomBytes(16).toString('hex')}${Date.now()}${fileExtension}`
          
          const result = await uploadFile(
            file.buffer,
            fileName,
            file.mimetype,
            makePublic,
            folderPath
          )

          return result.publicUrl || result.signedUrl
        })

        const newUrls = await Promise.all(uploadPromises)
        updatedUrls = [...updatedUrls, ...newUrls]
      }
      
      payload.date = req.body.date || payload.date
      payload.amount = req.body.amount !== undefined ? req.body.amount : payload.amount
      payload.support = req.body.support || payload.support
      payload.urls = updatedUrls
      payload.status = newStatus
      if (req.body.type !== undefined) payload.type = req.body.type
      payload.notes = req.body.notes || payload.notes
      payload.processedBy = req.user._id
      
      const updatedPayload = await payload.save()
      
      if (oldStatus !== updatedPayload.status || oldAmount !== updatedPayload.amount) {
        const property = await Property.findById(payload.property)
        
        if (oldStatus === 'signed') {
          property.pending += oldAmount
        }
        
        if (updatedPayload.status === 'signed') {
          property.pending = Math.max(0, property.pending - updatedPayload.amount)
          
          if (property.pending === 0) {
            property.status = 'sold'
          }
        }
        
        await property.save()
      }
      
      const populatedPayload = await Payload.findById(updatedPayload._id)
        .populate({
          path: 'property',
          populate: [
            { path: 'lot' },
            { path: 'model' },
            { path: 'user' }
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
    const payload = await Payload.findById(req.params.id)
    
    if (payload) {
      if (payload.status === 'signed') {
        const property = await Property.findById(payload.property)
        if (property) {
          property.pending += payload.amount
          await property.save()
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
    const totalCollected = await Payload.aggregate([
      { $match: { status: 'signed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ])
    
    const pendingPayloads = await Payload.countDocuments({ status: 'pending' })
    const rejectedPayloads = await Payload.countDocuments({ status: 'rejected' })
    
    const recentFailures = await Payload.aggregate([
      { $match: { status: 'rejected' } },
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
    // Obtener el primer y último día del mes actual
    const now = new Date()
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)
    
    // Filtrar pagos aprobados (signed) del mes actual
    const payloads = await Payload.find({
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
          { path: 'user', select: 'firstName lastName email phoneNumber' }
        ]
      })
      .populate('processedBy', 'firstName lastName')
      .sort({ date: -1 })
    
    // Calcular el total de pagos aprobados este mes
    const totalAmount = payloads.reduce((sum, payload) => sum + payload.amount, 0)
    
    res.json({
      count: payloads.length,
      totalAmount,
      payloads
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}
