// import { useState, useEffect, useRef } from 'react'
// import {
//   Box,
//   Paper,
//   Typography,
//   Card,
//   CardContent,
//   Chip,
//   CircularProgress,
//   Alert,
//   IconButton,
//   FormControlLabel,
//   Checkbox,
//   Button
// } from '@mui/material'
// import { 
//   Home, 
//   Bed, 
//   Bathtub, 
//   SquareFoot, 
//   ChevronLeft, 
//   ChevronRight,
//   Close,
//   InfoOutlined,
//   Visibility
// } from '@mui/icons-material'
// import CheckCircleIcon from '@mui/icons-material/CheckCircle'
// import { useProperty } from '../../context/PropertyContext'
// import { useNavigate } from 'react-router-dom'
// import api from '../../services/api'

// const ModelSelector = () => {
//   const { 
//     selectedModel, 
//     selectModel, 
//     selectedLot,
//     options,
//     toggleOption,
//     getModelPricingInfo,
//     selectedPricingOption
//   } = useProperty()
  
//   const navigate = useNavigate()
//   const [models, setModels] = useState([])
//   const [loading, setLoading] = useState(true)
//   const [error, setError] = useState(null)
//   const [imageIndices, setImageIndices] = useState({})
//   const scrollContainerRef = useRef(null)

//   useEffect(() => {
//     fetchModels()
//   }, [])

//   const fetchModels = async () => {
//     try {
//       setLoading(true)
//       const response = await api.get('/models')
//       const activeModels = response.data.filter(m => m.status === 'active')
//       setModels(activeModels)
      
//       const indices = {}
//       activeModels.forEach(model => {
//         indices[model._id] = 0
//       })
//       setImageIndices(indices)
//     } catch (error) {
//       console.error('Error fetching models:', error)
//       setError('Failed to load models')
//     } finally {
//       setLoading(false)
//     }
//   }

//   const handleSelectModel = (model) => {
//     console.log('Selecting model:', model)
//     selectModel(model)
//   }

//   const handleDeselectModel = () => {
//     selectModel(null)
//   }

//   const handleViewDetails = (e, modelId) => {
//     e.stopPropagation()
//     navigate(`/models/${modelId}`)
//   }

//   const handlePrevImage = (e, modelId, imagesLength) => {
//     e.stopPropagation()
//     setImageIndices(prev => ({
//       ...prev,
//       [modelId]: prev[modelId] > 0 ? prev[modelId] - 1 : imagesLength - 1
//     }))
//   }

//   const handleNextImage = (e, modelId, imagesLength) => {
//     e.stopPropagation()
//     setImageIndices(prev => ({
//       ...prev,
//       [modelId]: prev[modelId] < imagesLength - 1 ? prev[modelId] + 1 : 0
//     }))
//   }

//   const scrollModels = (direction) => {
//     if (scrollContainerRef.current) {
//       const scrollAmount = 320
//       const currentScroll = scrollContainerRef.current.scrollLeft
//       const newScrollLeft = currentScroll + (direction === 'left' ? -scrollAmount : scrollAmount)
//       scrollContainerRef.current.scrollTo({
//         left: newScrollLeft,
//         behavior: 'smooth'
//       })
//     }
//   }

//   if (!selectedLot) {
//     return (
//       <Paper 
//         elevation={2} 
//         sx={{ 
//           p: 3, 
//           bgcolor: '#fff', 
//           borderRadius: 2,
//           border: '1px solid #e0e0e0'
//         }}
//       >
//         <Typography variant="subtitle1" color="text.secondary" textAlign="center" sx={{ py: 2 }}>
//           SELECT A LOT TO VIEW MODELS
//         </Typography>
//       </Paper>
//     )
//   }

//   if (loading) {
//     return (
//       <Paper elevation={2} sx={{ p: 3, bgcolor: '#fff', borderRadius: 2, border: '1px solid #e0e0e0' }}>
//         <Box display="flex" justifyContent="center">
//           <CircularProgress />
//         </Box>
//       </Paper>
//     )
//   }

//   if (error) {
//     return (
//       <Paper elevation={2} sx={{ p: 3, bgcolor: '#fff', borderRadius: 2, border: '1px solid #e0e0e0' }}>
//         <Alert severity="error">{error}</Alert>
//       </Paper>
//     )
//   }

//   const pricingInfo = selectedModel ? getModelPricingInfo() : null
//   const hasPricingOptions = pricingInfo?.hasBalcony || pricingInfo?.hasUpgrade || pricingInfo?.hasStorage

//   return (
//     <Paper 
//       elevation={2} 
//       sx={{ 
//         p: 3, 
//         bgcolor: '#fff', 
//         borderRadius: 2,
//         border: '1px solid #e0e0e0'
//       }}
//     >
//       {/* Header */}
//       <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
//         <Typography variant="subtitle1" fontWeight="bold">
//           02 MODEL SELECTION
//         </Typography>
//         <Box display="flex" alignItems="center" gap={2}>
//           {selectedModel && (
//             <Button
//               size="small"
//               variant="outlined"
//               onClick={handleDeselectModel}
//               startIcon={<Close />}
//               sx={{ 
//                 borderColor: '#e0e0e0',
//                 color: '#666',
//                 '&:hover': { 
//                   borderColor: '#4a7c59',
//                   color: '#4a7c59'
//                 }
//               }}
//             >
//               Clear Selection
//             </Button>
//           )}
//           <Typography variant="caption" color="success.main" fontWeight="bold">
//             {models.length} OPTIONS
//           </Typography>
//         </Box>
//       </Box>

