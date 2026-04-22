// @/Users/oficina/MV-CRM/CustomerService/frontend/apps/6town-houses/src/Components/quote/LotSelector.jsx

import { useState, useEffect } from 'react'
import { 
  Box, Grid, Card, CardContent, CardMedia, Typography, Button, 
  Chip, CircularProgress, Alert 
} from '@mui/material'
import { Home, CheckCircle, Warning } from '@mui/icons-material'
import { useTheme } from '@mui/material/styles'
import buildingService from '@shared/services/buildingService'

const LotSelector = ({ projectId, onSelectLot }) => {
  const theme = useTheme()
  const [buildings, setBuildings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchBuildings()
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

  // ✅ Filtrar solo buildings con quoteRef completo y status activo
  const validBuildings = buildings.filter(building => 
    building.quoteRef?.lot && 
    building.quoteRef?.model && 
    building.quoteRef?.facade &&
    building.status === 'active'
  )

  const invalidBuildings = buildings.filter(building =>
    !building.quoteRef?.lot || 
    !building.quoteRef?.model || 
    !building.quoteRef?.facade
  )

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
        <CircularProgress size={60} />
      </Box>
    )
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>
  }

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

      {/* Warning si hay buildings sin configurar */}
      {invalidBuildings.length > 0 && (
        <Alert severity="warning" icon={<Warning />} sx={{ mb: 3, borderRadius: 3 }}>
          Hay {invalidBuildings.length} casa(s) sin configuración de cotización completa. 
          Por favor contacta con el administrador.
        </Alert>
      )}

      {validBuildings.length === 0 ? (
        <Alert severity="info" sx={{ borderRadius: 3 }}>
          No hay casas disponibles para cotizar en este momento. Por favor contacta con ventas.
        </Alert>
      ) : (
        <Grid container spacing={3}>
          {validBuildings.map((building) => {
            const statusConfig = getStatusConfig(building.status)
            const firstRender = building.exteriorRenders?.[0]?.url || building.exteriorRenders?.[0]

            return (
              <Grid item xs={12} sm={6} md={4} key={building._id}>
                <Card
                  elevation={3}
                  sx={{
                    borderRadius: 4,
                    overflow: 'hidden',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: 6
                    }
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
                      onClick={() => onSelectLot(building)}
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
      )}
    </Box>
  )
}

export default LotSelector