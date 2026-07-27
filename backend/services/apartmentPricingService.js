/**
 * Resolve apartment list price for basic vs upgrade finish.
 * Priority: unit override → typology (ApartmentModel) default → basic fallback.
 */

function toFinitePrice(value) {
  if (value == null || value === '') return null
  const n = Number(value)
  return Number.isFinite(n) && n >= 0 ? n : null
}

function normalizeRenderType(value) {
  return String(value || 'basic').trim().toLowerCase() === 'upgrade' ? 'upgrade' : 'basic'
}

/**
 * @param {object|null} apartment - Apartment doc/lean (may include nested apartmentModel)
 * @param {object|null} [apartmentModel] - ApartmentModel if not nested on apartment
 * @param {'basic'|'upgrade'|string} [selectedRenderType='basic']
 */
export function resolveApartmentSalePrice(apartment, apartmentModel = null, selectedRenderType = 'basic') {
  const model =
    apartmentModel ||
    (apartment?.apartmentModel && typeof apartment.apartmentModel === 'object'
      ? apartment.apartmentModel
      : null)

  const unitBasic = toFinitePrice(apartment?.price)
  const modelBasic = toFinitePrice(model?.basePrice)
  const basePrice = unitBasic != null ? unitBasic : modelBasic != null ? modelBasic : 0

  const unitUpgrade = toFinitePrice(apartment?.upgradePrice)
  const modelUpgrade = toFinitePrice(model?.upgradePrice)
  const upgradePrice = unitUpgrade != null ? unitUpgrade : modelUpgrade

  const renderType = normalizeRenderType(selectedRenderType)
  const upgradePremium =
    upgradePrice != null ? Math.max(0, Math.round((upgradePrice - basePrice) * 100) / 100) : 0

  if (renderType === 'upgrade' && upgradePrice != null) {
    return {
      selectedRenderType: 'upgrade',
      basePrice,
      upgradePrice,
      upgradePremium,
      listPrice: upgradePrice,
      priceSource: unitUpgrade != null ? 'apartment.upgradePrice' : 'apartmentModel.upgradePrice'
    }
  }

  return {
    selectedRenderType: renderType,
    basePrice,
    upgradePrice: upgradePrice,
    upgradePremium,
    listPrice: basePrice,
    priceSource:
      renderType === 'upgrade' && upgradePrice == null
        ? 'basic_fallback_no_upgrade_price'
        : unitBasic != null
          ? 'apartment.price'
          : modelBasic != null
            ? 'apartmentModel.basePrice'
            : 'zero'
  }
}

export { normalizeRenderType, toFinitePrice }
