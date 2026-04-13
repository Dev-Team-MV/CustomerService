import { Dialog, DialogContent, IconButton, Box, Typography } from '@mui/material'
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
  isPublicView = false
}) => {
  const { t } = useTranslation(['amenities', 'common'])

  const [currentAmenityIndex, setCurrentAmenityIndex] = useState(0)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  useEffect(() => {
    if (open && amenity && amenities.length) {
      const idx = amenities.findIndex(a => a.name === amenity.name)
      setCurrentAmenityIndex(idx >= 0 ? idx : 0)
      setCurrentImageIndex(0)
    }
  }, [open, amenity, amenities])

  const processImages = (imgs) => {
    if (!imgs || !Array.isArray(imgs)) return []
    return imgs
      .filter(img => isPublicView ? (typeof img === 'string' ? true : img.isPublic) : true)
      .map(img => typeof img === 'string' ? img : img.url)
  }

  const currentAmenity = amenities[currentAmenityIndex] || amenity
  const images = processImages(currentAmenity?.images)
  const hasImages = images.length > 0

  const handleNextImage = () => {
    if (currentImageIndex < images.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1)
    } else {
      let nextIdx = currentAmenityIndex + 1
      while (nextIdx < amenities.length) {
        const nextImgs = processImages(amenities[nextIdx]?.images)
        if (nextImgs.length > 0) {
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
    } else {
      let prevIdx = currentAmenityIndex - 1
      while (prevIdx >= 0) {
        const prevImgs = processImages(amenities[prevIdx]?.images)
        if (prevImgs.length > 0) {
          setCurrentAmenityIndex(prevIdx)
          setCurrentImageIndex(prevImgs.length - 1)
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

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{ sx: { borderRadius: 3, maxHeight: '90vh' } }}
    >
      <Box sx={{ position: 'relative', bgcolor: '#f5f5f5' }}>
        <IconButton
          onClick={onClose}
          sx={{
            position: 'absolute', top: 8, right: 8, zIndex: 10,
            bgcolor: 'rgba(255,255,255,0.9)',
            '&:hover': { bgcolor: 'rgba(255,255,255,1)' }
          }}
        >
          <CloseIcon />
        </IconButton>

        <Box sx={{ p: 3, pb: 2, bgcolor: '#fff', borderBottom: '1px solid #e0e0e0' }}>
          <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#333' }}>
            {currentAmenity.name}
          </Typography>
          {hasImages && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {t('amenities:imageCount', 'Image {{current}} of {{total}}', {
                current: currentImageIndex + 1,
                total: images.length
              })}
            </Typography>
          )}
        </Box>

        <DialogContent sx={{ p: 0, position: 'relative', minHeight: 400 }}>
          {!hasImages ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 400, p: 4, textAlign: 'center' }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                {t('amenities:noImages', 'No images available')}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {isPublicView
                  ? t('amenities:noPublicImages', 'No public images for this amenity.')
                  : t('amenities:noUploadedImages', 'No images have been uploaded for this amenity yet.')}
              </Typography>
            </Box>
          ) : (
            <Box sx={{ position: 'relative', bgcolor: '#000' }}>
              <Box
                component="img"
                src={images[currentImageIndex]}
                alt={`${currentAmenity.name} ${currentImageIndex + 1}`}
                sx={{ width: '100%', height: 500, objectFit: 'contain', display: 'block' }}
              />
              {images.length > 1 && (
                <>
                  <IconButton
                    onClick={handlePrevImage}
                    disabled={currentImageIndex === 0 && currentAmenityIndex === 0}
                    sx={{
                      position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)',
                      bgcolor: 'rgba(255,255,255,0.9)', '&:hover': { bgcolor: 'white' },
                      '&:disabled': { bgcolor: 'rgba(255,255,255,0.5)', opacity: 0.5 }
                    }}
                  >
                    <ArrowBackIosNewIcon />
                  </IconButton>
                  <IconButton
                    onClick={handleNextImage}
                    disabled={currentImageIndex === images.length - 1 && currentAmenityIndex === amenities.length - 1}
                    sx={{
                      position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)',
                      bgcolor: 'rgba(255,255,255,0.9)', '&:hover': { bgcolor: 'white' },
                      '&:disabled': { bgcolor: 'rgba(255,255,255,0.5)', opacity: 0.5 }
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