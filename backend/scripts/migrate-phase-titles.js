/**
 * Normaliza títulos de fases existentes según el catálogo oficial del backend.
 *
 * Uso:
 *   node scripts/migrate-phase-titles.js
 * Dry run (sin escribir):
 *   DRY_RUN=1 node scripts/migrate-phase-titles.js
 */
import '../config/env.js'
import mongoose from 'mongoose'
import Phase from '../models/Phase.js'

const PHASE_TITLES_BY_NUMBER = {
  1: 'Site Preparation and Groundbreaking',
  2: 'Foundation, Framing & Windows',
  3: 'Exterior Cladding and Roofing Installation',
  4: "All MEP's starts rough in work",
  5: 'Drywall Work and Paint',
  6: 'Flooring and Millwork',
  7: 'Kitchen and Bathrooms',
  8: 'Interior Finishes, Driveway Applainces & Landscaping',
  9: 'Inspections (Delays)'
}

async function main() {
  const uri = process.env.MONGODB_URI
  if (!uri) {
    console.error('MONGODB_URI is required')
    process.exit(1)
  }

  const dryRun = process.env.DRY_RUN === '1' || process.env.DRY_RUN === 'true'

  await mongoose.connect(uri)
  console.log(`Connected to MongoDB. Updating phase titles${dryRun ? ' (DRY RUN)' : ''}...`)

  const phases = await Phase.find({
    phaseNumber: { $in: Object.keys(PHASE_TITLES_BY_NUMBER).map(Number) }
  }).select('_id phaseNumber title')

  let scanned = 0
  let updated = 0

  for (const phase of phases) {
    scanned++
    const expectedTitle = PHASE_TITLES_BY_NUMBER[phase.phaseNumber]
    if (!expectedTitle || phase.title === expectedTitle) {
      continue
    }

    if (!dryRun) {
      phase.title = expectedTitle
      await phase.save()
    }
    updated++
  }

  console.log({ scannedPhases: scanned, updatedPhases: updated, dryRun })
  await mongoose.disconnect()
}

main().catch((error) => {
  console.error('Phase title migration failed:', error)
  process.exit(1)
})

