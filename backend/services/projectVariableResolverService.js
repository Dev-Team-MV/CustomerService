import mongoose from 'mongoose'
import Project from '../models/Project.js'
import User from '../models/User.js'
import Lead from '../models/Lead.js'
import Property from '../models/Property.js'
import Lot from '../models/Lot.js'
import Building from '../models/Building.js'
import Apartment from '../models/Apartment.js'
import ApartmentModel from '../models/ApartmentModel.js'
import ProjectVariable from '../models/ProjectVariable.js'
import { getPathValue } from './templateRenderService.js'

export function resolveEffectiveProjectId({
  requestProjectId,
  templateProjectId,
  campaignProjectId
} = {}) {
  const id = campaignProjectId || requestProjectId || templateProjectId
  if (!id) return null
  return String(id)
}

function formatVariableValue(value) {
  if (value === null || value === undefined) return undefined
  if (value instanceof Date) return value.toISOString().split('T')[0]
  if (typeof value === 'object') {
    if (value._id) return String(value._id)
    if (value.en !== undefined || value.es !== undefined) {
      return value.es || value.en || ''
    }
    return JSON.stringify(value)
  }
  return String(value)
}

async function loadApartmentContextForUser(projectId, userId, context) {
  const buildingIds = await Building.find({ project: projectId }).distinct('_id')
  if (!buildingIds.length) return

  const apartmentModelIds = await ApartmentModel.find({
    building: { $in: buildingIds }
  }).distinct('_id')

  const apartmentFilter = {
    users: userId,
    $or: [
      { building: { $in: buildingIds } },
      ...(apartmentModelIds.length ? [{ apartmentModel: { $in: apartmentModelIds } }] : [])
    ]
  }

  const apartment = await Apartment.findOne(apartmentFilter)
    .populate({
      path: 'building',
      select: 'name section floors status totalApartments availabilityStatus project'
    })
    .populate({
      path: 'apartmentModel',
      select: 'name modelNumber sqft bedrooms bathrooms apartmentCount status building',
      populate: {
        path: 'building',
        select: 'name section floors status totalApartments availabilityStatus project'
      }
    })
    .lean()

  if (!apartment) return

  context.apartment = apartment

  if (apartment.building && typeof apartment.building === 'object') {
    context.building = apartment.building
  }

  if (apartment.apartmentModel && typeof apartment.apartmentModel === 'object') {
    context.apartmentModel = apartment.apartmentModel
    if (
      !context.building &&
      apartment.apartmentModel.building &&
      typeof apartment.apartmentModel.building === 'object'
    ) {
      context.building = apartment.apartmentModel.building
    }
  }
}

export async function buildRecipientContext({ projectId, userId, leadId } = {}) {
  const context = {}

  if (projectId && mongoose.Types.ObjectId.isValid(projectId)) {
    const project = await Project.findById(projectId)
      .select('name slug phase status location area type title subtitle')
      .lean()
    if (project) context.project = project
  }

  if (userId && mongoose.Types.ObjectId.isValid(userId)) {
    const user = await User.findById(userId)
      .select('firstName lastName email phoneNumber role birthday isActive')
      .lean()

    if (user) {
      context.user = user
      context.client = user
    }

    if (projectId && mongoose.Types.ObjectId.isValid(projectId)) {
      const property = await Property.findOne({ project: projectId, users: userId })
        .populate({ path: 'lot', select: 'number price status color model' })
        .populate({
          path: 'model',
          select: 'model modelNumber price bedrooms bathrooms sqft stories description status'
        })
        .populate({ path: 'facade', select: 'title price' })
        .lean()

      if (property) {
        context.property = property
        if (property.lot && typeof property.lot === 'object') context.lot = property.lot
        if (property.model && typeof property.model === 'object') context.model = property.model
        if (property.facade && typeof property.facade === 'object') context.facade = property.facade
      }

      if (!context.lot) {
        const lot = await Lot.findOne({ project: projectId, assignedUser: userId })
          .populate({
            path: 'model',
            select: 'model modelNumber price bedrooms bathrooms sqft stories description status'
          })
          .lean()

        if (lot) {
          context.lot = lot
          if (lot.model && typeof lot.model === 'object') context.model = lot.model
        }
      }

      await loadApartmentContextForUser(projectId, userId, context)
    }
  }

  if (leadId && mongoose.Types.ObjectId.isValid(leadId)) {
    const lead = await Lead.findById(leadId)
      .select('name phone email source stage notes projectId')
      .lean()
    if (lead) context.lead = lead
  }

  return context
}

export async function resolveProjectVariables(projectId, context, { manualVariables = {} } = {}) {
  const merged = { ...manualVariables }

  if (!projectId || !mongoose.Types.ObjectId.isValid(projectId)) {
    return merged
  }

  const definitions = await ProjectVariable.find({ project: projectId }).lean()

  for (const def of definitions) {
    if (merged[def.name] !== undefined && merged[def.name] !== null && merged[def.name] !== '') {
      continue
    }

    const raw = getPathValue(context, def.recorrido)
    const formatted = formatVariableValue(raw)
    if (formatted !== undefined) {
      merged[def.name] = formatted
    }
  }

  return merged
}

export async function resolveVariablesForSend({
  projectId,
  templateProjectId,
  campaignProjectId,
  userId,
  leadId,
  manualVariables = {}
} = {}) {
  const effectiveProjectId = resolveEffectiveProjectId({
    requestProjectId: projectId,
    templateProjectId,
    campaignProjectId
  })

  const context = await buildRecipientContext({
    projectId: effectiveProjectId,
    userId,
    leadId
  })

  return {
    effectiveProjectId,
    variables: await resolveProjectVariables(effectiveProjectId, context, { manualVariables })
  }
}

export async function findUnknownTemplatePlaceholders(projectId, placeholders = []) {
  if (!projectId || !mongoose.Types.ObjectId.isValid(projectId) || !placeholders.length) {
    return []
  }

  const definitions = await ProjectVariable.find({ project: projectId }).select('name').lean()
  const defined = new Set(definitions.map((item) => item.name))

  return placeholders.filter((placeholder) => !defined.has(placeholder))
}

export function assertTemplateProjectMatch(templateProjectId, audienceProjectId) {
  if (!templateProjectId || !audienceProjectId) return null
  if (String(templateProjectId) !== String(audienceProjectId)) {
    return 'Template project does not match campaign audience project'
  }
  return null
}
