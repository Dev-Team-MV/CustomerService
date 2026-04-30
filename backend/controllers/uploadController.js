import multer from 'multer'
import { uploadFile, deleteFile, testConnection, listFilesInFolder } from '../services/storageService.js'
import { resolveToSignedUrl } from '../services/urlResolverService.js'
import { processImageForUpload } from '../services/imageProcessingService.js'
import Model from '../models/Model.js'
import Apartment from '../models/Apartment.js'
import ClubHouse from '../models/ClubHouse.js'
import crypto from 'crypto'
import path from 'path'

// Configurar multer para almacenar en memoria
const storage = multer.memoryStorage()

// Filtro de archivos - imágenes, PDF y videos
const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase().replace(/^\./, '')
  const allowedExtensions = /^(jpeg|jpg|png|gif|webp|pdf|mp4|webm|mov|avi|mkv)$/
  const allowedMimetypes = /^image\/(jpeg|jpg|png|gif|webp)$|^application\/pdf$|^video\/(mp4|webm|quicktime|x-msvideo|x-matroska)$/
  const extOk = allowedExtensions.test(ext)
  const mimeOk = allowedMimetypes.test(file.mimetype)

  if (extOk && mimeOk) {
    return cb(null, true)
  }
  cb(new Error('Only image files (jpeg, jpg, png, gif, webp), PDF and videos (mp4, webm, mov, avi, mkv) are allowed'))
}

export const upload = multer({
  storage,
  limits: {
    fileSize: 300 * 1024 * 1024, // 300MB max per file
    files: 20 // Maximum number of files
  },
  fileFilter
})

/**
 * Sanitize optional custom fileName from client. Prevents path traversal; ensures extension matches file.
 * @returns {string|null} Safe file name to use, or null to fall back to hash.
 */
function sanitizeCustomFileName (customName, fileExtension) {
  if (!customName || typeof customName !== 'string') return null
  const trimmed = customName.trim()
  if (!trimmed) return null
  // No path traversal or slashes
  if (trimmed.includes('..') || trimmed.includes('/') || trimmed.includes('\\')) return null
  // Only allow safe chars: letters, numbers, space, hyphen, underscore, dot
  const safe = trimmed.replace(/[^a-zA-Z0-9 _\-.]/g, '')
  if (!safe) return null
  // Force correct extension so we don't serve wrong type
  const base = safe.endsWith(fileExtension) ? safe.slice(0, -fileExtension.length) : path.basename(safe, path.extname(safe))
  const final = (base.trim() || 'image') + fileExtension
  return final.length <= 200 ? final : null
}

/** Build full path like storageService.uploadFile (same cleanFolder logic). */
function buildFullPath (folder, fileName) {
  if (!folder) return fileName
  const cleanFolder = folder.replace(/[^a-zA-Z0-9_-]/g, '').toLowerCase()
  return `${cleanFolder}/${fileName}`
}

/**
 * Elimina del bucket todos los archivos en la carpeta que tengan el mismo nombre base
 * (cualquier extensión: .png, .jpg, .jpeg, etc.). Ej: recorrido.1.png y recorrido.1.jpg → ambos se borran.
 */
async function deleteFilesWithSameBaseName (folder, fileName) {
  if (!folder || !fileName) return
  const baseName = path.basename(fileName, path.extname(fileName))
  const prefix = baseName + '.' // "recorrido.1." para no matchear "recorrido.10"
  const files = await listFilesInFolder(folder, { includeSignedUrls: false })
  for (const f of files) {
    const nameInFolder = f.name.includes('/') ? f.name.split('/').pop() : f.name
    if (nameInFolder.startsWith(prefix)) {
      await deleteFile(f.name).catch(() => {})
    }
  }
}

/**
 * Upload single image
 * Body: folder (optional), fileName (optional) — e.g. "recorrido.1.png" for predictable names in bucket.
 * If the same base name exists with any extension (png, jpg, jpeg...), those files are deleted and the new one is saved.
 */
