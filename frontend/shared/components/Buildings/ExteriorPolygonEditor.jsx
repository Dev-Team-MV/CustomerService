import { useState, useRef, useEffect } from 'react'
import { Stage, Layer, Line, Circle, Image as KonvaImage } from 'react-konva'
import useImage from 'use-image'
import {
  Dialog, Box, Typography, Button, IconButton, ToggleButtonGroup, ToggleButton,
  Paper, List, ListItem, ListItemText, ListItemSecondaryAction,
  TextField, Divider, Alert, Tooltip, Chip
} from '@mui/material'
import {
  Close, CropSquare, Timeline, Edit, Delete, ZoomIn, ZoomOut,
  Undo, Redo, Save, CheckCircle, Palette
} from '@mui/icons-material'
import { useTheme } from '@mui/material/styles'
import { useMediaQuery } from '@mui/material'

const COLORS = [
  '#8CA551', '#333F1F', '#FF6B6B', '#4ECDC4', '#45B7D1',
  '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2'
]

export default function ExteriorPolygonEditor({ open, onClose, exteriorUrl, polygons = [], onSave }) {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const stageRef = useRef(null)
  const [image] = useImage(exteriorUrl || '')
  const [dimensions, setDimensions] = useState({ width: 1000, height: 700 })

  const [allPolygons, setAllPolygons] = useState(polygons)
  const [drawMode, setDrawMode] = useState('select')
  const [selectedPolygonId, setSelectedPolygonId] = useState(null)
  const [currentPoints, setCurrentPoints] = useState([])
  const [isDrawing, setIsDrawing] = useState(false)
  const [scale, setScale] = useState(1)
  const [history, setHistory] = useState([polygons])
  const [historyStep, setHistoryStep] = useState(0)

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

  useEffect(() => {
    if (open) {
      setAllPolygons(polygons)
      setHistory([polygons])
      setHistoryStep(0)
      setDrawMode('select')
      setSelectedPolygonId(null)
      setCurrentPoints([])
      setIsDrawing(false)
      setScale(1)
    }
  }, [open, polygons])

  const addToHistory = (newPolygons) => {
    const newHistory = history.slice(0, historyStep + 1)
    newHistory.push(newPolygons)
    setHistory(newHistory)
    setHistoryStep(newHistory.length - 1)
  }

  const handleUndo = () => {
    if (historyStep > 0) {
      setHistoryStep(historyStep - 1)
      setAllPolygons(history[historyStep - 1])
      setSelectedPolygonId(null)
    }
  }

  const handleRedo = () => {
    if (historyStep < history.length - 1) {
      setHistoryStep(historyStep + 1)
      setAllPolygons(history[historyStep + 1])
      setSelectedPolygonId(null)
    }
  }

  const handleStageClick = (e) => {
    const clickedOnEmpty = e.target === e.target.getStage()
    if (!clickedOnEmpty) return

    if (drawMode === 'select') {
      setSelectedPolygonId(null)
      return
    }

    const stage = e.target.getStage()
    const pointerPosition = stage.getPointerPosition()
    const x = (pointerPosition.x - stage.x()) / scale
    const y = (pointerPosition.y - stage.y()) / scale

    if (drawMode === 'rectangle') {
      if (!isDrawing) {
        setCurrentPoints([x, y])
        setIsDrawing(true)
      } else {
        const [startX, startY] = currentPoints
        if (x === startX && y === startY) {
          alert('Please select a different point to create a rectangle.')
          return
        }
        const width = x - startX
        const height = y - startY
        const newPolygon = {
          id: `poly_${Date.now()}`,
          points: [
            startX, startY,
            startX + width, startY,
            startX + width, startY + height,
            startX, startY + height
          ],
          color: COLORS[allPolygons.length % COLORS.length],
          name: `Polygon ${allPolygons.length + 1}`
        }
        const newPolygons = [...allPolygons, newPolygon]
        setAllPolygons(newPolygons)
        addToHistory(newPolygons)
        setCurrentPoints([])
        setIsDrawing(false)
      }
    } else if (drawMode === 'polygon') {
      setCurrentPoints([...currentPoints, x, y])
    }
  }

  const handleCompletePolygon = () => {
    if (currentPoints.length >= 6) {
      const newPolygon = {
        id: `poly_${Date.now()}`,
        points: currentPoints,
        color: COLORS[allPolygons.length % COLORS.length],
        name: `Polygon ${allPolygons.length + 1}`
      }
      const newPolygons = [...allPolygons, newPolygon]
      setAllPolygons(newPolygons)
      addToHistory(newPolygons)
    }
    setCurrentPoints([])
    setIsDrawing(false)
  }

  const handleDeletePolygon = (id) => {
    const newPolygons = allPolygons.filter(p => p.id !== id)
    setAllPolygons(newPolygons)
    addToHistory(newPolygons)
    setSelectedPolygonId(null)
  }

  const handleUpdatePolygon = (id, updates) => {
    const newPolygons = allPolygons.map(p =>
      p.id === id ? { ...p, ...updates } : p
    )
    setAllPolygons(newPolygons)
    addToHistory(newPolygons)
  }

  const handleZoomIn = () => setScale(Math.min(scale + 0.1, 3))
  const handleZoomOut = () => setScale(Math.max(scale - 0.1, 0.5))

  const handleSave = () => {
    onSave(allPolygons)
    onClose()
  }

  const selectedPolygon = allPolygons.find(p => p.id === selectedPolygonId)

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={false}
      fullScreen={isMobile}
      PaperProps={{
        sx: {
          width: isMobile ? '100%' : '95vw',
          height: isMobile ? '100%' : '90vh',
          maxWidth: 'none',
          borderRadius: isMobile ? 0 : 3,
          bgcolor: theme.palette.background.default
        }
      }}
    >
      {/* Header */}
      <Box sx={{
        p: 2,
        borderBottom: `1px solid ${theme.palette.divider}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, fontFamily: '"Poppins", sans-serif', fontSize: isMobile ? '1rem' : '1.25rem' }}>
            Exterior Polygon Editor
          </Typography>
          <Chip
            label={`${allPolygons.length} polygons`}
            size="small"
            sx={{ fontWeight: 600, fontFamily: '"Poppins", sans-serif' }}
          />
        </Box>
        <IconButton onClick={onClose}>
          <Close />
        </IconButton>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', height: 'calc(100% - 140px)' }}>
        {/* Desktop Left Toolbar */}
        {!isMobile && (
          <Paper
            elevation={0}
            sx={{
              width: 80,
              borderRight: `1px solid ${theme.palette.divider}`,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 1,
              p: 2,
              bgcolor: theme.palette.cardBg
            }}
          >
            <ToggleButtonGroup
              orientation="vertical"
              value={drawMode}
              exclusive
              onChange={(e, value) => {
                if (value !== null) {
                  setDrawMode(value)
                  setCurrentPoints([])
                  setIsDrawing(false)
                }
              }}
              sx={{ width: '100%' }}
            >
              <ToggleButton value="select" sx={{ py: 1.5 }}>
                <Tooltip title="Select & Move" placement="right">
                  <Edit />
                </Tooltip>
              </ToggleButton>
              <ToggleButton value="rectangle" sx={{ py: 1.5 }}>
                <Tooltip title="Draw Rectangle" placement="right">
                  <CropSquare />
                </Tooltip>
              </ToggleButton>
              <ToggleButton value="polygon" sx={{ py: 1.5 }}>
                <Tooltip title="Draw Custom Polygon" placement="right">
                  <Timeline />
                </Tooltip>
              </ToggleButton>
            </ToggleButtonGroup>

            <Divider sx={{ width: '100%', my: 1 }} />

            <Tooltip title="Zoom In" placement="right">
              <IconButton onClick={handleZoomIn} size="small">
                <ZoomIn />
              </IconButton>
            </Tooltip>
            <Tooltip title="Zoom Out" placement="right">
              <IconButton onClick={handleZoomOut} size="small">
                <ZoomOut />
              </IconButton>
            </Tooltip>

            <Divider sx={{ width: '100%', my: 1 }} />

            <Tooltip title="Undo" placement="right">
              <span>
                <IconButton onClick={handleUndo} size="small" disabled={historyStep === 0}>
                  <Undo />
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip title="Redo" placement="right">
              <span>
                <IconButton onClick={handleRedo} size="small" disabled={historyStep === history.length - 1}>
                  <Redo />
                </IconButton>
              </span>
            </Tooltip>
          </Paper>
        )}

        {/* Mobile Horizontal Toolbar */}
        {isMobile && (
          <Paper
            elevation={0}
            sx={{
              borderBottom: `1px solid ${theme.palette.divider}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 1,
              p: 1,
              bgcolor: theme.palette.cardBg
            }}
          >
            <ToggleButtonGroup
              value={drawMode}
              exclusive
              onChange={(e, value) => {
                if (value !== null) {
                  setDrawMode(value)
                  setCurrentPoints([])
                  setIsDrawing(false)
                }
              }}
              size="small"
            >
              <ToggleButton value="select">
                <Edit fontSize="small" />
              </ToggleButton>
              <ToggleButton value="rectangle">
                <CropSquare fontSize="small" />
              </ToggleButton>
              <ToggleButton value="polygon">
                <Timeline fontSize="small" />
              </ToggleButton>
            </ToggleButtonGroup>

            <Box sx={{ display: 'flex', gap: 0.5 }}>
              <IconButton onClick={handleZoomIn} size="small">
                <ZoomIn fontSize="small" />
              </IconButton>
              <IconButton onClick={handleZoomOut} size="small">
                <ZoomOut fontSize="small" />
              </IconButton>
              <IconButton onClick={handleUndo} size="small" disabled={historyStep === 0}>
                <Undo fontSize="small" />
              </IconButton>
              <IconButton onClick={handleRedo} size="small" disabled={historyStep === history.length - 1}>
                <Redo fontSize="small" />
              </IconButton>
            </Box>
          </Paper>
        )}

        {/* Canvas Area */}
{/* Canvas Area */}
<Box 
  sx={{ 
    flex: 1, 
    bgcolor: '#f5f5f5', 
    position: 'relative',
    overflow: 'auto',
    p: isMobile ? 1 : 2,
    minHeight: isMobile ? '50vh' : 'auto',
    display: 'grid',
    placeItems: 'center',
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
  }}
