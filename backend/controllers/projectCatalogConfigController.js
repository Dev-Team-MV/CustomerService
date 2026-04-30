import mongoose from 'mongoose'
import Project from '../models/Project.js'
import ProjectCatalogConfig from '../models/ProjectCatalogConfig.js'
import { validateProjectCatalogConfigPayload } from '../services/projectCatalogConfigValidation.js'

function normalizeVersion(value) {
  const parsed = Number(value)
  if (!Number.isInteger(parsed) || parsed < 1) return null
  return parsed
}

async function ensureProject(projectId) {
  if (!mongoose.Types.ObjectId.isValid(projectId)) return null
  return Project.findById(projectId).select('_id slug name').lean()
}

export const getProjectCatalogConfig = async (req, res) => {
  try {
    const project = await ensureProject(req.params.id)
    if (!project) return res.status(404).json({ message: 'Project not found' })

    const { version, status, activeOnly } = req.query
    const filter = { project: project._id }
    if (status) filter.status = status
    if (activeOnly === 'true' || activeOnly === '1') {
      filter.isActiveVersion = true
    }
    if (version !== undefined) {
      const parsedVersion = normalizeVersion(version)
      if (!parsedVersion) return res.status(400).json({ message: 'Invalid version' })
      filter.version = parsedVersion
    }

    const config = await ProjectCatalogConfig.findOne(filter).sort({ version: -1 }).lean()
    if (!config) {
      return res.status(404).json({ message: 'Catalog config not found for this project' })
    }

    return res.json(config)
  } catch (error) {
    return res.status(500).json({ message: error.message })
  }
}

export const upsertProjectCatalogConfig = async (req, res) => {
  try {
    const project = await ensureProject(req.params.id)
    if (!project) return res.status(404).json({ message: 'Project not found' })

    const payload = {
      catalogType: req.body.catalogType,
      structure: req.body.structure,
      assetsSchema: req.body.assetsSchema,
      pricingRules: req.body.pricingRules,
      pricingMode: req.body.pricingMode
    }
    const validation = validateProjectCatalogConfigPayload(payload)
    if (!validation.valid) {
      return res.status(400).json({ message: 'Invalid catalog config', errors: validation.errors })
    }

    const requestedVersion = normalizeVersion(req.body.version)
    let version = requestedVersion
    if (!version) {
      const latest = await ProjectCatalogConfig.findOne({ project: project._id })
        .sort({ version: -1 })
        .select('version')
        .lean()
      version = latest ? latest.version + 1 : 1
    }

    const status = ['draft', 'published', 'archived'].includes(req.body.status) ? req.body.status : 'draft'
    const isActiveVersion = status === 'published'
      ? req.body.isActiveVersion === true
      : false

    const config = await ProjectCatalogConfig.findOneAndUpdate(
      { project: project._id, version },
      {
        $set: {
          project: project._id,
          version,
          status,
          isActiveVersion,
          catalogType: payload.catalogType,
          structure: payload.structure,
          assetsSchema: payload.assetsSchema,
          pricingRules: payload.pricingRules || [],
          pricingMode: payload.pricingMode || 'legacy_components'
        }
      },
      { upsert: true, new: true, runValidators: true }
    )

    if (isActiveVersion) {
      await ProjectCatalogConfig.updateMany(
        { project: project._id, _id: { $ne: config._id } },
        { $set: { isActiveVersion: false } }
      )
    }

    return res.status(201).json(config)
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({ message: 'Config version already exists for this project' })
    }
    return res.status(500).json({ message: error.message })
  }
}

export const publishProjectCatalogConfig = async (req, res) => {
  try {
    const project = await ensureProject(req.params.id)
    if (!project) return res.status(404).json({ message: 'Project not found' })

    const requestedVersion = normalizeVersion(req.body?.version)
    const filter = { project: project._id }
    if (requestedVersion) filter.version = requestedVersion

    const target = await ProjectCatalogConfig.findOne(filter).sort({ version: -1 })
    if (!target) {
      return res.status(404).json({ message: 'Catalog config not found for publish' })
    }

    await ProjectCatalogConfig.updateMany(
      { project: project._id },
      { $set: { isActiveVersion: false } }
    )

    target.status = 'published'
    target.isActiveVersion = true
    await target.save()

    return res.json({
      message: 'Catalog config published',
      projectId: project._id,
      version: target.version
    })
  } catch (error) {
    return res.status(500).json({ message: error.message })
  }
}