//       {/* Main Content Area - Grid Layout con altura fija */}
//       <Box sx={{ 
//         position: 'relative',
//         height: 450,
//         overflow: 'hidden'
//       }}>
//         {/* Pricing Panel - Posición Absoluta */}
//         <Box
//           sx={{
//             position: 'absolute',
//             left: 0,
//             top: 0,
//             bottom: 0,
//             width: '35%',
//             maxWidth: 380,
//             transform: selectedModel ? 'translateX(0)' : 'translateX(-110%)',
//             opacity: selectedModel ? 1 : 0,
//             transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
//             zIndex: selectedModel ? 10 : 0
//           }}
//         >
//           {selectedModel && (
//             <Box sx={{ 
//               p: 3, 
//               bgcolor: 'grey.50', 
//               borderRadius: 2,
//               border: '2px solid #e0e0e0',
//               height: '100%',
//               overflowY: 'auto',
//               display: 'flex',
//               flexDirection: 'column',
//               '&::-webkit-scrollbar': {
//                 width: 6
//               },
//               '&::-webkit-scrollbar-thumb': {
//                 bgcolor: 'grey.400',
//                 borderRadius: 3
//               }
//             }}>
//               <Typography variant="subtitle2" fontWeight="bold" mb={1}>
//                 📦 Pricing Options
//               </Typography>
//               <Typography variant="caption" color="text.secondary" display="block" mb={2}>
//                 Customize {selectedModel.model}
//               </Typography>

//               {/* Botón Ver Detalles */}
//               <Button
//                 variant="outlined"
//                 size="small"
//                 startIcon={<Visibility />}
//                 onClick={(e) => handleViewDetails(e, selectedModel._id)}
//                 sx={{
//                   mb: 3,
//                   borderColor: '#4a7c59',
//                   color: '#4a7c59',
//                   '&:hover': {
//                     borderColor: '#3d6849',
//                     bgcolor: 'rgba(74, 124, 89, 0.05)'
//                   }
//                 }}
//               >
//                 View Full Details
//               </Button>

//               {hasPricingOptions ? (
//                 <>
//                   <Box display="flex" flexDirection="column" gap={2}>
//                     {/* Upgrade Option */}
//                     {pricingInfo.hasUpgrade && (
//                       <Box
//                         onClick={() => toggleOption('upgrade')}
//                         sx={{
//                           p: 2,
//                           border: '2px solid',
//                           borderColor: options.upgrade ? 'secondary.main' : 'divider',
//                           borderRadius: 2,
//                           bgcolor: options.upgrade ? 'secondary.50' : 'white',
//                           cursor: 'pointer',
//                           transition: 'all 0.2s',
//                           '&:hover': { 
//                             boxShadow: 2,
//                             transform: 'translateY(-2px)'
//                           }
//                         }}
//                       >
//                         <Box display="flex" justifyContent="space-between" alignItems="center">
//                           <FormControlLabel
//                             control={
//                               <Checkbox 
//                                 checked={options.upgrade}
//                                 onChange={(e) => {
//                                   e.stopPropagation()
//                                   toggleOption('upgrade')
//                                 }}
//                                 sx={{
//                                   '&.Mui-checked': {
//                                     color: 'secondary.main'
//                                   }
//                                 }}
//                               />
//                             }
//                             label={
//                               <Box>
//                                 <Typography fontWeight="bold" fontSize="0.9rem">⭐ Upgrade</Typography>
//                                 <Typography variant="caption" color="text.secondary">
//                                   Premium finishes
//                                 </Typography>
//                               </Box>
//                             }
//                             sx={{ m: 0 }}
//                           />
//                           <Typography variant="h6" color="secondary.main" fontWeight="bold">
//                             +${(pricingInfo.upgradePrice / 1000).toFixed(0)}K
//                           </Typography>
//                         </Box>
//                       </Box>
//                     )}

//                     {/* Balcony Option */}
//                     {pricingInfo.hasBalcony && (
//                       <Box
//                         onClick={() => toggleOption('balcony')}
//                         sx={{
//                           p: 2,
//                           border: '2px solid',
//                           borderColor: options.balcony ? 'info.main' : 'divider',
//                           borderRadius: 2,
//                           bgcolor: options.balcony ? 'info.50' : 'white',
//                           cursor: 'pointer',
//                           transition: 'all 0.2s',
//                           '&:hover': { 
//                             boxShadow: 2,
//                             transform: 'translateY(-2px)'
//                           }
//                         }}
//                       >
//                         <Box display="flex" justifyContent="space-between" alignItems="center">
//                           <FormControlLabel
//                             control={
//                               <Checkbox 
//                                 checked={options.balcony}
//                                 onChange={(e) => {
//                                   e.stopPropagation()
//                                   toggleOption('balcony')
//                                 }}
//                                 sx={{
//                                   '&.Mui-checked': {
//                                     color: 'info.main'
//                                   }
//                                 }}
//                               />
//                             }
//                             label={
//                               <Box>
//                                 <Typography fontWeight="bold" fontSize="0.9rem">🌳 Balcony</Typography>
//                                 <Typography variant="caption" color="text.secondary">
//                                   Outdoor space
//                                 </Typography>
//                               </Box>
//                             }
//                             sx={{ m: 0 }}
//                           />
//                           <Typography variant="h6" color="info.main" fontWeight="bold">
//                             +${(pricingInfo.balconyPrice / 1000).toFixed(0)}K
//                           </Typography>
//                         </Box>
//                       </Box>
//                     )}

