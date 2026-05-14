// @/Users/oficina/MV-CRM/CustomerService/frontend/shared/components/propertyDetails/ConstructionTab.jsx

import { useState, useEffect, useMemo } from 'react'  // Agregar useMemo
import {
  Box,
  Button,
  Typography,
  LinearProgress,
  IconButton,
  Chip,
  Alert,
  CircularProgress,
  Paper,
  Dialog,              // ✅ Agregar
  DialogTitle,         // ✅ Agregar
  DialogContent,       // ✅ Agregar
  Accordion,           // ✅ Agregar
  AccordionSummary,    // ✅ Agregar
  AccordionDetails     // ✅ Agregar
} from '@mui/material'
import {
  CloudUpload,
  CheckCircle,
  Lock,
  LockOpen,
  ChevronLeft,
  ChevronRight,
  Edit,                // ✅ Agregar
  Close,               // ✅ Agregar
  ExpandMore,          // ✅ Agregar
  Delete,              // ✅ Agregar
  PlayCircle           // ✅ Agregar
} from '@mui/icons-material'
import { useTheme } from '@mui/material/styles'
import { usePhases } from '@shared/hooks/usePhases'
import PhaseUploadDialog from '@shared/components/constructionPhases/PhaseUploadDialog'
import PhaseMediaGallery from '@shared/components/constructionPhases/PhaseMediaGallery'
import uploadService from '@shared/services/uploadService'
import MediaItemEditor from '@shared/components/constructionPhases/MediaItemEditor'