export const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false,
        message: 'No file uploaded' 
      })
    }

    // Obtener carpeta y nombre personalizado del body
    const { folder, fileName: customName } = req.body

    const processed = await processImageForUpload(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype
    )
    const fileExtension = processed.extension
    const fileName = sanitizeCustomFileName(customName, fileExtension) ||
      `${crypto.randomBytes(16).toString('hex')}${Date.now()}${fileExtension}`

    // Si se usa nombre custom, eliminar en el bucket todos los que tengan el mismo nombre base (cualquier extensión)
    if (customName && sanitizeCustomFileName(customName, fileExtension) && folder) {
      await deleteFilesWithSameBaseName(folder, fileName)
    }

    // Subir a Google Cloud Storage
    // makePublic: true para URLs públicas, false para signed URLs
    const makePublic = process.env.GCS_MAKE_PUBLIC === 'true' || false
    const result = await uploadFile(
      processed.buffer,
      fileName,
      processed.mimeType,
      makePublic,
      folder // Pasar la carpeta si se especificó
    )

    res.status(200).json({
      success: true,
      message: 'Image uploaded successfully',
      data: {
        fileName: result.fileName,
        url: result.publicUrl || result.signedUrl,
        publicUrl: result.publicUrl,
        signedUrl: result.signedUrl,
        size: processed.size,
        mimeType: processed.mimeType
      }
    })
  } catch (error) {
    console.error('Upload error:', error)
    res.status(500).json({ 
      success: false,
      message: error.message || 'Error uploading image' 
    })
  }
}

/**
 * Upload multiple images
 * Body: folder (optional), fileNames (optional) — JSON array of names, e.g. ["punto 1.png","punto 2.png"]
 */
export const uploadMultipleImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ 
        success: false,
        message: 'No files uploaded' 
      })
    }

    const { folder, fileNames: customNamesRaw } = req.body
    let customNames = null
    if (customNamesRaw) {
      try {
        const parsed = typeof customNamesRaw === 'string' ? JSON.parse(customNamesRaw) : customNamesRaw
        if (Array.isArray(parsed) && parsed.length === req.files.length) customNames = parsed
      } catch (_) { /* ignore */ }
    }

    const makePublic = process.env.GCS_MAKE_PUBLIC === 'true' || false
    const uploadPromises = req.files.map(async (file, index) => {
      const processed = await processImageForUpload(file.buffer, file.originalname, file.mimetype)
      const fileExtension = processed.extension
      const customName = customNames && customNames[index] != null ? customNames[index] : null
      const fileName = sanitizeCustomFileName(String(customName), fileExtension) ||
        `${crypto.randomBytes(16).toString('hex')}${Date.now()}${fileExtension}`

      // Si este archivo usa nombre custom, eliminar todos los del mismo nombre base (cualquier extensión)
      if (fileName && sanitizeCustomFileName(String(customName), fileExtension) && folder) {
        await deleteFilesWithSameBaseName(folder, fileName)
      }

      const result = await uploadFile(
        processed.buffer,
        fileName,
        processed.mimeType,
        makePublic,
        folder // Pasar la carpeta si se especificó
      )

      return {
        fileName: result.fileName,
        url: result.publicUrl || result.signedUrl,
        publicUrl: result.publicUrl,
        signedUrl: result.signedUrl,
        size: processed.size,
        mimeType: processed.mimeType,
        originalName: file.originalname
      }
    })

    const uploadedFiles = await Promise.all(uploadPromises)

    res.status(200).json({
      success: true,
      message: `${uploadedFiles.length} image(s) uploaded successfully`,
      data: uploadedFiles
    })
  } catch (error) {
    console.error('Upload error:', error)
    res.status(500).json({ 
      success: false,
      message: error.message || 'Error uploading images' 
    })
  }
}

/**
 * Delete image
 */
export const deleteImage = async (req, res) => {
  try {
    const { fileName } = req.params

    if (!fileName) {
      return res.status(400).json({ 
        success: false,
        message: 'File name is required' 
      })
    }

    await deleteFile(fileName)

    res.status(200).json({
      success: true,
      message: 'Image deleted successfully'
    })
  } catch (error) {
    console.error('Delete error:', error)
    res.status(500).json({ 
      success: false,
      message: error.message || 'Error deleting image' 
    })
  }
}

