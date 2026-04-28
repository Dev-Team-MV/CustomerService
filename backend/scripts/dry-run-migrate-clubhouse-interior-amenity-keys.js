/**
 * Dry-run: preview ClubHouse interior amenity key renames (no writes).
 *
 * Old -> New
 * - Conference room / Conference Room -> Meeting room
 * - Multi-purpose room / Multi-Purpose Room -> Mixed-use room
 * - Reception / property management -> Property management
 * - Counter / front desk -> Concierge
 * - Lakeside / boat dock -> Boat dock
 * - Bathroom / Bathrooms / bathrooms & lockers -> Bathrooms & lockers
 * - Machines / mechanical room -> Mechanical room
 * - Counter Hallway -> Use-mixed hallway
 *
 * Run:
 *   node scripts/dry-run-migrate-clubhouse-interior-amenity-keys.js
 *
 * Requires:
 *   MONGODB_URI in backend/.env
 */
import '../config/env.js'
import mongoose from 'mongoose'
import ClubHouse from '../models/ClubHouse.js'

const KEY_RENAMES = [
  ['Conference room', 'Meeting room'],
  ['Conference Room', 'Meeting room'],
  ['Multi-purpose room', 'Mixed-use room'],
  ['Multi-Purpose Room', 'Mixed-use room'],
  ['Reception', 'Property management'],
  ['property management', 'Property management'],
  ['Counter', 'Concierge'],
  ['front desk', 'Concierge'],
  ['Lakeside', 'Boat dock'],
  ['boat dock', 'Boat dock'],
  ['Bathroom', 'Bathrooms & lockers'],
  ['Bathrooms', 'Bathrooms & lockers'],
  ['bathrooms & lockers', 'Bathrooms & lockers'],
  ['Machines', 'Mechanical room'],
  ['mechanical room', 'Mechanical room'],
  ['Counter Hallway', 'Use-mixed hallway']
]

function isObjectLike(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

async function run() {
  await mongoose.connect(process.env.MONGODB_URI)
  console.log('MongoDB connected.')

  const docs = await ClubHouse.find({}).lean()
  if (!docs.length) {
    console.log('No ClubHouse documents found.')
    await mongoose.disconnect()
    return
  }

  let docsWithChanges = 0
  const totalsByRename = {}
  for (const [oldKey, newKey] of KEY_RENAMES) {
    totalsByRename[`${oldKey} -> ${newKey}`] = 0
  }

  for (const doc of docs) {
    if (!isObjectLike(doc.interior)) continue

    let hasChange = false
    for (const [oldKey, newKey] of KEY_RENAMES) {
      const oldArr = doc.interior[oldKey]
      if (!Array.isArray(oldArr) || oldArr.length === 0) continue
      hasChange = true
      totalsByRename[`${oldKey} -> ${newKey}`] += oldArr.length
      console.log(`[dry-run] ${doc._id}: "${oldKey}" -> "${newKey}" (${oldArr.length} items)`)
    }

    if (hasChange) docsWithChanges += 1
  }

  console.log('--- Dry-run summary ---')
  console.log(`Total ClubHouse docs: ${docs.length}`)
  console.log(`Docs that would be updated: ${docsWithChanges}`)
  for (const [rename, count] of Object.entries(totalsByRename)) {
    console.log(`${rename}: ${count} item(s)`)
  }

  await mongoose.disconnect()
}

run().catch((error) => {
  console.error(error)
  process.exit(1)
})
