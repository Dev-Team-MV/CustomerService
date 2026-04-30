import mongoose from 'mongoose'
import Property from '../models/Property.js'
import Lot from '../models/Lot.js'
import Model from '../models/Model.js'
import Facade from '../models/Facade.js'
import Project from '../models/Project.js'
import User from '../models/User.js'
import Phase from '../models/Phase.js'
import { normalizeImageArray } from '../utils/imageUtils.js'
import { getVisiblePropertyIdsForUser, canUserAccessProperty } from '../utils/propertyVisibility.js'
import { hydrateUrlsInObject } from '../services/urlResolverService.js'
import { evaluateProjectPricing } from '../services/projectPricingEngine.js'

/** Normalize ref/id to string; safe when value is undefined. */
function toIdStr(val) {
  if (val == null) return ''
  if (typeof val === 'string') return val
  if (val._id != null) return val._id.toString()
  return String(val)
}

/** Compare two ids (ObjectId or string) in a case-insensitive way for MongoDB hex ids. */
function sameId(a, b) {
  return toIdStr(a).toLowerCase() === toIdStr(b).toLowerCase()
}

/**
 * Calcula las imágenes (exterior e interior) de la propiedad según:
 * - modelType: 'basic' | 'upgrade'
 * - hasBalcony: true | false
 * Siempre devuelve arrays de { url, isPublic }.
 */
function getPropertyImages(property) {
  const model = property.model
  if (!model || !model.images) {
    return { exterior: [], interior: [] }
  }

  const baseExterior = normalizeImageArray(model.images?.exterior)
  const baseInterior = normalizeImageArray(model.images?.interior)

  const balcony = Array.isArray(model.balconies) && model.balconies.length
    ? (model.balconies.find(b => b.status !== 'inactive') || model.balconies[0])
    : null
  const upgrade = Array.isArray(model.upgrades) && model.upgrades.length
    ? (model.upgrades.find(u => u.status !== 'inactive') || model.upgrades[0])
    : null

  const balconyExterior = normalizeImageArray(balcony?.images?.exterior)
  const balconyInterior = normalizeImageArray(balcony?.images?.interior)
  const upgradeExterior = normalizeImageArray(upgrade?.images?.exterior)
  const upgradeInterior = normalizeImageArray(upgrade?.images?.interior)

  const isBasic = property.modelType === 'basic'
  const hasBalcony = property.hasBalcony === true

  let exterior = []
  let interior = []

  if (isBasic) {
    if (!hasBalcony) {
      exterior = baseExterior
      interior = baseInterior
    } else {
      exterior = balconyExterior.length ? balconyExterior : baseExterior
      interior = balconyInterior.length ? balconyInterior : baseInterior
    }
  } else {
    if (!hasBalcony) {
      exterior = baseExterior
      interior = upgradeInterior.length ? upgradeInterior : baseInterior
    } else {
      exterior = balconyExterior.length ? balconyExterior : baseExterior
      interior = upgradeExterior.length ? upgradeExterior : (upgradeInterior.length ? upgradeInterior : baseInterior)
    }
  }

  return { exterior, interior }
}

/**
 * Devuelve el array de blueprints de la propiedad según hasBalcony y hasStorage.
 * Siempre [{ url, isPublic }].
 */
function getPropertyBlueprints(property) {
  const model = property.model
  if (!model || !model.blueprints) {
    return []
  }
  const b = model.blueprints
  const defaultArr = normalizeImageArray(b.default)
  const withBalcony = normalizeImageArray(b.withBalcony)
  const withStorage = normalizeImageArray(b.withStorage)
  const withBalconyAndStorage = normalizeImageArray(b.withBalconyAndStorage)

  const hasBalcony = property.hasBalcony === true
  const hasStorage = property.hasStorage === true

  if (hasBalcony && hasStorage) {
    return withBalconyAndStorage.length ? withBalconyAndStorage : defaultArr
  }
  if (hasBalcony) {
    return withBalcony.length ? withBalcony : defaultArr
  }
  if (hasStorage) {
    return withStorage.length ? withStorage : defaultArr
  }
  return defaultArr
}

