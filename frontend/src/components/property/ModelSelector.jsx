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
  Tune
} from '@mui/icons-material'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import { useProperty } from '../../context/PropertyContext'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'
import ModelCustomizationModal from './ModelCustomizationModal'

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
  
  const [models, setModels] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [imageIndices, setImageIndices] = useState({})
  const [openCustomizationModal, setOpenCustomizationModal] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const scrollContainerRef = useRef(null)

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
        elevation={2} 
        sx={{ 
          p: { xs: 2, md: 3 }, 
          bgcolor: '#fff', 
          borderRadius: 2,
          border: '1px solid #e0e0e0'
        }}
      >
        <Typography variant={isMobile ? "body1" : "subtitle1"} color="text.secondary" textAlign="center" sx={{ py: 2 }}>
          SELECT A LOT TO VIEW MODELS
        </Typography>
      </Paper>
    )
  }

  if (loading) {
    return (
      <Paper elevation={2} sx={{ p: { xs: 2, md: 3 }, bgcolor: '#fff', borderRadius: 2, border: '1px solid #e0e0e0' }}>
        <Box display="flex" justifyContent="center">
          <CircularProgress />
        </Box>
      </Paper>
    )
  }

  if (error) {
    return (
      <Paper elevation={2} sx={{ p: { xs: 2, md: 3 }, bgcolor: '#fff', borderRadius: 2, border: '1px solid #e0e0e0' }}>
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

  // Panel de información del modelo seleccionado
  const ModelInfoPanel = () => (
    <Box sx={{ 
      p: { xs: 2, md: 3 }, 
      bgcolor: 'grey.50', 
      borderRadius: 2,
      border: '2px solid #e0e0e0',
      height: '100%',
      overflowY: 'auto',
      display: 'flex',
      flexDirection: 'column',
      '&::-webkit-scrollbar': {
        width: 6
      },
      '&::-webkit-scrollbar-thumb': {
        bgcolor: 'grey.400',
        borderRadius: 3
      }
    }}>
      <Typography variant="h6" fontWeight="bold" mb={1}>
        {selectedModel.model}
      </Typography>
      <Typography variant="caption" color="text.secondary" display="block" mb={3}>
        Model #{selectedModel.modelNumber}
      </Typography>

      {/* Base Info */}
      <Box mb={3}>
        <Typography variant="caption" fontWeight="bold" color="text.secondary" display="block" mb={1}>
          BASE SPECIFICATIONS
        </Typography>
        <Box display="flex" flexDirection="column" gap={1}>
          <Box display="flex" justifyContent="space-between">
            <Typography variant="body2">🛏️ Bedrooms:</Typography>
            <Typography variant="body2" fontWeight="bold">{selectedModel.bedrooms}</Typography>
          </Box>
          <Box display="flex" justifyContent="space-between">
            <Typography variant="body2">🚿 Bathrooms:</Typography>
            <Typography variant="body2" fontWeight="bold">{selectedModel.bathrooms}</Typography>
          </Box>
          <Box display="flex" justifyContent="space-between">
            <Typography variant="body2">📐 Square Feet:</Typography>
            <Typography variant="body2" fontWeight="bold">{selectedModel.sqft?.toLocaleString()}</Typography>
          </Box>
          <Box display="flex" justifyContent="space-between">
            <Typography variant="body2">🏢 Stories:</Typography>
            <Typography variant="body2" fontWeight="bold">{selectedModel.stories || 1}</Typography>
          </Box>
        </Box>
      </Box>

      {/* Base Price */}
      <Box mb={3} p={2} bgcolor="white" borderRadius={1} border="1px solid #e0e0e0">
        <Typography variant="caption" fontWeight="bold" color="text.secondary">
          BASE PRICE
        </Typography>
        <Typography variant="h4" color="primary.main" fontWeight="bold">
          ${selectedModel.price.toLocaleString()}
        </Typography>
      </Box>

      {/* Available Options Info */}
      {hasPricingOptions && (
        <Box mb={3}>
          <Typography variant="caption" fontWeight="bold" color="text.secondary" display="block" mb={1}>
            AVAILABLE OPTIONS
          </Typography>
          <Box display="flex" flexDirection="column" gap={1}>
            {selectedModel.upgrades?.length > 0 && (
              <Box display="flex" alignItems="center" gap={1}>
                <Chip label="⭐ Upgrade" size="small" color="secondary" variant="outlined" />
                <Typography variant="caption" color="text.secondary">
                  +${(selectedModel.upgrades[0].price / 1000).toFixed(0)}K
                </Typography>
              </Box>
            )}
            {selectedModel.balconies?.length > 0 && (
              <Box display="flex" alignItems="center" gap={1}>
                <Chip label="🌳 Balcony" size="small" color="info" variant="outlined" />
                <Typography variant="caption" color="text.secondary">
                  +${(selectedModel.balconies[0].price / 1000).toFixed(0)}K
                </Typography>
              </Box>
            )}
            {selectedModel.storages?.length > 0 && (
              <Box display="flex" alignItems="center" gap={1}>
                <Chip label="📦 Storage" size="small" color="success" variant="outlined" />
                <Typography variant="caption" color="text.secondary">
                  +${(selectedModel.storages[0].price / 1000).toFixed(0)}K
                </Typography>
              </Box>
            )}
          </Box>
        </Box>
      )}

      {/* Current Selection Summary */}
      {selectedPricingOption && (
        <Box mb={3} p={2} bgcolor="primary.50" borderRadius={1} border="2px solid" borderColor="primary.main">
          <Typography variant="caption" fontWeight="bold" color="primary.main">
            CURRENT CONFIGURATION
          </Typography>
          <Typography variant="body2" fontWeight="bold" mt={0.5}>
            {selectedPricingOption.label}
          </Typography>
          <Typography variant="h5" color="primary.main" fontWeight="bold" mt={0.5}>
            ${selectedPricingOption.price.toLocaleString()}
          </Typography>
        </Box>
      )}

      {/* Action Buttons */}
      <Box mt="auto" display="flex" flexDirection="column" gap={2}>
        {hasPricingOptions && (
          <Button
            variant="contained"
            size="large"
            fullWidth
            startIcon={<Tune />}
            onClick={handleOpenCustomization}
            sx={{
              py: 1.5,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              fontWeight: 'bold',
              boxShadow: 3,
              '&:hover': {
                boxShadow: 6,
                transform: 'translateY(-2px)',
                transition: 'all 0.3s'
              }
            }}
          >
            Customize Your Model
          </Button>
        )}
        
        <Button
          variant="outlined"
          size="medium"
          fullWidth
          startIcon={<Visibility />}
          onClick={(e) => handleViewDetails(e, selectedModel._id)}
          sx={{
            borderColor: '#4a7c59',
            color: '#4a7c59',
            '&:hover': {
              borderColor: '#3d6849',
              bgcolor: 'rgba(74, 124, 89, 0.05)'
            }
          }}
        >
          View Full Details
        </Button>
      </Box>

      {/* Info message when no options */}
      {!hasPricingOptions && (
        <Box 
          sx={{ 
            mt: 2,
            p: 2,
            bgcolor: 'grey.100',
            borderRadius: 1,
            textAlign: 'center'
          }}
        >
          <InfoOutlined sx={{ fontSize: 40, color: 'grey.400', mb: 1 }} />
          <Typography variant="body2" color="text.secondary">
            This model has no additional customization options
          </Typography>
        </Box>
      )}
    </Box>
  )

  return (
    <>
      <Paper 
        elevation={2} 
        sx={{ 
          p: { xs: 2, md: 3 }, 
          bgcolor: '#fff', 
          borderRadius: 2,
          border: '1px solid #e0e0e0'
        }}
      >
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} flexWrap="wrap" gap={1}>
          <Typography variant={isMobile ? "body1" : "subtitle1"} fontWeight="bold">
            02 MODEL SELECTION
          </Typography>
          <Box display="flex" alignItems="center" gap={1}>
            {selectedModel && !isMobile && (
              <Button
                size="small"
                variant="outlined"
                onClick={handleDeselectModel}
                startIcon={<Close />}
                sx={{ 
                  borderColor: '#e0e0e0',
                  color: '#666',
                  '&:hover': { 
                    borderColor: '#4a7c59',
                    color: '#4a7c59'
                  }
                }}
              >
                Clear
              </Button>
            )}
            <Typography variant="caption" color="success.main" fontWeight="bold">
              {models.length} OPTIONS
            </Typography>
          </Box>
        </Box>

        {/* Main Content Area */}
        <Box sx={{ 
          position: 'relative',
          minHeight: isMobile ? 350 : 450,
          overflow: 'hidden'
        }}>
          {/* Desktop/Tablet Layout - Side Panel */}
          {!isMobile && selectedModel && (
            <Box
              sx={{
                position: 'absolute',
                left: 0,
                top: 0,
                bottom: 0,
                width: isTablet ? '35%' : '35%',
                maxWidth: 380,
                transform: 'translateX(0)',
                opacity: 1,
                transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                zIndex: 10
              }}
            >
              <ModelInfoPanel />
            </Box>
          )}

          {/* Models Container */}
          <Box
            sx={{
              position: isMobile ? 'relative' : 'absolute',
              right: 0,
              top: 0,
              bottom: 0,
              left: !isMobile && selectedModel ? (isTablet ? '37%' : '38%') : 0,
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
                  bgcolor: 'grey.400',
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
                  <Card
                    key={model._id}
                    onClick={() => !selectedModel && handleSelectModel(model)}
                    sx={{
                      minWidth: isSelected && !isMobile ? 380 : isMobile ? 260 : 300,
                      maxWidth: isSelected && !isMobile ? 380 : isMobile ? 260 : 300,
                      flexShrink: 0,
                      cursor: selectedModel && !isMobile ? 'default' : 'pointer',
                      bgcolor: isSelected ? '#e8f5e9' : '#fff',
                      border: isSelected ? '3px solid #4a7c59' : '1px solid #e0e0e0',
                      borderRadius: 2,
                      position: 'relative',
                      boxShadow: isSelected ? 4 : 1,
                      transition: 'all 0.3s ease',
                      '&:hover': !selectedModel || isMobile ? {
                        transform: 'translateY(-4px)',
                        boxShadow: 3
                      } : {}
                    }}
                  >
                    {isSelected && (
                      <CheckCircleIcon 
                        color="success" 
                        sx={{ 
                          position: 'absolute',
                          top: 8,
                          right: 8,
                          bgcolor: '#fff',
                          borderRadius: '50%',
                          zIndex: 2,
                          fontSize: isMobile ? 24 : 32
                        }} 
                      />
                    )}

                    <Box
                      sx={{
                        width: '100%',
                        height: isSelected && !isMobile ? 240 : isMobile ? 160 : 180,
                        bgcolor: 'grey.200',
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
                      {!currentImage && <Home sx={{ fontSize: isMobile ? 40 : 60, color: 'grey.400' }} />}
                      
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
                              bgcolor: 'rgba(255,255,255,0.9)',
                              width: isMobile ? 28 : 36,
                              height: isMobile ? 28 : 36,
                              '&:hover': { bgcolor: 'rgba(255,255,255,1)' }
                            }}
                          >
                            <ChevronLeft fontSize={isMobile ? "small" : "medium"} />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={(e) => handleNextImage(e, model._id, modelImages.length)}
                            sx={{
                              position: 'absolute',
                              right: 4,
                              top: '50%',
                              transform: 'translateY(-50%)',
                              bgcolor: 'rgba(255,255,255,0.9)',
                              width: isMobile ? 28 : 36,
                              height: isMobile ? 28 : 36,
                              '&:hover': { bgcolor: 'rgba(255,255,255,1)' }
                            }}
                          >
                            <ChevronRight fontSize={isMobile ? "small" : "medium"} />
                          </IconButton>
                          <Chip
                            label={`${currentImageIndex + 1}/${modelImages.length}`}
                            size="small"
                            sx={{
                              position: 'absolute',
                              bottom: 4,
                              left: 4,
                              bgcolor: 'rgba(0,0,0,0.7)',
                              color: 'white',
                              fontSize: '0.7rem',
                              height: 20
                            }}
                          />
                        </>
                      )}
                    </Box>

                    <CardContent sx={{ p: isMobile ? 1.5 : 2.5 }}>
                      <Box display="flex" justifyContent="space-between" alignItems="start" mb={1}>
                        <Typography variant={isMobile ? "body1" : "h6"} fontWeight="bold" sx={{ flex: 1, minWidth: 0 }}>
                          {model.model}
                        </Typography>
                        <Typography 
                          variant={isSelected && !isMobile ? "h5" : isMobile ? "body1" : "h6"} 
                          sx={{ color: '#4a7c59', fontWeight: 'bold', ml: 1 }}
                        >
                          ${(model.price / 1000).toFixed(0)}K
                        </Typography>
                      </Box>

                      <Typography variant="caption" color="text.secondary" display="block" mb={isMobile ? 1 : 2}>
                        Model #{model.modelNumber}
                      </Typography>

                      <Box display="flex" gap={isMobile ? 1.5 : 2.5} flexWrap="wrap" mb={isMobile ? 1 : 2}>
                        <Box display="flex" alignItems="center" gap={0.5}>
                          <Bed fontSize="small" color="action" />
                          <Typography variant={isMobile ? "caption" : "body2"} fontWeight="500">{model.bedrooms}</Typography>
                        </Box>
                        <Box display="flex" alignItems="center" gap={0.5}>
                          <Bathtub fontSize="small" color="action" />
                          <Typography variant={isMobile ? "caption" : "body2"} fontWeight="500">{model.bathrooms}</Typography>
                        </Box>
                        <Box display="flex" alignItems="center" gap={0.5}>
                          <SquareFoot fontSize="small" color="action" />
                          <Typography variant={isMobile ? "caption" : "body2"} fontWeight="500">{model.sqft?.toLocaleString()}</Typography>
                        </Box>
                      </Box>

                      {model.description && !isMobile && (
                        <Typography 
                          variant="caption" 
                          color="text.secondary" 
                          sx={{ 
                            display: '-webkit-box',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            lineHeight: 1.5
                          }}
                        >
                          {model.description}
                        </Typography>
                      )}

                      {/* Mobile: Botón para ver detalles */}
                      {isMobile && isSelected && (
                        <Button
                          size="small"
                          variant="contained"
                          fullWidth
                          onClick={() => setDrawerOpen(true)}
                          sx={{
                            mt: 1,
                            bgcolor: '#4a7c59',
                            '&:hover': { bgcolor: '#3d6849' }
                          }}
                        >
                          View Details
                        </Button>
                      )}
                    </CardContent>
                  </Card>
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
                    boxShadow: 2,
                    zIndex: 10,
                    '&:hover': { bgcolor: 'grey.100', boxShadow: 3 }
                  }}
                >
                  <ChevronLeft />
                </IconButton>

                <IconButton
                  onClick={() => scrollModels('right')}
                  sx={{
                    position: 'absolute',
                    right: -8,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    bgcolor: '#fff',
                    boxShadow: 2,
                    zIndex: 10,
                    '&:hover': { bgcolor: 'grey.100', boxShadow: 3 }
                  }}
                >
                  <ChevronRight />
                </IconButton>
              </>
            )}
          </Box>
        </Box>

        {models.length === 0 && (
          <Box py={4} textAlign="center">
            <Typography variant="body2" color="text.secondary">
              No models available
            </Typography>
          </Box>
        )}
      </Paper>

      {/* Mobile Drawer para detalles del modelo */}
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
      <Typography variant="h6" fontWeight="bold">
        Model Details
      </Typography>
      <IconButton onClick={() => setDrawerOpen(false)}>
        <Close />
      </IconButton>
    </Box>
    {/* Clear button for mobile */}
    {selectedModel && (
      <Button
        size="small"
        variant="outlined"
        onClick={handleDeselectModel}
        startIcon={<Close />}
        fullWidth
        sx={{
          mb: 2,
          borderColor: '#e0e0e0',
          color: '#666',
          '&:hover': { 
            borderColor: '#4a7c59',
            color: '#4a7c59'
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