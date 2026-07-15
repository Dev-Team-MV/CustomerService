import express from 'express'
import {
  createDocument,
  getDocuments,
  getDocumentById,
  updateDocument,
  deleteDocument,
  getDocumentsByProperty,
  getDocumentsByClient,
  getDocumentsByProject,
  searchDocuments,
  uploadNewVersion,
  archiveDocument,
  getExpiringDocuments,
  runExpiringDocumentsScan,
  documentUpload
} from '../controllers/documentController.js'
import { protect, admin } from '../middleware/authMiddleware.js'

const router = express.Router()

router.use(protect, admin)

const uploadSingle = (req, res, next) => {
  documentUpload.single('file')(req, res, (err) => {
    if (err) {
      return res.status(400).json({ message: err.message || 'Invalid file upload' })
    }
    next()
  })
}

/**
 * @swagger
 * /api/documents/search:
 *   get:
 *     summary: Search documents by title/tags and filters
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         schema: { type: string }
 *         description: Text query (title + tags text index)
 *       - in: query
 *         name: projectId
 *         schema: { type: string }
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [contract, id_document, deed, appraisal, receipt, insurance, permit, blueprint, other]
 *       - in: query
 *         name: tags
 *         schema: { type: string }
 *         description: Comma-separated tags (AND)
 *       - in: query
 *         name: page
 *         schema: { type: integer }
 *       - in: query
 *         name: limit
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Search results
 */
router.get('/search', searchDocuments)

/**
 * @swagger
 * /api/documents/expiring:
 *   get:
 *     summary: List documents expiring within N days
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: daysAhead
 *         schema: { type: integer, default: 30 }
 *       - in: query
 *         name: projectId
 *         schema: { type: string }
 *       - in: query
 *         name: category
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Expiring documents
 */
router.get('/expiring', getExpiringDocuments)

/**
 * @swagger
 * /api/documents/expiring/scan:
 *   post:
 *     summary: Manually run expiring-document notification scan
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: daysAhead
 *         schema: { type: integer, default: 30 }
 *     responses:
 *       200:
 *         description: Scan result
 */
router.post('/expiring/scan', runExpiringDocumentsScan)

/**
 * @swagger
 * /api/documents/by-property/{propertyId}:
 *   get:
 *     summary: Documents for a property
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: propertyId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Document list
 */
router.get('/by-property/:propertyId', getDocumentsByProperty)

/**
 * @swagger
 * /api/documents/by-client/{clientId}:
 *   get:
 *     summary: Documents for a client
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: clientId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Document list
 */
router.get('/by-client/:clientId', getDocumentsByClient)

/**
 * @swagger
 * /api/documents/by-project/{projectId}:
 *   get:
 *     summary: Documents for a project
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema: { type: string }
 *       - in: query
 *         name: category
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Document list
 */
router.get('/by-project/:projectId', getDocumentsByProject)

/**
 * @swagger
 * /api/documents:
 *   get:
 *     summary: List documents
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: projectId
 *         schema: { type: string }
 *       - in: query
 *         name: propertyId
 *         schema: { type: string }
 *       - in: query
 *         name: clientId
 *         schema: { type: string }
 *       - in: query
 *         name: leadId
 *         schema: { type: string }
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [contract, id_document, deed, appraisal, receipt, insurance, permit, blueprint, other]
 *       - in: query
 *         name: includeArchived
 *         schema: { type: boolean }
 *       - in: query
 *         name: page
 *         schema: { type: integer }
 *       - in: query
 *         name: limit
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Paginated documents
 *   post:
 *     summary: Upload / create a document
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [title, category, projectId]
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *               title: { type: string }
 *               description: { type: string }
 *               category:
 *                 type: string
 *                 enum: [contract, id_document, deed, appraisal, receipt, insurance, permit, blueprint, other]
 *               projectId: { type: string }
 *               propertyId: { type: string }
 *               apartmentId: { type: string }
 *               clientId: { type: string }
 *               leadId: { type: string }
 *               tags: { type: string, description: 'JSON array or comma-separated' }
 *               expiresAt: { type: string, format: date-time }
 *               fileUrl: { type: string, description: 'Optional if file uploaded' }
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DocumentCreate'
 *     responses:
 *       201:
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Document'
 */
router.get('/', getDocuments)
router.post('/', uploadSingle, createDocument)

/**
 * @swagger
 * /api/documents/{id}:
 *   get:
 *     summary: Get document by id
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Document
 *   put:
 *     summary: Update document metadata
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DocumentUpdate'
 *     responses:
 *       200:
 *         description: Updated
 *   delete:
 *     summary: Delete a document
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Deleted
 */
router.get('/:id', getDocumentById)
router.put('/:id', updateDocument)
router.delete('/:id', deleteDocument)

/**
 * @swagger
 * /api/documents/{id}/versions:
 *   post:
 *     summary: Upload a new version of a document (archives previous)
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [file]
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: New version created
 */
router.post('/:id/versions', uploadSingle, uploadNewVersion)

/**
 * @swagger
 * /api/documents/{id}/archive:
 *   post:
 *     summary: Archive a document
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Archived
 */
router.post('/:id/archive', archiveDocument)

export default router
