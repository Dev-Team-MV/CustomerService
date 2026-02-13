import Contract from '../models/Contract.js'
import Property from '../models/Property.js'

export const getAllContracts = async (req, res) => {
  try {
    const { propertyId } = req.query
    const filter = {}
    if (propertyId) filter.property = propertyId

    const contracts = await Contract.find(filter)
      .populate({
        path: 'property',
        populate: [
          { path: 'lot', select: 'number section' },
          { path: 'model', select: 'model modelNumber' },
          { path: 'user', select: 'firstName lastName email' }
        ]
      })
      .sort({ updatedAt: -1 })

    res.json(contracts)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const getContractsByPropertyId = async (req, res) => {
  try {
    const contract = await Contract.findOne({ property: req.params.propertyId })
      .populate({
        path: 'property',
        populate: [
          { path: 'lot', select: 'number section' },
          { path: 'model', select: 'model modelNumber' },
          { path: 'user', select: 'firstName lastName email' }
        ]
      })

    if (contract) {
      res.json(contract)
    } else {
      res.status(404).json({ message: 'No contracts found for this property' })
    }
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const getContractById = async (req, res) => {
  try {
    const contract = await Contract.findById(req.params.id).populate({
      path: 'property',
      populate: [
        { path: 'lot' },
        { path: 'model' },
        { path: 'facade' },
        { path: 'user' }
      ]
    })

    if (contract) {
      res.json(contract)
    } else {
      res.status(404).json({ message: 'Contract not found' })
    }
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const createContract = async (req, res) => {
  try {
    const { propertyId, contracts } = req.body

    const propertyExists = await Property.findById(propertyId)
    if (!propertyExists) {
      return res.status(404).json({ message: 'Property not found' })
    }

    const validTypes = ['promissoryNote', 'purchaseContract', 'agreement']
    const normalizedContracts = (contracts || []).map((c) => ({
      type: c.type,
      fileUrl: c.fileUrl,
      uploadedAt: c.uploadedAt ? new Date(c.uploadedAt) : new Date()
    }))

    for (const c of normalizedContracts) {
      if (!validTypes.includes(c.type)) {
        return res.status(400).json({
          message: `Invalid contract type. Allowed: ${validTypes.join(', ')}`
        })
      }
    }

    let contract = await Contract.findOne({ property: propertyId })

    if (contract) {
      contract.contracts = normalizedContracts
      await contract.save()
      const updated = await Contract.findById(contract._id).populate({
        path: 'property',
        populate: [
          { path: 'lot' },
          { path: 'model' },
          { path: 'user' }
        ]
      })
      return res.json(updated)
    }

    contract = await Contract.create({
      property: propertyId,
      contracts: normalizedContracts
    })

    const populated = await Contract.findById(contract._id).populate({
      path: 'property',
      populate: [
        { path: 'lot' },
        { path: 'model' },
        { path: 'user' }
      ]
    })

    res.status(201).json(populated)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const updateContract = async (req, res) => {
  try {
    const contract = await Contract.findById(req.params.id)

    if (!contract) {
      return res.status(404).json({ message: 'Contract not found' })
    }

    const { contracts } = req.body
    const validTypes = ['promissoryNote', 'purchaseContract', 'agreement']

    if (contracts !== undefined) {
      const normalizedContracts = contracts.map((c) => ({
        type: c.type,
        fileUrl: c.fileUrl,
        uploadedAt: c.uploadedAt ? new Date(c.uploadedAt) : new Date()
      }))
      for (const c of normalizedContracts) {
        if (!validTypes.includes(c.type)) {
          return res.status(400).json({
            message: `Invalid contract type. Allowed: ${validTypes.join(', ')}`
          })
        }
      }
      contract.contracts = normalizedContracts
    }

    const updatedContract = await contract.save()
    const populated = await Contract.findById(updatedContract._id).populate({
      path: 'property',
      populate: [
        { path: 'lot' },
        { path: 'model' },
        { path: 'user' }
      ]
    })
    res.json(populated)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const deleteContract = async (req, res) => {
  try {
    const contract = await Contract.findById(req.params.id)

    if (contract) {
      await contract.deleteOne()
      res.json({ message: 'Contract deleted successfully' })
    } else {
      res.status(404).json({ message: 'Contract not found' })
    }
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}
