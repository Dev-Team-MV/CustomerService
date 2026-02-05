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

//   return (
//     <Box
//       sx={{
//         width: '100%',
//         maxWidth: 1400,
//         mx: 'auto',
//         my: 0,
//         borderRadius: 3,
//         overflow: 'hidden',
//         boxShadow: { xs: 0, md: 4 },
//         display: 'flex',
//         flexDirection: 'column',
//         bgcolor: 'background.paper',
//         minHeight: { xs: 600, md: 700 }
//       }}
//     >
//       {/* Header */}
//       <Box sx={{
//         p: 3,
//         borderBottom: '2px solid #e0e0e0',
//         background: (theme) => `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.main} 100%)`,
//         color: 'white',
//         position: 'relative'
//       }}>
//         <Typography variant="h4" fontWeight="bold" mb={0.5}>
//           {model.model}
//         </Typography>
//         <Typography variant="body2" sx={{ opacity: 0.9 }}>
//           Customize your dream home - Compare configurations side by side
//         </Typography>
//       </Box>

//       {/* Controls Bar */}
//       <Box sx={{
//         p: 2,
//         bgcolor: '#f8f9fa',
//         borderBottom: '1px solid #dee2e6',
//         display: 'flex',
//         gap: 2,
//         alignItems: 'center',
//         justifyContent: 'space-between',
//         flexWrap: 'wrap'
//       }}>
//         <Box display="flex" alignItems="center" gap={2}>
//           <FormControlLabel
//             control={
//               <Switch
//                 checked={isSynced}
//                 onChange={(e) => setIsSynced(e.target.checked)}
//                 color="primary"
//               />
//             }
//             label={
//               <Box display="flex" alignItems="center" gap={0.5}>
//                 {isSynced ? <Sync fontSize="small" /> : <SyncDisabled fontSize="small" />}
//                 <Typography variant="body2" fontWeight="600">
//                   {isSynced ? 'Synced' : 'Independent'}
//                 </Typography>
//               </Box>
//             }
//           />
//         </Box>

//         <Box>
//           <ToggleButtonGroup
//             value={viewType}
//             exclusive
//             onChange={(e, newValue) => {
//               if (newValue !== null) {
//                 setViewType(newValue)
//                 if (newValue !== 'interior') {
//                   setSelectedRoomType('all')
//                 }
//               }
//             }}
//             size="small"
//           >
//             <ToggleButton value="all">
//               <HomeIcon sx={{ mr: 0.5 }} fontSize="small" />
//               All
//             </ToggleButton>
//             <ToggleButton value="exterior">
//               Exterior
//             </ToggleButton>
//             <ToggleButton value="interior">
//               Interior
//             </ToggleButton>
//           </ToggleButtonGroup>
//         </Box>

//         {viewType === 'interior' && (
//           <Box sx={{ flex: 1, minWidth: 300 }}>
//             <Tabs
//               value={selectedRoomType}
//               onChange={(e, newValue) => setSelectedRoomType(newValue)}
//               variant="scrollable"
//               scrollButtons="auto"
//               sx={{
//                 minHeight: 36,
//                 '& .MuiTab-root': {
//                   minHeight: 36,
//                   py: 0.5,
//                   fontSize: '0.75rem'
//                 }
//               }}
//             >
//               <Tab label="All Rooms" value="all" />
//               {ROOM_TYPES.map(room => (
//                 <Tab
//                   key={room.id}
//                   label={`${room.icon} ${room.label}`}
//                   value={room.id}
//                 />
//               ))}
//             </Tabs>
//           </Box>
//         )}
//       </Box>

