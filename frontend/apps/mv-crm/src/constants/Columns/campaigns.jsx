// apps/mv-crm/src/constants/Columns/campaigns.js
import { Box, Typography, Chip, LinearProgress, Tooltip, IconButton } from '@mui/material'
import { Edit, Delete, Send, Refresh, Drafts, Schedule, CheckCircle, Error as ErrorIcon, Replay } from '@mui/icons-material'

// ✅ NUEVO: Función que genera STATUS_CONFIG con traducciones
export const getStatusConfig = (t) => ({
  borrador: { 
    label: t('statusLabels.borrador', 'Borrador'), 
    color: '#757575', 
    bgColor: '#f5f5f5',
    icon: <Drafts sx={{ fontSize: 14 }} />
  },
  programada: { 
    label: t('statusLabels.programada', 'Programada'), 
    color: '#1976d2', 
    bgColor: '#e3f2fd',
    icon: <Schedule sx={{ fontSize: 14 }} />
  },
  enviando: { 
    label: t('statusLabels.enviando', 'Enviando'), 
    color: '#f57c00', 
    bgColor: '#fff3e0',
    icon: <Send sx={{ fontSize: 14 }} />
  },
  completada: { 
    label: t('statusLabels.completada', 'Completada'), 
    color: '#2e7d32', 
    bgColor: '#e8f5e9',
    icon: <CheckCircle sx={{ fontSize: 14 }} />
  },
  fallida: { 
    label: t('statusLabels.fallida', 'Fallida'), 
    color: '#c62828', 
    bgColor: '#ffebee',
    icon: <ErrorIcon sx={{ fontSize: 14 }} />
  }
})

// ✅ Fallback estático para filtros (cuando no hay t disponible)
export const STATUS_CONFIG = {
  borrador: { 
    label: 'Borrador', 
    color: '#757575', 
    bgColor: '#f5f5f5',
    icon: <Drafts sx={{ fontSize: 14 }} />
  },
  programada: { 
    label: 'Programada', 
    color: '#1976d2', 
    bgColor: '#e3f2fd',
    icon: <Schedule sx={{ fontSize: 14 }} />
  },
  enviando: { 
    label: 'Enviando', 
    color: '#f57c00', 
    bgColor: '#fff3e0',
    icon: <Send sx={{ fontSize: 14 }} />
  },
  completada: { 
    label: 'Completada', 
    color: '#2e7d32', 
    bgColor: '#e8f5e9',
    icon: <CheckCircle sx={{ fontSize: 14 }} />
  },
  fallida: { 
    label: 'Fallida', 
    color: '#c62828', 
    bgColor: '#ffebee',
    icon: <ErrorIcon sx={{ fontSize: 14 }} />
  }
}

// ✅ ACTUALIZADO: getAudienceLabel ahora recibe t como parámetro
const getAudienceLabel = (audience, projects, t) => {
  if (!audience) return '-'
  const parts = []
  
  parts.push(audience.type === 'leads' ? t('audience.leads', 'Leads') : t('audience.clients', 'Clientes'))
  
  if (audience.projectId) {
    const projectName = typeof audience.projectId === 'object' 
      ? audience.projectId.name 
      : projects?.find(p => p._id === audience.projectId)?.name
    if (projectName) parts.push(projectName)
  }
  
  if (audience.stage) {
    const stageLabel = audience.stage.charAt(0).toUpperCase() + audience.stage.slice(1)
    parts.push(stageLabel)
  }
  
  return parts.join(' • ')
}

