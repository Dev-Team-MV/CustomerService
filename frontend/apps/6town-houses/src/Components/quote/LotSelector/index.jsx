import { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { 
  Box, Grid, Card, CardContent, CardMedia, Typography, Button, 
  Chip, CircularProgress, Alert, Paper
} from '@mui/material'
import { Home, CheckCircle, Warning } from '@mui/icons-material'
import { useTheme } from '@mui/material/styles'
import buildingService from '@shared/services/buildingService'
import { useMasterPlan } from '@shared/hooks/useMasterPlan'
import { useModels } from '@shared/hooks/useModels'
import { useLots } from '@shared/hooks/useLots'
import PolygonImagePreview from '@shared/components/PolygonImagePreview'
import PolygonPopup from './PolygonPopup'

const LotSelector = ({ projectId, onBuildingSelect, facadeEnabled = true }) => {
  const theme = useTheme()
  const { t } = useTranslation(['quote', 'common'])
  const [buildings, setBuildings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [hoveredBuildingId, setHoveredBuildingId] = useState(null)
  const [selectedPolygonBuilding, setSelectedPolygonBuilding] = useState(null)
  const [popupPosition, setPopupPosition] = useState({ x: window.innerWidth / 2, y: window.innerHeight / 2 })
  const [showPopup, setShowPopup] = useState(false)
  const polygonImageRef = useRef(null)
  
  // ✅ Refs para controlar el estado del mouse
  const isOverPolygonRef = useRef(false)
  const isOverPopupRef = useRef(false)
  const closeTimeoutRef = useRef(null)

  // ✅ Usar los hooks de modelos y lotes
  const { models, loading: modelsLoading } = useModels(projectId)
  const { lots, loading: lotsLoading } = useLots(projectId)
  const { masterPlanData, loading: loadingMasterPlan, fetchMasterPlan } = useMasterPlan()

  useEffect(() => {
    fetchBuildings()
    if (projectId) {
      fetchMasterPlan(projectId, false)
    }
  }, [projectId])

  const fetchBuildings = async () => {
    try {
      setLoading(true)
      const data = await buildingService.getAll({ projectId })
      setBuildings(data)
    } catch (err) {
      console.error('Error fetching buildings:', err)
      setError(t('errors.loadingBuildings'))
    } finally {
      setLoading(false)
    }
  }
// DESPUÉS - Cambiar a usar availabilityStatus:
const getStatusConfig = (building) => {
  const availabilityStatus = building.availabilityStatus || 'available'
  
  const configs = {
    available: { 
      label: t('availability.available'), 
      color: 'success', 
      bgColor: '#4caf50' 
    },
    reserved: { 
      label: t('availability.reserved'), 
      color: 'warning', 
      bgColor: '#ff9800' 
    },
    assigned: { 
      label: t('availability.assigned'), 
      color: 'info', 
      bgColor: '#2196f3' 
    },
    sold: { 
      label: t('availability.sold'), 
      color: 'error', 
      bgColor: '#f44336' 
    },
    disabled: { 
      label: t('availability.disabled'), 
      color: 'default', 
      bgColor: '#9e9e9e' 
    },
    quote_locked: { 
      label: t('availability.quoteLocked'), 
      color: 'warning', 
      bgColor: '#ff9800' 
    }
  }
  
  return configs[availabilityStatus] || configs.available
}

  const validBuildings = buildings.filter(building => {
    const hasLotAndModel = building.quoteRef?.lot && building.quoteRef?.model
    const hasFacade = building.quoteRef?.facade
    const isActive = building.status === 'active'
    
    if (facadeEnabled) {
      return hasLotAndModel && hasFacade && isActive
    } else {
      return hasLotAndModel && isActive
    }
  })

  const invalidBuildings = buildings.filter(building => {
    const hasLotAndModel = building.quoteRef?.lot && building.quoteRef?.model
    const hasFacade = building.quoteRef?.facade
    
    if (facadeEnabled) {
      return !hasLotAndModel || !hasFacade
    } else {
      return !hasLotAndModel
    }
  })

  const preparePolygonsForPreview = () => {
    if (!masterPlanData?.buildings) return []
    return masterPlanData.buildings
      .filter(building => building.polygon && building.polygon.length > 0)
      .map(building => {
        const points = building.polygon.flatMap(point => [point.x, point.y])
        const statusConfig = getStatusConfig(building)
        
        return {
          id: building._id,
          name: building.name,
          points,
          color: building.polygonColor || statusConfig.bgColor,
          stroke: building.polygonStrokeColor || statusConfig.bgColor,
          opacity: building.polygonOpacity !== undefined ? building.polygonOpacity : 0.5,
          isAvailable: building.status === 'active'
        }
      })
  }

// ✅ Detectar cuando el mouse sale del área de polígonos
useEffect(() => {
  if (!showPopup || !selectedPolygonBuilding) return

  const handleMouseMove = (e) => {
    // Verificar si el mouse está sobre el popup
    const popupElement = document.querySelector('[data-popup-id]')
    if (popupElement) {
      const popupRect = popupElement.getBoundingClientRect()
      const isOverPopup = (
        e.clientX >= popupRect.left &&
        e.clientX <= popupRect.right &&
        e.clientY >= popupRect.top &&
        e.clientY <= popupRect.bottom
      )
      
      if (isOverPopup) {
        isOverPopupRef.current = true
        if (closeTimeoutRef.current) {
          clearTimeout(closeTimeoutRef.current)
          closeTimeoutRef.current = null
        }
        return
      } else {
        isOverPopupRef.current = false
      }
    }

    // Verificar si el mouse está sobre el canvas de polígonos
    const canvas = document.querySelector('canvas')
    if (!canvas) return

    const canvasRect = canvas.getBoundingClientRect()
    const isOverCanvas = (
      e.clientX >= canvasRect.left &&
      e.clientX <= canvasRect.right &&
      e.clientY >= canvasRect.top &&
      e.clientY <= canvasRect.bottom
    )

    // Si no está sobre el canvas ni sobre el popup, programar cierre
    if (!isOverCanvas && !isOverPopupRef.current) {
      if (!closeTimeoutRef.current) {
        console.log('⏰ Mouse fuera del área, programando cierre...')
        closeTimeoutRef.current = setTimeout(() => {
          console.log('❌ Cerrando popup (mouse fuera del área)')
          setShowPopup(false)
          setSelectedPolygonBuilding(null)
          setHoveredBuildingId(null)
          isOverPolygonRef.current = false
          closeTimeoutRef.current = null
        }, 200)
      }
    } else if (isOverCanvas) {
      // Si vuelve al canvas, cancelar el cierre
      isOverPolygonRef.current = true
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current)
        closeTimeoutRef.current = null
      }
    }
  }

  document.addEventListener('mousemove', handleMouseMove)
  return () => {
    document.removeEventListener('mousemove', handleMouseMove)
  }
}, [showPopup, selectedPolygonBuilding])
  // ✅ Limpiar timeout cuando el componente se desmonta
  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current)
      }
    }
  }, [])

