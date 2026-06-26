import { WebSocketServer } from 'ws'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import {
  formatNotificationForUser,
  notificationMatchesProject,
  shouldDeliverToUser
} from '../utils/notificationHelpers.js'

const clientsByUserId = new Map()
let wss = null

const toUserIdStr = (id) => String(id)

const addClient = (userId, ws) => {
  const key = toUserIdStr(userId)
  if (!clientsByUserId.has(key)) {
    clientsByUserId.set(key, new Set())
  }
  clientsByUserId.get(key).add(ws)
}

const removeClient = (userId, ws) => {
  const key = toUserIdStr(userId)
  const clients = clientsByUserId.get(key)
  if (!clients) return
  clients.delete(ws)
  if (clients.size === 0) {
    clientsByUserId.delete(key)
  }
}

const sendJson = (ws, payload) => {
  if (ws.readyState === ws.OPEN) {
    ws.send(JSON.stringify(payload))
  }
}

const parseAuthFromRequest = (req) => {
  const authHeader = req.headers.authorization || req.headers.Authorization
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.slice('Bearer '.length).trim()
  }

  try {
    const url = new URL(req.url, 'http://localhost')
    return url.searchParams.get('token') || null
  } catch {
    return null
  }
}

const resolveUserFromToken = async (token) => {
  if (!token) return null
  const decoded = jwt.verify(token, process.env.JWT_SECRET)
  return User.findById(decoded.id).select('_id role')
}

const broadcastNotificationAsync = async (notification) => {
  if (!wss || !notification) return

  for (const [userId, sockets] of clientsByUserId.entries()) {
    const ws = [...sockets][0]
    const role = ws?.userRole
    if (!shouldDeliverToUser(notification, userId, role)) continue
    if (!await notificationMatchesProject(notification, userId, role)) continue

    const formatted = formatNotificationForUser(notification, userId)
    for (const socket of sockets) {
      sendJson(socket, { type: 'new_notification', data: formatted })
    }
  }
}

export const broadcastNotification = (notification) => {
  Promise.resolve(broadcastNotificationAsync(notification)).catch((error) => {
    console.error('[Notifications WS]', error.message)
  })
}

export const initNotificationWebSocket = (server) => {
  wss = new WebSocketServer({ noServer: true })

  server.on('upgrade', async (req, socket, head) => {
    if (!req.url?.startsWith('/ws/notifications')) {
      return
    }

    try {
      const token = parseAuthFromRequest(req)
      const user = await resolveUserFromToken(token)
      if (!user) {
        socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n')
        socket.destroy()
        return
      }

      wss.handleUpgrade(req, socket, head, (ws) => {
        ws.userId = user._id
        ws.userRole = user.role
        wss.emit('connection', ws, req, user)
      })
    } catch {
      socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n')
      socket.destroy()
    }
  })

  wss.on('connection', (ws, _req, user) => {
    const userId = user._id
    addClient(userId, ws)
    ws.userRole = user.role

    const heartbeat = setInterval(() => {
      sendJson(ws, { type: 'no_new_notification' })
    }, 25000)

    ws.on('close', () => {
      clearInterval(heartbeat)
      removeClient(userId, ws)
    })

    ws.on('error', () => {
      clearInterval(heartbeat)
      removeClient(userId, ws)
    })
  })

  console.log('[Notifications] WebSocket ready at /ws/notifications')
}
