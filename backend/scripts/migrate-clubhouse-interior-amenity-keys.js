/**
 * Migration: rename ClubHouse interior amenity keys.
 *
 * Old -> New
 * - Conference room -> Meeting room
 * - Multi-purpose room / Multi-Purpose Room -> Mixed-use room
 * - Reception / property management -> Property management
 * - Counter / front desk -> Concierge
 * - Lakeside / boat dock -> Boat dock
 * - Bathroom / Bathrooms / bathrooms & lockers -> Bathrooms & lockers
 * - Machines / mechanical room -> Mechanical room
 * - Counter Hallway -> Use-mixed hallway
 *
 * Run:
 *   node scripts/migrate-clubhouse-interior-amenity-keys.js
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

function mergeArraysUniqueByUrl(target = [], source = []) {
  const out = Array.isArray(target) ? [...target] : []
  const seen = new Set(
    out
      .map((item) => (item && typeof item === 'object' ? item.url : item))
      .filter(Boolean)
  )

  for (const item of Array.isArray(source) ? source : []) {
    const key = item && typeof item === 'object' ? item.url : item
    if (!key || seen.has(key)) continue
    out.push(item)
    seen.add(key)
  }
  return out
}

async function run() {
  await mongoose.connect(process.env.MONGODB_URI)
  console.log('MongoDB connected.')

  const docs = await ClubHouse.find({})
  if (!docs.length) {
    console.log('No ClubHouse documents found. Nothing to migrate.')
    await mongoose.disconnect()
    return
  }

  let updatedDocs = 0
  for (const doc of docs) {
    if (!isObjectLike(doc.interior)) continue

    let changed = false
    for (const [oldKey, newKey] of KEY_RENAMES) {
      const oldArr = doc.interior[oldKey]
      if (!Array.isArray(oldArr) || oldArr.length === 0) continue

      const newArr = doc.interior[newKey]
      doc.interior[newKey] = mergeArraysUniqueByUrl(newArr, oldArr)
      delete doc.interior[oldKey]
      changed = true
      console.log(`[clubhouse-migration] ${doc._id}: "${oldKey}" -> "${newKey}" (${oldArr.length} items)`)
    }

    if (changed) {
      doc.markModified('interior')
      await doc.save()
      updatedDocs += 1
    }
  }

  console.log(`Migration finished. Updated documents: ${updatedDocs}`)
  await mongoose.disconnect()
}

run().catch((error) => {
  console.error(error)
  process.exit(1)
})