function calculateTotalConstructionPercentage(phases = []) {
  const phaseWeights = {
    1: 10.00,
    2: 15.00,
    3: 15.00,
    4: 15.00,
    5: 10.00,
    6: 10.00,
    7: 10.00,
    8: 10.00,
    9: 5.00
  }

  if (!Array.isArray(phases) || phases.length === 0) return 0

  const total = phases.reduce((acc, phase) => {
    const weight = phaseWeights[phase?.phaseNumber] || 0
    const phaseCompletion = Number(phase?.constructionPercentage || 0)
    return acc + (phaseCompletion * weight) / 100
  }, 0)

  return Math.round(total * 100) / 100
}

function normalizeFloorMediaBlock(media) {
  if (!media || typeof media !== 'object') {
    return {
      renders: [],
      isometrics: [],
      blueprints: [],
      cinematics: [],
      exterior: []
    }
  }

  return {
    renders: normalizeImageArray(media.renders),
    isometrics: normalizeImageArray(media.isometrics),
    blueprints: normalizeImageArray(media.blueprints),
    cinematics: normalizeImageArray(media.cinematics),
    exterior: normalizeImageArray(media.exterior)
  }
}

function hasFloorMediaContent(media) {
  if (!media || typeof media !== 'object') return false
  return ['renders', 'isometrics', 'blueprints', 'cinematics', 'exterior']
    .some((key) => Array.isArray(media[key]) && media[key].length > 0)
}

function normalizeComparable(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, '')
}

function inferSelectedOptionKeyForFloor(floor, selectedOptions = {}, selectedFloors = {}) {
  const options = Array.isArray(floor?.options) ? floor.options : []
  if (options.length === 0) return null

  const optionMap = new Map()
  options.forEach((option) => {
    if (option?.key) optionMap.set(normalizeComparable(option.key), option.key)
    if (option?.label) optionMap.set(normalizeComparable(option.label), option.key)
  })

  // 1) Explicit floors map has priority
  const explicitFloorSelection = selectedFloors[floor?.key]
  if (explicitFloorSelection) {
    const inferred = optionMap.get(normalizeComparable(explicitFloorSelection))
    if (inferred) return inferred
  }

  // 2) Try conventional keys in selectedOptions
  const floorKey = floor?.key || ''
  const candidateKeys = [
    floorKey,
    `${floorKey}Option`,
    `${floorKey}Upgrade`,
    `${floorKey}Selection`
  ]

  for (const key of candidateKeys) {
    const rawValue = selectedOptions[key]
    if (!rawValue) continue
    const inferred = optionMap.get(normalizeComparable(rawValue))
    if (inferred) return inferred
  }

  // 3) Heuristic: keys containing floor key text (e.g. level1Upgrade)
  const normalizedFloorKey = normalizeComparable(floorKey)
  if (normalizedFloorKey) {
    for (const [key, value] of Object.entries(selectedOptions)) {
      if (!key || value == null || typeof value === 'object') continue
      if (!normalizeComparable(key).includes(normalizedFloorKey)) continue
      const inferred = optionMap.get(normalizeComparable(value))
      if (inferred) return inferred
    }
  }

  return null
}

function resolveModelFloorMedia(modelExists, selectedOptions = {}, previewOptions = {}) {
  const floors = Array.isArray(modelExists?.floors) ? modelExists.floors : []
  const selectedFloors = selectedOptions && typeof selectedOptions === 'object'
    ? (selectedOptions.floors && typeof selectedOptions.floors === 'object' ? selectedOptions.floors : {})
    : {}
  const includeAllOptionsMedia = previewOptions?.includeAllOptionsMedia === true
  const includeEmptyOptionMedia = previewOptions?.includeEmptyOptionMedia === true
  const requestedFloorKeys = Array.isArray(previewOptions?.floorKeys)
    ? new Set(previewOptions.floorKeys.map((key) => String(key || '').trim()).filter(Boolean))
    : null

  return floors
    .map((floorRaw, index) => {
      const floor = floorRaw?.toObject ? floorRaw.toObject() : floorRaw
      const floorKey = floor?.key || `floor-${index + 1}`
      const floorMedia = normalizeFloorMediaBlock(floor?.media)
      const options = Array.isArray(floor?.options) ? floor.options : []
      const selectedOptionKey = inferSelectedOptionKeyForFloor(floor, selectedOptions, selectedFloors)

      const selectedOptionRaw = selectedOptionKey
        ? options.find((opt) => opt?.key === selectedOptionKey)
        : null
      const selectedOption = selectedOptionRaw?.toObject ? selectedOptionRaw.toObject() : selectedOptionRaw
      const selectedOptionMedia = normalizeFloorMediaBlock(selectedOption?.media)
      const useOptionMedia = selectedOption && hasFloorMediaContent(selectedOptionMedia)

      const payload = {
        floorKey,
        level: floor?.level ?? null,
        label: floor?.label || '',
        selectedOptionKey,
        mediaSource: useOptionMedia ? 'option' : 'floor',
        media: useOptionMedia ? selectedOptionMedia : floorMedia
      }

      if (includeAllOptionsMedia) {
        const optionsMedia = options
          .map((optionRaw, optionIndex) => {
            const option = optionRaw?.toObject ? optionRaw.toObject() : optionRaw
            const optionMedia = normalizeFloorMediaBlock(option?.media)
            const hasMedia = hasFloorMediaContent(optionMedia)
            return {
              key: option?.key || `option-${optionIndex + 1}`,
              label: option?.label || '',
              status: option?.status || 'active',
              hasMedia,
              media: optionMedia
            }
          })
          .filter((item) => includeEmptyOptionMedia || item.hasMedia)
        payload.optionsMedia = optionsMedia
      }

      return payload
    })
    .filter((item) => !requestedFloorKeys || requestedFloorKeys.has(item.floorKey))
}

