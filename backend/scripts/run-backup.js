/**
 * Run GCS backup manually (CLI).
 * Run: node scripts/run-backup.js
 * Requires: .env with GCS credentials
 */
import '../config/env.js'
import { runBackup, pruneOldBackups } from '../services/backupService.js'

async function main () {
  console.log('Running GCS backup...')
  const result = await runBackup()
  if (result.success) {
    console.log(`✓ Backup done: ${result.copied} files → backup/${result.date}`)
  } else {
    console.log(`⚠ Backup completed with errors: ${result.copied} copied`)
    if (result.errors) result.errors.forEach(e => console.error('  -', e))
  }
  const retention = parseInt(process.env.GCS_BACKUP_RETENTION_DAYS || '30', 10)
  const prune = await pruneOldBackups(retention)
  if (prune.deleted.length > 0) {
    console.log(`✓ Pruned ${prune.deleted.length} old backup files`)
  }
}

main().catch(err => {
  console.error('Error:', err.message)
  process.exit(1)
})