//       {/* Opciones de customización SOLO en mobile */}
//       {/* {isMobile && (
//   <Box sx={{
//     p: 2,
//     bgcolor: '#f8f9fa',
//     borderBottom: '1px solid #dee2e6',
//     display: 'flex',
//     gap: 2,
//     flexDirection: 'row',
//     justifyContent: 'center'
//   }}>
//     {model.upgrades && model.upgrades.length > 0 && (
//       <IconButton
//         onClick={() => toggleOption('upgrade')}
//         sx={{
//           bgcolor: options.upgrade ? '#f3e5f5' : 'white',
//           border: options.upgrade ? '2px solid #9c27b0' : '2px solid #eee',
//           color: '#9c27b0',
//           mx: 1,
//           width: 56,
//           height: 56,
//           boxShadow: options.upgrade ? 3 : 0,
//           '&:hover': { bgcolor: '#e1bee7' }
//         }}
//       >
//         <UpgradeIcon />
//       </IconButton>
//     )}
//     {model.balconies && model.balconies.length > 0 && (
//       <IconButton
//         onClick={() => toggleOption('balcony')}
//         sx={{
//           bgcolor: options.balcony ? '#e3f2fd' : 'white',
//           border: options.balcony ? '2px solid #2196f3' : '2px solid #eee',
//           color: '#2196f3',
//           mx: 1,
//           width: 56,
//           height: 56,
//           boxShadow: options.balcony ? 3 : 0,
//           '&:hover': { bgcolor: '#bbdefb' }
//         }}
//       >
//         <BalconyIcon />
//       </IconButton>
//     )}
//     {model.storages && model.storages.length > 0 && (
//       <IconButton
//         onClick={() => toggleOption('storage')}
//         sx={{
//           bgcolor: options.storage ? '#e8f5e9' : 'white',
//           border: options.storage ? '2px solid #4caf50' : '2px solid #eee',
//           color: '#4caf50',
//           mx: 1,
//           width: 56,
//           height: 56,
//           boxShadow: options.storage ? 3 : 0,
//           '&:hover': { bgcolor: '#c8e6c9' }
//         }}
//       >
//         <StorageIcon />
//       </IconButton>
//     )}
//   </Box>
//       )} */}

//       {/* Main Content */}
//       <Box sx={{
//         display: 'flex',
//         flex: 1,
//         overflow: 'hidden',
//         flexDirection: { xs: 'column', md: 'row' }
//       }}>
//         {/* LEFT COLUMN - BASE MODEL */}
//         <Box sx={{
//           flex: 1,
//           display: 'flex',
//           flexDirection: 'column',
//           borderRight: { md: '2px solid #e0e0e0' },
//           bgcolor: '#f8f9fa'
//         }}>
//           <Box sx={{
//             p: 2,
//             bgcolor: '#e9ecef',
//             borderBottom: '1px solid #dee2e6',
//             textAlign: 'center'
//           }}>
//             <Chip
//               label={leftData.label}
//               size="small"
//               sx={{
//                 bgcolor: '#6c757d',
//                 color: 'white',
//                 fontWeight: 'bold'
//               }}
//             />
//           </Box>

//           <Box
//             sx={{
//               flex: 1,
//               bgcolor: '#000',
//               position: 'relative',
//               display: 'flex',
//               alignItems: 'center',
//               justifyContent: 'center',
//               minHeight: { xs: 220, sm: 320, md: 400 },
//               maxHeight: { xs: 220, sm: 320, md: 700 },
//               height: { xs: 220, sm: 320, md: 700 }
//             }}
//           >
//             <AnimatePresence mode="wait">
//               {leftData.images[leftImageIndex] ? (
//                 <motion.img
//                   key={`left-${leftImageIndex}-${viewType}-${selectedRoomType}`}
//                   src={leftData.images[leftImageIndex].url}
//                   initial={{ opacity: 0, scale: 0.9 }}
//                   animate={{ opacity: 1, scale: 1 }}
//                   exit={{ opacity: 0, scale: 0.9 }}
//                   transition={{ duration: 0.3 }}
//                   style={{
//                     width: '100%',
//                     height: '100%',
//                     objectFit: 'contain'
//                   }}
//                 />
//               ) : (
//                 <Typography color="white">No images available</Typography>
//               )}
//             </AnimatePresence>

