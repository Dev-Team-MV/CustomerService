// import { useEffect, useState, useRef } from 'react'
// import { Stage, Layer, Line, Image as KonvaImage, Label, Tag, Text } from 'react-konva'
// import useImage from 'use-image'
// import { Box, IconButton, Paper } from '@mui/material'
// import AddIcon from '@mui/icons-material/Add'
// import RemoveIcon from '@mui/icons-material/Remove'
// import MyLocationIcon from '@mui/icons-material/MyLocation'

// const PolygonImagePreview = ({
//   imageUrl,
//   polygons = [],
//   maxWidth = 1000,
//   maxHeight = 700,
//   highlightPolygonId = null,
//   showLabels = false,
//   onPolygonClick,
//   onPolygonHover,
//   enableZoom = true,
// }) => {
//   const [image] = useImage(imageUrl || '')
//   const [dimensions, setDimensions] = useState({ width: maxWidth, height: maxHeight })
//   const [scale, setScale] = useState(1)
//   const [scaleFactor, setScaleFactor] = useState(1) // ✅ Factor de escala para polígonos
//   const containerRef = useRef(null)

//   // ✅ Calcular dimensiones responsive y scaleFactor
//   useEffect(() => {
//     if (image && containerRef.current) {
//       const updateDimensions = () => {
//         const container = containerRef.current
//         if (!container) return

//         const containerWidth = container.offsetWidth
//         const imgRatio = image.width / image.height
        
//         // Calcular dimensiones actuales
//         let width = Math.min(containerWidth - 32, maxWidth)
//         let height = width / imgRatio
        
//         if (height > maxHeight) {
//           height = maxHeight
//           width = height * imgRatio
//         }
        
//         // ✅ Calcular dimensiones originales (sin responsive)
//         let originalWidth = maxWidth
//         let originalHeight = maxWidth / imgRatio
        
//         if (originalHeight > maxHeight) {
//           originalHeight = maxHeight
//           originalWidth = maxHeight * imgRatio
//         }
        
//         // ✅ Calcular factor de escala
//         const factor = width / originalWidth
//         setScaleFactor(factor)
//         setDimensions({ width, height })
//       }

//       updateDimensions()
//       window.addEventListener('resize', updateDimensions)
//       return () => window.removeEventListener('resize', updateDimensions)
//     }
//   }, [image, maxWidth, maxHeight])

//   const handleZoomIn = () => setScale(Math.min(scale + 0.2, 3))
//   const handleZoomOut = () => setScale(Math.max(scale - 0.2, 0.5))
//   const handleReset = () => setScale(1)

//   return (
//     <Box
//       ref={containerRef}
//       sx={{
//         width: '100%',
//         display: 'flex',
//         justifyContent: 'center',
//         alignItems: 'center',
//         background: '#f5f5f5',
//         borderRadius: 2,
//         overflow: 'hidden',
//         position: 'relative',
//         minHeight: { xs: 200, sm: 300, md: 400 },
//         p: 2,
//       }}
//     >
//       {image && (
//         <>
//           <Box
//             sx={{
//               overflow: 'auto',
//               maxWidth: '100%',
//               maxHeight: '100%',
//               display: 'flex',
//               justifyContent: 'center',
//               alignItems: 'center',
//               '&::-webkit-scrollbar': {
//                 width: '8px',
//                 height: '8px',
//               },
//               '&::-webkit-scrollbar-thumb': {
//                 backgroundColor: 'rgba(0,0,0,0.2)',
//                 borderRadius: '4px',
//               },
//             }}
//           >
//             <Stage 
//               width={dimensions.width} 
//               height={dimensions.height}
//               scaleX={scale}
//               scaleY={scale}
//               style={{
//                 border: '2px solid #e0e0e0',
//                 backgroundColor: '#fff',
//                 borderRadius: '8px',
//               }}
//             >
//               <Layer>
//                 {/* Imagen de fondo */}
//                 <KonvaImage
//                   image={image}
//                   width={dimensions.width}
//                   height={dimensions.height}
//                   x={0}
//                   y={0}
//                   listening={false}
//                 />
                
