import { useState, useEffect } from 'react'
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Box, Typography, Button, Grid, Paper, IconButton, CircularProgress, Chip
} from '@mui/material'
import { CloudUpload, Close, Delete, Check } from '@mui/icons-material'
import uploadService from '../../services/uploadService'
import { useTranslation } from 'react-i18next'
import { Switch, FormControlLabel } from '@mui/material';


const EXTERIOR_AMENITIES = [
  "Dock, Boats & Jet Ski",
  "Visitors Parking",
  "Dog Park",
  "Pickleball Courts",
  "Semi-Olimpic Pool",
  "Grills",
  "Sunset Place",
  "Lake Park",
  "Viewpoint",
  "Access",
  "Maintenance Area"
]

const OutdoorAmenitiesModal = ({
  open,
  onClose,
  amenitiesList = [], // [{ name, images }]
  onUploaded
}) => {
  const { t } = useTranslation(['masterPlan'])
  // Estado para amenidad seleccionada
  const [selectedAmenity, setSelectedAmenity] = useState('')
  // Estado para archivos seleccionados por amenidad
  const [selectedFiles, setSelectedFiles] = useState(
    EXTERIOR_AMENITIES.reduce((acc, name) => ({ ...acc, [name]: [] }), {})
  )
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    if (open) {
      setSelectedAmenity('')
    }
  }, [open])

  // Seleccionar archivos para la amenidad actual
  // Al seleccionar archivos:
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(prev => ({
      ...prev,
      [selectedAmenity]: [
        ...prev[selectedAmenity],
        ...files.map(file => ({ file, isPublic: true })) // Por defecto públicas
      ]
    }));
  };

  // Remover archivo seleccionado
  const handleRemoveSelectedFile = (amenity, idx) => {
    setSelectedFiles(prev => ({
      ...prev,
      [amenity]: prev[amenity].filter((_, i) => i !== idx)
    }))
  }

  // Subir todas las imágenes seleccionadas para todas las amenidades
