// /Users/oficina/MV-CRM/CustomerService/frontend/apps/phase-2/src/Constants/hooks/useBuildings.js
import { useState, useEffect, useCallback } from 'react'
import buildingService from '../../Services/buildingService'
import uploadService from '../../Services/uploadService'

export function useBuildings(projectId = null) {
  const [buildings, setBuildings] = useState([])
  const [filtered, setFiltered] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [error, setError] = useState(null)

  const fetchBuildings = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const filters = {}
      if (projectId) filters.projectId = projectId

      const data = await buildingService.getAll(filters)
      
      const normalized = data.map(building => ({
        ...building,
        floorPlans: building.floorPlans?.data || building.floorPlans || [],
        exteriorRenders: building.exteriorRenders?.urls || building.exteriorRenders || []
      }))

      setBuildings(normalized)
      setFiltered(normalized)
    } catch (err) {
      setError(err.message)
      console.error('Error fetching buildings:', err)
    } finally {
      setLoading(false)
    }
  }, [projectId])

  useEffect(() => {
    fetchBuildings()
  }, [fetchBuildings])

  useEffect(() => {
    if (!search.trim()) {
      setFiltered(buildings)
      return
    }
    const q = search.toLowerCase()
    setFiltered(buildings.filter(b =>
      b.name?.toLowerCase().includes(q) ||
      b.section?.toLowerCase().includes(q) ||
      b.status?.toLowerCase().includes(q)
    ))
  }, [search, buildings])

  const handleBuildingCreated = useCallback(async (buildingData) => {
    try {
      setLoading(true)
      
      let exteriorUrls = []
      if (buildingData.exteriorRenders && buildingData.exteriorRenders.length > 0) {
        const files = buildingData.exteriorRenders.filter(item => item instanceof File)
        const urls = buildingData.exteriorRenders.filter(item => typeof item === 'string')
        
        if (files.length > 0) {
          const uploadedUrls = await uploadService.uploadBuildingExteriorImages(files)
          exteriorUrls = [...urls, ...uploadedUrls]
        } else {
          exteriorUrls = urls
        }
      }

      let floorPlansData = []
      if (buildingData.floorPlans && buildingData.floorPlans.length > 0) {
        floorPlansData = await Promise.all(
          buildingData.floorPlans.map(async (fp) => {
            if (fp.file && fp.file instanceof File) {
              const url = await uploadService.uploadBuildingFloorPlan(
                fp.file,
                buildingData._id || 'temp',
                fp.floorNumber
              )
              return {
                floorNumber: fp.floorNumber,
                url,
                polygons: fp.polygons || []
              }
            }
            return {
              floorNumber: fp.floorNumber,
              url: fp.url || '',
              polygons: fp.polygons || []
            }
          })
        )
      }

      const payload = {
        ...buildingData,
        exteriorRenders: exteriorUrls,
        floorPlans: floorPlansData
      }

      let savedBuilding
      if (buildingData._id) {
        savedBuilding = await buildingService.update(buildingData._id, payload)
      } else {
        savedBuilding = await buildingService.create(payload)
      }

      const normalized = {
        ...savedBuilding,
        floorPlans: savedBuilding.floorPlans?.data || savedBuilding.floorPlans || [],
        exteriorRenders: savedBuilding.exteriorRenders?.urls || savedBuilding.exteriorRenders || []
      }

      setBuildings(prev => {
        const idx = prev.findIndex(b => b._id === normalized._id)
        if (idx !== -1) {
          const copy = [...prev]
          copy[idx] = normalized
          return copy
        }
        return [normalized, ...prev]
      })

      return normalized
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const handleDelete = useCallback(async (id) => {
    if (!window.confirm('¿Eliminar este edificio? Esta acción no se puede deshacer.')) return
    
    try {
      setLoading(true)
      await buildingService.delete(id)
      setBuildings(prev => prev.filter(b => b._id !== id))
      setFiltered(prev => prev.filter(b => b._id !== id))
    } catch (err) {
      setError(err.message)
      alert(`Error: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }, [])

  const refreshBuildings = useCallback(() => {
    fetchBuildings()
  }, [fetchBuildings])

  return {
    buildings,
    filtered,
    loading,
    error,
    search,
    setSearch,
    handleBuildingCreated,
    handleDelete,
    refreshBuildings
  }
}

// /Users/oficina/MV-CRM/CustomerService/frontend/apps/phase-2/src/Constants/hooks/useBuildings.js

export function useBuildingDetail(buildingId) {
  const [building, setBuilding] = useState(null)
  const [apartmentModels, setApartmentModels] = useState([])
  const [apartments, setApartments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchBuildingData = useCallback(async () => {
    if (!buildingId) {
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)
    try {
      // Fetch building first
      const buildingData = await buildingService.getById(buildingId)
      
      const normalized = {
        ...buildingData,
        floorPlans: buildingData.floorPlans?.data || buildingData.floorPlans || [],
        exteriorRenders: buildingData.exteriorRenders?.urls || buildingData.exteriorRenders || []
      }

      setBuilding(normalized)

      // Try to fetch models and apartments, but don't fail if they error
      try {
        const modelsData = await buildingService.getApartmentModels(buildingId)
        setApartmentModels(modelsData || [])
      } catch (modelsErr) {
        console.warn('Could not fetch apartment models:', modelsErr)
        setApartmentModels([])
      }

      try {
        const apartmentsData = await buildingService.getApartments(buildingId)
        setApartments(apartmentsData || [])
      } catch (aptsErr) {
        console.warn('Could not fetch apartments:', aptsErr)
        setApartments([])
      }

    } catch (err) {
      setError(err.message)
      console.error('Error fetching building details:', err)
    } finally {
      setLoading(false)
    }
  }, [buildingId])

  useEffect(() => {
    fetchBuildingData()
  }, [fetchBuildingData])

  const handleSaveFloorPlans = useCallback(async (floorPlansData) => {
    try {
      await buildingService.saveAllFloorPlans(buildingId, floorPlansData)
      
      const updatedBuilding = await buildingService.getById(buildingId)
      const normalized = {
        ...updatedBuilding,
        floorPlans: updatedBuilding.floorPlans?.data || updatedBuilding.floorPlans || [],
        exteriorRenders: updatedBuilding.exteriorRenders?.urls || updatedBuilding.exteriorRenders || []
      }
      setBuilding(normalized)
      
      return normalized
    } catch (err) {
      setError(err.message)
      throw err
    }
  }, [buildingId])

  const handleModelSaved = useCallback(async (modelData) => {
    try {
      let savedModel
      if (modelData._id) {
        savedModel = await buildingService.updateApartmentModel(modelData._id, modelData)
      } else {
        savedModel = await buildingService.createApartmentModel({
          ...modelData,
          buildingId
        })
      }

      setApartmentModels(prev => {
        const idx = prev.findIndex(m => m._id === savedModel._id)
        if (idx !== -1) {
          const copy = [...prev]
          copy[idx] = savedModel
          return copy
        }
        return [savedModel, ...prev]
      })

      return savedModel
    } catch (err) {
      setError(err.message)
      throw err
    }
  }, [buildingId])

  const handleApartmentSaved = useCallback(async (apartmentData) => {
    try {
      let savedApartment
      if (apartmentData._id) {
        savedApartment = await buildingService.updateApartment(apartmentData._id, apartmentData)
      } else {
        savedApartment = await buildingService.createApartment(apartmentData)
      }

      setApartments(prev => {
        const idx = prev.findIndex(a => a._id === savedApartment._id)
        if (idx !== -1) {
          const copy = [...prev]
          copy[idx] = savedApartment
          return copy
        }
        return [savedApartment, ...prev]
      })

      return savedApartment
    } catch (err) {
      setError(err.message)
      throw err
    }
  }, [])

  const refreshBuildingData = useCallback(() => {
    fetchBuildingData()
  }, [fetchBuildingData])

  return {
    building,
    apartmentModels,
    apartments,
    loading,
    error,
    setApartmentModels,
    setApartments,
    handleSaveFloorPlans,
    handleModelSaved,
    handleApartmentSaved,
    refreshBuildingData
  }
}