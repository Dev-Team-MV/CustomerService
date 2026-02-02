import multer from 'multer'
import { uploadFile, deleteFile, testConnection } from '../services/storageService.js'
import Model from '../models/Model.js'
import crypto from 'crypto'
import path from 'path'

// Configurar multer para almacenar en memoria
const storage = multer.memoryStorage()

// Filtro de archivos - solo imágenes
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase())
  const mimetype = allowedTypes.test(file.mimetype)

  if (mimetype && extname) {
    return cb(null, true)
  } else {
    cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, webp)'))
  }
}

export const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB max per file
    files: 20 // Maximum number of files
  },
  fileFilter
})

/**
 * Upload single image
 */
export const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false,
        message: 'No file uploaded' 
      })
    }

    // Obtener carpeta del body (si se especifica)
    const { folder } = req.body

    // Generar nombre único para el archivo
    const fileExtension = path.extname(req.file.originalname)
    const fileName = `${crypto.randomBytes(16).toString('hex')}${Date.now()}${fileExtension}`

    // Subir a Google Cloud Storage
    // makePublic: true para URLs públicas, false para signed URLs
    const makePublic = process.env.GCS_MAKE_PUBLIC === 'true' || false
    const result = await uploadFile(
      req.file.buffer,
      fileName,
      req.file.mimetype,
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
        size: req.file.size,
        mimeType: req.file.mimetype
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
 */
export const uploadMultipleImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ 
        success: false,
        message: 'No files uploaded' 
      })
    }

    // Obtener carpeta del body (si se especifica)
    const { folder } = req.body

    const makePublic = process.env.GCS_MAKE_PUBLIC === 'true' || false
    const uploadPromises = req.files.map(async (file) => {
      const fileExtension = path.extname(file.originalname)
      const fileName = `${crypto.randomBytes(16).toString('hex')}${Date.now()}${fileExtension}`

      const result = await uploadFile(
        file.buffer,
        fileName,
        file.mimetype,
        makePublic,
        folder // Pasar la carpeta si se especificó
      )

      return {
        fileName: result.fileName,
        url: result.publicUrl || result.signedUrl,
        publicUrl: result.publicUrl,
        signedUrl: result.signedUrl,
        size: file.size,
        mimeType: file.mimetype,
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
 * Update an image: upload new file to GCS and save URL in Model (base, balcony or upgrade).
 * POST multipart: image (file), modelId, target (model|balcony|upgrade), imageType (exterior|interior),
 * optional: imageIndex (replace at index), balconyId (if target=balcony), upgradeId (if target=upgrade), folder.
 */
export const updateImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      })
    }

    const { modelId, target, imageType, imageIndex, balconyId, upgradeId, folder, blueprintVariant } = req.body

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
    const fileExtension = path.extname(req.file.originalname)
    const fileName = `${crypto.randomBytes(16).toString('hex')}${Date.now()}${fileExtension}`

    const makePublic = process.env.GCS_MAKE_PUBLIC === 'true' || false
    const result = await uploadFile(
      req.file.buffer,
      fileName,
      req.file.mimetype,
      makePublic,
      gcsFolder
    )

    const url = result.publicUrl || result.signedUrl

    if (hasValidIndex) {
      imageArray[index] = url
    } else {
      imageArray.push(url)
    }

    await model.save()

    const responseData = {
      url,
      fileName: result.fileName,
      target,
      index: hasValidIndex ? index : imageArray.length - 1
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