>
  {drawMode === 'polygon' && currentPoints.length > 0 && (
    <Alert
      severity="info"
      sx={{
        position: 'fixed',
        top: isMobile ? 120 : 80,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 10,
        fontFamily: '"Poppins", sans-serif',
        maxWidth: isMobile ? '90%' : 'auto'
      }}
      action={
        <Button
          color="inherit"
          size="small"
          onClick={handleCompletePolygon}
          startIcon={<CheckCircle />}
        >
          Complete
        </Button>
      }
    >
      {currentPoints.length / 2} points. Min 3 required.
    </Alert>
  )}

  {drawMode === 'rectangle' && isDrawing && (
    <Alert
      severity="info"
      sx={{
        position: 'fixed',
        top: isMobile ? 120 : 80,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 10,
        fontFamily: '"Poppins", sans-serif'
      }}
    >
      Click to complete rectangle
    </Alert>
  )}

  <Box sx={{ m: 2 }}>
    <Stage
      ref={stageRef}
      width={dimensions.width}
      height={dimensions.height}
      scaleX={scale}
      scaleY={scale}
      onClick={handleStageClick}
      style={{ 
        border: `2px solid ${theme.palette.divider}`, 
        backgroundColor: '#fff', 
        cursor: drawMode === 'select' ? 'default' : 'crosshair',
        borderRadius: '8px'
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

        {allPolygons.map((polygon) => (
          <Line
            key={polygon.id}
            points={polygon.points}
            closed
            fill={polygon.color}
            opacity={selectedPolygonId === polygon.id ? 0.7 : 0.4}
            stroke={selectedPolygonId === polygon.id ? theme.palette.primary.main : '#000'}
            strokeWidth={selectedPolygonId === polygon.id ? 3 : 1}
            draggable={drawMode === 'select'}
            onClick={(e) => {
              e.cancelBubble = true
              if (drawMode === 'select') {
                setSelectedPolygonId(polygon.id)
              }
            }}
            onDragEnd={(e) => {
              const newPolygons = allPolygons.map(p => {
                if (p.id === polygon.id) {
                  return {
                    ...p,
                    points: p.points.map((coord, i) =>
                      i % 2 === 0
                        ? coord + e.target.x()
                        : coord + e.target.y()
                    )
                  }
                }
                return p
              })
              setAllPolygons(newPolygons)
              addToHistory(newPolygons)
              e.target.position({ x: 0, y: 0 })
            }}
          />
        ))}

        {currentPoints.length > 0 && (
          <>
            <Line
              points={currentPoints}
              stroke={theme.palette.primary.main}
              strokeWidth={2}
              dash={[5, 5]}
            />
            {currentPoints.map((_, i) => {
              if (i % 2 === 0) {
                return (
                  <Circle
                    key={i}
                    x={currentPoints[i]}
                    y={currentPoints[i + 1]}
                    radius={5}
                    fill={theme.palette.primary.main}
                  />
                )
              }
              return null
            })}
          </>
        )}
      </Layer>
    </Stage>
  </Box>
</Box>

        {/* Desktop Right Panel */}
        {!isMobile && (
          <Paper
            elevation={0}
            sx={{
              width: 320,
              borderLeft: `1px solid ${theme.palette.divider}`,
              display: 'flex',
              flexDirection: 'column',
              bgcolor: theme.palette.cardBg
            }}
          >
            <Box sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, fontFamily: '"Poppins", sans-serif' }}>
                Polygons ({allPolygons.length})
              </Typography>
              <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontFamily: '"Poppins", sans-serif' }}>
                Click to select, drag to move
              </Typography>
            </Box>

            <List sx={{ flex: 1, overflow: 'auto', p: 1 }}>
              {allPolygons.length === 0 ? (
                <Box sx={{ p: 3, textAlign: 'center' }}>
                  <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontFamily: '"Poppins", sans-serif', mb: 1 }}>
                    No polygons yet
                  </Typography>
                  <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontFamily: '"Poppins", sans-serif' }}>
                    Use the toolbar to start drawing
                  </Typography>
                </Box>
              ) : (
                allPolygons.map((polygon) => (
                  <ListItem
                    key={polygon.id}
                    sx={{
                      mb: 1,
                      borderRadius: 2,
                      border: `1px solid ${selectedPolygonId === polygon.id ? theme.palette.primary.main : theme.palette.divider}`,
                      bgcolor: selectedPolygonId === polygon.id ? theme.palette.chipAdmin.bg : 'transparent',
                      cursor: 'pointer',
                      '&:hover': {
                        bgcolor: theme.palette.action.hover
                      }
                    }}
                    onClick={() => setSelectedPolygonId(polygon.id)}
                  >
                    <Box
                      sx={{
                        width: 24,
                        height: 24,
                        borderRadius: 1,
                        bgcolor: polygon.color,
                        mr: 2,
                        border: '1px solid #000'
                      }}
                    />
                    <ListItemText
                      primary={polygon.name}
                      secondary="Exterior"
                      primaryTypographyProps={{ fontFamily: '"Poppins", sans-serif', fontSize: '0.9rem', fontWeight: 600 }}
                      secondaryTypographyProps={{ fontFamily: '"Poppins", sans-serif', fontSize: '0.75rem' }}
                    />
                    <ListItemSecondaryAction>
                      <IconButton
                        edge="end"
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeletePolygon(polygon.id)
                        }}
                        sx={{
                          color: theme.palette.warning.main,
                          '&:hover': {
                            bgcolor: theme.palette.warning.main + '20'
                          }
                        }}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))
              )}
            </List>

            {selectedPolygon && (
              <Box sx={{ p: 2, borderTop: `1px solid ${theme.palette.divider}`, bgcolor: theme.palette.background.paper }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, fontFamily: '"Poppins", sans-serif', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Palette fontSize="small" />
                  Polygon Settings
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  label="Name"
                  value={selectedPolygon.name}
                  onChange={(e) => handleUpdatePolygon(selectedPolygon.id, { name: e.target.value })}
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  size="small"
                  label="Floor Number"
                  type="number"
                  inputProps={{ min: 1 }}
                  value={selectedPolygon.floorNumber || ''}
                  onChange={e => {
                    let value = parseInt(e.target.value, 10)
                    if (isNaN(value) || value < 1) value = 1
                    handleUpdatePolygon(selectedPolygon.id, { floorNumber: value })
                  }}
                  sx={{ mb: 2 }}
                />
                <Box sx={{ mb: 2 }}>
                  <Typography variant="caption" sx={{ fontFamily: '"Poppins", sans-serif', mb: 1, display: 'block', fontWeight: 600 }}>
                    Color
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
                    {COLORS.map((color) => (
                      <Box
                        key={color}
                        onClick={() => handleUpdatePolygon(selectedPolygon.id, { color })}
                        sx={{
                          width: 32,
                          height: 32,
                          borderRadius: 1,
                          bgcolor: color,
                          cursor: 'pointer',
                          border: selectedPolygon.color === color ? `3px solid ${theme.palette.primary.main}` : '2px solid #ddd',
                          '&:hover': {
                            transform: 'scale(1.1)',
                            transition: 'transform 0.2s'
                          }
                        }}
                      />
                    ))}
                  </Box>
                  <TextField
                    fullWidth
                    size="small"
                    type="color"
                    label="Custom Color"
                    value={selectedPolygon.color}
                    onChange={(e) => handleUpdatePolygon(selectedPolygon.id, { color: e.target.value })}
                  />
                </Box>
              </Box>
            )}
          </Paper>
        )}

        {/* Mobile Bottom Panel */}
        {isMobile && (
          <Paper
            elevation={0}
            sx={{
              maxHeight: '35vh',
              borderTop: `1px solid ${theme.palette.divider}`,
              display: 'flex',
              flexDirection: 'column',
              bgcolor: theme.palette.cardBg,
              overflow: 'hidden'
            }}
          >
            <Box sx={{ p: 1.5, borderBottom: `1px solid ${theme.palette.divider}` }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, fontFamily: '"Poppins", sans-serif' }}>
                Polygons ({allPolygons.length})
              </Typography>
            </Box>

            <List sx={{ flex: 1, overflow: 'auto', p: 1 }}>
              {allPolygons.length === 0 ? (
                <Box sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontFamily: '"Poppins", sans-serif' }}>
                    No polygons yet. Use toolbar to draw.
                  </Typography>
                </Box>
              ) : (
                allPolygons.map((polygon) => (
                  <ListItem
                    key={polygon.id}
                    sx={{
                      mb: 1,
                      borderRadius: 2,
                      border: `1px solid ${selectedPolygonId === polygon.id ? theme.palette.primary.main : theme.palette.divider}`,
                      bgcolor: selectedPolygonId === polygon.id ? theme.palette.chipAdmin.bg : 'transparent',
                      cursor: 'pointer',
                      py: 0.5
                    }}
                    onClick={() => setSelectedPolygonId(polygon.id)}
                  >
                    <Box
                      sx={{
                        width: 20,
                        height: 20,
                        borderRadius: 1,
                        bgcolor: polygon.color,
                        mr: 1.5,
                        border: '1px solid #000'
                      }}
                    />
                    <ListItemText
                      primary={polygon.name}
                      primaryTypographyProps={{ fontFamily: '"Poppins", sans-serif', fontSize: '0.85rem', fontWeight: 600 }}
                    />
                    <ListItemSecondaryAction>
                      <IconButton
                        edge="end"
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeletePolygon(polygon.id)
                        }}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))
              )}
            </List>

            {selectedPolygon && (
              <Box sx={{ p: 1.5, borderTop: `1px solid ${theme.palette.divider}`, bgcolor: theme.palette.background.paper }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Name"
                  value={selectedPolygon.name}
                  onChange={(e) => handleUpdatePolygon(selectedPolygon.id, { name: e.target.value })}
                  sx={{ mb: 1 }}
                />
                <TextField
                  fullWidth
                  size="small"
                  label="Floor Number"
                  type="number"
                  value={selectedPolygon.floorNumber || ''}
                  onChange={e => {
                    let value = parseInt(e.target.value, 10)
                    if (isNaN(value) || value < 1) value = 1
                    handleUpdatePolygon(selectedPolygon.id, { floorNumber: value })
                  }}
                />
              </Box>
            )}
          </Paper>
        )}
      </Box>

      {/* Footer */}
      <Box sx={{
        p: 2,
        borderTop: `1px solid ${theme.palette.divider}`,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        bgcolor: theme.palette.background.paper
      }}>
        <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontFamily: '"Poppins", sans-serif', display: isMobile ? 'none' : 'block' }}>
          Zoom: {Math.round(scale * 100)}% | Total Polygons: {allPolygons.length}
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, width: isMobile ? '100%' : 'auto' }}>
          <Button
            variant="outlined"
            onClick={onClose}
            fullWidth={isMobile}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              fontFamily: '"Poppins", sans-serif',
              fontWeight: 600
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSave}
            startIcon={<Save />}
            fullWidth={isMobile}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              fontFamily: '"Poppins", sans-serif',
              fontWeight: 600,
              bgcolor: theme.palette.primary.main
            }}
            disabled={allPolygons.length === 0}
          >
            Save
          </Button>
        </Box>
      </Box>
    </Dialog>
  )
}