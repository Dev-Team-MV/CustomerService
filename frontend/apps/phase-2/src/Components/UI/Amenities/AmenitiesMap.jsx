import { Box, Paper, Typography, IconButton, Tooltip, Button } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import RemoveIcon from '@mui/icons-material/Remove'
import MyLocationIcon from '@mui/icons-material/MyLocation'
import { CloudUpload } from '@mui/icons-material'
import { useState, useRef, useEffect } from 'react'
import AmenitiesGalleryModal from './AmenitiesGalleryModal'
import OutdoorAmenitiesModal from './OutdoorAmenitiesModal'
import uploadService from '../../../Services/uploadService'
import { OUTDOOR_AMENITIES } from '../../../Constants/amenities'
import { useAuth } from '@shared/context/AuthContext'

const aerialMap = '../../../public/phase2.jpeg'
const PHASE_2_PROJECT_ID = import.meta.env.VITE_PROJECT_ID || '6751c5e6a6f0f0e0e6f0f0e0'

const AmenitiesMap = ({ isPublicView = false }) => {
  const { user } = useAuth()
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [hasMoved, setHasMoved] = useState(false)
  const [selectedAmenity, setSelectedAmenity] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [adminModalOpen, setAdminModalOpen] = useState(false)
  const [amenitySections, setAmenitySections] = useState([])
  const mapRef = useRef(null)

  // Check if user is admin or superadmin
  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin'

  useEffect(() => {
    fetchOutdoorAmenities()
  }, [])

  const fetchOutdoorAmenities = async () => {
    try {
      const data = await uploadService.getOutdoorAmenitiesBySlug('lakewood-f2')
      console.log('🏞️ [AmenitiesMap] Full response from backend:', data)
      console.log('🏞️ [AmenitiesMap] Outdoor amenity sections:', data.outdoorAmenitySections)
      console.log('🏞️ [AmenitiesMap] Project ID:', data.projectId)
      console.log('🏞️ [AmenitiesMap] Slug:', data.slug)
      
      setAmenitySections(data.outdoorAmenitySections || [])
      
      // Log each section with its images
      if (data.outdoorAmenitySections) {
        data.outdoorAmenitySections.forEach((section, idx) => {
          console.log(`🏞️ [AmenitiesMap] Section ${idx}:`, {
            key: section.key,
            imagesCount: section.images?.length || 0,
            images: section.images
          })
        })
      }
    } catch (err) {
      console.error('❌ [AmenitiesMap] Error fetching outdoor amenities:', err)
      setAmenitySections([])
    }
  }

  // Merge amenities data with images from backend
  const amenitiesWithImages = OUTDOOR_AMENITIES.map(amenity => {
    const section = amenitySections.find(s => s.key === amenity.key)
    const mergedAmenity = {
      ...amenity,
      images: section?.images || []
    }
    
    console.log(`🎯 [AmenitiesMap] Merged amenity "${amenity.name}" (${amenity.key}):`, {
      hasSection: !!section,
      imagesCount: mergedAmenity.images.length,
      images: mergedAmenity.images
    })
    
    return mergedAmenity
  })

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
      console.log('🖱️ [AmenitiesMap] Amenity clicked:', {
        name: amenity.name,
        key: amenity.key,
        imagesCount: amenity.images?.length || 0,
        images: amenity.images
      })
      setSelectedAmenity(amenity)
      setModalOpen(true)
    }
  }

  const handleCloseModal = () => {
    setModalOpen(false)
    setTimeout(() => setSelectedAmenity(null), 300)
  }

  const handleCloseAdminModal = () => {
    setAdminModalOpen(false)
  }

  return (
    <>
      <Box sx={{ p: 0, borderRadius: 2, overflow: 'hidden', width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
        {/* Admin Button - Only visible for admin/superadmin */}
        {!isPublicView && isAdmin && (
          <Box sx={{ mb: 2 }}>
            <Button
              variant="contained"
              startIcon={<CloudUpload />}
              onClick={() => setAdminModalOpen(true)}
              sx={{
                bgcolor: '#8CA551',
                '&:hover': { bgcolor: '#7a9447' },
                fontFamily: '"Poppins", sans-serif',
                textTransform: 'none',
                fontWeight: 600
              }}
            >
              Gestionar Amenidades
            </Button>
          </Box>
        )}

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
                backgroundSize: 'contain',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
              }}
            >
              {/* Amenity Markers */}
              {amenitiesWithImages.map((amenity) => (
                <Tooltip key={amenity.id} title={amenity.name} arrow>
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

      {/* Admin Modal - Only for admin/superadmin */}
      {!isPublicView && isAdmin && (
        <OutdoorAmenitiesModal
          open={adminModalOpen}
          onClose={handleCloseAdminModal}
          projectId={PHASE_2_PROJECT_ID}
          amenitySections={amenitySections}
          onUploaded={fetchOutdoorAmenities}
        />
      )}

      {/* Gallery Modal */}
      <AmenitiesGalleryModal
        open={modalOpen}
        onClose={handleCloseModal}
        amenity={selectedAmenity}
        images={
          selectedAmenity
            ? (selectedAmenity.images || [])
                .filter(img => isPublicView ? img.isPublic : true)
                .map(img => typeof img === 'string' ? img : img.url)
            : []
        }
        amenityIndex={selectedAmenity ? amenitiesWithImages.findIndex(a => a.id === selectedAmenity.id) : -1}
        amenities={amenitiesWithImages}
        isPublicView={isPublicView}
      />
    </>
  )
}

export default AmenitiesMap