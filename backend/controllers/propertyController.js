import mongoose from 'mongoose'
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
    
    // If lot has assignedUser but no property exists for this lot (e.g. after a delete that left stale data), treat as available
    const existingPropertyForLot = await Property.findOne({ lot })
    if (!existingPropertyForLot && (lotExists.assignedUser || lotExists.status !== 'available')) {
      await Lot.findByIdAndUpdate(lot, { status: 'available', assignedUser: null })
      lotExists.assignedUser = null
      lotExists.status = 'available'
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

// Schema fields that can be updated via PUT (any value allowed by the model)
const ALLOWED_PROPERTY_UPDATES = [
  'lot', 'model', 'facade', 'users', 'price', 'pending', 'initialPayment',
  'status', 'saleDate', 'hasBalcony', 'modelType', 'hasStorage'
]

export const updateProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id)
    
    if (property) {
      const previousLotId = property.lot ? property.lot.toString() : null

      // Apply any allowed field present in the request body (price is only calculated on create; updates use the sent values)
      for (const key of ALLOWED_PROPERTY_UPDATES) {
        if (req.body[key] !== undefined) {
          if (key === 'price') {
            const newPrice = Number(req.body.price)
            if (!Number.isNaN(newPrice) && newPrice >= 0) {
              const priceDifference = newPrice - property.price
              property.price = newPrice
              property.pending = Math.max(0, property.pending + priceDifference)
              property.markModified('price')
              property.markModified('pending')
            }
          } else if (key === 'pending') {
            const newPending = Number(req.body.pending)
            if (!Number.isNaN(newPending) && newPending >= 0) {
              property.pending = newPending
              property.markModified('pending')
            }
          } else if (key === 'initialPayment') {
            const newInitial = Number(req.body.initialPayment)
            if (!Number.isNaN(newInitial) && newInitial >= 0) {
              property.initialPayment = newInitial
              property.pending = Math.max(0, property.price - newInitial)
              property.markModified('initialPayment')
              property.markModified('pending')
            }
          } else if (key === 'users') {
            const newUsers = req.body.users
            if (Array.isArray(newUsers) && newUsers.length > 0) {
              const previousIds = (property.users || []).map(id => id.toString())
              const newIds = newUsers.map(id => (id && (id._id || id).toString?.()) || String(id))
              property.users = newIds
              property.markModified('users')
              for (const userId of newIds) {
                const userDoc = await User.findById(userId)
                if (userDoc && !userDoc.lots.some(lid => lid.toString() === property.lot.toString())) {
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
          } else if (key === 'saleDate') {
            const val = req.body.saleDate
            property.saleDate = (val === '' || val == null) ? null : val
            property.markModified('saleDate')
          } else {
            property[key] = req.body[key]
            property.markModified(key)
          }
        }
      }

      // When lot is changed: free old lot (so it appears available again) and assign new lot
      const newLotId = property.lot ? property.lot.toString() : null
      if (req.body.lot !== undefined && previousLotId && newLotId && previousLotId !== newLotId) {
        await Lot.findByIdAndUpdate(previousLotId, {
          status: 'available',
          assignedUser: null
        }, { runValidators: false })
        const previousLotObjectId = new mongoose.Types.ObjectId(previousLotId)
        await User.updateMany(
          { lots: previousLotObjectId },
          { $pull: { lots: previousLotObjectId } }
        )
        const firstOwner = (property.users && property.users.length) ? property.users[0] : null
        await Lot.findByIdAndUpdate(property.lot, {
          status: property.status === 'sold' ? 'sold' : 'pending',
          assignedUser: firstOwner || undefined
        }, { runValidators: false })
        if (firstOwner) {
          const userDoc = await User.findById(firstOwner)
          if (userDoc && !userDoc.lots.some(id => id.toString() === newLotId)) {
            userDoc.lots.push(property.lot)
            await userDoc.save()
          }
          for (let i = 1; i < (property.users?.length || 0); i++) {
            const uid = property.users[i]
            const u = await User.findById(uid)
            if (u && !u.lots.some(id => id.toString() === newLotId)) {
              u.lots.push(property.lot)
              await u.save()
            }
          }
        }
      }
      
      if (property.status === 'sold' && property.lot) {
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
        $set: { status: 'available', assignedUser: null }
      }, { runValidators: false })
      
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
