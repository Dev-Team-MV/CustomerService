// import {
//   Box, Paper, Typography
// } from '@mui/material'
// import LayersIcon from '@mui/icons-material/Layers'
// import { usePropertyBuilding } from '../../../Context/PropertyBuildingContext'
// import { Stage, Layer, Image as KonvaImage, Line, Group, Label, Tag, Text } from 'react-konva'
// import useImage from 'use-image'
// import { useState, useEffect } from 'react'

// const FloorSelector = () => {
//   // TODOS LOS HOOKS VAN AQUÍ ARRIBA
//   const {
//     selectedBuilding,
//     selectedFloor,
//     selectFloor,
//   } = usePropertyBuilding()

//   const exteriorUrl = selectedBuilding?.exteriorRenders?.[0] || null
//   const floorPolygons = selectedBuilding?.buildingFloorPolygons || []
//   const hasFloorPolygons = floorPolygons.length > 0

//   const [image] = useImage(exteriorUrl || '')
//   const [dimensions, setDimensions] = useState({ width: 1000, height: 700 })
//   useEffect(() => {
//     if (image) {
//       const maxWidth = 1000
//       const maxHeight = 700
//       const imgRatio = image.width / image.height
//       let width = maxWidth
//       let height = maxWidth / imgRatio
//       if (height > maxHeight) {
//         height = maxHeight
//         width = maxHeight * imgRatio
//       }
//       setDimensions({ width, height })
//     }
//   }, [image])

//   const [hovered, setHovered] = useState(null)

//   const handlePolygonClick = (poly) => {
//     const floorPlan = (selectedBuilding?.floorPlans || []).find(
//       fp => fp.floorNumber === poly.floorNumber
//     )
//     if (floorPlan) selectFloor(floorPlan)
//   }

//   // AHORA SÍ puedes retornar si no hay datos
//   if (!selectedBuilding) return null

//   if (exteriorUrl && hasFloorPolygons && !selectedFloor) {
//     return (
//       <Paper elevation={0} sx={paperSx}>
//         <Box sx={headerSx}>
//           <Box display="flex" alignItems="center" gap={1}>
//             <LayersIcon sx={{ color: '#8CA551', fontSize: 20 }} />
//             <Typography sx={sectionLabelSx}>02 SELECT A FLOOR</Typography>
//           </Box>
//           <Typography variant="caption" sx={{ color: '#706f6f', fontFamily: '"Poppins", sans-serif' }}>
//             Click a floor polygon on the building exterior
//           </Typography>
//         </Box>
//         <Box
//           sx={{
//             width: '100%',
//             maxWidth: dimensions.width,
//             mx: 'auto',
//             position: 'relative',
//             bgcolor: '#f5f5f5',
//             borderRadius: 3,
//             overflow: 'auto'
//           }}
//         >
//           <Stage width={dimensions.width} height={dimensions.height}>
//             <Layer>
//               {image && (
//                 <KonvaImage
//                   image={image}
//                   width={dimensions.width}
//                   height={dimensions.height}
//                   x={0}
//                   y={0}
//                   listening={false}
//                 />
//               )}
//               {floorPolygons.map((poly) => {
//                 const points = Array.isArray(poly.points) ? poly.points : []
//                 const isHovered = hovered === poly.id
//                 return (
//                   <Group key={poly.id}>
//                     <Line
//                       points={points}
//                       closed
//                       fill={isHovered ? (poly.color || '#8CA551') + '55' : (poly.color || '#8CA551') + '33'}
//                       stroke={poly.color || '#8CA551'}
//                       strokeWidth={isHovered ? 3 : 2}
//                       onClick={() => handlePolygonClick(poly)}
//                       onMouseEnter={() => setHovered(poly.id)}
//                       onMouseLeave={() => setHovered(null)}
//                       opacity={0.7}
//                       perfectDrawEnabled={false}
//                       listening
//                       cursor="pointer"
//                     />
//                     {isHovered && (
//                       <Label x={points[0]} y={points[1] - 30}>
//                         <Tag
//                           fill="#fff"
//                           stroke={poly.color || '#8CA551'}
//                           cornerRadius={4}
//                           shadowColor="#000"
//                           shadowBlur={4}
//                           shadowOpacity={0.08}
//                         />
//                         <Text
//                           text={poly.name || `Floor ${poly.floorNumber}`}
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
//         </Box>
//       </Paper>
//     )
//   }

//   return null
// }

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

// export default FloorSelector

import {
  Box, Paper, Typography
} from '@mui/material'
import LayersIcon from '@mui/icons-material/Layers'
import { usePropertyBuilding } from '../../../Context/PropertyBuildingContext'
import { useState } from 'react'
import PolygonImagePreview from '../PolygonImagePreview'

const FloorSelector = () => {
  const {
    selectedBuilding,
    selectedFloor,
    selectFloor,
  } = usePropertyBuilding()

  const exteriorUrl = selectedBuilding?.exteriorRenders?.[0] || null
  const floorPolygons = selectedBuilding?.buildingFloorPolygons || []
  const hasFloorPolygons = floorPolygons.length > 0

  const [hovered, setHovered] = useState(null)

  const handlePolygonClick = (poly) => {
    const floorPlan = (selectedBuilding?.floorPlans || []).find(
      fp => fp.floorNumber === poly.floorNumber
    )
    if (floorPlan) selectFloor(floorPlan)
  }

  // Si NO hay piso seleccionado, muestra la imagen exterior y polígonos interactivos
  if (exteriorUrl && hasFloorPolygons && !selectedFloor) {
    // Prepara los polígonos para el preview
    const polygons = floorPolygons.map(poly => ({
      id: poly.id,
      points: poly.points,
      color: poly.color || '#8CA551',
      name: poly.name || `Floor ${poly.floorNumber}`,
      floorNumber: poly.floorNumber,
    }))

    return (
      <Paper elevation={0} sx={paperSx}>
        <Box sx={headerSx}>
          <Box display="flex" alignItems="center" gap={1}>
            <LayersIcon sx={{ color: '#8CA551', fontSize: 20 }} />
            <Typography sx={sectionLabelSx}>02 SELECT A FLOOR</Typography>
          </Box>
          <Typography variant="caption" sx={{ color: '#706f6f', fontFamily: '"Poppins", sans-serif' }}>
            Click a floor polygon on the building exterior
          </Typography>
        </Box>
        <Box
          sx={{
            width: '100%',
            mx: 'auto',
            position: 'relative',
            bgcolor: '#f5f5f5',
            borderRadius: 3,
            overflow: 'hidden', // importante para evitar scroll
            aspectRatio: '16/10', // o la relación de tu imagen, si la sabes
            minHeight: 200,
          }}
        >
<PolygonImagePreview
  imageUrl={exteriorUrl}
  polygons={polygons}
  maxWidth={1000}  // ✅ Mismo que ExteriorPolygonEditor
  maxHeight={700}  // ✅ Mismo que ExteriorPolygonEditor
  showLabels
  highlightPolygonId={hovered}
  onPolygonClick={poly => handlePolygonClick(poly)}
  onPolygonHover={polyId => setHovered(polyId)}
/>
        </Box>
      </Paper>
    )
  }

  return null
}

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

export default FloorSelector