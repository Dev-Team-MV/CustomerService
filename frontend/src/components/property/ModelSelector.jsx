import { useState, useEffect, useRef } from 'react'
import {
  Box,
  Paper,
  Typography,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Alert,
  IconButton,
  Button,
  useMediaQuery,
  useTheme,
  Drawer
} from '@mui/material'
import { 
  Home, 
  Bed, 
  Bathtub, 
  SquareFoot, 
  ChevronLeft, 
  ChevronRight,
  Close,
  InfoOutlined,
  Visibility,
  Tune,
  Deck
} from '@mui/icons-material'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import { useProperty } from '../../context/PropertyContext'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'
import ModelCustomizationModal from './ModelCustomizationModal'
import { motion } from 'framer-motion'

const ModelSelector = () => {
  const { 
    selectedModel, 
    selectModel, 
    selectedLot,
    options,
    setOptions,
    getModelPricingInfo,
    selectedPricingOption
  } = useProperty()
  
  const navigate = useNavigate()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'))
  const isLarge = useMediaQuery(theme.breakpoints.between('lg', 'xl'))
  
  const [models, setModels] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [imageIndices, setImageIndices] = useState({})
  const [openCustomizationModal, setOpenCustomizationModal] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const scrollContainerRef = useRef(null)

  // ✅ CONSTANTE PARA IDENTIFICAR EL MODELO 10
  const MODEL_10_ID = "6977c7bbd1f24768968719de";
  const isModel10 = selectedModel?._id === MODEL_10_ID;

  // ✅ LABELS CONDICIONALES PARA BALCONY/ESTUDIO
  const balconyLabels = isModel10
    ? {
        chipLabel: "Estudio",
        label: "Estudio",
        icon: Home
      }
    : {
        chipLabel: "Balcony",
        label: "Balcony",
        icon: Deck
      };

  useEffect(() => {
    fetchModels()
  }, [])

  const fetchModels = async () => {
    try {
      setLoading(true)
      const response = await api.get('/models')
      const activeModels = response.data.filter(m => m.status === 'active')
      setModels(activeModels)
      
      const indices = {}
      activeModels.forEach(model => {
        indices[model._id] = 0
      })
      setImageIndices(indices)
    } catch (error) {
      console.error('Error fetching models:', error)
      setError('Failed to load models')
    } finally {
      setLoading(false)
    }
  }

  const handleSelectModel = (model) => {
    console.log('Selecting model:', model)
    selectModel(model)
    if (isMobile) setDrawerOpen(true)
  }

  const handleDeselectModel = () => {
    selectModel(null)
    setOptions({ upgrade: false, balcony: false, storage: false })
    setDrawerOpen(false)
  }

  const handleOpenCustomization = () => {
    setOpenCustomizationModal(true)
  }

  const handleConfirmCustomization = ({ model, options: selectedOptions, totalPrice }) => {
    setOptions(selectedOptions)
    setOpenCustomizationModal(false)
    
    console.log('✅ Customization confirmed:', {
      model: model.model,
      options: selectedOptions,
      totalPrice
    })
  }

  const handleViewDetails = (e, modelId) => {
    e.stopPropagation()
    navigate(`/models/${modelId}`)
  }

  const handlePrevImage = (e, modelId, imagesLength) => {
    e.stopPropagation()
    setImageIndices(prev => ({
      ...prev,
      [modelId]: prev[modelId] > 0 ? prev[modelId] - 1 : imagesLength - 1
    }))
  }

  const handleNextImage = (e, modelId, imagesLength) => {
    e.stopPropagation()
    setImageIndices(prev => ({
      ...prev,
      [modelId]: prev[modelId] < imagesLength - 1 ? prev[modelId] + 1 : 0
    }))
  }

  const scrollModels = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = isMobile ? 280 : 320
      const currentScroll = scrollContainerRef.current.scrollLeft
      const newScrollLeft = currentScroll + (direction === 'left' ? -scrollAmount : scrollAmount)
      scrollContainerRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      })
    }
  }

  const getAllImages = (model) => {
    const exterior = model.images?.exterior || []
    const interior = model.images?.interior || []
    return [...exterior, ...interior]
  }

  if (!selectedLot) {
    return (
      <Paper 
        elevation={0} 
        sx={{ 
          p: { xs: 2, md: 3 }, 
          bgcolor: '#fff', 
          borderRadius: 4,
          border: '1px solid #e0e0e0',
          boxShadow: '0 4px 20px rgba(0,0,0,0.06)'
        }}
      >
        <Typography 
          variant={isMobile ? "body1" : "subtitle1"} 
          color="text.secondary" 
          textAlign="center" 
          sx={{ 
            py: 2,
            fontFamily: '"Poppins", sans-serif',
            letterSpacing: '1px',
            textTransform: 'uppercase',
            fontSize: '0.85rem',
            fontWeight: 500
          }}
        >
          SELECT A LOT TO VIEW MODELS
        </Typography>
      </Paper>
    )
  }

  if (loading) {
    return (
      <Paper elevation={0} sx={{ p: { xs: 2, md: 3 }, bgcolor: '#fff', borderRadius: 4, border: '1px solid #e0e0e0' }}>
        <Box display="flex" justifyContent="center">
          <CircularProgress sx={{ color: '#333F1F' }} />
        </Box>
      </Paper>
    )
  }

  if (error) {
    return (
      <Paper elevation={0} sx={{ p: { xs: 2, md: 3 }, bgcolor: '#fff', borderRadius: 4, border: '1px solid #e0e0e0' }}>
        <Alert severity="error">{error}</Alert>
      </Paper>
    )
  }

  const pricingInfo = selectedModel ? getModelPricingInfo() : null
  const hasPricingOptions = (
    (pricingInfo?.hasBalcony && selectedModel?.balconies?.length > 0) ||
    (pricingInfo?.hasUpgrade && selectedModel?.upgrades?.length > 0) ||
    (pricingInfo?.hasStorage && selectedModel?.storages?.length > 0)
  )

  // ✅ PANEL DE INFORMACIÓN DEL MODELO SELECCIONADO - Estilo brandbook
  const ModelInfoPanel = () => (
    <Box sx={{ 
      p: { xs: 2, md: 2.5 }, 
      bgcolor: '#fafafa', 
      borderRadius: 3,
      border: '1px solid #e0e0e0',
      height: '100%',
      overflowY: 'auto',
      display: 'flex',
      flexDirection: 'column',
      boxShadow: '0 4px 12px rgba(0,0,0,0.04)',
      '&::-webkit-scrollbar': {
        width: 6
      },
      '&::-webkit-scrollbar-thumb': {
        bgcolor: 'rgba(51, 63, 31, 0.2)',
        borderRadius: 3
      }
    }}>
      {/* ✅ HEADER - Título + Badge */}
      <Box sx={{ mb: 2.5 }}>
        <Box display="flex" alignItems="center" gap={1} mb={0.5}>
          <Typography 
            variant={isLarge ? "subtitle1" : "h6"} 
            fontWeight={700}
            sx={{
              color: '#333F1F',
              fontFamily: '"Poppins", sans-serif',
              letterSpacing: '0.5px'
            }}
          >
            {selectedModel.model}
          </Typography>
          {isModel10 && (
            <Chip 
              label="Special" 
              size="small" 
              sx={{ 
                height: 20,
                fontSize: '0.65rem',
                bgcolor: '#E5863C', 
                color: 'white',
                fontWeight: 600,
                fontFamily: '"Poppins", sans-serif',
                letterSpacing: '0.5px',
                textTransform: 'uppercase'
              }} 
            />
          )}
        </Box>
        <Typography 
          variant="caption" 
          sx={{ 
            color: '#706f6f',
            fontFamily: '"Poppins", sans-serif',
            fontSize: '0.75rem',
            display: 'block'
          }}
        >
          Model #{selectedModel.modelNumber}
        </Typography>
      </Box>

      {/* ✅ LÍNEA DECORATIVA */}
      <Box
        sx={{
          width: '100%',
          height: 2,
          bgcolor: 'rgba(140, 165, 81, 0.2)',
          mb: 2.5
        }}
      />

      {/* ✅ BASE SPECIFICATIONS - Grid minimalista */}
      <Box mb={2.5}>
        <Typography 
          variant="caption" 
          fontWeight={700}
          sx={{
            color: '#706f6f',
            fontFamily: '"Poppins", sans-serif',
            letterSpacing: '1.5px',
            textTransform: 'uppercase',
            fontSize: '0.65rem',
            display: 'block',
            mb: 1.5
          }}
        >
          Base Specifications
        </Typography>
        <Box 
          sx={{ 
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 0,
            borderTop: '1px solid #e0e0e0',
            borderBottom: '1px solid #e0e0e0',
            py: 1.5,
            bgcolor: 'white',
            borderRadius: 2
          }}
        >
          <Box sx={{ textAlign: 'center', borderRight: '1px solid #e0e0e0', px: 0.5 }}>
            <Typography 
              variant="caption" 
              sx={{ 
                color: '#999999', 
                fontSize: '0.6rem',
                fontWeight: 500,
                textTransform: 'uppercase',
                letterSpacing: '1px',
                fontFamily: '"Poppins", sans-serif',
                display: 'block',
                mb: 0.5
              }}
            >
              Beds
            </Typography>
            <Typography 
              variant="h6" 
              sx={{ 
                color: '#333F1F', 
                fontSize: '1.1rem',
                fontWeight: 700,
                fontFamily: '"Poppins", sans-serif'
              }}
            >
              {selectedModel.bedrooms}
            </Typography>
          </Box>

          <Box sx={{ textAlign: 'center', borderRight: '1px solid #e0e0e0', px: 0.5 }}>
            <Typography 
              variant="caption" 
              sx={{ 
                color: '#999999', 
                fontSize: '0.6rem',
                fontWeight: 500,
                textTransform: 'uppercase',
                letterSpacing: '1px',
                fontFamily: '"Poppins", sans-serif',
                display: 'block',
                mb: 0.5
              }}
            >
              Baths
            </Typography>
            <Typography 
              variant="h6" 
              sx={{ 
                color: '#333F1F', 
                fontSize: '1.1rem',
                fontWeight: 700,
                fontFamily: '"Poppins", sans-serif'
              }}
            >
              {selectedModel.bathrooms}
            </Typography>
          </Box>

          <Box sx={{ textAlign: 'center', borderRight: '1px solid #e0e0e0', px: 0.5 }}>
            <Typography 
              variant="caption" 
              sx={{ 
                color: '#999999', 
                fontSize: '0.6rem',
                fontWeight: 500,
                textTransform: 'uppercase',
                letterSpacing: '1px',
                fontFamily: '"Poppins", sans-serif',
                display: 'block',
                mb: 0.5
              }}
            >
              SQFT
            </Typography>
            <Typography 
              variant="h6" 
              sx={{ 
                color: '#333F1F', 
                fontSize: '1.1rem',
                fontWeight: 700,
                fontFamily: '"Poppins", sans-serif'
              }}
            >
              {selectedModel.sqft?.toLocaleString()}
            </Typography>
          </Box>

          <Box sx={{ textAlign: 'center', px: 0.5 }}>
            <Typography 
              variant="caption" 
              sx={{ 
                color: '#999999', 
                fontSize: '0.6rem',
                fontWeight: 500,
                textTransform: 'uppercase',
                letterSpacing: '1px',
                fontFamily: '"Poppins", sans-serif',
                display: 'block',
                mb: 0.5
              }}
            >
              Stories
            </Typography>
            <Typography 
              variant="h6" 
              sx={{ 
                color: '#333F1F', 
                fontSize: '1.1rem',
                fontWeight: 700,
                fontFamily: '"Poppins", sans-serif'
              }}
            >
              {selectedModel.stories || 1}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* ✅ BASE PRICE - Minimalista */}
      <Box 
        mb={2.5} 
        p={2} 
        sx={{
          bgcolor: 'white',
          borderRadius: 2,
          border: '2px solid #e0e0e0',
          textAlign: 'center'
        }}
      >
        <Typography 
          variant="caption" 
          fontWeight={700}
          sx={{
            color: '#706f6f',
            fontFamily: '"Poppins", sans-serif',
            letterSpacing: '1.5px',
            textTransform: 'uppercase',
            fontSize: '0.65rem',
            display: 'block',
            mb: 1
          }}
        >
          Base Price
        </Typography>
        <Typography 
          variant={isLarge ? "h5" : "h4"} 
          sx={{
            color: '#333F1F',
            fontWeight: 700,
            fontFamily: '"Poppins", sans-serif',
            letterSpacing: '-0.5px'
          }}
        >
          ${selectedModel.price.toLocaleString()}
        </Typography>
      </Box>

      {/* ✅ AVAILABLE OPTIONS - Chips minimalistas */}
      {hasPricingOptions && (
        <Box mb={2.5}>
          <Typography 
            variant="caption" 
            fontWeight={700}
            sx={{
              color: '#706f6f',
              fontFamily: '"Poppins", sans-serif',
              letterSpacing: '1.5px',
              textTransform: 'uppercase',
              fontSize: '0.65rem',
              display: 'block',
              mb: 1.5
            }}
          >
            Available Options
          </Typography>
          <Box display="flex" flexDirection="column" gap={1}>
            {selectedModel.upgrades?.length > 0 && (
              <Box 
                display="flex" 
                alignItems="center" 
                justifyContent="space-between"
                sx={{
                  p: 1.5,
                  bgcolor: 'white',
                  borderRadius: 2,
                  border: '1px solid #e0e0e0'
                }}
              >
                <Chip 
                  label="Upgrade" 
                  size="small" 
                  sx={{ 
                    height: 24,
                    bgcolor: 'transparent',
                    border: '1.5px solid #9c27b0',
                    color: '#9c27b0',
                    fontWeight: 600,
                    fontSize: '0.7rem',
                    fontFamily: '"Poppins", sans-serif',
                    letterSpacing: '0.5px'
                  }} 
                />
                <Typography 
                  variant="caption" 
                  sx={{ 
                    color: '#333F1F',
                    fontWeight: 700,
                    fontFamily: '"Poppins", sans-serif',
                    fontSize: '0.85rem'
                  }}
                >
                  +${(selectedModel.upgrades[0].price / 1000).toFixed(0)}K
                </Typography>
              </Box>
            )}
            {selectedModel.balconies?.length > 0 && (
              <Box 
                display="flex" 
                alignItems="center" 
                justifyContent="space-between"
                sx={{
                  p: 1.5,
                  bgcolor: 'white',
                  borderRadius: 2,
                  border: '1px solid #e0e0e0'
                }}
              >
                <Chip 
                  label={balconyLabels.chipLabel} 
                  size="small" 
                  sx={{ 
                    height: 24,
                    bgcolor: 'transparent',
                    border: '1.5px solid #8CA551',
                    color: '#8CA551',
                    fontWeight: 600,
                    fontSize: '0.7rem',
                    fontFamily: '"Poppins", sans-serif',
                    letterSpacing: '0.5px'
                  }} 
                />
                <Typography 
                  variant="caption" 
                  sx={{ 
                    color: '#333F1F',
                    fontWeight: 700,
                    fontFamily: '"Poppins", sans-serif',
                    fontSize: '0.85rem'
                  }}
                >
                  +${(selectedModel.balconies[0].price / 1000).toFixed(0)}K
                </Typography>
              </Box>
            )}
            {selectedModel.storages?.length > 0 && (
              <Box 
                display="flex" 
                alignItems="center" 
                justifyContent="space-between"
                sx={{
                  p: 1.5,
                  bgcolor: 'white',
                  borderRadius: 2,
                  border: '1px solid #e0e0e0'
                }}
              >
                <Chip 
                  label="Storage" 
                  size="small" 
                  sx={{ 
                    height: 24,
                    bgcolor: 'transparent',
                    border: '1.5px solid #706f6f',
                    color: '#706f6f',
                    fontWeight: 600,
                    fontSize: '0.7rem',
                    fontFamily: '"Poppins", sans-serif',
                    letterSpacing: '0.5px'
                  }} 
                />
                <Typography 
                  variant="caption" 
                  sx={{ 
                    color: '#333F1F',
                    fontWeight: 700,
                    fontFamily: '"Poppins", sans-serif',
                    fontSize: '0.85rem'
                  }}
                >
                  +${(selectedModel.storages[0].price / 1000).toFixed(0)}K
                </Typography>
              </Box>
            )}
          </Box>
        </Box>
      )}

      {/* ✅ CURRENT CONFIGURATION - Destacado */}
      {selectedPricingOption && (
        <Box 
          mb={2.5} 
          p={2.5} 
          sx={{
            bgcolor: 'rgba(140, 165, 81, 0.08)',
            borderRadius: 2,
            border: '2px solid #8CA551',
            textAlign: 'center'
          }}
        >
          <Typography 
            variant="caption" 
            fontWeight={700}
            sx={{
              color: '#8CA551',
              fontFamily: '"Poppins", sans-serif',
              letterSpacing: '1.5px',
              textTransform: 'uppercase',
              fontSize: '0.65rem',
              display: 'block',
              mb: 1
            }}
          >
            Current Configuration
          </Typography>
          <Typography 
            variant="body2" 
            fontWeight={600}
            sx={{
              color: '#333F1F',
              fontFamily: '"Poppins", sans-serif',
              mb: 1
            }}
          >
            {selectedPricingOption.label}
          </Typography>
          <Typography 
            variant={isLarge ? "h6" : "h5"} 
            sx={{
              color: '#8CA551',
              fontWeight: 700,
              fontFamily: '"Poppins", sans-serif',
              letterSpacing: '-0.5px'
            }}
          >
            ${selectedPricingOption.price.toLocaleString()}
          </Typography>
        </Box>
      )}

      {/* ✅ ACTION BUTTONS - Brandbook */}
      <Box mt="auto" display="flex" flexDirection="column" gap={1.5}>
        {hasPricingOptions && (
          <Button
            variant="contained"
            size={isLarge ? "medium" : "large"}
            fullWidth
            startIcon={<Tune />}
            onClick={handleOpenCustomization}
            sx={{
              py: isLarge ? 1 : 1.5,
              fontSize: isLarge ? '0.875rem' : '1rem',
              borderRadius: 2,
              bgcolor: '#333F1F',
              color: 'white',
              fontWeight: 600,
              textTransform: 'none',
              letterSpacing: '1px',
              fontFamily: '"Poppins", sans-serif',
              boxShadow: '0 4px 12px rgba(51, 63, 31, 0.25)',
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: '-100%',
                width: '100%',
                height: '100%',
                bgcolor: '#8CA551',
                transition: 'left 0.4s ease',
                zIndex: 0
              },
              '&:hover': {
                bgcolor: '#333F1F',
                boxShadow: '0 8px 20px rgba(51, 63, 31, 0.35)',
                transform: 'translateY(-2px)',
                '&::before': {
                  left: 0
                }
              },
              '& .MuiButton-startIcon, & span': {
                position: 'relative',
                zIndex: 1
              }
            }}
          >
            Customize
          </Button>
        )}
        
        <Button
          variant="outlined"
          size="small"
          fullWidth
          startIcon={<Visibility />}
          onClick={(e) => handleViewDetails(e, selectedModel._id)}
          sx={{
            borderRadius: 2,
            borderColor: '#e0e0e0',
            borderWidth: '2px',
            color: '#706f6f',
            fontSize: '0.75rem',
            fontWeight: 600,
            textTransform: 'none',
            letterSpacing: '1px',
            fontFamily: '"Poppins", sans-serif',
            py: 1,
            '&:hover': {
              borderColor: '#333F1F',
              borderWidth: '2px',
              bgcolor: 'rgba(51, 63, 31, 0.05)',
              color: '#333F1F'
            }
          }}
        >
          Full Details
        </Button>
      </Box>

      {/* ✅ INFO MESSAGE - Sin opciones */}
      {!hasPricingOptions && (
        <Box 
          sx={{ 
            mt: 2,
            p: 2,
            bgcolor: '#f5f5f5',
            borderRadius: 2,
            border: '1px solid #e0e0e0',
            textAlign: 'center'
          }}
        >
          <InfoOutlined sx={{ fontSize: 28, color: '#999', mb: 0.5 }} />
          <Typography 
            variant="caption" 
            sx={{ 
              color: '#706f6f',
              fontFamily: '"Poppins", sans-serif',
              fontSize: '0.75rem'
            }}
          >
            {isModel10 
              ? "Comedor and Estudio options in customization"
              : "No additional options available"
            }
          </Typography>
        </Box>
      )}
    </Box>
  )

  return (
    <>
      <Paper 
        elevation={0} 
        sx={{ 
          p: { xs: 2, md: 3 }, 
          bgcolor: '#fff', 
          borderRadius: 4,
          border: '1px solid #e0e0e0',
          boxShadow: '0 4px 20px rgba(0,0,0,0.06)'
        }}
      >
        {/* ✅ HEADER - Brandbook */}
        <Box 
          display="flex" 
          justifyContent="space-between" 
          alignItems="center" 
          mb={3} 
          flexWrap="wrap" 
          gap={1}
          sx={{
            pb: 2,
            borderBottom: '2px solid rgba(140, 165, 81, 0.2)'
          }}
        >
          <Typography 
            variant={isMobile ? "body1" : "subtitle1"} 
            fontWeight={700}
            sx={{
              color: '#333F1F',
              fontFamily: '"Poppins", sans-serif',
              letterSpacing: '1.5px',
              textTransform: 'uppercase',
              fontSize: isMobile ? '0.85rem' : '0.95rem'
            }}
          >
            02 Model Selection
          </Typography>
          <Box display="flex" alignItems="center" gap={1}>
            {selectedModel && !isMobile && (
              <Button
                size="small"
                variant="outlined"
                onClick={handleDeselectModel}
                startIcon={<Close />}
                sx={{ 
                  borderRadius: 2,
                  borderColor: '#e0e0e0',
                  borderWidth: '2px',
                  color: '#706f6f',
                  fontWeight: 600,
                  textTransform: 'none',
                  fontFamily: '"Poppins", sans-serif',
                  fontSize: '0.75rem',
                  '&:hover': { 
                    borderColor: '#333F1F',
                    borderWidth: '2px',
                    color: '#333F1F',
                    bgcolor: 'rgba(51, 63, 31, 0.05)'
                  }
                }}
              >
                Clear
              </Button>
            )}
            <Chip 
              label={`${models.length} OPTIONS`}
              size="small"
              sx={{
                bgcolor: 'rgba(140, 165, 81, 0.12)',
                color: '#8CA551',
                fontWeight: 700,
                fontSize: '0.65rem',
                fontFamily: '"Poppins", sans-serif',
                letterSpacing: '1px',
                height: 26,
                px: 1
              }}
            />
          </Box>
        </Box>

        {/* Main Content Area */}
        <Box sx={{ 
          position: 'relative',
          minHeight: isMobile ? 400 : 500,
          overflow: 'hidden'
        }}>
          {/* Desktop/Tablet Layout - Side Panel */}
          {!isMobile && selectedModel && (
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
            >
              <Box
                sx={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  bottom: 0,
                  width: isTablet ? '40%' : isLarge ? '36%' : '32%',
                  maxWidth: isTablet ? 320 : isLarge ? 380 : 340,
                  zIndex: 10
                }}
              >
                <ModelInfoPanel />
              </Box>
            </motion.div>
          )}

          {/* Models Container */}
          <Box
            sx={{
              position: isMobile ? 'relative' : 'absolute',
              right: 0,
              top: 0,
              bottom: 0,
              left: !isMobile && selectedModel 
                ? (isTablet ? '34%' : isLarge ? '38%' : '34%')
                : 0,
              transition: 'left 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: !isMobile && selectedModel ? 'center' : 'flex-start'
            }}
          >
            <Box
              ref={scrollContainerRef}
              sx={{
                display: 'flex',
                gap: 2,
                overflowX: isMobile || !selectedModel ? 'auto' : 'visible',
                overflowY: 'hidden',
                height: '100%',
                px: 1,
                py: 2,
                alignItems: 'center',
                scrollbarWidth: isMobile ? 'thin' : 'none',
                justifyContent: !isMobile && selectedModel ? 'center' : 'flex-start',
                width: '100%',
                '&::-webkit-scrollbar': {
                  display: isMobile ? 'block' : 'none',
                  height: 6
                },
                '&::-webkit-scrollbar-thumb': {
                  bgcolor: 'rgba(51, 63, 31, 0.2)',
                  borderRadius: 3
                }
              }}
            >
              {models.map((model) => {
                const isSelected = selectedModel?._id === model._id
                const modelImages = getAllImages(model)
                const currentImageIndex = imageIndices[model._id] || 0
                const currentImage = modelImages[currentImageIndex]
                
                if (!isMobile && selectedModel && !isSelected) return null
                
                return (
                  <motion.div
                    key={model._id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4 }}
                    whileHover={!selectedModel || isMobile ? { scale: 1.02 } : {}}
                  >
                    <Card
                      onClick={() => !selectedModel && handleSelectModel(model)}
                      sx={{
                        minWidth: { xs: 260, md: 300, lg: 400 },
                        maxWidth: isSelected && !isMobile 
                          ? (isLarge ? 420 : 350)
                          : isMobile ? 260 : 300,
                        flexShrink: 0,
                        cursor: selectedModel && !isMobile ? 'default' : 'pointer',
                        bgcolor: isSelected ? 'rgba(140, 165, 81, 0.08)' : '#fff',
                        border: isSelected ? '2px solid #8CA551' : '1px solid #e0e0e0',
                        borderRadius: 3,
                        position: 'relative',
                        boxShadow: isSelected ? '0 8px 24px rgba(140, 165, 81, 0.15)' : '0 4px 12px rgba(0,0,0,0.04)',
                        transition: 'all 0.3s ease',
                        '&:hover': !selectedModel || isMobile ? {
                          transform: 'translateY(-4px)',
                          boxShadow: '0 12px 32px rgba(0,0,0,0.12)',
                          borderColor: '#8CA551'
                        } : {}
                      }}
                    >
                      {isSelected && (
                        <CheckCircleIcon 
                          sx={{ 
                            position: 'absolute',
                            top: 8,
                            right: 8,
                            bgcolor: 'white',
                            borderRadius: '50%',
                            zIndex: 2,
                            fontSize: isMobile ? 24 : 32,
                            color: '#8CA551'
                          }} 
                        />
                      )}

                      <Box
                        sx={{
                          width: '100%',
                          height: { xs: 160, md: 240, lg: 250 },
                          bgcolor: '#f5f5f5',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundImage: currentImage ? `url(${currentImage})` : 'none',
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                          position: 'relative',
                          transition: 'height 0.3s ease'
                        }}
                      >
                        {!currentImage && <Home sx={{ fontSize: isMobile ? 40 : 60, color: '#e0e0e0' }} />}
                        
                        {modelImages.length > 1 && (
                          <>
                            <IconButton
                              size="small"
                              onClick={(e) => handlePrevImage(e, model._id, modelImages.length)}
                              sx={{
                                position: 'absolute',
                                left: 4,
                                top: '50%',
                                transform: 'translateY(-50%)',
                                bgcolor: 'rgba(255,255,255,0.95)',
                                width: isMobile ? 28 : 36,
                                height: isMobile ? 28 : 36,
                                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                                '&:hover': { 
                                  bgcolor: 'white',
                                  boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                                }
                              }}
                            >
                              <ChevronLeft fontSize={isMobile ? "small" : "medium"} sx={{ color: '#333F1F' }} />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={(e) => handleNextImage(e, model._id, modelImages.length)}
                              sx={{
                                position: 'absolute',
                                right: 4,
                                top: '50%',
                                transform: 'translateY(-50%)',
                                bgcolor: 'rgba(255,255,255,0.95)',
                                width: isMobile ? 28 : 36,
                                height: isMobile ? 28 : 36,
                                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                                '&:hover': { 
                                  bgcolor: 'white',
                                  boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                                }
                              }}
                            >
                              <ChevronRight fontSize={isMobile ? "small" : "medium"} sx={{ color: '#333F1F' }} />
                            </IconButton>
                            <Chip
                              label={`${currentImageIndex + 1}/${modelImages.length}`}
                              size="small"
                              sx={{
                                position: 'absolute',
                                bottom: 4,
                                left: 4,
                                bgcolor: 'rgba(51, 63, 31, 0.9)',
                                color: 'white',
                                fontSize: '0.65rem',
                                height: 20,
                                fontFamily: '"Poppins", sans-serif',
                                fontWeight: 600
                              }}
                            />
                          </>
                        )}
                      </Box>

                      <CardContent sx={{ p: isMobile ? 1.5 : 2.5 }}>
                        <Box display="flex" justifyContent="space-between" alignItems="start" mb={1}>
                          <Typography 
                            variant={isMobile ? "body1" : "h6"} 
                            fontWeight={700}
                            sx={{ 
                              flex: 1, 
                              minWidth: 0,
                              color: '#333F1F',
                              fontFamily: '"Poppins", sans-serif',
                              letterSpacing: '0.5px'
                            }}
                          >
                            {model.model}
                          </Typography>
                          <Typography 
                            variant={isSelected && !isMobile ? "h5" : isMobile ? "body1" : "h6"} 
                            sx={{ 
                              color: '#8CA551',
                              fontWeight: 700,
                              ml: 1,
                              fontFamily: '"Poppins", sans-serif'
                            }}
                          >
                            ${(model.price / 1000).toFixed(0)}K
                          </Typography>
                        </Box>

                        <Typography 
                          variant="caption" 
                          display="block" 
                          mb={isMobile ? 1 : 2}
                          sx={{
                            color: '#706f6f',
                            fontFamily: '"Poppins", sans-serif',
                            fontSize: '0.75rem'
                          }}
                        >
                          Model #{model.modelNumber}
                        </Typography>

                        {/* ✅ SPECS - Grid brandbook */}
                        <Box 
                          display="grid"
                          gridTemplateColumns="repeat(3, 1fr)"
                          gap={0}
                          mb={isMobile ? 1 : 2}
                          sx={{
                            borderTop: '1px solid #e0e0e0',
                            borderBottom: '1px solid #e0e0e0',
                            py: 1
                          }}
                        >
                          <Box sx={{ textAlign: 'center', borderRight: '1px solid #e0e0e0' }}>
                            <Bed fontSize="small" sx={{ color: '#999', mb: 0.3 }} />
                            <Typography 
                              variant={isMobile ? "caption" : "body2"} 
                              fontWeight={600}
                              sx={{ 
                                color: '#333F1F',
                                fontFamily: '"Poppins", sans-serif'
                              }}
                            >
                              {model.bedrooms}
                            </Typography>
                          </Box>
                          <Box sx={{ textAlign: 'center', borderRight: '1px solid #e0e0e0' }}>
                            <Bathtub fontSize="small" sx={{ color: '#999', mb: 0.3 }} />
                            <Typography 
                              variant={isMobile ? "caption" : "body2"} 
                              fontWeight={600}
                              sx={{ 
                                color: '#333F1F',
                                fontFamily: '"Poppins", sans-serif'
                              }}
                            >
                              {model.bathrooms}
                            </Typography>
                          </Box>
                          <Box sx={{ textAlign: 'center' }}>
                            <SquareFoot fontSize="small" sx={{ color: '#999', mb: 0.3 }} />
                            <Typography 
                              variant={isMobile ? "caption" : "body2"} 
                              fontWeight={600}
                              sx={{ 
                                color: '#333F1F',
                                fontFamily: '"Poppins", sans-serif'
                              }}
                            >
                              {model.sqft?.toLocaleString()}
                            </Typography>
                          </Box>
                        </Box>

                        {model.description && !isMobile && (
                          <Typography 
                            variant="caption" 
                            sx={{ 
                              display: '-webkit-box',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              lineHeight: 1.5,
                              color: '#706f6f',
                              fontFamily: '"Poppins", sans-serif',
                              fontSize: '0.75rem'
                            }}
                          >
                            {model.description}
                          </Typography>
                        )}

                        {isMobile && isSelected && (
                          <Button
                            size="small"
                            variant="contained"
                            fullWidth
                            onClick={() => setDrawerOpen(true)}
                            sx={{
                              mt: 1,
                              bgcolor: '#333F1F',
                              borderRadius: 2,
                              fontWeight: 600,
                              textTransform: 'none',
                              fontFamily: '"Poppins", sans-serif',
                              letterSpacing: '1px',
                              '&:hover': { bgcolor: '#4a5d3a' }
                            }}
                          >
                            View Details
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })}
            </Box>

            {/* Scroll Buttons - Solo desktop */}
            {!isMobile && !selectedModel && models.length > 3 && (
              <>
                <IconButton
                  onClick={() => scrollModels('left')}
                  sx={{
                    position: 'absolute',
                    left: -8,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    bgcolor: '#fff',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    zIndex: 10,
                    width: 40,
                    height: 40,
                    '&:hover': { 
                      bgcolor: '#f5f5f5',
                      boxShadow: '0 6px 16px rgba(0,0,0,0.15)',
                      '& .MuiSvgIcon-root': {
                        color: '#333F1F'
                      }
                    }
                  }}
                >
                  <ChevronLeft sx={{ color: '#706f6f' }} />
                </IconButton>

                <IconButton
                  onClick={() => scrollModels('right')}
                  sx={{
                    position: 'absolute',
                    right: -8,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    bgcolor: '#fff',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    zIndex: 10,
                    width: 40,
                    height: 40,
                    '&:hover': { 
                      bgcolor: '#f5f5f5',
                      boxShadow: '0 6px 16px rgba(0,0,0,0.15)',
                      '& .MuiSvgIcon-root': {
                        color: '#333F1F'
                      }
                    }
                  }}
                >
                  <ChevronRight sx={{ color: '#706f6f' }} />
                </IconButton>
              </>
            )}
          </Box>
        </Box>

        {models.length === 0 && (
          <Box py={4} textAlign="center">
            <Typography 
              variant="body2" 
              sx={{
                color: '#706f6f',
                fontFamily: '"Poppins", sans-serif'
              }}
            >
              No models available
            </Typography>
          </Box>
        )}
      </Paper>

      {/* ✅ Mobile Drawer para detalles del modelo */}
      <Drawer
        anchor="bottom"
        open={isMobile && drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{
          sx: {
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            maxHeight: '80vh'
          }
        }}
      >
        <Box sx={{ p: 2 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Box display="flex" alignItems="center" gap={1}>
              <Typography 
                variant="h6" 
                fontWeight={700}
                sx={{
                  color: '#333F1F',
                  fontFamily: '"Poppins", sans-serif'
                }}
              >
                Model Details
              </Typography>
              {isModel10 && (
                <Chip 
                  label="Special" 
                  size="small" 
                  sx={{ 
                    height: 20,
                    fontSize: '0.65rem',
                    bgcolor: '#E5863C', 
                    color: 'white',
                    fontWeight: 600,
                    fontFamily: '"Poppins", sans-serif'
                  }} 
                />
              )}
            </Box>
            <IconButton onClick={() => setDrawerOpen(false)}>
              <Close sx={{ color: '#706f6f' }} />
            </IconButton>
          </Box>
          {selectedModel && (
            <Button
              size="small"
              variant="outlined"
              onClick={handleDeselectModel}
              startIcon={<Close />}
              fullWidth
              sx={{
                mb: 2,
                borderRadius: 2,
                borderColor: '#e0e0e0',
                borderWidth: '2px',
                color: '#706f6f',
                fontWeight: 600,
                textTransform: 'none',
                fontFamily: '"Poppins", sans-serif',
                '&:hover': { 
                  borderColor: '#333F1F',
                  borderWidth: '2px',
                  color: '#333F1F',
                  bgcolor: 'rgba(51, 63, 31, 0.05)'
                }
              }}
            >
              Clear Selection
            </Button>
          )}
          {selectedModel && <ModelInfoPanel />}
        </Box>
      </Drawer>

      {/* Customization Modal */}
      <ModelCustomizationModal
        open={openCustomizationModal}
        model={selectedModel}
        initialOptions={options}
        onClose={() => setOpenCustomizationModal(false)}
        onConfirm={handleConfirmCustomization}
      />
    </>
  )
}

export default ModelSelector