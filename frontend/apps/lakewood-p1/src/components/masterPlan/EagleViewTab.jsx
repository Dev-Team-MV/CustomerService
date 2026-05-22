// frontend/apps/lakewood-p1/src/components/masterPlan/EagleViewTab.jsx
import { useState, useEffect } from 'react'
import { Box, Typography, Grid, Paper, Chip, Button } from '@mui/material'
import { Add, PhotoLibrary, PlayArrow } from '@mui/icons-material'  // ← Agregar PlayArrow
import { format } from 'date-fns'
import EagleViewService from '../../services/EagleViewService'
import EagleViewModal from './EagleViewModal'
import { useTranslation } from 'react-i18next'
import Loader from '../Loader'

const EagleViewTab = () => {
  const { t } = useTranslation('masterPlan')
  const [steps, setSteps] = useState([])
  const [modalOpen, setModalOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadSteps()
  }, [])

  const loadSteps = async () => {
    setLoading(true)
    try {
      const response = await EagleViewService.getAll()
      const data = Array.isArray(response) ? response : (response.eagleView || response.data || [])
      setSteps(data)
    } catch (err) {
      console.error('Error loading eagle view:', err)
      setSteps([])
    }
    setLoading(false)
  }

  const handleModalClose = () => {
    setModalOpen(false)
    loadSteps()
  }

  // Detectar tipo de media
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
        <Loader size="medium" message={t('loading', 'Loading...')} />
      </Box>
    )
  }

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h6" fontWeight={700} fontFamily='"Poppins", sans-serif'>
          {t('eagleView', 'Eagle View')}
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setModalOpen(true)}
          sx={{
            bgcolor: '#8CA551',
            '&:hover': { bgcolor: '#333F1F' },
            textTransform: 'none',
            fontWeight: 600,
            borderRadius: 2
          }}
        >
          {t('addStep', 'Add Step')}
        </Button>
      </Box>

      {/* Grid de steps */}
      {steps.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center', bgcolor: 'grey.100', borderRadius: 3 }}>
          <PhotoLibrary sx={{ fontSize: 48, color: '#8CA551', mb: 2 }} />
          <Typography variant="h6" fontWeight={600} mb={1}>
            {t('noSteps', 'No steps yet')}
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={2}>
            {t('addFirstStep', 'Add the first aerial view.')}
          </Typography>
          <Button
            variant="outlined"
            startIcon={<Add />}
            onClick={() => setModalOpen(true)}
            sx={{ borderColor: '#8CA551', color: '#8CA551' }}
          >
            {t('addStep', 'Add Step')}
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {steps.map((step, idx) => {
            const featuredMedia = step.media?.[0]
            const mediaType = featuredMedia ? getMediaType(featuredMedia) : null

            return (
              <Grid item xs={12} md={6} key={step._id || step.id || idx}>
                <Paper
                  elevation={3}
                  sx={{
                    borderRadius: 4,
                    overflow: 'hidden',
                    border: '2px solid rgba(140, 165, 81, 0.15)',
                    '&:hover': {
                      boxShadow: '0 12px 40px rgba(140, 165, 81, 0.2)',
                      transform: 'translateY(-4px)',
                      transition: 'all 0.3s ease'
                    }
                  }}
                >
                  {/* Media principal */}
                  <Box
                    sx={{
                      position: 'relative',
                      height: 350,
                      bgcolor: '#f5f5f5'
                    }}
                  >
                    {featuredMedia ? (
                      mediaType === 'video' ? (
                        <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
                          <video
                            src={featuredMedia.url}
                            controls
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover'
                            }}
                          />
                          <Box
                            sx={{
                              position: 'absolute',
                              top: '50%',
                              left: '50%',
                              transform: 'translate(-50%, -50%)',
                              pointerEvents: 'none',
                              opacity: 0.8
                            }}
                          >
                            <PlayArrow sx={{ fontSize: 80, color: 'white' }} />
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
                  </Box>

                  {/* Información */}
                  <Box p={3}>
                    {step.date && (
                      <Chip
                        label={format(new Date(step.date), 'MMMM dd, yyyy')}
                        sx={{
                          bgcolor: '#8CA551',
                          color: 'white',
                          fontWeight: 600,
                          mb: 2
                        }}
                      />
                    )}
                    <Typography
                      variant="h5"
                      fontWeight={700}
                      fontFamily='"Poppins", sans-serif'
                      mb={1}
                      color="#333F1F"
                    >
                      {step.title}
                    </Typography>
                    {step.description && (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          fontFamily: '"Poppins", sans-serif',
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}
                      >
                        {step.description}
                      </Typography>
                    )}
                  </Box>
                </Paper>
              </Grid>
            )
          })}
        </Grid>
      )}

      {/* Modal */}
      <EagleViewModal open={modalOpen} onClose={handleModalClose} />
    </Box>
  )
}

export default EagleViewTab