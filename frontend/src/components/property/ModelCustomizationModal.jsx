import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  IconButton,
  Button,
  Paper,
  Divider,
  Chip,
  ToggleButtonGroup,
  ToggleButton,
  Tabs,
  Tab,
  Switch,
  FormControlLabel
} from '@mui/material'
import {
  Close,
  CheckCircle,
  KeyboardArrowLeft,
  KeyboardArrowRight,
  Balcony as BalconyIcon,
  Upgrade as UpgradeIcon,
  Storage as StorageIcon,
  Sync,
  SyncDisabled,
  Home as HomeIcon
} from '@mui/icons-material'

import { getGalleryCategories } from '../../services/modelImageService'
import { useTheme, useMediaQuery } from '@mui/material'

const ROOM_TYPES = [
  { id: 'bedroom_closet', label: 'Bed w/ Closet', icon: '🛏️' },
  { id: 'bedroom_no_closet', label: 'Bed w/o Closet', icon: '🛌' },
  { id: 'bathroom', label: 'Bathroom', icon: '🚿' },
  { id: 'laundry', label: 'Laundry', icon: '🧺' },
  { id: 'dining', label: 'Dining', icon: '🍽️' },
  { id: 'living', label: 'Living', icon: '🛋️' },
  { id: 'kitchen', label: 'Kitchen', icon: '👨‍🍳' },
  { id: 'hallway', label: 'Hallway', icon: '🚪' },
  { id: 'garage', label: 'Garage', icon: '🚗' },
  { id: 'balcony', label: 'Balcony', icon: '🌳' },
  { id: 'patio', label: 'Patio', icon: '🏡' },
  { id: 'closet', label: 'Closet', icon: '👔' }
]

