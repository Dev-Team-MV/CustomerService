// @/Users/oficina/MV-CRM/CustomerService/frontend/shared/components/propertyDetails/ConstructionTab.jsx

import { useState, useEffect } from 'react'
import {
  Box,
  Button,
  Typography,
  LinearProgress,
  IconButton,
  Chip,
  Alert,
  CircularProgress,
  Paper
} from '@mui/material'
import {
  CloudUpload,
  CheckCircle,
  Lock,
  LockOpen,
  ChevronLeft,
  ChevronRight
} from '@mui/icons-material'
import { useTheme } from '@mui/material/styles'
import { usePhases } from '@shared/hooks/usePhases'
import PhaseUploadDialog from '@shared/components/constructionPhases/PhaseUploadDialog'
import PhaseMediaGallery from '@shared/components/constructionPhases/PhaseMediaGallery'
import uploadService from '@shared/services/uploadService'

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

/**
 * ConstructionTab - Componente polimórfico para gestionar fases de construcción
 * @param {string} apartmentId - ID del apartamento (para proyectos phase-2, isq, sheperd)
 * @param {string} propertyId - ID de la propiedad (para proyectos 6town-houses)
 * @param {boolean} isAdmin - Si el usuario es admin
 */
const ConstructionTab = ({ apartmentId, propertyId, isAdmin = false }) => {
  const theme = useTheme()
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)
  const [selectedPhase, setSelectedPhase] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0)

  // Determinar automáticamente el tipo de entidad y su ID
  const entityType = propertyId ? 'property' : 'apartment'
  const entityId = propertyId || apartmentId
