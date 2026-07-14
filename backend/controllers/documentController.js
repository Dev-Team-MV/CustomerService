import crypto from 'crypto'
import path from 'path'
import multer from 'multer'
import Document, { DOCUMENT_CATEGORIES } from '../models/Document.js'
import Project from '../models/Project.js'
import { isValidObjectId, parsePagination, buildPaginationMeta } from '../utils/crmHelpers.js'
import { uploadFile, deleteFile } from '../services/storageService.js'
import { scanExpiringDocuments } from '../services/documentExpiryScheduler.js'

const DOCUMENT_POPULATE = [
  { path: 'uploadedBy', select: 'firstName lastName email' },
  { path: 'projectId', select: 'name slug title' },
  { path: 'propertyId', select: 'price status' },
  { path: 'apartmentId', select: 'number unit' },
  { path: 'clientId', select: 'firstName lastName email' },
  { path: 'leadId', select: 'name email phone' },
  { path: 'previousVersion', select: 'title version fileUrl' }
]

const memoryStorage = multer.memoryStorage()
const DEFAULT_MAX_UPLOAD_MB = 50
const parsedMax = Number.parseInt(process.env.DOCUMENT_MAX_FILE_SIZE_MB, 10)
const maxMb =
  Number.isFinite(parsedMax) && parsedMax > 0 ? parsedMax : DEFAULT_MAX_UPLOAD_MB

export const documentUpload = multer({
  storage: memoryStorage,
  limits: { fileSize: maxMb * 1024 * 1024, files: 1 }
})

function buildRefFilter(query) {
  const filter = { isArchived: query.includeArchived === 'true' ? undefined : false }
  if (filter.isArchived === undefined) delete filter.isArchived

  for (const key of ['projectId', 'propertyId', 'apartmentId', 'clientId', 'leadId']) {
    if (query[key]) {
      if (!isValidObjectId(query[key])) return { error: `Invalid ${key}` }
      filter[key] = query[key]
    }
  }
  if (query.category) {
    if (!DOCUMENT_CATEGORIES.includes(query.category)) {
      return { error: `Invalid category. Allowed: ${DOCUMENT_CATEGORIES.join(', ')}` }
    }
    filter.category = query.category
  }
  if (query.tags) {
    const tags = String(query.tags)
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)
    if (tags.length) filter.tags = { $all: tags }
  }
  return { filter }
}

async function uploadDocumentFile(file) {
  const ext = path.extname(file.originalname || '').toLowerCase() || ''
  const safeExt = ext.replace(/[^a-z0-9.]/gi, '') || ''
  const hash = crypto.randomBytes(16).toString('hex')
  const fileName = `${Date.now()}-${hash}${safeExt}`
  const result = await uploadFile(
    file.buffer,
    fileName,
    file.mimetype,
    false,
    'documents'
  )
  if (!result.success) {
    throw new Error(result.error || 'Failed to upload file to storage')
  }
  return {
    fileUrl: result.publicUrl || result.signedUrl,
    gcsFileName: result.fileName,
    mimeType: file.mimetype,
    fileSize: file.size || file.buffer?.length || 0
  }
}

