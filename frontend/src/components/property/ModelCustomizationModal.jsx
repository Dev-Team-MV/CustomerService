// import { useState, useEffect } from 'react'
// import { motion, AnimatePresence } from 'framer-motion'
// import {
//   Dialog,
//   DialogContent,
//   Box,
//   Typography,
//   IconButton,
//   Button,
//   Paper,
//   Divider,
//   Chip,
//   Stack
// } from '@mui/material'
// import {
//   Close,
//   CheckCircle,
//   KeyboardArrowLeft,
//   KeyboardArrowRight,
//   AutoAwesome,
//   Balcony as BalconyIcon,
//   Upgrade as UpgradeIcon,
//   Storage as StorageIcon
// } from '@mui/icons-material'

// const ModelCustomizationModal = ({ open, model, onClose, onConfirm, initialOptions = {} }) => {
//   const [options, setOptions] = useState({
//     upgrade: initialOptions.upgrade || false,
//     balcony: initialOptions.balcony || false,
//     storage: initialOptions.storage || false
//   })

//   const [leftImageIndex, setLeftImageIndex] = useState(0)
//   const [rightImageIndex, setRightImageIndex] = useState(0)

//   useEffect(() => {
//     if (open) {
//       setLeftImageIndex(0)
//       setRightImageIndex(0)
//     }
//   }, [open])

//   if (!model) return null

//   const hasBalcony = model.balconies && model.balconies.length > 0
//   const hasUpgrade = model.upgrades && model.upgrades.length > 0
//   const hasStorage = model.storages && model.storages.length > 0

//   // ✅ Determinar qué imágenes mostrar en cada columna
//   const getLeftImages = () => {
//     // SIN BALCÓN + SIN UPGRADE
//     return {
//       exterior: model.images?.exterior || [],
//       interior: model.images?.interior || [],
//       label: 'Base Model'
//     }
//   }

//   const getRightImages = () => {
//     let exterior = []
//     let interior = []
//     let label = 'Base Model'

//     // Determinar exteriores
//     if (options.balcony && hasBalcony) {
//       exterior = model.balconies[0].images?.exterior || []
//       label = 'Con Balcón'
//     } else {
//       exterior = model.images?.exterior || []
//     }

//     // Determinar interiores
//     if (options.upgrade && hasUpgrade) {
//       interior = model.upgrades[0].images?.interior || []
//       label = options.balcony ? 'Con Balcón + Upgrade' : 'Con Upgrade'
//     } else {
//       interior = model.images?.interior || []
//     }

//     return { exterior, interior, label }
//   }

//   const leftData = getLeftImages()
//   const rightData = getRightImages()

//   const leftAllImages = [...leftData.exterior, ...leftData.interior]
//   const rightAllImages = [...rightData.exterior, ...rightData.interior]

//   const toggleOption = (option) => {
//     setOptions(prev => ({ ...prev, [option]: !prev[option] }))
//     setRightImageIndex(0) // Reset al cambiar opciones
//   }

//   const calculatePrice = () => {
//     let total = model.price
//     if (options.upgrade && hasUpgrade) total += model.upgrades[0].price
//     if (options.balcony && hasBalcony) total += model.balconies[0].price
//     if (options.storage && hasStorage) total += model.storages[0].price
//     return total
//   }

//   const handleConfirm = () => {
//     onConfirm({
//       model,
//       options,
//       totalPrice: calculatePrice()
//     })
//   }

