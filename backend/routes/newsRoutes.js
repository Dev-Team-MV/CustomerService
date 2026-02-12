import express from 'express'
import {
  getAllNews,
  getPublishedNews,
  getNewsById,
  createNews,
  updateNews,
  deleteNews
} from '../controllers/newsController.js'
import { protect, admin } from '../middleware/authMiddleware.js'

const router = express.Router()

/**
 * @swagger
 * /api/news:
 *   get:
 *     summary: Get all news articles (filter by category, status)
 *     tags: [News]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [draft, published, archived]
 *     responses:
 *       200:
 *         description: List of news articles
 *   post:
 *     summary: Create a new news article (Admin only)
 *     tags: [News]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               category:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [draft, published, archived]
 *               heroImage:
 *                 type: string
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *               contentBlocks:
 *                 type: array
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *               videos:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: News article created
 */
router
  .route('/')
  .get(protect, getAllNews)
  .post(protect, admin, createNews)

/**
 * @swagger
 * /api/news/published:
 *   get:
 *     summary: Get published news (public, no auth)
 *     tags: [News]
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of published news articles
 */
router.get('/published', getPublishedNews)

/**
 * @swagger
 * /api/news/{id}:
 *   get:
 *     summary: Get news article by ID
 *     tags: [News]
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
 *         description: News article details
 *       404:
 *         description: News article not found
 *   put:
 *     summary: Update news article (Admin only)
 *     tags: [News]
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
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               category:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [draft, published, archived]
 *               heroImage:
 *                 type: string
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *               contentBlocks:
 *                 type: array
 *               images:
 *                 type: array
 *               videos:
 *                 type: array
 *     responses:
 *       200:
 *         description: News article updated
 *       404:
 *         description: News article not found
 *   delete:
 *     summary: Delete news article (Admin only)
 *     tags: [News]
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
 *         description: News article deleted
 *       404:
 *         description: News article not found
 */
router
  .route('/:id')
  .get(protect, getNewsById)
  .put(protect, admin, updateNews)
  .delete(protect, admin, deleteNews)

export default router
