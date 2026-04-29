import { Box, Chip, IconButton, Tooltip, Skeleton } from '@mui/material'
import { Edit, Delete, Visibility, Home } from '@mui/icons-material'
import { useState, useEffect } from 'react'
import api from '@shared/services/api'

// Componente helper para resolver datos por ID
const ResolvedLotCell = ({ lotId }) => {
  const [lot, setLot] = useState(null)
  const [loading, setLoading] = useState(!!lotId)

  useEffect(() => {
    if (!lotId) return

    const fetchLot = async () => {
      try {
        const response = await api.get(`/lots/${lotId}`)
        setLot(response.data)
      } catch (error) {
        console.error('Error fetching lot:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchLot()
  }, [lotId])

  if (loading) return <Skeleton variant="text" width={80} />
  
  return (
    <Chip
      label={lot?.number ? `Lote ${lot.number}` : '-'}
      size="small"
      sx={{
        fontWeight: 600,
        fontFamily: '"Poppins", sans-serif',
        borderRadius: 2
      }}
    />
  )
}

const ResolvedModelCell = ({ modelId }) => {
  const [model, setModel] = useState(null)
  const [loading, setLoading] = useState(!!modelId)

  useEffect(() => {
    if (!modelId) return

    const fetchModel = async () => {
      try {
        const response = await api.get(`/models/${modelId}`)
        setModel(response.data)
      } catch (error) {
        console.error('Error fetching model:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchModel()
  }, [modelId])

  if (loading) return <Skeleton variant="text" width={100} />
  
  return (
    <Box sx={{ fontFamily: '"Poppins", sans-serif', fontSize: '0.875rem' }}>
      {model?.model || '-'}
    </Box>
  )
}

export const getBuildingColumns = ({ onViewDetail, onEdit, onDelete, theme, t }) => [
  {
    field: 'name',
    headerName: t('houses6Town:table.name'),
    flex: 1.5,
    minWidth: 200,
    renderCell: ({ row }) => (
      <Box display="flex" alignItems="center" gap={1.5}>
        <Home sx={{ color: theme.palette.primary.main, fontSize: 24 }} />
        <Box>
          <Box sx={{ fontWeight: 700, color: theme.palette.primary.main, fontFamily: '"Poppins", sans-serif' }}>
            {row.name}
          </Box>
          <Box sx={{ fontSize: '0.75rem', color: theme.palette.text.secondary, fontFamily: '"Poppins", sans-serif' }}>
            ID: {row._id?.slice(-6)}
          </Box>
        </Box>
      </Box>
    )
  },
  {
    field: 'status',
    headerName: t('houses6Town:table.status'),
    flex: 0.8,
    minWidth: 110,
    renderCell: ({ value }) => {
      const statusConfig = {
        active: { label: t('houses6Town:status.active'), color: 'success' },
        sold: { label: t('houses6Town:status.sold'), color: 'error' },
        reserved: { label: t('houses6Town:status.reserved'), color: 'warning' },
        inactive: { label: t('houses6Town:status.inactive'), color: 'default' }
      }
      const config = statusConfig[value] || statusConfig.active
      return (
        <Chip
          label={config.label}
          color={config.color}
          size="small"
          sx={{
            fontWeight: 600,
            fontFamily: '"Poppins", sans-serif',
            borderRadius: 2
          }}
        />
      )
    }
  },
  {
    field: 'quoteRef.lot',
    headerName: t('houses6Town:table.lot'),
    flex: 0.8,
    minWidth: 100,
    renderCell: ({ row }) => {
      if (row.quoteRef?.lot && typeof row.quoteRef.lot === 'object') {
        return (
          <Chip
            label={row.quoteRef.lot.number ? `Lote ${row.quoteRef.lot.number}` : '-'}
            size="small"
            sx={{
              fontWeight: 600,
              fontFamily: '"Poppins", sans-serif',
              borderRadius: 2
            }}
          />
        )
      }
      
      return <ResolvedLotCell lotId={row.quoteRef?.lot} />
    }
  },
  {
    field: 'quoteRef.model',
    headerName: t('houses6Town:table.model'),
    flex: 1,
    minWidth: 140,
    renderCell: ({ row }) => {
      if (row.quoteRef?.model && typeof row.quoteRef.model === 'object') {
        return (
          <Box sx={{ fontFamily: '"Poppins", sans-serif', fontSize: '0.875rem', fontWeight: 500 }}>
            {row.quoteRef.model.model || '-'}
          </Box>
        )
      }
      
      return <ResolvedModelCell modelId={row.quoteRef?.model} />
    }
  },
  {
    field: 'polygon',
    headerName: t('houses6Town:table.polygon') || 'Polígono',
    flex: 0.8,
    minWidth: 100,
    renderCell: ({ row }) => {
      const hasPolygon = row.polygon && row.polygon.length > 0
      return (
        <Chip
          label={hasPolygon ? t('houses6Town:form.defined') || 'Definido' : t('houses6Town:form.pending') || 'Pendiente'}
          color={hasPolygon ? 'success' : 'default'}
          variant={hasPolygon ? 'filled' : 'outlined'}
          size="small"
          sx={{
            fontWeight: 600,
            fontFamily: '"Poppins", sans-serif',
            borderRadius: 2
          }}
        />
      )
    }
  },
  {
    field: 'exteriorRenders',
    headerName: t('houses6Town:table.renders') || 'Renders',
    flex: 0.6,
    minWidth: 80,
    align: 'center',
    renderCell: ({ row }) => {
      const count = Array.isArray(row.exteriorRenders) 
        ? row.exteriorRenders.length 
        : 0
      
      return (
        <Chip
          label={count}
          size="small"
          color={count > 0 ? 'primary' : 'default'}
          sx={{
            fontWeight: 700,
            fontFamily: '"Poppins", sans-serif',
            minWidth: 40
          }}
        />
      )
    }
  },

  {
    field: 'actions',
    headerName: t('houses6Town:table.actions'),
    flex: 0.7,
    minWidth: 90,
    sortable: false,
    align: 'center',
    renderCell: ({ row }) => (
      <Box display="flex" gap={0.3} justifyContent="center">
        <Tooltip title={t('houses6Town:actions.view') || 'Ver Detalle'}>
          <IconButton
            size="small"
            onClick={() => onViewDetail(row)}
            sx={{
              color: theme.palette.primary.main,
              padding: '4px',
              '&:hover': { bgcolor: theme.palette.primary.main + '14' }
            }}
          >
            <Visibility fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title={t('houses6Town:actions.edit')}>
          <IconButton
            size="small"
            onClick={() => onEdit(row)}
            sx={{
              color: theme.palette.secondary.main,
              padding: '4px',
              '&:hover': { bgcolor: theme.palette.secondary.main + '14' }
            }}
          >
            <Edit fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title={t('houses6Town:actions.delete')}>
          <IconButton
            size="small"
            onClick={() => onDelete(row)}
            sx={{
              color: theme.palette.error.main,
              padding: '4px',
              '&:hover': { bgcolor: theme.palette.error.main + '14' }
            }}
          >
            <Delete fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
    )
  }
]