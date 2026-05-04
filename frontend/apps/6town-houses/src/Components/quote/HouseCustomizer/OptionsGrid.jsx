import { Grid, Alert } from '@mui/material'
import { useTranslation } from 'react-i18next'
import OptionCard from '../OptionCard'

const OptionsGrid = ({ 
  currentLevel,
  selectedOptions,
  currentLevelKey,
  mediaByFloor,
  loadingPreview,
  onOptionSelect
}) => {
  const { t } = useTranslation(['quote'])
  
  const mode = currentLevel?.selectionMode || 'single'

  if (mode === 'none') {
    return (
      <Alert severity="info" sx={{ mb: 3 }}>
        {t('informativeStep')}
      </Alert>
    )
  }

  const currentSelections = mode === 'multiple' 
    ? (selectedOptions[currentLevelKey] || []) 
    : null

  const isSelected = (optionId) => {
    if (mode === 'single') return selectedOptions[currentLevelKey] === optionId
    if (mode === 'multiple') return currentSelections.includes(optionId)
    return false
  }

  const getMediaForOption = (optionId) => {
    const levelPreviews = mediaByFloor[currentLevelKey]
    if (!levelPreviews || typeof levelPreviews !== 'object') return null
    return levelPreviews[optionId] || null
  }

  return (
    <Grid 
      container 
      spacing={3} 
      sx={{ 
        padding: 4, 
        display: 'flex', 
        justifyContent: 'space-around' 
      }}
    >
      {currentLevel?.options?.map((option) => (
        <Grid item xs={12} md={6} key={option.id}>
          <OptionCard
            option={option}
            selected={isSelected(option.id)}
            mode={mode}
            optionMedia={getMediaForOption(option.id)}
            loadingPreview={loadingPreview}
            onSelect={onOptionSelect}
          />
        </Grid>
      ))}
    </Grid>
  )
}

export default OptionsGrid