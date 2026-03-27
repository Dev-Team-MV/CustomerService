/**
 * Migration: assign each FamilyGroup to a Project (required for per-project groups).
 *
 * 1. Infers project from PropertyShare → Property.project or Apartment → Building.project.
 * 2. If no share exists, uses the first Project in the database (sorted by _id).
 * 3. Resolves duplicate (project, name) by appending " (2)", " (3)", ...
 *
 * Run once before or right after deploying the schema with required `project`:
 *   node scripts/migrate-family-groups-project.js
 *
 * Requires: MONGODB_URI in .env
 */
import '../config/env.js'
import mongoose from 'mongoose'
import FamilyGroup from '../models/FamilyGroup.js'
import PropertyShare from '../models/PropertyShare.js'
import Property from '../models/Property.js'
import Apartment from '../models/Apartment.js'
import Building from '../models/Building.js'
import Project from '../models/Project.js'

async function inferProjectIdForGroup(groupId) {
  const shares = await PropertyShare.find({ familyGroup: groupId }).lean()
  const candidates = new Set()

  for (const s of shares) {
    if (s.property) {
      const p = await Property.findById(s.property).select('project').lean()
      if (p?.project) candidates.add(p.project.toString())
    }
    if (s.apartment) {
      const a = await Apartment.findById(s.apartment).select('building').lean()
      if (a?.building) {
        const b = await Building.findById(a.building).select('project').lean()
        if (b?.project) candidates.add(b.project.toString())
      }
    }
  }

  if (candidates.size === 1) {
    return [...candidates][0]
  }
  if (candidates.size > 1) {
    const sorted = [...candidates].sort()
    console.warn(
      `[migrate-family-groups] Group ${groupId} linked to multiple projects via shares; using ${sorted[0]}`
    )
    return sorted[0]
  }
  return null
}

async function resolveDuplicateNames() {
  const groups = await FamilyGroup.find({}).lean()
  const byKey = new Map()
  for (const g of groups) {
    if (!g.project) continue
    const key = `${g.project.toString()}::${(g.name || '').trim()}`
    if (!byKey.has(key)) byKey.set(key, [])
    byKey.get(key).push(g)
  }
  for (const [, arr] of byKey) {
    if (arr.length < 2) continue
    arr.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
    for (let i = 1; i < arr.length; i++) {
      const base = arr[i].name.trim()
      let suffix = 2
      let newName = `${base} (${suffix})`
      // eslint-disable-next-line no-await-in-loop
      while (await FamilyGroup.findOne({ project: arr[i].project, name: newName })) {
        suffix += 1
        newName = `${base} (${suffix})`
      }
      // eslint-disable-next-line no-await-in-loop
      await FamilyGroup.updateOne({ _id: arr[i]._id }, { $set: { name: newName } })
      console.log(`[migrate-family-groups] Renamed duplicate group ${arr[i]._id} -> "${newName}"`)
    }
  }
}

async function run() {
  await mongoose.connect(process.env.MONGODB_URI)
  console.log('MongoDB connected.')

  const fallbackProject = await Project.findOne().sort({ _id: 1 }).select('_id').lean()
  if (!fallbackProject) {
    console.error('No Project documents found. Create a project first.')
    process.exit(1)
  }

  const needsProject = await FamilyGroup.find({
    $or: [{ project: { $exists: false } }, { project: null }]
  }).select('_id name')

  console.log(`Family groups missing project: ${needsProject.length}`)

  for (const g of needsProject) {
    // eslint-disable-next-line no-await-in-loop
    let pid = await inferProjectIdForGroup(g._id)
    if (!pid) {
      pid = fallbackProject._id.toString()
      console.warn(
        `[migrate-family-groups] Group ${g._id} ("${g.name}") has no shares; assigning default project ${pid}`
      )
    }
    // eslint-disable-next-line no-await-in-loop
    await FamilyGroup.collection.updateOne(
      { _id: g._id },
      { $set: { project: new mongoose.Types.ObjectId(pid) } }
    )
  }

  await resolveDuplicateNames()

  console.log('Migration finished.')
  await mongoose.disconnect()
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