/**
 * Build a map: filename (e.g. "abc123.jpg") -> { section, interiorKey?, isPublic, imageIndex } from ClubHouse doc.
 * URLs in DB can be full signed URLs; we match by filename (last path segment).
 * imageIndex = index inside that section's array (for PATCH /clubhouse/images/visibility).
 */
function mapClubHouseFilesToSections (clubHouseDoc) {
  const byFilename = {}
  if (!clubHouseDoc) return byFilename

  const add = (section, interiorKey, items) => {
    if (!Array.isArray(items)) return
    items.forEach((item, index) => {
      const url = typeof item === 'string' ? item : item?.url
      const filename = typeof url === 'string' && url.includes('/') ? url.split('/').pop().split('?')[0] : null
      if (filename) {
        const isPublic = typeof item === 'object' && item !== null && 'isPublic' in item ? item.isPublic !== false : true
        byFilename[filename] = {
          section,
          ...(interiorKey && { interiorKey }),
          isPublic,
          imageIndex: index
        }
      }
    })
  }

  add('exterior', null, clubHouseDoc.exterior)
  add('blueprints', null, clubHouseDoc.blueprints)
  add('deck', null, clubHouseDoc.deck)
  if (clubHouseDoc.interior && typeof clubHouseDoc.interior === 'object') {
    Object.entries(clubHouseDoc.interior).forEach(([key, urls]) => {
      add('interior', key, urls)
    })
  }
  return byFilename
}

/**
 * List files in a GCS folder (prefix). Returns file names and URLs (public or signed).
 * For folder=clubhouse, enriches each file with section (exterior|blueprints|deck|interior) and interiorKey when applicable.
 * GET /api/upload/files?folder=clubhouse
 * GET /api/upload/files?folder=clubhouse&enrich=false to skip ClubHouse enrichment
 */
export const getFolderFiles = async (req, res) => {
  try {
    const folder = (req.query.folder || req.params.folder || '').trim()
    if (!folder) {
      return res.status(400).json({
        success: false,
        message: 'Query "folder" is required (e.g. ?folder=clubhouse or ?folder=payloads)'
      })
    }
    const includeUrls = req.query.urls !== 'false'
    const enrich = req.query.enrich !== 'false'
    let files = await listFilesInFolder(folder, { includeSignedUrls: includeUrls })

    // Orden natural para carpeta recorrido (punto 1, punto 2, ... punto 10)
    if (folder.toLowerCase() === 'recorrido' && files.length > 0) {
      const naturalSort = (a, b) => {
        const nameA = a.name.includes('/') ? a.name.split('/').pop() : a.name
        const nameB = b.name.includes('/') ? b.name.split('/').pop() : b.name
        const numA = nameA.replace(/\D/g, '') || '0'
        const numB = nameB.replace(/\D/g, '') || '0'
        return parseInt(numA, 10) - parseInt(numB, 10) || nameA.localeCompare(nameB)
      }
      files = [...files].sort(naturalSort)
    }

    let filesOut = files
    if (folder.toLowerCase() === 'clubhouse' && enrich) {
      const clubHouse = await ClubHouse.findOne()
        .select('exterior blueprints deck interior')
        .lean()
      const sectionByFilename = mapClubHouseFilesToSections(clubHouse)
      filesOut = files.map(f => {
        const filename = f.name.includes('/') ? f.name.split('/').pop().split('?')[0] : f.name
        const meta = sectionByFilename[filename] || { section: null, interiorKey: null, isPublic: true, imageIndex: null }
        return {
          ...f,
          section: meta.section,
          interiorKey: meta.interiorKey || undefined,
          isPublic: meta.isPublic !== false,
          imageIndex: meta.imageIndex
        }
      })
    }

    if (folder.toLowerCase() === 'recorrido' && enrich) {
      const clubHouse = await ClubHouse.findOne()
        .select('recorridoVisibility')
        .lean()
      const recorridoVisibility = (clubHouse?.recorridoVisibility && typeof clubHouse.recorridoVisibility === 'object')
        ? clubHouse.recorridoVisibility
        : {}
      filesOut = files.map(f => {
        const filename = f.name.includes('/') ? f.name.split('/').pop().split('?')[0] : f.name
        const isPublic = filename in recorridoVisibility ? recorridoVisibility[filename] !== false : true
        return { ...f, isPublic }
      })
    }

    res.json({
      folder,
      count: filesOut.length,
      files: filesOut
    })
  } catch (error) {
    console.error('List folder error:', error)
    res.status(500).json({
      success: false,
      message: error.message || 'Error listing folder'
    })
  }
}