//   return (
//     <Dialog 
//       open={open} 
//       onClose={onClose}
//       maxWidth={false}
//       PaperProps={{
//         sx: {
//           width: '95vw',
//           height: '95vh',
//           maxWidth: '1600px',
//           m: 0,
//           borderRadius: 3,
//           overflow: 'hidden'
//         }
//       }}
//     >
//       <DialogContent sx={{ p: 0, height: '100%', display: 'flex', flexDirection: 'column' }}>
//         {/* Header */}
//         <Box sx={{ 
//           p: 3, 
//           borderBottom: '2px solid #e0e0e0',
//           background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
//           color: 'white',
//           position: 'relative'
//         }}>
//           <IconButton 
//             onClick={onClose}
//             sx={{ 
//               position: 'absolute',
//               top: 16,
//               right: 16,
//               color: 'white',
//               bgcolor: 'rgba(255,255,255,0.1)',
//               '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' }
//             }}
//           >
//             <Close />
//           </IconButton>
//           <Typography variant="h4" fontWeight="bold" mb={0.5}>
//             {model.model}
//           </Typography>
//           <Typography variant="body2" sx={{ opacity: 0.9 }}>
//             Customize your dream home - Compare configurations side by side
//           </Typography>
//         </Box>

//         {/* Main Content - 2 Columns + Middle Controls */}
//         <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
//           {/* LEFT COLUMN - BASE MODEL */}
//           <Box sx={{ 
//             flex: 1, 
//             display: 'flex', 
//             flexDirection: 'column',
//             borderRight: '2px solid #e0e0e0',
//             bgcolor: '#f8f9fa'
//           }}>
//             {/* Label */}
//             <Box sx={{ 
//               p: 2, 
//               bgcolor: '#e9ecef',
//               borderBottom: '1px solid #dee2e6',
//               textAlign: 'center'
//             }}>
//               <Chip 
//                 label={leftData.label}
//                 sx={{ 
//                   bgcolor: '#6c757d',
//                   color: 'white',
//                   fontWeight: 'bold',
//                   fontSize: '0.9rem',
//                   px: 2
//                 }}
//               />
//             </Box>

//             {/* Image Viewer */}
//             <Box sx={{ 
//               flex: 1, 
//               bgcolor: '#000',
//               position: 'relative',
//               display: 'flex',
//               alignItems: 'center',
//               justifyContent: 'center'
//             }}>
//               <AnimatePresence mode="wait">
//                 {leftAllImages.length > 0 ? (
//                   <motion.img
//                     key={`left-${leftImageIndex}`}
//                     src={leftAllImages[leftImageIndex]}
//                     initial={{ opacity: 0, scale: 0.9, rotateY: -90 }}
//                     animate={{ opacity: 1, scale: 1, rotateY: 0 }}
//                     exit={{ opacity: 0, scale: 0.9, rotateY: 90 }}
//                     transition={{ duration: 0.5, ease: 'easeInOut' }}
//                     style={{
//                       maxWidth: '90%',
//                       maxHeight: '90%',
//                       objectFit: 'contain',
//                       borderRadius: '8px'
//                     }}
//                   />
//                 ) : (
//                   <Typography color="white">No images</Typography>
//                 )}
//               </AnimatePresence>

//               {/* Navigation */}
//               {leftAllImages.length > 1 && (
//                 <>
//                   <IconButton
//                     onClick={() => setLeftImageIndex(prev => prev > 0 ? prev - 1 : leftAllImages.length - 1)}
//                     sx={{
//                       position: 'absolute',
//                       left: 16,
//                       bgcolor: 'rgba(255,255,255,0.95)',
//                       '&:hover': { bgcolor: 'white', transform: 'scale(1.1)' },
//                       boxShadow: 3
//                     }}
//                   >
//                     <KeyboardArrowLeft />
//                   </IconButton>
//                   <IconButton
//                     onClick={() => setLeftImageIndex(prev => prev < leftAllImages.length - 1 ? prev + 1 : 0)}
//                     sx={{
//                       position: 'absolute',
//                       right: 16,
//                       bgcolor: 'rgba(255,255,255,0.95)',
//                       '&:hover': { bgcolor: 'white', transform: 'scale(1.1)' },
//                       boxShadow: 3
//                     }}
//                   >
//                     <KeyboardArrowRight />
//                   </IconButton>
//                   <Box sx={{
//                     position: 'absolute',
//                     bottom: 16,
//                     left: '50%',
//                     transform: 'translateX(-50%)',
//                     bgcolor: 'rgba(0,0,0,0.8)',
//                     color: 'white',
//                     px: 2,
//                     py: 1,
//                     borderRadius: 2,
//                     boxShadow: 2
//                   }}>
//                     <Typography variant="body2" fontWeight="600">
//                       {leftImageIndex + 1} / {leftAllImages.length}
//                     </Typography>
//                   </Box>
//                 </>
//               )}
//             </Box>

