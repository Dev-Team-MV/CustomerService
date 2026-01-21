import Property from '../models/Property.js'
import Lot from '../models/Lot.js'
import Model from '../models/Model.js'
import Facade from '../models/Facade.js'
import User from '../models/User.js'

export const getAllProperties = async (req, res) => {
  try {
    const { status, user } = req.query
    const filter = {}
    
    if (status) filter.status = status
    if (user) filter.user = user
    
    const properties = await Property.find(filter)
      .populate('lot', 'number section size')
      .populate('model', 'model price bedrooms bathrooms sqft images')
      .populate('facade', 'title url price')
      .populate('user', 'firstName lastName email phoneNumber')
      .sort({ createdAt: -1 })
    
    res.json(properties)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const getPropertyById = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id)
      .populate('lot', 'number section size price')
      .populate('model', 'model price bedrooms bathrooms sqft images description')
      .populate('facade', 'title url price')
      .populate('user', 'firstName lastName email phoneNumber birthday')
      .populate({
        path: 'payloads',
        options: { sort: { date: -1 } }
      })
      .populate({
        path: 'phases',
        options: { sort: { phaseNumber: 1 } }
      })
    
    if (property) {
      res.json(property)
    } else {
      res.status(404).json({ message: 'Property not found' })
    }
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const createProperty = async (req, res) => {
  try {
    const { lot, model, facade, user, initialPayment, hasBalcony, modelType, hasStorage } = req.body
    
    // Validate lot
    const lotExists = await Lot.findById(lot)
    if (!lotExists) {
      return res.status(404).json({ message: 'Lot not found' })
    }
    
    if (lotExists.status === 'sold') {
      return res.status(400).json({ message: 'Lot is already sold' })
    }
    
    if (lotExists.assignedUser && lotExists.assignedUser.toString() !== user) {
      return res.status(400).json({ message: 'Lot is already assigned to another user' })
    }
    
    // Validate model
    const modelExists = await Model.findById(model)
    if (!modelExists) {
      return res.status(404).json({ message: 'Model not found' })
    }
    
    // Validate facade
    const facadeExists = await Facade.findById(facade)
    if (!facadeExists) {
      return res.status(404).json({ message: 'Facade not found' })
    }
    
    // Validate that facade belongs to the selected model
    if (facadeExists.model.toString() !== model) {
      return res.status(400).json({ message: 'Facade does not belong to the selected model' })
    }
    
    // Calculate model price with options
    let modelPrice = modelExists.price // Base price
    
    // Add balcony price if hasBalcony is true
    if (hasBalcony && modelExists.balconyPrice) {
      modelPrice += modelExists.balconyPrice
    }
    
    // Add upgrade price if modelType is 'upgrade'
    if (modelType === 'upgrade' && modelExists.upgradePrice) {
      modelPrice += modelExists.upgradePrice
    }
    
    // Add storage price if hasStorage is true
    if (hasStorage && modelExists.storagePrice) {
      modelPrice += modelExists.storagePrice
    }
    
    // Calculate total price: lot + model (with options) + facade
    const totalPrice = lotExists.price + modelPrice + facadeExists.price
    
    // Calculate pending: total price - initial payment
    const initialPaymentAmount = initialPayment || 0
    const pendingAmount = totalPrice - initialPaymentAmount
    
    const property = await Property.create({
      lot,
      model,
      facade,
      user,
      price: totalPrice,
      pending: pendingAmount,
      initialPayment: initialPaymentAmount,
      status: 'pending',
      hasBalcony: hasBalcony || false,
      modelType: modelType || 'basic',
      hasStorage: hasStorage || false
    })
    
    await Lot.findByIdAndUpdate(lot, {
      status: 'pending',
      assignedUser: user
    })
    
    const userDoc = await User.findById(user)
    if (userDoc && !userDoc.lots.includes(lot)) {
      userDoc.lots.push(lot)
      await userDoc.save()
    }
    
    const populatedProperty = await Property.findById(property._id)
      .populate('lot')
      .populate('model')
      .populate('facade')
      .populate('user')
    
    res.status(201).json(populatedProperty)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const updateProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id)
    
    if (property) {
      property.status = req.body.status || property.status
      property.pending = req.body.pending !== undefined ? req.body.pending : property.pending
      
      // Update configuration options if provided
      if (req.body.hasBalcony !== undefined) {
        property.hasBalcony = req.body.hasBalcony
      }
      if (req.body.modelType !== undefined) {
        property.modelType = req.body.modelType
      }
      if (req.body.hasStorage !== undefined) {
        property.hasStorage = req.body.hasStorage
      }
      
      // Recalculate price if any configuration changed
      if (req.body.hasBalcony !== undefined || req.body.modelType !== undefined || req.body.hasStorage !== undefined) {
        const lotExists = await Lot.findById(property.lot)
        const modelExists = await Model.findById(property.model)
        const facadeExists = await Facade.findById(property.facade)
        
        if (lotExists && modelExists && facadeExists) {
          let modelPrice = modelExists.price
          
          if (property.hasBalcony && modelExists.balconyPrice) {
            modelPrice += modelExists.balconyPrice
          }
          
          if (property.modelType === 'upgrade' && modelExists.upgradePrice) {
            modelPrice += modelExists.upgradePrice
          }
          
          if (property.hasStorage && modelExists.storagePrice) {
            modelPrice += modelExists.storagePrice
          }
          
          const totalPrice = lotExists.price + modelPrice + facadeExists.price
          const priceDifference = totalPrice - property.price
          
          property.price = totalPrice
          property.pending = property.pending + priceDifference
        }
      }
      
      if (req.body.status === 'sold' && property.lot) {
        await Lot.findByIdAndUpdate(property.lot, { status: 'sold' })
      }
      
      const updatedProperty = await property.save()
      const populatedProperty = await Property.findById(updatedProperty._id)
        .populate('lot')
        .populate('model')
        .populate('facade')
        .populate('user')
      
      res.json(populatedProperty)
    } else {
      res.status(404).json({ message: 'Property not found' })
    }
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const deleteProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id)
    
    if (property) {
      await Lot.findByIdAndUpdate(property.lot, {
        status: 'available',
        assignedUser: null
      })
      
      await User.findByIdAndUpdate(property.user, {
        $pull: { lots: property.lot }
      })
      
      await property.deleteOne()
      res.json({ message: 'Property deleted successfully' })
    } else {
      res.status(404).json({ message: 'Property not found' })
    }
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const getPropertyStats = async (req, res) => {
  try {
    const totalProperties = await Property.countDocuments()
    const activeProperties = await Property.countDocuments({ status: 'active' })
    const pendingProperties = await Property.countDocuments({ status: 'pending' })
    const soldProperties = await Property.countDocuments({ status: 'sold' })
    
    const totalRevenue = await Property.aggregate([
      { $match: { status: { $in: ['active', 'sold'] } } },
      { $group: { _id: null, total: { $sum: '$price' } } }
    ])
    
    const pendingPayments = await Property.aggregate([
      { $match: { status: { $in: ['active', 'pending'] } } },
      { $group: { _id: null, total: { $sum: '$pending' } } }
    ])
    
    res.json({
      total: totalProperties,
      active: activeProperties,
      pending: pendingProperties,
      sold: soldProperties,
      totalRevenue: totalRevenue[0]?.total || 0,
      pendingPayments: pendingPayments[0]?.total || 0
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}
