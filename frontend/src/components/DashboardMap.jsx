// import { Box, Paper, Typography, Tooltip, Popover, Chip } from '@mui/material'
// import { useState, useEffect } from 'react'
// import { Home, SquareFoot, AttachMoney } from '@mui/icons-material'
// import api from '../services/api'
// import map from '../../public/images/mapLakewood.png'


// const lotPositions = {
//   1: { x: 23, y: 20 },
//   2: { x: 26, y: 20 },
//   3: { x: 30, y: 20 },
//   4: { x: 34, y: 20 },
//   5: { x: 37, y: 20 },
//   6: { x: 26, y: 66 },
//   7: { x: 27, y: 73 },
//   8: { x: 39, y: 42 },
//   9: { x: 39, y: 50 },
//   10: { x: 44, y: 20 },
//   11: { x: 47, y: 20 },
//   12: { x: 50, y: 20 },
//   14: { x: 53, y: 20 },
//   15: { x: 56, y: 20 },
//   16: { x: 60, y: 20 },
//   17: { x: 63, y: 20 },
//   18: { x: 66, y: 20 },
//   19: { x: 70, y: 20 },
//   61: { x: 77, y: 20},
//   62: { x: 80, y: 20},
//   63: { x: 83, y: 20},
//   28: { x: 44, y: 32 },
//   20: { x: 69, y: 33 },
//   60: { x: 77, y: 32 },
//   21: { x: 67, y: 38 },
//   27: { x: 47, y: 40 },
//   26: { x: 50, y: 41 },
//   25: { x: 54, y: 41 },
//   24: { x: 57, y: 44 },
//   22: { x: 65, y: 43 },
//   23: { x: 60, y: 45 },
//   30: { x: 47, y: 55 },
//   31: { x: 50, y: 55 },
//   32: { x: 53, y: 56 },
//   29: { x: 42, y: 61 },
//   34: { x: 59, y: 66 },
//   35: { x: 59, y: 72 },
//   36: { x: 54, y: 70 },
//   37: { x: 50, y: 70 },
//   38: { x: 47, y: 70 },
//   39: { x: 44, y: 70 },
//   40: { x: 41, y: 70 },
//   41: { x: 38, y: 70 },
//   42: { x: 34, y: 70 },
//   54: { x: 70, y: 69 },
//   55: { x: 67, y: 60 },
//   43: { x: 86, y: 20 },
//   44: { x: 88.5, y: 21 },
//   71: { x: 95, y: 24 },
//   64: { x: 95, y: 37 },
//   45: { x: 89, y: 32 },
//   46: { x: 87, y: 38 },
//   47: { x: 86, y: 44 },
//   59: { x: 76, y: 38 },
//   58: { x: 74, y: 44 },
//   48: { x: 85, y: 51 },
//   57: { x: 72, y: 49 },
//   56: { x: 70, y: 54 },
//   33: { x: 58, y: 61 },
//   49: { x: 85, y: 58 },
//   50: { x: 83, y: 64 },
//   51: { x: 81, y: 69 },
//   52: { x: 77, y: 74 },
//   53: { x: 74, y: 74 },
//   67: { x: 93, y: 57 },
//   68: { x: 92, y: 62 },
//   65: { x: 94, y: 44 },
//   66: { x: 94, y: 51 },
//   69: { x: 91, y: 68 },
//   70: { x: 91, y: 73 }
// }

// const DashboardMap = () => {
//   const [lots, setLots] = useState([])
//   const [properties, setProperties] = useState([])
//   const [anchorEl, setAnchorEl] = useState(null)
//   const [selectedProperty, setSelectedProperty] = useState(null)

//   useEffect(() => {
//     fetchData()
//   }, [])

//   const fetchData = async () => {
//     try {
//       const [lotsRes, propertiesRes] = await Promise.all([
//         api.get('/lots'),
//         api.get('/properties')
//       ])
//       setLots(lotsRes.data)
//       setProperties(propertiesRes.data)
//     } catch (error) {
//       console.error('Error loading map data:', error)
//     }
//   }

