// @/Users/oficina/MV-CRM/CustomerService/frontend/apps/6town-houses/src/Constants/Columns/lots.jsx

import { Box, Chip, IconButton, Tooltip } from '@mui/material'
import { Edit, Delete } from '@mui/icons-material'

export const getLotColumns = ({ onEdit, onDelete, theme }) => [
  {
    field: 'number',
    headerName: 'Número',
    flex: 1,
    minWidth: 150,
    renderCell: ({ row }) => (
      <Box>
        <Box sx={{ fontWeight: 700, color: theme.palette.primary.main, fontFamily: '"Poppins", sans-serif' }}>
          {row.number}
        </Box>
        <Box sx={{ fontSize: '0.75rem', color: theme.palette.text.secondary, fontFamily: '"Poppins", sans-serif' }}>
          ID: {row._id?.slice(-6)}
        </Box>
      </Box>
    )
  },
  {
    field: 'price',
    headerName: 'Precio',
    width: 140,
    renderCell: ({ value }) => (
      <Box sx={{ fontWeight: 600, fontFamily: '"Poppins", sans-serif' }}>
        ${value?.toLocaleString() || 0}
      </Box>
    )
  },
  {
    field: 'status',
    headerName: 'Estado',
    width: 140,
    renderCell: ({ value }) => {
      const statusConfig = {
        available: { label: 'Disponible', color: 'success' },
        sold: { label: 'Vendido', color: 'error' },
        reserved: { label: 'Reservado', color: 'warning' },
        inactive: { label: 'Inactivo', color: 'default' }
      }
      const config = statusConfig[value] || statusConfig.available
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
    field: 'createdAt',
    headerName: 'Creado',
    width: 140,
    renderCell: ({ value }) => {
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
    width: 120,
    sortable: false,
    renderCell: ({ row }) => (
      <Box display="flex" gap={0.5}>
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