//                     {/* Storage Option */}
//                     {pricingInfo.hasStorage && (
//                       <Box
//                         onClick={() => toggleOption('storage')}
//                         sx={{
//                           p: 2,
//                           border: '2px solid',
//                           borderColor: options.storage ? 'success.main' : 'divider',
//                           borderRadius: 2,
//                           bgcolor: options.storage ? 'success.50' : 'white',
//                           cursor: 'pointer',
//                           transition: 'all 0.2s',
//                           '&:hover': { 
//                             boxShadow: 2,
//                             transform: 'translateY(-2px)'
//                           }
//                         }}
//                       >
//                         <Box display="flex" justifyContent="space-between" alignItems="center">
//                           <FormControlLabel
//                             control={
//                               <Checkbox 
//                                 checked={options.storage}
//                                 onChange={(e) => {
//                                   e.stopPropagation()
//                                   toggleOption('storage')
//                                 }}
//                                 sx={{
//                                   '&.Mui-checked': {
//                                     color: 'success.main'
//                                   }
//                                 }}
//                               />
//                             }
//                             label={
//                               <Box>
//                                 <Typography fontWeight="bold" fontSize="0.9rem">📦 Storage</Typography>
//                                 <Typography variant="caption" color="text.secondary">
//                                   Extra unit
//                                 </Typography>
//                               </Box>
//                             }
//                             sx={{ m: 0 }}
//                           />
//                           <Typography variant="h6" color="success.main" fontWeight="bold">
//                             +${(pricingInfo.storagePrice / 1000).toFixed(0)}K
//                           </Typography>
//                         </Box>
//                       </Box>
//                     )}
//                   </Box>

//                   {/* Selected Configuration Summary */}
//                   {selectedPricingOption && (
//                     <Box mt={3} p={2} bgcolor="primary.50" borderRadius={1} border="2px solid" borderColor="primary.main">
//                       <Typography variant="caption" fontWeight="bold" color="primary.main">
//                         SELECTED CONFIG
//                       </Typography>
//                       <Typography variant="body2" fontWeight="bold" mt={0.5}>
//                         {selectedPricingOption.label}
//                       </Typography>
//                       <Typography variant="h5" color="primary.main" fontWeight="bold" mt={0.5}>
//                         ${selectedPricingOption.price.toLocaleString()}
//                       </Typography>
//                     </Box>
//                   )}
//                 </>
//               ) : (
//                 // Mensaje cuando NO hay pricing options
//                 <Box 
//                   sx={{ 
//                     flex: 1,
//                     display: 'flex',
//                     flexDirection: 'column',
//                     alignItems: 'center',
//                     justifyContent: 'center',
//                     textAlign: 'center',
//                     py: 4
//                   }}
//                 >
//                   <InfoOutlined 
//                     sx={{ 
//                       fontSize: 60, 
//                       color: 'grey.300',
//                       mb: 2
//                     }} 
//                   />
//                   <Typography variant="h6" fontWeight="bold" color="text.secondary" mb={1}>
//                     No Additional Options
//                   </Typography>
//                   <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 250 }}>
//                     This model comes as a complete package with no additional customization options available.
//                   </Typography>
//                   <Box 
//                     mt={3} 
//                     p={2} 
//                     bgcolor="grey.100" 
//                     borderRadius={1} 
//                     width="100%"
//                   >
//                     <Typography variant="caption" fontWeight="bold" color="text.secondary">
//                       BASE PRICE
//                     </Typography>
//                     <Typography variant="h5" color="primary.main" fontWeight="bold" mt={0.5}>
//                       ${selectedModel.price.toLocaleString()}
//                     </Typography>
//                   </Box>
//                 </Box>
//               )}
//             </Box>
//           )}
//         </Box>

//         {/* Models Container */}
//         <Box
//           sx={{
//             position: 'absolute',
//             right: 0,
//             top: 0,
//             bottom: 0,
//             left: selectedModel ? '38%' : 0,
//             transition: 'left 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
//             overflow: 'hidden',
//             display: 'flex',
//             alignItems: 'center',
//             justifyContent: selectedModel ? 'center' : 'flex-start'
//           }}
//         >
//           <Box
//             ref={scrollContainerRef}
//             sx={{
//               display: 'flex',
//               gap: 2,
//               overflowX: selectedModel ? 'visible' : 'auto',
//               overflowY: 'hidden',
//               height: '100%',
//               px: 1,
//               py: 2,
//               alignItems: 'center',
//               scrollbarWidth: 'none',
//               justifyContent: selectedModel ? 'center' : 'flex-start',
//               width: '100%',
//               '&::-webkit-scrollbar': {
//                 display: 'none'
//               }
//             }}
//           >
//             {models.map((model) => {
//               const isSelected = selectedModel?._id === model._id
//               const modelImages = model.images && model.images.length > 0 ? model.images : []
//               const currentImageIndex = imageIndices[model._id] || 0
//               const currentImage = modelImages[currentImageIndex]
              
