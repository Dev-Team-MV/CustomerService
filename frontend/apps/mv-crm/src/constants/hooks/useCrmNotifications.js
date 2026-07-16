// apps/mv-crm/src/constants/hooks/useCrmNotifications.js
import { useState, useEffect, useCallback, useRef } from 'react'
import crmNotificationService from '../../services/crmNotificationService'

const POLLING_INTERVAL = 5 * 60 * 1000 // 5 minutos

export const useCrmNotifications = ({ enabled = true } = {}) => {
  const [count, setCount] = useState(0)
  const [alerts, setAlerts] = useState([])
  const [byType, setByType] = useState({
    overduePayments: [],
    upcomingActivities: [],
    staleLeads: []
  })
  const [counts, setCounts] = useState({
    overduePayments: 0,
    upcomingActivities: 0,
    staleLeads: 0,
    total: 0
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [readAlertIds, setReadAlertIds] = useState(new Set())
  const [markingAsRead, setMarkingAsRead] = useState(new Set()) // ✅ NUEVO: IDs que se están marcando
  const intervalRef = useRef(null)

  // ✅ NUEVO: Helper para extraer el entityId correcto
  const extractEntityId = useCallback((alert) => {
    // Intentar múltiples ubicaciones posibles del entityId
    const possibleIds = [
      alert.payload?.entityId,
      alert.payload?.id,
      alert.payload?.paymentId,
      alert.payload?.activityId,
      alert.payload?.leadId,
      alert.entityId,
      alert.id
    ]
    
    // Retornar el primero que exista
    const entityId = possibleIds.find(id => id != null)
    
    if (!entityId) {
      console.error('[CRM Notifications] No entityId found for alert:', alert)
    }
    
    return entityId
  }, [])

  // Cargar solo el conteo (para el badge)
  const fetchCount = useCallback(async () => {
    if (!enabled) return
    try {
      const data = await crmNotificationService.getCount()
      setCount(data.count || 0)
    } catch (err) {
      console.error('[CRM Notifications] Error fetching count:', err)
      setError(err.message)
    }
  }, [enabled])

  // Cargar todas las alertas (para el drawer)
  const fetchAlerts = useCallback(async () => {
    if (!enabled) return
    setLoading(true)
    setError(null)
    try {
      const data = await crmNotificationService.getAll()
      
      // ✅ DEBUG: Log para ver la estructura real
      console.log('[CRM Notifications] Alerts received:', data)
      
      setAlerts(data.alerts || [])
      setByType(data.byType || {
        overduePayments: [],
        upcomingActivities: [],
        staleLeads: []
      })
      setCounts(data.counts || {
        overduePayments: 0,
        upcomingActivities: 0,
        staleLeads: 0,
        total: 0
      })
      setCount(data.counts?.total || 0)
    } catch (err) {
      console.error('[CRM Notifications] Error fetching alerts:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [enabled])

  // ✅ MEJORADO: Marcar como leída con mejor manejo
  const markAsRead = useCallback(async (alert) => {
    if (!alert || !alert.type) {
      console.error('[CRM Notifications] Invalid alert:', alert)
      return
    }

    const entityId = extractEntityId(alert)
    
    if (!entityId) {
      console.error('[CRM Notifications] Cannot mark as read: missing entityId', alert)
      return
    }

    // Marcar como "en proceso"
    setMarkingAsRead(prev => new Set([...prev, alert.id]))

    try {
      console.log(`[CRM Notifications] Marking as read: type=${alert.type}, entityId=${entityId}`)
      
      // Llamar al backend
      await crmNotificationService.markAsRead(alert.type, entityId)
      
      // Actualizar estado local
      setReadAlertIds(prev => new Set([...prev, alert.id]))
      
      // ✅ NUEVO: Refetch para actualizar el conteo
      await fetchCount()
      
      console.log(`[CRM Notifications] Successfully marked as read: ${alert.id}`)
    } catch (err) {
      console.error('[CRM Notifications] Error marking as read:', err)
      // Si falla el backend, al menos marcar localmente
      setReadAlertIds(prev => new Set([...prev, alert.id]))
    } finally {
      // Remover de "en proceso"
      setMarkingAsRead(prev => {
        const newSet = new Set(prev)
        newSet.delete(alert.id)
        return newSet
      })
    }
  }, [extractEntityId, fetchCount])

  // ✅ MEJORADO: Marcar todas como leídas con manejo individual de errores
  const markAllAsRead = useCallback(async () => {
    if (alerts.length === 0) return

    console.log(`[CRM Notifications] Marking ${alerts.length} alerts as read`)

    // Marcar todas como "en proceso"
    const allIds = alerts.map(a => a.id)
    setMarkingAsRead(new Set(allIds))

    try {
      // Marcar cada una individualmente para no fallar todas si una falla
      const results = await Promise.allSettled(
        alerts.map(async (alert) => {
          const entityId = extractEntityId(alert)
          if (!entityId) {
            throw new Error('Missing entityId')
          }
          return crmNotificationService.markAsRead(alert.type, entityId)
        })
      )

      // Log de resultados
      const successful = results.filter(r => r.status === 'fulfilled').length
      const failed = results.filter(r => r.status === 'rejected').length
      console.log(`[CRM Notifications] Mark all complete: ${successful} success, ${failed} failed`)

      // Actualizar estado local con todas las IDs
      setReadAlertIds(new Set(allIds))
      
      // ✅ NUEVO: Refetch para actualizar el conteo
      await fetchCount()
    } catch (err) {
      console.error('[CRM Notifications] Error marking all as read:', err)
      // Si falla todo, al menos marcar localmente
      setReadAlertIds(new Set(allIds))
    } finally {
      setMarkingAsRead(new Set())
    }
  }, [alerts, extractEntityId, fetchCount])

  // Verificar si una alerta está leída
  const isRead = useCallback((alertId) => {
    return readAlertIds.has(alertId)
  }, [readAlertIds])

  // ✅ NUEVO: Verificar si se está marcando como leída
  const isMarkingAsRead = useCallback((alertId) => {
    return markingAsRead.has(alertId)
  }, [markingAsRead])

  // Conteo de no leídas
  const unreadCount = Math.max(0, count - readAlertIds.size)

  // Polling cada 5 minutos
  useEffect(() => {
    if (!enabled) return

    // Cargar inmediatamente
    fetchCount()

    // Configurar polling
    intervalRef.current = setInterval(() => {
      fetchCount()
    }, POLLING_INTERVAL)

    // Cleanup
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [enabled, fetchCount])

  return {
    count,
    unreadCount,
    alerts,
    byType,
    counts,
    loading,
    error,
    fetchAlerts,
    fetchCount,
    markAsRead,
    markAllAsRead,
    isRead,
    isMarkingAsRead // ✅ NUEVO
  }
}

export default useCrmNotifications