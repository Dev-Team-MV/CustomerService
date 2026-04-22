// @/Users/oficina/MV-CRM/CustomerService/frontend/apps/6town-houses/src/hooks/useProperties.js
// NUEVO ARCHIVO

import { useState, useEffect, useCallback } from 'react'
import propertyService from '@shared/services/propertyService'

export const useProperties = (projectId) => {
  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchProperties = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await propertyService.getByProject(projectId)
      setProperties(data)
    } catch (err) {
      console.error('Error fetching properties:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [projectId])

  useEffect(() => {
    if (projectId) {
      fetchProperties()
    }
  }, [projectId, fetchProperties])

  return {
    properties,
    loading,
    error,
    refresh: fetchProperties
  }
}