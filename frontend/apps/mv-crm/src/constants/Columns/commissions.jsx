// apps/mv-crm/src/constants/Columns/commissions.jsx
import { Box, Typography, Chip, IconButton, Tooltip } from '@mui/material'
import { Visibility, CheckCircle, Payment, ReportProblem } from '@mui/icons-material'

const getStatusConfig = (status, t) => {
  const configs = {
    pending: { label: t('status.pending', 'Pendiente'), color: '#ff9800', bg: '#fff3e0', icon: <ReportProblem sx={{ fontSize: 14 }} /> },
    approved: { label: t('status.approved', 'Aprobado'), color: '#2196f3', bg: '#e3f2fd', icon: <CheckCircle sx={{ fontSize: 14 }} /> },
    paid: { label: t('status.paid', 'Pagado'), color: '#4caf50', bg: '#e8f5e9', icon: <Payment sx={{ fontSize: 14 }} /> },
    disputed: { label: t('status.disputed', 'Disputado'), color: '#f44336', bg: '#ffebee', icon: <ReportProblem sx={{ fontSize: 14 }} /> }
  }
  return configs[status] || configs.pending
}

export const useCommissionColumns = ({ t, onView, onApprove, onDispute, onMarkPaid }) => [
  {
    field: 'date',
    headerName: t('table.date', 'Fecha'),
    minWidth: 120,
    renderCell: ({ row }) => (
      <Typography sx={{ fontFamily: '"Courier New", monospace', fontSize: '0.75rem', color: '#666' }}>
        {new Date(row.createdAt).toLocaleDateString()}
      </Typography>
    )
  },
  {
    field: 'agent',
    headerName: t('table.agent', 'Agente'),
    minWidth: 180,
    renderCell: ({ row }) => {
      // ✅ CORRECCIÓN: El backend devuelve agentId como un objeto populado
      const agent = row.agentId
      const agentName = agent && typeof agent === 'object' 
        ? `${agent.firstName || ''} ${agent.lastName || ''}`.trim() || agent.email 
        : row.agentName || (typeof agent === 'string' ? agent : 'N/A')
      
      return (
        <Typography sx={{ fontWeight: 600, fontSize: '0.85rem' }}>
          {agentName}
        </Typography>
      )
    }
  },
  {
    field: 'project',
    headerName: t('table.project', 'Proyecto'),
    minWidth: 150,
    renderCell: ({ row }) => {
      // ✅ CORRECCIÓN: El backend devuelve projectId como un objeto populado
      const project = row.projectId
      const projectName = project && typeof project === 'object'
        ? project.name || (project.title && (project.title.es || project.title.en))
        : row.projectName || (typeof project === 'string' ? project : 'N/A')

      return (
        <Typography sx={{ fontSize: '0.8rem', color: '#555' }}>
          {projectName}
        </Typography>
      )
    }
  },
  {
    field: 'amounts',
    headerName: t('table.amounts', 'Montos'),
    minWidth: 160,
    renderCell: ({ row }) => (
      <Box>
        <Typography sx={{ fontSize: '0.7rem', color: '#888' }}>Venta: ${row.saleAmount?.toLocaleString()}</Typography>
        <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: '#2e7d32' }}>
          Com: ${row.commissionAmount?.toLocaleString()}
        </Typography>
      </Box>
    )
  },
  {
    field: 'status',
    headerName: t('table.status', 'Estado'),
    minWidth: 120,
    renderCell: ({ row }) => {
      const config = getStatusConfig(row.status, t)
      return (
        <Chip
          icon={config.icon}
          label={config.label}
          size="small"
          sx={{ bgcolor: config.bg, color: config.color, fontWeight: 600, fontSize: '0.7rem', height: 24 }}
        />
      )
    }
  },
  {
    field: 'actions',
    headerName: t('table.actions', 'Acciones'),
    minWidth: 160,
    align: 'center',
    renderCell: ({ row }) => (
      <Box display="flex" gap={0.5} justifyContent="center">
        <Tooltip title={t('actions.view', 'Ver')}>
          <IconButton size="small" onClick={() => onView(row)}>
            <Visibility sx={{ fontSize: 18, color: '#1976d2' }} />
          </IconButton>
        </Tooltip>
        {row.status === 'pending' && (
          <>
            <Tooltip title={t('actions.approve', 'Aprobar')}>
              <IconButton size="small" onClick={() => onApprove(row)}>
                <CheckCircle sx={{ fontSize: 18, color: '#4caf50' }} />
              </IconButton>
            </Tooltip>
            <Tooltip title={t('actions.dispute', 'Disputar')}>
              <IconButton size="small" onClick={() => onDispute(row)}>
                <ReportProblem sx={{ fontSize: 18, color: '#f44336' }} />
              </IconButton>
            </Tooltip>
          </>
        )}
        {row.status === 'approved' && (
          <Tooltip title={t('actions.markPaid', 'Marcar Pagado')}>
            <IconButton size="small" onClick={() => onMarkPaid(row)}>
              <Payment sx={{ fontSize: 18, color: '#2196f3' }} />
            </IconButton>
          </Tooltip>
        )}
      </Box>
    )
  }
]

export default useCommissionColumns