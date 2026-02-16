import { Box, Paper, Typography, IconButton, Tooltip } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import RemoveIcon from '@mui/icons-material/Remove'
import MyLocationIcon from '@mui/icons-material/MyLocation'
import { useState, useRef } from 'react'
import AmenitiesGalleryModal from './AmenitiesGalleryModal'
import aerialMap from '../../../public/images/amenities/250114_001_100_PLANTA-CASA-CLUB-2-scaled.png'

// Puntos de interés basados en el plano arquitectónico
const amenitiesData = [
  { 
    id: 1, 
    name: 'Semi-Olympic Pool', 
    x: 40, 
    y: 50, 
    images: [
      'https://lakewoodoaksonlakeconroe.com/wp-content/uploads/2025/06/250620_001_0000_SUNSETPLACE_3.png',
      'https://lakewoodoaksonlakeconroe.com/wp-content/uploads/2025/06/250623_001_0000_ASOLEADORAS_3.jpg',
      'https://lakewoodoaksonlakeconroe.com/wp-content/uploads/2025/06/250620_001_0000_SUNSETPLACE_2.png',
      'https://lakewoodoaksonlakeconroe.com/wp-content/uploads/2025/06/250620_001_0000_SUNSETPLACE_1.png',
    ] 
  },
  { 
    id: 2, 
    name: 'Entry',  
    x: 70, 
    y: 33, 
    images: [
      'https://lakewoodoaksonlakeconroe.com/wp-content/uploads/2025/06/01_250613_001_00_8-RECEPCION.png',
      'https://lakewoodoaksonlakeconroe.com/wp-content/uploads/2026/01/250902_001_00_RECEPCION-1.png',
      'https://lakewoodoaksonlakeconroe.com/wp-content/uploads/2026/01/250902_001_00_RECEPCION-2.png',
    ] 
  },
  { 
    id: 3, 
    name: 'Fitness Center', 
    x: 55, 
    y: 80, 
    images: [
      'https://lakewoodoaksonlakeconroe.com/wp-content/uploads/2026/01/251111_0100_GYM-8.png',
      'https://lakewoodoaksonlakeconroe.com/wp-content/uploads/2026/01/251111_0100_GYM-9.png',
      'https://lakewoodoaksonlakeconroe.com/wp-content/uploads/2026/01/251111_0100_GYM-10.png',
      'https://lakewoodoaksonlakeconroe.com/wp-content/uploads/2026/01/251111_0100_GYM-11.png',
      'https://lakewoodoaksonlakeconroe.com/wp-content/uploads/2026/01/251111_0100_GYM-1.png',
      'https://lakewoodoaksonlakeconroe.com/wp-content/uploads/2026/01/251111_0100_GYM-2.png',
      'https://lakewoodoaksonlakeconroe.com/wp-content/uploads/2026/01/251111_0100_GYM-3.png',
      'https://lakewoodoaksonlakeconroe.com/wp-content/uploads/2026/01/251111_0100_GYM-6.png',
      'https://lakewoodoaksonlakeconroe.com/wp-content/uploads/2026/01/251111_0100_GYM-4.png',
      'https://lakewoodoaksonlakeconroe.com/wp-content/uploads/2026/01/251111_0100_GYM-5.png',
    ] 
  },
  { 
    id: 4, 
    name: 'Terrace', 
    x: 51, 
    y: 52, 
    images: [
      'https://lakewoodoaksonlakeconroe.com/wp-content/uploads/2026/01/251111_0100_2-TERRAZA.png',
      'https://lakewoodoaksonlakeconroe.com/wp-content/uploads/2026/01/251111_0100_7-TERRAZA.png',
      'https://lakewoodoaksonlakeconroe.com/wp-content/uploads/2026/01/251111_0100_4-TERRAZA.png',
      'https://lakewoodoaksonlakeconroe.com/wp-content/uploads/2026/01/251111_0100_8-TERRAZA.png',
      'https://lakewoodoaksonlakeconroe.com/wp-content/uploads/2026/01/251111_0100_1-TERRAZA.png',
      'https://lakewoodoaksonlakeconroe.com/wp-content/uploads/2026/01/251111_0100_6-TERRAZA.png',
      'https://lakewoodoaksonlakeconroe.com/wp-content/uploads/2026/01/251111_0100_3-TERRAZA.png',
      'https://lakewoodoaksonlakeconroe.com/wp-content/uploads/2026/01/251111_0100_9-TERRAZA.png',
      'https://lakewoodoaksonlakeconroe.com/wp-content/uploads/2026/01/251111_0100_5-TERRAZA.png'
    ] 
  },
  { 
    id: 5, 
    name: 'Managers Office', 
    x: 62, 
    y: 35, 
    images: [
      'https://lakewoodoaksonlakeconroe.com/wp-content/uploads/2025/06/02_250613_001_00_1-RECEPCION.png',
      'https://lakewoodoaksonlakeconroe.com/wp-content/uploads/2026/01/250902_001_00_RECEPCION-8.png',
      'https://lakewoodoaksonlakeconroe.com/wp-content/uploads/2026/01/250902_001_00_RECEPCION-7.png'
    ] 
  },
  { 
    id: 6, 
    name: 'Bathrooms', 
    x: 60, 
    y: 75, 
    images: [
      'https://lakewoodoaksonlakeconroe.com/wp-content/uploads/2026/01/250829_001_00_BANO-1.png',
      'https://lakewoodoaksonlakeconroe.com/wp-content/uploads/2026/01/250829_001_00_BANO-3.png',
      'https://lakewoodoaksonlakeconroe.com/wp-content/uploads/2026/01/250829_001_00_BANO-2.png',
      'https://lakewoodoaksonlakeconroe.com/wp-content/uploads/2026/01/250829_001_00_BANO-6.png',
      'https://lakewoodoaksonlakeconroe.com/wp-content/uploads/2026/01/250829_001_00_BANO-7.png',
      'https://lakewoodoaksonlakeconroe.com/wp-content/uploads/2026/01/250829_001_00_BANO-5.png',
      'https://lakewoodoaksonlakeconroe.com/wp-content/uploads/2026/01/250829_001_00_BANO-4.png',
      'https://lakewoodoaksonlakeconroe.com/wp-content/uploads/2026/01/250829_001_00_BANO-9.png',
      'https://lakewoodoaksonlakeconroe.com/wp-content/uploads/2026/01/250829_001_00_BANO-14.png',
      'https://lakewoodoaksonlakeconroe.com/wp-content/uploads/2026/01/250829_001_00_BANO-8.png',
      'https://lakewoodoaksonlakeconroe.com/wp-content/uploads/2026/01/250829_001_00_BANO-13.png',
      'https://lakewoodoaksonlakeconroe.com/wp-content/uploads/2026/01/250829_001_00_BANO-12.png',
      'https://lakewoodoaksonlakeconroe.com/wp-content/uploads/2026/01/250829_001_00_BANO-10.png',
      'https://lakewoodoaksonlakeconroe.com/wp-content/uploads/2026/01/250829_001_00_BANO-11.png'
    ] 
  },
  { 
    id: 7, 
    name: 'Meeting Room', 
    x: 56, 
    y: 35, 
    images: [
      'https://lakewoodoaksonlakeconroe.com/wp-content/uploads/2026/01/251111_0100_3-MEETING.png',
      'https://lakewoodoaksonlakeconroe.com/wp-content/uploads/2026/01/251111_0100_5-MEETING.png',
      'https://lakewoodoaksonlakeconroe.com/wp-content/uploads/2026/01/251111_0100_2-MEETING.png',
      'https://lakewoodoaksonlakeconroe.com/wp-content/uploads/2026/01/251111_0100_1-MEETING.png',
      'https://lakewoodoaksonlakeconroe.com/wp-content/uploads/2026/01/251111_0100_4-MEETING.png'
    ] 
  },
  { 
    id: 8, 
    name: 'Reception', 
    x: 67, 
    y: 25, 
    images: [
      'https://lakewoodoaksonlakeconroe.com/wp-content/uploads/2026/01/250902_001_00_RECEPCION-8.png',
      'https://lakewoodoaksonlakeconroe.com/wp-content/uploads/2026/01/250902_001_00_RECEPCION-9.png',
      'https://lakewoodoaksonlakeconroe.com/wp-content/uploads/2026/01/250902_001_00_RECEPCION-4.png',
      'https://lakewoodoaksonlakeconroe.com/wp-content/uploads/2026/01/250902_001_00_RECEPCION-5.png',
      'https://lakewoodoaksonlakeconroe.com/wp-content/uploads/2026/01/250902_001_00_RECEPCION-6.png',
      'https://lakewoodoaksonlakeconroe.com/wp-content/uploads/2026/01/250902_001_00_RECEPCION-7.png',
      'https://lakewoodoaksonlakeconroe.com/wp-content/uploads/2026/01/250902_001_00_RECEPCION-2.png',
      'https://lakewoodoaksonlakeconroe.com/wp-content/uploads/2026/01/250902_001_00_RECEPCION-3.png',
      'https://lakewoodoaksonlakeconroe.com/wp-content/uploads/2026/01/250902_001_00_RECEPCION-1.png',
    ] 
  },
  { 
    id: 9, 
    name: 'Laundry', 
    x: 68, 
    y: 81, 
    images: [
      'https://lakewoodoaksonlakeconroe.com/wp-content/uploads/2026/01/250829_001_00_LAUNDRY-5.png',
      'https://lakewoodoaksonlakeconroe.com/wp-content/uploads/2026/01/250829_001_00_LAUNDRY-4.png',
      'https://lakewoodoaksonlakeconroe.com/wp-content/uploads/2026/01/250829_001_00_LAUNDRY-1.png',
      'https://lakewoodoaksonlakeconroe.com/wp-content/uploads/2026/01/250829_001_00_LAUNDRY-3.png',
      'https://lakewoodoaksonlakeconroe.com/wp-content/uploads/2026/01/250829_001_00_LAUNDRY-2.png'
    ] 
  },
  { 
    id: 10, 
    name: 'Golf Simulator', 
    x: 70, 
    y: 53, 
    images: [
      'https://lakewoodoaksonlakeconroe.com/wp-content/uploads/2026/01/250829_001_00_SIMULADOR-7.png',
      'https://lakewoodoaksonlakeconroe.com/wp-content/uploads/2026/01/250829_001_00_SIMULADOR-6.png',
      'https://lakewoodoaksonlakeconroe.com/wp-content/uploads/2026/01/250829_001_00_SIMULADOR-4.png',
      'https://lakewoodoaksonlakeconroe.com/wp-content/uploads/2026/01/250829_001_00_SIMULADOR-5.png',
      'https://lakewoodoaksonlakeconroe.com/wp-content/uploads/2026/01/250829_001_00_SIMULADOR-1.png',
      'https://lakewoodoaksonlakeconroe.com/wp-content/uploads/2026/01/250829_001_00_SIMULADOR-2.png',
      'https://lakewoodoaksonlakeconroe.com/wp-content/uploads/2026/01/250829_001_00_SIMULADOR-3.png'
    ] 
  },
  { 
    id: 11, 
    name: 'Game Room', 
    x: 59.8, 
    y: 52, 
    images: [
      'https://lakewoodoaksonlakeconroe.com/wp-content/uploads/2026/01/250829_001_00_GAME-2.png',
      'https://lakewoodoaksonlakeconroe.com/wp-content/uploads/2026/01/250829_001_00_GAME-3.png',
      'https://lakewoodoaksonlakeconroe.com/wp-content/uploads/2026/01/250829_001_00_GAME-1.png',
      'https://lakewoodoaksonlakeconroe.com/wp-content/uploads/2026/01/250829_001_00_GAME-4.png',
      'https://lakewoodoaksonlakeconroe.com/wp-content/uploads/2026/01/250829_001_00_GAME-5.png'
    ] 
  },
  { 
    id: 12, 
    name: 'General Manager', 
    x: 63, 
    y: 25, 
    images: [
              'https://lakewoodoaksonlakeconroe.com/wp-content/uploads/2026/01/250829_001_00_MANAGER-5.png',
      'https://lakewoodoaksonlakeconroe.com/wp-content/uploads/2026/01/250829_001_00_MANAGER-4.png',
      'https://lakewoodoaksonlakeconroe.com/wp-content/uploads/2026/01/250829_001_00_MANAGER-3.png',
      'https://lakewoodoaksonlakeconroe.com/wp-content/uploads/2026/01/250829_001_00_MANAGER-2.png',
      'https://lakewoodoaksonlakeconroe.com/wp-content/uploads/2026/01/250829_001_00_MANAGER-1.png'

    ] 
  },
  { 
    id: 13, 
    name: 'Lounge Area', 
    x: 60, 
    y: 58, 
    images: [
      'https://lakewoodoaksonlakeconroe.com/wp-content/uploads/2026/01/250829_001_00_LAUNGE-5.png',
      'https://lakewoodoaksonlakeconroe.com/wp-content/uploads/2026/01/250829_001_00_LAUNGE-4.png',
      'https://lakewoodoaksonlakeconroe.com/wp-content/uploads/2026/01/250829_001_00_LAUNGE-6.png',
      'https://lakewoodoaksonlakeconroe.com/wp-content/uploads/2026/01/250829_001_00_LAUNGE-3.png',
      'https://lakewoodoaksonlakeconroe.com/wp-content/uploads/2026/01/250829_001_00_LAUNGE-2.png',
      'https://lakewoodoaksonlakeconroe.com/wp-content/uploads/2026/01/250829_001_00_LAUNGE-1.png'
    ] 
  },
  { 
    id: 14, 
    name: 'Bar', 
    x: 58, 
    y: 44, 
    images: [
      'https://lakewoodoaksonlakeconroe.com/wp-content/uploads/2026/01/250829_001_00_BAR-1.png',
      'https://lakewoodoaksonlakeconroe.com/wp-content/uploads/2026/01/250829_001_00_BAR-2.png',
      'https://lakewoodoaksonlakeconroe.com/wp-content/uploads/2026/01/250829_001_00_BAR-3.png',
      'https://lakewoodoaksonlakeconroe.com/wp-content/uploads/2026/01/250829_001_00_BAR-4.png',
      'https://lakewoodoaksonlakeconroe.com/wp-content/uploads/2026/01/250829_001_00_BAR-5.png'
    ] 
  },
  { 
    id: 15, 
    name: 'Multipurpose Room', 
    x: 56, 
    y: 23, 
    images: [
      'https://lakewoodoaksonlakeconroe.com/wp-content/uploads/2026/01/260120_0100_3-MULTIFUNCIONAL_1.png',
      'https://lakewoodoaksonlakeconroe.com/wp-content/uploads/2026/01/260120_0100_2-MULTIFUNCIONAL_1.png',
      'https://lakewoodoaksonlakeconroe.com/wp-content/uploads/2026/01/260120_0100_4-MULTIFUNCIONAL_1.png',
      'https://lakewoodoaksonlakeconroe.com/wp-content/uploads/2026/01/260120_0100_1-MULTIFUNCIONAL_1.png',
      'https://lakewoodoaksonlakeconroe.com/wp-content/uploads/2026/01/260120_0100_5-MULTIFUNCIONAL_1.png'
    ] 
  },
  { 
    id: 16, 
    name: 'Coworking', 
    x: 62, 
    y: 44, 
    images: [
      'https://lakewoodoaksonlakeconroe.com/wp-content/uploads/2026/01/250829_001_00_COWORKING-2.png',
      'https://lakewoodoaksonlakeconroe.com/wp-content/uploads/2026/01/250829_001_00_COWORKING-3.png',
      'https://lakewoodoaksonlakeconroe.com/wp-content/uploads/2026/01/250829_001_00_COWORKING-1.png',
      'https://lakewoodoaksonlakeconroe.com/wp-content/uploads/2026/01/250829_001_00_COWORKING-4.png'
    ] 
  }
]

const AmenitiesMap = ({ isPublicView = false }) => {
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [hasMoved, setHasMoved] = useState(false)
  const [selectedAmenity, setSelectedAmenity] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const mapRef = useRef(null)

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
            paddingTop: '56.25%', // 16:9 aspect ratio
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
                backgroundImage: `url(${aerialMap})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                willChange: 'transform'
              }}
            >
              {/* Amenity Markers */}
              {amenitiesData.map((amenity) => (
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
      {/* <AmenitiesGalleryModal
        open={modalOpen}
        onClose={handleCloseModal}
        amenity={selectedAmenity}
        isPublicView={isPublicView}
      /> */}
            <AmenitiesGalleryModal
        open={modalOpen}
        onClose={handleCloseModal}
        amenity={selectedAmenity}
        amenityIndex={selectedAmenity ? amenitiesData.findIndex(a => a.id === selectedAmenity.id) : 0}
        amenities={amenitiesData}
        isPublicView={isPublicView}
      />
    </>
  )
}

export default AmenitiesMap
