// @/Users/oficina/MV-CRM/CustomerService/frontend/apps/6town-houses/src/Components/models/FloorTab.jsx

import { useState } from 'react'
import {
  Box, Grid, Typography, Paper, Button, IconButton, Chip,
  Select, MenuItem, FormControl, InputLabel, ImageList, ImageListItem,
  ImageListItemBar, Tooltip, CircularProgress
} from '@mui/material'
import {
  CloudUpload, Delete, Image as ImageIcon, Layers, ViewInAr
} from '@mui/icons-material'
import { useTheme } from '@mui/material/styles'
import uploadService from '@shared/services/uploadService'

const FloorTab = ({ floor, editMode, onChange }) => {
  const theme = useTheme()
  const [selectedOption, setSelectedOption] = useState(floor?.options?.[0]?.id || null)
  const [uploading, setUploading] = useState(false)

  if (!floor) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="body1" color="text.secondary">
          No hay información disponible para este piso
        </Typography>
      </Box>
    )
  }

  const currentOption = floor.options?.find(opt => opt.id === selectedOption)
  const mediaToShow = currentOption?.media || floor.media || { renders: [], isometrics: [], floorPlans: [] }

  const handleFileUpload = async (e, mediaType) => {
    const files = Array.from(e.target.files)
    if (files.length === 0) return

    try {
      setUploading(true)
      const uploadPromises = files.map(file => uploadService.uploadModelImage(file, `floors/${floor.key}/${mediaType}`))
      const urls = await Promise.all(uploadPromises)
      
      // Actualizar media del piso o de la opción
      const newMedia = {
        ...mediaToShow,
        [mediaType]: [...(mediaToShow[mediaType] || []), ...urls.map(url => ({ url, isPublic: true }))]
      }

      if (currentOption) {
        // Actualizar media de la opción
        onChange(floor.key, 'optionMedia', { optionId: selectedOption, media: newMedia })
      } else {
        // Actualizar media del piso
        onChange(floor.key, 'media', newMedia)
      }
    } catch (err) {
      console.error('Error uploading files:', err)
      alert(`Error al subir archivos: ${err.message}`)
    } finally {
      setUploading(false)
    }
  }

  const handleDeleteImage = (mediaType, index) => {
    const newMedia = {
      ...mediaToShow,
      [mediaType]: mediaToShow[mediaType].filter((_, i) => i !== index)
    }

    if (currentOption) {
      onChange(floor.key, 'optionMedia', { optionId: selectedOption, media: newMedia })
    } else {
      onChange(floor.key, 'media', newMedia)
    }
  }

  const MediaSection = ({ title, mediaType, icon: Icon, color }) => {
    const images = mediaToShow[mediaType] || []

    return (
      <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #e0e0e0' }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Box display="flex" alignItems="center" gap={1}>
            <Icon sx={{ color }} />
            <Typography variant="h6" fontWeight={600} sx={{ fontFamily: '"Poppins", sans-serif' }}>
              {title}
            </Typography>
            <Chip label={images.length} size="small" sx={{ bgcolor: `${color}20`, color }} />
          </Box>

          {editMode && (
            <Button
              variant="outlined"
              component="label"
              size="small"
              startIcon={uploading ? <CircularProgress size={16} /> : <CloudUpload />}
              disabled={uploading}
              sx={{ textTransform: 'none', borderRadius: 2 }}
            >
              Subir
              <input
                type="file"
                hidden
                multiple
                accept="image/*"
                onChange={(e) => handleFileUpload(e, mediaType)}
                disabled={uploading}
              />
            </Button>
          )}
        </Box>

        {images.length === 0 ? (
          <Box
            sx={{
              p: 4,
              textAlign: 'center',
              border: '2px dashed #e0e0e0',
              borderRadius: 2,
              bgcolor: '#fafafa'
            }}
          >
            <Icon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
            <Typography variant="body2" color="text.secondary">
              No hay {title.toLowerCase()} cargadas
            </Typography>
          </Box>
        ) : (
          <ImageList cols={3} gap={12}>
            {images.map((img, index) => (
              <ImageListItem key={index}>
                <img
                  src={img.url || img}
                  alt={`${title} ${index + 1}`}
                  loading="lazy"
                  style={{ borderRadius: 8, height: 180, objectFit: 'cover' }}
                />
                {editMode && (
                  <ImageListItemBar
                    actionIcon={
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteImage(mediaType, index)}
                        sx={{ color: 'white' }}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    }
                    sx={{ borderRadius: '0 0 8px 8px' }}
                  />
                )}
              </ImageListItem>
            ))}
          </ImageList>
        )}
      </Paper>
    )
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header del piso */}
      <Box mb={3}>
        <Typography variant="h5" fontWeight={700} gutterBottom sx={{ fontFamily: '"Poppins", sans-serif' }}>
          {floor.label}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ fontFamily: '"Poppins", sans-serif' }}>
          Nivel {floor.level} • {floor.isCustomizable ? 'Personalizable' : 'Estándar'}
        </Typography>
      </Box>

      {/* Selector de opciones (si es customizable) */}
      {floor.isCustomizable && floor.options?.length > 0 && (
        <Box mb={3}>
          <FormControl fullWidth sx={{ maxWidth: 400 }}>
            <InputLabel>Opción de Configuración</InputLabel>
            <Select
              value={selectedOption}
              onChange={(e) => setSelectedOption(e.target.value)}
              label="Opción de Configuración"
              sx={{ borderRadius: 3 }}
            >
              {floor.options.map((option) => (
                <MenuItem key={option.id} value={option.id}>
                  <Box display="flex" justifyContent="space-between" width="100%">
                    <span>{option.name}</span>
                    <Chip
                      label={option.price > 0 ? `+$${option.price.toLocaleString()}` : 'Incluido'}
                      size="small"
                      color={option.price > 0 ? 'primary' : 'default'}
                      sx={{ ml: 2 }}
                    />
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {currentOption && (
            <Paper elevation={0} sx={{ p: 2, mt: 2, bgcolor: `${theme.palette.primary.main}08`, borderRadius: 2 }}>
              <Typography variant="body2" fontWeight={600} sx={{ fontFamily: '"Poppins", sans-serif' }}>
                {currentOption.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {currentOption.price > 0 ? `Costo adicional: $${currentOption.price.toLocaleString()}` : 'Sin costo adicional'}
              </Typography>
            </Paper>
          )}
        </Box>
      )}

      {/* Media Sections */}
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <MediaSection
            title="Renders"
            mediaType="renders"
            icon={ImageIcon}
            color={theme.palette.primary.main}
          />
        </Grid>

        <Grid item xs={12}>
          <MediaSection
            title="Isométricos"
            mediaType="isometrics"
            icon={ViewInAr}
            color={theme.palette.secondary.main}
          />
        </Grid>

        <Grid item xs={12}>
          <MediaSection
            title="Planos"
            mediaType="floorPlans"
            icon={Layers}
            color={theme.palette.info.main}
          />
        </Grid>
      </Grid>
    </Box>
  )
}

export default FloorTab