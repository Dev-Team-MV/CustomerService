// import { useState, useRef } from 'react'
// import {
//   Box, Paper, Typography, Tooltip, IconButton,
//   Chip, Select, MenuItem, useTheme, useMediaQuery
// } from '@mui/material'
// import AddIcon from '@mui/icons-material/Add'
// import RemoveIcon from '@mui/icons-material/Remove'
// import MyLocationIcon from '@mui/icons-material/MyLocation'
// import MeetingRoomIcon from '@mui/icons-material/MeetingRoom'
// import { usePropertyBuilding } from '../../../Context/PropertyBuildingContext'

// // Konva
// import { Stage, Layer, Image as KonvaImage, Group, Label, Tag, Text, Line } from 'react-konva'
// import useImage from 'use-image'

// // Status colours matching the rest of the app
// const APT_COLOR = {
//   available: '#4caf50',
//   pending:   '#2196f3',
//   sold:      '#f44336',
//   cancelled: '#9e9e9e',
// }

// const ApartmentSelector = () => {
//   const {
//     selectedFloor,
//     selectedBuilding,
//     selectedApartment,
//     selectApartment,
//     resolveApartmentForPolygon,
//     getApartmentsForFloor,
//   } = usePropertyBuilding()

//       console.log('[STEP 3] selectedFloor:', selectedFloor)
//   console.log('[STEP 3] polygons:', selectedFloor?.polygons)
//   console.log('[STEP 3] apartments for floor:', getApartmentsForFloor(selectedFloor?.floorNumber))
//   console.log('[STEP 3] selectedApartment:', selectedApartment)


//   const theme  = useTheme()
//   const isMob  = useMediaQuery(theme.breakpoints.down('sm'))

//   if (!selectedFloor) return null

//   const polygons     = selectedFloor.polygons || []
//   const floorApts    = getApartmentsForFloor(selectedFloor.floorNumber)
//   const hasImage     = Boolean(selectedFloor.url)
//   const hasPolygons  = polygons.length > 0

//   // Konva image hook
//   const [floorImage] = useImage(selectedFloor.url || '')

//   // Encuentra el máximo X/Y de todos los puntos para escalar el canvas
//   const allPoints = polygons.flatMap(poly => poly.points)
//   const maxX = Math.max(...allPoints.filter((_, i) => i % 2 === 0), 100)
//   const maxY = Math.max(...allPoints.filter((_, i) => i % 2 === 1), 100)

//   // Tamaño visual del canvas (ajusta según tu layout)
//   const width = isMob ? 350 : 900
//   const height = isMob ? 220 : 600

//   // Zoom y pan
//   const [zoom, setZoom] = useState(1)
//   const [pan, setPan]   = useState({ x: 0, y: 0 })
//   const [isDragging, setIsDragging] = useState(false)
//   const [dragStart, setDragStart]   = useState({ x: 0, y: 0 })
//   const [hasMoved, setHasMoved]     = useState(false)
//   const [hoveredPoly, setHoveredPoly] = useState(null)

//   // Zoom handlers
//   const handleZoomIn  = () => setZoom(p => Math.min(p + 0.3, 4))
//   const handleZoomOut = () => setZoom(p => Math.max(p - 0.3, 0.5))
//   const handleReset   = () => { setZoom(1); setPan({ x: 0, y: 0 }) }

//   // Pan handlers
//   const onMouseDown = (e) => {
//     setIsDragging(true)
//     setHasMoved(false)
//     setDragStart({ x: e.evt.clientX - pan.x, y: e.evt.clientY - pan.y })
//   }
//   const onMouseMove = (e) => {
//     if (!isDragging) return
//     setHasMoved(true)
//     setPan({
//       x: e.evt.clientX - dragStart.x,
//       y: e.evt.clientY - dragStart.y
//     })
//   }
//   const onMouseUp = () => setIsDragging(false)

//   // Dropdown handler
//   const handleDropdownSelect = (e) => {
//     const aptId = e.target.value
//     const apt = floorApts.find(a => a._id === aptId)
//     if (apt) selectApartment(apt)
//   }