const ModelCustomizationModal = ({ open, model, onClose, onConfirm, initialOptions = {} }) => {
  const MODEL_10_ID = "6977c7bbd1f24768968719de";
  const isModel10 = model?._id === MODEL_10_ID;

  const balconyLabels = isModel10
    ? {
        label: "Study",
        icon: HomeIcon,
        chipLabel: "Study Option",
        title: "Study Addition",
        description: "Flexible space perfect for home office or study area",
        categoryPrefix: "With Study"
      }
    : {
        label: "Balcony",
        icon: BalconyIcon,
        chipLabel: "Balcony option",
        title: "Balcony Addition",
        description: "Outdoor living space with scenic views",
        categoryPrefix: "Balcony"
      };

  const [options, setOptions] = useState({
    upgrade: initialOptions.upgrade || false,
    balcony: initialOptions.balcony || false,
    storage: initialOptions.storage || false
  })

  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  const [viewType, setViewType] = useState('all')
  const [selectedRoomType, setSelectedRoomType] = useState('all')
  const [leftImageIndex, setLeftImageIndex] = useState(0)
  const [rightImageIndex, setRightImageIndex] = useState(0)
  const [isSynced, setIsSynced] = useState(true)

  useEffect(() => {
    if (open) {
      setLeftImageIndex(0)
      setRightImageIndex(0)
      setViewType('all')
      setSelectedRoomType('all')
      setIsSynced(true)
    }
  }, [open])

  useEffect(() => {
    setLeftImageIndex(0)
    setRightImageIndex(0)
  }, [viewType, selectedRoomType, options.upgrade, options.balcony, options.storage])

  useEffect(() => {
    if (isSynced) {
      setRightImageIndex(leftImageIndex)
    }
  }, [leftImageIndex, isSynced])

  if (!model) return null

  const categories = getGalleryCategories(model)
  const baseCategory = categories.find(cat => cat.key === 'base')
  
  let customKey = 'base'
  if (options.upgrade && options.balcony) customKey = 'upgrade-balcony'
  else if (options.upgrade) customKey = 'upgrade'
  else if (options.balcony) customKey = 'base-balcony'
  
  const customCategory = categories.find(cat => cat.key === customKey) || baseCategory

  const getAdjustedCategoryLabel = (label) => {
    if (!isModel10) return label;
    return label
      .replace(/Balcony/gi, 'Study')
      .replace(/balcony/gi, 'study');
  };

  const processImages = (cat) => [
    ...(cat.exteriorImages || []).map(url => ({ url, type: 'exterior', roomType: 'general' })),
    ...(cat.interiorImages || []).map(img =>
      typeof img === 'string'
        ? { url: img, type: 'interior', roomType: 'general' }
        : { url: img.url || img, type: 'interior', roomType: img.roomType || 'general' }
    )
  ]

  const filterImages = (images) => {
    let filtered = [...images]
    if (viewType === 'exterior') {
      filtered = filtered.filter(img => img.type === 'exterior')
    } else if (viewType === 'interior') {
      filtered = filtered.filter(img => img.type === 'interior')
      if (selectedRoomType !== 'all') {
        filtered = filtered.filter(img => img.roomType === selectedRoomType)
      }
    }
    return filtered
  }

  const leftData = {
    images: filterImages(processImages(baseCategory)),
    label: getAdjustedCategoryLabel(isModel10 ? "With Comedor" : baseCategory.label)
  }
  const rightData = {
    images: filterImages(processImages(customCategory)),
    label: getAdjustedCategoryLabel(customCategory.label)
  }

  const toggleOption = (option) => {
    setOptions(prev => ({ ...prev, [option]: !prev[option] }))
  }

  const upgradePrice = model.upgradePrice || model.upgrades?.[0]?.price || 0
  const balconyPrice = model.balconyPrice || model.balconies?.[0]?.price || 0
  const storagePrice = model.storagePrice || model.storages?.[0]?.price || 0

  const calculatePrice = () => {
    let total = model.price || 0
    if (options.upgrade) total += upgradePrice
    if (options.balcony) total += balconyPrice
    if (options.storage) total += storagePrice
    return total
  }

  const handleConfirm = () => {
    onConfirm({
      model,
      options,
      totalPrice: calculatePrice()
    })
  }

  const handleLeftPrev = () => {
    const newIndex = leftImageIndex > 0 ? leftImageIndex - 1 : leftData.images.length - 1
    setLeftImageIndex(newIndex)
  }

  const handleLeftNext = () => {
    const newIndex = leftImageIndex < leftData.images.length - 1 ? leftImageIndex + 1 : 0
    setLeftImageIndex(newIndex)
  }

  const handleRightPrev = () => {
    const newIndex = rightImageIndex > 0 ? rightImageIndex - 1 : rightData.images.length - 1
    setRightImageIndex(newIndex)
  }

  const handleRightNext = () => {
    const newIndex = rightImageIndex < rightData.images.length - 1 ? rightImageIndex + 1 : 0
    setRightImageIndex(newIndex)
  }

  // ✅ OPTION CHIPS - Brandbook
  const OptionChips = () => (
    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2, justifyContent: 'center' }}>
      {model.upgrades && model.upgrades.length > 0 && (
        <Chip
          icon={<UpgradeIcon sx={{ color: options.upgrade ? '#8CA551' : '#706f6f' }} />}
          label={
            <Box display="flex" alignItems="center" gap={1}>
              Upgrade
              <Typography
                component="span"
                sx={{
                  fontWeight: 700,
                  color: '#8CA551',
                  fontSize: '0.85em',
                  ml: 0.5,
                  fontFamily: '"Poppins", sans-serif'
                }}
              >
                +${upgradePrice.toLocaleString()}
              </Typography>
            </Box>
          }
          clickable
          onClick={() => toggleOption('upgrade')}
          sx={{
            fontWeight: 600,
            px: 2,
            fontSize: '0.875rem',
            fontFamily: '"Poppins", sans-serif',
            bgcolor: options.upgrade ? 'rgba(140, 165, 81, 0.12)' : '#fafafa',
            color: options.upgrade ? '#333F1F' : '#706f6f',
            border: `1px solid ${options.upgrade ? '#8CA551' : '#e0e0e0'}`,
            transition: 'all 0.3s ease',
            '&:hover': {
              bgcolor: options.upgrade ? 'rgba(140, 165, 81, 0.18)' : 'rgba(140, 165, 81, 0.08)',
              borderColor: '#8CA551',
              transform: 'translateY(-2px)',
              boxShadow: '0 4px 12px rgba(140, 165, 81, 0.2)'
            }
          }}
        />
      )}
      {model.balconies && model.balconies.length > 0 && (
        <Chip
          icon={<balconyLabels.icon sx={{ color: options.balcony ? '#8CA551' : '#706f6f' }} />}
          label={
            <Box display="flex" alignItems="center" gap={1}>
              {balconyLabels.label}
              <Typography
                component="span"
                sx={{
                  fontWeight: 700,
                  color: '#8CA551',
                  fontSize: '0.85em',
                  ml: 0.5,
                  fontFamily: '"Poppins", sans-serif'
                }}
              >
                +${balconyPrice.toLocaleString()}
              </Typography>
            </Box>
          }
          clickable
          onClick={() => toggleOption('balcony')}
          sx={{
            fontWeight: 600,
            px: 2,
            fontSize: '0.875rem',
            fontFamily: '"Poppins", sans-serif',
            bgcolor: options.balcony ? 'rgba(140, 165, 81, 0.12)' : '#fafafa',
            color: options.balcony ? '#333F1F' : '#706f6f',
            border: `1px solid ${options.balcony ? '#8CA551' : '#e0e0e0'}`,
            transition: 'all 0.3s ease',
            '&:hover': {
              bgcolor: options.balcony ? 'rgba(140, 165, 81, 0.18)' : 'rgba(140, 165, 81, 0.08)',
              borderColor: '#8CA551',
              transform: 'translateY(-2px)',
              boxShadow: '0 4px 12px rgba(140, 165, 81, 0.2)'
            }
          }}
        />
      )}
      {model.storages && model.storages.length > 0 && (
        <Chip
          icon={<StorageIcon sx={{ color: options.storage ? '#E5863C' : '#706f6f' }} />}
          label={
            <Box display="flex" alignItems="center" gap={1}>
              Storage
              <Typography
                component="span"
                sx={{
                  fontWeight: 700,
                  color: '#E5863C',
                  fontSize: '0.85em',
                  ml: 0.5,
                  fontFamily: '"Poppins", sans-serif'
                }}
              >
                +${storagePrice.toLocaleString()}
              </Typography>
            </Box>
          }
          clickable
          onClick={() => toggleOption('storage')}
          sx={{
            fontWeight: 600,
            px: 2,
            fontSize: '0.875rem',
            fontFamily: '"Poppins", sans-serif',
            bgcolor: options.storage ? 'rgba(229, 134, 60, 0.12)' : '#fafafa',
            color: options.storage ? '#333F1F' : '#706f6f',
            border: `1px solid ${options.storage ? '#E5863C' : '#e0e0e0'}`,
            transition: 'all 0.3s ease',
            '&:hover': {
              bgcolor: options.storage ? 'rgba(229, 134, 60, 0.18)' : 'rgba(229, 134, 60, 0.08)',
              borderColor: '#E5863C',
              transform: 'translateY(-2px)',
              boxShadow: '0 4px 12px rgba(229, 134, 60, 0.2)'
            }
          }}
        />
      )}
    </Box>
  )

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth={false}
      PaperProps={{
        sx: {
          width: '95vw',
          height: '95vh',
          maxWidth: '1800px',
          m: 0,
          borderRadius: 4,
          overflow: 'hidden',
          boxShadow: '0 20px 60px rgba(51, 63, 31, 0.15)'
        }
      }}
    >
      <DialogContent sx={{ p: 0, height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* ✅ HEADER - Brandbook */}
        <Box sx={{ 
          p: 3, 
          borderBottom: '2px solid rgba(140, 165, 81, 0.2)',
          bgcolor: '#333F1F',
          color: 'white',
          position: 'relative'
        }}>
          <IconButton 
            onClick={onClose}
            sx={{ 
              position: 'absolute',
              top: 16,
              right: 16,
              color: 'white',
              bgcolor: 'rgba(255, 255, 255, 0.12)',
              '&:hover': { 
                bgcolor: 'rgba(255, 255, 255, 0.18)',
                transform: 'scale(1.05)'
              }
            }}
          >
            <Close />
          </IconButton>
          <Typography 
            variant="h4" 
            fontWeight={700} 
            mb={0.5}
            sx={{ fontFamily: '"Poppins", sans-serif' }}
          >
            {model.model}
            {isModel10 && (
              <Chip 
                label="Special Configuration" 
                size="small" 
                sx={{ 
                  ml: 2, 
                  bgcolor: 'rgba(140, 165, 81, 0.2)', 
                  color: 'white',
                  fontWeight: 600,
                  fontFamily: '"Poppins", sans-serif',
                  border: '1px solid rgba(140, 165, 81, 0.4)'
                }} 
              />
            )}
          </Typography>
          <Typography 
            variant="body2" 
            sx={{ 
              opacity: 0.9,
              fontFamily: '"Poppins", sans-serif'
            }}
          >
            {isModel10 
              ? "Customize your dream home - Compare Comedor vs Study configurations"
              : "Customize your dream home - Compare configurations side by side"
            }
          </Typography>
        </Box>

        {/* ✅ RESPONSIVE LAYOUT */}
        {isMobile ? (
          <>
            {/* Mobile Controls */}
            <Box sx={{
              px: 2,
              pt: 2,
              pb: 1,
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              bgcolor: '#fafafa',
              borderBottom: '1px solid #e0e0e0'
            }}>
              <Box display="flex" alignItems="center" flexDirection="column" justifyContent="space-between" mb={2} gap={2}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={isSynced}
                      onChange={(e) => setIsSynced(e.target.checked)}
                      sx={{
                        '& .MuiSwitch-switchBase.Mui-checked': {
                          color: '#8CA551',
                        },
                        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                          backgroundColor: '#8CA551',
                        },
                      }}
                    />
                  }
                  label={
                    <Box display="flex" alignItems="center" gap={0.5}>
                      {isSynced ? <Sync fontSize="small" sx={{ color: '#333F1F' }} /> : <SyncDisabled fontSize="small" sx={{ color: '#706f6f' }} />}
                      <Typography 
                        variant="body2" 
                        fontWeight={600}
                        sx={{ fontFamily: '"Poppins", sans-serif', color: '#333F1F' }}
                      >
                        {isSynced ? 'Synced' : 'Independent'}
                      </Typography>
                    </Box>
                  }
                />
                <ToggleButtonGroup
                  value={viewType}
                  exclusive
                  onChange={(e, newValue) => {
                    if (newValue !== null) {
                      setViewType(newValue)
                      if (newValue !== 'interior') {
                        setSelectedRoomType('all')
                      }
                    }
                  }}
                  size="small"
                  sx={{
                    '& .MuiToggleButton-root': {
                      fontFamily: '"Poppins", sans-serif',
                      fontWeight: 600,
                      fontSize: '0.75rem',
                      color: '#706f6f',
                      border: '1px solid #e0e0e0',
                      '&.Mui-selected': {
                        bgcolor: 'rgba(140, 165, 81, 0.12)',
                        color: '#333F1F',
                        borderColor: '#8CA551',
                        '&:hover': {
                          bgcolor: 'rgba(140, 165, 81, 0.18)',
                        }
                      },
                      '&:hover': {
                        bgcolor: 'rgba(140, 165, 81, 0.05)',
                      }
                    }
                  }}
                >
                  <ToggleButton value="all">
                    <HomeIcon sx={{ mr: 0.5 }} fontSize="small" />
                    All
                  </ToggleButton>
                  <ToggleButton value="exterior">
                    Exterior
                  </ToggleButton>
                  <ToggleButton value="interior">
                    Interior
                  </ToggleButton>
                </ToggleButtonGroup>
              </Box>
              {viewType === 'interior' && (
                <Tabs
                  value={selectedRoomType}
                  onChange={(e, newValue) => setSelectedRoomType(newValue)}
                  variant="scrollable"
                  scrollButtons="auto"
                  sx={{
                    minHeight: 36,
                    mb: 2,
                    '& .MuiTab-root': {
                      minHeight: 36,
                      py: 0.5,
                      fontSize: '0.75rem',
                      fontFamily: '"Poppins", sans-serif',
                      fontWeight: 500,
                      color: '#706f6f',
                      '&.Mui-selected': {
                        color: '#333F1F',
                        fontWeight: 600
                      }
                    },
                    '& .MuiTabs-indicator': {
                      backgroundColor: '#8CA551',
                      height: 3
                    }
                  }}
                >
                  <Tab label="All Rooms" value="all" />
                  {ROOM_TYPES.map(room => (
                    <Tab
                      key={room.id}
                      label={`${room.icon} ${room.label}`}
                      value={room.id}
                    />
                  ))}
                </Tabs>
              )}
              <OptionChips />
              
              {/* Mobile Info Card */}
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 1.5, 
                  mb: 2, 
                  bgcolor: '#fafafa',
                  border: '1px solid #e0e0e0',
                  borderRadius: 3,
                  maxWidth: 320,
                  margin: '0 auto'
                }}
              >
                <Typography 
                  variant="caption" 
                  sx={{
                    color: '#706f6f',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    fontFamily: '"Poppins", sans-serif',
                    fontSize: '0.7rem'
                  }}
                >
                  BASE PRICE
                </Typography>
                <Typography 
                  variant="h4" 
                  fontWeight={700} 
                  sx={{
                    color: '#333F1F',
                    mb: 1,
                    fontFamily: '"Poppins", sans-serif'
                  }}
                >
                  ${model.price.toLocaleString()}
                </Typography>
                <Box sx={{ 
                  display: 'flex', 
                  flexWrap: 'wrap',
                  justifyContent: 'center',
                  gap: 1, 
                  mb: 1 
                }}>
                  <Chip 
                    icon={<HomeIcon />} 
                    label={`${model.bedrooms} Beds`}
                    sx={{
                      fontFamily: '"Poppins", sans-serif',
                      fontWeight: 500,
                      bgcolor: 'white',
                      border: '1px solid #e0e0e0'
                    }}
                  />
                  <Chip 
                    icon={<HomeIcon />} 
                    label={`${model.bathrooms} Baths`}
                    sx={{
                      fontFamily: '"Poppins", sans-serif',
                      fontWeight: 500,
                      bgcolor: 'white',
                      border: '1px solid #e0e0e0'
                    }}
                  />
                  <Chip 
                    icon={<HomeIcon />} 
                    label={`${model.sqft} sqft`}
                    sx={{
                      fontFamily: '"Poppins", sans-serif',
                      fontWeight: 500,
                      bgcolor: 'white',
                      border: '1px solid #e0e0e0'
                    }}
                  />
                </Box>
              </Paper>
              
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 2, 
                  mb: 2, 
                  bgcolor: '#fafafa',
                  border: '2px solid #8CA551',
                  borderRadius: 3,
                  maxWidth: 320,
                  margin: '0 auto'
                }}
              >
                <Typography 
                  variant="caption" 
                  sx={{
                    color: '#706f6f',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    fontFamily: '"Poppins", sans-serif',
                    fontSize: '0.7rem'
                  }}
                >
                  TOTAL PRICE
                </Typography>
                <Typography 
                  variant="h3" 
                  fontWeight={700} 
                  sx={{
                    color: '#333F1F',
                    mb: 1,
                    fontFamily: '"Poppins", sans-serif'
                  }}
                >
                  ${calculatePrice().toLocaleString()}
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: '#706f6f',
                    fontFamily: '"Poppins", sans-serif'
                  }}
                >
                  Includes all selected options
                </Typography>
              </Paper>
{/* ✅ BOTÓN MOBILE - Corregido */}
<Button
  variant="contained"
  size="large"
  fullWidth
  startIcon={<CheckCircle />}
  onClick={handleConfirm}
  sx={{
    mt: 2,
    py: 1.5,
    borderRadius: 3,
    bgcolor: '#333F1F',
    color: 'white',
    fontWeight: 600,
    fontSize: '1rem',
    letterSpacing: '1px',
    textTransform: 'uppercase',
    fontFamily: '"Poppins", sans-serif',
    boxShadow: '0 4px 12px rgba(51, 63, 31, 0.25)',
    position: 'relative',
    overflow: 'hidden',
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: '-100%',
      width: '100%',
      height: '100%',
      bgcolor: '#8CA551',
      transition: 'left 0.4s ease',
      zIndex: 0,
    },
    '&:hover': {
      bgcolor: '#333F1F',
      boxShadow: '0 8px 20px rgba(51, 63, 31, 0.35)',
      transform: 'translateY(-2px)',
      '&::before': {
        left: 0,
      },
    },
    // ✅ Asegurar que TODO el contenido esté por encima del ::before
    '& .MuiButton-startIcon': {
      position: 'relative',
      zIndex: 1,
    },
    '& .MuiButton-endIcon': {
      position: 'relative',
      zIndex: 1,
    }
  }}
