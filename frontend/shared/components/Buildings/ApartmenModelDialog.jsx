import { useState, useEffect, useMemo } from 'react'
import { 
  Grid, TextField, MenuItem, Button, Alert
} from '@mui/material'
import { ViewModule } from '@mui/icons-material'
import { useTheme } from '@mui/material/styles'
import ModalWrapper from '@shared/constants/ModalWrapper'
import PrimaryButton from '@shared/constants/PrimaryButton'
import { useTranslation } from 'react-i18next'
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
  const { t } = useTranslation(['buildings', 'common'])

  // Apartamentos ya asignados
  const assignedApartments = useMemo(() => {
    return existingModels
      .filter(m => m._id !== selectedModel?._id)
      .reduce((sum, model) => sum + (model.apartmentCount || 0), 0)
  }, [existingModels, selectedModel])

  // Apartamentos disponibles
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

  // --- ESTA ES LA FUNCIÓN CLAVE ---
  const handleSubmit = () => {
    if (!form.building) {
      alert('Building is required')
      return
    }

    if (Number(form.apartmentCount) > availableApartments) {
      alert(`Cannot assign ${form.apartmentCount} apartments. Only ${availableApartments} available.`)
      return
    }

    // Solo incluye _id si es edición
    const payload = {
      building: form.building,
      name: form.name,
      modelNumber: form.modelNumber,
      sqft: Number(form.sqft),
      bedrooms: Number(form.bedrooms),
      bathrooms: Number(form.bathrooms),
      apartmentCount: Number(form.apartmentCount),
      status: form.status,
    }
    if (selectedModel?._id) {
      payload._id = selectedModel._id
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
                {t('common:cancel', 'Cancelar')}

      </Button>
      <PrimaryButton onClick={handleSubmit} disabled={!isValid} startIcon={<ViewModule />}>
        {selectedModel ? t('buildings:updateModel', 'Actualizar Modelo') : t('buildings:createApartmentModel', 'Crear Modelo de Departamento')}
      </PrimaryButton>
    </>
  )

  return (
    <ModalWrapper
      open={open}
      onClose={onClose}
      icon={ViewModule}
      title={selectedModel ? t('buildings:editModel', 'Editar Modelo de Departamento') : t('buildings:newModel', 'Nuevo Modelo de Departamento')}
      subtitle={
        selectedModel
          ? t('buildings:editingModel', { name: selectedModel.name }, 'Editando {{name}}')
          : t('buildings:defineModel', 'Define las especificaciones del modelo de departamento')
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
        {t('buildings:modelInfo', 'Los modelos de departamento definen los tipos de unidades en este edificio (ej. Modelo A, B, C).')}
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
        <strong>{t('buildings:buildingTotal', 'Total Edificio')}:</strong> {buildingTotalApartments} {t('buildings:apartments', 'departamentos')} | 
        <strong> {t('buildings:assigned', 'Asignados')}:</strong> {assignedApartments} | 
        <strong> {t('buildings:available', 'Disponibles')}:</strong> {availableApartments}
      </Alert>

      <Grid container spacing={2} sx={{ mt: 0.5 }}>
        <Grid item xs={12} sm={8}>
          <TextField
            fullWidth
            required
            label={t('buildings:modelName', 'Nombre del Modelo')}
            value={form.name}
            onChange={e => handleChange('name', e.target.value)}
            helperText={t('buildings:modelNameHelp', 'Ej: Modelo A, Suite Deluxe')}
            sx={fieldSx}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            label={t('buildings:modelNumber', 'Número de Modelo')}
            value={form.modelNumber}
            onChange={e => handleChange('modelNumber', e.target.value)}
            helperText={t('buildings:modelNumberHelp', 'Ej: A, B, C')}
            sx={fieldSx}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            required
            type="number"
            label={t('buildings:sqft', 'm²')}
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
            label={t('buildings:beds', 'Recámaras')}
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
            label={t('buildings:baths', 'Baños')}
            inputProps={{ min: 0.5, step: 0.5 }}
            value={form.bathrooms}
            onChange={e => handleChange('bathrooms', e.target.value)}
            sx={fieldSx}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            required
            type="number"
            label={t('buildings:apartmentCount', 'Cantidad de Departamentos')}
            inputProps={{ min: 1, max: availableApartments }}
            value={form.apartmentCount}
            onChange={e => handleChange('apartmentCount', e.target.value)}
            helperText={t('buildings:availableUnits', { count: availableApartments }, 'Disponibles: {{count}} unidades')}
            error={Number(form.apartmentCount) > availableApartments}
            sx={fieldSx}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            select
            label={t('buildings:status', 'Estatus')}
            value={form.status}
            onChange={e => handleChange('status', e.target.value)}
            sx={fieldSx}
          >
            <MenuItem value="active">{t('buildings:active', 'Activo')}</MenuItem>
            <MenuItem value="inactive">{t('buildings:inactive', 'Inactivo')}</MenuItem>
          </TextField>
        </Grid>
      </Grid>
    </ModalWrapper>
  )
}

export default ApartmentModelDialog