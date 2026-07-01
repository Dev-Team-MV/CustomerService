// apps/mv-crm/src/constants/Columns/payments.js
import { Box, Typography, Chip, IconButton, Tooltip, Avatar } from '@mui/material'
import { Sms, CheckCircle, Warning, PendingActions, Phone } from '@mui/icons-material'

export const usePaymentColumns = ({ t, onSendSms }) => [
  {
    field: 'clientName',
    headerName: t('payments.table.client'),
    minWidth: 220,
    renderCell: ({ row }) => (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Avatar
          sx={{
            width: 34,
            height: 34,
            bgcolor: row.isOverdue ? '#f44336' : '#000',
            borderRadius: 0,
            fontSize: '0.65rem',
            fontWeight: 700,
            fontFamily: '"Courier New", monospace',
            flexShrink: 0,
            color: '#fff'
          }}
        >
          {row.clientName?.substring(0, 2).toUpperCase() || '?'}
        </Avatar>
        <Box sx={{ minWidth: 0 }}>
          <Typography
            sx={{
              fontFamily: '"Helvetica Neue", sans-serif',
              fontSize: '0.88rem',
              fontWeight: 500,
              color: row.isOverdue ? '#d32f2f' : '#000',
              letterSpacing: '-0.01em',
              lineHeight: 1.2,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}
          >
            {row.clientName || t('payments.table.noClient')}
          </Typography>
          {row.clientPhone && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.3 }}>
              <Phone sx={{ fontSize: 11, color: '#aaa' }} />
              <Typography
                sx={{
                  fontFamily: '"Courier New", monospace',
                  fontSize: '0.65rem',
                  color: '#888',
                  letterSpacing: '0.5px'
                }}
              >
                {row.clientPhone}
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
    )
  },
  {
    field: 'projectName',
    headerName: t('payments.table.project'),
    minWidth: 160,
    renderCell: ({ row }) => (
      <Typography
        sx={{
          fontFamily: '"Courier New", monospace',
          fontSize: '0.78rem',
          color: '#444',
          letterSpacing: '0.5px'
        }}
      >
        {row.projectName || t('payments.table.noProject')}
      </Typography>
    )
  },
  {
    field: 'unitLabel',
    headerName: t('payments.table.unit'),
    minWidth: 110,
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
    field: 'amount',
    headerName: t('payments.table.amount'),
    minWidth: 120,
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
    field: 'dueDate',
    headerName: t('payments.table.dueDate'),
    minWidth: 140,
    renderCell: ({ row }) => {
      const dueDate = row.dueDate ? new Date(row.dueDate) : null
      const formatted = dueDate
        ? dueDate.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })
        : '-'

      return (
        <Box>
          <Typography
            sx={{
              fontFamily: '"Courier New", monospace',
              fontSize: '0.78rem',
              color: row.isOverdue ? '#d32f2f' : '#444',
              fontWeight: row.isOverdue ? 600 : 400,
              letterSpacing: '0.5px'
            }}
          >
            {formatted}
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
              ● {t('payments.table.overdue')}
            </Typography>
          )}
        </Box>
      )
    }
  },
  {
    field: 'status',
    headerName: t('payments.table.status'),
    minWidth: 120,
    renderCell: ({ row }) => {
      const config = {
        pending: {
          label: t('payments.status.pending'),
          color: '#1976d2',
          bgColor: '#e3f2fd',
          icon: <PendingActions sx={{ fontSize: 14 }} />
        },
        signed: {
          label: t('payments.status.signed'),
          color: '#2e7d32',
          bgColor: '#e8f5e9',
          icon: <CheckCircle sx={{ fontSize: 14 }} />
        },
        overdue: {
          label: t('payments.status.overdue'),
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
    field: 'actions',
    headerName: t('payments.table.action'),
    minWidth: 80,
    align: 'center',
    renderCell: ({ row }) => (
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
        {row.status === 'pending' && row.clientPhone ? (
          <Tooltip title={t('payments.table.sendSms')}>
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation()
                onSendSms(row)
              }}
              sx={{
                color: '#aaa',
                borderRadius: 0,
                '&:hover': {
                  color: '#1976d2',
                  background: '#e3f2fd'
                }
              }}
            >
              <Sms sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>
        ) : (
          <Typography
            sx={{
              fontFamily: '"Courier New", monospace',
              fontSize: '0.65rem',
              color: '#ccc',
              letterSpacing: '0.5px'
            }}
          >
            —
          </Typography>
        )}
      </Box>
    )
  }
]