const formatDate = (dateString) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export const useCampaignColumns = ({ t, projects, LEAD_STAGES, stats, onEdit, onDelete, onSend, onRefresh }) => {
  // ✅ NUEVO: Generar STATUS_CONFIG traducido
  const STATUS_CONFIG_TRANSLATED = getStatusConfig(t)
  
  return [
    {
      field: 'name',
      headerName: t('table.name', 'Nombre'),
      minWidth: 200,
      renderCell: ({ row }) => (
        <Typography
          sx={{
            fontFamily: '"Helvetica Neue", sans-serif',
            fontSize: '0.875rem',
            fontWeight: 600,
            color: '#000'
          }}
        >
          {row.name}
        </Typography>
      )
    },
    {
      field: 'status',
      headerName: t('table.status', 'Estado'),
      minWidth: 130,
      renderCell: ({ row }) => {
        // ✅ ACTUALIZADO: Usar STATUS_CONFIG traducido
        const statusConfig = STATUS_CONFIG_TRANSLATED[row.status] || STATUS_CONFIG_TRANSLATED.borrador
        
        return (
          <Chip
            icon={statusConfig.icon}
            label={statusConfig.label}
            size="small"
            sx={{
              bgcolor: statusConfig.bgColor,
              color: statusConfig.color,
              fontFamily: '"Courier New", monospace',
              fontSize: '0.7rem',
              fontWeight: 600,
              letterSpacing: '0.5px',
              height: 24,
              '& .MuiChip-icon': { color: statusConfig.color }
            }}
          />
        )
      }
    },
    {
      field: 'audience',
      headerName: t('table.audience', 'Audiencia'),
      minWidth: 250,
      renderCell: ({ row }) => (
        <Typography
          sx={{
            fontFamily: '"Courier New", monospace',
            fontSize: '0.75rem',
            color: '#666',
            letterSpacing: '0.5px'
          }}
        >
          {/* ✅ ACTUALIZADO: Pasar t a getAudienceLabel */}
          {getAudienceLabel(row.audience, projects, t)}
        </Typography>
      )
    },
    {
      field: 'stats',
      headerName: t('table.stats', 'Estadísticas'),
      minWidth: 200,
      renderCell: ({ row }) => {
        const campaignStats = stats?.[row._id] || row.stats || { total: 0, sent: 0, failed: 0 }
        const progressPercent = campaignStats.total > 0 ? (campaignStats.sent / campaignStats.total) * 100 : 0

        return (
          <Box>
            <Box display="flex" gap={0.5} mb={0.5} flexWrap="wrap">
              {/* ✅ ACTUALIZADO: Usar traducciones */}
              <Chip
                label={`${campaignStats.total} ${t('stats.total', 'total')}`}
                size="small"
                sx={{
                  bgcolor: '#f5f5f5',
                  fontFamily: '"Courier New", monospace',
                  fontSize: '0.65rem',
                  letterSpacing: '0.5px',
                  height: 22
                }}
              />
              <Chip
                label={`${campaignStats.sent} ${t('stats.sent', 'enviados')}`}
                size="small"
                sx={{
                  bgcolor: '#e8f5e9',
                  color: '#2e7d32',
                  fontFamily: '"Courier New", monospace',
                  fontSize: '0.65rem',
                  fontWeight: 600,
                  letterSpacing: '0.5px',
                  height: 22
                }}
              />
              {campaignStats.failed > 0 && (
                <Chip
                  label={`${campaignStats.failed} ${t('stats.failed', 'fallidos')}`}
                  size="small"
                  sx={{
                    bgcolor: '#ffebee',
                    color: '#c62828',
                    fontFamily: '"Courier New", monospace',
                    fontSize: '0.65rem',
                    fontWeight: 600,
                    letterSpacing: '0.5px',
                    height: 22
                  }}
                />
              )}
            </Box>
            
            {row.status === 'enviando' && (
              <LinearProgress
                variant="determinate"
                value={progressPercent}
                sx={{
                  height: 4,
                  borderRadius: 2,
                  bgcolor: '#e0e0e0',
                  '& .MuiLinearProgress-bar': {
                    bgcolor: '#4caf50',
                    borderRadius: 2
                  }
                }}
              />
            )}
          </Box>
        )
      }
    },
    {
      field: 'date',
      headerName: t('table.date', 'Fecha'),
      minWidth: 150,
      renderCell: ({ row }) => (
        <Typography
          sx={{
            fontFamily: '"Courier New", monospace',
            fontSize: '0.75rem',
            color: '#888',
            letterSpacing: '0.5px'
          }}
        >
          {formatDate(row.sentAt || row.createdAt)}
        </Typography>
      )
    },
    {
      field: 'actions',
      headerName: t('table.actions', 'Acciones'),
      minWidth: 180,
      align: 'right',
      renderCell: ({ row }) => (
        <Box display="flex" gap={0.5} justifyContent="flex-end">
          {/* Editar y Eliminar solo para borrador */}
          {row.status === 'borrador' && (
            <>
              <Tooltip title={t('edit', 'Editar')}>
                <IconButton
                  size="small"
                  onClick={() => onEdit(row)}
                  sx={{
                    color: '#888',
                    '&:hover': { color: '#000', bgcolor: '#f5f5f5' }
                  }}
                >
                  <Edit sx={{ fontSize: 18 }} />
                </IconButton>
              </Tooltip>
              <Tooltip title={t('delete', 'Eliminar')}>
                <IconButton
                  size="small"
                  onClick={() => onDelete(row)}
                  sx={{
                    color: '#f44336',
                    '&:hover': { bgcolor: '#ffebee' }
                  }}
                >
                  <Delete sx={{ fontSize: 18 }} />
                </IconButton>
              </Tooltip>
            </>
          )}
          
          {/* Enviar para borrador o programada */}
          {(row.status === 'borrador' || row.status === 'programada') && (
            <Tooltip title={t('send', 'Enviar')}>
              <IconButton
                size="small"
                onClick={() => onSend(row)}
                sx={{
                  color: '#4caf50',
                  '&:hover': { bgcolor: '#e8f5e9' }
                }}
              >
                <Send sx={{ fontSize: 18 }} />
              </IconButton>
            </Tooltip>
          )}

          {/* Reenviar para completada o fallida */}
          {(row.status === 'completada' || row.status === 'fallida') && (
            <Tooltip title={t('resend', 'Reenviar')}>
              <IconButton
                size="small"
                onClick={() => onSend(row, true)}
                sx={{
                  color: row.status === 'fallida' ? '#f44336' : '#4caf50',
                  '&:hover': { 
                    bgcolor: row.status === 'fallida' ? '#ffebee' : '#e8f5e9' 
                  }
                }}
              >
                <Replay sx={{ fontSize: 18 }} />
              </IconButton>
            </Tooltip>
          )}

          {/* Actualizar para enviando */}
          {row.status === 'enviando' && (
            <Tooltip title={t('refresh', 'Actualizar')}>
              <IconButton
                size="small"
                onClick={() => onRefresh()}
                sx={{
                  color: '#f57c00',
                  '&:hover': { bgcolor: '#fff3e0' }
                }}
              >
                <Refresh sx={{ fontSize: 18 }} />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      )
    }
  ]
}

export default useCampaignColumns