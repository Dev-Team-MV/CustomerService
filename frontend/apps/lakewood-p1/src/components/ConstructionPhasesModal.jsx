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
import { useTranslation } from 'react-i18next'
import api from '../services/api'
import uploadService from '../services/uploadService'
import {motion, AnimatePresence} from 'framer-motion'
import GalleryCarrousel from './GalleryCarrousel'
import UploadPhaseDialog from './UploadPhaseDialog'

const ConstructionPhasesModal = ({ open, property, onClose, isAdmin }) => {
  const { t } = useTranslation('construction')
  

  const [phases, setPhases] = useState([])
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadForm, setUploadForm] = useState({
    title: '',
    percentage: 0,
    images: [],
    videos: []
  })
  const [selectedPhase, setSelectedPhase] = useState(null)
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
      images: [],
      videos: []
    })
  }

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files)
    const isVideo = e.target.accept && e.target.accept.includes('video')
    setUploadForm(prev => ({
      ...prev,
      [isVideo ? 'videos' : 'images']: [...prev[isVideo ? 'videos' : 'images'], ...files]
    }))
  }

  const handleRemoveMedia = (type, index) => {
    setUploadForm(prev => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index)
    }))
  }

  const handleUploadMedia = async () => {
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
          title: selectedPhase.title,
          constructionPercentage: newPercentage
        })
        phaseId = createResponse.data._id
      } else {
        await api.put(`/phases/${phaseId}`, {
          constructionPercentage: newPercentage
        })
      }
      for (let i = 0; i < urls.length; i++) {
        const url = urls[i]
        const mediaItemData = {
          url,
          title: uploadForm.title || t('defaultMediaTitle', { phase: selectedPhase.phaseNumber, type: 'Image', index: i + 1 }),
          percentage: addedPercentage / (urls.length + videoUrls.length),
          mediaType: 'image'
        }
        await api.post(`/phases/${phaseId}/media`, mediaItemData)
      }
      for (let i = 0; i < videoUrls.length; i++) {
        const url = videoUrls[i]
        const mediaItemData = {
          url,
          title: uploadForm.title || t('defaultMediaTitle', { phase: selectedPhase.phaseNumber, type: 'Video', index: i + 1 }),
          percentage: addedPercentage / (urls.length + videoUrls.length),
          mediaType: 'video'
        }
        await api.post(`/phases/${phaseId}/media`, mediaItemData)
      }
      alert(t('alerts.uploadSuccess'))
      setSelectedPhase(null)
      setUploadForm({ title: '', percentage: 0, images: [], videos: [] })
      fetchPhases()
    } catch (error) {
      alert(t('alerts.uploadError', { message: error.response?.data?.message || error.message }))
    } finally {
      setUploading(false)
    }
  }

  const handleDeleteMedia = async (phaseId, mediaId) => {
    if (!window.confirm(t('alerts.confirmDelete'))) return

    try {
      const phase = phases.find(p => p._id === phaseId)
      const updatedMediaItems = phase.mediaItems.filter(m => m._id !== mediaId)

      await api.put(`/phases/${phaseId}`, {
        mediaItems: updatedMediaItems
      })

      alert(t('alerts.deleteSuccess'))
      fetchPhases()
    } catch (error) {
      console.error('Error deleting media:', error)
      alert(t('alerts.deleteError'))
    }
  }

  const extractUrl = (item) => {
    if (!item) return null
    if (typeof item === 'string') return { url: item, type: 'image' }
    if (item.url) {
      const type = item.mediaType || 'image'
      return { url: item.url, type }
    }
    return null
  }

    // ✅ Agregar función helper para obtener el título traducido
  const getPhaseTitle = (phase) => {
    if (!phase) return ''
    // Si tienes el key, úsalo
    if (phase.phaseKey) return t(`phases.${phase.phaseKey}`)
    // Si solo tienes el número, mapea manualmente
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

  return (
    <>
      {/* MODAL PRINCIPAL */}
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
                  {t('title')}
                </Typography>
                <Typography 
                  variant="caption"
                  sx={{ 
                    color: '#706f6f',
                    fontFamily: '"Poppins", sans-serif'
                  }}
                >
                  {t('subtitle', { lot: property?.lot?.number })}
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
              {/* SLIDER DE FASES */}
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
                    {t('phaseCounter', { current: phases[currentPhaseIndex]?.phaseNumber, total: phases.length })}
                  </Typography>
                  <Typography 
                    variant="caption"
                    sx={{ 
                      color: '#706f6f',
                      fontFamily: '"Poppins", sans-serif'
                    }}
                  >
                    {getPhaseTitle(phases[currentPhaseIndex])}
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

              {/* CONTENIDO DE LA FASE */}
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
                        {getPhaseTitle(phases[currentPhaseIndex])}
                      </Typography>
                      <Chip
                        label={t('percentComplete', { percent: phases[currentPhaseIndex].constructionPercentage })}
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
                          {t('upload')}
                        </Box>
                      </Button>
                    )}
                  </Box>

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

                  {phases[currentPhaseIndex].mediaItems && phases[currentPhaseIndex].mediaItems.length > 0 ? (
                    <Box sx={{
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
                    }}>
                      <GalleryCarrousel
                        images={phases[currentPhaseIndex]?.mediaItems.map(extractUrl).filter(Boolean)}
                        showPagination={true}
                        showArrows={true}
                        autoPlay={false}
                        borderRadius={8}
                        objectFit="contain"
                        startIndex={0}
                        watermark="/images/logos/Logo_LakewoodOaks-08.png"
                      />
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
                      {t('noMediaYet')}
                    </Alert>
                  )}
                </Paper>
              )}
            </>
          )}
        </DialogContent>

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
            {t('close')}
          </Button>
        </DialogActions>
      </Dialog>

      <UploadPhaseDialog
        open={!!selectedPhase}
        onClose={() => setSelectedPhase(null)}
        selectedPhase={selectedPhase}
        uploadForm={uploadForm}
        setUploadForm={setUploadForm}
        uploading={uploading}
        onUpload={handleUploadMedia}
        getPhaseTitle={getPhaseTitle}
      />

      {/* LIGHTBOX */}
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