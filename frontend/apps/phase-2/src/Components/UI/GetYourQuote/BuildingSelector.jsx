import { useState, useRef, useEffect } from 'react'
import { Stage, Layer, Line, Image as KonvaImage, Label, Tag, Text } from 'react-konva'
import useImage from 'use-image'
import {
  Box, Paper, Typography, IconButton,
  Chip, CircularProgress, Alert, Grid, Card, CardActionArea,
  CardContent, useTheme, useMediaQuery, Fade, Zoom
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import RemoveIcon from '@mui/icons-material/Remove'
import MyLocationIcon from '@mui/icons-material/MyLocation'
import ApartmentIcon from '@mui/icons-material/Apartment'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import { usePropertyBuilding } from '../../../Context/PropertyBuildingContext'
import { motion, AnimatePresence } from 'framer-motion'
import api from '@shared/services/api'

const STATUS_COLOR = {
  active:   '#4caf50',
  inactive: '#9e9e9e',
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

  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const stageRef = useRef(null)
  const canvasContainerRef = useRef(null)

  // Master plan data
  const [masterPlanData, setMasterPlanData] = useState(null)
  const [loadingMasterPlan, setLoadingMasterPlan] = useState(false)
  const [image] = useImage(masterPlanData?.masterPlanImage || '')

  const [scale, setScale] = useState(1)
  const [dimensions, setDimensions] = useState({ width: 1200, height: 800 })
  const [hoveredBuilding, setHoveredBuilding] = useState(null)
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 })

  const [scaleFactor, setScaleFactor] = useState(1) // ✅ Nuevo estado


  // ✅ Fetch master plan on mount
  useEffect(() => {
    const fetchMasterPlan = async () => {
      setLoadingMasterPlan(true)
      try {
        const projectId = import.meta.env.VITE_PROJECT_ID
        if (!projectId) {
          console.warn('No VITE_PROJECT_ID found in .env')
          return
        }

        const response = await api.get('/master-plan', {
          params: { projectId, onlyWithPolygon: 'false' }
        })
        console.log('Master plan data:', response.data)
        setMasterPlanData(response.data)
      } catch (err) {
        console.error('Error fetching master plan:', err)
      } finally {
        setLoadingMasterPlan(false)
      }
    }

    fetchMasterPlan()
  }, [])

  // ✅ Calculate dimensions - responsive only for mobile
