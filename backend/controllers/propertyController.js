import Property from '../models/Property.js'
import Lot from '../models/Lot.js'
import Model from '../models/Model.js'
import Facade from '../models/Facade.js'
import User from '../models/User.js'
import Phase from '../models/Phase.js'

/**
 * Calcula las imágenes (exterior e interior) de la propiedad según:
 * - modelType: 'basic' | 'upgrade'
 * - hasBalcony: true | false
 *
 * Basic sin balcón: imágenes interior y exterior del modelo base.
 * Basic con balcón: imágenes interior y exterior del balcón.
 * Upgrade sin balcón: exterior = modelo base; interior = interior del upgrade.
 * Upgrade con balcón: exterior = exterior del balcón; interior = exterior del upgrade.
 */
function getPropertyImages(property) {
  const model = property.model
  if (!model || !model.images) {
    return { exterior: [], interior: [] }
  }

  const baseExterior = model.images?.exterior || []
  const baseInterior = model.images?.interior || []

  const balcony = Array.isArray(model.balconies) && model.balconies.length
    ? (model.balconies.find(b => b.status !== 'inactive') || model.balconies[0])
    : null
  const upgrade = Array.isArray(model.upgrades) && model.upgrades.length
    ? (model.upgrades.find(u => u.status !== 'inactive') || model.upgrades[0])
    : null

  const balconyExterior = balcony?.images?.exterior || []
  const balconyInterior = balcony?.images?.interior || []
  const upgradeExterior = upgrade?.images?.exterior || []
  const upgradeInterior = upgrade?.images?.interior || []

  const isBasic = property.modelType === 'basic'
  const hasBalcony = property.hasBalcony === true

  let exterior = []
  let interior = []

  if (isBasic) {
    if (!hasBalcony) {
      exterior = baseExterior
      interior = baseInterior
    } else {
      exterior = balconyExterior.length ? balconyExterior : baseExterior
      interior = balconyInterior.length ? balconyInterior : baseInterior
    }
  } else {
    // upgrade
    if (!hasBalcony) {
      exterior = baseExterior
      interior = upgradeInterior.length ? upgradeInterior : baseInterior
    } else {
      exterior = balconyExterior.length ? balconyExterior : baseExterior
      interior = upgradeExterior.length ? upgradeExterior : (upgradeInterior.length ? upgradeInterior : baseInterior)
    }
  }

  return { exterior, interior }
}

/**
 * Devuelve el array de blueprints de la propiedad según hasBalcony y hasStorage.
 * default: sin balcón, sin storage
 * withBalcony: con balcón, sin storage
 * withStorage: sin balcón, con storage
 * withBalconyAndStorage: con balcón, con storage
 */
function getPropertyBlueprints(property) {
  const model = property.model
  if (!model || !model.blueprints) {
    return []
  }
  const b = model.blueprints
  const defaultArr = b.default || []
  const withBalcony = b.withBalcony || []
  const withStorage = b.withStorage || []
  const withBalconyAndStorage = b.withBalconyAndStorage || []

  const hasBalcony = property.hasBalcony === true
  const hasStorage = property.hasStorage === true

  if (hasBalcony && hasStorage) {
    return withBalconyAndStorage.length ? withBalconyAndStorage : defaultArr
  }
  if (hasBalcony) {
    return withBalcony.length ? withBalcony : defaultArr
  }
  if (hasStorage) {
    return withStorage.length ? withStorage : defaultArr
  }
  return defaultArr
}

