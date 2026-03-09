import { Storage } from '@google-cloud/storage'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Inicializar Google Cloud Storage
let storageConfig = {}

// Opción 1: Usar credenciales desde archivo JSON (recomendado para producción)
if (process.env.GCS_KEYFILE_PATH) {
  const keyfilePath = path.join(__dirname, '..', process.env.GCS_KEYFILE_PATH)
  if (fs.existsSync(keyfilePath)) {
    storageConfig = {
      keyFilename: keyfilePath,
      projectId: process.env.GCS_PROJECT_ID
    }
  }
}
// Opción 2: Usar credenciales desde variables de entorno (recomendado para desarrollo)
else if (process.env.GCS_CREDENTIALS) {
  try {
    storageConfig = {
      projectId: process.env.GCS_PROJECT_ID,
      credentials: JSON.parse(process.env.GCS_CREDENTIALS)
    }
  } catch (error) {
    console.error('Error parsing GCS_CREDENTIALS:', error.message)
  }
}
// Opción 3: Usar Application Default Credentials (ADC) - para Google Cloud Run/App Engine
else {
  storageConfig = {
    projectId: process.env.GCS_PROJECT_ID
  }
}

const storage = new Storage(storageConfig)

const bucketName = process.env.GCS_BUCKET_NAME || 'customer-service-7cc'
const bucket = storage.bucket(bucketName)

/**
 * Environment prefix for folder separation (dev vs pdn).
 * Use GCS_ENV_PREFIX to override, otherwise: production -> 'pdn', other -> 'dev'
 */
const getEnvPrefix = () => {
  const explicit = process.env.GCS_ENV_PREFIX
  if (explicit && typeof explicit === 'string' && explicit.trim()) {
    return explicit.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '') || 'dev'
  }
  return process.env.NODE_ENV === 'production' ? 'pdn' : 'dev'
}

const KNOWN_PREFIXES = ['dev', 'pdn']

/**
 * Resolve full path in bucket, prepending env prefix if not already present.
 * @param {string} pathOrName - Path or file name (e.g. 'clubhouse/abc.jpg' or 'dev/clubhouse/abc.jpg')
 * @returns {string} Full path with env prefix
 */
const resolvePath = (pathOrName) => {
  const prefix = getEnvPrefix()
  const normalized = (pathOrName || '').replace(/^\/+/, '').trim()
  if (!normalized) return prefix
  // If path already has a known env prefix (dev/ or pdn/), use as-is
  const lower = normalized.toLowerCase()
  if (KNOWN_PREFIXES.some((p) => lower.startsWith(`${p}/`))) return normalized
  return `${prefix}/${normalized}`
}

/**
 * Upload file to Google Cloud Storage
 * @param {Buffer} fileBuffer - File buffer
 * @param {string} fileName - Name for the file in storage
 * @param {string} mimeType - MIME type of the file
 * @param {boolean} makePublic - Whether to make the file publicly accessible
 * @param {string} folder - Optional folder path (e.g., 'payloads', 'payments', etc.)
 * @returns {Promise<Object>} Object with publicUrl and signedUrl
 */
export const uploadFile = async (fileBuffer, fileName, mimeType, makePublic = false, folder = null) => {
  // Si se especifica una carpeta, agregarla al path
  let fullPath = fileName
  if (folder) {
    // Limpiar el folder de caracteres peligrosos
    const cleanFolder = folder.replace(/[^a-zA-Z0-9_-]/g, '').toLowerCase()
    fullPath = `${cleanFolder}/${fileName}`
  }
  fullPath = resolvePath(fullPath)
  try {
    const file = bucket.file(fullPath)

    // Upload file
    await file.save(fileBuffer, {
      metadata: {
        contentType: mimeType
      }
    })

    // Make file public if requested
    if (makePublic) {
      await file.makePublic()
      const publicUrl = `https://storage.googleapis.com/${bucketName}/${fullPath}`
      return {
        success: true,
        fileName: fullPath,
        publicUrl,
        signedUrl: null
      }
    } else {
      // Generate signed URL (valid for 1 year by default)
      const [signedUrl] = await file.getSignedUrl({
        action: 'read',
        expires: Date.now() + 365 * 24 * 60 * 60 * 1000 // 1 year
      })

      return {
        success: true,
        fileName: fullPath,
        publicUrl: null,
        signedUrl
      }
    }
  } catch (error) {
    console.error('Error uploading file to GCS:', error)
    throw new Error(`Failed to upload file: ${error.message}`)
  }
}

