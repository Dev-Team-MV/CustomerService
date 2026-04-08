// OutdoorAmenitiesModal.jsx (Phase 2) - reemplazar todo el contenido

import { useState, useEffect } from 'react'
import { Box, Typography, Grid, CircularProgress, Chip } from '@mui/material'
import { CloudUpload, Check } from '@mui/icons-material'
import { useTheme } from '@mui/material/styles'
import { useTranslation } from 'react-i18next'
import uploadService from '../../../Services/uploadService'
import { OUTDOOR_AMENITIES } from '../../../Constants/amenities'
import ImagePreview from '@shared/components/ImgPreview'
import ModalWrapper from '@shared/constants/ModalWrapper'
import PrimaryButton from '@shared/constants/PrimaryButton'

const OutdoorAmenitiesModal = ({
  open,
  onClose,
  projectId,
  amenitySections = [],
  onUploaded
}) => {
  const theme = useTheme()
  const { t } = useTranslation(['amenities', 'common'])

  const [selectedAmenity, setSelectedAmenity] = useState('')
  const [selectedFiles, setSelectedFiles] = useState(
    OUTDOOR_AMENITIES.reduce((acc, amenity) => ({ ...acc, [amenity.key]: [] }), {})
  )
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    if (open) setSelectedAmenity('')
  }, [open])

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files)
    setSelectedFiles(prev => ({
      ...prev,
      [selectedAmenity]: [
        ...prev[selectedAmenity],
        ...files.map(file => ({ file, isPublic: false }))
      ]
    }))
  }

  const handleRemoveSelectedFile = (amenityKey, idx) => {
    setSelectedFiles(prev => ({
      ...prev,
      [amenityKey]: prev[amenityKey].filter((_, i) => i !== idx)
    }))
  }

  const handleToggleSelectedFileVisibility = (amenityKey, idx, checked) => {
    setSelectedFiles(prev => ({
      ...prev,
      [amenityKey]: prev[amenityKey].map((f, i) =>
        i === idx ? { ...f, isPublic: checked } : f
      )
    }))
  }

  const handleUpload = async () => {
    setUploading(true)
    try {
      const updatedSections = [...amenitySections]
      for (const amenity of OUTDOOR_AMENITIES) {
        const key = amenity.key
        if (selectedFiles[key].length > 0) {
          const uploadedImages = await uploadService.uploadOutdoorAmenityImages(selectedFiles[key], key)
          const existingSection = updatedSections.find(s => s.key === key)
          if (existingSection) {
            existingSection.images = [...(existingSection.images || []), ...uploadedImages]
          } else {
            updatedSections.push({ key, images: uploadedImages })
          }
        }
      }
      await uploadService.saveOutdoorAmenities(projectId, updatedSections)
      setSelectedFiles(OUTDOOR_AMENITIES.reduce((acc, amenity) => ({ ...acc, [amenity.key]: [] }), {}))
      if (onUploaded) onUploaded()
      onClose()
    } catch (err) {
      console.error('[OutdoorAmenitiesModal] Error uploading:', err)
    } finally {
      setUploading(false)
    }
  }

  const handleToggleUploadedImageVisibility = async (amenityKey, imgIdx, newValue) => {
    try {
      const updatedSections = amenitySections.map(section =>
        section.key === amenityKey
          ? { ...section, images: section.images.map((img, idx) => idx === imgIdx ? { ...img, isPublic: newValue } : img) }
          : section
      )
      await uploadService.saveOutdoorAmenities(projectId, updatedSections)
      if (onUploaded) onUploaded()
    } catch (err) {
      console.error('Error updating image visibility:', err)
    }
  }

  const handleDeleteUploadedImage = async (amenityKey, imgIdx) => {
    try {
      const updatedSections = amenitySections.map(section =>
        section.key === amenityKey
          ? { ...section, images: section.images.filter((_, i) => i !== imgIdx) }
          : section
      )
      await uploadService.saveOutdoorAmenities(projectId, updatedSections)
      if (onUploaded) onUploaded()
    } catch (err) {
      console.error('[OutdoorAmenitiesModal] Error deleting uploaded image:', err)
    }
  }

  const currentSection = amenitySections.find(s => s.key === selectedAmenity)
  const currentImages = currentSection?.images || []
  const currentSelectedFiles = selectedFiles[selectedAmenity] || []

  return (
    <ModalWrapper
      open={open}
      onClose={onClose}
      icon={CloudUpload}
      title={t('amenities:manageOutdoor', 'Gestionar Amenidades Exteriores')}
      maxWidth="md"
      fullWidth
      actions={
        <>
          <PrimaryButton variant="outlined" color="secondary" onClick={onClose}>
            {t('common:close')}
          </PrimaryButton>
          <PrimaryButton
            variant="contained"
            color="primary"
            onClick={handleUpload}
            disabled={OUTDOOR_AMENITIES.every(a => selectedFiles[a.key].length === 0) || uploading}
            startIcon={uploading ? <CircularProgress size={20} /> : <Check />}
          >
            {uploading ? t('common:uploading', 'Subiendo...') : t('common:uploadAll', 'Subir Todo')}
          </PrimaryButton>
        </>
      }
    >
      <Typography variant="subtitle2" fontWeight={700} mb={1.5}>
        {t('amenities:selectAmenity', 'Selecciona una amenidad')}
      </Typography>

      <Box display="flex" flexWrap="wrap" gap={1} mb={3}>
        {OUTDOOR_AMENITIES.map(amenity => {
          const section = amenitySections.find(s => s.key === amenity.key)
          const count = (section?.images?.length || 0) + (selectedFiles[amenity.key]?.length || 0)
          const isSelected = selectedAmenity === amenity.key

          return (
            <Chip
              key={amenity.key}
              label={
                <Box display="flex" alignItems="center" gap={0.5}>
                  {t(`amenities:amenityNames.${amenity.name}`, amenity.name)}
                  {count > 0 && (
                    <Box component="span" sx={{
                      ml: 0.5, px: 0.8, py: 0.2,
                      bgcolor: isSelected ? 'rgba(255,255,255,0.3)' : theme.palette.secondary.main,
                      color: 'white', borderRadius: 1, fontSize: '0.7rem', fontWeight: 700
                    }}>
                      {count}
                    </Box>
                  )}
                </Box>
              }
              onClick={() => setSelectedAmenity(amenity.key)}
              sx={{
                bgcolor: isSelected ? theme.palette.primary.main : `rgba(26,35,126,0.08)`,
                color: isSelected ? 'white' : theme.palette.primary.main,
                fontWeight: 600,
                border: `1px solid ${isSelected ? theme.palette.primary.main : 'rgba(26,35,126,0.2)'}`,
                cursor: 'pointer',
                '&:hover': {
                  bgcolor: isSelected ? theme.palette.primary.dark : 'rgba(26,35,126,0.14)'
                }
              }}
            />
          )
        })}
      </Box>

      {selectedAmenity && (
        <>
          <Box mb={2}>
            <PrimaryButton
              variant="contained"
              color="primary"
              component="label"
              startIcon={<CloudUpload />}
              disabled={uploading}
            >
              {t('amenities:selectImages', 'Seleccionar Imágenes')}
              <input type="file" hidden multiple accept="image/*" onChange={handleFileSelect} />
            </PrimaryButton>
          </Box>

          {currentSelectedFiles.length > 0 && (
            <>
              <Typography variant="subtitle2" fontWeight={700} mb={1}>
                {t('amenities:newImages', 'Nuevas Imágenes')} ({currentSelectedFiles.length})
              </Typography>
              <Grid container spacing={2} mb={3}>
                {currentSelectedFiles.map((item, idx) => (
                  <Grid item xs={6} sm={4} key={idx}>
                    <ImagePreview
                      src={URL.createObjectURL(item.file)}
                      alt={`Preview ${idx + 1}`}
                      isPublic={!!item.isPublic}
                      onTogglePublic={checked => handleToggleSelectedFileVisibility(selectedAmenity, idx, checked)}
                      onDelete={() => handleRemoveSelectedFile(selectedAmenity, idx)}
                      showVisibilityChip={true}
                      label={t('common:new')}
                      publicLabel={t('common:public')}
                      privateLabel={t('common:private')}
                      noImageLabel={t('common:noImage')}
                      imgSx={{ height: 150 }}
                    />
                  </Grid>
                ))}
              </Grid>
            </>
          )}

          {currentImages.length > 0 && (
            <>
              <Typography variant="subtitle2" fontWeight={700} mb={1}>
                {t('amenities:uploadedImages', 'Imágenes Subidas')} ({currentImages.length})
              </Typography>
              <Grid container spacing={2}>
                {currentImages.map((img, idx) => (
                  <Grid item xs={6} sm={4} key={idx}>
                    <ImagePreview
                      src={typeof img === 'string' ? img : img.url}
                      alt={`Amenity ${idx + 1}`}
                      isPublic={!!img.isPublic}
                      onTogglePublic={checked => handleToggleUploadedImageVisibility(selectedAmenity, idx, checked)}
                      onDelete={() => handleDeleteUploadedImage(selectedAmenity, idx)}
                      showVisibilityChip={true}
                      publicLabel={t('common:public')}
                      privateLabel={t('common:private')}
                      noImageLabel={t('common:noImage')}
                      imgSx={{ height: 150 }}
                    />
                  </Grid>
                ))}
              </Grid>
            </>
          )}
        </>
      )}
    </ModalWrapper>
  )
}

export default OutdoorAmenitiesModal