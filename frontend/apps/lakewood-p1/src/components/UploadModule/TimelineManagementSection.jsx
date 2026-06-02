import { useState, useEffect } from 'react'
import { Box, Typography, Grid, Paper, Chip, Button, IconButton, Dialog, DialogContent } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { Add, Edit, Delete, PhotoLibrary, Close, PlayArrow, ArrowBack } from '@mui/icons-material'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { format } from 'date-fns'
import Loader from '../Loader'

const TimelineManagementSection = ({ 
  service,
  onEdit,
  onBack,
  title,
  subtitle,
  ModalComponent
}) => {
  const { t } = useTranslation('uploads')
  const theme = useTheme()
  const [steps, setSteps] = useState([])
  const [loading, setLoading] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingStep, setEditingStep] = useState(null)
  const [galleryOpen, setGalleryOpen] = useState(false)
  const [selectedMedia, setSelectedMedia] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)

  const primary = theme.palette.primary.main

  useEffect(() => {
    loadSteps()
  }, [])

  const loadSteps = async () => {
    setLoading(true)
    try {
      const response = await service.getAll()
      const data = Array.isArray(response) 
        ? response 
        : (response.clubHouseTimeline || response.timeline || response.data || [])
      setSteps(data)
    } catch (err) {
      console.error('Error loading timeline:', err)
      setSteps([])
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (step) => {
    setEditingStep(step)
    setModalOpen(true)
  }

  const handleDelete = async (stepId) => {
    if (!confirm(t('construction.deleteConfirm', '¿Estás seguro de eliminar este item?'))) return
    
    try {
      await service.delete(stepId)
      loadSteps()
    } catch (err) {
      console.error('Error deleting step:', err)
      alert(t('construction.errorDelete', 'Error al eliminar'))
    }
  }

  const handleModalClose = () => {
    setModalOpen(false)
    setEditingStep(null)
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

  const getMediaType = (media) => {
    if (media.type) return media.type
    if (media.name?.includes('video')) return 'video'
    if (media.name?.includes('image')) return 'image'
    const url = media.url?.toLowerCase() || ''
    if (url.includes('.mp4') || url.includes('.mov') || url.includes('.avi')) return 'video'
    return 'image'
  }

  if (loading) {
    return (
      <Box sx={{ minHeight: '40vh' }}>
        <Loader size="medium" message={t('phaseViewer.loading', 'Cargando...')} />
      </Box>
    )
  }

  return (
    <Box>
      {/* Header with Back Button */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Box display="flex" alignItems="center" gap={2} mb={1}>
            <IconButton
              onClick={onBack}
              sx={{
                bgcolor: 'white',
                border: `1.5px solid ${primary}40`,
                '&:hover': {
                  bgcolor: primary,
                  color: 'white',
                }
              }}
            >
              <ArrowBack />
            </IconButton>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                color: primary,
                fontFamily: '"DM Sans", sans-serif',
              }}
            >
              {title}
            </Typography>
          </Box>
          <Typography
            sx={{
              fontSize: '0.85rem',
              color: '#706f6f',
              fontFamily: '"DM Sans", sans-serif',
              ml: 7
            }}
          >
            {subtitle}
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setModalOpen(true)}
          sx={{
            bgcolor: primary,
            '&:hover': { bgcolor: primary, opacity: 0.9 },
            textTransform: 'none',
            fontWeight: 600,
            borderRadius: 2,
            fontFamily: '"DM Sans", sans-serif',
          }}
        >
          {t('amenitiesModal.addAmenity', 'Agregar')}
        </Button>
      </Box>

      {/* Timeline Steps Grid */}
      {steps.length === 0 ? (
        <Paper sx={{ p: 6, textAlign: 'center', bgcolor: '#f8f9fa', borderRadius: 3 }}>
          <PhotoLibrary sx={{ fontSize: 64, color: primary, mb: 2, opacity: 0.5 }} />
          <Typography variant="h6" fontWeight={600} mb={1} fontFamily='"DM Sans", sans-serif'>
            {t('phaseViewer.noPhases', 'No hay items todavía')}
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={3} fontFamily='"DM Sans", sans-serif'>
            {t('clubImageModal.selectCategory', 'Agrega el primer item para comenzar')}
          </Typography>
          <Button
            variant="outlined"
            startIcon={<Add />}
            onClick={() => setModalOpen(true)}
            sx={{ 
              borderColor: primary, 
              color: primary,
              fontFamily: '"DM Sans", sans-serif',
            }}
          >
            {t('amenitiesModal.addAmenity', 'Agregar')}
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {steps.map((step, idx) => {
            const allMedia = step.media || []
            const images = allMedia.filter(m => getMediaType(m) === 'image')
            const videos = allMedia.filter(m => getMediaType(m) === 'video')
            const featuredMedia = allMedia[0]

            return (
              <Grid item xs={12} key={step._id || idx}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05, duration: 0.4 }}
                >
                  <Paper
                    elevation={0}
                    sx={{
                      borderRadius: 3,
                      overflow: 'hidden',
                      border: '1px solid #e5e7eb',
                      transition: 'all 0.25s ease',
                      '&:hover': {
                        boxShadow: `0 8px 28px ${primary}15`,
                        transform: 'translateY(-2px)',
                      }
                    }}
                  >
                    <Grid container>
                      {/* Image Section */}
                      <Grid item xs={12} md={5}>
                        <Box
                          sx={{
                            position: 'relative',
                            height: { xs: 250, md: 320 },
                            bgcolor: '#f5f5f5',
                            cursor: featuredMedia ? 'pointer' : 'default'
                          }}
                          onClick={() => featuredMedia && openGallery(allMedia, 0)}
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
                                  <PlayArrow sx={{ fontSize: 64, color: 'white', opacity: 0.9 }} />
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
                            <Box display="flex" alignItems="center" justifyContent="center" height="100%">
                              <PhotoLibrary sx={{ fontSize: 60, color: '#ccc' }} />
                            </Box>
                          )}
                          {allMedia.length > 1 && (
                            <Chip
                              label={`+${allMedia.length - 1}`}
                              sx={{
                                position: 'absolute',
                                bottom: 12,
                                right: 12,
                                bgcolor: 'rgba(0,0,0,0.7)',
                                color: 'white',
                                fontWeight: 600,
                                fontSize: '0.75rem'
                              }}
                            />
                          )}
                        </Box>
                      </Grid>

                      {/* Content Section */}
                      <Grid item xs={12} md={7}>
                        <Box p={3}>
                          {step.clubHouseDate && (
                            <Chip
                              label={format(new Date(step.clubHouseDate), 'MMMM dd, yyyy')}
                              sx={{
                                bgcolor: primary,
                                color: 'white',
                                fontWeight: 600,
                                mb: 2,
                                fontSize: '0.8rem',
                                fontFamily: '"DM Sans", sans-serif',
                              }}
                            />
                          )}
                          <Typography
                            variant="h5"
                            fontWeight={700}
                            fontFamily='"DM Sans", sans-serif'
                            mb={1.5}
                            color="#1a2e0f"
                          >
                            {step.title}
                          </Typography>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            mb={2.5}
                            sx={{
                              fontFamily: '"DM Sans", sans-serif',
                              lineHeight: 1.7
                            }}
                          >
                            {step.description}
                          </Typography>

                          <Box display="flex" gap={1.5} mb={2.5} flexWrap="wrap">
                            <Chip
                              icon={<PhotoLibrary />}
                              label={`${images.length} ${t('phaseViewer.images', 'imágenes')}`}
                              variant="outlined"
                              size="small"
                              sx={{
                                borderColor: primary,
                                color: primary,
                                fontWeight: 600,
                                fontFamily: '"DM Sans", sans-serif',
                              }}
                            />
                            {videos.length > 0 && (
                              <Chip
                                icon={<PlayArrow />}
                                label={`${videos.length} ${t('phaseViewer.videos', 'videos')}`}
                                variant="outlined"
                                size="small"
                                sx={{
                                  borderColor: '#E5863C',
                                  color: '#E5863C',
                                  fontWeight: 600,
                                  fontFamily: '"DM Sans", sans-serif',
                                }}
                              />
                            )}
                          </Box>

                          <Box display="flex" gap={1.5} flexWrap="wrap">
                            {allMedia.length > 0 && (
                              <Button
                                variant="contained"
                                size="small"
                                startIcon={<PhotoLibrary />}
                                onClick={() => openGallery(allMedia, 0)}
                                sx={{
                                  bgcolor: primary,
                                  '&:hover': { bgcolor: primary, opacity: 0.9 },
                                  textTransform: 'none',
                                  fontWeight: 600,
                                  fontFamily: '"DM Sans", sans-serif',
                                }}
                              >
                                {t('phaseViewer.view', 'Ver Galería')}
                              </Button>
                            )}
                            <Button
                              variant="outlined"
                              size="small"
                              startIcon={<Edit />}
                              onClick={() => handleEdit(step)}
                              sx={{
                                borderColor: '#8CA551',
                                color: '#8CA551',
                                textTransform: 'none',
                                fontWeight: 600,
                                fontFamily: '"DM Sans", sans-serif',
                                '&:hover': { borderColor: '#333F1F', color: '#333F1F' }
                              }}
                            >
                              {t('phaseViewer.edit', 'Editar')}
                            </Button>
                            <Button
                              variant="outlined"
                              size="small"
                              color="error"
                              startIcon={<Delete />}
                              onClick={() => handleDelete(step._id)}
                              sx={{
                                textTransform: 'none',
                                fontWeight: 600,
                                fontFamily: '"DM Sans", sans-serif',
                              }}
                            >
                              {t('phaseViewer.delete', 'Eliminar')}
                            </Button>
                          </Box>
                        </Box>
                      </Grid>
                    </Grid>
                  </Paper>
                </motion.div>
              </Grid>
            )
          })}
        </Grid>
      )}

      {/* Modal Component */}
      {ModalComponent && (
        <ModalComponent
          open={modalOpen}
          onClose={handleModalClose}
          editingStep={editingStep}
        />
      )}

      {/* Gallery Dialog */}
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
                  sx={{ color: 'white', fontFamily: '"DM Sans", sans-serif' }}
                >
                  {t('phaseViewer.previous', 'Anterior')}
                </Button>
                <Typography sx={{ color: 'white', alignSelf: 'center', fontFamily: '"DM Sans", sans-serif' }}>
                  {currentIndex + 1} / {selectedMedia.length}
                </Typography>
                <Button
                  onClick={goToNext}
                  disabled={selectedMedia.length <= 1}
                  sx={{ color: 'white', fontFamily: '"DM Sans", sans-serif' }}
                >
                  {t('phaseViewer.next', 'Siguiente')}
                </Button>
              </Box>
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  )
}

export default TimelineManagementSection