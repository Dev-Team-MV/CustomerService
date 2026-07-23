import crypto from 'crypto'
import mongoose from 'mongoose'
import Referral, { REFERRAL_STATUSES } from '../models/Referral.js'
import ReferralProgram, {
  REFERRAL_REWARD_TYPES,
  REFERRAL_PROGRAM_REWARD_TYPES,
  REFERRAL_DISCOUNT_BASES
} from '../models/ReferralProgram.js'
import Lead from '../models/Lead.js'
import User from '../models/User.js'
import Property from '../models/Property.js'
import Apartment from '../models/Apartment.js'
import { isStaffRole } from '../utils/roles.js'
import { isValidObjectId } from '../utils/crmHelpers.js'
import { runAutomationEngineAsync } from '../services/automationEngine.js'
import { applyPropertyDiscountReward } from '../services/referralRewardService.js'

const POPULATE = [
  { path: 'referrerId', select: 'firstName lastName email phoneNumber' },
  { path: 'referredLeadId', select: 'name phone email stage source' },
  { path: 'projectId', select: 'name slug title' },
  { path: 'conversionPropertyId', select: 'price status lot' },
  { path: 'conversionApartmentId', select: 'apartmentNumber floorNumber building status price' },
  { path: 'rewardPropertyId', select: 'price status pending lot' },
  { path: 'rewardApartmentId', select: 'apartmentNumber floorNumber building status price pending' },
  { path: 'rewardPayloadId', select: 'amount type status notes date' }
]

function generateReferralCode() {
  return `REF-${crypto.randomBytes(4).toString('hex').toUpperCase()}`
}

async function createUniqueReferralCode() {
  for (let i = 0; i < 8; i++) {
    const code = generateReferralCode()
    const exists = await Referral.exists({ referralCode: code })
    if (!exists) return code
  }
  return `REF-${crypto.randomBytes(8).toString('hex').toUpperCase()}`
}

function isAdminUser(user) {
  return isStaffRole(user?.role)
}

async function getActiveProgram(projectId) {
  return ReferralProgram.findOne({ projectId, isActive: true }).sort({ createdAt: -1 })
}

/** True when the referrer still owes money on any of their units */
async function referrerHasOutstandingDebt(referrerId) {
  const [property, apartment] = await Promise.all([
    Property.exists({ users: referrerId, pending: { $gt: 0 } }),
    Apartment.exists({ users: referrerId, pending: { $gt: 0 } })
  ])
  return Boolean(property || apartment)
}

function resolveConversionUnit({ propertyId, apartmentId, conversionPropertyId, conversionApartmentId }) {
  const propId = propertyId ?? conversionPropertyId
  const aptId = apartmentId ?? conversionApartmentId
  const hasProperty = propId != null && propId !== ''
  const hasApartment = aptId != null && aptId !== ''

  if (!hasProperty && !hasApartment) {
    return { error: 'Either propertyId or apartmentId is required for conversion' }
  }
  if (hasProperty && hasApartment) {
    return { error: 'Provide only one of propertyId or apartmentId' }
  }
  if (hasProperty && !isValidObjectId(propId)) {
    return { error: 'Invalid propertyId' }
  }
  if (hasApartment && !isValidObjectId(aptId)) {
    return { error: 'Invalid apartmentId' }
  }
  return {
    conversionPropertyId: hasProperty ? propId : null,
    conversionApartmentId: hasApartment ? aptId : null
  }
}

function resolveRewardUnit({ rewardPropertyId, rewardApartmentId }) {
  const hasProperty = rewardPropertyId != null && rewardPropertyId !== ''
  const hasApartment = rewardApartmentId != null && rewardApartmentId !== ''

  if (!hasProperty && !hasApartment) {
    return { error: 'Either rewardPropertyId or rewardApartmentId is required for property_discount' }
  }
  if (hasProperty && hasApartment) {
    return { error: 'Provide only one of rewardPropertyId or rewardApartmentId' }
  }
  if (hasProperty && !isValidObjectId(rewardPropertyId)) {
    return { error: 'Invalid rewardPropertyId' }
  }
  if (hasApartment && !isValidObjectId(rewardApartmentId)) {
    return { error: 'Invalid rewardApartmentId' }
  }
  return {
    rewardPropertyId: hasProperty ? rewardPropertyId : null,
    rewardApartmentId: hasApartment ? rewardApartmentId : null
  }
}