//   const getAptForPoly = (poly) => resolveApartmentForPolygon(poly, selectedFloor.floorNumber)

//   const getStatusColor = (poly, apt) => {
//     // Usa el color del polígono siempre para el fill
//     // El borde puede reflejar el estado si quieres
//     return poly.color || APT_COLOR[apt?.status] || '#8CA551'
//   }

//   const isPolySelected = (poly) => {
//     const apt = getAptForPoly(poly)
//     return apt?._id === selectedApartment?._id
//   }

//   // Normaliza puntos al tamaño del canvas
//   const normPoints = (pts) => {
//     if (!Array.isArray(pts) || pts.length < 6) return []
//     return pts.map((p, i) =>
//       i % 2 === 0
//         ? (p / maxX) * width
//         : (p / maxY) * height
//     )
//   }

//   return (
//     <Paper elevation={0} sx={paperSx}>
//       {/* Header */}
//       <Box sx={headerSx}>
//         <Box display="flex" alignItems="center" gap={1}>
//           <MeetingRoomIcon sx={{ color: '#8CA551', fontSize: 20 }} />
//           <Typography sx={sectionLabelSx}>03 SELECT AN APARTMENT</Typography>
//         </Box>
//         <Box display="flex" gap={1} flexWrap="wrap" alignItems="center">
//           <LegendDot color={APT_COLOR.available} label="Available" />
//           <LegendDot color={APT_COLOR.pending}   label="Hold"      />
//           <LegendDot color={APT_COLOR.sold}      label="Sold"      />
//           <Chip
//             label={`Floor ${selectedFloor.floorNumber}`}
//             size="small"
//             sx={{ bgcolor: 'rgba(51,63,31,0.08)', color: '#333F1F', fontWeight: 700, fontSize: '0.65rem', fontFamily: '"Poppins", sans-serif' }}
//           />
//         </Box>
//       </Box>

//       {/* ── Floor plan image + Konva polygons ── */}
//       {hasImage ? (
//         <Box sx={{ width: '100%', height, position: 'relative', bgcolor: '#f5f5f5', overflow: 'hidden' }}>
//           <Stage
//             width={width}
//             height={height}
//             scaleX={zoom}
//             scaleY={zoom}
//             x={pan.x}
//             y={pan.y}
//             style={{ background: '#f5f5f5', borderRadius: 8, cursor: isDragging ? 'grabbing' : 'grab' }}
//             onMouseDown={onMouseDown}
//             onMouseMove={onMouseMove}
//             onMouseUp={onMouseUp}
//             onMouseLeave={onMouseUp}
//           >
//             <Layer>
//               {/* Imagen de fondo */}
//               {floorImage && (
//                 <KonvaImage
//                   image={floorImage}
//                   width={width}
//                   height={height}
//                   listening={false}
//                 />
//               )}
//               {/* Polígonos */}
//               {hasPolygons && polygons.map((poly) => {
//                 const apt       = getAptForPoly(poly)
//                 const isAvail   = apt?.status === 'available'
//                 const isSel     = isPolySelected(poly)
//                 const isHovered = hoveredPoly === poly.id
//                 const color     = getStatusColor(poly, apt)
//                 const points    = normPoints(poly.points)
              