/**
 * PATCH Update visibility (isPublic) of a single recorrido file.
 * Body: { filename, isPublic }. filename = e.g. "recorrido.1.jpg"
 */
export const updateRecorridoVisibility = async (req, res) => {
  try {
    const { filename, isPublic } = req.body
    if (!filename || typeof filename !== 'string') {
      return res.status(400).json({ success: false, message: 'filename is required' })
    }
    const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, '')
    if (!safeName) {
      return res.status(400).json({ success: false, message: 'Invalid filename' })
    }
    const wantPublic = isPublic === true || isPublic === 'true'

    let doc = await ClubHouse.findOne()
    if (!doc) doc = await ClubHouse.create({})
    if (!doc.recorridoVisibility || typeof doc.recorridoVisibility !== 'object') {
      doc.recorridoVisibility = {}
    }
    doc.recorridoVisibility[safeName] = wantPublic
    doc.markModified('recorridoVisibility')
    await doc.save()

    res.status(200).json({
      success: true,
      message: 'Recorrido image visibility updated',
      filename: safeName,
      isPublic: wantPublic
    })
  } catch (error) {
    console.error('Recorrido visibility error:', error)
    res.status(500).json({ success: false, message: error.message || 'Error updating recorrido visibility' })
  }
}

/**
 * Update an image: upload new file to GCS and save URL in Model (base, balcony or upgrade).
 * POST multipart: image (file), modelId, target (model|balcony|upgrade|blueprints), imageType (exterior|interior),
 * optional: imageIndex (replace at index), balconyId (if target=balcony), upgradeId (if target=upgrade), folder,
 * isPublic (true|false): si la imagen se puede mostrar sin token. Por defecto true.
 */
