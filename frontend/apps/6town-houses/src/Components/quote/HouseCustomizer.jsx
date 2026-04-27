import { useState, useMemo, useEffect } from 'react'
import quoteService from '@shared/services/quoteService'
import { calculateEstimatedPrice } from '@shared/utils/pricingEngine'
import {
  Box, Paper, Typography, Button, FormControl, FormLabel,
  RadioGroup, FormControlLabel, Radio, Checkbox, FormGroup,
  Alert, Grid, Divider, CircularProgress, Chip
} from '@mui/material'
import { Home, ArrowBack, ArrowForward, Calculate, Image as ImageIcon, ViewInAr, Map, CheckCircle } from '@mui/icons-material'
import { useTheme } from '@mui/material/styles'

const HouseCustomizer = ({ catalogConfig, selectedBuilding, modelFloors = [], onComplete, onBack, onOptionsChange }) => {
  const theme = useTheme()
  const [currentStep, setCurrentStep] = useState(0)
  const [selectedOptions, setSelectedOptions] = useState({})
  const [mediaByFloor, setMediaByFloor] = useState({})
  const [loadingPreview, setLoadingPreview] = useState(false)
  const [selectedMediaType, setSelectedMediaType] = useState('renders')
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
 
  const levels = catalogConfig?.structure?.levels || {}
  const levelKeys = Object.keys(levels)
  const currentLevelKey = levelKeys[currentStep]
  const currentLevel = levels[currentLevelKey]
  const isLastStep = currentStep === levelKeys.length - 1

  const mediaToShow = mediaByFloor[currentLevelKey] || null

  console.log('🔍 DEBUG - Current Step:', currentStep)
console.log('🔍 DEBUG - Level Keys:', levelKeys)
console.log('🔍 DEBUG - Current Level Key:', currentLevelKey)
console.log('🔍 DEBUG - Current Level:', currentLevel)
console.log('🔍 DEBUG - Selected Options:', selectedOptions)


console.log('📦 modelFloors recibido:', modelFloors)
console.log('🏠 selectedBuilding:', selectedBuilding)
console.log('🏗️ selectedBuilding.model:', selectedBuilding?.model)
console.log('📐 selectedBuilding.model.floors:', selectedBuilding?.model?.floors)

  // ✅ Fetch quote preview cuando cambian las opciones
// @/Users/oficina/MV-CRM/CustomerService/frontend/apps/6town-houses/src/Components/quote/HouseCustomizer.jsx
// Reemplazar el useEffect (líneas 30-89) con:

useEffect(() => {
  const fetchPreview = async () => {
    // ✅ Validar que haya opciones seleccionadas
    if (Object.keys(selectedOptions).length === 0) {
      setMediaByFloor({})
      return
    }

    // ✅ Validar que existan los datos necesarios del building
    if (!selectedBuilding?.quoteRef?.lot || !selectedBuilding?.quoteRef?.model) {
      console.warn('⚠️ Building no tiene quoteRef completo:', selectedBuilding)
      setMediaByFloor({})
      return
    }

    setLoadingPreview(true)
    try {
    //   const transformedOptions = {
    //     floors: {},
    //     ...Object.entries(selectedOptions).reduce((acc, [key, value]) => {
    //       if (key.startsWith('piso') || key.startsWith('level')) {
    //         acc.floors[key] = value
    //       } else {
    //         acc[key] = value
    //       }
    //       return acc
    //     }, { floors: {} })
    //   }
    const transformedOptions = {
  floors: { ...selectedOptions }  // Todas las opciones van dentro de floors
}

      const payload = {
        projectId: selectedBuilding.projectId || import.meta.env.VITE_PROJECT_ID,
        lot: selectedBuilding.quoteRef.lot,
        model: selectedBuilding.quoteRef.model,
        selectedOptions: transformedOptions
      }

      if (selectedBuilding.quoteRef?.facade) {
        payload.facade = selectedBuilding.quoteRef.facade
      }

      console.log('📤 Fetching quote preview with payload:', payload)
      
      const response = await quoteService.getQuotePreview(payload)
      
      console.log('📥 Quote preview response:', response)

      const mediaByFloorObject = (response.mediaByFloor || []).reduce((acc, floorData) => {
        acc[floorData.floorKey] = {
          selectedOptionKey: floorData.selectedOptionKey,
          mediaSource: floorData.mediaSource,
          media: floorData.media
        }
        return acc
      }, {})

      setMediaByFloor(mediaByFloorObject)
      setSelectedImageIndex(0)
      
    } catch (error) {
      console.error('❌ Error fetching quote preview:', error)
      console.error('📦 Building data:', selectedBuilding)
      setMediaByFloor({})
    } finally {
      setLoadingPreview(false)
    }
  }

  fetchPreview()
}, [selectedOptions, selectedBuilding])
  // ✅ Reset del índice cuando cambia el tipo de media
  useEffect(() => {
    setSelectedImageIndex(0)
  }, [selectedMediaType])

  const handleOptionSelect = (optionId) => {
    const mode = currentLevel?.selectionMode || 'single'
    
    const selectedOptionFullData = currentLevel?.options?.find(opt => opt.id === optionId)
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('📍 SELECCIÓN EN:', currentLevel?.label || currentLevelKey)
    console.log('🏷️  Opción seleccionada:', selectedOptionFullData?.label || optionId)
    console.log('📦 Data de la opción:', selectedOptionFullData)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    
    let newOptions
    if (mode === 'single') {
      newOptions = { ...selectedOptions, [currentLevelKey]: optionId }
    } else if (mode === 'multiple') {
      const current = selectedOptions[currentLevelKey] || []
      const isSelected = current.includes(optionId)
      newOptions = {
        ...selectedOptions,
        [currentLevelKey]: isSelected 
          ? current.filter(id => id !== optionId)
          : [...current, optionId]
      }
    }
    
    setSelectedOptions(newOptions)
    // ✅ DEBUG: Verificar que se guardó
console.log('✅ Opciones actualizadas:', newOptions)
console.log('✅ Clave del nivel:', currentLevelKey)
console.log('✅ Opción guardada:', newOptions[currentLevelKey])
 
    
    if (onOptionsChange) {
      onOptionsChange(newOptions)
    }
  }

  const estimatedPrice = useMemo(() => {
    if (!selectedBuilding?.quoteRef) return null
    
    const basePrice = 
      (selectedBuilding.quoteRef.lotPrice || 0) +
      (selectedBuilding.quoteRef.modelPrice || 0) +
      (selectedBuilding.quoteRef.facadePrice || 0)
    
    return calculateEstimatedPrice({
      basePrice,
      pricingRules: catalogConfig?.pricingRules || [],
      selectedOptions
    })
  }, [selectedOptions, catalogConfig, selectedBuilding])
const handleNext = () => {
  const mode = currentLevel?.selectionMode || 'single'
  
  console.log('➡️ NEXT - Current Level Key:', currentLevelKey)
  console.log('➡️ NEXT - Selection Mode:', mode)
  console.log('➡️ NEXT - Selected for this level:', selectedOptions[currentLevelKey])
  console.log('➡️ NEXT - All selected options:', selectedOptions)
  console.log('➡️ NEXT - Is Last Step:', isLastStep)
  
  if (mode !== 'none' && !selectedOptions[currentLevelKey]) {
    console.error('❌ No hay opción seleccionada para:', currentLevelKey)
    alert('Por favor selecciona al menos una opción')
    return
  }

  if (isLastStep) {
    console.log('🎯 Completando con opciones:', selectedOptions)
    onComplete({
      buildingId: selectedBuilding._id,
      buildingName: selectedBuilding.name,
      selectedOptions
    })
  } else {
    setCurrentStep(prev => prev + 1)
  }
}
  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    } else {
      onBack?.()
    }
  }

  if (!catalogConfig || levelKeys.length === 0) {
    return <Alert severity="error">No hay configuración de niveles disponible</Alert>
  }

