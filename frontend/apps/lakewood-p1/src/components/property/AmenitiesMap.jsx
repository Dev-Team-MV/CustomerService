import { Box, Paper, Typography, IconButton, Tooltip } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import RemoveIcon from '@mui/icons-material/Remove'
import MyLocationIcon from '@mui/icons-material/MyLocation'
import { useState, useRef, useEffect } from 'react'
import AmenitiesGalleryModal from './AmenitiesGalleryModal'
const aerialMap = '/images/amenities/250114_001_100_PLANTA-CASA-CLUB-2-scaled.png'
import { useTranslation } from 'react-i18next'
import uploadService from '../../services/uploadService'

// Array base de puntos (puedes agregar más)
const amenitiesData = [
  { id: 1, name: 'Bar', x: 58, y: 44, images: [] },
  { id: 2, name: 'Bathroom Hallway', x: 60, y: 66, images: [] },
  { id: 3, name: 'Bathrooms', x: 60, y: 75, images: [] },
  { id: 4, name: 'Catering', x: 59.3, y: 35, images: [] },
  { id: 5, name: 'Conference Room', x: 56, y: 35, images: [] },
  { id: 6, name: 'Counter', x: 67, y: 25, images: [] },
  { id: 7, name: 'Counter Hallway', x: 65, y: 21, images: [] },
  { id: 8, name: 'Coworking', x: 70, y: 53, images: [] },
  { id: 9, name: 'Game Room', x: 59.8, y: 52, images: [] },
  { id: 10, name: 'Golf Simulator', x: 70, y: 53, images: [] },
  { id: 11, name: 'Gym', x: 55, y: 80, images: [] },
  { id: 12, name: 'Lakeside', x: 27, y: 27, images: [] },
  { id: 13, name: 'Laundry', x: 68, y: 81, images: [] },
  { id: 14, name: 'Lounge', x: 60, y: 58, images: [] },
  { id: 15, name: 'Machines', x: 36, y: 84.5, images: [] },
  { id: 16, name: 'Managers Office', x: 63, y: 25, images: [] },
  { id: 17, name: 'Multi-Purpose Room', x: 55, y: 22.5, images: [] },
  { id: 18, name: 'Mural', x: 62, y: 19, images: [] },
  { id: 19, name: 'Reception',  x: 64, y: 34.7, images: [] },
  { id: 20, name: 'Terrace', x: 51, y: 52, images: [] },
  // Puedes agregar más puntos aquí
]

