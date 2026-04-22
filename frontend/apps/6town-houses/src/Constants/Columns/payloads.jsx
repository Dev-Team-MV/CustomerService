// @/Users/oficina/MV-CRM/CustomerService/frontend/apps/6town-houses/src/Constants/Columns/payloads.jsx

import { Box, Typography, Avatar, Chip, IconButton, Tooltip } from '@mui/material'
import {
  CheckCircle, Cancel, Schedule, ErrorOutline,
  Edit, Download
} from '@mui/icons-material'
import { useTheme } from '@mui/material/styles'

// Helpers
export const getStatusColor = (status, theme) => {
  switch (status) {
    case 'signed':
      return {
        bg: theme.palette.success.main + '22',
        color: theme.palette.success.main,
        border: theme.palette.success.main + '55',
        icon: CheckCircle
      }
    case 'pending':
      return {
        bg: theme.palette.warning.main + '22',
        color: theme.palette.warning.main,
        border: theme.palette.warning.main + '55',
        icon: Schedule
      }
    case 'rejected':
      return {
        bg: theme.palette.error.main + '22',
        color: theme.palette.error.main,
        border: theme.palette.error.main + '55',
        icon: Cancel
      }
    default:
      return {
        bg: theme.palette.cardBg || '#f5f7fa',
        color: theme.palette.text.secondary,
        border: theme.palette.cardBorder || '#e0e0e0',
        icon: ErrorOutline
      }
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

// Columnas para properties (6town-houses)
export const usePayloadColumns = ({
  t,
  onEdit,
  onApprove,
  onReject,
  onDownload,
  resourceType = 'apartment' // 'apartment' o 'property'
}) => {
  const theme = useTheme()
  return [
    {
      field: resourceType === 'property' ? 'property' : 'apartment',
      headerName: resourceType === 'property' ? t('payloads:property') : t('payloads:apartment'),
      minWidth: 150,
      renderCell: ({ row }) => {
        if (resourceType === 'property') {
          return (
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600, color: theme.palette.text.primary, fontFamily: '"Poppins", sans-serif' }}>
                {row.property?.lot?.number || 'N/A'}
              </Typography>
              <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontFamily: '"Poppins", sans-serif', fontSize: '0.7rem' }}>
                {row.property?.model?.model || 'N/A'}
              </Typography>
            </Box>
          )
        }
        return (
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 600, color: theme.palette.text.primary, fontFamily: '"Poppins", sans-serif' }}>
              Apt {row.apartment?.apartmentNumber || 'N/A'}
            </Typography>
            <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontFamily: '"Poppins", sans-serif', fontSize: '0.7rem' }}>
              ID: #{row.apartment?.building?.name || 'N/A'}
            </Typography>
          </Box>
        )
      }
    },
    {
      field: 'payer',
      headerName: t('payloads:payer'),
      minWidth: 180,
      renderCell: ({ row }) => {
        const resource = resourceType === 'property' ? row.property : row.apartment
        const user = resource?.users?.[0]
        return (
          <Box display="flex" alignItems="center" gap={1}>
            <Avatar
              sx={{
                width: 48, height: 48,
                bgcolor: 'transparent',
                background: theme.palette.gradient,
                color: 'white', fontWeight: 700, fontSize: '1rem',
                fontFamily: '"Poppins", sans-serif',
                border: '2px solid rgba(255, 255, 255, 0.9)',
                boxShadow: theme.palette.avatarShadow
              }}
            >
              {user?.firstName?.charAt(0) || 'U'}
            </Avatar>
            <Typography variant="body2" sx={{ fontWeight: 500, color: theme.palette.text.primary, fontFamily: '"Poppins", sans-serif' }}>
              {user?.firstName} {user?.lastName}
            </Typography>
          </Box>
        )
      }
    },
    {
      field: 'date',
      headerName: t('payloads:date'),
      minWidth: 120,
      renderCell: ({ value }) => (
        <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontFamily: '"Poppins", sans-serif' }}>
          {new Date(value).toLocaleDateString()}
        </Typography>
      )
    },
    {
      field: 'amount',
      headerName: t('payloads:amount'),
      minWidth: 120,
      renderCell: ({ value }) => (
        <Typography variant="body2" sx={{ fontWeight: 700, color: theme.palette.primary.main, fontFamily: '"Poppins", sans-serif' }}>
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
            bgcolor: theme.palette.info.main + '22',
            color: theme.palette.info.main,
            border: `1px solid ${theme.palette.info.main}55`
          }}
        />
      )
    },
    {
      field: 'status',
      headerName: t('payloads:status'),
      minWidth: 120,
      renderCell: ({ row }) => {
        const s = getStatusColor(row.status, theme)
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
                  bgcolor: theme.palette.secondary.main + '11',
                  border: `1px solid ${theme.palette.secondary.main}33`,
                  borderRadius: 2, transition: 'all 0.3s ease',
                  '&:hover': {
                    bgcolor: theme.palette.secondary.main,
                    borderColor: theme.palette.secondary.main,
                    transform: 'scale(1.1)',
                    '& .MuiSvgIcon-root': { color: 'white' }
                  },
                  '&:disabled': { opacity: 0.3, bgcolor: theme.palette.cardBg }
                }}
              >
                <Download sx={{ fontSize: 18, color: theme.palette.secondary.main }} />
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
                bgcolor: theme.palette.secondary.main + '11',
                border: `1px solid ${theme.palette.secondary.main}33`,
                borderRadius: 2, transition: 'all 0.3s ease',
                '&:hover': {
                  bgcolor: theme.palette.secondary.main,
                  borderColor: theme.palette.secondary.main,
                  transform: 'scale(1.1)',
                  '& .MuiSvgIcon-root': { color: 'white' }
                }
              }}
            >
              <Edit sx={{ fontSize: 18, color: theme.palette.secondary.main }} />
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
                  bgcolor: theme.palette.success.main + '11',
                  border: `1px solid ${theme.palette.success.main}33`,
                  borderRadius: 2, transition: 'all 0.3s ease',
                  '&:hover': {
                    bgcolor: theme.palette.success.main,
                    borderColor: theme.palette.success.main,
                    transform: 'scale(1.1)',
                    '& .MuiSvgIcon-root': { color: 'white' }
                  },
                  '&:disabled': { opacity: 0.3, bgcolor: theme.palette.cardBg }
                }}
              >
                <CheckCircle sx={{ fontSize: 18, color: theme.palette.success.main }} />
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
                  bgcolor: theme.palette.error.main + '11',
                  border: `1px solid ${theme.palette.error.main}33`,
                  borderRadius: 2, transition: 'all 0.3s ease',
                  '&:hover': {
                    bgcolor: theme.palette.error.main,
                    borderColor: theme.palette.error.main,
                    transform: 'scale(1.1)',
                    '& .MuiSvgIcon-root': { color: 'white' }
                  },
                  '&:disabled': { opacity: 0.3, bgcolor: theme.palette.cardBg }
                }}
              >
                <Cancel sx={{ fontSize: 18, color: theme.palette.error.main }} />
              </IconButton>
            </span>
          </Tooltip>
        </Box>
      )
    }
  ]
}