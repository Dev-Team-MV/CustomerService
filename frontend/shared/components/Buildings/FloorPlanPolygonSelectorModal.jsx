// @shared/components/Buildings/FloorPlanPolygonSelectorModal.jsx

import { Modal, Box, Typography, IconButton, Tooltip } from '@mui/material'
import { Stage, Layer, Image as KonvaImage, Line, Text } from 'react-konva'
import useImage from 'use-image'
import { useState, useEffect, useMemo } from 'react'
import { Close, Block } from '@mui/icons-material'

export default function FloorPlanPolygonSelectorModal({
  open,
  onClose,
  floorPlan,
  selectedPolygonId,
  onSelectPolygon,
  existingApartments = [], // ✅ NUEVO: Lista de apartamentos existentes
  currentApartmentId = null, // ✅ NUEVO: ID del apartamento actual (para edición)
}) {
  const [image] = useImage(floorPlan?.url || '')
  const [hovered, setHovered] = useState(null)
  const [dimensions, setDimensions] = useState({ width: 1000, height: 700 })

  // ✅ NUEVO: Crear mapa de polígonos ocupados
  const occupiedPolygons = useMemo(() => {
    const map = {}
    existingApartments.forEach(apt => {
      // No marcar como ocupado si es el apartamento actual que estamos editando
      if (apt.floorPlanPolygonId && apt._id !== currentApartmentId) {
        map[apt.floorPlanPolygonId] = {
          apartmentNumber: apt.apartmentNumber,
          apartmentId: apt._id
        }
      }
    })
    return map
  }, [existingApartments, currentApartmentId])

  useEffect(() => {
    if (image) {
      const maxWidth = 1000
      const maxHeight = 700
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

  // ✅ NUEVO: Handler que valida antes de seleccionar
  const handlePolygonClick = (polygonId) => {
    // Si el polígono está ocupado, no permitir selección
    if (occupiedPolygons[polygonId]) {
      return
    }
    onSelectPolygon(polygonId)
  }

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={{
        maxWidth: 1040,
        maxHeight: 820, // ✅ Aumentado para la leyenda
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

        {/* ✅ NUEVO: Leyenda */}
        <Box sx={{ 
          width: '100%', 
          display: 'flex', 
          gap: 2, 
          mb: 2,
          p: 1.5,
          bgcolor: '#f5f5f5',
          borderRadius: 2
        }}>
          <Box display="flex" alignItems="center" gap={0.5}>
            <Box sx={{ width: 16, height: 16, bgcolor: '#8CA55133', border: '2px solid #8CA551', borderRadius: 0.5 }} />
            <Typography variant="caption" fontFamily='"Poppins", sans-serif'>Disponible</Typography>
          </Box>
          <Box display="flex" alignItems="center" gap={0.5}>
            <Box sx={{ width: 16, height: 16, bgcolor: '#8CA551BB', border: '2px solid #333F1F', borderRadius: 0.5 }} />
            <Typography variant="caption" fontFamily='"Poppins", sans-serif'>Seleccionado</Typography>
          </Box>
          <Box display="flex" alignItems="center" gap={0.5}>
            <Box sx={{ width: 16, height: 16, bgcolor: '#75757533', border: '2px solid #757575', borderRadius: 0.5 }} />
            <Typography variant="caption" fontFamily='"Poppins", sans-serif'>Ocupado</Typography>
          </Box>
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
              {image && (
                <KonvaImage 
                  image={image} 
                  width={dimensions.width} 
                  height={dimensions.height} 
                  listening={false} 
                />
              )}
              
              {/* Polígonos */}
              {(floorPlan?.polygons || []).map(poly => {
                const isSelected = poly.id === selectedPolygonId
                const isHovered = poly.id === hovered
                const isOccupied = !!occupiedPolygons[poly.id] // ✅ NUEVO
                const baseColor = poly.color || '#8CA551'
                const occupiedColor = '#757575'
                
                return (
                  <Line
                    key={poly.id}
                    points={poly.points}
                    closed
                    fill={
                      isOccupied
                        ? occupiedColor + '33' // ✅ Gris si está ocupado
                        : isSelected
                          ? baseColor + 'BB'
                          : isHovered
                            ? baseColor + '77'
                            : baseColor + '33'
                    }
                    stroke={
                      isOccupied
                        ? occupiedColor // ✅ Gris si está ocupado
                        : isSelected 
                          ? '#333F1F' 
                          : baseColor
                    }
                    strokeWidth={isSelected ? 4 : isHovered ? 3 : 2}
                    onClick={() => handlePolygonClick(poly.id)} // ✅ Usar handler con validación
                    onTap={() => handlePolygonClick(poly.id)}
                    onMouseEnter={(e) => {
                      setHovered(poly.id)
                      const container = e.target.getStage().container()
                      // ✅ Cambiar cursor según disponibilidad
                      container.style.cursor = isOccupied ? 'not-allowed' : 'pointer'
                    }}
                    onMouseLeave={(e) => {
                      setHovered(null)
                      const container = e.target.getStage().container()
                      container.style.cursor = 'default'
                    }}
                    listening
                    shadowBlur={isHovered ? 10 : isSelected ? 8 : 0}
                    shadowColor={isOccupied ? occupiedColor : baseColor}
                    shadowOpacity={0.5}
                    perfectDrawEnabled={false}
                    opacity={isOccupied ? 0.6 : 1} // ✅ Reducir opacidad si está ocupado
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
          {Object.keys(occupiedPolygons).length > 0 
            ? `Haz clic en un polígono disponible. Los polígonos en gris ya están asignados.`
            : 'Haz clic en un polígono para seleccionarlo'}
        </Typography>
      </Box>
    </Modal>
  )
}