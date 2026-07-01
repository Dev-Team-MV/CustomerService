import Phase from '../models/Phase.js'
import UnderConstruction from '../models/UnderConstruction.js'
import Property from '../models/Property.js'
import Apartment from '../models/Apartment.js'
import ApartmentModel from '../models/ApartmentModel.js'
import Building from '../models/Building.js'
import Payload from '../models/Payload.js'
import Lead, { LEAD_STAGES } from '../models/Lead.js'
import {
  buildDateRangeFilter,
  enrichPayloadsForCrm,
  getMonthBounds,
  isValidObjectId,
  resolvePayloadScopeByProject
} from '../utils/crmHelpers.js'

// ─── CSV / export helpers ───────────────────────────────────────────────────

export function escapeCsvCell(value) {
  const str = value == null ? '' : String(value)
  if (/[",\n\r]/.test(str)) return `"${str.replace(/"/g, '""')}"`
  return str
}

export function buildCsvBuffer(columns, rows) {
  const headerLine = columns.map((col) => escapeCsvCell(col.header)).join(',')
  const dataLines = rows.map((row) =>
    columns.map((col) => escapeCsvCell(row[col.key])).join(',')
  )
  return Buffer.from([headerLine, ...dataLines].join('\r\n'), 'utf-8')
}

export function parseExportFormat(format) {
  const normalized = (format || 'json').toLowerCase()
  return normalized === 'csv' ? 'csv' : 'json'
}

export function sendExportResponse(res, { format, filename, columns, rows, jsonPayload }) {
  if (format === 'csv') {
    res.setHeader('Content-Type', 'text/csv; charset=utf-8')
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
    return res.send(buildCsvBuffer(columns, rows))
  }
  return res.json(jsonPayload)
}

function projectLabel(project) {
  if (!project) return ''
  return project.title?.en || project.name || project.slug || ''
}

function userFullName(user) {
  if (!user) return ''
  return [user.firstName, user.lastName].filter(Boolean).join(' ').trim()
}

// ─── Clients export ─────────────────────────────────────────────────────────

const CLIENT_EXPORT_COLUMNS = [
  { key: 'nombre', header: 'nombre' },
  { key: 'email', header: 'email' },
  { key: 'telefono', header: 'telefono' },
  { key: 'proyectos', header: 'proyecto(s)' },
  { key: 'propiedades', header: 'propiedades' },
  { key: 'montoTotal', header: 'monto total' },
  { key: 'pendiente', header: 'pendiente' }
]

export async function buildCrmClientsExportRows(projectId) {
  const userMap = new Map()

  const propertyFilter = projectId ? { project: projectId } : {}
  const properties = await Property.find(propertyFilter)
    .populate('lot', 'number')
    .populate('project', 'name slug title')
    .populate('users', 'firstName lastName email phoneNumber')
    .select('users lot project price pending')
    .lean()

  for (const property of properties) {
    const lotLabel = property.lot?.number ? `Lot ${property.lot.number}` : 'Lot ?'
    const projName = projectLabel(property.project)

    for (const user of property.users || []) {
      const uid = String(user._id)
      if (!userMap.has(uid)) {
        userMap.set(uid, {
          user,
          projectNames: new Set(),
          propertyLabels: [],
          montoTotal: 0,
          pendiente: 0
        })
      }
      const entry = userMap.get(uid)
      if (projName) entry.projectNames.add(projName)
      entry.propertyLabels.push(lotLabel)
      entry.montoTotal += Number(property.price || 0)
      entry.pendiente += Number(property.pending || 0)
    }
  }

  let apartmentFilter = {}
  if (projectId) {
    const buildings = await Building.find({ project: projectId }).select('_id').lean()
    const buildingIds = buildings.map((b) => b._id)
    const models = buildingIds.length
      ? await ApartmentModel.find({ building: { $in: buildingIds } }).select('_id').lean()
      : []
    apartmentFilter = { apartmentModel: { $in: models.map((m) => m._id) } }
  }

  const apartments = await Apartment.find(apartmentFilter)
    .populate({
      path: 'building',
      select: 'name project',
      populate: { path: 'project', select: 'name slug title' }
    })
    .populate('users', 'firstName lastName email phoneNumber')
    .select('users apartmentNumber building price pending')
    .lean()

  for (const apartment of apartments) {
    const aptLabel = apartment.apartmentNumber ? `Apt ${apartment.apartmentNumber}` : 'Apt ?'
    const projName = projectLabel(apartment.building?.project)

    for (const user of apartment.users || []) {
      const uid = String(user._id)
      if (!userMap.has(uid)) {
        userMap.set(uid, {
          user,
          projectNames: new Set(),
          propertyLabels: [],
          montoTotal: 0,
          pendiente: 0
        })
      }
      const entry = userMap.get(uid)
      if (projName) entry.projectNames.add(projName)
      entry.propertyLabels.push(aptLabel)
      entry.montoTotal += Number(apartment.price || 0)
      entry.pendiente += Number(apartment.pending || 0)
    }
  }

  return [...userMap.values()]
    .map((entry) => ({
      nombre: userFullName(entry.user),
      email: entry.user.email || '',
      telefono: entry.user.phoneNumber || '',
      proyectos: [...entry.projectNames].join('; '),
      propiedades: entry.propertyLabels.join('; '),
      montoTotal: entry.montoTotal,
      pendiente: entry.pendiente
    }))
    .sort((a, b) => a.nombre.localeCompare(b.nombre))
}

// ─── Payments export ────────────────────────────────────────────────────────

const PAYMENT_EXPORT_COLUMNS = [
  { key: 'cliente', header: 'cliente' },
  { key: 'proyecto', header: 'proyecto' },
  { key: 'lote', header: 'lote' },
  { key: 'monto', header: 'monto' },
  { key: 'fechaPago', header: 'fecha pago' },
  { key: 'estado', header: 'estado' }
]

export async function buildCrmPaymentsExportRows({ projectId, dateFrom, dateTo }) {
  const filter = { ...buildDateRangeFilter(dateFrom, dateTo) }
  if (projectId) {
    Object.assign(filter, await resolvePayloadScopeByProject(projectId))
  }

  const payloads = await Payload.find(filter).sort({ date: -1 }).lean()
  const enriched = await enrichPayloadsForCrm(payloads)

  return enriched.map((p) => ({
    cliente: p.clientName || '',
    proyecto: p.projectName || '',
    lote: p.unitLabel || '',
    monto: p.amount,
    fechaPago: p.date ? new Date(p.date).toISOString().split('T')[0] : '',
    estado: p.status || ''
  }))
}

// ─── Leads export ───────────────────────────────────────────────────────────

const LEAD_EXPORT_COLUMNS = [
  { key: 'nombre', header: 'nombre' },
  { key: 'email', header: 'email' },
  { key: 'telefono', header: 'telefono' },
  { key: 'source', header: 'source' },
  { key: 'stage', header: 'stage' },
  { key: 'proyecto', header: 'proyecto' },
  { key: 'asesor', header: 'asesor' },
  { key: 'notas', header: 'notas' },
  { key: 'lostReason', header: 'lost reason' },
  { key: 'createdAt', header: 'fecha creacion' }
]

export async function buildCrmLeadsExportRows({ projectId, stage, assignedTo, fromDate, toDate }) {
  const filter = {}
  if (projectId) filter.projectId = projectId
  if (stage) filter.stage = stage
  if (assignedTo) filter.assignedTo = assignedTo
  if (fromDate || toDate) {
    filter.createdAt = {}
    if (fromDate) filter.createdAt.$gte = new Date(fromDate)
    if (toDate) filter.createdAt.$lte = new Date(toDate)
  }

  const leads = await Lead.find(filter)
    .populate('projectId', 'name slug title')
    .populate('assignedTo', 'firstName lastName email')
    .sort({ createdAt: -1 })
    .lean()

  return leads.map((lead) => ({
    nombre: lead.name || '',
    email: lead.email || '',
    telefono: lead.phone || '',
    source: lead.source || '',
    stage: lead.stage || '',
    proyecto: projectLabel(lead.projectId),
    asesor: userFullName(lead.assignedTo) || lead.assignedTo?.email || '',
    notas: lead.notes || '',
    lostReason: lead.lostReason || '',
    createdAt: lead.createdAt ? new Date(lead.createdAt).toISOString().split('T')[0] : ''
  }))
}

// ─── HTTP handlers ────────────────────────────────────────────────────────────

export const exportCrmClients = async (req, res) => {
  try {
    const { projectId } = req.query
    const format = parseExportFormat(req.query.format)

    if (projectId && !isValidObjectId(projectId)) {
      return res.status(400).json({ message: 'Invalid projectId' })
    }

    const rows = await buildCrmClientsExportRows(projectId)
    return sendExportResponse(res, {
      format,
      filename: 'crm-clientes.csv',
      columns: CLIENT_EXPORT_COLUMNS,
      rows,
      jsonPayload: { rows, total: rows.length, columns: CLIENT_EXPORT_COLUMNS.map((c) => c.header) }
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const exportCrmPayments = async (req, res) => {
  try {
    const { projectId, dateFrom, dateTo } = req.query
    const format = parseExportFormat(req.query.format)

    if (!dateFrom || !dateTo) {
      return res.status(400).json({ message: 'dateFrom and dateTo are required' })
    }

    if (projectId && !isValidObjectId(projectId)) {
      return res.status(400).json({ message: 'Invalid projectId' })
    }

    const rows = await buildCrmPaymentsExportRows({ projectId, dateFrom, dateTo })
    return sendExportResponse(res, {
      format,
      filename: 'crm-pagos.csv',
      columns: PAYMENT_EXPORT_COLUMNS,
      rows,
      jsonPayload: { rows, total: rows.length, columns: PAYMENT_EXPORT_COLUMNS.map((c) => c.header) }
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const exportCrmLeads = async (req, res) => {
  try {
    const { projectId, stage, assignedTo, fromDate, toDate } = req.query
    const format = parseExportFormat(req.query.format)

    if (projectId && !isValidObjectId(projectId)) {
      return res.status(400).json({ message: 'Invalid projectId' })
    }
    if (assignedTo && !isValidObjectId(assignedTo)) {
      return res.status(400).json({ message: 'Invalid assignedTo' })
    }
    if (stage && !LEAD_STAGES.includes(stage)) {
      return res.status(400).json({ message: `Invalid stage. Allowed: ${LEAD_STAGES.join(', ')}` })
    }

    const rows = await buildCrmLeadsExportRows({ projectId, stage, assignedTo, fromDate, toDate })
    return sendExportResponse(res, {
      format,
      filename: 'crm-leads.csv',
      columns: LEAD_EXPORT_COLUMNS,
      rows,
      jsonPayload: { rows, total: rows.length, columns: LEAD_EXPORT_COLUMNS.map((c) => c.header) }
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// ─── Upload tracker (existing) ───────────────────────────────────────────────

export const getUploadTracker = async (req, res) => {
  try {
    const { startDate, endDate, types = 'properties,masterplan' } = req.query

    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'startDate and endDate are required' })
    }

    const start = new Date(startDate)
    start.setUTCHours(0, 0, 0, 0)
    const end = new Date(endDate)
    end.setUTCHours(23, 59, 59, 999)

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({ message: 'Invalid date format' })
    }

    const typeList = types.split(',').map((t) => t.trim())
    const result = {}

    if (typeList.includes('properties')) {
      const phases = await Phase.find({
        property: { $exists: true, $ne: null },
        'mediaItems.uploadedAt': { $gte: start, $lte: end }
      }).populate({
        path: 'property',
        select: 'lot model',
        populate: [
          { path: 'lot', select: 'number' },
          { path: 'model', select: 'model' }
        ]
      })

      const propertyMap = {}

      for (const phase of phases) {
        if (!phase.property) continue

        const prop = phase.property
        const propId = prop._id.toString()

        if (!propertyMap[propId]) {
          const lotNum = prop.lot?.number || '?'
          const modelName = prop.model?.model || '?'
          propertyMap[propId] = {
            id: propId,
            label: `Lot ${lotNum} - ${modelName}`,
            dates: {},
            media: {}
          }
        }

        for (const item of phase.mediaItems) {
          if (!item.uploadedAt) continue
          const d = new Date(item.uploadedAt)
          if (d < start || d > end) continue
          const dateKey = d.toISOString().split('T')[0]
          propertyMap[propId].dates[dateKey] = (propertyMap[propId].dates[dateKey] || 0) + 1
          if (!propertyMap[propId].media[dateKey]) propertyMap[propId].media[dateKey] = []
          propertyMap[propId].media[dateKey].push({
            type: item.mediaType || 'image',
            url: item.url,
            name: item.title || ''
          })
        }
      }

      result.properties = Object.values(propertyMap).sort((a, b) => a.label.localeCompare(b.label))
    }

    if (typeList.includes('masterplan')) {
      const allItems = await UnderConstruction.find({}, 'title _id').lean()

      const masterplan = []
      for (const item of allItems) {
        const parsed = new Date(item.title)
        if (isNaN(parsed.getTime())) continue
        parsed.setUTCHours(0, 0, 0, 0)
        if (parsed < start || parsed > end) continue
        masterplan.push({
          id: item._id.toString(),
          title: item.title,
          date: parsed.toISOString().split('T')[0]
        })
      }

      masterplan.sort((a, b) => a.date.localeCompare(b.date))
      result.masterplan = masterplan
    }

    res.json(result)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}
