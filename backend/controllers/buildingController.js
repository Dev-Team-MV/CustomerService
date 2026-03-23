import Building from '../models/Building.js'

const toFiniteNumber = (value) => {
  const num = Number(value)
  return Number.isFinite(num) ? num : null
}

const normalizePolygon = (polygon, index = 0) => {
  const points = Array.isArray(polygon?.points)
    ? polygon.points.map(toFiniteNumber).filter((n) => n !== null)
    : []

  return {
    id: polygon?.id || `poly_${Date.now()}_${index}`,
    points,
    apartmentModel: polygon?.apartmentModel || null,
    color: polygon?.color || '#8CA551',
    name: polygon?.name || `Polygon ${index + 1}`
  }
}

const normalizeFloorPlan = (floorPlan, index = 0) => ({
  floorNumber: floorPlan?.floorNumber ?? index + 1,
  url: floorPlan?.url || '',
  polygons: Array.isArray(floorPlan?.polygons)
    ? floorPlan.polygons.map((poly, polyIdx) => normalizePolygon(poly, polyIdx))
    : []
})

const parseFloorPlansInput = (floorPlans) => {
  if (Array.isArray(floorPlans)) {
    return floorPlans.map((fp, i) => normalizeFloorPlan(fp, i))
  }
  if (floorPlans && Array.isArray(floorPlans.data)) {
    return floorPlans.data.map((fp, i) => normalizeFloorPlan(fp, i))
  }
  return []
}

const parseExteriorRendersInput = (exteriorRenders) => {
  if (Array.isArray(exteriorRenders)) return exteriorRenders
  if (exteriorRenders && Array.isArray(exteriorRenders.urls)) return exteriorRenders.urls
  return []
}

const normalizeBuildingFloorPolygon = (polygon, index = 0) => {
  const points = Array.isArray(polygon?.points)
    ? polygon.points.map(toFiniteNumber).filter((n) => n !== null)
    : []

  const rawFloorNumber = Number(polygon?.floorNumber)
  const floorNumber = Number.isFinite(rawFloorNumber) && rawFloorNumber >= 1
    ? rawFloorNumber
    : index + 1

  return {
    id: polygon?.id || `floor_poly_${Date.now()}_${index}`,
    floorNumber,
    points,
    color: polygon?.color || '#8CA551',
    name: polygon?.name || `Floor ${floorNumber}`,
    isCommercial: Boolean(polygon?.isCommercial)
  }
}

const parseLegacyPolygonToFloorPolygons = (legacyPolygon) => {
  if (!Array.isArray(legacyPolygon) || legacyPolygon.length === 0) return []
  const points = legacyPolygon
    .flatMap((point) => [toFiniteNumber(point?.x), toFiniteNumber(point?.y)])
    .filter((n) => n !== null)
  if (points.length < 6) return []

  return [{
    id: 'legacy_floor_poly_1',
    floorNumber: 1,
    points,
    color: '#8CA551',
    name: 'Floor 1',
    isCommercial: false
  }]
}

const parseBuildingFloorPolygonsInput = (buildingFloorPolygons, legacyPolygon) => {
  if (Array.isArray(buildingFloorPolygons)) {
    return buildingFloorPolygons.map((poly, idx) => normalizeBuildingFloorPolygon(poly, idx))
  }
  if (buildingFloorPolygons && Array.isArray(buildingFloorPolygons.data)) {
    return buildingFloorPolygons.data.map((poly, idx) => normalizeBuildingFloorPolygon(poly, idx))
  }
  return parseLegacyPolygonToFloorPolygons(legacyPolygon)
}