function programRewardSnapshot(program, overrides = {}) {
  const rewardType = overrides.rewardType || program?.rewardType || 'cash'
  if (rewardType === 'property_discount') {
    return {
      rewardType,
      rewardAmount: 0,
      discountPercent:
        overrides.discountPercent != null
          ? Number(overrides.discountPercent)
          : program?.discountPercent ?? null
    }
  }
  return {
    rewardType: 'cash',
    rewardAmount:
      overrides.rewardAmount != null
        ? Number(overrides.rewardAmount)
        : program?.rewardPerReferral || 0,
    discountPercent: null
  }
}

function validateProgramRewardBody({ rewardType, rewardPerReferral, discountPercent }, { isUpdate = false } = {}) {
  if (rewardType !== undefined) {
    if (!REFERRAL_PROGRAM_REWARD_TYPES.includes(rewardType)) {
      return {
        error: `Invalid rewardType. Allowed for programs: ${REFERRAL_PROGRAM_REWARD_TYPES.join(', ')}`
      }
    }
  }

  const type = rewardType || (isUpdate ? undefined : 'cash')

  if (type === 'cash' || (isUpdate && rewardPerReferral !== undefined && type !== 'property_discount')) {
    if (rewardPerReferral != null && Number(rewardPerReferral) < 0) {
      return { error: 'rewardPerReferral must be a non-negative number' }
    }
  }

  if (type === 'property_discount') {
    if (discountPercent == null || Number(discountPercent) <= 0 || Number(discountPercent) > 100) {
      return { error: 'discountPercent (0-100] is required for property_discount' }
    }
  }

  if (isUpdate && discountPercent !== undefined && discountPercent != null) {
    if (Number(discountPercent) < 0 || Number(discountPercent) > 100) {
      return { error: 'discountPercent must be between 0 and 100' }
    }
  }

  return { error: null }
}

// ─── Referral Program CRUD ───────────────────────────────────────────────────

