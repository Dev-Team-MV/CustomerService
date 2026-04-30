import Project from '../models/Project.js'
import OutdoorAmenityKeyConfig, { OUTDOOR_AMENITY_KEY_CONFIG_ID } from '../models/OutdoorAmenityKeyConfig.js'
import { ALLOWED_OUTDOOR_AMENITY_KEYS } from '../constants/outdoorAmenityKeys.js'
import {
  getMergedAllowedKeys,
  getExtraKeysOnly,
  normalizeKeyInput,
  parseKeysFromBody
} from '../services/outdoorAmenityKeysService.js'
import { hydrateUrlsInObject } from '../services/urlResolverService.js'
import { normalizeImageArray } from '../utils/imageUtils.js'

class OutdoorAmenityValidationError extends Error {
  constructor (message, details = {}) {
    super(message)
    this.name = 'OutdoorAmenityValidationError'
    this.statusCode = 400
    this.details = details
  }
}

async function normalizeOutdoorAmenitySections (sections) {
  if (!Array.isArray(sections)) return []
  const allowedKeys = await getMergedAllowedKeys()
  const normalized = sections
    .map((section) => {
      const key = typeof section?.key === 'string' ? section.key.trim().toLowerCase() : ''
      if (!key) return null
      return {
        key,
        images: normalizeImageArray(section.images)
      }
    })
    .filter(Boolean)

  const invalidKeys = normalized
    .map((section) => section.key)
    .filter((key) => !allowedKeys.includes(key))

  if (invalidKeys.length > 0) {
    throw new OutdoorAmenityValidationError('Invalid outdoor amenity keys', {
      invalidKeys: [...new Set(invalidKeys)],
      allowedKeys
    })
  }

  return normalized
}

/** Lectura: normaliza imágenes y key, sin rechazar por allowlist (evita 400 con datos legacy). */
function normalizeOutdoorAmenitySectionsForRead (sections) {
  if (!Array.isArray(sections)) return []
  return sections
    .map((section) => {
      const key = typeof section?.key === 'string' ? section.key.trim().toLowerCase() : ''
      if (!key) return null
      return {
        key,
        images: normalizeImageArray(section.images)
      }
    })
    .filter(Boolean)
}

/**
 * Lista de keys permitidas: built-in + extras en BD (Swagger / referencia).
 * GET /api/projects/outdoor-amenity-keys
 */
