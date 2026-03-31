import { Dialog, DialogContent, IconButton, Box, Typography, Button } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew'
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos'
import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

const AmenitiesGalleryModal = ({
  open,
  onClose,
  amenity,
  amenities = [],
  images: imagesProp, // <--- NUEVO: recibe images como prop opcional
  isPublicView
}) => {
  const { t } = useTranslation(['amenities']);  
  const amenityIndex = amenity && amenities.length
    ? amenities.findIndex(a => a.name === amenity.name)
    : 0

  const [currentAmenityIndex, setCurrentAmenityIndex] = useState(amenityIndex)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  useEffect(() => {
    if (open && amenity && amenities.length) {
      const idx = amenities.findIndex(a => a.name === amenity.name)
      setCurrentAmenityIndex(idx >= 0 ? idx : 0)
      setCurrentImageIndex(0)
    }
  }, [open, amenity, amenities])

  // const currentAmenity = amenities[currentAmenityIndex] || amenity

  // // --- ADAPTACIÓN AQUÍ ---
  // // Si imagesProp está presente, úsalo; si no, usa las del amenity
  // const imagesRaw = imagesProp !== undefined
  //   ? imagesProp
  //   : (currentAmenity?.images || []);

  // // Normaliza a array de URLs
  // const images = imagesRaw.map(img =>
  //   typeof img === 'string'
  //     ? img
  //     : img?.url || ''
  // );
  // // -----------------------

  // const displayImages = isPublicView ? images.slice(0, 3) : images
  // const hasImages = displayImages.length > 0
  // const totalImages = images.length
    const currentAmenity = amenities[currentAmenityIndex] || amenity;
  
  // SIEMPRE usa las imágenes del currentAmenity para navegación interna
  const imagesRaw = currentAmenity?.images || [];
  const images = imagesRaw.map(img =>
    typeof img === 'string'
      ? img
      : img?.url || ''
  );
  const displayImages = isPublicView ? images.slice(0, 3) : images;
  const hasImages = displayImages.length > 0;
  const totalImages = images.length;

  // Navegación
  const handleNextImage = () => {
    if (currentImageIndex < displayImages.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1)
    } else if (currentAmenityIndex < amenities.length - 1) {
      setCurrentAmenityIndex(currentAmenityIndex + 1)
      setCurrentImageIndex(0)
    }
  }

  const handlePrevImage = () => {
    if (currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1)
    } else if (currentAmenityIndex > 0) {
      const prevAmenity = amenities[currentAmenityIndex - 1]
      const prevImages = isPublicView ? prevAmenity.images.slice(0, 3) : prevAmenity.images
      setCurrentAmenityIndex(currentAmenityIndex - 1)
      setCurrentImageIndex(prevImages.length - 1)
    }
  }

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!open) return
      if (e.key === 'Escape') onClose()
      else if (e.key === 'ArrowLeft') handlePrevImage()
      else if (e.key === 'ArrowRight') handleNextImage()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
    // eslint-disable-next-line
  }, [open, currentImageIndex, currentAmenityIndex, amenities, isPublicView])

  // No renderices nada si no hay amenity
  if (!currentAmenity) return null

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          maxHeight: '90vh'
        }
      }}
    >
      <Box sx={{ position: 'relative', bgcolor: '#f5f5f5' }}>
        {/* Close Button */}
        <IconButton
          onClick={onClose}
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            zIndex: 10,
            bgcolor: 'rgba(255, 255, 255, 0.9)',
            '&:hover': { bgcolor: 'rgba(255, 255, 255, 1)' }
          }}
        >
          <CloseIcon />
        </IconButton>

        {/* Header */}
        <Box sx={{
          p: 3,
          pb: 2,
          bgcolor: '#fff',
          borderBottom: '1px solid #e0e0e0'
        }}>
          <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#333' }}>
            {t(`amenityNames.${currentAmenity.name}`, currentAmenity.name)}
          </Typography>
          {hasImages && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {currentImageIndex + 1} / {displayImages.length}
              {isPublicView && totalImages > 3 && (
                <span style={{ color: '#f57c00', fontWeight: 'bold', marginLeft: 8 }}>
                  {t('showing', { shown: displayImages.length, total: totalImages })}
                </span>
              )}
            </Typography>
          )}
        </Box>

        <DialogContent sx={{ p: 0, position: 'relative', minHeight: 400 }}>
          {!hasImages ? (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: 400,
                p: 4,
                textAlign: 'center'
              }}
            >
               <Typography variant="h6" color="text.secondary" gutterBottom>
                {t('noImages')}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t('imagesSoon')}
              </Typography>
            </Box>
          ) : (
            <Box sx={{ position: 'relative', bgcolor: '#000' }}>
              {/* Current Image */}
              <Box
                sx={{
                  width: '100%',
                  height: 500,
                  backgroundImage: `url(${displayImages[currentImageIndex]})`,
                  backgroundSize: 'contain',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat'
                }}
              />

              {/* Navigation Buttons */}
              {displayImages.length > 1 && (
                <>
                  <IconButton
                    onClick={handlePrevImage}
                    sx={{
                      position: 'absolute',
                      left: 16,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      bgcolor: 'rgba(255, 255, 255, 0.9)',
                      '&:hover': { bgcolor: 'rgba(255, 255, 255, 1)' }
                    }}
                  >
                    <ArrowBackIosNewIcon />
                  </IconButton>
                  <IconButton
                    onClick={handleNextImage}
                    sx={{
                      position: 'absolute',
                      right: 16,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      bgcolor: 'rgba(255, 255, 255, 0.9)',
                      '&:hover': { bgcolor: 'rgba(255, 255, 255, 1)' }
                    }}
                  >
                    <ArrowForwardIosIcon />
                  </IconButton>
                </>
              )}
            </Box>
          )}

          {/* Public View Message */}
          {isPublicView && totalImages > 3 && (
            <Box sx={{ p: 3, bgcolor: '#fff3e0', borderTop: '1px solid #ffe0b2', textAlign: 'center' }}>
              <Typography variant="body1" sx={{ fontWeight: 'bold', color: '#e65100', mb: 1 }}>
                {t('signInToViewAll', { count: totalImages })}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {t('signInToUnlock')}
              </Typography>
              <Button
                variant="contained"
                color="primary"
                href="/login"
                sx={{ borderRadius: 2 }}
              >
                {t('signInRegister')}
              </Button>
            </Box>
          )}
        </DialogContent>
      </Box>
    </Dialog>
  )
}

export default AmenitiesGalleryModal