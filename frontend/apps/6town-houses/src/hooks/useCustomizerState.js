import { useState, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import quoteService from '@shared/services/quoteService'
import { calculateEstimatedPrice } from '@shared/utils/pricingEngine'

const useCustomizerState = ({ 
  catalogConfig, 
  selectedBuilding, 
  onComplete, 
  onBack, 
  onOptionsChange 
}) => {
  const { t } = useTranslation(['quote'])
  const [currentStep, setCurrentStep] = useState(0)
  const [selectedOptions, setSelectedOptions] = useState({})
  const [mediaByFloor, setMediaByFloor] = useState({})
  const [loadingPreview, setLoadingPreview] = useState(false)

  const levels = catalogConfig?.structure?.levels || {}
  const levelKeys = Object.keys(levels)
  const currentLevelKey = levelKeys[currentStep]
  const currentLevel = levels[currentLevelKey]
  const isLastStep = currentStep === levelKeys.length - 1

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

  return {
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
  }
}

export default useCustomizerState