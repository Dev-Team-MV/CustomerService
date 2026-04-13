import Contract from '../models/Contract.js'
import Property from '../models/Property.js'
import Apartment from '../models/Apartment.js'
import { hydrateUrlsInObject, normalizePathForStorage, resolveToSignedUrl } from '../services/urlResolverService.js'

const VALID_TYPES = ['promissoryNote', 'purchaseContract', 'agreement']

function normalizeContractItem (c) {
  const path = normalizePathForStorage(c.fileUrl)
  return {
    type: c.type,
    fileUrl: path || c.fileUrl,
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

const populateContract = (q) =>
  q
    .populate({
      path: 'property',
      populate: [
        { path: 'lot', select: 'number' },
        { path: 'model', select: 'model modelNumber' },
        { path: 'users', select: 'firstName lastName email' }
      ]
    })
    .populate({
      path: 'apartment',
      populate: [
        { path: 'apartmentModel', select: 'name apartmentNumber' },
        { path: 'users', select: 'firstName lastName email' }
      ]
    })

export const getAllContracts = async (req, res) => {
  try {
    const { propertyId, apartmentId } = req.query
    const filter = {}
    if (propertyId) filter.property = propertyId
    if (apartmentId) filter.apartment = apartmentId

    const contracts = await populateContract(Contract.find(filter)).sort({ updatedAt: -1 })

    const data = contracts.map((c) => c.toObject())
    await hydrateUrlsInObject(data)
    res.json(data)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const getContractsByPropertyId = async (req, res) => {
  try {
    const contract = await populateContract(Contract.findOne({ property: req.params.propertyId }))
    if (contract) {
      const data = contract.toObject()
      await hydrateUrlsInObject(data)
      res.json(data)
    } else {
      res.status(404).json({ message: 'No contracts found for this property' })
    }
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const getContractsByApartmentId = async (req, res) => {
  try {
    const contract = await populateContract(Contract.findOne({ apartment: req.params.apartmentId }))
    if (contract) {
      const data = contract.toObject()
      await hydrateUrlsInObject(data)
      res.json(data)
    } else {
      res.status(404).json({ message: 'No contracts found for this apartment' })
    }
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const getContractById = async (req, res) => {
  try {
    const contract = await populateContract(Contract.findById(req.params.id))

    if (contract) {
      const data = contract.toObject()
      await hydrateUrlsInObject(data)
      res.json(data)
    } else {
      res.status(404).json({ message: 'Contract not found' })
    }
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const createContract = async (req, res) => {
  try {
    const { propertyId, apartmentId, contracts } = req.body

    if ((propertyId && apartmentId) || (!propertyId && !apartmentId)) {
      return res.status(400).json({ message: 'Exactly one of propertyId or apartmentId is required' })
    }

    const normalizedContracts = (contracts || []).map(normalizeContractItem)
    for (const c of normalizedContracts) {
      if (!VALID_TYPES.includes(c.type)) {
        return res.status(400).json({
          message: `Invalid contract type. Allowed: ${VALID_TYPES.join(', ')}`
        })
      }
    }

    if (propertyId) {
      const propertyExists = await Property.findById(propertyId)
      if (!propertyExists) return res.status(404).json({ message: 'Property not found' })

      let contract = await Contract.findOne({ property: propertyId })
      if (contract) {
        contract.contracts = mergeContractsByType(contract.contracts, normalizedContracts)
        await contract.save()
        const updated = await populateContract(Contract.findById(contract._id))
        const data = updated.toObject()
        await hydrateUrlsInObject(data)
        return res.json(data)
      }
      contract = await Contract.create({ property: propertyId, contracts: normalizedContracts })
      const populated = await populateContract(Contract.findById(contract._id))
      const data = populated.toObject()
      await hydrateUrlsInObject(data)
      return res.status(201).json(data)
    }

    const apartmentExists = await Apartment.findById(apartmentId)
    if (!apartmentExists) return res.status(404).json({ message: 'Apartment not found' })

    let contract = await Contract.findOne({ apartment: apartmentId })
    if (contract) {
      contract.contracts = mergeContractsByType(contract.contracts, normalizedContracts)
      await contract.save()
      const updated = await populateContract(Contract.findById(contract._id))
      const data = updated.toObject()
      await hydrateUrlsInObject(data)
      return res.json(data)
    }
    contract = await Contract.create({ apartment: apartmentId, contracts: normalizedContracts })
    const populated = await populateContract(Contract.findById(contract._id))
    const data = populated.toObject()
    await hydrateUrlsInObject(data)
    res.status(201).json(data)
  } catch (error) {
    if (error?.code === 11000) {
      const duplicateField = Object.keys(error?.keyPattern || {})[0]
      if (duplicateField === 'property') {
        return res.status(409).json({
          message: 'A contract record for this property already exists. Use update endpoint instead.'
        })
      }
      if (duplicateField === 'apartment') {
        return res.status(409).json({
          message: 'A contract record for this apartment already exists. Use update endpoint instead.'
        })
      }
      return res.status(409).json({ message: 'Duplicate contract key detected' })
    }
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
    const populated = await populateContract(Contract.findById(updatedContract._id))
    const data = populated.toObject()
    await hydrateUrlsInObject(data)
    res.json(data)
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
    const populated = await populateContract(Contract.findById(updatedContract._id))
    const data = populated.toObject()
    await hydrateUrlsInObject(data)
    res.json(data)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const updateContractByApartmentId = async (req, res) => {
  try {
    const contract = await Contract.findOne({ apartment: req.params.apartmentId })
    if (!contract) {
      return res.status(404).json({
        message: 'No contracts found for this apartment. Use POST /api/contracts to create first.'
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
    const populated = await populateContract(Contract.findById(updatedContract._id))
    const data = populated.toObject()
    await hydrateUrlsInObject(data)
    res.json(data)
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

/**
 * Download a contract file by property and type (proxy to avoid CORS when fetching from GCS).
 */
export const downloadContractByPropertyAndType = async (req, res) => {
  try {
    const { propertyId, type } = req.params
    if (!VALID_TYPES.includes(type)) {
      return res.status(400).json({ message: `Invalid contract type. Allowed: ${VALID_TYPES.join(', ')}` })
    }

    const contractDoc = await Contract.findOne({ property: propertyId })
    if (!contractDoc) {
      return res.status(404).json({ message: 'No contracts found for this property' })
    }

    const contractItem = contractDoc.contracts.find((c) => c.type === type)
    if (!contractItem?.fileUrl) {
      return res.status(404).json({ message: `No contract of type "${type}" found for this property` })
    }

    const fileUrl = await resolveToSignedUrl(contractItem.fileUrl)
    if (!fileUrl) {
      return res.status(502).json({ message: 'Failed to generate signed URL for file' })
    }
    const response = await fetch(fileUrl, { method: 'GET' })
    if (!response.ok) {
      return res.status(502).json({ message: 'Failed to fetch file from storage' })
    }

    const contentType = response.headers.get('content-type') || 'application/pdf'
    const contentDisposition = response.headers.get('content-disposition')
    let filename = `${type}.pdf`
    if (contentDisposition) {
      const match = contentDisposition.match(/filename\*?=(?:UTF-8'')?"?([^";\n]+)"?/i) || contentDisposition.match(/filename="?([^";\n]+)"?/i)
      if (match && match[1]) filename = match[1].trim().replace(/^["']|["']$/g, '')
    } else {
      try {
        const urlPath = new URL(fileUrl).pathname
        const segment = urlPath.split('/').filter(Boolean).pop()
        if (segment) filename = decodeURIComponent(segment)
      } catch (_) {}
    }

    res.setHeader('Content-Type', contentType)
    res.setHeader('Content-Disposition', `attachment; filename="${filename.replace(/"/g, '\\"')}"`)

    const { Readable } = await import('stream')
    const nodeStream = Readable.fromWeb(response.body)
    nodeStream.pipe(res)
  } catch (error) {
    console.error('Download contract error:', error)
    if (!res.headersSent) {
      res.status(500).json({ message: error.message || 'Failed to download contract' })
    }
  }
}

export const downloadContractByApartmentAndType = async (req, res) => {
  try {
    const { apartmentId, type } = req.params
    if (!VALID_TYPES.includes(type)) {
      return res.status(400).json({ message: `Invalid contract type. Allowed: ${VALID_TYPES.join(', ')}` })
    }
    const contractDoc = await Contract.findOne({ apartment: apartmentId })
    if (!contractDoc) {
      return res.status(404).json({ message: 'No contracts found for this apartment' })
    }
    const contractItem = contractDoc.contracts.find((c) => c.type === type)
    if (!contractItem?.fileUrl) {
      return res.status(404).json({ message: `No contract of type "${type}" found for this apartment` })
    }
    const fileUrl = await resolveToSignedUrl(contractItem.fileUrl)
    if (!fileUrl) {
      return res.status(502).json({ message: 'Failed to generate signed URL for file' })
    }
    const response = await fetch(fileUrl, { method: 'GET' })
    if (!response.ok) {
      return res.status(502).json({ message: 'Failed to fetch file from storage' })
    }
    const contentType = response.headers.get('content-type') || 'application/pdf'
    const contentDisposition = response.headers.get('content-disposition')
    let filename = `${type}.pdf`
    if (contentDisposition) {
      const match = contentDisposition.match(/filename\*?=(?:UTF-8'')?"?([^";\n]+)"?/i) || contentDisposition.match(/filename="?([^";\n]+)"?/i)
      if (match && match[1]) filename = match[1].trim().replace(/^["']|["']$/g, '')
    } else {
      try {
        const urlPath = new URL(fileUrl).pathname
        const segment = urlPath.split('/').filter(Boolean).pop()
        if (segment) filename = decodeURIComponent(segment)
      } catch (_) {}
    }
    res.setHeader('Content-Type', contentType)
    res.setHeader('Content-Disposition', `attachment; filename="${filename.replace(/"/g, '\\"')}"`)
    const { Readable } = await import('stream')
    const nodeStream = Readable.fromWeb(response.body)
    nodeStream.pipe(res)
  } catch (error) {
    console.error('Download contract error:', error)
    if (!res.headersSent) {
      res.status(500).json({ message: error.message || 'Failed to download contract' })
    }
  }
}
