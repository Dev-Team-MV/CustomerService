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
        Project: {
          type: 'object',
          properties: {
            _id: { type: 'string', description: 'Project ID' },
            name: { type: 'string', description: 'Display name' },
            slug: { type: 'string', description: 'Unique slug (e.g. lakewood, isq)' },
            type: { type: 'string', enum: ['residential_lots', 'apartments', 'other'] },
            isActive: { type: 'boolean' },
            description: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        Lot: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            project: { type: 'string', description: 'Project ID (ref)' },
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
            project: { type: 'string', description: 'Project ID (ref)' },
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
            project: { type: 'string', description: 'Project ID (ref)' },
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
            project: { type: 'string', description: 'Project ID (ref)' },
            lot: { type: 'string' },
            model: { type: 'string' },
            facade: { type: 'string' },
            users: { type: 'array', items: { type: 'string' }, description: 'Owner user IDs (at least one required)' },
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
        ClubHouse: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            exterior: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  url: { type: 'string', description: 'Image URL' },
                  isPublic: { type: 'boolean', description: 'true = mostrar sin token (pública), false = requiere token' },
                  name: { type: 'string', description: 'Optional custom name for UI' }
                }
              },
              description: 'Exterior images (cada una con url, isPublic, name opcional)'
            },
            blueprints: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  url: { type: 'string' },
                  isPublic: { type: 'boolean' },
                  name: { type: 'string' }
                }
              },
              description: 'Blueprint images (url, isPublic, name opcional)'
            },
            deck: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  url: { type: 'string' },
                  isPublic: { type: 'boolean' },
                  name: { type: 'string' }
                }
              },
              description: 'Deck images (url, isPublic, name opcional)'
            },
            interior: {
              type: 'object',
              additionalProperties: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    url: { type: 'string' },
                    isPublic: { type: 'boolean' },
                    name: { type: 'string' }
                  }
                }
              },
              description: 'Amenity name -> array of { url, isPublic } (e.g. Reception, Managers Office, Conference Room)'
            },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        Error: {
          type: 'object',
          properties: {
            message: { type: 'string' }
          }
        },
        CrmBalance: {
          type: 'object',
          properties: {
            byProject: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  projectId: { type: 'string' },
                  name: { type: 'string' },
                  slug: { type: 'string' },
                  totalCollected: { type: 'number' },
                  totalPending: { type: 'number' }
                }
              }
            },
            global: {
              type: 'object',
              properties: {
                totalCollected: { type: 'number' },
                totalPending: { type: 'number' }
              }
            }
          }
        },
        CrmClients: {
          type: 'object',
          properties: {
            clients: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  _id: { type: 'string' },
                  firstName: { type: 'string' },
                  lastName: { type: 'string' },
                  email: { type: 'string' },
                  phoneNumber: { type: 'string' },
                  propertyCount: { type: 'number' }
                }
              }
            },
            total: { type: 'number' }
          }
        },
        FamilyGroupMember: {
          type: 'object',
          properties: {
            user: { $ref: '#/components/schemas/User' },
            role: { type: 'string', enum: ['admin', 'member'], description: 'admin = puede gestionar el grupo y compartir propiedades con el grupo' }
          }
        },
        FamilyGroup: {
          type: 'object',
          properties: {
            _id: { type: 'string', description: 'Family group ID' },
            name: { type: 'string', description: 'Nombre del grupo' },
            createdBy: { $ref: '#/components/schemas/User', description: 'Usuario que creó el grupo (siempre es miembro implícito)' },
            members: {
              type: 'array',
              items: { $ref: '#/components/schemas/FamilyGroupMember' },
              description: 'Miembros añadidos al grupo (el creador no está aquí, está en createdBy)'
            },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        }
      }
    }
  },
  apis: ['./routes/*.js', './server.js']
}

const swaggerSpec = swaggerJsdoc(options)

export default swaggerSpec
