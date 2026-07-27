import cron from 'node-cron'
import Document from '../models/Document.js'
import { createNotification } from './notificationService.js'

const EXPIRING_CATEGORIES = ['id_document', 'insurance', 'permit', 'deed', 'contract']

/**
 * Find documents expiring within daysAhead and notify admins.
 */
export async function scanExpiringDocuments(daysAhead = 30) {
  const days = Math.max(1, Number(daysAhead) || 30)
  const now = new Date()
  const until = new Date(now)
  until.setDate(until.getDate() + days)

  const documents = await Document.find({
    isArchived: false,
    expiresAt: { $gte: now, $lte: until },
    category: { $in: EXPIRING_CATEGORIES }
  })
    .select('title category expiresAt projectId clientId propertyId uploadedBy')
    .lean()

  if (!documents.length) {
    return { scanned: 0, notified: 0, documents: [] }
  }

  const fingerprint = `doc-expiry-${now.toISOString().slice(0, 10)}-${days}`

  await createNotification({
    title: `${documents.length} document(s) expiring within ${days} days`,
    body: documents
      .slice(0, 10)
      .map((d) => `${d.title} (${d.category}) — ${new Date(d.expiresAt).toLocaleDateString()}`)
      .join('; ') + (documents.length > 10 ? ` … +${documents.length - 10} more` : ''),
    type: 'WARN',
    audience: 'admin',
    targetRoles: ['admin', 'superadmin'],
    payload: {
      fingerprint,
      documentIds: documents.map((d) => d._id),
      daysAhead: days,
      count: documents.length
    }
  })

  return { scanned: documents.length, notified: 1, documents }
}

/**
 * Weekly scan for IDs, insurance, and other timed documents.
 * DOCUMENT_EXPIRY_CRON_ENABLED=false to disable.
 * DOCUMENT_EXPIRY_CRON default: Monday 8:00 America/Mexico_City
 * DOCUMENT_EXPIRY_DAYS_AHEAD default: 30
 */
export function startDocumentExpiryScheduler() {
  const enabled = process.env.DOCUMENT_EXPIRY_CRON_ENABLED !== 'false'
  if (!enabled) {
    console.log('[DocumentExpiry] Scheduler disabled (DOCUMENT_EXPIRY_CRON_ENABLED=false)')
    return
  }

  const cronExpr = process.env.DOCUMENT_EXPIRY_CRON || '0 8 * * 1'
  const daysAhead = Number(process.env.DOCUMENT_EXPIRY_DAYS_AHEAD) || 30

  cron.schedule(
    cronExpr,
    async () => {
      console.log('[DocumentExpiry] Running weekly expiring-document scan...')
      try {
        const result = await scanExpiringDocuments(daysAhead)
        console.log(
          `[DocumentExpiry] Done: ${result.scanned} expiring, notifications=${result.notified}`
        )
      } catch (err) {
        console.error('[DocumentExpiry] Error:', err.message)
      }
    },
    { timezone: process.env.TZ || 'America/Mexico_City' }
  )

  console.log(`[DocumentExpiry] Scheduler started (cron: ${cronExpr}, daysAhead: ${daysAhead})`)
}
