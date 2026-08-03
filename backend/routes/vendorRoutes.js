import express from 'express'
import {
  getVendorCategories,
  getAllVendors,
  getVendorById,
  createVendor,
  updateVendor,
  deleteVendor
} from '../controllers/vendorController.js'
import { protect, admin } from '../middleware/authMiddleware.js'

const router = express.Router()

/**
 * @swagger
 * /api/vendors/categories:
 *   get:
 *     summary: Get vendor taxonomy (categories and subcategories with en/es labels)
 *     tags: [Vendors]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Taxonomy list for directory tabs/grid
 *       401:
 *         description: Unauthorized
 */
router.get('/categories', protect, getVendorCategories)

/**
 * @swagger
 * /api/vendors:
 *   get:
 *     summary: List vendors (filter by category, subcategory, project, location, search, status)
 *     tags: [Vendors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: subcategory
 *         schema:
 *           type: string
 *       - in: query
 *         name: projectId
 *         schema:
 *           type: string
 *         description: Returns project vendors plus general (projectId null). Use scope to narrow.
 *       - in: query
 *         name: scope
 *         schema:
 *           type: string
 *           enum: [project, general]
 *         description: project = only that projectId; general = only projectId null
 *       - in: query
 *         name: location
 *         schema:
 *           type: string
 *         description: Partial match on locations.formattedAddress
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Partial match on vendor name
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive]
 *         description: Non-staff default to active only
 *     responses:
 *       200:
 *         description: List of vendors
 *       401:
 *         description: Unauthorized
 *   post:
 *     summary: Create a vendor (Admin only)
 *     tags: [Vendors]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/VendorCreate'
 *     responses:
 *       201:
 *         description: Vendor created
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Not authorized as admin
 */
router
  .route('/')
  .get(protect, getAllVendors)
  .post(protect, admin, createVendor)

/**
 * @swagger
 * /api/vendors/{id}:
 *   get:
 *     summary: Get vendor by ID
 *     tags: [Vendors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Vendor details
 *       404:
 *         description: Vendor not found
 *   put:
 *     summary: Update vendor (Admin only)
 *     tags: [Vendors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/VendorUpdate'
 *     responses:
 *       200:
 *         description: Vendor updated
 *       404:
 *         description: Vendor not found
 *   delete:
 *     summary: Delete vendor (Admin only)
 *     tags: [Vendors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Vendor deleted
 *       404:
 *         description: Vendor not found
 */
router
  .route('/:id')
  .get(protect, getVendorById)
  .put(protect, admin, updateVendor)
  .delete(protect, admin, deleteVendor)

export default router