>
  <Box component="span" sx={{ position: 'relative', zIndex: 1 }}>
    Confirm Selection
  </Box>
</Button>
            </Box>
            
            {/* Mobile Carousels */}
            <Box sx={{ display: 'flex', flexDirection: 'row', width: '100%', gap: 2, px: 2, pb: 2 }}>
              {/* Left Carousel */}
              <Box sx={{ flex: 1, bgcolor: '#fafafa', borderRadius: 3, overflow: 'hidden', border: '1px solid #e0e0e0' }}>
                <Chip 
                  label={leftData.label} 
                  size="small" 
                  sx={{ 
                    bgcolor: '#333F1F', 
                    color: 'white', 
                    fontWeight: 600, 
                    m: 1,
                    fontFamily: '"Poppins", sans-serif'
                  }} 
                />
                <Box
                  sx={{
                    bgcolor: '#000',
                    borderRadius: 2,
                    overflow: 'hidden',
                    position: 'relative',
                    width: '100%',
                    height: 220,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <AnimatePresence mode="wait">
                    {leftData.images[leftImageIndex] ? (
                      <motion.img
                        key={`left-${leftImageIndex}-${viewType}-${selectedRoomType}`}
                        src={leftData.images[leftImageIndex].url}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.3 }}
                        style={{
                          maxWidth: '100%',
                          maxHeight: '100%',
                          width: 'auto',
                          height: 'auto',
                          objectFit: 'contain',
                          position: 'absolute'
                        }}
                      />
                    ) : (
                      <Typography color="white" sx={{ fontFamily: '"Poppins", sans-serif' }}>
                        No images available
                      </Typography>
                    )}
                  </AnimatePresence>
                  {leftData.images.length > 1 && (
                    <>
                      <IconButton
                        onClick={handleLeftPrev}
                        sx={{
                          position: 'absolute',
                          left: 8,
                          top: '50%',
                          transform: 'translateY(-50%)',
                          bgcolor: 'rgba(255,255,255,0.95)',
                          '&:hover': { 
                            bgcolor: 'white', 
                            transform: 'scale(1.1) translateY(-50%)',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                          },
                          boxShadow: 2,
                          zIndex: 2
                        }}
                      >
                        <KeyboardArrowLeft sx={{ color: '#333F1F' }} />
                      </IconButton>
                      <IconButton
                        onClick={handleLeftNext}
                        sx={{
                          position: 'absolute',
                          right: 8,
                          top: '50%',
                          transform: 'translateY(-50%)',
                          bgcolor: 'rgba(255,255,255,0.95)',
                          '&:hover': { 
                            bgcolor: 'white', 
                            transform: 'scale(1.1) translateY(-50%)',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                          },
                          boxShadow: 2,
                          zIndex: 2
                        }}
                      >
                        <KeyboardArrowRight sx={{ color: '#333F1F' }} />
                      </IconButton>
                      <Box sx={{ 
                        position: 'absolute', 
                        bottom: 8, 
                        left: 8, 
                        bgcolor: 'rgba(51, 63, 31, 0.9)', 
                        color: 'white', 
                        px: 2, 
                        py: 0.5, 
                        borderRadius: 2 
                      }}>
                        <Typography variant="caption" fontWeight={600} sx={{ fontFamily: '"Poppins", sans-serif' }}>
                          {leftImageIndex + 1} / {leftData.images.length}
                        </Typography>
                      </Box>
                    </>
                  )}
                </Box>
              </Box>
              
              {/* Right Carousel */}
              <Box sx={{ flex: 1, bgcolor: '#fafafa', borderRadius: 3, overflow: 'hidden', border: '1px solid #e0e0e0' }}>
                <Chip 
                  label={rightData.label} 
                  size="small" 
                  sx={{ 
                    bgcolor: options.upgrade || options.balcony || options.storage ? '#8CA551' : '#333F1F', 
                    color: 'white', 
                    fontWeight: 600, 
                    m: 1,
                    fontFamily: '"Poppins", sans-serif'
                  }} 
                />
                <Box
                  sx={{
                    bgcolor: '#000',
                    borderRadius: 2,
                    overflow: 'hidden',
                    position: 'relative',
                    width: '100%',
                    height: 220,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <AnimatePresence mode="wait">
                    {rightData.images[rightImageIndex] ? (
                      <motion.img
                        key={`right-${rightImageIndex}-${viewType}-${selectedRoomType}-${options.upgrade}-${options.balcony}-${options.storage}`}
                        src={rightData.images[rightImageIndex].url}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.3 }}
                        style={{
                          maxWidth: '100%',
                          maxHeight: '100%',
                          width: 'auto',
                          height: 'auto',
                          objectFit: 'contain',
                          position: 'absolute'
                        }}
                      />
                    ) : (
                      <Typography color="white" sx={{ fontFamily: '"Poppins", sans-serif' }}>
                        No images available
                      </Typography>
                    )}
                  </AnimatePresence>
                  {rightData.images.length > 1 && (
                    <>
                      <IconButton
                        onClick={handleRightPrev}
                        sx={{
                          position: 'absolute',
                          left: 8,
                          top: '50%',
                          transform: 'translateY(-50%)',
                          bgcolor: 'rgba(255,255,255,0.95)',
                          '&:hover': { 
                            bgcolor: 'white', 
                            transform: 'scale(1.1) translateY(-50%)',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                          },
                          boxShadow: 2,
                          zIndex: 2
                        }}
                      >
                        <KeyboardArrowLeft sx={{ color: '#333F1F' }} />
                      </IconButton>
                      <IconButton
                        onClick={handleRightNext}
                        sx={{
                          position: 'absolute',
                          right: 8,
                          top: '50%',
                          transform: 'translateY(-50%)',
                          bgcolor: 'rgba(255,255,255,0.95)',
                          '&:hover': { 
                            bgcolor: 'white', 
                            transform: 'scale(1.1) translateY(-50%)',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                          },
                          boxShadow: 2,
                          zIndex: 2
                        }}
                      >
                        <KeyboardArrowRight sx={{ color: '#333F1F' }} />
                      </IconButton>
                      <Box sx={{ 
                        position: 'absolute', 
                        bottom: 8, 
                        left: 8, 
                        bgcolor: 'rgba(140, 165, 81, 0.9)', 
                        color: 'white', 
                        px: 2, 
                        py: 0.5, 
                        borderRadius: 2 
                      }}>
                        <Typography variant="caption" fontWeight={600} sx={{ fontFamily: '"Poppins", sans-serif' }}>
                          {rightImageIndex + 1} / {rightData.images.length}
                        </Typography>
                      </Box>
                    </>
                  )}
                </Box>
              </Box>
            </Box>
          </>
        ) : (
          // ✅ DESKTOP LAYOUT - Brandbook
          <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
            {/* LEFT COLUMN - BASE MODEL */}
            <Box sx={{ 
              flex: 1, 
              display: 'flex', 
              flexDirection: 'column',
              borderRight: '1px solid #e0e0e0',
              bgcolor: '#fafafa'
            }}>
              <Box sx={{ 
                p: 2, 
                bgcolor: '#f5f5f5',
                borderBottom: '1px solid #e0e0e0',
                textAlign: 'center'
              }}>
                <Chip 
                  label={leftData.label}
                  size="small"
                  sx={{ 
                    bgcolor: '#333F1F',
                    color: 'white',
                    fontWeight: 600,
                    fontFamily: '"Poppins", sans-serif'
                  }}
                />
              </Box>
              <Box
                sx={{
                  flex: 1,
                  bgcolor: '#000',
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <AnimatePresence mode="wait">
                  {leftData.images[leftImageIndex] ? (
                    <motion.img
                      key={`left-${leftImageIndex}-${viewType}-${selectedRoomType}`}
                      src={leftData.images[leftImageIndex].url}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.3 }}
                      style={{
                        maxWidth: '100%',
                        maxHeight: '100%',
                        width: 'auto',
                        height: 'auto',
                        objectFit: 'contain',
                        position: 'absolute'
                      }}
                    />
                  ) : (
                    <Typography color="white" sx={{ fontFamily: '"Poppins", sans-serif' }}>
                      No images available
                    </Typography>
                  )}
                </AnimatePresence>
                {leftData.images.length > 1 && (
                  <>
                    <IconButton
                      onClick={handleLeftPrev}
                      sx={{
                        position: 'absolute',
                        left: 16,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        bgcolor: 'rgba(255,255,255,0.95)',
                        '&:hover': { 
                          bgcolor: 'white', 
                          transform: 'scale(1.1) translateY(-50%)',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                        },
                        boxShadow: 3,
                        zIndex: 2
                      }}
                    >
                      <KeyboardArrowLeft sx={{ color: '#333F1F' }} />
                    </IconButton>
                    <IconButton
                      onClick={handleLeftNext}
                      sx={{
                        position: 'absolute',
                        right: 16,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        bgcolor: 'rgba(255,255,255,0.95)',
                        '&:hover': { 
                          bgcolor: 'white', 
                          transform: 'scale(1.1) translateY(-50%)',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                        },
                        boxShadow: 3,
                        zIndex: 2
                      }}
                    >
                      <KeyboardArrowRight sx={{ color: '#333F1F' }} />
                    </IconButton>
                    <Box sx={{ 
                      position: 'absolute', 
                      bottom: 16, 
                      left: 16, 
                      bgcolor: 'rgba(51, 63, 31, 0.9)', 
                      color: 'white', 
                      px: 2, 
                      py: 0.5, 
                      borderRadius: 2 
                    }}>
                      <Typography variant="caption" fontWeight={600} sx={{ fontFamily: '"Poppins", sans-serif' }}>
                        {leftImageIndex + 1} / {leftData.images.length}
                      </Typography>
                    </Box>
                  </>
                )}
              </Box>
            </Box>

            {/* MIDDLE COLUMN - CONTROLS */}
            <Box sx={{ 
              width: 400,
              display: 'flex',
              flexDirection: 'column',
              borderRight: '1px solid #e0e0e0',
              bgcolor: '#fff',
              overflow: 'auto'
            }}>
              <Box sx={{ p: 3 }}>
                <Paper 
                  elevation={0} 
                  sx={{ 
                    p: 3, 
                    mb: 3, 
                    bgcolor: '#fafafa',
                    border: '1px solid #e0e0e0',
                    borderRadius: 3
                  }}
                >
                  <Typography 
                    variant="caption" 
                    sx={{
                      color: '#706f6f',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '1px',
                      fontFamily: '"Poppins", sans-serif',
                      fontSize: '0.7rem'
                    }}
                  >
                    BASE PRICE
                  </Typography>
                  <Typography 
                    variant="h3" 
                    fontWeight={700} 
                    sx={{
                      color: '#333F1F',
                      mb: 1,
                      fontFamily: '"Poppins", sans-serif'
                    }}
                  >
                    ${model.price.toLocaleString()}
                  </Typography>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: '#706f6f',
                      fontFamily: '"Poppins", sans-serif'
                    }}
                  >
                    {model.bedrooms} beds • {model.bathrooms} baths • {model.sqft?.toLocaleString()} sqft
                  </Typography>
                </Paper>
                <Divider sx={{ mb: 3, borderColor: 'rgba(140, 165, 81, 0.2)' }}>
                  <Chip 
                    label="Customization Options" 
                    size="small"
                    sx={{
                      fontFamily: '"Poppins", sans-serif',
                      fontWeight: 600
                    }}
                  />
                </Divider>

                    <Box display="flex" alignItems="center" gap={2} mb={2}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={isSynced}
                            onChange={(e) => setIsSynced(e.target.checked)}
                            sx={{
                              '& .MuiSwitch-switchBase.Mui-checked': {
                                color: '#8CA551',
                              },
                              '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                backgroundColor: '#8CA551',
                              },
                            }}
                          />
                        }
                        label={
                          <Box display="flex" alignItems="center" gap={0.5}>
                            {isSynced ? <Sync fontSize="small" sx={{ color: '#333F1F' }} /> : <SyncDisabled fontSize="small" sx={{ color: '#706f6f' }} />}
                            <Typography 
                              variant="body2" 
                              fontWeight={600}
                              sx={{ fontFamily: '"Poppins", sans-serif', color: '#333F1F' }}
                            >
                              {isSynced ? 'Synced' : 'Independent'}
                            </Typography>
                          </Box>
                        }
                      />
                      <ToggleButtonGroup
                        value={viewType}
                        exclusive
                        onChange={(e, newValue) => {
                          if (newValue !== null) {
                            setViewType(newValue)
                            if (newValue !== 'interior') {
                              setSelectedRoomType('all')
                            }
                          }
                        }}
                        size="small"
                        sx={{
                          '& .MuiToggleButton-root': {
                            fontFamily: '"Poppins", sans-serif',
                            fontWeight: 600,
                            fontSize: '0.75rem',
                            color: '#706f6f',
                            border: '1px solid #e0e0e0',
                            '&.Mui-selected': {
                              bgcolor: 'rgba(140, 165, 81, 0.12)',
                              color: '#333F1F',
                              borderColor: '#8CA551',
                              '&:hover': {
                                bgcolor: 'rgba(140, 165, 81, 0.18)',
                              }
                            },
                            '&:hover': {
                              bgcolor: 'rgba(140, 165, 81, 0.05)',
                            }
                          }
                        }}
                      >
                        <ToggleButton value="all">
                          <HomeIcon sx={{ mr: 0.5 }} fontSize="small" />
                          All
                        </ToggleButton>
                        <ToggleButton value="exterior">
                          Exterior
                        </ToggleButton>
                        <ToggleButton value="interior">
                          Interior
                        </ToggleButton>
                      </ToggleButtonGroup>
                    </Box>
                    {viewType === 'interior' && (
                      <Tabs
                        value={selectedRoomType}
                        onChange={(e, newValue) => setSelectedRoomType(newValue)}
                        variant="scrollable"
                        scrollButtons="auto"
                        sx={{
                          minHeight: 36,
                          mb: 2,
                          '& .MuiTab-root': {
                            minHeight: 36,
                            py: 0.5,
                            fontSize: '0.75rem',
                            fontFamily: '"Poppins", sans-serif',
                            fontWeight: 500,
                            color: '#706f6f',
                            '&.Mui-selected': {
                              color: '#333F1F',
                              fontWeight: 600
                            }
                          },
                          '& .MuiTabs-indicator': {
                            backgroundColor: '#8CA551',
                            height: 3
                          }
                        }}
                      >
                        <Tab label="All Rooms" value="all" />
                        {ROOM_TYPES.map(room => (
                          <Tab
                            key={room.id}
                            label={`${room.icon} ${room.label}`}
                            value={room.id}
                          />
                        ))}
                      </Tabs>
                    )}


                <OptionChips />
                <Paper 
                  elevation={0} 
                  sx={{ 
                    p: 3, 
                    mt: 3, 
                    bgcolor: '#fafafa',
                    border: '2px solid #8CA551',
                    borderRadius: 3
                  }}
                >
                  <Typography 
                    variant="caption" 
                    sx={{
                      color: '#706f6f',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '1px',
                      fontFamily: '"Poppins", sans-serif',
                      fontSize: '0.7rem'
                    }}
                  >
                    TOTAL PRICE
                  </Typography>
                  <Typography 
                    variant="h3" 
                    fontWeight={700} 
                    sx={{
                      color: '#333F1F',
                      mb: 1,
                      fontFamily: '"Poppins", sans-serif'
                    }}
                  >
                    ${calculatePrice().toLocaleString()}
                  </Typography>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: '#706f6f',
                      fontFamily: '"Poppins", sans-serif'
                    }}
                  >
                    Includes all selected options
                  </Typography>
                </Paper>

