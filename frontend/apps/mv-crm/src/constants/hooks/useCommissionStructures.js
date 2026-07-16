// apps/mv-crm/src/hooks/useCommissionStructures.js
import { useState, useEffect, useCallback } from 'react'
import commissionService from '../../services/commissionService'

export const useCommissionStructures = (projectId = null) => {
  const [structures, setStructures] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchStructures = useCallback(async () => {
    if (!projectId) return
    setLoading(true)
    setError(null)
    try {
      const data = await commissionService.getStructures({ projectId })
      setStructures(data.structures || [])
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar estructuras')
    } finally {
      setLoading(false)
    }
  }, [projectId])

  useEffect(() => {
    fetchStructures()
  }, [fetchStructures])

  return { structures, loading, error, refresh: fetchStructures }
}

export default useCommissionStructures