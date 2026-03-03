import Project from '../models/Project.js'

export const getAllProjects = async (req, res) => {
  try {
    const { activeOnly } = req.query
    const filter = {}
    if (activeOnly === 'true' || activeOnly === '1') {
      filter.isActive = true
    }
    const projects = await Project.find(filter).sort({ name: 1 })
    res.json(projects)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
    if (project) {
      res.json(project)
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
      res.json(project)
    } else {
      res.status(404).json({ message: 'Project not found' })
    }
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const createProject = async (req, res) => {
  try {
    const { name, slug, type, isActive, description } = req.body
    if (!name || !slug) {
      return res.status(400).json({ message: 'name and slug are required' })
    }
    const existing = await Project.findOne({ slug: slug.toLowerCase().trim() })
    if (existing) {
      return res.status(400).json({ message: 'Project with this slug already exists' })
    }
    const project = await Project.create({
      name,
      slug: slug.toLowerCase().trim(),
      type: type || 'residential_lots',
      isActive: isActive !== false,
      description: description || ''
    })
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
    if (req.body.name !== undefined) project.name = req.body.name
    if (req.body.slug !== undefined) {
      const newSlug = req.body.slug.toLowerCase().trim()
      const existing = await Project.findOne({ slug: newSlug, _id: { $ne: project._id } })
      if (existing) {
        return res.status(400).json({ message: 'Another project with this slug already exists' })
      }
      project.slug = newSlug
    }
    if (req.body.type !== undefined) project.type = req.body.type
    if (req.body.isActive !== undefined) project.isActive = req.body.isActive
    if (req.body.description !== undefined) project.description = req.body.description
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