const AmenitiesMap = ({ isPublicView = false }) => {
  const { t } = useTranslation(['amenities']);
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [hasMoved, setHasMoved] = useState(false)
  const [selectedAmenity, setSelectedAmenity] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [mappedAmenities, setMappedAmenities] = useState(amenitiesData);

  const mapRef = useRef(null)

  useEffect(() => {
    uploadService.getPublicClubhouse()
      .then(data => {
        // Mapea imágenes del backend a cada punto por nombre exacto
        const newAmenities = amenitiesData.map(amenity => {
          const backendImages = data.interior?.[amenity.name] || [];
          return {
            ...amenity,
            images: backendImages.length > 0
              ? backendImages.map(img => img.url)
              : amenity.images // fallback a las quemadas si tienes alguna
          };
        });
        setMappedAmenities(newAmenities);
      })
      .catch(err => {
        console.error('Error loading clubhouse public data:', err);
      });
  }, []);

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.3, 3))
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.3, 0.5))
  const handleResetView = () => {
    setZoom(1)
    setPan({ x: 0, y: 0 })
  }

  const handleMouseDown = (e) => {
    if (e.button === 0) {
      setIsDragging(true)
      setHasMoved(false)
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y })
      e.preventDefault()
    }
  }

  const handleMouseMove = (e) => {
    if (isDragging) {
      setHasMoved(true)
      setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y })
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleMouseLeave = () => {
    setIsDragging(false)
  }

  const handleTouchStart = (e) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0]
      setIsDragging(true)
      setHasMoved(false)
      setDragStart({ x: touch.clientX - pan.x, y: touch.clientY - pan.y })
    }
  }

  const handleTouchMove = (e) => {
    if (isDragging && e.touches.length === 1) {
      setHasMoved(true)
      const touch = e.touches[0]
      setPan({ x: touch.clientX - dragStart.x, y: touch.clientY - dragStart.y })
      e.preventDefault()
    }
  }

  const handleTouchEnd = () => {
    setIsDragging(false)
  }

  const handleAmenityClick = (amenity) => {
    if (!hasMoved) {
      setSelectedAmenity(amenity)
      setModalOpen(true)
    }
  }

  const handleCloseModal = () => {
    setModalOpen(false)
    setTimeout(() => setSelectedAmenity(null), 300)
  }

  return (
    <>
      <Box sx={{ p: 0, borderRadius: 2, overflow: 'hidden', width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
        {/* Map Container */}
        <Box
          ref={mapRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          sx={{
            width: '100%',
            maxWidth: '100%',
            paddingTop: '56.25%',
            bgcolor: '#f0f0f0',
            position: 'relative',
            cursor: isDragging ? 'grabbing' : 'grab',
            overflow: 'hidden',
            touchAction: 'none',
            boxSizing: 'border-box'
          }}
        >
          <Box sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', overflow: 'hidden' }}>
            {/* Map Background */}
            <Box
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                width: '100%',
                height: '100%',
                transform: `translate(-50%, -50%) translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                transition: isDragging ? 'none' : 'transform 0.3s ease',
                backgroundImage: `url(${aerialMap})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                willChange: 'transform'
              }}
            >
              {/* Amenity Markers */}
              {mappedAmenities.map((amenity) => (
                <Tooltip 
                  key={amenity.id} 
                  title={t(`amenityNames.${amenity.name}`, amenity.name)} 
                  arrow
                >
                  <Box
                    onClick={() => handleAmenityClick(amenity)}
                    sx={{
                      position: 'absolute',
                      left: `${amenity.x}%`,
                      top: `${amenity.y}%`,
                      transform: 'translate(-50%, -50%)',
                      width: { xs: 24, sm: 32, md: 32 },
                      height: { xs: 24, sm: 32, md: 32 },
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      bgcolor: '#4caf50',
                      color: '#fff',
                      fontSize: { xs: '0.6rem', sm: '0.75rem', md: '0.875rem' },
                      fontWeight: 'bold',
                      boxShadow: '0 4px 12px rgba(33, 150, 243, 0.4)',
                      border: '3px solid rgba(255,255,255,0.9)',
                      transition: 'all 0.3s ease',
                      zIndex: 1,
                      '&:hover': {
                        transform: 'translate(-50%, -50%) scale(1.3)',
                        zIndex: 11,
                        boxShadow: '0 6px 20px rgba(33, 150, 243, 0.6)',
                        bgcolor: 'rgba(33, 150, 243, 1)'
                      },
                      animation: 'pulse-amenity 2s infinite',
                      '@keyframes pulse-amenity': {
                        '0%': { boxShadow: '0 0 0 0 rgba(33, 150, 243, 0.7)' },
                        '70%': { boxShadow: '0 0 0 15px rgba(33, 150, 243, 0)' },
                        '100%': { boxShadow: '0 0 0 0 rgba(33, 150, 243, 0)' }
                      }
                    }}
                  >
                    {amenity.id}
                  </Box>
                </Tooltip>
              ))}
            </Box>

            {/* Zoom Controls */}
            <Box sx={{ 
              position: 'absolute', 
              bottom: { xs: 10, sm: 15 }, 
              right: { xs: 10, sm: 15 }, 
              display: 'flex', 
              flexDirection: 'column', 
              gap: 1, 
              zIndex: 100 
            }}>
              <Paper elevation={3} sx={{ display: 'flex', flexDirection: 'column', borderRadius: 1.5, overflow: 'hidden' }}>
                <IconButton size="small" onClick={handleZoomIn}><AddIcon fontSize="small" /></IconButton>
                <IconButton size="small" onClick={handleZoomOut}><RemoveIcon fontSize="small" /></IconButton>
              </Paper>
              <Paper elevation={3} sx={{ borderRadius: 1.5 }}>
                <IconButton size="small" onClick={handleResetView}><MyLocationIcon fontSize="small" /></IconButton>
              </Paper>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Gallery Modal */}
      <AmenitiesGalleryModal
        open={modalOpen}
        onClose={handleCloseModal}
        amenity={selectedAmenity}
        amenityIndex={selectedAmenity ? mappedAmenities.findIndex(a => a.id === selectedAmenity.id) : 0}
        amenities={mappedAmenities}
        isPublicView={isPublicView}
      />
    </>
  )
}

export default AmenitiesMap