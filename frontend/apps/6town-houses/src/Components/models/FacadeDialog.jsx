// @/Users/oficina/MV-CRM/CustomerService/frontend/apps/6town-houses/src/Components/models/FacadeDialog.jsx

import { useState, useEffect } from 'react'
import { TextField, Alert, Box, Button, CircularProgress, Typography } from '@mui/material'
import { Palette, CloudUpload, Delete } from '@mui/icons-material'
import { useTheme } from '@mui/material/styles'
import ModalWrapper from '@shared/constants/ModalWrapper'
import uploadService from '@shared/services/uploadService'

const DEFAULT_FORM = {
  title: '',
  price: '',
  imageFile: null,
  imageUrl: ''
}

const FacadeDialog = ({ open, onClose, selectedModel, selectedFacade, onSubmit, projectId }) => {
  const theme = useTheme()
  const [form, setForm] = useState(DEFAULT_FORM)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState(null)

  useEffect(() => {
    if (open) {
      if (selectedFacade) {
        const existingUrl = Array.isArray(selectedFacade.url) ? selectedFacade.url[0] : selectedFacade.url || ''
        setForm({
          title: selectedFacade.title || '',
          price: selectedFacade.price || '',
          imageFile: null,
          imageUrl: existingUrl
        })
        setPreviewUrl(existingUrl)
      } else {
        setForm(DEFAULT_FORM)
        setPreviewUrl(null)
      }
    }
  }, [selectedFacade, open])

  const handleChange = (field, value) => setForm(prev => ({ ...prev, [field]: value }))

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validar que sea imagen
      if (!file.type.startsWith('image/')) {
        alert('Por favor selecciona un archivo de imagen válido')
        return
      }

      // Crear preview local
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewUrl(reader.result)
      }
      reader.readAsDataURL(file)

      setForm(prev => ({ ...prev, imageFile: file }))
    }
  }

  const handleRemoveImage = () => {
    setForm(prev => ({ ...prev, imageFile: null, imageUrl: '' }))
    setPreviewUrl(null)
  }

  const isValid = form.title.trim().length > 0 && form.price >= 0

  const handleSave = async () => {
    if (!isValid || !selectedModel) return
 
    try {
      setSaving(true)
      setUploading(true)
 
      let finalUrl = form.imageUrl
 
      if (form.imageFile) {
        console.log('📤 Subiendo imagen de fachada...')
        finalUrl = await uploadService.uploadFacadeImage(form.imageFile)
        console.log('✅ Imagen subida:', finalUrl)
      }
 
      const facadeData = {
        projectId,           // ✅ Agregar projectId
        model: selectedModel._id,
        title: form.title,
        price: Number(form.price),
        url: finalUrl ? [finalUrl] : []
      }
 
      await onSubmit(facadeData)
    } catch (err) {
      console.error('Error saving facade:', err)
      alert(`Error al guardar: ${err.message}`)
    } finally {
      setSaving(false)
      setUploading(false)
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
      icon={Palette}
      title={selectedFacade ? 'Editar Fachada' : 'Nueva Fachada'}
      subtitle={`${selectedModel?.model || 'Modelo'} - ${selectedFacade ? `Editando ${selectedFacade.title}` : 'Agregar fachada'}`}
      maxWidth="sm"
      actions={
        <>
          <button onClick={onClose} disabled={saving}>Cancelar</button>
          <button onClick={handleSave} disabled={!isValid || saving}>
            {uploading ? 'Subiendo imagen...' : saving ? 'Guardando...' : 'Guardar'}
          </button>
        </>
      }
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Alert severity="info" sx={{ borderRadius: 2 }}>
          Las fachadas son variaciones visuales del modelo con diferentes precios
        </Alert>

        <TextField
          label="Nombre de Fachada"
          value={form.title}
          onChange={(e) => handleChange('title', e.target.value)}
          placeholder="Ej: Fachada Moderna, Fachada Clásica"
          fullWidth
          required
          sx={fieldSx}
        />

        <TextField
          label="Precio"
          type="number"
          value={form.price}
          onChange={(e) => handleChange('price', e.target.value)}
          placeholder="15000"
          fullWidth
          required
          sx={fieldSx}
          InputProps={{
            startAdornment: <Box sx={{ mr: 1, color: 'text.secondary' }}>$</Box>
          }}
        />

        {/* Upload de imagen */}
        <Box>
          <Typography variant="body2" fontWeight={600} mb={1} sx={{ fontFamily: '"Poppins", sans-serif' }}>
            Imagen de Fachada
          </Typography>
          
          {previewUrl ? (
            <Box sx={{ position: 'relative', borderRadius: 3, overflow: 'hidden', border: '2px solid #e0e0e0' }}>
              <Box
                component="img"
                src={previewUrl}
                alt="Preview"
                sx={{
                  width: '100%',
                  height: 200,
                  objectFit: 'cover',
                  display: 'block'
                }}
              />
              <Button
                variant="contained"
                color="error"
                size="small"
                startIcon={<Delete />}
                onClick={handleRemoveImage}
                sx={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  borderRadius: 2,
                  textTransform: 'none'
                }}
              >
                Eliminar
              </Button>
            </Box>
          ) : (
            <Button
              variant="outlined"
              component="label"
              fullWidth
              startIcon={uploading ? <CircularProgress size={20} /> : <CloudUpload />}
              disabled={uploading}
              sx={{
                py: 2,
                borderRadius: 3,
                borderStyle: 'dashed',
                borderWidth: 2,
                textTransform: 'none',
                fontFamily: '"Poppins", sans-serif',
                '&:hover': {
                  borderWidth: 2,
                  borderStyle: 'dashed'
                }
              }}
            >
              {uploading ? 'Subiendo...' : 'Seleccionar Imagen'}
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={handleFileSelect}
                disabled={uploading}
              />
            </Button>
          )}
          
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            Se subirá a la carpeta: <strong>facades/</strong>
          </Typography>
        </Box>
      </Box>
    </ModalWrapper>
  )
}

export default FacadeDialog