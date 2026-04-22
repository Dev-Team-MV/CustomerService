// @shared/components/Buildings/ParkingSpotAssignmentDialog.jsx
import { useState } from 'react'
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, MenuItem, Box, Typography, Chip, Alert
} from '@mui/material'
import { DirectionsCar } from '@mui/icons-material'

const ParkingSpotAssignmentDialog = ({
  open,
  onClose,
  parkingSpot,
  apartments = [],
  onAssign,
  loading = false
}) => {
  const [selectedApartment, setSelectedApartment] = useState('')

  const handleAssign = () => {
    if (selectedApartment) {
      onAssign(selectedApartment)
      setSelectedApartment('')
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 700, fontFamily: '"Poppins", sans-serif' }}>
        Assign Parking Spot to Apartment
      </DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          {parkingSpot && (
            <Alert severity="info" sx={{ borderRadius: 2 }}>
              <Box display="flex" alignItems="center" gap={1}>
                <DirectionsCar fontSize="small" />
                <Typography variant="body2" fontFamily='"Poppins", sans-serif'>
                  Assigning spot: <strong>{parkingSpot.code}</strong>
                </Typography>
              </Box>
            </Alert>
          )}
          
          <TextField
            fullWidth
            select
            label="Select Apartment"
            value={selectedApartment}
            onChange={(e) => setSelectedApartment(e.target.value)}
            disabled={loading}
          >
            {apartments.length === 0 ? (
              <MenuItem disabled>No apartments available</MenuItem>
            ) : (
              apartments.map((apt) => (
                <MenuItem key={apt._id} value={apt._id}>
                  <Box display="flex" justifyContent="space-between" width="100%">
                    <span>{apt.apartmentNumber}</span>
                    <Chip
                      label={apt.apartmentModel?.name || 'No model'}
                      size="small"
                      sx={{ ml: 2 }}
                    />
                  </Box>
                </MenuItem>
              ))
            )}
          </TextField>
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
          onClick={handleAssign}
          variant="contained"
          disabled={!selectedApartment || loading}
          sx={{ textTransform: 'none', fontFamily: '"Poppins", sans-serif' }}
        >
          Assign
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default ParkingSpotAssignmentDialog