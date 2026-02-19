import { Box, Paper, Typography, IconButton, Tooltip, Dialog, DialogContent, Button } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import RemoveIcon from '@mui/icons-material/Remove'
import MyLocationIcon from '@mui/icons-material/MyLocation'
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew'
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos'
import UploadFileIcon from '@mui/icons-material/UploadFile'
import { useState, useRef, useEffect } from 'react'
import uploadService from '../../services/uploadService'
import defaultMap from '../../../public/images/mapLakewood.png'
import RecorridoImageUploadModal from '../masterPlan/RecorridoImagesModal'

// 20 puntos de recorrido, ajusta x/y según tu plano
const puntosBase = [
  { id: 1, name: "Point 1", x: 77, y: 78 },
  { id: 2, name: "Point 2", x: 89.3, y: 50 },
  { id: 3, name: "Point 3", x: 93, y: 30 },
  { id: 4, name: "Point 4", x: 82, y: 33 },
  { id: 5, name: "Point 5", x: 75, y: 60 },
  { id: 6, name: "Point 6", x: 35, y: 45 },
  { id: 7, name: "Point 7", x: 40, y: 50 },
  { id: 8, name: "Point 8", x: 45, y: 55 },
  { id: 9, name: "Point 9", x: 50, y: 60 },
  { id: 10, name: "Point 10", x: 55, y: 65 },
  { id: 11, name: "Point 11", x: 60, y: 70 },
  { id: 12, name: "Point 12", x: 65, y: 75 },
  { id: 13, name: "Point 13", x: 70, y: 80 },
  { id: 14, name: "Point 14", x: 75, y: 85 },
  { id: 15, name: "Point 15", x: 30, y: 40  },
  { id: 16, name: "Point 16", x: 85, y: 55 },
  { id: 17, name: "Point 17", x: 15, y: 25 },
  { id: 18, name: "Point 18", x: 95, y: 45 },
  { id: 19, name: "Point 19", x: 25, y: 35  },
  { id: 20, name: "Point 20", x: 60, y: 20 }
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
  const [imagesMap, setImagesMap] = useState({}) // { [id]: url }
  const [uploadModalOpen, setUploadModalOpen] = useState(false)
  const [uploading, setUploading] = useState(false)
  const mapRef = useRef(null)

  // Cargar imagen dinámica del master plan y las imágenes del recorrido
  useEffect(() => {
    fetchMasterPlanImages()
    fetchRecorridoImages()
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
const fetchRecorridoImages = async () => {
  try {
    const response = await uploadService.getFilesByFolder('recorrido', true);
    const map = {};
    (response.files || []).forEach(file => {
      const match = file.name.match(/recorrido\.(\d+)\./);
      if (match) {
        map[String(match[1])] = file.url; // <-- Aquí, usa String
      }
    });
    setImagesMap(map);
  } catch (error) {
    setImagesMap({});
  }
};

  // Asocia cada imagen al punto por id
  const recorridoPoints = puntosBase.map((p) => ({
    ...p,
    image: imagesMap[p.id] || null
  }))

  // --- ZOOM & PAN ---
  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.3, 3))
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.3, 0.5))
  const handleResetView = () => {
    setZoom(1)
    setPan({ x: 0, y: 0 })
  }

  // --- DRAG ---
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

  // --- MODAL ---
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

  // --- UPLOAD ---
  const handleUpload = async (id, file) => {
    setUploading(true)
    const ext = file.name.substring(file.name.lastIndexOf('.'))
    const filename = `recorrido.${id}${ext}` // Usa el id del punto
    await uploadService.uploadImage(file, 'recorrido', filename)
    setUploading(false)
    fetchRecorridoImages()
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
          startIcon={<UploadFileIcon />}
          sx={{ mb: 2 }}
          onClick={() => setUploadModalOpen(true)}
        >
Manage MasterPlan Images
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
                backgroundImage: `url(${mapUrl})`,
                backgroundSize: 'contain',
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
            <Box sx={{ position: 'relative', bgcolor: '#000', minHeight: 320 }}>
              {/* Imagen del punto */}
              {recorridoPoints[selectedIdx].image ? (
                <Box
                  component="img"
                  src={recorridoPoints[selectedIdx].image}
                  alt={recorridoPoints[selectedIdx].name}
                  sx={{
                    width: '100%',
                    maxHeight: 500,
                    objectFit: 'contain',
                    background: '#222',
                    display: 'block',
                    mx: 'auto'
                  }}
                />
              ) : (
                <Box
                  sx={{
                    width: '100%',
                    height: 320,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#888',
                    fontSize: 22,
                    fontWeight: 600,
                    bgcolor: '#fafafa'
                  }}
                >
                  No image uploaded for this point
                </Box>
              )}

              {/* Upload section */}
              <Box sx={{ mt: 2, p: 2, textAlign: 'center', bgcolor: '#fff', borderRadius: 2 }}>
                <Button
                  variant="outlined"
                  component="span"
                  startIcon={<UploadFileIcon />}
                  onClick={() => setUploadModalOpen(true)}
                  disabled={uploading}
                >
                  {recorridoPoints[selectedIdx].image ? 'Replace Image' : 'Upload Image'}
                </Button>
              </Box>

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

      {/* Modal de subida de imagen */}
      <RecorridoImageUploadModal
        open={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        puntos={puntosBase}
        imagesMap={imagesMap}
        onUpload={handleUpload}
        loading={uploading}
      />
    </>
  )
}

export default RecorridoTab