export const updateImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      })
    }

    const { modelId, target, imageType, imageIndex, balconyId, upgradeId, folder, blueprintVariant, isPublic } = req.body
    const isPublicBool = isPublic === undefined || isPublic === '' ? true : (isPublic === 'true' || isPublic === true)

    if (!modelId || !target) {
      return res.status(400).json({
        success: false,
        message: 'modelId and target are required'
      })
    }

    const validTargets = ['model', 'balcony', 'upgrade', 'blueprints']
    if (!validTargets.includes(target)) {
      return res.status(400).json({
        success: false,
        message: 'target must be one of: model, balcony, upgrade, blueprints'
      })
    }

    if (target !== 'blueprints' && !imageType) {
      return res.status(400).json({
        success: false,
        message: 'imageType is required when target is model, balcony or upgrade'
      })
    }

    const validImageTypes = ['exterior', 'interior']
    if (target !== 'blueprints' && !validImageTypes.includes(imageType)) {
      return res.status(400).json({
        success: false,
        message: 'imageType must be one of: exterior, interior'
      })
    }

    const validBlueprintVariants = ['default', 'withBalcony', 'withStorage', 'withBalconyAndStorage']
    if (target === 'blueprints') {
      if (!blueprintVariant || !validBlueprintVariants.includes(blueprintVariant)) {
        return res.status(400).json({
          success: false,
          message: 'blueprintVariant is required when target is blueprints (default, withBalcony, withStorage, withBalconyAndStorage)'
        })
      }
    }

    if (target === 'balcony' && !balconyId) {
      return res.status(400).json({
        success: false,
        message: 'balconyId is required when target is balcony'
      })
    }
    if (target === 'upgrade' && !upgradeId) {
      return res.status(400).json({
        success: false,
        message: 'upgradeId is required when target is upgrade'
      })
    }

    const model = await Model.findById(modelId)
    if (!model) {
      return res.status(404).json({
        success: false,
        message: 'Model not found'
      })
    }

    let imageArray = null

    if (target === 'blueprints') {
      if (!model.blueprints) model.blueprints = { default: [], withBalcony: [], withStorage: [], withBalconyAndStorage: [] }
      const variant = blueprintVariant
      if (!Array.isArray(model.blueprints[variant])) model.blueprints[variant] = []
      imageArray = model.blueprints[variant]
    } else if (target === 'model') {
      if (!model.images) model.images = { exterior: [], interior: [] }
      if (!Array.isArray(model.images.exterior)) model.images.exterior = []
      if (!Array.isArray(model.images.interior)) model.images.interior = []
      imageArray = model.images[imageType]
    } else if (target === 'balcony') {
      const balcony = model.balconies.id(balconyId)
      if (!balcony) {
        return res.status(404).json({
          success: false,
          message: 'Balcony not found in this model'
        })
      }
      if (!balcony.images) balcony.images = { exterior: [], interior: [] }
      if (!Array.isArray(balcony.images.exterior)) balcony.images.exterior = []
      if (!Array.isArray(balcony.images.interior)) balcony.images.interior = []
      imageArray = balcony.images[imageType]
    } else {
      const upgrade = model.upgrades.id(upgradeId)
      if (!upgrade) {
        return res.status(404).json({
          success: false,
          message: 'Upgrade not found in this model'
        })
      }
      if (!upgrade.images) upgrade.images = { exterior: [], interior: [] }
      if (!Array.isArray(upgrade.images.exterior)) upgrade.images.exterior = []
      if (!Array.isArray(upgrade.images.interior)) upgrade.images.interior = []
      imageArray = upgrade.images[imageType]
    }

    const index = imageIndex !== undefined && imageIndex !== '' ? parseInt(imageIndex, 10) : -1
    const hasValidIndex = !Number.isNaN(index) && index >= 0 && index < imageArray.length

    const gcsFolder = folder || 'models'
    const processed = await processImageForUpload(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype
    )
    const fileName = `${crypto.randomBytes(16).toString('hex')}${Date.now()}${processed.extension}`

    const makePublic = process.env.GCS_MAKE_PUBLIC === 'true' || false
    const result = await uploadFile(
      processed.buffer,
      fileName,
      processed.mimeType,
      makePublic,
      gcsFolder
    )

    const url = result.publicUrl || result.signedUrl
    const imageItem = { url, isPublic: isPublicBool }

    const { normalizeImageArray } = await import('../utils/imageUtils.js')
    const normalized = normalizeImageArray(imageArray)
    if (hasValidIndex) {
      normalized[index] = imageItem
    } else {
      normalized.push(imageItem)
    }
    if (target === 'blueprints') {
      model.blueprints[blueprintVariant] = normalized
    } else if (target === 'model') {
      model.images[imageType] = normalized
    } else if (target === 'balcony') {
      const balcony = model.balconies.id(balconyId)
      balcony.images[imageType] = normalized
    } else {
      const upgrade = model.upgrades.id(upgradeId)
      upgrade.images[imageType] = normalized
    }

    await model.save()

    const responseData = {
      url,
      isPublic: isPublicBool,
      fileName: result.fileName,
      target,
      index: hasValidIndex ? index : normalized.length - 1
    }
    if (target === 'blueprints') {
      responseData.blueprintVariant = blueprintVariant
    } else {
      responseData.imageType = imageType
    }

    res.status(200).json({
      success: true,
      message: 'Image updated successfully',
      data: responseData
    })
  } catch (error) {
    console.error('Update image error:', error)
    res.status(500).json({
      success: false,
      message: error.message || 'Error updating image'
    })
  }
}

/**
 * Upload a render image and save URL in Apartment.interiorRendersBasic or interiorRendersUpgrade.
 * POST multipart: image (file), apartmentId, renderType (basic|upgrade), optional imageIndex, folder, fileName.
 */
