// @/Users/oficina/MV-CRM/CustomerService/frontend/shared/hooks/useMasterPlan.js

import { useState, useCallback } from 'react'
import api from '@shared/services/api'

export function useMasterPlan() {
  const [masterPlanData, setMasterPlanData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchMasterPlan = useCallback(async (projectId, onlyWithPolygon = false) => {
    if (!projectId) {
      setError('Project ID is required')
      return
    }

    setLoading(true)
    setError(null)
    try {
      const params = { projectId }
      if (onlyWithPolygon) {
        params.onlyWithPolygon = 'true'
      }

      const response = await api.get('/master-plan', { params })
      setMasterPlanData(response.data)
      return response.data
    } catch (err) {
      setError(err.response?.data?.message || err.message)
      console.error('Error fetching master plan:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // ✅ Actualizado para enviar color fields
  const saveBuildingPolygon = useCallback(async (buildingId, polygonData) => {
    try {
      const payload = {
        polygon: polygonData.polygon,
        polygonColor: polygonData.polygonColor,
        polygonStrokeColor: polygonData.polygonStrokeColor,
        polygonOpacity: polygonData.polygonOpacity
      }
      
      const response = await api.put(`/buildings/${buildingId}`, payload)
      
      if (masterPlanData) {
        setMasterPlanData(prev => ({
          ...prev,
          buildings: prev.buildings.map(b =>
            b._id === buildingId 
              ? { 
                  ...b, 
                  polygon: polygonData.polygon,
                  polygonColor: polygonData.polygonColor,
                  polygonStrokeColor: polygonData.polygonStrokeColor,
                  polygonOpacity: polygonData.polygonOpacity
                } 
              : b
          )
        }))
      }
      
      return response.data
    } catch (err) {
      console.error('Error saving building polygon:', err)
      throw err
    }
  }, [masterPlanData])

  const clearMasterPlan = useCallback(() => {
    setMasterPlanData(null)
    setError(null)
  }, [])

  return {
    masterPlanData,
    loading,
    error,
    fetchMasterPlan,
    saveBuildingPolygon,
    clearMasterPlan
  }
}