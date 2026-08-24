import express from 'express'
import multer from 'multer'
import {
  getLoans,
  createLoan,
  getLoanDashboard,
  getLoanAlerts,
  getLoanById,
  updateLoan,
  deleteLoan,
  updateLoanStage,
  updateLoanStatus,
  updateLoanDocumentStatus,
  uploadLoanDocument,
  deleteLoanDocumentFile,
  updateLoanNextAction,
  addLoanNote,
  getLoanTimeline
} from '../controllers/loanController.js'
import { protect, superadmin } from '../middleware/authMiddleware.js'
import { logAction } from '../middleware/logAction.js'
import { fetchLoan } from '../utils/auditEntityFetchers.js'

const router = express.Router()

router.use(protect, superadmin)

const loanFileUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024, files: 1 }
})

const uploadLoanFile = (req, res, next) => {
  loanFileUpload.single('file')(req, res, (err) => {
    if (err) {
      return res.status(400).json({ message: err.message || 'Invalid file upload' })
    }
    next()
  })
}

/**
 * @swagger
 * /api/loans:
 *   get:
 *     summary: Listar loans (Superadmin only)
 *     tags: [Loans]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: projectId
 *         schema: { type: string }
 *       - in: query
 *         name: stage
 *         schema: { type: string }
 *       - in: query
 *         name: status
 *         schema: { type: string }
 *       - in: query
 *         name: assignedTo
 *         schema: { type: string }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *     responses:
 *       200:
 *         description: List of loans
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Not authorized as superadmin
 *   post:
 *     summary: Crear loan (Superadmin only)
 *     tags: [Loans]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             additionalProperties: true
 *     responses:
 *       201:
 *         description: Loan created
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Not authorized as superadmin
 */
router.get('/', getLoans)
router.post(
  '/',
  logAction({
    action: 'created',
    entity: 'Loan',
    getEntityId: (_, body) => body?._id
  }),
  createLoan
)

/**
 * @swagger
 * /api/loans/dashboard:
 *   get:
 *     summary: KPIs del dashboard (Superadmin only)
 *     tags: [Loans]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: projectId
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Dashboard KPIs
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Not authorized as superadmin
 */
router.get('/dashboard', getLoanDashboard)

/**
 * @swagger
 * /api/loans/alerts:
 *   get:
 *     summary: Alertas computadas (Superadmin only)
 *     tags: [Loans]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: projectId
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Computed alerts
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Not authorized as superadmin
 */
router.get('/alerts', getLoanAlerts)

/**
 * @swagger
 * /api/loans/{id}:
 *   get:
 *     summary: Detalle de loan (Superadmin only)
 *     tags: [Loans]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Loan detail
 *       404:
 *         description: Loan not found
 *   put:
 *     summary: Actualizar perfil (Superadmin only)
 *     tags: [Loans]
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
 *         application/json:
 *           schema:
 *             type: object
 *             additionalProperties: true
 *     responses:
 *       200:
 *         description: Loan updated
 *       404:
 *         description: Loan not found
 *   delete:
 *     summary: Eliminar loan (Superadmin only)
 *     tags: [Loans]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Loan deleted
 *       404:
 *         description: Loan not found
 */
router.get('/:id', getLoanById)
router.put(
  '/:id',
  logAction({ action: 'updated', entity: 'Loan', fetchBefore: fetchLoan }),
  updateLoan
)
router.delete(
  '/:id',
  logAction({
    action: 'deleted',
    entity: 'Loan',
    fetchBefore: fetchLoan,
    buildAfter: () => null
  }),
  deleteLoan
)

/**
 * @swagger
 * /api/loans/{id}/stage:
 *   put:
 *     summary: Cambiar pipeline stage (Superadmin only)
 *     tags: [Loans]
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
 *         application/json:
 *           schema:
 *             type: object
 *             required: [stage]
 *             properties:
 *               stage: { type: string }
 *     responses:
 *       200:
 *         description: Pipeline stage updated
 *       400:
 *         description: Invalid stage
 *       404:
 *         description: Loan not found
 */