// ✅ Manejador de hover sobre polígono
const handlePolygonHover = (polygonId, mouseEvent) => {
  // Si polygonId es null, significa que salió del polígono
if (polygonId === null) {
  console.log('🖱️ Mouse SALIÓ del polígono (polygonId=null)')
  isOverPolygonRef.current = false
  
  // Limpiar cualquier timeout anterior
  if (closeTimeoutRef.current) {
    clearTimeout(closeTimeoutRef.current)
  }
  
  // Programar cierre del popup
  closeTimeoutRef.current = setTimeout(() => {
    if (!isOverPopupRef.current) {
      console.log('❌ Cerrando popup (salió del polígono)')
      setShowPopup(false)
      setSelectedPolygonBuilding(null)
      setHoveredBuildingId(null)
    }
  }, 200)
  return
}

  // Si ya estamos mostrando el popup para este mismo polígono, no hacer nada
  if (selectedPolygonBuilding?._id === polygonId && showPopup) {
    return
  }

  console.log('🖱️ Mouse ENTER al polígono:', polygonId)
  
  // Cancelar cualquier cierre pendiente
  if (closeTimeoutRef.current) {
    clearTimeout(closeTimeoutRef.current)
    closeTimeoutRef.current = null
  }

  isOverPolygonRef.current = true

  let clientX, clientY

  // Manejar cuando mouseEvent es null o no tiene coordenadas
  if (!mouseEvent || mouseEvent.clientX === undefined || mouseEvent.clientY === undefined) {
    console.warn('⚠️ mouseEvent inválido, usando posición del polígono')
    if (polygonImageRef.current) {
      const rect = polygonImageRef.current.getBoundingClientRect()
      clientX = rect.left + rect.width / 2
      clientY = rect.top + rect.height / 2
    } else {
      clientX = window.innerWidth / 2
      clientY = window.innerHeight / 2
    }
  } else {
    clientX = mouseEvent.clientX
    clientY = mouseEvent.clientY
  }

  const building = buildings.find(b => b._id === polygonId)
  
  if (building && validBuildings.includes(building)) {
    console.log('✅ Mostrando popup para:', building.name)
    
    setPopupPosition({
      x: clientX,
      y: clientY
    })
    setSelectedPolygonBuilding(building)
    setShowPopup(true)
    setHoveredBuildingId(polygonId)
  }
}

  // ✅ Manejador de leave del polígono
