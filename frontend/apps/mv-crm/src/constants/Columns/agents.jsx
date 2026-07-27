// apps/mv-crm/src/constants/Columns/agents.js
import { Box, Typography, Chip, Avatar, IconButton, Tooltip, LinearProgress } from '@mui/material'
import { BarChart, Email, Phone, Flag } from '@mui/icons-material'

// ═══════════════════════════════════════════════════════════════
// COMPONENTE AUXILIAR: Barra de progreso de meta
// ═══════════════════════════════════════════════════════════════

const TargetProgressBar = ({ target, progress, completion, t }) => {
  // Si no hay meta configurada
  if (!target || target === 0) {
    return (
      <Tooltip title={t('table.noTarget', 'Sin meta')}>
        <Box sx={{ width: '100%', maxWidth: 120 }}>
          <Typography
            sx={{
              fontFamily: '"Courier New", monospace',
              fontSize: '0.6rem',
              color: '#ccc',
              textAlign: 'center',
              letterSpacing: '0.5px'
            }}
          >
            {t('table.noTarget', 'Sin meta')}
          </Typography>
        </Box>
      </Tooltip>
    )
  }

  const percent = Math.min(completion || 0, 100)
  
  // Color según el progreso
  let barColor = '#f44336' // rojo si < 30%
  if (percent >= 70) barColor = '#4caf50' // verde si >= 70%
  else if (percent >= 30) barColor = '#ff9800' // naranja si >= 30%

  return (
    <Box sx={{ width: '100%', maxWidth: 140 }}>
      {/* Números */}
      <Box display="flex" justifyContent="space-between" alignItems="baseline" mb={0.3}>
        <Typography
          sx={{
            fontFamily: '"Helvetica Neue", sans-serif',
            fontSize: '0.75rem',
            fontWeight: 700,
            color: '#000'
          }}
        >
          {progress ?? 0}
        </Typography>
        <Typography
          sx={{
            fontFamily: '"Courier New", monospace',
            fontSize: '0.65rem',
            color: '#888'
          }}
        >
          / {target}
        </Typography>
      </Box>
      
      {/* Barra de progreso */}
      <LinearProgress
        variant="determinate"
        value={percent}
        sx={{
          height: 6,
          borderRadius: 3,
          bgcolor: '#f0f0f0',
          '& .MuiLinearProgress-bar': {
            bgcolor: barColor,
            borderRadius: 3
          }
        }}
      />
      
      {/* Porcentaje */}
      <Typography
        sx={{
          fontFamily: '"Courier New", monospace',
          fontSize: '0.6rem',
          color: barColor,
          fontWeight: 700,
          textAlign: 'right',
          mt: 0.3,
          letterSpacing: '0.5px'
        }}
      >
        {percent.toFixed(0)}%
      </Typography>
    </Box>
  )
}

// ═══════════════════════════════════════════════════════════════
// HOOK DE COLUMNAS
// ═══════════════════════════════════════════════════════════════