//                 return (
//                   <Group key={poly.id}>
//                     <Line
//                       points={points}
//                       closed
//                       fill={
//                         isSel
//                           ? color + 'BB'
//                           : isHovered && isAvail
//                             ? color + '77'
//                             : color + '33'
//                       }
//                       stroke={isSel ? '#8CA551' : color}
//                       strokeWidth={isSel ? 2 : 1}
//                       onClick={() => {
//                         if (hasMoved) return
//                         if (apt && apt.status === 'available') selectApartment(apt)
//                       }}
//                       onMouseEnter={() => setHoveredPoly(poly.id)}
//                       onMouseLeave={() => setHoveredPoly(null)}
//                       perfectDrawEnabled={false}
//                       listening={isAvail} // <--- SOLO escucha eventos si está disponible
//                       opacity={0.7}
//                       // Cambia el cursor según disponibilidad
//                       cursor={isAvail ? 'pointer' : 'not-allowed'}
//                     />
//                     {/* Tooltip-like label */}
//                     {isHovered && apt && (
//                       <Label x={points[0]} y={points[1] - 30}>
//                         <Tag
//                           fill="#fff"
//                           stroke="#8CA551"
//                           cornerRadius={4}
//                           shadowColor="#000"
//                           shadowBlur={4}
//                           shadowOpacity={0.08}
//                         />
//                         <Text
//                           text={`Apt ${apt.apartmentNumber} · $${apt.price?.toLocaleString()} · ${apt.status}`}
//                           fontFamily="Poppins"
//                           fontSize={14}
//                           fill="#333F1F"
//                           padding={8}
//                         />
//                       </Label>
//                     )}
//                   </Group>
//                 )
//               })}
//             </Layer>
//           </Stage>

//           {/* Zoom controls */}
//           <Box sx={{ position: 'absolute', bottom: 12, right: 12, display: 'flex', flexDirection: 'column', gap: 1, zIndex: 100 }}>
//             <Paper elevation={3} sx={{ display: 'flex', flexDirection: 'column', borderRadius: 1.5, overflow: 'hidden' }}>
//               <IconButton size="small" onClick={handleZoomIn}><AddIcon fontSize="small" /></IconButton>
//               <IconButton size="small" onClick={handleZoomOut}><RemoveIcon fontSize="small" /></IconButton>
//             </Paper>
//             <Paper elevation={3} sx={{ borderRadius: 1.5 }}>
//               <IconButton size="small" onClick={handleReset}><MyLocationIcon fontSize="small" /></IconButton>
//             </Paper>
//           </Box>

//           {!hasPolygons && (
//             <Box sx={{ position: 'absolute', bottom: 12, left: 12, zIndex: 100 }}>
//               <Paper sx={{ px: 1.5, py: 0.5, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.9)' }}>
//                 <Typography variant="caption" sx={{ fontFamily: '"Poppins", sans-serif', fontSize: '0.65rem', color: '#706f6f' }}>
//                   No polygons — use list below
//                 </Typography>
//               </Paper>
//             </Box>
//           )}
//         </Box>
//       ) : (
//         <Box sx={{ p: 3, textAlign: 'center', color: '#9e9e9e' }}>
//           <Typography sx={{ fontFamily: '"Poppins", sans-serif', fontSize: '0.875rem' }}>
//             No floor plan image uploaded yet.
//           </Typography>
//         </Box>
//       )}

//       {/* ── Dropdown fallback ── */}
//       <Box sx={{ p: 2, bgcolor: '#fafafa', borderTop: '1px solid #eee' }}>
//         <Select
//           fullWidth
//           displayEmpty
//           size="small"
//           value={selectedApartment?._id || ''}
//           onChange={handleDropdownSelect}
//           sx={{ bgcolor: '#fff', borderRadius: 2, fontFamily: '"Poppins", sans-serif' }}
//         >
//           <MenuItem value="" disabled>
//             Select an apartment from Floor {selectedFloor.floorNumber}…
//           </MenuItem>
//           {floorApts
//             .slice()
//             .sort((a, b) => a.apartmentNumber.localeCompare(b.apartmentNumber, undefined, { numeric: true }))
//             .map(apt => (
//               <MenuItem
//                 key={apt._id}
//                 value={apt._id}
//                 disabled={apt.status !== 'available'}
//                 sx={{ opacity: apt.status === 'available' ? 1 : 0.5 }}
//               >
//                 Apt {apt.apartmentNumber} — ${apt.price?.toLocaleString()} — {apt.status.toUpperCase()}
//                 {apt.status !== 'available' && ' 🔒'}
//               </MenuItem>
//             ))}
//         </Select>
//       </Box>
//     </Paper>
//   )
// }

