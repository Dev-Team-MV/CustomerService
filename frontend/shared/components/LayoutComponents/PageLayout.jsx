import { useState, useEffect } from 'react'
import { Box, Typography, IconButton, Badge, Tooltip } from '@mui/material'
import { Notifications as NotificationsIcon, AddCircle as AddCircleIcon } from '@mui/icons-material'
import { motion } from 'framer-motion'
import Sidebar from './Sidebar'
import NotificationsDrawer from '@shared/components/LayoutComponents/NotificationsDrawer'
import NotificationCreatorModal from '@shared/components/Notifications/NotificationCreatorModal'
import useNotifications from '@shared/hooks/useNotifications'
import { useAuth } from '../../context/AuthContext'
import api from '../../services/api'
import { useTranslation } from 'react-i18next'

export default function PageLayout({
  title,
  titleBold,
  topbarLabel,
  subtitle,
  sidebarStats = [],
  children
}) {
  const { t } = useTranslation('common')
  const { user } = useAuth()
  const [currentTime, setCurrentTime] = useState(new Date())
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [notificationCreatorOpen, setNotificationCreatorOpen] = useState(false)
  const [users, setUsers] = useState([])

  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin'

  const {
    notifications,
    refresh,
    markNotificationAsRead,
    markAllNotificationsAsRead
  } = useNotifications({ enabled: Boolean(user) })

  // Cargar usuarios cuando se abre el modal de crear notificación
  useEffect(() => {
    if (notificationCreatorOpen && isAdmin && users.length === 0) {
      api.get('/users')
        .then(res => setUsers(res.data || []))
        .catch(err => console.error('Error loading users:', err))
    }
  }, [notificationCreatorOpen, isAdmin, users.length])

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    if (notificationsOpen && user) {
      refresh()
    }
  }, [notificationsOpen, user, refresh])

  const formatTime = (d) => d.toLocaleTimeString('en-US', {
    hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit'
  })

  const handleNotificationCreated = (notification) => {
    console.log('✅ Notificación creada:', notification)
    refresh()
  }

  return (
    <Box sx={{
      height: '100vh',
      display: 'flex',
      background: '#fafafa',
      position: 'relative',
      overflow: 'hidden',
    }}>

      {/* Grid bg */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2 }}
        style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          backgroundImage: `linear-gradient(rgba(0,0,0,0.022) 1px,transparent 1px),linear-gradient(90deg,rgba(0,0,0,0.022) 1px,transparent 1px)`,
          backgroundSize: '48px 48px'
        }}
      />

      {/* Sidebar */}
      <Box sx={{ display: { xs: 'none', md: 'flex' }, zIndex: 10, position: 'relative', flexShrink: 0 }}>
        <Sidebar stats={sidebarStats} />
      </Box>

      {/* Main */}
      <Box sx={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        position: 'relative',
        zIndex: 1,
      }}>

        {/* Topbar */}
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          style={{ flexShrink: 0 }}
        >
          <Box sx={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            px: { xs: 3, md: 5 }, py: 2.5,
            borderBottom: '1px solid #ececec',
            background: '#fff',
            zIndex: 5,
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ width: 16, height: 1, bgcolor: '#ccc' }} />
              <Typography sx={{
                fontFamily: '"Courier New", monospace',
                fontSize: '0.62rem', color: '#000000ff',
                letterSpacing: '2px', textTransform: 'uppercase'
              }}>
                {topbarLabel}
              </Typography>
            </Box>

            {/* ✅ NUEVO: Botón de notificaciones + reloj */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {/* Botón de crear notificación (solo admins) */}
              {isAdmin && (
                <Tooltip title="Crear Notificación" placement="bottom">
                  <IconButton
                    onClick={() => setNotificationCreatorOpen(true)}
                    sx={{
                      color: '#000',
                      '&:hover': { bgcolor: 'rgba(0,0,0,0.05)' }
                    }}
                  >
                    <AddCircleIcon sx={{ fontSize: 20 }} />
                  </IconButton>
                </Tooltip>
              )}

              {/* Botón de ver notificaciones */}
              <Tooltip title="Notificaciones" placement="bottom">
                <IconButton
                  onClick={() => setNotificationsOpen(true)}
                  sx={{
                    color: '#000',
                    '&:hover': { bgcolor: 'rgba(0,0,0,0.05)' }
                  }}
                >
                  <Badge 
                    badgeContent={notifications.filter(n => !n.read).length} 
                    color="error"
                    sx={{
                      '& .MuiBadge-badge': {
                        fontFamily: '"Courier New", monospace',
                        fontSize: '0.65rem',
                        fontWeight: 700
                      }
                    }}
                  >
                    <NotificationsIcon sx={{ fontSize: 20 }} />
                  </Badge>
                </IconButton>
              </Tooltip>

              {/* Reloj */}
              <Typography sx={{
                fontFamily: '"Courier New", monospace',
                fontSize: '0.7rem', color: '#000000ff', letterSpacing: '2px'
              }}>
                {formatTime(currentTime)}
              </Typography>
            </Box>
          </Box>
        </motion.div>

        {/* Scrolleable content */}
        <Box sx={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}>
          {/* Page content */}
          <Box sx={{ p: { xs: 3, md: 5 }, flex: 1 }}>

            {/* Title block */}
            {title && (
              <motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              >
                <Box sx={{ mb: 5 }}>
                  <Typography sx={{
                    fontFamily: '"Helvetica Neue", Arial, sans-serif',
                    fontWeight: 200,
                    fontSize: 'clamp(1.8rem, 3vw, 2.6rem)',
                    color: '#000', letterSpacing: '-0.04em', lineHeight: 1
                  }}>
                    {title}{' '}
                    {titleBold && (
                      <Box component="span" sx={{ fontWeight: 700 }}>{titleBold}</Box>
                    )}
                  </Typography>
                  {subtitle && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
                      <motion.div animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 2, repeat: Infinity }}>
                        <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#000' }} />
                      </motion.div>
                      <Typography sx={{
                        fontFamily: '"Courier New", monospace',
                        fontSize: '0.62rem', color: '#000000ff',
                        letterSpacing: '1.5px', textTransform: 'uppercase'
                      }}>
                        {subtitle}
                      </Typography>
                    </Box>
                  )}
                  <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 0.7, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    style={{ transformOrigin: 'left' }}
                  >
                    <Box sx={{ height: 1, bgcolor: '#ececec', mt: 3 }} />
                  </motion.div>
                </Box>
              </motion.div>
            )}

            {children}
          </Box>

          {/* Footer */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.1 }}>
            <Box sx={{
              px: { xs: 3, md: 5 }, py: 2,
              borderTop: '1px solid #ececec',
              background: '#fff',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              mt: 'auto',
            }}>
              <Typography sx={{
                fontFamily: '"Courier New", monospace',
                fontSize: '0.6rem', color: '#ccc',
                letterSpacing: '1.5px', textTransform: 'uppercase'
              }}>
                {t('footer.copyright', { year: new Date().getFullYear() })}
              </Typography>
              <Box sx={{ display: 'flex', gap: 0.5 }}>
                {[0, 1, 2].map(i => (
                  <motion.div key={i} animate={{ opacity: [0.2, 1, 0.2] }} transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}>
                    <Box sx={{ width: 3, height: 3, borderRadius: '50%', bgcolor: '#ccc' }} />
                  </motion.div>
                ))}
              </Box>
            </Box>
          </motion.div>
        </Box>
      </Box>

      {/* ✅ NUEVO: Drawer de notificaciones */}
      <NotificationsDrawer
        open={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
        notifications={notifications}
        onMarkAsRead={markNotificationAsRead}
        onMarkAllAsRead={markAllNotificationsAsRead}
        onCreateNotification={() => setNotificationCreatorOpen(true)}
        isAdmin={isAdmin}
      />

      {/* ✅ NUEVO: Modal de crear notificación */}
      {isAdmin && (
        <NotificationCreatorModal
          open={notificationCreatorOpen}
          onClose={() => setNotificationCreatorOpen(false)}
          users={users}
          defaultMode="general"
          onCreated={handleNotificationCreated}
        />
      )}
    </Box>
  )
}