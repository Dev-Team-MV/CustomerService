import Payload from '../models/Payload.js'
import Property from '../models/Property.js'

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
          { path: 'lot', select: 'number section' },
          { path: 'model', select: 'model' },
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
    const { property, date, amount, support, status, notes } = req.body
    
    const propertyExists = await Property.findById(property)
    if (!propertyExists) {
      return res.status(404).json({ message: 'Property not found' })
    }
    
    const payload = await Payload.create({
      property,
      date: date || Date.now(),
      amount,
      support,
      status: status || 'pending',
      notes,
      processedBy: req.user._id
    })
    
    if (status === 'cleared') {
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
      
      payload.date = req.body.date || payload.date
      payload.amount = req.body.amount !== undefined ? req.body.amount : payload.amount
      payload.support = req.body.support || payload.support
      payload.status = req.body.status || payload.status
      payload.notes = req.body.notes || payload.notes
      payload.processedBy = req.user._id
      
      const updatedPayload = await payload.save()
      
      if (oldStatus !== updatedPayload.status || oldAmount !== updatedPayload.amount) {
        const property = await Property.findById(payload.property)
        
        if (oldStatus === 'cleared') {
          property.pending += oldAmount
        }
        
        if (updatedPayload.status === 'cleared') {
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
      if (payload.status === 'cleared') {
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
      { $match: { status: 'cleared' } },
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
