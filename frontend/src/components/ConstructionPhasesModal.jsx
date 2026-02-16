import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  TextField,
  LinearProgress,
  IconButton,
  Chip,
  Alert,
  CircularProgress,
  Paper,
  Grid
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
  Cancel,
  Construction
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
  const [imageIdx, setImageIdx] = useState(0)
  const [phaseLightboxOpen, setPhaseLightboxOpen] = useState(false)

  useEffect(() => {
    if (open && property) {
      fetchPhases()
    }
  }, [open, property])

  useEffect(() => {
    if (phases.length > 0) {
      const firstIncomplete = phases.findIndex(p => p.constructionPercentage < 100)
      setCurrentPhaseIndex(firstIncomplete === -1 ? 0 : firstIncomplete)
    }
  }, [phases])

  useEffect(() => {
    setImageIdx(0)
  }, [currentPhaseIndex])

  const fetchPhases = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/phases/property/${property._id}`)
      
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

      console.log(`📤 Uploading ${uploadForm.images.length} images for Phase ${selectedPhase.phaseNumber}...`)
      const urls = await uploadService.uploadPhaseImages(uploadForm.images)
      console.log('✅ Images uploaded to GCS:', urls)

      const currentPercentage = selectedPhase.constructionPercentage || 0
      const addedPercentage = parseFloat(uploadForm.percentage) || 0
      const newPercentage = Math.min(100, currentPercentage + addedPercentage)

      let phaseId = selectedPhase._id

      if (!phaseId) {
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
        console.log('🔄 Updating phase percentage')
        
        await api.put(`/phases/${phaseId}`, {
          constructionPercentage: newPercentage
        })
        
        console.log('✅ Phase percentage updated')
      }

      console.log(`📤 Adding ${urls.length} media items to phase ${phaseId}`)
      
      for (let i = 0; i < urls.length; i++) {
        const url = urls[i]
        const mediaItemData = {
          url,
          title: uploadForm.title || `Phase ${selectedPhase.phaseNumber} - Image ${i + 1}`,
          percentage: addedPercentage / urls.length,
          mediaType: 'image'
        }

        await api.post(`/phases/${phaseId}/media`, mediaItemData)
        console.log(`✅ Media item ${i + 1} added`)
      }

      alert('✅ Images uploaded successfully!')
      
      setSelectedPhase(null)
      setUploadForm({ title: '', percentage: 0, images: [] })
      fetchPhases()
      
    } catch (error) {
      console.error('❌ Error uploading images:', error)
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
      {/* ✅ MODAL PRINCIPAL - Brandbook exacto como Payloads */}
      <Dialog 
        open={open} 
        onClose={onClose} 
        maxWidth="lg" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 4,
            boxShadow: '0 20px 60px rgba(51, 63, 31, 0.15)'
          }
        }}
      >
        {/* ✅ DIALOG TITLE - Mismo estilo que Payloads */}
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box display="flex" alignItems="center" gap={2}>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 3,
                  bgcolor: '#333F1F',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(51, 63, 31, 0.2)',
                }}
              >
                <Construction sx={{ color: 'white', fontSize: 24 }} />
              </Box>
              <Box>
                <Typography 
                  variant="h6" 
                  fontWeight={700}
                  sx={{ 
                    color: '#333F1F',
                    fontFamily: '"Poppins", sans-serif'
                  }}
                >
                  Construction Phases
                </Typography>
                <Typography 
                  variant="caption"
                  sx={{ 
                    color: '#706f6f',
                    fontFamily: '"Poppins", sans-serif'
                  }}
                >
                  Track property construction progress - Lot {property?.lot?.number}
                </Typography>
              </Box>
            </Box>
            <IconButton 
              onClick={onClose}
              sx={{ 
                color: '#706f6f',
                '&:hover': { 
                  bgcolor: 'rgba(112, 111, 111, 0.08)',
                  transform: 'scale(1.05)'
                }
              }}
            >
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ pt: 3 }}>
          {loading ? (
            <Box display="flex" justifyContent="center" p={4}>
              <CircularProgress sx={{ color: '#8CA551' }} />
            </Box>
          ) : (
            <>
              {/* ✅ SLIDER DE FASES - Brandbook */}
              <Box 
                display="flex" 
                alignItems="center" 
                justifyContent="center" 
                mb={3} 
                gap={2}
                sx={{
                  p: 2.5,
                  bgcolor: '#fafafa',
                  borderRadius: 3,
                  border: '1px solid #e0e0e0'
                }}
              >
                <IconButton
                  onClick={() => setCurrentPhaseIndex(i => Math.max(i - 1, 0))}
                  disabled={currentPhaseIndex === 0}
                  sx={{
                    bgcolor: currentPhaseIndex === 0 ? '#e0e0e0' : '#333F1F',
                    color: 'white',
                    '&:hover': {
                      bgcolor: currentPhaseIndex === 0 ? '#e0e0e0' : '#8CA551',
                      transform: currentPhaseIndex === 0 ? 'none' : 'scale(1.05)'
                    },
                    '&:disabled': {
                      bgcolor: '#e0e0e0',
                      color: '#706f6f'
                    }
                  }}
                >
                  <ChevronLeft />
                </IconButton>

                <Box sx={{ textAlign: 'center', minWidth: 180 }}>
                  <Typography 
                    variant="h6" 
                    fontWeight={700}
                    sx={{ 
                      color: '#333F1F',
                      fontFamily: '"Poppins", sans-serif'
                    }}
                  >
                    Phase {phases[currentPhaseIndex]?.phaseNumber} of {phases.length}
                  </Typography>
                  <Typography 
                    variant="caption"
                    sx={{ 
                      color: '#706f6f',
                      fontFamily: '"Poppins", sans-serif'
                    }}
                  >
                    {phases[currentPhaseIndex]?.title}
                  </Typography>
                </Box>

                <IconButton
                  onClick={() => setCurrentPhaseIndex(i => Math.min(i + 1, phases.length - 1))}
                  disabled={
                    currentPhaseIndex === phases.length - 1 ||
                    phases[currentPhaseIndex]?.constructionPercentage < 100
                  }
                  sx={{
                    bgcolor: (currentPhaseIndex === phases.length - 1 || phases[currentPhaseIndex]?.constructionPercentage < 100) 
                      ? '#e0e0e0' 
                      : '#333F1F',
                    color: 'white',
                    '&:hover': {
                      bgcolor: (currentPhaseIndex === phases.length - 1 || phases[currentPhaseIndex]?.constructionPercentage < 100)
                        ? '#e0e0e0'
                        : '#8CA551',
                      transform: (currentPhaseIndex === phases.length - 1 || phases[currentPhaseIndex]?.constructionPercentage < 100)
                        ? 'none'
                        : 'scale(1.05)'
                    },
                    '&:disabled': {
                      bgcolor: '#e0e0e0',
                      color: '#706f6f'
                    }
                  }}
                >
                  <ChevronRight />
                </IconButton>
              </Box>

              {/* ✅ CONTENIDO DE LA FASE */}
              {phases[currentPhaseIndex] && (
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    mb: 3,
                    bgcolor: 'white',
                    borderRadius: 3,
                    border: '1px solid #e0e0e0'
                  }}
                >
                  {/* Header de la fase */}
                  <Box display="flex" alignItems="center" gap={2} mb={3}>
                    <Box
                      sx={{
                        width: 54,
                        height: 54,
                        borderRadius: 3,
                        bgcolor: phases[currentPhaseIndex].constructionPercentage === 100
                          ? '#8CA551'
                          : phases[currentPhaseIndex].constructionPercentage > 0
                          ? '#E5863C'
                          : '#706f6f',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
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
                    <Box flex={1}>
                      <Typography 
                        variant="h6" 
                        fontWeight={700}
                        sx={{ 
                          color: '#333F1F',
                          fontFamily: '"Poppins", sans-serif'
                        }}
                      >
                        {phases[currentPhaseIndex].title}
                      </Typography>
                      <Chip
                        label={`${phases[currentPhaseIndex].constructionPercentage}% Complete`}
                        size="small"
                        sx={{
                          mt: 0.5,
                          bgcolor: phases[currentPhaseIndex].constructionPercentage === 100
                            ? 'rgba(140, 165, 81, 0.12)'
                            : 'rgba(229, 134, 60, 0.12)',
                          color: '#333F1F',
                          border: `1px solid ${phases[currentPhaseIndex].constructionPercentage === 100 ? '#8CA551' : '#E5863C'}`,
                          fontWeight: 600,
                          fontFamily: '"Poppins", sans-serif'
                        }}
                      />
                    </Box>
                    {isAdmin && (
                      <Button
                        variant="contained"
                        size="small"
                        startIcon={<CloudUpload />}
                        onClick={() => handleOpenUploadDialog(phases[currentPhaseIndex])}
                        sx={{
                          borderRadius: 3,
                          bgcolor: '#333F1F',
                          color: 'white',
                          fontWeight: 600,
                          fontFamily: '"Poppins", sans-serif',
                          textTransform: 'none',
                          px: 3,
                          py: 1,
                          boxShadow: '0 4px 12px rgba(51, 63, 31, 0.25)',
                          position: 'relative',
                          overflow: 'hidden',
                          '&::before': {
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            left: '-100%',
                            width: '100%',
                            height: '100%',
                            bgcolor: '#8CA551',
                            transition: 'left 0.4s ease',
                            zIndex: 0,
                          },
                          '&:hover': {
                            bgcolor: '#333F1F',
                            boxShadow: '0 8px 20px rgba(51, 63, 31, 0.35)',
                            '&::before': {
                              left: 0,
                            },
                          },
                          '& .MuiButton-startIcon': {
                            position: 'relative',
                            zIndex: 1,
                          }
                        }}
                      >
                        <Box component="span" sx={{ position: 'relative', zIndex: 1 }}>
                          Upload
                        </Box>
                      </Button>
                    )}
                  </Box>

                  {/* Progress bar */}
                  <Box mb={3}>
                    <LinearProgress
                      variant="determinate"
                      value={phases[currentPhaseIndex].constructionPercentage}
                      sx={{
                        height: 12,
                        borderRadius: 3,
                        bgcolor: '#e0e0e0',
                        '& .MuiLinearProgress-bar': {
                          bgcolor: phases[currentPhaseIndex].constructionPercentage === 100
                            ? '#8CA551'
                            : '#E5863C',
                          borderRadius: 3
                        }
                      }}
                    />
                  </Box>

                  {/* ✅ GALERÍA DE IMÁGENES */}
                  {phases[currentPhaseIndex].mediaItems && phases[currentPhaseIndex].mediaItems.length > 0 ? (
                    <Box>
                      {/* Carrusel principal */}
                      <Box
                        sx={{
                          bgcolor: '#000',
                          borderRadius: 3,
                          p: 2,
                          minHeight: 280,
                          height: 400,
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
                              disabled={imageIdx === 0}
                              sx={{
                                position: 'absolute',
                                left: 12,
                                top: '50%',
                                transform: 'translateY(-50%)',
                                bgcolor: 'rgba(255,255,255,0.95)',
                                '&:hover': {
                                  bgcolor: 'white',
                                  transform: 'scale(1.1) translateY(-50%)',
                                  boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                                },
                                '&:disabled': {
                                  bgcolor: 'rgba(255,255,255,0.5)'
                                }
                              }}
                            >
                              <ChevronLeft sx={{ color: '#333F1F' }} />
                            </IconButton>
                            <IconButton
                              onClick={() => setImageIdx(idx => Math.min(idx + 1, phases[currentPhaseIndex].mediaItems.length - 1))}
                              disabled={imageIdx === phases[currentPhaseIndex].mediaItems.length - 1}
                              sx={{
                                position: 'absolute',
                                right: 12,
                                top: '50%',
                                transform: 'translateY(-50%)',
                                bgcolor: 'rgba(255,255,255,0.95)',
                                '&:hover': {
                                  bgcolor: 'white',
                                  transform: 'scale(1.1) translateY(-50%)',
                                  boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                                },
                                '&:disabled': {
                                  bgcolor: 'rgba(255,255,255,0.5)'
                                }
                              }}
                            >
                              <ChevronRight sx={{ color: '#333F1F' }} />
                            </IconButton>
                          </>
                        )}
                        
                        <Box 
                          sx={{ 
                            position: 'absolute', 
                            bottom: 12, 
                            left: 12, 
                            bgcolor: 'rgba(51, 63, 31, 0.9)', 
                            color: 'white', 
                            px: 2, 
                            py: 0.5, 
                            borderRadius: 2 
                          }}
                        >
                          <Typography 
                            variant="caption" 
                            fontWeight={600}
                            sx={{ fontFamily: '"Poppins", sans-serif' }}
                          >
                            {imageIdx + 1} / {phases[currentPhaseIndex].mediaItems.length}
                          </Typography>
                        </Box>
                        
                        {isAdmin && (
                          <IconButton
                            onClick={() => handleDeleteMedia(
                              phases[currentPhaseIndex]._id,
                              phases[currentPhaseIndex].mediaItems[imageIdx]._id
                            )}
                            sx={{
                              position: 'absolute',
                              top: 16,
                              right: 16,
                              color: 'white',
                              bgcolor: 'rgba(229, 134, 60, 0.9)',
                              '&:hover': { 
                                bgcolor: '#E5863C',
                                transform: 'scale(1.1)'
                              }
                            }}
                          >
                            <Delete />
                          </IconButton>
                        )}
                      </Box>

                      {/* Miniaturas */}
                      <Box sx={{ display: 'flex', gap: 1, mt: 2, overflowX: 'auto', pb: 1 }}>
                        {phases[currentPhaseIndex].mediaItems.map((media, idx) => (
                          <Box
                            key={idx}
                            onClick={() => setImageIdx(idx)}
                            sx={{
                              width: 80,
                              height: 80,
                              borderRadius: 2,
                              overflow: 'hidden',
                              cursor: 'pointer',
                              border: idx === imageIdx ? '3px solid #8CA551' : '1px solid #e0e0e0',
                              boxShadow: idx === imageIdx ? '0 4px 12px rgba(140, 165, 81, 0.25)' : 'none',
                              transition: 'all 0.3s ease',
                              flexShrink: 0,
                              '&:hover': {
                                transform: 'scale(1.05)',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                              }
                            }}
                          >
                            <img 
                              src={media.url} 
                              alt={media.title} 
                              style={{ 
                                width: '100%', 
                                height: '100%', 
                                objectFit: 'cover' 
                              }} 
                            />
                          </Box>
                        ))}
                      </Box>
                    </Box>
                  ) : (
                    <Alert
                      severity="info"
                      icon="ℹ️"
                      sx={{
                        borderRadius: 2,
                        bgcolor: 'rgba(140, 165, 81, 0.08)',
                        border: '1px solid rgba(140, 165, 81, 0.2)',
                        '& .MuiAlert-message': {
                          fontFamily: '"Poppins", sans-serif',
                          color: '#333F1F'
                        }
                      }}
                    >
                      No images uploaded yet for this phase
                    </Alert>
                  )}
                </Paper>
              )}
            </>
          )}
        </DialogContent>

        {/* ✅ DIALOG ACTIONS - Mismo estilo que Payloads */}
        <DialogActions sx={{ p: 3, gap: 2 }}>
          <Button
            onClick={onClose}
            sx={{
              borderRadius: 3,
              textTransform: 'none',
              fontWeight: 600,
              px: 3,
              py: 1.2,
              color: '#706f6f',
              fontFamily: '"Poppins", sans-serif',
              border: '2px solid #e0e0e0',
              '&:hover': {
                bgcolor: 'rgba(112, 111, 111, 0.05)',
                borderColor: '#706f6f'
              }
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* ✅ DIALOG PARA SUBIR IMÁGENES - Mismo estilo que Payloads */}
      <Dialog 
        open={!!selectedPhase} 
        onClose={() => setSelectedPhase(null)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 4,
            boxShadow: '0 20px 60px rgba(51, 63, 31, 0.15)'
          }
        }}
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={2}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: 3,
                bgcolor: '#333F1F',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(51, 63, 31, 0.2)',
              }}
            >
              <CloudUpload sx={{ color: 'white', fontSize: 24 }} />
            </Box>
            <Box>
              <Typography 
                variant="h6" 
                fontWeight={700}
                sx={{ 
                  color: '#333F1F',
                  fontFamily: '"Poppins", sans-serif'
                }}
              >
                Upload Images
              </Typography>
              <Typography 
                variant="caption"
                sx={{ 
                  color: '#706f6f',
                  fontFamily: '"Poppins", sans-serif'
                }}
              >
                Phase {selectedPhase?.phaseNumber} - {selectedPhase?.title}
              </Typography>
            </Box>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ pt: 3 }}>
          <Grid container spacing={2.5}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Image Title/Description"
                value={uploadForm.title}
                onChange={(e) => setUploadForm(prev => ({ ...prev, title: e.target.value }))}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 3,
                    fontFamily: '"Poppins", sans-serif',
                    '& fieldset': {
                      borderColor: 'rgba(140, 165, 81, 0.3)',
                      borderWidth: '2px'
                    },
                    '&:hover fieldset': {
                      borderColor: '#8CA551'
                    },
                    '&.Mui-focused fieldset': { 
                      borderColor: '#333F1F',
                      borderWidth: '2px'
                    }
                  },
                  '& .MuiInputLabel-root': {
                    fontFamily: '"Poppins", sans-serif',
                    fontWeight: 500,
                    color: '#706f6f',
                    '&.Mui-focused': {
                      color: '#333F1F',
                      fontWeight: 600
                    }
                  }
                }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                type="number"
                label="Construction Progress Added (%)"
                value={uploadForm.percentage}
                onChange={(e) => setUploadForm(prev => ({ ...prev, percentage: e.target.value }))}
                inputProps={{ min: 0, max: 100 }}
                helperText="How much progress does this update represent?"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 3,
                    fontFamily: '"Poppins", sans-serif',
                    '& fieldset': {
                      borderColor: 'rgba(140, 165, 81, 0.3)',
                      borderWidth: '2px'
                    },
                    '&:hover fieldset': {
                      borderColor: '#8CA551'
                    },
                    '&.Mui-focused fieldset': { 
                      borderColor: '#333F1F',
                      borderWidth: '2px'
                    }
                  },
                  '& .MuiInputLabel-root': {
                    fontFamily: '"Poppins", sans-serif',
                    fontWeight: 500,
                    color: '#706f6f',
                    '&.Mui-focused': {
                      color: '#333F1F',
                      fontWeight: 600
                    }
                  },
                  '& .MuiFormHelperText-root': {
                    fontFamily: '"Poppins", sans-serif'
                  }
                }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Button
                variant="outlined"
                component="label"
                fullWidth
                startIcon={<CloudUpload />}
                sx={{
                  py: 1.5,
                  borderRadius: 3,
                  textTransform: 'none',
                  fontWeight: 600,
                  fontFamily: '"Poppins", sans-serif',
                  borderColor: 'rgba(140, 165, 81, 0.3)',
                  borderWidth: '2px',
                  color: '#333F1F',
                  '&:hover': {
                    borderColor: '#8CA551',
                    borderWidth: '2px',
                    bgcolor: 'rgba(140, 165, 81, 0.08)'
                  }
                }}
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
            </Grid>
            
            {uploadForm.images.length > 0 && (
              <Grid item xs={12}>
                <Typography 
                  variant="caption" 
                  sx={{
                    color: '#706f6f',
                    fontWeight: 600,
                    fontFamily: '"Poppins", sans-serif',
                    display: 'block',
                    mb: 1
                  }}
                >
                  Selected files: {uploadForm.images.length}
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {uploadForm.images.map((file, index) => (
                    <Paper 
                      key={index} 
                      elevation={0}
                      sx={{ 
                        p: 1.5, 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        bgcolor: '#fafafa',
                        border: '1px solid #e0e0e0',
                        borderRadius: 2
                      }}
                    >
                      <Typography 
                        variant="body2" 
                        noWrap
                        sx={{ 
                          fontFamily: '"Poppins", sans-serif',
                          flex: 1,
                          mr: 1
                        }}
                      >
                        {file.name}
                      </Typography>
                      <IconButton 
                        size="small" 
                        onClick={() => handleRemoveImage(index)}
                        sx={{
                          color: '#E5863C',
                          '&:hover': {
                            bgcolor: 'rgba(229, 134, 60, 0.08)'
                          }
                        }}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </Paper>
                  ))}
                </Box>
              </Grid>
            )}
          </Grid>
        </DialogContent>

        <DialogActions sx={{ p: 3, gap: 2 }}>
          <Button
            onClick={() => setSelectedPhase(null)}
            sx={{
              borderRadius: 3,
              textTransform: 'none',
              fontWeight: 600,
              px: 3,
              py: 1.2,
              color: '#706f6f',
              fontFamily: '"Poppins", sans-serif',
              border: '2px solid #e0e0e0',
              '&:hover': {
                bgcolor: 'rgba(112, 111, 111, 0.05)',
                borderColor: '#706f6f'
              }
            }}
          >
            Cancel
          </Button>
          
          <Button
            variant="contained"
            onClick={handleUploadImages}
            disabled={uploading || !uploadForm.images.length}
            startIcon={uploading ? <CircularProgress size={20} sx={{ color: 'white' }} /> : <CloudUpload />}
            sx={{
              borderRadius: 3,
              bgcolor: '#333F1F',
              color: 'white',
              fontWeight: 600,
              textTransform: 'none',
              letterSpacing: '1px',
              fontFamily: '"Poppins", sans-serif',
              px: 4,
              py: 1.5,
              boxShadow: '0 4px 12px rgba(51, 63, 31, 0.25)',
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: '-100%',
                width: '100%',
                height: '100%',
                bgcolor: '#8CA551',
                transition: 'left 0.4s ease',
                zIndex: 0,
              },
              '&:hover': {
                bgcolor: '#333F1F',
                boxShadow: '0 8px 20px rgba(51, 63, 31, 0.35)',
                '&::before': {
                  left: 0,
                },
              },
              '&:disabled': {
                bgcolor: '#e0e0e0',
                color: '#706f6f',
                boxShadow: 'none'
              },
              '& .MuiButton-startIcon': {
                position: 'relative',
                zIndex: 1,
              }
            }}
          >
            <Box component="span" sx={{ position: 'relative', zIndex: 1 }}>
              {uploading ? 'Uploading...' : 'Upload'}
            </Box>
          </Button>
        </DialogActions>
      </Dialog>

      {/* ✅ LIGHTBOX */}
      <Dialog 
        open={phaseLightboxOpen} 
        onClose={() => setPhaseLightboxOpen(false)} 
        maxWidth="xl" 
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: 'transparent',
            boxShadow: 'none'
          }
        }}
      >
        <DialogContent 
          sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            bgcolor: 'rgba(0,0,0,0.95)',
            p: 0
          }}
        >
          <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
            <IconButton
              onClick={() => setPhaseLightboxOpen(false)}
              sx={{
                position: 'absolute',
                top: 16,
                right: 16,
                color: 'white',
                bgcolor: 'rgba(51, 63, 31, 0.8)',
                zIndex: 10,
                '&:hover': {
                  bgcolor: '#333F1F',
                  transform: 'scale(1.1)'
                }
              }}
            >
              <Cancel />
            </IconButton>
            <img
              src={phases[currentPhaseIndex]?.mediaItems[imageIdx]?.url}
              alt="phase-lightbox"
              style={{ 
                width: '100%', 
                maxHeight: '90vh', 
                objectFit: 'contain', 
                borderRadius: 8 
              }}
            />
          </Box>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default ConstructionPhasesModal