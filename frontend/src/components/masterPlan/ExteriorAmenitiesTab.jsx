import { Box, Paper,Button, Typography, IconButton, Tooltip } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import RemoveIcon from '@mui/icons-material/Remove'
import MyLocationIcon from '@mui/icons-material/MyLocation'
import { useState, useRef, useEffect } from 'react'
import AmenitiesGalleryModal from '../property/AmenitiesGalleryModal'
import uploadService from '../../services/uploadService'
import defaultMap from '../../../public/images/mapLakewood.png'
import { CloudUpload } from '@mui/icons-material'
import OutdoorAmenitiesModal from '../masterPlan/OutdoorAmenitiesModal'
// ...otros imports...

// Amenidades exteriores (ajusta x, y, id, name, images según tu plano)
const exteriorAmenities = [
  { id: 1, name: "Dock, Boats & Jet Ski", x: 5, y: 65, images: [] },
  { id: 2, name: "Visitors Parking", x: 85, y: 78, images: [] },
  { id: 3, name: "Dog Park", x: 13, y: 75, images: [] },
  { id: 4, name: "Pickleball Courts", x: 18, y: 70, images: [] },
  { id: 5, name: "Semi-Olimpic Pool", x: 17, y: 46, images: [] },
  { id: 6, name: "Grills", x: 15, y: 35, images: [] },
  { id: 7, name: "Sunset Place", x: 14, y: 46, images: [] },
  { id: 8, name: "Lake Park", x: 8, y: 35, images: [] },
  { id: 9, name: "Viewpoint", x: 12, y: 39, images: [] },
  { id: 10, name: "Access", x: 71, y: 82, images: [] },
  { id: 11, name: "Maintenance Area", x: 29, y: 79, images: [] },
]

const ExteriorAmenitiesTab = () => {
 const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [hasMoved, setHasMoved] = useState(false)
  const [selectedAmenity, setSelectedAmenity] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [amenityModalOpen, setAmenityModalOpen] = useState(false)
  const [mapUrl, setMapUrl] = useState(defaultMap)
  const mapRef = useRef(null)
  const [amenitiesData, setAmenitiesData] = useState([]) // [{ id, name, images }]

  
    const handleOpenModal = () => setModalOpen(true)
    const handleOpenAmenityModal = () => setAmenityModalOpen(true)


  // Cargar imagen dinámica del master plan
  useEffect(() => {
    fetchMasterPlanImages()
    fetchOutdoorAmenities()
  }, [])

    const fetchOutdoorAmenities = async () => {
    try {
      const res = await uploadService.getOutdoorAmenities()
      setAmenitiesData(res.amenities || [])
    } catch (err) {
      setAmenitiesData([])
    }
  }

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
      setAmenityModalOpen(true)
    }
  }

  const handleCloseModal = () => {
    setModalOpen(false)
    setTimeout(() => setSelectedAmenity(null), 300)
  }
  const handleAmenityCloseModal = () => {
    setAmenityModalOpen(false)
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
                <Button
                  variant="contained"
                  startIcon={<CloudUpload />} // Usa el ícono que prefieras, por ejemplo CloudUpload
                  sx={{
                    mb: 2,
                    borderRadius: 3,
                    fontWeight: 600,
                    textTransform: 'none',
                    fontFamily: '"Poppins", sans-serif',
                    bgcolor: '#333F1F',
                    color: 'white',
                    px: 3,
                    py: 1.2,
                    boxShadow: '0 4px 12px rgba(51, 63, 31, 0.25)',
                    '&:hover': {
                      bgcolor: '#8CA551',
                      boxShadow: '0 6px 16px rgba(140, 165, 81, 0.35)'
                    }
                  }}
                  onClick={handleOpenModal}
                >
Manage Outdoor Amenities
                </Button>
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

            <OutdoorAmenitiesModal
        open={modalOpen}
        onClose={handleCloseModal}
        amenitiesList={amenitiesData}
        onUploaded={fetchOutdoorAmenities}
      />

      {/* Gallery Modal */}
    <AmenitiesGalleryModal
      open={amenityModalOpen}
      onClose={handleAmenityCloseModal}
      amenity={selectedAmenity}
      images={
        selectedAmenity
          ? (amenitiesData.find(a => a.name === selectedAmenity.name)?.images || [])
          : []
      }
      amenityIndex={selectedAmenity ? amenitiesData.findIndex(a => a.name === selectedAmenity.name) : -1}
      amenities={amenitiesData} // <--- usa el array del backend, no el quemado
      isPublicView={false}
    />
    </>
  )
}

export default ExteriorAmenitiesTab