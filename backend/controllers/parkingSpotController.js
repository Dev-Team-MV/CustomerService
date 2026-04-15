import mongoose from 'mongoose'
import ParkingSpot from '../models/ParkingSpot.js'
import Building from '../models/Building.js'
import Apartment from '../models/Apartment.js'

const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(value)

const sameBuilding = (a, b) => String(a) === String(b)

export const getParkingSpots = async (req, res) => {
  try {
    const { projectId, buildingId, floorNumber, status, apartment } = req.query
    const filter = {}

    if (buildingId) {
      if (!isValidObjectId(buildingId)) {
        return res.status(400).json({ message: 'Invalid buildingId' })
      }
      filter.building = buildingId
    }

    if (projectId) {
      if (!isValidObjectId(projectId)) {
        return res.status(400).json({ message: 'Invalid projectId' })
      }
      const buildings = await Building.find({ project: projectId }).select('_id')
      const ids = buildings.map((b) => b._id)
      if (ids.length === 0) {
        return res.json([])
      }
      if (filter.building) {
        const allowed = ids.some((id) => sameBuilding(id, filter.building))
        if (!allowed) {
          return res.status(400).json({ message: 'buildingId does not belong to projectId' })
        }
      } else {
        filter.building = { $in: ids }
      }
    }

    if (floorNumber != null && floorNumber !== '') {
      const floor = Number(floorNumber)
      if (!Number.isFinite(floor) || floor < 1) {
        return res.status(400).json({ message: 'floorNumber must be a number >= 1' })
      }
      filter.floorNumber = floor
    }

    if (status) filter.status = status

    if (apartment) {
      if (!isValidObjectId(apartment)) {
        return res.status(400).json({ message: 'Invalid apartment id' })
      }
      filter.apartment = apartment
    }

    const spots = await ParkingSpot.find(filter)
      .populate('building', 'name section floors project')
      .populate('apartment', 'apartmentNumber floorNumber building')
      .sort({ building: 1, floorNumber: 1, code: 1 })

    res.json(spots)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const getParkingSpotById = async (req, res) => {
  try {
    const spot = await ParkingSpot.findById(req.params.id)
      .populate('building', 'name section floors project')
      .populate('apartment', 'apartmentNumber floorNumber building users')

    if (!spot) {
      return res.status(404).json({ message: 'Parking spot not found' })
    }
    res.json(spot)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const createParkingSpot = async (req, res) => {
  try {
    const {
      buildingId,
      building: buildingBody,
      floorNumber,
      code,
      spotType,
      status,
      apartment: apartmentId,
      notes
    } = req.body

    const buildId = buildingId || buildingBody
    if (!buildId) {
      return res.status(400).json({ message: 'buildingId (or building) is required' })
    }
    if (!isValidObjectId(buildId)) {
      return res.status(400).json({ message: 'Invalid building id' })
    }

    const building = await Building.findById(buildId)
    if (!building) {
      return res.status(404).json({ message: 'Building not found' })
    }

    const floor = Number(floorNumber)
    if (!Number.isFinite(floor) || floor < 1) {
      return res.status(400).json({ message: 'floorNumber must be a number >= 1' })
    }

    const codeStr = code != null ? String(code).trim() : ''
    if (!codeStr) {
      return res.status(400).json({ message: 'code is required' })
    }

    let apartmentRef = null
    let resolvedStatus = status || 'available'

    if (apartmentId) {
      if (!isValidObjectId(apartmentId)) {
        return res.status(400).json({ message: 'Invalid apartment id' })
      }
      const apt = await Apartment.findById(apartmentId)
      if (!apt) {
        return res.status(404).json({ message: 'Apartment not found' })
      }
      if (!sameBuilding(apt.building, buildId)) {
        return res.status(400).json({ message: 'Apartment must belong to the same building' })
      }
      apartmentRef = apt._id
      if (!status) resolvedStatus = 'assigned'
    }

    const spot = await ParkingSpot.create({
      building: buildId,
      floorNumber: floor,
      code: codeStr,
      spotType: spotType || 'standard',
      status: resolvedStatus,
      apartment: apartmentRef,
      notes: notes != null ? String(notes) : ''
    })

    const populated = await ParkingSpot.findById(spot._id)
      .populate('building', 'name section floors project')
      .populate('apartment', 'apartmentNumber floorNumber building')

    res.status(201).json(populated)
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(400).json({ message: 'Parking code already exists for this building' })
    }
    res.status(500).json({ message: error.message })
  }
}

export const updateParkingSpot = async (req, res) => {
  try {
    const spot = await ParkingSpot.findById(req.params.id)
    if (!spot) {
      return res.status(404).json({ message: 'Parking spot not found' })
    }

    const {
      floorNumber,
      code,
      spotType,
      status,
      apartment: apartmentId,
      notes
    } = req.body

    if (floorNumber != null) {
      const floor = Number(floorNumber)
      if (!Number.isFinite(floor) || floor < 1) {
        return res.status(400).json({ message: 'floorNumber must be a number >= 1' })
      }
      spot.floorNumber = floor
    }

    if (code != null) {
      const codeStr = String(code).trim()
      if (!codeStr) {
        return res.status(400).json({ message: 'code cannot be empty' })
      }
      spot.code = codeStr
    }

    if (spotType != null) spot.spotType = spotType
    if (status != null) spot.status = status
    if (notes != null) spot.notes = String(notes)

    if (apartmentId !== undefined) {
      if (apartmentId === null || apartmentId === '') {
        spot.apartment = null
        if (status === undefined && spot.status === 'assigned') {
          spot.status = 'available'
        }
      } else {
        if (!isValidObjectId(apartmentId)) {
          return res.status(400).json({ message: 'Invalid apartment id' })
        }
        const apt = await Apartment.findById(apartmentId)
        if (!apt) {
          return res.status(404).json({ message: 'Apartment not found' })
        }
        if (!sameBuilding(apt.building, spot.building)) {
          return res.status(400).json({ message: 'Apartment must belong to the same building' })
        }
        spot.apartment = apt._id
        if (status === undefined) spot.status = 'assigned'
      }
    }

    await spot.save()

    const populated = await ParkingSpot.findById(spot._id)
      .populate('building', 'name section floors project')
      .populate('apartment', 'apartmentNumber floorNumber building')

    res.json(populated)
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(400).json({ message: 'Parking code already exists for this building' })
    }
    res.status(500).json({ message: error.message })
  }
}

export const deleteParkingSpot = async (req, res) => {
  try {
    const spot = await ParkingSpot.findByIdAndDelete(req.params.id)
    if (!spot) {
      return res.status(404).json({ message: 'Parking spot not found' })
    }
    res.json({ message: 'Parking spot removed' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}
