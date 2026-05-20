import SMSTemplate from '../models/SMSTemplate.js'

const extractPlaceholders = (template = '') => {
  const matcher = /\{\{\s*([a-zA-Z0-9_.-]+)\s*\}\}/g
  const placeholders = new Set()

  let match = matcher.exec(template)
  while (match !== null) {
    placeholders.add(match[1])
    match = matcher.exec(template)
  }

  return [...placeholders]
}

export const getAllSMSTemplates = async (req, res) => {
  try {
    const { category, isActive, search } = req.query
    const filter = {}

    if (category) filter.category = category
    if (isActive !== undefined) filter.isActive = isActive === 'true'
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { template: { $regex: search, $options: 'i' } }
      ]
    }

    const templates = await SMSTemplate.find(filter)
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
    const { name, description, category, template, isActive } = req.body

    if (!name || !template) {
      return res.status(400).json({ message: 'name and template are required' })
    }

    const placeholders = extractPlaceholders(template)

    const created = await SMSTemplate.create({
      name: name.trim(),
      description: description?.trim() || '',
      category: category?.trim() || 'general',
      template: template.trim(),
      placeholders,
      isActive: isActive ?? true,
      createdBy: req.user?._id,
      updatedBy: req.user?._id
    })

    res.status(201).json(created)
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

    const { name, description, category, template, isActive } = req.body

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
    res.json(updated)
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
