import mongoose from 'mongoose'
import Project from '../models/Project.js'
import ProjectVariable from '../models/ProjectVariable.js'

const VARIABLE_NAME_REGEX = /^[a-zA-Z][a-zA-Z0-9_]*$/

async function ensureProject(projectId) {
  if (!mongoose.Types.ObjectId.isValid(projectId)) return null
  return Project.findById(projectId).select('_id slug name').lean()
}

function normalizePayload(body = {}) {
  return {
    name: typeof body.name === 'string' ? body.name.trim() : '',
    recorrido: typeof body.recorrido === 'string' ? body.recorrido.trim() : '',
    categoria: typeof body.categoria === 'string' ? body.categoria.trim() : ''
  }
}

function validatePayload(payload) {
  const errors = []

  if (!payload.name) {
    errors.push('name is required')
  } else if (!VARIABLE_NAME_REGEX.test(payload.name)) {
    errors.push('name must start with a letter and contain only letters, numbers, and underscores')
  }

  if (!payload.recorrido) {
    errors.push('recorrido is required')
  }

  if (!payload.categoria) {
    errors.push('categoria is required')
  }

  return errors
}

export const getProjectVariables = async (req, res) => {
  try {
    const project = await ensureProject(req.params.id)
    if (!project) return res.status(404).json({ message: 'Project not found' })

    const { categoria } = req.query
    const filter = { project: project._id }
    if (categoria) filter.categoria = categoria

    const variables = await ProjectVariable.find(filter)
      .sort({ categoria: 1, name: 1 })
      .lean()

    return res.json(variables)
  } catch (error) {
    return res.status(500).json({ message: error.message })
  }
}

export const createProjectVariable = async (req, res) => {
  try {
    const project = await ensureProject(req.params.id)
    if (!project) return res.status(404).json({ message: 'Project not found' })

    const payload = normalizePayload(req.body)
    const errors = validatePayload(payload)
    if (errors.length > 0) {
      return res.status(400).json({ message: 'Invalid variable payload', errors })
    }

    const existing = await ProjectVariable.findOne({
      project: project._id,
      name: payload.name
    })
    if (existing) {
      return res.status(409).json({ message: 'A variable with this name already exists for this project' })
    }

    const created = await ProjectVariable.create({
      project: project._id,
      ...payload,
      createdBy: req.user?._id,
      updatedBy: req.user?._id
    })

    return res.status(201).json(created)
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: 'A variable with this name already exists for this project' })
    }
    return res.status(500).json({ message: error.message })
  }
}

export const updateProjectVariable = async (req, res) => {
  try {
    const project = await ensureProject(req.params.id)
    if (!project) return res.status(404).json({ message: 'Project not found' })

    const { variableId } = req.params
    if (!mongoose.Types.ObjectId.isValid(variableId)) {
      return res.status(400).json({ message: 'Valid variable id is required' })
    }

    const variable = await ProjectVariable.findOne({
      _id: variableId,
      project: project._id
    })
    if (!variable) return res.status(404).json({ message: 'Variable not found' })

    const payload = normalizePayload(req.body)
    const errors = validatePayload(payload)
    if (errors.length > 0) {
      return res.status(400).json({ message: 'Invalid variable payload', errors })
    }

    if (payload.name !== variable.name) {
      const duplicate = await ProjectVariable.findOne({
        project: project._id,
        name: payload.name,
        _id: { $ne: variable._id }
      })
      if (duplicate) {
        return res.status(409).json({ message: 'A variable with this name already exists for this project' })
      }
    }

    variable.name = payload.name
    variable.recorrido = payload.recorrido
    variable.categoria = payload.categoria
    variable.updatedBy = req.user?._id
    await variable.save()

    return res.json(variable)
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: 'A variable with this name already exists for this project' })
    }
    return res.status(500).json({ message: error.message })
  }
}

export const deleteProjectVariable = async (req, res) => {
  try {
    const project = await ensureProject(req.params.id)
    if (!project) return res.status(404).json({ message: 'Project not found' })

    const { variableId } = req.params
    if (!mongoose.Types.ObjectId.isValid(variableId)) {
      return res.status(400).json({ message: 'Valid variable id is required' })
    }

    const deleted = await ProjectVariable.findOneAndDelete({
      _id: variableId,
      project: project._id
    })
    if (!deleted) return res.status(404).json({ message: 'Variable not found' })

    return res.json({ message: 'Variable deleted successfully' })
  } catch (error) {
    return res.status(500).json({ message: error.message })
  }
}