export const createDocument = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      propertyId,
      apartmentId,
      clientId,
      leadId,
      projectId,
      tags,
      expiresAt,
      thumbnailUrl,
      fileUrl: bodyFileUrl,
      mimeType: bodyMimeType,
      fileSize: bodyFileSize
    } = req.body

    if (!title?.trim()) return res.status(400).json({ message: 'Title is required' })
    if (!DOCUMENT_CATEGORIES.includes(category)) {
      return res.status(400).json({
        message: `category must be one of: ${DOCUMENT_CATEGORIES.join(', ')}`
      })
    }
    if (!isValidObjectId(projectId)) {
      return res.status(400).json({ message: 'Valid projectId is required' })
    }

    const projectExists = await Project.exists({ _id: projectId })
    if (!projectExists) return res.status(404).json({ message: 'Project not found' })

    let fileMeta
    if (req.file) {
      fileMeta = await uploadDocumentFile(req.file)
    } else if (bodyFileUrl) {
      fileMeta = {
        fileUrl: bodyFileUrl,
        gcsFileName: null,
        mimeType: bodyMimeType || '',
        fileSize: Number(bodyFileSize) || 0
      }
    } else {
      return res.status(400).json({ message: 'File upload or fileUrl is required' })
    }

    let parsedTags = tags
    if (typeof tags === 'string') {
      try {
        parsedTags = JSON.parse(tags)
      } catch {
        parsedTags = tags.split(',').map((t) => t.trim()).filter(Boolean)
      }
    }

    const doc = await Document.create({
      title: title.trim(),
      description: description || '',
      category,
      ...fileMeta,
      thumbnailUrl: thumbnailUrl || null,
      propertyId: propertyId || null,
      apartmentId: apartmentId || null,
      clientId: clientId || null,
      leadId: leadId || null,
      projectId,
      tags: Array.isArray(parsedTags) ? parsedTags : [],
      version: 1,
      uploadedBy: req.user._id,
      expiresAt: expiresAt ? new Date(expiresAt) : null
    })

    await doc.populate(DOCUMENT_POPULATE)
    res.status(201).json(doc)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const getDocuments = async (req, res) => {
  try {
    const built = buildRefFilter(req.query)
    if (built.error) return res.status(400).json({ message: built.error })

    const { page, limit, skip } = parsePagination(req.query)
    const [documents, total] = await Promise.all([
      Document.find(built.filter)
        .populate(DOCUMENT_POPULATE)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Document.countDocuments(built.filter)
    ])

    res.json({
      documents,
      pagination: buildPaginationMeta(total, page, limit)
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const getDocumentById = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid id' })
    }
    const doc = await Document.findById(req.params.id).populate(DOCUMENT_POPULATE).lean()
    if (!doc) return res.status(404).json({ message: 'Document not found' })
    res.json(doc)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const updateDocument = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid id' })
    }
    const doc = await Document.findById(req.params.id)
    if (!doc) return res.status(404).json({ message: 'Document not found' })

    const {
      title,
      description,
      category,
      tags,
      expiresAt,
      thumbnailUrl,
      propertyId,
      apartmentId,
      clientId,
      leadId
    } = req.body

    if (title !== undefined) doc.title = String(title).trim()
    if (description !== undefined) doc.description = description
    if (category !== undefined) {
      if (!DOCUMENT_CATEGORIES.includes(category)) {
        return res.status(400).json({
          message: `category must be one of: ${DOCUMENT_CATEGORIES.join(', ')}`
        })
      }
      doc.category = category
    }
    if (tags !== undefined) doc.tags = Array.isArray(tags) ? tags : []
    if (expiresAt !== undefined) {
      doc.expiresAt = expiresAt ? new Date(expiresAt) : null
    }
    if (thumbnailUrl !== undefined) doc.thumbnailUrl = thumbnailUrl
    if (propertyId !== undefined) doc.propertyId = propertyId || null
    if (apartmentId !== undefined) doc.apartmentId = apartmentId || null
    if (clientId !== undefined) doc.clientId = clientId || null
    if (leadId !== undefined) doc.leadId = leadId || null

    await doc.save()
    await doc.populate(DOCUMENT_POPULATE)
    res.json(doc)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const deleteDocument = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid id' })
    }
    const doc = await Document.findById(req.params.id)
    if (!doc) return res.status(404).json({ message: 'Document not found' })

    if (doc.gcsFileName) {
      try {
        await deleteFile(doc.gcsFileName)
      } catch (err) {
        console.error('Failed to delete GCS file:', err.message)
      }
    }

    await doc.deleteOne()
    res.json({ message: 'Document deleted', id: doc._id })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const getDocumentsByProperty = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.propertyId)) {
      return res.status(400).json({ message: 'Invalid propertyId' })
    }
    const documents = await Document.find({
      propertyId: req.params.propertyId,
      isArchived: false
    })
      .populate(DOCUMENT_POPULATE)
      .sort({ createdAt: -1 })
      .lean()
    res.json({ documents, total: documents.length })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const getDocumentsByClient = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.clientId)) {
      return res.status(400).json({ message: 'Invalid clientId' })
    }
    const documents = await Document.find({
      clientId: req.params.clientId,
      isArchived: false
    })
      .populate(DOCUMENT_POPULATE)
      .sort({ createdAt: -1 })
      .lean()
    res.json({ documents, total: documents.length })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const getDocumentsByProject = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.projectId)) {
      return res.status(400).json({ message: 'Invalid projectId' })
    }
    const filter = { projectId: req.params.projectId, isArchived: false }
    if (req.query.category && DOCUMENT_CATEGORIES.includes(req.query.category)) {
      filter.category = req.query.category
    }
    const documents = await Document.find(filter)
      .populate(DOCUMENT_POPULATE)
      .sort({ createdAt: -1 })
      .lean()
    res.json({ documents, total: documents.length })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const searchDocuments = async (req, res) => {
  try {
    const q = (req.query.q || req.query.query || '').trim()
    const built = buildRefFilter(req.query)
    if (built.error) return res.status(400).json({ message: built.error })

    const filter = { ...built.filter }
    if (q) {
      filter.$text = { $search: q }
    }

    const { page, limit, skip } = parsePagination(req.query)
    const projection = q ? { score: { $meta: 'textScore' } } : undefined
    const sort = q ? { score: { $meta: 'textScore' } } : { createdAt: -1 }

    const [documents, total] = await Promise.all([
      Document.find(filter, projection)
        .populate(DOCUMENT_POPULATE)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      Document.countDocuments(filter)
    ])

    res.json({
      documents,
      pagination: buildPaginationMeta(total, page, limit),
      query: q
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const uploadNewVersion = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid id' })
    }
    if (!req.file) return res.status(400).json({ message: 'File is required' })

    const previous = await Document.findById(req.params.id)
    if (!previous) return res.status(404).json({ message: 'Document not found' })

    const fileMeta = await uploadDocumentFile(req.file)

    const next = await Document.create({
      title: previous.title,
      description: previous.description,
      category: previous.category,
      ...fileMeta,
      thumbnailUrl: previous.thumbnailUrl,
      propertyId: previous.propertyId,
      apartmentId: previous.apartmentId,
      clientId: previous.clientId,
      leadId: previous.leadId,
      projectId: previous.projectId,
      tags: previous.tags,
      version: (previous.version || 1) + 1,
      previousVersion: previous._id,
      uploadedBy: req.user._id,
      expiresAt: previous.expiresAt
    })

    previous.isArchived = true
    await previous.save()

    await next.populate(DOCUMENT_POPULATE)
    res.status(201).json(next)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const archiveDocument = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid id' })
    }
    const doc = await Document.findById(req.params.id)
    if (!doc) return res.status(404).json({ message: 'Document not found' })
    doc.isArchived = true
    await doc.save()
    await doc.populate(DOCUMENT_POPULATE)
    res.json(doc)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const getExpiringDocuments = async (req, res) => {
  try {
    const daysAhead = Math.max(1, Number(req.query.daysAhead) || 30)
    const now = new Date()
    const until = new Date(now)
    until.setDate(until.getDate() + daysAhead)

    const filter = {
      isArchived: false,
      expiresAt: { $gte: now, $lte: until }
    }
    if (req.query.projectId) {
      if (!isValidObjectId(req.query.projectId)) {
        return res.status(400).json({ message: 'Invalid projectId' })
      }
      filter.projectId = req.query.projectId
    }
    if (req.query.category && DOCUMENT_CATEGORIES.includes(req.query.category)) {
      filter.category = req.query.category
    }

    const documents = await Document.find(filter)
      .populate(DOCUMENT_POPULATE)
      .sort({ expiresAt: 1 })
      .lean()

    res.json({ documents, total: documents.length, daysAhead })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

/** Manual trigger for the weekly expiry notification scan */
export const runExpiringDocumentsScan = async (req, res) => {
  try {
    const daysAhead = Math.max(1, Number(req.query.daysAhead) || 30)
    const result = await scanExpiringDocuments(daysAhead)
    res.json(result)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}
