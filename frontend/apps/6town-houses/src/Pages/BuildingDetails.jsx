// @/Users/oficina/MV-CRM/CustomerService/frontend/apps/6town-houses/src/Pages/BuildingDetails.jsx

import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { 
  Box, Container, Paper, Typography, Grid, Chip, Button, Alert,
  Divider, CircularProgress
} from '@mui/material'
import { 
  Home, ArrowBack, Edit, Landscape, Business, Palette, AttachMoney 
} from '@mui/icons-material'
import { useTheme } from '@mui/material/styles'
import buildingService from '@shared/services/buildingService'
import lotService from '@shared/services/lotService'
import modelService from '@shared/services/modelService'
import facadeService from '@shared/services/facadeService'

const BuildingDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const theme = useTheme()

  const [building, setBuilding] = useState(null)
  const [quoteRefDetails, setQuoteRefDetails] = useState({
    lot: null,
    model: null,
    facade: null
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchBuildingDetails()
  }, [id])

  const fetchBuildingDetails = async () => {
    try {
      setLoading(true)
      const buildingData = await buildingService.getById(id)
      setBuilding(buildingData)

      // ✅ Cargar detalles de quoteRef si existen
      if (buildingData.quoteRef) {
        const details = {}
        
        if (buildingData.quoteRef.lot) {
          try {
            details.lot = await lotService.getById(buildingData.quoteRef.lot)
          } catch (err) {
            console.error('Error loading lot:', err)
          }
        }
        
        if (buildingData.quoteRef.model) {
          try {
            details.model = await modelService.getById(buildingData.quoteRef.model)
          } catch (err) {
            console.error('Error loading model:', err)
          }
        }
        
        if (buildingData.quoteRef.facade) {
          try {
            details.facade = await facadeService.getById(buildingData.quoteRef.facade)
          } catch (err) {
            console.error('Error loading facade:', err)
          }
        }
        
        setQuoteRefDetails(details)
      }
    } catch (err) {
      console.error('Error fetching building:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress size={60} />
      </Container>
    )
  }

  if (error || !building) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Alert severity="error">Error al cargar la casa: {error}</Alert>
        <Button startIcon={<ArrowBack />} onClick={() => navigate('/buildings')} sx={{ mt: 2 }}>
          Volver a Casas
        </Button>
      </Container>
    )
  }

  const statusConfig = {
    active: { label: 'Disponible', color: 'success' },
    reserved: { label: 'Reservada', color: 'warning' },
    sold: { label: 'Vendida', color: 'error' },
    inactive: { label: 'Inactiva', color: 'default' }
  }

  const status = statusConfig[building.status] || statusConfig.active

  const hasCompleteQuoteRef = building.quoteRef?.lot && building.quoteRef?.model && building.quoteRef?.facade
  
  const calculateBasePrice = () => {
    let total = 0
    if (quoteRefDetails.lot) total += quoteRefDetails.lot.price || 0
    if (quoteRefDetails.model) total += quoteRefDetails.model.price || 0
    if (quoteRefDetails.facade) total += quoteRefDetails.facade.price || 0
    return total
  }

  const basePrice = calculateBasePrice()

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: theme.palette.background.default, p: { xs: 2, sm: 3 } }}>
      <Container maxWidth="xl">
        <Box display="flex" alignItems="center" gap={2} mb={3}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate('/buildings')}
            sx={{ borderRadius: 2, textTransform: 'none', fontFamily: '"Poppins", sans-serif' }}
          >
            Volver
          </Button>
          <Box flex={1}>
            <Typography variant="h4" fontWeight={700} sx={{ fontFamily: '"Poppins", sans-serif' }}>
              {building.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              ID: {building._id}
            </Typography>
          </Box>
          <Chip 
            label={status.label} 
            color={status.color} 
            sx={{ fontWeight: 600, fontFamily: '"Poppins", sans-serif' }} 
          />
          <Button
            variant="contained"
            startIcon={<Edit />}
            onClick={() => navigate(`/buildings`)}
            sx={{ borderRadius: 2, textTransform: 'none', fontFamily: '"Poppins", sans-serif' }}
          >
            Editar
          </Button>
        </Box>

        <Grid container spacing={3}>
          {/* Información básica */}
          <Grid item xs={12} md={8}>
            <Paper elevation={3} sx={{ p: 3, borderRadius: 4 }}>
              <Typography variant="h6" fontWeight={700} mb={3} sx={{ fontFamily: '"Poppins", sans-serif' }}>
                Información General
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 600 }}>
                    Nombre
                  </Typography>
                  <Typography variant="body1" fontWeight={600}>
                    {building.name}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 600 }}>
                    Estado
                  </Typography>
                  <Box mt={0.5}>
                    <Chip label={status.label} color={status.color} size="small" />
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 600 }}>
                    Polígono Definido
                  </Typography>
                  <Typography variant="body1" fontWeight={600}>
                    {building.polygon && building.polygon.length > 0 ? 'Sí' : 'No'}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 600 }}>
                    Renders
                  </Typography>
                  <Typography variant="body1" fontWeight={600}>
                    {building.exteriorRenders?.length || 0} imágenes
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* Configuración de Quote */}
          <Grid item xs={12} md={4}>
            <Paper 
              elevation={3} 
              sx={{ 
                p: 3, 
                borderRadius: 4,
                border: hasCompleteQuoteRef ? `2px solid ${theme.palette.success.main}` : `2px solid ${theme.palette.warning.main}`
              }}
            >
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <AttachMoney sx={{ color: theme.palette.primary.main }} />
                <Typography variant="h6" fontWeight={700} sx={{ fontFamily: '"Poppins", sans-serif' }}>
                  Quote Config
                </Typography>
              </Box>

              {!hasCompleteQuoteRef ? (
                <Alert severity="warning" sx={{ borderRadius: 2 }}>
                  Esta casa no tiene configuración de quote completa
                </Alert>
              ) : (
                <>
                  <Box mb={2}>
                    <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 600 }}>
                      Precio Base Estimado
                    </Typography>
                    <Typography variant="h5" fontWeight={700} color="primary">
                      ${basePrice.toLocaleString()}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Sin customizaciones del catálogo
                    </Typography>
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  {quoteRefDetails.lot && (
                    <Box mb={2}>
                      <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                        <Landscape fontSize="small" color="action" />
                        <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 600 }}>
                          Lote
                        </Typography>
                      </Box>
                      <Typography variant="body2" fontWeight={600}>
                        {quoteRefDetails.lot.number}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        ${quoteRefDetails.lot.price?.toLocaleString()}
                      </Typography>
                    </Box>
                  )}

                  {quoteRefDetails.model && (
                    <Box mb={2}>
                      <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                        <Business fontSize="small" color="action" />
                        <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 600 }}>
                          Modelo
                        </Typography>
                      </Box>
                      <Typography variant="body2" fontWeight={600}>
                        {quoteRefDetails.model.model}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        ${quoteRefDetails.model.price?.toLocaleString()}
                      </Typography>
                    </Box>
                  )}

                  {quoteRefDetails.facade && (
                    <Box>
                      <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                        <Palette fontSize="small" color="action" />
                        <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 600 }}>
                          Fachada
                        </Typography>
                      </Box>
                      <Typography variant="body2" fontWeight={600}>
                        {quoteRefDetails.facade.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        ${quoteRefDetails.facade.price?.toLocaleString()}
                      </Typography>
                    </Box>
                  )}
                </>
              )}
            </Paper>
          </Grid>

          {/* Renders */}
          {building.exteriorRenders && building.exteriorRenders.length > 0 && (
            <Grid item xs={12}>
              <Paper elevation={3} sx={{ p: 3, borderRadius: 4 }}>
                <Typography variant="h6" fontWeight={700} mb={3} sx={{ fontFamily: '"Poppins", sans-serif' }}>
                  Renders Exteriores
                </Typography>
                <Grid container spacing={2}>
                  {building.exteriorRenders.map((render, idx) => (
                    <Grid item xs={12} sm={6} md={4} lg={3} key={idx}>
                      <Box
                        component="img"
                        src={render.url || render}
                        alt={`Render ${idx + 1}`}
                        sx={{
                          width: '100%',
                          height: 200,
                          objectFit: 'cover',
                          borderRadius: 2,
                          border: `2px solid ${theme.palette.divider}`
                        }}
                      />
                    </Grid>
                  ))}
                </Grid>
              </Paper>
            </Grid>
          )}
        </Grid>
      </Container>
    </Box>
  )
}

export default BuildingDetails