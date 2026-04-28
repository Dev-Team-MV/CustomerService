/**
 * Dry-run: preview ClubHouse interior amenity key renames (no writes).
 *
 * Old -> New
 * - Conference room / Meeting room -> Meeting Room
 * - Multi-purpose room / Multi-Purpose Room / Mixed-use room -> Mixed-use Room
 * - Managers Office / Manager office -> Manager Office
 * - Reception / property management / Property management -> Property Management
 * - Counter / front desk -> Concierge
 * - Lakeside / boat dock / Boat dock -> Boat Dock
 * - Bathroom / Bathrooms / bathrooms & lockers / Bathrooms & lockers -> Bathrooms & Lockers
 * - Machines / mechanical room / Mechanical room -> Mechanical Room
 * - Counter Hallway / Use-mixed hallway -> Use-mixed Hallway
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
  ['Conference room', 'Meeting Room'],
  ['Conference Room', 'Meeting Room'],
  ['Meeting room', 'Meeting Room'],
  ['Multi-purpose room', 'Mixed-use Room'],
  ['Multi-Purpose Room', 'Mixed-use Room'],
  ['Mixed-use room', 'Mixed-use Room'],
  ['Managers Office', 'Manager Office'],
  ['Manager office', 'Manager Office'],
  ['Reception', 'Property Management'],
  ['property management', 'Property Management'],
  ['Property management', 'Property Management'],
  ['Counter', 'Concierge'],
  ['front desk', 'Concierge'],
  ['Lakeside', 'Boat Dock'],
  ['boat dock', 'Boat Dock'],
  ['Boat dock', 'Boat Dock'],
  ['Bathroom', 'Bathrooms & Lockers'],
  ['Bathrooms', 'Bathrooms & Lockers'],
  ['bathrooms & lockers', 'Bathrooms & Lockers'],
  ['Bathrooms & lockers', 'Bathrooms & Lockers'],
  ['Machines', 'Mechanical Room'],
  ['mechanical room', 'Mechanical Room'],
  ['Mechanical room', 'Mechanical Room'],
  ['Counter Hallway', 'Use-mixed Hallway'],
  ['Use-mixed hallway', 'Use-mixed Hallway']
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
