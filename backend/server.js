// Load environment variables FIRST before any other imports
import './config/env.js'

import express from 'express'
import cors from 'cors'
import swaggerUi from 'swagger-ui-express'
import swaggerSpec from './config/swagger.js'
import connectDB from './config/db.js'
import authRoutes from './routes/authRoutes.js'
import userRoutes from './routes/userRoutes.js'
import projectRoutes from './routes/projectRoutes.js'
import lotRoutes from './routes/lotRoutes.js'
import buildingRoutes from './routes/buildingRoutes.js'
import apartmentModelRoutes from './routes/apartmentModelRoutes.js'
import apartmentRoutes from './routes/apartmentRoutes.js'
import modelRoutes from './routes/modelRoutes.js'
import facadeRoutes from './routes/facadeRoutes.js'
import propertyRoutes from './routes/propertyRoutes.js'
import payloadRoutes from './routes/payloadRoutes.js'
import phaseRoutes from './routes/phaseRoutes.js'
import smsRoutes from './routes/smsRoutes.js'
import uploadRoutes from './routes/uploadRoutes.js'
import newsRoutes from './routes/newsRoutes.js'
import contractRoutes from './routes/contractRoutes.js'
import clubHouseRoutes from './routes/clubHouseRoutes.js'
import outdoorAmenitiesRoutes from './routes/outdoorAmenitiesRoutes.js'
import underConstructionRoutes from './routes/underConstructionRoutes.js'
import familyGroupRoutes from './routes/familyGroupRoutes.js'
import crmRoutes from './routes/crmRoutes.js'
import backupRoutes from './routes/backupRoutes.js'
import { startBackupScheduler } from './services/backupScheduler.js'

const app = express()

connectDB()

app.use(cors())
app.use(express.json({ limit: '100mb' })) // Increase JSON body size limit
app.use(express.urlencoded({ extended: true, limit: '100mb' })) // Increase URL-encoded body size limit

app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/projects', projectRoutes)
app.use('/api/lots', lotRoutes)
app.use('/api/buildings', buildingRoutes)
app.use('/api/apartment-models', apartmentModelRoutes)
app.use('/api/apartments', apartmentRoutes)
app.use('/api/models', modelRoutes)
app.use('/api/facades', facadeRoutes)
app.use('/api/properties', propertyRoutes)
app.use('/api/payloads', payloadRoutes)
app.use('/api/phases', phaseRoutes)
app.use('/api/sms', smsRoutes)
app.use('/api/upload', uploadRoutes)
app.use('/api/news', newsRoutes)
app.use('/api/contracts', contractRoutes)
app.use('/api/clubhouse', clubHouseRoutes)
app.use('/api/outdoor-amenities', outdoorAmenitiesRoutes)
app.use('/api/under-construction', underConstructionRoutes)
app.use('/api/family-groups', familyGroupRoutes)
app.use('/api/crm', crmRoutes)
app.use('/api/backup', backupRoutes)

// Start automatic GCS backup scheduler (if enabled)
startBackupScheduler()

// Swagger documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))

/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Health check endpoint
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Server is running
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: OK
 *                 message:
 *                   type: string
 *                   example: Server is running
 */
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' })
})

const PORT = process.env.PORT || 5001

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
