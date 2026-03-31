// import { Box, Paper, Typography, IconButton, Tooltip } from '@mui/material'
// import AddIcon from '@mui/icons-material/Add'
// import RemoveIcon from '@mui/icons-material/Remove'
// import MyLocationIcon from '@mui/icons-material/MyLocation'
// import { useState, useRef } from 'react'
// import AmenitiesGalleryModal from './AmenitiesGalleryModal'

// const aerialMap = '../../../public/phase2.jpeg' // Usa una imagen mock o deja vacío

// // Mock de amenidades
// const amenitiesData = [
//   { id: 1, name: 'Piscina', x: 30, y: 40, images: ['/images/amenities/piscina1.jpg'] },
//   { id: 2, name: 'Gimnasio', x: 60, y: 50, images: ['/images/amenities/gym1.jpg'] },
//   { id: 3, name: 'Zona BBQ', x: 45, y: 70, images: ['/images/amenities/bbq1.jpg'] },
//   { id: 4, name: 'Parque Infantil', x: 80, y: 20, images: ['/images/amenities/playground1.jpg'] }
// ]

// const AmenitiesMap = ({ isPublicView = false }) => {
//   const [zoom, setZoom] = useState(1)
//   const [pan, setPan] = useState({ x: 0, y: 0 })
//   const [selectedAmenity, setSelectedAmenity] = useState(null)
//   const [modalOpen, setModalOpen] = useState(false)
//   const mapRef = useRef(null)

//   const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.3, 3))
//   const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.3, 0.5))
//   const handleResetView = () => {
//     setZoom(1)
//     setPan({ x: 0, y: 0 })
//   }

//   const handleAmenityClick = (amenity) => {
//     setSelectedAmenity(amenity)
//     setModalOpen(true)
//   }

//   const handleCloseModal = () => {
//     setModalOpen(false)
//     setTimeout(() => setSelectedAmenity(null), 300)
//   }

//   return (
//     <>
//       <Box sx={{ p: 0, borderRadius: 2, overflow: 'hidden', width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
//         <Box
//           ref={mapRef}
//           sx={{
//             width: '100%',
//             paddingTop: '56.25%',
//             bgcolor: '#f0f0f0',
//             position: 'relative',
//             overflow: 'hidden',
//             boxSizing: 'border-box'
//           }}
//         >
//           <Box sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', overflow: 'hidden' }}>
//             {/* Map Background */}
//             <Box
//               sx={{
//                 position: 'absolute',
//                 top: '50%',
//                 left: '50%',
//                 width: '100%',
//                 height: '100%',
//                 transform: `translate(-50%, -50%) translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
//                 backgroundImage: `url(${aerialMap})`,
//                 backgroundSize: 'cover',
//                 backgroundPosition: 'center',
//                 backgroundRepeat: 'no-repeat'
//               }}
//             >
//               {/* Amenity Markers */}
//               {amenitiesData.map((amenity) => (
//                 <Tooltip key={amenity.id} title={amenity.name} arrow>
//                   <Box
//                     onClick={() => handleAmenityClick(amenity)}
//                     sx={{
//                       position: 'absolute',
//                       left: `${amenity.x}%`,
//                       top: `${amenity.y}%`,
//                       transform: 'translate(-50%, -50%)',
//                       width: 32,
//                       height: 32,
//                       borderRadius: '50%',
//                       display: 'flex',
//                       alignItems: 'center',
//                       justifyContent: 'center',
//                       cursor: 'pointer',
//                       bgcolor: '#1976d2',
//                       color: '#fff',
//                       fontWeight: 'bold',
//                       boxShadow: '0 4px 12px rgba(33, 150, 243, 0.4)',
//                       border: '3px solid rgba(255,255,255,0.9)',
//                       zIndex: 1,
//                       '&:hover': {
//                         transform: 'translate(-50%, -50%) scale(1.2)',
//                         zIndex: 11,
//                         bgcolor: '#1565c0'
//                       }
//                     }}
//                   >
//                     {amenity.id}
//                   </Box>
//                 </Tooltip>
//               ))}
//             </Box>
//             {/* Zoom Controls */}
//             <Box sx={{
//               position: 'absolute',
//               bottom: 15,
//               right: 15,
//               display: 'flex',
//               flexDirection: 'column',
//               gap: 1,
//               zIndex: 100
//             }}>
//               <Paper elevation={3} sx={{ display: 'flex', flexDirection: 'column', borderRadius: 1.5, overflow: 'hidden' }}>
//                 <IconButton size="small" onClick={handleZoomIn}><AddIcon fontSize="small" /></IconButton>
//                 <IconButton size="small" onClick={handleZoomOut}><RemoveIcon fontSize="small" /></IconButton>
//               </Paper>
//               <Paper elevation={3} sx={{ borderRadius: 1.5 }}>
//                 <IconButton size="small" onClick={handleResetView}><MyLocationIcon fontSize="small" /></IconButton>
//               </Paper>
//             </Box>
//           </Box>
//         </Box>
//       </Box>
//       {/* Gallery Modal */}
//       <AmenitiesGalleryModal
//         open={modalOpen}
//         onClose={handleCloseModal}
//         amenity={selectedAmenity}
//         amenities={amenitiesData}
//         isPublicView={isPublicView}
//       />
//     </>
//   )
// }

// export default AmenitiesMap


// @/Users/oficina/MV-CRM/CustomerService/frontend/apps/phase-2/src/Components/UI/Amenities/AmenitiesMap.jsx

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

const aerialMap = '../../../public/phase2.jpeg'
const PHASE_2_PROJECT_ID = import.meta.env.VITE_PROJECT_ID || '6751c5e6a6f0f0e0e6f0f0e0'

const AmenitiesMap = ({ isPublicView = false }) => {
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

  useEffect(() => {
    fetchOutdoorAmenities()
  }, [])

  const fetchOutdoorAmenities = async () => {
    try {
      const data = await uploadService.getOutdoorAmenitiesBySlug('phase2')
      setAmenitySections(data.outdoorAmenitySections || [])
    } catch (err) {
      console.error('Error fetching outdoor amenities:', err)
      setAmenitySections([])
    }
  }

  // Merge amenities data with images from backend
  const amenitiesWithImages = OUTDOOR_AMENITIES.map(amenity => {
    const section = amenitySections.find(s => s.key === amenity.key)
    return {
      ...amenity,
      images: section?.images || []
    }
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
        {!isPublicView && (
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

      {/* Admin Modal */}
      {!isPublicView && (
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