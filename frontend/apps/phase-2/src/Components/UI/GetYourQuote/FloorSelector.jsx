// import {
//   Box, Paper, Typography
// } from '@mui/material'
// import LayersIcon from '@mui/icons-material/Layers'
// import { usePropertyBuilding } from '../../../Context/PropertyBuildingContext'
// import { useState } from 'react'
// import PolygonImagePreview from '../PolygonImagePreview'

// const FloorSelector = () => {
//   const {
//     selectedBuilding,
//     selectedFloor,
//     selectFloor,
//   } = usePropertyBuilding()

//   const exteriorUrl = selectedBuilding?.exteriorRenders?.[0] || null
//   const floorPolygons = selectedBuilding?.buildingFloorPolygons || []
//   const hasFloorPolygons = floorPolygons.length > 0

//   const [hovered, setHovered] = useState(null)

//   const handlePolygonClick = (poly) => {
//     const floorPlan = (selectedBuilding?.floorPlans || []).find(
//       fp => fp.floorNumber === poly.floorNumber
//     )
//     if (floorPlan) selectFloor(floorPlan)
//   }

//   // Si NO hay piso seleccionado, muestra la imagen exterior y polígonos interactivos
//   if (exteriorUrl && hasFloorPolygons && !selectedFloor) {
//     // Prepara los polígonos para el preview
//     const polygons = floorPolygons.map(poly => ({
//       id: poly.id,
//       points: poly.points,
//       color: poly.color || '#8CA551',
//       name: poly.name || `Floor ${poly.floorNumber}`,
//       floorNumber: poly.floorNumber,
//     }))

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
//             mx: 'auto',
//             position: 'relative',
//             bgcolor: '#f5f5f5',
//             borderRadius: 3,
//             overflow: 'hidden', // importante para evitar scroll
//             aspectRatio: '16/10', // o la relación de tu imagen, si la sabes
//             minHeight: 200,
//           }}
//         >
// <PolygonImagePreview
//   imageUrl={exteriorUrl}
//   polygons={polygons}
//   maxWidth={1000}  // ✅ Mismo que ExteriorPolygonEditor
//   maxHeight={700}  // ✅ Mismo que ExteriorPolygonEditor
//   showLabels
//   highlightPolygonId={hovered}
//   onPolygonClick={poly => handlePolygonClick(poly)}
//   onPolygonHover={polyId => setHovered(polyId)}
// />
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

  if (exteriorUrl && hasFloorPolygons && !selectedFloor) {
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
        
        <PolygonImagePreview
          imageUrl={exteriorUrl}
          polygons={polygons}
          maxWidth={1000}
          maxHeight={700}
          showLabels
          highlightPolygonId={hovered}
          onPolygonClick={poly => handlePolygonClick(poly)}
          onPolygonHover={polyId => setHovered(polyId)}
          enableZoom={true}
        />
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