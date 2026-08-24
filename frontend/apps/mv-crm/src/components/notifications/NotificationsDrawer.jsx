// apps/mv-crm/src/components/notifications/NotificationsDrawer.jsx
import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Button,
  Chip,
  CircularProgress,
  Alert,
  Divider
} from '@mui/material'
import {
  Close,
  DoneAll,
  Payment,
  Assignment,
  TrendingUp,
  Warning,
  CheckCircle,
  Business,
  Person,
  Home,
  Apartment,
  CalendarToday
} from '@mui/icons-material'

const NotificationsDrawer = ({
  open,
  onClose,
  alerts,
  byType,
  counts,
  loading,
  error,
  onFetchAlerts,
  onMarkAsRead,
  onMarkAllAsRead,
  isRead,
  isMarkingAsRead
}) => {
  const { t } = useTranslation('navigation')
  const [activeTab, setActiveTab] = useState('all')

  useEffect(() => {
    if (open) {
      onFetchAlerts()
    }
  }, [open, onFetchAlerts])

   // ✅ NUEVO: Escuchar el evento para cerrar el drawer cuando el tour termine
  useEffect(() => {
    const handleTourResume = () => {
      onClose() // Esto ejecutará setNotificationsOpen(false) en PageLayout
    }
    window.addEventListener('tour-resume-notification-drawer', handleTourResume)
    return () => window.removeEventListener('tour-resume-notification-drawer', handleTourResume)
  }, [onClose])

  const tabs = [
    { key: 'all', label: t('tabs.all'), icon: null, count: counts.total },
    { key: 'overduePayments', label: t('tabs.overduePayments'), icon: <Payment sx={{ fontSize: 16 }} />, count: counts.overduePayments },
    { key: 'upcomingActivities', label: t('tabs.upcomingActivities'), icon: <Assignment sx={{ fontSize: 16 }} />, count: counts.upcomingActivities },
    { key: 'staleLeads', label: t('tabs.staleLeads'), icon: <TrendingUp sx={{ fontSize: 16 }} />, count: counts.staleLeads }
  ]

  const getAlertsByTab = () => {
    if (activeTab === 'all') return alerts
    return byType[activeTab] || []
  }

  const getAlertIcon = (type) => {
    switch (type) {
      case 'overdue_payment':
        return <Payment sx={{ fontSize: 20, color: '#d32f2f' }} />
      case 'upcoming_activity':
        return <Assignment sx={{ fontSize: 20, color: '#1976d2' }} />
      case 'stale_lead':
        return <TrendingUp sx={{ fontSize: 20, color: '#f57c00' }} />
      default:
        return <Warning sx={{ fontSize: 20, color: '#757575' }} />
    }
  }

  const getAlertColor = (type) => {
    switch (type) {
      case 'overdue_payment':
        return '#ffebee'
      case 'upcoming_activity':
        return '#e3f2fd'
      case 'stale_lead':
        return '#fff3e0'
      default:
        return '#f5f5f5'
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = date - now
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))

    if (diffDays < 0) return t('time.overdue')
    if (diffDays === 0) return t('time.today')
    if (diffDays === 1) return t('time.tomorrow')
    if (diffDays <= 7) return t('time.inDays', { days: diffDays })
    return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })
  }

  // ✅ NUEVO: Formatear monto de dinero
  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return ''
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(amount)
  }

  // ✅ NUEVO: Detectar si es apartamento o lote
  const getUnitIcon = (unitLabel) => {
    if (!unitLabel) return <Home sx={{ fontSize: 14 }} />
    const lower = unitLabel.toLowerCase()
    if (lower.includes('apt') || lower.includes('apto')) {
      return <Apartment sx={{ fontSize: 14, color: '#1976d2' }} />
    }
    return <Home sx={{ fontSize: 14, color: '#4caf50' }} />
  }

  // ✅ NUEVO: Renderizar contenido específico por tipo de alerta
  const renderAlertContent = (alert) => {
    const payload = alert.payload || {}

    switch (alert.type) {
      case 'overdue_payment':
        return (
          <Box>
            {/* Título y fecha */}
            <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
              <Typography
                sx={{
                  fontFamily: '"Helvetica Neue", sans-serif',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  color: '#000'
                }}
              >
                {alert.title}
              </Typography>
              {alert.dueDate && (
                <Chip
                  label={formatDate(alert.dueDate)}
                  size="small"
                  sx={{
                    bgcolor: '#d32f2f',
                    color: '#fff',
                    fontFamily: '"Courier New", monospace',
                    fontSize: '0.6rem',
                    fontWeight: 600,
                    height: 20
                  }}
                />
              )}
            </Box>

            {/* Cliente */}
            {payload.clientName && (
              <Box display="flex" alignItems="center" gap={0.5} mb={0.8}>
                <Person sx={{ fontSize: 14, color: '#666' }} />
                <Typography
                  sx={{
                    fontFamily: '"Courier New", monospace',
                    fontSize: '0.75rem',
                    color: '#444',
                    textTransform: 'capitalize'
                  }}
                >
                  {payload.clientName}
                </Typography>
              </Box>
            )}

            {/* Unidad */}
            {payload.unitLabel && (
              <Box display="flex" alignItems="center" gap={0.5} mb={0.8}>
                {getUnitIcon(payload.unitLabel)}
                <Typography
                  sx={{
                    fontFamily: '"Courier New", monospace',
                    fontSize: '0.75rem',
                    color: '#444'
                  }}
                >
                  {payload.unitLabel}
                </Typography>
              </Box>
            )}

            {/* Proyecto */}
            {payload.projectName && (
              <Box display="flex" alignItems="center" gap={0.5} mb={1}>
                <Business sx={{ fontSize: 14, color: '#2196f3' }} />
                <Typography
                  sx={{
                    fontFamily: '"Courier New", monospace',
                    fontSize: '0.7rem',
                    color: '#2196f3',
                    fontWeight: 500
                  }}
                >
                  {payload.projectName}
                </Typography>
              </Box>
            )}

            <Divider sx={{ my: 1 }} />

            {/* Monto y Status */}
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography
                sx={{
                  fontFamily: '"Helvetica Neue", sans-serif',
                  fontSize: '1.1rem',
                  fontWeight: 700,
                  color: '#d32f2f',
                  letterSpacing: '-0.02em'
                }}
              >
                {formatCurrency(payload.amount)}
              </Typography>
              {payload.status && (
                <Chip
                  label={payload.status}
                  size="small"
                  sx={{
                    bgcolor: payload.status === 'pending' ? '#fff3e0' : '#f5f5f5',
                    color: payload.status === 'pending' ? '#f57c00' : '#666',
                    fontFamily: '"Courier New", monospace',
                    fontSize: '0.6rem',
                    fontWeight: 600,
                    height: 20,
                    textTransform: 'uppercase'
                  }}
                />
              )}
            </Box>
          </Box>
        )

      case 'upcoming_activity':
        return (
          <Box>
            <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
              <Typography
                sx={{
                  fontFamily: '"Helvetica Neue", sans-serif',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  color: '#000'
                }}
              >
                {alert.title}
              </Typography>
              {alert.dueDate && (
                <Chip
                  icon={<CalendarToday sx={{ fontSize: 12 }} />}
                  label={formatDate(alert.dueDate)}
                  size="small"
                  sx={{
                    bgcolor: '#e3f2fd',
                    color: '#1976d2',
                    fontFamily: '"Courier New", monospace',
                    fontSize: '0.6rem',
                    fontWeight: 600,
                    height: 20
                  }}
                />
              )}
            </Box>

            {alert.message && (
              <Typography
                sx={{
                  fontFamily: '"Courier New", monospace',
                  fontSize: '0.7rem',
                  color: '#666',
                  letterSpacing: '0.5px',
                  mb: 1
                }}
              >
                {alert.message}
              </Typography>
            )}

            {payload.projectName && (
              <Box display="flex" alignItems="center" gap={0.5}>
                <Business sx={{ fontSize: 14, color: '#2196f3' }} />
                <Typography
                  sx={{
                    fontFamily: '"Courier New", monospace',
                    fontSize: '0.7rem',
                    color: '#2196f3',
                    fontWeight: 500
                  }}
                >
                  {payload.projectName}
                </Typography>
              </Box>
            )}
          </Box>
        )

      case 'stale_lead':
        return (
          <Box>
            <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
              <Typography
                sx={{
                  fontFamily: '"Helvetica Neue", sans-serif',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  color: '#000'
                }}
              >
                {alert.title}
              </Typography>
            </Box>

            {alert.message && (
              <Typography
                sx={{
                  fontFamily: '"Courier New", monospace',
                  fontSize: '0.7rem',
                  color: '#666',
                  letterSpacing: '0.5px',
                  mb: 1
                }}
              >
                {alert.message}
              </Typography>
            )}

            {payload.projectName && (
              <Box display="flex" alignItems="center" gap={0.5}>
                <Business sx={{ fontSize: 14, color: '#2196f3' }} />
                <Typography
                  sx={{
                    fontFamily: '"Courier New", monospace',
                    fontSize: '0.7rem',
                    color: '#2196f3',
                    fontWeight: 500
                  }}
                >
                  {payload.projectName}
                </Typography>
              </Box>
            )}
          </Box>
        )

      default:
        return (
          <Box>
            <Typography
              sx={{
                fontFamily: '"Helvetica Neue", sans-serif',
                fontSize: '0.85rem',
                fontWeight: 600,
                color: '#000',
                mb: 0.5
              }}
            >
              {alert.title}
            </Typography>
            <Typography
              sx={{
                fontFamily: '"Courier New", monospace',
                fontSize: '0.7rem',
                color: '#666',
                letterSpacing: '0.5px'
              }}
            >
              {alert.message}
            </Typography>
          </Box>
        )
    }
  }

  const currentAlerts = getAlertsByTab()

