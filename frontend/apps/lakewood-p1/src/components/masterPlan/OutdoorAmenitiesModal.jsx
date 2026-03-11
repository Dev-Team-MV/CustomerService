import { useState, useEffect } from 'react'
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Box, Typography, Button, Grid, Paper, IconButton, CircularProgress, Chip
} from '@mui/material'
import { CloudUpload, Close, Delete, Check } from '@mui/icons-material'
import uploadService from '../../services/uploadService'
import { useTranslation } from 'react-i18next'
import { Switch, FormControlLabel } from '@mui/material';
import ImagePreview from '../../components/ImgPreview'; // Ajusta el path si es necesario
import PrimaryButton from '../../constants/PrimaryButton'
import ModalWrapper from '../../constants/ModalWrapper'

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
        ...files.map(file => ({ file, isPublic: false })) // Por defecto públicas
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
  setUploading(true);
  try {
    const uploadPromises = [];
    EXTERIOR_AMENITIES.forEach(name => {
      if (selectedFiles[name].length > 0) {
        const existing = amenitiesList.find(a => a.name === name);
        uploadPromises.push(
          uploadService.uploadOutdoorAmenityImages(selectedFiles[name], name)
            .then(uploadedImages => {
              const filteredImages = (uploadedImages || []).filter(img => img.url);
              if (filteredImages.length === 0) return null;

              // IMPORTANT: merge with existing images instead of replacing them
              if (existing) {
                const merged = [
                  // keep existing items (ensure they are objects with url/isPublic)
                  ...(Array.isArray(existing.images) ? existing.images : []),
                  // append newly uploaded images
                  ...filteredImages
                ];
                return uploadService.saveOutdoorAmenityImages({ id: existing.id, name, images: merged });
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

    const handleToggleUploadedImageVisibility = async (imgIdx, newValue) => {
    const amenity = amenitiesList.find(a => a.name === selectedAmenity);
    if (!amenity) return;
    try {
      // Actualiza solo el campo isPublic de la imagen en el array
      const updatedImages = amenity.images.map((img, idx) =>
        idx === imgIdx ? { ...img, isPublic: newValue } : img
      );
      await uploadService.updateOutdoorAmenityImages(amenity.id, { images: updatedImages });
      if (onUploaded) onUploaded();
    } catch (err) {
      console.error('Error updating image visibility:', err);
    }
  };

  // Eliminar una imagen ya subida (solo esa imagen) y persistir en backend
  const handleDeleteUploadedImage = async (imgIdx) => {
    const amenity = amenitiesList.find(a => a.name === selectedAmenity);
    if (!amenity) return;
    try {
      const updatedImages = (amenity.images || []).filter((_, i) => i !== imgIdx);
      // Ajusta la llamada si tu uploadService espera otro payload / método
      await uploadService.updateOutdoorAmenityImages(amenity.id, { images: updatedImages });
      if (typeof onUploaded === 'function') onUploaded(); // refrescar en el padre
    } catch (err) {
      console.error('[OutdoorAmenitiesModal] Error deleting uploaded image:', err);
    }
  };


return (
  <ModalWrapper
    open={open}
    onClose={onClose}
    icon={CloudUpload}
    title={t('manageOutdoorAmenities')}
    subtitle={t('selectAmenity')}
    actions={
      <>
        <PrimaryButton variant="outlined" color="secondary" onClick={onClose}>
          {t('common:close')}
        </PrimaryButton>
        <PrimaryButton
          variant="contained"
          color="primary"
          onClick={handleUpload}
          disabled={
            EXTERIOR_AMENITIES.every(name => selectedFiles[name].length === 0) || uploading
          }
          startIcon={uploading ? <CircularProgress size={20} /> : <Check />}
        >
          {uploading ? t('uploading') : t('uploadAll')}
        </PrimaryButton>
      </>
    }
    maxWidth="sm"
    fullWidth
  >
    <Typography variant="subtitle2" fontWeight={700} mb={1.5}>
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
      <PrimaryButton
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
      </PrimaryButton>
    </Box>
    <Grid container spacing={2}>
      {currentSelectedFiles.map((item, idx) => (
        <Grid item xs={6} key={idx}>
          <ImagePreview
            src={URL.createObjectURL(item.file)}
            alt={`Preview ${idx + 1}`}
            isPublic={!!item.isPublic}
            onTogglePublic={checked => {
              setSelectedFiles(prev => ({
                ...prev,
                [selectedAmenity]: prev[selectedAmenity].map((f, i) =>
                  i === idx ? { ...f, isPublic: checked } : f
                )
              }));
            }}
            onDelete={() => handleRemoveSelectedFile(selectedAmenity, idx)}
            showSwitch={true}
            switchPosition="top-right"
            label="NEW"
            sx={{ borderRadius: 2 }}
            imgSx={{ height: 120 }}
          />
        </Grid>
      ))}
    </Grid>
    <Box mt={2}>
      <Typography variant="subtitle2" fontWeight={700}>
        {t('uploadedImages')}
      </Typography>
      <Grid container spacing={2}>
        {currentImages.map((img, idx) => (
          <Grid item xs={6} key={idx}>
            <ImagePreview
              src={typeof img === 'string' ? img : img.url}
              alt={`Amenity ${idx + 1}`}
              isPublic={!!img.isPublic}
              onTogglePublic={checked => handleToggleUploadedImageVisibility(idx, checked)}
              onDelete={() => handleDeleteUploadedImage(idx)}
              showSwitch={true}
              switchPosition="top-right"
              sx={{ borderRadius: 2 }}
              imgSx={{ height: 120 }}
            />
          </Grid>
        ))}
      </Grid>
    </Box>
  </ModalWrapper>
)
}

export default OutdoorAmenitiesModal