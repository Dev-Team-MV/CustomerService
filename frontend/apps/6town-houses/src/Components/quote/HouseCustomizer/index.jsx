// @/Users/oficina/MV-CRM/CustomerService/frontend/apps/6town-houses/src/Components/quote/HouseCustomizer/index.jsx

import { Box, Alert } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { useMemo } from 'react'  // ✅ AGREGAR
import CustomizerHeader from './CustomizerHeader'
import SelectionSummary from './SelectionSummary'
import NavigationButtons from './NavigationButtons'
import OptionsGrid from './OptionsGrid'
import useCustomizerState from '../../../hooks/useCustomizerState'

const HouseCustomizer = ({ 
  catalogConfig, 
  selectedBuilding, 
  modelFloors = [], 
  onComplete, 
  onBack, 
  onOptionsChange 
}) => {
  const { t } = useTranslation(['quote'])
  
  const {
    currentStep,
    currentLevelKey,
    currentLevel,
    isLastStep,
    selectedOptions,
    mediaByFloor,
    loadingPreview,
    estimatedPrice,
    levels,
    levelKeys,
    handleOptionSelect,
    handleNext,
    handlePrevious
  } = useCustomizerState({
    catalogConfig,
    selectedBuilding,
    onComplete,
    onBack,
    onOptionsChange
  })

  // ✅ NUEVO: Obtener las imágenes multi del floor actual
  const currentFloorMultiMedia = useMemo(() => {
    if (!modelFloors || modelFloors.length === 0 || !currentLevelKey) {
      return null
    }

    // Buscar el floor que corresponde al nivel actual
    const currentFloor = modelFloors.find(floor => floor.key === currentLevelKey)
    
    if (!currentFloor || !currentFloor.media || !currentFloor.media.multi) {
      return null
    }

    // Retornar las imágenes multi si existen
    return currentFloor.media.multi.length > 0 ? currentFloor.media.multi : null
  }, [modelFloors, currentLevelKey])

  if (!catalogConfig || levelKeys.length === 0) {
    return <Alert severity="error">{t('errors.loadingConfig')}</Alert>
  }

  return (
    <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CustomizerHeader
        currentLevel={currentLevel}
        currentStep={currentStep}
        totalSteps={levelKeys.length}
        estimatedPrice={estimatedPrice}
      />

      <Box sx={{ flex: 1, overflowY: 'auto', mb: 3 }}>
        <OptionsGrid
          currentLevel={currentLevel}
          selectedOptions={selectedOptions}
          currentLevelKey={currentLevelKey}
          mediaByFloor={mediaByFloor}
          loadingPreview={loadingPreview}
          onOptionSelect={handleOptionSelect}
          floorMultiMedia={currentFloorMultiMedia}  // ✅ NUEVO
        />
      </Box>

      <SelectionSummary
        selectedOptions={selectedOptions}
        levels={levels}
      />

      <NavigationButtons
        currentStep={currentStep}
        isLastStep={isLastStep}
        onPrevious={handlePrevious}
        onNext={handleNext}
      />
    </Box>
  )
}

export default HouseCustomizer