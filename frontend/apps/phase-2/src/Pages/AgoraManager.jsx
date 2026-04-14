// AgoraManager.jsx
import { useState, useEffect } from "react"
import {
  Box,
  Typography,
  Paper,
  Grid,
  Container,
  Chip,
  Tab,
  Tabs,
  Dialog,
  DialogContent,
  DialogActions,
  IconButton,
  Alert,
  CircularProgress
} from "@mui/material"
import { PhotoLibrary, Theaters } from "@mui/icons-material"
import { useTheme } from '@mui/material/styles'
import { useTranslation } from 'react-i18next'
import PageHeader from '@shared/components/PageHeader'
import PrimaryButton from '@shared/constants/PrimaryButton'
import AgoraImagesModal from '../Components/UI/Agora/AgoraImagesModal'
import communitySpacesService from '../Services/ComunitySpacesService'

const AgoraManager = () => {
  const theme = useTheme()
  const { t } = useTranslation(['agora', 'common'])
  const [tab, setTab] = useState(0)
  const [modalOpen, setModalOpen] = useState(false)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxImages, setLightboxImages] = useState([])
  const [lightboxIndex, setLightboxIndex] = useState(0)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)
  const [agoraData, setAgoraData] = useState(null)

  useEffect(() => {
    fetchAgoraData()
  }, [])

  const fetchAgoraData = async () => {
    setLoading(true)
    try {
      const data = await communitySpacesService.getCommunitySpaceBySlug('lakewood-f2', 'agora')
      setAgoraData(data)
      setError(null)
    } catch (err) {
      console.error('❌ [AgoraManager] Error fetching Agora data:', err)
      setError(t('agora:errorLoading'))
    } finally {
      setLoading(false)
    }
  }

  const getExteriorImages = () => (agoraData?.space?.sections?.exterior?.images || [])
  const getPlanosItems = () => (agoraData?.space?.sections?.planos?.items || [])

  const openLightbox = (images, index = 0) => {
    setLightboxImages(images || [])
    setLightboxIndex(index || 0)
    setLightboxOpen(true)
  }

  const closeLightbox = () => {
    setLightboxOpen(false)
    setLightboxImages([])
    setLightboxIndex(0)
  }

  const showPrev = () => setLightboxIndex((i) => Math.max(0, i - 1))
  const showNext = () => setLightboxIndex((i) => Math.min(lightboxImages.length - 1, i + 1))

  if (loading) {
    return (
      <Box sx={{
        minHeight: "100vh",
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <Box textAlign="center">
          <CircularProgress size={60} sx={{ color: theme.palette.secondary.main, mb: 2 }} />
          <Typography color="text.secondary">{t('agora:loading')}</Typography>
        </Box>
      </Box>
    )
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: theme.palette.background.default, p: { xs: 2, sm: 3 } }}>

      <Container maxWidth="xl">
        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <PageHeader
          icon={Theaters}
          title={agoraData?.space?.label || t('agora:title')}
          subtitle={t('agora:subtitle')}
          actionButton={{
            label: t('agora:manageImages'),
            onClick: () => setModalOpen(true),
            icon: <PhotoLibrary />,
            tooltip: t('agora:manageTooltip')
          }}
        />

        <Paper elevation={0} sx={{
          mb: 2,
          borderRadius: 3,
          border: "1px solid rgba(0, 0, 0, 0.06)",
          boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
          background: "white"
        }}>
          <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="fullWidth">
            <Tab label={t('agora:sections.exterior')} />
            <Tab label={t('agora:sections.blueprints')} />
          </Tabs>
        </Paper>

        <Paper elevation={0} sx={{
          borderRadius: 3,
          border: "1px solid rgba(0, 0, 0, 0.06)",
          boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
          background: "white",
          p: 3,
          minHeight: 300
        }}>
          {/* Exterior Tab */}
          {tab === 0 && (
            <Grid container spacing={2}>
              {getExteriorImages().length === 0 ? (
                <Grid item xs={12}>
                  <Box sx={{ p: 4, textAlign: 'center', bgcolor: '#f5f5f5', borderRadius: 2, border: '1px dashed #e0e0e0' }}>
                    <Typography variant="body2" color="text.secondary">{t('agora:noExteriorImages')}</Typography>
                    <Typography variant="caption" color="text.secondary" display="block" mt={1}>
                      {t('agora:useManageButton')}
                    </Typography>
                  </Box>
                </Grid>
              ) : (
                getExteriorImages().map((img, idx) => (
                  <Grid item xs={6} md={4} key={idx}>
                    <Box sx={{ position: "relative" }}>
                      <Box
                        component="img"
                        src={img.url}
                        alt={`${t('agora:sections.exterior')} ${idx + 1}`}
                        sx={{
                          width: "100%",
                          height: "250px",
                          objectFit: "cover",
                          borderRadius: 2,
                          boxShadow: `0 2px 8px ${theme.palette.primary.main}15`,
                          cursor: "pointer",
                          transition: 'transform 0.3s',
                          '&:hover': { transform: 'scale(1.02)' }
                        }}
                        onClick={() => openLightbox(getExteriorImages(), idx)}
                      />
                      {img.isPublic && (
                        <Chip
                          label={t('common:public')}
                          color="success"
                          size="small"
                          sx={{
                            position: "absolute",
                            top: 8,
                            left: 8,
                            bgcolor: "#4caf50",
                            color: "white",
                            fontWeight: 700
                          }}
                        />
                      )}
                    </Box>
                  </Grid>
                ))
              )}
            </Grid>
          )}

          {/* Planos Tab */}
          {tab === 1 && (
            <Grid container spacing={2}>
              {getPlanosItems().length === 0 ? (
                <Grid item xs={12}>
                  <Box sx={{ p: 4, textAlign: 'center', bgcolor: '#f5f5f5', borderRadius: 2, border: '1px dashed #e0e0e0' }}>
                    <Typography variant="body2" color="text.secondary">{t('agora:noBlueprintsImages')}</Typography>
                    <Typography variant="caption" color="text.secondary" display="block" mt={1}>
                      {t('agora:useManageButton')}
                    </Typography>
                  </Box>
                </Grid>
              ) : (
                getPlanosItems().map((item, idx) => (
                  <Grid item xs={6} md={4} key={idx}>
                    <Box sx={{ position: "relative" }}>
                      <Box
                        component="img"
                        src={item.url}
                        alt={item.name || `${t('agora:sections.blueprints')} ${idx + 1}`}
                        sx={{
                          width: "100%",
                          height: "250px",
                          objectFit: "cover",
                          borderRadius: 2,
                          boxShadow: `0 2px 8px ${theme.palette.primary.main}15`,
                          cursor: "pointer",
                          transition: 'transform 0.3s',
                          '&:hover': { transform: 'scale(1.02)' }
                        }}
                        onClick={() => openLightbox(getPlanosItems(), idx)}
                      />
                      {item.isPublic && (
                        <Chip
                          label={t('common:public')}
                          color="success"
                          size="small"
                          sx={{
                            position: "absolute",
                            top: 8,
                            left: 8,
                            bgcolor: "#4caf50",
                            color: "white",
                            fontWeight: 700
                          }}
                        />
                      )}
                      {item.name && (
                        <Box sx={{
                          position: 'absolute',
                          bottom: 0,
                          left: 0,
                          right: 0,
                          bgcolor: 'rgba(0,0,0,0.7)',
                          color: 'white',
                          p: 1,
                          borderRadius: '0 0 8px 8px'
                        }}>
                          <Typography variant="caption" fontWeight={600}>{item.name}</Typography>
                        </Box>
                      )}
                    </Box>
                  </Grid>
                ))
              )}
            </Grid>
          )}

          {/* Lightbox Dialog */}
          <Dialog open={lightboxOpen} onClose={closeLightbox} maxWidth="xl" fullWidth>
            <DialogContent sx={{
              bgcolor: "#111",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              minHeight: 400
            }}>
              {lightboxImages.length > 0 ? (
                <Box sx={{ width: "100%", textAlign: "center", position: "relative" }}>
                  <IconButton
                    onClick={showPrev}
                    disabled={lightboxIndex <= 0}
                    sx={{
                      position: "absolute",
                      left: 8,
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "white",
                      bgcolor: 'rgba(255,255,255,0.1)',
                      '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' }
                    }}
                  >
                    ‹
                  </IconButton>
                  <Box
                    component="img"
                    src={typeof lightboxImages[lightboxIndex] === 'string' 
                      ? lightboxImages[lightboxIndex] 
                      : lightboxImages[lightboxIndex]?.url}
                    alt={`Image ${lightboxIndex + 1}`}
                    sx={{
                      maxHeight: "70vh",
                      maxWidth: "100%",
                      objectFit: "contain"
                    }}
                  />
                  <IconButton
                    onClick={showNext}
                    disabled={lightboxIndex >= lightboxImages.length - 1}
                    sx={{
                      position: "absolute",
                      right: 8,
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "white",
                      bgcolor: 'rgba(255,255,255,0.1)',
                      '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' }
                    }}
                  >
                    ›
                  </IconButton>
                  <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.8)", display: "block", mt: 1 }}>
                    {`${lightboxIndex + 1} / ${lightboxImages.length}`}
                  </Typography>
                </Box>
              ) : (
                <Typography sx={{ color: "white" }}>{t('agora:noImages')}</Typography>
              )}
            </DialogContent>
            <DialogActions>
              <PrimaryButton onClick={closeLightbox} variant="outlined">
                {t('agora:close')}
              </PrimaryButton>
            </DialogActions>
          </Dialog>
        </Paper>

        <AgoraImagesModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          agoraData={agoraData}
          onUploaded={fetchAgoraData}
        />
      </Container>
    </Box>
  )
}

export default AgoraManager