const validateBuildingFloorPolygons = (buildingFloorPolygons) => {
  if (!Array.isArray(buildingFloorPolygons)) return { ok: true }

  const floorNumbers = new Set()
  const polygonIds = new Set()

  for (const poly of buildingFloorPolygons) {
    const floorNumber = Number(poly?.floorNumber)
    if (!Number.isFinite(floorNumber) || floorNumber < 1) {
      return { ok: false, message: 'Each buildingFloorPolygon requires a valid floorNumber >= 1' }
    }
    if (floorNumbers.has(floorNumber)) {
      return { ok: false, message: `Duplicate floorNumber ${floorNumber} in buildingFloorPolygons` }
    }
    floorNumbers.add(floorNumber)

    const polygonId = String(poly?.id || '').trim()
    if (!polygonId) {
      return { ok: false, message: 'Each buildingFloorPolygon requires a non-empty id' }
    }
    if (polygonIds.has(polygonId)) {
      return { ok: false, message: `Duplicate polygon id ${polygonId} in buildingFloorPolygons` }
    }
    polygonIds.add(polygonId)

    if (!Array.isArray(poly?.points) || poly.points.length < 6) {
      return { ok: false, message: `Polygon ${polygonId} must have at least 3 points (6 numeric values)` }
    }
  }

  return { ok: true }
}

const toBuildingPayload = (buildingDoc) => {
  const building = buildingDoc?.toObject ? buildingDoc.toObject() : buildingDoc
  const floorPlans = Array.isArray(building.floorPlans) ? building.floorPlans : []
  const exteriorRenders = Array.isArray(building.exteriorRenders) ? building.exteriorRenders : []
  const buildingFloorPolygons = parseBuildingFloorPolygonsInput(
    building.buildingFloorPolygons,
    building.polygon
  )

  return {
    ...building,
    floorPlans: {
      count: floorPlans.length,
      data: floorPlans.map((floorPlan, idx) => ({
        floorNumber: floorPlan.floorNumber ?? idx + 1,
        url: floorPlan.url,
        polygons: Array.isArray(floorPlan.polygons)
          ? floorPlan.polygons.map((poly, polyIdx) => normalizePolygon(poly, polyIdx))
          : []
      }))
    },
    exteriorRenders: {
      count: exteriorRenders.length,
      urls: exteriorRenders
    },
    buildingFloorPolygons
  }
}

const getFloorPlanByNumber = (building, floorNumberRaw) => {
  const floorNumber = Number(floorNumberRaw)
  if (!Number.isFinite(floorNumber) || floorNumber < 1) {
    return { error: 'Invalid floorNumber. Must be a number >= 1' }
  }

  const floorPlan = building.floorPlans.find((fp) => Number(fp.floorNumber) === floorNumber)
  if (!floorPlan) {
    return { error: 'Floor plan not found' }
  }

  return { floorNumber, floorPlan }
}