// Reemplazar renderOptions (líneas 205-279) con:

const renderOptions = () => {
  const mode = currentLevel?.selectionMode || 'single'

  if (mode === 'none') {
    return (
      <Alert severity="info" sx={{ mb: 3 }}>
        Este nivel es solo informativo. Haz clic en "Siguiente" para continuar.
      </Alert>
    )
  }

  const currentSelections = mode === 'multiple' ? (selectedOptions[currentLevelKey] || []) : null
  const isSelected = (optionId) => {
    if (mode === 'single') return selectedOptions[currentLevelKey] === optionId
    if (mode === 'multiple') return currentSelections.includes(optionId)
    return false
  }

  return (
    <Grid container spacing={3}>
      {currentLevel?.options?.map((option) => {
        const selected = isSelected(option.id)
        
        // ✅ Obtener media de mediaByFloor (solo disponible después de seleccionar)
        const floorMedia = mediaByFloor[currentLevelKey]
        const hasSelectedMedia = selected && floorMedia?.media
        
        const media = hasSelectedMedia ? floorMedia.media : {}
        const renders = media.renders || []
        const isometrics = media.isometrics || []
        const blueprints = media.blueprints || []
        const allMedia = [...renders, ...isometrics, ...blueprints]
        
        const hasMedia = allMedia.length > 0
        const primaryImage = renders[0]?.url || isometrics[0]?.url || blueprints[0]?.url

        return (
          <Grid item xs={12} md={6} lg={4} key={option.id}>
            <Paper
              elevation={selected ? 8 : 2}
              sx={{
                cursor: 'pointer',
                borderRadius: 3,
                overflow: 'hidden',
                border: selected ? `4px solid ${theme.palette.primary.main}` : '2px solid #e0e0e0',
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                position: 'relative',
                minHeight: selected && hasMedia ? 500 : 200,
                display: 'flex',
                flexDirection: 'column',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 6,
                  border: `4px solid ${theme.palette.primary.light}`
                }
              }}
              onClick={() => handleOptionSelect(option.id)}
            >
              {/* Badge de selección */}
              {selected && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: 12,
                    right: 12,
                    zIndex: 10,
                    bgcolor: theme.palette.primary.main,
                    color: 'white',
                    borderRadius: '50%',
                    width: 40,
                    height: 40,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: 3,
                    animation: 'fadeIn 0.3s ease-in'
                  }}
                >
                  <CheckCircle sx={{ fontSize: 28 }} />
                </Box>
              )}

              {/* Imagen principal - Solo si está seleccionada y tiene media */}
              {selected && hasMedia && (
                <Box
                  component="img"
                  src={primaryImage}
                  alt={option.label}
                  sx={{
                    width: '100%',
                    height: 240,
                    objectFit: 'cover',
                    bgcolor: '#f5f5f5',
                    animation: 'slideDown 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                    '@keyframes slideDown': {
                      from: {
                        height: 0,
                        opacity: 0
                      },
                      to: {
                        height: 240,
                        opacity: 1
                      }
                    }
                  }}
                />
              )}

              {/* Contenido */}
              <Box 
                sx={{ 
                  p: 2.5, 
                  flex: 1, 
                  display: 'flex', 
                  flexDirection: 'column',
                  justifyContent: selected && !hasMedia ? 'center' : 'flex-start',
                  alignItems: selected && !hasMedia ? 'center' : 'stretch',
                  transition: 'all 0.4s ease'
                }}
              >
                {/* Título */}
                <Box 
                  display="flex" 
                  alignItems="center" 
                  justifyContent="space-between" 
                  mb={selected && hasMedia ? 1.5 : 0}
                  sx={{
                    transition: 'all 0.4s ease',
                    textAlign: selected && !hasMedia ? 'center' : 'left',
                    width: '100%'
                  }}
                >
                  <Typography 
                    variant={selected && !hasMedia ? "h4" : "h6"} 
                    sx={{ 
                      fontFamily: '"Poppins", sans-serif', 
                      fontWeight: 700, 
                      color: theme.palette.text.primary,
                      transition: 'all 0.4s ease',
                      flex: 1
                    }}
                  >
                    {option.label}
                  </Typography>
                  {mode === 'single' && (
                    <Radio
                      checked={selected}
                      sx={{ p: 0 }}
                      onClick={(e) => {
                        e.stopPropagation()
                        handleOptionSelect(option.id)
                      }}
                    />
                  )}
                  {mode === 'multiple' && (
                    <Checkbox
                      checked={selected}
                      sx={{ p: 0 }}
                      onClick={(e) => {
                        e.stopPropagation()
                        handleOptionSelect(option.id)
                      }}
                    />
                  )}
                </Box>

                {/* Divider - Solo si está seleccionada y tiene media */}
                {selected && hasMedia && <Divider sx={{ mb: 2 }} />}

                {/* Loading state mientras carga las imágenes */}
                {selected && loadingPreview && (
                  <Box display="flex" justifyContent="center" alignItems="center" py={4}>
                    <CircularProgress size={40} />
                    <Typography variant="body2" ml={2} color="text.secondary">
                      Cargando vista previa...
                    </Typography>
                  </Box>
                )}

                {/* Media badges - Solo si tiene media */}
                {selected && hasMedia && !loadingPreview && (
                  <Box 
                    display="flex" 
                    gap={1} 
                    flexWrap="wrap" 
                    mb={2}
                    sx={{
                      animation: 'fadeIn 0.6s ease-in 0.3s both',
                      '@keyframes fadeIn': {
                        from: { opacity: 0, transform: 'translateY(10px)' },
                        to: { opacity: 1, transform: 'translateY(0)' }
                      }
                    }}
                  >
                    {renders.length > 0 && (
                      <Chip
                        icon={<ImageIcon sx={{ fontSize: 14 }} />}
                        label={`${renders.length} Renders`}
                        size="small"
                        sx={{
                          height: 24,
                          fontSize: '0.7rem',
                          bgcolor: `${theme.palette.primary.main}15`,
                          color: theme.palette.primary.main,
                          fontWeight: 600
                        }}
                      />
                    )}
                    {isometrics.length > 0 && (
                      <Chip
                        icon={<ViewInAr sx={{ fontSize: 14 }} />}
                        label={`${isometrics.length} Isométricos`}
                        size="small"
                        sx={{
                          height: 24,
                          fontSize: '0.7rem',
                          bgcolor: `${theme.palette.secondary.main}15`,
                          color: theme.palette.secondary.main,
                          fontWeight: 600
                        }}
                      />
                    )}
                    {blueprints.length > 0 && (
                      <Chip
                        icon={<Map sx={{ fontSize: 14 }} />}
                        label={`${blueprints.length} Planos`}
                        size="small"
                        sx={{
                          height: 24,
                          fontSize: '0.7rem',
                          bgcolor: `${theme.palette.success.main}15`,
                          color: theme.palette.success.main,
                          fontWeight: 600
                        }}
                      />
                    )}
                  </Box>
                )}

                {/* Thumbnails gallery - Solo si tiene media */}
                {selected && hasMedia && allMedia.length > 1 && !loadingPreview && (
                  <Box
                    sx={{
                      display: 'flex',
                      gap: 0.5,
                      overflowX: 'auto',
                      pb: 1,
                      mt: 'auto',
                      animation: 'fadeIn 0.6s ease-in 0.4s both',
                      '&::-webkit-scrollbar': { height: '4px' },
                      '&::-webkit-scrollbar-track': { background: '#f1f1f1', borderRadius: '10px' },
                      '&::-webkit-scrollbar-thumb': { background: theme.palette.primary.main, borderRadius: '10px' }
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {allMedia.slice(0, 5).map((img, idx) => (
                      <Box
                        key={idx}
                        component="img"
                        src={img.url}
                        alt={`Preview ${idx + 1}`}
                        onClick={(e) => {
                          e.stopPropagation()
                          window.open(img.url, '_blank')
                        }}
                        sx={{
                          width: 60,
                          height: 60,
                          objectFit: 'cover',
                          borderRadius: 1,
                          cursor: 'pointer',
                          flexShrink: 0,
                          border: '2px solid #ddd',
                          transition: 'all 0.2s',
                          '&:hover': { transform: 'scale(1.1)', border: `2px solid ${theme.palette.primary.main}` }
                        }}
                      />
                    ))}
                    {allMedia.length > 5 && (
                      <Box
                        sx={{
                          width: 60,
                          height: 60,
                          borderRadius: 1,
                          bgcolor: '#f5f5f5',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          border: '2px solid #ddd'
                        }}
                      >
                        <Typography variant="caption" fontWeight={700} color="text.secondary">
                          +{allMedia.length - 5}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                )}
              </Box>
            </Paper>
          </Grid>
        )
      })}
    </Grid>
  )
}

