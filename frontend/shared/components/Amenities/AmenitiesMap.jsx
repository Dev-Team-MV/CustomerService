import { Box, Paper, Tooltip, IconButton } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import RemoveIcon from '@mui/icons-material/Remove'
import MyLocationIcon from '@mui/icons-material/MyLocation'
import { useState, useRef } from 'react'
import AmenitiesGalleryModal from './AmenitiesGalleryModal'

const AmenitiesMap = ({
  mapImage,
  amenities = [],
  amenitySections = [],
  loading = false,
  isPublicView = false
}) => {
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [hasMoved, setHasMoved] = useState(false)
  const [selectedAmenity, setSelectedAmenity] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const containerRef = useRef(null)

  const amenitiesWithImages = amenities.map(amenity => {
    const section = amenitySections.find(s => s.key === amenity.key)
    return { ...amenity, images: section?.images || [] }
  })

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.3, 3))
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.3, 0.5))
  const handleResetView = () => { setZoom(1); setPan({ x: 0, y: 0 }) }

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
  const handleMouseUp = () => setIsDragging(false)
  const handleMouseLeave = () => setIsDragging(false)

  const handleTouchStart = (e) => {
    if (e.touches.length === 1) {
      const t = e.touches[0]
      setIsDragging(true)
      setHasMoved(false)
      setDragStart({ x: t.clientX - pan.x, y: t.clientY - pan.y })
    }
  }
  const handleTouchMove = (e) => {
    if (isDragging && e.touches.length === 1) {
      setHasMoved(true)
      const t = e.touches[0]
      setPan({ x: t.clientX - dragStart.x, y: t.clientY - dragStart.y })
      e.preventDefault()
    }
  }
  const handleTouchEnd = () => setIsDragging(false)

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
      <Box sx={{ borderRadius: 2, overflow: 'hidden', width: '100%' }}>
        <Box
          ref={containerRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          sx={{
            position: 'relative',
            width: '100%',
            height: { xs: 400, sm: 500, md: 600 },
            bgcolor: '#f5f5f5',
            borderRadius: 2,
            overflow: 'hidden',
            cursor: isDragging ? 'grabbing' : 'grab',
            userSelect: 'none'
          }}
        >
          <Box sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', overflow: 'hidden' }}>
            <Box
              sx={{
                position: 'absolute',
                top: '50%', left: '50%',
                width: '100%', height: '100%',
                transform: `translate(-50%, -50%) translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                transition: isDragging ? 'none' : 'transform 0.3s ease',
                backgroundImage: mapImage ? `url(${mapImage})` : 'none',
                backgroundSize: 'contain',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
              }}
            >
              {amenitiesWithImages.map((amenity) => (
                <Tooltip key={amenity.id} title={amenity.name} arrow>
                  <Box
                    onClick={() => handleAmenityClick(amenity)}
                    sx={{
                      position: 'absolute',
                      left: `${amenity.x}%`,
                      top: `${amenity.y}%`,
                      transform: 'translate(-50%, -50%)',
                      width: { xs: 24, sm: 32 },
                      height: { xs: 24, sm: 32 },
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      bgcolor: '#8CA551',
                      color: '#fff',
                      fontSize: { xs: '0.7rem', sm: '0.9rem' },
                      fontWeight: 'bold',
                      boxShadow: '0 4px 12px rgba(140,165,81,0.25)',
                      border: '3px solid rgba(255,255,255,0.9)',
                      transition: 'all 0.3s ease',
                      zIndex: 1,
                      '&:hover': {
                        transform: 'translate(-50%, -50%) scale(1.2)',
                        zIndex: 11,
                        boxShadow: '0 6px 20px rgba(140,165,81,0.4)',
                        bgcolor: '#4a7c59'
                      }
                    }}
                  >
                    {amenity.id}
                  </Box>
                </Tooltip>
              ))}
            </Box>

            <Box sx={{ position: 'absolute', bottom: { xs: 10, sm: 15 }, right: { xs: 10, sm: 15 }, display: 'flex', flexDirection: 'column', gap: 1, zIndex: 100 }}>
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

      <AmenitiesGalleryModal
        open={modalOpen}
        onClose={handleCloseModal}
        amenity={selectedAmenity}
        amenities={amenitiesWithImages}
        isPublicView={isPublicView}
      />
    </>
  )
}

export default AmenitiesMap