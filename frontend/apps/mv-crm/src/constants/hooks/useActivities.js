// frontend/apps/mv-crm/src/constants/hooks/useActivities.js
import { useState, useEffect, useCallback, useMemo } from 'react'
import activityService from '../../services/activityService'

// Prioridades (fijas)
export const ACTIVITY_PRIORITIES = [
  { id: 'low', label: 'Baja', color: '#9e9e9e' },
  { id: 'medium', label: 'Media', color: '#2196f3' },
  { id: 'high', label: 'Alta', color: '#ff9800' },
  { id: 'urgent', label: 'Urgente', color: '#f44336' }
]

// Colores por defecto para columnas
const COLUMN_COLORS = {
  backlog: '#9e9e9e',
  todo: '#2196f3',
  in_progress: '#ff9800',
  done: '#4caf50',
  default: '#757575'
}

// projectId es OPCIONAL - si no se pasa, carga modo global
export const useActivities = (projectId = null) => {
  const [columns, setColumns] = useState([])
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filters, setFilters] = useState({})

  // Fetch board (columnas + actividades) - funciona con o sin projectId
  const fetchBoard = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      const board = await activityService.getBoard(projectId)
      
      // Agregar colores a las columnas
const columnsWithColors = (board.columns || []).map(col => ({
  ...col,
  color: col.color || COLUMN_COLORS[col.key] || COLUMN_COLORS.default
}))
      
      setColumns(columnsWithColors)
      
      // Extraer todas las actividades
      const allActivities = (board.columns || []).flatMap(col => col.activities || [])
      setActivities(allActivities)
    } catch (err) {
      setError(err.response?.data?.message || err.message)
    } finally {
      setLoading(false)
    }
  }, [projectId])

  // Fetch solo columnas
  const fetchColumns = useCallback(async () => {
    try {
      const cols = await activityService.getColumns(projectId)
const columnsWithColors = (cols || []).map(col => ({
  ...col,
  color: col.color || COLUMN_COLORS[col.key] || COLUMN_COLORS.default
}))
      setColumns(columnsWithColors)
    } catch (err) {
      console.error('Error fetching columns:', err)
    }
  }, [projectId])

  // Fetch actividades por proyecto relacionado
  const fetchByRelatedProject = useCallback(async (relatedProjectId) => {
    setLoading(true)
    try {
      const data = await activityService.getAll({ relatedProjectId })
      setActivities(data)
    } catch (err) {
      setError(err.response?.data?.message || err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchBoard()
  }, [fetchBoard])

  // Agrupar actividades por columna para el Kanban
  const groupedByColumn = useMemo(() => {
    const groups = {}
    columns.forEach(col => {
      groups[col._id] = []
    })
    activities.forEach(activity => {
      const colId = typeof activity.columnId === 'object' 
        ? activity.columnId._id 
        : activity.columnId
      if (groups[colId]) {
        groups[colId].push(activity)
      }
    })
    // Ordenar por posición
    Object.keys(groups).forEach(colId => {
      groups[colId].sort((a, b) => a.position - b.position)
    })
    return groups
  }, [activities, columns])

  // ==================== CRUD ACTIVITIES ====================

  const createActivity = async (data) => {
    try {
      const payload = {
        title: data.title,
        description: data.description || '',
        columnId: data.columnId,
        position: data.position,
        priority: data.priority || 'medium',
        dueDate: data.dueDate || undefined,
        assignedTo: data.assignedTo || undefined,
        tags: data.tags || [],
        // Nuevos campos
        relatedProjects: data.relatedProjects || data.projectIds || [],
        subtasks: data.subtasks || []
      }
      // Solo incluir projectId si existe
      if (projectId) {
        payload.projectId = projectId
      }
      
      const newActivity = await activityService.create(payload)
      setActivities(prev => [...prev, newActivity])
      return newActivity
    } catch (err) {
      setError(err.response?.data?.message || err.message)
      throw err
    }
  }

  const updateActivity = async (id, data) => {
    try {
      const updated = await activityService.update(id, data)
      setActivities(prev => prev.map(a => a._id === id ? updated : a))
      return updated
    } catch (err) {
      setError(err.response?.data?.message || err.message)
      throw err
    }
  }

  const moveActivity = async (id, columnId, position = null) => {
    // Optimistic update
    const previousActivities = [...activities]
    setActivities(prev => prev.map(a => 
      a._id === id ? { ...a, columnId, position: position ?? a.position } : a
    ))
    
    try {
      const updated = await activityService.move(id, columnId, position)
      // Refetch para sincronizar posiciones
      await fetchBoard()
      return updated
    } catch (err) {
      // Revert on error
      setActivities(previousActivities)
      setError(err.response?.data?.message || err.message)
      throw err
    }
  }

  const deleteActivity = async (id) => {
    try {
      await activityService.delete(id)
      setActivities(prev => prev.filter(a => a._id !== id))
    } catch (err) {
      setError(err.response?.data?.message || err.message)
      throw err
    }
  }

  // ==================== SUBTASKS ====================

  const addSubtask = async (activityId, data) => {
    try {
      const updated = await activityService.createSubtask(activityId, data)
      setActivities(prev => prev.map(a => a._id === activityId ? updated : a))
      return updated
    } catch (err) {
      setError(err.response?.data?.message || err.message)
      throw err
    }
  }

  const updateSubtask = async (activityId, subtaskId, data) => {
    try {
      const updated = await activityService.updateSubtask(activityId, subtaskId, data)
      setActivities(prev => prev.map(a => a._id === activityId ? updated : a))
      return updated
    } catch (err) {
      setError(err.response?.data?.message || err.message)
      throw err
    }
  }

  const deleteSubtask = async (activityId, subtaskId) => {
    try {
      const updated = await activityService.deleteSubtask(activityId, subtaskId)
      setActivities(prev => prev.map(a => a._id === activityId ? updated : a))
      return updated
    } catch (err) {
      setError(err.response?.data?.message || err.message)
      throw err
    }
  }

  // ==================== THREADS ====================

  const addThreadMessage = async (activityId, data) => {
    try {
      const updated = await activityService.addThreadMessage(activityId, data)
      setActivities(prev => prev.map(a => a._id === activityId ? updated : a))
      return updated
    } catch (err) {
      setError(err.response?.data?.message || err.message)
      throw err
    }
  }

  // ==================== CRUD COLUMNS ====================

  const createColumn = async (data) => {
    try {
      const payload = { ...data }
      if (projectId) payload.projectId = projectId
      
      const newColumn = await activityService.createColumn(payload)
      newColumn.color = COLUMN_COLORS[newColumn.key] || COLUMN_COLORS.default
      setColumns(prev => [...prev, newColumn].sort((a, b) => a.order - b.order))
      return newColumn
    } catch (err) {
      setError(err.response?.data?.message || err.message)
      throw err
    }
  }

  const updateColumn = async (id, data) => {
    try {
      const updated = await activityService.updateColumn(id, data)
      updated.color = COLUMN_COLORS[updated.key] || COLUMN_COLORS.default
      setColumns(prev => prev.map(c => c._id === id ? updated : c).sort((a, b) => a.order - b.order))
      return updated
    } catch (err) {
      setError(err.response?.data?.message || err.message)
      throw err
    }
  }

  const deleteColumn = async (id) => {
    try {
      await activityService.deleteColumn(id)
      setColumns(prev => prev.filter(c => c._id !== id))
    } catch (err) {
      setError(err.response?.data?.message || err.message)
      throw err
    }
  }

  return {
    // Data
    columns,
    activities,
    groupedByColumn,
    loading,
    error,
    filters,
    setFilters,
    projectId,
    
    // Actions - Activities
    fetchBoard,
    fetchByRelatedProject,
    createActivity,
    updateActivity,
    moveActivity,
    deleteActivity,
    
    // Actions - Subtasks
    addSubtask,
    updateSubtask,
    deleteSubtask,
    
    // Actions - Threads
    addThreadMessage,
    
    // Actions - Columns
    fetchColumns,
    createColumn,
    updateColumn,
    deleteColumn
  }
}

export default useActivities