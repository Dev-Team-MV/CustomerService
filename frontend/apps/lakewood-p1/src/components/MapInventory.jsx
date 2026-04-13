import { Box, Paper, Typography, IconButton, Grid, Chip } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import RemoveIcon from '@mui/icons-material/Remove'
import MyLocationIcon from '@mui/icons-material/MyLocation'
import { useState, useEffect, useRef } from 'react'
import { Circle } from '@mui/icons-material'
import api from '@shared/services/api'
import uploadService from '../services/uploadService'
import { useTranslation } from 'react-i18next'

const map = '/images/mapLakewood.png'

// Mismas posiciones que DashboardMap
const lotPositions = {
  1: { x: 23, y: 25 },
  2: { x: 26.3, y: 25 },
  3: { x: 30, y: 25 },
  4: { x: 33.8, y: 25 },
  5: { x: 37, y: 25 },
  6: { x: 26, y: 66 },
  7: { x: 27, y: 73 },
  8: { x: 38, y: 42 },
  9: { x: 38.5, y: 49.5 },
  10: { x: 44, y: 25 },
  11: { x: 47, y: 25 },
  12: { x: 50, y: 25 },
  14: { x: 53.5, y: 25 },
  15: { x: 56.5, y: 25 },
  16: { x: 60, y: 25 },
  17: { x: 63, y: 25 },
  18: { x: 66, y: 25 },
  19: { x: 69.5, y: 25 },
  61: { x: 77, y: 25 },
  62: { x: 80, y: 25 },
  63: { x: 83, y: 25 },
  28: { x: 44.4, y: 32.3 },
  20: { x: 68.5, y: 34 },
  60: { x: 77, y: 33 },
  21: { x: 67.3, y: 38.5 },
  27: { x: 47, y: 40.5 },
  26: { x: 50.2, y: 42 },
  25: { x: 53.5, y: 42 },
  24: { x: 57, y: 43 },
  22: { x: 65, y: 44 },
  23: { x: 60, y: 45 },
  30: { x: 47, y: 55 },
  31: { x: 50, y: 55 },
  32: { x: 53.3, y: 56 },
  29: { x: 42.3, y: 61 },
  34: { x: 59, y: 67 },
  35: { x: 59, y: 72 },
  36: { x: 54, y: 70 },
  37: { x: 50.7, y: 70 },
  38: { x: 47.7, y: 70 },
  39: { x: 44.5, y: 70 },
  40: { x: 41, y: 70 },
  41: { x: 37.8, y: 70 },
  42: { x: 34.5, y: 69.5 },
  54: { x: 70, y: 68 },
  55: { x: 67, y: 61 },
  43: { x: 86, y: 24.8 },
  44: { x: 88.5, y: 26 },
  71: { x: 95.3, y: 24 },
  64: { x: 95.2, y: 38 },
  45: { x: 88.8, y: 34 },
  46: { x: 86.7, y: 39.5 },
  47: { x: 86, y: 45 },
  59: { x: 75.8, y: 39.7 },
  58: { x: 74, y: 45.2 },
  48: { x: 85, y: 51 },
  57: { x: 72, y: 50 },
  56: { x: 70, y: 54.5 },
  33: { x: 57.4, y: 60 },
  49: { x: 85, y: 57 },
  50: { x: 83.5, y: 63 },
  51: { x: 81, y: 68 },
  52: { x: 77.3, y: 70 },
  53: { x: 73.5, y: 70 },
  67: { x: 93, y: 57 },
  68: { x: 92, y: 62.5 },
  65: { x: 94, y: 45.4 },
  66: { x: 94, y: 51.3 },
  69: { x: 91, y: 68 },
  70: { x: 91, y: 73.5 }
}

// Colores hardcodeados (mismo que LotDialog)
const LOT_COLORS = {
  green: { hex: '#4caf50', label: 'Green' },
  yellow: { hex: '#ffc107', label: 'Yellow' },
  red: { hex: '#f44336', label: 'Red' },
  blue: { hex: '#2196f3', label: 'Blue' }
}

