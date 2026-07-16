// apps/mv-crm/src/constants/hooks/useMessageTemplates.js

import { useState, useEffect, useCallback } from 'react'
import api from '@shared/services/api'


export function useMessageTemplates(projectId = null) {
  const [templates, setTemplates] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchTemplates = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      // ✅ NUEVO: Si hay projectId, filtrar templates del proyecto + globales
      const params = {}
      if (projectId) {
        params.projectId = projectId
        // Trae templates del proyecto + globales (compatibilidad)
      }
      
      const response = await api.get('/sms-templates', { params })
      setTemplates(Array.isArray(response.data) ? response.data : [])
    } catch (err) {
      console.error('Error fetching templates:', err)
      setError(err.response?.data?.message || err.message)
      setTemplates([])
    } finally {
      setLoading(false)
    }
  }, [projectId])

  useEffect(() => {
    fetchTemplates()
  }, [fetchTemplates])

  const createTemplate = useCallback(async (data) => {
    try {
      const payload = { ...data }
      // ✅ NUEVO: Si hay projectId, incluirlo
      if (projectId && !payload.projectId) {
        payload.projectId = projectId
      }
      const response = await api.post('/sms-templates', payload)
      setTemplates(prev => [...prev, response.data])
      return response.data
    } catch (err) {
      console.error('Error creating template:', err)
      throw err
    }
  }, [projectId])

  const updateTemplate = useCallback(async (id, data) => {
    try {
      const payload = { ...data }
      if (projectId && !payload.projectId) {
        payload.projectId = projectId
      }
      const response = await api.put(`/sms-templates/${id}`, payload)
      setTemplates(prev => prev.map(t => t._id === id ? response.data : t))
      return response.data
    } catch (err) {
      console.error('Error updating template:', err)
      throw err
    }
  }, [projectId])

  const deleteTemplate = useCallback(async (id) => {
    try {
      await api.delete(`/sms-templates/${id}`)
      setTemplates(prev => prev.filter(t => t._id !== id))
    } catch (err) {
      console.error('Error deleting template:', err)
      throw err
    }
  }, [])

  return {
    templates,
    loading,
    error,
    refetch: fetchTemplates,
    createTemplate,
    updateTemplate,
    deleteTemplate
  }
}

export default useMessageTemplates