import swaggerJsdoc from 'swagger-jsdoc'

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Customer Service API',
      version: '1.0.0',
      description: 'API documentation for Customer Service Backend',
      contact: {
        name: 'API Support'
      }
    },
    servers: [
      {
        url: 'http://localhost:5001',
        description: 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            email: { type: 'string', format: 'email' },
            phoneNumber: { type: 'string' },
            birthday: { type: 'string', format: 'date' },
            role: { type: 'string', enum: ['superadmin', 'admin', 'user'] },
            lots: { type: 'array', items: { type: 'string' } },
            isActive: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        Lot: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            number: { type: 'string' },
            price: { type: 'number' },
            status: { type: 'string', enum: ['available', 'pending', 'sold'] },
            assignedUser: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        Model: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            model: { type: 'string' },
            modelNumber: { type: 'string' },
            price: { type: 'number' },
            bedrooms: { type: 'number' },
            bathrooms: { type: 'number' },
            sqft: { type: 'number' },
            images: { type: 'array', items: { type: 'string' } },
            description: { type: 'string' },
            status: { type: 'string', enum: ['active', 'draft', 'inactive'] },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        Facade: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            model: { type: 'string' },
            title: { type: 'string' },
            url: { type: 'string' },
            price: { type: 'number' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        Property: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            lot: { type: 'string' },
            model: { type: 'string' },
            facade: { type: 'string' },
            user: { type: 'string' },
            price: { type: 'number' },
            pending: { type: 'number' },
            initialPayment: { type: 'number' },
            status: { type: 'string', enum: ['active', 'pending', 'sold', 'cancelled'] },
            saleDate: { type: 'string', format: 'date-time' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        Phase: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            property: { type: 'string' },
            phaseNumber: { type: 'number', minimum: 1, maximum: 9 },
            title: { type: 'string' },
            constructionPercentage: { type: 'number', minimum: 0, maximum: 100 },
            mediaItems: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  _id: { type: 'string' },
                  url: { type: 'string' },
                  title: { type: 'string' },
                  percentage: { type: 'number', minimum: 0, maximum: 100 },
                  mediaType: { type: 'string', enum: ['image', 'video'] }
                }
              }
            },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        Payload: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            property: { type: 'string' },
            amount: { type: 'number' },
            date: { type: 'string', format: 'date' },
            support: { type: 'string' },
            status: { type: 'string', enum: ['pending', 'signed', 'rejected'] },
            notes: { type: 'string' },
            processedBy: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        Error: {
          type: 'object',
          properties: {
            message: { type: 'string' }
          }
        }
      }
    }
  },
  apis: ['./routes/*.js', './server.js']
}

const swaggerSpec = swaggerJsdoc(options)

export default swaggerSpec