//             {leftData.images.length > 1 && (
//               <>
//                 <IconButton
//                   onClick={handleLeftPrev}
//                   sx={{
//                     position: 'absolute',
//                     left: 16,
//                     top: '50%',
//                     transform: 'translateY(-50%)',
//                     bgcolor: 'rgba(255,255,255,0.95)',
//                     '&:hover': { bgcolor: 'white', transform: 'scale(1.1) translateY(-50%)' },
//                     boxShadow: 3,
//                     zIndex: 2
//                   }}
//                 >
//                   <KeyboardArrowLeft />
//                 </IconButton>
//                 <IconButton
//                   onClick={handleLeftNext}
//                   sx={{
//                     position: 'absolute',
//                     right: 16,
//                     top: '50%',
//                     transform: 'translateY(-50%)',
//                     bgcolor: 'rgba(255,255,255,0.95)',
//                     '&:hover': { bgcolor: 'white', transform: 'scale(1.1) translateY(-50%)' },
//                     boxShadow: 3,
//                     zIndex: 2
//                   }}
//                 >
//                   <KeyboardArrowRight />
//                 </IconButton>
//                 <Box sx={{ position: 'absolute', bottom: 16, left: 16, bgcolor: 'rgba(0,0,0,0.8)', color: 'white', px: 2, py: 0.5, borderRadius: 2 }}>
//                   <Typography variant="caption" fontWeight="600">
//                     {leftImageIndex + 1} / {leftData.images.length}
//                   </Typography>
//                 </Box>
//               </>
//             )}
//           </Box>
//         </Box>

//         {/* MIDDLE COLUMN - CONTROLS */}
//         <Box sx={{ p: 3 }}>
//           <Paper elevation={3} sx={{ p: 3, mb: 3, background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }}>
//             <Typography variant="caption" color="text.secondary" fontWeight="bold">
//               BASE PRICE
//             </Typography>
//             <Typography variant="h3" fontWeight="bold" color="primary" mb={1}>
//               ${model.price.toLocaleString()}
//             </Typography>
//             <Typography variant="body2" color="text.secondary">
//               {model.bedrooms} beds • {model.bathrooms} baths • {model.sqft?.toLocaleString()} sqft
//             </Typography>
//           </Paper>
        
//           <Divider sx={{ mb: 3 }}>
//             <Chip label="Customization Options" size="small" />
//           </Divider>
        
//           {/* Opciones compactas SOLO en mobile */}
//           {isMobile ? (
//             <Box sx={{
//               display: 'flex',
//               flexDirection: 'row',
//               justifyContent: 'center',
//               gap: 2,
//               mb: 3
//             }}>
//               {model.upgrades && model.upgrades.length > 0 && (
//                 <IconButton
//                   onClick={() => toggleOption('upgrade')}
//                   sx={{
//                     bgcolor: options.upgrade ? '#f3e5f5' : 'white',
//                     border: options.upgrade ? '2px solid #9c27b0' : '2px solid #eee',
//                     color: '#9c27b0',
//                     width: 56,
//                     height: 56,
//                     boxShadow: options.upgrade ? 3 : 0,
//                     '&:hover': { bgcolor: '#e1bee7' }
//                   }}
//                 >
//                   <UpgradeIcon />
//                 </IconButton>
//               )}
//               {model.balconies && model.balconies.length > 0 && (
//                 <IconButton
//                   onClick={() => toggleOption('balcony')}
//                   sx={{
//                     bgcolor: options.balcony ? '#e3f2fd' : 'white',
//                     border: options.balcony ? '2px solid #2196f3' : '2px solid #eee',
//                     color: '#2196f3',
//                     width: 56,
//                     height: 56,
//                     boxShadow: options.balcony ? 3 : 0,
//                     '&:hover': { bgcolor: '#bbdefb' }
//                   }}
//                 >
//                   <BalconyIcon />
//                 </IconButton>
//               )}
//               {model.storages && model.storages.length > 0 && (
//                 <IconButton
//                   onClick={() => toggleOption('storage')}
//                   sx={{
//                     bgcolor: options.storage ? '#e8f5e9' : 'white',
//                     border: options.storage ? '2px solid #4caf50' : '2px solid #eee',
//                     color: '#4caf50',
//                     width: 56,
//                     height: 56,
//                     boxShadow: options.storage ? 3 : 0,
//                     '&:hover': { bgcolor: '#c8e6c9' }
//                   }}
//                 >
//                   <StorageIcon />
//                 </IconButton>
//               )}
//             </Box>
//           ) : (
//             // Opciones grandes SOLO en desktop
//             <Stack spacing={2}>
//               {model.upgrades && model.upgrades.length > 0 && (
//                 <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
//                   <Paper
//                     onClick={() => toggleOption('upgrade')}
//                     elevation={options.upgrade ? 4 : 1}
//                     sx={{
//                       p: 3,
//                       cursor: 'pointer',
//                       border: '3px solid',
//                       borderColor: options.upgrade ? '#9c27b0' : 'transparent',
//                       background: options.upgrade
//                         ? 'linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%)'
//                         : 'white',
//                       transition: 'all 0.3s',
//                       position: 'relative',
//                       overflow: 'hidden',
//                       '&:hover': { boxShadow: 6, transform: 'translateY(-2px)' }
//                     }}
//                   >
//                     {options.upgrade && (
//                       <CheckCircle sx={{ position: 'absolute', top: 12, right: 12, color: '#9c27b0', fontSize: 28 }} />
//                     )}
//                     <Box display="flex" alignItems="center" gap={1} mb={1}>
//                       <UpgradeIcon sx={{ color: '#9c27b0', fontSize: 28 }} />
//                       <Typography variant="h6" fontWeight="bold">Premium Upgrade</Typography>
//                     </Box>
//                     <Typography variant="body2" color="text.secondary" mb={2}>
//                       Premium finishes with high-end materials
//                     </Typography>
//                     <Typography variant="h5" color="#9c27b0" fontWeight="bold">
//                       +${upgradePrice.toLocaleString()}
//                     </Typography>
//                   </Paper>
//                 </motion.div>
//               )}
        
