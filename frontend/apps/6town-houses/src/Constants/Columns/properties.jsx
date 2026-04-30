import { useMemo, useCallback } from 'react'
import { IconButton, Chip, Box, Typography, LinearProgress, Tooltip, Button } from '@mui/material'
import { Visibility, Edit, Delete, Construction, PhotoLibrary, Description as DescriptionIcon } from '@mui/icons-material'
import { useTheme } from '@mui/material/styles'

const PhaseCell = ({ row, isAdmin, t, onOpenPhases }) => {
  const theme = useTheme()
  
  const getPhaseProgress = useCallback((property) => {
    if (!property.phases?.length) return { current: 1, total: 9, percentage: 0, completed: 0 }
    const totalPhases = property.phases.length
    const completedPhases = property.phases.filter(p => p.constructionPercentage === 100).length
    const avgProgress = property.phases.reduce((s, p) => s + (p.constructionPercentage || 0), 0) / totalPhases
    const firstIncomplete = property.phases.findIndex(p => p.constructionPercentage < 100)
    return {
      current: firstIncomplete === -1 ? totalPhases : firstIncomplete + 1,
      completed: completedPhases,
      total: totalPhases,
      percentage: Math.round(avgProgress)
    }
  }, [])

  const p = getPhaseProgress(row)
  
  return (
    <Box sx={{ minWidth: 140 }}>
      <Box display="flex" alignItems="center" gap={1} mb={0.5}>
        <Construction sx={{ fontSize: 16, color: theme.palette.accent?.main || theme.palette.primary.main }} />
        <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.8rem' }}>
          {t('property:phases.phase')} {p.current} {t('property:phases.of')} {p.total}
        </Typography>
      </Box>
      <Tooltip title={t('property:phases.completedInfo', { completed: p.completed })}>
        <LinearProgress
          variant="determinate"
          value={p.percentage}
          sx={{
            height: 6,
            borderRadius: 1,
            bgcolor: '#e0e0e0',
            '& .MuiLinearProgress-bar': {
              bgcolor: p.percentage === 100 ? theme.palette.success.main : theme.palette.primary.main,
              borderRadius: 1
            }
          }}
        />
      </Tooltip>
      <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem', display: 'block', mt: 0.5 }}>
        {p.completed} {t('property:phases.completed')} • {p.percentage}{t('property:phases.percentage')}
      </Typography>
      <Button
        size="small"
        variant="outlined"
        startIcon={<PhotoLibrary sx={{ fontSize: 14 }} />}
        onClick={(e) => { e.stopPropagation(); onOpenPhases && onOpenPhases(row) }}
        sx={{
          mt: 1,
          fontSize: '0.7rem',
          textTransform: 'none',
          fontWeight: 600,
          fontFamily: '"Poppins", sans-serif'
        }}
      >
        {isAdmin ? t('property:actions.managePhases') : t('property:actions.viewProgress')}
      </Button>
    </Box>
  )
}

