// @/Users/oficina/MV-CRM/CustomerService/frontend/shared/hooks/useHomecareServices.js
import { useState, useEffect, useCallback } from 'react'
import homecareService from '../services/homeCareService'

const STATUS_BADGE_MAP = {
  pending: { label: 'Pendiente', color: '#f59e0b', icon: 'pending' },
  confirmed: { label: 'Confirmada', color: '#3b82f6', icon: 'check' },
  in_progress: { label: 'En proceso', color: '#8b5cf6', icon: 'play' },
  completed: { label: 'Completada', color: '#10b981', icon: 'done' },
  cancelled: { label: 'Cancelada', color: '#ef4444', icon: 'cancel' }
}

const NO_SERVICE_BADGE = { label: 'Sin servicios', color: '#9ca3af', icon: null }

const EMPTY_STATUS = {
  assetType: null,
  assetId: null,
  propertyId: null,
  apartmentId: null,
  activeStatus: null,
  activeAppointmentId: null,
  activeScheduledAt: null,
  activeServiceId: null,
  total: 0,
  counts: {
    pending: 0,
    confirmed: 0,
    in_progress: 0,
    completed: 0,
    cancelled: 0
  }
}

export const useHomecareServices = (resourceType, resourceIds = [], projectId = null) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [statusMap, setStatusMap] = useState({})

  console.log('🔍 [useHomecareServices] Hook called with:', { resourceType, resourceIds, projectId })

  useEffect(() => {
    console.log('🔍 [useHomecareServices] useEffect triggered')
    console.log('  resourceIds:', resourceIds)
    console.log('  resourceIds.length:', resourceIds?.length)
    
    if (!resourceIds || resourceIds.length === 0) {
      console.log('  ⚠️ No resourceIds, skipping fetch')
      return
    }

    let cancelled = false

    const fetchStatuses = async () => {
      console.log('  🚀 Starting fetch...')
      setLoading(true)
      setError(null)

      try {
        let result
        
        if (resourceType === 'property') {
          result = await homecareService.getMultiplePropertyStatus(resourceIds, projectId)
        } else if (resourceType === 'apartment') {
          result = await homecareService.getMultipleApartmentStatus(resourceIds, projectId)
        } else {
          throw new Error(`Unsupported resource type: ${resourceType}`)
        }

        if (!cancelled) {
          console.log('  ✅ Fetch completed, setting statusMap:', result)
          setStatusMap(result)
        }
      } catch (err) {
        if (!cancelled) {
          console.error('  ❌ Fetch error:', err.message)
          setError(err.message)
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    fetchStatuses()

    return () => {
      cancelled = true
    }
  }, [resourceIds, resourceType, projectId])

  const getStatus = useCallback((resourceId) => {
    const status = statusMap[resourceId] || EMPTY_STATUS
    console.log(`🔍 [getStatus] ${resourceId}:`, status)
    return status
  }, [statusMap])

  const getStatusBadge = useCallback((resourceId) => {
    const status = statusMap[resourceId]
    
    if (!status || !status.total || !status.activeStatus) {
      return NO_SERVICE_BADGE
    }

    return STATUS_BADGE_MAP[status.activeStatus] || NO_SERVICE_BADGE
  }, [statusMap])

  return {
    loading,
    error,
    statusMap,
    getStatus,
    getStatusBadge
  }
}

export default useHomecareServices