//               {model.balconies && model.balconies.length > 0 && (
//                 <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
//                   <Paper
//                     onClick={() => toggleOption('balcony')}
//                     elevation={options.balcony ? 4 : 1}
//                     sx={{
//                       p: 3,
//                       cursor: 'pointer',
//                       border: '3px solid',
//                       borderColor: options.balcony ? '#2196f3' : 'transparent',
//                       background: options.balcony
//                         ? 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)'
//                         : 'white',
//                       transition: 'all 0.3s',
//                       position: 'relative',
//                       '&:hover': { boxShadow: 6, transform: 'translateY(-2px)' }
//                     }}
//                   >
//                     {options.balcony && (
//                       <CheckCircle sx={{ position: 'absolute', top: 12, right: 12, color: '#2196f3', fontSize: 28 }} />
//                     )}
//                     <Box display="flex" alignItems="center" gap={1} mb={1}>
//                       <BalconyIcon sx={{ color: '#2196f3', fontSize: 28 }} />
//                       <Typography variant="h6" fontWeight="bold">Balcony Addition</Typography>
//                     </Box>
//                     <Typography variant="body2" color="text.secondary" mb={2}>
//                       Outdoor living space with scenic views
//                     </Typography>
//                     <Typography variant="h5" color="#2196f3" fontWeight="bold">
//                       +${balconyPrice.toLocaleString()}
//                     </Typography>
//                   </Paper>
//                 </motion.div>
//               )}
        
//               {model.storages && model.storages.length > 0 && (
//                 <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
//                   <Paper
//                     onClick={() => toggleOption('storage')}
//                     elevation={options.storage ? 4 : 1}
//                     sx={{
//                       p: 3,
//                       cursor: 'pointer',
//                       border: '3px solid',
//                       borderColor: options.storage ? '#4caf50' : 'transparent',
//                       background: options.storage
//                         ? 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)'
//                         : 'white',
//                       transition: 'all 0.3s',
//                       position: 'relative',
//                       overflow: 'hidden',
//                       '&:hover': { boxShadow: 6, transform: 'translateY(-2px)' }
//                     }}
//                   >
//                     {options.storage && (
//                       <CheckCircle sx={{ position: 'absolute', top: 12, right: 12, color: '#4caf50', fontSize: 28 }} />
//                     )}
//                     <Box display="flex" alignItems="center" gap={1} mb={1}>
//                       <StorageIcon sx={{ color: '#4caf50', fontSize: 28 }} />
//                       <Typography variant="h6" fontWeight="bold">Storage Unit</Typography>
//                     </Box>
//                     <Typography variant="body2" color="text.secondary" mb={2}>
//                       Additional storage for all your needs
//                     </Typography>
//                     <Typography variant="h5" color="#4caf50" fontWeight="bold">
//                       +${storagePrice.toLocaleString()}
//                     </Typography>
//                   </Paper>
//                 </motion.div>
//               )}
//             </Stack>
//           )}
        
