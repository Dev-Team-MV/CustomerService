import { Box, Paper, Typography, Select, MenuItem, IconButton, Tooltip } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import RemoveIcon from '@mui/icons-material/Remove'
import MyLocationIcon from '@mui/icons-material/MyLocation'
import { useProperty } from '../../context/PropertyContext'
import { useState, useRef } from 'react'
import map from '../../../public/images/mapLakewood.png'

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

const InteractiveMap = () => {
  const { lots, selectedLot, selectLot } = useProperty()
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [hasMoved, setHasMoved] = useState(false)
  const mapRef = useRef(null)

  const handleLotSelect = (e) => {
    const lotNumber = e.target.value
    const lot = lots.find(l => l.number === lotNumber)
    
    if (lot && lot.status === 'available') {
      selectLot(lot)
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

  const handleLotClick = (lot) => {
    if (!hasMoved && lot.status === 'available') {
      selectLot(lot)
    }
  }

  return (
    <Paper 
      elevation={2} 
      sx={{ 
        p: 0, 
        bgcolor: '#fff',
        borderRadius: 2,
        overflow: 'hidden',
        border: '1px solid #e0e0e0',
        width: '100%', // ✅ Ancho completo
        maxWidth: '100%', // ✅ No exceder contenedor padre
        boxSizing: 'border-box' // ✅ Incluir padding y border en el ancho
      }}
    >
      {/* Header */}
      <Box sx={{ 
        p: 2, 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        bgcolor: '#fff', 
        borderBottom: '1px solid #eee',
        flexWrap: 'wrap',
        gap: 1
      }}>
        <Typography variant="subtitle2" sx={{ 
          fontWeight: 'bold', 
          color: '#333', 
          letterSpacing: 0.5,
          fontSize: { xs: '0.75rem', sm: '0.875rem' }
        }}>
          01 LOT PANORAMIC VIEW
        </Typography>
        
        <Box sx={{ display: 'flex', gap: { xs: 1, sm: 1.5 }, alignItems: 'center', flexWrap: 'wrap' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#4caf50' }} />
            <Typography variant="caption" sx={{ fontSize: { xs: '0.65rem', sm: '0.7rem' } }}>Available</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#1976d2' }} />
            <Typography variant="caption" sx={{ fontSize: { xs: '0.65rem', sm: '0.7rem' } }}>Hold</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#f44336' }} />
            <Typography variant="caption" sx={{ fontSize: { xs: '0.65rem', sm: '0.7rem' } }}>Sold</Typography>
          </Box>
        </Box>
      </Box>

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
          width: '100%', // ✅ Ocupar 100% del contenedor padre
          maxWidth: '100%', // ✅ No exceder
          paddingTop: '56.25%', // ✅ Aspect ratio 16:9
          bgcolor: '#f0f0f0',
          position: 'relative',
          cursor: isDragging ? 'grabbing' : 'grab',
          overflow: 'hidden', // ✅ Ocultar contenido que se salga
          touchAction: 'none',
          boxSizing: 'border-box' // ✅ Importante
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            overflow: 'hidden' // ✅ Prevenir expansión
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
              backgroundImage: `url(${map})`,
              backgroundSize: 'contain',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              willChange: 'transform' // ✅ Optimización de performance
            }}
          >
            {/* Lot Markers */}
            {lots.map((lot) => {
              const position = lotPositions[lot.number]
              if (!position) return null

              const isAvailable = lot.status === 'available'
              const isLocked = lot.status === 'sold' || lot.status === 'pending'

              return (
                <Tooltip 
                  key={lot._id} 
                  title={
                    isLocked 
                      ? `Lot ${lot.number} - ${lot.status.toUpperCase()} (Not available)` 
                      : `Lot ${lot.number} - $${lot.price?.toLocaleString()}`
                  } 
                  arrow
                >
                  <Box
                    onClick={() => handleLotClick(lot)}
                    sx={{
                      position: 'absolute',
                      left: `${position.x}%`,
                      top: `${position.y}%`,
                      transform: 'translate(-50%, -50%)',
                      width: { xs: 12, sm: 16, md: 22 },
                      height: { xs: 12, sm: 16, md: 22 },
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: isAvailable ? 'pointer' : 'not-allowed',
                      bgcolor: lot.status === 'pending' ? '#1976d2' : lot.status === 'sold' ? '#f44336' : '#4caf50',
                      color: '#fff',
                      fontSize: { xs: '0.45rem', sm: '0.6rem', md: '0.75rem' },
                      fontWeight: 'bold',
                      boxShadow: selectedLot?._id === lot._id 
                        ? '0 0 0 3px rgba(74, 124, 89, 0.4), 0 2px 8px rgba(0,0,0,0.3)' 
                        : '0 2px 6px rgba(0,0,0,0.2)',
                      border: selectedLot?._id === lot._id ? '2px solid #fff' : '2px solid rgba(255,255,255,0.9)',
                      transition: 'all 0.2s ease',
                      zIndex: selectedLot?._id === lot._id ? 10 : 1,
                      opacity: isLocked ? 0.7 : 1,
                      '&:hover': isAvailable ? {
                        transform: 'translate(-50%, -50%) scale(1.3)',
                        zIndex: 11,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.4)'
                      } : {},
                      animation: selectedLot?._id === lot._id ? 'pulse 2s infinite' : 'none',
                      '@keyframes pulse': {
                        '0%': { boxShadow: '0 0 0 0 rgba(74, 124, 89, 0.7)' },
                        '70%': { boxShadow: '0 0 0 10px rgba(74, 124, 89, 0)' },
                        '100%': { boxShadow: '0 0 0 0 rgba(74, 124, 89, 0)' }
                      }
                    }}
                  >
                    {lot.number}
                  </Box>
                </Tooltip>
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

          {/* Phase Label */}
          <Box sx={{ 
            position: 'absolute', 
            bottom: 10, 
            left: 10, 
            zIndex: 100 
          }}>
            <Paper sx={{ 
              px: { xs: 1, sm: 1.5 }, 
              py: 0.5, 
              borderRadius: 2, 
              bgcolor: 'rgba(255,255,255,0.95)',
              boxShadow: 2
            }}>
              <Typography variant="caption" sx={{ 
                fontWeight: 'bold', 
                fontSize: { xs: '0.6rem', sm: '0.65rem' } 
              }}>
                PHASE II - NORTH CREEK
              </Typography>
            </Paper>
          </Box>
        </Box>
      </Box>

      {/* Dropdown */}
      <Box sx={{ 
        p: 2, 
        bgcolor: '#f9f9f9', 
        borderTop: '1px solid #eee',
        width: '100%',
        boxSizing: 'border-box'
      }}>
        <Select
          fullWidth
          value={selectedLot?.number || ''}
          onChange={handleLotSelect}
          displayEmpty
          size="small"
          sx={{
            bgcolor: '#fff',
            borderRadius: 2,
            width: '100%',
            '& .MuiOutlinedInput-notchedOutline': { borderColor: '#ddd' }
          }}
        >
          <MenuItem value="" disabled>Select a lot...</MenuItem>
          {lots
            .slice()
            .sort((a, b) => Number(a.number) - Number(b.number))
            .map(lot => (
              <MenuItem 
                key={lot._id} 
                value={lot.number}
                disabled={lot.status !== 'available'}
                sx={{
                  opacity: lot.status === 'available' ? 1 : 0.5
                }}
              >
                Lot {lot.number} - {lot.status.toUpperCase()}
                {(lot.status === 'sold' || lot.status === 'pending') && ' 🔒'}
              </MenuItem>
            ))}
        </Select>
      </Box>
    </Paper>
  )
}

export default InteractiveMap