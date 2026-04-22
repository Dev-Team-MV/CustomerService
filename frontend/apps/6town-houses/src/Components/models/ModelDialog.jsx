// @/Users/oficina/MV-CRM/CustomerService/frontend/apps/6town-houses/src/Components/models/ModelDialog.jsx

import { useState, useEffect } from 'react'
import { TextField, Grid, Alert, Box } from '@mui/material'
import { Home } from '@mui/icons-material'
import { useTheme } from '@mui/material/styles'
import ModalWrapper from '@shared/constants/ModalWrapper'
import modelService from '@shared/services/modelService'

const DEFAULT_FORM = {
  model: '',
  modelNumber: '',
  price: '',
  bedrooms: '',
  bathrooms: '',
  sqft: '',
  stories: '4'
}

const ModelDialog = ({ open, onClose, selectedModel, onSubmit, projectId }) => {
  const theme = useTheme()
  const [form, setForm] = useState(DEFAULT_FORM)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open) {
      if (selectedModel) {
        setForm({
          model: selectedModel.model || '',
          modelNumber: selectedModel.modelNumber || '',
          price: selectedModel.price || '',
          bedrooms: selectedModel.bedrooms || '',
          bathrooms: selectedModel.bathrooms || '',
          sqft: selectedModel.sqft || '',
          stories: selectedModel.stories || '4'
        })
      } else {
        setForm(DEFAULT_FORM)
      }
    }
  }, [selectedModel, open])

  const handleChange = (field, value) => setForm(prev => ({ ...prev, [field]: value }))

  const isValid = form.model.trim().length > 0 && form.price > 0

  const handleSave = async () => {
    if (!isValid) return

    try {
      setSaving(true)
      const modelData = {
        projectId,
        model: form.model,
        modelNumber: form.modelNumber,
        price: Number(form.price),
        bedrooms: Number(form.bedrooms) || 0,
        bathrooms: Number(form.bathrooms) || 0,
        sqft: Number(form.sqft) || 0,
        stories: Number(form.stories) || 4,
        status: 'active'
      }

      await onSubmit(modelData)
    } catch (err) {
      console.error('Error saving model:', err)
    } finally {
      setSaving(false)
    }
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

  return (
    <ModalWrapper
      open={open}
      onClose={onClose}
      icon={Home}
      title={selectedModel ? 'Editar Modelo' : 'Nuevo Modelo'}
      subtitle={selectedModel ? `Editando ${selectedModel.model}` : 'Crea un nuevo modelo de casa'}
      maxWidth="md"
      actions={
        <>
          <button onClick={onClose} disabled={saving}>Cancelar</button>
          <button onClick={handleSave} disabled={!isValid || saving}>
            {saving ? 'Guardando...' : 'Guardar'}
          </button>
        </>
      }
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Alert severity="info" sx={{ borderRadius: 2 }}>
          Define las características base del modelo de casa
        </Alert>

        <Grid container spacing={2}>
          <Grid item xs={12} sm={8}>
            <TextField
              label="Nombre del Modelo"
              value={form.model}
              onChange={(e) => handleChange('model', e.target.value)}
              placeholder="Ej: Modelo Base, Casa Estándar"
              fullWidth
              required
              sx={fieldSx}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              label="Número"
              value={form.modelNumber}
              onChange={(e) => handleChange('modelNumber', e.target.value)}
              placeholder="M1"
              fullWidth
              sx={fieldSx}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              label="Precio Base"
              type="number"
              value={form.price}
              onChange={(e) => handleChange('price', e.target.value)}
              placeholder="280000"
              fullWidth
              required
              sx={fieldSx}
              InputProps={{
                startAdornment: <Box sx={{ mr: 1, color: 'text.secondary' }}>$</Box>
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Área (ft²)"
              type="number"
              value={form.sqft}
              onChange={(e) => handleChange('sqft', e.target.value)}
              placeholder="1800"
              fullWidth
              sx={fieldSx}
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <TextField
              label="Habitaciones"
              type="number"
              value={form.bedrooms}
              onChange={(e) => handleChange('bedrooms', e.target.value)}
              placeholder="3"
              fullWidth
              sx={fieldSx}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              label="Baños"
              type="number"
              value={form.bathrooms}
              onChange={(e) => handleChange('bathrooms', e.target.value)}
              placeholder="3"
              fullWidth
              sx={fieldSx}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              label="Pisos"
              type="number"
              value={form.stories}
              onChange={(e) => handleChange('stories', e.target.value)}
              placeholder="4"
              fullWidth
              sx={fieldSx}
            />
          </Grid>
        </Grid>
      </Box>
    </ModalWrapper>
  )
}

export default ModelDialog