function parsePositiveInteger(value) {
  const parsed = Number(value)
  if (!Number.isFinite(parsed)) return null
  const normalized = Math.floor(parsed)
  return normalized >= 1 ? normalized : null
}

function paginateFloorMedia(mediaByFloor = [], previewOptions = {}) {
  const stepSize = parsePositiveInteger(previewOptions?.stepSize)
  const step = parsePositiveInteger(previewOptions?.step)
  if (!stepSize) {
    return {
      items: mediaByFloor,
      meta: {
        totalFloors: mediaByFloor.length
      }
    }
  }

  const totalFloors = mediaByFloor.length
  const totalSteps = totalFloors > 0 ? Math.ceil(totalFloors / stepSize) : 0
  const currentStep = totalSteps === 0 ? 1 : Math.min(step || 1, totalSteps)
  const start = (currentStep - 1) * stepSize
  const end = start + stepSize
  const items = mediaByFloor.slice(start, end)

  return {
    items,
    meta: {
      totalFloors,
      stepSize,
      totalSteps,
      currentStep,
      hasNextStep: currentStep < totalSteps,
      nextStep: currentStep < totalSteps ? currentStep + 1 : null
    }
  }
}

export const getAllProperties = async (req, res) => {
  try {
    const { status, user, projectId } = req.query
    const filter = {}
    const isAdminOrAbove = req.user.role === 'superadmin' || req.user.role === 'admin'

    if (projectId) filter.project = projectId
    if (status) filter.status = status

    if (isAdminOrAbove) {
      // Admin/superadmin must always see all properties in the project scope.
      if (user && mongoose.Types.ObjectId.isValid(user)) {
        filter.users = user
      }
    } else {
      // User/admin view (and MyProperty visible-only view):
      // Only properties where requester is an owner or has access via PropertyShare/familyGroup.
      const visibleIds = await getVisiblePropertyIdsForUser(req.user._id)
      filter._id = { $in: visibleIds }

      // Optional extra filter by owner user id; still constrained by visibility.
      if (user && mongoose.Types.ObjectId.isValid(user)) {
        filter.users = user
      }
    }

    const properties = await Property.find(filter)
      .populate('project', 'name slug')
      .populate('lot', 'number price')
      .populate('model', 'model modelNumber price bedrooms bathrooms sqft images blueprints balconies upgrades floors')
      .populate('facade', 'title url price')
      .populate('users', 'firstName lastName email phoneNumber')
      .populate({
        path: 'phases',
        select: 'phaseNumber title constructionPercentage',
        options: { sort: { phaseNumber: 1 } }
      })
      .sort({ createdAt: -1 })
      .lean()
    
    // Calculate total construction percentage and images for each property
    const propertiesWithPercentage = properties.map(property => {
      const propertyObj = { ...property }
      propertyObj.totalConstructionPercentage = calculateTotalConstructionPercentage(propertyObj.phases)
      propertyObj.images = getPropertyImages(property)
      propertyObj.blueprints = getPropertyBlueprints(property)
      propertyObj.mediaByFloor = resolveModelFloorMedia(property.model, property.selectedOptions || {})
      return propertyObj
    })
    
    await hydrateUrlsInObject(propertiesWithPercentage)
    res.json(propertiesWithPercentage)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const getPropertyById = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id)
      .populate('project', 'name slug')
      .populate('lot', 'number price')
      .populate('model', 'model modelNumber price bedrooms bathrooms sqft images blueprints description balconies upgrades floors')
      .populate('facade', 'title url price')
      .populate('users', 'firstName lastName email phoneNumber birthday')
      .populate({
        path: 'payloads',
        options: { sort: { date: -1 } }
      })
      .populate({
        path: 'phases',
        options: { sort: { phaseNumber: 1 } }
      })

    if (!property) {
      return res.status(404).json({ message: 'Property not found' })
    }

    const isAdminOrAbove = req.user.role === 'superadmin' || req.user.role === 'admin'

    const canAccess = isAdminOrAbove
      ? true
      : await canUserAccessProperty(req.user._id, property._id)
    if (!canAccess) {
      return res.status(403).json({ message: 'You do not have access to this property' })
    }

    const propertyObj = property.toObject()
    propertyObj.totalConstructionPercentage = property.totalConstructionPercentage || 0
    propertyObj.images = getPropertyImages(property)
    propertyObj.blueprints = getPropertyBlueprints(property)
    propertyObj.mediaByFloor = resolveModelFloorMedia(property.model, property.selectedOptions || {})
    await hydrateUrlsInObject(propertyObj)
    res.json(propertyObj)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

const resolvePropertyPricing = async ({
  projectId,
  project,
  lot,
  model,
  facade,
  initialPayment,
  hasBalcony,
  modelType,
  hasStorage,
  selectedOptions = {},
  enforceLotAvailability = false,
  firstOwner = null
}) => {
  let projId = projectId || project

  const lotExists = await Lot.findById(lot)
  if (!lotExists) {
    return { ok: false, status: 404, message: 'Lot not found' }
  }

  if (!projId && lotExists.project) {
    projId = lotExists.project
  }
  if (!projId) {
    return { ok: false, status: 400, message: 'projectId (or project) is required, or use a lot that belongs to a project' }
  }
  if (lotExists.project) {
    projId = lotExists.project
  }

  if (enforceLotAvailability) {
    if (lotExists.status === 'sold') {
      return { ok: false, status: 400, message: 'Lot is already sold' }
    }

    const existingPropertyForLot = await Property.findOne({ lot })
    if (!existingPropertyForLot && (lotExists.assignedUser || lotExists.status !== 'available')) {
      await Lot.findByIdAndUpdate(lot, { status: 'available', assignedUser: null })
      lotExists.assignedUser = null
      lotExists.status = 'available'
    }

    if (firstOwner && lotExists.assignedUser && !sameId(lotExists.assignedUser, firstOwner)) {
      return { ok: false, status: 400, message: 'Lot is already assigned to another user' }
    }
  }

  const modelExists = await Model.findById(model)
  if (!modelExists) {
    return { ok: false, status: 404, message: 'Model not found' }
  }
  if (!modelExists.project || !sameId(modelExists.project, projId)) {
    return { ok: false, status: 400, message: 'Model does not belong to this project' }
  }

  const projectExists = await Project.findById(projId).select('_id facadeEnabled')
  if (!projectExists) {
    return { ok: false, status: 404, message: 'Project not found' }
  }
  const facadeEnabled = projectExists.facadeEnabled !== false

  let facadeExists = null
  if (facadeEnabled) {
    if (!facade) {
      return { ok: false, status: 400, message: 'Facade is required for this project' }
    }
    facadeExists = await Facade.findById(facade)
    if (!facadeExists) {
      return { ok: false, status: 404, message: 'Facade not found' }
    }
    if (!facadeExists.project || !sameId(facadeExists.project, projId)) {
      return { ok: false, status: 400, message: 'Facade does not belong to this project' }
    }
    if (!sameId(facadeExists.model, model)) {
      return { ok: false, status: 400, message: 'Facade does not belong to the selected model' }
    }
  } else if (facade) {
    return { ok: false, status: 400, message: 'Facades are disabled for this project' }
  }

  const normalizedSelectedOptions = {
    hasBalcony: hasBalcony === true,
    modelType: modelType || 'basic',
    hasStorage: hasStorage === true,
    ...selectedOptions
  }

  const pricing = await evaluateProjectPricing({
    projectId: projId,
    lotExists,
    modelExists,
    facadeExists,
    selectedOptions: normalizedSelectedOptions
  })

  const lotPrice = Number(pricing.baseBreakdown.lotPrice || 0)
  const facadePrice = Number(pricing.baseBreakdown.facadePrice || 0)
  const modelPrice = Number(pricing.baseBreakdown.modelBasePrice || 0) +
    Number(pricing.totalAdjustments || 0)
  const totalPrice = Number(pricing.totalPrice || 0)
  const initialPaymentAmount = Number(initialPayment || 0)
  const pendingAmount = totalPrice - initialPaymentAmount

  return {
    ok: true,
    data: {
      projectId: projId,
      lotExists,
      modelExists,
      facadeExists,
      facadeEnabled,
      prices: {
        lotPrice,
        modelBasePrice: Number(modelExists.price || 0),
        balconyPrice: Number(
          pricing.adjustments
            .filter(a => a.code === 'legacy-balcony')
            .reduce((acc, item) => acc + Number(item.amount || 0), 0)
        ),
        upgradePrice: Number(
          pricing.adjustments
            .filter(a => a.code === 'legacy-upgrade')
            .reduce((acc, item) => acc + Number(item.amount || 0), 0)
        ),
        storagePrice: Number(
          pricing.adjustments
            .filter(a => a.code === 'legacy-storage')
            .reduce((acc, item) => acc + Number(item.amount || 0), 0)
        ),
        facadePrice,
        modelPrice,
        totalPrice,
        initialPayment: initialPaymentAmount,
        pending: pendingAmount,
        adjustments: pricing.adjustments,
        configVersion: pricing.configVersion,
        pricingMode: pricing.pricingMode || 'legacy_components'
      }
    }
  }
}

export const getPropertyQuote = async (req, res) => {
  try {
    const { projectId, project, lot, model, facade, initialPayment, hasBalcony, modelType, hasStorage, selectedOptions } = req.body

    const resolved = await resolvePropertyPricing({
      projectId,
      project,
      lot,
      model,
      facade,
      initialPayment,
      hasBalcony: hasBalcony === true,
      modelType: modelType || 'basic',
      hasStorage: hasStorage === true,
      selectedOptions: selectedOptions && typeof selectedOptions === 'object' ? selectedOptions : {},
      enforceLotAvailability: false
    })

    if (!resolved.ok) {
      return res.status(resolved.status).json({ message: resolved.message })
    }

    const { prices, projectId: resolvedProjectId, lotExists, modelExists, facadeExists, facadeEnabled } = resolved.data

    res.json({
      projectId: resolvedProjectId,
      lot: { _id: lotExists._id, number: lotExists.number, price: prices.lotPrice },
      model: {
        _id: modelExists._id,
        model: modelExists.model,
        modelNumber: modelExists.modelNumber,
        price: prices.modelBasePrice
      },
      facade: facadeExists
        ? { _id: facadeExists._id, title: facadeExists.title, price: prices.facadePrice }
        : null,
      facadeEnabled,
      options: {
        hasBalcony: hasBalcony === true,
        modelType: modelType || 'basic',
        hasStorage: hasStorage === true
      },
      breakdown: {
        lotPrice: prices.lotPrice,
        modelBasePrice: prices.modelBasePrice,
        balconyPrice: prices.balconyPrice,
        upgradePrice: prices.upgradePrice,
        storagePrice: prices.storagePrice,
        facadePrice: prices.facadePrice,
        adjustments: prices.adjustments || []
      },
      totals: {
        totalPrice: prices.totalPrice,
        initialPayment: prices.initialPayment,
        pending: prices.pending
      },
      pricingConfig: {
        version: prices.configVersion || null,
        mode: prices.pricingMode || 'legacy_components'
      }
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const getPropertyQuotePreview = async (req, res) => {
  try {
    const {
      projectId,
      project,
      lot,
      model,
      facade,
      initialPayment,
      hasBalcony,
      modelType,
      hasStorage,
      selectedOptions
    } = req.body

    const resolved = await resolvePropertyPricing({
      projectId,
      project,
      lot,
      model,
      facade,
      initialPayment,
      hasBalcony: hasBalcony === true,
      modelType: modelType || 'basic',
      hasStorage: hasStorage === true,
      selectedOptions: selectedOptions && typeof selectedOptions === 'object' ? selectedOptions : {},
      enforceLotAvailability: false
    })

    if (!resolved.ok) {
      return res.status(resolved.status).json({ message: resolved.message })
    }

    const {
      prices,
      projectId: resolvedProjectId,
      lotExists,
      modelExists,
      facadeExists,
      facadeEnabled
    } = resolved.data

    const previewBody = req.body.preview && typeof req.body.preview === 'object' ? req.body.preview : {}
    const previewOptions = {
      includeAllOptionsMedia: previewBody.includeAllOptionsMedia === true || req.body.includeAllOptionsMedia === true,
      includeEmptyOptionMedia: previewBody.includeEmptyOptionMedia === true || req.body.includeEmptyOptionMedia === true,
      floorKeys: Array.isArray(previewBody.floorKeys)
        ? previewBody.floorKeys
        : (Array.isArray(req.body.floorKeys) ? req.body.floorKeys : null),
      step: previewBody.step ?? req.body.step,
      stepSize: previewBody.stepSize ?? req.body.stepSize
    }

    const fullMediaByFloor = resolveModelFloorMedia(
      modelExists,
      selectedOptions && typeof selectedOptions === 'object' ? selectedOptions : {},
      previewOptions
    )
    const paginatedPreview = paginateFloorMedia(fullMediaByFloor, previewOptions)
    const mediaByFloor = paginatedPreview.items

    const response = {
      quote: {
        projectId: resolvedProjectId,
        lot: { _id: lotExists._id, number: lotExists.number, price: prices.lotPrice },
        model: {
          _id: modelExists._id,
          model: modelExists.model,
          modelNumber: modelExists.modelNumber,
          price: prices.modelBasePrice
        },
        facade: facadeExists
          ? { _id: facadeExists._id, title: facadeExists.title, price: prices.facadePrice }
          : null,
        facadeEnabled,
        options: {
          hasBalcony: hasBalcony === true,
          modelType: modelType || 'basic',
          hasStorage: hasStorage === true
        },
        breakdown: {
          lotPrice: prices.lotPrice,
          modelBasePrice: prices.modelBasePrice,
          balconyPrice: prices.balconyPrice,
          upgradePrice: prices.upgradePrice,
          storagePrice: prices.storagePrice,
          facadePrice: prices.facadePrice,
          adjustments: prices.adjustments || []
        },
        totals: {
          totalPrice: prices.totalPrice,
          initialPayment: prices.initialPayment,
          pending: prices.pending
        },
        pricingConfig: {
          version: prices.configVersion || null,
          mode: prices.pricingMode || 'legacy_components'
        }
      },
      mediaByFloor,
      preview: {
        includeAllOptionsMedia: previewOptions.includeAllOptionsMedia,
        includeEmptyOptionMedia: previewOptions.includeEmptyOptionMedia,
        ...paginatedPreview.meta
      }
    }

    await hydrateUrlsInObject(response)
    res.json(response)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const createProperty = async (req, res) => {
  try {
    const {
      projectId, project, lot, model, facade, user, users, initialPayment,
      hasBalcony, modelType, hasStorage, selectedOptions
    } = req.body
    let projId = projectId || project

    // Normalize owners: accept single user or users array
    const ownerIds = users && Array.isArray(users) && users.length > 0
      ? users
      : user
        ? [user]
        : []
    if (ownerIds.length === 0) {
      return res.status(400).json({ message: 'At least one owner (user or users) is required' })
    }

    const firstOwner = ownerIds[0]
    const resolved = await resolvePropertyPricing({
      projectId,
      project,
      lot,
      model,
      facade,
      initialPayment,
      hasBalcony: hasBalcony === true,
      modelType: modelType || 'basic',
      hasStorage: hasStorage === true,
      selectedOptions: selectedOptions && typeof selectedOptions === 'object' ? selectedOptions : {},
      enforceLotAvailability: true,
      firstOwner
    })
    if (!resolved.ok) {
      return res.status(resolved.status).json({ message: resolved.message })
    }
    projId = resolved.data.projectId
    const { totalPrice, initialPayment: initialPaymentAmount, pending: pendingAmount } = resolved.data.prices
    if (initialPaymentAmount > totalPrice) {
      return res.status(400).json({
        message: 'initialPayment cannot be greater than totalPrice',
        totals: {
          totalPrice,
          initialPayment: initialPaymentAmount
        }
      })
    }
    
    const property = await Property.create({
      project: projId,
      lot,
      model,
      facade: resolved.data.facadeExists ? resolved.data.facadeExists._id : undefined,
      users: ownerIds,
      price: totalPrice,
      pending: pendingAmount,
      initialPayment: initialPaymentAmount,
      status: 'pending',
      hasBalcony: hasBalcony === true,
      modelType: modelType || 'basic',
      hasStorage: hasStorage === true,
      selectedOptions: selectedOptions && typeof selectedOptions === 'object' ? selectedOptions : {}
    })
    
    await Lot.findByIdAndUpdate(lot, {
      status: 'pending',
      assignedUser: firstOwner
    })
    
    for (const userId of ownerIds) {
      const userDoc = await User.findById(userId)
      if (userDoc && !userDoc.lots.some(id => toIdStr(id) === toIdStr(lot))) {
        userDoc.lots.push(lot)
        await userDoc.save()
      }
    }
    
    const populatedProperty = await Property.findById(property._id)
      .populate('lot')
      .populate('model')
      .populate('facade')
      .populate('users')
      .populate({
        path: 'phases',
        options: { sort: { phaseNumber: 1 } }
      })
    
    const propertyObj = populatedProperty.toObject()
    propertyObj.totalConstructionPercentage = populatedProperty.totalConstructionPercentage || 0
    propertyObj.images = getPropertyImages(populatedProperty)
    propertyObj.blueprints = getPropertyBlueprints(populatedProperty)
    
    await hydrateUrlsInObject(propertyObj)
    res.status(201).json(propertyObj)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Schema fields that can be updated via PUT (any value allowed by the model)
const ALLOWED_PROPERTY_UPDATES = [
  'lot', 'model', 'facade', 'users', 'price', 'pending', 'initialPayment',
  'status', 'saleDate', 'hasBalcony', 'modelType', 'hasStorage', 'selectedOptions'
]

export const updateProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id)
    
    if (property) {
      const previousLotId = property.lot ? toIdStr(property.lot) : null

      // Apply any allowed field present in the request body (price is only calculated on create; updates use the sent values)
      for (const key of ALLOWED_PROPERTY_UPDATES) {
        if (req.body[key] !== undefined) {
          if (key === 'price') {
            const newPrice = Number(req.body.price)
            if (!Number.isNaN(newPrice) && newPrice >= 0) {
              const priceDifference = newPrice - property.price
              property.price = newPrice
              property.pending = Math.max(0, property.pending + priceDifference)
              property.markModified('price')
              property.markModified('pending')
            }
          } else if (key === 'pending') {
            const newPending = Number(req.body.pending)
            if (!Number.isNaN(newPending) && newPending >= 0) {
              property.pending = newPending
              property.markModified('pending')
            }
          } else if (key === 'initialPayment') {
            const newInitial = Number(req.body.initialPayment)
            if (!Number.isNaN(newInitial) && newInitial >= 0) {
              property.initialPayment = newInitial
              property.markModified('initialPayment')
              // Si el request trae `pending`, asumimos que el cliente quiere que `pending` sea autoritativo.
              // En ese caso NO recalculamos para evitar que el valor editado se sobrescriba.
              // (Recalculamos solo cuando `pending` no viene en el body.)
              if (req.body.pending === undefined) {
                property.pending = Math.max(0, property.price - newInitial)
                property.markModified('pending')
              }
            }
          } else if (key === 'users') {
            const newUsers = req.body.users
            if (Array.isArray(newUsers) && newUsers.length > 0) {
              const previousIds = (property.users || []).map(id => toIdStr(id))
              const newIds = newUsers.map(id => toIdStr(id))
              property.users = newIds
              property.markModified('users')
              for (const userId of newIds) {
                const userDoc = await User.findById(userId)
                if (userDoc && !userDoc.lots.some(lid => toIdStr(lid) === toIdStr(property.lot))) {
                  userDoc.lots.push(property.lot)
                  await userDoc.save()
                }
              }
              for (const userId of previousIds) {
                if (!newIds.includes(userId)) {
                  await User.findByIdAndUpdate(userId, { $pull: { lots: property.lot } })
                }
              }
            }
          } else if (key === 'saleDate') {
            const val = req.body.saleDate
            property.saleDate = (val === '' || val == null) ? null : val
            property.markModified('saleDate')
          } else {
            property[key] = req.body[key]
            property.markModified(key)
          }
        }
      }

      // When lot is changed: free old lot (so it appears available again) and assign new lot
      const newLotId = property.lot ? toIdStr(property.lot) : null
      if (req.body.lot !== undefined && previousLotId && newLotId && previousLotId !== newLotId) {
        await Lot.findByIdAndUpdate(previousLotId, {
          status: 'available',
          assignedUser: null
        }, { runValidators: false })
        const previousLotObjectId = new mongoose.Types.ObjectId(previousLotId)
        await User.updateMany(
          { lots: previousLotObjectId },
          { $pull: { lots: previousLotObjectId } }
        )
        const firstOwner = (property.users && property.users.length) ? property.users[0] : null
        await Lot.findByIdAndUpdate(property.lot, {
          status: property.status === 'sold' ? 'sold' : 'pending',
          assignedUser: firstOwner || undefined
        }, { runValidators: false })
        if (firstOwner) {
          const userDoc = await User.findById(firstOwner)
          if (userDoc && !userDoc.lots.some(id => toIdStr(id) === newLotId)) {
            userDoc.lots.push(property.lot)
            await userDoc.save()
          }
          for (let i = 1; i < (property.users?.length || 0); i++) {
            const uid = property.users[i]
            const u = await User.findById(uid)
            if (u && !u.lots.some(id => toIdStr(id) === newLotId)) {
              u.lots.push(property.lot)
              await u.save()
            }
          }
        }
      }
      
      if (property.status === 'sold' && property.lot) {
        await Lot.findByIdAndUpdate(property.lot, { status: 'sold' })
      }
      
      const updatedProperty = await property.save()
      const populatedProperty = await Property.findById(updatedProperty._id)
        .populate('lot')
        .populate('model')
        .populate('facade')
        .populate('users')
        .populate({
          path: 'phases',
          options: { sort: { phaseNumber: 1 } }
        })
      
      const propertyObj = populatedProperty.toObject()
      propertyObj.totalConstructionPercentage = populatedProperty.totalConstructionPercentage || 0
      propertyObj.images = getPropertyImages(populatedProperty)
      propertyObj.blueprints = getPropertyBlueprints(populatedProperty)
      
      await hydrateUrlsInObject(propertyObj)
      res.json(propertyObj)
    } else {
      res.status(404).json({ message: 'Property not found' })
    }
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const deleteProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id)
    
    if (property) {
      await Lot.findByIdAndUpdate(property.lot, {
        $set: { status: 'available', assignedUser: null }
      }, { runValidators: false })
      
      for (const userId of property.users || []) {
        await User.findByIdAndUpdate(userId, {
          $pull: { lots: property.lot }
        })
      }
      
      await property.deleteOne()
      res.json({ message: 'Property deleted successfully' })
    } else {
      res.status(404).json({ message: 'Property not found' })
    }
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const getPropertyStats = async (req, res) => {
  try {
    const { projectId } = req.query
    const filter = {}
    if (projectId) {
      try {
        filter.project = new mongoose.Types.ObjectId(projectId)
      } catch {
        return res.status(400).json({ message: 'Invalid projectId' })
      }
    }

    const totalProperties = await Property.countDocuments(filter)
    const activeProperties = await Property.countDocuments({ ...filter, status: 'active' })
    const pendingProperties = await Property.countDocuments({ ...filter, status: 'pending' })
    const soldProperties = await Property.countDocuments({ ...filter, status: 'sold' })

    const totalRevenue = await Property.aggregate([
      { $match: { ...filter, status: { $in: ['active', 'sold'] } } },
      { $group: { _id: null, total: { $sum: '$price' } } }
    ])

    const pendingPayments = await Property.aggregate([
      { $match: { ...filter, status: { $in: ['active', 'pending'] } } },
      { $group: { _id: null, total: { $sum: '$pending' } } }
    ])

    res.json({
      total: totalProperties,
      active: activeProperties,
      pending: pendingProperties,
      sold: soldProperties,
      totalRevenue: totalRevenue[0]?.total || 0,
      pendingPayments: pendingPayments[0]?.total || 0
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}