//                 {/* Polígonos */}
//                 {polygons.map((poly) => {
//                   const isHighlighted = poly.id === highlightPolygonId
                  
//                   // ✅ Escalar coordenadas de polígonos según scaleFactor
//                   const scaledPoints = poly.points.map((coord, idx) => coord * scaleFactor)
                  
//                   return (
//                     <Line
//                       key={poly.id}
//                       points={scaledPoints}
//                       closed
//                       fill={
//                         poly.fill || 
//                         (isHighlighted 
//                           ? (poly.color || '#8CA551') + '66' 
//                           : (poly.color || '#8CA551') + '33')
//                       }
//                       stroke={poly.stroke || poly.color || '#8CA551'}
//                       strokeWidth={poly.strokeWidth || (isHighlighted ? 4 : 2)}
//                       opacity={poly.opacity !== undefined ? poly.opacity : 0.7}
//                       shadowBlur={isHighlighted ? 15 : 0}
//                       shadowColor={poly.color || '#8CA551'}
//                       shadowOpacity={0.6}
//                       onClick={() => onPolygonClick && onPolygonClick(poly)}
//                       onTap={() => onPolygonClick && onPolygonClick(poly)}
//                       onMouseEnter={(e) => {
//                         if (poly.isAvailable !== false) {
//                           e.target.getStage().container().style.cursor = 'pointer'
//                           onPolygonHover && onPolygonHover(poly.id)
//                         }
//                       }}
//                       onMouseLeave={(e) => {
//                         e.target.getStage().container().style.cursor = 'default'
//                         onPolygonHover && onPolygonHover(null)
//                       }}
//                       perfectDrawEnabled={false}
//                       listening={poly.isAvailable !== false && (!!onPolygonClick || !!onPolygonHover)}
//                     />
//                   )
//                 })}
                
//                 {/* Labels */}
//                 {/* {showLabels && polygons.map((poly) => {
//                   const pts = poly.points
//                   if (pts.length < 2) return null
                  
//                   // ✅ Escalar coordenadas del label
//                   const labelX = pts[0] * scaleFactor
//                   const labelY = (pts[1] - 30) * scaleFactor
                  
//                   return (
//                     <Label key={poly.id + '-label'} x={labelX} y={labelY}>
//                       <Tag fill="#fff" stroke="#8CA551" strokeWidth={2} cornerRadius={6} shadowBlur={8} shadowOpacity={0.2} />
//                       <Text 
//                         text={poly.name || ''} 
//                         fontFamily="Poppins" 
//                         fontSize={14} 
//                         fontStyle="bold"
//                         fill="#333F1F" 
//                         padding={8} 
//                       />
//                     </Label>
//                   )
//                 })} */}
//               </Layer>
//             </Stage>
//           </Box>

//           {/* Zoom controls */}
//           {enableZoom && (
//             <Box 
//               sx={{ 
//                 position: 'absolute', 
//                 bottom: 16, 
//                 right: 16, 
//                 display: 'flex', 
//                 flexDirection: 'column', 
//                 gap: 1, 
//                 zIndex: 100 
//               }}
//             >
//               <Paper elevation={3} sx={{ display: 'flex', flexDirection: 'column', borderRadius: 1.5, overflow: 'hidden' }}>
//                 <IconButton size="small" onClick={handleZoomIn} sx={{ borderRadius: 0 }}>
//                   <AddIcon fontSize="small" />
//                 </IconButton>
//                 <IconButton size="small" onClick={handleZoomOut} sx={{ borderRadius: 0 }}>
//                   <RemoveIcon fontSize="small" />
//                 </IconButton>
//               </Paper>
//               <Paper elevation={3} sx={{ borderRadius: 1.5 }}>
//                 <IconButton size="small" onClick={handleReset}>
//                   <MyLocationIcon fontSize="small" />
//                 </IconButton>
//               </Paper>
//             </Box>
//           )}
//         </>
//       )}
//     </Box>
//   )
// }

