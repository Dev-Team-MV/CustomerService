// @/Users/oficina/MV-CRM/CustomerService/frontend/apps/6town-houses/src/Constants/Columns/buildings.jsx

import { Box, Chip, IconButton, Tooltip } from '@mui/material'
import { Edit, Delete, Visibility, Home } from '@mui/icons-material'

export const getBuildingColumns = ({ onViewDetail, onEdit, onDelete, theme }) => [
  {
    field: 'name',
    headerName: 'Casa',
    flex: 1,
    minWidth: 180,
    renderCell: ({ row }) => ( // ✅ Cambiar params por { row }
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
    headerName: 'Estado',
    width: 140,
    renderCell: ({ value }) => { // ✅ Cambiar params por { value }
      const statusConfig = {
        active: { label: 'Disponible', color: 'success' },
        sold: { label: 'Vendida', color: 'error' },
        reserved: { label: 'Reservada', color: 'warning' },
        inactive: { label: 'Inactiva', color: 'default' }
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
    field: 'polygon',
    headerName: 'Polígono',
    width: 120,
    renderCell: ({ row }) => { // ✅ Cambiar params por { row }
      const hasPolygon = row.polygon && row.polygon.length > 0
      return (
        <Chip
          label={hasPolygon ? 'Definido' : 'Pendiente'}
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
    headerName: 'Renders',
    width: 100,
    align: 'center',
    renderCell: ({ row }) => { // ✅ Cambiar params por { row }
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
    field: 'createdAt',
    headerName: 'Creada',
    width: 140,
    renderCell: ({ value }) => { // ✅ Cambiar params por { value }
      const date = new Date(value)
      return (
        <Box sx={{ fontFamily: '"Poppins", sans-serif', fontSize: '0.875rem' }}>
          {date.toLocaleDateString('es-ES', { 
            day: '2-digit', 
            month: 'short', 
            year: 'numeric' 
          })}
        </Box>
      )
    }
  },
  {
    field: 'actions',
    headerName: 'Acciones',
    width: 140,
    sortable: false,
    renderCell: ({ row }) => ( // ✅ Cambiar params por { row }
      <Box display="flex" gap={0.5}>
        <Tooltip title="Ver Detalle">
          <IconButton
            size="small"
            onClick={() => onViewDetail(row)}
            sx={{
              color: theme.palette.primary.main,
              '&:hover': { bgcolor: theme.palette.primary.main + '14' }
            }}
          >
            <Visibility fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Editar">
          <IconButton
            size="small"
            onClick={() => onEdit(row)}
            sx={{
              color: theme.palette.secondary.main,
              '&:hover': { bgcolor: theme.palette.secondary.main + '14' }
            }}
          >
            <Edit fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Eliminar">
          <IconButton
            size="small"
            onClick={() => onDelete(row)}
            sx={{
              color: theme.palette.error.main,
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