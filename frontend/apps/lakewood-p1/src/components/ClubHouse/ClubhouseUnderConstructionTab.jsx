// frontend/apps/lakewood-p1/src/components/ClubHouse/ClubhouseUnderConstructionTab.jsx
import { useState, useEffect } from 'react'
import { Box, Typography, Grid, Paper, Chip, Button, Dialog, DialogContent, IconButton } from '@mui/material'
import { Add, PhotoLibrary, Close, PlayArrow } from '@mui/icons-material'
import { format } from 'date-fns'
import ClubhouseUnderConstructionService from '../../services/ClubhouseUnderConstructionService'
import ClubhouseUnderConstructionModal from './ClubHouseUnderContructionModal'
import { useTranslation } from 'react-i18next'
import Loader from '../Loader'

const ClubhouseUnderConstructionTab = () => {
  const { t } = useTranslation('clubhouse')
  const [steps, setSteps] = useState([])
  const [modalOpen, setModalOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [galleryOpen, setGalleryOpen] = useState(false)
  const [selectedMedia, setSelectedMedia] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    loadSteps()
  }, [])

  const loadSteps = async () => {
    setLoading(true)
    try {
      const response = await ClubhouseUnderConstructionService.getAll()
      const data = Array.isArray(response) ? response : (response.clubHouseTimeline || response.timeline || response.data || [])
      setSteps(data)
    } catch (err) {
      console.error('Error loading clubhouse under construction:', err)
      setSteps([])
    }
    setLoading(false)
  }

  const handleModalClose = () => {
    setModalOpen(false)
    loadSteps()
  }

  const openGallery = (media, index = 0) => {
    setSelectedMedia(media)
    setCurrentIndex(index)
    setGalleryOpen(true)
  }

  const closeGallery = () => {
    setGalleryOpen(false)
    setSelectedMedia([])
    setCurrentIndex(0)
  }

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % selectedMedia.length)
  }

  const goToPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + selectedMedia.length) % selectedMedia.length)
  }

  // Detectar tipo de media por nombre
  const getMediaType = (media) => {
    if (media.name?.includes('video')) return 'video'
    if (media.name?.includes('image')) return 'image'
    // Fallback: detectar por extensión en URL
    const url = media.url?.toLowerCase() || ''
    if (url.includes('.mp4') || url.includes('.mov') || url.includes('.avi')) return 'video'
    return 'image'
  }

  if (loading) {
    return (
      <Box sx={{ minHeight: '40vh' }}>
        <Loader size="medium" message={t('loading', 'Loading...')} />
      </Box>
    )
  }

  return (
    <Box>
      {/* Header con botón */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h6" fontWeight={700} fontFamily='"DM Sans", sans-serif'>
          {t('underConstruction', 'Under Construction')}
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setModalOpen(true)}
          sx={{
            bgcolor: '#4a7c59',
            '&:hover': { bgcolor: '#3a5c49' },
            textTransform: 'none',
            fontWeight: 600,
            borderRadius: 2
          }}
        >
          {t('addStep', 'Add Step')}
        </Button>
      </Box>

      {/* Timeline de steps */}
      {steps.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center', bgcolor: 'grey.100', borderRadius: 3 }}>
          <PhotoLibrary sx={{ fontSize: 48, color: '#4a7c59', mb: 2 }} />
          <Typography variant="h6" fontWeight={600} mb={1}>
            {t('noSteps', 'No steps yet')}
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={2}>
            {t('addFirstStep', 'Add the first step to start.')}
          </Typography>
          <Button
            variant="outlined"
            startIcon={<Add />}
            onClick={() => setModalOpen(true)}
            sx={{ borderColor: '#4a7c59', color: '#4a7c59' }}
          >
            {t('addStep', 'Add Step')}
          </Button>
        </Paper>
      ) : (
        <Box>
          {steps.map((step, idx) => {
            const allMedia = step.media || []
            const images = allMedia.filter(m => getMediaType(m) === 'image')
            const videos = allMedia.filter(m => getMediaType(m) === 'video')
            const featuredMedia = allMedia[0]

            return (
              <Paper
                key={step._id || idx}
                elevation={3}
                sx={{
                  mb: 4,
                  borderRadius: 4,
                  overflow: 'hidden',
                  border: '2px solid rgba(74, 124, 89, 0.15)',
                  '&:hover': {
                    boxShadow: '0 12px 40px rgba(74, 124, 89, 0.2)',
                    transform: 'translateY(-4px)',
                    transition: 'all 0.3s ease'
                  }
                }}
              >
                <Grid container>
                  {/* Media principal */}
                  <Grid item xs={12} md={6}>
                    <Box
                      sx={{
                        position: 'relative',
                        height: { xs: 300, md: 400 },
                        bgcolor: '#f5f5f5',
                        cursor: 'pointer'
                      }}
                      onClick={() => openGallery(allMedia, 0)}
                    >
                      {featuredMedia ? (
                        getMediaType(featuredMedia) === 'video' ? (
                          <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
                            <video
                              src={featuredMedia.url}
                              style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover'
                              }}
                              controls
                              onClick={(e) => e.stopPropagation()}
                            />
                            <Box
                              sx={{
                                position: 'absolute',
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -50%)',
                                pointerEvents: 'none'
                              }}
                            >
                              <PlayArrow sx={{ fontSize: 80, color: 'white', opacity: 0.8 }} />
                            </Box>
                          </Box>
                        ) : (
                          <Box
                            component="img"
                            src={featuredMedia.url}
                            alt={featuredMedia.name}
                            sx={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover'
                            }}
                          />
                        )
                      ) : (
                        <Box
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                          height="100%"
                        >
                          <PhotoLibrary sx={{ fontSize: 60, color: '#ccc' }} />
                        </Box>
                      )}
                      {featuredMedia?.isPublic && (
                        <Chip
                          label="Public"
                          color="success"
                          size="small"
                          sx={{
                            position: 'absolute',
                            top: 16,
                            left: 16,
                            bgcolor: '#4caf50',
                            color: 'white',
                            fontWeight: 700
                          }}
                        />
                      )}
                      {allMedia.length > 1 && (
                        <Chip
                          label={`+${allMedia.length - 1} more`}
                          sx={{
                            position: 'absolute',
                            bottom: 16,
                            right: 16,
                            bgcolor: 'rgba(0,0,0,0.7)',
                            color: 'white',
                            fontWeight: 600
                          }}
                        />
                      )}
                    </Box>
                  </Grid>

                  {/* Información del step */}
                  <Grid item xs={12} md={6}>
                    <Box p={4}>
                      {step.clubHouseDate && (
                        <Chip
                          label={format(new Date(step.clubHouseDate), 'MMMM dd, yyyy')}
                          sx={{
                            bgcolor: '#4a7c59',
                            color: 'white',
                            fontWeight: 600,
                            mb: 2,
                            fontSize: '0.9rem'
                          }}
                        />
                      )}
                      <Typography
                        variant="h4"
                        fontWeight={700}
                        fontFamily='"DM Sans", sans-serif'
                        mb={2}
                        color="#333F1F"
                      >
                        {step.title}
                      </Typography>
                      <Typography
                        variant="body1"
                        color="text.secondary"
                        mb={3}
                        sx={{
                          fontFamily: '"DM Sans", sans-serif',
                          lineHeight: 1.8
                        }}
                      >
                        {step.description}
                      </Typography>

                      {/* Contadores de media */}
                      <Box display="flex" gap={2} mb={3}>
                        <Chip
                          icon={<PhotoLibrary />}
                          label={`${images.length} ${t('images', 'images')}`}
                          variant="outlined"
                          sx={{
                            borderColor: '#4a7c59',
                            color: '#4a7c59',
                            fontWeight: 600
                          }}
                        />
                        {videos.length > 0 && (
                          <Chip
                            icon={<PlayArrow />}
                            label={`${videos.length} ${t('videos', 'videos')}`}
                            variant="outlined"
                            sx={{
                              borderColor: '#E5863C',
                              color: '#E5863C',
                              fontWeight: 600
                            }}
                          />
                        )}
                      </Box>

                      {/* Botón para ver galería */}
                      {allMedia.length > 0 && (
                        <Button
                          variant="contained"
                          startIcon={<PhotoLibrary />}
                          onClick={() => openGallery(allMedia, 0)}
                          sx={{
                            bgcolor: '#4a7c59',
                            '&:hover': { bgcolor: '#3a5c49' },
                            textTransform: 'none',
                            fontWeight: 600
                          }}
                        >
                          {t('viewGallery', 'View Gallery')}
                        </Button>
                      )}
                    </Box>
                  </Grid>
                </Grid>
              </Paper>
            )
          })}
        </Box>
      )}

      {/* Modal de creación */}
      <ClubhouseUnderConstructionModal open={modalOpen} onClose={handleModalClose} />

      {/* Galería lightbox */}
      <Dialog
        open={galleryOpen}
        onClose={closeGallery}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: '#111',
            minHeight: '80vh'
          }
        }}
      >
        <IconButton
          onClick={closeGallery}
          sx={{
            position: 'absolute',
            top: 16,
            right: 16,
            color: 'white',
            bgcolor: 'rgba(0,0,0,0.5)',
            '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' },
            zIndex: 1
          }}
        >
          <Close />
        </IconButton>
        <DialogContent
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            p: 0,
            position: 'relative'
          }}
        >
          {selectedMedia.length > 0 && (
            <Box sx={{ width: '100%', textAlign: 'center' }}>
              {getMediaType(selectedMedia[currentIndex]) === 'video' ? (
                <video
                  src={selectedMedia[currentIndex].url}
                  controls
                  autoPlay
                  style={{
                    maxHeight: '70vh',
                    maxWidth: '100%',
                    objectFit: 'contain'
                  }}
                />
              ) : (
                <Box
                  component="img"
                  src={selectedMedia[currentIndex].url}
                  alt={selectedMedia[currentIndex].name}
                  sx={{
                    maxHeight: '70vh',
                    maxWidth: '100%',
                    objectFit: 'contain'
                  }}
                />
              )}
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center', gap: 2 }}>
                <Button
                  onClick={goToPrev}
                  disabled={selectedMedia.length <= 1}
                  sx={{ color: 'white' }}
                >
                  Previous
                </Button>
                <Typography sx={{ color: 'white', alignSelf: 'center' }}>
                  {currentIndex + 1} / {selectedMedia.length}
                </Typography>
                <Button
                  onClick={goToNext}
                  disabled={selectedMedia.length <= 1}
                  sx={{ color: 'white' }}
                >
                  Next
                </Button>
              </Box>
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  )
}

export default ClubhouseUnderConstructionTab