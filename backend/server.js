import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import swaggerUi from 'swagger-ui-express'
import swaggerSpec from './config/swagger.js'
import connectDB from './config/db.js'
import authRoutes from './routes/authRoutes.js'
import userRoutes from './routes/userRoutes.js'
import lotRoutes from './routes/lotRoutes.js'
import modelRoutes from './routes/modelRoutes.js'
import facadeRoutes from './routes/facadeRoutes.js'
import propertyRoutes from './routes/propertyRoutes.js'
import payloadRoutes from './routes/payloadRoutes.js'
import phaseRoutes from './routes/phaseRoutes.js'
import smsRoutes from './routes/smsRoutes.js'

dotenv.config()

const app = express()

connectDB()

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/lots', lotRoutes)
app.use('/api/models', modelRoutes)
app.use('/api/facades', facadeRoutes)
app.use('/api/properties', propertyRoutes)
app.use('/api/payloads', payloadRoutes)
app.use('/api/phases', phaseRoutes)
app.use('/api/sms', smsRoutes)

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

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
