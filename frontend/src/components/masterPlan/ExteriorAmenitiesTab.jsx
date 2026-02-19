import { Box, Paper, Typography, IconButton, Tooltip } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import RemoveIcon from '@mui/icons-material/Remove'
import MyLocationIcon from '@mui/icons-material/MyLocation'
import { useState, useRef, useEffect } from 'react'
import AmenitiesGalleryModal from '../property/AmenitiesGalleryModal'
import uploadService from '../../services/uploadService'
import defaultMap from '../../../public/images/mapLakewood.png'

// Amenidades exteriores (ajusta x, y, id, name, images según tu plano)
const exteriorAmenities = [
  { id: 1, name: "Dock", x: 8, y: 90, images: [] },
  { id: 2, name: "Boats & Jet Ski", x: 12, y: 95, images: [] },
  { id: 3, name: "Dog Park", x: 25, y: 20, images: [] },
  { id: 4, name: "Pickleball Courts", x: 15, y: 80, images: [] },
  { id: 5, name: "Semi-Olimpic Pool", x: 10, y: 60, images: [] },
  { id: 6, name: "Grills", x: 40, y: 30, images: [] },
  { id: 7, name: "Sunset Place", x: 60, y: 10, images: [] },
  { id: 8, name: "Lake Park", x: 80, y: 20, images: [] },
  { id: 9, name: "Viewpoint", x: 90, y: 40, images: [] },
  { id: 10, name: "Access", x: 95, y: 80, images: [] },
  { id: 11, name: "Maintenance Area", x: 70, y: 90, images: [] },
  { id: 12, name: "Visitors Parking", x: 50, y: 95, images: [] }
]

const ExteriorAmenitiesTab = () => {
 const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [hasMoved, setHasMoved] = useState(false)
  const [selectedAmenity, setSelectedAmenity] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [mapUrl, setMapUrl] = useState(defaultMap)
  const mapRef = useRef(null)

  // Cargar imagen dinámica del master plan
  useEffect(() => {
    fetchMasterPlanImages()
  }, [])

  const fetchMasterPlanImages = async () => {
    try {
      const response = await uploadService.getFilesByFolder('masterplan', true)
      if (response.files && response.files.length > 0) {
        const latestImage = response.files[response.files.length - 1]
        setMapUrl(latestImage.url)
      } else {
        setMapUrl(defaultMap)
      }
    } catch (error) {
      setMapUrl(defaultMap)
    }
  }
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

  const handleMouseUp = () => setIsDragging(false)
  const handleMouseLeave = () => setIsDragging(false)

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
      <Box 
        sx={{ 
          p: 0, 
          borderRadius: 2,
          overflow: 'hidden',
          width: '100%',
          maxWidth: '100%',
          boxSizing: 'border-box'
        }}
      >
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
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              overflow: 'hidden'
            }}
          >
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
              backgroundImage: `url(${mapUrl})`, // ✅ URL dinámica
              backgroundSize: 'contain',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat'
            }}
            >
              {/* Amenity Markers */}
              {exteriorAmenities.map((amenity) => (
                <Tooltip 
                  key={amenity.id} 
                  title={amenity.name} 
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
                      bgcolor: '#8CA551',
                      color: '#fff',
                      fontSize: { xs: '0.7rem', sm: '0.9rem', md: '1rem' },
                      fontWeight: 'bold',
                      boxShadow: '0 4px 12px rgba(140, 165, 81, 0.25)',
                      border: '3px solid rgba(255,255,255,0.9)',
                      transition: 'all 0.3s ease',
                      zIndex: 1,
                      '&:hover': {
                        transform: 'translate(-50%, -50%) scale(1.2)',
                        zIndex: 11,
                        boxShadow: '0 6px 20px rgba(140, 165, 81, 0.4)',
                        bgcolor: '#4a7c59'
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
        amenityIndex={selectedAmenity ? exteriorAmenities.findIndex(a => a.id === selectedAmenity.id) : 0}
        amenities={exteriorAmenities}
        isPublicView={false}
      />
    </>
  )
}

export default ExteriorAmenitiesTab