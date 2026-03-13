/**
 * Fix paths: replace pdn/ with dev/ in all stored paths.
 * Use when your dev database has paths pointing to pdn/ but you want them to point to dev/.
 * Run: node scripts/fix-paths-pdn-to-dev.js
 * Requires: .env with MONGODB_URI
 */
import '../config/env.js'
import mongoose from 'mongoose'
import Payload from '../models/Payload.js'
import Contract from '../models/Contract.js'
import Model from '../models/Model.js'
import ClubHouse from '../models/ClubHouse.js'
import Facade from '../models/Facade.js'
import Phase from '../models/Phase.js'
import UnderConstruction from '../models/UnderConstruction.js'
import OutdoorAmenities from '../models/OutdoorAmenities.js'

function replacePdnWithDev (val) {
  if (typeof val !== 'string') return val
  return val.replace(/^pdn\//i, 'dev/')
}

function fixStringArray (arr) {
  if (!Array.isArray(arr)) return 0
  let count = 0
  for (let i = 0; i < arr.length; i++) {
    if (typeof arr[i] === 'string' && arr[i].toLowerCase().startsWith('pdn/')) {
      arr[i] = replacePdnWithDev(arr[i])
      count++
    }
  }
  return count
}

function fixImageArray (arr) {
  if (!Array.isArray(arr)) return 0
  let count = 0
  for (const item of arr) {
    const url = typeof item === 'string' ? item : item?.url
    if (url && url.toLowerCase().startsWith('pdn/')) {
      if (typeof item === 'string') {
        const idx = arr.indexOf(item)
        arr[idx] = replacePdnWithDev(item)
      } else {
        item.url = replacePdnWithDev(url)
      }
      count++
    }
  }
  return count
}

async function fixPayloads () {
  const payloads = await Payload.find({})
  let updated = 0
  for (const p of payloads) {
    const n = fixStringArray(p.urls)
    if (n > 0) {
      await p.save()
      updated++
    }
  }
  return updated
}

async function fixContracts () {
  const contracts = await Contract.find({})
  let updated = 0
  for (const c of contracts) {
    let count = 0
    for (const item of c.contracts || []) {
      if (item.fileUrl?.toLowerCase().startsWith('pdn/')) {
        item.fileUrl = replacePdnWithDev(item.fileUrl)
        count++
      }
    }
    if (count > 0) {
      await c.save()
      updated++
    }
  }
  return updated
}

async function fixModels () {
  const models = await Model.find({})
  let updated = 0
  for (const m of models) {
    let count = 0
    if (m.images) {
      count += fixImageArray(m.images.exterior)
      count += fixImageArray(m.images.interior)
    }
    if (m.blueprints) {
      for (const key of ['default', 'withBalcony', 'withStorage', 'withBalconyAndStorage']) {
        count += fixImageArray(m.blueprints[key] || [])
      }
    }
    for (const b of m.balconies || []) {
      if (b.images) {
        count += fixImageArray(b.images.exterior)
        count += fixImageArray(b.images.interior)
      }
    }
    for (const u of m.upgrades || []) {
      if (u.images) {
        count += fixImageArray(u.images.exterior)
        count += fixImageArray(u.images.interior)
      }
    }
    for (const s of m.storages || []) {
      if (s.images) {
        count += fixImageArray(s.images.exterior)
        count += fixImageArray(s.images.interior)
      }
    }
    if (count > 0) {
      await m.save()
      updated++
    }
  }
  return updated
}

async function fixClubHouse () {
  const doc = await ClubHouse.findOne()
  if (!doc) return 0
  let count = fixImageArray(doc.exterior) + fixImageArray(doc.blueprints) + fixImageArray(doc.deck)
  if (doc.interior && typeof doc.interior === 'object') {
    for (const key of Object.keys(doc.interior)) {
      count += fixImageArray(doc.interior[key] || [])
    }
  }
  if (count > 0) {
    doc.markModified('interior')
    await doc.save()
    return 1
  }
  return 0
}

async function fixFacades () {
  const facades = await Facade.find({})
  let updated = 0
  for (const f of facades) {
    let count = fixStringArray(f.url || [])
    for (const deck of f.decks || []) {
      count += fixStringArray(deck.images || [])
    }
    if (count > 0) {
      await f.save()
      updated++
    }
  }
  return updated
}

async function fixPhases () {
  const phases = await Phase.find({})
  let updated = 0
  for (const p of phases) {
    let count = 0
    for (const item of p.mediaItems || []) {
      if (item.url?.toLowerCase().startsWith('pdn/')) {
        item.url = replacePdnWithDev(item.url)
        count++
      }
    }
    if (count > 0) {
      await p.save()
      updated++
    }
  }
  return updated
}

async function fixUnderConstruction () {
  const docs = await UnderConstruction.find({})
  let updated = 0
  for (const d of docs) {
    const count = fixImageArray(d.media || [])
    if (count > 0) {
      await d.save()
      updated++
    }
  }
  return updated
}

async function fixOutdoorAmenities () {
  const doc = await OutdoorAmenities.findOne()
  if (!doc?.amenities) return 0
  let count = 0
  for (const a of doc.amenities) {
    count += fixImageArray(a.images || [])
  }
  if (count > 0) {
    await doc.save()
    return 1
  }
  return 0
}

async function main () {
  const uri = process.env.MONGODB_URI
  if (!uri) {
    console.error('MONGODB_URI is required')
    process.exit(1)
  }
  await mongoose.connect(uri)
  console.log('Connected to MongoDB. Replacing pdn/ with dev/ in paths...')

  const results = {
    payloads: await fixPayloads(),
    contracts: await fixContracts(),
    models: await fixModels(),
    clubHouse: await fixClubHouse(),
    facades: await fixFacades(),
    phases: await fixPhases(),
    underConstruction: await fixUnderConstruction(),
    outdoorAmenities: await fixOutdoorAmenities()
  }

  console.log('Done:', results)
  await mongoose.disconnect()
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
