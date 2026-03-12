/**
 * Migration: Convert stored URLs to GCS paths.
 * Run once to update existing documents that have full URLs to store paths instead.
 * Run: node scripts/migrate-urls-to-paths.js
 * Requires: .env with MONGODB_URI and GCS credentials
 */
import '../config/env.js'
import mongoose from 'mongoose'
import { extractPathFromUrl } from '../services/urlResolverService.js'
import Payload from '../models/Payload.js'
import Contract from '../models/Contract.js'
import Model from '../models/Model.js'
import ClubHouse from '../models/ClubHouse.js'
import Facade from '../models/Facade.js'
import Phase from '../models/Phase.js'
import UnderConstruction from '../models/UnderConstruction.js'
import OutdoorAmenities from '../models/OutdoorAmenities.js'

function extractPath (val) {
  if (!val || typeof val !== 'string') return null
  const path = extractPathFromUrl(val)
  return path || val
}

async function migratePayloads () {
  const payloads = await Payload.find({})
  let updated = 0
  for (const p of payloads) {
    if (!p.urls || !p.urls.length) continue
    const paths = p.urls.map(extractPath).filter(Boolean)
    if (paths.some((path, i) => path !== p.urls[i])) {
      p.urls = paths
      await p.save()
      updated++
    }
  }
  return updated
}

async function migrateContracts () {
  const contracts = await Contract.find({})
  let updated = 0
  for (const c of contracts) {
    if (!c.contracts || !c.contracts.length) continue
    let changed = false
    for (const item of c.contracts) {
      if (item.fileUrl) {
        const path = extractPath(item.fileUrl)
        if (path && path !== item.fileUrl) {
          item.fileUrl = path
          changed = true
        }
      }
    }
    if (changed) {
      await c.save()
      updated++
    }
  }
  return updated
}

function migrateImageArray (arr) {
  if (!Array.isArray(arr)) return false
  let changed = false
  for (let i = 0; i < arr.length; i++) {
    const item = arr[i]
    const url = typeof item === 'string' ? item : item?.url
    if (url) {
      const path = extractPath(url)
      if (path && path !== url) {
        if (typeof item === 'string') arr[i] = path
        else item.url = path
        changed = true
      }
    }
  }
  return changed
}

async function migrateModels () {
  const models = await Model.find({})
  let updated = 0
  for (const m of models) {
    let changed = false
    if (m.images) {
      if (migrateImageArray(m.images.exterior)) changed = true
      if (migrateImageArray(m.images.interior)) changed = true
    }
    if (m.blueprints) {
      for (const key of ['default', 'withBalcony', 'withStorage', 'withBalconyAndStorage']) {
        if (migrateImageArray(m.blueprints[key])) changed = true
      }
    }
    if (Array.isArray(m.balconies)) {
      for (const b of m.balconies) {
        if (b.images) {
          if (migrateImageArray(b.images.exterior)) changed = true
          if (migrateImageArray(b.images.interior)) changed = true
        }
      }
    }
    if (Array.isArray(m.upgrades)) {
      for (const u of m.upgrades) {
        if (u.images) {
          if (migrateImageArray(u.images.exterior)) changed = true
          if (migrateImageArray(u.images.interior)) changed = true
        }
      }
    }
    if (Array.isArray(m.storages)) {
      for (const s of m.storages) {
        if (s.images) {
          if (migrateImageArray(s.images.exterior)) changed = true
          if (migrateImageArray(s.images.interior)) changed = true
        }
      }
    }
    if (changed) {
      await m.save()
      updated++
    }
  }
  return updated
}

async function migrateClubHouse () {
  const doc = await ClubHouse.findOne()
  if (!doc) return 0
  let changed = false
  if (migrateImageArray(doc.exterior)) changed = true
  if (migrateImageArray(doc.blueprints)) changed = true
  if (migrateImageArray(doc.deck)) changed = true
  if (doc.interior && typeof doc.interior === 'object') {
    for (const key of Object.keys(doc.interior)) {
      if (migrateImageArray(doc.interior[key])) {
        changed = true
        doc.markModified('interior')
      }
    }
  }
  if (changed) await doc.save()
  return changed ? 1 : 0
}

async function migrateFacades () {
  const facades = await Facade.find({})
  let updated = 0
  for (const f of facades) {
    let changed = false
    if (f.url && f.url.length) {
      const paths = f.url.map(extractPath).filter(Boolean)
      if (paths.some((path, i) => path !== f.url[i])) {
        f.url = paths
        changed = true
      }
    }
    if (Array.isArray(f.decks)) {
      for (const deck of f.decks) {
        if (Array.isArray(deck.images)) {
          const paths = deck.images.map(extractPath).filter(Boolean)
          if (paths.some((path, i) => path !== deck.images[i])) {
            deck.images = paths
            changed = true
          }
        }
      }
    }
    if (changed) {
      await f.save()
      updated++
    }
  }
  return updated
}

async function migratePhases () {
  const phases = await Phase.find({})
  let updated = 0
  for (const p of phases) {
    if (!p.mediaItems || !p.mediaItems.length) continue
    let changed = false
    for (const item of p.mediaItems) {
      if (item.url) {
        const path = extractPath(item.url)
        if (path && path !== item.url) {
          item.url = path
          changed = true
        }
      }
    }
    if (changed) {
      await p.save()
      updated++
    }
  }
  return updated
}

async function migrateUnderConstruction () {
  const docs = await UnderConstruction.find({})
  let updated = 0
  for (const d of docs) {
    if (!d.media || !d.media.length) continue
    let changed = false
    for (const item of d.media) {
      if (item.url) {
        const path = extractPath(item.url)
        if (path && path !== item.url) {
          item.url = path
          changed = true
        }
      }
    }
    if (changed) {
      await d.save()
      updated++
    }
  }
  return updated
}

async function migrateOutdoorAmenities () {
  const doc = await OutdoorAmenities.findOne()
  if (!doc || !doc.amenities) return 0
  let changed = false
  for (const a of doc.amenities) {
    if (migrateImageArray(a.images)) changed = true
  }
  if (changed) await doc.save()
  return changed ? 1 : 0
}

async function main () {
  const uri = process.env.MONGODB_URI
  if (!uri) {
    console.error('MONGODB_URI is required')
    process.exit(1)
  }
  await mongoose.connect(uri)
  console.log('Connected to MongoDB. Migrating URLs to paths...')

  const results = {
    payloads: await migratePayloads(),
    contracts: await migrateContracts(),
    models: await migrateModels(),
    clubHouse: await migrateClubHouse(),
    facades: await migrateFacades(),
    phases: await migratePhases(),
    underConstruction: await migrateUnderConstruction(),
    outdoorAmenities: await migrateOutdoorAmenities()
  }

  console.log('Migration complete:', results)
  await mongoose.disconnect()
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
