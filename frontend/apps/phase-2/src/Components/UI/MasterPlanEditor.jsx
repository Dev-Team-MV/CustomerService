// @/Users/oficina/MV-CRM/CustomerService/frontend/apps/phase-2/src/Components/UI/MasterPlanEditor.jsx

import { useState, useRef, useEffect } from 'react'
import { Stage, Layer, Line, Circle, Image as KonvaImage } from 'react-konva'
import useImage from 'use-image'
import {
  Dialog, Box, Typography, Button, IconButton, ToggleButtonGroup, ToggleButton,
  Paper, List, ListItem, ListItemText, ListItemSecondaryAction,
  TextField, Divider, Alert, Tooltip, Chip, Slider
} from '@mui/material'
import {
  Close, CropSquare, Timeline, Edit, Delete, ZoomIn, ZoomOut,
  Undo, Redo, Save, CheckCircle, Palette, Business
} from '@mui/icons-material'
import { useTheme } from '@mui/material/styles'
import { useTranslation } from 'react-i18next'


const COLORS = [
  '#8CA551', '#333F1F', '#FF6B6B', '#4ECDC4', '#45B7D1',
  '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2'
]

const MasterPlanEditor = ({ 
  open, 
  onClose, 
  masterPlanData,
  onSave 
}) => {
  const theme = useTheme()
  const stageRef = useRef(null)
  const { t } = useTranslation('masterPlan')

  const [image] = useImage(masterPlanData?.masterPlanImage || '')
  
  // ✅ Cambiar estructura para incluir color data
  const [buildingPolygons, setBuildingPolygons] = useState({})
  const [drawMode, setDrawMode] = useState('select')
  const [selectedBuildingId, setSelectedBuildingId] = useState(null)
  const [currentPoints, setCurrentPoints] = useState([])
  const [isDrawing, setIsDrawing] = useState(false)
  const [scale, setScale] = useState(1)
  const [history, setHistory] = useState([])
  const [historyStep, setHistoryStep] = useState(0)
  const [dimensions, setDimensions] = useState({ width: 1200, height: 800 })

  useEffect(() => {
    if (masterPlanData?.buildings) {
      const initialPolygons = {}
      masterPlanData.buildings.forEach(building => {
        if (building.polygon && building.polygon.length > 0) {
          initialPolygons[building._id] = {
            polygon: building.polygon,
            polygonColor: building.polygonColor || '#22C55E',
            polygonStrokeColor: building.polygonStrokeColor || '#14532D',
            polygonOpacity: building.polygonOpacity !== undefined ? building.polygonOpacity : 0.42
          }
        }
      })
      setBuildingPolygons(initialPolygons)
      setHistory([initialPolygons])
      setHistoryStep(0)
    }
  }, [masterPlanData])

  useEffect(() => {
    if (image) {
      const maxWidth = 1200
      const maxHeight = 800
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

  const addToHistory = (newPolygons) => {
    const newHistory = history.slice(0, historyStep + 1)
    newHistory.push(newPolygons)
    setHistory(newHistory)
    setHistoryStep(newHistory.length - 1)
  }

  const handleUndo = () => {
    if (historyStep > 0) {
      const newStep = historyStep - 1
      setHistoryStep(newStep)
      setBuildingPolygons(history[newStep])
    }
  }

  const handleRedo = () => {
    if (historyStep < history.length - 1) {
      const newStep = historyStep + 1
      setHistoryStep(newStep)
      setBuildingPolygons(history[newStep])
    }
  }

  const handleStageClick = (e) => {
    const clickedOnEmpty = e.target === e.target.getStage()
    if (!clickedOnEmpty) return
  
    if (drawMode === 'select') {
      setSelectedBuildingId(null)
      return
    }

    if (!selectedBuildingId) {
      alert('Please select a building from the list first')
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
        const polygon = [
          { x: startX, y: startY },
          { x: x, y: startY },
          { x: x, y: y },
          { x: startX, y: y }
        ]
        
        const newPolygons = {
          ...buildingPolygons,
          [selectedBuildingId]: {
            polygon,
            polygonColor: '#22C55E',
            polygonStrokeColor: '#14532D',
            polygonOpacity: 0.42
          }
        }
        setBuildingPolygons(newPolygons)
        addToHistory(newPolygons)
        setCurrentPoints([])
        setIsDrawing(false)
      }
    } else if (drawMode === 'polygon') {
      setCurrentPoints([...currentPoints, x, y])
    }
  }

  const handleCompletePolygon = () => {
    if (currentPoints.length >= 6 && selectedBuildingId) {
      const polygon = []
      for (let i = 0; i < currentPoints.length; i += 2) {
        polygon.push({ x: currentPoints[i], y: currentPoints[i + 1] })
      }
      
      const newPolygons = {
        ...buildingPolygons,
        [selectedBuildingId]: {
          polygon,
          polygonColor: '#22C55E',
          polygonStrokeColor: '#14532D',
          polygonOpacity: 0.42
        }
      }
      setBuildingPolygons(newPolygons)
      addToHistory(newPolygons)
    }
    setCurrentPoints([])
    setIsDrawing(false)
  }

  const handleDeletePolygon = (buildingId) => {
    const newPolygons = { ...buildingPolygons }
    delete newPolygons[buildingId]
    setBuildingPolygons(newPolygons)
    addToHistory(newPolygons)
    setSelectedBuildingId(null)
  }

  // ✅ Actualizar color fields
  const handleUpdatePolygonColor = (buildingId, field, value) => {
    const newPolygons = {
      ...buildingPolygons,
      [buildingId]: {
        ...buildingPolygons[buildingId],
        [field]: value
      }
    }
    setBuildingPolygons(newPolygons)
    addToHistory(newPolygons)
  }

  const handleZoomIn = () => setScale(Math.min(scale + 0.1, 3))
  const handleZoomOut = () => setScale(Math.max(scale - 0.1, 0.5))

  const handleSave = async () => {
    const updates = []
    
    for (const [buildingId, data] of Object.entries(buildingPolygons)) {
      updates.push({
        buildingId,
        polygon: data.polygon,
        polygonColor: data.polygonColor,
        polygonStrokeColor: data.polygonStrokeColor,
        polygonOpacity: data.polygonOpacity
      })
    }
    
    console.log('💾 Saving master plan polygons with colors:', updates)
    await onSave(updates)
  }

  const buildings = masterPlanData?.buildings || []
  const buildingsWithPolygons = Object.keys(buildingPolygons).filter(id => 
    buildingPolygons[id]?.polygon && buildingPolygons[id].polygon.length > 0
  )

  const selectedBuilding = buildings.find(b => b._id === selectedBuildingId)
  const selectedPolygonData = selectedBuildingId ? buildingPolygons[selectedBuildingId] : null

  if (!masterPlanData) return null

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={false}
      PaperProps={{
        sx: {
          width: '95vw',
          height: '90vh',
          maxWidth: 'none',
          borderRadius: 3,
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
        <Box sx={{ flex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, fontFamily: '"Poppins", sans-serif' }}>
                {t('editorTitle', 'Master Plan Editor')}

            </Typography>
            <Chip 
              label={masterPlanData.project.name}
              size="small"
              sx={{ fontWeight: 600, fontFamily: '"Poppins", sans-serif' }}
            />
          </Box>
          
          <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontFamily: '"Poppins", sans-serif' }}>
            {t('buildingsCount', {
              total: buildings.length,
              withPolygons: buildingsWithPolygons.length
            }, '{{total}} buildings | {{withPolygons}} with polygons')}
          </Typography>
        </Box>
        <IconButton onClick={onClose}>
          <Close />
        </IconButton>
      </Box>

      <Box sx={{ display: 'flex', height: 'calc(100% - 140px)' }}>
        {/* Left Toolbar */}
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
              <IconButton 
                onClick={handleUndo} 
                size="small"
                disabled={historyStep === 0}
              >
                <Undo />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Redo" placement="right">
            <span>
              <IconButton 
                onClick={handleRedo} 
                size="small"
                disabled={historyStep === history.length - 1}
              >
                <Redo />
              </IconButton>
            </span>
          </Tooltip>
        </Paper>

        {/* Canvas Area */}
        <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', bgcolor: '#f5f5f5', position: 'relative', overflow: 'hidden' }}>
          {drawMode === 'polygon' && currentPoints.length > 0 && (
            <Alert
              severity="info"
              sx={{
                position: 'absolute',
                top: 16,
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 10,
                fontFamily: '"Poppins", sans-serif'
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
              Click to add points. {currentPoints.length / 2} points added. Minimum 3 points required.
            </Alert>
          )}

          <Stage
            ref={stageRef}
            width={dimensions.width}
            height={dimensions.height}
            scaleX={scale}
            scaleY={scale}
            onClick={handleStageClick}
            style={{ border: `2px solid ${theme.palette.divider}`, backgroundColor: '#fff', cursor: drawMode === 'select' ? 'default' : 'crosshair' }}
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

              {/* Render building polygons */}
              {Object.entries(buildingPolygons).map(([buildingId, data]) => {
                if (!data?.polygon || data.polygon.length < 3) return null
                
                const points = data.polygon.flatMap(p => [p.x, p.y])
                const isSelected = selectedBuildingId === buildingId
                
                return (
                  <Line
                    key={buildingId}
                    points={points}
                    closed
                    fill={data.polygonColor || '#22C55E'}
                    opacity={data.polygonOpacity !== undefined ? data.polygonOpacity : 0.42}
                    stroke={data.polygonStrokeColor || '#14532D'}
                    strokeWidth={isSelected ? 3 : 2}
                    onClick={() => {
                      if (drawMode === 'select') {
                        setSelectedBuildingId(buildingId)
                      }
                    }}
                    draggable={drawMode === 'select'}
                    onDragEnd={(e) => {
                      const newPolygon = data.polygon.map(p => ({
                        x: p.x + e.target.x(),
                        y: p.y + e.target.y()
                      }))
                      
                      const newPolygons = {
                        ...buildingPolygons,
                        [buildingId]: {
                          ...data,
                          polygon: newPolygon
                        }
                      }
                      setBuildingPolygons(newPolygons)
                      addToHistory(newPolygons)
                      e.target.position({ x: 0, y: 0 })
                    }}
                  />
                )
              })}

              {/* Current drawing preview */}
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

        {/* Right Panel - Building List & Settings */}
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
  {t('buildingsList', 'Buildings')} ({buildings.length})
</Typography>
<Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontFamily: '"Poppins", sans-serif' }}>
  {t('selectBuildingToDraw', 'Select a building to draw polygon')}
</Typography>
          </Box>

          <List sx={{ flex: 1, overflow: 'auto', p: 1 }}>
            {buildings.map((building) => {
              const hasPolygon = buildingPolygons[building._id]?.polygon?.length > 0
              const isSelected = selectedBuildingId === building._id
              
              return (
                <ListItem
                  key={building._id}
                  sx={{
                    mb: 1,
                    borderRadius: 2,
                    border: `1px solid ${isSelected ? theme.palette.primary.main : theme.palette.divider}`,
                    bgcolor: isSelected ? theme.palette.chipAdmin.bg : 'transparent',
                    cursor: 'pointer',
                    '&:hover': {
                      bgcolor: theme.palette.action.hover
                    }
                  }}
                  onClick={() => setSelectedBuildingId(building._id)}
                >
                  <Business sx={{ mr: 2, color: hasPolygon ? '#22C55E' : '#9e9e9e' }} />
                  <ListItemText
                    primary={building.name}
                    secondary={hasPolygon ? 'Has polygon' : 'No polygon'}
                    primaryTypographyProps={{ fontFamily: '"Poppins", sans-serif', fontSize: '0.9rem', fontWeight: 600 }}
                    secondaryTypographyProps={{ fontFamily: '"Poppins", sans-serif', fontSize: '0.75rem' }}
                  />
                  {hasPolygon && (
                    <ListItemSecondaryAction>
                      <IconButton
                        edge="end"
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeletePolygon(building._id)
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
                  )}
                </ListItem>
              )
            })}
          </List>

          {/* Polygon Color Settings */}
          {selectedBuilding && selectedPolygonData && (
            <Box sx={{ p: 2, borderTop: `1px solid ${theme.palette.divider}`, bgcolor: theme.palette.background.paper }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, fontFamily: '"Poppins", sans-serif', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Palette fontSize="small" />
                Polygon Style
              </Typography>
              
              <TextField
                fullWidth
                size="small"
                type="color"
                label="Fill Color"
                value={selectedPolygonData.polygonColor || '#22C55E'}
                onChange={(e) => handleUpdatePolygonColor(selectedBuildingId, 'polygonColor', e.target.value)}
                sx={{ mb: 2 }}
              />
              
              <TextField
                fullWidth
                size="small"
                type="color"
                label="Stroke Color"
                value={selectedPolygonData.polygonStrokeColor || '#14532D'}
                onChange={(e) => handleUpdatePolygonColor(selectedBuildingId, 'polygonStrokeColor', e.target.value)}
                sx={{ mb: 2 }}
              />
              
              <Box sx={{ mb: 1 }}>
                <Typography variant="caption" sx={{ fontFamily: '"Poppins", sans-serif', fontWeight: 600, display: 'block', mb: 1 }}>
                  Opacity: {((selectedPolygonData.polygonOpacity || 0.42) * 100).toFixed(0)}%
                </Typography>
                <Slider
                  value={selectedPolygonData.polygonOpacity !== undefined ? selectedPolygonData.polygonOpacity : 0.42}
                  onChange={(e, value) => handleUpdatePolygonColor(selectedBuildingId, 'polygonOpacity', value)}
                  min={0}
                  max={1}
                  step={0.01}
                  valueLabelDisplay="auto"
                  valueLabelFormat={(value) => `${(value * 100).toFixed(0)}%`}
                />
              </Box>
            </Box>
          )}
        </Paper>
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
        <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontFamily: '"Poppins", sans-serif' }}>
          Zoom: {Math.round(scale * 100)}% | Polygons: {buildingsWithPolygons.length}/{buildings.length}
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            onClick={onClose}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              fontFamily: '"Poppins", sans-serif',
              fontWeight: 600
            }}
          >
            {t('cancel', 'Cancel')}
          </Button>
          <Button
            variant="contained"
            onClick={handleSave}
            startIcon={<Save />}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              fontFamily: '"Poppins", sans-serif',
              fontWeight: 600,
              bgcolor: theme.palette.primary.main
            }}
            disabled={buildingsWithPolygons.length === 0}
          >
            {t('saveAllPolygons', 'Save All Polygons')}
          </Button>
        </Box>
      </Box>
    </Dialog>
  )
}

export default MasterPlanEditor