export const getReferralPrograms = async (req, res) => {
  try {
    const filter = {}
    if (req.query.projectId) {
      if (!isValidObjectId(req.query.projectId)) {
        return res.status(400).json({ message: 'Invalid projectId' })
      }
      filter.projectId = req.query.projectId
    }
    if (req.query.isActive !== undefined) {
      filter.isActive = req.query.isActive === 'true'
    }

    const programs = await ReferralProgram.find(filter)
      .populate('projectId', 'name slug title')
      .sort({ createdAt: -1 })
    res.json(programs)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const getReferralProgramById = async (req, res) => {
  try {
    const program = await ReferralProgram.findById(req.params.id).populate(
      'projectId',
      'name slug title'
    )
    if (!program) return res.status(404).json({ message: 'Referral program not found' })
    res.json(program)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const createReferralProgram = async (req, res) => {
  try {
    const {
      projectId,
      name,
      rewardPerReferral,
      rewardType,
      discountPercent,
      isActive,
      termsAndConditions,
      maxReferralsPerUser
    } = req.body

    if (!projectId || !isValidObjectId(projectId)) {
      return res.status(400).json({ message: 'Valid projectId is required' })
    }
    if (!name?.trim()) {
      return res.status(400).json({ message: 'name is required' })
    }

    const resolvedType = rewardType || 'cash'
    const validation = validateProgramRewardBody({
      rewardType: resolvedType,
      rewardPerReferral,
      discountPercent
    })
    if (validation.error) {
      return res.status(400).json({ message: validation.error })
    }

    if (resolvedType === 'cash' && (rewardPerReferral == null || Number(rewardPerReferral) < 0)) {
      return res.status(400).json({ message: 'rewardPerReferral must be a non-negative number' })
    }

    const program = await ReferralProgram.create({
      projectId,
      name: name.trim(),
      rewardPerReferral: resolvedType === 'cash' ? Number(rewardPerReferral) : Number(rewardPerReferral) || 0,
      rewardType: resolvedType,
      discountPercent:
        resolvedType === 'property_discount' ? Number(discountPercent) : null,
      isActive: isActive !== undefined ? Boolean(isActive) : true,
      termsAndConditions: {
        en: termsAndConditions?.en || '',
        es: termsAndConditions?.es || ''
      },
      maxReferralsPerUser:
        maxReferralsPerUser != null ? Number(maxReferralsPerUser) : null
    })

    res.status(201).json(program)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const updateReferralProgram = async (req, res) => {
  try {
    const program = await ReferralProgram.findById(req.params.id)
    if (!program) return res.status(404).json({ message: 'Referral program not found' })

    const {
      name,
      rewardPerReferral,
      rewardType,
      discountPercent,
      isActive,
      termsAndConditions,
      maxReferralsPerUser
    } = req.body

    const nextType = rewardType !== undefined ? rewardType : program.rewardType
    const validation = validateProgramRewardBody(
      {
        rewardType: nextType,
        rewardPerReferral:
          rewardPerReferral !== undefined ? rewardPerReferral : program.rewardPerReferral,
        discountPercent:
          discountPercent !== undefined ? discountPercent : program.discountPercent
      },
      { isUpdate: true }
    )
    if (validation.error) {
      return res.status(400).json({ message: validation.error })
    }

    if (name !== undefined) program.name = name.trim()
    if (rewardType !== undefined) program.rewardType = rewardType
    if (rewardPerReferral !== undefined) program.rewardPerReferral = Number(rewardPerReferral)
    if (discountPercent !== undefined) {
      program.discountPercent =
        discountPercent == null ? null : Number(discountPercent)
    }
    if (program.rewardType === 'cash') {
      program.discountPercent = null
    }
    if (program.rewardType === 'property_discount' && program.discountPercent == null) {
      return res.status(400).json({ message: 'discountPercent is required for property_discount' })
    }
    if (isActive !== undefined) program.isActive = Boolean(isActive)
    if (termsAndConditions !== undefined) {
      program.termsAndConditions = {
        en: termsAndConditions?.en ?? program.termsAndConditions?.en ?? '',
        es: termsAndConditions?.es ?? program.termsAndConditions?.es ?? ''
      }
    }
    if (maxReferralsPerUser !== undefined) {
      program.maxReferralsPerUser =
        maxReferralsPerUser == null ? null : Number(maxReferralsPerUser)
    }

    const updated = await program.save()
    res.json(updated)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const deleteReferralProgram = async (req, res) => {
  try {
    const program = await ReferralProgram.findById(req.params.id)
    if (!program) return res.status(404).json({ message: 'Referral program not found' })
    await program.deleteOne()
    res.json({ message: 'Referral program deleted' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// ─── Referral CRUD ───────────────────────────────────────────────────────────

export const getReferrals = async (req, res) => {
  try {
    const filter = {}
    if (req.query.projectId) {
      if (!isValidObjectId(req.query.projectId)) {
        return res.status(400).json({ message: 'Invalid projectId' })
      }
      filter.projectId = req.query.projectId
    }
    if (req.query.status) {
      if (!REFERRAL_STATUSES.includes(req.query.status)) {
        return res.status(400).json({
          message: `Invalid status. Allowed: ${REFERRAL_STATUSES.join(', ')}`
        })
      }
      filter.status = req.query.status
    }
    if (req.query.referrerId) {
      if (!isValidObjectId(req.query.referrerId)) {
        return res.status(400).json({ message: 'Invalid referrerId' })
      }
      filter.referrerId = req.query.referrerId
    }

    if (!isAdminUser(req.user)) {
      filter.referrerId = req.user._id
    }

    const referrals = await Referral.find(filter)
      .populate(POPULATE)
      .sort({ createdAt: -1 })
    res.json(referrals)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const getReferralById = async (req, res) => {
  try {
    const referral = await Referral.findById(req.params.id).populate(POPULATE)
    if (!referral) return res.status(404).json({ message: 'Referral not found' })

    if (
      !isAdminUser(req.user) &&
      String(referral.referrerId._id || referral.referrerId) !== String(req.user._id)
    ) {
      return res.status(403).json({ message: 'Not authorized to view this referral' })
    }

    res.json(referral)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const createReferral = async (req, res) => {
  try {
    const {
      referrerId,
      referredName,
      referredPhone,
      referredEmail,
      projectId,
      rewardType,
      rewardAmount,
      discountPercent,
      notes,
      status
    } = req.body

    if (!projectId || !isValidObjectId(projectId)) {
      return res.status(400).json({ message: 'Valid projectId is required' })
    }
    if (!referredName?.trim()) {
      return res.status(400).json({ message: 'referredName is required' })
    }

    const resolvedReferrerId = isAdminUser(req.user) && referrerId
      ? referrerId
      : req.user._id

    if (!isValidObjectId(resolvedReferrerId)) {
      return res.status(400).json({ message: 'Invalid referrerId' })
    }

    if (rewardType && !REFERRAL_REWARD_TYPES.includes(rewardType)) {
      return res.status(400).json({
        message: `Invalid rewardType. Allowed: ${REFERRAL_REWARD_TYPES.join(', ')}`
      })
    }

    const program = await getActiveProgram(projectId)
    const snapshot = programRewardSnapshot(program, {
      rewardType,
      rewardAmount,
      discountPercent
    })

    const referrer =
      String(resolvedReferrerId) === String(req.user._id)
        ? req.user
        : await User.findById(resolvedReferrerId).select('firstName lastName')
    const referrerLabel = referrer
      ? `${referrer.firstName || ''} ${referrer.lastName || ''}`.trim() || `user ${resolvedReferrerId}`
      : `user ${resolvedReferrerId}`

    const lead = await Lead.create({
      name: referredName.trim(),
      phone: referredPhone?.trim() || '',
      email: referredEmail?.trim()?.toLowerCase() || undefined,
      source: 'referido',
      projectId,
      stage: 'nuevo',
      notes: notes?.trim()
        ? `Referral from ${referrerLabel}: ${notes.trim()}`
        : `Referral from ${referrerLabel}`
    })

    const referral = await Referral.create({
      referrerId: resolvedReferrerId,
      referredLeadId: lead._id,
      referredName: referredName.trim(),
      referredPhone: referredPhone?.trim() || '',
      referredEmail: referredEmail?.trim()?.toLowerCase() || '',
      projectId,
      status: status && isAdminUser(req.user) ? status : 'pending',
      rewardType: snapshot.rewardType,
      rewardAmount: snapshot.rewardAmount,
      discountPercent: snapshot.discountPercent,
      referralCode: await createUniqueReferralCode(),
      notes: notes?.trim() || ''
    })

    const populated = await Referral.findById(referral._id).populate(POPULATE)
    res.status(201).json(populated)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const updateReferral = async (req, res) => {
  try {
    const referral = await Referral.findById(req.params.id)
    if (!referral) return res.status(404).json({ message: 'Referral not found' })

    const {
      referredName,
      referredPhone,
      referredEmail,
      status,
      rewardType,
      rewardAmount,
      discountPercent,
      notes,
      referredLeadId
    } = req.body

    if (referredName !== undefined) referral.referredName = referredName.trim()
    if (referredPhone !== undefined) referral.referredPhone = referredPhone.trim()
    if (referredEmail !== undefined) referral.referredEmail = referredEmail.trim().toLowerCase()
    if (notes !== undefined) referral.notes = notes.trim()
    if (status !== undefined) {
      if (!REFERRAL_STATUSES.includes(status)) {
        return res.status(400).json({
          message: `Invalid status. Allowed: ${REFERRAL_STATUSES.join(', ')}`
        })
      }
      referral.status = status
    }
    if (rewardType !== undefined) {
      if (!REFERRAL_REWARD_TYPES.includes(rewardType)) {
        return res.status(400).json({
          message: `Invalid rewardType. Allowed: ${REFERRAL_REWARD_TYPES.join(', ')}`
        })
      }
      referral.rewardType = rewardType
    }
    if (rewardAmount !== undefined) referral.rewardAmount = Number(rewardAmount)
    if (discountPercent !== undefined) {
      referral.discountPercent =
        discountPercent == null ? null : Number(discountPercent)
    }
    if (referredLeadId !== undefined) {
      if (referredLeadId && !isValidObjectId(referredLeadId)) {
        return res.status(400).json({ message: 'Invalid referredLeadId' })
      }
      referral.referredLeadId = referredLeadId || null
    }

    const updated = await referral.save()
    const populated = await Referral.findById(updated._id).populate(POPULATE)
    res.json(populated)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const deleteReferral = async (req, res) => {
  try {
    const referral = await Referral.findById(req.params.id)
    if (!referral) return res.status(404).json({ message: 'Referral not found' })
    await referral.deleteOne()
    res.json({ message: 'Referral deleted' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// ─── Domain actions ──────────────────────────────────────────────────────────

export const submitReferral = async (req, res) => {
  try {
    const { referredName, referredPhone, referredEmail, projectId, notes } = req.body

    if (!projectId || !isValidObjectId(projectId)) {
      return res.status(400).json({ message: 'Valid projectId is required' })
    }
    if (!referredName?.trim()) {
      return res.status(400).json({ message: 'referredName is required' })
    }
    if (!referredPhone?.trim() && !referredEmail?.trim()) {
      return res.status(400).json({ message: 'referredPhone or referredEmail is required' })
    }

    const program = await getActiveProgram(projectId)
    if (!program) {
      return res.status(400).json({ message: 'No active referral program for this project' })
    }

    if (program.maxReferralsPerUser) {
      const count = await Referral.countDocuments({
        referrerId: req.user._id,
        projectId,
        status: { $nin: ['expired'] }
      })
      if (count >= program.maxReferralsPerUser) {
        return res.status(400).json({
          message: `Maximum referrals reached (${program.maxReferralsPerUser})`
        })
      }
    }

    const lead = await Lead.create({
      name: referredName.trim(),
      phone: referredPhone?.trim() || '',
      email: referredEmail?.trim()?.toLowerCase() || undefined,
      source: 'referido',
      projectId,
      stage: 'nuevo',
      notes: notes?.trim()
        ? `Referral from ${req.user.firstName || ''} ${req.user.lastName || ''}: ${notes.trim()}`
        : `Referral from user ${req.user._id}`
    })

    const snapshot = programRewardSnapshot(program)

    const referral = await Referral.create({
      referrerId: req.user._id,
      referredLeadId: lead._id,
      referredName: referredName.trim(),
      referredPhone: referredPhone?.trim() || '',
      referredEmail: referredEmail?.trim()?.toLowerCase() || '',
      projectId,
      status: 'pending',
      rewardType: snapshot.rewardType,
      rewardAmount: snapshot.rewardAmount,
      discountPercent: snapshot.discountPercent,
      referralCode: await createUniqueReferralCode(),
      notes: notes?.trim() || ''
    })

    const populated = await Referral.findById(referral._id).populate(POPULATE)
    res.status(201).json(populated)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const convertReferral = async (req, res) => {
  try {
    const unit = resolveConversionUnit(req.body)
    if (unit.error) {
      return res.status(400).json({ message: unit.error })
    }

    const referral = await Referral.findById(req.params.id)
    if (!referral) return res.status(404).json({ message: 'Referral not found' })

    if (['converted', 'reward_pending', 'reward_paid'].includes(referral.status)) {
      return res.status(400).json({ message: `Referral already in status: ${referral.status}` })
    }
    if (referral.status === 'expired') {
      return res.status(400).json({ message: 'Cannot convert an expired referral' })
    }

    referral.status = 'converted'
    referral.conversionPropertyId = unit.conversionPropertyId
    referral.conversionApartmentId = unit.conversionApartmentId
    await referral.save()

    if (referral.referredLeadId) {
      const lead = await Lead.findById(referral.referredLeadId)
      if (lead && lead.stage !== 'vendido') {
        lead.stage = 'vendido'
        lead.stageEnteredAt = new Date()
        await lead.save()
      }
    }

    runAutomationEngineAsync('referral_converted', {
      referral,
      actor: req.user
    })

    const populated = await Referral.findById(referral._id).populate(POPULATE)
    res.json(populated)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const approveReward = async (req, res) => {
  try {
    const referral = await Referral.findById(req.params.id)
    if (!referral) return res.status(404).json({ message: 'Referral not found' })

    if (!['reward_pending', 'converted'].includes(referral.status)) {
      return res.status(400).json({
        message: `Reward can only be approved when status is converted or reward_pending (current: ${referral.status})`
      })
    }

    if (req.body.rewardType) {
      if (!REFERRAL_REWARD_TYPES.includes(req.body.rewardType)) {
        return res.status(400).json({
          message: `Invalid rewardType. Allowed: ${REFERRAL_REWARD_TYPES.join(', ')}`
        })
      }
      referral.rewardType = req.body.rewardType
    }

    const rewardType = referral.rewardType || 'cash'

    if (rewardType === 'property_discount') {
      const unit = resolveRewardUnit(req.body)
      if (unit.error) {
        return res.status(400).json({ message: unit.error })
      }

      const discountBase = req.body.discountBase
      if (!REFERRAL_DISCOUNT_BASES.includes(discountBase)) {
        return res.status(400).json({
          message: `discountBase is required for property_discount. Allowed: ${REFERRAL_DISCOUNT_BASES.join(', ')}`
        })
      }

      // Percent: request override → referral snapshot → project program config
      let discountPercent =
        req.body.discountPercent != null
          ? Number(req.body.discountPercent)
          : referral.discountPercent

      if (discountPercent == null) {
        const program = await getActiveProgram(referral.projectId)
        discountPercent = program?.discountPercent ?? null
      }

      if (discountPercent == null) {
        return res.status(400).json({
          message:
            'discountPercent is not configured. Set it on the project referral program or send it in the request'
        })
      }

      try {
        await applyPropertyDiscountReward({
          referral,
          rewardPropertyId: unit.rewardPropertyId,
          rewardApartmentId: unit.rewardApartmentId,
          discountBase,
          discountPercent,
          actor: req.user
        })
      } catch (error) {
        return res.status(error.statusCode || 500).json({ message: error.message })
      }

      const populated = await Referral.findById(referral._id).populate(POPULATE)
      return res.json(populated)
    }

    // cash: only allowed when the referrer has no outstanding debt on any unit
    if (rewardType === 'cash') {
      const hasDebt = await referrerHasOutstandingDebt(
        referral.referrerId._id || referral.referrerId
      )
      if (hasDebt) {
        return res.status(400).json({
          message:
            'Cash reward is only allowed when the referrer has fully paid their units. Use property_discount instead'
        })
      }
    }

    referral.status = 'reward_paid'
    referral.rewardPaidAt = new Date()
    if (req.body.rewardAmount != null) {
      referral.rewardAmount = Number(req.body.rewardAmount)
    }
    referral.discountBase = undefined
    referral.discountBaseAmount = undefined
    referral.discountAmount = undefined
    referral.markModified('discountBase')
    await referral.save()

    const populated = await Referral.findById(referral._id).populate(POPULATE)
    res.json(populated)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const getReferralsByReferrer = async (req, res) => {
  try {
    const { userId } = req.params
    if (!isValidObjectId(userId)) {
      return res.status(400).json({ message: 'Invalid userId' })
    }

    if (!isAdminUser(req.user) && String(req.user._id) !== String(userId)) {
      return res.status(403).json({ message: 'Not authorized to view these referrals' })
    }

    const filter = { referrerId: userId }
    if (req.query.projectId) {
      if (!isValidObjectId(req.query.projectId)) {
        return res.status(400).json({ message: 'Invalid projectId' })
      }
      filter.projectId = req.query.projectId
    }

    const referrals = await Referral.find(filter)
      .populate(POPULATE)
      .sort({ createdAt: -1 })
    res.json(referrals)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const getReferralStats = async (req, res) => {
  try {
    const { projectId } = req.params
    if (!isValidObjectId(projectId)) {
      return res.status(400).json({ message: 'Invalid projectId' })
    }

    const projectObjectId = new mongoose.Types.ObjectId(projectId)

    const [byStatus, totals] = await Promise.all([
      Referral.aggregate([
        { $match: { projectId: projectObjectId } },
        { $group: { _id: '$status', count: { $sum: 1 }, rewardTotal: { $sum: '$rewardAmount' } } }
      ]),
      Referral.aggregate([
        { $match: { projectId: projectObjectId } },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            uniqueReferrers: { $addToSet: '$referrerId' },
            cashPaid: {
              $sum: {
                $cond: [
                  {
                    $and: [
                      { $eq: ['$status', 'reward_paid'] },
                      { $eq: ['$rewardType', 'cash'] }
                    ]
                  },
                  '$rewardAmount',
                  0
                ]
              }
            },
            discountsPaid: {
              $sum: {
                $cond: [
                  {
                    $and: [
                      { $eq: ['$status', 'reward_paid'] },
                      { $eq: ['$rewardType', 'property_discount'] }
                    ]
                  },
                  { $ifNull: ['$discountAmount', '$rewardAmount'] },
                  0
                ]
              }
            },
            rewardsPaid: {
              $sum: {
                $cond: [{ $eq: ['$status', 'reward_paid'] }, '$rewardAmount', 0]
              }
            },
            rewardsPending: {
              $sum: {
                $cond: [
                  { $in: ['$status', ['reward_pending', 'converted']] },
                  '$rewardAmount',
                  0
                ]
              }
            }
          }
        }
      ])
    ])

    const statusMap = Object.fromEntries(REFERRAL_STATUSES.map((s) => [s, 0]))
    let totalRewardAmount = 0
    for (const row of byStatus) {
      statusMap[row._id] = row.count
      totalRewardAmount += row.rewardTotal || 0
    }

    const summary = totals[0] || {
      total: 0,
      uniqueReferrers: [],
      cashPaid: 0,
      discountsPaid: 0,
      rewardsPaid: 0,
      rewardsPending: 0
    }

    res.json({
      projectId,
      total: summary.total,
      uniqueReferrers: summary.uniqueReferrers?.length || 0,
      byStatus: statusMap,
      cashPaid: summary.cashPaid || 0,
      discountsPaid: summary.discountsPaid || 0,
      rewardsPaid: summary.rewardsPaid || 0,
      rewardsPending: summary.rewardsPending || 0,
      totalRewardAmount
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}
