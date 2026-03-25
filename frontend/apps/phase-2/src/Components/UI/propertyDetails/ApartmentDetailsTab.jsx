import { useState, useEffect } from 'react'
import {
  Box, Paper, Typography, Chip, Alert, IconButton
} from '@mui/material'
import {
  Home, Info, CheckCircle, ZoomIn, Image as ImageIcon
} from '@mui/icons-material'
import { motion } from 'framer-motion'

const ApartmentDetailsTab = ({ apartmentDetails }) => {
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
  const galleryImages = apartmentDetails?.images || {
    exterior: [],
    interior: [],
  }
  const blueprintImages = apartmentDetails?.blueprints || []

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
      {/* Gallery filters */}
      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
        {[
          { key: 'all',       label: 'All',        count: allImages.length },
          { key: 'exterior',  label: 'Exterior',   count: allImages.filter(i => i.type === 'exterior').length },
          { key: 'interior',  label: 'Interior',   count: allImages.filter(i => i.type === 'interior').length },
          { key: 'blueprint', label: 'Blueprints', count: allImages.filter(i => i.type === 'blueprint').length },
        ].map(({ key, label, count }) => (
          <Chip
            key={key}
            label={`${label} (${count})`}
            size="small"
            onClick={() => setGalleryFilter(key)}
            sx={{
              cursor: 'pointer',
              fontFamily: '"Poppins", sans-serif',
              fontSize: { xs: '0.7rem', sm: '0.75rem' },
              fontWeight: galleryFilter === key ? 700 : 500,
              bgcolor: galleryFilter === key ? '#333F1F' : 'transparent',
              color: galleryFilter === key ? 'white' : '#706f6f',
              border: `1px solid ${galleryFilter === key ? '#333F1F' : '#e0e0e0'}`,
              '&:hover': {
                bgcolor: galleryFilter === key ? '#4a5d3a' : 'rgba(51, 63, 31, 0.08)',
              }
            }}
          />
        ))}
      </Box>

      {/* Gallery */}
      <Box
        sx={{
          display: 'flex',
          gap: { xs: 1.5, sm: 2 },
          mb: 4,
          height: { xs: 280, sm: 380, md: 460, lg: 520 },
        }}
      >
        {/* Main image */}
        <Box
          sx={{
            flex: 3,
            bgcolor: '#000',
            borderRadius: 3,
            position: 'relative',
            overflow: 'hidden',
            minWidth: 0,
          }}
        >
          {carouselImages.length > 0 ? (
            <img
              src={carouselImages[carouselIndex].url}
              alt={`apartment-img-${carouselIndex}`}
              style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
            />
          ) : (
            <Box
              display="flex"
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
              height="100%"
              px={2}
            >
              <Home sx={{ fontSize: { xs: 40, sm: 60 }, color: '#666', mb: 2 }} />
              <Typography
                color="white"
                sx={{ fontFamily: '"Poppins", sans-serif', fontSize: { xs: '0.85rem', sm: '1rem' } }}
              >
                No apartment images
              </Typography>
            </Box>
          )}

          {carouselImages.length > 0 && (
            <IconButton
              sx={{
                position: 'absolute',
                top: { xs: 8, sm: 12 },
                right: { xs: 8, sm: 12 },
                bgcolor: 'rgba(255,255,255,0.95)',
                width: { xs: 32, sm: 38 },
                height: { xs: 32, sm: 38 },
                '&:hover': { bgcolor: 'white', transform: 'scale(1.1)' }
              }}
            >
              <ZoomIn sx={{ fontSize: { xs: 18, sm: 22 } }} />
            </IconButton>
          )}
        </Box>

        {/* Thumbnails */}
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: { xs: 0.8, sm: 1 },
            overflowY: 'auto',
            minWidth: 0,
            pr: 0.5,
            '&::-webkit-scrollbar': { width: 4 },
            '&::-webkit-scrollbar-track': { bgcolor: 'transparent' },
            '&::-webkit-scrollbar-thumb': {
              bgcolor: 'rgba(51, 63, 31, 0.2)',
              borderRadius: 2,
            },
          }}
        >
          {carouselImages.length === 0 ? (
            <Box
              display="flex"
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
              height="100%"
            >
              <ImageIcon sx={{ fontSize: 32, color: '#ccc', mb: 1 }} />
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ fontFamily: '"Poppins", sans-serif', fontSize: '0.7rem', textAlign: 'center' }}
              >
                No images available
              </Typography>
            </Box>
          ) : (
            carouselImages.map((img, i) => (
              <motion.div
                key={`thumb-${i}-${galleryFilter}`}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                style={{ flexShrink: 0 }}
              >
                <Box
                  onClick={() => handleThumbSelect(i)}
                  sx={{
                    width: '100%',
                    aspectRatio: '16/9',
                    borderRadius: 1.5,
                    overflow: 'hidden',
                    cursor: 'pointer',
                    border: i === carouselIndex
                      ? '2.5px solid #333F1F'
                      : '1.5px solid rgba(0,0,0,0.08)',
                    boxShadow: i === carouselIndex
                      ? '0 4px 16px rgba(51, 63, 31, 0.3)'
                      : 'none',
                    transition: 'all 0.25s ease',
                    position: 'relative',
                    '&:hover': {
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                      borderColor: i === carouselIndex ? '#333F1F' : '#8CA551',
                    }
                  }}
                >
                  <img
                    src={img.url}
                    alt={`thumb-${i}`}
                    loading="lazy"
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  />
                  {i === carouselIndex && (
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 4,
                        right: 4,
                        bgcolor: '#333F1F',
                        borderRadius: '50%',
                        width: 18,
                        height: 18,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 2px 8px rgba(51, 63, 31, 0.4)'
                      }}
                    >
                      <CheckCircle sx={{ fontSize: 12, color: 'white' }} />
                    </Box>
                  )}
                </Box>
              </motion.div>
            ))
          )}
        </Box>
      </Box>

      {/* Apartment specs */}
      <Box sx={{ mt: 4 }}>
        <Box mb={3}>
          <Box display="flex" alignItems="center" gap={2} mb={1.5} flexWrap="wrap">
            <Typography
              variant="h6"
              sx={{
                fontFamily: '"Poppins", sans-serif',
                color: '#1a1a1a',
                fontWeight: 700,
                fontSize: { xs: '1.1rem', sm: '1.25rem', md: '1.5rem' },
                letterSpacing: '0.5px',
              }}
            >
              Apartment Specs
            </Typography>
          </Box>
          <Box sx={{ width: 60, height: 2, bgcolor: '#8CA551', opacity: 0.8 }} />
        </Box>
        {/* Puedes crear un ApartmentSpecsGrid si lo necesitas */}
        <Box>
          <Typography variant="body2" sx={{ color: '#706f6f', fontFamily: '"Poppins", sans-serif' }}>
            Model: {apartmentDetails?.apartmentModel?.name || 'N/A'}
          </Typography>
          <Typography variant="body2" sx={{ color: '#706f6f', fontFamily: '"Poppins", sans-serif' }}>
            Floor: {apartmentDetails?.floorNumber || 'N/A'}
          </Typography>
          <Typography variant="body2" sx={{ color: '#706f6f', fontFamily: '"Poppins", sans-serif' }}>
            Area: {apartmentDetails?.area ? `${apartmentDetails.area} m²` : 'N/A'}
          </Typography>
          {/* Agrega más specs según tu modelo */}
        </Box>
      </Box>
    </Paper>
  )
}

export default ApartmentDetailsTab