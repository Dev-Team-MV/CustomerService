// @sheperd/Constants/Columns/parkingSpots.jsx
import { Box, Typography, Chip, IconButton } from '@mui/material'
import {
  DirectionsCar, Accessible, EvStation, TwoWheeler,
  MoreVert
} from '@mui/icons-material'
import { getParkingSpotTypes, getParkingStatusOptions } from '@shared/config/buildingConfig'

const getSpotTypeIcon = (type) => {
  const icons = {
    standard: DirectionsCar,
    covered: DirectionsCar,
    uncovered: DirectionsCar,
    tandem: DirectionsCar,
    motorcycle: TwoWheeler,
    accessible: Accessible,
    electric: EvStation
  }
  const Icon = icons[type] || DirectionsCar
  return Icon
}

const getStatusColor = (status) => {
  const colors = {
    available: '#43A047',
    assigned: '#FF6B35',
    reserved: '#FFA726',
    blocked: '#757575'
  }
  return colors[status] || '#757575'
}

export const useParkingSpotColumns = ({
  onMenuOpen
}) => {
  const spotTypes = getParkingSpotTypes('sheperd')
  const statusOptions = getParkingStatusOptions('sheperd')

  return [
    {
      field: 'code',
      headerName: 'Code',
      // Eliminar width, usar flex en su lugar
      renderCell: ({ value }) => (
        <Typography variant="body2" fontWeight={600} fontFamily='"Poppins", sans-serif'>
          {value}
        </Typography>
      )
    },
    {
      field: 'spotType',
      headerName: 'Type',
      // Eliminar width
      renderCell: ({ row }) => {
        const Icon = getSpotTypeIcon(row.spotType)
        return (
          <Box display="flex" alignItems="center" gap={1}>
            <Icon fontSize="small" />
            <Typography variant="body2" fontFamily='"Poppins", sans-serif'>
              {spotTypes.find(t => t.value === row.spotType)?.label || row.spotType}
            </Typography>
          </Box>
        )
      }
    },
    {
      field: 'status',
      headerName: 'Status',
      // Eliminar width
      renderCell: ({ value }) => (
        <Chip
          label={statusOptions.find(s => s.value === value)?.label || value}
          size="small"
          sx={{
            bgcolor: getStatusColor(value) + '20',
            color: getStatusColor(value),
            fontWeight: 600,
            fontFamily: '"Poppins", sans-serif'
          }}
        />
      )
    },
    {
      field: 'apartment',
      headerName: 'Apartment',
      // Eliminar width
      renderCell: ({ value }) => {
        if (!value) {
          return (
            <Typography variant="body2" color="text.secondary" fontFamily='"Poppins", sans-serif'>
              -
            </Typography>
          )
        }
        
        const apartmentNumber = typeof value === 'object' ? value.apartmentNumber : value
        const floorNumber = typeof value === 'object' ? value.floorNumber : null
        
        return (
          <Box>
            <Typography variant="body2" fontWeight={600} fontFamily='"Poppins", sans-serif'>
              {apartmentNumber}
            </Typography>
            {floorNumber && (
              <Typography variant="caption" color="text.secondary" fontFamily='"Poppins", sans-serif'>
                Floor {floorNumber}
              </Typography>
            )}
          </Box>
        )
      }
    },
    {
      field: 'notes',
      headerName: 'Notes',
      // Eliminar minWidth, dejar que se distribuya automáticamente
      renderCell: ({ value }) => (
        <Typography 
          variant="body2" 
          color="text.secondary" 
          fontFamily='"Poppins", sans-serif'
          sx={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}
        >
          {value || '-'}
        </Typography>
      )
    },
    {
      field: 'actions',
      headerName: 'Actions',
      align: 'right',
      width: '80px', // Solo Actions mantiene un width fijo pequeño
      renderCell: ({ row }) => (
        <IconButton
          size="small"
          onClick={(e) => {
            e.stopPropagation()
            onMenuOpen(e, row)
          }}
        >
          <MoreVert />
        </IconButton>
      )
    }
  ]
}