const handleUpload = async () => {
  console.log('[OutdoorAmenitiesModal] handleUpload called');
  console.log('selectedFiles:', selectedFiles);
  setUploading(true);
  try {
    const uploadPromises = [];
    EXTERIOR_AMENITIES.forEach(name => {
      if (selectedFiles[name].length > 0) {
        const existing = amenitiesList.find(a => a.name === name);
        // Subir todas las imágenes de la amenidad con su isPublic
        uploadPromises.push(
          uploadService.uploadOutdoorAmenityImages(selectedFiles[name], name)
            .then(uploadedImages => {
              // Filtrar solo imágenes que tengan url
              const filteredImages = (uploadedImages || []).filter(img => img.url);
              if (filteredImages.length === 0) return null; // No guardar si no hay imágenes válidas

              console.log('✅ Images to save:', filteredImages);

              if (existing) {
                return uploadService.saveOutdoorAmenityImages({ id: existing.id, name, images: filteredImages });
              } else {
                return uploadService.saveOutdoorAmenityImages({ name, images: filteredImages });
              }
            })
        );
      }
    });
    await Promise.all(uploadPromises);
    setSelectedFiles(EXTERIOR_AMENITIES.reduce((acc, name) => ({ ...acc, [name]: [] }), {}));
    if (onUploaded) onUploaded();
    onClose();
  } catch (err) {
    console.error('[OutdoorAmenitiesModal] Error uploading:', err);
  } finally {
    setUploading(false);
  }
};

  // Imágenes existentes para la amenidad seleccionada
  const currentImages = amenitiesList.find(a => a.name === selectedAmenity)?.images || []
  // Archivos seleccionados para la amenidad seleccionada
  const currentSelectedFiles = selectedFiles[selectedAmenity] || []

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography fontWeight={700}>{t('manageOutdoorAmenities')}</Typography>
          <IconButton onClick={onClose}><Close /></IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Typography variant="subtitle2" fontWeight={700} mb={1.5} sx={{ color: '#333F1F', fontFamily: '"Poppins", sans-serif' }}>
          {t('selectAmenity')}
        </Typography>
        <Box display="flex" flexWrap="wrap" gap={1} mb={2}>
          {EXTERIOR_AMENITIES.map(name => {
            const count =
              (amenitiesList.find(a => a.name === name)?.images.length || 0) +
              (selectedFiles[name]?.length || 0)
            return (
              <Chip
                key={name}
                label={
                  <Box display="flex" alignItems="center" gap={0.5}>
                    {t(`exteriorAmenities.${name}`, name)}
                    {count > 0 && (
                      <Box
                        component="span"
                        sx={{
                          ml: 0.5,
                          px: 0.8,
                          py: 0.2,
                          bgcolor: selectedAmenity === name ? 'rgba(255,255,255,0.3)' : '#8CA551',
                          color: 'white',
                          borderRadius: 1,
                          fontSize: '0.7rem',
                          fontWeight: 700
                        }}
                      >
                        {count}
                      </Box>
                    )}
                  </Box>
                }
                onClick={() => setSelectedAmenity(name)}
                sx={{
                  bgcolor: selectedAmenity === name ? '#8CA551' : 'rgba(140, 165, 81, 0.1)',
                  color: selectedAmenity === name ? 'white' : '#333F1F',
                  fontWeight: 600,
                  fontFamily: '"Poppins", sans-serif',
                  cursor: 'pointer',
                  '&:hover': {
                    bgcolor: selectedAmenity === name ? '#8CA551' : 'rgba(140, 165, 81, 0.2)'
                  }
                }}
              />
            )
          })}
        </Box>
        <Box mb={2}>
          <Button
            variant="contained"
            component="label"
            startIcon={<CloudUpload />}
            disabled={uploading}
          >
                        {t('selectImages')}

            <input
              type="file"
              hidden
              multiple
              accept="image/*"
              onChange={handleFileSelect}
            />
          </Button>
        </Box>
        <Grid container spacing={2}>
          {currentSelectedFiles.map((item, idx) => (
            <Grid item xs={6} key={idx}>
              <Paper sx={{ position: 'relative', borderRadius: 2 }}>
                {/* Switch isPublic en la esquina superior derecha */}
                <Box sx={{ position: 'absolute', top: 8, right: 40, zIndex: 2 }}>
                  <Switch
                    checked={!!item.isPublic}
                    onChange={e => {
                      setSelectedFiles(prev => ({
                        ...prev,
                        [selectedAmenity]: prev[selectedAmenity].map((f, i) =>
                          i === idx ? { ...f, isPublic: e.target.checked } : f
                        )
                      }));
                      console.log(`[OutdoorAmenitiesModal] Amenity "${selectedAmenity}" file ${idx} isPublic:`, e.target.checked);
                    }}
                    color="success"
                    size="small"
                  />
                </Box>
                {/* Imagen preview */}
                <Box
                  component="img"
                  src={URL.createObjectURL(item.file)}
                  alt={`Preview ${idx + 1}`}
                  sx={{ width: '100%', height: 120, objectFit: 'cover' }}
                />
                {/* Botón eliminar */}
                <IconButton
                  size="small"
                  onClick={() => handleRemoveSelectedFile(selectedAmenity, idx)}
                  sx={{
                    position: 'absolute', top: 8, right: 8, bgcolor: 'rgba(255,255,255,0.8)'
                  }}
                >
                  <Delete fontSize="small" />
                </IconButton>
              </Paper>
            </Grid>
          ))}
        </Grid>
        <Box mt={2}>
          <Typography variant="subtitle2" fontWeight={700}>Uploaded Images</Typography>
          <Grid container spacing={2}>
            {currentImages.map((url, idx) => (
              <Grid item xs={6} key={idx}>
                <Paper sx={{ borderRadius: 2 }}>
                  <Box
                    component="img"
                    src={url}
                    alt={`Amenity ${idx + 1}`}
                    sx={{ width: '100%', height: 120, objectFit: 'cover' }}
                  />
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t('common:close')}</Button>
        <Button
          variant="contained"
          onClick={handleUpload}
          disabled={
            EXTERIOR_AMENITIES.every(name => selectedFiles[name].length === 0) || uploading
          }
          startIcon={uploading ? <CircularProgress size={20} /> : <Check />}
        >
          {uploading ? t('uploading') : t('uploadAll')}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default OutdoorAmenitiesModal