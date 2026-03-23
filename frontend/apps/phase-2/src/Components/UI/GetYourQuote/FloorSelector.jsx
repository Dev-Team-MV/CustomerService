import {
  Box, Paper, Typography, useTheme, useMediaQuery
} from '@mui/material'
import LayersIcon from '@mui/icons-material/Layers'
import { usePropertyBuilding } from '../../../Context/PropertyBuildingContext'
import { Stage, Layer, Image as KonvaImage, Line, Group, Label, Tag, Text } from 'react-konva'
import useImage from 'use-image'
import { useState, useEffect } from 'react'

const FloorSelector = () => {
  const {
    selectedBuilding,
    selectedFloor,
    selectFloor,
  } = usePropertyBuilding()

  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  if (!selectedBuilding) return null

  // --- Selección visual de piso por polígono ---
  const exteriorUrl = selectedBuilding.exteriorRenders?.[0] || null
  const floorPolygons = selectedBuilding.buildingFloorPolygons || []
  const hasFloorPolygons = floorPolygons.length > 0

  // Konva image hook y dimensiones reales
  const [image] = useImage(exteriorUrl || '')
  const [imgDims, setImgDims] = useState({ width: 1000, height: 700 })
  useEffect(() => {
    if (image) setImgDims({ width: image.width, height: image.height })
  }, [image])

  const width = isMobile ? 350 : 700
  const height = isMobile ? 250 : 500

  // Escalado tipo "contain"
  const scale = Math.min(
    width / imgDims.width,
    height / imgDims.height
  )
  const offsetX = (width - imgDims.width * scale) / 2
  const offsetY = (height - imgDims.height * scale) / 2

  const [hovered, setHovered] = useState(null)

  // Normaliza puntos al tamaño del canvas (ya están en px)
  const normPoints = (pts) => Array.isArray(pts) ? pts : []

  // Al hacer click en un polígono, selecciona el floorPlan correspondiente
  const handlePolygonClick = (poly) => {
    const floorPlan = (selectedBuilding.floorPlans || []).find(
      fp => fp.floorNumber === poly.floorNumber
    )
    if (floorPlan) selectFloor(floorPlan)
  }

  // Si NO hay piso seleccionado, muestra la imagen exterior y polígonos interactivos
  if (exteriorUrl && hasFloorPolygons && !selectedFloor) {
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
        <Box sx={{ width: '100%', maxWidth: width, mx: 'auto', position: 'relative', bgcolor: '#f5f5f5', borderRadius: 3, overflow: 'hidden' }}>
          <Stage width={width} height={height}>
            <Layer>
              {image && (
                <KonvaImage
                  image={image}
                  width={imgDims.width * scale}
                  height={imgDims.height * scale}
                  x={offsetX}
                  y={offsetY}
                  listening={false}
                />
              )}
              {floorPolygons.map((poly) => {
                const points = normPoints(poly.points).map((p, i) =>
                  i % 2 === 0
                    ? p * scale + offsetX
                    : p * scale + offsetY
                )
                const isHovered = hovered === poly.id
                return (
                  <Group key={poly.id}>
                    <Line
                      points={points}
                      closed
                      fill={isHovered ? (poly.color || '#8CA551') + '55' : (poly.color || '#8CA551') + '33'}
                      stroke={poly.color || '#8CA551'}
                      strokeWidth={isHovered ? 3 : 2}
                      onClick={() => handlePolygonClick(poly)}
                      onMouseEnter={() => setHovered(poly.id)}
                      onMouseLeave={() => setHovered(null)}
                      opacity={0.7}
                      perfectDrawEnabled={false}
                      listening
                      cursor="pointer"
                    />
                    {isHovered && (
                      <Label x={points[0]} y={points[1] - 30}>
                        <Tag
                          fill="#fff"
                          stroke={poly.color || '#8CA551'}
                          cornerRadius={4}
                          shadowColor="#000"
                          shadowBlur={4}
                          shadowOpacity={0.08}
                        />
                        <Text
                          text={poly.name || `Floor ${poly.floorNumber}`}
                          fontFamily="Poppins"
                          fontSize={14}
                          fill="#333F1F"
                          padding={8}
                        />
                      </Label>
                    )}
                  </Group>
                )
              })}
            </Layer>
          </Stage>
        </Box>
      </Paper>
    )
  }

  // Si ya hay piso seleccionado, muestra el floorPlan como antes (o tu lógica previa)
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