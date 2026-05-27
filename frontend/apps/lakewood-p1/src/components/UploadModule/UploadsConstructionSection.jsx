import { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Grid,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Alert,
  LinearProgress,
  Divider
} from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { Construction, Add, Lock, CheckCircle } from '@mui/icons-material'
import { useTranslation } from 'react-i18next'
import PhaseUploadDialog from '@shared/components/constructionPhases/PhaseUploadDialog'
import PhaseViewer from '@shared/components/constructionPhases/PhaseViewer'
import { usePhases } from '@shared/hooks/usePhases'
import api from '../../services/api'
import uploadService from '../../services/uploadService'

const PHASES = [
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

const UploadsConstructionSection = () => {
  const { t } = useTranslation('uploads')
  const theme = useTheme()
  const [properties, setProperties] = useState([])
  const [selectedProperty, setSelectedProperty] = useState('')
  const [selectedPhase, setSelectedPhase] = useState(null)
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)

  // Usar el hook de fases para obtener las fases de la propiedad seleccionada
  const { phases, loading: phasesLoading, fetchPhases } = usePhases({
    entityType: 'property',
    entityId: selectedProperty
  })

  useEffect(() => {
    fetchProperties()
  }, [])

  useEffect(() => {
    if (selectedProperty) {
      fetchPhases()
    }
  }, [selectedProperty])

  const fetchProperties = async () => {
    setLoading(true)
    try {
      const response = await api.get('/properties')
      const allProperties = response.data || []
      
      // Filtrar solo propiedades del proyecto actual (Lakewood P1)
      const projectId = import.meta.env.VITE_PROJECT_ID
      const filteredProperties = allProperties.filter(
        prop => prop.project?._id === projectId || prop.project?.slug === 'lakewood'
      )
      
      setProperties(filteredProperties)
    } catch (error) {
      console.error('Error fetching properties:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenPhaseDialog = (phaseNumber) => {
    setSelectedPhase({
      phaseNumber,
      title: PHASES[phaseNumber - 1],
      constructionPercentage: getPhasePercentage(phaseNumber)
    })
  }

const handleUploadMedia = async (phaseNumber, uploadForm) => {
  if (!uploadForm.images.length && !uploadForm.videos.length) {
    alert('Por favor selecciona al menos una imagen o video')
    return
  }

  try {
    setUploading(true)
    let urls = []
    let videoUrls = []

    // Subir imágenes
    if (uploadForm.images.length) {
      urls = await uploadService.uploadPhaseImages(uploadForm.images)
    }

    // Subir videos
    if (uploadForm.videos.length) {
      videoUrls = await uploadService.uploadPhaseVideos(uploadForm.videos)
    }

    // Calcular nuevo porcentaje
    const currentPhase = phases.find(p => p.phaseNumber === phaseNumber)
    const currentPercentage = currentPhase?.constructionPercentage || 0
    const addedPercentage = parseFloat(uploadForm.percentage) || 0
    const newPercentage = Math.min(100, currentPercentage + addedPercentage)

    // Crear o actualizar la fase
    let phaseId = currentPhase?._id
    if (!phaseId) {
      // Crear nueva fase si no existe
      const createResponse = await api.post('/phases', {
        property: selectedProperty,
        phaseNumber: phaseNumber,
        constructionPercentage: newPercentage
      })
      phaseId = createResponse.data._id
    } else {
      // Actualizar porcentaje de fase existente
      await api.put(`/phases/${phaseId}`, { 
        constructionPercentage: newPercentage 
      })
    }

    // Agregar media items a la fase
    const totalMedia = urls.length + videoUrls.length
    const percentagePerItem = addedPercentage / totalMedia

    // Agregar imágenes
    for (let i = 0; i < urls.length; i++) {
      await api.post(`/phases/${phaseId}/media`, {
        url: urls[i],
        title: uploadForm.title || `Phase ${phaseNumber} - Image ${i + 1}`,
        percentage: percentagePerItem,
        mediaType: 'image',
        uploadedAt: uploadForm.uploadedAt || new Date().toISOString(),
        description: uploadForm.description || ''
      })
    }

    // Agregar videos
    for (let i = 0; i < videoUrls.length; i++) {
      await api.post(`/phases/${phaseId}/media`, {
        url: videoUrls[i],
        title: uploadForm.title || `Phase ${phaseNumber} - Video ${i + 1}`,
        percentage: percentagePerItem,
        mediaType: 'video',
        uploadedAt: uploadForm.uploadedAt || new Date().toISOString(),
        description: uploadForm.description || ''
      })
    }

    alert('Media subida exitosamente')
    setSelectedPhase(null)
    
    // Refrescar las fases
    await fetchPhases()
  } catch (error) {
    console.error('Error uploading media:', error)
    alert(`Error al subir: ${error.response?.data?.message || error.message}`)
  } finally {
    setUploading(false)
  }
}

  // Función para obtener el nombre del propietario
  const getOwnerName = (property) => {
    if (!property.users || property.users.length === 0) return 'Sin propietario'
    const owner = property.users[0]
    return `${owner.firstName || ''} ${owner.lastName || ''}`.trim() || 'Sin nombre'
  }

  // Obtener el porcentaje de una fase específica
  const getPhasePercentage = (phaseNumber) => {
    const phase = phases.find(p => p.phaseNumber === phaseNumber)
    return phase?.constructionPercentage || 0
  }

  // Verificar si una fase está bloqueada
  const isPhaseBlocked = (phaseNumber) => {
    if (phaseNumber === 1) return false // La primera fase nunca está bloqueada
    
    // Verificar si la fase anterior está completa al 100%
    const previousPhase = phases.find(p => p.phaseNumber === phaseNumber - 1)
    return !previousPhase || previousPhase.constructionPercentage < 100
  }

  // Verificar si una fase está completa
  const isPhaseComplete = (phaseNumber) => {
    return getPhasePercentage(phaseNumber) === 100
  }

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography
          variant="h5"
          sx={{
            fontFamily: '"Poppins", sans-serif',
            fontWeight: 700,
            color: theme.palette.primary.main,
            mb: 2
          }}
        >
          🏗️ {t('construction.title', 'Fases de Construcción')}
        </Typography>

        {/* Property Selector */}
        <FormControl fullWidth sx={{ mb: 3 }}>
          <InputLabel>{t('construction.selectProperty', 'Seleccionar Propiedad')}</InputLabel>
          <Select
            value={selectedProperty}
            onChange={(e) => setSelectedProperty(e.target.value)}
            label={t('construction.selectProperty', 'Seleccionar Propiedad')}
            disabled={loading}
          >
            {properties.map((property) => (
              <MenuItem key={property._id} value={property._id}>
                {`Lote ${property.lot?.number || 'N/A'} - Modelo ${property.model?.model || property.model?.modelNumber || 'N/A'} - ${getOwnerName(property)}`}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {!selectedProperty && (
          <Alert severity="info" sx={{ borderRadius: 2 }}>
            {t('construction.selectPropertyFirst', 'Selecciona una propiedad para gestionar sus fases de construcción')}
          </Alert>
        )}
      </Box>

      {/* Phases Grid */}
      {selectedProperty && (
        <>
          <Typography
            variant="h6"
            sx={{
              fontFamily: '"Poppins", sans-serif',
              fontWeight: 600,
              mb: 2
            }}
          >
            {t('construction.uploadPhases', 'Subir Media por Fase')}
          </Typography>
          
          <Grid container spacing={2} sx={{ mb: 4 }}>
            {PHASES.map((phase, index) => {
              const phaseNumber = index + 1
              const percentage = getPhasePercentage(phaseNumber)
              const blocked = isPhaseBlocked(phaseNumber)
              const complete = isPhaseComplete(phaseNumber)

              return (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Button
                    fullWidth
                    variant="outlined"
                    onClick={() => !blocked && handleOpenPhaseDialog(phaseNumber)}
                    disabled={blocked}
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-start',
                      textAlign: 'left',
                      height: '100%',
                      transition: 'all 0.3s ease',
                      opacity: blocked ? 0.5 : 1,
                      borderColor: complete ? theme.palette.success.main : theme.palette.grey[300],
                      '&:hover': !blocked ? {
                        borderColor: theme.palette.primary.main,
                        bgcolor: `${theme.palette.primary.main}10`,
                        transform: 'translateY(-2px)',
                        boxShadow: `0 4px 12px ${theme.palette.primary.main}30`
                      } : {}
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, width: '100%', justifyContent: 'space-between' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {blocked ? (
                          <Lock sx={{ color: theme.palette.grey[400], fontSize: 20 }} />
                        ) : complete ? (
                          <CheckCircle sx={{ color: theme.palette.success.main, fontSize: 20 }} />
                        ) : (
                          <Construction sx={{ color: theme.palette.primary.main, fontSize: 20 }} />
                        )}
                        <Chip
                          label={`Fase ${phaseNumber}`}
                          size="small"
                          color={complete ? 'success' : 'primary'}
                          sx={{ fontFamily: '"Poppins", sans-serif' }}
                        />
                      </Box>
                      <Typography
                        variant="caption"
                        sx={{
                          fontFamily: '"Poppins", sans-serif',
                          fontWeight: 700,
                          color: complete ? theme.palette.success.main : theme.palette.primary.main
                        }}
                      >
                        {percentage}%
                      </Typography>
                    </Box>
                    
                    <Typography
                      variant="body2"
                      sx={{
                        fontFamily: '"Poppins", sans-serif',
                        color: theme.palette.text.primary,
                        fontWeight: 500,
                        mb: 1,
                        flex: 1
                      }}
                    >
                      {phase}
                    </Typography>

                    {/* Progress Bar */}
                    <LinearProgress
                      variant="determinate"
                      value={percentage}
                      sx={{
                        width: '100%',
                        height: 6,
                        borderRadius: 3,
                        mb: 1,
                        bgcolor: theme.palette.grey[200],
                        '& .MuiLinearProgress-bar': {
                          borderRadius: 3,
                          bgcolor: complete ? theme.palette.success.main : theme.palette.primary.main
                        }
                      }}
                    />

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Add fontSize="small" />
                      <Typography
                        variant="caption"
                        sx={{
                          fontFamily: '"Poppins", sans-serif',
                          color: theme.palette.text.secondary
                        }}
                      >
                        {blocked 
                          ? t('construction.phaseLocked', 'Bloqueada')
                          : t('construction.uploadMedia', 'Subir media')
                        }
                      </Typography>
                    </Box>
                  </Button>
                </Grid>
              )
            })}
          </Grid>

          {/* Phase Viewer */}
          {phases.length > 0 && (
            <>
              <Divider sx={{ my: 3 }} />
              <Typography
                variant="h6"
                sx={{
                  fontFamily: '"Poppins", sans-serif',
                  fontWeight: 600,
                  mb: 2
                }}
              >
                {t('construction.viewPhases', 'Ver Fases con Media')}
              </Typography>
              <PhaseViewer
                phases={phases}
                loading={phasesLoading}
                config={{
                  showProgress: true,
                  showMediaGallery: true,
                  emptyMessage: t('construction.noPhases', 'No hay fases con media todavía')
                }}
              />
            </>
          )}
        </>
      )}

      {/* Phase Upload Dialog */}
      {selectedPhase && (
        <PhaseUploadDialog
          open={!!selectedPhase}
          onClose={() => setSelectedPhase(null)}
          phase={selectedPhase}
          onUpload={handleUploadMedia}
          uploading={uploading}
          config={{ allowVideo: true, maxPercentage: 100 }}
        />
      )}
    </Box>
  )
}

export default UploadsConstructionSection