//             {/* Thumbnails */}
//             <Box sx={{ 
//               p: 2, 
//               bgcolor: '#f8f9fa',
//               overflowX: 'auto',
//               display: 'flex',
//               gap: 1,
//               borderTop: '1px solid #dee2e6'
//             }}>
//               {leftAllImages.map((img, idx) => (
//                 <motion.div
//                   key={idx}
//                   whileHover={{ scale: 1.1 }}
//                   whileTap={{ scale: 0.95 }}
//                 >
//                   <Box
//                     onClick={() => setLeftImageIndex(idx)}
//                     sx={{
//                       width: 80,
//                       height: 60,
//                       flexShrink: 0,
//                       cursor: 'pointer',
//                       border: leftImageIndex === idx ? '3px solid #667eea' : '2px solid #dee2e6',
//                       borderRadius: 1,
//                       overflow: 'hidden',
//                       opacity: leftImageIndex === idx ? 1 : 0.6,
//                       transition: 'all 0.2s',
//                       boxShadow: leftImageIndex === idx ? 2 : 0
//                     }}
//                   >
//                     <Box
//                       component="img"
//                       src={img}
//                       sx={{
//                         width: '100%',
//                         height: '100%',
//                         objectFit: 'cover'
//                       }}
//                     />
//                   </Box>
//                 </motion.div>
//               ))}
//             </Box>
//           </Box>

//           {/* MIDDLE COLUMN - CONTROLS */}
//           <Box sx={{ 
//             width: 400,
//             display: 'flex',
//             flexDirection: 'column',
//             borderRight: '2px solid #e0e0e0',
//             bgcolor: '#fff',
//             overflow: 'auto'
//           }}>
//             <Box sx={{ p: 3 }}>
//               {/* Base Price */}
//               <Paper elevation={3} sx={{ p: 3, mb: 3, background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }}>
//                 <Typography variant="caption" color="text.secondary" fontWeight="bold">
//                   BASE PRICE
//                 </Typography>
//                 <Typography variant="h3" fontWeight="bold" color="primary" mb={1}>
//                   ${model.price.toLocaleString()}
//                 </Typography>
//                 <Typography variant="body2" color="text.secondary">
//                   {model.bedrooms} beds • {model.bathrooms} baths • {model.sqft?.toLocaleString()} sqft
//                 </Typography>
//               </Paper>

//               <Divider sx={{ mb: 3 }}>
//                 <Chip label="Customization Options" size="small" />
//               </Divider>