// export default PolygonImagePreview

import { useEffect, useState, useRef } from 'react'
import { Stage, Layer, Line, Image as KonvaImage, Label, Tag, Text } from 'react-konva'
import useImage from 'use-image'
import { Box, IconButton, Paper } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import RemoveIcon from '@mui/icons-material/Remove'
import MyLocationIcon from '@mui/icons-material/MyLocation'

const PolygonImagePreview = ({
  imageUrl,
  polygons = [],
  maxWidth = 1000,
  maxHeight = 700,
  highlightPolygonId = null,
  showLabels = false,
  onPolygonClick,
  onPolygonHover,
  enableZoom = true,
}) => {
  const [image] = useImage(imageUrl || '')
  const [dimensions, setDimensions] = useState({ width: maxWidth, height: maxHeight })
  const [scale, setScale] = useState(1)
  const [scaleFactor, setScaleFactor] = useState(1)
  const containerRef = useRef(null)
  const stageRef = useRef(null)

  // Responsive dimensions and scale factor
  useEffect(() => {
    if (image && containerRef.current) {
      const updateDimensions = () => {
        const container = containerRef.current
        if (!container) return

        const containerWidth = container.offsetWidth
        const imgRatio = image.width / image.height

        let width = Math.min(containerWidth - 32, maxWidth)
        let height = width / imgRatio

        if (height > maxHeight) {
          height = maxHeight
          width = height * imgRatio
        }

        let originalWidth = maxWidth
        let originalHeight = maxWidth / imgRatio

        if (originalHeight > maxHeight) {
          originalHeight = maxHeight
          originalWidth = maxHeight * imgRatio
        }

        const factor = width / originalWidth
        setScaleFactor(factor)
        setDimensions({ width, height })
      }

      updateDimensions()
      window.addEventListener('resize', updateDimensions)
      return () => window.removeEventListener('resize', updateDimensions)
    }
  }, [image, maxWidth, maxHeight])

  const handleZoomIn = () => setScale(Math.min(scale + 0.2, 3))
  const handleZoomOut = () => setScale(Math.max(scale - 0.2, 0.5))
  const handleReset = () => setScale(1)

  // Helper to get mouse position relative to the canvas
  const getRelativePointerPosition = (evt) => {
    if (!stageRef.current) return { x: 0, y: 0 }
    const stage = stageRef.current
    const pointerPosition = stage.getPointerPosition()
    if (!pointerPosition) return { x: 0, y: 0 }
    return pointerPosition
  }

  return (
    <Box
      ref={containerRef}
      sx={{
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: '#f5f5f5',
        borderRadius: 2,
        overflow: 'hidden',
        position: 'relative',
        minHeight: { xs: 200, sm: 300, md: 400 },
        p: 2,
      }}
    >
      {image && (
        <>
          <Box
            sx={{
              overflow: 'auto',
              maxWidth: '100%',
              maxHeight: '100%',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              '&::-webkit-scrollbar': {
                width: '8px',
                height: '8px',
              },
              '&::-webkit-scrollbar-thumb': {
                backgroundColor: 'rgba(0,0,0,0.2)',
                borderRadius: '4px',
              },
            }}
          >
            <Stage 
              ref={stageRef}
              width={dimensions.width} 
              height={dimensions.height}
              scaleX={scale}
              scaleY={scale}
              style={{
                border: '2px solid #e0e0e0',
                backgroundColor: '#fff',
                borderRadius: '8px',
              }}
            >
              <Layer>
                {/* Imagen de fondo */}
                <KonvaImage
                  image={image}
                  width={dimensions.width}
                  height={dimensions.height}
                  x={0}
                  y={0}
                  listening={false}
                />
                
                {/* Polígonos */}
                {polygons.map((poly) => {
                  const isHighlighted = poly.id === highlightPolygonId
                  const scaledPoints = poly.points.map((coord) => coord * scaleFactor)

                  return (
                    <Line
                      key={poly.id}
                      points={scaledPoints}
                      closed
                      fill={
                        poly.fill || 
                        (isHighlighted 
                          ? (poly.color || '#8CA551') + '66' 
                          : (poly.color || '#8CA551') + '33')
                      }
                      stroke={poly.stroke || poly.color || '#8CA551'}
                      strokeWidth={poly.strokeWidth || (isHighlighted ? 4 : 2)}
                      opacity={poly.opacity !== undefined ? poly.opacity : 0.7}
                      shadowBlur={isHighlighted ? 15 : 0}
                      shadowColor={poly.color || '#8CA551'}
                      shadowOpacity={0.6}
                      onClick={() => onPolygonClick && onPolygonClick(poly)}
                      onTap={() => onPolygonClick && onPolygonClick(poly)}
                      onMouseEnter={e => {
                        if (poly.isAvailable !== false) {
                          e.target.getStage().container().style.cursor = 'pointer'
                          // Pasar id y posición relativa al canvas
                          if (onPolygonHover) {
                            const pos = getRelativePointerPosition(e)
                            onPolygonHover(poly.id, pos)
                          }
                        }
                      }}
                      onMouseMove={e => {
                        if (poly.isAvailable !== false && onPolygonHover) {
                          const pos = getRelativePointerPosition(e)
                          onPolygonHover(poly.id, pos)
                        }
                      }}
                      onMouseLeave={e => {
                        e.target.getStage().container().style.cursor = 'default'
                        onPolygonHover && onPolygonHover(null, null)
                      }}
                      perfectDrawEnabled={false}
                      listening={poly.isAvailable !== false && (!!onPolygonClick || !!onPolygonHover)}
                    />
                  )
                })}
                
                {/* Labels */}
                {/* {showLabels && polygons.map((poly) => {
                  const pts = poly.points
                  if (pts.length < 2) return null
                  const labelX = pts[0] * scaleFactor
                  const labelY = (pts[1] - 30) * scaleFactor
                  return (
                    <Label key={poly.id + '-label'} x={labelX} y={labelY}>
                      <Tag fill="#fff" stroke="#8CA551" strokeWidth={2} cornerRadius={6} shadowBlur={8} shadowOpacity={0.2} />
                      <Text 
                        text={poly.name || ''} 
                        fontFamily="Poppins" 
                        fontSize={14} 
                        fontStyle="bold"
                        fill="#333F1F" 
                        padding={8} 
                      />
                    </Label>
                  )
                })} */}
              </Layer>
            </Stage>
          </Box>

          {/* Zoom controls */}
          {enableZoom && (
            <Box 
              sx={{ 
                position: 'absolute', 
                bottom: 16, 
                right: 16, 
                display: 'flex', 
                flexDirection: 'column', 
                gap: 1, 
                zIndex: 100 
              }}
            >
              <Paper elevation={3} sx={{ display: 'flex', flexDirection: 'column', borderRadius: 1.5, overflow: 'hidden' }}>
                <IconButton size="small" onClick={handleZoomIn} sx={{ borderRadius: 0 }}>
                  <AddIcon fontSize="small" />
                </IconButton>
                <IconButton size="small" onClick={handleZoomOut} sx={{ borderRadius: 0 }}>
                  <RemoveIcon fontSize="small" />
                </IconButton>
              </Paper>
              <Paper elevation={3} sx={{ borderRadius: 1.5 }}>
                <IconButton size="small" onClick={handleReset}>
                  <MyLocationIcon fontSize="small" />
                </IconButton>
              </Paper>
            </Box>
          )}
        </>
      )}
    </Box>
  )
}

export default PolygonImagePreview