{/* ✅ BOTÓN DESKTOP - Corregido */}
<Button
  variant="contained"
  size="large"
  fullWidth
  startIcon={<CheckCircle />}
  onClick={handleConfirm}
  sx={{
    mt: 3,
    py: 2,
    borderRadius: 3,
    bgcolor: '#333F1F',
    color: 'white',
    fontWeight: 600,
    fontSize: '1.1rem',
    letterSpacing: '1px',
    textTransform: 'uppercase',
    fontFamily: '"Poppins", sans-serif',
    boxShadow: '0 4px 12px rgba(51, 63, 31, 0.25)',
    position: 'relative',
    overflow: 'hidden',
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: '-100%',
      width: '100%',
      height: '100%',
      bgcolor: '#8CA551',
      transition: 'left 0.4s ease',
      zIndex: 0,
    },
    '&:hover': {
      bgcolor: '#333F1F',
      boxShadow: '0 8px 20px rgba(51, 63, 31, 0.35)',
      transform: 'translateY(-2px)',
      '&::before': {
        left: 0,
      },
    },
    // ✅ Asegurar que TODO el contenido esté por encima del ::before
    '& .MuiButton-startIcon': {
      position: 'relative',
      zIndex: 1,
    },
    '& .MuiButton-endIcon': {
      position: 'relative',
      zIndex: 1,
    }
  }}
