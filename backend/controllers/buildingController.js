import Building from '../models/Building.js'

export const getAllBuildings = async (req, res) => {
  try {
    const { projectId, status } = req.query
    const filter = {}
    if (projectId) filter.project = projectId
    if (status) filter.status = status

    const buildings = await Building.find(filter)
      .populate('project', 'name slug')
      .sort({ name: 1 })
    res.json(buildings)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const getBuildingById = async (req, res) => {
  try {
    const building = await Building.findById(req.params.id)
      .populate('project', 'name slug')

    if (building) {
      res.json(building)
    } else {
      res.status(404).json({ message: 'Building not found' })
    }
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const createBuilding = async (req, res) => {
  try {
    const { projectId, project, name, section, floors, floorPlans, exteriorRenders, polygon, totalApartments } = req.body
    const projId = projectId || project
    if (!projId) {
      return res.status(400).json({ message: 'projectId (or project) is required' })
    }

    const building = await Building.create({
      project: projId,
      name,
      section,
      floors: floors || 1,
      floorPlans: floorPlans || [],
      exteriorRenders: exteriorRenders || [],
      polygon: polygon || [],
      totalApartments: totalApartments || 0
    })

    res.status(201).json(building)
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

    const { name, section, floors, floorPlans, exteriorRenders, polygon, totalApartments, status } = req.body
    if (name != null) building.name = name
    if (section != null) building.section = section
    if (floors != null) building.floors = floors
    if (floorPlans != null) building.floorPlans = floorPlans
    if (exteriorRenders != null) building.exteriorRenders = exteriorRenders
    if (polygon != null) building.polygon = polygon
    if (totalApartments != null) building.totalApartments = totalApartments
    if (status != null) building.status = status

    await building.save()
    res.json(building)
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