return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{ sx: { width: { xs: '100%', sm: 420 }, bgcolor: '#fafafa' } }}
    >
      {/* ✅ ID: Header */}
      <Box id="notif-drawer-header" sx={{ p: 2, borderBottom: '1px solid #ececec', bgcolor: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box display="flex" alignItems="center" gap={1}>
          <Typography sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.85rem', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase' }}>
            {t('title')}
          </Typography>
          {counts.total > 0 && (
            <Chip label={counts.total} size="small" sx={{ bgcolor: '#000', color: '#fff', fontFamily: '"Courier New", monospace', fontSize: '0.7rem', fontWeight: 700, height: 22 }} />
          )}
        </Box>
        <Box display="flex" gap={1}>
          {alerts.length > 0 && (
            // ✅ ID: Botón Marcar todo como leído
            <Button id="notif-drawer-mark-all" size="small" startIcon={<DoneAll />} onClick={onMarkAllAsRead} sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.65rem', textTransform: 'none', letterSpacing: '0.5px', color: '#888' }}>
              {t('markAllRead')}
            </Button>
          )}
          <IconButton onClick={onClose} size="small">
            <Close fontSize="small" />
          </IconButton>
        </Box>
      </Box>

      {/* ✅ ID: Tabs */}
      <Box id="notif-drawer-tabs" sx={{ display: 'flex', gap: 0.5, p: 1.5, bgcolor: '#fff', borderBottom: '1px solid #ececec', overflowX: 'auto' }}>
        {tabs.map(tab => (
          <Chip
            key={tab.key}
            icon={tab.icon}
            label={`${tab.label} (${tab.count})`}
            onClick={() => setActiveTab(tab.key)}
            color={activeTab === tab.key ? 'primary' : 'default'}
            variant={activeTab === tab.key ? 'filled' : 'outlined'}
            size="small"
            sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.65rem', letterSpacing: '0.5px', cursor: 'pointer', flexShrink: 0 }}
          />
        ))}
      </Box>

      {/* ✅ ID: Lista de contenido */}
      <Box id="notif-drawer-list" sx={{ flex: 1, overflowY: 'auto', p: 2 }}>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" py={8}><CircularProgress size={32} /></Box>
        ) : error ? (
          <Alert severity="error" sx={{ borderRadius: 0 }}>{error}</Alert>
        ) : currentAlerts.length === 0 ? (
          <Box sx={{ py: 8, textAlign: 'center', border: '2px dashed #e0e0e0', borderRadius: 1 }}>
            <Typography sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.75rem', color: '#888', letterSpacing: '0.5px' }}>{t('empty')}</Typography>
          </Box>
        ) : (
          <Box display="flex" flexDirection="column" gap={1.5}>
            {currentAlerts.map(alert => {
              const read = isRead(alert.id)
              const marking = isMarkingAsRead?.(alert.id)
              
              return (
                <Box
                  key={alert.id}
                  onClick={() => !read && !marking && onMarkAsRead(alert)}
                  sx={{
                    p: 2, bgcolor: read ? '#fff' : getAlertColor(alert.type), border: `1px solid ${read ? '#ececec' : '#ddd'}`, borderRadius: 1,
                    cursor: read || marking ? 'default' : 'pointer', opacity: read ? 0.6 : marking ? 0.7 : 1, transition: 'all 0.2s', position: 'relative',
                    '&:hover': { boxShadow: read || marking ? 'none' : '0 2px 8px rgba(0,0,0,0.08)', borderColor: read || marking ? undefined : '#000' }
                  }}
                >
                  {marking && <Box sx={{ position: 'absolute', top: 8, right: 8, zIndex: 1 }}><CircularProgress size={16} /></Box>}
                  {read && <Box sx={{ position: 'absolute', top: 8, right: 8, zIndex: 1 }}><CheckCircle sx={{ fontSize: 16, color: '#4caf50' }} /></Box>}

                  <Box display="flex" gap={1.5} alignItems="flex-start">
                    <Box sx={{ mt: 0.5 }}>{getAlertIcon(alert.type)}</Box>
                    <Box flex={1}>{renderAlertContent(alert)}</Box>
                  </Box>
                </Box>
              )
            })}
          </Box>
        )}
      </Box>

      {/* ✅ ID: Footer */}
      <Box id="notif-drawer-footer" sx={{ p: 2, borderTop: '1px solid #ececec', bgcolor: '#fff', textAlign: 'center' }}>
        <Typography sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.6rem', color: '#888', letterSpacing: '1px', textTransform: 'uppercase' }}>
          {t('footer.updateInfo')}
        </Typography>
      </Box>
    </Drawer>
  )
}

export default NotificationsDrawer