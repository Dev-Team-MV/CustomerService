import Property from '../models/Property.js'
import Apartment from '../models/Apartment.js'
import Payload from '../models/Payload.js'
import Lot from '../models/Lot.js'
import { REFERRAL_DISCOUNT_BASES } from '../models/ReferralProgram.js'

export const REFERRAL_BONUS_PAYLOAD_TYPE = 'referral bonus'
export const REFERRAL_BONUS_DISPLAY_LABEL_ES = 'Bonificación por referido'

function roundCents(value) {
  return Math.round(Number(value) * 100) / 100
}

export function computeDiscountBaseAmount(unitPrice, discountBase) {
  const price = Number(unitPrice) || 0
  if (discountBase === 'after_first_10') {
    return roundCents(price * 0.9)
  }
  return roundCents(price)
}

export function computeDiscountAmount(baseAmount, discountPercent) {
  return roundCents((Number(baseAmount) || 0) * (Number(discountPercent) || 0) / 100)
}

async function loadRewardUnit({ rewardPropertyId, rewardApartmentId }) {
  if (rewardPropertyId) {
    const property = await Property.findById(rewardPropertyId)
    if (!property) return { error: 'Reward property not found' }
    return { unit: property, kind: 'property' }
  }
  if (rewardApartmentId) {
    const apartment = await Apartment.findById(rewardApartmentId)
    if (!apartment) return { error: 'Reward apartment not found' }
    return { unit: apartment, kind: 'apartment' }
  }
  return { error: 'Either rewardPropertyId or rewardApartmentId is required' }
}

function unitOwnedByReferrer(unit, referrerId) {
  const owners = (unit.users || []).map((id) => String(id._id || id))
  return owners.includes(String(referrerId))
}

/**
 * Apply a property_discount reward as a signed "referral bonus" Payload on the
 * referrer's unit. Idempotent when referral.rewardPayloadId already exists.
 *
 * @returns {{ referral, payload, unit }}
 */
export async function applyPropertyDiscountReward({
  referral,
  rewardPropertyId = null,
  rewardApartmentId = null,
  discountBase,
  discountPercent = null,
  actor = null
}) {
  if (referral.rewardPayloadId) {
    const existing = await Payload.findById(referral.rewardPayloadId)
    return { referral, payload: existing, unit: null, alreadyApplied: true }
  }

  if (rewardPropertyId && rewardApartmentId) {
    const err = new Error('Provide only one of rewardPropertyId or rewardApartmentId')
    err.statusCode = 400
    throw err
  }

  if (!REFERRAL_DISCOUNT_BASES.includes(discountBase)) {
    const err = new Error(
      `Invalid discountBase. Allowed: ${REFERRAL_DISCOUNT_BASES.join(', ')}`
    )
    err.statusCode = 400
    throw err
  }

  const percent =
    discountPercent != null ? Number(discountPercent) : Number(referral.discountPercent)

  if (!Number.isFinite(percent) || percent <= 0 || percent > 100) {
    const err = new Error('Valid discountPercent (0-100] is required for property_discount')
    err.statusCode = 400
    throw err
  }

  const loaded = await loadRewardUnit({ rewardPropertyId, rewardApartmentId })
  if (loaded.error) {
    const err = new Error(loaded.error)
    err.statusCode = 404
    throw err
  }

  const { unit, kind } = loaded

  if (!unitOwnedByReferrer(unit, referral.referrerId)) {
    const err = new Error('Selected unit does not belong to the referrer')
    err.statusCode = 400
    throw err
  }

  if (Number(unit.pending) <= 0) {
    const err = new Error(
      'Unit is fully paid (pending = 0). Use cash reward instead of property_discount'
    )
    err.statusCode = 400
    throw err
  }

  const baseAmount = computeDiscountBaseAmount(unit.price, discountBase)
  const discountAmount = computeDiscountAmount(baseAmount, percent)

  if (discountAmount <= 0) {
    const err = new Error('Computed discount amount must be greater than 0')
    err.statusCode = 400
    throw err
  }

  if (discountAmount > Number(unit.pending)) {
    const err = new Error(
      `Discount ($${discountAmount}) exceeds unit pending balance ($${unit.pending}). Reduce percent or use cash`
    )
    err.statusCode = 400
    throw err
  }

  const existingByReferral = await Payload.findOne({ referralId: referral._id })
  if (existingByReferral) {
    referral.rewardPayloadId = existingByReferral._id
    referral.rewardPropertyId = kind === 'property' ? unit._id : null
    referral.rewardApartmentId = kind === 'apartment' ? unit._id : null
    referral.discountBase = discountBase
    referral.discountBaseAmount = baseAmount
    referral.discountAmount = existingByReferral.amount
    referral.discountPercent = percent
    referral.rewardAmount = existingByReferral.amount
    referral.rewardType = 'property_discount'
    referral.status = 'reward_paid'
    referral.rewardPaidAt = referral.rewardPaidAt || new Date()
    await referral.save()
    return { referral, payload: existingByReferral, unit, alreadyApplied: true }
  }

  const notes = [
    REFERRAL_BONUS_DISPLAY_LABEL_ES,
    referral.referralCode ? `código ${referral.referralCode}` : null,
    `${percent}% sobre ${discountBase === 'after_first_10' ? '90%' : '100%'} del valor`
  ]
    .filter(Boolean)
    .join(' — ')

  let payload
  try {
    payload = await Payload.create({
      property: kind === 'property' ? unit._id : undefined,
      apartment: kind === 'apartment' ? unit._id : undefined,
      date: new Date(),
      amount: discountAmount,
      status: 'signed',
      type: REFERRAL_BONUS_PAYLOAD_TYPE,
      notes,
      referralId: referral._id,
      processedBy: actor?._id || null
    })
  } catch (error) {
    if (error.code === 11000) {
      const raced = await Payload.findOne({ referralId: referral._id })
      if (raced) {
        referral.rewardPayloadId = raced._id
        referral.status = 'reward_paid'
        referral.rewardPaidAt = referral.rewardPaidAt || new Date()
        await referral.save()
        return { referral, payload: raced, unit, alreadyApplied: true }
      }
    }
    throw error
  }

  unit.pending = Math.max(0, Number(unit.pending) - discountAmount)
  if (unit.pending === 0) {
    unit.status = 'sold'
    if (kind === 'property' && unit.lot) {
      await Lot.findByIdAndUpdate(unit.lot, { status: 'sold' })
    }
  }
  await unit.save()

  referral.rewardPropertyId = kind === 'property' ? unit._id : null
  referral.rewardApartmentId = kind === 'apartment' ? unit._id : null
  referral.rewardPayloadId = payload._id
  referral.discountBase = discountBase
  referral.discountBaseAmount = baseAmount
  referral.discountPercent = percent
  referral.discountAmount = discountAmount
  referral.rewardAmount = discountAmount
  referral.rewardType = 'property_discount'
  referral.status = 'reward_paid'
  referral.rewardPaidAt = new Date()
  await referral.save()

  return { referral, payload, unit, alreadyApplied: false }
}
