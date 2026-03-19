import { Box, Typography, Avatar, Chip, IconButton, Tooltip } from '@mui/material'
import {
  CheckCircle, Cancel, Schedule, ErrorOutline,
  Edit, Download
} from '@mui/icons-material'

// ── Helpers ────────────────────────────────────────────────
export const getStatusColor = (status) => {
  switch (status) {
    case 'signed':   return { bg: 'rgba(140, 165, 81, 0.12)',  color: '#333F1F', border: 'rgba(140, 165, 81, 0.3)',  icon: CheckCircle  }
    case 'pending':  return { bg: 'rgba(229, 134, 60, 0.12)',  color: '#E5863C', border: 'rgba(229, 134, 60, 0.3)',  icon: Schedule     }
    case 'rejected': return { bg: 'rgba(211, 47, 47, 0.12)',   color: '#d32f2f', border: 'rgba(211, 47, 47, 0.3)',   icon: Cancel       }
    default:         return { bg: 'rgba(112, 111, 111, 0.12)', color: '#706f6f', border: 'rgba(112, 111, 111, 0.3)', icon: ErrorOutline }
  }
}

export const getFileUrl = (payload) => {
  if (!payload) return null
  if (payload.urls?.length > 0) {
    if (typeof payload.urls[0] === 'string')      return payload.urls[0]
    if (payload.urls[0]?.url)                     return payload.urls[0].url
  }
  if (typeof payload.urls === 'string') return payload.urls
  return payload.fileUrl ?? payload.documentUrl ?? payload.attachment ?? null
}

