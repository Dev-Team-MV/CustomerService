import express from 'express'
import { uploadImage, uploadMultipleImages, deleteImage, testGCSConnection, upload } from '../controllers/uploadController.js'
import { protect, admin } from '../middleware/authMiddleware.js'

const router = express.Router()

/**
 * @swagger
 * /api/upload/test-connection:
 *   get:
 *     summary: Test Google Cloud Storage connection (No auth required for testing)
 *     tags: [Upload]
 *     responses:
 *       200:
 *         description: Connection successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 bucketName:
 *                   type: string
 *                 location:
 *                   type: string
 *                 storageClass:
 *                   type: string
 *                 projectId:
 *                   type: string
 *                 created:
 *                   type: string
 *       500:
 *         description: Connection failed
 */
router.get('/test-connection', testGCSConnection)

/**
 * @swagger
 * /api/upload/image:
 *   post:
 *     summary: Upload a single image to Google Cloud Storage
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - in: formData
 *         name: image
 *         type: file
 *         required: true
 *         description: Image file to upload (max 10MB, formats: jpeg, jpg, png, gif, webp)
 *       - in: formData
 *         name: folder
 *         type: string
 *         description: Folder name in GCS where image will be stored (e.g., 'payments', 'receipts', 'documents'). Optional, defaults to root.
 *     responses:
 *       200:
 *         description: Image uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     fileName:
 *                       type: string
 *                     url:
 *                       type: string
 *                       description: Public URL or signed URL
 *                     publicUrl:
 *                       type: string
 *                       nullable: true
 *                     signedUrl:
 *                       type: string
 *                       nullable: true
 *                     size:
 *                       type: number
 *                     mimeType:
 *                       type: string
 *       400:
 *         description: No file uploaded or invalid file type
 *       500:
 *         description: Error uploading image
 */
router.post('/image', protect, upload.single('image'), uploadImage)

/**
 * @swagger
 * /api/upload/images:
 *   post:
 *     summary: Upload multiple images to Google Cloud Storage
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - in: formData
 *         name: images
 *         type: file
 *         required: true
 *         description: Image files to upload (max 10MB each, formats: jpeg, jpg, png, gif, webp)
 *       - in: formData
 *         name: folder
 *         type: string
 *         description: Folder name in GCS where images will be stored (e.g., 'payments', 'receipts', 'documents'). Optional, defaults to root.
 *     responses:
 *       200:
 *         description: Images uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       fileName:
 *                         type: string
 *                       url:
 *                         type: string
 *                       publicUrl:
 *                         type: string
 *                         nullable: true
 *                       signedUrl:
 *                         type: string
 *                         nullable: true
 *                       size:
 *                         type: number
 *                       mimeType:
 *                         type: string
 *                       originalName:
 *                         type: string
 *       400:
 *         description: No files uploaded or invalid file types
 *       500:
 *         description: Error uploading images
 */
router.post('/images', protect, upload.array('images', 10), uploadMultipleImages)

/**
 * @swagger
 * /api/upload/image/{fileName}:
 *   delete:
 *     summary: Delete an image from Google Cloud Storage (Admin only)
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: fileName
 *         required: true
 *         schema:
 *           type: string
 *         description: Full path of the file to delete (e.g., images/2025/01/abc123.jpg)
 *     responses:
 *       200:
 *         description: Image deleted successfully
 *       400:
 *         description: File name is required
 *       500:
 *         description: Error deleting image
 */
router.delete('/image/:fileName', protect, admin, deleteImage)

export default router
