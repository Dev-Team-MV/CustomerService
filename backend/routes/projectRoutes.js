import express from 'express'
import {
  getAllProjects,
  getProjectById,
  getProjectBySlug,
  getOutdoorAmenityKeys,
  addOutdoorAmenityKeys,
  getProjectOutdoorAmenities,
  getProjectOutdoorAmenitiesBySlug,
  updateProjectOutdoorAmenities,
  createProject,
  updateProject,
  deleteProject
} from '../controllers/projectController.js'
import {
  getCommunitySpaces,
  getCommunitySpacesBySlug,
  getCommunitySpaceById,
  getCommunitySpaceBySlug,
  upsertCommunitySpace
} from '../controllers/communitySpaceController.js'
import {
  getProjectCatalogConfig,
  upsertProjectCatalogConfig,
  publishProjectCatalogConfig
} from '../controllers/projectCatalogConfigController.js'
import {
  getProjectVariables,
  createProjectVariable,
  updateProjectVariable,
  deleteProjectVariable
} from '../controllers/projectVariableController.js'
import { downloadProjectStatementPdf } from '../controllers/accountStatementController.js'
import { protect, admin } from '../middleware/authMiddleware.js'

const router = express.Router()

// Debug: confirm router is mounted (GET /api/projects/ping)
router.get('/ping', (req, res) => res.json({ ok: true, message: 'projects router mounted' }))

/**
 * @swagger
 * /api/projects/outdoor-amenity-keys:
 *   get:
 *     summary: Listar keys permitidas para outdoorAmenitySections (built-in + extras en BD)
 *     description: |
 *       `keys` es la unión ordenada. Las extras se añaden con POST (admin).
 *       Usar estas keys en `outdoorAmenitySections[].key` al actualizar el proyecto.
 *     tags: [Projects]
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/OutdoorAmenityKeysList'
 *   post:
 *     summary: Añadir keys extra (persistidas; solo admin)
 *     description: |
 *       Formato slug: minúsculas, números, guiones (ej. `dog-park`). Duplicados o ya existentes → 200 sin error.
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AddOutdoorAmenityKeysRequest'
 *     responses:
 *       201:
 *         description: Se añadieron nuevas keys
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AddOutdoorAmenityKeysResponse'
 *       200:
 *         description: Nada nuevo que añadir (todas ya estaban permitidas)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AddOutdoorAmenityKeysResponse'
 *       400:
 *         description: Formato de key inválido
 */
router.get('/outdoor-amenity-keys', getOutdoorAmenityKeys)
router.post('/outdoor-amenity-keys', protect, admin, addOutdoorAmenityKeys)

/**
 * @swagger
 * /api/projects:
 *   get:
 *     summary: Get all projects
 *     tags: [Projects]
 *     parameters:
 *       - in: query
 *         name: activeOnly
 *         schema:
 *           type: string
 *           enum: ['true', '1']
 *         description: If set, only active projects are returned
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive, coming_soon, sold_out]
 *         description: Filter by project status
 *     responses:
 *       200:
 *         description: List of projects
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Project'
 *   post:
 *     summary: Create a new project (Admin only)
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - slug
 *             properties:
 *               slug:
 *                 type: string
 *                 description: Unique slug (e.g. lakewood-oaks-on-lake-conroe-phase-I)
 *               name:
 *                 type: string
 *               phase:
 *                 type: string
 *                 example: 'I'
 *               title:
 *                 type: object
 *                 properties:
 *                   en: { type: string }
 *                   es: { type: string }
 *               subtitle:
 *                 type: object
 *                 properties:
 *                   en: { type: string }
 *                   es: { type: string }
 *               description:
 *                 type: object
 *                 properties:
 *                   en: { type: string }
 *                   es: { type: string }
 *               fullDescription:
 *                 type: object
 *                 properties:
 *                   en: { type: string }
 *                   es: { type: string }
 *               image:
 *                 type: string
 *                 description: Main image URL
 *               logo:
 *                 type: string
 *                 description: Project logo URL
 *               brandColors:
 *                 type: array
 *                 description: Brand palette (primary, secondary, accent, gradient, etc.)
 *                 items:
 *                   type: object
 *                   required: [key, value]
 *                   properties:
 *                     key:
 *                       type: string
 *                       example: primary
 *                       description: Color role identifier (e.g. primary, secondary, accent, gradient)
 *                     value:
 *                       type: string
 *                       example: '#333F1F'
 *                       description: Hex, rgb/rgba, or CSS gradient value
 *               gallery:
 *                 type: array
 *                 items: { type: string }
 *                 description: Gallery image URLs
 *               features:
 *                 type: object
 *                 properties:
 *                   en: { type: array, items: { type: string } }
 *                   es: { type: array, items: { type: string } }
 *               type:
 *                 type: string
 *                 enum: [residential_lots, apartments, other]
 *               facadeEnabled:
 *                 type: boolean
 *                 description: Si es false, no se usa fachada en propiedades/cotizaciones del proyecto
 *               status:
 *                 type: string
 *                 enum: [active, inactive, coming_soon, sold_out]
 *               isActive:
 *                 type: boolean
 *               externalUrl:
 *                 type: string
 *               location:
 *                 type: string
 *               area:
 *                 type: string
 *               videos:
 *                 type: array
 *                 items: { type: string }
 *     responses:
 *       201:
 *         description: Project created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Project'
 */
