// @/Users/oficina/MV-CRM/CustomerService/frontend/shared/components/propertyDetails/PropertyDetailsTab.jsx

import { useState, useEffect } from 'react'
import {
  Box, Paper, Typography, Chip, IconButton, Grid, Divider
} from '@mui/material'
import {
  Home, CheckCircle, ZoomIn, Image as ImageIcon,
  LocationOn, Layers, Apartment, Map as MapIcon,
  ViewInAr as ViewInArIcon
} from '@mui/icons-material'
import { motion } from 'framer-motion'
import { useTheme } from '@mui/material/styles'

const PropertyDetailsTab = ({ propertyDetails }) => {
  const theme = useTheme()
  const [carouselIndex, setCarouselIndex] = useState(0)
  const [selectedFloorKey, setSelectedFloorKey] = useState(null)
 
  const mediaByFloor = propertyDetails?.mediaByFloor || []
  const selectedRenderType = propertyDetails?.selectedRenderType || 'basic'
  const building = propertyDetails?.building || {}
  const lot = propertyDetails?.lot || {}
  const model = propertyDetails?.model || {}
  const facade = propertyDetails?.facade || {}
  const selectedOptions = propertyDetails?.selectedOptions || {}
 
  useEffect(() => {
    if (mediaByFloor.length > 0 && !selectedFloorKey) {
      setSelectedFloorKey(mediaByFloor[0].floorKey)
    }
  }, [mediaByFloor])
 
const currentFloorData = mediaByFloor.find(f => f.floorKey === selectedFloorKey) || mediaByFloor[0]
const selectedRenders = (currentFloorData?.media?.renders || []).map(r => r.url || r)
  const handleThumbSelect = (idx) => setCarouselIndex(idx)
 
  useEffect(() => {
    setCarouselIndex(0)
  }, [selectedRenders.length, selectedFloorKey])

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2, sm: 3, md: 4 },
        mt: 3,
        borderRadius: 3,
        bgcolor: 'white',
        border: `1px solid ${theme.palette.cardBorder}`
      }}
    >
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography
            variant="h5"
            sx={{
              fontFamily: '"Poppins", sans-serif',
              color: theme.palette.primary.main,
              fontWeight: 700,
              fontSize: { xs: '1.25rem', sm: '1.5rem' },
              mb: 0.5
            }}
          >
            {building?.name || 'Property'}
          </Typography>
          <Typography
            variant="body2"
            sx={{
              fontFamily: '"Poppins", sans-serif',
              color: theme.palette.text.secondary,
              fontSize: '0.9rem'
            }}
          >
            {model?.model || 'Model'} • Lot {lot?.number || 'N/A'}
          </Typography>
        </Box>

        <Chip
          icon={<Home sx={{ fontSize: 18 }} />}
          label={selectedRenderType === 'basic' ? 'Basic Package' : 'Upgrade Package'}
          sx={{
            height: 36,
            fontSize: '0.85rem',
            fontWeight: 700,
            fontFamily: '"Poppins", sans-serif',
            bgcolor: selectedRenderType === 'basic' 
              ? 'rgba(67,160,71,0.12)' 
              : theme.palette.chipAdmin.bg,
            color: selectedRenderType === 'basic' ? theme.palette.success.main : theme.palette.chipAdmin.color,
            border: `2px solid ${selectedRenderType === 'basic' ? theme.palette.success.main : theme.palette.chipAdmin.color}`,
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}
        />
      </Box>

      {/* Floor Selector */}
      {mediaByFloor.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600, fontFamily: '"Poppins", sans-serif' }}>
            Selecciona Piso
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {mediaByFloor.map((floor) => (
              <Chip
                key={floor.floorKey}
                label={floor.label}
                onClick={() => setSelectedFloorKey(floor.floorKey)}
                icon={<Layers sx={{ fontSize: 16 }} />}
                sx={{
                  height: 32,
                  fontSize: '0.85rem',
                  fontWeight: selectedFloorKey === floor.floorKey ? 700 : 500,
                  fontFamily: '"Poppins", sans-serif',
                  bgcolor: selectedFloorKey === floor.floorKey 
                    ? theme.palette.primary.main 
                    : 'rgba(0,0,0,0.08)',
                  color: selectedFloorKey === floor.floorKey ? 'white' : theme.palette.text.primary,
                  '&:hover': {
                    bgcolor: selectedFloorKey === floor.floorKey 
                      ? theme.palette.primary.dark 
                      : 'rgba(0,0,0,0.12)',
                  }
                }}
              />
            ))}
          </Box>
          {currentFloorData?.selectedOptionKey && (
            <Typography variant="caption" sx={{ mt: 1, display: 'block', color: theme.palette.text.secondary }}>
              Opción seleccionada: <strong>{currentFloorData.selectedOptionKey}</strong>
            </Typography>
          )}
        </Box>
      )}

      {/* Gallery */}
      <Box
        sx={{
          display: 'flex',
          gap: { xs: 1.5, sm: 2 },
          mb: 4,
          height: { xs: 280, sm: 380, md: 460, lg: 520 },
        }}
      >
        {/* Main image */}
        <Box
          sx={{
            flex: 3,
            bgcolor: '#000',
            borderRadius: 3,
            position: 'relative',
            overflow: 'hidden',
            minWidth: 0,
            border: `2px solid ${theme.palette.cardBorder}`
          }}
        >
          {selectedRenders.length > 0 ? (
            <motion.img
              key={carouselIndex}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              src={selectedRenders[carouselIndex]}
              alt={`property-render-${carouselIndex}`}
              style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
            />
          ) : (
            <Box
              display="flex"
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
              height="100%"
              px={2}
            >
              <Home sx={{ fontSize: { xs: 40, sm: 60 }, color: '#666', mb: 2 }} />
              <Typography
                color="white"
                sx={{ fontFamily: '"Poppins", sans-serif', fontSize: { xs: '0.85rem', sm: '1rem' } }}
              >
                No property renders available
              </Typography>
            </Box>
          )}

          {selectedRenders.length > 0 && (
            <>
              <IconButton
                sx={{
                  position: 'absolute',
                  top: { xs: 8, sm: 12 },
                  right: { xs: 8, sm: 12 },
                  bgcolor: 'rgba(255,255,255,0.95)',
                  width: { xs: 32, sm: 38 },
                  height: { xs: 32, sm: 38 },
                  '&:hover': { bgcolor: 'white', transform: 'scale(1.1)' }
                }}
              >
                <ZoomIn sx={{ fontSize: { xs: 18, sm: 22 } }} />
              </IconButton>

              <Box
                sx={{
                  position: 'absolute',
                  bottom: 12,
                  left: 12,
                  bgcolor: 'rgba(0,0,0,0.7)',
                  color: 'white',
                  px: 1.5,
                  py: 0.5,
                  borderRadius: 2,
                  fontFamily: '"Poppins", sans-serif',
                  fontSize: '0.75rem',
                  fontWeight: 600
                }}
              >
                {carouselIndex + 1} / {selectedRenders.length}
              </Box>
            </>
          )}
        </Box>

        {/* Thumbnails */}
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: { xs: 0.8, sm: 1 },
            overflowY: 'auto',
            minWidth: 0,
            pr: 0.5,
            '&::-webkit-scrollbar': { width: 4 },
            '&::-webkit-scrollbar-track': { bgcolor: 'transparent' },
            '&::-webkit-scrollbar-thumb': {
              bgcolor: theme.palette.primary.main + '33',
              borderRadius: 2,
            },
          }}
        >
          {selectedRenders.length === 0 ? (
            <Box
              display="flex"
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
              height="100%"
            >
              <ImageIcon sx={{ fontSize: 32, color: '#ccc', mb: 1 }} />
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ fontFamily: '"Poppins", sans-serif', fontSize: '0.7rem', textAlign: 'center' }}
              >
                No images available
              </Typography>
            </Box>
          ) : (
            selectedRenders.map((url, i) => (
              <motion.div
                key={`thumb-${i}`}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                style={{ flexShrink: 0 }}
              >
                <Box
                  onClick={() => handleThumbSelect(i)}
                  sx={{
                    width: '100%',
                    aspectRatio: '16/9',
                    borderRadius: 1.5,
                    overflow: 'hidden',
                    cursor: 'pointer',
                    border: i === carouselIndex
                      ? `2.5px solid ${theme.palette.primary.main}`
                      : `1.5px solid ${theme.palette.cardBorder}`,
                    boxShadow: i === carouselIndex
                      ? `0 4px 16px ${theme.palette.primary.main}4D`
                      : 'none',
                    transition: 'all 0.25s ease',
                    position: 'relative',
                    '&:hover': {
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                      borderColor: i === carouselIndex ? theme.palette.primary.main : theme.palette.secondary.main,
                    }
                  }}
                >
                  <img
                    src={url}
                    alt={`thumb-${i}`}
                    loading="lazy"
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  />
                  {i === carouselIndex && (
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 4,
                        right: 4,
                        bgcolor: theme.palette.primary.main,
                        borderRadius: '50%',
                        width: 18,
                        height: 18,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: `0 2px 8px ${theme.palette.primary.main}66`
                      }}
                    >
                      <CheckCircle sx={{ fontSize: 12, color: 'white' }} />
                    </Box>
                  )}
                </Box>
              </motion.div>
            ))
          )}
        </Box>
      </Box>

      {/* Property Specifications */}
      <Box sx={{ mt: 4 }}>
        <Box mb={3}>
          <Box display="flex" alignItems="center" gap={2} mb={1.5} flexWrap="wrap">
            <Typography
              variant="h6"
              sx={{
                fontFamily: '"Poppins", sans-serif',
                color: theme.palette.primary.main,
                fontWeight: 700,
                fontSize: { xs: '1.1rem', sm: '1.25rem' },
                letterSpacing: '0.5px',
              }}
            >
              Property Specifications
            </Typography>
          </Box>
          <Box sx={{ width: 60, height: 3, bgcolor: theme.palette.secondary.main, borderRadius: 1 }} />
        </Box>

        <Grid container spacing={3}>
          {/* Lot */}
          <Grid item xs={12} sm={6} md={4}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Paper
                elevation={0}
                sx={{
                  p: 2.5,
                  borderRadius: 2,
                  border: `1px solid ${theme.palette.cardBorder}`,
                  bgcolor: theme.palette.cardBg,
                  height: '100%'
                }}
              >
                <Box display="flex" alignItems="center" gap={1.5} mb={1}>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: 2,
                      bgcolor: theme.palette.chipAdmin.bg,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <LocationOn sx={{ color: theme.palette.chipAdmin.color, fontSize: 22 }} />
                  </Box>
                  <Typography
                    variant="caption"
                    sx={{
                      fontFamily: '"Poppins", sans-serif',
                      color: theme.palette.text.secondary,
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}
                  >
                    Lot
                  </Typography>
                </Box>
                <Typography
                  sx={{
                    fontFamily: '"Poppins", sans-serif',
                    color: theme.palette.primary.main,
                    fontSize: '1.5rem',
                    fontWeight: 700
                  }}
                >
                  #{lot?.number || 'N/A'}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    fontFamily: '"Poppins", sans-serif',
                    color: theme.palette.text.secondary,
                    fontSize: '0.7rem'
                  }}
                >
                  ${lot?.price?.toLocaleString() || '0'}
                </Typography>
              </Paper>
            </motion.div>
          </Grid>

          {/* Model */}
          <Grid item xs={12} sm={6} md={4}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Paper
                elevation={0}
                sx={{
                  p: 2.5,
                  borderRadius: 2,
                  border: `1px solid ${theme.palette.cardBorder}`,
                  bgcolor: theme.palette.cardBg,
                  height: '100%'
                }}
              >
                <Box display="flex" alignItems="center" gap={1.5} mb={1}>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: 2,
                      bgcolor: 'rgba(67,160,71,0.12)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Home sx={{ color: theme.palette.success.main, fontSize: 22 }} />
                  </Box>
                  <Typography
                    variant="caption"
                    sx={{
                      fontFamily: '"Poppins", sans-serif',
                      color: theme.palette.text.secondary,
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}
                  >
                    Model
                  </Typography>
                </Box>
                <Typography
                  sx={{
                    fontFamily: '"Poppins", sans-serif',
                    color: theme.palette.primary.main,
                    fontSize: '1.1rem',
                    fontWeight: 700
                  }}
                >
                  {model?.model || 'N/A'}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    fontFamily: '"Poppins", sans-serif',
                    color: theme.palette.text.secondary,
                    fontSize: '0.7rem'
                  }}
                >
                  ${model?.price?.toLocaleString() || '0'}
                </Typography>
              </Paper>
            </motion.div>
          </Grid>

          {/* Facade */}
          {facade && facade._id && (
            <Grid item xs={12} sm={6} md={4}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Paper
                  elevation={0}
                  sx={{
                    p: 2.5,
                    borderRadius: 2,
                    border: `1px solid ${theme.palette.cardBorder}`,
                    bgcolor: theme.palette.cardBg,
                    height: '100%'
                  }}
                >
                  <Box display="flex" alignItems="center" gap={1.5} mb={1}>
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: 2,
                        bgcolor: 'rgba(33,150,243,0.12)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <Layers sx={{ color: theme.palette.info.main, fontSize: 22 }} />
                    </Box>
                    <Typography
                      variant="caption"
                      sx={{
                        fontFamily: '"Poppins", sans-serif',
                        color: theme.palette.text.secondary,
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}
                    >
                      Facade
                    </Typography>
                  </Box>
                  <Typography
                    sx={{
                      fontFamily: '"Poppins", sans-serif',
                      color: theme.palette.primary.main,
                      fontSize: '1.1rem',
                      fontWeight: 700
                    }}
                  >
                    {facade?.title || 'N/A'}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      fontFamily: '"Poppins", sans-serif',
                      color: theme.palette.text.secondary,
                      fontSize: '0.7rem'
                    }}
                  >
                    ${facade?.price?.toLocaleString() || '0'}
                  </Typography>
                </Paper>
              </motion.div>
            </Grid>
          )}
        </Grid>

        {/* Selected Options */}
{/* Selected Options - Propuesta 5: Building Visualization (OPTIMIZADA) */}
{mediaByFloor && mediaByFloor.length > 0 && (
  <Box sx={{ mt: 4 }}>
    <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
      <Box display="flex" alignItems="center" gap={2}>
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: 2,
            background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: `0 4px 12px ${theme.palette.primary.main}44`
          }}
        >
          <Apartment sx={{ color: 'white', fontSize: 28 }} />
        </Box>
        <Box>
          <Typography variant="h6" sx={{ fontFamily: '"Poppins", sans-serif', fontWeight: 700, color: theme.palette.primary.main }}>
            Estructura del Edificio
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {mediaByFloor.filter(f => f.selectedOptionKey).length} nivel(es) configurado(s)
          </Typography>
        </Box>
      </Box>
    </Box>

    {/* Grid de pisos - Mejor distribución */}
    <Grid container spacing={2}>
      {mediaByFloor
        .filter(floor => floor.selectedOptionKey)
        .sort((a, b) => a.level - b.level)
        .map((floorData, index) => {
          const colors = [
            { main: theme.palette.primary.main, light: theme.palette.primary.light, bg: theme.palette.primary.light + '15' },
            { main: theme.palette.secondary.main, light: theme.palette.secondary.light, bg: theme.palette.secondary.light + '15' },
            { main: theme.palette.success.main, light: theme.palette.success.light, bg: theme.palette.success.light + '15' }
          ]
          const color = colors[index % colors.length]
          const isGroundFloor = floorData.level === 1

          return (
            <Grid item xs={12} md={6} lg={4} key={floorData.floorKey}>
              <Paper
                elevation={0}
                sx={{
                  p: 2.5,
                  borderRadius: 3,
                  border: `2px solid ${color.light}44`,
                  bgcolor: color.bg,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: `0 8px 24px ${color.main}33`,
                    border: `2px solid ${color.main}`
                  }
                }}
              >
                {/* Header con número de piso y badge */}
                <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: 2,
                      bgcolor: color.main,
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: '1.5rem',
                      boxShadow: `0 4px 8px ${color.main}44`
                    }}
                  >
                    {floorData.level}
                  </Box>
                  <Chip
                    label={isGroundFloor ? 'Planta Baja' : floorData.label}
                    size="small"
                    sx={{
                      bgcolor: color.main,
                      color: 'white',
                      fontWeight: 600,
                      height: 28
                    }}
                  />
                </Box>

                {/* Título de la opción */}
                <Typography variant="h6" sx={{ fontFamily: '"Poppins", sans-serif', fontWeight: 700, color: theme.palette.text.primary, mb: 1 }}>
                  {floorData.selectedOptionKey.split('-').map(word => 
                    word.charAt(0).toUpperCase() + word.slice(1)
                  ).join(' ')}
                </Typography>

                <Divider sx={{ my: 2, borderColor: `${color.main}33` }} />

                {/* Info compacta en grid */}
                <Box sx={{ flex: 1 }}>
                  <Box display="flex" alignItems="center" gap={1} mb={1.5}>
                    <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: color.main }} />
                    <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 600, fontSize: '0.65rem' }}>
                      Opción:
                    </Typography>
                    <Typography variant="caption" fontWeight={600} sx={{ ml: 0.5 }}>
                      {floorData.selectedOptionKey}
                    </Typography>
                  </Box>

                  {/* Media badges compactos */}
                  <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                    {floorData.media.renders?.length > 0 && (
                      <Chip
                        icon={<ImageIcon sx={{ fontSize: 14 }} />}
                        label={`${floorData.media.renders.length}`}
                        size="small"
                        sx={{
                          height: 24,
                          fontSize: '0.7rem',
                          bgcolor: `${color.main}11`,
                          color: color.main,
                          border: `1px solid ${color.main}33`,
                          '& .MuiChip-icon': { ml: 0.5 }
                        }}
                      />
                    )}
                    {floorData.media.blueprints?.length > 0 && (
                      <Chip
                        icon={<MapIcon sx={{ fontSize: 14 }} />}
                        label={`${floorData.media.blueprints.length}`}
                        size="small"
                        sx={{
                          height: 24,
                          fontSize: '0.7rem',
                          bgcolor: `${color.main}11`,
                          color: color.main,
                          border: `1px solid ${color.main}33`,
                          '& .MuiChip-icon': { ml: 0.5 }
                        }}
                      />
                    )}
                    {floorData.media.isometrics?.length > 0 && (
                      <Chip
                        icon={<ViewInArIcon sx={{ fontSize: 14 }} />}
                        label={`${floorData.media.isometrics.length}`}
                        size="small"
                        sx={{
                          height: 24,
                          fontSize: '0.7rem',
                          bgcolor: `${color.main}11`,
                          color: color.main,
                          border: `1px solid ${color.main}33`,
                          '& .MuiChip-icon': { ml: 0.5 }
                        }}
                      />
                    )}
                  </Box>
                </Box>

                {/* Check indicator */}
                <Box display="flex" justifyContent="flex-end" mt={2}>
                  <CheckCircle sx={{ color: color.main, fontSize: 20 }} />
                </Box>
              </Paper>
            </Grid>
          )
        })}
    </Grid>
  </Box>
)}
      </Box>
    </Paper>
  )
}

export default PropertyDetailsTab