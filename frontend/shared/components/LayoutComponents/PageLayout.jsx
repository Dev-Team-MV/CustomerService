// apps/mv-crm/src/components/layout/PageLayout.jsx
import { useState, useEffect, useCallback } from 'react'
import { Box, Typography, IconButton, Tooltip, Drawer, useMediaQuery, useTheme } from '@mui/material'
import { AddCircle as AddCircleIcon, Search, Menu as MenuIcon } from '@mui/icons-material'
import { motion } from 'framer-motion'
import Sidebar from './Sidebar'
import NotificationBell from '../../../apps/mv-crm/src/components/notifications/NotificationBell'
import NotificationsDrawer from '../../../apps/mv-crm/src/components/notifications/NotificationsDrawer'
import GlobalSearch from '../../../apps/mv-crm/src/components/GlobalSearch'
import NotificationCreatorModal from '@shared/components/Notifications/NotificationCreatorModal'
import useCrmNotifications from '../../../apps/mv-crm/src/constants/hooks/useCrmNotifications'
import { useKeyboardShortcut } from '../../../apps/mv-crm/src/constants/hooks/useKeyboardShortcut'
import { useAuth } from '@shared/context/AuthContext'
import api from '@shared/services/api'
import { useTranslation } from 'react-i18next'
import LanguageSwitcher from '../LanguageSwitcher'

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
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  
  const [currentTime, setCurrentTime] = useState(new Date())
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [notificationCreatorOpen, setNotificationCreatorOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false) // ✅ NUEVO
  const [users, setUsers] = useState([])

  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin'

  const {
    unreadCount,
    alerts,
    byType,
    counts,
    loading,
    error,
    fetchAlerts,
    markAsRead,
    markAllAsRead,
    isRead,
    isMarkingAsRead
  } = useCrmNotifications({ enabled: Boolean(user) })

  // Shortcut Cmd+K / Ctrl+K para abrir búsqueda
  const handleOpenSearch = useCallback(() => {
    setSearchOpen(true)
  }, [])

  useKeyboardShortcut('k', handleOpenSearch, { metaKey: true })
  useKeyboardShortcut('k', handleOpenSearch, { ctrlKey: true })

  // ✅ NUEVO: Cerrar menú móvil al cambiar de ruta
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [window.location.pathname])

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

  const formatTime = (d) => d.toLocaleTimeString('en-US', {
    hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit'
  })

  const handleNotificationCreated = (notification) => {
    console.log('✅ Notificación creada:', notification)
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

      {/* Sidebar - Solo desktop */}
      <Box sx={{ display: { xs: 'none', md: 'flex' }, zIndex: 10, position: 'relative', flexShrink: 0 }}>
        <Sidebar stats={sidebarStats} />
      </Box>

      {/* ✅ NUEVO: Drawer móvil */}
      <Drawer
        anchor="left"
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        ModalProps={{
          keepMounted: true, // Mejor performance en móvil
        }}
        PaperProps={{
          sx: {
            width: 260,
            bgcolor: '#0a0a0a',
            borderRight: '1px solid #1a1a1a'
          }
        }}
      >
        <Sidebar stats={sidebarStats} onNavigate={() => setMobileMenuOpen(false)} />
      </Drawer>

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
            px: { xs: 2, md: 5 }, py: 2,
            borderBottom: '1px solid #ececec',
            background: '#fff',
            zIndex: 5,
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              {/* ✅ NUEVO: Botón hamburguesa - Solo móvil */}
              <IconButton
                onClick={() => setMobileMenuOpen(true)}
                sx={{ 
                  display: { xs: 'flex', md: 'none' },
                  color: '#000',
                  p: 0.75
                }}
              >
                <MenuIcon sx={{ fontSize: 22 }} />
              </IconButton>

              <Box sx={{ width: { xs: 0, md: 16 }, height: 1, bgcolor: '#ccc', display: { xs: 'none', md: 'block' } }} />
              <Typography sx={{
                fontFamily: '"Courier New", monospace',
                fontSize: { xs: '0.55rem', md: '0.62rem' },
                color: '#000',
                letterSpacing: '2px',
                textTransform: 'uppercase'
              }}>
                {topbarLabel}
              </Typography>
            </Box>

            {/* NOTIFICACIONES + BÚSQUEDA + RELOJ */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, md: 2 } }}>
              {/* Language Switcher */}
              <LanguageSwitcher />

              {/* Botón de búsqueda */}
              <Tooltip title="Buscar (⌘K)" placement="bottom">
                <IconButton
                  onClick={handleOpenSearch}
                  sx={{
                    color: '#000',
                    '&:hover': { bgcolor: 'rgba(0,0,0,0.05)' },
                    p: { xs: 0.75, md: 1 }
                  }}
                >
                  <Search sx={{ fontSize: { xs: 18, md: 20 } }} />
                </IconButton>
              </Tooltip>

              {/* Botón de crear notificación (solo admins) */}
              {isAdmin && (
                <Tooltip title="Crear Notificación" placement="bottom">
                  <IconButton
                    onClick={() => setNotificationCreatorOpen(true)}
                    sx={{
                      color: '#000',
                      '&:hover': { bgcolor: 'rgba(0,0,0,0.05)' },
                      display: { xs: 'none', md: 'flex' },
                      p: { xs: 0.75, md: 1 }
                    }}
                  >
                    <AddCircleIcon sx={{ fontSize: 20 }} />
                  </IconButton>
                </Tooltip>
              )}

              {/* NOTIFICATION BELL DEL CRM */}
              <NotificationBell
                unreadCount={unreadCount}
                onClick={() => setNotificationsOpen(true)}
              />

              {/* Reloj - Solo desktop */}
              <Typography sx={{
                fontFamily: '"Courier New", monospace',
                fontSize: '0.7rem',
                color: '#000',
                letterSpacing: '2px',
                display: { xs: 'none', md: 'block' }
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
          <Box sx={{ p: { xs: 2, md: 5 }, flex: 1 }}>

            {/* Title block */}
            {title && (
              <motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              >
                <Box sx={{ mb: { xs: 3, md: 5 } }}>
                  <Typography sx={{
                    fontFamily: '"Helvetica Neue", Arial, sans-serif',
                    fontWeight: 200,
                    fontSize: 'clamp(1.5rem, 3vw, 2.6rem)',
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
                        fontSize: '0.62rem', color: '#000',
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
              px: { xs: 2, md: 5 }, py: 2,
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

      {/* NOTIFICATIONS DRAWER DEL CRM */}
      <NotificationsDrawer
        open={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
        alerts={alerts}
        byType={byType}
        counts={counts}
        loading={loading}
        error={error}
        onFetchAlerts={fetchAlerts}
        onMarkAsRead={markAsRead}
        onMarkAllAsRead={markAllAsRead}
        isRead={isRead}
        isMarkingAsRead={isMarkingAsRead}
      />

      {/* GLOBAL SEARCH MODAL */}
      <GlobalSearch
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
      />

      {/* Modal de crear notificación (del shared, solo admins) */}
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