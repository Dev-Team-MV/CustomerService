import mongoose from 'mongoose'
import AuditLog from '../models/AuditLog.js'

export function getClientIp(req) {
  const forwarded = req.headers['x-forwarded-for']
  if (forwarded) return String(forwarded).split(',')[0].trim()
  return req.ip || req.socket?.remoteAddress || null
}

function sanitizeDoc(doc) {
  if (!doc) return null
  return doc?.toObject ? doc.toObject() : { ...doc }
}

export async function writeAuditLog({ userId, action, entity, entityId, changes = {}, ip }) {
  if (!userId || !action || !entity || !entityId) return

  try {
    await AuditLog.create({
      userId,
      action,
      entity,
      entityId,
      changes: {
        before: changes.before ?? null,
        after: changes.after ?? null
      },
      ip: ip || null,
      timestamp: new Date()
    })
  } catch (err) {
    console.error('[audit] Failed to write log:', err.message)
  }
}

/**
 * Middleware factory for automatic audit logging on successful mutations.
 */
export function logAction({ action, entity, getEntityId, fetchBefore, buildAfter }) {
  return async (req, res, next) => {
    let before = null

    try {
      if (fetchBefore) {
        before = sanitizeDoc(await fetchBefore(req))
      }
    } catch (err) {
      console.error('[audit] fetchBefore error:', err.message)
    }

    const originalJson = res.json.bind(res)
    const originalStatus = res.status.bind(res)
    let statusCode = res.statusCode || 200

    res.status = function (code) {
      statusCode = code
      return originalStatus(code)
    }

    res.json = function (body) {
      if (statusCode >= 200 && statusCode < 300 && req.user?._id) {
        const entityId = getEntityId
          ? getEntityId(req, body)
          : req.params.id || body?._id

        if (entityId && mongoose.Types.ObjectId.isValid(String(entityId))) {
          const after = buildAfter ? buildAfter(req, body) : sanitizeDoc(body)

          writeAuditLog({
            userId: req.user._id,
            action,
            entity,
            entityId,
            changes: { before, after },
            ip: getClientIp(req)
          })
        }
      }

      return originalJson(body)
    }

    next()
  }
}
