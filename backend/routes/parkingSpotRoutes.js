import express from 'express'
import {
  getParkingSpots,
  getParkingSpotById,
  createParkingSpot,
  updateParkingSpot,
  deleteParkingSpot
} from '../controllers/parkingSpotController.js'
import { protect, admin } from '../middleware/authMiddleware.js'

const router = express.Router()

/**
 * @swagger
 * tags:
 *   - name: ParkingSpots
 *     description: Cupos de parqueadero por edificio (proyectos tipo apartments). Código único por building.
 */

/**
 * @swagger
 * /api/parking-spots:
 *   get:
 *     summary: Listar parqueaderos (filtros opcionales)
 *     tags: [ParkingSpots]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: projectId
 *         schema: { type: string }
 *         description: Restringe a edificios de ese proyecto
 *       - in: query
 *         name: buildingId
 *         schema: { type: string }
 *       - in: query
 *         name: floorNumber
 *         schema: { type: integer, minimum: 1 }
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [available, assigned, reserved, blocked] }
 *       - in: query
 *         name: apartment
 *         schema: { type: string }
 *         description: ObjectId del apartamento asignado
 *     responses:
 *       200:
 *         description: Lista de cupos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ParkingSpot'
 *   post:
 *     summary: Crear cupo (admin)
 *     tags: [ParkingSpots]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ParkingSpotCreateBody'
 *     responses:
 *       201:
 *         description: Creado
 *       400:
 *         description: Validación / código duplicado en el edificio
 */
router.route('/')
  .get(protect, getParkingSpots)
  .post(protect, admin, createParkingSpot)

/**
 * @swagger
 * /api/parking-spots/{id}:
 *   get:
 *     summary: Detalle de un cupo
 *     tags: [ParkingSpots]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: OK
 *       404:
 *         description: No encontrado
 *   put:
 *     summary: Actualizar cupo (admin)
 *     tags: [ParkingSpots]
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
 *             $ref: '#/components/schemas/ParkingSpotUpdateBody'
 *     responses:
 *       200:
 *         description: OK
 *   delete:
 *     summary: Eliminar cupo (admin)
 *     tags: [ParkingSpots]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Eliminado
 */
router.route('/:id')
  .get(protect, getParkingSpotById)
  .put(protect, admin, updateParkingSpot)
  .delete(protect, admin, deleteParkingSpot)

export default router
