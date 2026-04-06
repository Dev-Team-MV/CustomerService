// @/Users/oficina/MV-CRM/CustomerService/frontend/apps/phase-2/src/Components/UI/Agora/AgoraImagesModal.jsx

import { useState } from "react"
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Grid,
  Alert,
  Chip,
  CircularProgress,
  IconButton,
  Button
} from "@mui/material"
import {
  CloudUpload,
  Map,
  Layers,
  Check,
  Delete
} from "@mui/icons-material"
import ModalWrapper from "@shared/constants/ModalWrapper"
import PrimaryButton from "@shared/constants/PrimaryButton"
import communitySpacesService from "../../../Services/ComunitySpacesService"

const AGORA_SECTIONS = [
  { key: 'exterior', label: 'Exterior', icon: Map },
  { key: 'planos', label: 'Planos', icon: Layers }
]

const PHASE_2_PROJECT_ID = import.meta.env.VITE_PROJECT_ID || '6751c5e6a6f0f0e0e6f0f0e0'

const AgoraImagesModal = ({ 
  open, 
  onClose, 
  agoraData = null,
  onUploaded
}) => {
  const [tab, setTab] = useState(0)
  const [selectedFiles, setSelectedFiles] = useState({
    exterior: [],
    planos: []
  })
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState(null)

  const getCurrentSection = () => AGORA_SECTIONS[tab].key
  
  const getCurrentExistingImages = () => {
if (!agoraData?.space?.sections) return []
const section = agoraData.space.sections[getCurrentSection()]
    
    // Handle different structures: exterior has 'images', planos has 'items'
    if (getCurrentSection() === 'exterior') {
      return section?.images || []
    } else {
      return section?.items || []
    }
  }
  
  const getCurrentSelectedFiles = () => selectedFiles[getCurrentSection()] || []
  
  const getTotalSelectedFiles = () => {
    return Object.values(selectedFiles).reduce((sum, files) => sum + files.length, 0)
  }

  // Handle file selection
  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files)
    if (files.length === 0) return
    
    const section = getCurrentSection()
    setSelectedFiles(prev => ({
      ...prev,
      [section]: [
        ...prev[section],
        ...files.map(file => ({ file, isPublic: false }))
      ]
    }))
  }

  // Remove selected file (not uploaded yet)
  const handleRemoveSelectedFile = (idx) => {
    const section = getCurrentSection()
    setSelectedFiles(prev => ({
      ...prev,
      [section]: prev[section].filter((_, i) => i !== idx)
    }))
  }

  // Toggle visibility for selected file (not uploaded yet)
  const handleToggleSelectedFileVisibility = (idx) => {
    const section = getCurrentSection()
    setSelectedFiles(prev => ({
      ...prev,
      [section]: prev[section].map((f, i) =>
        i === idx ? { ...f, isPublic: !f.isPublic } : f
      )
    }))
  }

  // Toggle visibility for uploaded image
  const handleToggleUploadedImageVisibility = async (idx) => {
    const section = getCurrentSection()
    const currentImages = getCurrentExistingImages()
    
    try {
      // Create updated sections structure
      const updatedSections = { ...agoraData.space.sections }
      
      if (section === 'exterior') {
        updatedSections.exterior = {
          ...updatedSections.exterior,
          images: currentImages.map((img, i) =>
            i === idx ? { ...img, isPublic: !img.isPublic } : img
          )
        }
      } else {
        updatedSections.planos = {
          ...updatedSections.planos,
          items: currentImages.map((img, i) =>
            i === idx ? { ...img, isPublic: !img.isPublic } : img
          )
        }
      }

await communitySpacesService.updateCommunitySpace(
  PHASE_2_PROJECT_ID, 'agora',
  { label: agoraData.space.label, sections: updatedSections }
)

      if (onUploaded) onUploaded()
    } catch (err) {
      console.error('[AgoraImagesModal] Error toggling visibility:', err)
      setError('Error al actualizar la visibilidad de la imagen.')
    }
  }

  // Delete uploaded image
  const handleDeleteUploadedImage = async (idx) => {
    const section = getCurrentSection()
    const currentImages = getCurrentExistingImages()
    
    try {
      // Create updated sections structure
      const updatedSections = { ...agoraData.space.sections }
      
      if (section === 'exterior') {
        updatedSections.exterior = {
          ...updatedSections.exterior,
          images: currentImages.filter((_, i) => i !== idx)
        }
      } else {
        updatedSections.planos = {
          ...updatedSections.planos,
          items: currentImages.filter((_, i) => i !== idx)
        }
      }

await communitySpacesService.updateCommunitySpace(
  PHASE_2_PROJECT_ID, 'agora',
  { label: agoraData.space.label, sections: updatedSections }
)

      if (onUploaded) onUploaded()
    } catch (err) {
      console.error('[AgoraImagesModal] Error deleting image:', err)
      setError('Error al eliminar la imagen.')
    }
  }

  // Upload all selected files
  const handleConfirmUpload = async () => {
    setUploading(true)
    setError(null)
    
    try {
const updatedSections = { ...agoraData.space.sections }

      // Upload files for each section
      for (const section of AGORA_SECTIONS) {
        const key = section.key
        if (selectedFiles[key].length > 0) {
          const uploadedImages = await communitySpacesService.uploadCommunitySpaceImages(
            selectedFiles[key],
            'agora',
            key
          )

          // Update the appropriate section structure
          if (key === 'exterior') {
            updatedSections.exterior = {
              ...updatedSections.exterior,
              images: [
                ...(updatedSections.exterior?.images || []),
                ...uploadedImages
              ]
            }
          } else {
            updatedSections.planos = {
              ...updatedSections.planos,
              items: [
                ...(updatedSections.planos?.items || []),
                ...uploadedImages.map(img => ({
                  ...img,
                  name: img.name || `Plano ${(updatedSections.planos?.items?.length || 0) + 1}`
                }))
              ]
            }
          }
        }
      }

      // Save updated data to backend
await communitySpacesService.updateCommunitySpace(
  PHASE_2_PROJECT_ID, 'agora',
  { label: agoraData.space.label, sections: updatedSections }
)

      // Clear selected files
      setSelectedFiles({
        exterior: [],
        planos: []
      })
      
      if (onUploaded) onUploaded()
      onClose()
    } catch (err) {
      console.error('[AgoraImagesModal] Error uploading:', err)
      setError('Error al subir las imágenes. Por favor intenta de nuevo.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <ModalWrapper
      open={open}
      onClose={onClose}
      icon={CloudUpload}
      title="Gestión de imágenes del Ágora"
      subtitle={
        getTotalSelectedFiles() > 0
          ? `${getTotalSelectedFiles()} archivo(s) listo(s) para subir`
          : undefined
      }
      actions={
        <>
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
          <PrimaryButton
            onClick={handleConfirmUpload}
            disabled={getTotalSelectedFiles() === 0 || uploading}
            loading={uploading}
            startIcon={!uploading ? <Check /> : undefined}
          >
            {uploading ? "Subiendo..." : `Subir Todo (${getTotalSelectedFiles()})`}
          </PrimaryButton>
        </>
      }
      maxWidth="md"
      fullWidth
    >
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Tabs */}
      <Tabs
        value={tab}
        onChange={(e, v) => setTab(v)}
        sx={{
          mb: 3,
          "& .MuiTabs-indicator": {
            backgroundColor: '#8CA551'
          },
          "& .MuiTab-root": {
            color: '#706f6f',
            fontFamily: '"Poppins", sans-serif',
            fontWeight: 600,
            textTransform: 'none',
            "&.Mui-selected": {
              color: '#8CA551'
            }
          }
        }}
      >
        {AGORA_SECTIONS.map((section) => (
          <Tab 
            key={section.key}
            icon={<section.icon />} 
            label={section.label} 
            iconPosition="start"
          />
        ))}
      </Tabs>

      {/* File Selection Button */}
      <Box mb={3}>
        <PrimaryButton 
          component="label" 
          startIcon={<CloudUpload />} 
          disabled={uploading}
          sx={{
            bgcolor: '#8CA551',
            '&:hover': { bgcolor: '#7a9447' }
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
        </PrimaryButton>
        <Typography variant="caption" display="block" mt={1} color="text.secondary">
          Sección actual: <strong>{AGORA_SECTIONS[tab].label}</strong>
        </Typography>
      </Box>

      {uploading ? (
        <Box display="flex" justifyContent="center" py={6}>
          <CircularProgress sx={{ color: '#8CA551' }} />
        </Box>
      ) : (
        <>
          {/* New Files Preview */}
          {getCurrentSelectedFiles().length > 0 && (
            <Box mb={3}>
              <Typography variant="subtitle2" fontWeight={700} mb={1.5}>
                Nuevas Imágenes ({getCurrentSelectedFiles().length})
              </Typography>
              <Grid container spacing={2}>
                {getCurrentSelectedFiles().map((item, idx) => (
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
                          onClick={() => handleToggleSelectedFileVisibility(idx)}
                          sx={{
                            bgcolor: item.isPublic ? '#4caf50' : '#ff9800',
                            color: 'white',
                            fontWeight: 600,
                            cursor: 'pointer',
                            '&:hover': {
                              opacity: 0.8
                            }
                          }}
                        />
                        <IconButton
                          size="small"
                          onClick={() => handleRemoveSelectedFile(idx)}
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
            </Box>
          )}

          {/* Uploaded Images */}
          {getCurrentExistingImages().length > 0 && (
            <Box>
              <Typography variant="subtitle2" fontWeight={700} mb={1.5}>
                Imágenes Subidas ({getCurrentExistingImages().length})
              </Typography>
              <Grid container spacing={2}>
                {getCurrentExistingImages().map((img, idx) => (
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
                        alt={img.name || `${AGORA_SECTIONS[tab].label} ${idx + 1}`}
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
                          onClick={() => handleToggleUploadedImageVisibility(idx)}
                          sx={{
                            bgcolor: img.isPublic ? '#4caf50' : '#ff9800',
                            color: 'white',
                            fontWeight: 600,
                            cursor: 'pointer',
                            '&:hover': {
                              opacity: 0.8
                            }
                          }}
                        />
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteUploadedImage(idx)}
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
            </Box>
          )}

          {/* Empty State */}
          {getCurrentExistingImages().length === 0 && getCurrentSelectedFiles().length === 0 && (
            <Box
              sx={{
                p: 4,
                textAlign: 'center',
                bgcolor: '#f5f5f5',
                borderRadius: 2,
                border: '1px dashed #e0e0e0'
              }}
            >
              <Typography variant="body2" color="text.secondary">
                No hay imágenes en esta sección aún.
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block" mt={1}>
                Selecciona imágenes para comenzar
              </Typography>
            </Box>
          )}
        </>
      )}
    </ModalWrapper>
  )
}

export default AgoraImagesModal