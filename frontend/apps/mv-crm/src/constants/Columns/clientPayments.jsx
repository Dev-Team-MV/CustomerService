// apps/mv-crm/src/constants/Columns/clientPayments.js
import { Box, Typography, Chip } from '@mui/material'
import { CheckCircle, PendingActions, Warning } from '@mui/icons-material'

// ═══════════════════════════════════════════════════════════════
// HELPER: Tipo de pago con traducción
// ═══════════════════════════════════════════════════════════════

const getPaymentTypeLabel = (type, t) => {
  const typeKeyMap = {
    'initial down payment': 'payments.typeInitialDownPayment',
    'complementary down payment': 'payments.typeComplementaryDownPayment',
    'monthly payment': 'payments.typeMonthlyPayment',
    'final payment': 'payments.typeFinalPayment'
  }
  
  const key = typeKeyMap[type?.toLowerCase()]
  return key ? t(key) : (type || t('payments.typeDefault', 'Pago'))
}

// ═══════════════════════════════════════════════════════════════
// HELPER: Formatear fecha
// ═══════════════════════════════════════════════════════════════

const formatDate = (dateString) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleDateString('es-ES', { 
    day: '2-digit', 
    month: 'short', 
    year: '2-digit' 
  })
}

// ═══════════════════════════════════════════════════════════════
// HOOK DE COLUMNAS
// ═══════════════════════════════════════════════════════════════

export const useClientPaymentColumns = ({ t }) => [
  {
    field: 'projectName',
    headerName: t('payments.project', 'Proyecto'),
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
    headerName: t('payments.unit', 'Unidad'),
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
    headerName: t('payments.type', 'Tipo'),
    minWidth: 160,
    renderCell: ({ row }) => (
      <Chip
        label={getPaymentTypeLabel(row.type, t)}
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
    headerName: t('payments.amount', 'Monto'),
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
    headerName: t('payments.date', 'Fecha'),
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
        {formatDate(row.date)}
      </Typography>
    )
  },
  {
    field: 'dueDate',
    headerName: t('payments.dueDate', 'Vencimiento'),
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
          {formatDate(row.dueDate)}
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
            ● {t('payments.overdue', 'Vencido')}
          </Typography>
        )}
      </Box>
    )
  },
  {
    field: 'status',
    headerName: t('payments.status', 'Estado'),
    minWidth: 110,
    renderCell: ({ row }) => {
      const config = {
        pending: {
          label: t('payments.statusPending', 'Pendiente'),
          color: '#1976d2',
          bgColor: '#e3f2fd',
          icon: <PendingActions sx={{ fontSize: 14 }} />
        },
        signed: {
          label: t('payments.statusSigned', 'Firmado'),
          color: '#2e7d32',
          bgColor: '#e8f5e9',
          icon: <CheckCircle sx={{ fontSize: 14 }} />
        },
        rejected: {
          label: t('payments.statusRejected', 'Rechazado'),
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
    headerName: t('payments.notes', 'Notas'),
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

export default useClientPaymentColumns