//           <Paper elevation={6} sx={{ p: 3, mt: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', position: 'relative', overflow: 'hidden' }}>
//             <AutoAwesome sx={{ position: 'absolute', top: 16, right: 16, fontSize: 32, opacity: 0.18, color: (theme) => alpha(theme.palette.common.white, 0.9) }} />
//             <Typography variant="caption" fontWeight="bold" sx={{ opacity: 0.9 }}>TOTAL PRICE</Typography>
//             <Typography variant="h3" fontWeight="bold" mb={1}>${calculatePrice().toLocaleString()}</Typography>
//             <Typography variant="body2" sx={{ opacity: 0.9 }}>Includes all selected options</Typography>
//           </Paper>
        
//           {onConfirm && (
//             <Button
//               variant="contained"
//               size="large"
//               fullWidth
//               startIcon={<CheckCircle />}
//               onClick={handleConfirm}
//               sx={{
//                 mt: 3,
//                 py: 2,
//                 background: 'linear-gradient(135deg, #4a7c59 0%, #3d6649 100%)',
//                 fontSize: '1.1rem',
//                 fontWeight: 'bold',
//                 boxShadow: 4,
//                 '&:hover': { boxShadow: 8, transform: 'translateY(-2px)', transition: 'all 0.3s' }
//               }}
//             >
//               Confirm Selection
//             </Button>
//           )}
//         </Box>

//         {/* RIGHT COLUMN - CUSTOMIZED MODEL */}
//         <Box sx={{
//           flex: 1,
//           display: 'flex',
//           flexDirection: 'column',
//           bgcolor: '#f8f9fa'
//         }}>
//           <Box sx={{
//             p: 2,
//             bgcolor: '#e9ecef',
//             borderBottom: '1px solid #dee2e6',
//             textAlign: 'center'
//           }}>
//             <Chip
//               label={rightData.label}
//               size="small"
//               sx={{
//                 bgcolor: options.upgrade || options.balcony || options.storage ? '#667eea' : '#6c757d',
//                 color: 'white',
//                 fontWeight: 'bold',
//                 display: 'inline-flex',
//                 maxWidth: { xs: 180, sm: 240, md: 320 },
//                 overflow: 'hidden',
//                 textOverflow: 'ellipsis',
//                 whiteSpace: 'nowrap',
//               }}
//             />
//           </Box>

//           <Box
//             sx={{
//               flex: 1,
//               bgcolor: '#000',
//               position: 'relative',
//               display: 'flex',
//               alignItems: 'center',
//               justifyContent: 'center',
//               minHeight: { xs: 220, sm: 320, md: 400 },
//               maxHeight: { xs: 220, sm: 320, md: 700 },
//               height: { xs: 220, sm: 320, md: 700 }
//             }}
//           >
//             <AnimatePresence mode="wait">
//               {rightData.images[rightImageIndex] ? (
//                 <motion.img
//                   key={`right-${rightImageIndex}-${viewType}-${selectedRoomType}-${options.upgrade}-${options.balcony}-${options.storage}`}
//                   src={rightData.images[rightImageIndex].url}
//                   initial={{ opacity: 0, scale: 0.9 }}
//                   animate={{ opacity: 1, scale: 1 }}
//                   exit={{ opacity: 0, scale: 0.9 }}
//                   transition={{ duration: 0.3 }}
//                   style={{
//                     width: '100%',
//                     height: '100%',
//                     objectFit: 'contain'
//                   }}
//                 />
//               ) : (
//                 <Typography color="white">No images available</Typography>
//               )}
//             </AnimatePresence>

//             {rightData.images.length > 1 && (
//               <>
//                 <IconButton
//                   onClick={handleRightPrev}
//                   sx={{
//                     position: 'absolute',
//                     left: 16,
//                     top: '50%',
//                     transform: 'translateY(-50%)',
//                     bgcolor: 'rgba(255,255,255,0.95)',
//                     '&:hover': { bgcolor: 'white', transform: 'scale(1.1) translateY(-50%)' },
//                     boxShadow: 3,
//                     zIndex: 2
//                   }}
//                 >
//                   <KeyboardArrowLeft />
//                 </IconButton>
//                 <IconButton
//                   onClick={handleRightNext}
//                   sx={{
//                     position: 'absolute',
//                     right: 16,
//                     top: '50%',
//                     transform: 'translateY(-50%)',
//                     bgcolor: 'rgba(255,255,255,0.95)',
//                     '&:hover': { bgcolor: 'white', transform: 'scale(1.1) translateY(-50%)' },
//                     boxShadow: 3,
//                     zIndex: 2
//                   }}
//                 >
//                   <KeyboardArrowRight />
//                 </IconButton>
//                 <Box sx={{ position: 'absolute', bottom: 16, left: 16, bgcolor: 'rgba(0,0,0,0.8)', color: 'white', px: 2, py: 0.5, borderRadius: 2 }}>
//                   <Typography variant="caption" fontWeight="600">
//                     {rightImageIndex + 1} / {rightData.images.length}
//                   </Typography>
//                 </Box>
//               </>
//             )}
//           </Box>
//         </Box>
//       </Box>
//     </Box>
//   )

