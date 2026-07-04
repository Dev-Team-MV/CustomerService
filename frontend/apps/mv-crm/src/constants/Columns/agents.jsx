// apps/mv-crm/src/constants/Columns/js
import { Box, Typography, Chip, Avatar, IconButton, Tooltip } from '@mui/material'
import { BarChart, Email, Phone } from '@mui/icons-material'

export const useAgentColumns = ({ t, onViewMetrics }) => [
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
        label={row.role === 'superadmin' ? 'Super Admin' : 'Admin'}
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
          {row.metrics?.leads?.converted ?? 0} convertidos
        </Typography>
      </Box>
    )
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
          este mes
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
          de {row.metrics?.clientsServed?.total ?? 0} total
        </Typography>
      </Box>
    )
  },
  {
    field: 'actions',
    headerName: t('table.actions', 'Acciones'),
    minWidth: 80,
    align: 'center',
    renderCell: ({ row }) => (
      <Tooltip title="Ver métricas detalladas">
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
    )
  }
]