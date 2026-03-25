import { useEffect, useState, useRef } from 'react'
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
  const containerRef = useRef(null)
  const [dimensions, setDimensions] = useState({ width: 400, height: 300 })

  // Responsivo: ajusta el canvas al ancho del contenedor padre
  useEffect(() => {
    function updateSize() {
      if (!image || !containerRef.current) return
      const parentWidth = Math.min(containerRef.current.offsetWidth, maxWidth)
      const imgRatio = image.width / image.height
      let width = parentWidth
      let height = width / imgRatio
      if (height > maxHeight) {
        height = maxHeight
        width = maxHeight * imgRatio
      }
      setDimensions({ width, height })
    }
    updateSize()
    window.addEventListener('resize', updateSize)
    return () => window.removeEventListener('resize', updateSize)
  }, [image, maxWidth, maxHeight])

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        maxWidth: maxWidth,
        height: 'auto',
        background: '#f5f5f5',
        borderRadius: 8,
        overflow: 'hidden',
        position: 'relative',
        aspectRatio: image ? `${image.width} / ${image.height}` : undefined,
        minHeight: 120,
      }}
    >
      {image && (
        <Stage width={dimensions.width} height={dimensions.height}>
          <Layer>
            <KonvaImage
              image={image}
              width={dimensions.width}
              height={dimensions.height}
              x={0}
              y={0}
              listening={false}
            />
            {polygons.map((poly) => (
              <Line
                key={poly.id}
                points={poly.points}
                closed
                fill={poly.id === highlightPolygonId ? (poly.color || '#8CA551') + '55' : (poly.color || '#8CA551') + '33'}
                stroke={poly.color || '#8CA551'}
                strokeWidth={poly.id === highlightPolygonId ? 3 : 2}
                onClick={() => onPolygonClick && onPolygonClick(poly)}
                onMouseEnter={() => onPolygonHover && onPolygonHover(poly.id)}
                onMouseLeave={() => onPolygonHover && onPolygonHover(null)}
                opacity={0.7}
                perfectDrawEnabled={false}
                listening={!!onPolygonClick || !!onPolygonHover}
                cursor={onPolygonClick ? 'pointer' : 'default'}
              />
            ))}
            {showLabels && polygons.map((poly) => {
              const pts = poly.points
              if (pts.length < 2) return null
              return (
                <Label key={poly.id + '-label'} x={pts[0]} y={pts[1] - 30}>
                  <Tag fill="#fff" stroke="#8CA551" cornerRadius={4} />
                  <Text text={poly.name || ''} fontFamily="Poppins" fontSize={12} fill="#333F1F" padding={6} />
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