//               if (selectedModel && !isSelected) return null
              
//               return (
//                 <Card
//                   key={model._id}
//                   onClick={() => !selectedModel && handleSelectModel(model)}
//                   sx={{
//                     minWidth: isSelected ? 380 : 300,
//                     maxWidth: isSelected ? 380 : 300,
//                     flexShrink: 0,
//                     cursor: selectedModel ? 'default' : 'pointer',
//                     bgcolor: isSelected ? '#e8f5e9' : '#fff',
//                     border: isSelected ? '3px solid #4a7c59' : '1px solid #e0e0e0',
//                     borderRadius: 2,
//                     position: 'relative',
//                     boxShadow: isSelected ? 4 : 1,
//                     transition: 'all 0.3s ease',
//                     '&:hover': !selectedModel ? {
//                       transform: 'translateY(-4px)',
//                       boxShadow: 3
//                     } : {}
//                   }}
//                 >
//                   {isSelected && (
//                     <CheckCircleIcon 
//                       color="success" 
//                       sx={{ 
//                         position: 'absolute',
//                         top: 12,
//                         right: 12,
//                         bgcolor: '#fff',
//                         borderRadius: '50%',
//                         zIndex: 2,
//                         fontSize: 32
//                       }} 
//                     />
//                   )}

//                   <Box
//                     sx={{
//                       width: '100%',
//                       height: isSelected ? 240 : 180,
//                       bgcolor: 'grey.200',
//                       display: 'flex',
//                       alignItems: 'center',
//                       justifyContent: 'center',
//                       backgroundImage: currentImage ? `url(${currentImage})` : 'none',
//                       backgroundSize: 'cover',
//                       backgroundPosition: 'center',
//                       position: 'relative',
//                       transition: 'height 0.3s ease'
//                     }}
//                   >
//                     {!currentImage && <Home sx={{ fontSize: 60, color: 'grey.400' }} />}
                    
//                     {modelImages.length > 1 && (
//                       <>
//                         <IconButton
//                           size="small"
//                           onClick={(e) => handlePrevImage(e, model._id, modelImages.length)}
//                           sx={{
//                             position: 'absolute',
//                             left: 8,
//                             top: '50%',
//                             transform: 'translateY(-50%)',
//                             bgcolor: 'rgba(255,255,255,0.9)',
//                             width: 36,
//                             height: 36,
//                             '&:hover': { bgcolor: 'rgba(255,255,255,1)' }
//                           }}
//                         >
//                           <ChevronLeft />
//                         </IconButton>
//                         <IconButton
//                           size="small"
//                           onClick={(e) => handleNextImage(e, model._id, modelImages.length)}
//                           sx={{
//                             position: 'absolute',
//                             right: 8,
//                             top: '50%',
//                             transform: 'translateY(-50%)',
//                             bgcolor: 'rgba(255,255,255,0.9)',
//                             width: 36,
//                             height: 36,
//                             '&:hover': { bgcolor: 'rgba(255,255,255,1)' }
//                           }}
//                         >
//                           <ChevronRight />
//                         </IconButton>
//                       </>
//                     )}
                    
//                     {modelImages.length > 1 && (
//                       <Chip
//                         label={`${currentImageIndex + 1}/${modelImages.length}`}
//                         size="small"
//                         sx={{
//                           position: 'absolute',
//                           bottom: 8,
//                           left: 8,
//                           bgcolor: 'rgba(0,0,0,0.7)',
//                           color: 'white',
//                           fontSize: '0.75rem',
//                           height: 24
//                         }}
//                       />
//                     )}
//                   </Box>

//                   <CardContent sx={{ p: 2.5 }}>
//                     <Box display="flex" justifyContent="space-between" alignItems="start" mb={1}>
//                       <Typography variant="h6" fontWeight="bold" sx={{ flex: 1, minWidth: 0 }}>
//                         {model.model}
//                       </Typography>
//                       <Typography variant={isSelected ? "h5" : "h6"} sx={{ color: '#4a7c59', fontWeight: 'bold', ml: 1 }}>
//                         ${(model.price / 1000).toFixed(0)}K
//                       </Typography>
//                     </Box>

//                     <Typography variant="caption" color="text.secondary" display="block" mb={2}>
//                       Model #{model.modelNumber}
//                     </Typography>

//                     <Box display="flex" gap={2.5} flexWrap="wrap" mb={2}>
//                       <Box display="flex" alignItems="center" gap={0.5}>
//                         <Bed fontSize="small" color="action" />
//                         <Typography variant="body2" fontWeight="500">{model.bedrooms}</Typography>
//                       </Box>
//                       <Box display="flex" alignItems="center" gap={0.5}>
//                         <Bathtub fontSize="small" color="action" />
//                         <Typography variant="body2" fontWeight="500">{model.bathrooms}</Typography>
//                       </Box>
//                       <Box display="flex" alignItems="center" gap={0.5}>
//                         <SquareFoot fontSize="small" color="action" />
//                         <Typography variant="body2" fontWeight="500">{model.sqft?.toLocaleString()}</Typography>
//                       </Box>
//                     </Box>

