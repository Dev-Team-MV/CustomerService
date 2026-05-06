import { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { createPortal } from 'react-dom'
import { 
  Box, Grid, Card, CardContent, CardMedia, Typography, Button, 
  Chip, CircularProgress, Alert, Paper, Divider, Skeleton
} from '@mui/material'
import { Home, CheckCircle, Warning, AttachMoney } from '@mui/icons-material'
import { useTheme } from '@mui/material/styles'
import buildingService from '@shared/services/buildingService'
import { useMasterPlan } from '@shared/hooks/useMasterPlan'
import { useModels } from '@shared/hooks/useModels'
import { useLots } from '@shared/hooks/useLots'
import PolygonImagePreview from '@shared/components/PolygonImagePreview'

// ✅ Hook para resolver referencias usando los datos de useModels y useLots
const useResolveReferences = (building, models, lots, modelsLoading, lotsLoading) => {
  const [resolvedData, setResolvedData] = useState({
    modelName: 'N/A',
    modelPrice: 0,
    lotPrice: 0,
    totalPrice: 0,
    loading: true,
    error: null
  })

  useEffect(() => {
    if (modelsLoading || lotsLoading) {
      return
    }

    try {
      let modelName = 'N/A'
      let modelPrice = 0
      let lotPrice = 0

      console.log('🔍 Resolving building:', building)
      console.log('📦 quoteRef:', building.quoteRef)
      console.log('📚 Available models:', models)
      console.log('📍 Available lots:', lots)

      // ✅ Resolver referencia del modelo
      if (building.quoteRef?.model) {
        const modelRef = building.quoteRef.model
        console.log('🏠 Model reference:', modelRef, 'Type:', typeof modelRef)

        // Si es un objeto, extraer datos directamente
        if (typeof modelRef === 'object' && modelRef !== null) {
          modelName = modelRef.name || modelRef.modelName || modelRef.title || 'N/A'
          modelPrice = modelRef.basePrice || modelRef.price || modelRef.modelPrice || 0
          console.log('✅ Model from object:', { modelName, modelPrice })
        }
        // Si es un ID string, buscar en los modelos cargados
        else if (typeof modelRef === 'string') {
          const foundModel = models.find(m => m._id === modelRef || m.id === modelRef)
          if (foundModel) {
            modelName = foundModel.name || foundModel.modelName || 'N/A'
            modelPrice = foundModel.basePrice || foundModel.price || foundModel.modelPrice || 0
            console.log('✅ Model found in hook:', { modelName, modelPrice })
          } else {
            modelName = `Model ${modelRef.slice(-6)}`
            console.warn('⚠️ Model not found in loaded models:', modelRef)
          }
        }
        // Si es un nombre directo
        else {
          modelName = String(modelRef)
          console.log('✅ Model as string:', modelName)
        }
      }

      // ✅ Resolver referencia del lote
      if (building.quoteRef?.lot) {
        const lotRef = building.quoteRef.lot
        console.log('📍 Lot reference:', lotRef, 'Type:', typeof lotRef)

        // Si es un objeto, extraer datos directamente
        if (typeof lotRef === 'object' && lotRef !== null) {
          lotPrice = lotRef.price || lotRef.lotPrice || lotRef.basePrice || 0
          console.log('✅ Lot from object:', { lotPrice })
        }
        // Si es un ID string, buscar en los lotes cargados
        else if (typeof lotRef === 'string') {
          const foundLot = lots.find(l => l._id === lotRef || l.id === lotRef)
          if (foundLot) {
            lotPrice = foundLot.price || foundLot.lotPrice || foundLot.basePrice || 0
            console.log('✅ Lot found in hook:', { lotPrice })
          } else {
            console.warn('⚠️ Lot not found in loaded lots:', lotRef)
          }
        }
      }

      const totalPrice = modelPrice + lotPrice

      console.log('📊 Final resolved data:', { modelName, modelPrice, lotPrice, totalPrice })

      setResolvedData({
        modelName,
        modelPrice,
        lotPrice,
        totalPrice,
        loading: false,
        error: null
      })
    } catch (error) {
      console.error('Error resolving references:', error)
      setResolvedData(prev => ({
        ...prev,
        loading: false,
        error: error.message
      }))
    }
  }, [building?._id, models, lots, modelsLoading, lotsLoading])

  return resolvedData
}

// ✅ NUEVO: Componente de Popup para polígonos
const PolygonPopup = ({ 
  building, 
  popupPosition, 
  onMouseEnter, 
  onMouseLeave,
  onSelectBuilding,
  models,
  lots,
  modelsLoading,
  lotsLoading
}) => {
  const theme = useTheme()
  const { t } = useTranslation(['quote', 'common'])
  const { modelName, totalPrice, loading } = useResolveReferences(
    building, 
    models, 
    lots, 
    modelsLoading, 
    lotsLoading
  )

  if (!building) return null

  const status = building.status || 'active'
  const statusLabel = status === 'sold' ? t('status.sold') : status === 'reserved' ? t('status.reserved') : t('status.available')
  const statusColor = status === 'sold' ? '#f44336' : status === 'reserved' ? '#ff9800' : '#4caf50'
  const statusBgColor = status === 'sold' ? '#ffebee' : status === 'reserved' ? '#fff3e0' : '#e8f5e9'

  const lotNumber = building.quoteRef?.lot?._id || building.quoteRef?.lot || 'N/A'

  // ✅ Calcular posición con offsets para mantener visible
  const calculatePosition = () => {
    const popupWidth = 280
    const popupHeight = 320
    const offset = 18
    const padding = 16

    let x = popupPosition.x
    let y = popupPosition.y - offset

    // Ajustar horizontalmente si se sale de pantalla
    if (x - popupWidth / 2 < padding) {
      x = popupWidth / 2 + padding
    } else if (x + popupWidth / 2 > window.innerWidth - padding) {
      x = window.innerWidth - popupWidth / 2 - padding
    }

    // Ajustar verticalmente si se sale de pantalla
    if (y - popupHeight < padding) {
      y = popupPosition.y + offset + 20
    }

    return { x, y }
  }

  const { x, y } = calculatePosition()

  return createPortal(
    <>
      {/* Popup */}
      <Paper
        elevation={4}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        sx={{
          position: 'fixed',
          left: `${x}px`,
          top: `${y}px`,
          transform: 'translate(-50%, calc(-100% - 18px))',
          p: 2.5,
          width: 280,
          minWidth: 250,
          maxWidth: 320,
          boxShadow: '0 8px 32px rgba(140, 165, 81, 0.2)',
          zIndex: 100000,
          borderRadius: 3,
          pointerEvents: 'auto',
          background: 'linear-gradient(135deg, #fafbf8 85%, #f0f4e6 100%)',
          border: '1.5px solid #e0e8d0',
          animation: 'slideUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
          '@keyframes slideUp': {
            from: { 
              opacity: 0,
              transform: 'translate(-50%, calc(-100% - 28px)) scale(0.9)'
            },
            to: { 
              opacity: 1,
              transform: 'translate(-50%, calc(-100% - 18px)) scale(1)'
            }
          }
        }}
      >
        {/* Header con nombre y estado */}
        <Box sx={{ mb: 1.5 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.8, gap: 1 }}>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography 
                variant="subtitle2" 
                fontWeight={700} 
                color="#333F1F" 
                sx={{ 
                  fontFamily: '"Poppins", sans-serif', 
                  fontSize: '15px', 
                  mb: 0.3,
                  wordBreak: 'break-word'
                }}
              >
                {building.name}
              </Typography>
              <Typography 
                variant="caption" 
                color="text.secondary" 
                sx={{ fontFamily: '"Poppins", sans-serif', fontSize: '12px' }}
              >
                {t('lot')} {String(lotNumber).slice(-8)}
              </Typography>
            </Box>
            <Chip 
              label={statusLabel}
              size="small"
              sx={{
                fontWeight: 700,
                fontSize: '0.65rem',
                letterSpacing: 0.5,
                px: 1,
                py: 0.5,
                minWidth: 'fit-content',
                flexShrink: 0,
                bgcolor: statusBgColor,
                color: statusColor,
                border: `1.5px solid ${statusColor}`,
                fontFamily: '"Poppins", sans-serif'
              }}
            />
          </Box>
        </Box>

        <Divider sx={{ mb: 1.5, borderColor: '#e0e8d0' }} />

        {/* Información de la casa */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.2, mb: 1.5 }}>
          {/* Modelo */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: '8px',
                bgcolor: 'rgba(140, 165, 81, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <Home sx={{ fontSize: 18, color: '#8CA551' }} />
            </Box>
            <Box flex={1} minWidth={0}>
              <Typography 
                variant="caption" 
                color="text.secondary" 
                sx={{ fontFamily: '"Poppins", sans-serif', fontSize: '11px', fontWeight: 500, display: 'block' }}
              >
                {t('step.model')}
              </Typography>
              {loading ? (
                <Skeleton variant="text" width="80%" height={16} />
              ) : (
                <Typography 
                  variant="caption" 
                  fontWeight={700} 
                  sx={{ 
                    fontFamily: '"Poppins", sans-serif', 
                    fontSize: '13px', 
                    display: 'block',
                    wordBreak: 'break-word'
                  }}
                >
                  {modelName}
                </Typography>
              )}
            </Box>
          </Box>

          {/* Precio Total */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: '8px',
                bgcolor: 'rgba(229, 134, 60, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <AttachMoney sx={{ fontSize: 18, color: '#E5863C' }} />
            </Box>
            <Box flex={1} minWidth={0}>
              <Typography 
                variant="caption" 
                color="text.secondary" 
                sx={{ fontFamily: '"Poppins", sans-serif', fontSize: '11px', fontWeight: 500, display: 'block' }}
              >
                {t('presalePriceToday')}
              </Typography>
              {loading ? (
                <Skeleton variant="text" width="100%" height={18} />
              ) : (
                <Typography 
                  variant="caption" 
                  fontWeight={700} 
                  sx={{ 
                    fontFamily: '"Poppins", sans-serif', 
                    fontSize: '14px', 
                    display: 'block', 
                    color: '#E5863C',
                    wordBreak: 'break-word'
                  }}
                >
                  {totalPrice > 0 ? `$${totalPrice.toLocaleString()}` : 'N/A'}
                </Typography>
              )}
            </Box>
          </Box>

          {/* Configuración completa */}
          {building.quoteRef?.lot && building.quoteRef?.model && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: '8px',
                  bgcolor: 'rgba(76, 175, 80, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <CheckCircle sx={{ fontSize: 18, color: '#4caf50' }} />
              </Box>
              <Typography 
                variant="caption" 
                fontWeight={600}
                sx={{ fontFamily: '"Poppins", sans-serif', fontSize: '12px', color: '#4caf50' }}
              >
                {t('completeConfig')}
              </Typography>
            </Box>
          )}
        </Box>

        <Divider sx={{ my: 1.5, borderColor: '#e0e8d0' }} />

        {/* Botón de acción */}
        <Button
          variant="contained"
          fullWidth
          size="small"
          onClick={onSelectBuilding}
          disabled={loading}
          sx={{
            borderRadius: 2,
            bgcolor: '#8CA551',
            color: 'white',
            fontWeight: 600,
            textTransform: 'none',
            fontFamily: '"Poppins", sans-serif',
            fontSize: '12px',
            py: 0.8,
            '&:hover': {
              bgcolor: '#7a8e46',
              transform: 'scale(1.02)'
            },
            '&:disabled': {
              bgcolor: '#ccc',
              cursor: 'not-allowed'
            },
            transition: 'all 0.2s ease'
          }}
        >
          {t('selectHouse')}
        </Button>
      </Paper>

      {/* Flecha visual */}
      <Box
        sx={{
          position: 'fixed',
          left: `${x}px`,
          top: `${y - 8}px`,
          transform: 'translate(-50%, 0)',
          zIndex: 100001,
          pointerEvents: 'none'
        }}
      >
        <Box
          sx={{
            width: 0,
            height: 0,
            borderLeft: '12px solid transparent',
            borderRight: '12px solid transparent',
            borderTop: '14px solid #fafbf8',
            filter: 'drop-shadow(0 2px 4px rgba(140, 165, 81, 0.15))',
            animation: 'slideUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
          }}
        />
      </Box>
    </>,
    document.body
  )
}

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
  
  const isOverPopupRef = useRef(false)
  const isOverPolygonRef = useRef(false)
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

  const getStatusConfig = (status) => {
    const configs = {
      active: { label: t('status.available'), color: 'success', bgColor: '#4caf50' },
      reserved: { label: t('status.reserved'), color: 'warning', bgColor: '#ff9800' },
      sold: { label: t('status.sold'), color: 'error', bgColor: '#f44336' },
      inactive: { label: t('status.unavailable'), color: 'default', bgColor: '#9e9e9e' }
    }
    return configs[status] || configs.active
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
        const statusConfig = getStatusConfig(building.status)
        
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

  const handlePolygonHover = (polygonId, mouseEvent) => {
    if (!mouseEvent) {
      console.warn('⚠️ mouseEvent is null/undefined')
      return
    }

    let clientX = mouseEvent.clientX
    let clientY = mouseEvent.clientY

    if (clientX === undefined || clientY === undefined) {
      if (polygonImageRef.current) {
        const rect = polygonImageRef.current.getBoundingClientRect()
        clientX = rect.left + rect.width / 2
        clientY = rect.top + rect.height / 2
      } else {
        clientX = window.innerWidth / 2
        clientY = window.innerHeight / 2
      }
    }
    
    isOverPolygonRef.current = true

    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current)
      closeTimeoutRef.current = null
    }

    const building = buildings.find(b => b._id === polygonId)
    
    if (building && validBuildings.includes(building)) {
      setPopupPosition({
        x: clientX,
        y: clientY
      })
      setSelectedPolygonBuilding(building)
      setShowPopup(true)
    }
  }

  const handlePolygonLeave = () => {
    isOverPolygonRef.current = false

    closeTimeoutRef.current = setTimeout(() => {
      if (!isOverPopupRef.current && !isOverPolygonRef.current) {
        setShowPopup(false)
        setSelectedPolygonBuilding(null)
      }
    }, 200)
  }

  const handlePopupEnter = () => {
    isOverPopupRef.current = true

    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current)
      closeTimeoutRef.current = null
    }
  }

  const handlePopupLeave = () => {
    isOverPopupRef.current = false

    closeTimeoutRef.current = setTimeout(() => {
      if (!isOverPopupRef.current && !isOverPolygonRef.current) {
        setShowPopup(false)
        setSelectedPolygonBuilding(null)
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
      setShowPopup(false)
      setSelectedPolygonBuilding(null)
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
            onPolygonHover={(id, mouseEvent) => {
              setHoveredBuildingId(id)
              handlePolygonHover(id, mouseEvent)
            }}
            onPolygonLeave={(id) => {
              setHoveredBuildingId(null)
              handlePolygonLeave()
            }}
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
              const statusConfig = getStatusConfig(building.status)
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