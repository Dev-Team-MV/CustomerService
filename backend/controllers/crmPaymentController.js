import Payload from '../models/Payload.js'
import Project from '../models/Project.js'
import {
  buildCrmPaymentStatusFilter,
  buildDateRangeFilter,
  buildPaginationMeta,
  enrichPayloadsForCrm,
  getMonthBounds,
  parsePagination,
  resolvePayloadScopeByProject
} from '../utils/crmHelpers.js'

function accumulateByProject(enrichedPayloads, onEntry) {
  for (const payload of enrichedPayloads) {
    const projectId = payload.projectId ? String(payload.projectId) : null
    if (!projectId) continue
    onEntry(projectId, payload)
  }
}

export const getCrmPayments = async (req, res) => {
  try {
    const { projectId, status, dateFrom, dateTo } = req.query
    const { page, limit, skip } = parsePagination(req.query)

    const filter = {
      ...buildCrmPaymentStatusFilter(status),
      ...buildDateRangeFilter(dateFrom, dateTo)
    }

    if (projectId) {
      const scope = await resolvePayloadScopeByProject(projectId)
      if (scope._id === null) {
        return res.json({
          payments: [],
          pagination: buildPaginationMeta(0, page, limit)
        })
      }
      Object.assign(filter, scope)
    }

    const [total, payloads] = await Promise.all([
      Payload.countDocuments(filter),
      Payload.find(filter).sort({ date: -1 }).skip(skip).limit(limit).lean()
    ])

    const payments = await enrichPayloadsForCrm(payloads)

    res.json({
      payments,
      pagination: buildPaginationMeta(total, page, limit)
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const getCrmPaymentsSummary = async (req, res) => {
  try {
    const { start: monthStart, end: monthEnd } = getMonthBounds()
    const now = new Date()

    const projects = await Project.find({ isActive: true }).select('_id name slug title').lean()
    const pendingByProject = new Map(projects.map((p) => [String(p._id), 0]))
    const overdueByProject = new Map(
      projects.map((p) => [String(p._id), { count: 0, amount: 0 }])
    )

    let globalPending = 0
    let globalOverdueCount = 0
    let globalOverdueAmount = 0
    let monthCollected = 0
    let monthExpected = 0

    const [pendingPayloads, overduePayloads, monthPayloads] = await Promise.all([
      Payload.find({ status: 'pending' }).lean(),
      Payload.find({ status: { $ne: 'signed' }, date: { $lt: now } }).lean(),
      Payload.find({
        date: { $gte: monthStart, $lte: monthEnd },
        status: { $ne: 'rejected' }
      }).lean()
    ])

    const [pendingEnriched, overdueEnriched] = await Promise.all([
      enrichPayloadsForCrm(pendingPayloads),
      enrichPayloadsForCrm(overduePayloads)
    ])

    accumulateByProject(pendingEnriched, (projectId, payload) => {
      const amount = Number(payload.amount || 0)
      pendingByProject.set(projectId, (pendingByProject.get(projectId) || 0) + amount)
      globalPending += amount
    })

    accumulateByProject(overdueEnriched, (projectId, payload) => {
      const amount = Number(payload.amount || 0)
      const entry = overdueByProject.get(projectId) || { count: 0, amount: 0 }
      entry.count += 1
      entry.amount += amount
      overdueByProject.set(projectId, entry)
      globalOverdueCount += 1
      globalOverdueAmount += amount
    })

    for (const payload of monthPayloads) {
      const amount = Number(payload.amount || 0)
      monthExpected += amount
      if (payload.status === 'signed') monthCollected += amount
    }

    const byProject = projects.map(({ _id, name, slug, title }) => {
      const id = String(_id)
      const overdue = overdueByProject.get(id) || { count: 0, amount: 0 }
      return {
        projectId: id,
        name: title?.en || name || slug || 'Project',
        totalPending: pendingByProject.get(id) || 0,
        overdueCount: overdue.count,
        overdueAmount: overdue.amount
      }
    })

    res.json({
      byProject,
      global: {
        totalPending: globalPending,
        overdueCount: globalOverdueCount,
        overdueAmount: globalOverdueAmount
      },
      currentMonth: {
        collected: monthCollected,
        expected: monthExpected,
        collectionRate: monthExpected > 0
          ? Math.round((monthCollected / monthExpected) * 1000) / 10
          : 0,
        monthStart,
        monthEnd
      }
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}
