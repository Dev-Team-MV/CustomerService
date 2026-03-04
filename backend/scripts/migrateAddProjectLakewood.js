/**
 * Migration: add multi-tenant project to existing data.
 * Creates a default project "Lakewood" (slug: lakewood) and assigns all existing
 * Lot, Model, Facade, and Property documents to it.
 *
 * Run once after deploying the multi-tenant architecture:
 *   node scripts/migrateAddProjectLakewood.js
 *
 * Requires: MONGODB_URI in .env
 */
import '../config/env.js'
import mongoose from 'mongoose'
import Project from '../models/Project.js'
import Lot from '../models/Lot.js'
import Model from '../models/Model.js'
import Facade from '../models/Facade.js'
import Property from '../models/Property.js'

const LAKEWOOD_SLUG = 'lakewood'
const LAKEWOOD_NAME = 'Lakewood'

async function run () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('MongoDB connected.')

    let project = await Project.findOne({ slug: LAKEWOOD_SLUG })
    if (!project) {
      project = await Project.create({
        name: LAKEWOOD_NAME,
        slug: LAKEWOOD_SLUG,
        type: 'residential_lots',
        isActive: true,
        description: 'Default project (migrated from pre-multi-tenant data).'
      })
      console.log('Created project:', project.name, `(${project.slug})`)
    } else {
      console.log('Using existing project:', project.name, `(${project.slug})`)
    }

    const projectId = project._id

    const r1 = await Lot.updateMany(
      { project: { $exists: false } },
      { $set: { project: projectId } }
    )
    console.log('Lots updated:', r1.modifiedCount)

    const r2 = await Model.updateMany(
      { project: { $exists: false } },
      { $set: { project: projectId } }
    )
    console.log('Models updated:', r2.modifiedCount)

    const r3 = await Facade.updateMany(
      { project: { $exists: false } },
      { $set: { project: projectId } }
    )
    console.log('Facades updated:', r3.modifiedCount)

    const r4 = await Property.updateMany(
      { project: { $exists: false } },
      { $set: { project: projectId } }
    )
    console.log('Properties updated:', r4.modifiedCount)

    console.log('Migration completed successfully.')
  } catch (err) {
    console.error('Migration failed:', err)
    process.exit(1)
  } finally {
    await mongoose.disconnect()
    console.log('MongoDB disconnected.')
    process.exit(0)
  }
}

run()