// const LegendDot = ({ color, label }) => (
//   <Box display="flex" alignItems="center" gap={0.5}>
//     <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: color }} />
//     <Typography variant="caption" sx={{ fontSize: '0.65rem', fontFamily: '"Poppins", sans-serif' }}>{label}</Typography>
//   </Box>
// )

// const paperSx = {
//   bgcolor: '#fff',
//   borderRadius: 4,
//   border: '1px solid #e0e0e0',
//   boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
//   overflow: 'hidden',
// }

// const headerSx = {
//   p: 2,
//   display: 'flex',
//   justifyContent: 'space-between',
//   alignItems: 'center',
//   flexWrap: 'wrap',
//   gap: 1,
//   borderBottom: '2px solid rgba(140,165,81,0.2)',
// }

// const sectionLabelSx = {
//   fontWeight: 700,
//   fontFamily: '"Poppins", sans-serif',
//   letterSpacing: '1.5px',
//   textTransform: 'uppercase',
//   fontSize: '0.85rem',
//   color: '#333F1F',
// }

// export default ApartmentSelector

import { useState } from 'react'
import {
  Box, Paper, Typography, Chip, Select, MenuItem, useTheme, useMediaQuery
} from '@mui/material'
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom'
import { usePropertyBuilding } from '../../../Context/PropertyBuildingContext'
import PolygonImagePreview from '../PolygonImagePreview' // <--- IMPORTA TU PREVIEW

const APT_COLOR = {
  available: '#4caf50',
  pending:   '#2196f3',
  sold:      '#f44336',
  cancelled: '#9e9e9e',
}

// @/Users/oficina/MV-CRM/CustomerService/frontend/apps/phase-2/src/Components/UI/GetYourQuote/ApartmentSelector.jsx

