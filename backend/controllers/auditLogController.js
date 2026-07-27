import AuditLog, { AUDIT_ACTIONS, AUDIT_ENTITIES } from '../models/AuditLog.js'
import {
  buildPaginationMeta,
  isValidObjectId,
  parsePagination
} from '../utils/crmHelpers.js'

function buildAuditFilter(query) {
  const { entity, entityId, userId, action, dateFrom, dateTo } = query
  const filter = {}

  if (entity) {
    if (!AUDIT_ENTITIES.includes(entity)) {
      return { error: `Invalid entity. Allowed: ${AUDIT_ENTITIES.join(', ')}` }
    }
    filter.entity = entity
  }

  if (entityId) {
    if (!isValidObjectId(entityId)) return { error: 'Invalid entityId' }
    filter.entityId = entityId
  }

  if (userId) {
    if (!isValidObjectId(userId)) return { error: 'Invalid userId' }
    filter.userId = userId
  }

  if (action) {
    if (!AUDIT_ACTIONS.includes(action)) {
      return { error: `Invalid action. Allowed: ${AUDIT_ACTIONS.join(', ')}` }
    }
    filter.action = action
  }

  if (dateFrom || dateTo) {
    filter.timestamp = {}
    if (dateFrom) filter.timestamp.$gte = new Date(dateFrom)
    if (dateTo) filter.timestamp.$lte = new Date(dateTo)
  }

  return { filter }
}

export const getAuditLogs = async (req, res) => {
  try {
    const { filter, error } = buildAuditFilter(req.query)
    if (error) return res.status(400).json({ message: error })

    const { page, limit, skip } = parsePagination(req.query)

    const [total, logs] = await Promise.all([
      AuditLog.countDocuments(filter),
      AuditLog.find(filter)
        .populate('userId', 'firstName lastName email role')
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limit)
        .lean()
    ])

    res.json({
      logs,
      pagination: buildPaginationMeta(total, page, limit)
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}
