// frontend/apps/mv-crm/src/hooks/useMessageTemplates.js
import { useState, useEffect, useCallback } from 'react'
import messageTemplateService from '../../services/messageTemplateService'

export const useMessageTemplates = () => {
  const [templates, setTemplates] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchTemplates = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await messageTemplateService.getAll()
      setTemplates(data || [])
    } catch (err) {
      setError(err.response?.data?.message || err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTemplates()
  }, [fetchTemplates])

  const createTemplate = async (data) => {
    try {
      const newTemplate = await messageTemplateService.create(data)
      setTemplates(prev => [...prev, newTemplate])
      return newTemplate
    } catch (err) {
      setError(err.response?.data?.message || err.message)
      throw err
    }
  }

  const updateTemplate = async (id, data) => {
    try {
      const updated = await messageTemplateService.update(id, data)
      setTemplates(prev => prev.map(t => t._id === id ? updated : t))
      return updated
    } catch (err) {
      setError(err.response?.data?.message || err.message)
      throw err
    }
  }

  const deleteTemplate = async (id) => {
    try {
      await messageTemplateService.delete(id)
      setTemplates(prev => prev.filter(t => t._id !== id))
    } catch (err) {
      setError(err.response?.data?.message || err.message)
      throw err
    }
  }

  return {
    templates,
    loading,
    error,
    fetchTemplates,
    createTemplate,
    updateTemplate,
    deleteTemplate
  }
}

export default useMessageTemplates