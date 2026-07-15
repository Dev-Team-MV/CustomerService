// /Users/oficina/MV-CRM/CustomerService/frontend/shared/hooks/useProjectVariables.js

import { useState, useEffect, useCallback, useMemo } from 'react'
import projectService from '../services/projectService'

export const validateVariableName = (name) => {
  if (!name || typeof name !== 'string') {
    return { valid: false, error: 'El nombre es obligatorio' }
  }
  
  const trimmed = name.trim()
  
  if (trimmed.length === 0) {
    return { valid: false, error: 'El nombre no puede estar vacío' }
  }
  
  if (!/^[a-zA-Z]/.test(trimmed)) {
    return { valid: false, error: 'El nombre debe empezar con una letra' }
  }
  
  if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(trimmed)) {
    return { 
      valid: false, 
      error: 'El nombre solo puede contener letras, números y guiones bajos (_)' 
    }
  }
  
  return { valid: true, error: '' }
}

export function useProjectVariables(projectId, options = {}) {
  const { enabled = true } = options // ✅ Eliminar filterCategory de options
  
  const [variables, setVariables] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [filterCategory, setFilterCategory] = useState(null) // ✅ Estado local para filtro

  // ═══════════════════════════════════════════════════════════
  // FETCH - ✅ SIEMPRE traer TODAS las variables
  // ═══════════════════════════════════════════════════════════

  const fetchVariables = useCallback(async () => {
    if (!projectId || !enabled) return
    
    setLoading(true)
    setError(null)
    
    try {
      // ✅ CORREGIDO: No pasar categoría al backend
      // Traer TODAS las variables del proyecto
      const data = await projectService.getVariables(projectId)
      setVariables(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Error fetching variables:', err)
      setError(err.response?.data?.message || err.message || 'Error al cargar variables')
      setVariables([])
    } finally {
      setLoading(false)
    }
  }, [projectId, enabled])

  // ✅ Fetch solo cuando cambie projectId o enabled
  useEffect(() => {
    fetchVariables()
  }, [fetchVariables])

  // ═══════════════════════════════════════════════════════════
  // FILTRADO LOCAL - ✅ No en el backend
  // ═══════════════════════════════════════════════════════════

  const filteredVariables = useMemo(() => {
    if (!filterCategory || filterCategory === 'all') return variables
    return variables.filter(v => v.categoria === filterCategory)
  }, [variables, filterCategory])

  // ═══════════════════════════════════════════════════════════
  // CRUD OPERATIONS
  // ═══════════════════════════════════════════════════════════

  const createVariable = useCallback(async (data) => {
    if (!projectId) throw new Error('Project ID is required')
    
    if (!data.name || !data.recorrido || !data.categoria) {
      throw new Error('Los campos name, recorrido y categoria son obligatorios')
    }
    
    const validation = validateVariableName(data.name)
    if (!validation.valid) {
      throw new Error(validation.error)
    }
    
    const nameExists = variables.some(
      v => v.name.toLowerCase() === data.name.trim().toLowerCase()
    )
    if (nameExists) {
      throw new Error(`La variable "${data.name}" ya existe en este proyecto`)
    }
    
    try {
      const newVar = await projectService.createVariable(projectId, {
        name: data.name.trim(),
        recorrido: data.recorrido.trim(),
        categoria: data.categoria.trim()
      })
      
      setVariables(prev => [...prev, newVar])
      return newVar
    } catch (err) {
      console.error('Error creating variable:', err)
      throw new Error(err.response?.data?.message || err.message || 'Error al crear variable')
    }
  }, [projectId, variables])

  const updateVariable = useCallback(async (variableId, data) => {
    if (!projectId || !variableId) throw new Error('Project ID and Variable ID are required')
    
    if (!data.name || !data.recorrido || !data.categoria) {
      throw new Error('Los campos name, recorrido y categoria son obligatorios')
    }
    
    const validation = validateVariableName(data.name)
    if (!validation.valid) {
      throw new Error(validation.error)
    }
    
    const nameExists = variables.some(
      v => v._id !== variableId && 
           v.name.toLowerCase() === data.name.trim().toLowerCase()
    )
    if (nameExists) {
      throw new Error(`La variable "${data.name}" ya existe en este proyecto`)
    }
    
    try {
      const updated = await projectService.updateVariable(projectId, variableId, {
        name: data.name.trim(),
        recorrido: data.recorrido.trim(),
        categoria: data.categoria.trim()
      })
      
      setVariables(prev => prev.map(v => 
        v._id === variableId ? updated : v
      ))
      return updated
    } catch (err) {
      console.error('Error updating variable:', err)
      throw new Error(err.response?.data?.message || err.message || 'Error al actualizar variable')
    }
  }, [projectId, variables])

  const deleteVariable = useCallback(async (variableId, confirmMessage = '¿Eliminar esta variable?') => {
    if (!projectId || !variableId) throw new Error('Project ID and Variable ID are required')
    
    if (confirmMessage && !window.confirm(confirmMessage)) {
      return { cancelled: true }
    }
    
    try {
      await projectService.deleteVariable(projectId, variableId)
      setVariables(prev => prev.filter(v => v._id !== variableId))
      return { success: true }
    } catch (err) {
      console.error('Error deleting variable:', err)
      throw new Error(err.response?.data?.message || err.message || 'Error al eliminar variable')
    }
  }, [projectId])

  // ═══════════════════════════════════════════════════════════
  // DERIVED DATA
  // ═══════════════════════════════════════════════════════════

  const categories = useMemo(() => {
    const unique = [...new Set(
      variables
        .map(v => v.categoria)
        .filter(Boolean)
    )]
    return unique.sort((a, b) => a.localeCompare(b))
  }, [variables])

  const groupedByCategory = useMemo(() => {
    return variables.reduce((acc, variable) => {
      const cat = variable.categoria || 'Sin categoría'
      if (!acc[cat]) acc[cat] = []
      acc[cat].push(variable)
      return acc
    }, {})
  }, [variables])

  const getVariableByName = useCallback((name) => {
    return variables.find(v => v.name === name) || null
  }, [variables])

  const getVariablesByCategory = useCallback((categoria) => {
    return variables.filter(v => v.categoria === categoria)
  }, [variables])

  const variablesForTemplates = useMemo(() => {
    return variables.map(v => ({
      key: v.name,
      label: `{{${v.name}}}`,
      categoria: v.categoria,
      recorrido: v.recorrido
    }))
  }, [variables])

  return {
    // Estado
    variables,              // ✅ TODAS las variables sin filtrar
    filteredVariables,      // ✅ Variables filtradas por categoría (localmente)
    loading,
    error,
    
    // Filtros
    filterCategory,
    setFilterCategory,
    
    // CRUD
    fetchVariables,
    createVariable,
    updateVariable,
    deleteVariable,
    
    // Datos derivados
    categories,
    groupedByCategory,
    getVariableByName,
    getVariablesByCategory,
    variablesForTemplates,
    
    // ✅ Contadores basados en TODAS las variables (no cambian con el filtro)
    total: variables.length,
    totalByCategory: (cat) => variables.filter(v => v.categoria === cat).length
  }
}

export default useProjectVariables