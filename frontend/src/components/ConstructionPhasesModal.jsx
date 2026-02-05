import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  TextField,
  LinearProgress,
  IconButton,
  ImageList,
  ImageListItem,
  ImageListItemBar,
  Chip,
  Alert,
  CircularProgress,
  Paper
} from '@mui/material'
import {
  Close,
  CloudUpload,
  Delete,
  CheckCircle,
  Lock,
  LockOpen,
  ChevronLeft, 
  ChevronRight,
  Cancel
} from '@mui/icons-material'
import api from '../services/api'
import uploadService from '../services/uploadService'
import {motion, AnimatePresence} from 'framer-motion'

const PHASE_TITLES = [
  'Site Preparation',
  'Foundation',
  'Framing',
  'Roofing',
  'MEP Installation',
  'Insulation & Drywall',
  'Interior Finishes',
  'Exterior Finishes',
  'Final Inspection'
]

const ConstructionPhasesModal = ({ open, property, onClose, isAdmin }) => {
  const [phases, setPhases] = useState([])
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [selectedPhase, setSelectedPhase] = useState(null)
  const [uploadForm, setUploadForm] = useState({
    title: '',
    percentage: 0,
    images: []
  })
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0)

  useEffect(() => {
    if (open && property) {
      fetchPhases()
    }
  }, [open, property])

  useEffect(() => {
    // Cuando se cargan las fases, posicionar el slider en la primera incompleta
    if (phases.length > 0) {
      const firstIncomplete = phases.findIndex(p => p.constructionPercentage < 100)
      setCurrentPhaseIndex(firstIncomplete === -1 ? 0 : firstIncomplete)
    }
  }, [phases])

  const [imageIdx, setImageIdx] = useState(0);
  const [phaseLightboxOpen, setPhaseLightboxOpen] = useState(false)

