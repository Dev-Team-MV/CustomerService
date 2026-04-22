// @shared/components/Buildings/ParkingSpotSelectorDialog.jsx
import { useState } from 'react'
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Box, Typography, Chip, Alert, List, ListItem,
  ListItemButton, ListItemText, ListItemIcon, Radio
} from '@mui/material'
import { DirectionsCar, LocalParking } from '@mui/icons-material'

const ParkingSpotSelectorDialog = ({
  open,
  onClose,
  parkingSpots = [],
  currentSpotId = null,
  onSelect,
  loading = false
}) => {
  const [selectedSpot, setSelectedSpot] = useState(currentSpotId)

  // Filter only available spots or current spot
  const availableSpots = parkingSpots.filter(
    spot => spot.status === 'available' || spot._id === currentSpotId
  )

  const handleSelect = () => {
    onSelect(selectedSpot)
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

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 700, fontFamily: '"Poppins", sans-serif' }}>
        Select Parking Spot
      </DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 2 }}>
          {availableSpots.length === 0 ? (
            <Alert severity="warning" sx={{ borderRadius: 2 }}>
              No available parking spots
            </Alert>
          ) : (
            <List>
              {availableSpots.map((spot) => (
                <ListItem key={spot._id} disablePadding>
                  <ListItemButton
                    onClick={() => setSelectedSpot(spot._id)}
                    selected={selectedSpot === spot._id}
                    sx={{ borderRadius: 2, mb: 1 }}
                  >
                    <ListItemIcon>
                      <Radio checked={selectedSpot === spot._id} />
                    </ListItemIcon>
                    <ListItemIcon>
                      <DirectionsCar />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box display="flex" alignItems="center" gap={1}>
                          <Typography variant="body1" fontWeight={600} fontFamily='"Poppins", sans-serif'>
                            {spot.code}
                          </Typography>
                          <Chip
                            label={spot.status}
                            size="small"
                            sx={{
                              bgcolor: getStatusColor(spot.status) + '20',
                              color: getStatusColor(spot.status),
                              fontWeight: 600,
                              fontSize: '0.7rem'
                            }}
                          />
                        </Box>
                      }
                      secondary={
                        <Typography variant="caption" fontFamily='"Poppins", sans-serif'>
                          Floor {spot.floorNumber} • {spot.spotType}
                        </Typography>
                      }
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={onClose}
          disabled={loading}
          sx={{ textTransform: 'none', fontFamily: '"Poppins", sans-serif' }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSelect}
          variant="contained"
          disabled={!selectedSpot || loading}
          sx={{ textTransform: 'none', fontFamily: '"Poppins", sans-serif' }}
        >
          Select
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default ParkingSpotSelectorDialog