router.put(
  '/:id/stage',
  logAction({
    action: 'stage_changed',
    entity: 'Loan',
    fetchBefore: fetchLoan,
    buildAfter: (_, body) => ({ stage: body?.stage })
  }),
  updateLoanStage
)

/**
 * @swagger
 * /api/loans/{id}/status:
 *   put:
 *     summary: Set/clear special status (Superadmin only)
 *     tags: [Loans]
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
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status: { type: string, nullable: true }
 *     responses:
 *       200:
 *         description: Special status updated
 *       404:
 *         description: Loan not found
 */
router.put(
  '/:id/status',
  logAction({
    action: 'updated',
    entity: 'Loan',
    fetchBefore: fetchLoan,
    buildAfter: (_, body) => ({ status: body?.status })
  }),
  updateLoanStatus
)

/**
 * @swagger
 * /api/loans/{id}/documents/{docType}:
 *   put:
 *     summary: Actualizar status de documento (Superadmin only)
 *     tags: [Loans]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *       - in: path
 *         name: docType
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status: { type: string }
 *     responses:
 *       200:
 *         description: Document status updated
 *       404:
 *         description: Loan or document type not found
 */
router.put(
  '/:id/documents/:docType',
  logAction({
    action: 'updated',
    entity: 'Loan',
    fetchBefore: fetchLoan,
    buildAfter: (req, body) => ({ docType: req.params.docType, status: body?.status })
  }),
  updateLoanDocumentStatus
)

/**
 * @swagger
 * /api/loans/{id}/documents/{docType}/upload:
 *   post:
 *     summary: Subir archivo de documento (Superadmin only)
 *     tags: [Loans]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *       - in: path
 *         name: docType
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
 *       200:
 *         description: Document file uploaded
 *       400:
 *         description: Invalid file upload
 *       404:
 *         description: Loan or document type not found
 */
router.post(
  '/:id/documents/:docType/upload',
  uploadLoanFile,
  logAction({
    action: 'updated',
    entity: 'Loan',
    fetchBefore: fetchLoan,
    buildAfter: (req) => ({ docType: req.params.docType, uploaded: true })
  }),
  uploadLoanDocument
)

/**
 * @swagger
 * /api/loans/{id}/documents/{docType}/file:
 *   delete:
 *     summary: Eliminar archivo (Superadmin only)
 *     tags: [Loans]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *       - in: path
 *         name: docType
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Document file deleted
 *       404:
 *         description: Loan, document type, or file not found
 */
router.delete(
  '/:id/documents/:docType/file',
  logAction({
    action: 'updated',
    entity: 'Loan',
    fetchBefore: fetchLoan,
    buildAfter: (req) => ({ docType: req.params.docType, file: null })
  }),
  deleteLoanDocumentFile
)

/**
 * @swagger
 * /api/loans/{id}/next-action:
 *   put:
 *     summary: Actualizar next action (Superadmin only)
 *     tags: [Loans]
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
 *         application/json:
 *           schema:
 *             type: object
 *             additionalProperties: true
 *     responses:
 *       200:
 *         description: Next action updated
 *       404:
 *         description: Loan not found
 */
router.put(
  '/:id/next-action',
  logAction({
    action: 'updated',
    entity: 'Loan',
    fetchBefore: fetchLoan
  }),
  updateLoanNextAction
)

/**
 * @swagger
 * /api/loans/{id}/notes:
 *   post:
 *     summary: Agregar nota (Superadmin only)
 *     tags: [Loans]
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
 *         application/json:
 *           schema:
 *             type: object
 *             required: [note]
 *             properties:
 *               note: { type: string }
 *     responses:
 *       201:
 *         description: Note added
 *       404:
 *         description: Loan not found
 */
router.post(
  '/:id/notes',
  logAction({
    action: 'updated',
    entity: 'Loan',
    fetchBefore: fetchLoan
  }),
  addLoanNote
)

/**
 * @swagger
 * /api/loans/{id}/timeline:
 *   get:
 *     summary: Timeline paginado (Superadmin only)
 *     tags: [Loans]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *     responses:
 *       200:
 *         description: Paginated timeline
 *       404:
 *         description: Loan not found
 */
router.get('/:id/timeline', getLoanTimeline)

export default router