console.log('🔍 ConstructionTab Debug:', { 
  apartmentId, 
  propertyId, 
  entityType, 
  entityId 
})
  const {
    phases: fetchedPhases,
    loading,
    addMediaItem,
    updateMediaItem,
    deleteMediaItem
  } = usePhases({
    entityType,
    entityId
  })

  // Crear array de 9 fases (1-9)
  const [phases, setPhases] = useState([])

  useEffect(() => {
    if (fetchedPhases) {
      const allPhases = []
      for (let i = 1; i <= 9; i++) {
        const existingPhase = fetchedPhases.find(p => p.phaseNumber === i)
        allPhases.push(existingPhase || {
          phaseNumber: i,
          title: PHASE_TITLES[i - 1],
          constructionPercentage: 0,
          mediaItems: [],
          // Asignar dinámicamente la propiedad correcta
          ...(entityType === 'property' ? { property: entityId } : { apartment: entityId })
        })
      }
      setPhases(allPhases)
    }
  }, [fetchedPhases, entityId, entityType])

  // Auto-navegar a la primera fase incompleta
  useEffect(() => {
    if (phases.length > 0) {
      const firstIncomplete = phases.findIndex(p => p.constructionPercentage < 100)
      setCurrentPhaseIndex(firstIncomplete === -1 ? 0 : firstIncomplete)
    }
  }, [phases])

  const handleUpload = async (phaseNumber, uploadForm) => {
    if (!uploadForm.images.length && !uploadForm.videos.length) {
      alert('Please select at least one image or video')
      return
    }

    setUploading(true)
    try {
      const [urls, videoUrls] = await Promise.all([
        uploadForm.images.length ? uploadService.uploadPhaseImages(uploadForm.images) : Promise.resolve([]),
        uploadForm.videos.length ? uploadService.uploadPhaseVideos(uploadForm.videos) : Promise.resolve([])
      ])

      const addedPercentage    = parseFloat(uploadForm.percentage) || 0
      const totalMedia         = urls.length + videoUrls.length
      const percentagePerItem  = totalMedia > 0 ? addedPercentage / totalMedia : 0

      for (let i = 0; i < urls.length; i++) {
        await addMediaItem(phaseNumber, {
          url:       urls[i],
          title:     uploadForm.title || `Phase ${phaseNumber} - Image ${i + 1}`,
          percentage: percentagePerItem,
          mediaType: 'image'
        })
      }

      for (let i = 0; i < videoUrls.length; i++) {
        await addMediaItem(phaseNumber, {
          url:       videoUrls[i],
          title:     uploadForm.title || `Phase ${phaseNumber} - Video ${i + 1}`,
          percentage: percentagePerItem,
          mediaType: 'video'
        })
      }

      setUploadDialogOpen(false)
      setSelectedPhase(null)
    } catch (error) {
      console.error('Upload error:', error)
      alert(`Upload failed: ${error.message}`)
    } finally {
      setUploading(false)
    }
  }

  const handleOpenUploadDialog = (phase) => {
    setSelectedPhase(phase)
    setUploadDialogOpen(true)
  }

  const currentPhase = phases[currentPhaseIndex]
  const canGoNext = currentPhaseIndex < phases.length - 1 && currentPhase?.constructionPercentage >= 100

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress sx={{ color: theme.palette.primary.main }} />
      </Box>
    )
  }

  if (!phases || phases.length === 0) {
    return (
      <Box textAlign="center" p={4}>
        <Typography color="text.secondary">No construction phases available</Typography>
      </Box>
    )
  }

  return (
    <Box>
      {/* Slider de navegación entre fases */}
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
          border: `1px solid ${theme.palette.cardBorder}`
        }}
      >
        <IconButton
          onClick={() => setCurrentPhaseIndex(i => Math.max(i - 1, 0))}
          disabled={currentPhaseIndex === 0}
          sx={{
            bgcolor: currentPhaseIndex === 0 ? '#e0e0e0' : theme.palette.primary.main,
            color: 'white',
            '&:hover': {
              bgcolor: currentPhaseIndex === 0 ? '#e0e0e0' : theme.palette.secondary.main
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
              color: theme.palette.primary.main,
              fontFamily: '"Poppins", sans-serif'
            }}
          >
            Phase {currentPhase?.phaseNumber} / {phases.length}
          </Typography>
          <Typography
            variant="caption"
            sx={{
              color: theme.palette.text.secondary,
              fontFamily: '"Poppins", sans-serif'
            }}
          >
            {currentPhase?.title || PHASE_TITLES[currentPhaseIndex]}
          </Typography>
        </Box>

        <IconButton
          onClick={() => setCurrentPhaseIndex(i => Math.min(i + 1, phases.length - 1))}
          disabled={!canGoNext}
          sx={{
            bgcolor: !canGoNext ? '#e0e0e0' : theme.palette.primary.main,
            color: 'white',
            '&:hover': {
              bgcolor: !canGoNext ? '#e0e0e0' : theme.palette.secondary.main
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

      {/* Contenido de la fase actual */}
      {currentPhase && (
        <Paper
          elevation={0}
          sx={{
            p: 3,
            mb: 3,
            bgcolor: 'white',
            borderRadius: 3,
            border: `1px solid ${theme.palette.cardBorder}`
          }}
        >
          <Box display="flex" alignItems="center" gap={2} mb={3}>
            {/* Icono de estado */}
            <Box
              sx={{
                width: 54,
                height: 54,
                borderRadius: 3,
                bgcolor: currentPhase.constructionPercentage === 100
                  ? theme.palette.success.main
                  : currentPhase.constructionPercentage > 0
                  ? theme.palette.warning.main
                  : theme.palette.grey[500],
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
              }}
            >
              {currentPhase.constructionPercentage === 100 ? (
                <CheckCircle sx={{ fontSize: 32, color: 'white' }} />
              ) : currentPhase.constructionPercentage > 0 ? (
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
                  color: theme.palette.primary.main,
                  fontFamily: '"Poppins", sans-serif'
                }}
              >
                {currentPhase.title || PHASE_TITLES[currentPhaseIndex]}
              </Typography>
              <Chip
                label={`${currentPhase.constructionPercentage}% Complete`}
                size="small"
                sx={{
                  mt: 0.5,
                  bgcolor: currentPhase.constructionPercentage === 100
                    ? 'rgba(67,160,71,0.12)'
                    : 'rgba(255,152,0,0.12)',
                  color: theme.palette.primary.main,
                  border: `1px solid ${currentPhase.constructionPercentage === 100 ? theme.palette.success.main : theme.palette.warning.main}`,
                  fontWeight: 600,
                  fontFamily: '"Poppins", sans-serif'
                }}
              />
            </Box>

            {/* Botón Upload - solo para admins */}
            {isAdmin && (
              <Button
                variant="contained"
                size="small"
                startIcon={<CloudUpload />}
                onClick={() => handleOpenUploadDialog(currentPhase)}
                sx={{
                  borderRadius: 3,
                  bgcolor: theme.palette.primary.main,
                  color: 'white',
                  fontWeight: 600,
                  fontFamily: '"Poppins", sans-serif',
                  textTransform: 'none',
                  px: 3,
                  py: 1,
                  boxShadow: `0 4px 12px ${theme.palette.primary.main}40`,
                  '&:hover': {
                    bgcolor: theme.palette.primary.dark,
                    boxShadow: `0 8px 20px ${theme.palette.primary.main}60`
                  }
                }}
              >
                Upload
              </Button>
            )}
          </Box>

          {/* Barra de progreso */}
          <Box mb={3}>
            <LinearProgress
              variant="determinate"
              value={currentPhase.constructionPercentage}
              sx={{
                height: 12,
                borderRadius: 3,
                bgcolor: '#e0e0e0',
                '& .MuiLinearProgress-bar': {
                  bgcolor: currentPhase.constructionPercentage === 100
                    ? theme.palette.success.main
                    : theme.palette.warning.main,
                  borderRadius: 3
                }
              }}
            />
          </Box>

          {/* Galería de media */}
          {currentPhase.mediaItems && currentPhase.mediaItems.length > 0 ? (
            <PhaseMediaGallery
              mediaItems={currentPhase.mediaItems}
              onMediaClick={(media) => console.log('Media clicked:', media)}
            />
          ) : (
            <Alert
              severity="info"
              sx={{
                borderRadius: 2,
                bgcolor: 'rgba(33,150,243,0.08)',
                border: `1px solid rgba(33,150,243,0.2)`,
                '& .MuiAlert-message': {
                  fontFamily: '"Poppins", sans-serif',
                  color: theme.palette.primary.main
                }
              }}
            >
              No media items uploaded for this phase yet
            </Alert>
          )}
        </Paper>
      )}

      {/* Upload Dialog - Solo para admins */}
      {isAdmin && (
        <PhaseUploadDialog
          open={uploadDialogOpen}
          onClose={() => {
            setUploadDialogOpen(false)
            setSelectedPhase(null)
          }}
          phase={selectedPhase}
          onUpload={handleUpload}
          uploading={uploading}
          config={{
            allowVideo: true,
            maxPercentage: 100
          }}
        />
      )}
    </Box>
  )
}

export default ConstructionTab