//                     {model.description && (
//                       <Typography 
//                         variant="caption" 
//                         color="text.secondary" 
//                         sx={{ 
//                           display: '-webkit-box',
//                           overflow: 'hidden',
//                           textOverflow: 'ellipsis',
//                           WebkitLineClamp: 2,
//                           WebkitBoxOrient: 'vertical',
//                           lineHeight: 1.5
//                         }}
//                       >
//                         {model.description}
//                       </Typography>
//                     )}
//                   </CardContent>
//                 </Card>
//               )
//             })}
//           </Box>

//           {!selectedModel && models.length > 3 && (
//             <>
//               <IconButton
//                 onClick={() => scrollModels('left')}
//                 sx={{
//                   position: 'absolute',
//                   left: -8,
//                   top: '50%',
//                   transform: 'translateY(-50%)',
//                   bgcolor: '#fff',
//                   boxShadow: 2,
//                   zIndex: 10,
//                   '&:hover': { bgcolor: 'grey.100', boxShadow: 3 }
//                 }}
//               >
//                 <ChevronLeft />
//               </IconButton>

//               <IconButton
//                 onClick={() => scrollModels('right')}
//                 sx={{
//                   position: 'absolute',
//                   right: -8,
//                   top: '50%',
//                   transform: 'translateY(-50%)',
//                   bgcolor: '#fff',
//                   boxShadow: 2,
//                   zIndex: 10,
//                   '&:hover': { bgcolor: 'grey.100', boxShadow: 3 }
//                 }}
//               >
//                 <ChevronRight />
//               </IconButton>
//             </>
//           )}
//         </Box>
//       </Box>

//       {models.length === 0 && (
//         <Box py={4} textAlign="center">
//           <Typography variant="body2" color="text.secondary">
//             No models available
//           </Typography>
//         </Box>
//       )}
//     </Paper>
//   )
// }

// export default ModelSelector

import { useState, useEffect, useRef } from 'react'
import {
  Box,
  Paper,
  Typography,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Alert,
  IconButton,
  Button
} from '@mui/material'
import { 
  Home, 
  Bed, 
  Bathtub, 
  SquareFoot, 
  ChevronLeft, 
  ChevronRight,
  Close,
  InfoOutlined,
  Visibility,
  Tune
} from '@mui/icons-material'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import { useProperty } from '../../context/PropertyContext'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'
import ModelCustomizationModal from './ModelCustomizationModal'