//               {/* Options */}
//               <Stack spacing={2}>
//                 {hasUpgrade && (
//                   <motion.div
//                     whileHover={{ scale: 1.02 }}
//                     whileTap={{ scale: 0.98 }}
//                   >
//                     <Paper
//                       onClick={() => toggleOption('upgrade')}
//                       elevation={options.upgrade ? 4 : 1}
//                       sx={{
//                         p: 3,
//                         cursor: 'pointer',
//                         border: '3px solid',
//                         borderColor: options.upgrade ? '#9c27b0' : 'transparent',
//                         background: options.upgrade 
//                           ? 'linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%)'
//                           : 'white',
//                         transition: 'all 0.3s',
//                         position: 'relative',
//                         overflow: 'hidden',
//                         '&:hover': { 
//                           boxShadow: 6,
//                           transform: 'translateY(-2px)'
//                         }
//                       }}
//                     >
//                       {options.upgrade && (
//                         <CheckCircle 
//                           sx={{ 
//                             position: 'absolute',
//                             top: 12,
//                             right: 12,
//                             color: '#9c27b0',
//                             fontSize: 28
//                           }} 
//                         />
//                       )}
//                       <Box display="flex" alignItems="center" gap={1} mb={1}>
//                         <UpgradeIcon sx={{ color: '#9c27b0', fontSize: 28 }} />
//                         <Typography variant="h6" fontWeight="bold">
//                           Premium Upgrade
//                         </Typography>
//                       </Box>
//                       <Typography variant="body2" color="text.secondary" mb={2}>
//                         Premium finishes with high-end materials
//                       </Typography>
//                       <Typography variant="h5" color="#9c27b0" fontWeight="bold">
//                         +${model.upgrades[0].price.toLocaleString()}
//                       </Typography>
//                     </Paper>
//                   </motion.div>
//                 )}

//                 {hasBalcony && (
//                   <motion.div
//                     whileHover={{ scale: 1.02 }}
//                     whileTap={{ scale: 0.98 }}
//                   >
//                     <Paper
//                       onClick={() => toggleOption('balcony')}
//                       elevation={options.balcony ? 4 : 1}
//                       sx={{
//                         p: 3,
//                         cursor: 'pointer',
//                         border: '3px solid',
//                         borderColor: options.balcony ? '#2196f3' : 'transparent',
//                         background: options.balcony 
//                           ? 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)'
//                           : 'white',
//                         transition: 'all 0.3s',
//                         position: 'relative',
//                         '&:hover': { 
//                           boxShadow: 6,
//                           transform: 'translateY(-2px)'
//                         }
//                       }}
//                     >
//                       {options.balcony && (
//                         <CheckCircle 
//                           sx={{ 
//                             position: 'absolute',
//                             top: 12,
//                             right: 12,
//                             color: '#2196f3',
//                             fontSize: 28
//                           }} 
//                         />
//                       )}
//                       <Box display="flex" alignItems="center" gap={1} mb={1}>
//                         <BalconyIcon sx={{ color: '#2196f3', fontSize: 28 }} />
//                         <Typography variant="h6" fontWeight="bold">
//                           Balcony Addition
//                         </Typography>
//                       </Box>
//                       <Typography variant="body2" color="text.secondary" mb={2}>
//                         Outdoor living space with scenic views
//                       </Typography>
//                       <Typography variant="h5" color="#2196f3" fontWeight="bold">
//                         +${model.balconies[0].price.toLocaleString()}
//                       </Typography>
//                     </Paper>
//                   </motion.div>
//                 )}

//                 {hasStorage && (
//                   <motion.div
//                     whileHover={{ scale: 1.02 }}
//                     whileTap={{ scale: 0.98 }}
//                   >
//                     <Paper
//                       onClick={() => toggleOption('storage')}
//                       elevation={options.storage ? 4 : 1}
//                       sx={{
//                         p: 3,
//                         cursor: 'pointer',
//                         border: '3px solid',
//                         borderColor: options.storage ? '#4caf50' : 'transparent',
//                         background: options.storage 
//                           ? 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)'
//                           : 'white',
//                         transition: 'all 0.3s',
//                         position: 'relative',
//                         '&:hover': { 
//                           boxShadow: 6,
//                           transform: 'translateY(-2px)'
//                         }
//                       }}
//                     >
//                       {options.storage && (
//                         <CheckCircle 
//                           sx={{ 
//                             position: 'absolute',
//                             top: 12,
//                             right: 12,
//                             color: '#4caf50',
//                             fontSize: 28
//                           }} 
//                         />
//                       )}
//                       <Box display="flex" alignItems="center" gap={1} mb={1}>
//                         <StorageIcon sx={{ color: '#4caf50', fontSize: 28 }} />
//                         <Typography variant="h6" fontWeight="bold">
//                           Storage Unit
//                         </Typography>
//                       </Box>
//                       <Typography variant="body2" color="text.secondary" mb={2}>
//                         Additional storage for all your needs
//                       </Typography>
//                       <Typography variant="h5" color="#4caf50" fontWeight="bold">
//                         +${model.storages[0].price.toLocaleString()}
//                       </Typography>
//                     </Paper>
//                   </motion.div>
//                 )}
//               </Stack>

