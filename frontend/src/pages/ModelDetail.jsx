import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Box,
  Typography,
  IconButton,
  Divider,
  Grid,
  Paper,
  Chip,
  Skeleton,
  useTheme,
  useMediaQuery
} from '@mui/material'
import {
  ArrowBack,
  ChevronLeft,
  ChevronRight,
  KingBed,
  Bathtub,
  SquareFoot,
  AttachMoney,
  Home,
  Landscape,
  Kitchen,
  Garage,
  Pool,
  Deck
} from '@mui/icons-material'
import api from '../services/api'

const ModelDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  
  const [model, setModel] = useState(null)
  const [loading, setLoading] = useState(true)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [touchStart, setTouchStart] = useState(0)
  const [touchEnd, setTouchEnd] = useState(0)
  const sliderRef = useRef(null)

  useEffect(() => {
    fetchModel()
  }, [id])

  const fetchModel = async () => {
    try {
      const response = await api.get(`/models/${id}`)
      setModel(response.data)
    } catch (error) {
      console.error('Error fetching model:', error)
    } finally {
      setLoading(false)
    }
  }

  const facades = model?.facades?.filter(img => img && img.trim() !== '') || []
  const hasFacades = facades.length > 0
  const images = model?.images?.filter(img => img && img.url && img.url.trim() !== '') || []

  const nextSlide = () => {
    if (hasFacades) {
      setCurrentSlide((prev) => (prev + 1) % facades.length)
    }
  }

  const prevSlide = () => {
    if (hasFacades) {
      setCurrentSlide((prev) => (prev - 1 + facades.length) % facades.length)
    }
  }

  const goToSlide = (index) => {
    setCurrentSlide(index)
  }

  const handleTouchStart = (e) => {
    setTouchStart(e.targetTouches[0].clientX)
  }

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const handleTouchEnd = () => {
    if (touchStart - touchEnd > 75) {
      nextSlide()
    }
    if (touchStart - touchEnd < -75) {
      prevSlide()
    }
  }

  const getIconForFeature = (title) => {
    const lowerTitle = title?.toLowerCase() || ''
    if (lowerTitle.includes('cocina') || lowerTitle.includes('kitchen')) return <Kitchen sx={{ fontSize: 40 }} />
    if (lowerTitle.includes('garaje') || lowerTitle.includes('garage')) return <Garage sx={{ fontSize: 40 }} />
    if (lowerTitle.includes('piscina') || lowerTitle.includes('pool')) return <Pool sx={{ fontSize: 40 }} />
    if (lowerTitle.includes('terraza') || lowerTitle.includes('deck')) return <Deck sx={{ fontSize: 40 }} />
    if (lowerTitle.includes('jardín') || lowerTitle.includes('garden')) return <Landscape sx={{ fontSize: 40 }} />
    return <Home sx={{ fontSize: 40 }} />
  }

  if (loading) {
    return (
      <Box sx={{ maxWidth: 800, mx: 'auto', p: { xs: 0, md: 2 } }}>
        <Skeleton variant="rectangular" height={400} />
        <Box sx={{ p: 2 }}>
          <Skeleton variant="text" height={40} width="60%" />
          <Skeleton variant="text" height={30} width="40%" />
        </Box>
      </Box>
    )
  }

  if (!model) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h5">Modelo no encontrado</Typography>
      </Box>
    )
  }

  return (
    <Box sx={{ 
      maxWidth: 900, 
      mx: 'auto', 
      bgcolor: 'background.default',
      minHeight: '100vh'
    }}>
      {/* Header */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        p: 2,
        position: 'sticky',
        top: 0,
        bgcolor: 'background.paper',
        zIndex: 10,
        borderBottom: 1,
        borderColor: 'divider'
      }}>
        <IconButton onClick={() => navigate('/models')} sx={{ mr: 2 }}>
          <ArrowBack />
        </IconButton>
        <Typography variant="h6" fontWeight="600" noWrap sx={{ flex: 1 }}>
          {model.model}
        </Typography>
        <Chip 
          label={model.status} 
          color={model.status === 'active' ? 'success' : 'default'}
          size="small"
        />
      </Box>

      {/* Image Slider */}
      <Box
        ref={sliderRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        sx={{
          position: 'relative',
          width: '100%',
          height: { xs: 300, sm: 400, md: 450 },
          bgcolor: 'grey.100',
          overflow: 'hidden'
        }}
      >
        {hasFacades ? (
          <>
            <Box
              sx={{
                display: 'flex',
                transition: 'transform 0.4s ease-in-out',
                transform: `translateX(-${currentSlide * 100}%)`,
                height: '100%'
              }}
            >
              {facades.map((img, index) => (
                <Box
                  key={index}
                  sx={{
                    minWidth: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: 'grey.100'
                  }}
                >
                  <Box
                    component="img"
                    src={img}
                    alt={`${model.model} - Vista ${index + 1}`}
                    sx={{
                      maxWidth: '100%',
                      maxHeight: '100%',
                      objectFit: 'contain'
                    }}
                    onError={(e) => {
                      e.target.style.display = 'none'
                    }}
                  />
                </Box>
              ))}
            </Box>

            {/* Navigation Arrows - Desktop */}
            {!isMobile && facades.length > 1 && (
              <>
                <IconButton
                  onClick={prevSlide}
                  sx={{
                    position: 'absolute',
                    left: 8,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    bgcolor: 'rgba(255,255,255,0.9)',
                    '&:hover': { bgcolor: 'white' }
                  }}
                >
                  <ChevronLeft />
                </IconButton>
                <IconButton
                  onClick={nextSlide}
                  sx={{
                    position: 'absolute',
                    right: 8,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    bgcolor: 'rgba(255,255,255,0.9)',
                    '&:hover': { bgcolor: 'white' }
                  }}
                >
                  <ChevronRight />
                </IconButton>
              </>
            )}
          </>
        ) : (
          <Box
            sx={{
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              color: 'grey.400'
            }}
          >
            <Home sx={{ fontSize: 100 }} />
            <Typography variant="body2" color="text.secondary">
              Sin imágenes disponibles
            </Typography>
          </Box>
        )}
      </Box>

      {/* Slide Indicators */}
      {hasFacades && facades.length > 1 && (
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          gap: 1, 
          py: 2,
          bgcolor: 'background.paper'
        }}>
          {facades.map((_, index) => (
            <Box
              key={index}
              onClick={() => goToSlide(index)}
              sx={{
                width: currentSlide === index ? 24 : 8,
                height: 8,
                borderRadius: 4,
                bgcolor: currentSlide === index ? 'text.primary' : 'grey.300',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
            />
          ))}
        </Box>
      )}

      {/* Specifications */}
      <Box sx={{ px: 2, py: 3, bgcolor: 'background.paper' }}>
        <Typography variant="h4" fontWeight="bold" color="primary" gutterBottom>
          ${model.price?.toLocaleString()}
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Precio base
        </Typography>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ mb: 2 }}>
          <Typography variant="h5" fontWeight="bold">
            {model.sqft?.toLocaleString()} sqft
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Área total de construcción
          </Typography>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <KingBed color="action" />
              <Box>
                <Typography variant="h6" fontWeight="bold">
                  {model.bedrooms}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Habitaciones
                </Typography>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Bathtub color="action" />
              <Box>
                <Typography variant="h6" fontWeight="bold">
                  {model.bathrooms}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Baños
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Box>

      {/* Description */}
      {model.description && (
        <Box sx={{ px: 2, py: 3, bgcolor: 'background.paper', mt: 1 }}>
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
            Descripción
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
            {model.description}
          </Typography>
        </Box>
      )}

      {/* Features Grid */}
      {images.length > 0 && (
        <Box sx={{ px: 2, py: 3, bgcolor: 'background.paper', mt: 1 }}>
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{ mb: 2 }}>
            Características
          </Typography>
          <Grid container spacing={2}>
            {images.map((feature, index) => (
              <Grid item xs={6} key={index}>
                <Paper
                  elevation={0}
                  sx={{
                    position: 'relative',
                    height: { xs: 120, sm: 150 },
                    borderRadius: 2,
                    overflow: 'hidden',
                    bgcolor: 'grey.900',
                    display: 'flex',
                    alignItems: 'flex-end',
                    cursor: 'pointer',
                    '&:hover': {
                      '& .feature-overlay': {
                        bgcolor: 'rgba(0,0,0,0.5)'
                      }
                    }
                  }}
                >
                  {feature.url ? (
                    <Box
                      component="img"
                      src={feature.url}
                      alt={feature.title || `Característica ${index + 1}`}
                      sx={{
                        position: 'absolute',
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                      onError={(e) => {
                        e.target.style.display = 'none'
                      }}
                    />
                  ) : (
                    <Box
                      sx={{
                        position: 'absolute',
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'grey.600'
                      }}
                    >
                      {getIconForFeature(feature.title)}
                    </Box>
                  )}
                  <Box
                    className="feature-overlay"
                    sx={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      p: 1.5,
                      background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
                      transition: 'background 0.3s'
                    }}
                  >
                    <Typography
                      variant="body2"
                      fontWeight="600"
                      sx={{ color: 'white' }}
                    >
                      {feature.title || `Característica ${index + 1}`}
                    </Typography>
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* Model Number Footer */}
      <Box sx={{ px: 2, py: 3, textAlign: 'center' }}>
        <Typography variant="caption" color="text.secondary">
          Modelo #{model.modelNumber} • Las imágenes son de referencia
        </Typography>
      </Box>
    </Box>
  )
}

export default ModelDetail