export const usePropertyColumns = ({ isAdmin = false, onViewDetails, onEdit, onDelete, onOpenContracts, onOpenPhases, t }) => {
  const theme = useTheme()
  
  return useMemo(() => {
    const columns = [
      {
        field: 'lot',
        headerName: t('property:table.lot'),
        minWidth: 120,
        flex: 0.8,
        renderCell: ({ row }) => (
          <Typography variant="body2" sx={{ fontFamily: '"Poppins", sans-serif' }}>
            {row.lot}
          </Typography>
        )
      },
      {
        field: 'model',
        headerName: t('property:table.model'),
        minWidth: 150,
        flex: 1,
        renderCell: ({ row }) => (
          <Typography variant="body2" sx={{ fontFamily: '"Poppins", sans-serif' }}>
            {row.model}
          </Typography>
        )
      },
      {
        field: 'facade',
        headerName: t('property:table.facade'),
        minWidth: 140,
        flex: 0.9,
        renderCell: ({ row }) => (
          <Typography variant="body2" sx={{ fontFamily: '"Poppins", sans-serif' }}>
            {row.facade}
          </Typography>
        )
      },
      {
        field: 'resident',
        headerName: t('property:table.resident'),
        minWidth: 200,
        flex: 1.2,
        renderCell: ({ row }) => (
          <Typography variant="body2" sx={{ fontWeight: 500, fontFamily: '"Poppins", sans-serif' }}>
            {row.resident}
          </Typography>
        )
      },
      {
        field: 'status',
        headerName: t('property:table.status'),
        minWidth: 120,
        flex: 0.9,
        renderCell: ({ row }) => {
          const statusConfig = {
            pending: { label: t('property:status.pending'), color: 'warning' },
            active: { label: t('property:status.active'), color: 'success' },
            sold: { label: t('property:status.sold'), color: 'info' },
            cancelled: { label: t('property:status.cancelled'), color: 'error' },
            reserved: { label: t('property:status.reserved'), color: 'secondary' }
          }
          const config = statusConfig[row.status] || { label: row.status, color: 'default' }
          return (
            <Chip 
              label={config.label} 
              color={config.color} 
              size="small"
              sx={{ 
                fontWeight: 600,
                fontFamily: '"Poppins", sans-serif'
              }}
            />
          )
        }
      },
      {
        field: 'phases',
        headerName: t('property:table.phase'),
        minWidth: 220,
        flex: 1.3,
        renderCell: ({ row }) => (
          <PhaseCell row={row} isAdmin={isAdmin} t={t} onOpenPhases={onOpenPhases} />
        )
      },
      {
        field: 'price',
        headerName: t('property:table.price'),
        minWidth: 130,
        flex: 1,
        renderCell: ({ row }) => (
          <Typography variant="body2" sx={{ fontWeight: 600, fontFamily: '"Poppins", sans-serif' }}>
            {row.price ? `$${row.price.toLocaleString()}` : 'N/A'}
          </Typography>
        )
      },
      {
        field: 'pending',
        headerName: t('property:table.pending'),
        minWidth: 130,
        flex: 1,
        renderCell: ({ row }) => (
          <Typography 
            variant="body2" 
            sx={{ 
              fontWeight: 600,
              color: row.pending > 0 ? theme.palette.warning.main : theme.palette.success.main,
              fontFamily: '"Poppins", sans-serif'
            }}
          >
            {row.pending ? `$${row.pending.toLocaleString()}` : '$0'}
          </Typography>
        )
      }
    ]

    if (isAdmin) {
      columns.push({
        field: 'contracts',
        headerName: t('property:table.contracts'),
        align: 'center',
        minWidth: 100,
        flex: 0.7,
        sortable: false,
        renderCell: ({ row }) => (
          <Tooltip title={t('property:actions.manageContracts')} placement="top">
            <IconButton 
              size="small" 
              onClick={(e) => { 
                e.stopPropagation()
                onOpenContracts && onOpenContracts(row) 
              }}
              sx={{
                color: theme.palette.primary.main,
                '&:hover': { bgcolor: theme.palette.primary.main + '14' }
              }}
            >
              <DescriptionIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>
        )
      })
    }

    columns.push({
      field: 'actions',
      headerName: t('property:table.actions'),
      minWidth: 150,
      flex: 1,
      align: 'center',
      sortable: false,
      renderCell: ({ row }) => (
        <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
          <Tooltip title={t('property:actions.viewDetails')} placement="top">
            <IconButton 
              size="small" 
              onClick={() => onViewDetails?.(row)}
              sx={{
                color: theme.palette.primary.main,
                '&:hover': { bgcolor: theme.palette.primary.main + '14' }
              }}
            >
              <Visibility fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title={t('property:actions.edit')} placement="top">
            <IconButton 
              size="small" 
              onClick={() => onEdit?.(row)}
              sx={{
                color: theme.palette.secondary.main,
                '&:hover': { bgcolor: theme.palette.secondary.main + '14' }
              }}
            >
              <Edit fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title={t('property:actions.deleteProperty')} placement="top">
            <IconButton 
              size="small" 
              color="error" 
              onClick={() => onDelete?.(row)}
              sx={{
                '&:hover': { bgcolor: '#f44336' + '14' }
              }}
            >
              <Delete fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      )
    })

    return columns
  }, [isAdmin, onViewDetails, onEdit, onDelete, onOpenContracts, onOpenPhases, t, theme])
}