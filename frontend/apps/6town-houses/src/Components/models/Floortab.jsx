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
  const [selectedOption, setSelectedOption] = useState(floor?.options?.[0]?.key || null)
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

  const currentOption = floor.options?.find(opt => opt.key === selectedOption)
  const mediaToShow = currentOption?.media || floor.media || { renders: [], isometrics: [], blueprints: [] }

  const handleFileUpload = async (e, mediaType) => {
    const files = Array.from(e.target.files)
    if (files.length === 0) return

    try {
      setUploading(true)
      const uploadPromises = files.map(file => uploadService.uploadModelImage(file, `floors/${floor.key}/${mediaType}`))
      const urls = await Promise.all(uploadPromises)
      
      const newMedia = {
        ...mediaToShow,
        [mediaType]: [...(mediaToShow[mediaType] || []), ...urls.map(url => ({ url, isPublic: true }))]
      }

      if (currentOption) {
        onChange(floor.key, 'optionMedia', { optionKey: selectedOption, media: newMedia })
      } else {
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
      onChange(floor.key, 'optionMedia', { optionKey: selectedOption, media: newMedia })
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
              borderRadius: 3,
              bgcolor: '#fafafa'
            }}
          >
            <Icon sx={{ fontSize: 48, color: '#bdbdbd', mb: 1 }} />
            <Typography variant="body2" color="text.secondary">
              {editMode ? 'Sube imágenes para este tipo de media' : 'No hay imágenes disponibles'}
            </Typography>
          </Box>
        ) : (
          <ImageList cols={3} gap={12}>
            {images.map((img, index) => (
              <ImageListItem key={index} sx={{ borderRadius: 2, overflow: 'hidden' }}>
                <img
                  src={img.url}
                  alt={`${title} ${index + 1}`}
                  loading="lazy"
                  style={{ height: 180, objectFit: 'cover' }}
                />
                {editMode && (
                  <ImageListItemBar
                    actionIcon={
                      <Tooltip title="Eliminar">
                        <IconButton
                          sx={{ color: 'white' }}
                          onClick={() => handleDeleteImage(mediaType, index)}
                        >
                          <Delete />
                        </IconButton>
                      </Tooltip>
                    }
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
    <Box sx={{ p: 4 }}>
      <Box mb={3}>
        <Typography variant="h5" fontWeight={700} gutterBottom sx={{ fontFamily: '"Poppins", sans-serif' }}>
          {floor.label}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ fontFamily: '"Poppins", sans-serif' }}>
          Nivel {floor.level} • {floor.isCustomizable ? 'Personalizable' : 'Estándar'}
        </Typography>
      </Box>

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
                <MenuItem key={option.key} value={option.key}>
                  <Box display="flex" justifyContent="space-between" width="100%">
                    <span>{option.label}</span>
                    <Chip
                      label="Incluido"
                      size="small"
                      color="default"
                      sx={{ ml: 2 }}
                    />
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <MediaSection
            title="Renders"
            mediaType="renders"
            icon={ImageIcon}
            color={theme.palette.primary.main}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <MediaSection
            title="Isométricos"
            mediaType="isometrics"
            icon={ViewInAr}
            color={theme.palette.secondary.main}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <MediaSection
            title="Planos"
            mediaType="blueprints"
            icon={Layers}
            color={theme.palette.info.main}
          />
        </Grid>
      </Grid>
    </Box>
  )
}

export default FloorTab