router.route('/')
  .get(getAllProjects)
  .post(protect, admin, createProject)

// Also handle base path when Express passes '' (no leading slash) to the router
router.post('', protect, admin, createProject)

/**
 * @swagger
 * /api/projects/slug/{slug}:
 *   get:
 *     summary: Get project by slug
 *     tags: [Projects]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Project details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Project'
 *       404:
 *         description: Project not found
 */
router.get('/slug/:slug', getProjectBySlug)

/**
 * @swagger
 * /api/projects/slug/{slug}/outdoor-amenities:
 *   get:
 *     summary: Amenidades exteriores del proyecto por slug (ej. phase2)
 *     description: Devuelve secciones con imágenes; URLs pueden venir firmadas (GCS).
 *     tags: [Projects]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         example: phase2
 *     responses:
 *       200:
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProjectOutdoorAmenitiesPayload'
 *       404:
 *         description: Project not found
 */
router.get('/slug/:slug/outdoor-amenities', getProjectOutdoorAmenitiesBySlug)

/**
 * @swagger
 * /api/projects/slug/{slug}/community-spaces:
 *   get:
 *     summary: Listar espacios comunitarios del proyecto (Ágora) por slug
 *     description: Solo secciones exterior y planos. Público.
 *     tags: [Projects]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/CommunitySpacesListPayload' }
 *       404:
 *         description: Project not found
 */
router.get('/slug/:slug/community-spaces', getCommunitySpacesBySlug)

/**
 * @swagger
 * /api/projects/slug/{slug}/community-spaces/{spaceId}:
 *   get:
 *     summary: Espacio Ágora por slug y spaceId (agora)
 *     tags: [Projects]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema: { type: string }
 *       - in: path
 *         name: spaceId
 *         required: true
 *         schema: { type: string, enum: [agora] }
 *     responses:
 *       200:
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/CommunitySpacePayload' }
 *       404:
 *         description: Not found
 */
router.get('/slug/:slug/community-spaces/:spaceId', getCommunitySpaceBySlug)

/**
 * @swagger
 * /api/projects/{id}/catalog-config:
 *   get:
 *     summary: Obtener configuración de catálogo por proyecto (versión activa o última)
 *     tags: [Projects]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *       - in: query
 *         name: version
 *         schema: { type: integer }
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [draft, published, archived] }
 *       - in: query
 *         name: activeOnly
 *         schema: { type: string, enum: ['true', '1'] }
 *     responses:
 *       200:
 *         description: Configuración encontrada
 *       404:
 *         description: Project/config no encontrado
 *   post:
 *     summary: Crear o actualizar configuración de catálogo (admin)
 *     tags: [Projects]
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
 *             $ref: '#/components/schemas/ProjectCatalogConfigUpsertRequest'
 *     responses:
 *       201:
 *         description: Config guardada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProjectCatalogConfig'
 */
router.get('/:id/catalog-config', getProjectCatalogConfig)
router.post('/:id/catalog-config', protect, admin, upsertProjectCatalogConfig)
router.put('/:id/catalog-config', protect, admin, upsertProjectCatalogConfig)

/**
 * @swagger
 * /api/projects/{id}/catalog-config/publish:
 *   post:
 *     summary: Publicar una versión del catálogo (admin)
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PublishProjectCatalogConfigRequest'
 *     responses:
 *       200:
 *         description: Publicado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PublishProjectCatalogConfigResponse'
 */
router.post('/:id/catalog-config/publish', protect, admin, publishProjectCatalogConfig)
router.get('/:id/account-statement/pdf', protect, downloadProjectStatementPdf)

/**
 * @swagger
 * /api/projects/{id}/variables:
 *   get:
 *     summary: Listar variables de mensajes del proyecto
 *     tags: [Projects]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *       - in: query
 *         name: categoria
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Lista de variables del proyecto
 *   post:
 *     summary: Crear variable de mensaje del proyecto (admin)
 *     tags: [Projects]
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
 *             required: [name, recorrido, categoria]
 *             properties:
 *               name: { type: string, example: firstName }
 *               recorrido: { type: string, example: user.firstName }
 *               categoria: { type: string, example: Usuario }
 *     responses:
 *       201:
 *         description: Variable creada
 */