const ApartmentSelector = () => {
  const {
    selectedFloor,
    selectedApartment,
    selectApartment,
    resolveApartmentForPolygon,
    getApartmentsForFloor,
  } = usePropertyBuilding()

  const theme = useTheme()
  const isMob = useMediaQuery(theme.breakpoints.down('sm'))

  if (!selectedFloor) return null

  const polygons = selectedFloor.polygons || []
  const floorApts = getApartmentsForFloor(selectedFloor.floorNumber)
  const hasImage = Boolean(selectedFloor.url)
  const hasPolygons = polygons.length > 0

  const [hoveredPoly, setHoveredPoly] = useState(null)

  const getAptForPoly = (poly) => resolveApartmentForPolygon(poly, selectedFloor.floorNumber)

  const getStatusColor = (poly, apt) => {
    return poly.color || APT_COLOR[apt?.status] || '#8CA551'
  }

  const isPolySelected = (poly) => {
    const apt = getAptForPoly(poly)
    return apt?._id === selectedApartment?._id
  }

  // ✅ NO normalizar puntos - usar coordenadas absolutas directamente
  const previewPolygons = polygons.map(poly => {
    const apt = getAptForPoly(poly)
    const isSel = isPolySelected(poly)
    const isHovered = hoveredPoly === poly.id
    const color = getStatusColor(poly, apt)
    
    return {
      ...poly,
      points: poly.points, // ✅ Usar puntos directamente sin normalizar
      color,
      id: poly.id,
      fill:
        isSel
          ? color + 'BB'
          : isHovered && apt?.status === 'available'
            ? color + '77'
            : color + '33',
      stroke: isSel ? '#8CA551' : color,
      strokeWidth: isSel ? 2 : 1,
      isAvailable: apt?.status === 'available',
      isSel,
      isHovered,
      apt,
    }
  })

  const handleDropdownSelect = (e) => {
    const aptId = e.target.value
    const apt = floorApts.find(a => a._id === aptId)
    if (apt) selectApartment(apt)
  }

  return (
    <Paper elevation={0} sx={paperSx}>
      <Box sx={headerSx}>
        <Box display="flex" alignItems="center" gap={1}>
          <MeetingRoomIcon sx={{ color: '#8CA551', fontSize: 20 }} />
          <Typography sx={sectionLabelSx}>03 SELECT AN APARTMENT</Typography>
        </Box>
        <Box display="flex" gap={1} flexWrap="wrap" alignItems="center">
          <LegendDot color={APT_COLOR.available} label="Available" />
          <LegendDot color={APT_COLOR.pending} label="Hold" />
          <LegendDot color={APT_COLOR.sold} label="Sold" />
          <Chip
            label={`Floor ${selectedFloor.floorNumber}`}
            size="small"
            sx={{ bgcolor: 'rgba(51,63,31,0.08)', color: '#333F1F', fontWeight: 700, fontSize: '0.65rem', fontFamily: '"Poppins", sans-serif' }}
          />
        </Box>
      </Box>

      {hasImage ? (
        <Box
          sx={{
            width: '100%',
            mx: 'auto',
            position: 'relative',
            bgcolor: '#f5f5f5',
            borderRadius: 3,
            overflow: 'hidden',
            minHeight: 200,
          }}
        >
          <PolygonImagePreview
            imageUrl={selectedFloor.url}
            polygons={previewPolygons}
            maxWidth={1000}  // ✅ Mismo que FloorPlanEditor
            maxHeight={700}  // ✅ Mismo que FloorPlanEditor
            highlightPolygonId={hoveredPoly}
            showLabels={false}
            onPolygonClick={poly => {
              if (poly.isAvailable) selectApartment(poly.apt)
            }}
            onPolygonHover={setHoveredPoly}
          />
        </Box>
      ) : (
        <Box sx={{ p: 3, textAlign: 'center', color: '#9e9e9e' }}>
          <Typography sx={{ fontFamily: '"Poppins", sans-serif', fontSize: '0.875rem' }}>
            No floor plan image uploaded yet.
          </Typography>
        </Box>
      )}

      <Box sx={{ p: 2, bgcolor: '#fafafa', borderTop: '1px solid #eee' }}>
        <Select
          fullWidth
          displayEmpty
          size="small"
          value={selectedApartment?._id || ''}
          onChange={handleDropdownSelect}
          sx={{ bgcolor: '#fff', borderRadius: 2, fontFamily: '"Poppins", sans-serif' }}
        >
          <MenuItem value="" disabled>
            Select an apartment from Floor {selectedFloor.floorNumber}…
          </MenuItem>
          {floorApts
            .slice()
            .sort((a, b) => a.apartmentNumber.localeCompare(b.apartmentNumber, undefined, { numeric: true }))
            .map(apt => (
              <MenuItem
                key={apt._id}
                value={apt._id}
                disabled={apt.status !== 'available'}
                sx={{ opacity: apt.status === 'available' ? 1 : 0.5 }}
              >
                Apt {apt.apartmentNumber} — ${apt.price?.toLocaleString()} — {apt.status.toUpperCase()}
                {apt.status !== 'available' && ' 🔒'}
              </MenuItem>
            ))}
        </Select>
      </Box>
    </Paper>
  )
}

const LegendDot = ({ color, label }) => (
  <Box display="flex" alignItems="center" gap={0.5}>
    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: color }} />
    <Typography variant="caption" sx={{ fontSize: '0.65rem', fontFamily: '"Poppins", sans-serif' }}>{label}</Typography>
  </Box>
)

const paperSx = {
  bgcolor: '#fff',
  borderRadius: 4,
  border: '1px solid #e0e0e0',
  boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
  overflow: 'hidden',
}

const headerSx = {
  p: 2,
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  flexWrap: 'wrap',
  gap: 1,
  borderBottom: '2px solid rgba(140,165,81,0.2)',
}

const sectionLabelSx = {
  fontWeight: 700,
  fontFamily: '"Poppins", sans-serif',
  letterSpacing: '1.5px',
  textTransform: 'uppercase',
  fontSize: '0.85rem',
  color: '#333F1F',
}

export default ApartmentSelector