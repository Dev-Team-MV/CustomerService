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
  Stack
} from '@mui/material'
import {
  Close,
  CheckCircle,
  KeyboardArrowLeft,
  KeyboardArrowRight,
  AutoAwesome,
  Balcony as BalconyIcon,
  Upgrade as UpgradeIcon,
  Storage as StorageIcon
} from '@mui/icons-material'

const ModelCustomizationModal = ({ open, model, onClose, onConfirm, initialOptions = {} }) => {
  const [options, setOptions] = useState({
    upgrade: initialOptions.upgrade || false,
    balcony: initialOptions.balcony || false,
    storage: initialOptions.storage || false
  })

  const [leftImageIndex, setLeftImageIndex] = useState(0)
  const [rightImageIndex, setRightImageIndex] = useState(0)

  useEffect(() => {
    if (open) {
      setLeftImageIndex(0)
      setRightImageIndex(0)
    }
  }, [open])

  if (!model) return null

  const hasBalcony = model.balconies && model.balconies.length > 0
  const hasUpgrade = model.upgrades && model.upgrades.length > 0
  const hasStorage = model.storages && model.storages.length > 0

  // ✅ Determinar qué imágenes mostrar en cada columna
  const getLeftImages = () => {
    // SIN BALCÓN + SIN UPGRADE
    return {
      exterior: model.images?.exterior || [],
      interior: model.images?.interior || [],
      label: 'Base Model'
    }
  }

  const getRightImages = () => {
    let exterior = []
    let interior = []
    let label = 'Base Model'

    // Determinar exteriores
    if (options.balcony && hasBalcony) {
      exterior = model.balconies[0].images?.exterior || []
      label = 'Con Balcón'
    } else {
      exterior = model.images?.exterior || []
    }

    // Determinar interiores
    if (options.upgrade && hasUpgrade) {
      interior = model.upgrades[0].images?.interior || []
      label = options.balcony ? 'Con Balcón + Upgrade' : 'Con Upgrade'
    } else {
      interior = model.images?.interior || []
    }

    return { exterior, interior, label }
  }

  const leftData = getLeftImages()
  const rightData = getRightImages()

  const leftAllImages = [...leftData.exterior, ...leftData.interior]
  const rightAllImages = [...rightData.exterior, ...rightData.interior]

  const toggleOption = (option) => {
    setOptions(prev => ({ ...prev, [option]: !prev[option] }))
    setRightImageIndex(0) // Reset al cambiar opciones
  }

  const calculatePrice = () => {
    let total = model.price
    if (options.upgrade && hasUpgrade) total += model.upgrades[0].price
    if (options.balcony && hasBalcony) total += model.balconies[0].price
    if (options.storage && hasStorage) total += model.storages[0].price
    return total
  }

  const handleConfirm = () => {
    onConfirm({
      model,
      options,
      totalPrice: calculatePrice()
    })
  }

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth={false}
      PaperProps={{
        sx: {
          width: '95vw',
          height: '95vh',
          maxWidth: '1600px',
          m: 0,
          borderRadius: 3,
          overflow: 'hidden'
        }
      }}
    >
      <DialogContent sx={{ p: 0, height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <Box sx={{ 
          p: 3, 
          borderBottom: '2px solid #e0e0e0',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
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
              bgcolor: 'rgba(255,255,255,0.1)',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' }
            }}
          >
            <Close />
          </IconButton>
          <Typography variant="h4" fontWeight="bold" mb={0.5}>
            {model.model}
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            Customize your dream home - Compare configurations side by side
          </Typography>
        </Box>

        {/* Main Content - 2 Columns + Middle Controls */}
        <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          {/* LEFT COLUMN - BASE MODEL */}
          <Box sx={{ 
            flex: 1, 
            display: 'flex', 
            flexDirection: 'column',
            borderRight: '2px solid #e0e0e0',
            bgcolor: '#f8f9fa'
          }}>
            {/* Label */}
            <Box sx={{ 
              p: 2, 
              bgcolor: '#e9ecef',
              borderBottom: '1px solid #dee2e6',
              textAlign: 'center'
            }}>
              <Chip 
                label={leftData.label}
                sx={{ 
                  bgcolor: '#6c757d',
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: '0.9rem',
                  px: 2
                }}
              />
            </Box>

            {/* Image Viewer */}
            <Box sx={{ 
              flex: 1, 
              bgcolor: '#000',
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <AnimatePresence mode="wait">
                {leftAllImages.length > 0 ? (
                  <motion.img
                    key={`left-${leftImageIndex}`}
                    src={leftAllImages[leftImageIndex]}
                    initial={{ opacity: 0, scale: 0.9, rotateY: -90 }}
                    animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                    exit={{ opacity: 0, scale: 0.9, rotateY: 90 }}
                    transition={{ duration: 0.5, ease: 'easeInOut' }}
                    style={{
                      maxWidth: '90%',
                      maxHeight: '90%',
                      objectFit: 'contain',
                      borderRadius: '8px'
                    }}
                  />
                ) : (
                  <Typography color="white">No images</Typography>
                )}
              </AnimatePresence>

              {/* Navigation */}
              {leftAllImages.length > 1 && (
                <>
                  <IconButton
                    onClick={() => setLeftImageIndex(prev => prev > 0 ? prev - 1 : leftAllImages.length - 1)}
                    sx={{
                      position: 'absolute',
                      left: 16,
                      bgcolor: 'rgba(255,255,255,0.95)',
                      '&:hover': { bgcolor: 'white', transform: 'scale(1.1)' },
                      boxShadow: 3
                    }}
                  >
                    <KeyboardArrowLeft />
                  </IconButton>
                  <IconButton
                    onClick={() => setLeftImageIndex(prev => prev < leftAllImages.length - 1 ? prev + 1 : 0)}
                    sx={{
                      position: 'absolute',
                      right: 16,
                      bgcolor: 'rgba(255,255,255,0.95)',
                      '&:hover': { bgcolor: 'white', transform: 'scale(1.1)' },
                      boxShadow: 3
                    }}
                  >
                    <KeyboardArrowRight />
                  </IconButton>
                  <Box sx={{
                    position: 'absolute',
                    bottom: 16,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    bgcolor: 'rgba(0,0,0,0.8)',
                    color: 'white',
                    px: 2,
                    py: 1,
                    borderRadius: 2,
                    boxShadow: 2
                  }}>
                    <Typography variant="body2" fontWeight="600">
                      {leftImageIndex + 1} / {leftAllImages.length}
                    </Typography>
                  </Box>
                </>
              )}
            </Box>

            {/* Thumbnails */}
            <Box sx={{ 
              p: 2, 
              bgcolor: '#f8f9fa',
              overflowX: 'auto',
              display: 'flex',
              gap: 1,
              borderTop: '1px solid #dee2e6'
            }}>
              {leftAllImages.map((img, idx) => (
                <motion.div
                  key={idx}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Box
                    onClick={() => setLeftImageIndex(idx)}
                    sx={{
                      width: 80,
                      height: 60,
                      flexShrink: 0,
                      cursor: 'pointer',
                      border: leftImageIndex === idx ? '3px solid #667eea' : '2px solid #dee2e6',
                      borderRadius: 1,
                      overflow: 'hidden',
                      opacity: leftImageIndex === idx ? 1 : 0.6,
                      transition: 'all 0.2s',
                      boxShadow: leftImageIndex === idx ? 2 : 0
                    }}
                  >
                    <Box
                      component="img"
                      src={img}
                      sx={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                    />
                  </Box>
                </motion.div>
              ))}
            </Box>
          </Box>

          {/* MIDDLE COLUMN - CONTROLS */}
          <Box sx={{ 
            width: 400,
            display: 'flex',
            flexDirection: 'column',
            borderRight: '2px solid #e0e0e0',
            bgcolor: '#fff',
            overflow: 'auto'
          }}>
            <Box sx={{ p: 3 }}>
              {/* Base Price */}
              <Paper elevation={3} sx={{ p: 3, mb: 3, background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }}>
                <Typography variant="caption" color="text.secondary" fontWeight="bold">
                  BASE PRICE
                </Typography>
                <Typography variant="h3" fontWeight="bold" color="primary" mb={1}>
                  ${model.price.toLocaleString()}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {model.bedrooms} beds • {model.bathrooms} baths • {model.sqft?.toLocaleString()} sqft
                </Typography>
              </Paper>

              <Divider sx={{ mb: 3 }}>
                <Chip label="Customization Options" size="small" />
              </Divider>

              {/* Options */}
              <Stack spacing={2}>
                {hasUpgrade && (
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Paper
                      onClick={() => toggleOption('upgrade')}
                      elevation={options.upgrade ? 4 : 1}
                      sx={{
                        p: 3,
                        cursor: 'pointer',
                        border: '3px solid',
                        borderColor: options.upgrade ? '#9c27b0' : 'transparent',
                        background: options.upgrade 
                          ? 'linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%)'
                          : 'white',
                        transition: 'all 0.3s',
                        position: 'relative',
                        overflow: 'hidden',
                        '&:hover': { 
                          boxShadow: 6,
                          transform: 'translateY(-2px)'
                        }
                      }}
                    >
                      {options.upgrade && (
                        <CheckCircle 
                          sx={{ 
                            position: 'absolute',
                            top: 12,
                            right: 12,
                            color: '#9c27b0',
                            fontSize: 28
                          }} 
                        />
                      )}
                      <Box display="flex" alignItems="center" gap={1} mb={1}>
                        <UpgradeIcon sx={{ color: '#9c27b0', fontSize: 28 }} />
                        <Typography variant="h6" fontWeight="bold">
                          Premium Upgrade
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary" mb={2}>
                        Premium finishes with high-end materials
                      </Typography>
                      <Typography variant="h5" color="#9c27b0" fontWeight="bold">
                        +${model.upgrades[0].price.toLocaleString()}
                      </Typography>
                    </Paper>
                  </motion.div>
                )}

                {hasBalcony && (
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Paper
                      onClick={() => toggleOption('balcony')}
                      elevation={options.balcony ? 4 : 1}
                      sx={{
                        p: 3,
                        cursor: 'pointer',
                        border: '3px solid',
                        borderColor: options.balcony ? '#2196f3' : 'transparent',
                        background: options.balcony 
                          ? 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)'
                          : 'white',
                        transition: 'all 0.3s',
                        position: 'relative',
                        '&:hover': { 
                          boxShadow: 6,
                          transform: 'translateY(-2px)'
                        }
                      }}
                    >
                      {options.balcony && (
                        <CheckCircle 
                          sx={{ 
                            position: 'absolute',
                            top: 12,
                            right: 12,
                            color: '#2196f3',
                            fontSize: 28
                          }} 
                        />
                      )}
                      <Box display="flex" alignItems="center" gap={1} mb={1}>
                        <BalconyIcon sx={{ color: '#2196f3', fontSize: 28 }} />
                        <Typography variant="h6" fontWeight="bold">
                          Balcony Addition
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary" mb={2}>
                        Outdoor living space with scenic views
                      </Typography>
                      <Typography variant="h5" color="#2196f3" fontWeight="bold">
                        +${model.balconies[0].price.toLocaleString()}
                      </Typography>
                    </Paper>
                  </motion.div>
                )}

                {hasStorage && (
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Paper
                      onClick={() => toggleOption('storage')}
                      elevation={options.storage ? 4 : 1}
                      sx={{
                        p: 3,
                        cursor: 'pointer',
                        border: '3px solid',
                        borderColor: options.storage ? '#4caf50' : 'transparent',
                        background: options.storage 
                          ? 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)'
                          : 'white',
                        transition: 'all 0.3s',
                        position: 'relative',
                        '&:hover': { 
                          boxShadow: 6,
                          transform: 'translateY(-2px)'
                        }
                      }}
                    >
                      {options.storage && (
                        <CheckCircle 
                          sx={{ 
                            position: 'absolute',
                            top: 12,
                            right: 12,
                            color: '#4caf50',
                            fontSize: 28
                          }} 
                        />
                      )}
                      <Box display="flex" alignItems="center" gap={1} mb={1}>
                        <StorageIcon sx={{ color: '#4caf50', fontSize: 28 }} />
                        <Typography variant="h6" fontWeight="bold">
                          Storage Unit
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary" mb={2}>
                        Additional storage for all your needs
                      </Typography>
                      <Typography variant="h5" color="#4caf50" fontWeight="bold">
                        +${model.storages[0].price.toLocaleString()}
                      </Typography>
                    </Paper>
                  </motion.div>
                )}
              </Stack>

              {/* Total Price */}
              <Paper 
                elevation={6}
                sx={{ 
                  p: 3, 
                  mt: 3,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                <AutoAwesome sx={{ 
                  position: 'absolute',
                  top: 16,
                  right: 16,
                  fontSize: 32,
                  opacity: 0.3
                }} />
                <Typography variant="caption" fontWeight="bold" sx={{ opacity: 0.9 }}>
                  TOTAL PRICE
                </Typography>
                <Typography variant="h3" fontWeight="bold" mb={1}>
                  ${calculatePrice().toLocaleString()}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Includes all selected options
                </Typography>
              </Paper>

              {/* Confirm Button */}
              <Button
                variant="contained"
                size="large"
                fullWidth
                startIcon={<CheckCircle />}
                onClick={handleConfirm}
                sx={{
                  mt: 3,
                  py: 2,
                  background: 'linear-gradient(135deg, #4a7c59 0%, #3d6649 100%)',
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                  boxShadow: 4,
                  '&:hover': { 
                    boxShadow: 8,
                    transform: 'translateY(-2px)',
                    transition: 'all 0.3s'
                  }
                }}
              >
                Confirm Selection
              </Button>
            </Box>
          </Box>

          {/* RIGHT COLUMN - CUSTOMIZED MODEL */}
          <Box sx={{ 
            flex: 1, 
            display: 'flex', 
            flexDirection: 'column',
            bgcolor: '#f8f9fa'
          }}>
            {/* Label */}
            <Box sx={{ 
              p: 2, 
              bgcolor: '#e9ecef',
              borderBottom: '1px solid #dee2e6',
              textAlign: 'center'
            }}>
              <Chip 
                label={rightData.label}
                sx={{ 
                  bgcolor: options.upgrade || options.balcony || options.storage ? '#667eea' : '#6c757d',
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: '0.9rem',
                  px: 2
                }}
              />
            </Box>

            {/* Image Viewer */}
            <Box sx={{ 
              flex: 1, 
              bgcolor: '#000',
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <AnimatePresence mode="wait">
                {rightAllImages.length > 0 ? (
                  <motion.img
                    key={`right-${rightImageIndex}-${options.upgrade}-${options.balcony}`}
                    src={rightAllImages[rightImageIndex]}
                    initial={{ opacity: 0, scale: 0.9, rotateY: 90 }}
                    animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                    exit={{ opacity: 0, scale: 0.9, rotateY: -90 }}
                    transition={{ duration: 0.5, ease: 'easeInOut' }}
                    style={{
                      maxWidth: '90%',
                      maxHeight: '90%',
                      objectFit: 'contain',
                      borderRadius: '8px'
                    }}
                  />
                ) : (
                  <Typography color="white">No images</Typography>
                )}
              </AnimatePresence>

              {/* Navigation */}
              {rightAllImages.length > 1 && (
                <>
                  <IconButton
                    onClick={() => setRightImageIndex(prev => prev > 0 ? prev - 1 : rightAllImages.length - 1)}
                    sx={{
                      position: 'absolute',
                      left: 16,
                      bgcolor: 'rgba(255,255,255,0.95)',
                      '&:hover': { bgcolor: 'white', transform: 'scale(1.1)' },
                      boxShadow: 3
                    }}
                  >
                    <KeyboardArrowLeft />
                  </IconButton>
                  <IconButton
                    onClick={() => setRightImageIndex(prev => prev < rightAllImages.length - 1 ? prev + 1 : 0)}
                    sx={{
                      position: 'absolute',
                      right: 16,
                      bgcolor: 'rgba(255,255,255,0.95)',
                      '&:hover': { bgcolor: 'white', transform: 'scale(1.1)' },
                      boxShadow: 3
                    }}
                  >
                    <KeyboardArrowRight />
                  </IconButton>
                  <Box sx={{
                    position: 'absolute',
                    bottom: 16,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    bgcolor: 'rgba(0,0,0,0.8)',
                    color: 'white',
                    px: 2,
                    py: 1,
                    borderRadius: 2,
                    boxShadow: 2
                  }}>
                    <Typography variant="body2" fontWeight="600">
                      {rightImageIndex + 1} / {rightAllImages.length}
                    </Typography>
                  </Box>
                </>
              )}
            </Box>

            {/* Thumbnails */}
            <Box sx={{ 
              p: 2, 
              bgcolor: '#f8f9fa',
              overflowX: 'auto',
              display: 'flex',
              gap: 1,
              borderTop: '1px solid #dee2e6'
            }}>
              {rightAllImages.map((img, idx) => (
                <motion.div
                  key={idx}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Box
                    onClick={() => setRightImageIndex(idx)}
                    sx={{
                      width: 80,
                      height: 60,
                      flexShrink: 0,
                      cursor: 'pointer',
                      border: rightImageIndex === idx ? '3px solid #667eea' : '2px solid #dee2e6',
                      borderRadius: 1,
                      overflow: 'hidden',
                      opacity: rightImageIndex === idx ? 1 : 0.6,
                      transition: 'all 0.2s',
                      boxShadow: rightImageIndex === idx ? 2 : 0
                    }}
                  >
                    <Box
                      component="img"
                      src={img}
                      sx={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                    />
                  </Box>
                </motion.div>
              ))}
            </Box>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  )
}

export default ModelCustomizationModal