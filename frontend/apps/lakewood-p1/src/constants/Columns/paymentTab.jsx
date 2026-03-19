import { Box, Typography, Chip, Button } from '@mui/material'
import {
  CheckCircleOutline, Pending, Cancel,
  Receipt, Description
} from '@mui/icons-material'

// ── Helpers ────────────────────────────────────────────────
export const getStatusColor = (status) => {
  switch (status) {
    case 'signed':   return 'success'
    case 'pending':  return 'warning'
    case 'rejected': return 'error'
    default:         return 'default'
  }
}

export const getStatusIcon = (status) => {
  switch (status) {
    case 'signed':   return CheckCircleOutline
    case 'pending':  return Pending
    case 'rejected': return Cancel
    default:         return Receipt
  }
}

// ── Hook de columnas ───────────────────────────────────────
export const usePaymentTabColumns = ({ t }) => [
  {
    field: 'date',
    headerName: t('myProperty:date', 'Date'),
    minWidth: 120,
    renderCell: ({ row }) => (
      <Typography
        variant="body2"
        sx={{ fontWeight: 600, fontFamily: '"Poppins", sans-serif', color: '#333F1F' }}
      >
        {new Date(row.date).toLocaleDateString('en-US', {
          year: 'numeric', month: 'short', day: 'numeric'
        })}
      </Typography>
    )
  },
  {
    field: 'amount',
    headerName: t('myProperty:amount', 'Amount'),
    minWidth: 100,
    renderCell: ({ row }) => (
      <Typography
        variant="h6"
        sx={{
          color: '#8CA551', fontWeight: 700,
          fontFamily: '"Poppins", sans-serif', fontSize: '1.1rem'
        }}
      >
        ${row.amount.toLocaleString()}
      </Typography>
    )
  },
  {
    field: 'type',
    headerName: t('myProperty:type', 'Type'),
    minWidth: 120,
    renderCell: ({ row }) => (
      <Chip
        label={row.type || t('myProperty:modelNA', 'N/A')}
        size="small"
        sx={{
          bgcolor: 'rgba(140, 165, 81, 0.08)', color: '#333F1F',
          fontWeight: 600, textTransform: 'capitalize',
          fontSize: '0.75rem', fontFamily: '"Poppins", sans-serif',
          border: '1px solid rgba(140, 165, 81, 0.2)'
        }}
      />
    )
  },
  {
    field: 'status',
    headerName: t('myProperty:status', 'Status'),
    minWidth: 100,
    renderCell: ({ row }) => {
      const Icon = getStatusIcon(row.status)
      return (
        <Chip
          icon={<Icon />}
          label={t(
            `myProperty:status${row.status.charAt(0).toUpperCase() + row.status.slice(1)}`,
            row.status
          )}
          color={getStatusColor(row.status)}
          sx={{
            fontWeight: 700, fontFamily: '"Poppins", sans-serif', fontSize: '0.7rem'
          }}
        />
      )
    }
  },
  {
    field: 'urls',
    headerName: t('myProperty:support', 'Support'),
    minWidth: 120,
    renderCell: ({ row }) =>
      row.urls?.length > 0 ? (
        <Button
          size="small"
          variant="outlined"
          href={row.urls[0]}
          target="_blank"
          rel="noopener noreferrer"
          startIcon={<Description />}
          sx={{
            borderRadius: 2, textTransform: 'none',
            fontWeight: 600, fontFamily: '"Poppins", sans-serif',
            borderColor: '#e0e0e0', color: '#706f6f',
            '&:hover': { borderColor: '#333F1F', bgcolor: 'rgba(51, 63, 31, 0.05)' }
          }}
        >
          {t('myProperty:viewReceipt', 'View Receipt')}
        </Button>
      ) : (
        <Typography
          variant="caption"
          sx={{ color: '#999', fontFamily: '"Poppins", sans-serif' }}
        >
          {t('myProperty:noDocument', 'No document')}
        </Typography>
      )
  },
  {
    field: 'notes',
    headerName: t('myProperty:notes', 'Notes'),
    minWidth: 120,
    renderCell: ({ row }) => (
      <Typography
        variant="body2"
        sx={{ color: '#706f6f', fontFamily: '"Poppins", sans-serif', fontSize: '0.85rem' }}
      >
        {row.notes || t('myProperty:noNotes', 'No notes')}
      </Typography>
    )
  }
]