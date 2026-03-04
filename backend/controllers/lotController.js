import Lot from '../models/Lot.js'

export const getAllLots = async (req, res) => {
  try {
    const { status, projectId } = req.query
    const filter = {}

    if (projectId) filter.project = projectId
    if (status) filter.status = status

    const lots = await Lot.find(filter)
      .populate('project', 'name slug')
      .populate('assignedUser', 'firstName lastName email')
      .sort({ number: 1 })
    res.json(lots)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const getLotById = async (req, res) => {
  try {
    const lot = await Lot.findById(req.params.id)
      .populate('project', 'name slug')
      .populate('assignedUser', 'firstName lastName email')

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
    const { projectId, project, number, price, status } = req.body
    const projId = projectId || project
    if (!projId) {
      return res.status(400).json({ message: 'projectId (or project) is required' })
    }

    const lotExists = await Lot.findOne({ project: projId, number })
    if (lotExists) {
      return res.status(400).json({ message: 'Lot number already exists in this project' })
    }

    const lot = await Lot.create({
      project: projId,
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
    const { projectId } = req.query
    const filter = {}
    if (projectId) filter.project = projectId

    const totalLots = await Lot.countDocuments(filter)
    const availableLots = await Lot.countDocuments({ ...filter, status: 'available' })
    const pendingLots = await Lot.countDocuments({ ...filter, status: 'pending' })
    const soldLots = await Lot.countDocuments({ ...filter, status: 'sold' })

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
