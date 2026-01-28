/**
 * Devuelve las imágenes correctas para una combinación de opciones de modelo.
 * @param {Object} model - El modelo con sus imágenes y opciones.
 * @param {Object} options - { balcony: bool, upgrade: bool, storage: bool }
 * @returns {Object} { exterior: [], interior: [] }
 */
export function getModelImagesForCombination(model, options = {}) {
  let exterior = [...(model.images?.exterior || [])]
  let interior = [...(model.images?.interior || [])]

  // Balcón
  if (options.balcony) {
    exterior = exterior.concat(model.balconyImages?.exterior || [])
    interior = interior.concat(model.balconyImages?.interior || [])
  }

  // Upgrade
  if (options.upgrade) {
    // Upgrade sin balcón: interior
    interior = [...(model.upgradeImages?.interior || [])]
    // Upgrade con balcón: exterior
    if (options.balcony) {
      exterior = exterior.concat(model.upgradeImages?.exterior || [])
    }
  }

  // Storage
  if (options.storage) {
    exterior = exterior.concat(model.storageImages?.exterior || [])
    interior = interior.concat(model.storageImages?.interior || [])
  }

  // Evita duplicados
  exterior = Array.from(new Set(exterior))
  interior = Array.from(new Set(interior))

  return { exterior, interior }
}

export const getGalleryCategories = (model) => {
  if (!model) return []

  const categories = []
  const hasBalcony = model.balconies && model.balconies.length > 0
  const hasUpgrade = model.upgrades && model.upgrades.length > 0
  const hasStorage = model.storages && model.storages.length > 0

  // BASE SIN BALCÓN
  categories.push({
    label: 'Base Model (Sin Balcón)',
    key: 'base',
    exteriorImages: model.images?.exterior || [],
    interiorImages: model.images?.interior || []
  })

  // BASE CON BALCÓN
  if (hasBalcony) {
    categories.push({
      label: `Base + ${model.balconies[0].name}`,
      key: 'base-balcony',
      exteriorImages: model.balconies[0].images?.exterior || [],
      interiorImages: model.balconies[0].images?.interior || [], 
    })
  }

  // UPGRADE SIN BALCÓN
  if (hasUpgrade) {
    categories.push({
      label: `${model.upgrades[0].name} (Sin Balcón)`,
      key: 'upgrade',
      exteriorImages: model.images?.exterior || [],
      interiorImages: model.upgrades[0].images?.interior || []
    })
  }

  // UPGRADE CON BALCÓN
  if (hasUpgrade && hasBalcony) {
    categories.push({
      label: `${model.upgrades[0].name} + ${model.balconies[0].name}`,
      key: 'upgrade-balcony',
      exteriorImages: model.balconies[0].images?.exterior || [],
      interiorImages: model.upgrades[0].images?.exterior || []
    })
  }

  return categories
}