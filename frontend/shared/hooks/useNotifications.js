import { useState, useEffect, useCallback, useRef } from 'react'
import notificationService from '../services/notificationService'

const getNotificationId = (notification) => String(notification?.id || notification?._id || '')

export const useNotifications = ({ enabled = true } = {}) => {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(false)
  const wsRef = useRef(null)
  const reconnectTimerRef = useRef(null)

  const refresh = useCallback(async () => {
    if (!enabled) return
    setLoading(true)
    try {
      const list = await notificationService.getLatest()
      setNotifications(list)
    } catch (error) {
      console.error('[Notifications] Failed to load:', error)
    } finally {
      setLoading(false)
    }
  }, [enabled])

  const upsertNotification = useCallback((incoming) => {
    if (!incoming) return
    const incomingId = getNotificationId(incoming)
    if (!incomingId) return

    setNotifications((prev) => {
      const index = prev.findIndex((item) => getNotificationId(item) === incomingId)
      if (index === -1) return [incoming, ...prev]
      const next = [...prev]
      next[index] = { ...next[index], ...incoming }
      return next
    })
  }, [])

  const markNotificationAsRead = useCallback(async (notificationId) => {
    const id = String(notificationId)
    if (!id) return

    setNotifications((prev) =>
      prev.map((item) =>
        getNotificationId(item) === id ? { ...item, read: true } : item
      )
    )

    try {
      await notificationService.markAsRead(id)
    } catch (error) {
      console.error('[Notifications] Failed to mark as read:', error)
      await refresh()
    }
  }, [refresh])

  const markAllNotificationsAsRead = useCallback(async () => {
    let unreadIds = []

    setNotifications((prev) => {
      unreadIds = prev
        .filter((item) => !item.read)
        .map((item) => getNotificationId(item))
        .filter(Boolean)

      if (!unreadIds.length) return prev
      return prev.map((item) => ({ ...item, read: true }))
    })

    if (!unreadIds.length) return

    try {
      await Promise.all(unreadIds.map((id) => notificationService.markAsRead(id)))
    } catch (error) {
      console.error('[Notifications] Failed to mark all as read:', error)
      await refresh()
    }
  }, [refresh])

  useEffect(() => {
    if (!enabled) {
      setNotifications([])
      return undefined
    }

    refresh()

    const connect = () => {
      const url = notificationService.getWebSocketUrl()
      if (!url) return

      const ws = new WebSocket(url)
      wsRef.current = ws

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data)
          if (message.type === 'new_notification' && message.data) {
            upsertNotification(message.data)
          }
        } catch (error) {
          console.error('[Notifications] WebSocket message error:', error)
        }
      }

      ws.onclose = () => {
        if (!enabled) return
        reconnectTimerRef.current = window.setTimeout(connect, 5000)
      }

      ws.onerror = () => {
        ws.close()
      }
    }

    connect()

    return () => {
      if (reconnectTimerRef.current) {
        window.clearTimeout(reconnectTimerRef.current)
      }
      if (wsRef.current) {
        wsRef.current.close()
        wsRef.current = null
      }
    }
  }, [enabled, refresh, upsertNotification])

  return {
    notifications,
    loading,
    refresh,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    setNotifications
  }
}

export default useNotifications
