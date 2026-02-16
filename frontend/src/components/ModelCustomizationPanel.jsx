import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
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
import { useTheme } from '@mui/material/styles'
import {
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

import { getGalleryCategories } from '../services/modelImageService'
import useMediaQuery from '@mui/material/useMediaQuery'

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

const ModelCustomizationPanel = ({
  model,
  onConfirm,
  initialOptions = {},
  compareModel = null,
  compareOptions = {}
}) => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  const [options, setOptions] = useState({
    upgrade: initialOptions.upgrade || false,
    balcony: initialOptions.balcony || false,
    storage: initialOptions.storage || false
  })

  const [compareOpts, setCompareOpts] = useState({
    upgrade: compareOptions.upgrade || false,
    balcony: compareOptions.balcony || false,
    storage: compareOptions.storage || false
  })

  const [viewType, setViewType] = useState('all')
  const [selectedRoomType, setSelectedRoomType] = useState('all')
  const [leftImageIndex, setLeftImageIndex] = useState(0)
  const [rightImageIndex, setRightImageIndex] = useState(0)
  const [isSynced, setIsSynced] = useState(true)

  useEffect(() => {
    setLeftImageIndex(0)
    setRightImageIndex(0)
    setViewType('all')
    setSelectedRoomType('all')
    setIsSynced(true)
  }, [model, compareModel])

  useEffect(() => {
    setLeftImageIndex(0)
    setRightImageIndex(0)
  }, [viewType, selectedRoomType, options.upgrade, options.balcony, options.storage, compareOpts.upgrade, compareOpts.balcony, compareOpts.storage])

  useEffect(() => {
    if (isSynced) {
      setRightImageIndex(leftImageIndex)
    }
  }, [leftImageIndex, isSynced])

  if (!model) return null

  const processImages = (cat) => [
    ...(cat?.exteriorImages || []).map(url => ({ url, type: 'exterior', roomType: 'general' })),
    ...(cat?.interiorImages || []).map(img =>
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

  const categories = getGalleryCategories(model)
  const baseCategory = categories.find(cat => cat.key === 'base')
  let customKey = 'base'
  if (options.upgrade && options.balcony) customKey = 'upgrade-balcony'
  else if (options.upgrade) customKey = 'upgrade'
  else if (options.balcony) customKey = 'base-balcony'
  const customCategory = categories.find(cat => cat.key === customKey) || baseCategory

  let leftCategoryToUse = baseCategory;
  if (compareModel && model._id !== compareModel._id) {
    let leftCustomKey = 'base';
    if (options.upgrade && options.balcony) leftCustomKey = 'upgrade-balcony';
    else if (options.upgrade) leftCustomKey = 'upgrade';
    else if (options.balcony) leftCustomKey = 'base-balcony';
    leftCategoryToUse = categories.find(cat => cat.key === leftCustomKey) || baseCategory;
  }

  const leftData = {
    images: filterImages(processImages(leftCategoryToUse)),
    label: leftCategoryToUse.label,
    model
  };

  let rightData
  if (compareModel) {
    const compareCategories = getGalleryCategories(compareModel)
    const compareBaseCategory = compareCategories.find(cat => cat.key === 'base')
    let compareCustomKey = 'base'
    if (compareOpts.upgrade && compareOpts.balcony) compareCustomKey = 'upgrade-balcony'
    else if (compareOpts.upgrade) compareCustomKey = 'upgrade'
    else if (compareOpts.balcony) compareCustomKey = 'base-balcony'
    const compareCustomCategory = compareCategories.find(cat => cat.key === compareCustomKey) || compareBaseCategory
    rightData = {
      images: filterImages(processImages(compareCustomCategory)),
      label: compareCustomCategory.label,
      model: compareModel
    }
  } else {
    rightData = {
      images: filterImages(processImages(customCategory)),
      label: customCategory.label,
      model
    }
  }

  const toggleOption = (option) => {
    setOptions(prev => ({ ...prev, [option]: !prev[option] }))
  }
  const toggleCompareOption = (option) => {
    setCompareOpts(prev => ({ ...prev, [option]: !prev[option] }))
  }

  const upgradePrice = model.upgradePrice || model.upgrades?.[0]?.price || 0
  const balconyPrice = model.balconyPrice || model.balconies?.[0]?.price || 0
  const storagePrice = model.storagePrice || model.storages?.[0]?.price || 0

  const compareUpgradePrice = compareModel?.upgradePrice || compareModel?.upgrades?.[0]?.price || 0
  const compareBalconyPrice = compareModel?.balconyPrice || compareModel?.balconies?.[0]?.price || 0
  const compareStoragePrice = compareModel?.storagePrice || compareModel?.storages?.[0]?.price || 0

  const calculatePrice = () => {
    let total = model.price || 0
    if (options.upgrade) total += upgradePrice
    if (options.balcony) total += balconyPrice
    if (options.storage) total += storagePrice
    return total
  }
  const calculateComparePrice = () => {
    if (!compareModel) return null
    let total = compareModel.price || 0
    if (compareOpts.upgrade) total += compareUpgradePrice
    if (compareOpts.balcony) total += compareBalconyPrice
    if (compareOpts.storage) total += compareStoragePrice
    return total
  }

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm({
        model,
        options,
        totalPrice: calculatePrice(),
        compareModel: compareModel || null,
        compareOptions: compareOpts,
        compareTotalPrice: calculateComparePrice()
      })
    }
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

  const getBalconyLabel = (modelObj) =>
    modelObj?._id === "6977c7bbd1f24768968719de" ? "Study" : "Balcony";

  // ✅ OPTION CHIPS - Brandbook
  const OptionChips = ({ opts, modelData, toggleFn }) => (
    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
      {modelData.upgrades && modelData.upgrades.length > 0 && (
        <Chip
          icon={<UpgradeIcon sx={{ color: opts.upgrade ? '#8CA551' : '#706f6f' }} />}
          label="Upgrade"
          clickable
          onClick={() => toggleFn('upgrade')}
          sx={{
            fontWeight: 600,
            px: 2,
            fontSize: '0.875rem',
            fontFamily: '"Poppins", sans-serif',
            bgcolor: opts.upgrade ? 'rgba(140, 165, 81, 0.12)' : '#fafafa',
            color: opts.upgrade ? '#333F1F' : '#706f6f',
            border: `1px solid ${opts.upgrade ? '#8CA551' : '#e0e0e0'}`,
            transition: 'all 0.3s ease',
            '&:hover': {
              bgcolor: opts.upgrade ? 'rgba(140, 165, 81, 0.18)' : 'rgba(140, 165, 81, 0.08)',
              borderColor: '#8CA551',
              transform: 'translateY(-2px)',
              boxShadow: '0 4px 12px rgba(140, 165, 81, 0.2)'
            }
          }}
        />
      )}
      {modelData.balconies && modelData.balconies.length > 0 && (
        <Chip
          icon={<BalconyIcon sx={{ color: opts.balcony ? '#8CA551' : '#706f6f' }} />}
          label={getBalconyLabel(modelData)}
          clickable
          onClick={() => toggleFn('balcony')}
          sx={{
            fontWeight: 600,
            px: 2,
            fontSize: '0.875rem',
            fontFamily: '"Poppins", sans-serif',
            bgcolor: opts.balcony ? 'rgba(140, 165, 81, 0.12)' : '#fafafa',
            color: opts.balcony ? '#333F1F' : '#706f6f',
            border: `1px solid ${opts.balcony ? '#8CA551' : '#e0e0e0'}`,
            transition: 'all 0.3s ease',
            '&:hover': {
              bgcolor: opts.balcony ? 'rgba(140, 165, 81, 0.18)' : 'rgba(140, 165, 81, 0.08)',
              borderColor: '#8CA551',
              transform: 'translateY(-2px)',
              boxShadow: '0 4px 12px rgba(140, 165, 81, 0.2)'
            }
          }}
        />
      )}
      {modelData.storages && modelData.storages.length > 0 && (
        <Chip
          icon={<StorageIcon sx={{ color: opts.storage ? '#E5863C' : '#706f6f' }} />}
          label="Storage"
          clickable
          onClick={() => toggleFn('storage')}
          sx={{
            fontWeight: 600,
            px: 2,
            fontSize: '0.875rem',
            fontFamily: '"Poppins", sans-serif',
            bgcolor: opts.storage ? 'rgba(229, 134, 60, 0.12)' : '#fafafa',
            color: opts.storage ? '#333F1F' : '#706f6f',
            border: `1px solid ${opts.storage ? '#E5863C' : '#e0e0e0'}`,
            transition: 'all 0.3s ease',
            '&:hover': {
              bgcolor: opts.storage ? 'rgba(229, 134, 60, 0.18)' : 'rgba(229, 134, 60, 0.08)',
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
    <Box
      sx={{
        width: '100%',
        maxWidth: 1400,
        mx: 'auto',
        my: 0,
        borderRadius: 4,
        overflow: 'hidden',
        boxShadow: { xs: 0, md: '0 8px 32px rgba(51, 63, 31, 0.12)' },
        bgcolor: 'white',
        border: { xs: 'none', md: '1px solid #e0e0e0' },
        minHeight: { xs: 600, md: 700 },
        maxHeight: { xs: '90vh', md: 'none' },
        overflowY: { xs: 'auto', md: 'visible' },
      }}
    >
      {/* ✅ HEADER - Brandbook */}
      <Box sx={{
        p: { xs: 2, md: 3 },
        borderBottom: '2px solid rgba(140, 165, 81, 0.2)',
        bgcolor: '#333F1F',
        color: 'white',
      }}>
        <Typography 
          variant="h4" 
          fontWeight={700} 
          mb={0.5}
          sx={{
            fontFamily: '"Poppins", sans-serif',
            fontSize: { xs: '1.25rem', sm: '1.5rem', md: '2rem' }
          }}
        >
          {model.model}
          {compareModel && (
            <Chip 
              label={`Comparing: ${compareModel.model}`} 
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
            fontFamily: '"Poppins", sans-serif',
            fontSize: { xs: '0.8rem', sm: '0.875rem' }
          }}
        >
          {compareModel
            ? "Compare two models and their configurations side by side"
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
                      sx={{
                        fontFamily: '"Poppins", sans-serif',
                        color: '#333F1F'
                      }}
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
            <OptionChips opts={options} modelData={model} toggleFn={toggleOption} />
            {compareModel && (
              <OptionChips opts={compareOpts} modelData={compareModel} toggleFn={toggleCompareOption} />
            )}
            
            {/* Mobile Info Card */}
            <Paper 
              elevation={0} 
              sx={{ 
                p: 2, 
                mb: 2, 
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
                gap: 1.5, 
                mb: 2 
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
              {compareModel && (
                <>
                  <Divider sx={{ my: 2, borderColor: 'rgba(140, 165, 81, 0.2)' }} />
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
                    COMPARE PRICE
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
                    ${compareModel.price.toLocaleString()}
                  </Typography>
                  <Box sx={{ 
                    display: 'flex', 
                    flexWrap: 'wrap',
                    justifyContent: 'center',
                    gap: 1.5, 
                    mb: 2 
                  }}>
                    <Chip 
                      icon={<HomeIcon />} 
                      label={`${compareModel.bedrooms} Beds`}
                      sx={{
                        fontFamily: '"Poppins", sans-serif',
                        fontWeight: 500,
                        bgcolor: 'white',
                        border: '1px solid #e0e0e0'
                      }}
                    />
                    <Chip 
                      icon={<HomeIcon />} 
                      label={`${compareModel.bathrooms} Baths`}
                      sx={{
                        fontFamily: '"Poppins", sans-serif',
                        fontWeight: 500,
                        bgcolor: 'white',
                        border: '1px solid #e0e0e0'
                      }}
                    />
                    <Chip 
                      icon={<HomeIcon />} 
                      label={`${compareModel.sqft} sqft`}
                      sx={{
                        fontFamily: '"Poppins", sans-serif',
                        fontWeight: 500,
                        bgcolor: 'white',
                        border: '1px solid #e0e0e0'
                      }}
                    />
                  </Box>
                </>
              )}
            </Paper>
            {onConfirm && (
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
                  '& span': {
                    position: 'relative',
                    zIndex: 1,
                  }
                }}
              >
                Confirm Selection
              </Button>
            )}
          </Box>
          
          {/* Mobile Carousels */}
          <Box sx={{ display: 'flex', flexDirection: 'row', width: '100%', gap: 2, px: 2, pb: 2 }}>
            {/* Left Carousel */}
            <Box sx={{ flex: 1, bgcolor: '#fafafa', borderRadius: 3, overflow: 'hidden', border: '1px solid #e0e0e0' }}>
              <Chip 
                label={leftData.label.replace(/Balcony/gi, getBalconyLabel(model))} 
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
      height: 220, // ✅ Altura fija
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
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain'
                      }}
                    />
                  ) : (
                    <Typography 
                      color="white"
                      sx={{ fontFamily: '"Poppins", sans-serif' }}
                    >
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
                      <Typography 
                        variant="caption" 
                        fontWeight={600}
                        sx={{ fontFamily: '"Poppins", sans-serif' }}
                      >
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
                label={rightData.label.replace(/Balcony/gi, getBalconyLabel(compareModel || model))} 
                size="small" 
                sx={{ 
                  bgcolor: '#8CA551', 
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
      height: 220, // ✅ Altura fija
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}
              >
                <AnimatePresence mode="wait">
                  {rightData.images[rightImageIndex] ? (
                    <motion.img
                      key={`right-${rightImageIndex}-${viewType}-${selectedRoomType}-${compareOpts.upgrade}-${compareOpts.balcony}-${compareOpts.storage}`}
                      src={rightData.images[rightImageIndex].url}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.3 }}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain'
                      }}
                    />
                  ) : (
                    <Typography 
                      color="white"
                      sx={{ fontFamily: '"Poppins", sans-serif' }}
                    >
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
                      <Typography 
                        variant="caption" 
                        fontWeight={600}
                        sx={{ fontFamily: '"Poppins", sans-serif' }}
                      >
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
        <Box sx={{ width: '100%', p: 3 }}>
          {/* Row 1: Options & Sync */}
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            mb: 3,
            gap: 2
          }}>
            <OptionChips opts={options} modelData={model} toggleFn={toggleOption} />
            {compareModel && (
              <OptionChips opts={compareOpts} modelData={compareModel} toggleFn={toggleCompareOption} />
            )}
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
                    sx={{
                      fontFamily: '"Poppins", sans-serif',
                      color: '#333F1F'
                    }}
                  >
                    {isSynced ? 'Synced' : 'Independent'}
                  </Typography>
                </Box>
              }
            />
          </Box>
          
          {/* Row 2: Three Columns */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: '1fr 1.2fr 1fr',
              gap: 3,
              alignItems: 'stretch'
            }}
          >
            {/* Column 1: Base Model */}
            <Box sx={{ 
              bgcolor: '#fafafa', 
              borderRadius: 3, 
              p: 2, 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center',
              border: '1px solid #e0e0e0'
            }}>
              <Typography 
                variant="subtitle2" 
                fontWeight={700} 
                mb={1}
                sx={{
                  fontFamily: '"Poppins", sans-serif',
                  color: '#333F1F',
                  letterSpacing: '0.5px'
                }}
              >
                Base Model
              </Typography>
              <Chip
                label={leftData.label.replace(/Balcony/gi, getBalconyLabel(model))}
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
      borderRadius: 3,
      overflow: 'hidden',
      position: 'relative',
      width: '100%',
      height: 320, // ✅ Altura fija
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
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain'
                      }}
                    />
                  ) : (
                    <Typography 
                      color="white"
                      sx={{ fontFamily: '"Poppins", sans-serif' }}
                    >
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
                      <Typography 
                        variant="caption" 
                        fontWeight={600}
                        sx={{ fontFamily: '"Poppins", sans-serif' }}
                      >
                        {leftImageIndex + 1} / {leftData.images.length}
                      </Typography>
                    </Box>
                  </>
                )}
              </Box>
            </Box>
            
            {/* Column 2: Info & Confirmation */}
            <Paper 
              elevation={0} 
              sx={{ 
                p: 3, 
                borderRadius: 3, 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                bgcolor: 'white', 
                minHeight: 320,
                border: '1px solid #e0e0e0'
              }}
            >
              <Typography 
                variant="h5" 
                fontWeight={700} 
                mb={1}
                sx={{
                  color: '#333F1F',
                  fontFamily: '"Poppins", sans-serif'
                }}
              >
                {model.model}
              </Typography>
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 2, 
                  mb: 2, 
                  bgcolor: '#fafafa',
                  width: '100%',
                  borderRadius: 3,
                  border: '1px solid #e0e0e0'
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
                <Box sx={{ display: 'flex', gap: 1.5, mb: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
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
                {compareModel && (
                  <>
                    <Divider sx={{ my: 2, borderColor: 'rgba(140, 165, 81, 0.2)' }} />
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
                      COMPARE PRICE
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
                      ${compareModel.price.toLocaleString()}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1.5, mb: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                      <Chip 
                        icon={<HomeIcon />} 
                        label={`${compareModel.bedrooms} Beds`}
                        sx={{
                          fontFamily: '"Poppins", sans-serif',
                          fontWeight: 500,
                          bgcolor: 'white',
                          border: '1px solid #e0e0e0'
                        }}
                      />
                      <Chip 
                        icon={<HomeIcon />} 
                        label={`${compareModel.bathrooms} Baths`}
                        sx={{
                          fontFamily: '"Poppins", sans-serif',
                          fontWeight: 500,
                          bgcolor: 'white',
                          border: '1px solid #e0e0e0'
                        }}
                      />
                      <Chip 
                        icon={<HomeIcon />} 
                        label={`${compareModel.sqft} sqft`}
                        sx={{
                          fontFamily: '"Poppins", sans-serif',
                          fontWeight: 500,
                          bgcolor: 'white',
                          border: '1px solid #e0e0e0'
                        }}
                      />
                    </Box>
                  </>
                )}
              </Paper>
              <Divider sx={{ my: 2, width: '100%', borderColor: 'rgba(140, 165, 81, 0.2)' }} />
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2, justifyContent: 'center' }}>
                {options.upgrade && (
                  <Chip 
                    label="Upgrade" 
                    size="small"
                    sx={{
                      bgcolor: 'rgba(140, 165, 81, 0.12)',
                      color: '#333F1F',
                      fontWeight: 600,
                      fontFamily: '"Poppins", sans-serif',
                      border: '1px solid #8CA551'
                    }}
                  />
                )}
                {options.balcony && (
                  <Chip 
                    label={getBalconyLabel(model)} 
                    size="small"
                    sx={{
                      bgcolor: 'rgba(140, 165, 81, 0.12)',
                      color: '#333F1F',
                      fontWeight: 600,
                      fontFamily: '"Poppins", sans-serif',
                      border: '1px solid #8CA551'
                    }}
                  />
                )}
                {options.storage && (
                  <Chip 
                    label="Storage" 
                    size="small"
                    sx={{
                      bgcolor: 'rgba(229, 134, 60, 0.12)',
                      color: '#333F1F',
                      fontWeight: 600,
                      fontFamily: '"Poppins", sans-serif',
                      border: '1px solid #E5863C'
                    }}
                  />
                )}
                {compareModel && (
                  <>
                    {compareOpts.upgrade && (
                      <Chip 
                        label="Upgrade (Compare)" 
                        size="small"
                        sx={{
                          bgcolor: 'rgba(140, 165, 81, 0.12)',
                          color: '#333F1F',
                          fontWeight: 600,
                          fontFamily: '"Poppins", sans-serif',
                          border: '1px solid #8CA551'
                        }}
                      />
                    )}
                    {compareOpts.balcony && (
                      <Chip 
                        label={`${getBalconyLabel(compareModel)} (Compare)`} 
                        size="small"
                        sx={{
                          bgcolor: 'rgba(140, 165, 81, 0.12)',
                          color: '#333F1F',
                          fontWeight: 600,
                          fontFamily: '"Poppins", sans-serif',
                          border: '1px solid #8CA551'
                        }}
                      />
                    )}
                    {compareOpts.storage && (
                      <Chip 
                        label="Storage (Compare)" 
                        size="small"
                        sx={{
                          bgcolor: 'rgba(229, 134, 60, 0.12)',
                          color: '#333F1F',
                          fontWeight: 600,
                          fontFamily: '"Poppins", sans-serif',
                          border: '1px solid #E5863C'
                        }}
                      />
                    )}
                  </>
                )}
              </Box>
              {onConfirm && (
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<CheckCircle />}
                  onClick={handleConfirm}
                  fullWidth
                  sx={{
                    mt: 2,
                    py: 1.5,
                    borderRadius: 3,
                    bgcolor: '#333F1F',
                    color: 'white',
                    fontWeight: 600,
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
                    '& span': {
                      position: 'relative',
                      zIndex: 1,
                    }
                  }}
                >
                  Confirm Selection
                </Button>
              )}
            </Paper>
            
            {/* Column 3: Customized/Compare Model */}
            <Box sx={{ 
              bgcolor: '#fafafa', 
              borderRadius: 3, 
              p: 2, 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center',
              border: '1px solid #e0e0e0'
            }}>
              <Typography 
                variant="subtitle2" 
                fontWeight={700} 
                mb={1}
                sx={{
                  fontFamily: '"Poppins", sans-serif',
                  color: '#333F1F',
                  letterSpacing: '0.5px'
                }}
              >
                {compareModel ? "Comparison Model" : "Customized"}
              </Typography>
              <Chip
                label={rightData.label.replace(/Balcony/gi, getBalconyLabel(compareModel || model))}
                size="small"
                sx={{ 
                  bgcolor: '#8CA551', 
                  color: 'white', 
                  fontWeight: 600, 
                  m: 1,
                  fontFamily: '"Poppins", sans-serif'
                }}
              />
              <Box
    sx={{
      bgcolor: '#000',
      borderRadius: 3,
      overflow: 'hidden',
      position: 'relative',
      width: '100%',
      height: 320, // ✅ Altura fija
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}
              >
                <AnimatePresence mode="wait">
                  {rightData.images[rightImageIndex] ? (
                    <motion.img
                      key={`right-${rightImageIndex}-${viewType}-${selectedRoomType}-${compareOpts.upgrade}-${compareOpts.balcony}-${compareOpts.storage}`}
                      src={rightData.images[rightImageIndex].url}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.3 }}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain'
                      }}
                    />
                  ) : (
                    <Typography 
                      color="white"
                      sx={{ fontFamily: '"Poppins", sans-serif' }}
                    >
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
                      <Typography 
                        variant="caption" 
                        fontWeight={600}
                        sx={{ fontFamily: '"Poppins", sans-serif' }}
                      >
                        {rightImageIndex + 1} / {rightData.images.length}
                      </Typography>
                    </Box>
                  </>
                )}
              </Box>
            </Box>
          </Box>
        </Box>
      )}
    </Box>
  )
}

export default ModelCustomizationPanel