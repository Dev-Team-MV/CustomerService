import { useState, useMemo, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import quoteService from '@shared/services/quoteService'
import { calculateEstimatedPrice } from '@shared/utils/pricingEngine'
import {
  Box, Paper, Typography, Button,
  Alert, Grid, Divider
} from '@mui/material'
import { Home, ArrowBack, ArrowForward, Calculate } from '@mui/icons-material'
import { useTheme } from '@mui/material/styles'
import OptionCard from './OptionCard'

const HouseCustomizer = ({ catalogConfig, selectedBuilding, modelFloors = [], onComplete, onBack, onOptionsChange }) => {
  const theme = useTheme()
  const { t } = useTranslation(['quote', 'common'])
  const [currentStep, setCurrentStep] = useState(0)
  const [selectedOptions, setSelectedOptions] = useState({})
  const [mediaByFloor, setMediaByFloor] = useState({})
  const [loadingPreview, setLoadingPreview] = useState(false)
 
  const levels = catalogConfig?.structure?.levels || {}
  const levelKeys = Object.keys(levels)
  const currentLevelKey = levelKeys[currentStep]
  const currentLevel = levels[currentLevelKey]
  const isLastStep = currentStep === levelKeys.length - 1

  // ✅ Fetch previews para todas las opciones del step actual
  useEffect(() => {
    const fetchPreviewsForAllOptions = async () => {
      if (mediaByFloor[currentLevelKey]) {
        console.log('✅ Previews ya cargados para:', currentLevelKey)
        return
      }

      if (!selectedBuilding?.quoteRef?.lot || !selectedBuilding?.quoteRef?.model) {
        console.warn('⚠️ Building no tiene quoteRef completo:', selectedBuilding)
        return
      }

      const currentOptions = currentLevel?.options || []
      if (currentOptions.length === 0) {
        console.log('⚠️ No hay opciones para este nivel:', currentLevelKey)
        return
      }

      setLoadingPreview(true)
      try {
        const previewsByOption = {}

        for (const option of currentOptions) {
          try {
            const tempSelectedOptions = {
              ...selectedOptions,
              [currentLevelKey]: option.id
            }

            const transformedOptions = {
              floors: { ...tempSelectedOptions }
            }

            const payload = {
              projectId: selectedBuilding.projectId || import.meta.env.VITE_PROJECT_ID,
              lot: selectedBuilding.quoteRef.lot,
              model: selectedBuilding.quoteRef.model,
              selectedOptions: transformedOptions,
              preview: {
                includeAllOptionsMedia: false,
                includeEmptyOptionMedia: false,
                floorKeys: [currentLevelKey],
                step: currentStep + 1,
                stepSize: 1
              }
            }

            if (selectedBuilding.quoteRef?.facade) {
              payload.facade = selectedBuilding.quoteRef.facade
            }

            console.log(`📤 Fetching preview for ${currentLevelKey} - ${option.label}:`, payload)
            
            const response = await quoteService.getQuotePreview(payload)
            
            console.log(`📥 Preview response for ${option.label}:`, response)

            if (response.mediaByFloor && response.mediaByFloor.length > 0) {
              const floorData = response.mediaByFloor[0]
              previewsByOption[option.id] = {
                selectedOptionKey: floorData.selectedOptionKey,
                mediaSource: floorData.mediaSource,
                media: floorData.media
              }
            }
          } catch (error) {
            console.error(`❌ Error fetching preview for ${option.label}:`, error)
          }
        }

        setMediaByFloor(prev => ({
          ...prev,
          [currentLevelKey]: previewsByOption
        }))
        
      } catch (error) {
        console.error('❌ Error fetching previews:', error)
      } finally {
        setLoadingPreview(false)
      }
    }

    fetchPreviewsForAllOptions()
  }, [currentStep, currentLevelKey, selectedBuilding])

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
      alert(t('selectApartmentToCustomize'))
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
    return <Alert severity="error">{t('errors.loadingConfig')}</Alert>
  }

  const getMediaForOption = (optionId) => {
    const levelPreviews = mediaByFloor[currentLevelKey]
    if (!levelPreviews || typeof levelPreviews !== 'object') return null
    return levelPreviews[optionId] || null
  }

  const renderOptions = () => {
    const mode = currentLevel?.selectionMode || 'single'

    if (mode === 'none') {
      return (
        <Alert severity="info" sx={{ mb: 3 }}>
          {t('informativeStep')}
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
      <Grid container spacing={3} sx={{padding: 4, display: 'flex', justifyContent: 'space-around'}}>
        {currentLevel?.options?.map((option) => (
          <Grid item xs={12} md={6} key={option.id} >
            <OptionCard
              option={option}
              selected={isSelected(option.id)}
              mode={mode}
              optionMedia={getMediaForOption(option.id)}
              loadingPreview={loadingPreview}
              onSelect={handleOptionSelect}
            />
          </Grid>
        ))}
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
            <Typography 
              variant="h5" 
              fontWeight={700} 
              sx={{ 
                fontFamily: '"Poppins", sans-serif', 
                color: theme.palette.primary.main 
              }}
            >
              {currentLevel?.label}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t('step.of', { current: currentStep + 1, total: levelKeys.length })}
            </Typography>
          </Box>
          {estimatedPrice && (
            <Box textAlign="right">
              <Typography variant="caption" color="text.secondary" display="block">
                {t('estimatedPrice')}
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
          <Typography 
            variant="h6" 
            fontWeight={700} 
            mb={2} 
            sx={{ fontFamily: '"Poppins", sans-serif' }}
          >
            {t('selectedOptions.title')}
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
                    <Typography 
                      variant="caption" 
                      color="text.secondary" 
                      sx={{ textTransform: 'uppercase', fontWeight: 600, fontFamily: '"Poppins", sans-serif' }}
                    >
                      {level?.label}
                    </Typography>
                    <Typography 
                      variant="body1" 
                      fontWeight={600} 
                      color="primary"
                      sx={{ fontFamily: '"Poppins", sans-serif' }}
                    >
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
            sx={{ 
              minWidth: 120,
              fontFamily: '"Poppins", sans-serif',
              fontWeight: 600,
              textTransform: 'none',
              borderColor: theme.palette.divider,
              color: theme.palette.text.secondary,
              '&:hover': {
                borderColor: theme.palette.primary.main,
                bgcolor: theme.palette.action.hover
              }
            }}
          >
            {currentStep === 0 ? t('buttons.back') : t('previous')}
          </Button>
          <Button
            variant="contained"
            endIcon={isLastStep ? <Calculate /> : <ArrowForward />}
            onClick={handleNext}
            sx={{ 
              minWidth: 120,
              fontFamily: '"Poppins", sans-serif',
              fontWeight: 600,
              textTransform: 'none',
              bgcolor: theme.palette.primary.main,
              '&:hover': {
                bgcolor: theme.palette.primary.dark
              }
            }}
          >
            {isLastStep ? t('getQuote') : t('next')}
          </Button>
        </Box>
      </Paper>
    </Box>
  )
}

export default HouseCustomizer