//               {/* Total Price */}
//               <Paper 
//                 elevation={6}
//                 sx={{ 
//                   p: 3, 
//                   mt: 3,
//                   background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
//                   color: 'white',
//                   position: 'relative',
//                   overflow: 'hidden'
//                 }}
//               >
//                 <AutoAwesome sx={{ 
//                   position: 'absolute',
//                   top: 16,
//                   right: 16,
//                   fontSize: 32,
//                   opacity: 0.3
//                 }} />
//                 <Typography variant="caption" fontWeight="bold" sx={{ opacity: 0.9 }}>
//                   TOTAL PRICE
//                 </Typography>
//                 <Typography variant="h3" fontWeight="bold" mb={1}>
//                   ${calculatePrice().toLocaleString()}
//                 </Typography>
//                 <Typography variant="body2" sx={{ opacity: 0.9 }}>
//                   Includes all selected options
//                 </Typography>
//               </Paper>

//               {/* Confirm Button */}
//               <Button
//                 variant="contained"
//                 size="large"
//                 fullWidth
//                 startIcon={<CheckCircle />}
//                 onClick={handleConfirm}
//                 sx={{
//                   mt: 3,
//                   py: 2,
//                   background: 'linear-gradient(135deg, #4a7c59 0%, #3d6649 100%)',
//                   fontSize: '1.1rem',
//                   fontWeight: 'bold',
//                   boxShadow: 4,
//                   '&:hover': { 
//                     boxShadow: 8,
//                     transform: 'translateY(-2px)',
//                     transition: 'all 0.3s'
//                   }
//                 }}
//               >
//                 Confirm Selection
//               </Button>
//             </Box>
//           </Box>

//           {/* RIGHT COLUMN - CUSTOMIZED MODEL */}
//           <Box sx={{ 
//             flex: 1, 
//             display: 'flex', 
//             flexDirection: 'column',
//             bgcolor: '#f8f9fa'
//           }}>
//             {/* Label */}
//             <Box sx={{ 
//               p: 2, 
//               bgcolor: '#e9ecef',
//               borderBottom: '1px solid #dee2e6',
//               textAlign: 'center'
//             }}>
//               <Chip 
//                 label={rightData.label}
//                 sx={{ 
//                   bgcolor: options.upgrade || options.balcony || options.storage ? '#667eea' : '#6c757d',
//                   color: 'white',
//                   fontWeight: 'bold',
//                   fontSize: '0.9rem',
//                   px: 2
//                 }}
//               />
//             </Box>

//             {/* Image Viewer */}
//             <Box sx={{ 
//               flex: 1, 
//               bgcolor: '#000',
//               position: 'relative',
//               display: 'flex',
//               alignItems: 'center',
//               justifyContent: 'center'
//             }}>
//               <AnimatePresence mode="wait">
//                 {rightAllImages.length > 0 ? (
//                   <motion.img
//                     key={`right-${rightImageIndex}-${options.upgrade}-${options.balcony}`}
//                     src={rightAllImages[rightImageIndex]}
//                     initial={{ opacity: 0, scale: 0.9, rotateY: 90 }}
//                     animate={{ opacity: 1, scale: 1, rotateY: 0 }}
//                     exit={{ opacity: 0, scale: 0.9, rotateY: -90 }}
//                     transition={{ duration: 0.5, ease: 'easeInOut' }}
//                     style={{
//                       maxWidth: '90%',
//                       maxHeight: '90%',
//                       objectFit: 'contain',
//                       borderRadius: '8px'
//                     }}
//                   />
//                 ) : (
//                   <Typography color="white">No images</Typography>
//                 )}
//               </AnimatePresence>

