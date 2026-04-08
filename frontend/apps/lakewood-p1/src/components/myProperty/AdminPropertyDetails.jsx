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
  CheckCircle,
  ZoomIn,
  Image as ImageIcon,
  Info
} from '@mui/icons-material'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import GalleryCarrousel from '../GalleryCarrousel'
import PropertySpecsGrid from './PropertySpecsGrid'

const AdminPropertyDetails = ({ propertyDetails, isModel10, balconyLabels }) => {
  const { t } = useTranslation(['myProperty', 'common'])
  const [carouselIndex, setCarouselIndex] = useState(0)
  const [galleryFilter, setGalleryFilter] = useState("all")

  // Helper para extraer URLs
  // const extractUrl = (item) => {
  //   if (!item) return null
  //   if (typeof item === 'string') return item
  //   if (item.url) {
  //     if (Array.isArray(item.url) && item.url.length > 0) {
  //       return typeof item.url[0] === 'string' ? item.url[0] : null
  //     }
  //     if (typeof item.url === 'string') return item.url
  //   }
  //   return null
  // }
    // Helper para extraer URLs - versión mejorada
  // Helper para construir URL completa
  const buildFullUrl = (path) => {
    if (!path) return null
    // Si ya es una URL completa, retornarla
    if (path.startsWith('http://') || path.startsWith('https://')) return path
    // Construir URL completa con el backend
    const baseUrl = import.meta.env.VITE_API_URL || 'https://apicsdev.michelangelodelvalle.com'
    return `${baseUrl}/uploads/${path}`
  }

  // Helper para extraer URLs - versión mejorada
  const extractUrl = (item) => {
    if (!item) return null
    
    let rawPath = null
    
    // Caso 1: string directo
    if (typeof item === 'string') {
      rawPath = item
    }
    // Caso 2: objeto con propiedad url
    else if (item.url) {
      if (Array.isArray(item.url) && item.url.length > 0) {
        rawPath = typeof item.url[0] === 'string' ? item.url[0] : null
      } else if (typeof item.url === 'string') {
        rawPath = item.url
      }
    }
    // Caso 3: objeto con propiedad path
    else if (item.path && typeof item.path === 'string') {
      rawPath = item.path
    }
    // Caso 4: objeto con propiedad src
    else if (item.src && typeof item.src === 'string') {
      rawPath = item.src
    }
    
    if (!rawPath) {
      console.warn('⚠️ No se pudo extraer URL de:', item)
      return null
    }
    
    return buildFullUrl(rawPath)
  }

  // Imágenes y blueprints directamente de propertyDetails
  // const exterior = propertyDetails?.images?.exterior || []
  // const interior = propertyDetails?.images?.interior || []
  // const facade = propertyDetails?.facade
  //   ? Array.isArray(propertyDetails.facade)
  //     ? propertyDetails.facade
  //     : [propertyDetails.facade]
  //   : []
  // let blueprints = []
  // if (propertyDetails?.blueprints) {
  //   if (Array.isArray(propertyDetails.blueprints)) {
  //     blueprints = propertyDetails.blueprints
  //   } else if (propertyDetails.blueprints.default) {
  //     blueprints = propertyDetails.blueprints.default
  //   }
  // }

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

    console.log('🔍 PropertyDetails structure:', {
  exterior,
  interior,
  facade,
  blueprints,
  rawImages: propertyDetails?.images,
  rawFacade: propertyDetails?.facade,
  rawBlueprints: propertyDetails?.blueprints
})

  // Construye el array de imágenes con tipo, extrayendo URLs correctamente
  const allImages = [
    ...(Array.isArray(exterior)
      ? exterior
          .map(item => ({ url: extractUrl(item), type: "exterior" }))
          .filter(img => img.url)
      : []
    ),
    ...(Array.isArray(interior)
      ? interior
          .map(item => ({ url: extractUrl(item), type: "interior" }))
          .filter(img => img.url)
      : []
    ),
    ...(Array.isArray(facade)
      ? facade
          .map(item => ({ url: extractUrl(item), type: "facade" }))
          .filter(img => img.url)
      : []
    ),
    ...(Array.isArray(blueprints)
      ? blueprints
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

  const handleThumbSelect = (idx) => setCarouselIndex(idx)

  return (
    <Paper 
      elevation={0} 
      sx={{ 
        p: { xs: 2, sm: 3, md: 4 }, 
        mt: 3,
        borderRadius: 3,
        bgcolor: 'white'
      }}
    >
      {/* ✅ ALERT MODEL 10 */}
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
                {t('model10Features')}
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
                  ? t('model10Study')
                  : t('model10Config')}
              </Typography>
            </Box>
          </Alert>
        </motion.div>
      )}

      {/* ✅ FILTROS DE GALERÍA - Responsive */}
      <Box
        sx={{
          display: "flex",
          gap: 1,
          flexWrap: "wrap",
          mb: 2,
        }}
      >
        <Chip
          label={`${t('galleryAll')} (${allImages.length})`}
          size="small"
          onClick={() => setGalleryFilter("all")}
          variant={galleryFilter === "all" ? "filled" : "outlined"}
          sx={{
            fontWeight: galleryFilter === "all" ? 700 : 500,
            cursor: "pointer",
            bgcolor: galleryFilter === "all" ? '#333F1F' : 'transparent',
            color: galleryFilter === "all" ? 'white' : '#706f6f',
            borderColor: galleryFilter === "all" ? '#333F1F' : '#e0e0e0',
            fontFamily: '"Poppins", sans-serif',
            fontSize: { xs: '0.7rem', sm: '0.75rem' },
            '&:hover': {
              bgcolor: galleryFilter === "all" ? '#4a5d3a' : 'rgba(51, 63, 31, 0.08)',
            }
          }}
        />
        <Chip
          label={`${t('galleryExterior')} (${allImages.filter((img) => img.type === "exterior").length})`}
          size="small"
          onClick={() => setGalleryFilter("exterior")}
          variant={galleryFilter === "exterior" ? "filled" : "outlined"}
          sx={{
            fontWeight: galleryFilter === "exterior" ? 700 : 500,
            cursor: "pointer",
            bgcolor: galleryFilter === "exterior" ? '#333F1F' : 'transparent',
            color: galleryFilter === "exterior" ? 'white' : '#706f6f',
            borderColor: galleryFilter === "exterior" ? '#333F1F' : '#e0e0e0',
            fontFamily: '"Poppins", sans-serif',
            fontSize: { xs: '0.7rem', sm: '0.75rem' },
            '&:hover': {
              bgcolor: galleryFilter === "exterior" ? '#4a5d3a' : 'rgba(51, 63, 31, 0.08)',
            }
          }}
        />
        <Chip
          label={`${t('galleryInterior')} (${allImages.filter((img) => img.type === "interior").length})`}
          size="small"
          onClick={() => setGalleryFilter("interior")}
          variant={galleryFilter === "interior" ? "filled" : "outlined"}
          sx={{
            fontWeight: galleryFilter === "interior" ? 700 : 500,
            cursor: "pointer",
            bgcolor: galleryFilter === "interior" ? '#333F1F' : 'transparent',
            color: galleryFilter === "interior" ? 'white' : '#706f6f',
            borderColor: galleryFilter === "interior" ? '#333F1F' : '#e0e0e0',
            fontFamily: '"Poppins", sans-serif',
            fontSize: { xs: '0.7rem', sm: '0.75rem' },
            '&:hover': {
              bgcolor: galleryFilter === "interior" ? '#4a5d3a' : 'rgba(51, 63, 31, 0.08)',
            }
          }}
        />
        <Chip
          label={`${t('galleryFacade')} (${allImages.filter((img) => img.type === "facade").length})`}
          size="small"
          onClick={() => setGalleryFilter("facade")}
          variant={galleryFilter === "facade" ? "filled" : "outlined"}
          sx={{
            fontWeight: galleryFilter === "facade" ? 700 : 500,
            cursor: "pointer",
            bgcolor: galleryFilter === "facade" ? '#333F1F' : 'transparent',
            color: galleryFilter === "facade" ? 'white' : '#706f6f',
            borderColor: galleryFilter === "facade" ? '#333F1F' : '#e0e0e0',
            fontFamily: '"Poppins", sans-serif',
            fontSize: { xs: '0.7rem', sm: '0.75rem' },
            '&:hover': {
              bgcolor: galleryFilter === "facade" ? '#4a5d3a' : 'rgba(51, 63, 31, 0.08)',
            }
          }}
        />
        <Chip
          label={`${t('galleryBlueprints')} (${allImages.filter((img) => img.type === "blueprint").length})`}
          size="small"
          onClick={() => setGalleryFilter("blueprint")}
          variant={galleryFilter === "blueprint" ? "filled" : "outlined"}
          sx={{
            fontWeight: galleryFilter === "blueprint" ? 700 : 500,
            cursor: "pointer",
            bgcolor: galleryFilter === "blueprint" ? '#333F1F' : 'transparent',
            color: galleryFilter === "blueprint" ? 'white' : '#706f6f',
            borderColor: galleryFilter === "blueprint" ? '#333F1F' : '#e0e0e0',
            fontFamily: '"Poppins", sans-serif',
            fontSize: { xs: '0.7rem', sm: '0.75rem' },
            '&:hover': {
              bgcolor: galleryFilter === "blueprint" ? '#4a5d3a' : 'rgba(51, 63, 31, 0.08)',
            }
          }}
        />
      </Box>

      {/* ✅ LAYOUT RESPONSIVE - Carrusel y Thumbnails */}
      <Box sx={{ mb: 3 }}>
        <Box
          display="flex"
          gap={2}
          alignItems="flex-start"
          flexDirection={{ xs: "column", lg: "row" }}
        >
          {/* ✅ CARRUSEL PRINCIPAL - Responsive */}
          <Box
            sx={{
              flex: 1,
              width: '100%',
              bgcolor: "#000",
              borderRadius: 3,
              height: { xs: 280, sm: 360, md: 450, lg: 480 },
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {carouselImages.length > 0 ? (
              <GalleryCarrousel
                images={carouselImages.map(img => img.url)}
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
              <Box textAlign="center" width="100%" px={2}>
                <Home sx={{ fontSize: { xs: 40, sm: 60 }, color: "#666", mb: 2 }} />
                <Typography 
                  color="white"
                  sx={{
                    fontFamily: '"Poppins", sans-serif',
                    fontSize: { xs: '0.85rem', sm: '1rem' }
                  }}
                >
                  {t('noPropertyImages')}
                </Typography>
              </Box>
            )}
            {carouselImages.length > 0 && (
              <IconButton
                onClick={() => setCarouselIndex(carouselIndex)}
                sx={{
                  position: "absolute",
                  top: { xs: 8, sm: 12 },
                  right: { xs: 8, sm: 12 },
                  bgcolor: "rgba(255,255,255,0.95)",
                  width: { xs: 36, sm: 40 },
                  height: { xs: 36, sm: 40 },
                  "&:hover": {
                    bgcolor: "white",
                    transform: "scale(1.1)"
                  }
                }}
              >
                <ZoomIn sx={{ fontSize: { xs: 20, sm: 24 } }} />
              </IconButton>
            )}
          </Box>

          {/* ✅ THUMBNAILS - Grid Responsive Mejorado */}
          <Box
            sx={{
              width: { xs: "100%", lg: 320 },
            }}
          >
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "repeat(3, 1fr)",
                  sm: "repeat(4, 1fr)",
                  md: "repeat(5, 1fr)",
                  lg: "repeat(2, 1fr)"
                },
                gap: { xs: 1, sm: 1.5 },
                maxHeight: { xs: 200, lg: 480 },
                overflowY: { xs: 'auto', lg: 'auto' },
                pr: { xs: 1, lg: 1 },
                "&::-webkit-scrollbar": { width: 6 },
                "&::-webkit-scrollbar-thumb": {
                  bgcolor: "grey.400",
                  borderRadius: 3
                }
              }}
            >
              {carouselImages.length === 0 ? (
                <Box
                  sx={{
                    gridColumn: "1 / -1",
                    textAlign: "center",
                    py: { xs: 3, sm: 4 }
                  }}
                >
                  <ImageIcon sx={{ fontSize: { xs: 32, sm: 40 }, color: "#ccc", mb: 1 }} />
                  <Typography 
                    variant="caption" 
                    color="text.secondary"
                    sx={{
                      fontFamily: '"Poppins", sans-serif',
                      fontSize: { xs: '0.75rem', sm: '0.8rem' }
                    }}
                  >
                    {t('noImagesAvailable')}
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
                        height: { xs: 60, sm: 70, md: 80, lg: 90 },
                        borderRadius: 2,
                        overflow: "hidden",
                        cursor: "pointer",
                        border: i === carouselIndex
                          ? "3px solid #333F1F"
                          : "2px solid rgba(0,0,0,0.08)",
                        boxShadow: i === carouselIndex
                          ? "0 8px 24px rgba(51, 63, 31, 0.25)"
                          : "none",
                        transition: "all 0.3s ease",
                        position: "relative",
                        "&:hover": {
                          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                          borderColor: i === carouselIndex ? '#333F1F' : '#8CA551'
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
                            bgcolor: "#333F1F",
                            borderRadius: "50%",
                            width: { xs: 18, sm: 20 },
                            height: { xs: 18, sm: 20 },
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            boxShadow: '0 2px 8px rgba(51, 63, 31, 0.4)'
                          }}
                        >
                          <CheckCircle sx={{ fontSize: { xs: 12, sm: 14 }, color: "white" }} />
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

      {/* ✅ SPECIFICATIONS GRID */}
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
              {t('propertySpecs')}
            </Typography>
            {isModel10 && (
              <Chip
                label={t('model10')}
                size="small"
                sx={{
                  bgcolor: "transparent",
                  border: "1.5px solid #E5863C",
                  color: "#E5863C",
                  fontWeight: 700,
                  fontSize: { xs: "0.65rem", sm: "0.7rem" },
                  height: { xs: 24, sm: 28 },
                  px: { xs: 1, sm: 1.5 },
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
  )
}

export default AdminPropertyDetails