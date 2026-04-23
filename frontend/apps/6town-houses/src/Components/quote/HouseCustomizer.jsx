// @/Users/oficina/MV-CRM/CustomerService/frontend/apps/6town-houses/src/Components/quote/HouseCustomizer.jsx

import { useState, useMemo } from 'react'
import { calculateEstimatedPrice } from '@shared/utils/pricingEngine'
import {
  Box, Paper, Typography, Button, FormControl, FormLabel,
  RadioGroup, FormControlLabel, Radio, Checkbox, FormGroup,
  Stepper, Step, StepLabel, Alert, Grid, Divider
} from '@mui/material'
import { Home, ArrowBack, ArrowForward, Calculate } from '@mui/icons-material'
import { useTheme } from '@mui/material/styles'

const HouseCustomizer = ({ catalogConfig, selectedBuilding, modelFloors = [], onComplete, onBack, onOptionsChange }) => {
  const theme = useTheme()
  const [currentStep, setCurrentStep] = useState(0)
  const [selectedOptions, setSelectedOptions] = useState({})
 
  const levels = catalogConfig?.structure?.levels || {}
  const levelKeys = Object.keys(levels)
  const currentLevelKey = levelKeys[currentStep]
  const currentLevel = levels[currentLevelKey]
  const isLastStep = currentStep === levelKeys.length - 1
 
  const currentFloor = modelFloors.find(floor => floor.key === currentLevelKey)
  const selectedOptionId = selectedOptions[currentLevelKey]
  const selectedOptionData = currentFloor?.options?.find(opt => opt.key === selectedOptionId)
  const mediaToShow = selectedOptionData?.media || currentFloor?.media || null

  const handleOptionSelect = (optionId) => {
    const mode = currentLevel?.selectionMode || 'single'
   
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
    
    if (mode !== 'none' && !selectedOptions[currentLevelKey]) {
      alert('Por favor selecciona al menos una opción')
      return
    }

    if (isLastStep) {
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

  const renderOptions = () => {
    const mode = currentLevel?.selectionMode || 'single'

    if (mode === 'none') {
      return (
        <Alert severity="info" sx={{ mb: 3 }}>
          Este nivel es solo informativo. Haz clic en "Siguiente" para continuar.
        </Alert>
      )
    }

    if (mode === 'single') {
      return (
        <RadioGroup value={selectedOptions[currentLevelKey] || ''} onChange={(e) => handleOptionSelect(e.target.value)}>
          {currentLevel?.options?.map((option) => (
            <Paper
              key={option.id}
              elevation={selectedOptions[currentLevelKey] === option.id ? 4 : 1}
              sx={{
                p: 3, mb: 2,
                border: selectedOptions[currentLevelKey] === option.id ? `3px solid ${theme.palette.primary.main}` : '1px solid #e0e0e0',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': { transform: 'translateY(-2px)', boxShadow: 3 }
              }}
              onClick={() => handleOptionSelect(option.id)}
            >
              <FormControlLabel
                value={option.id}
                control={<Radio />}
                label={
                  <Typography variant="h6" sx={{ fontFamily: '"Poppins", sans-serif', fontWeight: 600 }}>
                    {option.label}
                  </Typography>
                }
                sx={{ width: '100%', m: 0 }}
              />
            </Paper>
          ))}
        </RadioGroup>
      )
    }

    if (mode === 'multiple') {
      const currentSelections = selectedOptions[currentLevelKey] || []
      return (
        <FormGroup>
          {currentLevel?.options?.map((option) => (
            <Paper
              key={option.id}
              elevation={currentSelections.includes(option.id) ? 4 : 1}
              sx={{
                p: 3, mb: 2,
                border: currentSelections.includes(option.id) ? `3px solid ${theme.palette.primary.main}` : '1px solid #e0e0e0',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': { transform: 'translateY(-2px)', boxShadow: 3 }
              }}
              onClick={() => handleOptionSelect(option.id)}
            >
              <FormControlLabel
                control={<Checkbox checked={currentSelections.includes(option.id)} />}
                label={
                  <Typography variant="h6" sx={{ fontFamily: '"Poppins", sans-serif', fontWeight: 600 }}>
                    {option.label}
                  </Typography>
                }
                sx={{ width: '100%', m: 0 }}
              />
            </Paper>
          ))}
        </FormGroup>
      )
    }
  }

  const renderMediaGallery = () => {
    if (!mediaToShow) return null

    const hasMedia = 
      (mediaToShow.renders?.length > 0) ||
      (mediaToShow.isometrics?.length > 0) ||
      (mediaToShow.blueprints?.length > 0)

    if (!hasMedia) return null

    return (
      <Paper elevation={2} sx={{ p: 3, mt: 3, bgcolor: '#fafafa', borderRadius: 3 }}>
        <Typography variant="h6" fontWeight={600} mb={2} sx={{ fontFamily: '"Poppins", sans-serif' }}>
          Vista Previa - {selectedOptionData?.label || currentFloor?.label}
        </Typography>
        
        <Grid container spacing={3}>
          {mediaToShow.renders?.length > 0 && (
            <Grid item xs={12}>
              <Typography variant="subtitle2" fontWeight={600} mb={1} color="primary" sx={{ fontFamily: '"Poppins", sans-serif' }}>
                Renders
              </Typography>
              <Box display="flex" gap={2} sx={{ overflowX: 'auto', pb: 1 }}>
                {mediaToShow.renders.map((img, idx) => (
                  <Box
                    key={idx}
                    component="img"
                    src={img.url}
                    alt={`Render ${idx + 1}`}
                    sx={{
                      width: 200,
                      height: 150,
                      objectFit: 'cover',
                      borderRadius: 2,
                      boxShadow: 2,
                      cursor: 'pointer',
                      flexShrink: 0,
                      '&:hover': { transform: 'scale(1.05)', transition: 'transform 0.2s' }
                    }}
                    onClick={() => window.open(img.url, '_blank')}
                  />
                ))}
              </Box>
            </Grid>
          )}

          {mediaToShow.isometrics?.length > 0 && (
            <Grid item xs={12}>
              <Typography variant="subtitle2" fontWeight={600} mb={1} color="secondary" sx={{ fontFamily: '"Poppins", sans-serif' }}>
                Isométricos
              </Typography>
              <Box display="flex" gap={2} sx={{ overflowX: 'auto', pb: 1 }}>
                {mediaToShow.isometrics.map((img, idx) => (
                  <Box
                    key={idx}
                    component="img"
                    src={img.url}
                    alt={`Isométrico ${idx + 1}`}
                    sx={{
                      width: 200,
                      height: 150,
                      objectFit: 'cover',
                      borderRadius: 2,
                      boxShadow: 2,
                      cursor: 'pointer',
                      flexShrink: 0,
                      '&:hover': { transform: 'scale(1.05)', transition: 'transform 0.2s' }
                    }}
                    onClick={() => window.open(img.url, '_blank')}
                  />
                ))}
              </Box>
            </Grid>
          )}

          {mediaToShow.blueprints?.length > 0 && (
            <Grid item xs={12}>
              <Typography variant="subtitle2" fontWeight={600} mb={1} color="info.main" sx={{ fontFamily: '"Poppins", sans-serif' }}>
                Planos
              </Typography>
              <Box display="flex" gap={2} sx={{ overflowX: 'auto', pb: 1 }}>
                {mediaToShow.blueprints.map((img, idx) => (
                  <Box
                    key={idx}
                    component="img"
                    src={img.url}
                    alt={`Plano ${idx + 1}`}
                    sx={{
                      width: 200,
                      height: 150,
                      objectFit: 'cover',
                      borderRadius: 2,
                      boxShadow: 2,
                      cursor: 'pointer',
                      flexShrink: 0,
                      '&:hover': { transform: 'scale(1.05)', transition: 'transform 0.2s' }
                    }}
                    onClick={() => window.open(img.url, '_blank')}
                  />
                ))}
              </Box>
            </Grid>
          )}
        </Grid>
      </Paper>
    )
  }

  return (
    <Box>
      <Box display="flex" alignItems="center" gap={2} mb={3}>
        <Home sx={{ fontSize: 40, color: theme.palette.primary.main }} />
        <Box flex={1}>
          <Typography variant="h4" fontWeight={700} sx={{ fontFamily: '"Poppins", sans-serif' }}>
            {selectedBuilding?.name}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Customiza tu casa piso por piso
          </Typography>
        </Box>
        
        {estimatedPrice && (
          <Paper elevation={3} sx={{ p: 2, bgcolor: theme.palette.primary.main, color: 'white', minWidth: 200 }}>
            <Typography variant="caption" sx={{ fontFamily: '"Poppins", sans-serif', display: 'block', mb: 0.5 }}>
              Precio Estimado
            </Typography>
            <Typography variant="h5" fontWeight={700} sx={{ fontFamily: '"Poppins", sans-serif' }}>
              ${estimatedPrice.totalPrice.toLocaleString()}
            </Typography>
            {estimatedPrice.totalAdjustments > 0 && (
              <Typography variant="caption" sx={{ fontFamily: '"Poppins", sans-serif', opacity: 0.9, display: 'block', mt: 0.5 }}>
                +${estimatedPrice.totalAdjustments.toLocaleString()} en upgrades
              </Typography>
            )}
          </Paper>
        )}
      </Box>

      <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
        <Typography variant="h5" fontWeight={700} mb={3} sx={{ fontFamily: '"Poppins", sans-serif' }}>
          {currentLevel?.label}
        </Typography>

        <FormControl component="fieldset" fullWidth>
          {currentLevel?.selectionMode !== 'none' && (
            <FormLabel component="legend" sx={{ mb: 2, fontWeight: 600 }}>
              {currentLevel?.selectionMode === 'multiple' ? 'Selecciona una o más opciones:' : 'Selecciona una opción:'}
            </FormLabel>
          )}
          {renderOptions()}
        </FormControl>

        {renderMediaGallery()}
      </Paper>

      {Object.keys(selectedOptions).length > 0 && (
        <Paper elevation={2} sx={{ p: 3, mb: 4, bgcolor: '#f5f5f5' }}>
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
                <Grid item xs={12} sm={6} key={levelKey}>
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
          
          {estimatedPrice?.adjustments && estimatedPrice.adjustments.length > 0 && (
            <>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle2" fontWeight={600} mb={1} sx={{ fontFamily: '"Poppins", sans-serif' }}>
                Ajustes de Precio
              </Typography>
              {estimatedPrice.adjustments.map((adj, idx) => (
                <Box key={idx} display="flex" justifyContent="space-between" sx={{ mb: 0.5 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ fontFamily: '"Poppins", sans-serif' }}>
                    {adj.label}
                  </Typography>
                  <Typography variant="body2" fontWeight={600} color="primary" sx={{ fontFamily: '"Poppins", sans-serif' }}>
                    +${adj.amount.toLocaleString()}
                  </Typography>
                </Box>
              ))}
              <Divider sx={{ my: 1.5 }} />
              <Box display="flex" justifyContent="space-between">
                <Typography variant="body1" fontWeight={700} sx={{ fontFamily: '"Poppins", sans-serif' }}>
                  Precio Base
                </Typography>
                <Typography variant="body1" fontWeight={600} sx={{ fontFamily: '"Poppins", sans-serif' }}>
                  ${estimatedPrice.basePrice.toLocaleString()}
                </Typography>
              </Box>
              <Box display="flex" justifyContent="space-between" mt={1}>
                <Typography variant="h6" fontWeight={700} sx={{ fontFamily: '"Poppins", sans-serif' }}>
                  Total
                </Typography>
                <Typography variant="h6" fontWeight={700} color="primary" sx={{ fontFamily: '"Poppins", sans-serif' }}>
                  ${estimatedPrice.totalPrice.toLocaleString()}
                </Typography>
              </Box>
            </>
          )}
        </Paper>
      )}

      <Box display="flex" justifyContent="space-between">
        <Button
          variant="outlined"
          size="large"
          startIcon={<ArrowBack />}
          onClick={handlePrevious}
          sx={{ 
            px: 4, py: 1.5, 
            fontFamily: '"Poppins", sans-serif', 
            textTransform: 'none', 
            fontSize: '1rem',
            borderRadius: 3
          }}
        >
          {currentStep === 0 ? 'Cambiar Casa' : 'Anterior'}
        </Button>

        <Button
          variant="contained"
          size="large"
          endIcon={isLastStep ? <Calculate /> : <ArrowForward />}
          onClick={handleNext}
          sx={{ 
            px: 4, py: 1.5, 
            fontFamily: '"Poppins", sans-serif', 
            textTransform: 'none', 
            fontSize: '1rem',
            borderRadius: 3
          }}
        >
          {isLastStep ? 'Calcular Precio' : 'Siguiente Piso'}
        </Button>
      </Box>
    </Box>
  )
}

export default HouseCustomizer