import { useState, useRef } from 'react'
import {
  Box, Paper, Typography, Tooltip, IconButton,
  Chip, CircularProgress, Alert, Grid, Card, CardActionArea,
  CardContent, useTheme, useMediaQuery
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import RemoveIcon from '@mui/icons-material/Remove'
import MyLocationIcon from '@mui/icons-material/MyLocation'
import ApartmentIcon from '@mui/icons-material/Apartment'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import { usePropertyBuilding } from '../../../Context/PropertyBuildingContext'
import { motion } from 'framer-motion'

// Status colours — same palette used across all phase-2 selectors
const STATUS_COLOR = {
  active:   '#4caf50',
  inactive: '#9e9e9e',
}

/**
 * Converts a building.polygon (array of {x,y} percentages) to an SVG
 * `points` attribute string for a <polygon> element inside a viewBox="0 0 100 100".
 */
const toSvgPoints = (polygonArr) => {
  if (!Array.isArray(polygonArr) || polygonArr.length === 0) return ''
  return polygonArr.map(p => `${p.x},${p.y}`).join(' ')
}

const BuildingSelector = () => {
  const {
    buildings,
    loadingBuildings,
    error,
    selectedBuilding,
    selectBuilding,
    loadingFloor,
  } = usePropertyBuilding()

    console.log('[STEP 1] buildings:', buildings)
  console.log('[STEP 1] selectedBuilding:', selectedBuilding)

  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  const [zoom, setZoom] = useState(1)
  const [pan, setPan]   = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging]   = useState(false)
  const [dragStart, setDragStart]     = useState({ x: 0, y: 0 })
  const [hasMoved, setHasMoved]       = useState(false)
  const mapRef = useRef(null)

  // ── Site image: use the first exterior render from any building, or null
  const siteImage = buildings.find(b => b.exteriorRenders?.length > 0)?.exteriorRenders?.[0] || null
  const hasPolygons = buildings.some(b => b.polygon?.length >= 3)

  // ── Zoom / Pan handlers ──────────────────────────────────────────────────────
  const handleZoomIn  = () => setZoom(p => Math.min(p + 0.3, 3))
  const handleZoomOut = () => setZoom(p => Math.max(p - 0.3, 0.5))
  const handleReset   = () => { setZoom(1); setPan({ x: 0, y: 0 }) }

  const handleMouseDown = (e) => {
    if (e.button !== 0) return
    setIsDragging(true); setHasMoved(false)
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y })
    e.preventDefault()
  }
  const handleMouseMove = (e) => {
    if (!isDragging) return
    setHasMoved(true)
    setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y })
  }
  const handleMouseUp   = () => setIsDragging(false)
  const handleMouseLeave = () => setIsDragging(false)

  const handleTouchStart = (e) => {
    if (e.touches.length !== 1) return
    const t = e.touches[0]
    setIsDragging(true); setHasMoved(false)
    setDragStart({ x: t.clientX - pan.x, y: t.clientY - pan.y })
  }
  const handleTouchMove = (e) => {
    if (!isDragging || e.touches.length !== 1) return
    setHasMoved(true)
    const t = e.touches[0]
    setPan({ x: t.clientX - dragStart.x, y: t.clientY - dragStart.y })
    e.preventDefault()
  }
  const handleTouchEnd = () => setIsDragging(false)

  const handlePolygonClick = (building) => {
    if (!hasMoved && building.status === 'active') selectBuilding(building)
  }

  // ── Loading / Error states ───────────────────────────────────────────────────
  if (loadingBuildings) return (
    <Paper elevation={0} sx={paperSx}>
      <Box display="flex" justifyContent="center" py={4}>
        <CircularProgress sx={{ color: theme.palette.primary.main }} />
      </Box>
    </Paper>
  )

  if (error) return (
    <Paper elevation={0} sx={paperSx}>
      <Alert severity="error">{error}</Alert>
    </Paper>
  )

  return (
    <Paper elevation={0} sx={paperSx}>
      {/* Header */}
      <Box sx={headerSx}>
        <Typography sx={sectionLabelSx}>01 SELECT A BUILDING</Typography>
        <Box display="flex" gap={1} alignItems="center">
          <LegendDot color={STATUS_COLOR.active}   label="Available" />
          <LegendDot color={STATUS_COLOR.inactive} label="Inactive"  />
          {selectedBuilding && (
            <Chip
              label={selectedBuilding.name}
              size="small"
              onDelete={() => selectBuilding(null)}
              sx={selectedChipSx}
            />
          )}
        </Box>
      </Box>

      {/* ── Map with SVG overlay (only when there's a site image + polygons) ── */}
      {siteImage && hasPolygons ? (
        <Box
          ref={mapRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          sx={{
            width: '100%',
            paddingTop: '56.25%',
            position: 'relative',
            bgcolor: '#f0f0f0',
            cursor: isDragging ? 'grabbing' : 'grab',
            overflow: 'hidden',
            touchAction: 'none',
          }}
        >
          <Box sx={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
            {/* Background image + polygons */}
            <Box
              sx={{
                position: 'absolute',
                top: '50%', left: '50%',
                width: '100%', height: '100%',
                transform: `translate(-50%,-50%) translate(${pan.x}px,${pan.y}px) scale(${zoom})`,
                transition: isDragging ? 'none' : 'transform 0.3s ease',
                willChange: 'transform',
              }}
            >
              <Box
                component="img"
                src={siteImage}
                alt="Site map"
                sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
              {/* SVG polygon overlay */}
              <svg
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
              >
                {buildings.map(b => {
                  const pts = toSvgPoints(b.polygon)
                  if (!pts) return null
                  const isSelected = selectedBuilding?._id === b._id
                  const isActive   = b.status === 'active'
                  return (
                    <Tooltip key={b._id} title={`${b.name}${!isActive ? ' (Inactive)' : ''}`} arrow>
                      <polygon
                        points={pts}
                        onClick={() => handlePolygonClick(b)}
                        style={{
                          fill: isSelected
                            ? 'rgba(140,165,81,0.45)'
                            : isActive
                              ? 'rgba(76,175,80,0.25)'
                              : 'rgba(158,158,158,0.25)',
                          stroke: isSelected ? '#8CA551' : isActive ? '#4caf50' : '#9e9e9e',
                          strokeWidth: isSelected ? 0.6 : 0.4,
                          cursor: isActive ? 'pointer' : 'not-allowed',
                          transition: 'fill 0.2s',
                        }}
                      />
                    </Tooltip>
                  )
                })}
              </svg>
            </Box>

            {/* Zoom controls */}
            <Box sx={{ position: 'absolute', bottom: 15, right: 15, display: 'flex', flexDirection: 'column', gap: 1, zIndex: 100 }}>
              <Paper elevation={3} sx={{ display: 'flex', flexDirection: 'column', borderRadius: 1.5, overflow: 'hidden' }}>
                <IconButton size="small" onClick={handleZoomIn}><AddIcon fontSize="small" /></IconButton>
                <IconButton size="small" onClick={handleZoomOut}><RemoveIcon fontSize="small" /></IconButton>
              </Paper>
              <Paper elevation={3} sx={{ borderRadius: 1.5 }}>
                <IconButton size="small" onClick={handleReset}><MyLocationIcon fontSize="small" /></IconButton>
              </Paper>
            </Box>
          </Box>
        </Box>
      ) : null}

      {/* ── Card list fallback (always shown, acts as dropdown alternative) ── */}
      <Box sx={{ p: 2 }}>
        {siteImage && hasPolygons && (
          <Typography variant="caption" sx={{ color: '#706f6f', mb: 1, display: 'block', fontFamily: '"Poppins", sans-serif' }}>
            Click a polygon on the map, or select from the list below:
          </Typography>
        )}
        <Grid container spacing={2}>
          {buildings.map((b, i) => {
            const isSelected = selectedBuilding?._id === b._id
            const isActive   = b.status === 'active'
            return (
              <Grid item xs={12} sm={6} md={4} key={b._id}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                >
                  <Card
                    elevation={isSelected ? 4 : 0}
                    sx={{
                      border: isSelected
                        ? '2px solid #8CA551'
                        : '2px solid #e0e0e0',
                      borderRadius: 3,
                      transition: 'all 0.2s ease',
                      opacity: isActive ? 1 : 0.55,
                      bgcolor: isSelected ? 'rgba(140,165,81,0.06)' : '#fff',
                    }}
                  >
                    <CardActionArea
                      onClick={() => isActive && selectBuilding(b)}
                      disabled={!isActive || loadingFloor}
                    >
                      {/* Thumbnail */}
                      {b.exteriorRenders?.[0] ? (
                        <Box
                          component="img"
                          src={b.exteriorRenders[0]}
                          alt={b.name}
                          sx={{ width: '100%', height: 120, objectFit: 'cover' }}
                        />
                      ) : (
                        <Box sx={{ height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#f5f5f5' }}>
                          <ApartmentIcon sx={{ color: '#bdbdbd', fontSize: 40 }} />
                        </Box>
                      )}
                      <CardContent sx={{ p: 1.5 }}>
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                          <Typography fontWeight={700} fontSize="0.85rem" sx={{ fontFamily: '"Poppins", sans-serif', color: '#333F1F' }}>
                            {b.name}
                          </Typography>
                          {isSelected && <CheckCircleOutlineIcon sx={{ color: '#8CA551', fontSize: 18 }} />}
                        </Box>
                        <Typography variant="caption" sx={{ color: '#706f6f', fontFamily: '"Poppins", sans-serif' }}>
                          {b.floors} floors · {b.totalApartments ?? '–'} apts
                        </Typography>
                        <Box mt={0.5}>
                          <Chip
                            label={b.status}
                            size="small"
                            sx={{
                              height: 18,
                              fontSize: '0.6rem',
                              bgcolor: isActive ? 'rgba(76,175,80,0.12)' : 'rgba(158,158,158,0.15)',
                              color: isActive ? '#4caf50' : '#9e9e9e',
                              fontWeight: 700,
                              fontFamily: '"Poppins", sans-serif',
                              textTransform: 'uppercase',
                            }}
                          />
                        </Box>
                      </CardContent>
                    </CardActionArea>
                  </Card>
                </motion.div>
              </Grid>
            )
          })}
        </Grid>

        {buildings.length === 0 && (
          <Typography sx={{ textAlign: 'center', color: '#706f6f', py: 3, fontFamily: '"Poppins", sans-serif' }}>
            No buildings available
          </Typography>
        )}
      </Box>
    </Paper>
  )
}

// ── Shared style objects ────────────────────────────────────────────────────
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

const selectedChipSx = {
  bgcolor: 'rgba(140,165,81,0.12)',
  color: '#333F1F',
  fontWeight: 700,
  fontSize: '0.7rem',
  fontFamily: '"Poppins", sans-serif',
  border: '1px solid rgba(140,165,81,0.3)',
}

const LegendDot = ({ color, label }) => (
  <Box display="flex" alignItems="center" gap={0.5}>
    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: color }} />
    <Typography variant="caption" sx={{ fontSize: '0.65rem', fontFamily: '"Poppins", sans-serif' }}>{label}</Typography>
  </Box>
)

export default BuildingSelector
