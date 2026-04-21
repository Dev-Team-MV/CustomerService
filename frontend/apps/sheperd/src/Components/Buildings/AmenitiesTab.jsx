// @sheperd/Components/Buildings/AmenitiesTab.jsx

import { useState, useEffect } from 'react'
import { Box, Tabs, Tab, Typography, Button, Grid, Card, CardContent, CardMedia, Chip, Alert, CircularProgress } from '@mui/material'
import { Deck, CloudUpload, FitnessCenter, Pool, Work, MeetingRoom, Park, School } from '@mui/icons-material'
import { useTheme } from '@mui/material/styles'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@shared/context/AuthContext'
import OutdoorAmenitiesModal from '@shared/components/Amenities/OutdoorAmenitiesModal'
import uploadService from '@shared/services/uploadService'
import { AMENITY_FLOORS, getAmenitiesByFloor } from '../../Constants/amenities'

const AmenitiesTab = ({ building, config }) => {
  const theme = useTheme()
  const { t } = useTranslation(['buildings'])
  const { user } = useAuth()
  
  const [selectedFloor, setSelectedFloor] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [amenitySections, setAmenitySections] = useState([])
  const [loading, setLoading] = useState(false)

  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin'
  const projectId = import.meta.env.VITE_PROJECT_ID

  // Iconos para las amenidades
  const amenityIcons = {
    FitnessCenter,
    Pool,
    Deck,
    Work,
    MeetingRoom,
    Park,
    School
  }

  // Inicializar con el primer piso disponible
  useEffect(() => {
    if (AMENITY_FLOORS.length > 0 && !selectedFloor) {
      setSelectedFloor(AMENITY_FLOORS[0])
    }
  }, [])

  // Fetch amenidades del piso seleccionado
  const fetchAmenities = async (floorNumber) => {
    if (!projectId || !floorNumber) return
    setLoading(true)
    try {
      const data = await uploadService.getOutdoorAmenitiesBySlug('sheperd', floorNumber)
      setAmenitySections(data.outdoorAmenitySections || [])
    } catch (error) {
      console.error('Error fetching amenities:', error)
      setAmenitySections([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (selectedFloor) {
      fetchAmenities(selectedFloor)
    }
  }, [selectedFloor, projectId])

  // Obtener amenidades del piso seleccionado
  const floorAmenities = getAmenitiesByFloor(selectedFloor)

  // Calcular estadísticas
  const totalAmenities = floorAmenities.length
  const amenitiesWithImages = floorAmenities.filter(a => {
    const section = amenitySections.find(s => s.key === a.key)
    return section?.images?.length > 0
  }).length

  return (
    <Box>
      {/* Header con título y botón de gestión */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h6" fontWeight={600} fontFamily='"Poppins", sans-serif'>
            {t('buildings:amenities.title', 'Amenidades del Edificio')}
          </Typography>
          {selectedFloor && (
            <Typography variant="caption" color="text.secondary" fontFamily='"Poppins", sans-serif'>
              {amenitiesWithImages} de {totalAmenities} amenidades con imágenes
            </Typography>
          )}
        </Box>
        {isAdmin && (
          <Button
            variant="outlined"
            startIcon={<CloudUpload />}
            onClick={() => setModalOpen(true)}
            disabled={!selectedFloor || floorAmenities.length === 0}
            sx={{
              borderRadius: 2,
              fontWeight: 600,
              fontFamily: '"Poppins", sans-serif',
              textTransform: 'none'
            }}
          >
            {t('buildings:manageAmenities', 'Gestionar Amenidades')}
          </Button>
        )}
      </Box>

      {/* Alerta informativa para múltiples pisos */}
      {AMENITY_FLOORS.length > 1 && (
        <Alert 
          severity="info" 
          sx={{ 
            mb: 3, 
            borderRadius: 2,
            fontFamily: '"Poppins", sans-serif'
          }}
        >
          Este edificio tiene amenidades en <strong>{AMENITY_FLOORS.length} pisos diferentes</strong>: {AMENITY_FLOORS.sort((a, b) => a - b).join(', ')}. 
          Selecciona un piso para ver y gestionar sus amenidades.
        </Alert>
      )}

      {/* Tabs de pisos */}
      <Tabs
        value={selectedFloor}
        onChange={(e, newValue) => setSelectedFloor(newValue)}
        sx={{ 
          mb: 3, 
          borderBottom: 1, 
          borderColor: 'divider',
          '& .MuiTab-root': {
            fontFamily: '"Poppins", sans-serif',
            fontWeight: 600,
            textTransform: 'none',
            fontSize: '0.95rem'
          }
        }}
      >
        {AMENITY_FLOORS.sort((a, b) => a - b).map(floor => (
          <Tab 
            key={floor} 
            value={floor} 
            label={`Piso ${floor}`}
            icon={<Deck />}
            iconPosition="start"
          />
        ))}
      </Tabs>

      {/* Contenido de amenidades */}
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" p={6}>
          <CircularProgress size={40} />
          <Typography ml={2} fontFamily='"Poppins", sans-serif'>
            Cargando amenidades del piso {selectedFloor}...
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {floorAmenities.map((amenity) => {
            const IconComponent = amenityIcons[amenity.icon] || Deck
            const section = amenitySections.find(s => s.key === amenity.key)
            const hasImages = section?.images?.length > 0
            const imageCount = section?.images?.length || 0
            
            return (
              <Grid item xs={12} sm={6} md={4} key={amenity.id}>
                <Card
                  sx={{
                    height: '100%',
                    borderRadius: 3,
                    border: `2px solid ${config.colors.amenity}20`,
                    boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                      borderColor: `${config.colors.amenity}40`
                    }
                  }}
                >
                  {hasImages && (
                    <CardMedia
                      component="img"
                      height="180"
                      image={section.images[0].url}
                      alt={amenity.name}
                      sx={{ 
                        objectFit: 'cover',
                        cursor: 'pointer'
                      }}
                    />
                  )}
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={2} mb={1.5}>
                      <Box
                        sx={{
                          width: 48,
                          height: 48,
                          borderRadius: 2,
                          bgcolor: `${config.colors.amenity}15`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}
                      >
                        <IconComponent sx={{ fontSize: 28, color: config.colors.amenity }} />
                      </Box>
                      <Box flex={1}>
                        <Typography 
                          variant="h6" 
                          fontWeight={600} 
                          fontFamily='"Poppins", sans-serif'
                          sx={{ fontSize: '1rem', lineHeight: 1.3 }}
                        >
                          {amenity.name}
                        </Typography>
                        <Typography 
                          variant="caption" 
                          color="text.secondary"
                          fontFamily='"Poppins", sans-serif'
                        >
                          Piso {amenity.floor}
                        </Typography>
                      </Box>
                    </Box>
                    
                    <Box display="flex" gap={1} flexWrap="wrap">
                      <Chip
                        label={hasImages 
                          ? `${imageCount} ${imageCount === 1 ? 'imagen' : 'imágenes'}` 
                          : 'Sin imágenes'
                        }
                        size="small"
                        sx={{
                          bgcolor: hasImages ? `${config.colors.amenity}10` : '#f5f5f5',
                          color: hasImages ? config.colors.amenity : theme.palette.text.secondary,
                          fontWeight: 600,
                          fontFamily: '"Poppins", sans-serif',
                          border: `1px solid ${hasImages ? config.colors.amenity + '30' : '#e0e0e0'}`
                        }}
                      />
                      {section?.images?.some(img => img.isPublic) && (
                        <Chip
                          label="Público"
                          size="small"
                          color="success"
                          sx={{
                            fontWeight: 600,
                            fontFamily: '"Poppins", sans-serif'
                          }}
                        />
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            )
          })}
          
          {floorAmenities.length === 0 && (
            <Grid item xs={12}>
              <Alert 
                severity="warning" 
                sx={{ 
                  borderRadius: 2,
                  fontFamily: '"Poppins", sans-serif'
                }}
              >
                <Typography variant="body2" fontWeight={600} mb={0.5}>
                  No hay amenidades configuradas para el piso {selectedFloor}
                </Typography>
                <Typography variant="caption">
                  Contacta al administrador del sistema para agregar amenidades a este piso.
                </Typography>
              </Alert>
            </Grid>
          )}
        </Grid>
      )}

      {/* Modal de gestión de amenidades */}
      {isAdmin && (
        <OutdoorAmenitiesModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          projectId={projectId}
          projectSlug="sheperd"
          amenities={floorAmenities}
          amenitySections={amenitySections}
          onUploaded={() => fetchAmenities(selectedFloor)}
          floorNumber={selectedFloor}
          requiresFloor={true}
        />
      )}
    </Box>
  )
}

export default AmenitiesTab