// @/Users/oficina/MV-CRM/CustomerService/frontend/shared/hooks/useModels.js

import { useState, useEffect, useCallback } from 'react'
import modelService from '../services/modelService'
import facadeService from '../services/facadeService'

export const useModels = (projectId) => {
  const [models, setModels] = useState([])
  const [facades, setFacades] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchModels = useCallback(async () => {
    if (!projectId) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      const [modelsData, facadesData] = await Promise.all([
        modelService.getAll({ projectId }),
        facadeService.getAll({ projectId })
      ])
      setModels(modelsData)
      setFacades(facadesData)
    } catch (err) {
      console.error('Error fetching models:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [projectId])

  useEffect(() => {
    fetchModels()
  }, [fetchModels])

  const handleSubmitModel = async (modelData, selectedModel, closeModal) => {
    try {
      if (selectedModel) {
        await modelService.update(selectedModel._id, modelData)
      } else {
        await modelService.create(modelData)
      }
      await fetchModels()
      closeModal?.()
    } catch (err) {
      console.error('Error saving model:', err)
      throw err
    }
  }

  const handleDeleteModel = async (modelId) => {
    try {
      await modelService.delete(modelId)
      await fetchModels()
    } catch (err) {
      console.error('Error deleting model:', err)
      throw err
    }
  }

  const handleSubmitFacade = async (facadeData, selectedFacade, closeModal) => {
    try {
      if (selectedFacade) {
        await facadeService.update(selectedFacade._id, facadeData)
      } else {
        await facadeService.create(facadeData)
      }
      await fetchModels()
      closeModal?.()
    } catch (err) {
      console.error('Error saving facade:', err)
      throw err
    }
  }

  const handleDeleteFacade = async (facadeId) => {
    try {
      await facadeService.delete(facadeId)
      await fetchModels()
    } catch (err) {
      console.error('Error deleting facade:', err)
      throw err
    }
  }

  const getModelFacades = useCallback((modelId) => {
    return facades.filter(f => f.model === modelId || f.model?._id === modelId)
  }, [facades])

  return {
    models,
    facades,
    loading,
    error,
    handleSubmitModel,
    handleDeleteModel,
    handleSubmitFacade,
    handleDeleteFacade,
    getModelFacades,
    refetch: fetchModels
  }
}

export default useModels