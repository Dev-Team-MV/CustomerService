// @/Users/oficina/MV-CRM/CustomerService/frontend/apps/phase-2/src/Components/UI/Amenities/OutdoorAmenitiesModal.jsx

import { useState, useEffect } from 'react'
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Box, Typography, Button, Grid, IconButton, CircularProgress, Chip
} from '@mui/material'
import { CloudUpload, Close, Delete, Check } from '@mui/icons-material'
import uploadService from '../../../Services/uploadService'
import { OUTDOOR_AMENITIES } from '../../../Constants/amenities'

const OutdoorAmenitiesModal = ({
  open,
  onClose,
  projectId,
  amenitySections = [], // [{ key, images: [{ url, isPublic }] }]
  onUploaded
}) => {
  const [selectedAmenity, setSelectedAmenity] = useState('')
  const [selectedFiles, setSelectedFiles] = useState(
    OUTDOOR_AMENITIES.reduce((acc, amenity) => ({ ...acc, [amenity.key]: [] }), {})
  )
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    if (open) {
      setSelectedAmenity('')
    }
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
          const uploadedImages = await uploadService.uploadOutdoorAmenityImages(
            selectedFiles[key],
            key
          )

          const existingSection = updatedSections.find(s => s.key === key)
          if (existingSection) {
            existingSection.images = [
              ...(existingSection.images || []),
              ...uploadedImages
            ]
          } else {
            updatedSections.push({
              key,
              images: uploadedImages
            })
          }
        }
      }

      await uploadService.saveOutdoorAmenities(projectId, updatedSections)
      
      setSelectedFiles(
        OUTDOOR_AMENITIES.reduce((acc, amenity) => ({ ...acc, [amenity.key]: [] }), {})
      )
      
      if (onUploaded) onUploaded()
      onClose()
    } catch (err) {
      console.error('[OutdoorAmenitiesModal] Error uploading:', err)
      alert('Error al subir las imágenes. Por favor intenta de nuevo.')
    } finally {
      setUploading(false)
    }
  }

  const handleToggleUploadedImageVisibility = async (amenityKey, imgIdx, newValue) => {
    try {
      const updatedSections = amenitySections.map(section => {
        if (section.key === amenityKey) {
          return {
            ...section,
            images: section.images.map((img, idx) =>
              idx === imgIdx ? { ...img, isPublic: newValue } : img
            )
          }
        }
        return section
      })

      await uploadService.saveOutdoorAmenities(projectId, updatedSections)
      if (onUploaded) onUploaded()
    } catch (err) {
      console.error('Error updating image visibility:', err)
    }
  }

  const handleDeleteUploadedImage = async (amenityKey, imgIdx) => {
    try {
      const updatedSections = amenitySections.map(section => {
        if (section.key === amenityKey) {
          return {
            ...section,
            images: section.images.filter((_, i) => i !== imgIdx)
          }
        }
        return section
      })

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
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          fontFamily: '"Poppins", sans-serif'
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        borderBottom: '1px solid #e0e0e0',
        pb: 2
      }}>
        <Box display="flex" alignItems="center" gap={1}>
          <CloudUpload sx={{ color: '#8CA551' }} />
          <Typography variant="h6" sx={{ fontWeight: 700, fontFamily: '"Poppins", sans-serif' }}>
            Gestionar Amenidades Exteriores
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small">
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 3 }}>
        <Typography variant="subtitle2" fontWeight={700} mb={1.5}>
          Selecciona una amenidad
        </Typography>
        
        <Box display="flex" flexWrap="wrap" gap={1} mb={3}>
          {OUTDOOR_AMENITIES.map(amenity => {
            const section = amenitySections.find(s => s.key === amenity.key)
            const count = (section?.images?.length || 0) + (selectedFiles[amenity.key]?.length || 0)
            
            return (
              <Chip
                key={amenity.key}
                label={
                  <Box display="flex" alignItems="center" gap={0.5}>
                    {amenity.name}
                    {count > 0 && (
                      <Box
                        component="span"
                        sx={{
                          ml: 0.5,
                          px: 0.8,
                          py: 0.2,
                          bgcolor: selectedAmenity === amenity.key ? 'rgba(255,255,255,0.3)' : '#8CA551',
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
                onClick={() => setSelectedAmenity(amenity.key)}
                sx={{
                  bgcolor: selectedAmenity === amenity.key ? '#8CA551' : 'rgba(140, 165, 81, 0.1)',
                  color: selectedAmenity === amenity.key ? 'white' : '#333F1F',
                  fontWeight: 600,
                  fontFamily: '"Poppins", sans-serif',
                  cursor: 'pointer',
                  '&:hover': {
                    bgcolor: selectedAmenity === amenity.key ? '#8CA551' : 'rgba(140, 165, 81, 0.2)'
                  }
                }}
              />
            )
          })}
        </Box>

        {selectedAmenity && (
          <>
            <Box mb={2}>
              <Button
                variant="contained"
                component="label"
                startIcon={<CloudUpload />}
                disabled={uploading}
                sx={{
                  bgcolor: '#8CA551',
                  '&:hover': { bgcolor: '#7a9447' },
                  fontFamily: '"Poppins", sans-serif',
                  textTransform: 'none'
                }}
              >
                Seleccionar Imágenes
                <input
                  type="file"
                  hidden
                  multiple
                  accept="image/*"
                  onChange={handleFileSelect}
                />
              </Button>
            </Box>

            {/* New Files Preview */}
            {currentSelectedFiles.length > 0 && (
              <>
                <Typography variant="subtitle2" fontWeight={700} mb={1}>
                  Nuevas Imágenes ({currentSelectedFiles.length})
                </Typography>
                <Grid container spacing={2} mb={3}>
                  {currentSelectedFiles.map((item, idx) => (
                    <Grid item xs={6} sm={4} key={idx}>
                      <Box
                        sx={{
                          position: 'relative',
                          borderRadius: 2,
                          overflow: 'hidden',
                          border: '2px solid #e0e0e0'
                        }}
                      >
                        <img
                          src={URL.createObjectURL(item.file)}
                          alt={`Preview ${idx + 1}`}
                          style={{
                            width: '100%',
                            height: 150,
                            objectFit: 'cover'
                          }}
                        />
                        <Box
                          sx={{
                            position: 'absolute',
                            top: 8,
                            right: 8,
                            display: 'flex',
                            gap: 0.5
                          }}
                        >
                          <Chip
                            label={item.isPublic ? 'Público' : 'Privado'}
                            size="small"
                            onClick={() => handleToggleSelectedFileVisibility(selectedAmenity, idx, !item.isPublic)}
                            sx={{
                              bgcolor: item.isPublic ? '#4caf50' : '#ff9800',
                              color: 'white',
                              fontWeight: 600,
                              cursor: 'pointer'
                            }}
                          />
                          <IconButton
                            size="small"
                            onClick={() => handleRemoveSelectedFile(selectedAmenity, idx)}
                            sx={{
                              bgcolor: 'rgba(255,255,255,0.9)',
                              '&:hover': { bgcolor: '#ffebee' }
                            }}
                          >
                            <Delete fontSize="small" color="error" />
                          </IconButton>
                        </Box>
                        <Chip
                          label="NUEVO"
                          size="small"
                          sx={{
                            position: 'absolute',
                            bottom: 8,
                            left: 8,
                            bgcolor: '#2196f3',
                            color: 'white',
                            fontWeight: 700
                          }}
                        />
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </>
            )}

            {/* Uploaded Images */}
            {currentImages.length > 0 && (
              <>
                <Typography variant="subtitle2" fontWeight={700} mb={1}>
                  Imágenes Subidas ({currentImages.length})
                </Typography>
                <Grid container spacing={2}>
                  {currentImages.map((img, idx) => (
                    <Grid item xs={6} sm={4} key={idx}>
                      <Box
                        sx={{
                          position: 'relative',
                          borderRadius: 2,
                          overflow: 'hidden',
                          border: '2px solid #e0e0e0'
                        }}
                      >
                        <img
                          src={typeof img === 'string' ? img : img.url}
                          alt={`Amenity ${idx + 1}`}
                          style={{
                            width: '100%',
                            height: 150,
                            objectFit: 'cover'
                          }}
                        />
                        <Box
                          sx={{
                            position: 'absolute',
                            top: 8,
                            right: 8,
                            display: 'flex',
                            gap: 0.5
                          }}
                        >
                          <Chip
                            label={img.isPublic ? 'Público' : 'Privado'}
                            size="small"
                            onClick={() => handleToggleUploadedImageVisibility(selectedAmenity, idx, !img.isPublic)}
                            sx={{
                              bgcolor: img.isPublic ? '#4caf50' : '#ff9800',
                              color: 'white',
                              fontWeight: 600,
                              cursor: 'pointer'
                            }}
                          />
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteUploadedImage(selectedAmenity, idx)}
                            sx={{
                              bgcolor: 'rgba(255,255,255,0.9)',
                              '&:hover': { bgcolor: '#ffebee' }
                            }}
                          >
                            <Delete fontSize="small" color="error" />
                          </IconButton>
                        </Box>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </>
            )}
          </>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2, borderTop: '1px solid #e0e0e0' }}>
        <Button
          variant="outlined"
          onClick={onClose}
          sx={{
            textTransform: 'none',
            fontFamily: '"Poppins", sans-serif'
          }}
        >
          Cerrar
        </Button>
        <Button
          variant="contained"
          onClick={handleUpload}
          disabled={
            OUTDOOR_AMENITIES.every(amenity => selectedFiles[amenity.key].length === 0) || uploading
          }
          startIcon={uploading ? <CircularProgress size={20} /> : <Check />}
          sx={{
            bgcolor: '#8CA551',
            '&:hover': { bgcolor: '#7a9447' },
            textTransform: 'none',
            fontFamily: '"Poppins", sans-serif'
          }}
        >
          {uploading ? 'Subiendo...' : 'Subir Todo'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default OutdoorAmenitiesModal