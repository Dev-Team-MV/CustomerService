import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  LinearProgress,
  IconButton,
  Chip,
  Alert,
  CircularProgress,
  Paper
} from '@mui/material'
import {
  Close,
  CloudUpload,
  CheckCircle,
  Lock,
  LockOpen,
  ChevronLeft,
  ChevronRight,
  Construction
} from '@mui/icons-material'
import { useTranslation } from 'react-i18next'
import GalleryCarrousel from './GalleryCarrousel'
import PhaseUploadDialog from '@shared/components/constructionPhases/PhaseUploadDialog'
import { usePhases } from '@shared/hooks/usePhases'
import uploadService from '../services/uploadService'
import api from '../services/api'

export const ConstructionPhasesContent = ({ property, isAdmin }) => {
  const { t } = useTranslation('construction')
  const { phases, loading, fetchPhases: refetch } = usePhases({ 
    entityType: 'property', 
    entityId: property?._id 
  })

  const [uploading, setUploading] = useState(false)
  const [selectedPhase, setSelectedPhase] = useState(null)
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0)

  useEffect(() => {
    if (phases.length > 0) {
      const firstIncomplete = phases.findIndex(p => p.constructionPercentage < 100)
      setCurrentPhaseIndex(firstIncomplete === -1 ? 0 : firstIncomplete)
    }
  }, [phases])

  const handleOpenUploadDialog = (phase) => {
    setSelectedPhase(phase)
  }

  const handleUploadMedia = async (phaseNumber, uploadForm) => {
    if (!uploadForm.images.length && !uploadForm.videos.length) {
      alert(t('alerts.selectMedia'))
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

      const currentPercentage = selectedPhase.constructionPercentage || 0
      const addedPercentage = parseFloat(uploadForm.percentage) || 0
      const newPercentage = Math.min(100, currentPercentage + addedPercentage)

      let phaseId = selectedPhase._id
      if (!phaseId) {
        const createResponse = await api.post('/phases', {
          property: property._id,
          phaseNumber: selectedPhase.phaseNumber,
          constructionPercentage: newPercentage
        })
        phaseId = createResponse.data._id
      } else {
        await api.put(`/phases/${phaseId}`, { constructionPercentage: newPercentage })
      }

      for (let i = 0; i < urls.length; i++) {
        await api.post(`/phases/${phaseId}/media`, {
          url: urls[i],
          title: uploadForm.title || t('defaultMediaTitle', { phase: selectedPhase.phaseNumber, type: 'Image', index: i + 1 }),
          percentage: addedPercentage / (urls.length + videoUrls.length),
          mediaType: 'image'
        })
      }
      for (let i = 0; i < videoUrls.length; i++) {
        await api.post(`/phases/${phaseId}/media`, {
          url: videoUrls[i],
          title: uploadForm.title || t('defaultMediaTitle', { phase: selectedPhase.phaseNumber, type: 'Video', index: i + 1 }),
          percentage: addedPercentage / (urls.length + videoUrls.length),
          mediaType: 'video'
        })
      }

      alert(t('alerts.uploadSuccess'))
      setSelectedPhase(null)
      refetch()
    } catch (error) {
      alert(t('alerts.uploadError', { message: error.response?.data?.message || error.message }))
    } finally {
      setUploading(false)
    }
  }

  const extractUrl = (item) => {
    if (!item) return null
    if (typeof item === 'string') return { url: item, type: 'image' }
    if (item.url) return { url: item.url, type: item.mediaType || 'image' }
    return null
  }

  const getPhaseTitle = (phase) => {
    if (!phase) return ''
    if (phase.phaseKey) return t(`phases.${phase.phaseKey}`)
    const phaseKeys = [
      'sitePreparation',
      'foundation',
      'framing',
      'roofing',
      'mepInstallation',
      'insulationDrywall',
      'interiorFinishes',
      'exteriorFinishes',
      'finalInspection'
    ]
    const key = phaseKeys[phase.phaseNumber - 1]
    return key ? t(`phases.${key}`) : phase.title
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress sx={{ color: '#8CA551' }} />
      </Box>
    )
  }

  return (
    <>
      <Box
        display="flex" alignItems="center" justifyContent="center" mb={3} gap={2}
        sx={{ p: 2.5, bgcolor: '#fafafa', borderRadius: 3, border: '1px solid #e0e0e0' }}
      >
        <IconButton
          onClick={() => setCurrentPhaseIndex(i => Math.max(i - 1, 0))}
          disabled={currentPhaseIndex === 0}
          sx={{
            bgcolor: currentPhaseIndex === 0 ? '#e0e0e0' : '#333F1F',
            color: 'white',
            '&:hover': { bgcolor: currentPhaseIndex === 0 ? '#e0e0e0' : '#8CA551' },
            '&:disabled': { bgcolor: '#e0e0e0', color: '#706f6f' }
          }}
        >
          <ChevronLeft />
        </IconButton>

        <Box sx={{ textAlign: 'center', minWidth: 180 }}>
          <Typography variant="h6" fontWeight={700} sx={{ color: '#333F1F', fontFamily: '"Poppins", sans-serif' }}>
            {t('phaseCounter', { current: phases[currentPhaseIndex]?.phaseNumber, total: phases.length })}
          </Typography>
          <Typography variant="caption" sx={{ color: '#706f6f', fontFamily: '"Poppins", sans-serif' }}>
            {getPhaseTitle(phases[currentPhaseIndex])}
          </Typography>
        </Box>

        <IconButton
          onClick={() => setCurrentPhaseIndex(i => Math.min(i + 1, phases.length - 1))}
          disabled={currentPhaseIndex === phases.length - 1 || phases[currentPhaseIndex]?.constructionPercentage < 100}
          sx={{
            bgcolor: (currentPhaseIndex === phases.length - 1 || phases[currentPhaseIndex]?.constructionPercentage < 100) ? '#e0e0e0' : '#333F1F',
            color: 'white',
            '&:hover': { bgcolor: (currentPhaseIndex === phases.length - 1 || phases[currentPhaseIndex]?.constructionPercentage < 100) ? '#e0e0e0' : '#8CA551' },
            '&:disabled': { bgcolor: '#e0e0e0', color: '#706f6f' }
          }}
        >
          <ChevronRight />
        </IconButton>
      </Box>

      {phases[currentPhaseIndex] && (
        <Paper elevation={0} sx={{ p: 3, mb: 3, bgcolor: 'white', borderRadius: 3, border: '1px solid #e0e0e0' }}>
          <Box display="flex" alignItems="center" gap={2} mb={3}>
            <Box sx={{
              width: 54, height: 54, borderRadius: 3,
              bgcolor: phases[currentPhaseIndex].constructionPercentage === 100 ? '#8CA551'
                : phases[currentPhaseIndex].constructionPercentage > 0 ? '#E5863C' : '#706f6f',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
            }}>
              {phases[currentPhaseIndex].constructionPercentage === 100
                ? <CheckCircle sx={{ fontSize: 32, color: 'white' }} />
                : phases[currentPhaseIndex].constructionPercentage > 0
                ? <LockOpen sx={{ fontSize: 32, color: 'white' }} />
                : <Lock sx={{ fontSize: 32, color: 'white' }} />
              }
            </Box>

            <Box flex={1}>
              <Typography variant="h6" fontWeight={700} sx={{ color: '#333F1F', fontFamily: '"Poppins", sans-serif' }}>
                {getPhaseTitle(phases[currentPhaseIndex])}
              </Typography>
              <Chip
                label={t('percentComplete', { percent: phases[currentPhaseIndex].constructionPercentage })}
                size="small"
                sx={{
                  mt: 0.5,
                  bgcolor: phases[currentPhaseIndex].constructionPercentage === 100 ? 'rgba(140,165,81,0.12)' : 'rgba(229,134,60,0.12)',
                  color: '#333F1F',
                  border: `1px solid ${phases[currentPhaseIndex].constructionPercentage === 100 ? '#8CA551' : '#E5863C'}`,
                  fontWeight: 600, fontFamily: '"Poppins", sans-serif'
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
                  borderRadius: 3, bgcolor: '#333F1F', color: 'white',
                  fontWeight: 600, fontFamily: '"Poppins", sans-serif',
                  textTransform: 'none', px: 3, py: 1,
                  boxShadow: '0 4px 12px rgba(51,63,31,0.25)',
                  '&:hover': { bgcolor: '#8CA551', boxShadow: '0 8px 20px rgba(51,63,31,0.35)' }
                }}
              >
                {t('upload')}
              </Button>
            )}
          </Box>

          <Box mb={3}>
            <LinearProgress
              variant="determinate"
              value={phases[currentPhaseIndex].constructionPercentage}
              sx={{
                height: 12, borderRadius: 3, bgcolor: '#e0e0e0',
                '& .MuiLinearProgress-bar': {
                  bgcolor: phases[currentPhaseIndex].constructionPercentage === 100 ? '#8CA551' : '#E5863C',
                  borderRadius: 3
                }
              }}
            />
          </Box>

          {phases[currentPhaseIndex].mediaItems?.length > 0 ? (
            <Box sx={{ bgcolor: '#000', borderRadius: 3, p: 2, minHeight: 280, height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
              <GalleryCarrousel
                images={phases[currentPhaseIndex].mediaItems.map(extractUrl).filter(Boolean)}
                showPagination autoPlay={false} borderRadius={8} objectFit="contain" startIndex={0}
                watermark="/images/logos/Logo_LakewoodOaks-08.png"
              />
            </Box>
          ) : (
            <Alert severity="info" icon="ℹ️" sx={{ borderRadius: 2, bgcolor: 'rgba(140,165,81,0.08)', border: '1px solid rgba(140,165,81,0.2)', '& .MuiAlert-message': { fontFamily: '"Poppins", sans-serif', color: '#333F1F' } }}>
              {t('noMediaYet')}
            </Alert>
          )}
        </Paper>
      )}

      <PhaseUploadDialog
        open={!!selectedPhase}
        onClose={() => setSelectedPhase(null)}
        phase={selectedPhase}
        onUpload={handleUploadMedia}
        uploading={uploading}
        config={{ allowVideo: true, maxPercentage: 100 }}
      />
    </>
  )
}

