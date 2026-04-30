import { useState } from 'react'
import { Box, Paper, Typography, Radio, Checkbox, Divider, CircularProgress, Chip } from '@mui/material'
import { CheckCircle, Image as ImageIcon, ViewInAr, Map, Close, Home } from '@mui/icons-material'
import { useTheme } from '@mui/material/styles'
 
const OptionCard = ({ 
  option, 
  selected, 
  mode, 
  optionMedia, 
  loadingPreview, 
  onSelect 
}) => {
  const theme = useTheme()
  const [selectedMediaType, setSelectedMediaType] = useState('all')
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)
  
  const hasMedia = optionMedia?.media
  const media = hasMedia ? optionMedia.media : {}
  const renders = media.renders || []
  const isometrics = media.isometrics || []
  const blueprints = media.blueprints || []
  const exteriors = media.exterior || []  // ✅ NUEVO: Agregar exteriores
  const allMedia = [...exteriors, ...renders, ...isometrics, ...blueprints]  // ✅ Exteriores primero
  
  const hasImages = allMedia.length > 0
  const primaryImage = exteriors[0]?.url || renders[0]?.url || isometrics[0]?.url || blueprints[0]?.url  // ✅ Priorizar exteriores
 
  // Filtrar media según el tipo seleccionado
  const getFilteredMedia = () => {
    switch(selectedMediaType) {
      case 'exteriors':  // ✅ NUEVO
        return exteriors
      case 'renders':
        return renders
      case 'isometrics':
        return isometrics
      case 'blueprints':
        return blueprints
      default:
        return allMedia
    }
  }
 
  const filteredMedia = getFilteredMedia()
  const displayImage = filteredMedia[0]?.url || primaryImage
 
  const handleMediaTypeClick = (type, e) => {
    e.stopPropagation()
    setSelectedMediaType(type === selectedMediaType ? 'all' : type)
  }
 
  const openLightbox = (index, e) => {
    e.stopPropagation()
    setLightboxIndex(index)
    setLightboxOpen(true)
  }
 
  const closeLightbox = (e) => {
    e?.stopPropagation()
    setLightboxOpen(false)
  }
 
  const nextImage = (e) => {
    e.stopPropagation()
    setLightboxIndex((prev) => (prev + 1) % filteredMedia.length)
  }
 
  const prevImage = (e) => {
    e.stopPropagation()
    setLightboxIndex((prev) => (prev - 1 + filteredMedia.length) % filteredMedia.length)
  }
 
  return (
    <>
      <Paper
        elevation={0}
        sx={{
          cursor: 'pointer',
          borderRadius: 3,
          overflow: 'hidden',
          background: 'white',
          border: selected ? `4px solid ${theme.palette.primary.main}` : '1px solid #e8e8e8',
          transition: 'all 0.35s ease',
          position: 'relative',
          height: '100%',
          minHeight: 520,
          display: 'flex',
          flexDirection: 'column',
          '&:hover': {
            transform: 'translateY(-6px)',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.12)',
            border: `4px solid ${theme.palette.primary.light}`,
            '& .image-overlay': {
              opacity: 1
            }
          },
          '&::after': selected ? {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            border: `2px solid ${theme.palette.primary.main}`,
            borderRadius: 3,
            pointerEvents: 'none',
            animation: 'borderPulse 2s infinite',
            '@keyframes borderPulse': {
              '0%, 100%': { opacity: 0.3 },
              '50%': { opacity: 1 }
            }
          } : {}
        }}
        onClick={() => onSelect(option.id)}
      >
        {/* Badge de selección */}
        {selected && (
          <Box
            sx={{
              position: 'absolute',
              top: 16,
              right: 16,
              zIndex: 10,
              bgcolor: theme.palette.primary.main,
              color: 'white',
              borderRadius: '50%',
              width: 48,
              height: 48,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 16px rgba(140, 165, 81, 0.4)',
              animation: 'pulse 0.5s ease-in-out',
              '@keyframes pulse': {
                '0%': { transform: 'scale(0.8)', opacity: 0 },
                '50%': { transform: 'scale(1.1)' },
                '100%': { transform: 'scale(1)', opacity: 1 }
              }
            }}
          >
            <CheckCircle sx={{ fontSize: 32 }} />
          </Box>
        )}
 
        {/* Imagen principal - Altura fija */}
        <Box
          sx={{
            width: '100%',
            height: 260,
            bgcolor: '#f5f5f5',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {hasImages ? (
            <>
              <Box
                component="img"
                src={displayImage}
                alt={option.label}
                onClick={(e) => openLightbox(0, e)}
                sx={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  transition: 'transform 0.5s ease',
                  '&:hover': {
                    transform: 'scale(1.08)'
                  }
                }}
              />
              {/* Overlay con info */}
              <Box
                className="image-overlay"
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'linear-gradient(180deg, transparent 0%, rgba(140, 165, 81, 0.8) 100%)',
                  opacity: 0,
                  transition: 'opacity 0.3s ease',
                  display: 'flex',
                  alignItems: 'flex-end',
                  p: 2,
                  pointerEvents: 'none'
                }}
              >
                <Typography variant="caption" sx={{ color: 'white', fontWeight: 600 }}>
                  Click para ver galería →
                </Typography>
              </Box>
            </>
          ) : (
            <Box
              sx={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'rgba(140, 165, 81, 0.08)'
              }}
            >
              <ImageIcon sx={{ fontSize: 64, color: 'rgba(140, 165, 81, 0.3)' }} />
            </Box>
          )}
        </Box>
 
        {/* Contenido - Flex para ocupar espacio restante */}
        <Box 
          sx={{ 
            p: 3,
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}
        >
          {/* Header con título y selector */}
          <Box>
            <Box 
              display="flex" 
              alignItems="center" 
              justifyContent="space-between" 
              mb={2}
            >
              <Typography 
                variant="h6" 
                sx={{ 
                  fontFamily: '"Poppins", sans-serif', 
                  fontWeight: 700, 
                  color: theme.palette.text.primary,
                  flex: 1,
                  pr: 1
                }}
              >
                {option.label}
              </Typography>
              {mode === 'single' && (
                <Radio
                  checked={selected}
                  sx={{ 
                    p: 0,
                    '& .MuiSvgIcon-root': {
                      fontSize: 28
                    }
                  }}
                  onClick={(e) => {
                    e.stopPropagation()
                    onSelect(option.id)
                  }}
                />
              )}
              {mode === 'multiple' && (
                <Checkbox
                  checked={selected}
                  sx={{ 
                    p: 0,
                    '& .MuiSvgIcon-root': {
                      fontSize: 28
                    }
                  }}
                  onClick={(e) => {
                    e.stopPropagation()
                    onSelect(option.id)
                  }}
                />
              )}
            </Box>
 
            <Divider sx={{ mb: 2, opacity: 0.6 }} />
 
            {/* Loading state */}
            {loadingPreview && !hasMedia && (
              <Box display="flex" justifyContent="center" alignItems="center" py={3}>
                <CircularProgress size={32} />
                <Typography variant="body2" ml={2} color="text.secondary">
                  Cargando...
                </Typography>
              </Box>
            )}
 
            {/* Media badges - AHORA FUNCIONALES CON EXTERIORES */}
            {hasImages && (
              <Box 
                display="flex" 
                gap={1} 
                flexWrap="wrap" 
                mb={2}
              >
                {/* ✅ NUEVO: Chip de Exteriores */}
                {exteriors.length > 0 && (
                  <Chip
                    icon={<Home sx={{ fontSize: 14 }} />}
                    label={`${exteriors.length} Exteriores`}
                    size="small"
                    onClick={(e) => handleMediaTypeClick('exteriors', e)}
                    sx={{
                      height: 28,
                      fontSize: '0.75rem',
                      bgcolor: selectedMediaType === 'exteriors' 
                        ? theme.palette.success.main 
                        : `${theme.palette.success.main}20`,
                      color: selectedMediaType === 'exteriors' 
                        ? 'white' 
                        : theme.palette.success.main,
                      fontWeight: 600,
                      fontFamily: '"Poppins", sans-serif',
                      border: `1px solid ${theme.palette.success.main}40`,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        bgcolor: theme.palette.success.main,
                        color: 'white',
                        transform: 'scale(1.05)'
                      }
                    }}
                  />
                )}
                
                {renders.length > 0 && (
                  <Chip
                    icon={<ImageIcon sx={{ fontSize: 14 }} />}
                    label={`${renders.length} Renders`}
                    size="small"
                    onClick={(e) => handleMediaTypeClick('renders', e)}
                    sx={{
                      height: 28,
                      fontSize: '0.75rem',
                      bgcolor: selectedMediaType === 'renders' 
                        ? theme.palette.primary.main 
                        : `${theme.palette.primary.main}20`,
                      color: selectedMediaType === 'renders' 
                        ? 'white' 
                        : theme.palette.primary.main,
                      fontWeight: 600,
                      fontFamily: '"Poppins", sans-serif',
                      border: `1px solid ${theme.palette.primary.main}40`,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        bgcolor: theme.palette.primary.main,
                        color: 'white',
                        transform: 'scale(1.05)'
                      }
                    }}
                  />
                )}
                {isometrics.length > 0 && (
                  <Chip
                    icon={<ViewInAr sx={{ fontSize: 14 }} />}
                    label={`${isometrics.length} Isométricos`}
                    size="small"
                    onClick={(e) => handleMediaTypeClick('isometrics', e)}
                    sx={{
                      height: 28,
                      fontSize: '0.75rem',
                      bgcolor: selectedMediaType === 'isometrics' 
                        ? theme.palette.secondary.main 
                        : `${theme.palette.secondary.main}20`,
                      color: selectedMediaType === 'isometrics' 
                        ? 'white' 
                        : theme.palette.secondary.main,
                      fontWeight: 600,
                      fontFamily: '"Poppins", sans-serif',
                      border: `1px solid ${theme.palette.secondary.main}40`,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        bgcolor: theme.palette.secondary.main,
                        color: 'white',
                        transform: 'scale(1.05)'
                      }
                    }}
                  />
                )}
                {blueprints.length > 0 && (
                  <Chip
                    icon={<Map sx={{ fontSize: 14 }} />}
                    label={`${blueprints.length} Planos`}
                    size="small"
                    onClick={(e) => handleMediaTypeClick('blueprints', e)}
                    sx={{
                      height: 28,
                      fontSize: '0.75rem',
                      bgcolor: selectedMediaType === 'blueprints' 
                        ? theme.palette.info.main 
                        : `${theme.palette.info.main}20`,
                      color: selectedMediaType === 'blueprints' 
                        ? 'white' 
                        : theme.palette.info.main,
                      fontWeight: 600,
                      fontFamily: '"Poppins", sans-serif',
                      border: `1px solid ${theme.palette.info.main}40`,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        bgcolor: theme.palette.info.main,
                        color: 'white',
                        transform: 'scale(1.05)'
                      }
                    }}
                  />
                )}
              </Box>
            )}
          </Box>

          {/* Thumbnails gallery - Filtrados por tipo */}
          {hasImages && filteredMedia.length > 1 && (
            <Box
              sx={{
                display: 'flex',
                gap: 0.5,
                overflowX: 'auto',
                pb: 0.5,
                mt: 2,
                '&::-webkit-scrollbar': { height: '6px' },
                '&::-webkit-scrollbar-track': { 
                  background: 'rgba(0, 0, 0, 0.05)', 
                  borderRadius: '10px' 
                },
                '&::-webkit-scrollbar-thumb': { 
                  background: theme.palette.primary.main, 
                  borderRadius: '10px',
                  '&:hover': {
                    background: theme.palette.primary.dark
                  }
                }
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {filteredMedia.slice(0, 6).map((img, idx) => (
                <Box
                  key={idx}
                  component="img"
                  src={img.url}
                  alt={`Preview ${idx + 1}`}
                  onClick={(e) => openLightbox(idx, e)}
                  sx={{
                    width: 70,
                    height: 70,
                    objectFit: 'cover',
                    borderRadius: 2,
                    cursor: 'pointer',
                    flexShrink: 0,
                    border: '2px solid rgba(140, 165, 81, 0.2)',
                    transition: 'all 0.3s ease',
                    '&:hover': { 
                      transform: 'scale(1.1)', 
                      border: `2px solid ${theme.palette.primary.main}`,
                      boxShadow: '0 4px 12px rgba(140, 165, 81, 0.3)'
                    }
                  }}
                />
              ))}
              {filteredMedia.length > 6 && (
                <Box
                  sx={{
                    width: 70,
                    height: 70,
                    borderRadius: 2,
                    bgcolor: 'rgba(140, 165, 81, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    border: '2px solid rgba(140, 165, 81, 0.2)',
                    cursor: 'pointer'
                  }}
                  onClick={(e) => openLightbox(6, e)}
                >
                  <Typography 
                    variant="caption" 
                    fontWeight={700} 
                    color="primary"
                    sx={{ fontFamily: '"Poppins", sans-serif' }}
                  >
                    +{filteredMedia.length - 6}
                  </Typography>
                </Box>
              )}
            </Box>
          )}
        </Box>
      </Paper>

      {/* LIGHTBOX CUSTOM */}
      {lightboxOpen && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            bgcolor: 'rgba(0, 0, 0, 0.95)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            animation: 'fadeIn 0.3s ease',
            '@keyframes fadeIn': {
              from: { opacity: 0 },
              to: { opacity: 1 }
            }
          }}
          onClick={closeLightbox}
        >
          {/* Botón cerrar */}
          <Box
            sx={{
              position: 'absolute',
              top: 20,
              right: 20,
              color: 'white',
              cursor: 'pointer',
              zIndex: 10000,
              bgcolor: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '50%',
              width: 48,
              height: 48,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease',
              '&:hover': {
                bgcolor: 'rgba(255, 255, 255, 0.2)',
                transform: 'scale(1.1)'
              }
            }}
            onClick={closeLightbox}
          >
            <Close sx={{ fontSize: 32 }} />
          </Box>

          {/* Contador */}
          <Box
            sx={{
              position: 'absolute',
              top: 20,
              left: '50%',
              transform: 'translateX(-50%)',
              color: 'white',
              bgcolor: 'rgba(0, 0, 0, 0.5)',
              px: 3,
              py: 1,
              borderRadius: 2,
              fontFamily: '"Poppins", sans-serif',
              fontWeight: 600
            }}
          >
            {lightboxIndex + 1} / {filteredMedia.length}
          </Box>

          {/* Navegación anterior */}
          {filteredMedia.length > 1 && (
            <Box
              sx={{
                position: 'absolute',
                left: 20,
                color: 'white',
                cursor: 'pointer',
                fontSize: 48,
                userSelect: 'none',
                bgcolor: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '50%',
                width: 56,
                height: 56,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease',
                '&:hover': {
                  bgcolor: 'rgba(255, 255, 255, 0.2)',
                  transform: 'scale(1.1)'
                }
              }}
              onClick={prevImage}
            >
              ‹
            </Box>
          )}

          {/* Imagen principal */}
          <Box
            component="img"
            src={filteredMedia[lightboxIndex]?.url}
            alt={`Image ${lightboxIndex + 1}`}
            sx={{
              maxWidth: '90%',
              maxHeight: '90%',
              objectFit: 'contain',
              animation: 'zoomIn 0.3s ease',
              '@keyframes zoomIn': {
                from: { transform: 'scale(0.8)', opacity: 0 },
                to: { transform: 'scale(1)', opacity: 1 }
              }
            }}
            onClick={(e) => e.stopPropagation()}
          />

          {/* Navegación siguiente */}
          {filteredMedia.length > 1 && (
            <Box
              sx={{
                position: 'absolute',
                right: 20,
                color: 'white',
                cursor: 'pointer',
                fontSize: 48,
                userSelect: 'none',
                bgcolor: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '50%',
                width: 56,
                height: 56,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease',
                '&:hover': {
                  bgcolor: 'rgba(255, 255, 255, 0.2)',
                  transform: 'scale(1.1)'
                }
              }}
              onClick={nextImage}
            >
              ›
            </Box>
          )}

          {/* Thumbnails en lightbox */}
          <Box
            sx={{
              position: 'absolute',
              bottom: 20,
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              gap: 1,
              maxWidth: '90%',
              overflowX: 'auto',
              pb: 1,
              '&::-webkit-scrollbar': { height: '4px' },
              '&::-webkit-scrollbar-track': { background: 'rgba(255, 255, 255, 0.1)' },
              '&::-webkit-scrollbar-thumb': { background: 'rgba(255, 255, 255, 0.3)' }
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {filteredMedia.map((img, idx) => (
              <Box
                key={idx}
                component="img"
                src={img.url}
                alt={`Thumb ${idx + 1}`}
                onClick={(e) => {
                  e.stopPropagation()
                  setLightboxIndex(idx)
                }}
                sx={{
                  width: 60,
                  height: 60,
                  objectFit: 'cover',
                  borderRadius: 1,
                  cursor: 'pointer',
                  border: idx === lightboxIndex 
                    ? '3px solid white' 
                    : '2px solid rgba(255, 255, 255, 0.3)',
                  opacity: idx === lightboxIndex ? 1 : 0.6,
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    opacity: 1,
                    transform: 'scale(1.1)'
                  }
                }}
              />
            ))}
          </Box>
        </Box>
      )}
    </>
  )
}

export default OptionCard