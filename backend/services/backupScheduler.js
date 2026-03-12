import cron from 'node-cron'
import { runBackup, pruneOldBackups } from './backupService.js'

/**
 * Start automatic GCS backup scheduler.
 * Set GCS_BACKUP_ENABLED=true and optionally GCS_BACKUP_CRON, GCS_BACKUP_RETENTION_DAYS.
 */
export function startBackupScheduler () {
  if (process.env.GCS_BACKUP_ENABLED !== 'true') {
    console.log('[Backup] Automatic backups disabled (GCS_BACKUP_ENABLED != true)')
    return
  }

  const cronExpr = process.env.GCS_BACKUP_CRON || '0 2 * * *' // 2:00 AM daily
  const retentionDays = parseInt(process.env.GCS_BACKUP_RETENTION_DAYS || '30', 10)

  const job = async () => {
    console.log('[Backup] Running scheduled backup...')
    try {
      const result = await runBackup()
      if (result.success) {
        console.log(`[Backup] Done: ${result.copied} files → backup/${result.date}`)
      } else {
        console.error('[Backup] Completed with errors:', result.errors)
      }
      // Prune old backups
      const prune = await pruneOldBackups(retentionDays)
      if (prune.deleted.length > 0) {
        console.log(`[Backup] Pruned ${prune.deleted.length} old backup files`)
      }
    } catch (err) {
      console.error('[Backup] Error:', err.message)
    }
  }

  cron.schedule(cronExpr, job, { timezone: process.env.TZ || 'America/Mexico_City' })
  console.log(`[Backup] Scheduler started (cron: ${cronExpr}, retention: ${retentionDays} days)`)
}