//   const handleLotHover = (event, lot) => {
//     if (lot.status === 'sold' || lot.status === 'pending') {
//       // Find property associated with this lot
//       const property = properties.find(p => p.lot?._id === lot._id || p.lot === lot._id)
//       if (property) {
//         setSelectedProperty({ ...property, lot })
//         setAnchorEl(event.currentTarget)
//       }
//     }
//   }

//   const handlePopoverClose = () => {
//     setAnchorEl(null)
//     setSelectedProperty(null)
//   }

//   const open = Boolean(anchorEl)

//   return (
//     <Box>
//       {/* Map Container */}
//       <Box
//         sx={{
//           width: '100%',
//           height: { xs: '250px', sm: '300px', md: '350px' },
//           bgcolor: '#f0f0f0',
//           position: 'relative',
//           borderRadius: 2,
//           overflow: 'hidden'
//         }}
//       >
//         <Box
//           sx={{
//             position: 'absolute',
//             top: 0,
//             left: 0,
//             width: '100%',
//             height: '100%',
//             backgroundImage: `url(${map})`,
//             backgroundSize: '95% 95%',
//             backgroundPosition: 'center',
//             backgroundRepeat: 'no-repeat'
//           }}
//         >
//           {/* Lot Markers */}
//           {lots.map((lot) => {
//             const position = lotPositions[lot.number]
//             if (!position) return null

//             const isInteractive = lot.status === 'sold' || lot.status === 'pending'

//             return (
//               <Tooltip 
//                 key={lot._id} 
//                 title={isInteractive ? 'Click to view details' : `Lot ${lot.number} - Available`} 
//                 arrow
//               >
//                 <Box
//                   onMouseEnter={(e) => handleLotHover(e, lot)}
//                   onMouseLeave={handlePopoverClose}
//                   sx={{
//                     position: 'absolute',
//                     left: `${position.x}%`,
//                     top: `${position.y}%`,
//                     transform: 'translate(-50%, -50%)',
//                     width: { xs: 12, sm: 16, md: 20 },
//                     height: { xs: 12, sm: 16, md: 20 },
//                     borderRadius: '50%',
//                     display: 'flex',
//                     alignItems: 'center',
//                     justifyContent: 'center',
//                     cursor: isInteractive ? 'pointer' : 'default',
//                     bgcolor: lot.status === 'pending' ? '#1976d2' : lot.status === 'sold' ? '#f44336' : '#4caf50',
//                     color: '#fff',
//                     fontSize: { xs: '0.45rem', sm: '0.55rem', md: '0.65rem' },
//                     fontWeight: 'bold',
//                     boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
//                     border: '2px solid rgba(255,255,255,0.9)',
//                     transition: 'all 0.2s ease',
//                     zIndex: 1,
//                     '&:hover': isInteractive ? {
//                       transform: 'translate(-50%, -50%) scale(1.3)',
//                       zIndex: 10,
//                       boxShadow: '0 4px 12px rgba(0,0,0,0.4)'
//                     } : {}
//                   }}
//                 >
//                   {lot.number}
//                 </Box>
//               </Tooltip>
//             )
//           })}
//         </Box>

//         {/* Legend */}
//         <Box sx={{ 
//           position: 'absolute', 
//           bottom: 10, 
//           left: 10, 
//           display: 'flex', 
//           gap: 1.5, 
//           zIndex: 100,
//           flexWrap: 'wrap'
//         }}>
//           <Paper sx={{ px: 1.5, py: 0.5, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.95)' }}>
//             <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
//               <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#4caf50' }} />
//               <Typography variant="caption" sx={{ fontSize: '0.65rem' }}>Available</Typography>
//             </Box>
//           </Paper>
//           <Paper sx={{ px: 1.5, py: 0.5, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.95)' }}>
//             <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
//               <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#1976d2' }} />
//               <Typography variant="caption" sx={{ fontSize: '0.65rem' }}>Hold</Typography>
//             </Box>
//           </Paper>
//           <Paper sx={{ px: 1.5, py: 0.5, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.95)' }}>
//             <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
//               <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#f44336' }} />
//               <Typography variant="caption" sx={{ fontSize: '0.65rem' }}>Sold</Typography>
//             </Box>
//           </Paper>
//         </Box>
//       </Box>

