import {
  Box,
  Typography,
  Avatar,
  IconButton,
  Chip,
  Tooltip
} from '@mui/material'
import {
  Edit,
  Delete,
  CheckCircle,
  Schedule,
  Cancel,
  AttachMoney
} from '@mui/icons-material'

export const useLotsColumns = (t, handleOpenDialog, handleDelete, isOwner) => {
  return [
    {
      field: 'number',
      headerName: t('lots:table.lotNumber'),
      minWidth: 150,
      renderCell: ({ row }) => (
        <Box display="flex" alignItems="center" gap={1.5}>
          <Avatar
            sx={{
              width: 48,
              height: 48,
              bgcolor: 'transparent',
              background: 'linear-gradient(135deg, #333F1F 0%, #8CA551 100%)',
              color: 'white',
              fontWeight: 700,
              fontSize: '1rem',
              fontFamily: '"DM Sans", sans-serif',
              border: '2px solid rgba(255, 255, 255, 0.9)',
              boxShadow: '0 4px 12px rgba(51, 63, 31, 0.2)'
            }}
          >
            {row.number}
          </Avatar>
          <Box>
            <Typography
              variant="body2"
              sx={{
                fontWeight: 600,
                color: '#1a1a1a',
                fontFamily: '"DM Sans", sans-serif',
                fontSize: '0.95rem'
              }}
            >
              {t('lots:table.lot')} {row.number}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: '#706f6f',
                fontFamily: '"DM Sans", sans-serif',
                fontSize: '0.7rem'
              }}
            >
              ID: {row._id?.slice(-6)}
            </Typography>
          </Box>
        </Box>
      )
    },
    {
      field: 'price',
      headerName: t('lots:table.price'),
      renderCell: ({ value }) => (
        <Box display="flex" alignItems="center" gap={0.5}>
          <AttachMoney sx={{ fontSize: 18, color: '#8CA551' }} />
          <Typography
            variant="body2"
            sx={{
              fontWeight: 700,
              color: '#333F1F',
              fontFamily: '"DM Sans", sans-serif',
              fontSize: '1rem'
            }}
          >
            {value?.toLocaleString()}
          </Typography>
        </Box>
      )
    },
    {
      field: 'model',
      headerName: t('lots:table.model') || 'Model',
      minWidth: 200,
      renderCell: ({ row }) => {
        if (!row.model) {
          return (
            <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
              No model assigned
            </Typography>
          )
        }
        const modelData = typeof row.model === 'object' ? row.model : null
        return (
          <Box display="flex" alignItems="center" gap={1}>
            <Avatar
              sx={{
                width: 36,
                height: 36,
                bgcolor: '#333F1F',
                color: 'white',
                fontWeight: 700,
                fontSize: '0.75rem',
                fontFamily: '"DM Sans", sans-serif'
              }}
            >
              {modelData?.modelNumber || 'M'}
            </Avatar>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600, fontFamily: '"DM Sans", sans-serif', fontSize: '0.85rem' }}>
                {modelData?.model || 'Model'}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.7rem' }}>
                {modelData?.modelNumber || ''}
              </Typography>
            </Box>
          </Box>
        )
      }
    },
    {
      field: 'status',
      headerName: t('lots:table.status'),
      renderCell: ({ value }) => {
        const config = {
          available: { icon: CheckCircle, color: '#8CA551', bg: 'rgba(140, 165, 81, 0.12)', label: t('lots:status.available') },
          pending: { icon: Schedule, color: '#E5863C', bg: 'rgba(229, 134, 60, 0.12)', label: t('lots:status.pending') },
          sold: { icon: Cancel, color: '#706f6f', bg: 'rgba(112, 111, 111, 0.12)', label: t('lots:status.sold') }
        }[value] || { icon: CheckCircle, color: '#8CA551', bg: 'rgba(140, 165, 81, 0.12)', label: value }
        return (
          <Chip
            label={config.label}
            icon={<config.icon />}
            size="small"
            sx={{
              fontWeight: 600,
              fontFamily: '"DM Sans", sans-serif',
              height: 28,
              px: 1.5,
              fontSize: '0.75rem',
              letterSpacing: '0.5px',
              borderRadius: 2,
              textTransform: 'capitalize',
              bgcolor: config.bg,
              color: config.color,
              border: `1px solid ${config.color}40`,
              '& .MuiChip-icon': { color: config.color }
            }}
          />
        )
      }
    },
    {
      field: 'assignedUser',
      headerName: t('lots:table.assignedTo'),
      minWidth: 200,
      renderCell: ({ row }) => {
        if (!row.assignedUser) {
          return (
            <Typography variant="caption" color="text.secondary">
              {t('lots:table.unassigned')}
            </Typography>
          )
        }
        return (
          <Box display="flex" alignItems="center" gap={1}>
            <Avatar
              sx={{
                width: 40,
                height: 40,
                bgcolor: 'transparent',
                background: 'linear-gradient(135deg, #333F1F 0%, #8CA551 100%)',
                color: 'white',
                fontWeight: 700,
                fontSize: '0.875rem',
                fontFamily: '"DM Sans", sans-serif',
                border: '2px solid rgba(255, 255, 255, 0.9)',
                boxShadow: '0 2px 8px rgba(51, 63, 31, 0.15)'
              }}
            >
              {row.assignedUser.firstName?.charAt(0)}{row.assignedUser.lastName?.charAt(0)}
            </Avatar>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600, fontFamily: '"DM Sans", sans-serif' }}>
                {row.assignedUser.firstName} {row.assignedUser.lastName}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontFamily: '"DM Sans", sans-serif' }}>
                {row.assignedUser.email}
              </Typography>
            </Box>
          </Box>
        )
      }
    },
    {
      field: 'actions',
      headerName: t('lots:table.actions'),
      align: 'center',
      renderCell: ({ row }) => (
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <Tooltip title={t('lots:actions.edit')} placement="top">
            <span>
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation()
                  handleOpenDialog(row)
                }}
                disabled={isOwner}
                sx={{
                  bgcolor: 'rgba(140, 165, 81, 0.08)',
                  border: '1px solid rgba(140, 165, 81, 0.2)',
                  borderRadius: 2,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    bgcolor: '#8CA551',
                    borderColor: '#8CA551',
                    transform: 'scale(1.1)',
                    '& .MuiSvgIcon-root': { color: 'white' }
                  },
                  '&:disabled': { opacity: 0.5 }
                }}
              >
                <Edit sx={{ fontSize: 18, color: '#8CA551' }} />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title={t('lots:actions.delete')} placement="top">
            <span>
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation()
                  handleDelete(row._id)
                }}
                disabled={isOwner}
                sx={{
                  bgcolor: 'rgba(229, 134, 60, 0.08)',
                  border: '1px solid rgba(229, 134, 60, 0.2)',
                  borderRadius: 2,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    bgcolor: '#E5863C',
                    borderColor: '#E5863C',
                    transform: 'scale(1.1)',
                    '& .MuiSvgIcon-root': { color: 'white' }
                  },
                  '&:disabled': { opacity: 0.5 }
                }}
              >
                <Delete sx={{ fontSize: 18, color: '#E5863C' }} />
              </IconButton>
            </span>
          </Tooltip>
        </Box>
      )
    }
  ]
}