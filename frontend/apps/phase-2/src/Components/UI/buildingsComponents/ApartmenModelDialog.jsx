import { useState, useEffect, useMemo } from 'react'
import { 
  Grid, TextField, MenuItem, Button, Alert
} from '@mui/material'
import { ViewModule } from '@mui/icons-material'
import { useTheme } from '@mui/material/styles'
import ModalWrapper from '@shared/constants/ModalWrapper'
import PrimaryButton from '@shared/constants/PrimaryButton'

const DEFAULT_FORM = {
  building: '',
  name: '',
  modelNumber: '',
  sqft: '',
  bedrooms: '',
  bathrooms: '',
  apartmentCount: '',
  status: 'active',
}

const ApartmentModelDialog = ({ 
  open, 
  onClose, 
  onSaved, 
  selectedModel, 
  buildingId,
  buildingTotalApartments = 0,
  existingModels = []
}) => {
  const theme = useTheme()
  const [form, setForm] = useState(DEFAULT_FORM)

  // Calcular apartamentos ya asignados
  const assignedApartments = useMemo(() => {
    return existingModels
      .filter(m => m._id !== selectedModel?._id) // Excluir el modelo actual si estamos editando
      .reduce((sum, model) => sum + (model.apartmentCount || 0), 0)
  }, [existingModels, selectedModel])

  // Calcular apartamentos disponibles
  const availableApartments = useMemo(() => {
    return buildingTotalApartments - assignedApartments
  }, [buildingTotalApartments, assignedApartments])

  useEffect(() => {
    if (open) {
      if (selectedModel) {
        setForm({
          building: selectedModel.building || buildingId || '',
          name: selectedModel.name || '',
          modelNumber: selectedModel.modelNumber || '',
          sqft: selectedModel.sqft ?? '',
          bedrooms: selectedModel.bedrooms ?? '',
          bathrooms: selectedModel.bathrooms ?? '',
          apartmentCount: selectedModel.apartmentCount ?? '',
          status: selectedModel.status || 'active',
        })
      } else {
        setForm({ ...DEFAULT_FORM, building: buildingId || '' })
      }
    }
  }, [selectedModel, buildingId, open])

  const handleChange = (field, value) => setForm(prev => ({ ...prev, [field]: value }))

  const isValid = 
    form.building && 
    form.name.trim().length > 0 && 
    Number(form.sqft) > 0 &&
    Number(form.bedrooms) >= 0 &&
    Number(form.bathrooms) > 0 &&
    Number(form.apartmentCount) > 0 &&
    Number(form.apartmentCount) <= availableApartments

  const handleSubmit = () => {
    if (!form.building) {
      alert('Building is required')
      return
    }

    if (Number(form.apartmentCount) > availableApartments) {
      alert(`Cannot assign ${form.apartmentCount} apartments. Only ${availableApartments} available.`)
      return
    }
    
    const payload = {
      ...selectedModel,
      _id: selectedModel?._id || `am_${Date.now()}`,
      ...form,
      sqft: Number(form.sqft),
      bedrooms: Number(form.bedrooms),
      bathrooms: Number(form.bathrooms),
      apartmentCount: Number(form.apartmentCount),
    }

    console.log('🏢 ApartmentModel Payload:', payload)

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
      <PrimaryButton onClick={handleSubmit} disabled={!isValid} startIcon={<ViewModule />}>
        {selectedModel ? 'Update Model' : 'Create Model'}
      </PrimaryButton>
    </>
  )

  return (
    <ModalWrapper
      open={open}
      onClose={onClose}
      icon={ViewModule}
      title={selectedModel ? 'Edit Apartment Model' : 'New Apartment Model'}
      subtitle={
        selectedModel
          ? `Editing ${selectedModel.name}`
          : 'Define the apartment model specifications'
      }
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
        Apartment models define the different types of units in this building (e.g., Model A, B, C).
      </Alert>

      {/* Alert de disponibilidad */}
      <Alert
        severity={availableApartments > 0 ? 'success' : 'warning'}
        sx={{
          mb: 2,
          borderRadius: 3,
          bgcolor: availableApartments > 0 
            ? theme.palette.success.main + '14' 
            : theme.palette.warning.main + '14',
          border: `1px solid ${availableApartments > 0 
            ? theme.palette.success.main + '4D' 
            : theme.palette.warning.main + '4D'}`,
          fontFamily: '"Poppins", sans-serif',
          '& .MuiAlert-icon': { 
            color: availableApartments > 0 
              ? theme.palette.success.main 
              : theme.palette.warning.main 
          }
        }}
      >
        <strong>Building Total:</strong> {buildingTotalApartments} apartments | 
        <strong> Assigned:</strong> {assignedApartments} | 
        <strong> Available:</strong> {availableApartments}
      </Alert>

      <Grid container spacing={2} sx={{ mt: 0.5 }}>
        {/* Model Name & Number */}
        <Grid item xs={12} sm={8}>
          <TextField
            fullWidth
            required
            label="Model Name"
            value={form.name}
            onChange={e => handleChange('name', e.target.value)}
            helperText="e.g., Model A, Deluxe Suite"
            sx={fieldSx}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            label="Model Number"
            value={form.modelNumber}
            onChange={e => handleChange('modelNumber', e.target.value)}
            helperText="e.g., A, B, C"
            sx={fieldSx}
          />
        </Grid>

        {/* Sqft, Bedrooms, Bathrooms */}
        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            required
            type="number"
            label="Square Feet"
            inputProps={{ min: 1 }}
            value={form.sqft}
            onChange={e => handleChange('sqft', e.target.value)}
            sx={fieldSx}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            required
            type="number"
            label="Bedrooms"
            inputProps={{ min: 0 }}
            value={form.bedrooms}
            onChange={e => handleChange('bedrooms', e.target.value)}
            sx={fieldSx}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            required
            type="number"
            label="Bathrooms"
            inputProps={{ min: 0.5, step: 0.5 }}
            value={form.bathrooms}
            onChange={e => handleChange('bathrooms', e.target.value)}
            sx={fieldSx}
          />
        </Grid>

        {/* Apartment Count & Status */}
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            required
            type="number"
            label="Apartment Count"
            inputProps={{ min: 1, max: availableApartments }}
            value={form.apartmentCount}
            onChange={e => handleChange('apartmentCount', e.target.value)}
            helperText={`Available: ${availableApartments} units`}
            error={Number(form.apartmentCount) > availableApartments}
            sx={fieldSx}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            select
            label="Status"
            value={form.status}
            onChange={e => handleChange('status', e.target.value)}
            sx={fieldSx}
          >
            <MenuItem value="active" sx={{ fontFamily: '"Poppins", sans-serif' }}>
              Active
            </MenuItem>
            <MenuItem value="inactive" sx={{ fontFamily: '"Poppins", sans-serif' }}>
              Inactive
            </MenuItem>
          </TextField>
        </Grid>
      </Grid>
    </ModalWrapper>
  )
}

export default ApartmentModelDialog