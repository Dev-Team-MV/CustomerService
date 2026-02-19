import { Box, Paper, Typography, IconButton, Tooltip, Dialog, DialogContent } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import RemoveIcon from '@mui/icons-material/Remove'
import MyLocationIcon from '@mui/icons-material/MyLocation'
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew'
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos'
import { useState, useRef, useEffect } from 'react'
import uploadService from '../../services/uploadService'
import defaultMap from '../../../public/images/mapLakewood.png'

// 20 puntos de recorrido, ajusta x/y según tu plano
const recorridoPoints = [
  { id: 1, name: "Punto 1", x: 10, y: 20, image: "https://via.placeholder.com/600x400?text=Punto+1" },
  { id: 2, name: "Punto 2", x: 15, y: 25, image: "https://via.placeholder.com/600x400?text=Punto+2" },
  { id: 3, name: "Punto 3", x: 20, y: 30, image: "https://via.placeholder.com/600x400?text=Punto+3" },
  { id: 4, name: "Punto 4", x: 25, y: 35, image: "https://via.placeholder.com/600x400?text=Punto+4" },
  { id: 5, name: "Punto 5", x: 30, y: 40, image: "https://via.placeholder.com/600x400?text=Punto+5" },
  { id: 6, name: "Punto 6", x: 35, y: 45, image: "https://via.placeholder.com/600x400?text=Punto+6" },
  { id: 7, name: "Punto 7", x: 40, y: 50, image: "https://via.placeholder.com/600x400?text=Punto+7" },
  { id: 8, name: "Punto 8", x: 45, y: 55, image: "https://via.placeholder.com/600x400?text=Punto+8" },
  { id: 9, name: "Punto 9", x: 50, y: 60, image: "https://via.placeholder.com/600x400?text=Punto+9" },
  { id: 10, name: "Punto 10", x: 55, y: 65, image: "https://via.placeholder.com/600x400?text=Punto+10" },
  { id: 11, name: "Punto 11", x: 60, y: 70, image: "https://via.placeholder.com/600x400?text=Punto+11" },
  { id: 12, name: "Punto 12", x: 65, y: 75, image: "https://via.placeholder.com/600x400?text=Punto+12" },
  { id: 13, name: "Punto 13", x: 70, y: 80, image: "https://via.placeholder.com/600x400?text=Punto+13" },
  { id: 14, name: "Punto 14", x: 75, y: 85, image: "https://via.placeholder.com/600x400?text=Punto+14" },
  { id: 15, name: "Punto 15", x: 80, y: 60, image: "https://via.placeholder.com/600x400?text=Punto+15" },
  { id: 16, name: "Punto 16", x: 85, y: 55, image: "https://via.placeholder.com/600x400?text=Punto+16" },
  { id: 17, name: "Punto 17", x: 90, y: 50, image: "https://via.placeholder.com/600x400?text=Punto+17" },
  { id: 18, name: "Punto 18", x: 95, y: 45, image: "https://via.placeholder.com/600x400?text=Punto+18" },
  { id: 19, name: "Punto 19", x: 80, y: 30, image: "https://via.placeholder.com/600x400?text=Punto+19" },
  { id: 20, name: "Punto 20", x: 60, y: 20, image: "https://via.placeholder.com/600x400?text=Punto+20" }
]

const RecorridoTab = () => {
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [hasMoved, setHasMoved] = useState(false)
  const [selectedIdx, setSelectedIdx] = useState(null)
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

  const handlePointClick = (idx) => {
    if (!hasMoved) {
      setSelectedIdx(idx)
      setModalOpen(true)
    }
  }

  const handleCloseModal = () => {
    setModalOpen(false)
    setTimeout(() => setSelectedIdx(null), 300)
  }

  // Navegación en el modal
  const handleNext = () => {
    if (selectedIdx < recorridoPoints.length - 1) setSelectedIdx(selectedIdx + 1)
  }
  const handlePrev = () => {
    if (selectedIdx > 0) setSelectedIdx(selectedIdx - 1)
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
                backgroundImage: `url(${mapUrl})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                willChange: 'transform'
              }}
            >
              {/* Recorrido Markers */}
              {recorridoPoints.map((point, idx) => (
                <Tooltip 
                  key={point.id} 
                  title={point.name} 
                  arrow
                >
                  <Box
                    onClick={() => handlePointClick(idx)}
                    sx={{
                      position: 'absolute',
                      left: `${point.x}%`,
                      top: `${point.y}%`,
                      transform: 'translate(-50%, -50%)',
                      width: { xs: 24, sm: 32, md: 32 },
                      height: { xs: 24, sm: 32, md: 32 },
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      bgcolor: '#1976d2',
                      color: '#fff',
                      fontSize: { xs: '0.7rem', sm: '0.9rem', md: '1rem' },
                      fontWeight: 'bold',
                      boxShadow: '0 4px 12px rgba(25, 118, 210, 0.25)',
                      border: '3px solid rgba(255,255,255,0.9)',
                      transition: 'all 0.3s ease',
                      zIndex: 1,
                      '&:hover': {
                        transform: 'translate(-50%, -50%) scale(1.2)',
                        zIndex: 11,
                        boxShadow: '0 6px 20px rgba(25, 118, 210, 0.4)',
                        bgcolor: '#1565c0'
                      }
                    }}
                  >
                    {point.id}
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
      <Dialog
        open={modalOpen}
        onClose={handleCloseModal}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            maxHeight: '90vh'
          }
        }}
      >
        {selectedIdx !== null && (
          <DialogContent sx={{ p: 0, position: 'relative', minHeight: 400, bgcolor: '#f5f5f5' }}>
            <Box sx={{ p: 3, pb: 2, bgcolor: '#fff', borderBottom: '1px solid #e0e0e0' }}>
              <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#333' }}>
                {recorridoPoints[selectedIdx].name}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                {selectedIdx + 1} / {recorridoPoints.length}
              </Typography>
            </Box>
            <Box sx={{ position: 'relative', bgcolor: '#000' }}>
              <Box
                sx={{
                  width: '100%',
                  height: 500,
                  backgroundImage: `url(${recorridoPoints[selectedIdx].image})`,
                  backgroundSize: 'contain',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat'
                }}
              />
              {/* Navigation Buttons */}
              <IconButton
                onClick={handlePrev}
                disabled={selectedIdx === 0}
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
                onClick={handleNext}
                disabled={selectedIdx === recorridoPoints.length - 1}
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
            </Box>
          </DialogContent>
        )}
      </Dialog>
    </>
  )
}

export default RecorridoTab