const PHASE_TITLES = [
  'Site Preparation and Groundbreaking',
  'Foundation, Framing & Windows',
  'Exterior Cladding and Roofing Installation',
  "All MEP's starts rough in work",
  'Drywall Work and Paint',
  'Flooring and Millwork',
  'Kitchen and Bathrooms',
  'Interior Finishes, Driveway Applainces & Landscaping',
  'Inspections (Delays)'
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

  const [manageMediaOpen, setManageMediaOpen] = useState(false)

// Agrupar media por título
const groupedMedia = useMemo(() => {
  const currentPhase = phases[currentPhaseIndex]
  const mediaItems = currentPhase?.mediaItems || []
  const groups = {}
  mediaItems.forEach(item => {
    const title = item.title || 'Sin título'
    if (!groups[title]) groups[title] = []
    groups[title].push(item)
  })
  return groups
}, [phases, currentPhaseIndex])

// Handler para eliminar grupo completo
const handleDeleteGroup = async (items) => {
  if (!window.confirm(`¿Eliminar ${items.length} items del grupo "${items[0]?.title}"?`)) return
  const currentPhase = phases[currentPhaseIndex]
  try {
    for (const item of items) {
      await deleteMediaItem(currentPhase.phaseNumber, item._id)
    }
  } catch (error) {
    alert('Error eliminando grupo: ' + error.message)
  }
}

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

                <Chip
      label={`${currentPhase?.mediaItems?.length || 0} ${currentPhase?.mediaItems?.length === 1 ? 'item' : 'items'}`}
      size="small"
      sx={{
        bgcolor: `${theme.palette.primary.main}15`,
        color: theme.palette.primary.main,
        border: `1px solid ${theme.palette.primary.main}33`,
        fontWeight: 600,
        fontFamily: '"Poppins", sans-serif',
        px: 1.5
      }}
    />

            {/* Botón Upload - solo para admins */}
            {isAdmin && (
              <>
                <Button
    variant="outlined"
    size="small"
    startIcon={<Edit />}
    onClick={() => setManageMediaOpen(true)}
    sx={{
      borderRadius: 3,
      borderColor: theme.palette.primary.main,
      color: theme.palette.primary.main,
      fontWeight: 600,
      fontFamily: '"Poppins", sans-serif',
      textTransform: 'none',
      px: 2,
      py: 1,
      '&:hover': { 
        borderColor: theme.palette.primary.dark, 
        bgcolor: `${theme.palette.primary.main}10`
      }
    }}
  >
    Manage
  </Button>
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
              </>
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
  isAdmin={isAdmin}
  onEditMedia={async (mediaItem, newData) => {
    await updateMediaItem(currentPhase.phaseNumber, mediaItem._id, newData)
  }}
  onDeleteMedia={async (mediaItemId) => {
    await deleteMediaItem(currentPhase.phaseNumber, mediaItemId)

  }}
    uploadService={uploadService}  // ✅ Agregar esta línea

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

      {/* Dialog para gestionar media items agrupados */}
<Dialog
  open={manageMediaOpen}
  onClose={() => setManageMediaOpen(false)}
  maxWidth="md"
  fullWidth
>
  <DialogTitle>
    <Box display="flex" justifyContent="space-between" alignItems="center">
      <Typography variant="h6" fontWeight={700} sx={{ fontFamily: '"Poppins", sans-serif' }}>
        Manage Media Items - Phase {phases[currentPhaseIndex]?.phaseNumber}
      </Typography>
      <IconButton onClick={() => setManageMediaOpen(false)}>
        <Close />
      </IconButton>
    </Box>
  </DialogTitle>
  <DialogContent>
    <Box sx={{ mt: 2 }}>
      {Object.keys(groupedMedia).length === 0 ? (
        <Alert severity="info">No media items in this phase</Alert>
      ) : (
        Object.entries(groupedMedia).map(([title, items]) => (
          <Accordion 
            key={title} 
            defaultExpanded={Object.keys(groupedMedia).length === 1}
            sx={{ 
              mb: 1, 
              border: '1px solid #e0e0e0', 
              borderRadius: '8px !important',
              '&:before': { display: 'none' },
              boxShadow: 'none'
            }}
          >
            <AccordionSummary 
              expandIcon={<ExpandMore />}
              sx={{ 
                bgcolor: '#fafafa',
                borderRadius: '8px',
                '&.Mui-expanded': { borderRadius: '8px 8px 0 0' }
              }}
            >
              <Box display="flex" alignItems="center" gap={2} width="100%">
                <Typography fontWeight={600} sx={{ fontFamily: '"Poppins", sans-serif' }}>
                  {title}
                </Typography>
                <Chip 
                  label={`${items.length} ${items.length === 1 ? 'item' : 'items'}`} 
                  size="small" 
                  sx={{ 
                    bgcolor: theme.palette.primary.main,
                    color: 'white',
                    fontWeight: 600
                  }} 
                />
              </Box>
            </AccordionSummary>
            <AccordionDetails sx={{ pt: 2 }}>
              <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', mb: 2 }}>
                {items.map((item) => (
                  <Box 
                    key={item._id} 
                    sx={{ 
                      position: 'relative', 
                      width: 120, 
                      height: 90,
                      borderRadius: 2,
                      overflow: 'hidden',
                      border: '1px solid #e0e0e0',
                      bgcolor: '#000'
                    }}
                  >
                    {item.mediaType === 'video' ? (
                      <Box display="flex" alignItems="center" justifyContent="center" height="100%">
                        <PlayCircle sx={{ color: 'white', fontSize: 32 }} />
                      </Box>
                    ) : (
                      <img
                        src={item.url}
                        alt={item.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    )}
                    <Box sx={{ position: 'absolute', top: 4, right: 4, display: 'flex', gap: 0.5 }}>
                      <MediaItemEditor
                        mediaItem={item}
                        isAdmin={isAdmin}
                        onEdit={async (mediaItem, newData) => {
                          await updateMediaItem(phases[currentPhaseIndex].phaseNumber, mediaItem._id, newData)
                        }}
                        onDelete={async (mediaItemId) => {
                          await deleteMediaItem(phases[currentPhaseIndex].phaseNumber, mediaItemId)
                        }}
                        uploadService={uploadService}
                        config={{ iconSize: 16, buttonSize: 'small' }}
                      />
                    </Box>
                  </Box>
                ))}
              </Box>
              <Button
                variant="outlined"
                color="error"
                size="small"
                startIcon={<Delete />}
                onClick={() => handleDeleteGroup(items)}
                sx={{ textTransform: 'none', borderRadius: 2 }}
              >
                Delete entire group ({items.length} items)
              </Button>
            </AccordionDetails>
          </Accordion>
        ))
      )}
    </Box>
  </DialogContent>
</Dialog>
    </Box>
  )
}

export default ConstructionTab