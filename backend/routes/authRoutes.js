import express from 'express'
import { register, login, getProfile, changePassword, setupPassword, verifySetupToken } from '../controllers/authController.js'
import { protect } from '../middleware/authMiddleware.js'

const router = express.Router()

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     description: |
 *       Public registration (no auth required) OR Admin creating user without password (auth required).
 *       If skipPasswordSetup is true, requires admin authentication and sends SMS with setup link.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - lastName
 *               - email
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 description: Required if skipPasswordSetup is false or not provided
 *               phoneNumber:
 *                 type: string
 *                 description: Required if skipPasswordSetup is true (for SMS)
 *               birthday:
 *                 type: string
 *                 format: date
 *               role:
 *                 type: string
 *                 enum: [superadmin, admin, user]
 *                 default: user
 *               skipPasswordSetup:
 *                 type: boolean
 *                 description: If true (admin only), user will receive SMS with setup link instead of password. Requires admin authentication.
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: User already exists or invalid data
 *       401:
 *         description: Unauthorized (admin required for skipPasswordSetup)
 *       403:
 *         description: Admin access required for skipPasswordSetup
 */
router.post('/register', register)

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user with email or phone number
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email address (required if phoneNumber is not provided)
 *               phoneNumber:
 *                 type: string
 *                 description: Phone number in E.164 format (required if email is not provided)
 *               password:
 *                 type: string
 *                 description: User password
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Missing email/phoneNumber or password
 *       401:
 *         description: Invalid credentials
 *       403:
 *         description: Password not set (requires password setup)
 */
router.post('/login', login)

/**
 * @swagger
 * /api/auth/profile:
 *   get:
 *     summary: Get current user profile
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 */
router.get('/profile', protect, getProfile)

/**
 * @swagger
 * /api/auth/change-password:
 *   put:
 *     summary: Change user password
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 description: Current password
 *               newPassword:
 *                 type: string
 *                 minLength: 6
 *                 description: New password (minimum 6 characters)
 *     responses:
 *       200:
 *         description: Password changed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Password changed successfully
 *       400:
 *         description: Invalid request (missing fields or password too short)
 *       401:
 *         description: Current password is incorrect
 *       404:
 *         description: User not found
 */
router.put('/change-password', protect, changePassword)

/**
 * @swagger
 * /api/auth/setup-password/{token}:
 *   post:
 *     summary: Set initial password using setup token
 *     tags: [Auth]
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: Setup token received via SMS
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - password
 *             properties:
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 description: New password (minimum 6 characters)
 *     responses:
 *       200:
 *         description: Password set successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Password set successfully. You can now login.
 *                 token:
 *                   type: string
 *                   description: JWT token for immediate login
 *                 user:
 *                   type: object
 *                   description: User information
 *       400:
 *         description: Invalid or expired token, or password too short
 */
router.post('/setup-password/:token', setupPassword)

/**
 * @swagger
 * /api/auth/verify-setup-token/{token}:
 *   get:
 *     summary: Verify if setup token is valid
 *     tags: [Auth]
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: Setup token to verify
 *     responses:
 *       200:
 *         description: Token is valid
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 valid:
 *                   type: boolean
 *                   example: true
 *                 user:
 *                   type: object
 *                   properties:
 *                     firstName:
 *                       type: string
 *                     lastName:
 *                       type: string
 *                     email:
 *                       type: string
 *       400:
 *         description: Invalid or expired token
 */
router.get('/verify-setup-token/:token', verifySetupToken)

export default router
