// @/Users/oficina/MV-CRM/CustomerService/frontend/apps/phase-2/src/Components/UI/FloorPlanPolygonSelectorModal.jsx

import { Modal, Box, Typography, IconButton } from '@mui/material'
import { Stage, Layer, Image as KonvaImage, Line } from 'react-konva'
import useImage from 'use-image'
import { useState, useEffect } from 'react'
import { Close } from '@mui/icons-material'

export default function FloorPlanPolygonSelectorModal({
  open,
  onClose,
  floorPlan,
  selectedPolygonId,
  onSelectPolygon,
}) {
  const [image] = useImage(floorPlan?.url || '')
  const [hovered, setHovered] = useState(null)
  // ✅ Usar las mismas dimensiones que FloorPlanEditor
  const [dimensions, setDimensions] = useState({ width: 1000, height: 700 })

  // ✅ Calcular dimensiones de imagen EXACTAMENTE como FloorPlanEditor
  useEffect(() => {
    if (image) {
      const maxWidth = 1000   // ✅ Mismo que FloorPlanEditor
      const maxHeight = 700   // ✅ Mismo que FloorPlanEditor
      const imgRatio = image.width / image.height
      
      let width = maxWidth
      let height = maxWidth / imgRatio
      
      if (height > maxHeight) {
        height = maxHeight
        width = maxHeight * imgRatio
      }
      
      setDimensions({ width, height })
    }
  }, [image])

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={{
        maxWidth: 1040,
        maxHeight: 780,
        bgcolor: '#fff',
        p: 3,
        mx: 'auto',
        my: 4,
        borderRadius: 3,
        outline: 'none',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        boxShadow: '0 8px 32px rgba(0,0,0,0.12)'
      }}>
        {/* Header */}
        <Box sx={{ 
          width: '100%', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          mb: 2
        }}>
          <Typography 
            variant="h6" 
            sx={{ 
              fontWeight: 700, 
              fontFamily: '"Poppins", sans-serif',
              color: '#333F1F'
            }}
          >
            Selecciona un polígono
          </Typography>
          <IconButton onClick={onClose} size="small">
            <Close />
          </IconButton>
        </Box>

        {/* Canvas */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          bgcolor: '#f5f5f5',
          borderRadius: 2,
          p: 2
        }}>
          <Stage 
            width={dimensions.width} 
            height={dimensions.height}
            style={{ 
              border: '2px solid #e0e0e0',
              backgroundColor: '#fff'
            }}
          >
            <Layer>
              {/* ✅ Imagen con dimensiones calculadas */}
              {image && (
                <KonvaImage 
                  image={image} 
                  width={dimensions.width} 
                  height={dimensions.height} 
                  listening={false} 
                />
              )}
              
              {/* ✅ Polígonos usando coordenadas absolutas */}
              {(floorPlan?.polygons || []).map(poly => {
                const isSelected = poly.id === selectedPolygonId
                const isHovered = poly.id === hovered
                const baseColor = poly.color || '#8CA551'
                
                return (
                  <Line
                    key={poly.id}
                    points={poly.points}
                    closed
                    fill={
                      isSelected
                        ? baseColor + 'BB'
                        : isHovered
                          ? baseColor + '77'
                          : baseColor + '33'
                    }
                    stroke={isSelected ? '#333F1F' : baseColor}
                    strokeWidth={isSelected ? 4 : isHovered ? 3 : 2}
                    onClick={() => onSelectPolygon(poly.id)}
                    onTap={() => onSelectPolygon(poly.id)}
                    onMouseEnter={(e) => {
                      setHovered(poly.id)
                      const container = e.target.getStage().container()
                      container.style.cursor = 'pointer'
                    }}
                    onMouseLeave={(e) => {
                      setHovered(null)
                      const container = e.target.getStage().container()
                      container.style.cursor = 'default'
                    }}
                    listening
                    shadowBlur={isHovered ? 10 : isSelected ? 8 : 0}
                    shadowColor={baseColor}
                    shadowOpacity={0.5}
                    perfectDrawEnabled={false}
                  />
                )
              })}
            </Layer>
          </Stage>
        </Box>

        {/* Info text */}
        <Typography 
          variant="caption" 
          sx={{ 
            color: '#706f6f', 
            mt: 2, 
            fontFamily: '"Poppins", sans-serif',
            textAlign: 'center'
          }}
        >
          Haz clic en un polígono para seleccionarlo
        </Typography>
      </Box>
    </Modal>
  )
}