const ConstructionPhasesModal = ({ open, property, onClose, isAdmin }) => {
  const { t } = useTranslation('construction')

  return (
    <Dialog
      open={open} onClose={onClose} maxWidth="lg" fullWidth
      PaperProps={{ sx: { borderRadius: 4, boxShadow: '0 20px 60px rgba(51,63,31,0.15)' } }}
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box display="flex" alignItems="center" gap={2}>
            <Box sx={{ width: 48, height: 48, borderRadius: 3, bgcolor: '#333F1F', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Construction sx={{ color: 'white', fontSize: 24 }} />
            </Box>
            <Box>
              <Typography variant="h6" fontWeight={700} sx={{ color: '#333F1F', fontFamily: '"Poppins", sans-serif' }}>
                {t('title')}
              </Typography>
              <Typography variant="caption" sx={{ color: '#706f6f', fontFamily: '"Poppins", sans-serif' }}>
                {t('subtitle', { lot: property?.lot?.number })}
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={onClose} sx={{ color: '#706f6f', '&:hover': { bgcolor: 'rgba(112,111,111,0.08)' } }}>
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ pt: 3 }}>
        <ConstructionPhasesContent property={property} isAdmin={isAdmin} />
      </DialogContent>

      <DialogActions sx={{ p: 3 }}>
        <Button onClick={onClose}
          sx={{ borderRadius: 3, textTransform: 'none', fontWeight: 600, px: 3, py: 1.2, color: '#706f6f', fontFamily: '"Poppins", sans-serif', border: '2px solid #e0e0e0', '&:hover': { bgcolor: 'rgba(112,111,111,0.05)', borderColor: '#706f6f' } }}>
          {t('close')}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default ConstructionPhasesModal