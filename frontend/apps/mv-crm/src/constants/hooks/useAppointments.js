// apps/mv-crm/src/constants/hooks/useAppointments.js
import { useState, useEffect, useCallback } from 'react'
import appointmentService from '../../services/appointmentService'

export const useAppointments = ({ enabled = true, initialFilters = {} } = {}) => {
  const [appointments, setAppointments] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [filters, setFilters] = useState(initialFilters)

  // Cargar citas con filtros
  const fetchAppointments = useCallback(async (newFilters = filters) => {
    if (!enabled) return
    
    setLoading(true)
    setError(null)
    
    try {
      const data = await appointmentService.getAll(newFilters)
      setAppointments(data.appointments || [])
      setTotal(data.total || 0)
    } catch (err) {
      console.error('[Appointments] Error fetching:', err)
      setError(err.response?.data?.message || err.message)
    } finally {
      setLoading(false)
    }
  }, [enabled, filters])

  // Actualizar filtros
  const updateFilters = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
  }, [])

  // Resetear filtros
  const resetFilters = useCallback(() => {
    setFilters(initialFilters)
  }, [initialFilters])

  // Crear cita
  const createAppointment = useCallback(async (data) => {
    try {
      const newAppointment = await appointmentService.create(data)
      setAppointments(prev => [newAppointment, ...prev])
      setTotal(prev => prev + 1)
      return newAppointment
    } catch (err) {
      console.error('[Appointments] Error creating:', err)
      throw err
    }
  }, [])

  // Actualizar cita completa
  const updateAppointment = useCallback(async (id, data) => {
    try {
      const updated = await appointmentService.update(id, data)
      setAppointments(prev => prev.map(a => a._id === id ? updated : a))
      return updated
    } catch (err) {
      console.error('[Appointments] Error updating:', err)
      throw err
    }
  }, [])

  // ✅ NUEVO: Actualizar solo el status
  const updateAppointmentStatus = useCallback(async (id, status) => {
    try {
      const updated = await appointmentService.updateStatus(id, status)
      setAppointments(prev => prev.map(a => a._id === id ? updated : a))
      return updated
    } catch (err) {
      console.error('[Appointments] Error updating status:', err)
      throw err
    }
  }, [])

  // Eliminar cita
  const deleteAppointment = useCallback(async (id) => {
    try {
      await appointmentService.delete(id)
      setAppointments(prev => prev.filter(a => a._id !== id))
      setTotal(prev => prev - 1)
      return { success: true }
    } catch (err) {
      console.error('[Appointments] Error deleting:', err)
      throw err
    }
  }, [])

  // Cargar al montar o cuando cambian los filtros
  useEffect(() => {
    if (enabled) {
      fetchAppointments()
    }
  }, [enabled, filters, fetchAppointments])

  return {
    appointments,
    total,
    loading,
    error,
    filters,
    fetchAppointments,
    updateFilters,
    resetFilters,
    createAppointment,
    updateAppointment,
    updateAppointmentStatus,
    deleteAppointment
  }
}

export default useAppointments