//               {/* Navigation */}
//               {rightAllImages.length > 1 && (
//                 <>
//                   <IconButton
//                     onClick={() => setRightImageIndex(prev => prev > 0 ? prev - 1 : rightAllImages.length - 1)}
//                     sx={{
//                       position: 'absolute',
//                       left: 16,
//                       bgcolor: 'rgba(255,255,255,0.95)',
//                       '&:hover': { bgcolor: 'white', transform: 'scale(1.1)' },
//                       boxShadow: 3
//                     }}
//                   >
//                     <KeyboardArrowLeft />
//                   </IconButton>
//                   <IconButton
//                     onClick={() => setRightImageIndex(prev => prev < rightAllImages.length - 1 ? prev + 1 : 0)}
//                     sx={{
//                       position: 'absolute',
//                       right: 16,
//                       bgcolor: 'rgba(255,255,255,0.95)',
//                       '&:hover': { bgcolor: 'white', transform: 'scale(1.1)' },
//                       boxShadow: 3
//                     }}
//                   >
//                     <KeyboardArrowRight />
//                   </IconButton>
//                   <Box sx={{
//                     position: 'absolute',
//                     bottom: 16,
//                     left: '50%',
//                     transform: 'translateX(-50%)',
//                     bgcolor: 'rgba(0,0,0,0.8)',
//                     color: 'white',
//                     px: 2,
//                     py: 1,
//                     borderRadius: 2,
//                     boxShadow: 2
//                   }}>
//                     <Typography variant="body2" fontWeight="600">
//                       {rightImageIndex + 1} / {rightAllImages.length}
//                     </Typography>
//                   </Box>
//                 </>
//               )}
//             </Box>

//             {/* Thumbnails */}
//             <Box sx={{ 
//               p: 2, 
//               bgcolor: '#f8f9fa',
//               overflowX: 'auto',
//               display: 'flex',
//               gap: 1,
//               borderTop: '1px solid #dee2e6'
//             }}>
//               {rightAllImages.map((img, idx) => (
//                 <motion.div
//                   key={idx}
//                   whileHover={{ scale: 1.1 }}
//                   whileTap={{ scale: 0.95 }}
//                 >
//                   <Box
//                     onClick={() => setRightImageIndex(idx)}
//                     sx={{
//                       width: 80,
//                       height: 60,
//                       flexShrink: 0,
//                       cursor: 'pointer',
//                       border: rightImageIndex === idx ? '3px solid #667eea' : '2px solid #dee2e6',
//                       borderRadius: 1,
//                       overflow: 'hidden',
//                       opacity: rightImageIndex === idx ? 1 : 0.6,
//                       transition: 'all 0.2s',
//                       boxShadow: rightImageIndex === idx ? 2 : 0
//                     }}
//                   >
//                     <Box
//                       component="img"
//                       src={img}
//                       sx={{
//                         width: '100%',
//                         height: '100%',
//                         objectFit: 'cover'
//                       }}
//                     />
//                   </Box>
//                 </motion.div>
//               ))}
//             </Box>
//           </Box>
//         </Box>
//       </DialogContent>
//     </Dialog>
//   )
// }

