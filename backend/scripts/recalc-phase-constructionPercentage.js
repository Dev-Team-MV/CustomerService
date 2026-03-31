/**
 * Recalcula `Phase.constructionPercentage` como la suma de `mediaItems[].percentage`.
 *
 * Caso de uso:
 * - Hay media cargada, pero `constructionPercentage` quedó en 0 (ej: flujos por apartmentId/phaseNumber).
 *
 * Run:
 *   node scripts/recalc-phase-constructionPercentage.js
 * Optional (no escribe):
 *   DRY_RUN=1 node scripts/recalc-phase-constructionPercentage.js
 */
import '../config/env.js'
import mongoose from 'mongoose'
import Phase from '../models/Phase.js'

async function main() {
  const uri = process.env.MONGODB_URI
  if (!uri) {
    console.error('MONGODB_URI is required')
    process.exit(1)
  }

  const dryRun = process.env.DRY_RUN === '1' || process.env.DRY_RUN === 'true'

  await mongoose.connect(uri)
  console.log(`Connected to MongoDB. Recalculating phase progress${dryRun ? ' (DRY RUN)' : ''}...`)

  const phases = await Phase.find({
    mediaItems: { $exists: true, $ne: [] }
  }).select('_id constructionPercentage mediaItems phaseNumber property apartment')

  let scanned = 0
  let updated = 0

  for (const phase of phases) {
    scanned++
    const sum = (phase.mediaItems || []).reduce((acc, item) => {
      const val = Number(item?.percentage)
      return acc + (Number.isFinite(val) ? val : 0)
    }, 0)

    const next = Math.max(0, Math.min(100, sum))
    const current = Number(phase.constructionPercentage)
    const differs = !Number.isFinite(current) || current !== next

    if (!differs) continue

    if (!dryRun) {
      phase.constructionPercentage = next
      await phase.save()
    }
    updated++
  }

  console.log({ scannedPhases: scanned, updatedPhases: updated, dryRun })
  await mongoose.disconnect()
}

main().catch((error) => {
  console.error('Recalc failed:', error)
  process.exit(1)
})