//       {/* Property Details Popover */}
//       <Popover
//         open={open}
//         anchorEl={anchorEl}
//         onClose={handlePopoverClose}
//         anchorOrigin={{
//           vertical: 'top',
//           horizontal: 'center',
//         }}
//         transformOrigin={{
//           vertical: 'bottom',
//           horizontal: 'center',
//         }}
//         sx={{
//           pointerEvents: 'none',
//         }}
//         disableRestoreFocus
//       >
//         {selectedProperty && (
//           <Paper sx={{ p: 2, width: 280, boxShadow: 3 }}>
//             {/* Header */}
//             <Box sx={{ mb: 1.5 }}>
//               <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
//                 <Typography variant="subtitle1" fontWeight="bold">
//                   Lot {selectedProperty.lot?.number}
//                 </Typography>
//                 <Chip 
//                   label={selectedProperty.lot?.status === 'sold' ? 'SOLD' : 'HOLD'} 
//                   color={selectedProperty.lot?.status === 'sold' ? 'error' : 'primary'}
//                   size="small"
//                 />
//               </Box>
//               <Typography variant="caption" color="text.secondary">
//                 Phase II - North Creek
//               </Typography>
//             </Box>

//             {/* Property Details */}
//             <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
//               {/* Model Info */}
//               <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
//                 <Home sx={{ fontSize: 18, color: '#666' }} />
//                 <Box>
//                   <Typography variant="caption" color="text.secondary" display="block">
//                     Model
//                   </Typography>
//                   <Typography variant="body2" fontWeight="500">
//                     {selectedProperty.model?.model || 'N/A'}
//                   </Typography>
//                 </Box>
//               </Box>

//               {/* Square Footage */}
//               <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
//                 <SquareFoot sx={{ fontSize: 18, color: '#666' }} />
//                 <Box>
//                   <Typography variant="caption" color="text.secondary" display="block">
//                     Square Feet
//                   </Typography>
//                   <Typography variant="body2" fontWeight="500">
//                     {selectedProperty.model?.sqft?.toLocaleString() || 'N/A'} sqft
//                   </Typography>
//                 </Box>
//               </Box>

//               {/* Price */}
//               <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
//                 <AttachMoney sx={{ fontSize: 18, color: '#666' }} />
//                 <Box>
//                   <Typography variant="caption" color="text.secondary" display="block">
//                     Sale Price
//                   </Typography>
//                   <Typography variant="body2" fontWeight="bold" color="primary">
//                     ${(selectedProperty.presalePrice || selectedProperty.listPrice || 0).toLocaleString()}
//                   </Typography>
//                 </Box>
//               </Box>

//               {/* Owner/Client */}
//               {selectedProperty.client && (
//                 <Box sx={{ mt: 1, pt: 1, borderTop: '1px solid #eee' }}>
//                   <Typography variant="caption" color="text.secondary" display="block">
//                     Owner
//                   </Typography>
//                   <Typography variant="body2" fontWeight="500">
//                     {selectedProperty.client.firstName} {selectedProperty.client.lastName}
//                   </Typography>
//                 </Box>
//               )}
//             </Box>
//           </Paper>
//         )}
//       </Popover>
//     </Box>
//   )
// }

// export default DashboardMap