// Reinicia el índice cuando cambias de fase:
useEffect(() => {
  setImageIdx(0)
}, [currentPhaseIndex])

  const fetchPhases = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/phases/property/${property._id}`)
      
      // Asegurar 9 fases
      const existingPhases = response.data
      const allPhases = []
      
      for (let i = 1; i <= 9; i++) {
        const existingPhase = existingPhases.find(p => p.phaseNumber === i)
        if (existingPhase) {
          allPhases.push(existingPhase)
        } else {
          allPhases.push({
            phaseNumber: i,
            title: PHASE_TITLES[i - 1],
            constructionPercentage: 0,
            mediaItems: [],
            property: property._id
          })
        }
      }
      
      setPhases(allPhases)
    } catch (error) {
      console.error('Error fetching phases:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenUploadDialog = (phase) => {
    setSelectedPhase(phase)
    setUploadForm({
      title: '',
      percentage: 0,
      images: []
    })
  }

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files)
    setUploadForm(prev => ({
      ...prev,
      images: [...prev.images, ...files]
    }))
  }

  const handleRemoveImage = (index) => {
    setUploadForm(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }))
  }

const handleUploadImages = async () => {
  if (!uploadForm.images.length) {
    alert('Please select at least one image')
    return
  }

  try {
    setUploading(true)

    // ✅ 1. Subir imágenes a GCS
    console.log(`📤 Uploading ${uploadForm.images.length} images for Phase ${selectedPhase.phaseNumber}...`)
    const urls = await uploadService.uploadPhaseImages(uploadForm.images)
    console.log('✅ Images uploaded to GCS:', urls)

    // ✅ 2. Calcular nuevo porcentaje
    const currentPercentage = selectedPhase.constructionPercentage || 0
    const addedPercentage = parseFloat(uploadForm.percentage) || 0
    const newPercentage = Math.min(100, currentPercentage + addedPercentage)

    console.log('📊 Percentage calculation:', {
      current: currentPercentage,
      added: addedPercentage,
      new: newPercentage
    })

    // ✅ 3. Actualizar o crear la fase
    let phaseId = selectedPhase._id

    if (!phaseId) {
      // Fase NO existe - Crear primero
      console.log('➕ Creating new phase')
      
      const createResponse = await api.post('/phases', {
        property: property._id,
        phaseNumber: selectedPhase.phaseNumber,
        title: selectedPhase.title,
        constructionPercentage: newPercentage
      })

      phaseId = createResponse.data._id
      console.log('✅ Phase created with ID:', phaseId)
    } else {
      // Fase existe - Actualizar porcentaje primero
      console.log('🔄 Updating phase percentage')
      
      await api.put(`/phases/${phaseId}`, {
        constructionPercentage: newPercentage
      })
      
      console.log('✅ Phase percentage updated')
    }

    // ✅ 4. Agregar cada mediaItem individualmente usando el endpoint correcto
    console.log(`📤 Adding ${urls.length} media items to phase ${phaseId}`)
    
    for (let i = 0; i < urls.length; i++) {
      const url = urls[i]
      const mediaItemData = {
        url,
        title: uploadForm.title || `Phase ${selectedPhase.phaseNumber} - Image ${i + 1}`,
        percentage: addedPercentage / urls.length, // Distribuir el porcentaje entre todas las imágenes
        mediaType: 'image'
      }

      console.log(`📤 Adding media item ${i + 1}/${urls.length}:`, mediaItemData)

      // Usar el endpoint POST /phases/:id/media
      await api.post(`/phases/${phaseId}/media`, mediaItemData)
      
      console.log(`✅ Media item ${i + 1} added`)
    }

    console.log('✅ All media items added successfully')
    alert('✅ Images uploaded successfully!')
    
    setSelectedPhase(null)
    setUploadForm({ title: '', percentage: 0, images: [] })
    fetchPhases()
    
  } catch (error) {
    console.error('❌ Error uploading images:', error)
    console.error('❌ Error details:', error.response?.data)
    alert(`❌ Error: ${error.response?.data?.message || error.message}`)
  } finally {
    setUploading(false)
  }
}

  const handleDeleteMedia = async (phaseId, mediaId) => {
    if (!window.confirm('Are you sure you want to delete this image?')) return

    try {
      const phase = phases.find(p => p._id === phaseId)
      const updatedMediaItems = phase.mediaItems.filter(m => m._id !== mediaId)

      await api.put(`/phases/${phaseId}`, {
        mediaItems: updatedMediaItems
      })

      alert('✅ Image deleted')
      fetchPhases()
    } catch (error) {
      console.error('Error deleting media:', error)
      alert('❌ Error deleting image')
    }
  }

  return (
    <>
      {/* Modal principal de fases */}
      <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" fontWeight="bold">
              🏗️ Construction Phases - Lot {property?.lot?.number}
            </Typography>
            <IconButton onClick={onClose}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {loading ? (
            <Box display="flex" justifyContent="center" p={4}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              {/* Slider de fases */}
              <Box display="flex" alignItems="center" justifyContent="center" mb={3} gap={2}>
                <Button
                  variant="outlined"
                  onClick={() => setCurrentPhaseIndex(i => Math.max(i - 1, 0))}
                  disabled={currentPhaseIndex === 0}
                >
                  Previous
                </Button>
                <Typography variant="subtitle1" fontWeight="bold">
                  Phase {phases[currentPhaseIndex]?.phaseNumber} of {phases.length}
                </Typography>
                <Button
                  variant="outlined"
                  onClick={() => setCurrentPhaseIndex(i => Math.min(i + 1, phases.length - 1))}
                  disabled={
                    currentPhaseIndex === phases.length - 1 ||
                    phases[currentPhaseIndex]?.constructionPercentage < 100
                  }
                >
                  Next
                </Button>
              </Box>

              {/* Contenido de la fase actual */}
              {phases[currentPhaseIndex] && (
                <Paper
                  elevation={3}
                  sx={{
                    p: { xs: 2, md: 4 },
                    mb: 3,
                    bgcolor: 'white',
                    borderRadius: 5,
                    border: '1.5px solid #e0e5e9',
                    boxShadow: '0 8px 32px 0 rgba(74,124,89,0.10)',
                    position: 'relative',
                    overflow: 'hidden',
                    transition: 'box-shadow 0.3s',
                    '&:hover': {
                      boxShadow: '0 16px 48px 0 rgba(74,124,89,0.18)'
                    }
                  }}
                >
                  {/* Decorative gradient bar */}
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: 8,
                      background: 'linear-gradient(90deg, #4a7c59 0%, #8bc34a 100%)',
                      opacity: 0.18,
                      zIndex: 1
                    }}
                  />
                  <Box display="flex" alignItems="center" gap={2} mb={3} zIndex={2} position="relative">
                    <Box
                      sx={{
                        width: 54,
                        height: 54,
                        borderRadius: 3,
                        background: 'linear-gradient(135deg, #4a7c59 0%, #8bc34a 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 4px 16px rgba(74,124,89,0.18)'
                      }}
                    >
                      {phases[currentPhaseIndex].constructionPercentage === 100 ? (
                        <CheckCircle sx={{ fontSize: 32, color: 'white' }} />
                      ) : phases[currentPhaseIndex].constructionPercentage > 0 ? (
                        <LockOpen sx={{ fontSize: 32, color: 'white' }} />
                      ) : (
                        <Lock sx={{ fontSize: 32, color: 'white' }} />
                      )}
                    </Box>
                    <Box>
                      <Typography variant="h6" fontWeight="800" sx={{ color: '#2c3e50', letterSpacing: '-0.5px' }}>
                        Phase {phases[currentPhaseIndex].phaseNumber}: {phases[currentPhaseIndex].title}
                      </Typography>
                      <Box display="flex" alignItems="center" gap={1} mt={0.5}>
                        <Chip
                          label={
                            phases[currentPhaseIndex].constructionPercentage === 100
                              ? '100% Complete'
                              : `${phases[currentPhaseIndex].constructionPercentage}% Complete`
                          }
                          size="small"
                          sx={{
                            bgcolor:
                              phases[currentPhaseIndex].constructionPercentage === 100
                                ? '#8bc34a'
                                : '#ff9800',
                            color: 'white',
                            fontWeight: 700,
                            fontSize: '1rem'
                          }}
                        />
                      </Box>
                    </Box>
                    {isAdmin && (
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<CloudUpload />}
                        onClick={() => handleOpenUploadDialog(phases[currentPhaseIndex])}
                        sx={{
                          borderRadius: 2,
                          fontWeight: 700,
                          color: '#4a7c59',
                          borderColor: '#4a7c59',
                          ml: 'auto',
                          '&:hover': {
                            background: 'rgba(74,124,89,0.08)',
                            borderColor: '#4a7c59'
                          }
                        }}
                      >
                        Upload Images
                      </Button>
                    )}
                  </Box>
                  <Box mb={3} zIndex={2} position="relative">
                    <LinearProgress
                      variant="determinate"
                      value={phases[currentPhaseIndex].constructionPercentage}
                      sx={{
                        height: 12,
                        borderRadius: 3,
                        bgcolor: '#e0e0e0',
                        '& .MuiLinearProgress-bar': {
                          background: 'linear-gradient(90deg, #4a7c59 0%, #8bc34a 100%)',
                          borderRadius: 3
                        }
                      }}
                    />
                  </Box>
                  {/* Galería de imágenes */}
                    {phases[currentPhaseIndex].mediaItems && phases[currentPhaseIndex].mediaItems.length > 0 ? (
                      <Box sx={{ mb: 2 }}>
                        {/* Carrusel principal */}
                        <Box
                          sx={{
                            bgcolor: '#000',
                            borderRadius: 2,
                            p: 2,
                            minHeight: 280,
                            height: 340,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            position: 'relative',
                            overflow: 'hidden'
                          }}
                        >
                          <AnimatePresence mode="wait">
                            <motion.img
                              key={`phase-carousel-${currentPhaseIndex}-${imageIdx}`}
                              src={phases[currentPhaseIndex].mediaItems[imageIdx].url}
                              alt={phases[currentPhaseIndex].mediaItems[imageIdx].title}
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.95 }}
                              transition={{ duration: 0.3 }}
                              style={{
                                maxWidth: '90%',
                                maxHeight: '100%',
                                objectFit: 'contain',
                                borderRadius: 8,
                                cursor: 'pointer'
                              }}
                              onClick={() => setPhaseLightboxOpen(true)}
                            />
                          </AnimatePresence>
                          {phases[currentPhaseIndex].mediaItems.length > 1 && (
                            <>
                              <IconButton
                                onClick={() => setImageIdx(idx => Math.max(idx - 1, 0))}
                                sx={{
                                  position: 'absolute',
                                  left: 12,
                                  top: '50%',
                                  transform: 'translateY(-50%)',
                                  bgcolor: 'rgba(255,255,255,0.95)',
                                  boxShadow: 3
                                }}
                                disabled={imageIdx === 0}
                              >
                                <ChevronLeft />
                              </IconButton>
                              <IconButton
                                onClick={() => setImageIdx(idx => Math.min(idx + 1, phases[currentPhaseIndex].mediaItems.length - 1))}
                                sx={{
                                  position: 'absolute',
                                  right: 12,
                                  top: '50%',
                                  transform: 'translateY(-50%)',
                                  bgcolor: 'rgba(255,255,255,0.95)',
                                  boxShadow: 3
                                }}
                                disabled={imageIdx === phases[currentPhaseIndex].mediaItems.length - 1}
                              >
                                <ChevronRight />
                              </IconButton>
                            </>
                          )}
                          <Box sx={{ position: 'absolute', bottom: 12, left: 12, bgcolor: 'rgba(0,0,0,0.6)', color: 'white', px: 2, py: 0.5, borderRadius: 2 }}>
                            <Typography variant="caption" fontWeight="600">
                              {imageIdx + 1} / {phases[currentPhaseIndex].mediaItems.length}
                            </Typography>
                          </Box>
                          {/* Botón de eliminar solo para admin */}
                          {isAdmin && (
                            <IconButton
                              sx={{
                                position: 'absolute',
                                top: 16,
                                right: 16,
                                color: 'white',
                                bgcolor: 'rgba(0,0,0,0.5)',
                                zIndex: 10,
                                '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' }
                              }}
                              onClick={() =>
                                handleDeleteMedia(
                                  phases[currentPhaseIndex]._id,
                                  phases[currentPhaseIndex].mediaItems[imageIdx]._id
                                )
                              }
                            >
                              <Delete />
                            </IconButton>
                          )}
                        </Box>
                        {/* Miniaturas */}
                        <Box sx={{ display: 'flex', gap: 1, mt: 1, overflowX: 'auto' }}>
                          {phases[currentPhaseIndex].mediaItems.map((media, idx) => (
                            <Box
                              key={idx}
                              onClick={() => setImageIdx(idx)}
                              sx={{
                                width: 64,
                                height: 64,
                                borderRadius: 1.5,
                                overflow: 'hidden',
                                cursor: 'pointer',
                                border: idx === imageIdx ? '2px solid #4a7c59' : '1px solid rgba(0,0,0,0.06)',
                                boxShadow: idx === imageIdx ? '0 4px 12px rgba(74,124,89,0.12)' : 'none'
                              }}
                            >
                              <img src={media.url} alt={media.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </Box>
                          ))}
                        </Box>
                        {/* Lightbox para imagen ampliada */}
                        <Dialog open={phaseLightboxOpen} onClose={() => setPhaseLightboxOpen(false)} maxWidth="lg" fullWidth>
                          <DialogContent sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', bgcolor: 'transparent' }}>
                            <Box sx={{ position: 'relative' }}>
                              <IconButton
                                onClick={() => setPhaseLightboxOpen(false)}
                                sx={{
                                  position: 'absolute',
                                  top: 16,
                                  right: 16,
                                  color: 'white',
                                  bgcolor: 'rgba(0, 0, 0, 0.5)',
                                  zIndex: 10,
                                  '&:hover': {
                                    bgcolor: 'rgba(0, 0, 0, 0.7)'
                                  }
                                }}
                              >
                                <Cancel />
                              </IconButton>
                              <img
                                src={phases[currentPhaseIndex].mediaItems[imageIdx].url}
                                alt="phase-lightbox"
                                style={{ width: '100%', maxHeight: '80vh', objectFit: 'contain', borderRadius: 8 }}
                              />
                            </Box>
                          </DialogContent>
                        </Dialog>
                      </Box>
                    ) : (
                      <Alert
                        severity="info"
                        sx={{
                          borderRadius: 3,
                          bgcolor: 'rgba(33, 150, 243, 0.08)',
                          border: '1px solid rgba(33, 150, 243, 0.2)',
                          fontWeight: 600
                        }}
                      >
                        No images uploaded yet
                      </Alert>
                    )}
                </Paper>
              )}
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Dialog para subir imágenes */}
      <Dialog 
        open={!!selectedPhase} 
        onClose={() => setSelectedPhase(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Upload Images - Phase {selectedPhase?.phaseNumber}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Image Title/Description"
              value={uploadForm.title}
              onChange={(e) => setUploadForm(prev => ({ ...prev, title: e.target.value }))}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              type="number"
              label="Construction Progress Added (%)"
              value={uploadForm.percentage}
              onChange={(e) => setUploadForm(prev => ({ ...prev, percentage: e.target.value }))}
              inputProps={{ min: 0, max: 100 }}
              sx={{ mb: 2 }}
              helperText="How much progress does this update represent?"
            />
            <Button
              variant="outlined"
              component="label"
              fullWidth
              startIcon={<CloudUpload />}
              sx={{ mb: 2 }}
            >
              Select Images
              <input
                type="file"
                hidden
                multiple
                accept="image/*"
                onChange={handleFileSelect}
              />
            </Button>
            {uploadForm.images.length > 0 && (
              <Box>
                <Typography variant="caption" color="text.secondary" gutterBottom>
                  Selected files: {uploadForm.images.length}
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 1 }}>
                  {uploadForm.images.map((file, index) => (
                    <Paper key={index} sx={{ p: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" noWrap>
                        {file.name}
                      </Typography>
                      <IconButton size="small" onClick={() => handleRemoveImage(index)}>
                        <Delete fontSize="small" />
                      </IconButton>
                    </Paper>
                  ))}
                </Box>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedPhase(null)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleUploadImages}
            disabled={uploading || !uploadForm.images.length}
            startIcon={uploading ? <CircularProgress size={20} /> : <CloudUpload />}
          >
            {uploading ? 'Uploading...' : 'Upload'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default ConstructionPhasesModal