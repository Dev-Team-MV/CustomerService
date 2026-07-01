import mongoose from 'mongoose'
import User from '../models/User.js'
import Lead from '../models/Lead.js'
import Activity from '../models/Activity.js'
import Project from '../models/Project.js'
import Property from '../models/Property.js'
import Apartment from '../models/Apartment.js'

const SEARCH_TYPES = ['clients', 'leads', 'activities', 'projects']
const MAX_PER_TYPE = 5
const MIN_QUERY_LENGTH = 2

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function parseTypes(typesParam) {
  if (!typesParam) return [...SEARCH_TYPES]
  const parsed = typesParam
    .split(',')
    .map((t) => t.trim().toLowerCase())
    .filter((t) => SEARCH_TYPES.includes(t))
  return parsed.length ? parsed : [...SEARCH_TYPES]
}

async function getClientUserIds() {
  const [propertyUserIds, apartmentUserIds] = await Promise.all([
    Property.distinct('users'),
    Apartment.distinct('users')
  ])
  return [...new Set([...propertyUserIds, ...apartmentUserIds].map(String))]
}

function formatUserLabel(user) {
  return [user.firstName, user.lastName].filter(Boolean).join(' ').trim() || user.email
}

async function searchWithTextOrRegex(Model, textQuery, regexFilter, projection, sort, limit, mapFn) {
  try {
    const textResults = await Model.find(textQuery, { score: { $meta: 'textScore' } })
      .select(projection)
      .sort({ score: { $meta: 'textScore' } })
      .limit(limit)
      .lean()
    if (textResults.length > 0) return textResults.map(mapFn)
  } catch {
    // text index may be unavailable during rollout
  }

  const regexResults = await Model.find(regexFilter)
    .select(projection)
    .sort(sort)
    .limit(limit)
    .lean()

  return regexResults.map(mapFn)
}

async function searchClients(q, regex) {
  const clientIds = await getClientUserIds()
  if (!clientIds.length) return []

  const objectIds = clientIds
    .filter((id) => mongoose.Types.ObjectId.isValid(id))
    .map((id) => new mongoose.Types.ObjectId(id))

  const baseFilter = { _id: { $in: objectIds }, isActive: { $ne: false } }
  const textQuery = { ...baseFilter, $text: { $search: q } }
  const regexFilter = {
    ...baseFilter,
    $or: [
      { firstName: regex },
      { lastName: regex },
      { email: regex },
      { phoneNumber: regex }
    ]
  }

  return searchWithTextOrRegex(
    User,
    textQuery,
    regexFilter,
    'firstName lastName email phoneNumber',
    { lastName: 1, firstName: 1 },
    MAX_PER_TYPE,
    (user) => ({
      _id: user._id,
      label: formatUserLabel(user),
      subtitle: user.email || user.phoneNumber || '',
      type: 'clients',
      url: `/clients/${user._id}`
    })
  )
}

async function searchLeads(q, regex) {
  const textQuery = { $text: { $search: q } }
  const regexFilter = {
    $or: [{ name: regex }, { email: regex }, { phone: regex }]
  }

  return searchWithTextOrRegex(
    Lead,
    textQuery,
    regexFilter,
    'name email phone stage source projectId',
    { updatedAt: -1 },
    MAX_PER_TYPE,
    (lead) => ({
      _id: lead._id,
      label: lead.name,
      subtitle: [lead.email, lead.stage].filter(Boolean).join(' · '),
      type: 'leads',
      url: `/sales?leadId=${lead._id}`
    })
  )
}

async function searchActivities(q, regex) {
  const textQuery = { $text: { $search: q } }
  const regexFilter = { title: regex }

  const rows = await searchWithTextOrRegex(
    Activity,
    textQuery,
    regexFilter,
    'title description dueDate projectId status',
    { updatedAt: -1 },
    MAX_PER_TYPE,
    (activity) => activity
  )

  const projectIds = [...new Set(rows.map((a) => a.projectId).filter(Boolean).map(String))]
  const projects = projectIds.length
    ? await Project.find({ _id: { $in: projectIds } }).select('name slug title').lean()
    : []
  const projectMap = new Map(
    projects.map((p) => [String(p._id), p.title?.en || p.name || p.slug])
  )

  return rows.map((activity) => ({
    _id: activity._id,
    label: activity.title,
    subtitle:
      projectMap.get(String(activity.projectId)) ||
      (activity.dueDate
        ? `Vence ${new Date(activity.dueDate).toISOString().split('T')[0]}`
        : activity.description?.slice(0, 60) || ''),
    type: 'activities',
    url: `/activities?activityId=${activity._id}`
  }))
}

async function searchProjects(q, regex) {
  const textQuery = { $text: { $search: q } }
  const regexFilter = {
    $or: [
      { name: regex },
      { slug: regex },
      { 'title.en': regex },
      { 'title.es': regex }
    ]
  }

  return searchWithTextOrRegex(
    Project,
    textQuery,
    regexFilter,
    'name slug title location',
    { name: 1 },
    MAX_PER_TYPE,
    (project) => ({
      _id: project._id,
      label: project.title?.en || project.name || project.slug,
      subtitle: project.slug || project.location || '',
      type: 'projects',
      url: `/projects/${project._id}`
    })
  )
}

const SEARCH_HANDLERS = {
  clients: searchClients,
  leads: searchLeads,
  activities: searchActivities,
  projects: searchProjects
}

export const searchCrm = async (req, res) => {
  try {
    const q = (req.query.q || '').trim()
    const types = parseTypes(req.query.types)

    if (q.length < MIN_QUERY_LENGTH) {
      return res.json({
        q,
        results: Object.fromEntries(types.map((t) => [t, []])),
        total: 0
      })
    }

    const regex = new RegExp(escapeRegex(q), 'i')

    const entries = await Promise.all(
      types.map(async (type) => {
        const items = await SEARCH_HANDLERS[type](q, regex)
        return [type, items]
      })
    )

    const results = Object.fromEntries(entries)
    const total = entries.reduce((sum, [, items]) => sum + items.length, 0)

    res.json({ q, results, total })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}
