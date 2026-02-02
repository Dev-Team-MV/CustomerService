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

export const getAllProperties = async (req, res) => {
  try {
    const { status, user } = req.query
    const filter = { tenant: req.tenantId }
    if (status) filter.status = status
    if (user) filter.user = user

    const properties = await Property.find(filter)
      .populate('lot', 'number section size')
      .populate('model', 'model price bedrooms bathrooms sqft images balconies upgrades')
      .populate('facade', 'title url price')
      .populate('user', 'firstName lastName email phoneNumber')
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
      return propertyObj
    })
    
    res.json(propertiesWithPercentage)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const getPropertyById = async (req, res) => {
  try {
    const property = await Property.findOne({ _id: req.params.id, tenant: req.tenantId })
      .populate('lot', 'number section size price')
      .populate('model', 'model price bedrooms bathrooms sqft images description balconies upgrades')
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
      const propertyObj = property.toObject()
      propertyObj.totalConstructionPercentage = property.totalConstructionPercentage || 0
      propertyObj.images = getPropertyImages(property)
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
    const { lot, model, facade, user, initialPayment, hasBalcony, modelType, hasStorage } = req.body
    
    // Validate lot (must belong to tenant)
    const lotExists = await Lot.findOne({ _id: lot, tenant: req.tenantId })
    if (!lotExists) {
      return res.status(404).json({ message: 'Lot not found' })
    }
    if (lotExists.status === 'sold') {
      return res.status(400).json({ message: 'Lot is already sold' })
    }
    if (lotExists.assignedUser && lotExists.assignedUser.toString() !== user) {
      return res.status(400).json({ message: 'Lot is already assigned to another user' })
    }

    // Validate model (must belong to tenant)
    const modelExists = await Model.findOne({ _id: model, tenant: req.tenantId })
    if (!modelExists) {
      return res.status(404).json({ message: 'Model not found' })
    }

    // Validate facade (must belong to tenant)
    const facadeExists = await Facade.findOne({ _id: facade, tenant: req.tenantId })
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
      tenant: req.tenantId,
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
      .populate({
        path: 'phases',
        options: { sort: { phaseNumber: 1 } }
      })
    
    const propertyObj = populatedProperty.toObject()
    propertyObj.totalConstructionPercentage = populatedProperty.totalConstructionPercentage || 0
    propertyObj.images = getPropertyImages(populatedProperty)
    
    res.status(201).json(propertyObj)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const updateProperty = async (req, res) => {
  try {
    const property = await Property.findOne({ _id: req.params.id, tenant: req.tenantId })
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
        const lotExists = await Lot.findOne({ _id: property.lot, tenant: req.tenantId })
        const modelExists = await Model.findOne({ _id: property.model, tenant: req.tenantId })
        const facadeExists = await Facade.findOne({ _id: property.facade, tenant: req.tenantId })
        
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
        .populate({
          path: 'phases',
          options: { sort: { phaseNumber: 1 } }
        })
      
      const propertyObj = populatedProperty.toObject()
      propertyObj.totalConstructionPercentage = populatedProperty.totalConstructionPercentage || 0
      propertyObj.images = getPropertyImages(populatedProperty)
      
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
    const property = await Property.findOne({ _id: req.params.id, tenant: req.tenantId })
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
    const baseFilter = { tenant: req.tenantId }
    const totalProperties = await Property.countDocuments(baseFilter)
    const activeProperties = await Property.countDocuments({ ...baseFilter, status: 'active' })
    const pendingProperties = await Property.countDocuments({ ...baseFilter, status: 'pending' })
    const soldProperties = await Property.countDocuments({ ...baseFilter, status: 'sold' })

    const totalRevenue = await Property.aggregate([
      { $match: { tenant: req.tenantId, status: { $in: ['active', 'sold'] } } },
      { $group: { _id: null, total: { $sum: '$price' } } }
    ])
    const pendingPayments = await Property.aggregate([
      { $match: { tenant: req.tenantId, status: { $in: ['active', 'pending'] } } },
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
