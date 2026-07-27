import mongoose from 'mongoose'
import SMSTemplate from '../models/SMSTemplate.js'
import Project from '../models/Project.js'
import { extractPlaceholders } from '../services/templateRenderService.js'
import { findUnknownTemplatePlaceholders } from '../services/projectVariableResolverService.js'

async function validateProjectId(projectId) {
  if (projectId === undefined || projectId === null || projectId === '') return { value: null }
  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    return { error: 'Invalid projectId' }
  }
  const exists = await Project.exists({ _id: projectId })
  if (!exists) return { error: 'Project not found' }
  return { value: projectId }
}

function buildTemplateFilter(query = {}) {
  const filter = {}
  const { category, isActive, search, projectId, projectOnly } = query

  if (category) filter.category = category
  if (isActive !== undefined) filter.isActive = isActive === 'true'

  if (projectId) {
    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return { error: 'Invalid projectId filter' }
    }
    filter.projectId = projectOnly === 'true'
      ? new mongoose.Types.ObjectId(projectId)
      : { $in: [new mongoose.Types.ObjectId(projectId), null] }
  }

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { template: { $regex: search, $options: 'i' } }
    ]
  }

  return { filter }
}

async function buildTemplateWarnings(projectId, placeholders) {
  const unknownPlaceholders = await findUnknownTemplatePlaceholders(projectId, placeholders)
  if (!unknownPlaceholders.length) return undefined
  return {
    unknownPlaceholders,
    message: 'Some placeholders are not defined as ProjectVariable for this project'
  }
}

export const getAllSMSTemplates = async (req, res) => {
  try {
    const { filter, error } = buildTemplateFilter(req.query)
    if (error) return res.status(400).json({ message: error })

    const templates = await SMSTemplate.find(filter)
      .populate('projectId', 'name slug title')
      .populate('createdBy', 'firstName lastName email')
      .populate('updatedBy', 'firstName lastName email')
      .sort({ createdAt: -1 })

    res.json(templates)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const getSMSTemplateById = async (req, res) => {
  try {
    const template = await SMSTemplate.findById(req.params.id)
      .populate('projectId', 'name slug title')
      .populate('createdBy', 'firstName lastName email')
      .populate('updatedBy', 'firstName lastName email')

    if (!template) {
      return res.status(404).json({ message: 'SMS template not found' })
    }

    res.json(template)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const createSMSTemplate = async (req, res) => {
  try {
    const { name, description, category, template, isActive, projectId } = req.body

    if (!name || !template) {
      return res.status(400).json({ message: 'name and template are required' })
    }

    const projectValidation = await validateProjectId(projectId)
    if (projectValidation.error) {
      return res.status(400).json({ message: projectValidation.error })
    }

    const placeholders = extractPlaceholders(template)
    const warnings = await buildTemplateWarnings(projectValidation.value, placeholders)

    const created = await SMSTemplate.create({
      name: name.trim(),
      description: description?.trim() || '',
      category: category?.trim() || 'general',
      template: template.trim(),
      placeholders,
      isActive: isActive ?? true,
      projectId: projectValidation.value,
      createdBy: req.user?._id,
      updatedBy: req.user?._id
    })

    await created.populate('projectId', 'name slug title')

    res.status(201).json(warnings ? { ...created.toObject(), warnings } : created)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const updateSMSTemplate = async (req, res) => {
  try {
    const existing = await SMSTemplate.findById(req.params.id)
    if (!existing) {
      return res.status(404).json({ message: 'SMS template not found' })
    }

    const { name, description, category, template, isActive, projectId } = req.body

    if (projectId !== undefined) {
      const projectValidation = await validateProjectId(projectId)
      if (projectValidation.error) {
        return res.status(400).json({ message: projectValidation.error })
      }
      existing.projectId = projectValidation.value
    }

    if (name !== undefined) existing.name = name.trim()
    if (description !== undefined) existing.description = description?.trim() || ''
    if (category !== undefined) existing.category = category?.trim() || 'general'
    if (template !== undefined) {
      existing.template = template.trim()
      existing.placeholders = extractPlaceholders(existing.template)
    }
    if (isActive !== undefined) existing.isActive = isActive
    existing.updatedBy = req.user?._id

    const updated = await existing.save()
    await updated.populate('projectId', 'name slug title')

    const warnings = await buildTemplateWarnings(
      updated.projectId?._id || updated.projectId,
      updated.placeholders
    )

    res.json(warnings ? { ...updated.toObject(), warnings } : updated)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const deleteSMSTemplate = async (req, res) => {
  try {
    const existing = await SMSTemplate.findById(req.params.id)
    if (!existing) {
      return res.status(404).json({ message: 'SMS template not found' })
    }

    await existing.deleteOne()
    res.json({ message: 'SMS template deleted successfully' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}
