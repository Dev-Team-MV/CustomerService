// frontend/apps/mv-crm/src/hooks/useActivities.js
import { useState, useEffect, useCallback, useMemo } from 'react'
import activityService from '../../services/activityService'

export const ACTIVITY_STATUSES = [
  { id: 'pending', label: 'Pendiente', color: '#9e9e9e' },
  { id: 'in_progress', label: 'En Curso', color: '#2196f3' },
  { id: 'in_review', label: 'En Revisión', color: '#ff9800' },
  { id: 'completed', label: 'Completada', color: '#4caf50' },
  { id: 'approved', label: 'Aprobada', color: '#8bc34a' }
]

export const ACTIVITY_CATEGORIES = [
  { id: 'meeting', label: 'Reunión', icon: '📅' },
  { id: 'call', label: 'Llamada', icon: '📞' },
  { id: 'task', label: 'Tarea', icon: '✅' },
  { id: 'follow_up', label: 'Seguimiento', icon: '🔄' },
  { id: 'negotiation', label: 'Negociación', icon: '🤝' },
  { id: 'other', label: 'Otro', icon: '📌' }
]

export const ACTIVITY_PRIORITIES = [
  { id: 'low', label: 'Baja', color: '#9e9e9e' },
  { id: 'medium', label: 'Media', color: '#2196f3' },
  { id: 'high', label: 'Alta', color: '#ff9800' },
  { id: 'urgent', label: 'Urgente', color: '#f44336' }
]

export const useActivities = (initialFilters = {}) => {
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filters, setFilters] = useState(initialFilters)
  const [projects, setProjects] = useState([])

  // Fetch activities
  const fetchActivities = useCallback(async () => {
    setLoading(true)
    try {
      const data = await activityService.getAll(filters)
      setActivities(data)
      setError(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [filters])

  // Fetch projects for selector
  const fetchProjects = useCallback(async () => {
    try {
      const data = await activityService.getProjects()
      setProjects(data)
    } catch (err) {
      console.error('Error fetching projects:', err)
    }
  }, [])

  useEffect(() => {
    fetchActivities()
    fetchProjects()
  }, [fetchActivities, fetchProjects])

  // Agrupar por estado para el Kanban
  const groupedByStatus = useMemo(() => {
    const groups = {}
    ACTIVITY_STATUSES.forEach(status => {
      groups[status.id] = []
    })
    activities.forEach(activity => {
      if (groups[activity.status]) {
        groups[activity.status].push(activity)
      }
    })
    return groups
  }, [activities])

  // Crear actividad
  const createActivity = async (data) => {
    try {
      const newActivity = await activityService.create(data)
      setActivities(prev => [...prev, newActivity])
      return newActivity
    } catch (err) {
      setError(err.message)
      throw err
    }
  }

  // Actualizar actividad
  const updateActivity = async (id, data) => {
    try {
      const updated = await activityService.update(id, data)
      setActivities(prev => prev.map(a => a._id === id ? updated : a))
      return updated
    } catch (err) {
      setError(err.message)
      throw err
    }
  }

  // Cambiar estado (drag & drop)
  const changeStatus = async (id, newStatus) => {
    // Optimistic update
    const previousActivities = [...activities]
    setActivities(prev => prev.map(a => 
      a._id === id ? { ...a, status: newStatus } : a
    ))
    try {
      await activityService.updateStatus(id, newStatus)
    } catch (err) {
      // Revert on error
      setActivities(previousActivities)
      setError(err.message)
      throw err
    }
  }

  // Eliminar
  const deleteActivity = async (id) => {
    try {
      await activityService.delete(id)
      setActivities(prev => prev.filter(a => a._id !== id))
    } catch (err) {
      setError(err.message)
      throw err
    }
  }

  // SubActividades
  const addSubActivity = async (activityId, data) => {
    try {
      const updated = await activityService.addSubActivity(activityId, data)
      setActivities(prev => prev.map(a => a._id === activityId ? updated : a))
      return updated
    } catch (err) {
      setError(err.message)
      throw err
    }
  }

  const updateSubActivity = async (activityId, subId, data) => {
    try {
      const updated = await activityService.updateSubActivity(activityId, subId, data)
      setActivities(prev => prev.map(a => a._id === activityId ? updated : a))
      return updated
    } catch (err) {
      setError(err.message)
      throw err
    }
  }

  const deleteSubActivity = async (activityId, subId) => {
    try {
      const updated = await activityService.deleteSubActivity(activityId, subId)
      setActivities(prev => prev.map(a => a._id === activityId ? updated : a))
      return updated
    } catch (err) {
      setError(err.message)
      throw err
    }
  }

  return {
    activities,
    groupedByStatus,
    loading,
    error,
    filters,
    setFilters,
    projects,
    fetchActivities,
    createActivity,
    updateActivity,
    changeStatus,
    deleteActivity,
    addSubActivity,
    updateSubActivity,
    deleteSubActivity
  }
}

export default useActivities