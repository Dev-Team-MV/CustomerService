import { Storage } from '@google-cloud/storage'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Same config as storageService
let storageConfig = {}
if (process.env.GCS_KEYFILE_PATH) {
  const keyfilePath = path.join(__dirname, '..', process.env.GCS_KEYFILE_PATH)
  if (fs.existsSync(keyfilePath)) {
    storageConfig = { keyFilename: keyfilePath, projectId: process.env.GCS_PROJECT_ID }
  }
} else if (process.env.GCS_CREDENTIALS) {
  try {
    storageConfig = {
      projectId: process.env.GCS_PROJECT_ID,
      credentials: JSON.parse(process.env.GCS_CREDENTIALS)
    }
  } catch (e) {
    console.error('Error parsing GCS_CREDENTIALS:', e.message)
  }
} else {
  storageConfig = { projectId: process.env.GCS_PROJECT_ID }
}

const storage = new Storage(storageConfig)
const bucketName = process.env.GCS_BUCKET_NAME || 'customer-service-7cc'
const bucket = storage.bucket(bucketName)

/** Prefixes to backup (dev, pdn). Backup folder is excluded. */
const SOURCE_PREFIXES = ['dev', 'pdn']
const BACKUP_PREFIX = 'backup'

/**
 * Run backup: copy all files from dev/ and pdn/ to backup/YYYY-MM-DD/ preserving structure.
 * Same filename = DB references stay valid when restoring.
 * @returns {Promise<{ success: boolean, date: string, copied: number, errors: string[] }>}
 */
export async function runBackup () {
  const date = new Date().toISOString().slice(0, 10) // YYYY-MM-DD
  const backupBase = `${BACKUP_PREFIX}/${date}`
  const errors = []
  let copied = 0

  try {
    for (const prefix of SOURCE_PREFIXES) {
      const [files] = await bucket.getFiles({ prefix: `${prefix}/` })
      for (const file of files) {
        if (!file.name || file.name.endsWith('/')) continue
        const destPath = `${backupBase}/${file.name}`
        try {
          await file.copy(bucket.file(destPath))
          copied++
        } catch (err) {
          errors.push(`${file.name}: ${err.message}`)
        }
      }
    }

    return {
      success: errors.length === 0,
      date,
      copied,
      backupPath: backupBase,
      errors: errors.length > 0 ? errors : undefined
    }
  } catch (error) {
    console.error('Backup error:', error)
    return {
      success: false,
      date,
      copied,
      errors: [error.message]
    }
  }
}

/**
 * Delete backup folders older than retentionDays.
 * @param {number} retentionDays - Keep backups from last N days (default 30)
 * @returns {Promise<{ deleted: string[], errors: string[] }>}
 */
export async function pruneOldBackups (retentionDays = 30) {
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - retentionDays)
  const cutoffStr = cutoff.toISOString().slice(0, 10)
  const [files] = await bucket.getFiles({ prefix: `${BACKUP_PREFIX}/` })
  const folders = new Set()
  for (const f of files) {
    const match = f.name.match(new RegExp(`^${BACKUP_PREFIX}/([^/]+)/`))
    if (match) folders.add(match[1])
  }
  const toDelete = [...folders].filter(d => d < cutoffStr).sort()
  const deleted = []
  const errors = []
  for (const folder of toDelete) {
    const [folderFiles] = await bucket.getFiles({ prefix: `${BACKUP_PREFIX}/${folder}/` })
    for (const file of folderFiles) {
      try {
        await file.delete()
        deleted.push(file.name)
      } catch (e) {
        errors.push(`${file.name}: ${e.message}`)
      }
    }
  }
  return { deleted, errors }
}

/**
 * Enable object versioning on the bucket.
 * @returns {Promise<{ success: boolean, message: string }>}
 */
export async function enableVersioning () {
  try {
    await bucket.setMetadata({
      versioning: { enabled: true }
    })
    return { success: true, message: 'Object versioning enabled on bucket' }
  } catch (error) {
    console.error('Enable versioning error:', error)
    return { success: false, message: error.message }
  }
}

export default { runBackup, pruneOldBackups, enableVersioning }