>
  <Box component="span" sx={{ position: 'relative', zIndex: 1 }}>
    Confirm Selection
  </Box>
</Button>
              </Box>
            </Box>

            {/* RIGHT COLUMN - CUSTOMIZED MODEL */}
            <Box sx={{ 
              flex: 1, 
              display: 'flex', 
              flexDirection: 'column', 
              bgcolor: '#fafafa' 
            }}>
              <Box sx={{ 
                p: 2, 
                bgcolor: '#f5f5f5', 
                borderBottom: '1px solid #e0e0e0', 
                textAlign: 'center' 
              }}>
                <Chip 
                  label={rightData.label}
                  size="small"
                  sx={{ 
                    bgcolor: options.upgrade || options.balcony || options.storage ? '#8CA551' : '#333F1F',
                    color: 'white',
                    fontWeight: 600,
                    fontFamily: '"Poppins", sans-serif'
                  }}
                />
              </Box>
              <Box
                sx={{
                  flex: 1,
                  bgcolor: '#000',
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <AnimatePresence mode="wait">
                  {rightData.images[rightImageIndex] ? (
                    <motion.img
                      key={`right-${rightImageIndex}-${viewType}-${selectedRoomType}-${options.upgrade}-${options.balcony}-${options.storage}`}
                      src={rightData.images[rightImageIndex].url}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.3 }}
                      style={{
                        maxWidth: '100%',
                        maxHeight: '100%',
                        width: 'auto',
                        height: 'auto',
                        objectFit: 'contain',
                        position: 'absolute'
                      }}
                    />
                  ) : (
                    <Typography color="white" sx={{ fontFamily: '"Poppins", sans-serif' }}>
                      No images available
                    </Typography>
                  )}
                </AnimatePresence>
                {rightData.images.length > 1 && (
                  <>
                    <IconButton
                      onClick={handleRightPrev}
                      sx={{
                        position: 'absolute',
                        left: 16,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        bgcolor: 'rgba(255,255,255,0.95)',
                        '&:hover': { 
                          bgcolor: 'white', 
                          transform: 'scale(1.1) translateY(-50%)',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                        },
                        boxShadow: 3,
                        zIndex: 2
                      }}
                    >
                      <KeyboardArrowLeft sx={{ color: '#333F1F' }} />
                    </IconButton>
                    <IconButton
                      onClick={handleRightNext}
                      sx={{
                        position: 'absolute',
                        right: 16,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        bgcolor: 'rgba(255,255,255,0.95)',
                        '&:hover': { 
                          bgcolor: 'white', 
                          transform: 'scale(1.1) translateY(-50%)',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                        },
                        boxShadow: 3,
                        zIndex: 2
                      }}
                    >
                      <KeyboardArrowRight sx={{ color: '#333F1F' }} />
                    </IconButton>
                    <Box sx={{ 
                      position: 'absolute', 
                      bottom: 16, 
                      left: 16, 
                      bgcolor: 'rgba(140, 165, 81, 0.9)', 
                      color: 'white', 
                      px: 2, 
                      py: 0.5, 
                      borderRadius: 2 
                    }}>
                      <Typography variant="caption" fontWeight={600} sx={{ fontFamily: '"Poppins", sans-serif' }}>
                        {rightImageIndex + 1} / {rightData.images.length}
                      </Typography>
                    </Box>
                  </>
                )}
              </Box>
            </Box>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default ModelCustomizationModal