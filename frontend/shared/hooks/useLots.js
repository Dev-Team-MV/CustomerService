// @/Users/oficina/MV-CRM/CustomerService/frontend/shared/hooks/useLots.js

import { useState, useEffect, useCallback } from 'react'
import lotService from '../services/lotService'

export const useLots = (projectId) => {
  const [lots, setLots] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchLots = useCallback(async () => {
    if (!projectId) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      const data = await lotService.getAll({ projectId })
      setLots(data)
    } catch (err) {
      console.error('Error fetching lots:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [projectId])

  useEffect(() => {
    fetchLots()
  }, [fetchLots])

  const handleLotCreated = async (lotData) => {
    try {
      if (lotData._id) {
        await lotService.update(lotData._id, lotData)
      } else {
        await lotService.create(lotData)
      }
      await fetchLots()
    } catch (err) {
      console.error('Error saving lot:', err)
      throw err
    }
  }

  const handleDelete = async (lotId) => {
    try {
      await lotService.delete(lotId)
      await fetchLots()
    } catch (err) {
      console.error('Error deleting lot:', err)
      throw err
    }
  }

  return {
    lots,
    filtered: lots,
    loading,
    error,
    handleLotCreated,
    handleDelete,
    refetch: fetchLots
  }
}

export default useLots