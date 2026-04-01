// @/Users/oficina/MV-CRM/CustomerService/frontend/apps/phase-2/src/Components/UI/Amenities/AmenitiesGalleryModal.jsx

import { Dialog, DialogContent, IconButton, Box, Typography } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew'
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos'
import { useState, useEffect } from 'react'

const AmenitiesGalleryModal = ({
  open,
  onClose,
  amenity,
  amenities = [],
  isPublicView
}) => {
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

  const currentAmenity = amenities[currentAmenityIndex] || amenity
  
  // Process images to handle both string URLs and {url, isPublic} objects
  const processImages = (imgs) => {
    if (!imgs || !Array.isArray(imgs)) return []
    
    return imgs
      .filter(img => {
        // Filter by visibility if in public view
        if (isPublicView) {
          return typeof img === 'string' ? true : img.isPublic
        }
        return true
      })
      .map(img => {
        // Convert to URL string
        const url = typeof img === 'string' ? img : img.url
        console.log('🖼️ [AmenitiesGalleryModal] Processing image:', { original: img, url })
        return url
      })
  }

  const images = processImages(currentAmenity?.images)
  const hasImages = images.length > 0

  console.log('🎨 [AmenitiesGalleryModal] Current state:', {
    open,
    currentAmenity: currentAmenity?.name,
    rawImages: currentAmenity?.images,
    processedImages: images,
    hasImages,
    currentImageIndex,
    currentImageUrl: images[currentImageIndex]
  })

  const handleNextImage = () => {
    if (currentImageIndex < images.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1)
    } else if (currentAmenityIndex < amenities.length - 1) {
      // Move to next amenity
      let nextIdx = currentAmenityIndex + 1
      while (nextIdx < amenities.length) {
        const nextAmenityImages = processImages(amenities[nextIdx]?.images)
        if (nextAmenityImages.length > 0) {
          setCurrentAmenityIndex(nextIdx)
          setCurrentImageIndex(0)
          break
        }
        nextIdx++
      }
    }
  }

  const handlePrevImage = () => {
    if (currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1)
    } else if (currentAmenityIndex > 0) {
      // Move to previous amenity
      let prevIdx = currentAmenityIndex - 1
      while (prevIdx >= 0) {
        const prevAmenityImages = processImages(amenities[prevIdx]?.images)
        if (prevAmenityImages.length > 0) {
          setCurrentAmenityIndex(prevIdx)
          setCurrentImageIndex(prevAmenityImages.length - 1)
          break
        }
        prevIdx--
      }
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
  }, [open, currentImageIndex, currentAmenityIndex, amenities])

  if (!currentAmenity) return null

  const currentImageUrl = images[currentImageIndex]

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
            {currentAmenity.name}
          </Typography>
          {hasImages && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Imagen {currentImageIndex + 1} de {images.length}
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
                No hay imágenes disponibles
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {isPublicView 
                  ? 'No hay imágenes públicas para esta amenidad.'
                  : 'Aún no se han subido imágenes para esta amenidad.'}
              </Typography>
            </Box>
          ) : (
            <Box sx={{ position: 'relative', bgcolor: '#000' }}>
              {/* Current Image */}
              <Box
                component="img"
                src={currentImageUrl}
                alt={`${currentAmenity.name} - Imagen ${currentImageIndex + 1}`}
                onError={(e) => {
                  console.error('❌ [AmenitiesGalleryModal] Error loading image:', currentImageUrl)
                  e.target.style.display = 'none'
                }}
                onLoad={() => {
                  console.log('✅ [AmenitiesGalleryModal] Image loaded successfully:', currentImageUrl)
                }}
                sx={{
                  width: '100%',
                  height: 500,
                  objectFit: 'contain',
                  display: 'block'
                }}
              />

              {/* Navigation Buttons */}
              {images.length > 1 && (
                <>
                  <IconButton
                    onClick={handlePrevImage}
                    disabled={currentImageIndex === 0 && currentAmenityIndex === 0}
                    sx={{
                      position: 'absolute',
                      left: 16,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      bgcolor: 'rgba(255, 255, 255, 0.9)',
                      '&:hover': { bgcolor: 'rgba(255, 255, 255, 1)' },
                      '&:disabled': { 
                        bgcolor: 'rgba(255, 255, 255, 0.5)',
                        opacity: 0.5
                      }
                    }}
                  >
                    <ArrowBackIosNewIcon />
                  </IconButton>
                  <IconButton
                    onClick={handleNextImage}
                    disabled={
                      currentImageIndex === images.length - 1 && 
                      currentAmenityIndex === amenities.length - 1
                    }
                    sx={{
                      position: 'absolute',
                      right: 16,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      bgcolor: 'rgba(255, 255, 255, 0.9)',
                      '&:hover': { bgcolor: 'rgba(255, 255, 255, 1)' },
                      '&:disabled': { 
                        bgcolor: 'rgba(255, 255, 255, 0.5)',
                        opacity: 0.5
                      }
                    }}
                  >
                    <ArrowForwardIosIcon />
                  </IconButton>
                </>
              )}
            </Box>
          )}
        </DialogContent>
      </Box>
    </Dialog>
  )
}

export default AmenitiesGalleryModal