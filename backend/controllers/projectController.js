import Project from '../models/Project.js'
import { hydrateUrlsInObject } from '../services/urlResolverService.js'
import { normalizeImageArray } from '../utils/imageUtils.js'

function normalizeOutdoorAmenitySections (sections) {
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
    'image', 'gallery', 'features', 'type', 'status', 'isActive',
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
      data.outdoorAmenitySections = normalizeOutdoorAmenitySections(data.outdoorAmenitySections)
    }
    const project = await Project.create(data)
    res.status(201).json(project)
  } catch (error) {
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
      data.outdoorAmenitySections = normalizeOutdoorAmenitySections(data.outdoorAmenitySections)
    }
    Object.assign(project, data)
    await project.save()
    res.json(project)
  } catch (error) {
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
      outdoorAmenitySections: normalizeOutdoorAmenitySections(project.outdoorAmenitySections)
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
      outdoorAmenitySections: normalizeOutdoorAmenitySections(project.outdoorAmenitySections)
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

    project.outdoorAmenitySections = normalizeOutdoorAmenitySections(req.body.outdoorAmenitySections)
    await project.save()

    const payload = {
      projectId: project._id,
      slug: project.slug,
      outdoorAmenitySections: project.outdoorAmenitySections
    }
    await hydrateUrlsInObject(payload)
    res.json(payload)
  } catch (error) {
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message)
      return res.status(400).json({ message: 'Validation error', errors })
    }
    res.status(500).json({ message: error.message })
  }
}
