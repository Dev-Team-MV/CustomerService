import { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Grid,
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
import { Construction, Lock, CheckCircle } from '@mui/icons-material'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import PhaseUploadDialog from '@shared/components/constructionPhases/PhaseUploadDialog'
import PhaseViewer from '@shared/components/constructionPhases/PhaseViewer'
import MediaItemEditor from '@shared/components/constructionPhases/MediaItemEditor'
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

  const primary = theme.palette.primary.main
  const cardAccent = theme.palette.chipAdmin?.color || '#8CA551'

  // ✅ Obtener updateMediaItem y deleteMediaItem del hook
  const { phases, loading: phasesLoading, fetchPhases, updateMediaItem, deleteMediaItem } = usePhases({
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
      alert(t('uploadDialog.selectAtLeast', 'Por favor selecciona al menos una imagen o video'))
      return
    }

    try {
      setUploading(true)
      let urls = []
      let videoUrls = []

      if (uploadForm.images.length) {
        urls = await uploadService.uploadPhaseImages(uploadForm.images)
      }

      if (uploadForm.videos.length) {
        videoUrls = await uploadService.uploadPhaseVideos(uploadForm.videos)
      }

      const currentPhase = phases.find(p => p.phaseNumber === phaseNumber)
      const currentPercentage = currentPhase?.constructionPercentage || 0
      const addedPercentage = parseFloat(uploadForm.percentage) || 0
      const newPercentage = Math.min(100, currentPercentage + addedPercentage)

      let phaseId = currentPhase?._id
      if (!phaseId) {
        const createResponse = await api.post('/phases', {
          property: selectedProperty,
          phaseNumber: phaseNumber,
          constructionPercentage: newPercentage
        })
        phaseId = createResponse.data._id
      } else {
        await api.put(`/phases/${phaseId}`, { 
          constructionPercentage: newPercentage 
        })
      }

      const totalMedia = urls.length + videoUrls.length
      const percentagePerItem = addedPercentage / totalMedia

      for (let i = 0; i < urls.length; i++) {
        await api.post(`/phases/${phaseId}/media`, {
          url: urls[i],
          title: uploadForm.title || `${t('construction.phase', 'Fase')} ${phaseNumber} - ${t('phaseViewer.images', 'Imagen')} ${i + 1}`,
          percentage: percentagePerItem,
          mediaType: 'image',
          uploadedAt: uploadForm.uploadedAt || new Date().toISOString(),
          description: uploadForm.description || ''
        })
      }

      for (let i = 0; i < videoUrls.length; i++) {
        await api.post(`/phases/${phaseId}/media`, {
          url: videoUrls[i],
          title: uploadForm.title || `${t('construction.phase', 'Fase')} ${phaseNumber} - ${t('phaseViewer.videos', 'Video')} ${i + 1}`,
          percentage: percentagePerItem,
          mediaType: 'video',
          uploadedAt: uploadForm.uploadedAt || new Date().toISOString(),
          description: uploadForm.description || ''
        })
      }

      alert(t('construction.successUpload', 'Media subida exitosamente'))
      setSelectedPhase(null)
      await fetchPhases()
    } catch (error) {
      console.error('Error uploading media:', error)
      alert(`${t('construction.errorUploading', 'Error al subir')}: ${error.response?.data?.message || error.message}`)
    } finally {
      setUploading(false)
    }
  }

  // ✅ Handlers para editar y eliminar media items
  const handleEditMedia = async (phaseNumber, mediaItem, newData) => {
    try {
      await updateMediaItem(phaseNumber, mediaItem._id, newData)
      alert(t('construction.successUpdate', 'Media actualizado exitosamente'))
    } catch (error) {
      console.error('Error updating media:', error)
      alert(`${t('construction.errorUpdate', 'Error al actualizar')}: ${error.message}`)
    }
  }

  const handleDeleteMedia = async (phaseNumber, mediaItemId) => {
    if (!confirm(t('construction.deleteConfirm', '¿Estás seguro de eliminar este media item?'))) return
    
    try {
      await deleteMediaItem(phaseNumber, mediaItemId)
      alert(t('construction.successDelete', 'Media eliminado exitosamente'))
    } catch (error) {
      console.error('Error deleting media:', error)
      alert(`${t('construction.errorDelete', 'Error al eliminar')}: ${error.message}`)
    }
  }

  const getOwnerName = (property) => {
    if (!property.users || property.users.length === 0) return t('errors.selectProperty', 'Sin propietario')
    const owner = property.users[0]
    return `${owner.firstName || ''} ${owner.lastName || ''}`.trim() || 'Sin nombre'
  }

  const getPhasePercentage = (phaseNumber) => {
    const phase = phases.find(p => p.phaseNumber === phaseNumber)
    return phase?.constructionPercentage || 0
  }

  const isPhaseBlocked = (phaseNumber) => {
    if (phaseNumber === 1) return false
    const previousPhase = phases.find(p => p.phaseNumber === phaseNumber - 1)
    return !previousPhase || previousPhase.constructionPercentage < 100
  }

  const isPhaseComplete = (phaseNumber) => {
    return getPhasePercentage(phaseNumber) === 100
  }

  return (
    <Box>
      {/* ── Header ── */}
      <Box sx={{ mb: 3 }}>
        <Typography
          variant="h3"
          sx={{
            fontWeight: 300,
            color: primary,
            fontFamily: '"DM Sans", sans-serif',
            fontSize: { xs: '2rem', md: '2.5rem' },
            lineHeight: 1.1,
            mb: 0.5,
          }}
        >
          {t('construction.title', 'Fases de')}{' '}
          <Box component="span" sx={{ fontWeight: 800 }}>
            {t('construction.constructionTitle', 'Construcción')}
          </Box>
        </Typography>
        <Typography
          sx={{
            fontSize: '0.85rem',
            color: '#706f6f',
            fontFamily: '"DM Sans", sans-serif',
            mb: 3
          }}
        >
          {t('construction.subtitle', 'Gestiona el progreso de construcción por propiedad y fase')}
        </Typography>

        {/* Property Selector */}
        <FormControl 
          fullWidth 
          sx={{ 
            mb: 3,
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
              fontFamily: '"DM Sans", sans-serif',
            },
            '& .MuiInputLabel-root': {
              fontFamily: '"DM Sans", sans-serif',
            }
          }}
        >
          <InputLabel>{t('construction.selectProperty', 'Seleccionar Propiedad')}</InputLabel>
          <Select
            value={selectedProperty}
            onChange={(e) => setSelectedProperty(e.target.value)}
            label={t('construction.selectProperty', 'Seleccionar Propiedad')}
            disabled={loading}
          >
            {properties.map((property) => (
              <MenuItem 
                key={property._id} 
                value={property._id}
                sx={{ fontFamily: '"DM Sans", sans-serif' }}
              >
                {`Lote ${property.lot?.number || 'N/A'} - Modelo ${property.model?.model || property.model?.modelNumber || 'N/A'} - ${getOwnerName(property)}`}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {!selectedProperty && (
          <Alert 
            severity="info" 
            sx={{ 
              borderRadius: 2,
              fontFamily: '"DM Sans", sans-serif',
            }}
          >
            {t('construction.selectPropertyFirst', 'Selecciona una propiedad para gestionar sus fases de construcción')}
          </Alert>
        )}
      </Box>

      {/* Phases Grid */}
      {selectedProperty && (
        <>
          <Typography
            sx={{
              fontSize: '1.1rem',
              fontWeight: 700,
              color: primary,
              fontFamily: '"DM Sans", sans-serif',
              mb: 2.5
            }}
          >
            {t('construction.uploadPhases', 'Subir Media por Fase')}
          </Typography>
          
          <Grid container spacing={2.5} sx={{ mb: 4 }}>
            {PHASES.map((phase, index) => {
              const phaseNumber = index + 1
              const percentage = getPhasePercentage(phaseNumber)
              const blocked = isPhaseBlocked(phaseNumber)
              const complete = isPhaseComplete(phaseNumber)

              return (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05, duration: 0.4 }}
                  >
                    <Box
                      onClick={() => !blocked && handleOpenPhaseDialog(phaseNumber)}
                      sx={{
                        bgcolor: blocked ? '#f5f5f5' : 'white',
                        borderRadius: '16px',
                        border: `1px solid ${complete ? theme.palette.success.main : '#e5e7eb'}`,
                        cursor: blocked ? 'not-allowed' : 'pointer',
                        overflow: 'hidden',
                        p: 2.5,
                        minHeight: 180,
                        display: 'flex',
                        flexDirection: 'column',
                        transition: 'border-color 0.25s ease, box-shadow 0.25s ease, transform 0.25s ease',
                        opacity: blocked ? 0.6 : 1,
                        boxShadow: '0 1px 6px rgba(0,0,0,0.06)',
                        '&:hover': !blocked ? {
                          border: `1px solid ${primary}`,
                          boxShadow: `0 8px 28px ${primary}15`,
                          transform: 'translateY(-4px)',
                        } : {}
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {blocked ? (
                            <Lock sx={{ color: '#9ca3af', fontSize: 20 }} />
                          ) : complete ? (
                            <CheckCircle sx={{ color: theme.palette.success.main, fontSize: 20 }} />
                          ) : (
                            <Construction sx={{ color: primary, fontSize: 20 }} />
                          )}
                          <Chip
                            label={`${t('construction.phase', 'Fase')} ${phaseNumber}`}
                            size="small"
                            sx={{
                              bgcolor: complete ? theme.palette.success.main : primary,
                              color: 'white',
                              fontWeight: 700,
                              fontSize: '0.7rem',
                              height: 24,
                              fontFamily: '"DM Sans", sans-serif',
                            }}
                          />
                        </Box>
                        <Typography
                          sx={{
                            fontSize: '1.2rem',
                            fontWeight: 700,
                            color: complete ? theme.palette.success.main : primary,
                            fontFamily: '"DM Sans", sans-serif',
                          }}
                        >
                          {percentage}%
                        </Typography>
                      </Box>
                      
                      <Typography
                        sx={{
                          fontSize: '0.9rem',
                          fontWeight: 600,
                          color: blocked ? '#9ca3af' : '#1a2e0f',
                          fontFamily: '"DM Sans", sans-serif',
                          mb: 1.5,
                          flex: 1,
                          lineHeight: 1.3
                        }}
                      >
                        {phase}
                      </Typography>

                      <LinearProgress
                        variant="determinate"
                        value={percentage}
                        sx={{
                          width: '100%',
                          height: 6,
                          borderRadius: 3,
                          mb: 1,
                          bgcolor: '#e5e7eb',
                          '& .MuiLinearProgress-bar': {
                            borderRadius: 3,
                            bgcolor: complete ? theme.palette.success.main : primary
                          }
                        }}
                      />

                      <Typography
                        sx={{
                          fontSize: '0.75rem',
                          color: blocked ? '#9ca3af' : '#706f6f',
                          fontFamily: '"DM Sans", sans-serif',
                        }}
                      >
                        {blocked 
                          ? t('construction.phaseLocked', 'Bloqueada - Completa la fase anterior')
                          : t('construction.uploadMedia', 'Click para subir media')
                        }
                      </Typography>
                    </Box>
                  </motion.div>
                </Grid>
              )
            })}
          </Grid>

          {/* Phase Viewer con MediaItemEditor integrado */}
          {phases.length > 0 && (
            <>
              <Divider sx={{ my: 4, borderColor: '#e5e7eb' }} />
              <Typography
                sx={{
                  fontSize: '1.1rem',
                  fontWeight: 700,
                  color: primary,
                  fontFamily: '"DM Sans", sans-serif',
                  mb: 2.5
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
                isAdmin={true}
                onEditMedia={(phase, mediaItem, newData) => handleEditMedia(phase.phaseNumber, mediaItem, newData)}
                onDeleteMedia={(phase, mediaItemId) => handleDeleteMedia(phase.phaseNumber, mediaItemId)}
                uploadService={uploadService}
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