export const getAllBuildings = async (req, res) => {
  try {
    const { projectId, status } = req.query
    const filter = {}
    if (projectId) filter.project = projectId
    if (status) filter.status = status

    const buildings = await Building.find(filter)
      .populate('project', 'name slug')
      .sort({ name: 1 })
    res.json(buildings.map(toBuildingPayload))
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const getBuildingById = async (req, res) => {
  try {
    const building = await Building.findById(req.params.id)
      .populate('project', 'name slug')

    if (building) {
      res.json(toBuildingPayload(building))
    } else {
      res.status(404).json({ message: 'Building not found' })
    }
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const createBuilding = async (req, res) => {
  try {
    const {
      projectId, project, name, section, floors, floorPlans,
      exteriorRenders, polygon, buildingFloorPolygons, totalApartments
    } = req.body
    const projId = projectId || project
    if (!projId) {
      return res.status(400).json({ message: 'projectId (or project) is required' })
    }

    const normalizedBuildingFloorPolygons = parseBuildingFloorPolygonsInput(buildingFloorPolygons, polygon)
    const polygonsValidation = validateBuildingFloorPolygons(normalizedBuildingFloorPolygons)
    if (!polygonsValidation.ok) {
      return res.status(400).json({ message: polygonsValidation.message })
    }

    const building = await Building.create({
      project: projId,
      name,
      section,
      floors: floors || 1,
      floorPlans: parseFloorPlansInput(floorPlans),
      exteriorRenders: parseExteriorRendersInput(exteriorRenders),
      polygon: polygon || [],
      buildingFloorPolygons: normalizedBuildingFloorPolygons,
      totalApartments: totalApartments || 0
    })

    res.status(201).json(toBuildingPayload(building))
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const updateBuilding = async (req, res) => {
  try {
    const building = await Building.findById(req.params.id)
    if (!building) {
      return res.status(404).json({ message: 'Building not found' })
    }

    const {
      name, section, floors, floorPlans, exteriorRenders, polygon,
      buildingFloorPolygons, totalApartments, status
    } = req.body
    if (name != null) building.name = name
    if (section != null) building.section = section
    if (floors != null) building.floors = floors
    if (floorPlans != null) building.floorPlans = parseFloorPlansInput(floorPlans)
    if (exteriorRenders != null) building.exteriorRenders = parseExteriorRendersInput(exteriorRenders)
    if (polygon != null) building.polygon = polygon
    if (buildingFloorPolygons != null || polygon != null) {
      const normalizedBuildingFloorPolygons = parseBuildingFloorPolygonsInput(
        buildingFloorPolygons,
        polygon != null ? polygon : building.polygon
      )
      const polygonsValidation = validateBuildingFloorPolygons(normalizedBuildingFloorPolygons)
      if (!polygonsValidation.ok) {
        return res.status(400).json({ message: polygonsValidation.message })
      }
      building.buildingFloorPolygons = normalizedBuildingFloorPolygons
    }
    if (totalApartments != null) building.totalApartments = totalApartments
    if (status != null) building.status = status

    await building.save()
    res.json(toBuildingPayload(building))
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const deleteBuilding = async (req, res) => {
  try {
    const building = await Building.findById(req.params.id)
    if (!building) {
      return res.status(404).json({ message: 'Building not found' })
    }
    await building.deleteOne()
    res.json({ message: 'Building deleted successfully' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const getBuildingFloorPlans = async (req, res) => {
  try {
    const building = await Building.findById(req.params.id)
    if (!building) {
      return res.status(404).json({ message: 'Building not found' })
    }

    const floorPlans = parseFloorPlansInput(building.floorPlans)
    res.json({
      count: floorPlans.length,
      data: floorPlans
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const createOrReplaceBuildingFloorPlan = async (req, res) => {
  try {
    const building = await Building.findById(req.params.id)
    if (!building) {
      return res.status(404).json({ message: 'Building not found' })
    }

    const floorPlan = normalizeFloorPlan(req.body)
    if (!floorPlan.url) {
      return res.status(400).json({ message: 'url is required for floor plan' })
    }

    const existingIndex = building.floorPlans.findIndex(
      (fp) => Number(fp.floorNumber) === Number(floorPlan.floorNumber)
    )

    if (existingIndex >= 0) {
      building.floorPlans[existingIndex] = floorPlan
    } else {
      building.floorPlans.push(floorPlan)
    }

    await building.save()
    res.status(existingIndex >= 0 ? 200 : 201).json(floorPlan)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const updateBuildingFloorPlan = async (req, res) => {
  try {
    const building = await Building.findById(req.params.id)
    if (!building) {
      return res.status(404).json({ message: 'Building not found' })
    }

    const floorRef = getFloorPlanByNumber(building, req.params.floorNumber)
    if (floorRef.error) {
      return res.status(floorRef.error.includes('Invalid') ? 400 : 404).json({ message: floorRef.error })
    }
    const { floorPlan } = floorRef

    if (req.body.url !== undefined) floorPlan.url = req.body.url
    if (req.body.polygons !== undefined) {
      floorPlan.polygons = Array.isArray(req.body.polygons)
        ? req.body.polygons.map((poly, i) => normalizePolygon(poly, i))
        : []
    }

    await building.save()
    res.json(normalizeFloorPlan(floorPlan))
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const deleteBuildingFloorPlan = async (req, res) => {
  try {
    const building = await Building.findById(req.params.id)
    if (!building) {
      return res.status(404).json({ message: 'Building not found' })
    }

    const floorNumber = Number(req.params.floorNumber)
    const prevLength = building.floorPlans.length
    building.floorPlans = building.floorPlans.filter((fp) => Number(fp.floorNumber) !== floorNumber)

    if (building.floorPlans.length === prevLength) {
      return res.status(404).json({ message: 'Floor plan not found' })
    }

    await building.save()
    res.json({ message: 'Floor plan deleted successfully' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const getFloorPlanPolygons = async (req, res) => {
  try {
    const building = await Building.findById(req.params.id)
    if (!building) {
      return res.status(404).json({ message: 'Building not found' })
    }

    const floorRef = getFloorPlanByNumber(building, req.params.floorNumber)
    if (floorRef.error) {
      return res.status(floorRef.error.includes('Invalid') ? 400 : 404).json({ message: floorRef.error })
    }

    const polygons = Array.isArray(floorRef.floorPlan.polygons)
      ? floorRef.floorPlan.polygons.map((poly, i) => normalizePolygon(poly, i))
      : []
    res.json(polygons)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const createFloorPlanPolygon = async (req, res) => {
  try {
    const building = await Building.findById(req.params.id)
    if (!building) {
      return res.status(404).json({ message: 'Building not found' })
    }

    const floorRef = getFloorPlanByNumber(building, req.params.floorNumber)
    if (floorRef.error) {
      return res.status(floorRef.error.includes('Invalid') ? 400 : 404).json({ message: floorRef.error })
    }

    const polygon = normalizePolygon(req.body, floorRef.floorPlan.polygons.length)
    if (!Array.isArray(polygon.points) || polygon.points.length < 6) {
      return res.status(400).json({ message: 'Polygon points must have at least 3 points (6 numeric values)' })
    }

    floorRef.floorPlan.polygons.push(polygon)
    await building.save()
    res.status(201).json(polygon)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const updateFloorPlanPolygon = async (req, res) => {
  try {
    const building = await Building.findById(req.params.id)
    if (!building) {
      return res.status(404).json({ message: 'Building not found' })
    }

    const floorRef = getFloorPlanByNumber(building, req.params.floorNumber)
    if (floorRef.error) {
      return res.status(floorRef.error.includes('Invalid') ? 400 : 404).json({ message: floorRef.error })
    }

    const polygons = floorRef.floorPlan.polygons || []
    const polygonIndex = polygons.findIndex((poly) => poly.id === req.params.polygonId)
    if (polygonIndex < 0) {
      return res.status(404).json({ message: 'Polygon not found' })
    }

    const currentPolygon = normalizePolygon(polygons[polygonIndex], polygonIndex)
    const updatedPolygon = {
      ...currentPolygon,
      ...req.body
    }

    if (req.body.points !== undefined) {
      updatedPolygon.points = Array.isArray(req.body.points)
        ? req.body.points.map(toFiniteNumber).filter((n) => n !== null)
        : []
    }

    polygons[polygonIndex] = normalizePolygon(updatedPolygon, polygonIndex)
    await building.save()
    res.json(polygons[polygonIndex])
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const deleteFloorPlanPolygon = async (req, res) => {
  try {
    const building = await Building.findById(req.params.id)
    if (!building) {
      return res.status(404).json({ message: 'Building not found' })
    }

    const floorRef = getFloorPlanByNumber(building, req.params.floorNumber)
    if (floorRef.error) {
      return res.status(floorRef.error.includes('Invalid') ? 400 : 404).json({ message: floorRef.error })
    }

    const prevLength = floorRef.floorPlan.polygons.length
    floorRef.floorPlan.polygons = floorRef.floorPlan.polygons.filter(
      (poly) => poly.id !== req.params.polygonId
    )

    if (floorRef.floorPlan.polygons.length === prevLength) {
      return res.status(404).json({ message: 'Polygon not found' })
    }

    await building.save()
    res.json({ message: 'Polygon deleted successfully' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}
