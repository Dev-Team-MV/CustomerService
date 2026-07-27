/**
 * Normalize house option flags + selectedOptions for Quote / Property create.
 * Accepts top-level flags and aliases from CRM (modelBalconyId, modelUpgradeId, etc.).
 */

function truthyFlag(value) {
  return value === true || value === 'true' || value === 1 || value === '1'
}

function pickId(...values) {
  for (const value of values) {
    if (value == null || value === '' || value === 'null' || value === 'undefined') continue
    if (typeof value === 'object' && value._id != null) return String(value._id)
    const id = String(value).trim()
    if (id) return id
  }
  return null
}

export function normalizeHouseOptions(body = {}) {
  const incoming =
    body.selectedOptions && typeof body.selectedOptions === 'object' && !Array.isArray(body.selectedOptions)
      ? { ...body.selectedOptions }
      : {}

  const balconyId = pickId(
    incoming.balconyId,
    body.balconyId,
    body.modelBalconyId
  )
  const storageId = pickId(
    incoming.storageId,
    body.storageId,
    body.modelStorageId
  )
  const upgradeId = pickId(
    incoming.upgradeId,
    body.upgradeId,
    body.modelUpgradeId
  )

  if (balconyId) incoming.balconyId = balconyId
  if (storageId) incoming.storageId = storageId
  if (upgradeId) incoming.upgradeId = upgradeId

  const hasBalcony =
    body.hasBalcony !== undefined
      ? truthyFlag(body.hasBalcony)
      : Boolean(balconyId) || truthyFlag(body.hasModelBalcony)

  const hasStorage =
    body.hasStorage !== undefined
      ? truthyFlag(body.hasStorage)
      : Boolean(storageId) || truthyFlag(body.hasModelStorage)

  let modelType = 'basic'
  if (body.modelType != null && body.modelType !== '') {
    modelType = String(body.modelType).trim().toLowerCase() === 'upgrade' ? 'upgrade' : 'basic'
  } else if (upgradeId || truthyFlag(body.hasModelUpgrade)) {
    modelType = 'upgrade'
  }

  return {
    selectedOptions: incoming,
    hasBalcony,
    hasStorage,
    modelType
  }
}
