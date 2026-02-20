import React, { useState, useEffect } from 'react'
import {
  Box,
  Paper,
  Typography,
  Grid,
  Chip,
  Alert,
  Dialog,
  DialogContent,
  IconButton
} from '@mui/material'
import {
  Home,
  CheckCircle,
  KeyboardArrowLeft,
  KeyboardArrowRight,
  ZoomIn,
  Cancel,
  Image as ImageIcon,
  Info
} from '@mui/icons-material'
import { motion, AnimatePresence } from 'framer-motion'
import PropertySpecsGrid from './PropertySpecsGrid'

const AdminPropertyDetails = ({ propertyDetails, isModel10, balconyLabels }) => {
  const [carouselIndex, setCarouselIndex] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [galleryFilter, setGalleryFilter] = useState("all")

  // Imágenes y blueprints directamente de propertyDetails
  const exterior = propertyDetails?.images?.exterior || []
  const interior = propertyDetails?.images?.interior || []
  const facade = propertyDetails?.facade
    ? Array.isArray(propertyDetails.facade)
      ? propertyDetails.facade
      : [propertyDetails.facade]
    : []
  let blueprints = []
  if (propertyDetails?.blueprints) {
    if (Array.isArray(propertyDetails.blueprints)) {
      blueprints = propertyDetails.blueprints
    } else if (propertyDetails.blueprints.default) {
      blueprints = propertyDetails.blueprints.default
    }
  }

  // Construye el array de imágenes con tipo
  const allImages = [
    ...exterior.map((url) => ({ url, type: "exterior" })),
    ...interior.map((url) => ({ url, type: "interior" })),
    ...facade.map((url) => ({ url, type: "facade" })),
    ...blueprints.map((url) => ({ url, type: "blueprint" })),
  ]

  // Filtra según el tipo seleccionado
  const filterImages = (images) => {
    if (galleryFilter === "exterior")
      return images.filter((img) => img.type === "exterior")
    if (galleryFilter === "interior")
      return images.filter((img) => img.type === "interior")
    if (galleryFilter === "facade")
      return images.filter((img) => img.type === "facade")
    if (galleryFilter === "blueprint")
      return images.filter((img) => img.type === "blueprint")
    return images
  }

  const carouselImages = filterImages(allImages)

  useEffect(() => {
    setCarouselIndex(0)
  }, [galleryFilter])

  // Handlers
  const handleCarouselPrev = () => {
    if (!carouselImages.length) return
    setCarouselIndex((i) => (i - 1 + carouselImages.length) % carouselImages.length)
  }

  const handleCarouselNext = () => {
    if (!carouselImages.length) return
    setCarouselIndex((i) => (i + 1) % carouselImages.length)
  }

  const handleThumbSelect = (idx) => setCarouselIndex(idx)

  const openLightbox = () => {
    if (!carouselImages.length) return
    setLightboxOpen(true)
  }

  const closeLightbox = () => setLightboxOpen(false)

  return (
    <>
      <Paper elevation={0} sx={{ p: { xs: 2, sm: 3, md: 4 }, mt: 3 }}>
        {/* Opcional: Alert informativo para Model 10 */}
        {isModel10 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Alert
              severity="info"
              icon={<Info />}
              sx={{
                mb: 3,
                borderRadius: 3,
                bgcolor: 'rgba(140, 165, 81, 0.05)',
                border: '1px solid rgba(140, 165, 81, 0.2)',
                '& .MuiAlert-message': {
                  width: '100%',
                },
                '& .MuiAlert-icon': {
                  color: '#8CA551',
                },
              }}
            >
              <Box>
                <Typography
                  variant="body2"
                  fontWeight="600"
                  sx={{
                    mb: 0.5,
                    color: '#333F1F',
                    fontFamily: '"Poppins", sans-serif',
                    fontSize: { xs: '0.85rem', sm: '0.9rem' },
                  }}
                >
                  Model 10 Special Features
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: '#706f6f',
                    fontFamily: '"Poppins", sans-serif',
                    fontSize: { xs: '0.75rem', sm: '0.8rem' },
                    lineHeight: 1.6,
                  }}
                >
                  {propertyDetails?.hasBalcony
                    ? "This property includes an Estudio - a flexible space perfect for home office or study area."
                    : "This is a special configuration model with unique layout options."}
                </Typography>
              </Box>
            </Alert>
          </motion.div>
        )}

        {/* Carrusel y miniaturas */}
        <Box
          display="flex"
          gap={2}
          alignItems="flex-start"
          flexDirection={{ xs: "column", md: "row" }}
        >
          {/* MAIN CAROUSEL */}
          <Box
            sx={{
              flex: 1,
              bgcolor: "#000",
              borderRadius: 2,
              p: 2,
              minHeight: 320,
              height: { xs: 300, sm: 360, md: 420 },
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <AnimatePresence mode="wait">
              {carouselImages && carouselImages[carouselIndex] ? (
                <motion.img
                  key={`carousel-${carouselIndex}-${carouselImages.length}`}
                  src={carouselImages[carouselIndex].url}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  style={{
                    maxWidth: "90%",
                    maxHeight: "100%",
                    objectFit: "contain",
                    borderRadius: 8,
                    cursor: "pointer"
                  }}
                  onClick={openLightbox}
                />
              ) : (
                <Box textAlign="center">
                  <Home sx={{ fontSize: 60, color: "#666", mb: 2 }} />
                  <Typography color="white">
                    No property images available
                  </Typography>
                </Box>
              )}
            </AnimatePresence>

            {carouselImages.length > 1 && (
              <>
                <IconButton
                  onClick={handleCarouselPrev}
                  sx={{
                    position: "absolute",
                    left: 12,
                    top: "50%",
                    transform: "translateY(-50%)",
                    bgcolor: "rgba(255,255,255,0.95)",
                    boxShadow: 3,
                    "&:hover": {
                      bgcolor: "white",
                      transform: "scale(1.1) translateY(-50%)"
                    }
                  }}
                >
                  <KeyboardArrowLeft />
                </IconButton>
                <IconButton
                  onClick={handleCarouselNext}
                  sx={{
                    position: "absolute",
                    right: 12,
                    top: "50%",
                    transform: "translateY(-50%)",
                    bgcolor: "rgba(255,255,255,0.95)",
                    boxShadow: 3,
                    "&:hover": {
                      bgcolor: "white",
                      transform: "scale(1.1) translateY(-50%)"
                    }
                  }}
                >
                  <KeyboardArrowRight />
                </IconButton>
              </>
            )}

            {carouselImages.length > 0 && (
              <>
                <IconButton
                  onClick={openLightbox}
                  sx={{
                    position: "absolute",
                    top: 12,
                    right: 12,
                    bgcolor: "rgba(255,255,255,0.95)",
                    "&:hover": {
                      bgcolor: "white",
                      transform: "scale(1.1)"
                    }
                  }}
                >
                  <ZoomIn />
                </IconButton>

                <Box
                  sx={{
                    position: "absolute",
                    bottom: 12,
                    left: 12,
                    bgcolor: "rgba(0,0,0,0.7)",
                    color: "white",
                    px: 2,
                    py: 0.5,
                    borderRadius: 2,
                    backdropFilter: "blur(4px)"
                  }}
                >
                  <Typography variant="caption" fontWeight="600">
                    {carouselIndex + 1} / {carouselImages.length}
                  </Typography>
                </Box>
              </>
            )}
          </Box>

          {/* THUMBNAILS */}
          <Box
            sx={{
              width: { xs: "100%", md: 300 },
              mt: { xs: 1, md: 0 },
            }}
          >
            <Box
              sx={{
                display: "flex",
                gap: 1,
                flexWrap: "wrap",
                mb: 1,
              }}
            >
              <Chip
                label={`All (${allImages.length})`}
                size="small"
                onClick={() => setGalleryFilter("all")}
                variant={galleryFilter === "all" ? "filled" : "outlined"}
                color={galleryFilter === "all" ? "primary" : "default"}
                sx={{
                  fontWeight: galleryFilter === "all" ? 700 : 500,
                  cursor: "pointer"
                }}
              />
              <Chip
                label={`Exterior (${exterior.length})`}
                size="small"
                onClick={() => setGalleryFilter("exterior")}
                variant={galleryFilter === "exterior" ? "filled" : "outlined"}
                color={galleryFilter === "exterior" ? "primary" : "default"}
                sx={{
                  fontWeight: galleryFilter === "exterior" ? 700 : 500,
                  cursor: "pointer"
                }}
              />
              <Chip
                label={`Interior (${interior.length})`}
                size="small"
                onClick={() => setGalleryFilter("interior")}
                variant={galleryFilter === "interior" ? "filled" : "outlined"}
                color={galleryFilter === "interior" ? "primary" : "default"}
                sx={{
                  fontWeight: galleryFilter === "interior" ? 700 : 500,
                  cursor: "pointer"
                }}
              />
              <Chip
                label={`Facade (${facade.length})`}
                size="small"
                onClick={() => setGalleryFilter("facade")}
                variant={galleryFilter === "facade" ? "filled" : "outlined"}
                color={galleryFilter === "facade" ? "primary" : "default"}
                sx={{
                  fontWeight: galleryFilter === "facade" ? 700 : 500,
                  cursor: "pointer"
                }}
              />
              <Chip
                label={`Blueprints (${blueprints.length})`}
                size="small"
                onClick={() => setGalleryFilter("blueprint")}
                variant={galleryFilter === "blueprint" ? "filled" : "outlined"}
                color={galleryFilter === "blueprint" ? "primary" : "default"}
                sx={{
                  fontWeight: galleryFilter === "blueprint" ? 700 : 500,
                  cursor: "pointer"
                }}
              />
            </Box>

            <Box
              sx={{
                maxHeight: { xs: 240, md: 420 },
                overflowY: "auto",
                pr: 1,
                "&::-webkit-scrollbar": {
                  width: 6
                },
                "&::-webkit-scrollbar-thumb": {
                  bgcolor: "grey.400",
                  borderRadius: 3
                }
              }}
            >
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, 1fr)",
                  gap: 1,
                }}
              >
                {carouselImages.length === 0 ? (
                  <Box
                    sx={{
                      gridColumn: "1 / -1",
                      textAlign: "center",
                      py: 4
                    }}
                  >
                    <ImageIcon sx={{ fontSize: 40, color: "#ccc", mb: 1 }} />
                    <Typography variant="caption" color="text.secondary">
                      No images available
                    </Typography>
                  </Box>
                ) : (
                  carouselImages.map((img, i) => (
                    <motion.div
                      key={i}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Box
                        onClick={() => handleThumbSelect(i)}
                        sx={{
                          width: "100%",
                          height: { xs: 70, md: 80 },
                          borderRadius: 1.5,
                          overflow: "hidden",
                          cursor: "pointer",
                          border: i === carouselIndex
                            ? "3px solid #4a7c59"
                            : "1px solid rgba(0,0,0,0.06)",
                          boxShadow: i === carouselIndex
                            ? "0 8px 24px rgba(74,124,89,0.2)"
                            : "none",
                          transition: "all 0.3s ease",
                          position: "relative",
                          "&:hover": {
                            boxShadow: "0 4px 12px rgba(0,0,0,0.15)"
                          }
                        }}
                      >
                        <img
                          src={img.url}
                          alt={`thumb-${i}`}
                          loading="lazy"
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                        />
                        {i === carouselIndex && (
                          <Box
                            sx={{
                              position: "absolute",
                              top: 4,
                              right: 4,
                              bgcolor: "#4a7c59",
                              borderRadius: "50%",
                              width: 20,
                              height: 20,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center"
                            }}
                          >
                            <CheckCircle sx={{ fontSize: 14, color: "white" }} />
                          </Box>
                        )}
                      </Box>
                    </motion.div>
                  ))
                )}
              </Box>
            </Box>
          </Box>
        </Box>

        {/* SPECIFICATIONS GRID */}
        <Box sx={{ mt: 4 }}>
          <Box mb={3}>
            <Box display="flex" alignItems="center" gap={2} mb={1.5} flexWrap="wrap">
              <Typography
                variant="h6"
                sx={{
                  fontFamily: '"Poppins", sans-serif',
                  color: "#1a1a1a",
                  fontWeight: 700,
                  fontSize: { xs: "1.1rem", sm: "1.25rem", md: "1.5rem" },
                  letterSpacing: "0.5px",
                }}
              >
                Property Specifications
              </Typography>
              {isModel10 && (
                <Chip
                  label="Model 10"
                  size="small"
                  sx={{
                    bgcolor: "transparent",
                    border: "1.5px solid #E5863C",
                    color: "#E5863C",
                    fontWeight: 700,
                    fontSize: "0.7rem",
                    height: 28,
                    px: 1.5,
                    fontFamily: '"Poppins", sans-serif',
                    letterSpacing: "0.5px",
                    textTransform: "uppercase",
                    "&:hover": {
                      bgcolor: "rgba(229, 134, 60, 0.08)",
                    },
                  }}
                />
              )}
            </Box>

            <Box
              sx={{
                width: 60,
                height: 2,
                bgcolor: "#8CA551",
                opacity: 0.8,
              }}
            />
          </Box>

          <PropertySpecsGrid
            propertyDetails={propertyDetails}
            isModel10={isModel10}
            balconyLabels={balconyLabels}
          />
        </Box>
      </Paper>

      {/* LIGHTBOX DIALOG */}
      <Dialog
        open={lightboxOpen}
        onClose={closeLightbox}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: "transparent",
            boxShadow: "none",
            overflow: "visible"
          }
        }}
      >
        <DialogContent
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            bgcolor: "transparent",
            p: 0
          }}
        >
          <Box sx={{ position: "relative" }}>
            <IconButton
              onClick={closeLightbox}
              sx={{
                position: "absolute",
                top: -50,
                right: 0,
                color: "white",
                bgcolor: "rgba(0, 0, 0, 0.6)",
                zIndex: 10,
                "&:hover": {
                  bgcolor: "rgba(0, 0, 0, 0.8)",
                  transform: "scale(1.1)"
                },
              }}
            >
              <Cancel />
            </IconButton>
            {carouselImages.length > 0 && (
              <motion.img
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                src={carouselImages[carouselIndex].url}
                alt="lightbox"
                style={{
                  width: "100%",
                  maxHeight: "85vh",
                  objectFit: "contain",
                  borderRadius: 12,
                  boxShadow: "0 20px 60px rgba(0, 0, 0, 0.5)"
                }}
              />
            )}
          </Box>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default AdminPropertyDetails