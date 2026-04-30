// @/Users/oficina/MV-CRM/CustomerService/frontend/apps/6town-houses/src/Components/quote/LotSelector.jsx
// Reemplazar todo el archivo con:

import { useState, useEffect } from 'react'
import { 
  Box, Grid, Card, CardContent, CardMedia, Typography, Button, 
  Chip, CircularProgress, Alert, Paper
} from '@mui/material'
import { Home, CheckCircle, Warning } from '@mui/icons-material'
import { useTheme } from '@mui/material/styles'
import buildingService from '@shared/services/buildingService'
import { useMasterPlan } from '@shared/hooks/useMasterPlan'
import PolygonImagePreview from '@shared/components/PolygonImagePreview'

const LotSelector = ({ projectId, onBuildingSelect, facadeEnabled = true }) => {
  const theme = useTheme()
  const [buildings, setBuildings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [hoveredBuildingId, setHoveredBuildingId] = useState(null)

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
      setError('Error al cargar las casas disponibles')
    } finally {
      setLoading(false)
    }
  }

  const getStatusConfig = (status) => {
    const configs = {
      active: { label: 'Disponible', color: 'success', bgColor: '#4caf50' },
      reserved: { label: 'Reservada', color: 'warning', bgColor: '#ff9800' },
      sold: { label: 'Vendida', color: 'error', bgColor: '#f44336' },
      inactive: { label: 'No Disponible', color: 'default', bgColor: '#9e9e9e' }
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

  // Preparar polígonos para el masterPlan
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

  if (loading || loadingMasterPlan) {
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
          Selecciona tu Casa
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {validBuildings.length > 0 
            ? `Elige una de nuestras ${validBuildings.length} casas disponibles`
            : 'No hay casas disponibles en este momento'}
        </Typography>
      </Box>

      {invalidBuildings.length > 0 && (
        <Alert severity="warning" icon={<Warning />} sx={{ mb: 3, borderRadius: 3 }}>
          Hay {invalidBuildings.length} casa(s) sin configuración de cotización completa. 
          Por favor contacta con el administrador.
        </Alert>
      )}

      {/* MasterPlan con polígonos */}
      {masterPlanData?.masterPlanImage && previewPolygons.length > 0 && (
        <Paper elevation={3} sx={{ p: 3, mb: 4, borderRadius: 3 }}>
          <Box mb={2}>
            <Typography variant="h6" fontWeight={600} sx={{ fontFamily: '"Poppins", sans-serif', mb: 1 }}>
              Master Plan
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Haz clic en una casa para seleccionarla
            </Typography>
          </Box>
          <PolygonImagePreview
            imageUrl={masterPlanData.masterPlanImage}
            polygons={previewPolygons}
            maxWidth={1200}
            maxHeight={800}
            highlightPolygonId={hoveredBuildingId}
            onPolygonClick={handlePolygonClick}
            onPolygonHover={(id) => setHoveredBuildingId(id)}
            enableZoom={true}
          />
        </Paper>
      )}

      {/* Cards de casas */}
      {validBuildings.length === 0 ? (
        <Alert severity="info" sx={{ borderRadius: 3 }}>
          No hay casas disponibles para cotizar en este momento. Por favor contacta con ventas.
        </Alert>
      ) : (
        <>
          <Typography variant="h6" fontWeight={600} mb={3} sx={{ fontFamily: '"Poppins", sans-serif' }}>
            Casas Disponibles
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
                          Configuración completa
                        </Typography>
                      </Box>

                      <Button
                        variant="contained"
                        fullWidth
                          onClick={() => {
    console.log('🔍 ===== SELECCIONANDO CASA DESDE LOTSELECTOR =====')
    console.log('🏠 Building antes de enviar:', building)
    console.log('📦 Building._id:', building._id)
    console.log('📦 Building.name:', building.name)
    console.log('📦 Building.quoteRef:', building.quoteRef)
    console.log('📦 Building.lot:', building.lot)
    console.log('📦 Building.model:', building.model)
    console.log('📦 Building.facade:', building.facade)
    console.log('===================================================')
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
                        Seleccionar Casa
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              )
            })}
          </Grid>
        </>
      )}
    </Box>
  )
}

export default LotSelector