import Project from '../models/Project.js'
import Building from '../models/Building.js'

const normalizeMasterPolygon = (polygon) => {
  if (!Array.isArray(polygon)) return []
  return polygon
    .map((point) => ({
      x: Number(point?.x),
      y: Number(point?.y)
    }))
    .filter((point) => Number.isFinite(point.x) && Number.isFinite(point.y))
}

const parseOnlyWithPolygon = (value) => {
  if (value === true || value === 'true' || value === '1') return true
  return false
}

export const getMasterPlan = async (req, res) => {
  try {
    const { projectId, onlyWithPolygon } = req.query
    const filterByPolygon = parseOnlyWithPolygon(onlyWithPolygon)

    if (!projectId) {
      return res.status(400).json({ message: 'projectId is required' })
    }

    const project = await Project.findById(projectId).select(
      '_id name slug phase type status image gallery'
    )

    if (!project) {
      return res.status(404).json({ message: 'Project not found' })
    }

    const buildingFilter = { project: projectId }
    if (filterByPolygon) {
      buildingFilter['polygon.0'] = { $exists: true }
    }

    const buildings = await Building.find(buildingFilter)
      .select(
        '_id project name section floors status polygon buildingFloorPolygons exteriorRenders totalApartments'
      )
      .sort({ name: 1 })

    const mappedBuildings = buildings.map((building) => ({
      _id: building._id,
      project: building.project,
      name: building.name,
      section: building.section || '',
      floors: building.floors,
      status: building.status,
      totalApartments: building.totalApartments || 0,
      polygon: normalizeMasterPolygon(building.polygon),
      buildingFloorPolygons: Array.isArray(building.buildingFloorPolygons)
        ? building.buildingFloorPolygons
        : [],
      exteriorRenders: Array.isArray(building.exteriorRenders) ? building.exteriorRenders : []
    }))

    return res.json({
      project: {
        _id: project._id,
        name: project.name || '',
        slug: project.slug,
        phase: project.phase || '',
        type: project.type,
        status: project.status
      },
      masterPlanImage: project.image || null,
      masterPlanGallery: Array.isArray(project.gallery) ? project.gallery : [],
      buildings: mappedBuildings
    })
  } catch (error) {
    return res.status(500).json({ message: error.message })
  }
}

