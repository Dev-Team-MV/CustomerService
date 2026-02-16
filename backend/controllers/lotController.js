import Lot from '../models/Lot.js'

export const getAllLots = async (req, res) => {
  try {
    const { status } = req.query
    const filter = {}
    
    if (status) filter.status = status
    
    const lots = await Lot.find(filter).populate('assignedUser', 'firstName lastName email').sort({ number: 1 })
    res.json(lots)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const getLotById = async (req, res) => {
  try {
    const lot = await Lot.findById(req.params.id).populate('assignedUser', 'firstName lastName email')
    
    if (lot) {
      res.json(lot)
    } else {
      res.status(404).json({ message: 'Lot not found' })
    }
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const createLot = async (req, res) => {
  try {
    const { number, price, status } = req.body
    
    const lotExists = await Lot.findOne({ number })
    if (lotExists) {
      return res.status(400).json({ message: 'Lot number already exists' })
    }
    
    const lot = await Lot.create({
      number,
      price,
      status: status || 'available'
    })
    
    res.status(201).json(lot)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const updateLot = async (req, res) => {
  try {
    const lot = await Lot.findById(req.params.id)
    
    if (lot) {
      lot.number = req.body.number || lot.number
      lot.price = req.body.price !== undefined ? req.body.price : lot.price
      lot.status = req.body.status || lot.status
      lot.assignedUser = req.body.assignedUser || lot.assignedUser
      
      const updatedLot = await lot.save()
      res.json(updatedLot)
    } else {
      res.status(404).json({ message: 'Lot not found' })
    }
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const deleteLot = async (req, res) => {
  try {
    const lot = await Lot.findById(req.params.id)
    
    if (lot) {
      await lot.deleteOne()
      res.json({ message: 'Lot deleted successfully' })
    } else {
      res.status(404).json({ message: 'Lot not found' })
    }
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const getLotStats = async (req, res) => {
  try {
    const totalLots = await Lot.countDocuments()
    const availableLots = await Lot.countDocuments({ status: 'available' })
    const pendingLots = await Lot.countDocuments({ status: 'pending' })
    const soldLots = await Lot.countDocuments({ status: 'sold' })
    
    res.json({
      total: totalLots,
      available: availableLots,
      pending: pendingLots,
      sold: soldLots
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}
