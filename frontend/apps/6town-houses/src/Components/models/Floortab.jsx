import { useState, useMemo } from 'react'
import {
  Box, Grid, Typography, Paper, Button, IconButton, Chip,
  Select, MenuItem, FormControl, InputLabel, Alert, CircularProgress
} from '@mui/material'
import {
  CloudUpload, Delete, Image as ImageIcon, Layers, ViewInAr, Home,
  SwapVert, Save, Cancel
} from '@mui/icons-material'
import { useTheme } from '@mui/material/styles'
import { useTranslation } from 'react-i18next'
import uploadService from '@shared/services/uploadService'
import FloorImageGrid from './FloorImagegrid'

const FloorTab = ({ floor, editMode, onChange, catalogConfig, t }) => {
  const theme = useTheme()
  const [selectedOption, setSelectedOption] = useState(floor?.options?.[0]?.key || null)
  const [uploading, setUploading] = useState(false)
  const [reorderMode, setReorderMode] = useState(false)
  const [pendingReorders, setPendingReorders] = useState({})
  const [originalFloorData, setOriginalFloorData] = useState(null)

  if (!floor) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="body1" color="text.secondary" sx={{ fontFamily: '"Poppins", sans-serif' }}>
          {t('houses6Town:model.floor.noFloors')}
        </Typography>
      </Box>
    )
  }

  const currentOption = floor.options?.find(opt => opt.key === selectedOption)
  const mediaToShow = currentOption?.media || floor.media || { 
    renders: [], 
    isometrics: [], 
    blueprints: [],
    exterior: [],
    multi: []
  }

  const floorMedia = floor.media || { 
    renders: [], 
    isometrics: [], 
    blueprints: [],
    exterior: [],
    multi: []
  }

  const mediaRequirements = useMemo(() => {
    if (!catalogConfig?.assetsSchema || !selectedOption) {
      return { required: [], optional: [] }
    }

    const key = `${floor.key}.${selectedOption}`
    const required = catalogConfig.assetsSchema.requiredByLevelOption?.[key] || []
    const optional = catalogConfig.assetsSchema.optionalByLevelOption?.[key] || []

    console.log(`🎨 [FloorTab] Media requirements for ${key}:`, { required, optional })

    return { required, optional }
  }, [catalogConfig, floor.key, selectedOption])

  const shouldShowExteriors = useMemo(() => {
    return mediaRequirements.required.includes('exterior') || 
           mediaRequirements.optional.includes('exterior')
  }, [mediaRequirements])

  const isExteriorRequired = mediaRequirements.required.includes('exterior')

  const handleFileUpload = async (e, mediaType) => {
    const files = Array.from(e.target.files)
    if (files.length === 0) return
   
    try {
      setUploading(true)
      const uploadPromises = files.map(file => uploadService.uploadModelImage(file, `floors/${floor.key}/${mediaType}`))
      const urls = await Promise.all(uploadPromises)
      
      if (mediaType === 'multi') {
        const newFloorMedia = {
          ...floorMedia,
          multi: [...(floorMedia.multi || []), ...urls.map(url => ({ url, isPublic: true }))]
        }
        onChange(floor.key, 'media', newFloorMedia)
      } else {
        const newMedia = {
          ...mediaToShow,
          [mediaType]: [...(mediaToShow[mediaType] || []), ...urls.map(url => ({ url, isPublic: true }))]
        }
   
        if (currentOption) {
          onChange(floor.key, 'optionMedia', { optionKey: selectedOption, media: newMedia })
        } else {
          onChange(floor.key, 'media', newMedia)
        }
      }
    } catch (err) {
      console.error('Error uploading files:', err)
      alert(`${t('houses6Town:model.messages.errorSaving')}: ${err.message}`)
    } finally {
      setUploading(false)
    }
  }

  const handleDeleteImage = (mediaType, index) => {
    if (mediaType === 'multi') {
      const newFloorMedia = {
        ...floorMedia,
        multi: floorMedia.multi.filter((_, i) => i !== index)
      }
      onChange(floor.key, 'media', newFloorMedia)
    } else {
      const newMedia = {
        ...mediaToShow,
        [mediaType]: mediaToShow[mediaType].filter((_, i) => i !== index)
      }
   
      if (currentOption) {
        onChange(floor.key, 'optionMedia', { optionKey: selectedOption, media: newMedia })
      } else {
        onChange(floor.key, 'media', newMedia)
      }
    }
  }

  const handleToggleReorderMode = () => {
    if (!reorderMode) {
      setOriginalFloorData(JSON.parse(JSON.stringify(floor)))
      setReorderMode(true)
      console.log('🔄 [FloorTab] Modo reorganización activado')
    } else {
      setReorderMode(false)
      setPendingReorders({})
      console.log('🔄 [FloorTab] Modo reorganización desactivado')
    }
  }

  const handleReorderImages = (floorKey, mediaType, reorderedImages) => {
    const key = `${floorKey}-${selectedOption || 'floor'}-${mediaType}`
    
    if (mediaType === 'multi') {
      const newFloorMedia = {
        ...floorMedia,
        multi: reorderedImages
      }
      onChange(floorKey, 'media', newFloorMedia)
    } else {
      const newMedia = {
        ...mediaToShow,
        [mediaType]: reorderedImages
      }
      
      if (currentOption) {
        onChange(floorKey, 'optionMedia', { optionKey: selectedOption, media: newMedia })
      } else {
        onChange(floorKey, 'media', newMedia)
      }
    }
    
    if (reorderMode) {
      setPendingReorders(prev => ({
        ...prev,
        [key]: {
          floorKey,
          optionKey: selectedOption || null,
          mediaType,
          newOrder: reorderedImages.map((img, idx) => ({
            position: idx + 1,
            url: typeof img === 'string' ? img : img.url,
            isPublic: typeof img === 'object' ? (img.isPublic !== false) : true
          }))
        }
      }))
      
      console.log(`📦 [FloorTab] Cambio acumulado para ${key}:`, {
        floorKey,
        optionKey: selectedOption || 'floor-level',
        mediaType,
        count: reorderedImages.length
      })
    }
  }

