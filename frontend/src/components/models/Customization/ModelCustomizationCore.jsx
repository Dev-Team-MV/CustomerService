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
import {
  CheckCircle,
  KeyboardArrowLeft,
  KeyboardArrowRight,
  Sync,
  SyncDisabled,
  Home as HomeIcon
} from '@mui/icons-material'

import OptionChips from './OptionChips'
import PriceSummary from './PriceSummary'
import { getGalleryCategories } from '../../../services/modelImageService'
import { useTheme, useMediaQuery } from '@mui/material'
import GalleryCarrousel from '../../GalleryCarrousel'

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

const MODEL_10_ID = "6977c7bbd1f24768968719de"

const ModelCustomizationCore = ({
  model,
  compareModel = null,
  initialOptions = {},
  compareInitialOptions = {},
  onConfirm,
  labels = {},
  confirmLabel = "Confirm Selection",
}) => {
  const isModel10 = model?._id === MODEL_10_ID || compareModel?._id === MODEL_10_ID
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  // Estado principal
  const [options, setOptions] = useState({
    upgrade: initialOptions.upgrade || false,
    balcony: initialOptions.balcony || false,
    storage: initialOptions.storage || false
  })

  // Estado para modelo de comparación
  const [compareOptions, setCompareOptions] = useState({
    upgrade: compareInitialOptions.upgrade || false,
    balcony: compareInitialOptions.balcony || false,
    storage: compareInitialOptions.storage || false
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
  }, [model?._id, compareModel?._id])

  useEffect(() => {
    setLeftImageIndex(0)
    setRightImageIndex(0)
  }, [viewType, selectedRoomType, options.upgrade, options.balcony, options.storage, compareOptions.upgrade, compareOptions.balcony, compareOptions.storage])

  useEffect(() => {
    if (isSynced) {
      setRightImageIndex(leftImageIndex)
    }
  }, [leftImageIndex, isSynced])

  if (!model) return null

  // Funciones auxiliares
  const getAdjustedCategoryLabel = (label, isModel10Local) => {
    if (!isModel10Local) return label
    return label
      .replace(/Balcony/gi, 'Study')
      .replace(/balcony/gi, 'study')
  }

  // ...existing code...
  
    const processImages = (cat) => {
      return [
        ...(cat?.exteriorImages || []).map(img => {
          const url = typeof img === 'string' ? img : (img?.url || '')
          return { url, type: 'exterior', roomType: img?.roomType || 'general', isPublic: img?.isPublic }
        }),
        ...(cat?.interiorImages || []).map(img => {
          const url = typeof img === 'string' ? img : (img?.url || '')
          return { url, type: 'interior', roomType: img?.roomType || 'general', isPublic: img?.isPublic }
        })
      ].filter(img => img.url)
    }
  
  // ...existing code...

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

  const handleLeftPrev = () => {
    const images = compareModel 
      ? filterImages(processImages(getGalleryCategories(model).find(cat => {
          let key = 'base'
          if (options.upgrade && options.balcony) key = 'upgrade-balcony'
          else if (options.upgrade) key = 'upgrade'
          else if (options.balcony) key = 'base-balcony'
          return cat.key === key
        }) || getGalleryCategories(model).find(cat => cat.key === 'base')))
      : filterImages(processImages(getGalleryCategories(model).find(cat => cat.key === 'base')))
    const newIndex = leftImageIndex > 0 ? leftImageIndex - 1 : images.length - 1
    setLeftImageIndex(newIndex)
  }

  const handleLeftNext = () => {
    const images = compareModel 
      ? filterImages(processImages(getGalleryCategories(model).find(cat => {
          let key = 'base'
          if (options.upgrade && options.balcony) key = 'upgrade-balcony'
          else if (options.upgrade) key = 'upgrade'
          else if (options.balcony) key = 'base-balcony'
          return cat.key === key
        }) || getGalleryCategories(model).find(cat => cat.key === 'base')))
      : filterImages(processImages(getGalleryCategories(model).find(cat => cat.key === 'base')))
    const newIndex = leftImageIndex < images.length - 1 ? leftImageIndex + 1 : 0
    setLeftImageIndex(newIndex)
  }

  const handleRightPrev = () => {
    const images = compareModel 
      ? filterImages(processImages(getGalleryCategories(compareModel).find(cat => {
          let key = 'base'
          if (compareOptions.upgrade && compareOptions.balcony) key = 'upgrade-balcony'
          else if (compareOptions.upgrade) key = 'upgrade'
          else if (compareOptions.balcony) key = 'base-balcony'
          return cat.key === key
        }) || getGalleryCategories(compareModel).find(cat => cat.key === 'base')))
      : filterImages(processImages(getGalleryCategories(model).find(cat => {
          let key = 'base'
          if (options.upgrade && options.balcony) key = 'upgrade-balcony'
          else if (options.upgrade) key = 'upgrade'
          else if (options.balcony) key = 'base-balcony'
          return cat.key === key
        }) || getGalleryCategories(model).find(cat => cat.key === 'base')))
    const newIndex = rightImageIndex > 0 ? rightImageIndex - 1 : images.length - 1
    setRightImageIndex(newIndex)
  }

  const handleRightNext = () => {
    const images = compareModel 
      ? filterImages(processImages(getGalleryCategories(compareModel).find(cat => {
          let key = 'base'
          if (compareOptions.upgrade && compareOptions.balcony) key = 'upgrade-balcony'
          else if (compareOptions.upgrade) key = 'upgrade'
          else if (compareOptions.balcony) key = 'base-balcony'
          return cat.key === key
        }) || getGalleryCategories(compareModel).find(cat => cat.key === 'base')))
      : filterImages(processImages(getGalleryCategories(model).find(cat => {
          let key = 'base'
          if (options.upgrade && options.balcony) key = 'upgrade-balcony'
          else if (options.upgrade) key = 'upgrade'
          else if (options.balcony) key = 'base-balcony'
          return cat.key === key
        }) || getGalleryCategories(model).find(cat => cat.key === 'base')))
    const newIndex = rightImageIndex < images.length - 1 ? rightImageIndex + 1 : 0
    setRightImageIndex(newIndex)
  }

  const calculatePrice = () => {
    let total = model.price || 0
    if (options.upgrade) total += model.upgradePrice || model.upgrades?.[0]?.price || 0
    if (options.balcony) total += model.balconyPrice || model.balconies?.[0]?.price || 0
    if (options.storage) total += model.storagePrice || model.storages?.[0]?.price || 0
    return total
  }

  const calculateComparePrice = () => {
    if (!compareModel) return null
    let total = compareModel.price || 0
    if (compareOptions.upgrade) total += compareModel.upgradePrice || compareModel.upgrades?.[0]?.price || 0
    if (compareOptions.balcony) total += compareModel.balconyPrice || compareModel.balconies?.[0]?.price || 0
    if (compareOptions.storage) total += compareModel.storagePrice || compareModel.storages?.[0]?.price || 0
    return total
  }

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm({
        model,
        options,
        totalPrice: calculatePrice(),
        compareModel,
        compareOptions,
        compareTotalPrice: calculateComparePrice()
      })
    }
  }

  // Determinar datos de las imágenes según el modo
  const categories = getGalleryCategories(model)
  const baseCategory = categories.find(cat => cat.key === 'base')
  
  let leftData, rightData

  if (compareModel) {
    // MODO COMPARACIÓN: Modelo 1 vs Modelo 2
    let leftKey = 'base'
    if (options.upgrade && options.balcony) leftKey = 'upgrade-balcony'
    else if (options.upgrade) leftKey = 'upgrade'
    else if (options.balcony) leftKey = 'base-balcony'
    const leftCategory = categories.find(cat => cat.key === leftKey) || baseCategory

    const compareCategories = getGalleryCategories(compareModel)
    const compareBaseCategory = compareCategories.find(cat => cat.key === 'base')
    let rightKey = 'base'
    if (compareOptions.upgrade && compareOptions.balcony) rightKey = 'upgrade-balcony'
    else if (compareOptions.upgrade) rightKey = 'upgrade'
    else if (compareOptions.balcony) rightKey = 'base-balcony'
    const rightCategory = compareCategories.find(cat => cat.key === rightKey) || compareBaseCategory

    leftData = {
      images: filterImages(processImages(leftCategory)),
      label: getAdjustedCategoryLabel(leftCategory?.label || '', model?._id === MODEL_10_ID)
    }
    rightData = {
      images: filterImages(processImages(rightCategory)),
      label: getAdjustedCategoryLabel(rightCategory?.label || '', compareModel?._id === MODEL_10_ID)
    }
  } else {
    // MODO CLÁSICO: Base vs Customizado
    let customKey = 'base'
    if (options.upgrade && options.balcony) customKey = 'upgrade-balcony'
    else if (options.upgrade) customKey = 'upgrade'
    else if (options.balcony) customKey = 'base-balcony'
    const customCategory = categories.find(cat => cat.key === customKey) || baseCategory

    leftData = {
      images: filterImages(processImages(baseCategory)),
      label: getAdjustedCategoryLabel(isModel10 ? (labels.baseTitle || "With Comedor") : baseCategory.label, isModel10)
    }
    rightData = {
      images: filterImages(processImages(customCategory)),
      label: getAdjustedCategoryLabel(customCategory.label, isModel10)
    }
  }

  // --- RENDER ---
  return (
    <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{
        p: 3,
        borderBottom: '2px solid rgba(140, 165, 81, 0.2)',
        bgcolor: '#333F1F',
        color: 'white',
        position: 'relative'
      }}>
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
          {compareModel && (
            <Chip
              label={`vs ${compareModel.model}`}
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
          {compareModel
            ? "Compare two models side by side"
            : isModel10
            ? "Customize your dream home - Compare Comedor vs Study configurations"
            : "Customize your dream home - Compare configurations side by side"
          }
        </Typography>
      </Box>

      {/* Responsive Layout */}
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
            <OptionChips
              options={options}
              model={model}
              onToggle={opt => setOptions(prev => ({ ...prev, [opt]: !prev[opt] }))}
              labels={labels}
            />
            {compareModel && (
              <OptionChips
                options={compareOptions}
                model={compareModel}
                onToggle={opt => setCompareOptions(prev => ({ ...prev, [opt]: !prev[opt] }))}
                labels={labels}
                prefix="Compare: "
              />
            )}
            <PriceSummary
              model={model}
              options={options}
              compareModel={compareModel}
              compareOptions={compareOptions}
              calculatePrice={calculatePrice}
              calculateComparePrice={calculateComparePrice}
              title={compareModel ? model.model : (labels.baseTitle || (isModel10 ? "With Comedor" : "Base Model"))}
              compareTitle={compareModel ? compareModel.model : (labels.compareTitle || (isModel10 ? "With Study" : "Customized"))}
            />
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
                {confirmLabel}
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
                        {/* ✅ height fijo en px para que GalleryCarrousel pueda calcular su tamaño */}
                        <Box sx={{ width: '100%', height: 220, position: 'relative' }}>
                          <GalleryCarrousel
                            images={leftData.images.map((img) => img.url)}
                            onIndexChange={(newIndex) => {
                              setLeftImageIndex(newIndex)
                              if (isSynced) setRightImageIndex(newIndex)
                            }}
                            showPagination={true}
                            showArrows={true}
                            borderRadius={0}
                            objectFit="contain"
                            syncGroup={isSynced ? 'carousel-sync-mobile' : null}
                            watermark={null}
                          />
                        </Box>
                      </Box>
                      {/* Right Carousel */}
                      <Box sx={{ flex: 1, bgcolor: '#fafafa', borderRadius: 3, overflow: 'hidden', border: '1px solid #e0e0e0' }}>
                        <Chip
                          label={rightData.label}
                          size="small"
                          sx={{
                            bgcolor: compareModel ? '#8CA551' : (options.upgrade || options.balcony || options.storage ? '#8CA551' : '#333F1F'),
                            color: 'white',
                            fontWeight: 600,
                            m: 1,
                            fontFamily: '"Poppins", sans-serif'
                          }}
                        />
                        {/* ✅ Misma altura fija */}
                        <Box sx={{ width: '100%', height: 220, position: 'relative' }}>
                          <GalleryCarrousel
                            images={rightData.images.map((img) => img.url)}
                            onIndexChange={(newIndex) => setRightImageIndex(newIndex)}
                            showPagination={true}
                            showArrows={true}
                            borderRadius={0}
                            objectFit="contain"
                            syncGroup={isSynced ? 'carousel-sync-mobile' : null}
                            watermark={null}
                          />
                        </Box>
                      </Box>
                    </Box>
          
        </>
      ) : (
        // Desktop Layout
        <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden', minHeight: 0 }}>
          {/* LEFT COLUMN */}
          <Box sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            borderRight: '1px solid #e0e0e0',
            bgcolor: '#fafafa',
            minHeight: 0,
            overflow: 'hidden'
          }}>
            <Box sx={{
              p: 2,
              bgcolor: '#f5f5f5',
              borderBottom: '1px solid #e0e0e0',
              textAlign: 'center',
              flexShrink: 0
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
            {/* ✅ Altura fija calculada: 95vh del dialog - header (~110px) - chip header (~56px) */}
            <Box sx={{ width: '100%', height: 'calc(95vh - 166px)', position: 'relative' }}>
              <GalleryCarrousel
                images={leftData.images.map((img) => img.url).filter(Boolean)}
                onIndexChange={(newIndex) => {
                  setLeftImageIndex(newIndex)
                  if (isSynced) setRightImageIndex(newIndex)
                }}
                showPagination={true}
                showArrows={true}
                borderRadius={0}
                objectFit="contain"
                syncGroup={isSynced ? 'carousel-sync' : null}
                watermark={null}
              />
            </Box>
          </Box>
          {/* MIDDLE COLUMN - CONTROLS */}
          <Box sx={{
            width: 400,
            flexShrink: 0,
            display: 'flex',
            flexDirection: 'column',
            borderRight: '1px solid #e0e0e0',
            bgcolor: '#fff',
            overflow: 'auto'
          }}>
            <Box sx={{ p: 3 }}>
              <PriceSummary
                model={model}
                options={options}
                compareModel={compareModel}
                compareOptions={compareOptions}
                calculatePrice={calculatePrice}
                calculateComparePrice={calculateComparePrice}
                title={compareModel ? model.model : (labels.baseTitle || (isModel10 ? "With Comedor" : "Base Model"))}
                compareTitle={compareModel ? compareModel.model : (labels.compareTitle || (isModel10 ? "With Study" : "Customized"))}
              />
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
              <OptionChips
                options={options}
                model={model}
                onToggle={opt => setOptions(prev => ({ ...prev, [opt]: !prev[opt] }))}
                labels={labels}
              />
              {compareModel && (
                <OptionChips
                  options={compareOptions}
                  model={compareModel}
                  onToggle={opt => setCompareOptions(prev => ({ ...prev, [opt]: !prev[opt] }))}
                  labels={labels}
                  prefix="Compare: "
                />
              )}
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
                  {confirmLabel}
                </Box>
              </Button>
            </Box>
          </Box>
          {/* RIGHT COLUMN */}
          <Box sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            bgcolor: '#fafafa',
            minHeight: 0,
            overflow: 'hidden'
          }}>
            <Box sx={{
              p: 2,
              bgcolor: '#f5f5f5',
              borderBottom: '1px solid #e0e0e0',
              textAlign: 'center',
              flexShrink: 0
            }}>
              <Chip
                label={rightData.label}
                size="small"
                sx={{
                  bgcolor: compareModel ? '#8CA551' : (options.upgrade || options.balcony || options.storage ? '#8CA551' : '#333F1F'),
                  color: 'white',
                  fontWeight: 600,
                  fontFamily: '"Poppins", sans-serif'
                }}
              />
            </Box>
            {/* ✅ Misma altura fija calculada */}
            <Box sx={{ width: '100%', height: 'calc(95vh - 166px)', position: 'relative' }}>
              <GalleryCarrousel
                images={rightData.images.map((img) => img.url)}
                onIndexChange={(newIndex) => setRightImageIndex(newIndex)}
                showPagination={true}
                showArrows={true}
                borderRadius={0}
                objectFit="contain"
                syncGroup={isSynced ? 'carousel-sync' : null}
                watermark={null}
              />
            </Box>
          </Box>
        </Box>
      )}
    </Box>
  )
}

export default ModelCustomizationCore