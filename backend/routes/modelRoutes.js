import express from 'express'
import {
  getAllModels,
  getModelById,
  createModel,
  updateModel,
  deleteModel,
  getModelPricingOptions
} from '../controllers/modelController.js'
import {
  getModelBalconies,
  addModelBalcony,
  updateModelBalcony,
  deleteModelBalcony
} from '../controllers/balconyController.js'
import {
  getModelUpgrades,
  addModelUpgrade,
  updateModelUpgrade,
  deleteModelUpgrade
} from '../controllers/upgradeController.js'
import {
  getModelStorages,
  addModelStorage,
  updateModelStorage,
  deleteModelStorage
} from '../controllers/storageController.js'
import { protect, admin, requireTenant } from '../middleware/authMiddleware.js'

const router = express.Router()

/**
 * @swagger
 * /api/models:
 *   get:
 *     summary: Get all models
 *     tags: [Models]
 *     responses:
 *       200:
 *         description: List of models
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Model'
 *   post:
 *     summary: Create a new model (Admin only)
 *     tags: [Models]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - model
 *               - price
 *               - bedrooms
 *               - bathrooms
 *               - sqft
 *             properties:
 *               model:
 *                 type: string
 *               modelNumber:
 *                 type: string
 *               price:
 *                 type: number
 *               bedrooms:
 *                 type: number
 *               bathrooms:
 *                 type: number
 *               sqft:
 *                 type: number
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *               description:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [active, draft, inactive]
 *     responses:
 *       201:
 *         description: Model created
 */
router.route('/')
  .get(protect, requireTenant, getAllModels)
  .post(protect, requireTenant, admin, createModel)

/**
 * @swagger
 * /api/models/{id}:
 *   get:
 *     summary: Get model by ID
 *     tags: [Models]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Model details
 *       404:
 *         description: Model not found
 *   put:
 *     summary: Update model (Admin only)
 *     tags: [Models]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               model:
 *                 type: string
 *               modelNumber:
 *                 type: string
 *               price:
 *                 type: number
 *               bedrooms:
 *                 type: number
 *               bathrooms:
 *                 type: number
 *               sqft:
 *                 type: number
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *               description:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [active, draft, inactive]
 *     responses:
 *       200:
 *         description: Model updated
 *       404:
 *         description: Model not found
 *   delete:
 *     summary: Delete model (Admin only)
 *     tags: [Models]
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
 *         description: Model deleted
 *       404:
 *         description: Model not found
 */
router.route('/:id')
  .get(getModelById)
  .put(protect, admin, updateModel)
  .delete(protect, admin, deleteModel)

/**
 * @swagger
 * /api/models/{id}/pricing-options:
 *   get:
 *     summary: Get all pricing options for a model
 *     tags: [Models]
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
 *         description: Pricing options for the model
 *       404:
 *         description: Model not found
 */
router.route('/:id/pricing-options')
  .get(protect, requireTenant, getModelPricingOptions)

// ========== BALCONIES ROUTES ==========

/**
 * @swagger
 * /api/models/{id}/balconies:
 *   get:
 *     summary: Get all balconies for a model
 *     tags: [Models]
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
 *         description: List of balconies
 *       404:
 *         description: Model not found
 *   post:
 *     summary: Add a balcony to a model (Admin only)
 *     tags: [Models]
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
 *             type: object
 *             required:
 *               - name
 *               - price
 *             properties:
 *               name:
 *                 type: string
 *               price:
 *                 type: number
 *               description:
 *                 type: string
 *               sqft:
 *                 type: number
 *               status:
 *                 type: string
 *                 enum: [active, inactive]
 *     responses:
 *       201:
 *         description: Balcony added
 */
router.route('/:id/balconies')
  .get(protect, getModelBalconies)
  .post(protect, admin, addModelBalcony)

/**
 * @swagger
 * /api/models/{id}/balconies/{balconyId}:
 *   put:
 *     summary: Update a balcony (Admin only)
 *     tags: [Models]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: balconyId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Balcony updated
 *       404:
 *         description: Model or Balcony not found
 *   delete:
 *     summary: Delete a balcony (Admin only)
 *     tags: [Models]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: balconyId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Balcony deleted
 *       404:
 *         description: Model or Balcony not found
 */
router.route('/:id/balconies/:balconyId')
  .put(protect, requireTenant, admin, updateModelBalcony)
  .delete(protect, requireTenant, admin, deleteModelBalcony)

// ========== UPGRADES ROUTES ==========

/**
 * @swagger
 * /api/models/{id}/upgrades:
 *   get:
 *     summary: Get all upgrades for a model
 *     tags: [Models]
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
 *         description: List of upgrades
 *       404:
 *         description: Model not found
 *   post:
 *     summary: Add an upgrade to a model (Admin only)
 *     tags: [Models]
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
 *             type: object
 *             required:
 *               - name
 *               - price
 *             properties:
 *               name:
 *                 type: string
 *               price:
 *                 type: number
 *               description:
 *                 type: string
 *               features:
 *                 type: array
 *                 items:
 *                   type: string
 *               status:
 *                 type: string
 *                 enum: [active, inactive]
 *     responses:
 *       201:
 *         description: Upgrade added
 */
router.route('/:id/upgrades')
  .get(protect, getModelUpgrades)
  .post(protect, admin, addModelUpgrade)

/**
 * @swagger
 * /api/models/{id}/upgrades/{upgradeId}:
 *   put:
 *     summary: Update an upgrade (Admin only)
 *     tags: [Models]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: upgradeId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Upgrade updated
 *       404:
 *         description: Model or Upgrade not found
 *   delete:
 *     summary: Delete an upgrade (Admin only)
 *     tags: [Models]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: upgradeId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Upgrade deleted
 *       404:
 *         description: Model or Upgrade not found
 */
router.route('/:id/upgrades/:upgradeId')
  .put(protect, requireTenant, admin, updateModelUpgrade)
  .delete(protect, requireTenant, admin, deleteModelUpgrade)

// ========== STORAGES ROUTES ==========

/**
 * @swagger
 * /api/models/{id}/storages:
 *   get:
 *     summary: Get all storages for a model
 *     tags: [Models]
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
 *         description: List of storages
 *       404:
 *         description: Model not found
 *   post:
 *     summary: Add a storage to a model (Admin only)
 *     tags: [Models]
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
 *             type: object
 *             required:
 *               - name
 *               - price
 *             properties:
 *               name:
 *                 type: string
 *               price:
 *                 type: number
 *               description:
 *                 type: string
 *               sqft:
 *                 type: number
 *               status:
 *                 type: string
 *                 enum: [active, inactive]
 *     responses:
 *       201:
 *         description: Storage added
 */
router.route('/:id/storages')
  .get(protect, getModelStorages)
  .post(protect, admin, addModelStorage)

/**
 * @swagger
 * /api/models/{id}/storages/{storageId}:
 *   put:
 *     summary: Update a storage (Admin only)
 *     tags: [Models]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: storageId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Storage updated
 *       404:
 *         description: Model or Storage not found
 *   delete:
 *     summary: Delete a storage (Admin only)
 *     tags: [Models]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: storageId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Storage deleted
 *       404:
 *         description: Model or Storage not found
 */
router.route('/:id/storages/:storageId')
  .put(protect, requireTenant, admin, updateModelStorage)
  .delete(protect, requireTenant, admin, deleteModelStorage)

export default router
