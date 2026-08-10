import { 
  Box, Typography, Chip, Tooltip, Avatar, Drawer, 
  IconButton, Paper 
} from '@mui/material'
import { 
  Add, Edit, Delete, SwapHoriz, Sms, Login, 
  ArrowForward, Close, ContentCopy 
} from '@mui/icons-material'

export const ACTION_CONFIG = {
  created: { label: 'Creado', icon: Add, color: '#4caf50', bgColor: '#e8f5e9' },
  updated: { label: 'Actualizado', icon: Edit, color: '#2196f3', bgColor: '#e3f2fd' },
  deleted: { label: 'Eliminado', icon: Delete, color: '#f44336', bgColor: '#ffebee' },
  stage_changed: { label: 'Cambio de etapa', icon: SwapHoriz, color: '#ff9800', bgColor: '#fff3e0' },
  sms_sent: { label: 'SMS enviado', icon: Sms, color: '#9c27b0', bgColor: '#f3e5f5' },
  login: { label: 'Login', icon: Login, color: '#607d8b', bgColor: '#eceff1' }
}

const getRelativeTime = (timestamp, t) => {
  if (!timestamp) return ''
  
  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now - date
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)
  
  if (t) {
    if (diffMins < 1) return t('time.now', 'Ahora')
    if (diffMins < 60) return t('time.minutesAgo', { count: diffMins })
    if (diffHours < 24) return t('time.hoursAgo', { count: diffHours })
    if (diffDays < 7) return t('time.daysAgo', { count: diffDays })
  }
  
  if (diffMins < 1) return 'Ahora'
  if (diffMins < 60) return `Hace ${diffMins}m`
  if (diffHours < 24) return `Hace ${diffHours}h`
  if (diffDays < 7) return `Hace ${diffDays}d`
  
  return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })
}

const formatValue = (value) => {
  if (value === null || value === undefined) return '—'
  if (typeof value === 'string') return value
  if (typeof value === 'number') return value.toString()
  if (typeof value === 'boolean') return value ? 'Sí' : 'No'
  if (Array.isArray(value)) return value.join(', ')
  
  if (typeof value === 'object') {
    if (value.name) return value.name
    if (value.title) {
      return typeof value.title === 'object' 
        ? (value.title.es || value.title.en || 'Object')
        : value.title
    }
    if (value.email) return value.email
    if (value.firstName && value.lastName) return `${value.firstName} ${value.lastName}`
    
    const keys = Object.keys(value)
    if (keys.length > 0) {
      return `{${keys.slice(0, 3).join(', ')}${keys.length > 3 ? '...' : ''}}`
    }
  }
  
  return JSON.stringify(value)
}

const ActionBadge = ({ action, t }) => {
  const config = ACTION_CONFIG[action] || ACTION_CONFIG.updated
  const Icon = config.icon
  const label = t ? t(`actions.${action}`, config.label) : config.label
  
  return (
    <Chip
      icon={<Icon sx={{ fontSize: 14 }} />}
      label={label}
      size="small"
      sx={{
        bgcolor: config.bgColor,
        color: config.color,
        fontWeight: 600,
        fontSize: '0.7rem',
        height: 24,
        '& .MuiChip-icon': { color: config.color }
      }}
    />
  )
}

const EntityBadge = ({ entity }) => {
  const entityColors = {
    Lead: { color: '#e91e63', bg: '#fce4ec' },
    Client: { color: '#3f51b5', bg: '#e8eaf6' },
    Activity: { color: '#009688', bg: '#e0f2f1' },
    Appointment: { color: '#ff5722', bg: '#fbe9e7' },
    Campaign: { color: '#673ab7', bg: '#ede7f6' },
    Project: { color: '#4caf50', bg: '#e8f5e9' },
    Quote: { color: '#ff9800', bg: '#fff3e0' },
    Payment: { color: '#2196f3', bg: '#e3f2fd' },
    Document: { color: '#f44336', bg: '#ffebee' }
  }
  
  const config = entityColors[entity] || { color: '#757575', bg: '#f5f5f5' }
  
  return (
    <Chip
      label={entity}
      size="small"
      sx={{
        bgcolor: config.bg,
        color: config.color,
        fontWeight: 600,
        fontSize: '0.65rem',
        height: 22
      }}
    />
  )
}