router.get('/:id/variables', getProjectVariables)
router.post('/:id/variables', protect, admin, createProjectVariable)

/**
 * @swagger
 * /api/projects/{id}/variables/{variableId}:
 *   put:
 *     summary: Actualizar variable de mensaje del proyecto (admin)
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *   delete:
 *     summary: Eliminar variable de mensaje del proyecto (admin)
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 */
router.put('/:id/variables/:variableId', protect, admin, updateProjectVariable)
router.delete('/:id/variables/:variableId', protect, admin, deleteProjectVariable)

/**
 * @swagger
 * /api/projects/{id}:
 *   get:
 *     summary: Get project by ID
 *     tags: [Projects]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Project details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Project'
 *       404:
 *         description: Project not found
 *   put:
 *     summary: Update project (Admin only)
 *     tags: [Projects]
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
 *               name: { type: string }
 *               slug: { type: string }
 *               phase: { type: string }
 *               title: { type: object, properties: { en: { type: string }, es: { type: string } } }
 *               subtitle: { type: object, properties: { en: { type: string }, es: { type: string } } }
 *               description: { type: object, properties: { en: { type: string }, es: { type: string } } }
 *               fullDescription: { type: object, properties: { en: { type: string }, es: { type: string } } }
 *               image: { type: string }
 *               logo: { type: string, description: Project logo URL }
 *               brandColors:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     key: { type: string, example: primary }
 *                     value: { type: string, example: '#8CA551' }
 *               gallery: { type: array, items: { type: string } }
 *               features: { type: object, properties: { en: { type: array }, es: { type: array } } }
 *               type: { type: string, enum: [residential_lots, apartments, other] }
 *               facadeEnabled: { type: boolean, description: Si es false, no se usa fachada en propiedades/cotizaciones del proyecto }
 *               status: { type: string, enum: [active, inactive, coming_soon, sold_out] }
 *               isActive: { type: boolean }
 *               externalUrl: { type: string }
 *               location: { type: string }
 *               area: { type: string }
 *               videos: { type: array, items: { type: string } }
 *     responses:
 *       200:
 *         description: Project updated
 *       404:
 *         description: Project not found
 *   delete:
 *     summary: Delete project (Admin only)
 *     tags: [Projects]
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
 *         description: Project deleted
 *       404:
 *         description: Project not found
 */
router.route('/:id')
  .get(getProjectById)
  .put(protect, admin, updateProject)
  .delete(protect, admin, deleteProject)

/**
 * @swagger
 * /api/projects/{id}/outdoor-amenities:
 *   get:
 *     summary: Amenidades exteriores del proyecto por ID
 *     tags: [Projects]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProjectOutdoorAmenitiesPayload'
 *       404:
 *         description: Project not found
 *   put:
 *     summary: Reemplazar outdoorAmenitySections del proyecto (admin)
 *     description: |
 *       Cada `key` debe existir en GET /api/projects/outdoor-amenity-keys.
 *       Sustituye todo el array de secciones.
 *     tags: [Projects]
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
 *               - outdoorAmenitySections
 *             properties:
 *               outdoorAmenitySections:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/OutdoorAmenitySection'
 *     responses:
 *       200:
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProjectOutdoorAmenitiesPayload'
 *       400:
 *         description: Keys no permitidas o body inválido
 *       404:
 *         description: Project not found
 */
router.get('/:id/outdoor-amenities', getProjectOutdoorAmenities)
router.put('/:id/outdoor-amenities', protect, admin, updateProjectOutdoorAmenities)

/**
 * @swagger
 * /api/projects/{id}/community-spaces:
 *   get:
 *     summary: Listar espacios comunitarios por projectId
 *     tags: [Projects]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/CommunitySpacesListPayload' }
 *       404:
 *         description: Project not found
 */
router.get('/:id/community-spaces', getCommunitySpaces)

/**
 * @swagger
 * /api/projects/{id}/community-spaces/{spaceId}:
 *   get:
 *     summary: Obtener un espacio comunitario por projectId
 *     tags: [Projects]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *       - in: path
 *         name: spaceId
 *         required: true
 *         schema: { type: string, enum: [agora] }
 *     responses:
 *       200:
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/CommunitySpacePayload' }
 *       404:
 *         description: Not found
 *   put:
 *     summary: Crear o actualizar Ágora (admin)
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *       - in: path
 *         name: spaceId
 *         required: true
 *         schema: { type: string, enum: [agora] }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/CommunitySpaceUpsertBody' }
 *     responses:
 *       200:
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/CommunitySpacePayload' }
 *       400:
 *         description: Invalid body or id mismatch
 */
router.get('/:id/community-spaces/:spaceId', getCommunitySpaceById)
router.put('/:id/community-spaces/:spaceId', protect, admin, upsertCommunitySpace)

export default router