// ── Hook de columnas ───────────────────────────────────────
export const usePayloadColumns = ({
  t,
  onEdit,
  onApprove,
  onReject,
  onDownload,
}) => [
  {
    field: 'property',
    headerName: t('payloads:property'),
    minWidth: 150,
    renderCell: ({ row }) => (
      <Box>
        <Typography variant="body2" sx={{ fontWeight: 600, color: '#1a1a1a', fontFamily: '"Poppins", sans-serif' }}>
          Unit {row.property?.lot?.number || 'N/A'}
        </Typography>
        <Typography variant="caption" sx={{ color: '#706f6f', fontFamily: '"Poppins", sans-serif', fontSize: '0.7rem' }}>
          ID: #{row.property?.model?.modelNumber || 'N/A'}
        </Typography>
      </Box>
    )
  },
  {
    field: 'payer',
    headerName: t('payloads:payer'),
    minWidth: 180,
    renderCell: ({ row }) => (
      <Box display="flex" alignItems="center" gap={1}>
        <Avatar
          sx={{
            width: 48, height: 48,
            bgcolor: 'transparent',
            background: 'linear-gradient(135deg, #333F1F 0%, #8CA551 100%)',
            color: 'white', fontWeight: 700, fontSize: '1rem',
            fontFamily: '"Poppins", sans-serif',
            border: '2px solid rgba(255, 255, 255, 0.9)',
            boxShadow: '0 4px 12px rgba(51, 63, 31, 0.2)'
          }}
        >
          {row.property?.users?.[0]?.firstName?.charAt(0) || 'U'}
        </Avatar>
        <Typography variant="body2" sx={{ fontWeight: 500, color: '#1a1a1a', fontFamily: '"Poppins", sans-serif' }}>
          {row.property?.users?.[0]?.firstName} {row.property?.users?.[0]?.lastName}
        </Typography>
      </Box>
    )
  },
  {
    field: 'date',
    headerName: t('payloads:date'),
    minWidth: 120,
    renderCell: ({ value }) => (
      <Typography variant="body2" sx={{ color: '#706f6f', fontFamily: '"Poppins", sans-serif' }}>
        {new Date(value).toLocaleDateString()}
      </Typography>
    )
  },
  {
    field: 'amount',
    headerName: t('payloads:amount'),
    minWidth: 120,
    renderCell: ({ value }) => (
      <Typography variant="body2" sx={{ fontWeight: 700, color: '#333F1F', fontFamily: '"Poppins", sans-serif' }}>
        ${value?.toLocaleString()}
      </Typography>
    )
  },
  {
    field: 'type',
    headerName: t('payloads:type'),
    minWidth: 140,
    renderCell: ({ value }) => (
      <Chip
        label={value || t('payloads:noFile')}
        size="small"
        sx={{
          fontWeight: 600, fontFamily: '"Poppins", sans-serif',
          height: 28, px: 1.5, fontSize: '0.75rem',
          letterSpacing: '0.5px', borderRadius: 2, textTransform: 'capitalize',
          bgcolor: 'rgba(33, 150, 243, 0.12)', color: '#1976d2',
          border: '1px solid rgba(33, 150, 243, 0.3)'
        }}
      />
    )
  },
  {
    field: 'status',
    headerName: t('payloads:status'),
    minWidth: 120,
    renderCell: ({ row }) => {
      const s = getStatusColor(row.status)
      const Icon = s.icon
      return (
        <Chip
          label={row.status}
          icon={<Icon />}
          size="small"
          sx={{
            fontWeight: 600, fontFamily: '"Poppins", sans-serif',
            height: 28, px: 1.5, fontSize: '0.75rem',
            letterSpacing: '0.5px', borderRadius: 2, textTransform: 'capitalize',
            bgcolor: s.bg, color: s.color, border: `1px solid ${s.border}`,
            '& .MuiChip-icon': { color: s.color }
          }}
        />
      )
    }
  },
  {
    field: 'docs',
    headerName: t('payloads:docs'),
    align: 'center',
    width: 80,
    renderCell: ({ row }) => {
      const hasFile = !!getFileUrl(row)
      return (
        <Tooltip title={hasFile ? 'Download file' : 'No file attached'}>
          <span>
            <IconButton
              size="small"
              onClick={(e) => { e.stopPropagation(); onDownload(row) }}
              disabled={!hasFile}
              sx={{
                bgcolor: 'rgba(140, 165, 81, 0.08)',
                border: '1px solid rgba(140, 165, 81, 0.2)',
                borderRadius: 2, transition: 'all 0.3s ease',
                '&:hover': { bgcolor: '#8CA551', borderColor: '#8CA551', transform: 'scale(1.1)', '& .MuiSvgIcon-root': { color: 'white' } },
                '&:disabled': { opacity: 0.3, bgcolor: 'rgba(112, 111, 111, 0.08)' }
              }}
            >
              <Download sx={{ fontSize: 18, color: '#8CA551' }} />
            </IconButton>
          </span>
        </Tooltip>
      )
    }
  },
  {
    field: 'actions',
    headerName: t('payloads:actions'),
    align: 'center',
    minWidth: 160,
    renderCell: ({ row }) => (
      <Box sx={{ display: 'flex', gap: 0.5 }}>

        {/* Edit */}
        <Tooltip title={t('payloads:edit')} placement="top">
          <IconButton
            size="small"
            onClick={(e) => { e.stopPropagation(); onEdit(row) }}
            sx={{
              bgcolor: 'rgba(140, 165, 81, 0.08)', border: '1px solid rgba(140, 165, 81, 0.2)',
              borderRadius: 2, transition: 'all 0.3s ease',
              '&:hover': { bgcolor: '#8CA551', borderColor: '#8CA551', transform: 'scale(1.1)', '& .MuiSvgIcon-root': { color: 'white' } }
            }}
          >
            <Edit sx={{ fontSize: 18, color: '#8CA551' }} />
          </IconButton>
        </Tooltip>

        {/* Approve */}
        <Tooltip title={t('payloads:approve')} placement="top">
          <span>
            <IconButton
              size="small"
              onClick={(e) => onApprove(row, e)}
              disabled={row.status === 'signed'}
              sx={{
                bgcolor: 'rgba(76, 175, 80, 0.08)', border: '1px solid rgba(76, 175, 80, 0.2)',
                borderRadius: 2, transition: 'all 0.3s ease',
                '&:hover': { bgcolor: '#4caf50', borderColor: '#4caf50', transform: 'scale(1.1)', '& .MuiSvgIcon-root': { color: 'white' } },
                '&:disabled': { opacity: 0.3, bgcolor: 'rgba(112, 111, 111, 0.08)' }
              }}
            >
              <CheckCircle sx={{ fontSize: 18, color: '#4caf50' }} />
            </IconButton>
          </span>
        </Tooltip>

        {/* Reject */}
        <Tooltip title={t('payloads:reject')} placement="top">
          <span>
            <IconButton
              size="small"
              onClick={(e) => onReject(row, e)}
              disabled={row.status === 'rejected'}
              sx={{
                bgcolor: 'rgba(211, 47, 47, 0.08)', border: '1px solid rgba(211, 47, 47, 0.2)',
                borderRadius: 2, transition: 'all 0.3s ease',
                '&:hover': { bgcolor: '#d32f2f', borderColor: '#d32f2f', transform: 'scale(1.1)', '& .MuiSvgIcon-root': { color: 'white' } },
                '&:disabled': { opacity: 0.3, bgcolor: 'rgba(112, 111, 111, 0.08)' }
              }}
            >
              <Cancel sx={{ fontSize: 18, color: '#d32f2f' }} />
            </IconButton>
          </span>
        </Tooltip>

      </Box>
    )
  }
]