const UserCell = ({ user, t }) => {
  if (!user) {
    return (
      <Typography variant="caption" color="text.secondary">
        {t ? t('table.system', 'Sistema') : 'Sistema'}
      </Typography>
    )
  }
  
  const name = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email || 'Unknown'
  const initials = `${(user.firstName || '')[0] || ''}${(user.lastName || '')[0] || ''}`.toUpperCase()
  
  return (
    <Box display="flex" alignItems="center" gap={1}>
      <Avatar sx={{ width: 28, height: 28, fontSize: '0.7rem', bgcolor: '#1976d2' }}>
        {initials || '?'}
      </Avatar>
      <Box>
        <Typography variant="body2" sx={{ fontSize: '0.75rem', fontWeight: 500 }}>
          {name}
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
          {user.role}
        </Typography>
      </Box>
    </Box>
  )
}

const ChangesCell = ({ changes, action, t }) => {
  if (!changes) {
    return <Typography variant="caption" color="text.secondary">—</Typography>
  }
  
  const { before, after } = changes
  const beforeObj = before || {}
  const afterObj = after || {}
  
  if (action === 'stage_changed') {
    const fromStage = beforeObj.stage || beforeObj.stageName || beforeObj.name || '—'
    const toStage = afterObj.stage || afterObj.stageName || afterObj.name || '—'
    
    return (
      <Box display="flex" alignItems="center" gap={0.5}>
        <Chip label={formatValue(fromStage)} size="small" sx={{ bgcolor: '#ffebee', color: '#d32f2f', fontSize: '0.65rem', height: 20 }} />
        <ArrowForward sx={{ fontSize: 14, color: '#666' }} />
        <Chip label={formatValue(toStage)} size="small" sx={{ bgcolor: '#e8f5e9', color: '#2e7d32', fontSize: '0.65rem', height: 20 }} />
      </Box>
    )
  }
  
  const changedFields = Object.keys(afterObj).filter(key => {
    return JSON.stringify(beforeObj[key]) !== JSON.stringify(afterObj[key])
  })
  
  if (changedFields.length === 0) {
    return (
      <Typography variant="caption" color="text.secondary">
        {t ? t('table.noChanges', 'Sin cambios') : 'Sin cambios'}
      </Typography>
    )
  }
  
  const preview = changedFields.slice(0, 3).join(', ')
  const more = changedFields.length > 3 ? ` +${changedFields.length - 3}` : ''
  
  return (
    <Typography variant="caption" sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.7rem', color: '#666' }}>
      {preview}{more}
    </Typography>
  )
}

const TimestampCell = ({ timestamp, t }) => {
  if (!timestamp) return null
  
  const date = new Date(timestamp)
  const relativeTime = getRelativeTime(timestamp, t)
  
  return (
    <Tooltip title={date.toLocaleString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' })} arrow>
      <Box>
        <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
          {relativeTime}
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
          {date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: '2-digit' })}
        </Typography>
      </Box>
    </Tooltip>
  )
}

