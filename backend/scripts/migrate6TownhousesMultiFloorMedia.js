/**
 * Migration for 6-townhouses catalog/model floor structure:
 * - Ensure floor/media (and option/media) includes `multi` array on floor 2, floor 3 and terrace
 * - Keep only one option on floor 3 and terrace
 *
 * Run:
 *   node scripts/migrate6TownhousesMultiFloorMedia.js
 *
 * Requires: MONGODB_URI in .env
 */
import '../config/env.js'
import mongoose from 'mongoose'
import Project from '../models/Project.js'
import Model from '../models/Model.js'
import ProjectCatalogConfig from '../models/ProjectCatalogConfig.js'

const PROJECT_SLUG_CANDIDATES = [
  process.env.PROJECT_SLUG,
  '6town-houses',
  '6-townhouses'
].filter(Boolean)

function normalizeText(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[_\s]+/g, '-')
}

function floorTypeFor(floor = {}) {
  const key = normalizeText(floor.key)
  const label = normalizeText(floor.label)
  const level = Number(floor.level)

  const isLevel2 = level === 2 ||
    key.includes('level2') || key.includes('level-2') || key.includes('piso-2') ||
    label.includes('piso-2') || label.includes('segundo')

  const isLevel3 = level === 3 ||
    key.includes('level3') || key.includes('level-3') || key.includes('piso-3') ||
    label.includes('piso-3') || label.includes('tercer')

  const isTerrace = key.includes('terrace') || key.includes('terraza') ||
    label.includes('terrace') || label.includes('terraza')

  if (isTerrace) return 'terrace'
  if (isLevel3) return 'level3'
  if (isLevel2) return 'level2'
  return null
}

function ensureMediaMulti(media) {
  const source = media && typeof media === 'object' ? media : {}
  if (Array.isArray(source.multi)) return { media: source, changed: false }
  return { media: { ...source, multi: [] }, changed: true }
}

function migrateModelFloors(modelDoc) {
  if (!Array.isArray(modelDoc.floors)) return false
  let changed = false

  modelDoc.floors = modelDoc.floors.map((floorRaw) => {
    const floor = floorRaw?.toObject ? floorRaw.toObject() : { ...floorRaw }
    const type = floorTypeFor(floor)
    if (!type) return floor

    const mediaResult = ensureMediaMulti(floor.media)
    if (mediaResult.changed) changed = true
    floor.media = mediaResult.media

    if (Array.isArray(floor.options)) {
      floor.options = floor.options.map((optionRaw) => {
        const option = optionRaw?.toObject ? optionRaw.toObject() : { ...optionRaw }
        const optionMediaResult = ensureMediaMulti(option.media)
        if (optionMediaResult.changed) changed = true
        option.media = optionMediaResult.media
        return option
      })

      if ((type === 'level3' || type === 'terrace') && floor.options.length > 1) {
        floor.options = floor.options.slice(0, 1)
        changed = true
      }
    }

    return floor
  })

  return changed
}

function migrateCatalogStructure(configDoc) {
  const structure = configDoc?.structure
  if (!structure || typeof structure !== 'object') return false
  const levels = structure.levels
  if (!levels || typeof levels !== 'object') return false

  let changed = false
  const nextLevels = { ...levels }
  const levelMappings = [
    { key: 'level2', type: 'level2' },
    { key: 'level3', type: 'level3' },
    { key: 'terrace', type: 'terrace' }
  ]

  for (const { key, type } of levelMappings) {
    const levelNode = nextLevels[key]
    if (!levelNode || typeof levelNode !== 'object') continue

    const nextLevelNode = { ...levelNode }
    if (!Array.isArray(nextLevelNode.multi)) {
      nextLevelNode.multi = []
      changed = true
    }

    if (Array.isArray(nextLevelNode.options) && (type === 'level3' || type === 'terrace') && nextLevelNode.options.length > 1) {
      nextLevelNode.options = nextLevelNode.options.slice(0, 1)
      changed = true
    }

    nextLevels[key] = nextLevelNode
  }

  if (!changed) return false

  configDoc.structure = {
    ...structure,
    levels: nextLevels
  }
  return true
}

async function run() {
  try {
    if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI is required')
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('MongoDB connected.')

    const project = await Project.findOne({ slug: { $in: PROJECT_SLUG_CANDIDATES } })
      .select('_id slug name')
      .lean()
    if (!project) throw new Error(`Project not found by slug candidates: ${PROJECT_SLUG_CANDIDATES.join(', ')}`)

    const models = await Model.find({ project: project._id })
    let updatedModels = 0

    for (const model of models) {
      const changed = migrateModelFloors(model)
      if (!changed) continue
      // eslint-disable-next-line no-await-in-loop
      await model.save()
      updatedModels += 1
    }

    const configs = await ProjectCatalogConfig.find({ project: project._id })
    let updatedConfigs = 0

    for (const config of configs) {
      const changed = migrateCatalogStructure(config)
      if (!changed) continue
      // eslint-disable-next-line no-await-in-loop
      await config.save()
      updatedConfigs += 1
    }

    console.log(`Updated models: ${updatedModels}`)
    console.log(`Updated catalog configs: ${updatedConfigs}`)
    console.log('Migration completed successfully.')
  } catch (error) {
    console.error('Migration failed:', error.message)
    process.exitCode = 1
  } finally {
    await mongoose.disconnect()
    console.log('MongoDB disconnected.')
  }
}

run()
