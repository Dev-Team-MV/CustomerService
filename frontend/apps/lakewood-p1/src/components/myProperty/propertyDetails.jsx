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
                  {propertyDetails.property?.hasBalcony
                    ? t('model10Study')
                    : t('model10Config')}
                </Typography>
              </Box>
            </Alert>
          </motion.div>
        )}
  
        {/* ── Filtros de galería ─────────────────────────────── */}
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
          {[
            { key: 'all',       label: t('galleryAll'),        count: allImages.length },
            { key: 'exterior',  label: t('galleryExterior'),   count: allImages.filter(i => i.type === 'exterior').length },
            { key: 'interior',  label: t('galleryInterior'),   count: allImages.filter(i => i.type === 'interior').length },
            { key: 'blueprint', label: t('galleryBlueprints'), count: allImages.filter(i => i.type === 'blueprint').length },
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
  
        {/* ── Carrusel 3/4 + Thumbnails 1/4 ─────────────────── */}
        <Box
          sx={{
            display: 'flex',
            gap: { xs: 1.5, sm: 2 },
            mb: 4,
            height: { xs: 280, sm: 380, md: 460, lg: 520 },
          }}
        >
          {/* Imagen principal */}
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
                  {t('noPropertyImages')}
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
  
          {/* Thumbnails verticales */}
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
                  {t('noImagesAvailable')}
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
  
        {/* ── Specifications Grid ────────────────────────────── */}
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
                {t('propertySpecs')}
              </Typography>
              {isModel10 && (
                <Chip
                  label={t('model10')}
                  size="small"
                  sx={{
                    bgcolor: 'transparent',
                    border: '1.5px solid #E5863C',
                    color: '#E5863C',
                    fontWeight: 700,
                    fontSize: { xs: '0.65rem', sm: '0.7rem' },
                    height: { xs: 24, sm: 28 },
                    px: { xs: 1, sm: 1.5 },
                    fontFamily: '"Poppins", sans-serif',
                    letterSpacing: '0.5px',
                    textTransform: 'uppercase',
                    '&:hover': { bgcolor: 'rgba(229, 134, 60, 0.08)' },
                  }}
                />
              )}
            </Box>
            <Box sx={{ width: 60, height: 2, bgcolor: '#8CA551', opacity: 0.8 }} />
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

export default PropertyDetailsTab