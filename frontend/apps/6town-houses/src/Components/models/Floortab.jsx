import { useState, useMemo } from 'react'
import {
  Box, Grid, Typography, Paper, Button, IconButton, Chip,
  Select, MenuItem, FormControl, InputLabel, ImageList, ImageListItem,
  ImageListItemBar, Tooltip, CircularProgress, Alert
} from '@mui/material'
import {
  CloudUpload, Delete, Image as ImageIcon, Layers, ViewInAr, Home
} from '@mui/icons-material'
import { useTheme } from '@mui/material/styles'
import { useTranslation } from 'react-i18next'
import uploadService from '@shared/services/uploadService'

const FloorTab = ({ floor, editMode, onChange, catalogConfig, t }) => {
  const theme = useTheme()
  const [selectedOption, setSelectedOption] = useState(floor?.options?.[0]?.key || null)
  const [uploading, setUploading] = useState(false)

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
    exterior: []
  }

  // ✅ Determinar qué tipos de media se requieren/permiten para esta opción
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
      
      const newMedia = {
        ...mediaToShow,
        [mediaType]: [...(mediaToShow[mediaType] || []), ...urls.map(url => ({ url, isPublic: true }))]
      }

      if (currentOption) {
        onChange(floor.key, 'optionMedia', { optionKey: selectedOption, media: newMedia })
      } else {
        onChange(floor.key, 'media', newMedia)
      }
    } catch (err) {
      console.error('Error uploading files:', err)
      alert(`${t('houses6Town:model.messages.errorSaving')}: ${err.message}`)
    } finally {
      setUploading(false)
    }
  }

  const handleDeleteImage = (mediaType, index) => {
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

  const MediaSection = ({ title, mediaType, icon: Icon, color, isRequired = false, showInfo = false }) => {
    const images = mediaToShow[mediaType] || []

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

          {editMode && (
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
              {editMode 
                ? t('houses6Town:model.floor.uploadHint') 
                : t('houses6Town:model.floor.noMedia')
              }
            </Typography>
          </Box>
        ) : (
          <ImageList cols={3} gap={12} sx={{ borderRadius: 2, overflow: 'hidden' }}>
            {images.map((img, index) => (
              <ImageListItem 
                key={index} 
                sx={{ 
                  borderRadius: 2, 
                  overflow: 'hidden',
                  transition: 'transform 0.3s ease',
                  '&:hover': {
                    transform: 'scale(1.02)',
                    boxShadow: `0 8px 16px ${color}30`
                  }
                }}
              >
                <img
                  src={img.url}
                  alt={`${title} ${index + 1}`}
                  loading="lazy"
                  style={{ height: 180, objectFit: 'cover' }}
                />
                {editMode && (
                  <ImageListItemBar
                    position="bottom"
                    sx={{ 
                      background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 100%)',
                      borderRadius: 2
                    }}
                    actionIcon={
                      <Tooltip title={t('houses6Town:model.floor.removeMedia')}>
                        <IconButton
                          size="small"
                          sx={{ 
                            color: 'white',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              bgcolor: 'rgba(255, 0, 0, 0.3)',
                              transform: 'scale(1.1)'
                            }
                          }}
                          onClick={() => handleDeleteImage(mediaType, index)}
                        >
                          <Delete />
                        </IconButton>
                      </Tooltip>
                    }
                  />
                )}
              </ImageListItem>
            ))}
          </ImageList>
        )}
      </Paper>
    )
  }

  return (
    <Box sx={{ p: 4 }}>
      {/* Encabezado del piso */}
      <Box mb={4}>
        <Typography 
          variant="h5" 
          fontWeight={700} 
          gutterBottom 
          sx={{ 
            fontFamily: '"Poppins", sans-serif',
            color: theme.palette.text.primary
          }}
        >
          {floor.label}
        </Typography>
        <Typography 
          variant="body2" 
          color="text.secondary" 
          sx={{ 
            fontFamily: '"Poppins", sans-serif',
            fontSize: '0.9rem'
          }}
        >
          {t('houses6Town:model.floor.level', { number: floor.level })} • {' '}
          {floor.isCustomizable 
            ? t('houses6Town:model.floor.customizable') 
            : t('houses6Town:model.floor.standard')
          }
        </Typography>
      </Box>

      {/* Selector de opciones de configuración */}
      {floor.isCustomizable && floor.options?.length > 0 && (
        <Box mb={4}>
          <FormControl fullWidth sx={{ maxWidth: 450 }}>
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
                borderRadius: 3,
                fontFamily: '"Poppins", sans-serif',
                '& .MuiOutlinedInput-root': {
                  '&.Mui-focused fieldset': {
                    borderColor: theme.palette.primary.main,
                    borderWidth: '2px'
                  }
                }
              }}
            >
              {floor.options.map((option) => (
                <MenuItem key={option.key} value={option.key}>
                  <Box display="flex" justifyContent="space-between" width="100%" gap={2}>
                    <span style={{ fontFamily: '"Poppins", sans-serif', fontWeight: 600 }}>
                      {option.label}
                    </span>
                    <Chip
                      label={t('houses6Town:model.floor.included')}
                      size="small"
                      color="default"
                      variant="outlined"
                      sx={{ 
                        fontFamily: '"Poppins", sans-serif',
                        fontWeight: 600,
                        fontSize: '0.65rem'
                      }}
                    />
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      )}

      {/* Grid de secciones de media */}
      <Grid container spacing={3}>
        {/* ✅ EXTERIORES - Mostrar primero si es requerido para level1 */}
        {shouldShowExteriors && (
          <Grid item xs={12} md={6}>
            <MediaSection
              title={t('houses6Town:model.floor.exterior')}
              mediaType="exterior"
              icon={Home}
              color={theme.palette.success.main}
              isRequired={isExteriorRequired}
              showInfo={true}
            />
          </Grid>
        )}

        {/* RENDERS */}
        <Grid item xs={12} md={6}>
          <MediaSection
            title={t('houses6Town:model.floor.renders')}
            mediaType="renders"
            icon={ImageIcon}
            color={theme.palette.primary.main}
            isRequired={mediaRequirements.required.includes('renders')}
          />
        </Grid>
        
        {/* PLANOS */}
        <Grid item xs={12} md={6}>
          <MediaSection
            title={t('houses6Town:model.floor.blueprints')}
            mediaType="blueprints"
            icon={Layers}
            color={theme.palette.info.main}
            isRequired={mediaRequirements.required.includes('plans')}
          />
        </Grid>
        
        {/* ISOMÉTRICOS */}
        <Grid item xs={12} md={6}>
          <MediaSection
            title={t('houses6Town:model.floor.isometrics')}
            mediaType="isometrics"
            icon={ViewInAr}
            color={theme.palette.secondary.main}
            isRequired={mediaRequirements.required.includes('isometric')}
          />
        </Grid>
      </Grid>
    </Box>
  )
}

export default FloorTab