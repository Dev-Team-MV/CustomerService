import multer from 'multer'
import { uploadFile, deleteFile, testConnection } from '../services/storageService.js'
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
    fileSize: 10 * 1024 * 1024 // 10MB max
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
