import { Box, Paper, Typography, useTheme } from '@mui/material'
import LayersIcon from '@mui/icons-material/Layers'
import { usePropertyBuilding } from '../../context/ProperyQuoteContext'   // ← cambio
import { useState } from 'react'
import PolygonImagePreview from '@shared/components/PolygonImagePreview'  // ← cambio
import { useTranslation } from 'react-i18next'

// resto del componente idéntico al de Phase-2 (FloorSelector.jsx)
const FloorSelector = () => {
  const theme = useTheme()
  const { t } = useTranslation(['quote', 'common'])

  const {
    selectedBuilding,
    selectedFloor,
    selectFloor,
  } = usePropertyBuilding()

  const exteriorUrl = selectedBuilding?.exteriorRenders?.[0] || null
  const floorPolygons = selectedBuilding?.buildingFloorPolygons || []
  const hasFloorPolygons = floorPolygons.length > 0

  const [hovered, setHovered] = useState(null)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })

  const handlePolygonClick = (poly) => {
    const floorPlan = (selectedBuilding?.floorPlans || []).find(
      fp => fp.floorNumber === poly.floorNumber
    )
    if (floorPlan) selectFloor(floorPlan)
  }

  // Handler for hover, receives polygon id and mouse event
  const handlePolygonHover = (polyId, evt) => {
    setHovered(polyId)
    if (evt && evt.evt) {
      setMousePos({
        x: evt.evt.clientX,
        y: evt.evt.clientY - 60 // Offset for the popup
      })
    }
  }

  if (exteriorUrl && hasFloorPolygons && !selectedFloor) {
    const polygons = floorPolygons.map(poly => ({
      id: poly.id,
      points: poly.points,
      color: poly.color || theme.palette.primary.main,
      name: poly.name || `${t('quote:floor', 'Floor')} ${poly.floorNumber}`,
      floorNumber: poly.floorNumber,
    }))

    // Find hovered polygon data
    const hoveredPolygon = polygons.find(p => p.id === hovered)

    return (
      <Paper elevation={0} sx={{
        bgcolor: theme.palette.background.paper,
        borderRadius: 4,
        border: `1px solid ${theme.palette.divider}`,
        boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
        overflow: 'hidden',
        position: 'relative'
      }}>
        <Box sx={{
          p: 2,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 1,
          borderBottom: `2px solid ${theme.palette.primary.light}44`,
        }}>
          <Box display="flex" alignItems="center" gap={1}>
            <LayersIcon sx={{ color: theme.palette.primary.main, fontSize: 20 }} />
            <Typography sx={{
              fontWeight: 700,
              fontFamily: '"Poppins", sans-serif',
              letterSpacing: '1.5px',
              textTransform: 'uppercase',
              fontSize: '0.85rem',
              color: theme.palette.primary.dark,
            }}>
              {t('quote:selectFloorStep', '02 SELECT A FLOOR')}
            </Typography>
          </Box>
          <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontFamily: '"Poppins", sans-serif' }}>
            {t('quote:clickFloorPolygon', 'Click a floor polygon on the building exterior')}
          </Typography>
        </Box>
        
        <Box sx={{ position: 'relative' }}>
          <PolygonImagePreview
            imageUrl={exteriorUrl}
            polygons={polygons}
            maxWidth={1000}
            maxHeight={700}
            showLabels
            highlightPolygonId={hovered}
            onPolygonClick={poly => handlePolygonClick(poly)}
            onPolygonHover={(polyId, pos) => {
              setHovered(polyId)
              setMousePos(pos)
            }}
            enableZoom={true}
          />
        
{hoveredPolygon && mousePos && (
  <Paper
    elevation={8}
    sx={{
      position: 'absolute',
      left: mousePos.x,
      top: mousePos.y,
      zIndex: 9999,
      minWidth: 180,
      p: 2,
      borderRadius: 2,
      bgcolor: '#fff',
      border: `2px solid ${theme.palette.primary.main}`,
      boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
      pointerEvents: 'none'
    }}
  >
              <Typography sx={{ fontWeight: 700, fontSize: '1rem', fontFamily: '"Poppins", sans-serif', color: theme.palette.primary.dark }}>
                {hoveredPolygon.name}
              </Typography>
              <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                {t('quote:floor', 'Floor')} {hoveredPolygon.floorNumber}
              </Typography>
            </Paper>
          )}
        </Box>
      </Paper>
    )
  }

  return null
}

export default FloorSelector