// export default ModelCustomizationModal

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
  Stack,
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
  AutoAwesome,
  Balcony as BalconyIcon,
  Upgrade as UpgradeIcon,
  Storage as StorageIcon,
  Sync,
  SyncDisabled,
  Home as HomeIcon
} from '@mui/icons-material'

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
  const [options, setOptions] = useState({
    upgrade: initialOptions.upgrade || false,
    balcony: initialOptions.balcony || false,
    storage: initialOptions.storage || false
  })

  const [viewType, setViewType] = useState('all')
  const [selectedRoomType, setSelectedRoomType] = useState('all')
  const [leftImageIndex, setLeftImageIndex] = useState(0)
  const [rightImageIndex, setRightImageIndex] = useState(0)
  const [isSynced, setIsSynced] = useState(true) // ✅ NUEVO: Estado de sincronización

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

  // ✅ NUEVO: Sincronizar índices cuando está activado
  useEffect(() => {
    if (isSynced) {
      setRightImageIndex(leftImageIndex)
    }
  }, [leftImageIndex, isSynced])

  if (!model) return null

  const hasBalcony = (model.balconies && model.balconies.length > 0) || 
    (model.balconyImages && (model.balconyImages.exterior?.length > 0 || model.balconyImages.interior?.length > 0))

  const hasUpgrade = (model.upgrades && model.upgrades.length > 0) ||
    (model.upgradeImages && (model.upgradeImages.exterior?.length > 0 || model.upgradeImages.interior?.length > 0))

  const hasStorage = (model.storages && model.storages.length > 0) ||
    (model.storageImages && (model.storageImages.exterior?.length > 0 || model.storageImages.interior?.length > 0))

  const upgradePrice = model.upgradePrice || model.upgrades?.[0]?.price || 0
  const balconyPrice = model.balconyPrice || model.balconies?.[0]?.price || 0
  const storagePrice = model.storagePrice || model.storages?.[0]?.price || 0

  const normalizeImage = (img) => {
    if (typeof img === 'string') {
      return { url: img, roomType: 'general' }
    }
    return { url: img.url || img, roomType: img.roomType || 'general' }
  }

  const processImages = (imageSection) => {
    const exteriorImages = (imageSection?.exterior || []).map(img => ({
      url: typeof img === 'string' ? img : img.url,
      type: 'exterior',
      roomType: 'general'
    }))
    
    const interiorImages = (imageSection?.interior || []).map(img => {
      const normalized = normalizeImage(img)
      return {
        url: normalized.url,
        type: 'interior',
        roomType: normalized.roomType
      }
    })

    return [...exteriorImages, ...interiorImages]
  }

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

  const getLeftImages = () => {
    const baseImages = processImages(model.images)
    return {
      images: filterImages(baseImages),
      label: 'Base Model'
    }
  }

  const getRightImages = () => {
    let allImages = []
    let labelParts = []

    if (options.balcony && hasBalcony) {
      const balconyExterior = (model.balconyImages?.exterior || model.balconies?.[0]?.images?.exterior || []).map(img => ({
        url: typeof img === 'string' ? img : img.url,
        type: 'exterior',
        roomType: 'general'
      }))
      
      let interiorImages = []
      if (options.upgrade && hasUpgrade) {
        interiorImages = (model.upgradeImages?.interior || model.upgrades?.[0]?.images?.interior || []).map(img => {
          const normalized = normalizeImage(img)
          return {
            url: normalized.url,
            type: 'interior',
            roomType: normalized.roomType
          }
        })
      } else {
        interiorImages = (model.images?.interior || []).map(img => {
          const normalized = normalizeImage(img)
          return {
            url: normalized.url,
            type: 'interior',
            roomType: normalized.roomType
          }
        })
      }
      
      allImages = [...balconyExterior, ...interiorImages]
      labelParts.push('Balcony')
    } else if (options.upgrade && hasUpgrade) {
      const baseExterior = (model.images?.exterior || []).map(img => ({
        url: typeof img === 'string' ? img : img.url,
        type: 'exterior',
        roomType: 'general'
      }))
      
      const upgradeInterior = (model.upgradeImages?.interior || model.upgrades?.[0]?.images?.interior || []).map(img => {
        const normalized = normalizeImage(img)
        return {
          url: normalized.url,
          type: 'interior',
          roomType: normalized.roomType
        }
      })
      
      allImages = [...baseExterior, ...upgradeInterior]
    } else {
      allImages = processImages(model.images)
    }

    if (options.upgrade && hasUpgrade) labelParts.push('Upgrade')
    if (options.storage && hasStorage) labelParts.push('Storage')

    const label = labelParts.length > 0 ? 'With ' + labelParts.join(' + ') : 'Base Model'

    return {
      images: filterImages(allImages),
      label
    }
  }

  const leftData = getLeftImages()
  const rightData = getRightImages()

  const toggleOption = (option) => {
    setOptions(prev => ({ ...prev, [option]: !prev[option] }))
  }

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

  // ✅ NUEVO: Handlers para navegación
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
          {/* ✅ NUEVO: Switch de sincronización */}
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

        {/* Main Content */}
        <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          {/* LEFT COLUMN - BASE MODEL */}
          <Box sx={{ 
            flex: 1, 
            display: 'flex', 
            flexDirection: 'column',
            borderRight: '2px solid #e0e0e0',
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

            <Box sx={{ flex: 1, bgcolor: '#000', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
                      maxWidth: '90%',
                      maxHeight: '90%',
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
                      bgcolor: 'rgba(255,255,255,0.95)',
                      '&:hover': { bgcolor: 'white', transform: 'scale(1.1)' },
                      boxShadow: 3
                    }}
                  >
                    <KeyboardArrowLeft />
                  </IconButton>
                  <IconButton
                    onClick={handleLeftNext}
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
          <Box sx={{ 
            width: 400,
            display: 'flex',
            flexDirection: 'column',
            borderRight: '2px solid #e0e0e0',
            bgcolor: '#fff',
            overflow: 'auto'
          }}>
            <Box sx={{ p: 3 }}>
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
                {hasUpgrade && (
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

                {hasBalcony && (
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

                {hasStorage && (
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
                <AutoAwesome sx={{ position: 'absolute', top: 16, right: 16, fontSize: 32, opacity: 0.3 }} />
                <Typography variant="caption" fontWeight="bold" sx={{ opacity: 0.9 }}>TOTAL PRICE</Typography>
                <Typography variant="h3" fontWeight="bold" mb={1}>${calculatePrice().toLocaleString()}</Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>Includes all selected options</Typography>
              </Paper>

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
            </Box>
          </Box>

          {/* RIGHT COLUMN - CUSTOMIZED MODEL */}
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', bgcolor: '#f8f9fa' }}>
            <Box sx={{ p: 2, bgcolor: '#e9ecef', borderBottom: '1px solid #dee2e6', textAlign: 'center' }}>
              <Chip 
                label={rightData.label}
                size="small"
                sx={{ 
                  bgcolor: options.upgrade || options.balcony || options.storage ? '#667eea' : '#6c757d',
                  color: 'white',
                  fontWeight: 'bold'
                }}
              />
            </Box>

            <Box sx={{ flex: 1, bgcolor: '#000', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
                      maxWidth: '90%',
                      maxHeight: '90%',
                      objectFit: 'contain'
                    }}
                  />
                ) : (
                  <Typography color="white">No images available</Typography>
                )}
              </AnimatePresence>

              {rightData.images.length > 1 && (
                <>
                  <IconButton onClick={handleRightPrev} sx={{ position: 'absolute', left: 16, bgcolor: 'rgba(255,255,255,0.95)', '&:hover': { bgcolor: 'white', transform: 'scale(1.1)' }, boxShadow: 3 }}>
                    <KeyboardArrowLeft />
                  </IconButton>
                  <IconButton onClick={handleRightNext} sx={{ position: 'absolute', right: 16, bgcolor: 'rgba(255,255,255,0.95)', '&:hover': { bgcolor: 'white', transform: 'scale(1.1)' }, boxShadow: 3 }}>
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
      </DialogContent>
    </Dialog>
  )
}

export default ModelCustomizationModal