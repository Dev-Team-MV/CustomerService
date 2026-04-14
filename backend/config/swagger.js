import swaggerJsdoc from 'swagger-jsdoc'

// Server URL for Swagger "Try it out": use PUBLIC_URL when set (deployed), else localhost with dev port 5001
const serverPort = process.env.PORT || 5001
const serverUrl = process.env.PUBLIC_URL
  ? process.env.PUBLIC_URL.replace(/\/$/, '') // trim trailing slash
  : `http://localhost:${serverPort}`

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Customer Service API',
      version: '1.0.0',
      description:
        'API documentation for Customer Service Backend.\n\n' +
        'Acceso por proyecto: los residentes obtienen la lista en GET /api/users/me/projects. ' +
        'El campo opcional projectMemberships en User complementa el acceso derivado de propiedades/apartamentos.',
      contact: {
        name: 'API Support'
      }
    },
    servers: [
      {
        url: serverUrl,
        description: process.env.PUBLIC_URL
          ? (process.env.NODE_ENV === 'production' ? 'Production server' : 'Development server')
          : `Local (port ${serverPort})`
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
        ProjectMembership: {
          type: 'object',
          description: 'Acceso explícito a un proyecto (opcional). Se combina con el acceso derivado de Property / Apartment.',
          properties: {
            project: {
              type: 'string',
              description: 'Project ID (ref)'
            },
            role: {
              type: 'string',
              enum: ['resident', 'viewer'],
              description: 'resident = mismo nivel que dueño para UI; viewer = solo lectura (según implementes en front)'
            }
          }
        },
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
            projectMemberships: {
              type: 'array',
              items: { $ref: '#/components/schemas/ProjectMembership' },
              description: 'Membresías opcionales por proyecto (además de casas/apartamentos asignados)'
            },
            projects: {
              type: 'array',
              items: { $ref: '#/components/schemas/Project' },
              description: 'Proyectos derivados para UI/admin (P1/P2) según propiedades, apartamentos y memberships'
            },
            isActive: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        MyProjectsResponse: {
          type: 'array',
          description: 'Lista de proyectos accesibles para el usuario actual',
          items: {
            type: 'object',
            properties: {
              _id: { type: 'string' },
              name: { type: 'string' },
              slug: { type: 'string' },
              phase: { type: 'string', description: 'Ej. I, II' },
              type: { type: 'string', enum: ['residential_lots', 'apartments', 'other'] }
            }
          }
        },
        Project: {
          type: 'object',
          properties: {
            _id: { type: 'string', description: 'Project ID' },
            name: { type: 'string', description: 'Legacy display name (optional)' },
            slug: { type: 'string', description: 'Unique slug (e.g. lakewood-oaks-on-lake-conroe-phase-I)' },
            phase: { type: 'string', description: 'Phase identifier (e.g. I, II)' },
            title: {
              type: 'object',
              description: 'Localized title',
              properties: { en: { type: 'string' }, es: { type: 'string' } }
            },
            subtitle: {
              type: 'object',
              properties: { en: { type: 'string' }, es: { type: 'string' } }
            },
            description: {
              type: 'object',
              properties: { en: { type: 'string' }, es: { type: 'string' } }
            },
            fullDescription: {
              type: 'object',
              properties: { en: { type: 'string' }, es: { type: 'string' } }
            },
            image: { type: 'string', description: 'Main image URL' },
            gallery: { type: 'array', items: { type: 'string' }, description: 'Gallery image URLs' },
            features: {
              type: 'object',
              description: 'Localized feature lists',
              properties: {
                en: { type: 'array', items: { type: 'string' } },
                es: { type: 'array', items: { type: 'string' } }
              }
            },
            type: { type: 'string', enum: ['residential_lots', 'apartments', 'other'] },
            status: { type: 'string', enum: ['active', 'inactive', 'coming_soon', 'sold_out'] },
            isActive: { type: 'boolean' },
            externalUrl: { type: 'string', description: 'External project URL' },
            location: { type: 'string' },
            area: { type: 'string', description: 'e.g. 250,000 sq ft' },
            videos: { type: 'array', items: { type: 'string' }, description: 'Video URLs' },
            outdoorAmenitySections: {
              type: 'array',
              description:
                'Amenidades exteriores por sección (keys permitidas vía GET /api/projects/outdoor-amenity-keys). Phase2 / por proyecto.',
              items: { $ref: '#/components/schemas/OutdoorAmenitySection' }
            },
            communitySpaces: {
              type: 'array',
              description: 'Espacio comunitario Ágora (exterior + planos) por proyecto',
              items: { $ref: '#/components/schemas/CommunitySpace' }
            },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        ImageItem: {
          type: 'object',
          description: 'Imagen con visibilidad (isPublic false = requiere token para ver)',
          properties: {
            url: { type: 'string', description: 'Path GCS o URL; el API puede devolver signed URL' },
            isPublic: { type: 'boolean', default: true }
          }
        },
        OutdoorAmenitySection: {
          type: 'object',
          properties: {
            key: {
              type: 'string',
              description: 'Identificador de sección (ej. parks, dog-park). Minúsculas, slug-style.',
              example: 'parks'
            },
            images: {
              type: 'array',
              items: { $ref: '#/components/schemas/ImageItem' }
            }
          }
        },
        CommunityPlanoItem: {
          type: 'object',
          description: 'Plano o PDF (url + visibilidad + nombre opcional)',
          properties: {
            url: { type: 'string' },
            isPublic: { type: 'boolean', default: true },
            name: { type: 'string', nullable: true }
          }
        },
        CommunitySpaceSections: {
          type: 'object',
          properties: {
            exterior: {
              type: 'object',
              properties: {
                title: {
                  type: 'object',
                  properties: { en: { type: 'string' }, es: { type: 'string' } }
                },
                images: { type: 'array', items: { $ref: '#/components/schemas/ImageItem' } }
              }
            },
            planos: {
              type: 'object',
              properties: {
                items: { type: 'array', items: { $ref: '#/components/schemas/CommunityPlanoItem' } }
              }
            }
          }
        },
        CommunitySpace: {
          type: 'object',
          properties: {
            id: { type: 'string', enum: ['agora'] },
            label: { type: 'string', example: 'Ágora' },
            sections: { $ref: '#/components/schemas/CommunitySpaceSections' }
          }
        },
        CommunitySpacesListPayload: {
          type: 'object',
          properties: {
            projectId: { type: 'string' },
            slug: { type: 'string' },
            spaces: { type: 'array', items: { $ref: '#/components/schemas/CommunitySpace' } }
          }
        },
        CommunitySpacePayload: {
          type: 'object',
          properties: {
            projectId: { type: 'string' },
            slug: { type: 'string' },
            space: { $ref: '#/components/schemas/CommunitySpace' }
          }
        },
        CommunitySpaceUpsertBody: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              enum: ['agora'],
              description: 'Opcional; si se envía debe coincidir con spaceId en la URL (agora)'
            },
            label: { type: 'string' },
            sections: { $ref: '#/components/schemas/CommunitySpaceSections' }
          }
        },
        OutdoorAmenityKeysList: {
          type: 'object',
          properties: {
            keys: {
              type: 'array',
              items: { type: 'string' },
              description: 'Lista completa permitida (built-in + extraKeys persistidas)'
            },
            builtIn: { type: 'array', items: { type: 'string' }, description: 'Keys definidas en código' },
            extraKeys: { type: 'array', items: { type: 'string' }, description: 'Keys añadidas vía POST' }
          }
        },
        AddOutdoorAmenityKeysRequest: {
          type: 'object',
          description: 'Usar keys (array) o key (string), no ambos obligatorios',
          properties: {
            keys: { type: 'array', items: { type: 'string' }, example: ['dog-park', 'transit-hub'] },
            key: { type: 'string', example: 'dog-park' }
          }
        },
        AddOutdoorAmenityKeysResponse: {
          type: 'object',
          properties: {
            message: { type: 'string' },
            added: { type: 'array', items: { type: 'string' } },
            keys: { type: 'array', items: { type: 'string' } },
            builtIn: { type: 'array', items: { type: 'string' } },
            extraKeys: { type: 'array', items: { type: 'string' } }
          }
        },
        ProjectOutdoorAmenitiesPayload: {
          type: 'object',
          properties: {
            projectId: { type: 'string' },
            slug: { type: 'string' },
            outdoorAmenitySections: {
              type: 'array',
              items: { $ref: '#/components/schemas/OutdoorAmenitySection' }
            }
          }
        },
        Lot: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            project: { type: 'string', description: 'Project ID (ref)' },
            number: { type: 'string' },
            color: { type: 'string', description: 'Lot color (e.g. hex, name)' },
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
          description: 'Pago/comprobante. Exactamente uno de property o apartment.',
          properties: {
            _id: { type: 'string' },
            property: { type: 'string', description: 'Property ID (lotes/casas). Mutually exclusive with apartment.' },
            apartment: { type: 'string', description: 'Apartment ID (phase 2). Mutually exclusive with property.' },
            amount: { type: 'number' },
            date: { type: 'string', format: 'date' },
            support: { type: 'string' },
            urls: { type: 'array', items: { type: 'string' }, description: 'Paths or URLs de comprobantes' },
            status: { type: 'string', enum: ['pending', 'signed', 'rejected'] },
            type: {
              type: 'string',
              enum: [
                'initial down payment',
                'complementary down payment',
                'monthly payment',
                'additional payment',
                'closing payment'
              ]
            },
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
            project: { type: 'string', description: 'ID del proyecto (alcance del grupo)' },
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
