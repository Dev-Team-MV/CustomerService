
import { useState } from "react"
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
} from "@mui/material"
import { PhotoLibrary, Theaters } from "@mui/icons-material"
import PageHeader from '@shared/components/PageHeader'
import AgoraImagesModal from '../Components/UI/Agora/AgoraImagesModal'

const mockImages = {
  exterior: [
    { url: "/images/agora/exterior1.jpg", isPublic: true },
    { url: "/images/agora/exterior2.jpg", isPublic: true }
  ],
  blueprints: [
    { url: "/images/agora/plan1.jpg", isPublic: true }
  ],

}

const AgoraManager = () => {
  const [tab, setTab] = useState(0)
  const [modalOpen, setModalOpen] = useState(false)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxImages, setLightboxImages] = useState([])
  const [lightboxIndex, setLightboxIndex] = useState(0)
  const [error, setError] = useState(null)

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

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%)",
        p: { xs: 2, sm: 3 },
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
          title="Ágora (Teatro)"
          subtitle="Galería de imágenes del Ágora desde distintos ángulos"
          actionButton={{
            label: "Gestionar imágenes",
            onClick: () => setModalOpen(true),
            icon: <PhotoLibrary />,
            tooltip: "Subir o editar imágenes del Ágora",
          }}
        />

        <Paper
          elevation={0}
          sx={{
            mb: 2,
            borderRadius: 3,
            border: "1px solid rgba(0, 0, 0, 0.06)",
            boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
            background: "white",
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
                  color: "#4a7c59",
                },
                "&:hover": {
                  bgcolor: "rgba(74, 124, 89, 0.05)",
                },
              },
              "& .MuiTabs-indicator": {
                height: 3,
                borderRadius: "4px 4px 0 0",
                bgcolor: "#4a7c59",
              },
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
            minHeight: 300,
          }}
        >
          {tab === 0 && (
            <Grid container spacing={2}>
              {mockImages.exterior.length === 0 ? (
                <Grid item xs={12}>
                  <Typography variant="caption" color="text.secondary">
                    No hay imágenes de exterior.
                  </Typography>
                </Grid>
              ) : (
                mockImages.exterior.map((img, idx) => (
                  <Grid item xs={6} md={4} key={idx}>
                    <Box sx={{ position: "relative" }}>
                      <Box
                        component="img"
                        src={img.url}
                        alt={`Exterior ${idx + 1}`}
                        sx={{
                          width: "100%",
                          height: "250px",
                          objectFit: "contain",
                          borderRadius: 2,
                          boxShadow: "0 2px 8px rgba(140, 165, 81, 0.08)",
                          cursor: "pointer"
                        }}
                        onClick={() => openLightbox(mockImages.exterior, idx)}
                      />
                      {img.isPublic && (
                        <Chip
                          label="Public"
                          color="success"
                          size="small"
                          sx={{
                            position: "absolute",
                            top: 8,
                            left: 8,
                            bgcolor: "#4caf50",
                            color: "white",
                            fontWeight: 700,
                          }}
                        />
                      )}
                    </Box>
                  </Grid>
                ))
              )}
            </Grid>
          )}

          {tab === 1 && (
            <Grid container spacing={2}>
              {mockImages.blueprints.length === 0 ? (
                <Grid item xs={12}>
                  <Typography variant="caption" color="text.secondary">
                    No hay planos cargados.
                  </Typography>
                </Grid>
              ) : (
                mockImages.blueprints.map((img, idx) => (
                  <Grid item xs={6} md={4} key={idx}>
                    <Box sx={{ position: "relative" }}>
                      <Box
                        component="img"
                        src={img.url}
                        alt={`Plano ${idx + 1}`}
                        sx={{
                          width: "100%",
                          height: "250px",
                          objectFit: "contain",
                          borderRadius: 2,
                          boxShadow: "0 2px 8px rgba(140, 165, 81, 0.08)",
                          cursor: "pointer"
                        }}
                        onClick={() => openLightbox(mockImages.blueprints, idx)}
                      />
                      {img.isPublic && (
                        <Chip
                          label="Public"
                          color="success"
                          size="small"
                          sx={{
                            position: "absolute",
                            top: 8,
                            left: 8,
                            bgcolor: "#4caf50",
                            color: "white",
                            fontWeight: 700,
                          }}
                        />
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
                minHeight: 400,
              }}
            >
              {lightboxImages.length > 0 ? (
                <Box
                  sx={{
                    width: "100%",
                    textAlign: "center",
                    position: "relative",
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
                    }}
                  >
                    ‹
                  </IconButton>
                  <Box
                    component="img"
                    src={lightboxImages[lightboxIndex]?.url}
                    alt={`Image ${lightboxIndex + 1}`}
                    sx={{
                      maxHeight: "70vh",
                      maxWidth: "100%",
                      objectFit: "contain",
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
                    }}
                  >
                    ›
                  </IconButton>
                  <Typography
                    variant="caption"
                    sx={{
                      color: "rgba(255,255,255,0.8)",
                      display: "block",
                      mt: 1,
                    }}
                  >{`${lightboxIndex + 1} / ${lightboxImages.length}`}</Typography>
                </Box>
              ) : (
                <Typography sx={{ color: "white" }}>No images</Typography>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={closeLightbox}>Cerrar</Button>
            </DialogActions>
          </Dialog>
        </Paper>

        {/* Modal para gestión de imágenes (mock) */}
        <AgoraImagesModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          images={mockImages}
        />
      </Container>
    </Box>
  )
}

export default AgoraManager