/**
 * Delete file from Google Cloud Storage
 * @param {string} fileName - Name of the file to delete
 * @returns {Promise<boolean>} Success status
 */
export const deleteFile = async (fileName) => {
  try {
    const fullPath = resolvePath(fileName)
    const file = bucket.file(fullPath)
    await file.delete()
    return true
  } catch (error) {
    console.error('Error deleting file from GCS:', error)
    throw new Error(`Failed to delete file: ${error.message}`)
  }
}

/**
 * Generate a signed URL for an existing file
 * @param {string} fileName - Name of the file
 * @param {number} expiresIn - Expiration time in milliseconds (default: 1 hour)
 * @returns {Promise<string>} Signed URL
 */
export const getSignedUrl = async (fileName, expiresIn = 60 * 60 * 1000) => {
  try {
    const fullPath = resolvePath(fileName)
    const file = bucket.file(fullPath)
    const [signedUrl] = await file.getSignedUrl({
      action: 'read',
      expires: Date.now() + expiresIn
    })
    return signedUrl
  } catch (error) {
    console.error('Error generating signed URL:', error)
    throw new Error(`Failed to generate signed URL: ${error.message}`)
  }
}

/**
 * List files in a folder (prefix) in GCS
 * @param {string} folderPrefix - Folder path (e.g. 'clubhouse', 'payloads', 'clubhouse/')
 * @param {Object} options - { includeSignedUrls: boolean, makePublic: boolean }
 * @returns {Promise<Array<{ name: string, url?: string }>>} List of files with optional URL
 */
export const listFilesInFolder = async (folderPrefix, options = {}) => {
  const { includeSignedUrls = true } = options
  try {
    const prefix = (folderPrefix || '').replace(/^\/|\/$/g, '').trim()
    if (!prefix) return []
    const resolvedPrefix = resolvePath(`${prefix}/`)
    const prefixWithSlash = resolvedPrefix.endsWith('/') ? resolvedPrefix : `${resolvedPrefix}/`
    const [files] = await bucket.getFiles({ prefix: prefixWithSlash })
    const makePublic = process.env.GCS_MAKE_PUBLIC === 'true' || false
    const result = []
    for (const file of files) {
      // Skip "directory" placeholders (GCS has no real folders, but we skip empty names)
      const name = file.name
      if (!name || name.endsWith('/')) continue
      const item = { name }
      if (includeSignedUrls) {
        if (makePublic) {
          item.url = `https://storage.googleapis.com/${bucketName}/${name}`
        } else {
          try {
            const [signedUrl] = await file.getSignedUrl({
              action: 'read',
              expires: Date.now() + 365 * 24 * 60 * 60 * 1000
            })
            item.url = signedUrl
          } catch (e) {
            item.url = null
          }
        }
      }
      result.push(item)
    }
    return result
  } catch (error) {
    console.error('Error listing files in GCS:', error)
    throw new Error(`Failed to list files: ${error.message}`)
  }
}

/**
 * Test connection to Google Cloud Storage bucket
 * @returns {Promise<Object>} Connection status and bucket info
 */
export const testConnection = async () => {
  try {
    // Verificar que el bucket existe y es accesible
    const [exists] = await bucket.exists()
    
    if (!exists) {
      return {
        success: false,
        message: `Bucket '${bucketName}' does not exist`,
        bucketName
      }
    }

    // Obtener metadata del bucket
    const [metadata] = await bucket.getMetadata()
    
    return {
      success: true,
      message: 'Successfully connected to Google Cloud Storage',
      bucketName,
      envPrefix: getEnvPrefix(),
      location: metadata.location,
      storageClass: metadata.storageClass,
      projectId: metadata.projectNumber,
      created: metadata.timeCreated
    }
  } catch (error) {
    console.error('GCS Connection test error:', error)
    return {
      success: false,
      message: `Failed to connect to bucket: ${error.message}`,
      error: error.message,
      bucketName
    }
  }
}

export default {
  uploadFile,
  deleteFile,
  getSignedUrl,
  listFilesInFolder,
  testConnection
}