const ModelSelector = () => {
  const { 
    selectedModel, 
    selectModel, 
    selectedLot,
    options,
    setOptions,
    getModelPricingInfo,
    selectedPricingOption
  } = useProperty()
  
  const navigate = useNavigate()
  const [models, setModels] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [imageIndices, setImageIndices] = useState({})
  const [openCustomizationModal, setOpenCustomizationModal] = useState(false)
  const scrollContainerRef = useRef(null)

  useEffect(() => {
    fetchModels()
  }, [])

  const fetchModels = async () => {
    try {
      setLoading(true)
      const response = await api.get('/models')
      const activeModels = response.data.filter(m => m.status === 'active')
      setModels(activeModels)
      
      const indices = {}
      activeModels.forEach(model => {
        indices[model._id] = 0
      })
      setImageIndices(indices)
    } catch (error) {
      console.error('Error fetching models:', error)
      setError('Failed to load models')
    } finally {
      setLoading(false)
    }
  }

  const handleSelectModel = (model) => {
    console.log('Selecting model:', model)
    selectModel(model)
  }

  const handleDeselectModel = () => {
    selectModel(null)
    setOptions({ upgrade: false, balcony: false, storage: false })
  }

  const handleOpenCustomization = () => {
    setOpenCustomizationModal(true)
  }

  const handleConfirmCustomization = ({ model, options: selectedOptions, totalPrice }) => {
    setOptions(selectedOptions)
    setOpenCustomizationModal(false)
    
    console.log('✅ Customization confirmed:', {
      model: model.model,
      options: selectedOptions,
      totalPrice
    })
  }

  const handleViewDetails = (e, modelId) => {
    e.stopPropagation()
    navigate(`/models/${modelId}`)
  }

  const handlePrevImage = (e, modelId, imagesLength) => {
    e.stopPropagation()
    setImageIndices(prev => ({
      ...prev,
      [modelId]: prev[modelId] > 0 ? prev[modelId] - 1 : imagesLength - 1
    }))
  }

  const handleNextImage = (e, modelId, imagesLength) => {
    e.stopPropagation()
    setImageIndices(prev => ({
      ...prev,
      [modelId]: prev[modelId] < imagesLength - 1 ? prev[modelId] + 1 : 0
    }))
  }

  const scrollModels = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = 320
      const currentScroll = scrollContainerRef.current.scrollLeft
      const newScrollLeft = currentScroll + (direction === 'left' ? -scrollAmount : scrollAmount)
      scrollContainerRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      })
    }
  }

  // ✅ FUNCIÓN CORREGIDA para obtener todas las imágenes
  const getAllImages = (model) => {
    const exterior = model.images?.exterior || []
    const interior = model.images?.interior || []
    return [...exterior, ...interior]
  }

  if (!selectedLot) {
    return (
      <Paper 
        elevation={2} 
        sx={{ 
          p: 3, 
          bgcolor: '#fff', 
          borderRadius: 2,
          border: '1px solid #e0e0e0'
        }}
      >
        <Typography variant="subtitle1" color="text.secondary" textAlign="center" sx={{ py: 2 }}>
          SELECT A LOT TO VIEW MODELS
        </Typography>
      </Paper>
    )
  }

  if (loading) {
    return (
      <Paper elevation={2} sx={{ p: 3, bgcolor: '#fff', borderRadius: 2, border: '1px solid #e0e0e0' }}>
        <Box display="flex" justifyContent="center">
          <CircularProgress />
        </Box>
      </Paper>
    )
  }

  if (error) {
    return (
      <Paper elevation={2} sx={{ p: 3, bgcolor: '#fff', borderRadius: 2, border: '1px solid #e0e0e0' }}>
        <Alert severity="error">{error}</Alert>
      </Paper>
    )
  }

  const pricingInfo = selectedModel ? getModelPricingInfo() : null
  // ✅ VERIFICACIÓN CORREGIDA
  const hasPricingOptions = (
    (pricingInfo?.hasBalcony && selectedModel?.balconies?.length > 0) ||
    (pricingInfo?.hasUpgrade && selectedModel?.upgrades?.length > 0) ||
    (pricingInfo?.hasStorage && selectedModel?.storages?.length > 0)
  )

  return (
    <>
      <Paper 
        elevation={2} 
        sx={{ 
          p: 3, 
          bgcolor: '#fff', 
          borderRadius: 2,
          border: '1px solid #e0e0e0'
        }}
      >
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="subtitle1" fontWeight="bold">
            02 MODEL SELECTION
          </Typography>
          <Box display="flex" alignItems="center" gap={2}>
            {selectedModel && (
              <Button
                size="small"
                variant="outlined"
                onClick={handleDeselectModel}
                startIcon={<Close />}
                sx={{ 
                  borderColor: '#e0e0e0',
                  color: '#666',
                  '&:hover': { 
                    borderColor: '#4a7c59',
                    color: '#4a7c59'
                  }
                }}
              >
                Clear Selection
              </Button>
            )}
            <Typography variant="caption" color="success.main" fontWeight="bold">
              {models.length} OPTIONS
            </Typography>
          </Box>
        </Box>

        {/* Main Content Area - Grid Layout con altura fija */}
        <Box sx={{ 
          position: 'relative',
          height: 450,
          overflow: 'hidden'
        }}>
          {/* Info Panel - Posición Absoluta */}
          <Box
            sx={{
              position: 'absolute',
              left: 0,
              top: 0,
              bottom: 0,
              width: '35%',
              maxWidth: 380,
              transform: selectedModel ? 'translateX(0)' : 'translateX(-110%)',
              opacity: selectedModel ? 1 : 0,
              transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
              zIndex: selectedModel ? 10 : 0
            }}
          >
            {selectedModel && (
              <Box sx={{ 
                p: 3, 
                bgcolor: 'grey.50', 
                borderRadius: 2,
                border: '2px solid #e0e0e0',
                height: '100%',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                '&::-webkit-scrollbar': {
                  width: 6
                },
                '&::-webkit-scrollbar-thumb': {
                  bgcolor: 'grey.400',
                  borderRadius: 3
                }
              }}>
                <Typography variant="h6" fontWeight="bold" mb={1}>
                  {selectedModel.model}
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block" mb={3}>
                  Model #{selectedModel.modelNumber}
                </Typography>

                {/* Base Info */}
                <Box mb={3}>
                  <Typography variant="caption" fontWeight="bold" color="text.secondary" display="block" mb={1}>
                    BASE SPECIFICATIONS
                  </Typography>
                  <Box display="flex" flexDirection="column" gap={1}>
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="body2">🛏️ Bedrooms:</Typography>
                      <Typography variant="body2" fontWeight="bold">{selectedModel.bedrooms}</Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="body2">🚿 Bathrooms:</Typography>
                      <Typography variant="body2" fontWeight="bold">{selectedModel.bathrooms}</Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="body2">📐 Square Feet:</Typography>
                      <Typography variant="body2" fontWeight="bold">{selectedModel.sqft?.toLocaleString()}</Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="body2">🏢 Stories:</Typography>
                      <Typography variant="body2" fontWeight="bold">{selectedModel.stories || 1}</Typography>
                    </Box>
                  </Box>
                </Box>

                {/* Base Price */}
                <Box mb={3} p={2} bgcolor="white" borderRadius={1} border="1px solid #e0e0e0">
                  <Typography variant="caption" fontWeight="bold" color="text.secondary">
                    BASE PRICE
                  </Typography>
                  <Typography variant="h4" color="primary.main" fontWeight="bold">
                    ${selectedModel.price.toLocaleString()}
                  </Typography>
                </Box>

                {/* Available Options Info */}
                {hasPricingOptions && (
                  <Box mb={3}>
                    <Typography variant="caption" fontWeight="bold" color="text.secondary" display="block" mb={1}>
                      AVAILABLE OPTIONS
                    </Typography>
                    <Box display="flex" flexDirection="column" gap={1}>
                      {selectedModel.upgrades?.length > 0 && (
                        <Box display="flex" alignItems="center" gap={1}>
                          <Chip label="⭐ Upgrade" size="small" color="secondary" variant="outlined" />
                          <Typography variant="caption" color="text.secondary">
                            +${(selectedModel.upgrades[0].price / 1000).toFixed(0)}K
                          </Typography>
                        </Box>
                      )}
                      {selectedModel.balconies?.length > 0 && (
                        <Box display="flex" alignItems="center" gap={1}>
                          <Chip label="🌳 Balcony" size="small" color="info" variant="outlined" />
                          <Typography variant="caption" color="text.secondary">
                            +${(selectedModel.balconies[0].price / 1000).toFixed(0)}K
                          </Typography>
                        </Box>
                      )}
                      {selectedModel.storages?.length > 0 && (
                        <Box display="flex" alignItems="center" gap={1}>
                          <Chip label="📦 Storage" size="small" color="success" variant="outlined" />
                          <Typography variant="caption" color="text.secondary">
                            +${(selectedModel.storages[0].price / 1000).toFixed(0)}K
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </Box>
                )}

                {/* Current Selection Summary */}
                {selectedPricingOption && (
                  <Box mb={3} p={2} bgcolor="primary.50" borderRadius={1} border="2px solid" borderColor="primary.main">
                    <Typography variant="caption" fontWeight="bold" color="primary.main">
                      CURRENT CONFIGURATION
                    </Typography>
                    <Typography variant="body2" fontWeight="bold" mt={0.5}>
                      {selectedPricingOption.label}
                    </Typography>
                    <Typography variant="h5" color="primary.main" fontWeight="bold" mt={0.5}>
                      ${selectedPricingOption.price.toLocaleString()}
                    </Typography>
                  </Box>
                )}

                {/* Action Buttons */}
                <Box mt="auto" display="flex" flexDirection="column" gap={2}>
                  {hasPricingOptions && (
                    <Button
                      variant="contained"
                      size="large"
                      fullWidth
                      startIcon={<Tune />}
                      onClick={handleOpenCustomization}
                      sx={{
                        py: 1.5,
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        fontWeight: 'bold',
                        boxShadow: 3,
                        '&:hover': {
                          boxShadow: 6,
                          transform: 'translateY(-2px)',
                          transition: 'all 0.3s'
                        }
                      }}
                    >
                      Customize Your Model
                    </Button>
                  )}
                  
                  <Button
                    variant="outlined"
                    size="medium"
                    fullWidth
                    startIcon={<Visibility />}
                    onClick={(e) => handleViewDetails(e, selectedModel._id)}
                    sx={{
                      borderColor: '#4a7c59',
                      color: '#4a7c59',
                      '&:hover': {
                        borderColor: '#3d6849',
                        bgcolor: 'rgba(74, 124, 89, 0.05)'
                      }
                    }}
                  >
                    View Full Details
                  </Button>
                </Box>

                {/* Info message when no options */}
                {!hasPricingOptions && (
                  <Box 
                    sx={{ 
                      mt: 2,
                      p: 2,
                      bgcolor: 'grey.100',
                      borderRadius: 1,
                      textAlign: 'center'
                    }}
                  >
                    <InfoOutlined sx={{ fontSize: 40, color: 'grey.400', mb: 1 }} />
                    <Typography variant="body2" color="text.secondary">
                      This model has no additional customization options
                    </Typography>
                  </Box>
                )}
              </Box>
            )}
          </Box>

          {/* Models Container */}
          <Box
            sx={{
              position: 'absolute',
              right: 0,
              top: 0,
              bottom: 0,
              left: selectedModel ? '38%' : 0,
              transition: 'left 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: selectedModel ? 'center' : 'flex-start'
            }}
          >
            <Box
              ref={scrollContainerRef}
              sx={{
                display: 'flex',
                gap: 2,
                overflowX: selectedModel ? 'visible' : 'auto',
                overflowY: 'hidden',
                height: '100%',
                px: 1,
                py: 2,
                alignItems: 'center',
                scrollbarWidth: 'none',
                justifyContent: selectedModel ? 'center' : 'flex-start',
                width: '100%',
                '&::-webkit-scrollbar': {
                  display: 'none'
                }
              }}
            >
              {models.map((model) => {
                const isSelected = selectedModel?._id === model._id
                const modelImages = getAllImages(model)
                const currentImageIndex = imageIndices[model._id] || 0
                const currentImage = modelImages[currentImageIndex]
                
                if (selectedModel && !isSelected) return null
                
                return (
                  <Card
                    key={model._id}
                    onClick={() => !selectedModel && handleSelectModel(model)}
                    sx={{
                      minWidth: isSelected ? 380 : 300,
                      maxWidth: isSelected ? 380 : 300,
                      flexShrink: 0,
                      cursor: selectedModel ? 'default' : 'pointer',
                      bgcolor: isSelected ? '#e8f5e9' : '#fff',
                      border: isSelected ? '3px solid #4a7c59' : '1px solid #e0e0e0',
                      borderRadius: 2,
                      position: 'relative',
                      boxShadow: isSelected ? 4 : 1,
                      transition: 'all 0.3s ease',
                      '&:hover': !selectedModel ? {
                        transform: 'translateY(-4px)',
                        boxShadow: 3
                      } : {}
                    }}
                  >
                    {isSelected && (
                      <CheckCircleIcon 
                        color="success" 
                        sx={{ 
                          position: 'absolute',
                          top: 12,
                          right: 12,
                          bgcolor: '#fff',
                          borderRadius: '50%',
                          zIndex: 2,
                          fontSize: 32
                        }} 
                      />
                    )}

                    <Box
                      sx={{
                        width: '100%',
                        height: isSelected ? 240 : 180,
                        bgcolor: 'grey.200',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundImage: currentImage ? `url(${currentImage})` : 'none',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        position: 'relative',
                        transition: 'height 0.3s ease'
                      }}
                    >
                      {!currentImage && <Home sx={{ fontSize: 60, color: 'grey.400' }} />}
                      
                      {modelImages.length > 1 && (
                        <>
                          <IconButton
                            size="small"
                            onClick={(e) => handlePrevImage(e, model._id, modelImages.length)}
                            sx={{
                              position: 'absolute',
                              left: 8,
                              top: '50%',
                              transform: 'translateY(-50%)',
                              bgcolor: 'rgba(255,255,255,0.9)',
                              width: 36,
                              height: 36,
                              '&:hover': { bgcolor: 'rgba(255,255,255,1)' }
                            }}
                          >
                            <ChevronLeft />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={(e) => handleNextImage(e, model._id, modelImages.length)}
                            sx={{
                              position: 'absolute',
                              right: 8,
                              top: '50%',
                              transform: 'translateY(-50%)',
                              bgcolor: 'rgba(255,255,255,0.9)',
                              width: 36,
                              height: 36,
                              '&:hover': { bgcolor: 'rgba(255,255,255,1)' }
                            }}
                          >
                            <ChevronRight />
                          </IconButton>
                        </>
                      )}
                      
                      {modelImages.length > 1 && (
                        <Chip
                          label={`${currentImageIndex + 1}/${modelImages.length}`}
                          size="small"
                          sx={{
                            position: 'absolute',
                            bottom: 8,
                            left: 8,
                            bgcolor: 'rgba(0,0,0,0.7)',
                            color: 'white',
                            fontSize: '0.75rem',
                            height: 24
                          }}
                        />
                      )}
                    </Box>

                    <CardContent sx={{ p: 2.5 }}>
                      <Box display="flex" justifyContent="space-between" alignItems="start" mb={1}>
                        <Typography variant="h6" fontWeight="bold" sx={{ flex: 1, minWidth: 0 }}>
                          {model.model}
                        </Typography>
                        <Typography variant={isSelected ? "h5" : "h6"} sx={{ color: '#4a7c59', fontWeight: 'bold', ml: 1 }}>
                          ${(model.price / 1000).toFixed(0)}K
                        </Typography>
                      </Box>

                      <Typography variant="caption" color="text.secondary" display="block" mb={2}>
                        Model #{model.modelNumber}
                      </Typography>

                      <Box display="flex" gap={2.5} flexWrap="wrap" mb={2}>
                        <Box display="flex" alignItems="center" gap={0.5}>
                          <Bed fontSize="small" color="action" />
                          <Typography variant="body2" fontWeight="500">{model.bedrooms}</Typography>
                        </Box>
                        <Box display="flex" alignItems="center" gap={0.5}>
                          <Bathtub fontSize="small" color="action" />
                          <Typography variant="body2" fontWeight="500">{model.bathrooms}</Typography>
                        </Box>
                        <Box display="flex" alignItems="center" gap={0.5}>
                          <SquareFoot fontSize="small" color="action" />
                          <Typography variant="body2" fontWeight="500">{model.sqft?.toLocaleString()}</Typography>
                        </Box>
                      </Box>

                      {model.description && (
                        <Typography 
                          variant="caption" 
                          color="text.secondary" 
                          sx={{ 
                            display: '-webkit-box',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            lineHeight: 1.5
                          }}
                        >
                          {model.description}
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </Box>

            {!selectedModel && models.length > 3 && (
              <>
                <IconButton
                  onClick={() => scrollModels('left')}
                  sx={{
                    position: 'absolute',
                    left: -8,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    bgcolor: '#fff',
                    boxShadow: 2,
                    zIndex: 10,
                    '&:hover': { bgcolor: 'grey.100', boxShadow: 3 }
                  }}
                >
                  <ChevronLeft />
                </IconButton>

                <IconButton
                  onClick={() => scrollModels('right')}
                  sx={{
                    position: 'absolute',
                    right: -8,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    bgcolor: '#fff',
                    boxShadow: 2,
                    zIndex: 10,
                    '&:hover': { bgcolor: 'grey.100', boxShadow: 3 }
                  }}
                >
                  <ChevronRight />
                </IconButton>
              </>
            )}
          </Box>
        </Box>

        {models.length === 0 && (
          <Box py={4} textAlign="center">
            <Typography variant="body2" color="text.secondary">
              No models available
            </Typography>
          </Box>
        )}
      </Paper>

      {/* Customization Modal */}
      <ModelCustomizationModal
        open={openCustomizationModal}
        model={selectedModel}
        initialOptions={options}
        onClose={() => setOpenCustomizationModal(false)}
        onConfirm={handleConfirmCustomization}
      />
    </>
  )
}

export default ModelSelector