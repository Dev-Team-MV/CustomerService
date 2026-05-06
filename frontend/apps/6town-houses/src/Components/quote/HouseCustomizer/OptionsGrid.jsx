import { Grid, Alert } from '@mui/material'
import { useTranslation } from 'react-i18next'
import OptionCard from '../OptionCard'

const OptionsGrid = ({ 
  currentLevel,
  selectedOptions,
  currentLevelKey,
  mediaByFloor,
  loadingPreview,
  onOptionSelect,
  floorMultiMedia  // ✅ NUEVO: Recibir las imágenes multi del floor
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

  // ✅ NUEVO: Función para determinar si mostrar multi
const shouldShowMultiForOption = (option) => {
  // Si no hay imágenes multi en el floor, no mostrar
  if (!floorMultiMedia || floorMultiMedia.length === 0) {
    return false
  }

  // level2: Solo mostrar si la opción contiene "multifuncional"
  if (currentLevelKey === 'level2') {
    return option.label.toLowerCase().includes('multifuncional')
  }

  // level3 y terrace: Siempre mostrar multi
  if (currentLevelKey === 'level3' || currentLevelKey === 'terrace') {
    return true
  }

  // Para otros niveles (level1, etc.), no mostrar
  return false
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
            multiMedia={shouldShowMultiForOption(option) ? floorMultiMedia : null}  // ✅ NUEVO
          />
        </Grid>
      ))}
    </Grid>
  )
}

export default OptionsGrid