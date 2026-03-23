import { Modal, Box, Typography } from '@mui/material'
import { Stage, Layer, Image as KonvaImage, Line } from 'react-konva'
import useImage from 'use-image'
import { useState } from 'react'

export default function FloorPlanPolygonSelectorModal({
  open,
  onClose,
  floorPlan,
  selectedPolygonId,
  onSelectPolygon,
}) {
  const [image] = useImage(floorPlan?.url || '')
  const width = 1000
  const height = 700
  const [hovered, setHovered] = useState(null)

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={{
        width, height, bgcolor: '#fff', p: 2, mx: 'auto', my: 4, borderRadius: 2, outline: 'none',
        position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center'
      }}>
        <Typography variant="h6" mb={2}>Selecciona un polígono</Typography>
        <Stage width={width} height={height}>
          <Layer>
            {image && <KonvaImage image={image} width={width} height={height} listening={false} />}
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
                  stroke={isSelected ? '#222' : baseColor}
                  strokeWidth={isSelected ? 4 : isHovered ? 3 : 2}
                  onClick={() => onSelectPolygon(poly.id)}
                  onMouseEnter={() => setHovered(poly.id)}
                  onMouseLeave={() => setHovered(null)}
                  listening
                  cursor="pointer"
                  shadowForStrokeEnabled={false}
                />
              )
            })}
          </Layer>
        </Stage>
      </Box>
    </Modal>
  )
}