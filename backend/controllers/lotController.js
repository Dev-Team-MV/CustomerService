import Lot from '../models/Lot.js'

export const getAllLots = async (req, res) => {
  try {
    const { status, section } = req.query
    const filter = { tenant: req.tenantId }
    if (status) filter.status = status
    if (section) filter.section = section

    const lots = await Lot.find(filter).populate('assignedUser', 'firstName lastName email').sort({ number: 1 })
    res.json(lots)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const getLotById = async (req, res) => {
  try {
    const lot = await Lot.findOne({ _id: req.params.id, tenant: req.tenantId }).populate('assignedUser', 'firstName lastName email')
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
    const { number, section, size, price, status } = req.body

    const lotExists = await Lot.findOne({ tenant: req.tenantId, number })
    if (lotExists) {
      return res.status(400).json({ message: 'Lot number already exists in this tenant' })
    }

    const lot = await Lot.create({
      tenant: req.tenantId,
      number,
      section,
      size,
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
    const lot = await Lot.findOne({ _id: req.params.id, tenant: req.tenantId })
    if (lot) {
      lot.number = req.body.number || lot.number
      lot.section = req.body.section || lot.section
      lot.size = req.body.size || lot.size
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
    const lot = await Lot.findOne({ _id: req.params.id, tenant: req.tenantId })
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
    const baseFilter = { tenant: req.tenantId }
    const totalLots = await Lot.countDocuments(baseFilter)
    const availableLots = await Lot.countDocuments({ ...baseFilter, status: 'available' })
    const pendingLots = await Lot.countDocuments({ ...baseFilter, status: 'pending' })
    const soldLots = await Lot.countDocuments({ ...baseFilter, status: 'sold' })
    
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
