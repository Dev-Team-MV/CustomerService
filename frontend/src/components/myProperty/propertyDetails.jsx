import React, { useState, useEffect } from 'react'
import {
  Box,
  Paper,
  Typography,
  Chip,
  Alert,
  IconButton
} from '@mui/material'
import {
  Home,
  Info,
  CheckCircle,
  ZoomIn,
  Image as ImageIcon
} from '@mui/icons-material'
import { motion } from 'framer-motion'
import PropertySpecsGrid from './PropertySpecsGrid'
import GalleryCarrousel from '../GalleryCarrousel'
import { useTranslation } from 'react-i18next'

const PropertyDetailsTab = ({ propertyDetails, isModel10, balconyLabels }) => {
  const { t } = useTranslation(['myProperty', 'common'])
  const [carouselIndex, setCarouselIndex] = useState(0)
  const [galleryFilter, setGalleryFilter] = useState("all")

  // Helper para extraer URLs
  const extractUrl = (item) => {
    if (!item) return null
    if (typeof item === 'string') return item
    if (item.url) {
      if (Array.isArray(item.url) && item.url.length > 0) {
        return typeof item.url[0] === 'string' ? item.url[0] : null
      }
      if (typeof item.url === 'string') return item.url
    }
    return null
  }

  // Gallery logic
  const galleryImages = propertyDetails?.property?.images || {
    exterior: [],
    interior: [],
  }
  const blueprintImages = propertyDetails?.property?.blueprints || []

  // Construye el array de imágenes con tipo, extrayendo URLs correctamente
  const allImages = [
    ...(Array.isArray(galleryImages.exterior)
      ? galleryImages.exterior
          .map(item => ({ url: extractUrl(item), type: "exterior" }))
          .filter(img => img.url)
      : []
    ),
    ...(Array.isArray(galleryImages.interior)
      ? galleryImages.interior
          .map(item => ({ url: extractUrl(item), type: "interior" }))
          .filter(img => img.url)
      : []
    ),
    ...(Array.isArray(blueprintImages)
      ? blueprintImages
          .map(item => ({ url: extractUrl(item), type: "blueprint" }))
          .filter(img => img.url)
      : []
    ),
  ]

  // Filtra según el tipo seleccionado
  const filterImages = (images) => {
    if (galleryFilter === "exterior")
      return images.filter((img) => img.type === "exterior")
    if (galleryFilter === "interior")
      return images.filter((img) => img.type === "interior")
    if (galleryFilter === "blueprint")
      return images.filter((img) => img.type === "blueprint")
    return images
  }

  const carouselImages = filterImages(allImages)
  const carouselUrls = carouselImages.map(img => img.url)

  useEffect(() => {
    setCarouselIndex(0)
  }, [galleryFilter])

  const handleThumbSelect = (idx) => setCarouselIndex(idx)

  return (
    <>
      <Paper elevation={0} sx={{ p: { xs: 2, sm: 3, md: 4 }, mt: 3 }}>
        {/* Alert informativo para Model 10 */}
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
                '& .MuiAlert-message': { width: '100%' },
                '& .MuiAlert-icon': { color: '#8CA551' },
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
                  {t('myProperty:model10Features', 'Model 10 Special Features')}
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
                  {propertyDetails.property?.hasBalcony
                    ? t('myProperty:model10Study', 'This property includes an Estudio - a flexible space perfect for home office or study area.')
                    : t('myProperty:model10Config', 'This is a special configuration model with unique layout options.')}
                </Typography>
              </Box>
            </Alert>
          </motion.div>
        )}

        {/* Carrusel y miniaturas */}
        <Box sx={{ mb: 3 }}>
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
                minHeight: 320,
                height: { xs: 300, sm: 360, md: 420 },
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
                overflow: "hidden",
              }}
            >
              {carouselUrls.length > 0 ? (
                <GalleryCarrousel
                  images={carouselUrls}
                  showPagination={true}
                  showArrows={true}
                  autoPlay={false}
                  borderRadius={8}
                  objectFit="contain"
                  startIndex={carouselIndex}
                  onIndexChange={setCarouselIndex}
                  watermark="/images/logos/Logo_LakewoodOaks-08.png"
                />
              ) : (
                <Box textAlign="center" width="100%">
                  <Home sx={{ fontSize: 60, color: "#666", mb: 2 }} />
                  <Typography color="white">
                    {t('myProperty:noPropertyImages', 'No property images available')}
                  </Typography>
                </Box>
              )}
              {carouselImages.length > 0 && (
                <IconButton
                  onClick={() => setCarouselIndex(carouselIndex)}
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
                  label={`${t('myProperty:galleryAll', 'All')} (${allImages.length})`}
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
                  label={`${t('myProperty:galleryExterior', 'Exterior')} (${allImages.filter((img) => img.type === "exterior").length})`}
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
                  label={`${t('myProperty:galleryInterior', 'Interior')} (${allImages.filter((img) => img.type === "interior").length})`}
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
                  label={`${t('myProperty:galleryBlueprints', 'Blueprints')} (${allImages.filter((img) => img.type === "blueprint").length})`}
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
                  "&::-webkit-scrollbar": { width: 6 },
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
                        {t('myProperty:noImagesAvailable', 'No images available')}
                      </Typography>
                    </Box>
                  ) : (
                    carouselImages.map((img, i) => (
                      <motion.div
                        key={`thumb-${i}-${galleryFilter}`}
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
                {t('myProperty:propertySpecs', 'Property Specifications')}
              </Typography>
              {isModel10 && (
                <Chip
                  label={t('myProperty:model10', 'Model 10')}
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
    </>
  )
}

export default PropertyDetailsTab