return (
  <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
    {/* Header */}
    <Paper elevation={1} sx={{ p: 3, mb: 3, borderRadius: 3, bgcolor: '#fafafa' }}>
      <Box display="flex" alignItems="center" gap={2} mb={2}>
        <Home sx={{ fontSize: 32, color: theme.palette.primary.main }} />
        <Box flex={1}>
          <Typography variant="h5" fontWeight={700} sx={{ fontFamily: '"Poppins", sans-serif', color: theme.palette.primary.main }}>
            {currentLevel?.label}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Paso {currentStep + 1} de {levelKeys.length}
          </Typography>
        </Box>
{estimatedPrice && (
  <Box textAlign="right">
    <Typography variant="caption" color="text.secondary" display="block">
      Precio Estimado
    </Typography>
    <Typography variant="h5" fontWeight={700} color="primary">
      ${estimatedPrice?.totalPrice?.toLocaleString() || '0'}
    </Typography>
  </Box>
)}
      </Box>
      <Divider />
    </Paper>

    {/* Opciones con imágenes integradas */}
    <Box sx={{ flex: 1, overflowY: 'auto', mb: 3 }}>
      {renderOptions()}
    </Box>

    {/* Resumen de Selecciones */}
    {Object.keys(selectedOptions).length > 0 && (
      <Paper elevation={2} sx={{ p: 3, mb: 3, bgcolor: '#f5f5f5', borderRadius: 3 }}>
        <Typography variant="h6" fontWeight={700} mb={2} sx={{ fontFamily: '"Poppins", sans-serif' }}>
          Resumen de Selecciones
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Grid container spacing={2}>
          {Object.entries(selectedOptions).map(([levelKey, value]) => {
            const level = levels[levelKey]
            const selections = Array.isArray(value) ? value : [value]
            const labels = selections.map(id => level?.options?.find(opt => opt.id === id)?.label).filter(Boolean)
            
            return (
              <Grid item xs={12} sm={6} md={3} key={levelKey}>
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 600 }}>
                    {level?.label}
                  </Typography>
                  <Typography variant="body1" fontWeight={600} color="primary">
                    {labels.join(', ')}
                  </Typography>
                </Box>
              </Grid>
            )
          })}
        </Grid>
      </Paper>
    )}

    {/* Botones de navegación */}
    <Paper elevation={2} sx={{ p: 2, borderRadius: 3 }}>
      <Box display="flex" justifyContent="space-between" gap={2}>
        <Button
          variant="outlined"
          startIcon={<ArrowBack />}
          onClick={handlePrevious}
          sx={{ minWidth: 120 }}
        >
          {currentStep === 0 ? 'Volver' : 'Anterior'}
        </Button>
        <Button
          variant="contained"
          endIcon={isLastStep ? <Calculate /> : <ArrowForward />}
          onClick={handleNext}
          sx={{ minWidth: 120 }}
        >
          {isLastStep ? 'Ver Cotización' : 'Siguiente'}
        </Button>
      </Box>
    </Paper>
  </Box>
)
}

export default HouseCustomizer