export const getOutdoorAmenityKeys = async (req, res) => {
  try {
    const keys = await getMergedAllowedKeys()
    const extraKeys = await getExtraKeysOnly()
    res.json({
      keys,
      builtIn: [...ALLOWED_OUTDOOR_AMENITY_KEYS],
      extraKeys
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

/**
 * Añade keys extra (persistidas). No sustituye las built-in.
 * POST /api/projects/outdoor-amenity-keys — body: { keys: ["dog-park"] } o { key: "dog-park" }
 */
export const addOutdoorAmenityKeys = async (req, res) => {
  try {
    const raw = parseKeysFromBody(req.body)
    if (!raw || raw.length === 0) {
      return res.status(400).json({ message: 'Provide keys (array) or key (string)' })
    }

    const invalidInputs = []
    const normalized = []
    for (const item of raw) {
      const n = normalizeKeyInput(item)
      if (n) normalized.push(n)
      else invalidInputs.push(item)
    }
    if (invalidInputs.length > 0) {
      return res.status(400).json({
        message: 'Invalid key format',
        invalidKeys: invalidInputs,
        hint: 'Use lowercase letters, numbers, hyphens between segments (e.g. dog-park, retail-hub)'
      })
    }

    const uniqueToConsider = [...new Set(normalized)]
    const mergedBefore = await getMergedAllowedKeys()
    const newOnes = uniqueToConsider.filter((k) => !mergedBefore.includes(k))

    if (newOnes.length === 0) {
      const keys = await getMergedAllowedKeys()
      const extraKeys = await getExtraKeysOnly()
      return res.status(200).json({
        message: 'All keys already allowed',
        added: [],
        keys,
        builtIn: [...ALLOWED_OUTDOOR_AMENITY_KEYS],
        extraKeys
      })
    }

    await OutdoorAmenityKeyConfig.findOneAndUpdate(
      { _id: OUTDOOR_AMENITY_KEY_CONFIG_ID },
      { $addToSet: { extraKeys: { $each: newOnes } } },
      { upsert: true, new: true }
    )

    const keys = await getMergedAllowedKeys()
    const extraKeys = await getExtraKeysOnly()
    res.status(201).json({
      message: 'Keys added',
      added: newOnes,
      keys,
      builtIn: [...ALLOWED_OUTDOOR_AMENITY_KEYS],
      extraKeys
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const getAllProjects = async (req, res) => {
  try {
    const { activeOnly, status } = req.query
    const filter = {}
    if (activeOnly === 'true' || activeOnly === '1') {
      filter.isActive = true
    }
    if (status) {
      filter.status = status
    }
    const projects = await Project.find(filter).sort({ slug: 1 })
    res.json(projects)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
    if (project) {
      const payload = project.toObject()
      await hydrateUrlsInObject(payload)
      res.json(payload)
    } else {
      res.status(404).json({ message: 'Project not found' })
    }
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const getProjectBySlug = async (req, res) => {
  try {
    const project = await Project.findOne({ slug: req.params.slug })
    if (project) {
      const payload = project.toObject()
      await hydrateUrlsInObject(payload)
      res.json(payload)
    } else {
      res.status(404).json({ message: 'Project not found' })
    }
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

const pickProjectFields = (body) => {
  const allowed = [
    'name', 'slug', 'phase', 'title', 'subtitle', 'description', 'fullDescription',
    'image', 'gallery', 'features', 'type', 'facadeEnabled', 'status', 'isActive',
    'externalUrl', 'location', 'area', 'videos', 'outdoorAmenitySections'
  ]
  const data = {}
  for (const key of allowed) {
    if (body[key] !== undefined) data[key] = body[key]
  }
  return data
}

export const createProject = async (req, res) => {
  try {
    const { slug } = req.body
    if (!slug) {
      return res.status(400).json({ message: 'slug is required' })
    }
    const normalizedSlug = slug.toLowerCase().trim()
    const existing = await Project.findOne({ slug: normalizedSlug })
    if (existing) {
      return res.status(400).json({ message: 'Project with this slug already exists' })
    }
    const data = pickProjectFields(req.body)
    data.slug = normalizedSlug
    data.type = data.type || 'residential_lots'
    data.isActive = data.isActive !== false
    data.status = data.status || 'active'
    if (data.outdoorAmenitySections !== undefined) {
      data.outdoorAmenitySections = await normalizeOutdoorAmenitySections(data.outdoorAmenitySections)
    }
    const project = await Project.create(data)
    res.status(201).json(project)
  } catch (error) {
    if (error.name === 'OutdoorAmenityValidationError') {
      return res.status(error.statusCode).json({ message: error.message, ...error.details })
    }
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message)
      return res.status(400).json({ message: 'Validation error', errors })
    }
    res.status(500).json({ message: error.message })
  }
}

export const updateProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
    if (!project) {
      return res.status(404).json({ message: 'Project not found' })
    }
    const data = pickProjectFields(req.body)
    if (data.slug !== undefined) {
      const newSlug = data.slug.toLowerCase().trim()
      const existing = await Project.findOne({ slug: newSlug, _id: { $ne: project._id } })
      if (existing) {
        return res.status(400).json({ message: 'Another project with this slug already exists' })
      }
      data.slug = newSlug
    }
    if (data.outdoorAmenitySections !== undefined) {
      data.outdoorAmenitySections = await normalizeOutdoorAmenitySections(data.outdoorAmenitySections)
    }
    Object.assign(project, data)
    await project.save()
    res.json(project)
  } catch (error) {
    if (error.name === 'OutdoorAmenityValidationError') {
      return res.status(error.statusCode).json({ message: error.message, ...error.details })
    }
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message)
      return res.status(400).json({ message: 'Validation error', errors })
    }
    res.status(500).json({ message: error.message })
  }
}

export const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
    if (!project) {
      return res.status(404).json({ message: 'Project not found' })
    }
    await project.deleteOne()
    res.json({ message: 'Project deleted successfully' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const getProjectOutdoorAmenities = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).select('slug outdoorAmenitySections')
    if (!project) return res.status(404).json({ message: 'Project not found' })

    const payload = {
      projectId: project._id,
      slug: project.slug,
      outdoorAmenitySections: normalizeOutdoorAmenitySectionsForRead(project.outdoorAmenitySections)
    }
    await hydrateUrlsInObject(payload)
    res.json(payload)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const getProjectOutdoorAmenitiesBySlug = async (req, res) => {
  try {
    const slug = String(req.params.slug || '').trim().toLowerCase()
    const project = await Project.findOne({ slug }).select('slug outdoorAmenitySections')
    if (!project) return res.status(404).json({ message: 'Project not found' })

    const payload = {
      projectId: project._id,
      slug: project.slug,
      outdoorAmenitySections: normalizeOutdoorAmenitySectionsForRead(project.outdoorAmenitySections)
    }
    await hydrateUrlsInObject(payload)
    res.json(payload)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const updateProjectOutdoorAmenities = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
    if (!project) return res.status(404).json({ message: 'Project not found' })

    if (!Array.isArray(req.body?.outdoorAmenitySections)) {
      return res.status(400).json({ message: 'outdoorAmenitySections must be an array' })
    }

    project.outdoorAmenitySections = await normalizeOutdoorAmenitySections(req.body.outdoorAmenitySections)
    await project.save()

    // Plain objects only — Mongoose subdocs + hydrateUrlsInObject() can recurse infinitely (stack overflow).
    const payload = {
      projectId: project._id,
      slug: project.slug,
      outdoorAmenitySections: normalizeOutdoorAmenitySectionsForRead(project.outdoorAmenitySections)
    }
    await hydrateUrlsInObject(payload)
    res.json(payload)
  } catch (error) {
    if (error.name === 'OutdoorAmenityValidationError') {
      return res.status(error.statusCode).json({ message: error.message, ...error.details })
    }
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message)
      return res.status(400).json({ message: 'Validation error', errors })
    }
    res.status(500).json({ message: error.message })
  }
}