export const getAllProperties = async (req, res) => {
  try {
    const { status, user } = req.query
    const filter = {}
    
    if (status) filter.status = status
    if (user) filter.users = user
    
    const properties = await Property.find(filter)
      .populate('lot', 'number price')
      .populate('model', 'model price bedrooms bathrooms sqft images blueprints balconies upgrades')
      .populate('facade', 'title url price')
      .populate('users', 'firstName lastName email phoneNumber')
      .populate({
        path: 'phases',
        options: { sort: { phaseNumber: 1 } }
      })
      .sort({ createdAt: -1 })
    
    // Calculate total construction percentage and images for each property
    const propertiesWithPercentage = properties.map(property => {
      const propertyObj = property.toObject()
      propertyObj.totalConstructionPercentage = property.totalConstructionPercentage || 0
      propertyObj.images = getPropertyImages(property)
      propertyObj.blueprints = getPropertyBlueprints(property)
      return propertyObj
    })
    
    res.json(propertiesWithPercentage)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const getPropertyById = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id)
      .populate('lot', 'number price')
      .populate('model', 'model price bedrooms bathrooms sqft images blueprints description balconies upgrades')
      .populate('facade', 'title url price')
      .populate('users', 'firstName lastName email phoneNumber birthday')
      .populate({
        path: 'payloads',
        options: { sort: { date: -1 } }
      })
      .populate({
        path: 'phases',
        options: { sort: { phaseNumber: 1 } }
      })
    
    if (property) {
      const propertyObj = property.toObject()
      propertyObj.totalConstructionPercentage = property.totalConstructionPercentage || 0
      propertyObj.images = getPropertyImages(property)
      propertyObj.blueprints = getPropertyBlueprints(property)
      res.json(propertyObj)
    } else {
      res.status(404).json({ message: 'Property not found' })
    }
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const createProperty = async (req, res) => {
  try {
    const { lot, model, facade, user, users, initialPayment, hasBalcony, modelType, hasStorage } = req.body
    
    // Normalize owners: accept single user or users array
    const ownerIds = users && Array.isArray(users) && users.length > 0
      ? users
      : user
        ? [user]
        : []
    if (ownerIds.length === 0) {
      return res.status(400).json({ message: 'At least one owner (user or users) is required' })
    }
    
    // Validate lot
    const lotExists = await Lot.findById(lot)
    if (!lotExists) {
      return res.status(404).json({ message: 'Lot not found' })
    }
    
    if (lotExists.status === 'sold') {
      return res.status(400).json({ message: 'Lot is already sold' })
    }
    
    const firstOwner = ownerIds[0]
    if (lotExists.assignedUser && lotExists.assignedUser.toString() !== firstOwner) {
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
      users: ownerIds,
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
      assignedUser: firstOwner
    })
    
    for (const userId of ownerIds) {
      const userDoc = await User.findById(userId)
      if (userDoc && !userDoc.lots.some(id => id.toString() === lot)) {
        userDoc.lots.push(lot)
        await userDoc.save()
      }
    }
    
    const populatedProperty = await Property.findById(property._id)
      .populate('lot')
      .populate('model')
      .populate('facade')
      .populate('users')
      .populate({
        path: 'phases',
        options: { sort: { phaseNumber: 1 } }
      })
    
    const propertyObj = populatedProperty.toObject()
    propertyObj.totalConstructionPercentage = populatedProperty.totalConstructionPercentage || 0
    propertyObj.images = getPropertyImages(populatedProperty)
    propertyObj.blueprints = getPropertyBlueprints(populatedProperty)
    
    res.status(201).json(propertyObj)
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
      
      // Update price directly if provided
      if (req.body.price !== undefined) {
        const newPrice = Number(req.body.price)
        if (!Number.isNaN(newPrice) && newPrice >= 0) {
          const priceDifference = newPrice - property.price
          property.price = newPrice
          property.pending = Math.max(0, property.pending + priceDifference)
        }
      }
      
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
      
      // Update owners if provided (must be non-empty array)
      if (req.body.users !== undefined && Array.isArray(req.body.users) && req.body.users.length > 0) {
        const previousIds = (property.users || []).map(id => id.toString())
        const newIds = req.body.users.map(id => id.toString?.() || id)
        property.users = req.body.users
        for (const userId of newIds) {
          const userDoc = await User.findById(userId)
          if (userDoc && !userDoc.lots.some(id => id.toString() === property.lot.toString())) {
            userDoc.lots.push(property.lot)
            await userDoc.save()
          }
        }
        for (const userId of previousIds) {
          if (!newIds.includes(userId)) {
            await User.findByIdAndUpdate(userId, { $pull: { lots: property.lot } })
          }
        }
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
        .populate('users')
        .populate({
          path: 'phases',
          options: { sort: { phaseNumber: 1 } }
        })
      
      const propertyObj = populatedProperty.toObject()
      propertyObj.totalConstructionPercentage = populatedProperty.totalConstructionPercentage || 0
      propertyObj.images = getPropertyImages(populatedProperty)
      propertyObj.blueprints = getPropertyBlueprints(populatedProperty)
      
      res.json(propertyObj)
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
      
      for (const userId of property.users || []) {
        await User.findByIdAndUpdate(userId, {
          $pull: { lots: property.lot }
        })
      }
      
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