const handlePolygonLeave = () => {
  console.log('🖱️ Mouse LEAVE del polígono')
  isOverPolygonRef.current = false
 
  // Programar cierre del popup después de un pequeño delay
  closeTimeoutRef.current = setTimeout(() => {
    if (!isOverPopupRef.current && !isOverPolygonRef.current) {
      console.log('❌ Cerrando popup (salió del polígono)')
      setShowPopup(false)
      setSelectedPolygonBuilding(null)
      setHoveredBuildingId(null)
    }
  }, 200) // 200ms de delay para dar tiempo a entrar al popup
}

  // ✅ Manejador de enter del popup
  const handlePopupEnter = () => {
    console.log('🖱️ Mouse ENTER al popup')
    isOverPopupRef.current = true

    // Cancelar cualquier cierre pendiente
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current)
      closeTimeoutRef.current = null
    }
  }

// ✅ Manejador de leave del popup
const handlePopupLeave = () => {
  console.log('🖱️ Mouse LEAVE del popup')
  isOverPopupRef.current = false
 
  // Limpiar cualquier timeout anterior
  if (closeTimeoutRef.current) {
    clearTimeout(closeTimeoutRef.current)
  }

  // Programar cierre del popup después de un pequeño delay
  closeTimeoutRef.current = setTimeout(() => {
    if (!isOverPopupRef.current && !isOverPolygonRef.current) {
      console.log('❌ Cerrando popup (salió del popup)')
      setShowPopup(false)
      setSelectedPolygonBuilding(null)
      setHoveredBuildingId(null)
    }
  }, 200)
}

  const handlePolygonClick = (polygon) => {
    const building = buildings.find(b => b._id === polygon.id)
    if (building && building.status === 'active') {
      const hasLotAndModel = building.quoteRef?.lot && building.quoteRef?.model
      const hasFacade = building.quoteRef?.facade
      
      if (facadeEnabled) {
        if (hasLotAndModel && hasFacade) {
          onBuildingSelect(building)
        }
      } else {
        if (hasLotAndModel) {
          onBuildingSelect(building)
        }
      }
    }
  }

  const handleSelectFromPopup = () => {
    if (selectedPolygonBuilding) {
      console.log('✅ Seleccionando desde popup:', selectedPolygonBuilding.name)
      setShowPopup(false)
      setSelectedPolygonBuilding(null)
      setHoveredBuildingId(null)
      onBuildingSelect(selectedPolygonBuilding)
    }
  }

  if (loading || loadingMasterPlan || modelsLoading || lotsLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
        <CircularProgress size={60} />
      </Box>
    )
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>
  }

  const previewPolygons = preparePolygonsForPreview()

  return (
    <Box>
      <Box textAlign="center" mb={4}>
        <Typography 
          variant="h4" 
          fontWeight={700} 
          sx={{ fontFamily: '"Poppins", sans-serif', mb: 1 }}
        >
          {t('selectYourHouse')}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {validBuildings.length > 0 
            ? t('chooseAvailableHouses', { count: validBuildings.length })
            : t('noAvailableHouses')}
        </Typography>
      </Box>

      {invalidBuildings.length > 0 && (
        <Alert severity="warning" icon={<Warning />} sx={{ mb: 3, borderRadius: 3 }}>
          {t('incompleteQuoteConfig', { count: invalidBuildings.length })}
        </Alert>
      )}

      {/* MasterPlan con polígonos */}
      {masterPlanData?.masterPlanImage && previewPolygons.length > 0 && (
        <Paper elevation={3} sx={{ p: 3, mb: 4, borderRadius: 3 }} ref={polygonImageRef}>
          <Box mb={2}>
            <Typography variant="h6" fontWeight={600} sx={{ fontFamily: '"Poppins", sans-serif', mb: 1 }}>
              {t('masterPlan')}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t('clickHouseToSelect')}
            </Typography>
          </Box>
          <PolygonImagePreview
            imageUrl={masterPlanData.masterPlanImage}
            polygons={previewPolygons}
            maxWidth={1200}
            maxHeight={800}
            highlightPolygonId={hoveredBuildingId}
            onPolygonClick={handlePolygonClick}
            onPolygonHover={handlePolygonHover}
            onPolygonLeave={handlePolygonLeave}
            enableZoom={true}
          />
        </Paper>
      )}

      {/* Cards de casas */}
      {validBuildings.length === 0 ? (
        <Alert severity="info" sx={{ borderRadius: 3 }}>
          {t('noAvailableHousesContact')}
        </Alert>
      ) : (
        <>
          <Typography variant="h6" fontWeight={600} mb={3} sx={{ fontFamily: '"Poppins", sans-serif' }}>
            {t('availableHouses')}
          </Typography>
          <Grid container spacing={3}>
            {validBuildings.map((building) => {
              const statusConfig = getStatusConfig(building)
              const firstRender = building.exteriorRenders?.[0]?.url || building.exteriorRenders?.[0]
              const isHovered = hoveredBuildingId === building._id

              return (
                <Grid item xs={12} sm={6} md={4} key={building._id}>
                  <Card
                    elevation={isHovered ? 6 : 3}
                    onMouseEnter={() => setHoveredBuildingId(building._id)}
                    onMouseLeave={() => setHoveredBuildingId(null)}
                    sx={{
                      borderRadius: 4,
                      overflow: 'hidden',
                      transition: 'all 0.3s ease',
                      border: isHovered ? `3px solid ${theme.palette.primary.main}` : '3px solid transparent',
                      transform: isHovered ? 'translateY(-8px)' : 'translateY(0)',
                      cursor: 'pointer'
                    }}
                  >
                    <CardMedia
                      component="div"
                      sx={{
                        height: 220,
                        bgcolor: '#f5f5f5',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundImage: firstRender ? `url(${firstRender})` : 'none',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        position: 'relative'
                      }}
                    >
                      {!firstRender && (
                        <Home sx={{ fontSize: 80, color: theme.palette.primary.main, opacity: 0.3 }} />
                      )}
                      <Chip
                        label={statusConfig.label}
                        color={statusConfig.color}
                        size="small"
                        sx={{
                          position: 'absolute',
                          top: 12,
                          right: 12,
                          fontWeight: 600,
                          fontFamily: '"Poppins", sans-serif'
                        }}
                      />
                    </CardMedia>

                    <CardContent sx={{ p: 3 }}>
                      <Typography variant="h6" fontWeight={700} mb={1} sx={{ fontFamily: '"Poppins", sans-serif' }}>
                        {building.name}
                      </Typography>

                      <Box display="flex" alignItems="center" gap={1} mb={2}>
                        <CheckCircle fontSize="small" color="success" />
                        <Typography variant="caption" color="text.secondary">
                          {t('completeConfig')}
                        </Typography>
                      </Box>

                      <Button
                        variant="contained"
                        fullWidth
                        onClick={() => {
                          onBuildingSelect(building)
                        }}
                        sx={{
                          borderRadius: 3,
                          py: 1.5,
                          fontWeight: 600,
                          textTransform: 'none',
                          fontFamily: '"Poppins", sans-serif',
                          bgcolor: theme.palette.primary.main,
                          '&:hover': {
                            bgcolor: theme.palette.primary.dark
                          }
                        }}
                      >
                        {t('selectHouse')}
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              )
            })}
          </Grid>
        </>
      )}

      {/* ✅ Popup para polígonos - Renderizado con Portal */}
      {showPopup && selectedPolygonBuilding && (
        <PolygonPopup
          building={selectedPolygonBuilding}
          popupPosition={popupPosition}
          onMouseEnter={handlePopupEnter}
          onMouseLeave={handlePopupLeave}
          onSelectBuilding={handleSelectFromPopup}
          models={models}
          lots={lots}
          modelsLoading={modelsLoading}
          lotsLoading={lotsLoading}
        />
      )}
    </Box>
  )
}

export default LotSelector