const handleSaveReorders = async () => {
  if (Object.keys(pendingReorders).length === 0) return
  
  console.log('💾 [FloorTab] GUARDANDO REORGANIZACIONES:')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  
  try {
    // Enviar cada reorganización al backend
    for (const [key, reorder] of Object.entries(pendingReorders)) {
      // Construir payload según especificación del endpoint
      const payload = {
        section: "floor",
        floorKey: reorder.floorKey,
        mediaType: reorder.mediaType,
        images: reorder.newOrder
      }
      
      // Solo incluir optionKey si existe (media de opción vs media de piso)
      if (reorder.optionKey) {
        payload.optionKey = reorder.optionKey
      }
      
      console.log(`\n📤 Payload para ${key}:`)
      console.log(JSON.stringify(payload, null, 2))
      
      // TODO: Descomentar cuando se conecte con el backend real
      // const response = await api.patch(`/models/${modelId}/images/reorder`, payload)
      // console.log(`✅ Reorganización guardada: ${key}`, response.data)
    }
    
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log(`✅ Total de reorganizaciones: ${Object.keys(pendingReorders).length}`)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
    
    // Limpiar estado
    setPendingReorders({})
    setOriginalFloorData(null)
    setReorderMode(false)
    
    // alert('✅ Reorganización guardada (MOCK). Revisa la consola para ver los payloads.')
  } catch (error) {
    console.error('❌ Error guardando reorganizaciones:', error)
    alert(`Error: ${error.message}`)
  }
}
  const handleCancelReorder = () => {
    if (originalFloorData) {
      onChange(floor.key, 'restore', originalFloorData)
    }
    
    setPendingReorders({})
    setOriginalFloorData(null)
    setReorderMode(false)
    
    console.log('❌ [FloorTab] Reorganización cancelada, datos restaurados')
    alert('Reorganización cancelada')
  }

  const pendingCount = Object.keys(pendingReorders).length

  const MediaSection = ({ title, mediaType, icon: Icon, color, isRequired = false, showInfo = false }) => {
    const images = mediaType === 'multi' ? (floorMedia.multi || []) : (mediaToShow[mediaType] || [])

    return (
      <Paper 
        elevation={0} 
        sx={{ 
          p: 3, 
          borderRadius: 3, 
          border: '1px solid #e0e0e0',
          transition: 'all 0.3s ease',
          '&:hover': { 
            borderColor: color,
            boxShadow: `0 4px 12px ${color}15`
          }
        }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Box display="flex" alignItems="center" gap={1.5} flexWrap="wrap">
            <Icon sx={{ color, fontSize: 28 }} />
            <Typography 
              variant="h6" 
              fontWeight={700} 
              sx={{ 
                fontFamily: '"Poppins", sans-serif',
                color: theme.palette.text.primary
              }}
            >
              {title}
            </Typography>
            <Chip 
              label={images.length} 
              size="small" 
              sx={{ 
                bgcolor: `${color}20`, 
                color,
                fontWeight: 700,
                fontFamily: '"Poppins", sans-serif'
              }} 
            />
            {isRequired && (
              <Chip 
                label={t('houses6Town:model.floor.required')} 
                size="small" 
                color="warning" 
                variant="filled"
                sx={{ 
                  fontWeight: 700, 
                  fontSize: '0.65rem',
                  fontFamily: '"Poppins", sans-serif',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }} 
              />
            )}
          </Box>

          {editMode && !reorderMode && (
            <Button
              variant="outlined"
              component="label"
              size="small"
              startIcon={uploading ? <CircularProgress size={16} /> : <CloudUpload />}
              disabled={uploading}
              sx={{ 
                textTransform: 'none', 
                borderRadius: 2,
                fontWeight: 600,
                fontFamily: '"Poppins", sans-serif',
                whiteSpace: 'nowrap'
              }}
            >
              {uploading ? t('common:loading') : t('houses6Town:model.floor.addMedia')}
              <input
                type="file"
                hidden
                multiple
                accept="image/*"
                onChange={(e) => handleFileUpload(e, mediaType)}
              />
            </Button>
          )}
        </Box>

        {showInfo && currentOption && (
          <Alert 
            severity="info" 
            sx={{ 
              mb: 2, 
              borderRadius: 2, 
              fontSize: '0.85rem',
              fontFamily: '"Poppins", sans-serif',
              bgcolor: '#e3f2fd',
              color: '#1565c0',
              border: '1px solid #90caf9'
            }}
          >
            {t('houses6Town:model.floor.exteriorInfo')} <strong>{currentOption.label}</strong> {t('houses6Town:model.floor.inQuote')}
          </Alert>
        )}

        {images.length === 0 ? (
          <Box
            sx={{
              p: 4,
              textAlign: 'center',
              border: '2px dashed #e0e0e0',
              borderRadius: 3,
              bgcolor: '#fafafa',
              transition: 'all 0.3s ease',
              '&:hover': {
                borderColor: color,
                bgcolor: `${color}08`
              }
            }}
          >
            <Icon sx={{ fontSize: 48, color: '#bdbdbd', mb: 1 }} />
            <Typography 
              variant="body2" 
              color="text.secondary"
              sx={{ fontFamily: '"Poppins", sans-serif' }}
            >
              {editMode ? t('houses6Town:model.floor.uploadHint') : t('houses6Town:model.floor.noMedia')}
            </Typography>
          </Box>
        ) : (
          <FloorImageGrid
            images={images}
            floorKey={floor.key}
            mediaType={mediaType}
            color={color}
            onReorderImages={handleReorderImages}
            onDeleteImage={handleDeleteImage}
            editMode={editMode}
            enableDragDrop={reorderMode}
          />
        )}
      </Paper>
    )
  }

  return (
    <Box sx={{ p: 3 }}>
      {editMode && (
        <Box sx={{ mb: 3 }}>
          <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
            <Button
              variant={reorderMode ? 'contained' : 'outlined'}
              startIcon={<SwapVert />}
              onClick={handleToggleReorderMode}
              size="medium"
              sx={{
                borderRadius: 2,
                fontWeight: 600,
                fontFamily: '"Poppins", sans-serif',
                bgcolor: reorderMode ? theme.palette.primary.main : 'transparent',
                borderColor: theme.palette.primary.main,
                color: reorderMode ? 'white' : theme.palette.primary.main,
                '&:hover': {
                  bgcolor: reorderMode ? theme.palette.primary.dark : `${theme.palette.primary.main}15`,
                  borderColor: theme.palette.primary.dark
                }
              }}
            >
              {reorderMode ? 'Modo Reorganización Activo' : 'Reorganizar Imágenes'}
            </Button>
            
            {pendingCount > 0 && (
              <Chip
                label={`${pendingCount} cambio${pendingCount > 1 ? 's' : ''} pendiente${pendingCount > 1 ? 's' : ''}`}
                color="warning"
                size="small"
                sx={{ fontWeight: 600, fontFamily: '"Poppins", sans-serif' }}
              />
            )}
          </Box>

          {reorderMode && (
            <Alert
              severity={pendingCount > 0 ? "warning" : "info"}
              sx={{ mt: 2, borderRadius: 2 }}
              action={
                pendingCount > 0 ? (
                  <Box display="flex" gap={1}>
                    <Button
                      size="small"
                      variant="contained"
                      color="success"
                      startIcon={<Save />}
                      onClick={handleSaveReorders}
                      sx={{ fontWeight: 600, fontFamily: '"Poppins", sans-serif' }}
                    >
                      Guardar
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      color="error"
                      startIcon={<Cancel />}
                      onClick={handleCancelReorder}
                      sx={{ fontWeight: 600, fontFamily: '"Poppins", sans-serif' }}
                    >
                      Cancelar
                    </Button>
                  </Box>
                ) : null
              }
            >
              <Typography variant="body2" fontWeight={600} sx={{ fontFamily: '"Poppins", sans-serif' }}>
                {pendingCount > 0
                  ? 'Arrastra las imágenes para reorganizarlas. Haz clic en "Guardar" para aplicar los cambios.'
                  : 'Modo reorganización activo. Arrastra las imágenes para cambiar su orden.'}
              </Typography>
            </Alert>
          )}
        </Box>
      )}

      {floor.options && floor.options.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <FormControl fullWidth>
            <InputLabel 
              sx={{ 
                fontFamily: '"Poppins", sans-serif',
                fontWeight: 600
              }}
            >
              {t('houses6Town:model.floor.configOption')}
            </InputLabel>
            <Select
              value={selectedOption}
              onChange={(e) => setSelectedOption(e.target.value)}
              label={t('houses6Town:model.floor.configOption')}
              sx={{ 
                borderRadius: 2,
                fontFamily: '"Poppins", sans-serif'
              }}
            >
              {floor.options.map(option => (
                <MenuItem 
                  key={option.key} 
                  value={option.key}
                  sx={{ fontFamily: '"Poppins", sans-serif' }}
                >
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      )}

      <Grid container spacing={3}>
        {shouldShowExteriors && (
          <Grid item xs={12} md={6}>
            <MediaSection
              title={t('houses6Town:model.floor.exterior')}
              mediaType="exterior"
              icon={Home}
              color={theme.palette.success.main}
              isRequired={isExteriorRequired}
              showInfo={isExteriorRequired}
            />
          </Grid>
        )}

        <Grid item xs={12} md={6}>
          <MediaSection
            title={t('houses6Town:model.floor.renders')}
            mediaType="renders"
            icon={ImageIcon}
            color={theme.palette.primary.main}
            isRequired={mediaRequirements.required.includes('renders')}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <MediaSection
            title={t('houses6Town:model.floor.blueprints')}
            mediaType="blueprints"
            icon={Layers}
            color={theme.palette.info.main}
            isRequired={mediaRequirements.required.includes('plans')}
          />
        </Grid>
        
        <Grid item xs={12} md={6}>
          <MediaSection
            title={t('houses6Town:model.floor.isometrics')}
            mediaType="isometrics"
            icon={ViewInAr}
            color={theme.palette.secondary.main}
            isRequired={mediaRequirements.required.includes('isometric')}
          />
        </Grid>

        {floor.key !== 'level1' && (
          <Grid item xs={12}>
            <MediaSection
              title={t('houses6Town:model.floor.multi', 'Imágenes de Ideas del Piso')}
              mediaType="multi"
              icon={Layers}
              color="#9c27b0"
              isRequired={false}
            />
            {currentOption && (
              <Alert severity="info" sx={{ mt: 2, borderRadius: 2, fontSize: '0.85rem' }}>
                💡 Estas imágenes son a nivel de piso completo, no de la opción específica.
              </Alert>
            )}
          </Grid>
        )}
      </Grid>
    </Box>
  )
}

export default FloorTab