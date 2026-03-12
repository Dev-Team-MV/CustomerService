import { runBackup, pruneOldBackups, enableVersioning } from '../services/backupService.js'

/**
 * POST /api/backup/run - Trigger backup manually (Admin only)
 */
export const runManualBackup = async (req, res) => {
  try {
    const result = await runBackup()
    res.status(result.success ? 200 : 207).json({
      success: result.success,
      message: result.success
        ? `Backup completed: ${result.copied} files copied to backup/${result.date}`
        : `Backup completed with errors: ${result.copied} copied`,
      data: result
    })
  } catch (error) {
    console.error('Manual backup error:', error)
    res.status(500).json({ success: false, message: error.message })
  }
}

/**
 * POST /api/backup/enable-versioning - Enable object versioning on bucket (Admin only)
 */
export const enableBucketVersioning = async (req, res) => {
  try {
    const result = await enableVersioning()
    res.status(result.success ? 200 : 500).json(result)
  } catch (error) {
    console.error('Enable versioning error:', error)
    res.status(500).json({ success: false, message: error.message })
  }
}
