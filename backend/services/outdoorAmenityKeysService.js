import OutdoorAmenityKeyConfig, { OUTDOOR_AMENITY_KEY_CONFIG_ID } from '../models/OutdoorAmenityKeyConfig.js'
import { ALLOWED_OUTDOOR_AMENITY_KEYS } from '../constants/outdoorAmenityKeys.js'

/** lowercase slug: letters, numbers, single hyphens between segments */
const KEY_REGEX = /^[a-z0-9]+(-[a-z0-9]+)*$/

export async function getMergedAllowedKeys () {
  const doc = await OutdoorAmenityKeyConfig.findById(OUTDOOR_AMENITY_KEY_CONFIG_ID).lean()
  const extra = Array.isArray(doc?.extraKeys) ? doc.extraKeys : []
  const set = new Set([...ALLOWED_OUTDOOR_AMENITY_KEYS, ...extra])
  return [...set].sort()
}

export async function getExtraKeysOnly () {
  const doc = await OutdoorAmenityKeyConfig.findById(OUTDOOR_AMENITY_KEY_CONFIG_ID).lean()
  return Array.isArray(doc?.extraKeys) ? [...doc.extraKeys].sort() : []
}

export function normalizeKeyInput (s) {
  if (typeof s !== 'string') return null
  const k = s.trim().toLowerCase()
  if (!k || !KEY_REGEX.test(k)) return null
  return k
}

export function parseKeysFromBody (body) {
  if (body == null) return null
  if (Array.isArray(body.keys)) return body.keys
  if (typeof body.key === 'string') return [body.key]
  return null
}
