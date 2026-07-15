/**
 * Pure commission calculation: tiered/flat/percentage rates, splits, and bonuses.
 */

function roundMoney(value) {
  return Math.round((Number(value) || 0) * 100) / 100
}

function findTierRate(tiers, saleAmount) {
  if (!Array.isArray(tiers) || !tiers.length) return null

  const sorted = [...tiers].sort((a, b) => a.minAmount - b.minAmount)
  for (const tier of sorted) {
    const min = Number(tier.minAmount) || 0
    const max = tier.maxAmount == null ? Infinity : Number(tier.maxAmount)
    if (saleAmount >= min && saleAmount <= max) {
      return Number(tier.rate)
    }
  }
  return null
}

/**
 * Resolve base commission rate and amount from a structure definition.
 * @param {number} saleAmount
 * @param {object} structure - CommissionStructure-like object
 * @returns {{ rate: number, amount: number, type: string }}
 */
export function calculateBaseCommission(saleAmount, structure) {
  const amount = Number(saleAmount) || 0
  if (!structure) {
    return { rate: 0, amount: 0, type: 'none' }
  }

  const type = structure.type || 'percentage'

  if (type === 'flat') {
    const flat = roundMoney(structure.flatAmount)
    const rate = amount > 0 ? roundMoney((flat / amount) * 100) : 0
    return { rate, amount: flat, type }
  }

  if (type === 'tiered') {
    const rate = findTierRate(structure.tiers, amount)
    if (rate == null) {
      return { rate: 0, amount: 0, type }
    }
    return {
      rate,
      amount: roundMoney(amount * (rate / 100)),
      type
    }
  }

  // percentage (default)
  const rate = Number(structure.percentageRate) || 0
  return {
    rate,
    amount: roundMoney(amount * (rate / 100)),
    type: 'percentage'
  }
}

/**
 * Apply bonusRules from a structure.
 * @returns {{ bonusAmount: number, applied: Array }}
 */
export function applyBonuses(saleAmount, baseCommissionAmount, bonusRules = []) {
  let bonusAmount = 0
  const applied = []

  for (const rule of bonusRules || []) {
    const min = Number(rule.minSaleAmount) || 0
    const max = rule.maxSaleAmount == null ? Infinity : Number(rule.maxSaleAmount)
    if (saleAmount < min || saleAmount > max) continue

    let value = 0
    const bonusType = rule.bonusType || 'flat'
    if (bonusType === 'percentage_of_sale') {
      value = roundMoney(saleAmount * (Number(rule.value) / 100))
    } else if (bonusType === 'percentage_of_commission') {
      value = roundMoney(baseCommissionAmount * (Number(rule.value) / 100))
    } else {
      value = roundMoney(rule.value)
    }

    if (value > 0) {
      bonusAmount = roundMoney(bonusAmount + value)
      applied.push({
        name: rule.name || bonusType,
        bonusType,
        value: rule.value,
        amount: value
      })
    }
  }

  return { bonusAmount, applied }
}

/**
 * Split a commission total across co-agents.
 * Primary agent keeps remainder after split percentages.
 * @param {number} totalAmount
 * @param {Array<{ agentId: string, percentage: number }>} splits
 * @param {string} primaryAgentId
 * @returns {Array<{ agentId: string, percentage: number, amount: number }>}
 */
export function applySplits(totalAmount, splits = [], primaryAgentId = null) {
  const total = roundMoney(totalAmount)
  if (!Array.isArray(splits) || !splits.length) {
    return primaryAgentId
      ? [{ agentId: primaryAgentId, percentage: 100, amount: total }]
      : []
  }

  let allocatedPct = 0
  let allocatedAmt = 0
  const result = []

  for (const split of splits) {
    const pct = Math.max(0, Math.min(100, Number(split.percentage) || 0))
    const amount = roundMoney(total * (pct / 100))
    allocatedPct += pct
    allocatedAmt = roundMoney(allocatedAmt + amount)
    result.push({
      agentId: split.agentId,
      percentage: pct,
      amount
    })
  }

  if (primaryAgentId && allocatedPct < 100) {
    const remainderPct = roundMoney(100 - allocatedPct)
    const remainderAmt = roundMoney(total - allocatedAmt)
    const existing = result.find((s) => String(s.agentId) === String(primaryAgentId))
    if (existing) {
      existing.percentage = roundMoney(existing.percentage + remainderPct)
      existing.amount = roundMoney(existing.amount + remainderAmt)
    } else {
      result.unshift({
        agentId: primaryAgentId,
        percentage: remainderPct,
        amount: remainderAmt
      })
    }
  }

  return result
}

/**
 * Full calculation pipeline.
 * @param {object} params
 * @param {number} params.saleAmount
 * @param {object} [params.structure]
 * @param {number} [params.overrideRate] - if set, use this % instead of structure
 * @param {number} [params.overrideAmount] - if set, use this amount instead of structure
 * @param {Array} [params.splits]
 * @param {string} [params.primaryAgentId]
 */
export function calculateCommission({
  saleAmount,
  structure = null,
  overrideRate = null,
  overrideAmount = null,
  splits = [],
  primaryAgentId = null
}) {
  const sale = Number(saleAmount) || 0

  let rate
  let commissionAmount

  if (overrideAmount != null && Number.isFinite(Number(overrideAmount))) {
    commissionAmount = roundMoney(overrideAmount)
    rate =
      overrideRate != null
        ? Number(overrideRate)
        : sale > 0
          ? roundMoney((commissionAmount / sale) * 100)
          : 0
  } else if (overrideRate != null && Number.isFinite(Number(overrideRate))) {
    rate = Number(overrideRate)
    commissionAmount = roundMoney(sale * (rate / 100))
  } else {
    const base = calculateBaseCommission(sale, structure)
    rate = base.rate
    commissionAmount = base.amount
  }

  const { bonusAmount, applied: bonusesApplied } = applyBonuses(
    sale,
    commissionAmount,
    structure?.bonusRules
  )

  const totalPayout = roundMoney(commissionAmount + bonusAmount)
  const splitWith = applySplits(totalPayout, splits, primaryAgentId)

  return {
    saleAmount: sale,
    commissionRate: rate,
    commissionAmount,
    bonusAmount,
    totalPayout,
    bonusesApplied,
    splitWith,
    structureType: structure?.type || null
  }
}