export const AuditLogDetailDrawer = ({ log, open, onClose, t }) => {
  if (!log) return null
  
  const tr = (key, fallback) => (t ? t(key, fallback) : fallback)
  
  const { before, after } = log.changes || {}
  const beforeObj = before || {}
  const afterObj = after || {}
  
  const changedFields = Object.keys(afterObj).filter(key => 
    JSON.stringify(beforeObj[key]) !== JSON.stringify(afterObj[key])
  )
  
  const handleCopy = (text) => {
    navigator.clipboard.writeText(text)
  }
  
  return (
    <Drawer anchor="right" open={open} onClose={onClose} PaperProps={{ sx: { width: { xs: '100%', sm: 500 }, bgcolor: '#fafafa' } }}>
      <Box sx={{ p: 3, bgcolor: '#fff', borderBottom: '1px solid #e0e0e0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h6" fontWeight={700}>{tr('details.title', 'Detalles del cambio')}</Typography>
          <Typography variant="caption" color="text.secondary">{new Date(log.timestamp).toLocaleString('es-ES')}</Typography>
        </Box>
        <IconButton onClick={onClose}><Close /></IconButton>
      </Box>
      
      <Box sx={{ p: 3, overflowY: 'auto' }}>
        <Paper elevation={0} sx={{ p: 2, mb: 2, bgcolor: '#fff', border: '1px solid #e0e0e0' }}>
          <Box display="flex" gap={1} mb={2}>
            <ActionBadge action={log.action} t={t} />
            <EntityBadge entity={log.entity} />
          </Box>
          <Typography variant="body2" sx={{ mb: 1 }}>
            <strong>{tr('details.user', 'Usuario')}:</strong> {log.userId ? `${log.userId.firstName} ${log.userId.lastName}` : tr('table.system', 'Sistema')}
          </Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>
            <strong>{tr('details.ip', 'Dirección IP')}:</strong> {log.ip || '—'}
          </Typography>
          <Typography variant="body2">
            <strong>{tr('details.date', 'Fecha')}:</strong> {new Date(log.timestamp).toLocaleString('es-ES')}
          </Typography>
        </Paper>
        
        {log.changes && changedFields.length > 0 && (
          <Paper elevation={0} sx={{ p: 2, mb: 2, bgcolor: '#fff', border: '1px solid #e0e0e0' }}>
            <Typography variant="subtitle2" fontWeight={700} mb={2}>
              {tr('details.modifiedFields', 'Campos modificados')} ({changedFields.length})
            </Typography>
            <Box>
              {changedFields.map(field => (
                <Box key={field} sx={{ mb: 2 }}>
                  <Typography variant="body2" fontWeight={600} sx={{ mb: 0.5 }}>{field}</Typography>
                  <Box display="flex" gap={1} alignItems="flex-start">
                    <Box flex={1}>
                      <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>{tr('details.before', 'Antes')}:</Typography>
                      <Box sx={{ p: 1, bgcolor: '#ffebee', borderRadius: 1, fontFamily: '"Courier New", monospace', fontSize: '0.75rem', wordBreak: 'break-word' }}>
                        {formatValue(beforeObj[field])}
                      </Box>
                    </Box>
                    <ArrowForward sx={{ fontSize: 16, color: '#666', mt: 2 }} />
                    <Box flex={1}>
                      <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>{tr('details.after', 'Después')}:</Typography>
                      <Box sx={{ p: 1, bgcolor: '#e8f5e9', borderRadius: 1, fontFamily: '"Courier New", monospace', fontSize: '0.75rem', wordBreak: 'break-word' }}>
                        {formatValue(afterObj[field])}
                      </Box>
                    </Box>
                  </Box>
                </Box>
              ))}
            </Box>
          </Paper>
        )}
        
        <Paper elevation={0} sx={{ p: 2, bgcolor: '#fff', border: '1px solid #e0e0e0' }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
            <Typography variant="subtitle2" fontWeight={700}>{tr('details.fullData', 'Datos completos (JSON)')}</Typography>
            <IconButton size="small" onClick={() => handleCopy(JSON.stringify(log, null, 2))}>
              <ContentCopy sx={{ fontSize: 16 }} />
            </IconButton>
          </Box>
          <Box sx={{ p: 1, bgcolor: '#f5f5f5', borderRadius: 1, fontFamily: '"Courier New", monospace', fontSize: '0.7rem', maxHeight: 300, overflowY: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
            {JSON.stringify(log, null, 2)}
          </Box>
        </Paper>
      </Box>
    </Drawer>
  )
}

export const useAuditLogColumns = ({ t, showEntity = true, showUser = true, onRowClick }) => {
  const columns = []
  
  if (showUser) {
    columns.push({
      field: 'userId',
      headerName: t('table.user', 'Usuario'),
      minWidth: 200,
      renderCell: ({ row }) => <UserCell user={row.userId} t={t} />
    })
  }
  
  columns.push({
    field: 'action',
    headerName: t('table.action', 'Acción'),
    minWidth: 150,
    renderCell: ({ row }) => <ActionBadge action={row.action} t={t} />
  })
  
  if (showEntity) {
    columns.push({
      field: 'entity',
      headerName: t('table.entity', 'Entidad'),
      minWidth: 130,
      renderCell: ({ row }) => <EntityBadge entity={row.entity} />
    })
  }
  
  columns.push({
    field: 'changes',
    headerName: t('table.changes', 'Cambios'),
    flex: 1,
    minWidth: 250,
    renderCell: ({ row }) => <ChangesCell changes={row.changes} action={row.action} t={t} />
  })
  
  columns.push({
    field: 'timestamp',
    headerName: t('table.timestamp', 'Fecha'),
    minWidth: 160,
    renderCell: ({ row }) => <TimestampCell timestamp={row.timestamp} t={t} />
  })
  
  return columns
}

export default useAuditLogColumns