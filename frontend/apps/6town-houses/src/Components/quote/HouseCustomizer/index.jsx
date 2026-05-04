
import { Box, Alert } from '@mui/material'
import { useTranslation } from 'react-i18next'
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