export const updateApartmentRenderImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      })
    }

    const { apartmentId, renderType, imageIndex, folder, fileName: customName } = req.body
    if (!apartmentId || !renderType) {
      return res.status(400).json({
        success: false,
        message: 'apartmentId and renderType are required'
      })
    }

    const validRenderTypes = ['basic', 'upgrade']
    if (!validRenderTypes.includes(renderType)) {
      return res.status(400).json({
        success: false,
        message: 'renderType must be one of: basic, upgrade'
      })
    }

    const apartment = await Apartment.findById(apartmentId)
    if (!apartment) {
      return res.status(404).json({
        success: false,
        message: 'Apartment not found'
      })
    }

    const targetField = renderType === 'basic' ? 'interiorRendersBasic' : 'interiorRendersUpgrade'
    if (!Array.isArray(apartment[targetField])) {
      apartment[targetField] = []
    }

    const processed = await processImageForUpload(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype
    )
    const fileExtension = processed.extension
    const sanitizedCustomName = sanitizeCustomFileName(customName, fileExtension)
    const generatedFileName = `${crypto.randomBytes(16).toString('hex')}${Date.now()}${fileExtension}`
    const finalFileName = sanitizedCustomName || generatedFileName
    const gcsFolder = folder || 'apartments'

    // If caller sent custom fileName, replace previous versions sharing same base name.
    if (sanitizedCustomName) {
      await deleteFilesWithSameBaseName(gcsFolder, finalFileName)
    }

    const makePublic = process.env.GCS_MAKE_PUBLIC === 'true' || false
    const result = await uploadFile(
      processed.buffer,
      finalFileName,
      processed.mimeType,
      makePublic,
      gcsFolder
    )

    const url = result.publicUrl || result.signedUrl
    const current = Array.isArray(apartment[targetField]) ? [...apartment[targetField]] : []
    const index = imageIndex !== undefined && imageIndex !== '' ? parseInt(imageIndex, 10) : -1
    const hasValidIndex = !Number.isNaN(index) && index >= 0 && index < current.length

    if (hasValidIndex) {
      current[index] = url
    } else {
      current.push(url)
    }

    apartment[targetField] = current
    apartment.markModified(targetField)
    await apartment.save()

    res.status(200).json({
      success: true,
      message: 'Apartment render image updated successfully',
      data: {
        apartmentId: apartment._id,
        renderType,
        field: targetField,
        url,
        fileName: result.fileName,
        index: hasValidIndex ? index : current.length - 1
      }
    })
  } catch (error) {
    console.error('Update apartment render image error:', error)
    res.status(500).json({
      success: false,
      message: error.message || 'Error updating apartment render image'
    })
  }
}

/**
 * GET signed URL for a GCS path.
 * Query: path (required) - e.g. "pdn/models/xxx.jpg"
 * Use when frontend has path and needs a fresh URL for display.
 */
export const getSignedUrlForPath = async (req, res) => {
  try {
    const pathOrUrl = req.query.path || req.query.url || req.params.path
    if (!pathOrUrl || typeof pathOrUrl !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Query parameter "path" or "url" is required'
      })
    }

    const rawExpires = req.query.expiresInSeconds
    const expiresInSeconds = rawExpires !== undefined ? Number(rawExpires) : 3600
    if (!Number.isFinite(expiresInSeconds) || expiresInSeconds <= 0 || expiresInSeconds > 7 * 24 * 60 * 60) {
      return res.status(400).json({
        success: false,
        message: 'expiresInSeconds must be a number between 1 and 604800'
      })
    }

    const url = await resolveToSignedUrl(pathOrUrl, expiresInSeconds * 1000)
    if (!url) {
      return res.status(404).json({ success: false, message: 'Could not generate signed URL' })
    }
    res.json({
      success: true,
      signedUrl: url,
      expiresInSeconds
    })
  } catch (error) {
    console.error('getSignedUrl error:', error)
    res.status(500).json({ success: false, message: error.message })
  }
}

/**
 * Test GCS connection
 */
export const testGCSConnection = async (req, res) => {
  try {
    const result = await testConnection()
    
    if (result.success) {
      res.status(200).json(result)
    } else {
      res.status(500).json(result)
    }
  } catch (error) {
    console.error('Test connection error:', error)
    res.status(500).json({ 
      success: false,
      message: error.message || 'Error testing connection' 
    })
  }
}
