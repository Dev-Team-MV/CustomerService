// apps/mv-crm/src/constants/Columns/clientPayments.js
import { Box, Typography, Chip } from '@mui/material'
import { CheckCircle, PendingActions, Warning } from '@mui/icons-material'

const getPaymentTypeLabel = (type) => {
  const labels = {
    'initial down payment': 'Cuota inicial',
    'complementary down payment': 'Cuota complementaria',
    'monthly payment': 'Cuota mensual',
    'final payment': 'Cuota final'
  }
  return labels[type] || type || 'Pago'
}

export const useClientPaymentColumns = ({ t }) => [
  {
    field: 'projectName',
    headerName: t('clients.payments.project', 'Proyecto'),
    minWidth: 140,
    renderCell: ({ row }) => (
      <Typography
        sx={{
          fontFamily: '"Courier New", monospace',
          fontSize: '0.75rem',
          color: '#444',
          letterSpacing: '0.5px'
        }}
      >
        {row.projectName || '-'}
      </Typography>
    )
  },
  {
    field: 'unitLabel',
    headerName: t('clients.payments.unit', 'Unidad'),
    minWidth: 100,
    renderCell: ({ row }) => (
      <Typography
        sx={{
          fontFamily: '"Courier New", monospace',
          fontSize: '0.75rem',
          color: '#666',
          letterSpacing: '0.5px'
        }}
      >
        {row.unitLabel || '-'}
      </Typography>
    )
  },
  {
    field: 'type',
    headerName: t('clients.payments.type', 'Tipo'),
    minWidth: 140,
    renderCell: ({ row }) => (
      <Chip
        label={getPaymentTypeLabel(row.type)}
        size="small"
        sx={{
          bgcolor: '#f5f5f5',
          color: '#666',
          fontFamily: '"Courier New", monospace',
          fontSize: '0.65rem',
          letterSpacing: '0.5px',
          height: 22
        }}
      />
    )
  },
  {
    field: 'amount',
    headerName: t('clients.payments.amount', 'Monto'),
    minWidth: 110,
    align: 'right',
    renderCell: ({ row }) => (
      <Typography
        sx={{
          fontFamily: '"Helvetica Neue", sans-serif',
          fontSize: '0.9rem',
          fontWeight: 700,
          color: row.isOverdue ? '#d32f2f' : '#000',
          letterSpacing: '-0.02em'
        }}
      >
        ${row.amount?.toLocaleString() || 0}
      </Typography>
    )
  },
  {
    field: 'date',
    headerName: t('clients.payments.date', 'Fecha'),
    minWidth: 100,
    renderCell: ({ row }) => (
      <Typography
        sx={{
          fontFamily: '"Courier New", monospace',
          fontSize: '0.75rem',
          color: '#444',
          letterSpacing: '0.5px'
        }}
      >
        {row.date ? new Date(row.date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: '2-digit' }) : '-'}
      </Typography>
    )
  },
  {
    field: 'dueDate',
    headerName: t('clients.payments.dueDate', 'Vencimiento'),
    minWidth: 130,
    renderCell: ({ row }) => (
      <Box>
        <Typography
          sx={{
            fontFamily: '"Courier New", monospace',
            fontSize: '0.75rem',
            color: row.isOverdue ? '#d32f2f' : '#444',
            fontWeight: row.isOverdue ? 600 : 400,
            letterSpacing: '0.5px'
          }}
        >
          {row.dueDate ? new Date(row.dueDate).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: '2-digit' }) : '-'}
        </Typography>
        {row.isOverdue && (
          <Typography
            sx={{
              fontFamily: '"Courier New", monospace',
              fontSize: '0.6rem',
              color: '#d32f2f',
              letterSpacing: '1px',
              textTransform: 'uppercase',
              mt: 0.3
            }}
          >
            ● Vencido
          </Typography>
        )}
      </Box>
    )
  },
  {
    field: 'status',
    headerName: t('clients.payments.status', 'Estado'),
    minWidth: 110,
    renderCell: ({ row }) => {
      const config = {
        pending: {
          label: t('clients.payments.statusPending', 'Pendiente'),
          color: '#1976d2',
          bgColor: '#e3f2fd',
          icon: <PendingActions sx={{ fontSize: 14 }} />
        },
        signed: {
          label: t('clients.payments.statusSigned', 'Firmado'),
          color: '#2e7d32',
          bgColor: '#e8f5e9',
          icon: <CheckCircle sx={{ fontSize: 14 }} />
        },
        rejected: {
          label: t('clients.payments.statusRejected', 'Rechazado'),
          color: '#d32f2f',
          bgColor: '#ffebee',
          icon: <Warning sx={{ fontSize: 14 }} />
        }
      }
      const { label, color, bgColor, icon } = config[row.status] || config.pending

      return (
        <Chip
          icon={icon}
          label={label}
          size="small"
          sx={{
            bgcolor: bgColor,
            color: color,
            fontWeight: 600,
            fontSize: '0.7rem',
            fontFamily: '"Courier New", monospace',
            letterSpacing: '0.5px',
            height: 24,
            '& .MuiChip-icon': { color }
          }}
        />
      )
    }
  },
  {
    field: 'notes',
    headerName: t('clients.payments.notes', 'Notas'),
    minWidth: 150,
    renderCell: ({ row }) => (
      <Typography
        sx={{
          fontFamily: '"Courier New", monospace',
          fontSize: '0.7rem',
          color: '#888',
          letterSpacing: '0.5px',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          maxWidth: 200
        }}
        title={row.notes}
      >
        {row.notes || '-'}
      </Typography>
    )
  }
]