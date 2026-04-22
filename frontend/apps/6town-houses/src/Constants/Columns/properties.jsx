// @/Users/oficina/MV-CRM/CustomerService/frontend/apps/6town-houses/src/Constants/Columns/properties.jsx

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
          Fase {p.current} / {p.total}
        </Typography>
      </Box>
      <Tooltip title={`${p.completed} completadas`}>
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
        {p.completed} completadas • {p.percentage}%
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
          fontWeight: 600
        }}
      >
        {isAdmin ? 'Gestionar fases' : 'Ver progreso'}
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
        headerName: 'Lote',
        minWidth: 120,
        renderCell: ({ row }) => (
          <Typography variant="body2">
            {row.lot}
          </Typography>
        )
      },
      {
        field: 'model',
        headerName: 'Modelo',
        minWidth: 150,
        renderCell: ({ row }) => (
          <Typography variant="body2">
            {row.model}
          </Typography>
        )
      },
      {
        field: 'resident',
        headerName: 'Residente',
        minWidth: 200,
        renderCell: ({ row }) => (
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            {row.resident}
          </Typography>
        )
      },
      {
        field: 'status',
        headerName: 'Estado',
        minWidth: 120,
        renderCell: ({ row }) => {
          const statusColors = {
            pending: 'warning',
            active: 'success',
            sold: 'info',
            cancelled: 'error'
          }
          return (
            <Chip 
              label={row.status || 'N/A'} 
              color={statusColors[row.status] || 'default'} 
              size="small" 
            />
          )
        }
      },
      {
        field: 'phases',
        headerName: 'Fases',
        minWidth: 200,
        renderCell: ({ row }) => <PhaseCell row={row} isAdmin={isAdmin} t={t} onOpenPhases={onOpenPhases} />
      },
      {
        field: 'price',
        headerName: 'Precio',
        minWidth: 130,
        renderCell: ({ row }) => (
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {row.price ? `$${row.price.toLocaleString()}` : 'N/A'}
          </Typography>
        )
      },
      {
        field: 'pending',
        headerName: 'Pendiente',
        minWidth: 130,
        renderCell: ({ row }) => (
          <Typography variant="body2" color="warning.main">
            {row.pending ? `$${row.pending.toLocaleString()}` : '$0'}
          </Typography>
        )
      }
    ]

    if (isAdmin) {
      columns.push({
        field: 'contracts',
        headerName: 'Contratos',
        align: 'center',
        width: 100,
        renderCell: ({ row }) => (
          <Tooltip title="Gestionar contratos" placement="top">
            <IconButton size="small" onClick={(e) => { e.stopPropagation(); onOpenContracts && onOpenContracts(row) }}>
              <DescriptionIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>
        )
      })
    }

    columns.push({
      field: 'actions',
      headerName: 'Acciones',
      minWidth: 150,
      align: 'center',
      renderCell: ({ row }) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton size="small" onClick={() => onViewDetails?.(row)}>
            <Visibility fontSize="small" />
          </IconButton>
          <IconButton size="small" onClick={() => onEdit?.(row)}>
            <Edit fontSize="small" />
          </IconButton>
          <IconButton size="small" color="error" onClick={() => onDelete?.(row)}>
            <Delete fontSize="small" />
          </IconButton>
        </Box>
      )
    })

    return columns
  }, [isAdmin, onViewDetails, onEdit, onDelete, onOpenContracts, onOpenPhases, t, theme])
}