// ...existing code...

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
      display: 'flex',
      flexDirection: 'column',
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

    {/* Controls Bar */}
    <Box sx={{
      p: 2,
      bgcolor: '#f8f9fa',
      borderBottom: '1px solid #dee2e6',
      display: 'flex',
      gap: 2,
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap'
    }}>
      <Box display="flex" alignItems="center" gap={2}>
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
      <Box>
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
        <Box sx={{ flex: 1, minWidth: 300 }}>
          <Tabs
            value={selectedRoomType}
            onChange={(e, newValue) => setSelectedRoomType(newValue)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              minHeight: 36,
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
        </Box>
      )}
    </Box>

    {/* Responsive Layout */}
    {isMobile ? (
      <>
        {/* Panel de customización */}
        <Box sx={{ p: 2 }}>
          <Paper elevation={3} sx={{ p: 2, mb: 2, background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }}>
            <Typography variant="caption" color="text.secondary" fontWeight="bold">
              BASE PRICE
            </Typography>
            <Typography variant="h4" fontWeight="bold" color="primary" mb={1}>
              ${model.price.toLocaleString()}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {model.bedrooms} beds • {model.bathrooms} baths • {model.sqft?.toLocaleString()} sqft
            </Typography>
          </Paper>
          <Divider sx={{ mb: 2 }}>
            <Chip label="Customization Options" size="small" />
          </Divider>
          <Box sx={{ display: 'flex', gap: 2, flexDirection: 'column', mb: 2 }}>
            {model.upgrades && model.upgrades.length > 0 && (
              <Paper
                onClick={() => toggleOption('upgrade')}
                elevation={options.upgrade ? 4 : 1}
                sx={{
                  p: 2,
                  cursor: 'pointer',
                  border: '2px solid',
                  borderColor: options.upgrade ? '#9c27b0' : 'transparent',
                  background: options.upgrade
                    ? 'linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%)'
                    : 'white',
                  transition: 'all 0.3s',
                  position: 'relative',
                  overflow: 'hidden',
                  mb: 1,
                  '&:hover': { boxShadow: 4, transform: 'translateY(-2px)' }
                }}
              >
                <Box display="flex" alignItems="center" gap={1}>
                  <UpgradeIcon sx={{ color: '#9c27b0', fontSize: 22 }} />
                  <Typography variant="body2" fontWeight="bold">Premium Upgrade</Typography>
                  {options.upgrade && <CheckCircle sx={{ color: '#9c27b0', fontSize: 20, ml: 'auto' }} />}
                </Box>
              </Paper>
            )}
            {model.balconies && model.balconies.length > 0 && (
              <Paper
                onClick={() => toggleOption('balcony')}
                elevation={options.balcony ? 4 : 1}
                sx={{
                  p: 2,
                  cursor: 'pointer',
                  border: '2px solid',
                  borderColor: options.balcony ? '#2196f3' : 'transparent',
                  background: options.balcony
                    ? 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)'
                    : 'white',
                  transition: 'all 0.3s',
                  position: 'relative',
                  overflow: 'hidden',
                  mb: 1,
                  '&:hover': { boxShadow: 4, transform: 'translateY(-2px)' }
                }}
              >
                <Box display="flex" alignItems="center" gap={1}>
                  <BalconyIcon sx={{ color: '#2196f3', fontSize: 22 }} />
                  <Typography variant="body2" fontWeight="bold">Balcony Addition</Typography>
                  {options.balcony && <CheckCircle sx={{ color: '#2196f3', fontSize: 20, ml: 'auto' }} />}
                </Box>
              </Paper>
            )}
            {model.storages && model.storages.length > 0 && (
              <Paper
                onClick={() => toggleOption('storage')}
                elevation={options.storage ? 4 : 1}
                sx={{
                  p: 2,
                  cursor: 'pointer',
                  border: '2px solid',
                  borderColor: options.storage ? '#4caf50' : 'transparent',
                  background: options.storage
                    ? 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)'
                    : 'white',
                  transition: 'all 0.3s',
                  position: 'relative',
                  overflow: 'hidden',
                  mb: 1,
                  '&:hover': { boxShadow: 4, transform: 'translateY(-2px)' }
                }}
              >
                <Box display="flex" alignItems="center" gap={1}>
                  <StorageIcon sx={{ color: '#4caf50', fontSize: 22 }} />
                  <Typography variant="body2" fontWeight="bold">Storage Unit</Typography>
                  {options.storage && <CheckCircle sx={{ color: '#4caf50', fontSize: 20, ml: 'auto' }} />}
                </Box>
              </Paper>
            )}
          </Box>
          <Paper elevation={6} sx={{ p: 2, mt: 2, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', position: 'relative', overflow: 'hidden' }}>
            <AutoAwesome sx={{ position: 'absolute', top: 16, right: 16, fontSize: 28, opacity: 0.18, color: (theme) => alpha(theme.palette.common.white, 0.9) }} />
            <Typography variant="caption" fontWeight="bold" sx={{ opacity: 0.9 }}>TOTAL PRICE</Typography>
            <Typography variant="h5" fontWeight="bold" mb={1}>${calculatePrice().toLocaleString()}</Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>Includes all selected options</Typography>
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
    height: { xs: 220, sm: 320, md: 400 }, // Fija la altura en todos los breakpoints
    maxHeight: { xs: 220, sm: 320, md: 400 }, // Opcional: igual que height para evitar deformaciones
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
    height: { xs: 220, sm: 320, md: 400 }, // Fija la altura en todos los breakpoints
    maxHeight: { xs: 220, sm: 320, md: 400 }, // Opcional: igual que height para evitar deformaciones
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
      // Desktop: layout de 3 columnas como ya tienes
      <Box sx={{
        display: 'flex',
        flex: 1,
        overflow: 'hidden',
        flexDirection: 'row'
      }}>
        {/* LEFT COLUMN - BASE MODEL */}
        <Box sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          borderRight: { md: '2px solid #e0e0e0' },
          bgcolor: '#f8f9fa'
        }}>
          <Box sx={{
            p: 2,
            bgcolor: '#e9ecef',
            borderBottom: '1px solid #dee2e6',
            textAlign: 'center'
          }}>
            <Chip
              label={leftData.label}
              size="small"
              sx={{
                bgcolor: '#6c757d',
                color: 'white',
                fontWeight: 'bold'
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
              justifyContent: 'center',
              minHeight: { xs: 220, sm: 320, md: 400 },
              maxHeight: { xs: 220, sm: 320, md: 700 },
              height: { xs: 220, sm: 320, md: 700 }
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
                    left: 16,
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
                    right: 16,
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
                <Box sx={{ position: 'absolute', bottom: 16, left: 16, bgcolor: 'rgba(0,0,0,0.8)', color: 'white', px: 2, py: 0.5, borderRadius: 2 }}>
                  <Typography variant="caption" fontWeight="600">
                    {leftImageIndex + 1} / {leftData.images.length}
                  </Typography>
                </Box>
              </>
            )}
          </Box>
        </Box>

        {/* MIDDLE COLUMN - CONTROLS */}
        <Box sx={{ width: 350, display: 'flex', flexDirection: 'column', borderRight: { md: '2px solid #e0e0e0' }, bgcolor: '#fff', overflow: 'auto' }}>
          <Box sx={{ p: 2 }}>
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
            <Stack spacing={2}>
              {model.upgrades && model.upgrades.length > 0 && (
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
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
                      '&:hover': { boxShadow: 6, transform: 'translateY(-2px)' }
                    }}
                  >
                    {options.upgrade && (
                      <CheckCircle sx={{ position: 'absolute', top: 12, right: 12, color: '#9c27b0', fontSize: 28 }} />
                    )}
                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                      <UpgradeIcon sx={{ color: '#9c27b0', fontSize: 28 }} />
                      <Typography variant="h6" fontWeight="bold">Premium Upgrade</Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary" mb={2}>
                      Premium finishes with high-end materials
                    </Typography>
                    <Typography variant="h5" color="#9c27b0" fontWeight="bold">
                      +${upgradePrice.toLocaleString()}
                    </Typography>
                  </Paper>
                </motion.div>
              )}
              {model.balconies && model.balconies.length > 0 && (
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
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
                      '&:hover': { boxShadow: 6, transform: 'translateY(-2px)' }
                    }}
                  >
                    {options.balcony && (
                      <CheckCircle sx={{ position: 'absolute', top: 12, right: 12, color: '#2196f3', fontSize: 28 }} />
                    )}
                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                      <BalconyIcon sx={{ color: '#2196f3', fontSize: 28 }} />
                      <Typography variant="h6" fontWeight="bold">Balcony Addition</Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary" mb={2}>
                      Outdoor living space with scenic views
                    </Typography>
                    <Typography variant="h5" color="#2196f3" fontWeight="bold">
                      +${balconyPrice.toLocaleString()}
                    </Typography>
                  </Paper>
                </motion.div>
              )}
              {model.storages && model.storages.length > 0 && (
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
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
                      overflow: 'hidden',
                      '&:hover': { boxShadow: 6, transform: 'translateY(-2px)' }
                    }}
                  >
                    {options.storage && (
                      <CheckCircle sx={{ position: 'absolute', top: 12, right: 12, color: '#4caf50', fontSize: 28 }} />
                    )}
                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                      <StorageIcon sx={{ color: '#4caf50', fontSize: 28 }} />
                      <Typography variant="h6" fontWeight="bold">Storage Unit</Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary" mb={2}>
                      Additional storage for all your needs
                    </Typography>
                    <Typography variant="h5" color="#4caf50" fontWeight="bold">
                      +${storagePrice.toLocaleString()}
                    </Typography>
                  </Paper>
                </motion.div>
              )}
            </Stack>
            <Paper elevation={6} sx={{ p: 3, mt: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', position: 'relative', overflow: 'hidden' }}>
              <AutoAwesome sx={{ position: 'absolute', top: 16, right: 16, fontSize: 32, opacity: 0.18, color: (theme) => alpha(theme.palette.common.white, 0.9) }} />
              <Typography variant="caption" fontWeight="bold" sx={{ opacity: 0.9 }}>TOTAL PRICE</Typography>
              <Typography variant="h3" fontWeight="bold" mb={1}>${calculatePrice().toLocaleString()}</Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>Includes all selected options</Typography>
            </Paper>
            {onConfirm && (
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
                  '&:hover': { boxShadow: 8, transform: 'translateY(-2px)', transition: 'all 0.3s' }
                }}
              >
                Confirm Selection
              </Button>
            )}
          </Box>
        </Box>

        {/* RIGHT COLUMN - CUSTOMIZED MODEL */}
        <Box sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          bgcolor: '#f8f9fa'
        }}>
          <Box sx={{
            p: 2,
            bgcolor: '#e9ecef',
            borderBottom: '1px solid #dee2e6',
            textAlign: 'center'
          }}>
            <Chip
              label={rightData.label}
              size="small"
              sx={{
                bgcolor: options.upgrade || options.balcony || options.storage ? '#667eea' : '#6c757d',
                color: 'white',
                fontWeight: 'bold',
                display: 'inline-flex',
                maxWidth: { xs: 180, sm: 240, md: 320 },
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
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
              justifyContent: 'center',
              minHeight: { xs: 220, sm: 320, md: 400 },
              maxHeight: { xs: 220, sm: 320, md: 700 },
              height: { xs: 220, sm: 320, md: 700 }
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
                    left: 16,
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
                    right: 16,
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
                <Box sx={{ position: 'absolute', bottom: 16, left: 16, bgcolor: 'rgba(0,0,0,0.8)', color: 'white', px: 2, py: 0.5, borderRadius: 2 }}>
                  <Typography variant="caption" fontWeight="600">
                    {rightImageIndex + 1} / {rightData.images.length}
                  </Typography>
                </Box>
              </>
            )}
          </Box>
        </Box>
      </Box>
    )}
  </Box>
)
}

export default ModelCustomizationPanel