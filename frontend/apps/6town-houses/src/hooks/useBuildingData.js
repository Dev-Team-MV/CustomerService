// @/Users/oficina/MV-CRM/CustomerService/frontend/apps/6town-houses/src/Components/quote/LotSelector/hooks/useBuildingData.js

import { useState, useEffect } from 'react'
import buildingService from '@shared/services/buildingService'

export const useBuildingData = (projectId, facadeEnabled, t) => {
  const [buildings, setBuildings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchBuildings()
  }, [projectId])

  const fetchBuildings = async () => {
    try {
      setLoading(true)
      const data = await buildingService.getAll({ projectId })
      setBuildings(data)
    } catch (err) {
      console.error('Error fetching buildings:', err)
      setError(t('errors.loadingBuildings'))
    } finally {
      setLoading(false)
    }
  }

  const getStatusConfig = (status) => {
    const configs = {
      active: { label: t('status.available'), color: 'success', bgColor: '#4caf50' },
      reserved: { label: t('status.reserved'), color: 'warning', bgColor: '#ff9800' },
      sold: { label: t('status.sold'), color: 'error', bgColor: '#f44336' },
      inactive: { label: t('status.unavailable'), color: 'default', bgColor: '#9e9e9e' }
    }
    return configs[status] || configs.active
  }

  const validBuildings = buildings.filter(building => {
    const hasLotAndModel = building.quoteRef?.lot && building.quoteRef?.model
    const hasFacade = building.quoteRef?.facade
    const isActive = building.status === 'active'
    
    if (facadeEnabled) {
      return hasLotAndModel && hasFacade && isActive
    } else {
      return hasLotAndModel && isActive
    }
  })

  const invalidBuildings = buildings.filter(building => {
    const hasLotAndModel = building.quoteRef?.lot && building.quoteRef?.model
    const hasFacade = building.quoteRef?.facade
    
    if (facadeEnabled) {
      return !hasLotAndModel || !hasFacade
    } else {
      return !hasLotAndModel
    }
  })

  return {
    buildings,
    validBuildings,
    invalidBuildings,
    loading,
    error,
    getStatusConfig
  }
}