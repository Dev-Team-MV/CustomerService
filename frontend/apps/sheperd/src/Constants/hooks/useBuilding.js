// @shared/hooks/useBuilding.js
// ✅ NUEVO - Hook para edificio ÚNICO (sheperd)

import { useState, useEffect, useCallback } from 'react'
import buildingService from '@shared/services/buildingService'
import uploadService from '@shared/services/uploadService'
import { getBuildingConfig } from '@shared/config/buildingConfig'

/**
 * Hook para gestionar UN SOLO edificio (modo singleBuildingMode)
 * Usado por sheperd
 */
export function useBuilding(projectId) {
  const [building, setBuilding] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Obtener el edificio único del proyecto
  const fetchBuilding = useCallback(async () => {
    if (!projectId) {
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)
    try {
      // Obtener edificios del proyecto (debería ser solo 1)
      const data = await buildingService.getAll({ projectId })
      
      if (data.length > 0) {
        const normalized = {
          ...data[0],
          floorPlans: data[0].floorPlans?.data || data[0].floorPlans || [],
          exteriorRenders: data[0].exteriorRenders?.urls || data[0].exteriorRenders || []
        }
        setBuilding(normalized)
      } else {
        setBuilding(null) // No existe edificio aún
      }
    } catch (err) {
      setError(err.message)
      console.error('Error fetching building:', err)
    } finally {
      setLoading(false)
    }
  }, [projectId])

  useEffect(() => {
    fetchBuilding()
  }, [fetchBuilding])

  // Crear o actualizar el edificio
  const handleBuildingSaved = useCallback(async (buildingData) => {
    try {
      setLoading(true)

      // Upload exterior renders
      let exteriorUrls = []
      if (buildingData.exteriorRenders?.length > 0) {
        const files = buildingData.exteriorRenders.filter(item => item instanceof File)
        const urls = buildingData.exteriorRenders.filter(item => typeof item === 'string')
        if (files.length > 0) {
          const uploadedUrls = await uploadService.uploadBuildingExteriorImages(files)
          exteriorUrls = [...urls, ...uploadedUrls]
        } else {
          exteriorUrls = urls
        }
      }

      // Upload floor plans
      let floorPlansData = []
      if (buildingData.floorPlans?.length > 0) {
        floorPlansData = await Promise.all(
          buildingData.floorPlans.map(async (fp) => {
            if (fp.file instanceof File) {
              const url = await uploadService.uploadBuildingFloorPlan(
                fp.file,
                buildingData._id || 'temp',
                fp.floorNumber
              )
              return { floorNumber: fp.floorNumber, url, polygons: fp.polygons || [] }
            }
            return { floorNumber: fp.floorNumber, url: fp.url || '', polygons: fp.polygons || [] }
          })
        )
      }

      const payload = {
        ...buildingData,
        projectId,
        exteriorRenders: exteriorUrls,
        floorPlans: floorPlansData
      }

      let savedBuilding
      if (buildingData._id) {
        // Actualizar edificio existente
        savedBuilding = await buildingService.update(buildingData._id, payload)
      } else {
        // Crear nuevo edificio
        savedBuilding = await buildingService.create(payload)
      }

      const normalized = {
        ...savedBuilding,
        floorPlans: savedBuilding.floorPlans?.data || savedBuilding.floorPlans || [],
        exteriorRenders: savedBuilding.exteriorRenders?.urls || savedBuilding.exteriorRenders || []
      }

      setBuilding(normalized)
      return normalized
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [projectId])

  const refreshBuilding = useCallback(() => fetchBuilding(), [fetchBuilding])

  return {
    building,
    loading,
    error,
    handleBuildingSaved,
    refreshBuilding,
    exists: !!building
  }
}

/**
 * Hook extendido para detalles del edificio único
 * Incluye apartamentos, modelos, etc.
 */
export function useBuildingWithDetails(projectId) {
  const { building, loading: buildingLoading, error, handleBuildingSaved, refreshBuilding, exists } = useBuilding(projectId)
  
  const [apartmentModels, setApartmentModels] = useState([])
  const [apartments, setApartments] = useState([])
  const [detailsLoading, setDetailsLoading] = useState(false)

  // Cargar detalles cuando el edificio existe
  useEffect(() => {
    if (!building?._id) {
      setApartmentModels([])
      setApartments([])
      return
    }

    const fetchDetails = async () => {
      setDetailsLoading(true)
      try {
        const [modelsData, apartmentsData] = await Promise.all([
          buildingService.getApartmentModels(building._id).catch(() => []),
          buildingService.getApartments(building._id).catch(() => [])
        ])
        setApartmentModels(modelsData || [])
        setApartments(apartmentsData || [])
      } catch (err) {
        console.error('Error fetching building details:', err)
      } finally {
        setDetailsLoading(false)
      }
    }

    fetchDetails()
  }, [building?._id])

  const handleSaveFloorPlans = useCallback(async (floorPlansData) => {
    if (!building?._id) throw new Error('Building not found')
    
    try {
      await buildingService.saveAllFloorPlans(building._id, floorPlansData)
      await refreshBuilding()
    } catch (err) {
      throw err
    }
  }, [building?._id, refreshBuilding])

  const handleModelSaved = useCallback(async (modelData) => {
    if (!building?._id) throw new Error('Building not found')
    
    try {
      const savedModel = modelData._id
        ? await buildingService.updateApartmentModel(modelData._id, modelData)
        : await buildingService.createApartmentModel({ ...modelData, buildingId: building._id })
      
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
      throw err
    }
  }, [building?._id])

  const handleApartmentSaved = useCallback(async (apartmentData) => {
    try {
      const saved = apartmentData._id
        ? await buildingService.updateApartment(apartmentData._id, apartmentData)
        : await buildingService.createApartment(apartmentData)
      
      setApartments(prev => {
        const idx = prev.findIndex(a => a._id === saved._id)
        if (idx !== -1) {
          const copy = [...prev]
          copy[idx] = saved
          return copy
        }
        return [saved, ...prev]
      })
      return saved
    } catch (err) {
      throw err
    }
  }, [])

  return {
    building,
    apartmentModels,
    apartments,
    loading: buildingLoading || detailsLoading,
    error,
    exists,
    handleBuildingSaved,
    handleSaveFloorPlans,
    handleModelSaved,
    handleApartmentSaved,
    refreshBuilding,
    setApartmentModels,
    setApartments
  }
}