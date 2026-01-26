import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Button,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  IconButton,
  ImageList,
  ImageListItem,
  ImageListItemBar,
  Chip,
  Alert,
  CircularProgress,
  Paper,
  TextField,
  Grid
} from '@mui/material'
import {
  Close,
  CheckCircle,
  Lock,
  Upload,
  Delete,
  Construction,
  LockOpen,
  CloudUpload
} from '@mui/icons-material'
import api from '../services/api'

const PHASE_DESCRIPTIONS = [
  'Clearing and grading the land, setting up utilities and access',
  'Pouring concrete foundation and slab work',
  'Building the structure frame, walls, and roof structure',
  'Installing roof materials and waterproofing systems',
  'Installing plumbing lines, electrical wiring, and HVAC systems',
  'Adding insulation and hanging drywall throughout the home',
  'Installing flooring, painting, cabinets, and interior fixtures',
  'Completing siding, exterior painting, and landscaping',
  'Final walkthrough, quality checks, and project completion'
]

const ConstructionPhasesModal = ({ open, property, onClose, isAdmin }) => {
  const [phases, setPhases] = useState([])
  const [activeStep, setActiveStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState([])
  const [mediaTitle, setMediaTitle] = useState('')

  useEffect(() => {
    if (open && property) {
      fetchPhases()
    }
  }, [open, property])

  const fetchPhases = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/phases/property/${property._id}`)
      
      // Asegurar que existan las 9 fases
      const existingPhases = response.data
      const allPhases = []
      
      for (let i = 1; i <= 9; i++) {
        const existingPhase = existingPhases.find(p => p.phaseNumber === i)
        if (existingPhase) {
          allPhases.push(existingPhase)
        } else {
          // Crear fase vacía local si no existe en DB
          allPhases.push({
            phaseNumber: i,
            title: `Phase ${i}`, // Título por defecto si no existe
            constructionPercentage: 0,
            mediaItems: [],
            property: property._id,
            _isNew: true
          })
        }
      }
      
      setPhases(allPhases)
      
      // Set active step to first incomplete phase
      const firstIncomplete = allPhases.findIndex(p => p.constructionPercentage < 100)
      setActiveStep(firstIncomplete >= 0 ? firstIncomplete : allPhases.length - 1)
    } catch (error) {
      console.error('Error fetching phases:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files)
    setSelectedFiles(files)
  }

  const handleUploadImages = async (phaseNumber) => {
    if (selectedFiles.length === 0 || !mediaTitle) {
      alert('Please select images and enter a title')
      return
    }

    try {
      setUploading(true)
      const formData = new FormData()
      
      selectedFiles.forEach(file => {
        formData.append('images', file)
      })
      
      formData.append('phaseNumber', phaseNumber)
      formData.append('title', mediaTitle)

      const response = await api.post(
        `/upload/phase-images/${property._id}`, 
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' }
        }
      )

      // Mostrar mensaje de éxito
      alert(`✅ ${selectedFiles.length} image(s) uploaded successfully!`)

      // Limpiar estado
      setSelectedFiles([])
      setMediaTitle('')
      
      // Refrescar datos
      await fetchPhases()
      
    } catch (error) {
      console.error('Error uploading images:', error)
      const errorMessage = error.response?.data?.message || 'Error uploading images. Please try again.'
      alert(`❌ ${errorMessage}`)
    } finally {
      setUploading(false)
    }
  }

  const handleDeleteMediaItem = async (phaseId, mediaItemId) => {
    if (!window.confirm('Are you sure you want to delete this image?')) return

    try {
      await api.delete(`/phases/${phaseId}/media/${mediaItemId}`)
      
      // Mostrar mensaje de éxito
      alert('✅ Image deleted successfully!')
      
      await fetchPhases()
    } catch (error) {
      console.error('Error deleting media:', error)
      alert('❌ Error deleting image. Please try again.')
    }
  }

  const canUploadToPhase = (phaseNumber) => {
    if (!isAdmin) return false
    if (phaseNumber === 1) return true
    
    const previousPhase = phases.find(p => p.phaseNumber === phaseNumber - 1)
    return previousPhase?.constructionPercentage === 100
  }

  const isPhaseCompleted = (phaseNumber) => {
    const phase = phases.find(p => p.phaseNumber === phaseNumber)
    return phase?.constructionPercentage === 100
  }

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: { minHeight: '85vh', maxHeight: '90vh' }
      }}
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box display="flex" alignItems="center" gap={2}>
            <Construction color="primary" sx={{ fontSize: 32 }} />
            <Box>
              <Typography variant="h6" fontWeight="bold">
                Construction Progress - Lot {property.lot?.number}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {property.model?.model} • {property.user?.firstName} {property.user?.lastName}
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={onClose}>
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ pb: 3 }}>
        {loading ? (
          <Box display="flex" justifyContent="center" p={4}>
            <CircularProgress />
          </Box>
        ) : (
          <Stepper activeStep={activeStep} orientation="vertical">
            {phases.map((phase) => {
              const canUpload = canUploadToPhase(phase.phaseNumber)
              const isCompleted = isPhaseCompleted(phase.phaseNumber)
              const isLocked = !canUpload && !isCompleted && phase.phaseNumber !== 1
              const description = PHASE_DESCRIPTIONS[phase.phaseNumber - 1]

              return (
                <Step key={phase.phaseNumber} expanded={true}>
                  <StepLabel
                    StepIconComponent={() => (
                      isCompleted ? (
                        <CheckCircle color="success" sx={{ fontSize: 28 }} />
                      ) : isLocked ? (
                        <Lock color="disabled" sx={{ fontSize: 28 }} />
                      ) : (
                        <LockOpen color="primary" sx={{ fontSize: 28 }} />
                      )
                    )}
                  >
                    <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
                      <Typography variant="subtitle1" fontWeight="bold">
                        {phase.title}
                      </Typography>
                      {isCompleted && (
                        <Chip label="100% Complete" color="success" size="small" />
                      )}
                      {isLocked && (
                        <Chip label="Locked" size="small" icon={<Lock />} />
                      )}
                      {!isCompleted && !isLocked && (
                        <Chip 
                          label={`${phase.constructionPercentage}% Complete`} 
                          color="primary" 
                          size="small" 
                        />
                      )}
                    </Box>
                    <Typography variant="caption" color="text.secondary" display="block" mt={0.5}>
                      {description}
                    </Typography>
                  </StepLabel>

                  <StepContent>
                    <Box sx={{ mb: 2 }}>
                      {isLocked && (
                        <Alert severity="warning" sx={{ mb: 2 }}>
                          Complete {phases[phase.phaseNumber - 2]?.title} (100%) before uploading to this phase
                        </Alert>
                      )}

                      {/* Admin Upload Section */}
                      {isAdmin && (canUpload || phase.phaseNumber === 1) && !isCompleted && (
                        <Paper elevation={2} sx={{ p: 3, mb: 3, bgcolor: 'primary.50' }}>
                          <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                            📸 Upload Progress Images
                          </Typography>
                          
                          <Grid container spacing={2} sx={{ mb: 2 }}>
                            <Grid item xs={12}>
                              <TextField
                                fullWidth
                                size="small"
                                label="Image Title/Description"
                                value={mediaTitle}
                                onChange={(e) => setMediaTitle(e.target.value)}
                                placeholder="e.g., Foundation poured - West section"
                              />
                            </Grid>
                          </Grid>

                          <Box display="flex" gap={2} alignItems="center" flexWrap="wrap">
                            <Button
                              variant="outlined"
                              component="label"
                              startIcon={<CloudUpload />}
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
                            {selectedFiles.length > 0 && (
                              <>
                                <Typography variant="body2">
                                  {selectedFiles.length} file(s) selected
                                </Typography>
                                <Button
                                  variant="contained"
                                  onClick={() => handleUploadImages(phase.phaseNumber)}
                                  disabled={uploading || !mediaTitle}
                                  startIcon={<Upload />}
                                >
                                  {uploading ? 'Uploading...' : 'Upload'}
                                </Button>
                              </>
                            )}
                          </Box>
                        </Paper>
                      )}

                      {/* Progress Info (Read-only for all) */}
                      <Paper elevation={1} sx={{ p: 2, mb: 2, bgcolor: 'grey.50' }}>
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                          <Typography variant="body2" color="text.secondary">
                            Construction Progress:
                          </Typography>
                          <Chip 
                            label={`${phase.constructionPercentage}%`}
                            color={phase.constructionPercentage === 100 ? 'success' : 'primary'}
                            size="small"
                          />
                        </Box>
                        {phase.mediaItems && phase.mediaItems.length > 0 && (
                          <Typography variant="caption" color="text.secondary" display="block" mt={1}>
                            {phase.mediaItems.length} image{phase.mediaItems.length !== 1 ? 's' : ''} uploaded
                          </Typography>
                        )}
                      </Paper>

                      {/* Images Display */}
                      {phase.mediaItems && phase.mediaItems.length > 0 ? (
                        <Box>
                          <Typography variant="subtitle2" gutterBottom fontWeight="bold">
                            📷 Progress Images ({phase.mediaItems.length})
                          </Typography>
                          <ImageList cols={3} gap={12} sx={{ maxHeight: 400 }}>
                            {phase.mediaItems.map((media, index) => (
                              <ImageListItem key={media._id || index}>
                                <img
                                  src={media.url}
                                  alt={media.title}
                                  loading="lazy"
                                  style={{ height: 200, objectFit: 'cover', borderRadius: 8 }}
                                />
                                <ImageListItemBar
                                  title={media.title}
                                  subtitle={media.percentage ? `Progress: ${media.percentage}%` : null}
                                  actionIcon={
                                    isAdmin && (
                                      <IconButton
                                        sx={{ color: 'white' }}
                                        onClick={() => handleDeleteMediaItem(phase._id, media._id)}
                                      >
                                        <Delete />
                                      </IconButton>
                                    )
                                  }
                                  sx={{
                                    background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 70%, rgba(0,0,0,0) 100%)',
                                    borderRadius: '0 0 8px 8px'
                                  }}
                                />
                              </ImageListItem>
                            ))}
                          </ImageList>
                        </Box>
                      ) : (
                        <Alert severity="info">
                          📭 No images uploaded for this phase yet
                        </Alert>
                      )}
                    </Box>
                  </StepContent>
                </Step>
              )
            })}
          </Stepper>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} variant="outlined">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default ConstructionPhasesModal