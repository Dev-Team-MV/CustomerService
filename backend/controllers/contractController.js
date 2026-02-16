import Contract from '../models/Contract.js'
import Property from '../models/Property.js'

const VALID_TYPES = ['promissoryNote', 'purchaseContract', 'agreement']

function normalizeContractItem(c) {
  return {
    type: c.type,
    fileUrl: c.fileUrl,
    uploadedAt: c.uploadedAt ? new Date(c.uploadedAt) : new Date()
  }
}

/** Merge incoming contracts by type: update existing type or add new. One entry per type. */
function mergeContractsByType(existingList, incomingList) {
  const byType = new Map(existingList.map((c) => [c.type, { ...c.toObject?.() || c }]))
  for (const c of incomingList) {
    byType.set(c.type, { type: c.type, fileUrl: c.fileUrl, uploadedAt: c.uploadedAt })
  }
  return Array.from(byType.values())
}

export const getAllContracts = async (req, res) => {
  try {
    const { propertyId } = req.query
    const filter = {}
    if (propertyId) filter.property = propertyId

    const contracts = await Contract.find(filter)
      .populate({
        path: 'property',
        populate: [
          { path: 'lot', select: 'number' },
          { path: 'model', select: 'model modelNumber' },
          { path: 'users', select: 'firstName lastName email' }
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
          { path: 'lot', select: 'number' },
          { path: 'model', select: 'model modelNumber' },
          { path: 'users', select: 'firstName lastName email' }
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
        { path: 'users' }
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

    const normalizedContracts = (contracts || []).map(normalizeContractItem)
    for (const c of normalizedContracts) {
      if (!VALID_TYPES.includes(c.type)) {
        return res.status(400).json({
          message: `Invalid contract type. Allowed: ${VALID_TYPES.join(', ')}`
        })
      }
    }

    let contract = await Contract.findOne({ property: propertyId })

    if (contract) {
      contract.contracts = mergeContractsByType(contract.contracts, normalizedContracts)
      await contract.save()
      const updated = await Contract.findById(contract._id).populate({
        path: 'property',
        populate: [
          { path: 'lot' },
          { path: 'model' },
          { path: 'users' }
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
        { path: 'users' }
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

    if (contracts !== undefined && Array.isArray(contracts) && contracts.length > 0) {
      const normalizedContracts = contracts.map(normalizeContractItem)
      for (const c of normalizedContracts) {
        if (!VALID_TYPES.includes(c.type)) {
          return res.status(400).json({
            message: `Invalid contract type. Allowed: ${VALID_TYPES.join(', ')}`
          })
        }
      }
      contract.contracts = mergeContractsByType(contract.contracts, normalizedContracts)
    }

    const updatedContract = await contract.save()
    const populated = await Contract.findById(updatedContract._id).populate({
      path: 'property',
      populate: [
        { path: 'lot' },
        { path: 'model' },
        { path: 'users' }
      ]
    })
    res.json(populated)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const updateContractByPropertyId = async (req, res) => {
  try {
    const contract = await Contract.findOne({ property: req.params.propertyId })

    if (!contract) {
      return res.status(404).json({
        message: 'No contracts found for this property. Use POST /api/contracts to create first.'
      })
    }

    const { contracts } = req.body

    if (contracts !== undefined && Array.isArray(contracts) && contracts.length > 0) {
      const normalizedContracts = contracts.map(normalizeContractItem)
      for (const c of normalizedContracts) {
        if (!VALID_TYPES.includes(c.type)) {
          return res.status(400).json({
            message: `Invalid contract type. Allowed: ${VALID_TYPES.join(', ')}`
          })
        }
      }
      contract.contracts = mergeContractsByType(contract.contracts, normalizedContracts)
    }

    const updatedContract = await contract.save()
    const populated = await Contract.findById(updatedContract._id).populate({
      path: 'property',
      populate: [
        { path: 'lot' },
        { path: 'model' },
        { path: 'users' }
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