const MapInventory = () => {
  const { t } = useTranslation(['masterPlan'])
  const [lots, setLots] = useState([])
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [mapUrl, setMapUrl] = useState(map)
  const mapRef = useRef(null)

  useEffect(() => {
    fetchLots()
    fetchMasterPlanImages()
  }, [])

  const fetchLots = async () => {
    try {
      const res = await api.get('/lots')
      setLots(res.data)
    } catch (error) {
      console.error('Error loading lots:', error)
    }
  }

  const fetchMasterPlanImages = async () => {
    try {
      const response = await uploadService.getFilesByFolder('masterplan', true)
      if (response.files && response.files.length > 0) {
        setMapUrl(response.files[0].url)
      } else {
        setMapUrl(map)
      }
    } catch (error) {
      console.error('Error loading master plan:', error)
      setMapUrl(map)
    }
  }

  // Contador por color
  const colorCounts = lots.reduce((acc, lot) => {
    const color = lot.color || 'green'
    acc[color] = (acc[color] || 0) + 1
    return acc
  }, {})

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.3, 3))
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.3, 0.5))
  const handleResetView = () => {
    setZoom(1)
    setPan({ x: 0, y: 0 })
  }

  const handleMouseDown = (e) => {
    if (e.button === 0) {
      setIsDragging(true)
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y })
      e.preventDefault()
    }
  }

  const handleMouseMove = (e) => {
    if (isDragging) {
      setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y })
    }
  }

  const handleMouseUp = () => setIsDragging(false)
  const handleMouseLeave = () => setIsDragging(false)

  const handleTouchStart = (e) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0]
      setIsDragging(true)
      setDragStart({ x: touch.clientX - pan.x, y: touch.clientY - pan.y })
    }
  }

  const handleTouchMove = (e) => {
    if (isDragging && e.touches.length === 1) {
      const touch = e.touches[0]
      setPan({ x: touch.clientX - dragStart.x, y: touch.clientY - dragStart.y })
      e.preventDefault()
    }
  }

  const handleTouchEnd = () => setIsDragging(false)

  return (
    <Box>
      {/* Contador por color */}
      <Paper sx={{ p: 2, mb: 2, borderRadius: 3 }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 700, color: '#333F1F' }}>
          Inventory by Color
        </Typography>
        <Grid container spacing={2}>
          {Object.entries(LOT_COLORS).map(([colorKey, colorData]) => (
            <Grid item xs={6} sm={3} key={colorKey}>
              <Paper
                elevation={2}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  border: `2px solid ${colorData.hex}`,
                  bgcolor: `${colorData.hex}10`,
                  textAlign: 'center'
                }}
              >
                <Circle sx={{ fontSize: 32, color: colorData.hex, mb: 1 }} />
                <Typography variant="h4" sx={{ fontWeight: 700, color: colorData.hex }}>
                  {colorCounts[colorKey] || 0}
                </Typography>
                <Typography variant="caption" sx={{ color: '#706f6f', fontWeight: 600 }}>
                  {colorData.label}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Paper>

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
          paddingTop: '56.25%',
          bgcolor: '#f0f0f0',
          position: 'relative',
          borderRadius: 2,
          overflow: 'hidden',
          cursor: isDragging ? 'grabbing' : 'grab',
          touchAction: 'none'
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%'
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
              backgroundRepeat: 'no-repeat'
            }}
          >
            {/* Lot Markers con color */}
            {lots.map((lot) => {
              const position = lotPositions[lot.number]
              if (!position) return null

              const lotColor = LOT_COLORS[lot.color || 'green']

              return (
                <Box
                  key={lot._id}
                  sx={{
                    position: 'absolute',
                    left: `${position.x}%`,
                    top: `${position.y}%`,
                    transform: 'translate(-50%, -50%)',
                    width: { xs: 14, sm: 18, md: 22 },
                    height: { xs: 14, sm: 18, md: 22 },
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: lotColor.hex,
                    color: '#fff',
                    fontSize: { xs: '0.5rem', sm: '0.6rem', md: '0.75rem' },
                    fontWeight: 'bold',
                    boxShadow: `0 2px 6px ${lotColor.hex}80`,
                    border: '2px solid rgba(255,255,255,0.9)',
                    transition: 'all 0.2s ease',
                    zIndex: 1,
                    '&:hover': {
                      transform: 'translate(-50%, -50%) scale(1.3)',
                      zIndex: 10,
                      boxShadow: `0 4px 12px ${lotColor.hex}`
                    }
                  }}
                >
                  {lot.number}
                </Box>
              )
            })}
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

          {/* Legend con colores */}
          <Box sx={{
            position: 'absolute',
            bottom: 10,
            left: 10,
            display: 'flex',
            gap: 1,
            zIndex: 100,
            flexWrap: 'wrap'
          }}>
            {Object.entries(LOT_COLORS).map(([colorKey, colorData]) => (
              <Paper key={colorKey} sx={{ px: 1, py: 0.5, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.95)' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: colorData.hex }} />
                  <Typography variant="caption" sx={{ fontSize: { xs: '0.6rem', sm: '0.65rem' } }}>
                    {colorData.label}
                  </Typography>
                </Box>
              </Paper>
            ))}
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

export default MapInventory