import { Box, Paper, Typography, Tooltip, Chip, IconButton } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import RemoveIcon from '@mui/icons-material/Remove'
import MyLocationIcon from '@mui/icons-material/MyLocation'
import { useState, useEffect, useRef } from 'react'
import { Home, SquareFoot, AttachMoney } from '@mui/icons-material'
import api from '../services/api'
import map from '../../public/images/mapLakewood.png'

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

const DashboardMap = () => {
  const [lots, setLots] = useState([])
  const [properties, setProperties] = useState([])
  const [selectedProperty, setSelectedProperty] = useState(null)
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 })
  const [showPopup, setShowPopup] = useState(false)
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [hasMoved, setHasMoved] = useState(false)
  const isOverPopupRef = useRef(false)
  const isOverMarkerRef = useRef(false)
  const closeTimeoutRef = useRef(null)
  const mapRef = useRef(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [lotsRes, propertiesRes] = await Promise.all([
        api.get('/lots'),
        api.get('/properties')
      ])
      setLots(lotsRes.data)
      setProperties(propertiesRes.data)
    } catch (error) {
      console.error('Error loading map data:', error)
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

  const handleLotHover = (event, lot) => {
    isOverMarkerRef.current = true
    
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current)
      closeTimeoutRef.current = null
    }

    if (lot.status === 'sold' || lot.status === 'pending') {
      const property = properties.find(p => p.lot?._id === lot._id || p.lot === lot._id)
      if (property) {
        const rect = event.currentTarget.getBoundingClientRect()
        setPopupPosition({
          x: rect.left + rect.width / 2,
          y: rect.top
        })
        setSelectedProperty({ ...property, lot })
        setShowPopup(true)
      }
    }
  }

  const handleLotLeave = () => {
    isOverMarkerRef.current = false
    
    closeTimeoutRef.current = setTimeout(() => {
      if (!isOverPopupRef.current && !isOverMarkerRef.current) {
        setShowPopup(false)
        setSelectedProperty(null)
      }
    }, 100)
  }

  const handlePopupEnter = () => {
    isOverPopupRef.current = true
    
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current)
      closeTimeoutRef.current = null
    }
  }

  const handlePopupLeave = () => {
    isOverPopupRef.current = false
    
    closeTimeoutRef.current = setTimeout(() => {
      if (!isOverPopupRef.current && !isOverMarkerRef.current) {
        setShowPopup(false)
        setSelectedProperty(null)
      }
    }, 100)
  }

  return (
    <Box sx={{ position: 'relative' }}>
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
          {/* Map Background with Zoom & Pan */}
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
              backgroundRepeat: 'no-repeat'
            }}
          >
            {/* Lot Markers */}
            {lots.map((lot) => {
              const position = lotPositions[lot.number]
              if (!position) return null

              const isInteractive = lot.status === 'sold' || lot.status === 'pending'

              const LotMarker = (
                <Box
                  onMouseEnter={(e) => handleLotHover(e, lot)}
                  onMouseLeave={handleLotLeave}
                  onClick={(e) => {
                    if (!hasMoved && isInteractive) {
                      e.stopPropagation()
                    }
                  }}
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
                    cursor: isInteractive ? 'pointer' : 'default',
                    bgcolor: lot.status === 'pending' ? '#1976d2' : lot.status === 'sold' ? '#f44336' : '#4caf50',
                    color: '#fff',
                    fontSize: { xs: '0.5rem', sm: '0.6rem', md: '0.75rem' },
                    fontWeight: 'bold',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                    border: '2px solid rgba(255,255,255,0.9)',
                    transition: 'all 0.2s ease',
                    zIndex: 1,
                    '&:hover': isInteractive ? {
                      transform: 'translate(-50%, -50%) scale(1.3)',
                      zIndex: 10,
                      boxShadow: '0 4px 12px rgba(0,0,0,0.4)'
                    } : {}
                  }}
                >
                  {lot.number}
                </Box>
              )

              return isInteractive ? (
                <Box key={lot._id}>
                  {LotMarker}
                </Box>
              ) : (
                <Tooltip 
                  key={lot._id} 
                  title={`Lot ${lot.number} - Available`} 
                  arrow
                >
                  {LotMarker}
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

          {/* Legend */}
          <Box sx={{ 
            position: 'absolute', 
            bottom: 10, 
            left: 10, 
            display: 'flex', 
            gap: 1, 
            zIndex: 100,
            flexWrap: 'wrap'
          }}>
            <Paper sx={{ px: 1, py: 0.5, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.95)' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#4caf50' }} />
                <Typography variant="caption" sx={{ fontSize: { xs: '0.6rem', sm: '0.65rem' } }}>Available</Typography>
              </Box>
            </Paper>
            <Paper sx={{ px: 1, py: 0.5, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.95)' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#1976d2' }} />
                <Typography variant="caption" sx={{ fontSize: { xs: '0.6rem', sm: '0.65rem' } }}>Hold</Typography>
              </Box>
            </Paper>
            <Paper sx={{ px: 1, py: 0.5, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.95)' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#f44336' }} />
                <Typography variant="caption" sx={{ fontSize: { xs: '0.6rem', sm: '0.65rem' } }}>Sold</Typography>
              </Box>
            </Paper>
          </Box>
        </Box>
      </Box>

      {/* Custom Popup - Posicionado absolutamente */}
      {showPopup && selectedProperty && (
        <Paper
          onMouseEnter={handlePopupEnter}
          onMouseLeave={handlePopupLeave}
          sx={{
            position: 'fixed',
            left: `${popupPosition.x}px`,
            top: `${popupPosition.y}px`,
            transform: 'translate(-50%, calc(-100% - 10px))',
            p: 2,
            width: 280,
            boxShadow: 3,
            zIndex: 10000,
            pointerEvents: 'auto'
          }}
        >
          <Box sx={{ mb: 1.5 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
              <Typography variant="subtitle1" fontWeight="bold">
                Lot {selectedProperty.lot?.number}
              </Typography>
              <Chip 
                label={selectedProperty.lot?.status === 'sold' ? 'SOLD' : 'HOLD'} 
                color={selectedProperty.lot?.status === 'sold' ? 'error' : 'primary'}
                size="small"
              />
            </Box>
            <Typography variant="caption" color="text.secondary">
              Phase II - North Creek
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Home sx={{ fontSize: 18, color: '#666' }} />
              <Box>
                <Typography variant="caption" color="text.secondary" display="block">
                  Model
                </Typography>
                <Typography variant="body2" fontWeight="500">
                  {selectedProperty.model?.model || 'N/A'}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <SquareFoot sx={{ fontSize: 18, color: '#666' }} />
              <Box>
                <Typography variant="caption" color="text.secondary" display="block">
                  Square Feet
                </Typography>
                <Typography variant="body2" fontWeight="500">
                  {selectedProperty.model?.sqft?.toLocaleString() || 'N/A'} sqft
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AttachMoney sx={{ fontSize: 18, color: '#666' }} />
              <Box>
                <Typography variant="caption" color="text.secondary" display="block">
                  Sale Price
                </Typography>
                <Typography variant="body2" fontWeight="bold" color="primary">
                  ${(selectedProperty.presalePrice || selectedProperty.listPrice || 0).toLocaleString()}
                </Typography>
              </Box>
            </Box>

            {selectedProperty.client && (
              <Box sx={{ mt: 1, pt: 1, borderTop: '1px solid #eee' }}>
                <Typography variant="caption" color="text.secondary" display="block">
                  Owner
                </Typography>
                <Typography variant="body2" fontWeight="500">
                  {selectedProperty.client.firstName} {selectedProperty.client.lastName}
                </Typography>
              </Box>
            )}
          </Box>
        </Paper>
      )}
    </Box>
  )
}

export default DashboardMap