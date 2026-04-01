// @/Users/oficina/MV-CRM/CustomerService/frontend/apps/phase-2/src/Pages/AgoraManager.jsx

import { useState, useEffect } from "react"
import {
  Box,
  Typography,
  Button,
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
import PageHeader from '@shared/components/PageHeader'
import AgoraImagesModal from '../Components/UI/Agora/AgoraImagesModal'
import communitySpacesService from '../Services/ComunitySpacesService'

const AgoraManager = () => {
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
      console.log('🏛️ [AgoraManager] Fetched Agora data:', data)
      setAgoraData(data)
      setError(null)
    } catch (err) {
      console.error('❌ [AgoraManager] Error fetching Agora data:', err)
      setError('Error al cargar los datos del Ágora')
    } finally {
      setLoading(false)
    }
  }

const getExteriorImages = () => {
  return (agoraData?.space?.sections?.exterior?.images || []);
}

const getPlanosItems = () => {
  return (agoraData?.space?.sections?.planos?.items || []);
}

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
  const showNext = () =>
    setLightboxIndex((i) => Math.min(lightboxImages.length - 1, i + 1))

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: "linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%)"
        }}
      >
        <Box textAlign="center">
          <CircularProgress size={60} sx={{ color: '#8CA551', mb: 2 }} />
          <Typography color="text.secondary">Cargando datos del Ágora...</Typography>
        </Box>
      </Box>
    )
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%)",
        p: { xs: 2, sm: 3 }
      }}
    >
      <Container maxWidth="xl">
        {error && (
          <Alert
            severity="error"
            sx={{ mb: 3, borderRadius: 3 }}
            onClose={() => setError(null)}
          >
            {error}
          </Alert>
        )}

        <PageHeader
          icon={Theaters}
          title={agoraData?.label || "Ágora (Teatro)"}
          subtitle="Galería de imágenes del Ágora desde distintos ángulos"
          actionButton={{
            label: "Gestionar imágenes",
            onClick: () => setModalOpen(true),
            icon: <PhotoLibrary />,
            tooltip: "Subir o editar imágenes del Ágora"
          }}
        />

        <Paper
          elevation={0}
          sx={{
            mb: 2,
            borderRadius: 3,
            border: "1px solid rgba(0, 0, 0, 0.06)",
            boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
            background: "white"
          }}
        >
          <Tabs
            value={tab}
            onChange={(_, v) => setTab(v)}
            variant="fullWidth"
            sx={{
              "& .MuiTab-root": {
                py: 2,
                fontWeight: 700,
                fontSize: "1rem",
                textTransform: "none",
                color: "#6c757d",
                "&.Mui-selected": {
                  color: "#4a7c59"
                },
                "&:hover": {
                  bgcolor: "rgba(74, 124, 89, 0.05)"
                }
              },
              "& .MuiTabs-indicator": {
                height: 3,
                borderRadius: "4px 4px 0 0",
                bgcolor: "#4a7c59"
              }
            }}
          >
            <Tab label="Exterior" />
            <Tab label="Planos" />
          </Tabs>
        </Paper>

        <Paper
          elevation={0}
          sx={{
            borderRadius: 3,
            border: "1px solid rgba(0, 0, 0, 0.06)",
            boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
            background: "white",
            p: 3,
            minHeight: 300
          }}
        >
          {/* Exterior Tab */}
{tab === 0 && (
    <Grid container spacing={2}>
      {getExteriorImages().length === 0 ? (
        <Grid item xs={12}>
          <Box sx={{ p: 4, textAlign: 'center', bgcolor: '#f5f5f5', borderRadius: 2, border: '1px dashed #e0e0e0' }}>
            <Typography variant="body2" color="text.secondary">
              No hay imágenes de exterior.
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block" mt={1}>
              Usa el botón "Gestionar imágenes" para subir contenido
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
                alt={`Exterior ${idx + 1}`}
                sx={{
                  width: "100%",
                  height: "250px",
                  objectFit: "cover",
                  borderRadius: 2,
                  boxShadow: "0 2px 8px rgba(140, 165, 81, 0.08)",
                  cursor: "pointer",
                  transition: 'transform 0.3s',
                  '&:hover': { transform: 'scale(1.02)' }
                }}
                onClick={() => openLightbox(getExteriorImages(), idx)}
              />
              {img.isPublic && (
                <Chip
                  label="Público"
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
            <Typography variant="body2" color="text.secondary">
              No hay planos cargados.
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block" mt={1}>
              Usa el botón "Gestionar imágenes" para subir contenido
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
                alt={item.name || `Plano ${idx + 1}`}
                sx={{
                  width: "100%",
                  height: "250px",
                  objectFit: "cover",
                  borderRadius: 2,
                  boxShadow: "0 2px 8px rgba(140, 165, 81, 0.08)",
                  cursor: "pointer",
                  transition: 'transform 0.3s',
                  '&:hover': { transform: 'scale(1.02)' }
                }}
                onClick={() => openLightbox(getPlanosItems(), idx)}
              />
              {item.isPublic && (
                <Chip
                  label="Público"
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
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    bgcolor: 'rgba(0,0,0,0.7)',
                    color: 'white',
                    p: 1,
                    borderRadius: '0 0 8px 8px'
                  }}
                >
                  <Typography variant="caption" fontWeight={600}>
                    {item.name}
                  </Typography>
                </Box>
              )}
            </Box>
          </Grid>
        ))
      )}
    </Grid>
  )}

          {/* Lightbox Dialog */}
          <Dialog
            open={lightboxOpen}
            onClose={closeLightbox}
            maxWidth="xl"
            fullWidth
          >
            <DialogContent
              sx={{
                bgcolor: "#111",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                minHeight: 400
              }}
            >
              {lightboxImages.length > 0 ? (
                <Box
                  sx={{
                    width: "100%",
                    textAlign: "center",
                    position: "relative"
                  }}
                >
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
                  <Typography
                    variant="caption"
                    sx={{
                      color: "rgba(255,255,255,0.8)",
                      display: "block",
                      mt: 1
                    }}
                  >
                    {`${lightboxIndex + 1} / ${lightboxImages.length}`}
                  </Typography>
                </Box>
              ) : (
                <Typography sx={{ color: "white" }}>No hay imágenes</Typography>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={closeLightbox}>Cerrar</Button>
            </DialogActions>
          </Dialog>
        </Paper>

        {/* Modal para gestión de imágenes */}
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