import '../config/env.js'
import mongoose from 'mongoose'
import Project from '../models/Project.js'
import ProjectCatalogConfig from '../models/ProjectCatalogConfig.js'

const PROJECT_SLUG = '6-townhouses'

const configPayload = {
  catalogType: 'houses',
  structure: {
    inventory: {
      totalHouses: 6,
      houseIds: ['1', '2', '3', '4', '5', '6']
    },
    levels: {
      level1: {
        options: [
          { id: 'parking', label: 'Parqueadero' },
          { id: 'airbnb', label: 'Airbnb' }
        ]
      },
      level2: {
        options: [
          { id: 'living-dining', label: 'Sala + comedor' },
          { id: 'living-multifunctional', label: 'Sala + multifuncional' }
        ]
      },
      terrace: {
        options: [
          { id: 'terrace-multifunctional', label: 'Terraza multifuncional' }
        ]
      }
    },
    dependencies: [
      {
        source: 'level2.living-multifunctional',
        enables: ['multifunctional']
      },
      {
        source: 'terrace.terrace-multifunctional',
        enables: ['multifunctional']
      }
    ]
  },
  assetsSchema: {
    defaultsByHouse: ['plans', 'isometric', 'renders'],
    requiredByOption: {
      multifunctional: ['plans', 'renders']
    }
  },
  pricingRules: [
    {
      id: 'upgrade-level-1',
      name: 'Upgrade primer piso',
      priority: 10,
      enabled: true,
      when: [
        { field: 'selectedOptions.level1Upgrade', operator: 'truthy' }
      ],
      apply: {
        type: 'fixed',
        amount: 0,
        code: 'upgrade-level-1',
        label: 'Upgrade primer piso'
      }
    },
    {
      id: 'upgrade-level-2',
      name: 'Upgrade segundo piso',
      priority: 20,
      enabled: true,
      when: [
        { field: 'selectedOptions.level2Upgrade', operator: 'truthy' }
      ],
      apply: {
        type: 'fixed',
        amount: 0,
        code: 'upgrade-level-2',
        label: 'Upgrade segundo piso'
      }
    }
  ]
}

async function run() {
  try {
    if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI is required')

    await mongoose.connect(process.env.MONGODB_URI)
    console.log('MongoDB connected.')

    const project = await Project.findOne({ slug: PROJECT_SLUG })
    if (!project) {
      throw new Error(`Project ${PROJECT_SLUG} not found. Run seedProject6Townhouses first.`)
    }

    const existing = await ProjectCatalogConfig.findOne({ project: project._id, version: 1 })
    if (existing) {
      existing.catalogType = configPayload.catalogType
      existing.structure = configPayload.structure
      existing.assetsSchema = configPayload.assetsSchema
      existing.pricingRules = configPayload.pricingRules
      existing.status = 'published'
      existing.isActiveVersion = true
      await existing.save()
      await ProjectCatalogConfig.updateMany(
        { project: project._id, _id: { $ne: existing._id } },
        { $set: { isActiveVersion: false } }
      )
      console.log('Catalog config v1 updated and published.')
    } else {
      await ProjectCatalogConfig.updateMany(
        { project: project._id },
        { $set: { isActiveVersion: false } }
      )
      await ProjectCatalogConfig.create({
        project: project._id,
        version: 1,
        status: 'published',
        isActiveVersion: true,
        ...configPayload
      })
      console.log('Catalog config v1 created and published.')
    }
  } catch (error) {
    console.error('Seed failed:', error.message)
    process.exitCode = 1
  } finally {
    await mongoose.disconnect()
    console.log('MongoDB disconnected.')
  }
}

run()