export const useAgentColumns = ({ t, onViewMetrics, onSetTarget }) => [
  {
    field: 'name',
    headerName: t('table.name', 'Nombre'),
    minWidth: 240,
    renderCell: ({ row }) => (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Avatar
          sx={{
            width: 36,
            height: 36,
            bgcolor: row.role === 'superadmin' ? '#FF7043' : '#000',
            fontSize: '0.75rem',
            fontWeight: 700,
            fontFamily: '"Courier New", monospace'
          }}
        >
          {row.firstName?.charAt(0)}{row.lastName?.charAt(0)}
        </Avatar>
        <Box>
          <Typography
            sx={{
              fontFamily: '"Helvetica Neue", sans-serif',
              fontSize: '0.88rem',
              fontWeight: 500,
              color: '#000',
              lineHeight: 1.2
            }}
          >
            {row.firstName} {row.lastName}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.3 }}>
            <Email sx={{ fontSize: 11, color: '#aaa' }} />
            <Typography
              sx={{
                fontFamily: '"Courier New", monospace',
                fontSize: '0.65rem',
                color: '#888',
                letterSpacing: '0.5px'
              }}
            >
              {row.email}
            </Typography>
          </Box>
        </Box>
      </Box>
    )
  },
  {
    field: 'role',
    headerName: t('table.role', 'Rol'),
    minWidth: 130,
    renderCell: ({ row }) => (
      <Chip
        label={row.role === 'superadmin' ? t('metrics.role.superadmin') : t('metrics.role.admin')}
        size="small"
        sx={{
          bgcolor: row.role === 'superadmin' ? 'rgba(255,112,67,0.08)' : 'rgba(85,85,85,0.08)',
          color: row.role === 'superadmin' ? '#FF7043' : '#555',
          border: `1px solid ${row.role === 'superadmin' ? 'rgba(255,112,67,0.3)' : 'rgba(85,85,85,0.3)'}`,
          fontFamily: '"Courier New", monospace',
          fontSize: '0.7rem',
          letterSpacing: '0.5px',
          fontWeight: 600
        }}
      />
    )
  },
  {
    field: 'phoneNumber',
    headerName: t('table.phone', 'Teléfono'),
    minWidth: 140,
    renderCell: ({ row }) => (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        {row.phoneNumber ? (
          <>
            <Phone sx={{ fontSize: 13, color: '#888' }} />
            <Typography
              sx={{
                fontFamily: '"Courier New", monospace',
                fontSize: '0.75rem',
                color: '#444',
                letterSpacing: '0.5px'
              }}
            >
              {row.phoneNumber}
            </Typography>
          </>
        ) : (
          <Typography
            sx={{
              fontFamily: '"Courier New", monospace',
              fontSize: '0.7rem',
              color: '#ccc',
              letterSpacing: '0.5px'
            }}
          >
            —
          </Typography>
        )}
      </Box>
    )
  },
  {
    field: 'leads',
    headerName: t('table.leads', 'Leads'),
    minWidth: 110,
    align: 'center',
    renderCell: ({ row }) => (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography
          sx={{
            fontFamily: '"Helvetica Neue", sans-serif',
            fontSize: '1rem',
            fontWeight: 700,
            color: '#000'
          }}
        >
          {row.metrics?.leads?.total ?? '—'}
        </Typography>
        <Typography
          sx={{
            fontFamily: '"Courier New", monospace',
            fontSize: '0.6rem',
            color: '#888',
            letterSpacing: '0.5px'
          }}
        >
          {row.metrics?.leads?.converted ?? 0} {t('table.converted', 'convertidos')}
        </Typography>
      </Box>
    )
  },
  // ✅ NUEVA COLUMNA: Meta del mes (con traducción)
  {
    field: 'target',
    headerName: t('table.target', 'Meta del mes'),
    minWidth: 200,
    renderCell: ({ row }) => {
      const targets = row.targets?.targets || {}
      const progress = row.targets?.progress || {}
      const completion = row.targets?.completion || {}
      
      return (
        <Box display="flex" flexDirection="column" gap={1}>
          {/* Meta de conversiones (principal) */}
          <Box display="flex" alignItems="center" gap={1}>
            <Flag sx={{ fontSize: 14, color: '#ff9800' }} />
            <TargetProgressBar
              target={targets.conversions}
              progress={progress.conversions}
              completion={completion.conversions}
              t={t}
            />
          </Box>
          
          {/* Meta de leads (secundaria) */}
          {targets.leads > 0 && (
            <Box display="flex" alignItems="center" gap={1}>
              <Typography
                sx={{
                  fontFamily: '"Courier New", monospace',
                  fontSize: '0.6rem',
                  color: '#888',
                  width: 45,
                  letterSpacing: '0.5px'
                }}
              >
                {t('targets.metrics.leads', 'Leads')}:
              </Typography>
              <TargetProgressBar
                target={targets.leads}
                progress={progress.leads}
                completion={completion.leads}
                t={t}
              />
            </Box>
          )}
        </Box>
      )
    }
  },
  {
    field: 'activities',
    headerName: t('table.activities', 'Actividades'),
    minWidth: 110,
    align: 'center',
    renderCell: ({ row }) => (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography
          sx={{
            fontFamily: '"Helvetica Neue", sans-serif',
            fontSize: '1rem',
            fontWeight: 700,
            color: '#000'
          }}
        >
          {row.metrics?.activitiesCompletedThisMonth ?? '—'}
        </Typography>
        <Typography
          sx={{
            fontFamily: '"Courier New", monospace',
            fontSize: '0.6rem',
            color: '#888',
            letterSpacing: '0.5px'
          }}
        >
          {t('table.thisMonth', 'este mes')}
        </Typography>
      </Box>
    )
  },
  {
    field: 'clients',
    headerName: t('table.clients', 'Clientes'),
    minWidth: 110,
    align: 'center',
    renderCell: ({ row }) => (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography
          sx={{
            fontFamily: '"Helvetica Neue", sans-serif',
            fontSize: '1rem',
            fontWeight: 700,
            color: '#000'
          }}
        >
          {row.metrics?.clientsServed?.thisMonth ?? '—'}
        </Typography>
        <Typography
          sx={{
            fontFamily: '"Courier New", monospace',
            fontSize: '0.6rem',
            color: '#888',
            letterSpacing: '0.5px'
          }}
        >
          {t('table.ofTotal', { total: row.metrics?.clientsServed?.total ?? 0 })}
        </Typography>
      </Box>
    )
  },
  {
    field: 'actions',
    headerName: t('table.actions', 'Acciones'),
    minWidth: 120,
    align: 'center',
    renderCell: ({ row }) => (
      <Box display="flex" gap={0.5} justifyContent="center">
        <Tooltip title={t('table.setTarget', 'Fijar meta del mes')}>
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation()
              onSetTarget(row)
            }}
            sx={{
              color: '#ff9800',
              borderRadius: 0,
              '&:hover': {
                color: '#f57c00',
                bgcolor: '#fff3e0'
              }
            }}
          >
            <Flag sx={{ fontSize: 18 }} />
          </IconButton>
        </Tooltip>
        
        <Tooltip title={t('table.viewMetrics', 'Ver métricas detalladas')}>
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation()
              onViewMetrics(row)
            }}
            sx={{
              color: '#888',
              borderRadius: 0,
              '&:hover': {
                color: '#000',
                bgcolor: '#f5f5f5'
              }
            }}
          >
            <BarChart sx={{ fontSize: 18 }} />
          </IconButton>
        </Tooltip>
      </Box>
    )
  }
]

export default useAgentColumns