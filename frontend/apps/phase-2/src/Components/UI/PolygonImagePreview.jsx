// @/Users/oficina/MV-CRM/CustomerService/frontend/apps/phase-2/src/Components/UI/PolygonImagePreview.jsx

import { useEffect, useState } from 'react'
import { Stage, Layer, Line, Image as KonvaImage, Label, Tag, Text } from 'react-konva'
import useImage from 'use-image'

const PolygonImagePreview = ({
  imageUrl,
  polygons = [],
  maxWidth = 1000,
  maxHeight = 700,
  highlightPolygonId = null,
  showLabels = false,
  onPolygonClick,
  onPolygonHover,
}) => {
  const [image] = useImage(imageUrl || '')
  const [dimensions, setDimensions] = useState({ width: maxWidth, height: maxHeight })

  // ✅ IMPORTANTE: Calcular dimensiones EXACTAMENTE como los editores
  useEffect(() => {
    if (image) {
      const imgRatio = image.width / image.height
      
      let width = maxWidth
      let height = maxWidth / imgRatio
      
      if (height > maxHeight) {
        height = maxHeight
        width = maxHeight * imgRatio
      }
      
      setDimensions({ width, height })
      console.log('PolygonImagePreview dimensions:', { width, height, maxWidth, maxHeight })
    }
  }, [image, maxWidth, maxHeight])

  return (
    <div
      style={{
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: '#f5f5f5',
        borderRadius: 8,
        overflow: 'hidden',
        minHeight: 120,
      }}
    >
      {image && (
        <Stage width={dimensions.width} height={dimensions.height}>
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
              
              return (
                <Line
                  key={poly.id}
                  points={poly.points}
                  closed
                  fill={
                    poly.fill || 
                    (isHighlighted 
                      ? (poly.color || '#8CA551') + '55' 
                      : (poly.color || '#8CA551') + '33')
                  }
                  stroke={poly.stroke || poly.color || '#8CA551'}
                  strokeWidth={poly.strokeWidth || (isHighlighted ? 3 : 2)}
                  opacity={poly.opacity !== undefined ? poly.opacity : 0.7}
                  onClick={() => onPolygonClick && onPolygonClick(poly)}
                  onMouseEnter={() => onPolygonHover && onPolygonHover(poly.id)}
                  onMouseLeave={() => onPolygonHover && onPolygonHover(null)}
                  perfectDrawEnabled={false}
                  listening={poly.isAvailable !== false && (!!onPolygonClick || !!onPolygonHover)}
                  cursor={poly.isAvailable !== false && onPolygonClick ? 'pointer' : poly.isAvailable === false ? 'not-allowed' : 'default'}
                />
              )
            })}
            
            {/* Labels */}
            {showLabels && polygons.map((poly) => {
              const pts = poly.points
              if (pts.length < 2) return null
              return (
                <Label key={poly.id + '-label'} x={pts[0]} y={pts[1] - 30}>
                  <Tag fill="#fff" stroke="#8CA551" cornerRadius={4} />
                  <Text 
                    text={poly.name || ''} 
                    fontFamily="Poppins" 
                    fontSize={12} 
                    fill="#333F1F" 
                    padding={6} 
                  />
                </Label>
              )
            })}
          </Layer>
        </Stage>
      )}
    </div>
  )
}

export default PolygonImagePreview