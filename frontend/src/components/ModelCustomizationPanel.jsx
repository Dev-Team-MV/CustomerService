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
  Stack,
  ToggleButtonGroup,
  ToggleButton,
  Tabs,
  Tab,
  Switch,
  FormControlLabel
} from '@mui/material'
import { alpha, useTheme } from '@mui/material/styles'
import {
  CheckCircle,
  KeyboardArrowLeft,
  KeyboardArrowRight,
  AutoAwesome,
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
  initialOptions = {}
}) => {
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
    setLeftImageIndex(0)
    setRightImageIndex(0)
    setViewType('all')
    setSelectedRoomType('all')
    setIsSynced(true)
  }, [model])

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

  // Utiliza la función de combinaciones para obtener las imágenes base y personalizadas
  const categories = getGalleryCategories(model)
  const baseCategory = categories.find(cat => cat.key === 'base')
  let customKey = 'base'
  if (options.upgrade && options.balcony) customKey = 'upgrade-balcony'
  else if (options.upgrade) customKey = 'upgrade'
  else if (options.balcony) customKey = 'base-balcony'
  const customCategory = categories.find(cat => cat.key === customKey) || baseCategory

  // Unifica imágenes para el panel
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
    label: baseCategory.label
  }
  const rightData = {
    images: filterImages(processImages(customCategory)),
    label: customCategory.label
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
    if (onConfirm) {
      onConfirm({
        model,
        options,
        totalPrice: calculatePrice()
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

return (
  <Box
    sx={{
      width: '100%',
      maxWidth: 1400,
      mx: 'auto',
      my: 0,
      borderRadius: 3,
      overflow: 'hidden',
      boxShadow: { xs: 0, md: 4 },
      bgcolor: 'background.paper',
      minHeight: { xs: 600, md: 700 }
    }}
  >
    {/* Header */}
    <Box sx={{
      p: 3,
      borderBottom: '2px solid #e0e0e0',
      background: (theme) => `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.main} 100%)`,
      color: 'white',
      position: 'relative'
    }}>
      <Typography variant="h4" fontWeight="bold" mb={0.5}>
        {model.model}
      </Typography>
      <Typography variant="body2" sx={{ opacity: 0.9 }}>
        Customize your dream home - Compare configurations side by side
      </Typography>
    </Box>

    {/* Responsive Layout */}
    {isMobile ? (
      <>
        {/* Controles y opciones arriba */}
        <Box sx={{
          px: 2,
          pt: 2,
          pb: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          bgcolor: '#f8f9fa',
          borderBottom: '1px solid #dee2e6'
        }}>
          <Box display="flex" alignItems="center" flexDirection={{xs:'column'}} justifyContent="space-between" mb={2}>
            <FormControlLabel
              control={
                <Switch
                  checked={isSynced}
                  onChange={(e) => setIsSynced(e.target.checked)}
                  color="primary"
                />
              }
              label={
                <Box display="flex" alignItems="center" gap={0.5}>
                  {isSynced ? <Sync fontSize="small" /> : <SyncDisabled fontSize="small" />}
                  <Typography variant="body2" fontWeight="600">
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
                  fontSize: '0.75rem'
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
          {/* Opciones de personalización compactas */}
          <Box sx={{ 
            display: 'flex', 
            gap: 1, 
            flexWrap: 'wrap', 
            mb: 2, 
            justifyContent:{xs:'space-around',sm:'space-around', md:'space-around', lg:'center'} 
            }}>
            {model.upgrades && model.upgrades.length > 0 && (
              <Chip
                icon={<UpgradeIcon sx={{ color: options.upgrade ? '#9c27b0' : '#aaa' }} />}
                label="Upgrade"
                clickable
                color={options.upgrade ? 'secondary' : 'default'}
                onClick={() => toggleOption('upgrade')}
                sx={{ fontWeight: 700, px: 2, fontSize: '1rem' }}
              />
            )}
            {model.balconies && model.balconies.length > 0 && (
              <Chip
                icon={<BalconyIcon sx={{ color: options.balcony ? '#2196f3' : '#aaa' }} />}
                label="Balcony"
                clickable
                color={options.balcony ? 'primary' : 'default'}
                onClick={() => toggleOption('balcony')}
                sx={{ fontWeight: 700, px: 2, fontSize: '1rem' }}
              />
            )}
            {model.storages && model.storages.length > 0 && (
              <Chip
                icon={<StorageIcon sx={{ color: options.storage ? '#4caf50' : '#aaa' }} />}
                label="Storage"
                clickable
                color={options.storage ? 'success' : 'default'}
                onClick={() => toggleOption('storage')}
                sx={{ fontWeight: 700, px: 2, fontSize: '1rem' }}
              />
            )}
          </Box>
          {/* Info básica y total */}
          <Paper elevation={3} sx={{ p: 2, mb: 2, background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }}>
            <Typography variant="caption" color="text.secondary" fontWeight="bold">
              BASE PRICE
            </Typography>
            <Typography variant="h4" fontWeight="bold" color="primary" mb={1}>
              ${model.price.toLocaleString()}
            </Typography>
<Box sx={{ 
    display: 'flex', 
    flexWrap: 'wrap',
    justifyContent: { xs: 'center', sm: 'center', md: 'center', lg: 'space-around', xl:'space-around' },
    gap: 2, 
    mb: 2 }}>
              <Chip icon={<HomeIcon />} label={`${model.bedrooms} Beds`} />
              <Chip icon={<HomeIcon />} label={`${model.bathrooms} Baths`} />
              <Chip icon={<HomeIcon />} label={`${model.sqft} sqft`} />
            </Box>
          </Paper>
          {/* <Paper elevation={6} sx={{ p: 2, mt: 2, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', position: 'relative', overflow: 'hidden' }}>
            <AutoAwesome sx={{ position: 'absolute', top: 16, right: 16, fontSize: 28, opacity: 0.18, color: (theme) => alpha(theme.palette.common.white, 0.9) }} />
            <Typography variant="caption" fontWeight="bold" sx={{ opacity: 0.9 }}>TOTAL PRICE</Typography>
            <Typography variant="h5" fontWeight="bold" mb={1}>${calculatePrice().toLocaleString()}</Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>Includes all selected options</Typography>
          </Paper> */}
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
                background: 'linear-gradient(135deg, #4a7c59 0%, #3d6649 100%)',
                fontSize: '1rem',
                fontWeight: 'bold',
                boxShadow: 4,
                '&:hover': { boxShadow: 8, transform: 'translateY(-2px)', transition: 'all 0.3s' }
              }}
            >
              Confirm Selection
            </Button>
          )}
        </Box>
        {/* Carruseles en dos columnas */}
        <Box sx={{ display: 'flex', flexDirection: 'row', width: '100%', gap: 2, px: 2, pb: 2 }}>
          {/* Carrusel izquierdo */}
          <Box sx={{ flex: 1, bgcolor: '#f8f9fa', borderRadius: 2, overflow: 'hidden' }}>
            <Chip label={leftData.label} size="small" sx={{ bgcolor: '#6c757d', color: 'white', fontWeight: 'bold', m: 1 }} />
            <Box
              sx={{
                bgcolor: '#000',
                borderRadius: 2,
                overflow: 'hidden',
                position: 'relative',
                minHeight: 220,
                height: { xs: 220, sm: 220, md: 220 },
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
                  <Typography color="white">No images available</Typography>
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
                      '&:hover': { bgcolor: 'white', transform: 'scale(1.1) translateY(-50%)' },
                      boxShadow: 3,
                      zIndex: 2
                    }}
                  >
                    <KeyboardArrowLeft />
                  </IconButton>
                  <IconButton
                    onClick={handleLeftNext}
                    sx={{
                      position: 'absolute',
                      right: 8,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      bgcolor: 'rgba(255,255,255,0.95)',
                      '&:hover': { bgcolor: 'white', transform: 'scale(1.1) translateY(-50%)' },
                      boxShadow: 3,
                      zIndex: 2
                    }}
                  >
                    <KeyboardArrowRight />
                  </IconButton>
                  <Box sx={{ position: 'absolute', bottom: 8, left: 8, bgcolor: 'rgba(0,0,0,0.8)', color: 'white', px: 2, py: 0.5, borderRadius: 2 }}>
                    <Typography variant="caption" fontWeight="600">
                      {leftImageIndex + 1} / {leftData.images.length}
                    </Typography>
                  </Box>
                </>
              )}
            </Box>
          </Box>
          {/* Carrusel derecho */}
          <Box sx={{ flex: 1, bgcolor: '#f8f9fa', borderRadius: 2, overflow: 'hidden' }}>
            <Chip label={rightData.label} size="small" sx={{ bgcolor: options.upgrade || options.balcony || options.storage ? '#667eea' : '#6c757d', color: 'white', fontWeight: 'bold', m: 1 }} />
            <Box
              sx={{
                bgcolor: '#000',
                borderRadius: 2,
                overflow: 'hidden',
                position: 'relative',
                minHeight: 220,
                height: { xs: 220, sm: 220, md: 220 },
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
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain'
                    }}
                  />
                ) : (
                  <Typography color="white">No images available</Typography>
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
                      '&:hover': { bgcolor: 'white', transform: 'scale(1.1) translateY(-50%)' },
                      boxShadow: 3,
                      zIndex: 2
                    }}
                  >
                    <KeyboardArrowLeft />
                  </IconButton>
                  <IconButton
                    onClick={handleRightNext}
                    sx={{
                      position: 'absolute',
                      right: 8,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      bgcolor: 'rgba(255,255,255,0.95)',
                      '&:hover': { bgcolor: 'white', transform: 'scale(1.1) translateY(-50%)' },
                      boxShadow: 3,
                      zIndex: 2
                    }}
                  >
                    <KeyboardArrowRight />
                  </IconButton>
                  <Box sx={{ position: 'absolute', bottom: 8, left: 8, bgcolor: 'rgba(0,0,0,0.8)', color: 'white', px: 2, py: 0.5, borderRadius: 2 }}>
                    <Typography variant="caption" fontWeight="600">
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
      // Desktop: dos filas, primera fila opciones, segunda fila tres columnas
      <Box sx={{ width: '100%', p: 3 }}>
        {/* Fila 1: Opciones y sincronización */}
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 3,
          gap: 2
        }}>
          <Box sx={{ display: 'flex', gap: 1 }}>
            {model.upgrades && model.upgrades.length > 0 && (
              <Chip
                icon={<UpgradeIcon sx={{ color: options.upgrade ? '#9c27b0' : '#aaa' }} />}
                label="Upgrade"
                clickable
                color={options.upgrade ? 'secondary' : 'default'}
                onClick={() => toggleOption('upgrade')}
                sx={{ fontWeight: 700, px: 2, fontSize: '1rem' }}
              />
            )}
            {model.balconies && model.balconies.length > 0 && (
              <Chip
                icon={<BalconyIcon sx={{ color: options.balcony ? '#2196f3' : '#aaa' }} />}
                label="Balcony"
                clickable
                color={options.balcony ? 'primary' : 'default'}
                onClick={() => toggleOption('balcony')}
                sx={{ fontWeight: 700, px: 2, fontSize: '1rem' }}
              />
            )}
            {model.storages && model.storages.length > 0 && (
              <Chip
                icon={<StorageIcon sx={{ color: options.storage ? '#4caf50' : '#aaa' }} />}
                label="Storage"
                clickable
                color={options.storage ? 'success' : 'default'}
                onClick={() => toggleOption('storage')}
                sx={{ fontWeight: 700, px: 2, fontSize: '1rem' }}
              />
            )}
          </Box>
          <FormControlLabel
            control={
              <Switch
                checked={isSynced}
                onChange={(e) => setIsSynced(e.target.checked)}
                color="primary"
              />
            }
            label={
              <Box display="flex" alignItems="center" gap={0.5}>
                {isSynced ? <Sync fontSize="small" /> : <SyncDisabled fontSize="small" />}
                <Typography variant="body2" fontWeight="600">
                  {isSynced ? 'Synced' : 'Independent'}
                </Typography>
              </Box>
            }
          />
        </Box>
        {/* Fila 2: Tres columnas */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: '1fr 1.2fr 1fr',
            gap: 3,
            alignItems: 'stretch'
          }}
        >
          {/* Columna 1: Modelo base */}
          <Box sx={{ bgcolor: '#f8f9fa', borderRadius: 2, p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Typography variant="subtitle2" fontWeight="bold" mb={1}>Base Model</Typography>
            <Chip label={leftData.label} size="small" sx={{ bgcolor: '#6c757d', color: 'white', fontWeight: 'bold', mb: 1 }} />
            <Box
              sx={{
                bgcolor: '#000',
                borderRadius: 2,
                overflow: 'hidden',
                position: 'relative',
                minHeight: 220,
                height: 320,
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
                  <Typography color="white">No images available</Typography>
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
                      '&:hover': { bgcolor: 'white', transform: 'scale(1.1) translateY(-50%)' },
                      boxShadow: 3,
                      zIndex: 2
                    }}
                  >
                    <KeyboardArrowLeft />
                  </IconButton>
                  <IconButton
                    onClick={handleLeftNext}
                    sx={{
                      position: 'absolute',
                      right: 8,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      bgcolor: 'rgba(255,255,255,0.95)',
                      '&:hover': { bgcolor: 'white', transform: 'scale(1.1) translateY(-50%)' },
                      boxShadow: 3,
                      zIndex: 2
                    }}
                  >
                    <KeyboardArrowRight />
                  </IconButton>
                  <Box sx={{ position: 'absolute', bottom: 8, left: 8, bgcolor: 'rgba(0,0,0,0.8)', color: 'white', px: 2, py: 0.5, borderRadius: 2 }}>
                    <Typography variant="caption" fontWeight="600">
                      {leftImageIndex + 1} / {leftData.images.length}
                    </Typography>
                  </Box>
                </>
              )}
            </Box>
          </Box>
          {/* Columna 2: Info y confirmación */}
          <Paper elevation={3} sx={{ p: 3, borderRadius: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', bgcolor: 'background.paper', minHeight: 320 }}>
            <Typography variant="h5" fontWeight="bold" color="primary" mb={1}>{model.model}</Typography>
                <Paper elevation={1} sx={{ p: 2, mb: 2, background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', width: '100%' }}>
                    <Typography variant="caption" color="text.secondary" fontWeight="bold">
                    BASE PRICE
                    </Typography>
                    <Typography variant="h4" fontWeight="bold" color="primary" mb={1}>
                    ${model.price.toLocaleString()}
                    </Typography>
                <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                            <Chip icon={<HomeIcon />} label={`${model.bedrooms} Beds`} />
                            <Chip icon={<HomeIcon />} label={`${model.bathrooms} Baths`} />
                            <Chip icon={<HomeIcon />} label={`${model.sqft} sqft`} />
                            </Box>
                </Paper>            
            <Divider sx={{ my: 2, width: '100%' }} />
            
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
              {options.upgrade && <Chip label="Upgrade" color="secondary" size="small" />}
              {options.balcony && <Chip label="Balcony" color="primary" size="small" />}
              {options.storage && <Chip label="Storage" color="success" size="small" />}
            </Box>
            <Button
              variant="contained"
              size="large"
              startIcon={<CheckCircle />}
              onClick={handleConfirm}
              sx={{
                mt: 2,
                background: 'linear-gradient(135deg, #4a7c59 0%, #3d6649 100%)',
                fontWeight: 'bold'
              }}
              fullWidth
            >
              Confirm Selection
            </Button>
          </Paper>
          {/* Columna 3: Modelo personalizado */}
          <Box sx={{ bgcolor: '#f8f9fa', borderRadius: 2, p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Typography variant="subtitle2" fontWeight="bold" mb={1}>Customized</Typography>
            <Chip label={rightData.label} size="small" sx={{ bgcolor: options.upgrade || options.balcony || options.storage ? '#667eea' : '#6c757d', color: 'white', fontWeight: 'bold', mb: 1 }} />
            <Box
              sx={{
                bgcolor: '#000',
                borderRadius: 2,
                overflow: 'hidden',
                position: 'relative',
                minHeight: 220,
                height: 320,
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
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain'
                    }}
                  />
                ) : (
                  <Typography color="white">No images available</Typography>
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
                      '&:hover': { bgcolor: 'white', transform: 'scale(1.1) translateY(-50%)' },
                      boxShadow: 3,
                      zIndex: 2
                    }}
                  >
                    <KeyboardArrowLeft />
                  </IconButton>
                  <IconButton
                    onClick={handleRightNext}
                    sx={{
                      position: 'absolute',
                      right: 8,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      bgcolor: 'rgba(255,255,255,0.95)',
                      '&:hover': { bgcolor: 'white', transform: 'scale(1.1) translateY(-50%)' },
                      boxShadow: 3,
                      zIndex: 2
                    }}
                  >
                    <KeyboardArrowRight />
                  </IconButton>
                  <Box sx={{ position: 'absolute', bottom: 8, left: 8, bgcolor: 'rgba(0,0,0,0.8)', color: 'white', px: 2, py: 0.5, borderRadius: 2 }}>
                    <Typography variant="caption" fontWeight="600">
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