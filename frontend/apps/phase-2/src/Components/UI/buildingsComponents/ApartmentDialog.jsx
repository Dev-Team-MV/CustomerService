import { useState, useEffect } from 'react'
import { Grid, TextField, MenuItem, Button, Alert } from '@mui/material'
import { Home } from '@mui/icons-material'
import { useTheme } from '@mui/material/styles'
import ModalWrapper from '@shared/constants/ModalWrapper'
import PrimaryButton from '@shared/constants/PrimaryButton'

const DEFAULT_FORM = {
  apartmentModel: '',
  floorNumber: '',
  apartmentNumber: '',
  price: '',
  pending: '',
  status: 'available',
}

const ApartmentDialog = ({
  open,
  onClose,
  onSaved,
  selectedApartment,
  apartmentModels = [],
  buildingFloors = 1,
}) => {
  const theme = useTheme()
  const [form, setForm] = useState(DEFAULT_FORM)

  useEffect(() => {
    if (open) {
      if (selectedApartment) {
        setForm({
          apartmentModel: selectedApartment.apartmentModel || '',
          floorNumber: selectedApartment.floorNumber || '',
          apartmentNumber: selectedApartment.apartmentNumber || '',
          price: selectedApartment.price ?? '',
          pending: selectedApartment.pending ?? '',
          status: selectedApartment.status || 'available',
        })
      } else {
        setForm(DEFAULT_FORM)
      }
    }
  }, [selectedApartment, open])

  const handleChange = (field, value) => setForm(prev => ({ ...prev, [field]: value }))

  const isValid =
    form.apartmentModel &&
    form.floorNumber &&
    form.apartmentNumber &&
    Number(form.price) >= 0 &&
    Number(form.pending) >= 0

  const handleSubmit = () => {
    if (!isValid) return
    const payload = {
      ...selectedApartment,
      _id: selectedApartment?._id || `apt_${Date.now()}`,
      ...form,
      price: Number(form.price),
      pending: Number(form.pending),
      floorNumber: Number(form.floorNumber),
    }
    console.log('🏠 Apartment Payload:', payload)
    onSaved(payload)
  }

  const fieldSx = {
    '& .MuiOutlinedInput-root': {
      borderRadius: 3,
      fontFamily: '"Poppins", sans-serif',
      bgcolor: 'white',
      '&.Mui-focused fieldset': { borderColor: theme.palette.primary.main, borderWidth: '2px' },
      '&:hover fieldset': { borderColor: theme.palette.secondary.main }
    },
    '& .MuiInputLabel-root': {
      fontFamily: '"Poppins", sans-serif',
      '&.Mui-focused': { color: theme.palette.primary.main }
    }
  }

  const actions = (
    <>
      <Button
        onClick={onClose}
        sx={{
          borderRadius: 3,
          textTransform: 'none',
          fontWeight: 600,
          px: 3, py: 1.2,
          color: theme.palette.text.secondary,
          fontFamily: '"Poppins", sans-serif',
          border: `2px solid ${theme.palette.divider}`,
          '&:hover': {
            bgcolor: theme.palette.action.hover,
            borderColor: theme.palette.text.secondary
          }
        }}
      >
        Cancel
      </Button>
      <PrimaryButton onClick={handleSubmit} disabled={!isValid} startIcon={<Home />}>
        {selectedApartment ? 'Update Apartment' : 'Create Apartment'}
      </PrimaryButton>
    </>
  )

  return (
    <ModalWrapper
      open={open}
      onClose={onClose}
      icon={Home}
      title={selectedApartment ? 'Edit Apartment' : 'New Apartment'}
      subtitle={selectedApartment ? `Editing Apartment #${selectedApartment.apartmentNumber}` : 'Define the apartment details'}
      maxWidth="sm"
      actions={actions}
    >
      <Alert
        severity="info"
        sx={{
          mb: 2,
          borderRadius: 3,
          bgcolor: theme.palette.info.main + '14',
          border: `1px solid ${theme.palette.info.main}4D`,
          fontFamily: '"Poppins", sans-serif',
          '& .MuiAlert-icon': { color: theme.palette.info.main }
        }}
      >
        Fill in the details for this apartment unit.
      </Alert>
      <Grid container spacing={2} sx={{ mt: 0.5 }}>
        <Grid item xs={12} sm={6}>
          <TextField
            select
            required
            fullWidth
            label="Apartment Model"
            value={form.apartmentModel}
            onChange={e => handleChange('apartmentModel', e.target.value)}
            sx={fieldSx}
          >
            {apartmentModels.map(model => (
              <MenuItem key={model._id} value={model._id}>
                {model.name}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid item xs={12} sm={3}>
          <TextField
            required
            fullWidth
            type="number"
            label="Floor Number"
            inputProps={{ min: 1, max: buildingFloors }}
            value={form.floorNumber}
            onChange={e => handleChange('floorNumber', e.target.value)}
            sx={fieldSx}
          />
        </Grid>
        <Grid item xs={12} sm={3}>
          <TextField
            required
            fullWidth
            label="Apartment Number"
            value={form.apartmentNumber}
            onChange={e => handleChange('apartmentNumber', e.target.value)}
            sx={fieldSx}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            required
            fullWidth
            type="number"
            label="Price"
            inputProps={{ min: 0 }}
            value={form.price}
            onChange={e => handleChange('price', e.target.value)}
            sx={fieldSx}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            required
            fullWidth
            type="number"
            label="Pending"
            inputProps={{ min: 0 }}
            value={form.pending}
            onChange={e => handleChange('pending', e.target.value)}
            sx={fieldSx}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            select
            fullWidth
            label="Status"
            value={form.status}
            onChange={e => handleChange('status', e.target.value)}
            sx={fieldSx}
          >
            <MenuItem value="available">Available</MenuItem>
            <MenuItem value="sold">Sold</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
          </TextField>
        </Grid>
      </Grid>
    </ModalWrapper>
  )
}

export default ApartmentDialog