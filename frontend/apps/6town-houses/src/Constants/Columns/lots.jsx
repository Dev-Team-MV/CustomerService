import { Box, Chip, IconButton, Tooltip, Avatar } from '@mui/material'
import { Edit, Delete, AttachMoney, CheckCircle, Schedule, Cancel } from '@mui/icons-material'

export const getLotColumns = ({ onEdit, onDelete, theme, t }) => [
  {
    field: 'number',
    headerName: t('lots:table.lotNumber'),
    flex: 1.2,
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
            fontFamily: '"Poppins", sans-serif',
            border: '2px solid rgba(255, 255, 255, 0.9)',
            boxShadow: '0 4px 12px rgba(51, 63, 31, 0.2)'
          }}
        >
          {row.number}
        </Avatar>
        <Box>
          <Box
            sx={{
              fontWeight: 600,
              color: '#1a1a1a',
              fontFamily: '"Poppins", sans-serif',
              fontSize: '0.95rem'
            }}
          >
            {t('lots:table.lot')} {row.number}
          </Box>
          <Box
            sx={{
              color: '#706f6f',
              fontFamily: '"Poppins", sans-serif',
              fontSize: '0.7rem'
            }}
          >
            ID: {row._id?.slice(-6)}
          </Box>
        </Box>
      </Box>
    )
  },
  {
    field: 'price',
    headerName: t('lots:table.price'),
    flex: 0.9,
    minWidth: 120,
    renderCell: ({ value }) => (
      <Box display="flex" alignItems="center" gap={0.5}>
        <AttachMoney sx={{ fontSize: 18, color: '#8CA551' }} />
        <Box
          sx={{
            fontWeight: 700,
            color: '#333F1F',
            fontFamily: '"Poppins", sans-serif',
            fontSize: '1rem'
          }}
        >
          {value?.toLocaleString()}
        </Box>
      </Box>
    )
  },
  {
    field: 'model',
    headerName: t('lots:table.model'),
    flex: 1,
    minWidth: 140,
    renderCell: ({ row }) => {
      if (!row.model) {
        return (
          <Box variant="caption" sx={{ color: 'text.secondary', fontStyle: 'italic', fontFamily: '"Poppins", sans-serif' }}>
            {t('lots:form.noModels')}
          </Box>
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
              fontFamily: '"Poppins", sans-serif'
            }}
          >
            {modelData?.modelNumber || 'M'}
          </Avatar>
          <Box>
            <Box sx={{ fontWeight: 600, fontFamily: '"Poppins", sans-serif', fontSize: '0.85rem' }}>
              {modelData?.model || t('lots:form.model')}
            </Box>
            <Box sx={{ color: 'text.secondary', fontFamily: '"Poppins", sans-serif', fontSize: '0.7rem' }}>
              {modelData?.modelNumber || ''}
            </Box>
          </Box>
        </Box>
      )
    }
  },
  {
    field: 'status',
    headerName: t('lots:table.status'),
    flex: 0.85,
    minWidth: 110,
    renderCell: ({ value }) => {
      const config = {
        available: { icon: CheckCircle, color: '#8CA551', bg: 'rgba(140, 165, 81, 0.12)', label: t('lots:status.available') },
        pending: { icon: Schedule, color: '#E5863C', bg: 'rgba(229, 134, 60, 0.12)', label: t('lots:status.pending') },
        sold: { icon: Cancel, color: '#706f6f', bg: 'rgba(112, 111, 111, 0.12)', label: t('lots:status.sold') },
        reserved: { icon: CheckCircle, color: '#FF9800', bg: 'rgba(255, 152, 0, 0.12)', label: t('lots:status.reserved') }
      }[value] || { icon: CheckCircle, color: '#8CA551', bg: 'rgba(140, 165, 81, 0.12)', label: value }
      
      return (
        <Chip
          label={config.label}
          icon={<config.icon />}
          size="small"
          sx={{
            fontWeight: 600,
            fontFamily: '"Poppins", sans-serif',
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
    flex: 1.1,
    minWidth: 160,
    renderCell: ({ row }) => {
      if (!row.assignedUser) {
        return (
          <Box sx={{ color: 'text.secondary', fontFamily: '"Poppins", sans-serif' }}>
            {t('lots:table.unassigned')}
          </Box>
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
              fontFamily: '"Poppins", sans-serif',
              border: '2px solid rgba(255, 255, 255, 0.9)',
              boxShadow: '0 2px 8px rgba(51, 63, 31, 0.15)'
            }}
          >
            {row.assignedUser.firstName?.charAt(0)}{row.assignedUser.lastName?.charAt(0)}
          </Avatar>
          <Box>
            <Box sx={{ fontWeight: 600, fontFamily: '"Poppins", sans-serif' }}>
              {row.assignedUser.firstName} {row.assignedUser.lastName}
            </Box>
            <Box sx={{ color: 'text.secondary', fontFamily: '"Poppins", sans-serif', fontSize: '0.7rem' }}>
              {row.assignedUser.email}
            </Box>
          </Box>
        </Box>
      )
    }
  },
  {
    field: 'actions',
    headerName: t('lots:table.actions'),
    flex: 0.75,
    minWidth: 100,
    sortable: false,
    align: 'center',
    renderCell: ({ row }) => (
      <Box sx={{ display: 'flex', gap: 0.3, justifyContent: 'center' }}>
        <Tooltip title={t('lots:actions.edit')} placement="top">
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation()
              onEdit(row)
            }}
            sx={{
              bgcolor: 'rgba(140, 165, 81, 0.08)',
              border: '1px solid rgba(140, 165, 81, 0.2)',
              borderRadius: 2,
              padding: '4px',
              transition: 'all 0.3s ease',
              '&:hover': {
                bgcolor: '#8CA551',
                borderColor: '#8CA551',
                transform: 'scale(1.1)',
                '& .MuiSvgIcon-root': { color: 'white' }
              }
            }}
          >
            <Edit sx={{ fontSize: 18, color: '#8CA551' }} />
          </IconButton>
        </Tooltip>
        <Tooltip title={t('lots:actions.delete')} placement="top">
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation()
              onDelete(row)
            }}
            sx={{
              bgcolor: 'rgba(229, 134, 60, 0.08)',
              border: '1px solid rgba(229, 134, 60, 0.2)',
              borderRadius: 2,
              padding: '4px',
              transition: 'all 0.3s ease',
              '&:hover': {
                bgcolor: '#E5863C',
                borderColor: '#E5863C',
                transform: 'scale(1.1)',
                '& .MuiSvgIcon-root': { color: 'white' }
              }
            }}
          >
            <Delete sx={{ fontSize: 18, color: '#E5863C' }} />
          </IconButton>
        </Tooltip>
      </Box>
    )
  }
]