// ✅ Calculate dimensions - responsive only for mobile
useEffect(() => {
  if (image) {
    if (isMobile && canvasContainerRef.current) {
      // Mobile: scale to fit container
      const updateDimensions = () => {
        const container = canvasContainerRef.current
        if (!container) return

        const containerWidth = container.offsetWidth - 32
        const containerHeight = 500
        const imgRatio = image.width / image.height
        
        let width = containerWidth
        let height = containerWidth / imgRatio
        
        if (height > containerHeight) {
          height = containerHeight
          width = containerHeight * imgRatio
        }
        
        // ✅ Calcular factor de escala basado en dimensiones originales
        const originalMaxWidth = 1200
        const originalMaxHeight = 800
        const originalImgRatio = image.width / image.height
        
        let originalWidth = originalMaxWidth
        let originalHeight = originalMaxWidth / originalImgRatio
        
        if (originalHeight > originalMaxHeight) {
          originalHeight = originalMaxHeight
          originalWidth = originalMaxHeight * originalImgRatio
        }
        
        const factor = width / originalWidth
        setScaleFactor(factor)
        setDimensions({ width, height })
      }

      updateDimensions()
      window.addEventListener('resize', updateDimensions)
      return () => window.removeEventListener('resize', updateDimensions)
    } else {
      // Desktop: keep original fixed dimensions
      const maxWidth = 1200
      const maxHeight = 800
      const imgRatio = image.width / image.height
      
      let width = maxWidth
      let height = maxWidth / imgRatio
      
      if (height > maxHeight) {
        height = maxHeight
        width = maxHeight * imgRatio
      }
      
      setScaleFactor(1) // ✅ Desktop usa factor 1 (sin escala)
      setDimensions({ width, height })
    }
  }
}, [image, isMobile])
  const hasPolygons = buildings.some(b => b.polygon?.length >= 3)

  const handleZoomIn = () => setScale(Math.min(scale + 0.2, 3))
  const handleZoomOut = () => setScale(Math.max(scale - 0.2, 0.5))
  const handleReset = () => setScale(1)

  const handlePolygonClick = (building) => {
    if (building.status === 'active') {
      selectBuilding(building)
    }
  }

  const handlePolygonHover = (building, e) => {
    if (building) {
      setHoveredBuilding(building)
      if (e) {
        const stage = e.target.getStage()
        const container = stage.container().getBoundingClientRect()
        const pointerPos = stage.getPointerPosition()
        setPopupPosition({
          x: container.left + pointerPos.x * scale,
          y: container.top + pointerPos.y * scale - 80
        })
      }
    } else {
      setHoveredBuilding(null)
    }
  }

  if (loadingBuildings || loadingMasterPlan) {
    return (
      <Paper elevation={0} sx={paperSx}>
        <Box display="flex" justifyContent="center" py={4}>
          <CircularProgress sx={{ color: theme.palette.primary.main }} />
        </Box>
      </Paper>
    )
  }

  if (error) {
    return (
      <Paper elevation={0} sx={paperSx}>
        <Alert severity="error">{error}</Alert>
      </Paper>
    )
  }

  return (
    <Paper elevation={0} sx={paperSx}>
      {/* Header */}
      <Box sx={headerSx}>
        <Typography sx={sectionLabelSx}>01 SELECT A BUILDING</Typography>
        <Box display="flex" gap={1} alignItems="center">
          <LegendDot color={STATUS_COLOR.active} label="Available" />
          <LegendDot color={STATUS_COLOR.inactive} label="Inactive" />
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

      {/* Konva Canvas with Master Plan */}
      {image && hasPolygons ? (
        <Box 
          ref={canvasContainerRef}
          sx={{ 
            position: 'relative', 
            bgcolor: '#f5f5f5', 
            p: 2,
            ...(isMobile && {
              overflow: 'auto',
              maxHeight: '60vh',
              '&::-webkit-scrollbar': {
                width: '8px',
                height: '8px',
              },
              '&::-webkit-scrollbar-track': {
                backgroundColor: '#f1f1f1',
                borderRadius: '10px',
              },
              '&::-webkit-scrollbar-thumb': {
                backgroundColor: '#8CA551',
                borderRadius: '10px',
                '&:hover': {
                  backgroundColor: '#7a9447',
                },
              },
            }),
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
            <Stage
              ref={stageRef}
              width={dimensions.width}
              height={dimensions.height}
              scaleX={scale}
              scaleY={scale}
              style={{ 
                border: '2px solid #e0e0e0', 
                backgroundColor: '#fff',
                cursor: 'default',
                borderRadius: '8px',
              }}
            >
              <Layer>
                {/* Master Plan Image */}
                {image && (
                  <KonvaImage
                    image={image}
                    width={dimensions.width}
                    height={dimensions.height}
                    listening={false}
                  />
                )}

                {/* Building Polygons */}
{buildings.map((building) => {
  const polygon = building.polygon
  if (!polygon || polygon.length < 3) return null
 
  // ✅ Escalar coordenadas de polígonos según scaleFactor
  const points = polygon.flatMap(p => [p.x * scaleFactor, p.y * scaleFactor])
  const isSelected = selectedBuilding?._id === building._id
  const isHovered = hoveredBuilding?._id === building._id
  const isActive = building.status === 'active'

                  const fillColor = building.polygonColor || '#22C55E'
                  const strokeColor = building.polygonStrokeColor || '#14532D'
                  const baseOpacity = building.polygonOpacity !== undefined ? building.polygonOpacity : 0.42

                  let opacity = baseOpacity
                  if (hoveredBuilding) {
                    opacity = isHovered ? Math.min(baseOpacity + 0.3, 1) : baseOpacity * 0.3
                  }
                  if (isSelected) {
                    opacity = Math.min(baseOpacity + 0.2, 1)
                  }
                  if (!isActive) {
                    opacity = 0.2
                  }

                  return (
                    <Line
                      key={building._id}
                      points={points}
                      closed
                      fill={fillColor}
                      stroke={isSelected ? '#8CA551' : strokeColor}
                      strokeWidth={isSelected ? 4 : isHovered ? 3 : 2}
                      opacity={opacity}
                      shadowBlur={isHovered ? 15 : isSelected ? 10 : 0}
                      shadowColor={isHovered ? fillColor : '#8CA551'}
                      shadowOpacity={isHovered ? 0.6 : 0.4}
                      onClick={() => handlePolygonClick(building)}
                      onTap={() => handlePolygonClick(building)}
                      onMouseEnter={(e) => {
                        const container = e.target.getStage().container()
                        container.style.cursor = isActive ? 'pointer' : 'not-allowed'
                        handlePolygonHover(building, e)
                      }}
                      onMouseMove={(e) => {
                        if (isHovered) {
                          const stage = e.target.getStage()
                          const container = stage.container().getBoundingClientRect()
                          const pointerPos = stage.getPointerPosition()
                          setPopupPosition({
                            x: container.left + pointerPos.x * scale,
                            y: container.top + pointerPos.y * scale - 80
                          })
                        }
                      }}
                      onMouseLeave={(e) => {
                        const container = e.target.getStage().container()
                        container.style.cursor = 'default'
                        handlePolygonHover(null)
                      }}
                      perfectDrawEnabled={false}
                    />
                  )
                })}

                {/* Konva Label for hovered building */}
{/* Konva Label for hovered building */}
{hoveredBuilding && hoveredBuilding.polygon && (
  <Label
    x={(hoveredBuilding.polygon[0]?.x || 0) * scaleFactor}
    y={((hoveredBuilding.polygon[0]?.y || 0) - 40) * scaleFactor}
  >
                    <Tag
                      fill="#fff"
                      stroke={hoveredBuilding.polygonStrokeColor || '#14532D'}
                      strokeWidth={2}
                      cornerRadius={8}
                      shadowColor="#000"
                      shadowBlur={10}
                      shadowOpacity={0.3}
                      shadowOffsetY={2}
                    />
                  </Label>
                )}
              </Layer>
            </Stage>

            {/* Zoom controls */}
            <Box sx={{ position: 'absolute', bottom: 15, right: 15, display: 'flex', flexDirection: 'column', gap: 1, zIndex: 100 }}>
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
          </Box>

          {/* Animated Popup with Framer Motion */}
          <AnimatePresence>
            {hoveredBuilding && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: 10 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                style={{
                  position: 'fixed',
                  left: popupPosition.x,
                  top: popupPosition.y,
                  zIndex: 9999,
                  pointerEvents: 'none'
                }}
              >
                <Paper
                  elevation={8}
                  sx={{
                    p: 2,
                    borderRadius: 3,
                    bgcolor: '#fff',
                    border: `2px solid ${hoveredBuilding.polygonStrokeColor || '#14532D'}`,
                    minWidth: 220,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.12)'
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <ApartmentIcon sx={{ color: hoveredBuilding.polygonColor || '#22C55E', fontSize: 24 }} />
                    <Typography sx={{ fontWeight: 700, fontSize: '1rem', fontFamily: '"Poppins", sans-serif', color: '#333F1F' }}>
                      {hoveredBuilding.name}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <InfoRow label="Floors" value={hoveredBuilding.floors} />
                    <InfoRow label="Apartments" value={hoveredBuilding.totalApartments || '–'} />
                    <InfoRow label="Section" value={hoveredBuilding.section || '–'} />
                  </Box>

                  <Box sx={{ mt: 1.5, pt: 1.5, borderTop: '1px solid #e0e0e0' }}>
                    <Chip
                      label={hoveredBuilding.status}
                      size="small"
                      sx={{
                        height: 22,
                        fontSize: '0.7rem',
                        bgcolor: hoveredBuilding.status === 'active' ? 'rgba(76,175,80,0.15)' : 'rgba(158,158,158,0.15)',
                        color: hoveredBuilding.status === 'active' ? '#4caf50' : '#9e9e9e',
                        fontWeight: 700,
                        fontFamily: '"Poppins", sans-serif',
                        textTransform: 'uppercase',
                      }}
                    />
                  </Box>
                </Paper>
              </motion.div>
            )}
          </AnimatePresence>

          <Typography variant="caption" sx={{ color: '#706f6f', mt: 1, display: 'block', textAlign: 'center', fontFamily: '"Poppins", sans-serif' }}>
            {isMobile ? 'Scroll to see the full map · ' : ''}Click on a building polygon to select it
          </Typography>
        </Box>
      ) : (
        <Alert severity="info" sx={{ m: 2 }}>
          No master plan image or building polygons available. Please select a building from the list below.
        </Alert>
      )}

      {/* Card list fallback */}
      <Box sx={{ p: 2 }}>
        {image && hasPolygons && (
          <Typography variant="caption" sx={{ color: '#706f6f', mb: 1, display: 'block', fontFamily: '"Poppins", sans-serif' }}>
            Or select from the list below:
          </Typography>
        )}
        <Grid container spacing={2}>
          {buildings.map((b, i) => {
            const isSelected = selectedBuilding?._id === b._id
            const isActive = b.status === 'active'
            const isHoveredCard = hoveredBuilding?._id === b._id
            
            return (
              <Grid item xs={12} sm={6} md={4} key={b._id}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Card
                    elevation={isSelected ? 4 : isHoveredCard ? 3 : 0}
                    sx={{
                      border: isSelected 
                        ? '2px solid #8CA551' 
                        : isHoveredCard 
                          ? `2px solid ${b.polygonStrokeColor || '#14532D'}` 
                          : '2px solid #e0e0e0',
                      borderRadius: 3,
                      transition: 'all 0.3s ease',
                      opacity: isActive ? 1 : 0.55,
                      bgcolor: isSelected ? 'rgba(140,165,81,0.06)' : '#fff',
                    }}
                    onMouseEnter={() => setHoveredBuilding(b)}
                    onMouseLeave={() => setHoveredBuilding(null)}
                  >
                    <CardActionArea
                      onClick={() => isActive && selectBuilding(b)}
                      disabled={!isActive || loadingFloor}
                    >
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

// Helper component for info rows
const InfoRow = ({ label, value }) => (
  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
    <Typography variant="caption" sx={{ color: '#706f6f', fontFamily: '"Poppins", sans-serif', fontSize: '0.7rem' }}>
      {label}:
    </Typography>
    <Typography variant="caption" sx={{ fontWeight: 600, fontFamily: '"Poppins", sans-serif', color: '#333F1F', fontSize: '0.75rem' }}>
      {value}
    </Typography>
  </Box>
)

// Styles
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