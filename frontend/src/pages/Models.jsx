// import { useState, useEffect } from 'react'
// import { useNavigate } from 'react-router-dom'
// import {
//   Box,
//   Typography,
//   Paper,
//   Grid,
//   Card,
//   CardContent,
//   Button,
//   IconButton,
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
//   TextField,
//   MenuItem,
//   Chip,
//   Alert,
//   FormControlLabel,
//   Checkbox,
//   Divider,
//   Accordion,
//   AccordionSummary,
//   AccordionDetails
// } from '@mui/material'
// import { 
//   Add, 
//   Edit, 
//   Delete, 
//   Home, 
//   Image as ImageIcon, 
//   Close,
//   ChevronLeft,
//   ChevronRight,
//   CloudUpload,
//   ExpandMore,
//   Visibility
// } from '@mui/icons-material'
// import api from '../services/api'

// const Models = () => {
//   const navigate = useNavigate()
//   const [models, setModels] = useState([])
//   const [facades, setFacades] = useState([])
//   const [loading, setLoading] = useState(true)
//   const [openDialog, setOpenDialog] = useState(false)
//   const [openFacadeDialog, setOpenFacadeDialog] = useState(false)
//   const [openPricingDialog, setOpenPricingDialog] = useState(false)
//   const [selectedModel, setSelectedModel] = useState(null)
//   const [selectedFacade, setSelectedFacade] = useState(null)
//   const [selectedModelForFacades, setSelectedModelForFacades] = useState(null)
//   const [pricingOptions, setPricingOptions] = useState(null)
  
//   const [modelImageIndices, setModelImageIndices] = useState({})
//   const [facadeImageIndices, setFacadeImageIndices] = useState({})
  
//   const [formData, setFormData] = useState({
//     model: '',
//     modelNumber: '',
//     price: 0,
//     bedrooms: 0,
//     bathrooms: 0,
//     sqft: 0,
//     description: '',
//     status: 'active',
//     images: [],
//     // Pricing options
//     hasBalcony: false,
//     balconyPrice: 0,
//     hasUpgrade: false,
//     upgradePrice: 0,
//     hasStorage: false,
//     storagePrice: 0
//   })

//   const [currentImageUrl, setCurrentImageUrl] = useState('')

//   const [facadeFormData, setFacadeFormData] = useState({
//     model: '',
//     title: '',
//     url: [],
//     price: 0
//   })

//   const [currentFacadeUrl, setCurrentFacadeUrl] = useState('')

//   useEffect(() => {
//     const initData = async () => {
//       await fetchModels()
//       await fetchFacades()
//     }
//     initData()
//   }, [])

//   const fetchModels = async () => {
//     try {
//       const response = await api.get('/models')
//       setModels(response.data)
      
//       const indices = {}
//       response.data.forEach(model => {
//         indices[model._id] = 0
//       })
//       setModelImageIndices(indices)
//     } catch (error) {
//       console.error('Error fetching models:', error)
//     } finally {
//       setLoading(false)
//     }
//   }

//   const fetchFacades = async () => {
//     try {
//       const response = await api.get('/facades')
      
//       const validFacades = response.data.filter(facade => {
//         if (!facade.model) {
//           console.warn('⚠️ Facade without model found:', facade._id)
//           return false
//         }
//         return true
//       })
      
//       setFacades(validFacades)
      
//       const indices = {}
//       validFacades.forEach(facade => {
//         indices[facade._id] = 0
//       })
//       setFacadeImageIndices(indices)
//     } catch (error) {
//       console.error('Error fetching facades:', error)
//     }
//   }

//   const handlePrevModelImage = (e, modelId, imagesLength) => {
//     e.stopPropagation()
//     setModelImageIndices(prev => ({
//       ...prev,
//       [modelId]: prev[modelId] > 0 ? prev[modelId] - 1 : imagesLength - 1
//     }))
//   }

//   const handleNextModelImage = (e, modelId, imagesLength) => {
//     e.stopPropagation()
//     setModelImageIndices(prev => ({
//       ...prev,
//       [modelId]: prev[modelId] < imagesLength - 1 ? prev[modelId] + 1 : 0
//     }))
//   }

//   const handlePrevFacadeImage = (e, facadeId, imagesLength) => {
//     e.stopPropagation()
//     setFacadeImageIndices(prev => ({
//       ...prev,
//       [facadeId]: prev[facadeId] > 0 ? prev[facadeId] - 1 : imagesLength - 1
//     }))
//   }

//   const handleNextFacadeImage = (e, facadeId, imagesLength) => {
//     e.stopPropagation()
//     setFacadeImageIndices(prev => ({
//       ...prev,
//       [facadeId]: prev[facadeId] < imagesLength - 1 ? prev[facadeId] + 1 : 0
//     }))
//   }

//   const handleOpenDialog = (model = null) => {
//     if (model) {
//       setSelectedModel(model)
//       setFormData({
//         model: model.model,
//         modelNumber: model.modelNumber || '',
//         price: model.price,
//         bedrooms: model.bedrooms,
//         bathrooms: model.bathrooms,
//         sqft: model.sqft,
//         description: model.description || '',
//         status: model.status,
//         images: Array.isArray(model.images) ? model.images : [],
//         hasBalcony: (model.balconyPrice || 0) > 0,
//         balconyPrice: model.balconyPrice || 0,
//         hasUpgrade: (model.upgradePrice || 0) > 0,
//         upgradePrice: model.upgradePrice || 0,
//         hasStorage: (model.storagePrice || 0) > 0,
//         storagePrice: model.storagePrice || 0
//       })
//     } else {
//       setSelectedModel(null)
//       setFormData({
//         model: '',
//         modelNumber: '',
//         price: 0,
//         bedrooms: 0,
//         bathrooms: 0,
//         sqft: 0,
//         description: '',
//         status: 'active',
//         images: [],
//         hasBalcony: false,
//         balconyPrice: 0,
//         hasUpgrade: false,
//         upgradePrice: 0,
//         hasStorage: false,
//         storagePrice: 0
//       })
//     }
//     setCurrentImageUrl('')
//     setOpenDialog(true)
//   }

//   const handleCloseDialog = () => {
//     setOpenDialog(false)
//     setSelectedModel(null)
//     setCurrentImageUrl('')
//   }

//   const handleAddImage = () => {
//     if (currentImageUrl.trim()) {
//       setFormData({
//         ...formData,
//         images: [...formData.images, currentImageUrl.trim()]
//       })
//       setCurrentImageUrl('')
//     }
//   }

//   const handleRemoveImage = (index) => {
//     setFormData({
//       ...formData,
//       images: formData.images.filter((_, i) => i !== index)
//     })
//   }

//   const handleSubmit = async () => {
//     try {
//       const dataToSend = {
//         model: formData.model,
//         modelNumber: formData.modelNumber,
//         price: formData.price,
//         bedrooms: formData.bedrooms,
//         bathrooms: formData.bathrooms,
//         sqft: formData.sqft,
//         description: formData.description,
//         status: formData.status,
//         images: formData.images,
//         balconyPrice: formData.hasBalcony ? formData.balconyPrice : 0,
//         upgradePrice: formData.hasUpgrade ? formData.upgradePrice : 0,
//         storagePrice: formData.hasStorage ? formData.storagePrice : 0
//       }

//       if (selectedModel) {
//         await api.put(`/models/${selectedModel._id}`, dataToSend)
//       } else {
//         await api.post('/models', dataToSend)
//       }
//       handleCloseDialog()
//       fetchModels()
//     } catch (error) {
//       console.error('Error saving model:', error)
//       alert(error.response?.data?.message || 'Error saving model')
//     }
//   }

//   const handleDelete = async (id) => {
//     if (window.confirm('Are you sure you want to delete this model?')) {
//       try {
//         await api.delete(`/models/${id}`)
//         fetchModels()
//       } catch (error) {
//         console.error('Error deleting model:', error)
//         alert(error.response?.data?.message || 'Error deleting model')
//       }
//     }
//   }

//   const handleViewPricing = async (model) => {
//     try {
//       const response = await api.get(`/models/${model._id}/pricing-options`)
//       setPricingOptions(response.data)
//       setOpenPricingDialog(true)
//     } catch (error) {
//       console.error('Error fetching pricing options:', error)
//       alert('Error loading pricing options')
//     }
//   }

//   const handleOpenFacadeDialog = async (model, facade = null) => {
//     setSelectedModelForFacades(model)
    
//     if (facade) {
//       setSelectedFacade(facade)
//       const urls = Array.isArray(facade.url) ? facade.url : (facade.url ? [facade.url] : [])
//       setFacadeFormData({
//         model: facade.model._id || facade.model,
//         title: facade.title,
//         url: urls,
//         price: facade.price
//       })
//     } else {
//       setSelectedFacade(null)
//       setFacadeFormData({
//         model: model._id,
//         title: '',
//         url: [],
//         price: 0
//       })
//     }
//     setCurrentFacadeUrl('')
//     setOpenFacadeDialog(true)
//   }

//   const handleCloseFacadeDialog = () => {
//     setOpenFacadeDialog(false)
//     setSelectedFacade(null)
//     setSelectedModelForFacades(null)
//     setCurrentFacadeUrl('')
//   }

//   const handleAddFacadeUrl = () => {
//     if (currentFacadeUrl.trim()) {
//       setFacadeFormData({
//         ...facadeFormData,
//         url: [...facadeFormData.url, currentFacadeUrl.trim()]
//       })
//       setCurrentFacadeUrl('')
//     }
//   }

//   const handleRemoveFacadeUrl = (index) => {
//     setFacadeFormData({
//       ...facadeFormData,
//       url: facadeFormData.url.filter((_, i) => i !== index)
//     })
//   }

//   const handleSubmitFacade = async () => {
//     if (!facadeFormData.title.trim()) {
//       alert('Please enter a facade title')
//       return
//     }
    
//     if (facadeFormData.url.length === 0) {
//       alert('Please add at least one image URL')
//       return
//     }
    
//     if (facadeFormData.price < 0) {
//       alert('Price cannot be negative')
//       return
//     }

//     try {
//       if (selectedFacade) {
//         await api.put(`/facades/${selectedFacade._id}`, facadeFormData)
//       } else {
//         await api.post('/facades', facadeFormData)
//       }
      
//       handleCloseFacadeDialog()
//       fetchFacades()
//     } catch (error) {
//       console.error('Error saving facade:', error)
//       alert(error.response?.data?.message || 'Error saving facade')
//     }
//   }

//   const handleDeleteFacade = async (id) => {
//     if (window.confirm('Are you sure you want to delete this facade?')) {
//       try {
//         await api.delete(`/facades/${id}`)
//         fetchFacades()
//       } catch (error) {
//         console.error('Error deleting facade:', error)
//         alert(error.response?.data?.message || 'Error deleting facade')
//       }
//     }
//   }

//   const getStatusColor = (status) => {
//     switch (status) {
//       case 'active': return 'success'
//       case 'draft': return 'warning'
//       case 'inactive': return 'default'
//       default: return 'default'
//     }
//   }

//   const getModelFacades = (modelId) => {
//     return facades.filter(f => {
//       if (!f || !f.model) return false
//       if (typeof f.model === 'object' && f.model !== null) {
//         return f.model._id === modelId
//       }
//       return f.model === modelId
//     })
//   }

//   const getFacadeImages = (facade) => {
//     if (Array.isArray(facade.url)) {
//       return facade.url
//     }
//     return facade.url ? [facade.url] : []
//   }

//   const hasPricingOptions = (model) => {
//     return (model.balconyPrice > 0 || model.upgradePrice > 0 || model.storagePrice > 0)
//   }

//   const calculatePricingCombinations = () => {
//     const { hasBalcony, hasStorage, hasUpgrade } = formData
//     let count = 1
    
//     if (hasBalcony) count *= 2
//     if (hasStorage) count *= 2
//     if (hasUpgrade) count *= 2
    
//     return count
//   }

//   const calculateMaxPrice = () => {
//     const { price, hasBalcony, balconyPrice, hasUpgrade, upgradePrice, hasStorage, storagePrice } = formData
//     return price + 
//       (hasBalcony ? balconyPrice : 0) + 
//       (hasUpgrade ? upgradePrice : 0) + 
//       (hasStorage ? storagePrice : 0)
//   }

//   return (
//     <Box>
//       <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
//         <Box>
//           <Typography variant="h4" fontWeight="bold">
//             Property Models & Facades
//           </Typography>
//           <Typography variant="body2" color="text.secondary">
//             Manage floorplans, facades, pricing, and availability
//           </Typography>
//         </Box>
//         <Button
//           variant="contained"
//           startIcon={<Add />}
//           onClick={() => handleOpenDialog()}
//         >
//           Add New Model
//         </Button>
//       </Box>

//       <Grid container spacing={3}>
//         {models.map((model) => {
//           const modelFacades = getModelFacades(model._id)
//           const modelImages = model.images && model.images.length > 0 ? model.images : []
//           const currentModelImageIndex = modelImageIndices[model._id] || 0
//           const currentModelImage = modelImages[currentModelImageIndex]
          
//           return (
//             <Grid item xs={12} key={model._id}>
//               <Card className="hover:shadow-lg transition-shadow">
//                 <CardContent>
//                   <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
//                     <Box display="flex" gap={2} alignItems="start">
//                       <Box
//                         sx={{
//                           width: 80,
//                           height: 80,
//                           bgcolor: 'grey.200',
//                           borderRadius: 2,
//                           display: 'flex',
//                           alignItems: 'center',
//                           justifyContent: 'center',
//                           backgroundImage: currentModelImage ? `url(${currentModelImage})` : 'none',
//                           backgroundSize: 'cover',
//                           backgroundPosition: 'center',
//                           position: 'relative',
//                           '&:hover .image-controls': {
//                             opacity: 1
//                           }
//                         }}
//                       >
//                         {!currentModelImage && <Home sx={{ fontSize: 40, color: 'grey.400' }} />}
                        
//                         {modelImages.length > 1 && (
//                           <Box
//                             className="image-controls"
//                             sx={{
//                               opacity: 0,
//                               transition: 'opacity 0.2s',
//                               position: 'absolute',
//                               inset: 0,
//                               display: 'flex',
//                               alignItems: 'center',
//                               justifyContent: 'space-between',
//                               px: 0.5
//                             }}
//                           >
//                             <IconButton
//                               size="small"
//                               onClick={(e) => handlePrevModelImage(e, model._id, modelImages.length)}
//                               sx={{
//                                 bgcolor: 'rgba(255,255,255,0.9)',
//                                 width: 24,
//                                 height: 24,
//                                 '&:hover': { bgcolor: 'rgba(255,255,255,1)' }
//                               }}
//                             >
//                               <ChevronLeft fontSize="small" />
//                             </IconButton>
//                             <IconButton
//                               size="small"
//                               onClick={(e) => handleNextModelImage(e, model._id, modelImages.length)}
//                               sx={{
//                                 bgcolor: 'rgba(255,255,255,0.9)',
//                                 width: 24,
//                                 height: 24,
//                                 '&:hover': { bgcolor: 'rgba(255,255,255,1)' }
//                               }}
//                             >
//                               <ChevronRight fontSize="small" />
//                             </IconButton>
//                           </Box>
//                         )}
                        
//                         {modelImages.length > 1 && (
//                           <Chip
//                             label={`${currentModelImageIndex + 1}/${modelImages.length}`}
//                             size="small"
//                             sx={{
//                               position: 'absolute',
//                               bottom: 4,
//                               right: 4,
//                               height: 16,
//                               bgcolor: 'rgba(0,0,0,0.7)',
//                               color: 'white',
//                               fontSize: '0.6rem',
//                               '& .MuiChip-label': { px: 0.5 }
//                             }}
//                           />
//                         )}
//                       </Box>
                      
//                       <Box>
//                         <Typography variant="h5" fontWeight="bold">
//                           {model.model}
//                         </Typography>
//                         <Typography variant="body2" color="text.secondary" mb={1}>
//                           Model #{model.modelNumber}
//                         </Typography>
//                         <Box display="flex" gap={2} mb={1}>
//                           <Typography variant="body2">
//                             <strong>{model.bedrooms}</strong> beds
//                           </Typography>
//                           <Typography variant="body2">
//                             <strong>{model.bathrooms}</strong> baths
//                           </Typography>
//                           <Typography variant="body2">
//                             <strong>{model.sqft?.toLocaleString()}</strong> sqft
//                           </Typography>
//                         </Box>
//                         <Typography variant="h6" color="primary" fontWeight="bold">
//                           Base: ${model.price?.toLocaleString()}
//                         </Typography>
                        
//                         {/* Pricing Options Badges */}
//                         {hasPricingOptions(model) && (
//                           <Box display="flex" gap={0.5} mt={1} flexWrap="wrap">
//                             {model.balconyPrice > 0 && (
//                               <Chip 
//                                 label={`Balcony: +$${model.balconyPrice.toLocaleString()}`}
//                                 size="small"
//                                 color="info"
//                                 variant="outlined"
//                               />
//                             )}
//                             {model.upgradePrice > 0 && (
//                               <Chip 
//                                 label={`Upgrade: +$${model.upgradePrice.toLocaleString()}`}
//                                 size="small"
//                                 color="secondary"
//                                 variant="outlined"
//                               />
//                             )}
//                             {model.storagePrice > 0 && (
//                               <Chip 
//                                 label={`Storage: +$${model.storagePrice.toLocaleString()}`}
//                                 size="small"
//                                 color="success"
//                                 variant="outlined"
//                               />
//                             )}
//                           </Box>
//                         )}
//                       </Box>
//                     </Box>
//                     <Box display="flex" gap={1} alignItems="center" flexWrap="wrap">
//                       <Chip
//                         label={model.status}
//                         color={getStatusColor(model.status)}
//                         size="small"
//                       />
//                       {hasPricingOptions(model) && (
//                         <Button
//                           size="small"
//                           variant="outlined"
//                           startIcon={<Visibility />}
//                           onClick={() => handleViewPricing(model)}
//                         >
//                           Pricing
//                         </Button>
//                       )}
//                       <IconButton size="small" onClick={() => handleOpenDialog(model)}>
//                         <Edit fontSize="small" />
//                       </IconButton>
//                       <IconButton size="small" onClick={() => handleDelete(model._id)}>
//                         <Delete fontSize="small" />
//                       </IconButton>
//                     </Box>
//                   </Box>

//                   {model.description && (
//                     <Typography variant="body2" color="text.secondary" mb={2}>
//                       {model.description}
//                     </Typography>
//                   )}

//                   <Box sx={{ borderTop: '1px solid #eee', pt: 2 }}>
//                     <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
//                       <Typography variant="subtitle1" fontWeight="bold">
//                         Facades ({modelFacades.length})
//                       </Typography>
//                       <Button
//                         size="small"
//                         variant="outlined"
//                         startIcon={<Add />}
//                         onClick={() => handleOpenFacadeDialog(model)}
//                       >
//                         Add Facade
//                       </Button>
//                     </Box>

//                     {modelFacades.length > 0 ? (
//                       <Box sx={{ position: 'relative', mx: -1 }}>
//                         {modelFacades.length > 3 && (
//                           <IconButton
//                             onClick={(e) => {
//                               e.stopPropagation()
//                               const container = document.getElementById(`facades-${model._id}`)
//                               if (container) {
//                                 container.scrollBy({ left: -320, behavior: 'smooth' })
//                               }
//                             }}
//                             sx={{
//                               position: 'absolute',
//                               left: -8,
//                               top: '50%',
//                               transform: 'translateY(-50%)',
//                               zIndex: 2,
//                               bgcolor: 'white',
//                               boxShadow: 1,
//                               '&:hover': { bgcolor: 'grey.100' }
//                             }}
//                           >
//                             <ChevronLeft />
//                           </IconButton>
//                         )}
                    
//                         <Box
//                           id={`facades-${model._id}`}
//                           sx={{
//                             display: 'flex',
//                             gap: 2,
//                             overflowX: 'auto',
//                             px: 1,
//                             pb: 2,
//                             scrollbarWidth: 'none',
//                             '&::-webkit-scrollbar': {
//                               display: 'none'
//                             }
//                           }}
//                         >
//                           {modelFacades.map((facade) => {
//                             const facadeImages = getFacadeImages(facade)
//                             const currentFacadeImageIndex = facadeImageIndices[facade._id] || 0
//                             const currentFacadeImage = facadeImages[currentFacadeImageIndex]
                            
//                             return (
//                               <Card
//                                 key={facade._id}
//                                 variant="outlined"
//                                 sx={{
//                                   minWidth: 280,
//                                   maxWidth: 280,
//                                   flexShrink: 0
//                                 }}
//                               >
//                                 <Box
//                                   sx={{
//                                     width: '100%',
//                                     height: 180,
//                                     bgcolor: 'grey.200',
//                                     display: 'flex',
//                                     alignItems: 'center',
//                                     justifyContent: 'center',
//                                     backgroundImage: currentFacadeImage ? `url(${currentFacadeImage})` : 'none',
//                                     backgroundSize: 'cover',
//                                     backgroundPosition: 'center',
//                                     position: 'relative'
//                                   }}
//                                 >
//                                   {!currentFacadeImage && <ImageIcon sx={{ fontSize: 40, color: 'grey.400' }} />}
                                  
//                                   {facadeImages.length > 1 && (
//                                     <>
//                                       <IconButton
//                                         size="small"
//                                         onClick={(e) => handlePrevFacadeImage(e, facade._id, facadeImages.length)}
//                                         sx={{
//                                           position: 'absolute',
//                                           left: 8,
//                                           top: '50%',
//                                           transform: 'translateY(-50%)',
//                                           bgcolor: 'rgba(255,255,255,0.9)',
//                                           width: 32,
//                                           height: 32,
//                                           '&:hover': { bgcolor: 'rgba(255,255,255,1)' }
//                                         }}
//                                       >
//                                         <ChevronLeft fontSize="small" />
//                                       </IconButton>
//                                       <IconButton
//                                         size="small"
//                                         onClick={(e) => handleNextFacadeImage(e, facade._id, facadeImages.length)}
//                                         sx={{
//                                           position: 'absolute',
//                                           right: 8,
//                                           top: '50%',
//                                           transform: 'translateY(-50%)',
//                                           bgcolor: 'rgba(255,255,255,0.9)',
//                                           width: 32,
//                                           height: 32,
//                                           '&:hover': { bgcolor: 'rgba(255,255,255,1)' }
//                                         }}
//                                       >
//                                         <ChevronRight fontSize="small" />
//                                       </IconButton>
//                                     </>
//                                   )}
                                  
//                                   {facadeImages.length > 1 && (
//                                     <Chip
//                                       label={`${currentFacadeImageIndex + 1}/${facadeImages.length}`}
//                                       size="small"
//                                       sx={{
//                                         position: 'absolute',
//                                         bottom: 8,
//                                         left: 8,
//                                         bgcolor: 'rgba(0,0,0,0.7)',
//                                         color: 'white'
//                                       }}
//                                     />
//                                   )}
                                  
//                                   <Box
//                                     sx={{
//                                       position: 'absolute',
//                                       top: 4,
//                                       right: 4,
//                                       display: 'flex',
//                                       gap: 0.5
//                                     }}
//                                   >
//                                     <IconButton
//                                       size="small"
//                                       sx={{ bgcolor: 'rgba(255,255,255,0.9)' }}
//                                       onClick={(e) => {
//                                         e.stopPropagation()
//                                         handleOpenFacadeDialog(model, facade)
//                                       }}
//                                     >
//                                       <Edit fontSize="small" />
//                                     </IconButton>
//                                     <IconButton
//                                       size="small"
//                                       sx={{ bgcolor: 'rgba(255,255,255,0.9)' }}
//                                       onClick={(e) => {
//                                         e.stopPropagation()
//                                         handleDeleteFacade(facade._id)
//                                       }}
//                                     >
//                                       <Delete fontSize="small" />
//                                     </IconButton>
//                                   </Box>
//                                 </Box>
//                                 <CardContent>
//                                   <Typography variant="subtitle2" fontWeight="bold">
//                                     {facade.title}
//                                   </Typography>
//                                   <Typography variant="body2" color="primary" fontWeight="600">
//                                     +${facade.price?.toLocaleString()}
//                                   </Typography>
//                                 </CardContent>
//                               </Card>
//                             )
//                           })}
//                         </Box>
                    
//                         {modelFacades.length > 3 && (
//                           <IconButton
//                             onClick={(e) => {
//                               e.stopPropagation()
//                               const container = document.getElementById(`facades-${model._id}`)
//                               if (container) {
//                                 container.scrollBy({ left: 320, behavior: 'smooth' })
//                               }
//                             }}
//                             sx={{
//                               position: 'absolute',
//                               right: -8,
//                               top: '50%',
//                               transform: 'translateY(-50%)',
//                               zIndex: 2,
//                               bgcolor: 'white',
//                               boxShadow: 1,
//                               '&:hover': { bgcolor: 'grey.100' }
//                             }}
//                           >
//                             <ChevronRight />
//                           </IconButton>
//                         )}
//                       </Box>
//                     ) : (
//                       <Paper sx={{ p: 3, textAlign: 'center', bgcolor: 'grey.50' }}>
//                         <ImageIcon sx={{ fontSize: 40, color: 'grey.400', mb: 1 }} />
//                         <Typography variant="body2" color="text.secondary">
//                           No facades added yet
//                         </Typography>
//                       </Paper>
//                     )}
//                   </Box>
//                 </CardContent>
//               </Card>
//             </Grid>
//           )
//         })}
//       </Grid>

//       {/* Model Dialog - CON PRICING OPTIONS */}
//       <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="lg" fullWidth>
//         <DialogTitle>
//           {selectedModel ? 'Edit Model' : 'Add New Model'}
//         </DialogTitle>
//         <DialogContent sx={{ height: '70vh', display: 'flex', p: 3 }}>
//           <Box display="flex" gap={3} flex={1}>
//             {/* Left Side - Form Fields */}
//             <Box 
//               flex={1}
//               sx={{
//                 overflowY: 'auto',
//                 pr: 2,
//                 '&::-webkit-scrollbar': {
//                   width: '6px'
//                 },
//                 '&::-webkit-scrollbar-thumb': {
//                   backgroundColor: 'rgba(0,0,0,0.2)',
//                   borderRadius: '3px'
//                 }
//               }}
//             >
//               <Grid container spacing={2}>
//                 <Grid item xs={12} sm={6}>
//                   <TextField
//                     fullWidth
//                     label="Model Name"
//                     value={formData.model}
//                     onChange={(e) => setFormData({ ...formData, model: e.target.value })}
//                     required
//                   />
//                 </Grid>
//                 <Grid item xs={12} sm={6}>
//                   <TextField
//                     fullWidth
//                     label="Model Number"
//                     value={formData.modelNumber}
//                     onChange={(e) => setFormData({ ...formData, modelNumber: e.target.value })}
//                   />
//                 </Grid>
//                 <Grid item xs={12} sm={6}>
//                   <TextField
//                     fullWidth
//                     type="number"
//                     label="Base Price"
//                     value={formData.price}
//                     onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
//                     required
//                   />
//                 </Grid>
//                 <Grid item xs={12} sm={6}>
//                   <TextField
//                     fullWidth
//                     select
//                     label="Status"
//                     value={formData.status}
//                     onChange={(e) => setFormData({ ...formData, status: e.target.value })}
//                   >
//                     <MenuItem value="active">Active</MenuItem>
//                     <MenuItem value="draft">Draft</MenuItem>
//                     <MenuItem value="inactive">Inactive</MenuItem>
//                   </TextField>
//                 </Grid>
//                 <Grid item xs={12} sm={4}>
//                   <TextField
//                     fullWidth
//                     type="number"
//                     label="Bedrooms"
//                     value={formData.bedrooms}
//                     onChange={(e) => setFormData({ ...formData, bedrooms: Number(e.target.value) })}
//                     required
//                   />
//                 </Grid>
//                 <Grid item xs={12} sm={4}>
//                   <TextField
//                     fullWidth
//                     type="number"
//                     label="Bathrooms"
//                     value={formData.bathrooms}
//                     onChange={(e) => setFormData({ ...formData, bathrooms: Number(e.target.value) })}
//                     required
//                   />
//                 </Grid>
//                 <Grid item xs={12} sm={4}>
//                   <TextField
//                     fullWidth
//                     type="number"
//                     label="Square Feet"
//                     value={formData.sqft}
//                     onChange={(e) => setFormData({ ...formData, sqft: Number(e.target.value) })}
//                     required
//                   />
//                 </Grid>
//                 <Grid item xs={12}>
//                   <TextField
//                     fullWidth
//                     multiline
//                     rows={4}
//                     label="Description"
//                     value={formData.description}
//                     onChange={(e) => setFormData({ ...formData, description: e.target.value })}
//                   />
//                 </Grid>

//                 {/* PRICING OPTIONS SECTION */}
//                 <Grid item xs={12}>
//                   <Divider sx={{ my: 2 }} />
//                   <Typography variant="h6" gutterBottom>
//                     Pricing Options
//                   </Typography>
//                   <Alert severity="info" sx={{ mb: 2 }}>
//                     Enable options to create different pricing combinations for this model
//                   </Alert>
//                 </Grid>

//                 {/* Balcony Option */}
//                 <Grid item xs={12} sm={6}>
//                   <FormControlLabel
//                     control={
//                       <Checkbox
//                         checked={formData.hasBalcony}
//                         onChange={(e) => {
//                           setFormData({
//                             ...formData,
//                             hasBalcony: e.target.checked,
//                             balconyPrice: e.target.checked ? formData.balconyPrice : 0
//                           })
//                         }}
//                       />
//                     }
//                     label="Balcony Available"
//                   />
//                 </Grid>

//                 {formData.hasBalcony && (
//                   <Grid item xs={12} sm={6}>
//                     <TextField
//                       fullWidth
//                       type="number"
//                       label="Balcony Additional Price"
//                       value={formData.balconyPrice}
//                       onChange={(e) => setFormData({ ...formData, balconyPrice: Number(e.target.value) })}
//                       required
//                       InputProps={{
//                         startAdornment: <Typography sx={{ mr: 0.5 }}>$</Typography>
//                       }}
//                       helperText="Extra cost for balcony option"
//                     />
//                   </Grid>
//                 )}

//                 {/* Upgrade Option */}
//                 <Grid item xs={12} sm={6}>
//                   <FormControlLabel
//                     control={
//                       <Checkbox
//                         checked={formData.hasUpgrade}
//                         onChange={(e) => {
//                           setFormData({
//                             ...formData,
//                             hasUpgrade: e.target.checked,
//                             upgradePrice: e.target.checked ? formData.upgradePrice : 0
//                           })
//                         }}
//                       />
//                     }
//                     label="Upgrade Version Available"
//                   />
//                 </Grid>

//                 {formData.hasUpgrade && (
//                   <Grid item xs={12} sm={6}>
//                     <TextField
//                       fullWidth
//                       type="number"
//                       label="Upgrade Additional Price"
//                       value={formData.upgradePrice}
//                       onChange={(e) => setFormData({ ...formData, upgradePrice: Number(e.target.value) })}
//                       required
//                       InputProps={{
//                         startAdornment: <Typography sx={{ mr: 0.5 }}>$</Typography>
//                       }}
//                       helperText="Extra cost for upgraded model"
//                     />
//                   </Grid>
//                 )}

//                 {/* Storage Option */}
//                 <Grid item xs={12} sm={6}>
//                   <FormControlLabel
//                     control={
//                       <Checkbox
//                         checked={formData.hasStorage}
//                         onChange={(e) => {
//                           setFormData({
//                             ...formData,
//                             hasStorage: e.target.checked,
//                             storagePrice: e.target.checked ? formData.storagePrice : 0
//                           })
//                         }}
//                       />
//                     }
//                     label="Storage Available"
//                   />
//                 </Grid>

//                 {formData.hasStorage && (
//                   <Grid item xs={12} sm={6}>
//                     <TextField
//                       fullWidth
//                       type="number"
//                       label="Storage Additional Price"
//                       value={formData.storagePrice}
//                       onChange={(e) => setFormData({ ...formData, storagePrice: Number(e.target.value) })}
//                       required
//                       InputProps={{
//                         startAdornment: <Typography sx={{ mr: 0.5 }}>$</Typography>
//                       }}
//                       helperText="Extra cost for storage"
//                     />
//                   </Grid>
//                 )}

//                 {/* Price Summary */}
//                 {(formData.hasBalcony || formData.hasUpgrade || formData.hasStorage) && (
//                   <Grid item xs={12}>
//                     <Paper sx={{ p: 2, bgcolor: 'success.50', border: '1px solid', borderColor: 'success.200' }}>
//                       <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
//                         Price Range Summary
//                       </Typography>
//                       <Box display="flex" justifyContent="space-between" mb={1}>
//                         <Typography variant="body2">
//                           Minimum Price: <strong>${formData.price.toLocaleString()}</strong>
//                         </Typography>
//                         <Typography variant="body2">
//                           Maximum Price: <strong>${calculateMaxPrice().toLocaleString()}</strong>
//                         </Typography>
//                       </Box>
//                       <Typography variant="caption" color="text.secondary" display="block">
//                         This model will have <strong>{calculatePricingCombinations()}</strong> pricing combinations available
//                       </Typography>
//                     </Paper>
//                   </Grid>
//                 )}

//                 <Grid item xs={12}>
//                   <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
//                     Add Model Images
//                   </Typography>
//                   <Box display="flex" gap={1}>
//                     <TextField
//                       fullWidth
//                       size="small"
//                       label="Image URL"
//                       value={currentImageUrl}
//                       onChange={(e) => setCurrentImageUrl(e.target.value)}
//                       placeholder="https://example.com/model-image.jpg"
//                       onKeyPress={(e) => {
//                         if (e.key === 'Enter') {
//                           e.preventDefault()
//                           handleAddImage()
//                         }
//                       }}
//                     />
//                     <Button
//                       variant="contained"
//                       onClick={handleAddImage}
//                       disabled={!currentImageUrl.trim()}
//                       sx={{ minWidth: '100px' }}
//                     >
//                       Add
//                     </Button>
//                   </Box>
//                 </Grid>
//               </Grid>
//             </Box>

//             {/* Right Side - Images Preview */}
//             <Box 
//               sx={{ 
//                 width: 340,
//                 borderLeft: '1px solid',
//                 borderColor: 'divider',
//                 pl: 3,
//                 display: 'flex',
//                 flexDirection: 'column',
//                 height: '100%'
//               }}
//             >
//               <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
//                 Added Images ({formData.images.length})
//               </Typography>
              
//               {formData.images.length > 0 ? (
//                 <Box
//                   sx={{
//                     display: 'flex',
//                     flexDirection: 'column',
//                     gap: 1,
//                     flex: 1,
//                     overflowY: 'auto',
//                     pr: 1,
//                     '&::-webkit-scrollbar': {
//                       width: '6px'
//                     },
//                     '&::-webkit-scrollbar-thumb': {
//                       backgroundColor: 'rgba(0,0,0,0.2)',
//                       borderRadius: '3px'
//                     }
//                   }}
//                 >
//                   {formData.images.map((url, index) => (
//                     <Box
//                       key={index}
//                       sx={{
//                         position: 'relative',
//                         borderRadius: 1,
//                         overflow: 'hidden',
//                         border: '1px solid',
//                         borderColor: 'grey.200',
//                         bgcolor: 'grey.50',
//                         flexShrink: 0
//                       }}
//                     >
//                       <Box
//                         component="img"
//                         src={url}
//                         alt={`Preview ${index + 1}`}
//                         sx={{
//                           width: '100%',
//                           height: 120,
//                           objectFit: 'cover',
//                           bgcolor: 'grey.200'
//                         }}
//                         onError={(e) => {
//                           e.target.style.display = 'none'
//                         }}
//                       />
//                       <Box
//                         sx={{
//                           position: 'absolute',
//                           top: 4,
//                           right: 4,
//                           display: 'flex',
//                           gap: 0.5
//                         }}
//                       >
//                         {index === 0 && (
//                           <Chip 
//                             label="Primary" 
//                             size="small" 
//                             color="primary"
//                             sx={{ height: 20, fontSize: '0.7rem' }}
//                           />
//                         )}
//                         <IconButton
//                           size="small"
//                           onClick={() => handleRemoveImage(index)}
//                           sx={{
//                             bgcolor: 'rgba(255,255,255,0.9)',
//                             '&:hover': { bgcolor: 'rgba(255,255,255,1)' }
//                           }}
//                         >
//                           <Close fontSize="small" />
//                         </IconButton>
//                       </Box>
//                       <Box sx={{ p: 1 }}>
//                         <Typography variant="caption" color="text.secondary" noWrap>
//                           Image {index + 1}
//                         </Typography>
//                       </Box>
//                     </Box>
//                   ))}
//                 </Box>
//               ) : (
//                 <Paper
//                   sx={{
//                     p: 4,
//                     textAlign: 'center',
//                     bgcolor: 'grey.50',
//                     border: '2px dashed',
//                     borderColor: 'grey.300',
//                     flex: 1,
//                     display: 'flex',
//                     flexDirection: 'column',
//                     alignItems: 'center',
//                     justifyContent: 'center'
//                   }}
//                 >
//                   <ImageIcon sx={{ fontSize: 40, color: 'grey.400', mb: 1 }} />
//                   <Typography variant="caption" color="text.secondary">
//                     No images added yet
//                   </Typography>
//                 </Paper>
//               )}
//             </Box>
//           </Box>
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={handleCloseDialog}>Cancel</Button>
//           <Button onClick={handleSubmit} variant="contained">
//             {selectedModel ? 'Update' : 'Create'}
//           </Button>
//         </DialogActions>
//       </Dialog>

//       {/* Facade Dialog */}
//       <Dialog open={openFacadeDialog} onClose={handleCloseFacadeDialog} maxWidth="lg" fullWidth>
//         <DialogTitle sx={{ pb: 1 }}>
//           <Box display="flex" alignItems="center" gap={1}>
//             <CloudUpload color="primary" />
//             <Typography variant="h6" component="span">
//               {selectedFacade ? 'Edit Facade' : 'Add New Facade'}
//             </Typography>
//           </Box>
//         </DialogTitle>
//         <DialogContent sx={{ height: '70vh', display: 'flex', p: 3 }}>
//           <Box display="flex" gap={3} flex={1}>
//             {/* Left Side - Form Fields */}
//             <Box 
//               flex={1}
//               sx={{
//                 overflowY: 'auto',
//                 pr: 2,
//                 '&::-webkit-scrollbar': {
//                   width: '6px'
//                 },
//                 '&::-webkit-scrollbar-thumb': {
//                   backgroundColor: 'rgba(0,0,0,0.2)',
//                   borderRadius: '3px'
//                 }
//               }}
//             >
//               <Grid container spacing={2}>
//                 {selectedModelForFacades && (
//                   <Grid item xs={12}>
//                     <Paper sx={{ p: 2, bgcolor: 'primary.50', border: '1px solid', borderColor: 'primary.200' }}>
//                       <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
//                         Selected Model
//                       </Typography>
//                       <Typography variant="h6" fontWeight="bold" color="primary">
//                         {selectedModelForFacades.model}
//                       </Typography>
//                       <Typography variant="body2" color="text.secondary">
//                         Base Price: ${selectedModelForFacades.price?.toLocaleString()} • Model #{selectedModelForFacades.modelNumber}
//                       </Typography>
//                     </Paper>
//                   </Grid>
//                 )}

//                 <Grid item xs={12} sm={8}>
//                   <TextField
//                     fullWidth
//                     label="Facade Title *"
//                     value={facadeFormData.title}
//                     onChange={(e) => setFacadeFormData({ ...facadeFormData, title: e.target.value })}
//                     required
//                     placeholder="e.g., Modern Colonial, Craftsman, Mediterranean"
//                     helperText="Give this facade style a descriptive name"
//                   />
//                 </Grid>

//                 <Grid item xs={12} sm={4}>
//                   <TextField
//                     fullWidth
//                     type="number"
//                     label="Additional Price *"
//                     value={facadeFormData.price}
//                     onChange={(e) => setFacadeFormData({ ...facadeFormData, price: Number(e.target.value) })}
//                     required
//                     InputProps={{
//                       startAdornment: <Typography sx={{ mr: 0.5 }}>$</Typography>
//                     }}
//                     helperText="Extra cost"
//                   />
//                 </Grid>

//                 <Grid item xs={12}>
//                   <Box 
//                     sx={{ 
//                       p: 2, 
//                       border: '2px dashed', 
//                       borderColor: facadeFormData.url.length === 0 ? 'error.main' : 'grey.300',
//                       borderRadius: 2,
//                       bgcolor: facadeFormData.url.length === 0 ? 'error.50' : 'grey.50'
//                     }}
//                   >
//                     <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
//                       Facade Images * {facadeFormData.url.length === 0 && (
//                         <Chip label="Required" size="small" color="error" sx={{ ml: 1 }} />
//                       )}
//                     </Typography>
//                     <Typography variant="caption" color="text.secondary" display="block" mb={2}>
//                       Add at least one image URL. You can add multiple views.
//                     </Typography>
                    
//                     <Box display="flex" gap={1}>
//                       <TextField
//                         fullWidth
//                         size="small"
//                         label="Image URL"
//                         value={currentFacadeUrl}
//                         onChange={(e) => setCurrentFacadeUrl(e.target.value)}
//                         placeholder="https://example.com/facade-image.jpg"
//                         onKeyPress={(e) => {
//                           if (e.key === 'Enter') {
//                             e.preventDefault()
//                             handleAddFacadeUrl()
//                           }
//                         }}
//                       />
//                       <Button
//                         variant="contained"
//                         onClick={handleAddFacadeUrl}
//                         disabled={!currentFacadeUrl.trim()}
//                         startIcon={<Add />}
//                         sx={{ minWidth: '120px' }}
//                       >
//                         Add URL
//                       </Button>
//                     </Box>
//                   </Box>
//                 </Grid>

//                 {facadeFormData.url.length === 0 && (
//                   <Grid item xs={12}>
//                     <Alert severity="warning" icon={<CloudUpload />}>
//                       Please add at least one image URL before saving this facade
//                     </Alert>
//                   </Grid>
//                 )}
//               </Grid>
//             </Box>

//             {/* Right Side - Images Preview */}
//             <Box 
//               sx={{ 
//                 width: 340,
//                 borderLeft: '1px solid',
//                 borderColor: 'divider',
//                 pl: 3,
//                 display: 'flex',
//                 flexDirection: 'column',
//                 height: '100%'
//               }}
//             >
//               <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
//                 <Typography variant="subtitle2" fontWeight="bold">
//                   Added Images
//                 </Typography>
//                 <Chip 
//                   label={facadeFormData.url.length} 
//                   size="small" 
//                   color={facadeFormData.url.length > 0 ? 'success' : 'default'}
//                 />
//               </Box>
              
//               {facadeFormData.url.length > 0 ? (
//                 <Box
//                   sx={{
//                     display: 'flex',
//                     flexDirection: 'column',
//                     gap: 1,
//                     flex: 1,
//                     overflowY: 'auto',
//                     pr: 1,
//                     '&::-webkit-scrollbar': {
//                       width: '6px'
//                     },
//                     '&::-webkit-scrollbar-thumb': {
//                       backgroundColor: 'rgba(0,0,0,0.2)',
//                       borderRadius: '3px'
//                     }
//                   }}
//                 >
//                   {facadeFormData.url.map((url, index) => (
//                     <Box
//                       key={index}
//                       sx={{
//                         position: 'relative',
//                         borderRadius: 1,
//                         overflow: 'hidden',
//                         border: '1px solid',
//                         borderColor: 'grey.200',
//                         bgcolor: 'white',
//                         flexShrink: 0
//                       }}
//                     >
//                       <Box
//                         component="img"
//                         src={url}
//                         alt={`Preview ${index + 1}`}
//                         sx={{
//                           width: '100%',
//                           height: 120,
//                           objectFit: 'cover',
//                           bgcolor: 'grey.200'
//                         }}
//                         onError={(e) => {
//                           e.target.style.display = 'none'
//                         }}
//                       />
//                       <Box
//                         sx={{
//                           position: 'absolute',
//                           top: 4,
//                           right: 4,
//                           display: 'flex',
//                           gap: 0.5
//                         }}
//                       >
//                         {index === 0 && (
//                           <Chip 
//                             label="Primary" 
//                             size="small" 
//                             color="primary"
//                             sx={{ height: 20, fontSize: '0.7rem' }}
//                           />
//                         )}
//                         <IconButton
//                           onClick={() => handleRemoveFacadeUrl(index)}
//                           size="small"
//                           sx={{
//                             bgcolor: 'rgba(255,255,255,0.9)',
//                             '&:hover': { bgcolor: 'rgba(255,255,255,1)' }
//                           }}
//                         >
//                           <Delete fontSize="small" />
//                         </IconButton>
//                       </Box>
//                       <Box sx={{ p: 1 }}>
//                         <Typography variant="caption" color="text.secondary" noWrap>
//                           Image {index + 1}
//                         </Typography>
//                       </Box>
//                     </Box>
//                   ))}
//                 </Box>
//               ) : (
//                 <Paper
//                   sx={{
//                     p: 4,
//                     textAlign: 'center',
//                     bgcolor: 'grey.50',
//                     border: '2px dashed',
//                     borderColor: 'grey.300',
//                     flex: 1,
//                     display: 'flex',
//                     flexDirection: 'column',
//                     alignItems: 'center',
//                     justifyContent: 'center'
//                   }}
//                 >
//                   <CloudUpload sx={{ fontSize: 40, color: 'grey.400', mb: 1 }} />
//                   <Typography variant="caption" color="text.secondary">
//                     No images added yet
//                   </Typography>
//                 </Paper>
//               )}
//             </Box>
//           </Box>
//         </DialogContent>
//         <DialogActions sx={{ px: 3, pb: 3 }}>
//           <Button onClick={handleCloseFacadeDialog} variant="outlined">
//             Cancel
//           </Button>
//           <Button 
//             onClick={handleSubmitFacade} 
//             variant="contained"
//             disabled={!facadeFormData.title.trim() || !facadeFormData.model || facadeFormData.url.length === 0}
//             startIcon={selectedFacade ? <Edit /> : <Add />}
//           >
//             {selectedFacade ? 'Update Facade' : 'Create Facade'}
//           </Button>
//         </DialogActions>
//       </Dialog>

//       {/* Pricing Options Dialog */}
//       <Dialog 
//         open={openPricingDialog} 
//         onClose={() => setOpenPricingDialog(false)} 
//         maxWidth="md" 
//         fullWidth
//       >
//         <DialogTitle>
//           <Box display="flex" alignItems="center" gap={1}>
//             <Visibility color="primary" />
//             <Typography variant="h6" component="span">
//               Pricing Options - {pricingOptions?.modelName}
//             </Typography>
//           </Box>
//         </DialogTitle>
//         <DialogContent>
//           {pricingOptions && (
//             <Box>
//               <Paper sx={{ p: 2, mb: 3, bgcolor: 'primary.50', border: '1px solid', borderColor: 'primary.200' }}>
//                 <Typography variant="h6" gutterBottom fontWeight="bold">
//                   Base Price: ${pricingOptions.basePrice?.toLocaleString()}
//                 </Typography>
//                 <Box display="flex" gap={1} mt={2} flexWrap="wrap">
//                   {pricingOptions.priceComponents.balconyPrice > 0 && (
//                     <Chip 
//                       label={`Balcony: +$${pricingOptions.priceComponents.balconyPrice.toLocaleString()}`}
//                       color="info"
//                       size="small"
//                     />
//                   )}
//                   {pricingOptions.priceComponents.upgradePrice > 0 && (
//                     <Chip 
//                       label={`Upgrade: +$${pricingOptions.priceComponents.upgradePrice.toLocaleString()}`}
//                       color="secondary"
//                       size="small"
//                     />
//                   )}
//                   {pricingOptions.priceComponents.storagePrice > 0 && (
//                     <Chip 
//                       label={`Storage: +$${pricingOptions.priceComponents.storagePrice.toLocaleString()}`}
//                       color="success"
//                       size="small"
//                     />
//                   )}
//                 </Box>
//                 <Box display="flex" justifyContent="space-between" mt={2}>
//                   <Typography variant="body2" fontWeight="600">
//                     Min: ${pricingOptions.minPrice?.toLocaleString()}
//                   </Typography>
//                   <Typography variant="body2" fontWeight="600">
//                     Max: ${pricingOptions.maxPrice?.toLocaleString()}
//                   </Typography>
//                 </Box>
//               </Paper>

//               {/* Basic Options */}
//               <Accordion defaultExpanded>
//                 <AccordionSummary expandIcon={<ExpandMore />}>
//                   <Typography variant="h6">
//                     Basic Model Options ({pricingOptions.pricingByType.basic.length})
//                   </Typography>
//                 </AccordionSummary>
//                 <AccordionDetails>
//                   <Grid container spacing={2}>
//                     {pricingOptions.pricingByType.basic.map((option, index) => (
//                       <Grid item xs={12} sm={6} key={index}>
//                         <Card variant="outlined">
//                           <CardContent>
//                             <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
//                               {option.label}
//                             </Typography>
//                             <Typography variant="h6" color="primary" fontWeight="bold">
//                               ${option.price.toLocaleString()}
//                             </Typography>
//                             <Box display="flex" gap={0.5} mt={1} flexWrap="wrap">
//                               {option.hasBalcony && <Chip label="Balcony" size="small" color="info" />}
//                               {option.hasStorage && <Chip label="Storage" size="small" color="success" />}
//                               {!option.hasBalcony && !option.hasStorage && (
//                                 <Chip label="Base Configuration" size="small" variant="outlined" />
//                               )}
//                             </Box>
//                           </CardContent>
//                         </Card>
//                       </Grid>
//                     ))}
//                   </Grid>
//                 </AccordionDetails>
//               </Accordion>

//               {/* Upgrade Options */}
//               {pricingOptions.pricingByType.upgrade.length > 0 && (
//                 <Accordion defaultExpanded sx={{ mt: 2 }}>
//                   <AccordionSummary expandIcon={<ExpandMore />}>
//                     <Typography variant="h6">
//                       Upgrade Model Options ({pricingOptions.pricingByType.upgrade.length})
//                     </Typography>
//                   </AccordionSummary>
//                   <AccordionDetails>
//                     <Grid container spacing={2}>
//                       {pricingOptions.pricingByType.upgrade.map((option, index) => (
//                         <Grid item xs={12} sm={6} key={index}>
//                           <Card variant="outlined" sx={{ bgcolor: 'secondary.50' }}>
//                             <CardContent>
//                               <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
//                                 {option.label}
//                               </Typography>
//                               <Typography variant="h6" color="secondary" fontWeight="bold">
//                                 ${option.price.toLocaleString()}
//                               </Typography>
//                               <Box display="flex" gap={0.5} mt={1} flexWrap="wrap">
//                                 <Chip label="Upgrade" size="small" color="secondary" />
//                                 {option.hasBalcony && <Chip label="Balcony" size="small" color="info" />}
//                                 {option.hasStorage && <Chip label="Storage" size="small" color="success" />}
//                               </Box>
//                             </CardContent>
//                           </Card>
//                         </Grid>
//                       ))}
//                     </Grid>
//                   </AccordionDetails>
//                 </Accordion>
//               )}
//             </Box>
//           )}
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={() => setOpenPricingDialog(false)}>Close</Button>
//         </DialogActions>
//       </Dialog>
//     </Box>
//   )
// }

// export default Models

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Chip,
  Alert,
  FormControlLabel,
  Checkbox,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Stack,
  Tooltip,
  Badge,
  Tabs,
  Tab
} from '@mui/material'
import { 
  Add, 
  Edit, 
  Delete, 
  Home, 
  Image as ImageIcon, 
  Close,
  ChevronLeft,
  ChevronRight,
  CloudUpload,
  ExpandMore,
  Visibility,
  Balcony,
  Upgrade as UpgradeIcon,
  Storage as StorageIcon,
  PhotoLibrary,
  KeyboardArrowLeft,
  KeyboardArrowRight
} from '@mui/icons-material'
import api from '../services/api'
import { motion, AnimatePresence } from 'framer-motion'

const Models = () => {
  const navigate = useNavigate()
  const [models, setModels] = useState([])
  const [facades, setFacades] = useState([])
  const [loading, setLoading] = useState(true)
  const [openDialog, setOpenDialog] = useState(false)
  const [openFacadeDialog, setOpenFacadeDialog] = useState(false)
  const [openPricingDialog, setOpenPricingDialog] = useState(false)
  const [openGalleryDialog, setOpenGalleryDialog] = useState(false) // ✅ NUEVO
  const [selectedModel, setSelectedModel] = useState(null)
  const [selectedFacade, setSelectedFacade] = useState(null)
  const [selectedModelForFacades, setSelectedModelForFacades] = useState(null)
  const [selectedModelForGallery, setSelectedModelForGallery] = useState(null) // ✅ NUEVO
  const [pricingOptions, setPricingOptions] = useState(null)
  
  const [modelImageIndices, setModelImageIndices] = useState({})
  const [facadeImageIndices, setFacadeImageIndices] = useState({})
  
  // ✅ Estados para el modal de galería
  const [galleryTab, setGalleryTab] = useState(0)
  const [galleryImageIndex, setGalleryImageIndex] = useState(0)
  
  // Estados para acordeones
  const [expandedAccordions, setExpandedAccordions] = useState({
    base: true,
    balcony: false,
    upgrade: false,
    storage: false
  })
  
  const [formData, setFormData] = useState({
    model: '',
    modelNumber: '',
    price: 0,
    bedrooms: 0,
    bathrooms: 0,
    sqft: 0,
    stories: 1,
    description: '',
    status: 'active',
    images: {
      exterior: [],
      interior: []
    },
    hasBalcony: false,
    balconyPrice: 0,
    balconyImages: {
      exterior: [],
      interior: []
    },
    hasUpgrade: false,
    upgradePrice: 0,
    upgradeImages: {
      exterior: [],
      interior: []
    },
    hasStorage: false,
    storagePrice: 0,
    storageImages: {
      exterior: [],
      interior: []
    }
  })

  const [currentImageUrl, setCurrentImageUrl] = useState('')
  const [currentImageType, setCurrentImageType] = useState('exterior')
  const [currentImageSection, setCurrentImageSection] = useState('base')

  const [currentFacadeUrl, setCurrentFacadeUrl] = useState('')

  const [facadeFormData, setFacadeFormData] = useState({
    model: '',
    title: '',
    url: [],
    price: 0
  })

  useEffect(() => {
    const initData = async () => {
      await fetchModels()
      await fetchFacades()
    }
    initData()
  }, [])

  const fetchModels = async () => {
    try {
      const response = await api.get('/models')
      setModels(response.data)
      
      const indices = {}
      response.data.forEach(model => {
        indices[model._id] = 0
      })
      setModelImageIndices(indices)
    } catch (error) {
      console.error('Error fetching models:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchFacades = async () => {
    try {
      const response = await api.get('/facades')
      
      const validFacades = response.data.filter(facade => {
        if (!facade.model) {
          console.warn('⚠️ Facade without model found:', facade._id)
          return false
        }
        return true
      })
      
      setFacades(validFacades)
      
      const indices = {}
      validFacades.forEach(facade => {
        indices[facade._id] = 0
      })
      setFacadeImageIndices(indices)
    } catch (error) {
      console.error('Error fetching facades:', error)
    }
  }

  const handlePrevModelImage = (e, modelId, imagesLength) => {
    e.stopPropagation()
    setModelImageIndices(prev => ({
      ...prev,
      [modelId]: prev[modelId] > 0 ? prev[modelId] - 1 : imagesLength - 1
    }))
  }

  const handleNextModelImage = (e, modelId, imagesLength) => {
    e.stopPropagation()
    setModelImageIndices(prev => ({
      ...prev,
      [modelId]: prev[modelId] < imagesLength - 1 ? prev[modelId] + 1 : 0
    }))
  }

  const handlePrevFacadeImage = (e, facadeId, imagesLength) => {
    e.stopPropagation()
    setFacadeImageIndices(prev => ({
      ...prev,
      [facadeId]: prev[facadeId] > 0 ? prev[facadeId] - 1 : imagesLength - 1
    }))
  }

  const handleNextFacadeImage = (e, facadeId, imagesLength) => {
    e.stopPropagation()
    setFacadeImageIndices(prev => ({
      ...prev,
      [facadeId]: prev[facadeId] < imagesLength - 1 ? prev[facadeId] + 1 : 0
    }))
  }

  // ==================== GALLERY MODAL ====================
  const handleOpenGallery = (model) => {
    setSelectedModelForGallery(model)
    setGalleryTab(0)
    setGalleryImageIndex(0)
    setOpenGalleryDialog(true)
  }

  const handleCloseGallery = () => {
    setOpenGalleryDialog(false)
    setSelectedModelForGallery(null)
    setGalleryTab(0)
    setGalleryImageIndex(0)
  }

  const getGalleryCategories = (model) => {
    if (!model) return []

    const categories = []
    const hasBalcony = model.balconies && model.balconies.length > 0
    const hasUpgrade = model.upgrades && model.upgrades.length > 0
    const hasStorage = model.storages && model.storages.length > 0

    // ✅ BASE SIN BALCÓN (Exterior + Interior)
    categories.push({
      label: 'Base Model (Sin Balcón)',
      key: 'base',
      exteriorImages: model.images?.exterior || [],
      interiorImages: model.images?.interior || []
    })

    // ✅ BASE CON BALCÓN (Exterior del balcón + Interior base)
    if (hasBalcony) {
      categories.push({
        label: `Base + ${model.balconies[0].name}`,
        key: 'base-balcony',
        exteriorImages: model.balconies[0].images?.exterior || [],
        interiorImages: model.images?.interior || [] // Interior base
      })
    }

    // ✅ UPGRADE SIN BALCÓN (Exterior base + Interior upgrade)
    if (hasUpgrade) {
      categories.push({
        label: `${model.upgrades[0].name} (Sin Balcón)`,
        key: 'upgrade',
        exteriorImages: model.images?.exterior || [], // Exterior base
        interiorImages: model.upgrades[0].images?.interior || []
      })
    }

    // ✅ UPGRADE CON BALCÓN (Exterior balcón + Interior upgrade)
    if (hasUpgrade && hasBalcony) {
      categories.push({
        label: `${model.upgrades[0].name} + ${model.balconies[0].name}`,
        key: 'upgrade-balcony',
        exteriorImages: model.balconies[0].images?.exterior || [],
        interiorImages: model.upgrades[0].images?.interior || []
      })
    }

    return categories
  }

  const getCurrentGalleryImages = () => {
    if (!selectedModelForGallery) return []
    
    const categories = getGalleryCategories(selectedModelForGallery)
    if (categories.length === 0 || galleryTab >= categories.length) return []
    
    const category = categories[galleryTab]
    return [...category.exteriorImages, ...category.interiorImages]
  }

  const handlePrevGalleryImage = () => {
    const images = getCurrentGalleryImages()
    setGalleryImageIndex(prev => prev > 0 ? prev - 1 : images.length - 1)
  }

  const handleNextGalleryImage = () => {
    const images = getCurrentGalleryImages()
    setGalleryImageIndex(prev => prev < images.length - 1 ? prev + 1 : 0)
  }

  const getCurrentImageLabel = () => {
    if (!selectedModelForGallery) return ''
    
    const categories = getGalleryCategories(selectedModelForGallery)
    if (categories.length === 0 || galleryTab >= categories.length) return ''
    
    const category = categories[galleryTab]
    const exteriorCount = category.exteriorImages.length
    
    if (galleryImageIndex < exteriorCount) {
      return `Exterior ${galleryImageIndex + 1} de ${exteriorCount}`
    } else {
      return `Interior ${galleryImageIndex - exteriorCount + 1} de ${category.interiorImages.length}`
    }
  }

  // ...existing handleOpenDialog code...
  const handleOpenDialog = (model = null) => {
    if (model) {
      setSelectedModel(model)
      
      console.log('🔍 Loading model:', model)
      
      const hasBalconyOption = model.balconies && model.balconies.length > 0
      const hasUpgradeOption = model.upgrades && model.upgrades.length > 0
      const hasStorageOption = model.storages && model.storages.length > 0
      
      const normalizeImages = (images) => {
        if (!images) return { exterior: [], interior: [] }
        
        if (images.exterior && images.interior) {
          return {
            exterior: Array.isArray(images.exterior) ? images.exterior : [],
            interior: Array.isArray(images.interior) ? images.interior : []
          }
        }
        
        if (Array.isArray(images)) {
          return { exterior: images, interior: [] }
        }
        
        return { exterior: [], interior: [] }
      }
      
      console.log('✅ Parsed options:', {
        hasBalcony: hasBalconyOption,
        hasUpgrade: hasUpgradeOption,
        hasStorage: hasStorageOption,
        balconyData: model.balconies?.[0],
        upgradeData: model.upgrades?.[0],
        storageData: model.storages?.[0]
      })
      
      setFormData({
        model: model.model,
        modelNumber: model.modelNumber || '',
        price: model.price,
        bedrooms: model.bedrooms,
        bathrooms: model.bathrooms,
        sqft: model.sqft,
        stories: model.stories || 1,
        description: model.description || '',
        status: model.status,
        
        images: normalizeImages(model.images),
        
        hasBalcony: hasBalconyOption,
        balconyPrice: hasBalconyOption ? model.balconies[0].price : 0,
        balconyImages: hasBalconyOption ? normalizeImages(model.balconies[0].images) : { exterior: [], interior: [] },
        
        hasUpgrade: hasUpgradeOption,
        upgradePrice: hasUpgradeOption ? model.upgrades[0].price : 0,
        upgradeImages: hasUpgradeOption ? normalizeImages(model.upgrades[0].images) : { exterior: [], interior: [] },
        
        hasStorage: hasStorageOption,
        storagePrice: hasStorageOption ? model.storages[0].price : 0,
        storageImages: hasStorageOption ? normalizeImages(model.storages[0].images) : { exterior: [], interior: [] }
      })
      
      setExpandedAccordions({
        base: true,
        balcony: hasBalconyOption,
        upgrade: hasUpgradeOption,
        storage: hasStorageOption
      })
      
    } else {
      setSelectedModel(null)
      setFormData({
        model: '',
        modelNumber: '',
        price: 0,
        bedrooms: 0,
        bathrooms: 0,
        sqft: 0,
        stories: 1,
        description: '',
        status: 'active',
        images: { exterior: [], interior: [] },
        hasBalcony: false,
        balconyPrice: 0,
        balconyImages: { exterior: [], interior: [] },
        hasUpgrade: false,
        upgradePrice: 0,
        upgradeImages: { exterior: [], interior: [] },
        hasStorage: false,
        storagePrice: 0,
        storageImages: { exterior: [], interior: [] }
      })
      
      setExpandedAccordions({
        base: true,
        balcony: false,
        upgrade: false,
        storage: false
      })
    }
    
    setCurrentImageUrl('')
    setCurrentImageType('exterior')
    setCurrentImageSection('base')
    setOpenDialog(true)
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
    setSelectedModel(null)
    setCurrentImageUrl('')
  }

  const handleAddImage = () => {
    if (!currentImageUrl.trim()) return

    const section = currentImageSection
    const type = currentImageType

    if (section === 'base') {
      setFormData(prev => ({
        ...prev,
        images: {
          ...prev.images,
          [type]: [...prev.images[type], currentImageUrl.trim()]
        }
      }))
    } else if (section === 'balcony') {
      setFormData(prev => ({
        ...prev,
        balconyImages: {
          ...prev.balconyImages,
          [type]: [...prev.balconyImages[type], currentImageUrl.trim()]
        }
      }))
    } else if (section === 'upgrade') {
      setFormData(prev => ({
        ...prev,
        upgradeImages: {
          ...prev.upgradeImages,
          [type]: [...prev.upgradeImages[type], currentImageUrl.trim()]
        }
      }))
    } else if (section === 'storage') {
      setFormData(prev => ({
        ...prev,
        storageImages: {
          ...prev.storageImages,
          [type]: [...prev.storageImages[type], currentImageUrl.trim()]
        }
      }))
    }

    setCurrentImageUrl('')
  }

  const handleRemoveImage = (section, type, index) => {
    if (section === 'base') {
      setFormData(prev => ({
        ...prev,
        images: {
          ...prev.images,
          [type]: prev.images[type].filter((_, i) => i !== index)
        }
      }))
    } else if (section === 'balcony') {
      setFormData(prev => ({
        ...prev,
        balconyImages: {
          ...prev.balconyImages,
          [type]: prev.balconyImages[type].filter((_, i) => i !== index)
        }
      }))
    } else if (section === 'upgrade') {
      setFormData(prev => ({
        ...prev,
        upgradeImages: {
          ...prev.upgradeImages,
          [type]: prev.upgradeImages[type].filter((_, i) => i !== index)
        }
      }))
    } else if (section === 'storage') {
      setFormData(prev => ({
        ...prev,
        storageImages: {
          ...prev.storageImages,
          [type]: prev.storageImages[type].filter((_, i) => i !== index)
        }
      }))
    }
  }

  const handleAccordionChange = (panel) => (event, isExpanded) => {
    setExpandedAccordions(prev => ({
      ...prev,
      [panel]: isExpanded
    }))
  }

  const handleSubmit = async () => {
    try {
      const balconies = []
      if (formData.hasBalcony && formData.balconyPrice > 0) {
        balconies.push({
          name: 'Balcony Option',
          price: formData.balconyPrice,
          description: 'Balcony add-on for this model',
          sqft: 0,
          images: {
            exterior: Array.isArray(formData.balconyImages?.exterior) ? formData.balconyImages.exterior : [],
            interior: Array.isArray(formData.balconyImages?.interior) ? formData.balconyImages.interior : []
          },
          status: 'active'
        })
      }
  
      const upgrades = []
      if (formData.hasUpgrade && formData.upgradePrice > 0) {
        upgrades.push({
          name: 'Upgrade Option',
          price: formData.upgradePrice,
          description: 'Premium upgrade for this model',
          features: [],
          images: {
            exterior: Array.isArray(formData.upgradeImages?.exterior) ? formData.upgradeImages.exterior : [],
            interior: Array.isArray(formData.upgradeImages?.interior) ? formData.upgradeImages.interior : []
          },
          status: 'active'
        })
      }
  
      const storages = []
      if (formData.hasStorage && formData.storagePrice > 0) {
        storages.push({
          name: 'Storage Option',
          price: formData.storagePrice,
          description: 'Additional storage space',
          sqft: 0,
          images: {
            exterior: Array.isArray(formData.storageImages?.exterior) ? formData.storageImages.exterior : [],
            interior: Array.isArray(formData.storageImages?.interior) ? formData.storageImages.interior : []
          },
          status: 'active'
        })
      }
  
      const dataToSend = {
        model: formData.model,
        modelNumber: formData.modelNumber,
        price: formData.price,
        bedrooms: formData.bedrooms,
        bathrooms: formData.bathrooms,
        sqft: formData.sqft,
        stories: formData.stories,
        description: formData.description,
        status: formData.status,
        images: {
          exterior: Array.isArray(formData.images?.exterior) ? formData.images.exterior : [],
          interior: Array.isArray(formData.images?.interior) ? formData.images.interior : []
        },
        balconies,
        upgrades,
        storages
      }
  
      console.log('📤 Sending data to backend:', dataToSend)
  
      if (selectedModel) {
        await api.put(`/models/${selectedModel._id}`, dataToSend)
      } else {
        await api.post('/models', dataToSend)
      }
      handleCloseDialog()
      fetchModels()
    } catch (error) {
      console.error('❌ Error saving model:', error)
      console.error('Error details:', error.response?.data)
      alert(error.response?.data?.message || 'Error saving model')
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this model?')) {
      try {
        await api.delete(`/models/${id}`)
        fetchModels()
      } catch (error) {
        console.error('Error deleting model:', error)
        alert(error.response?.data?.message || 'Error deleting model')
      }
    }
  }

  const handleViewPricing = async (model) => {
    try {
      const response = await api.get(`/models/${model._id}/pricing-options`)
      setPricingOptions(response.data)
      setOpenPricingDialog(true)
    } catch (error) {
      console.error('Error fetching pricing options:', error)
      alert('Error loading pricing options')
    }
  }

  // ...existing facade handlers...
  const handleOpenFacadeDialog = async (model, facade = null) => {
    setSelectedModelForFacades(model)
    
    if (facade) {
      setSelectedFacade(facade)
      const urls = Array.isArray(facade.url) ? facade.url : (facade.url ? [facade.url] : [])
      setFacadeFormData({
        model: facade.model._id || facade.model,
        title: facade.title,
        url: urls,
        price: facade.price
      })
    } else {
      setSelectedFacade(null)
      setFacadeFormData({
        model: model._id,
        title: '',
        url: [],
        price: 0
      })
    }
    setCurrentFacadeUrl('')
    setOpenFacadeDialog(true)
  }

  const handleCloseFacadeDialog = () => {
    setOpenFacadeDialog(false)
    setSelectedFacade(null)
    setSelectedModelForFacades(null)
    setCurrentFacadeUrl('')
  }

  const handleAddFacadeUrl = () => {
    if (currentFacadeUrl.trim()) {
      setFacadeFormData({
        ...facadeFormData,
        url: [...facadeFormData.url, currentFacadeUrl.trim()]
      })
      setCurrentFacadeUrl('')
    }
  }

  const handleRemoveFacadeUrl = (index) => {
    setFacadeFormData({
      ...facadeFormData,
      url: facadeFormData.url.filter((_, i) => i !== index)
    })
  }

  const handleSubmitFacade = async () => {
    if (!facadeFormData.title.trim()) {
      alert('Please enter a facade title')
      return
    }
    
    if (facadeFormData.url.length === 0) {
      alert('Please add at least one image URL')
      return
    }
    
    if (facadeFormData.price < 0) {
      alert('Price cannot be negative')
      return
    }

    try {
      if (selectedFacade) {
        await api.put(`/facades/${selectedFacade._id}`, facadeFormData)
      } else {
        await api.post('/facades', facadeFormData)
      }
      
      handleCloseFacadeDialog()
      fetchFacades()
    } catch (error) {
      console.error('Error saving facade:', error)
      alert(error.response?.data?.message || 'Error saving facade')
    }
  }

  const handleDeleteFacade = async (id) => {
    if (window.confirm('Are you sure you want to delete this facade?')) {
      try {
        await api.delete(`/facades/${id}`)
        fetchFacades()
      } catch (error) {
        console.error('Error deleting facade:', error)
        alert(error.response?.data?.message || 'Error deleting facade')
      }
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'success'
      case 'draft': return 'warning'
      case 'inactive': return 'default'
      default: return 'default'
    }
  }

  const getModelFacades = (modelId) => {
    return facades.filter(f => {
      if (!f || !f.model) return false
      if (typeof f.model === 'object' && f.model !== null) {
        return f.model._id === modelId
      }
      return f.model === modelId
    })
  }

  const getFacadeImages = (facade) => {
    if (Array.isArray(facade.url)) {
      return facade.url
    }
    return facade.url ? [facade.url] : []
  }

  const hasPricingOptions = (model) => {
    return (
      (model.balconies && model.balconies.length > 0) ||
      (model.upgrades && model.upgrades.length > 0) ||
      (model.storages && model.storages.length > 0)
    )
  }

  const calculatePricingCombinations = () => {
    const { hasBalcony, hasStorage, hasUpgrade } = formData
    let count = 1
    
    if (hasBalcony) count *= 2
    if (hasStorage) count *= 2
    if (hasUpgrade) count *= 2
    
    return count
  }

  const calculateMaxPrice = () => {
    const { price, hasBalcony, balconyPrice, hasUpgrade, upgradePrice, hasStorage, storagePrice } = formData
    return price + 
      (hasBalcony ? balconyPrice : 0) + 
      (hasUpgrade ? upgradePrice : 0) + 
      (hasStorage ? storagePrice : 0)
  }

  const getAllModelImages = (model) => {
    return [
      ...(model.images?.exterior || []),
      ...(model.images?.interior || [])
    ]
  }

  const getTotalImagesCount = () => {
    let count = 0
    count += formData.images.exterior.length + formData.images.interior.length
    if (formData.hasBalcony) {
      count += formData.balconyImages.exterior.length + formData.balconyImages.interior.length
    }
    if (formData.hasUpgrade) {
      count += formData.upgradeImages.exterior.length + formData.upgradeImages.interior.length
    }
    if (formData.hasStorage) {
      count += formData.storageImages.exterior.length + formData.storageImages.interior.length
    }
    return count
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" fontWeight="bold">
            Property Models & Facades
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage floorplans, facades, pricing, and availability
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
          sx={{
            bgcolor: '#4a7c59',
            '&:hover': { bgcolor: '#3d6649' }
          }}
        >
          Add New Model
        </Button>
      </Box>

      {/* Models Grid */}
      <Grid container spacing={3}>
        {models.map((model) => {
          const modelFacades = getModelFacades(model._id)
          const allImages = getAllModelImages(model)
          const currentModelImageIndex = modelImageIndices[model._id] || 0
          const currentModelImage = allImages[currentModelImageIndex]
          
          return (
            <Grid item xs={12} key={model._id}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
                      <Box display="flex" gap={2} alignItems="start">
                        <Box
                          sx={{
                            width: 80,
                            height: 80,
                            bgcolor: 'grey.200',
                            borderRadius: 2,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundImage: currentModelImage ? `url(${currentModelImage})` : 'none',
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            position: 'relative',
                            '&:hover .image-controls': {
                              opacity: 1
                            }
                          }}
                        >
                          {!currentModelImage && <Home sx={{ fontSize: 40, color: 'grey.400' }} />}
                          
                          {allImages.length > 1 && (
                            <Box
                              className="image-controls"
                              sx={{
                                opacity: 0,
                                transition: 'opacity 0.2s',
                                position: 'absolute',
                                inset: 0,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                px: 0.5
                              }}
                            >
                              <IconButton
                                size="small"
                                onClick={(e) => handlePrevModelImage(e, model._id, allImages.length)}
                                sx={{
                                  bgcolor: 'rgba(255,255,255,0.9)',
                                  width: 24,
                                  height: 24,
                                  '&:hover': { bgcolor: 'rgba(255,255,255,1)' }
                                }}
                              >
                                <ChevronLeft fontSize="small" />
                              </IconButton>
                              <IconButton
                                size="small"
                                onClick={(e) => handleNextModelImage(e, model._id, allImages.length)}
                                sx={{
                                  bgcolor: 'rgba(255,255,255,0.9)',
                                  width: 24,
                                  height: 24,
                                  '&:hover': { bgcolor: 'rgba(255,255,255,1)' }
                                }}
                              >
                                <ChevronRight fontSize="small" />
                              </IconButton>
                            </Box>
                          )}
                          
                          {allImages.length > 1 && (
                            <Chip
                              label={`${currentModelImageIndex + 1}/${allImages.length}`}
                              size="small"
                              sx={{
                                position: 'absolute',
                                bottom: 4,
                                right: 4,
                                height: 16,
                                bgcolor: 'rgba(0,0,0,0.7)',
                                color: 'white',
                                fontSize: '0.6rem',
                                '& .MuiChip-label': { px: 0.5 }
                              }}
                            />
                          )}
                        </Box>
                        
                        <Box>
                          <Typography variant="h5" fontWeight="bold">
                            {model.model}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" mb={1}>
                            Model #{model.modelNumber}
                          </Typography>
                          <Box display="flex" gap={2} mb={1} flexWrap="wrap">
                            <Typography variant="body2">
                              <strong>{model.bedrooms}</strong> beds
                            </Typography>
                            <Typography variant="body2">
                              <strong>{model.bathrooms}</strong> baths
                            </Typography>
                            <Typography variant="body2">
                              <strong>{model.sqft?.toLocaleString()}</strong> sqft
                            </Typography>
                            {/* ✅ NUEVO: Stories */}
                            <Typography variant="body2">
                              <strong>{model.stories || 1}</strong> {model.stories === 1 ? 'story' : 'stories'}
                            </Typography>
                          </Box>
                          <Typography variant="h6" color="primary" fontWeight="bold">
                            Base: ${model.price?.toLocaleString()}
                          </Typography>
                          
                          {/* Pricing Options Badges */}
                          {hasPricingOptions(model) && (
                            <Box display="flex" gap={0.5} mt={1} flexWrap="wrap">
                              {model.balconies?.length > 0 && (
                                <Chip 
                                  label={`Balcony: +$${model.balconies[0].price.toLocaleString()}`}
                                  size="small"
                                  color="info"
                                  variant="outlined"
                                  icon={<Balcony />}
                                />
                              )}
                              {model.upgrades?.length > 0 && (
                                <Chip 
                                  label={`Upgrade: +$${model.upgrades[0].price.toLocaleString()}`}
                                  size="small"
                                  color="secondary"
                                  variant="outlined"
                                  icon={<UpgradeIcon />}
                                />
                              )}
                              {model.storages?.length > 0 && (
                                <Chip 
                                  label={`Storage: +$${model.storages[0].price.toLocaleString()}`}
                                  size="small"
                                  color="success"
                                  variant="outlined"
                                  icon={<StorageIcon />}
                                />
                              )}
                            </Box>
                          )}
                        </Box>
                      </Box>
                      <Box display="flex" gap={1} alignItems="center" flexWrap="wrap">
                        <Chip
                          label={model.status}
                          color={getStatusColor(model.status)}
                          size="small"
                        />
                        {/* ✅ NUEVO: Botón Gallery */}
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<PhotoLibrary />}
                          onClick={() => handleOpenGallery(model)}
                          color="primary"
                        >
                          Gallery
                        </Button>
                        {hasPricingOptions(model) && (
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<Visibility />}
                            onClick={() => handleViewPricing(model)}
                          >
                            Pricing
                          </Button>
                        )}
                        <IconButton size="small" onClick={() => handleOpenDialog(model)}>
                          <Edit fontSize="small" />
                        </IconButton>
                        <IconButton size="small" onClick={() => handleDelete(model._id)}>
                          <Delete fontSize="small" />
                        </IconButton>
                      </Box>
                    </Box>

                    {model.description && (
                      <Typography variant="body2" color="text.secondary" mb={2}>
                        {model.description}
                      </Typography>
                    )}

                    {/* Facades Section */}
                    <Box sx={{ borderTop: '1px solid #eee', pt: 2 }}>
                      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                        <Typography variant="subtitle1" fontWeight="bold">
                          Facades ({modelFacades.length})
                        </Typography>
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<Add />}
                          onClick={() => handleOpenFacadeDialog(model)}
                        >
                          Add Facade
                        </Button>
                      </Box>

                      {modelFacades.length > 0 ? (
                        <Box sx={{ position: 'relative', mx: -1 }}>
                          {modelFacades.length > 3 && (
                            <IconButton
                              onClick={(e) => {
                                e.stopPropagation()
                                const container = document.getElementById(`facades-${model._id}`)
                                if (container) {
                                  container.scrollBy({ left: -320, behavior: 'smooth' })
                                }
                              }}
                              sx={{
                                position: 'absolute',
                                left: -8,
                                top: '50%',
                                transform: 'translateY(-50%)',
                                zIndex: 2,
                                bgcolor: 'white',
                                boxShadow: 1,
                                '&:hover': { bgcolor: 'grey.100' }
                              }}
                            >
                              <ChevronLeft />
                            </IconButton>
                          )}
                      
                          <Box
                            id={`facades-${model._id}`}
                            sx={{
                              display: 'flex',
                              gap: 2,
                              overflowX: 'auto',
                              px: 1,
                              pb: 2,
                              scrollbarWidth: 'none',
                              '&::-webkit-scrollbar': {
                                display: 'none'
                              }
                            }}
                          >
                            {modelFacades.map((facade) => {
                              const facadeImages = getFacadeImages(facade)
                              const currentFacadeImageIndex = facadeImageIndices[facade._id] || 0
                              const currentFacadeImage = facadeImages[currentFacadeImageIndex]
                              
                              return (
                                <Card
                                  key={facade._id}
                                  variant="outlined"
                                  sx={{
                                    minWidth: 280,
                                    maxWidth: 280,
                                    flexShrink: 0
                                  }}
                                >
                                  <Box
                                    sx={{
                                      width: '100%',
                                      height: 180,
                                      bgcolor: 'grey.200',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      backgroundImage: currentFacadeImage ? `url(${currentFacadeImage})` : 'none',
                                      backgroundSize: 'cover',
                                      backgroundPosition: 'center',
                                      position: 'relative'
                                    }}
                                  >
                                    {!currentFacadeImage && <ImageIcon sx={{ fontSize: 40, color: 'grey.400' }} />}
                                    
                                    {facadeImages.length > 1 && (
                                      <>
                                        <IconButton
                                          size="small"
                                          onClick={(e) => handlePrevFacadeImage(e, facade._id, facadeImages.length)}
                                          sx={{
                                            position: 'absolute',
                                            left: 8,
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            bgcolor: 'rgba(255,255,255,0.9)',
                                            width: 32,
                                            height: 32,
                                            '&:hover': { bgcolor: 'rgba(255,255,255,1)' }
                                          }}
                                        >
                                          <ChevronLeft fontSize="small" />
                                        </IconButton>
                                        <IconButton
                                          size="small"
                                          onClick={(e) => handleNextFacadeImage(e, facade._id, facadeImages.length)}
                                          sx={{
                                            position: 'absolute',
                                            right: 8,
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            bgcolor: 'rgba(255,255,255,0.9)',
                                            width: 32,
                                            height: 32,
                                            '&:hover': { bgcolor: 'rgba(255,255,255,1)' }
                                          }}
                                        >
                                          <ChevronRight fontSize="small" />
                                        </IconButton>
                                      </>
                                    )}
                                    
                                    {facadeImages.length > 1 && (
                                      <Chip
                                        label={`${currentFacadeImageIndex + 1}/${facadeImages.length}`}
                                        size="small"
                                        sx={{
                                          position: 'absolute',
                                          bottom: 8,
                                          left: 8,
                                          bgcolor: 'rgba(0,0,0,0.7)',
                                          color: 'white'
                                        }}
                                      />
                                    )}
                                    
                                    <Box
                                      sx={{
                                        position: 'absolute',
                                        top: 4,
                                        right: 4,
                                        display: 'flex',
                                        gap: 0.5
                                      }}
                                    >
                                      <IconButton
                                        size="small"
                                        sx={{ bgcolor: 'rgba(255,255,255,0.9)' }}
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          handleOpenFacadeDialog(model, facade)
                                        }}
                                      >
                                        <Edit fontSize="small" />
                                      </IconButton>
                                      <IconButton
                                        size="small"
                                        sx={{ bgcolor: 'rgba(255,255,255,0.9)' }}
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          handleDeleteFacade(facade._id)
                                        }}
                                      >
                                        <Delete fontSize="small" />
                                      </IconButton>
                                    </Box>
                                  </Box>
                                  <CardContent>
                                    <Typography variant="subtitle2" fontWeight="bold">
                                      {facade.title}
                                    </Typography>
                                    <Typography variant="body2" color="primary" fontWeight="600">
                                      +${facade.price?.toLocaleString()}
                                    </Typography>
                                  </CardContent>
                                </Card>
                              )
                            })}
                          </Box>
                      
                          {modelFacades.length > 3 && (
                            <IconButton
                              onClick={(e) => {
                                e.stopPropagation()
                                const container = document.getElementById(`facades-${model._id}`)
                                if (container) {
                                  container.scrollBy({ left: 320, behavior: 'smooth' })
                                }
                              }}
                              sx={{
                                position: 'absolute',
                                right: -8,
                                top: '50%',
                                transform: 'translateY(-50%)',
                                zIndex: 2,
                                bgcolor: 'white',
                                boxShadow: 1,
                                '&:hover': { bgcolor: 'grey.100' }
                              }}
                            >
                              <ChevronRight />
                            </IconButton>
                          )}
                        </Box>
                      ) : (
                        <Paper sx={{ p: 3, textAlign: 'center', bgcolor: 'grey.50' }}>
                          <ImageIcon sx={{ fontSize: 40, color: 'grey.400', mb: 1 }} />
                          <Typography variant="body2" color="text.secondary">
                            No facades added yet
                          </Typography>
                        </Paper>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          )
        })}
      </Grid>

      {/* ==================== GALLERY MODAL ==================== */}
      <Dialog 
        open={openGalleryDialog} 
        onClose={handleCloseGallery}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            height: '90vh',
            maxHeight: '90vh'
          }
        }}
      >
        <DialogTitle sx={{ borderBottom: '1px solid #e0e0e0', pb: 2 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box display="flex" alignItems="center" gap={2}>
              <PhotoLibrary color="primary" />
              <Box>
                <Typography variant="h5" fontWeight="bold">
                  {selectedModelForGallery?.model} - Image Gallery
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Browse all images by configuration
                </Typography>
              </Box>
            </Box>
            <IconButton onClick={handleCloseGallery}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ p: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {selectedModelForGallery && (
            <>
              {/* Tabs para categorías */}
              <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper' }}>
                <Tabs 
                  value={galleryTab} 
                  onChange={(e, newValue) => {
                    setGalleryTab(newValue)
                    setGalleryImageIndex(0)
                  }}
                  variant="scrollable"
                  scrollButtons="auto"
                  sx={{ px: 2 }}
                >
                  {getGalleryCategories(selectedModelForGallery).map((category, index) => (
                    <Tab 
                      key={category.key}
                      label={category.label} 
                      sx={{ textTransform: 'none', fontWeight: 600 }}
                    />
                  ))}
                </Tabs>
              </Box>

              {/* Carrusel de imágenes */}
              <Box 
                sx={{ 
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: '#000',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                {getCurrentGalleryImages().length > 0 ? (
                  <>
                    <Box
                      component="img"
                      src={getCurrentGalleryImages()[galleryImageIndex]}
                      alt={getCurrentImageLabel()}
                      sx={{
                        maxWidth: '100%',
                        maxHeight: '100%',
                        objectFit: 'contain'
                      }}
                    />

                    {/* Controles de navegación */}
                    {getCurrentGalleryImages().length > 1 && (
                      <>
                        <IconButton
                          onClick={handlePrevGalleryImage}
                          sx={{
                            position: 'absolute',
                            left: 16,
                            top: '50%',
                            transform: 'translateY(-50%)',
                            bgcolor: 'rgba(255,255,255,0.9)',
                            '&:hover': { bgcolor: 'rgba(255,255,255,1)' }
                          }}
                        >
                          <KeyboardArrowLeft />
                        </IconButton>
                        <IconButton
                          onClick={handleNextGalleryImage}
                          sx={{
                            position: 'absolute',
                            right: 16,
                            top: '50%',
                            transform: 'translateY(-50%)',
                            bgcolor: 'rgba(255,255,255,0.9)',
                            '&:hover': { bgcolor: 'rgba(255,255,255,1)' }
                          }}
                        >
                          <KeyboardArrowRight />
                        </IconButton>
                      </>
                    )}

                    {/* Contador de imágenes */}
                    <Box
                      sx={{
                        position: 'absolute',
                        bottom: 16,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        bgcolor: 'rgba(0,0,0,0.7)',
                        color: 'white',
                        px: 2,
                        py: 1,
                        borderRadius: 2
                      }}
                    >
                      <Typography variant="body2" fontWeight="600">
                        {getCurrentImageLabel()} • {galleryImageIndex + 1} / {getCurrentGalleryImages().length}
                      </Typography>
                    </Box>
                  </>
                ) : (
                  <Box sx={{ textAlign: 'center', color: 'white', p: 4 }}>
                    <PhotoLibrary sx={{ fontSize: 60, mb: 2, opacity: 0.5 }} />
                    <Typography variant="h6">
                      No images available for this configuration
                    </Typography>
                  </Box>
                )}
              </Box>

              {/* Miniaturas */}
              <Box 
                sx={{ 
                  p: 2,
                  borderTop: '1px solid #e0e0e0',
                  bgcolor: 'background.paper',
                  overflowX: 'auto',
                  display: 'flex',
                  gap: 1
                }}
              >
                {getCurrentGalleryImages().map((img, index) => (
                  <Box
                    key={index}
                    onClick={() => setGalleryImageIndex(index)}
                    sx={{
                      width: 80,
                      height: 60,
                      flexShrink: 0,
                      cursor: 'pointer',
                      border: galleryImageIndex === index ? '3px solid #1976d2' : '2px solid #e0e0e0',
                      borderRadius: 1,
                      overflow: 'hidden',
                      opacity: galleryImageIndex === index ? 1 : 0.6,
                      transition: 'all 0.2s',
                      '&:hover': {
                        opacity: 1,
                        borderColor: '#1976d2'
                      }
                    }}
                  >
                    <Box
                      component="img"
                      src={img}
                      alt={`Thumbnail ${index + 1}`}
                      sx={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                    />
                  </Box>
                ))}
              </Box>
            </>
          )}
        </DialogContent>

        <DialogActions sx={{ borderTop: '1px solid #e0e0e0', p: 2 }}>
          <Button onClick={handleCloseGallery} variant="outlined">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* ==================== MODEL DIALOG CON ACORDEONES ==================== */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog} 
        maxWidth="xl" 
        fullWidth
        PaperProps={{
          sx: {
            height: '90vh',
            maxHeight: '90vh'
          }
        }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e0e0e0' }}>
          <Box display="flex" alignItems="center" gap={2}>
            <Home color="primary" />
            <Box>
              <Typography variant="h5" fontWeight="bold">
                {selectedModel ? 'Edit Model' : 'Add New Model'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Total Images: {getTotalImagesCount()}
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={handleCloseDialog}>
            <Close />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 0, overflow: 'hidden' }}>
          <Box display="flex" height="100%">
            {/* LEFT SIDE - Form */}
            <Box 
              sx={{ 
                width: '50%',
                p: 3,
                overflowY: 'auto',
                borderRight: '1px solid #e0e0e0',
                '&::-webkit-scrollbar': {
                  width: '8px'
                },
                '&::-webkit-scrollbar-thumb': {
                  backgroundColor: 'rgba(0,0,0,0.2)',
                  borderRadius: '4px'
                }
              }}
            >
              <Grid container spacing={2.5}>
                {/* Basic Info */}
                <Grid item xs={12}>
                  <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Home /> Basic Information
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Model Name"
                    value={formData.model}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Model Number"
                    value={formData.modelNumber}
                    onChange={(e) => setFormData({ ...formData, modelNumber: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Base Price"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    required
                    InputProps={{
                      startAdornment: <Typography sx={{ mr: 0.5 }}>$</Typography>
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Stories"
                    value={formData.stories}
                    onChange={(e) => setFormData({ ...formData, stories: Number(e.target.value) })}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    select
                    label="Status"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="draft">Draft</MenuItem>
                    <MenuItem value="inactive">Inactive</MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Bedrooms"
                    value={formData.bedrooms}
                    onChange={(e) => setFormData({ ...formData, bedrooms: Number(e.target.value) })}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Bathrooms"
                    value={formData.bathrooms}
                    onChange={(e) => setFormData({ ...formData, bathrooms: Number(e.target.value) })}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Square Feet"
                    value={formData.sqft}
                    onChange={(e) => setFormData({ ...formData, sqft: Number(e.target.value) })}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label="Description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                </Grid>

                {/* Pricing Options */}
                <Grid item xs={12}>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    Pricing Options
                  </Typography>
                  <Alert severity="info" sx={{ mb: 2 }}>
                    Enable options to create different configurations with specific images
                  </Alert>
                </Grid>

                {/* Balcony */}
                <Grid item xs={12} sm={8}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.hasBalcony}
                        onChange={(e) => {
                          setFormData({
                            ...formData,
                            hasBalcony: e.target.checked,
                            balconyPrice: e.target.checked ? formData.balconyPrice : 0
                          })
                          if (e.target.checked) {
                            setExpandedAccordions(prev => ({ ...prev, balcony: true }))
                          }
                        }}
                      />
                    }
                    label={
                      <Box display="flex" alignItems="center" gap={1}>
                        <Balcony />
                        <Typography fontWeight="600">Balcony Available</Typography>
                      </Box>
                    }
                  />
                </Grid>
                {formData.hasBalcony && (
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Additional Price"
                      value={formData.balconyPrice}
                      onChange={(e) => setFormData({ ...formData, balconyPrice: Number(e.target.value) })}
                      required
                      InputProps={{
                        startAdornment: <Typography sx={{ mr: 0.5 }}>$</Typography>
                      }}
                    />
                  </Grid>
                )}

                {/* Upgrade */}
                <Grid item xs={12} sm={8}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.hasUpgrade}
                        onChange={(e) => {
                          setFormData({
                            ...formData,
                            hasUpgrade: e.target.checked,
                            upgradePrice: e.target.checked ? formData.upgradePrice : 0
                          })
                          if (e.target.checked) {
                            setExpandedAccordions(prev => ({ ...prev, upgrade: true }))
                          }
                        }}
                      />
                    }
                    label={
                      <Box display="flex" alignItems="center" gap={1}>
                        <UpgradeIcon />
                        <Typography fontWeight="600">Upgrade Version Available</Typography>
                      </Box>
                    }
                  />
                </Grid>
                {formData.hasUpgrade && (
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Additional Price"
                      value={formData.upgradePrice}
                      onChange={(e) => setFormData({ ...formData, upgradePrice: Number(e.target.value) })}
                      required
                      InputProps={{
                        startAdornment: <Typography sx={{ mr: 0.5 }}>$</Typography>
                      }}
                    />
                  </Grid>
                )}

                {/* Storage */}
                <Grid item xs={12} sm={8}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.hasStorage}
                        onChange={(e) => {
                          setFormData({
                            ...formData,
                            hasStorage: e.target.checked,
                            storagePrice: e.target.checked ? formData.storagePrice : 0
                          })
                          if (e.target.checked) {
                            setExpandedAccordions(prev => ({ ...prev, storage: true }))
                          }
                        }}
                      />
                    }
                    label={
                      <Box display="flex" alignItems="center" gap={1}>
                        <StorageIcon />
                        <Typography fontWeight="600">Storage Available</Typography>
                      </Box>
                    }
                  />
                </Grid>
                {formData.hasStorage && (
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Additional Price"
                      value={formData.storagePrice}
                      onChange={(e) => setFormData({ ...formData, storagePrice: Number(e.target.value) })}
                      required
                      InputProps={{
                        startAdornment: <Typography sx={{ mr: 0.5 }}>$</Typography>
                      }}
                    />
                  </Grid>
                )}

                {/* Price Summary */}
                {(formData.hasBalcony || formData.hasUpgrade || formData.hasStorage) && (
                  <Grid item xs={12}>
                    <Paper sx={{ p: 2, bgcolor: 'success.50', border: '1px solid', borderColor: 'success.200' }}>
                      <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                        Price Range Summary
                      </Typography>
                      <Box display="flex" justifyContent="space-between" mb={1}>
                        <Typography variant="body2">
                          Minimum: <strong>${formData.price.toLocaleString()}</strong>
                        </Typography>
                        <Typography variant="body2">
                          Maximum: <strong>${calculateMaxPrice().toLocaleString()}</strong>
                        </Typography>
                      </Box>
                      <Typography variant="caption" color="text.secondary">
                        <strong>{calculatePricingCombinations()}</strong> pricing combinations
                      </Typography>
                    </Paper>
                  </Grid>
                )}
              </Grid>
            </Box>

            {/* RIGHT SIDE - Images with Accordions */}
            <Box 
              sx={{ 
                width: '50%',
                display: 'flex',
                flexDirection: 'column',
                bgcolor: '#fafafa'
              }}
            >
              {/* Add Image Control */}
              <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0', bgcolor: 'white' }}>
                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                  Add Images
                </Typography>
                <Grid container spacing={1}>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      size="small"
                      select
                      label="Section"
                      value={currentImageSection}
                      onChange={(e) => setCurrentImageSection(e.target.value)}
                    >
                      <MenuItem value="base">Base Model</MenuItem>
                      {formData.hasBalcony && <MenuItem value="balcony">With Balcony</MenuItem>}
                      {formData.hasUpgrade && <MenuItem value="upgrade">With Upgrade</MenuItem>}
                      {formData.hasStorage && <MenuItem value="storage">With Storage</MenuItem>}
                    </TextField>
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <TextField
                      fullWidth
                      size="small"
                      select
                      label="Type"
                      value={currentImageType}
                      onChange={(e) => setCurrentImageType(e.target.value)}
                    >
                      <MenuItem value="exterior">Exterior</MenuItem>
                      <MenuItem value="interior">Interior</MenuItem>
                    </TextField>
                  </Grid>
                  <Grid item xs={12} sm={5}>
                    <Box display="flex" gap={1}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Image URL"
                        value={currentImageUrl}
                        onChange={(e) => setCurrentImageUrl(e.target.value)}
                        placeholder="https://..."
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            handleAddImage()
                          }
                        }}
                      />
                      <Button
                        variant="contained"
                        onClick={handleAddImage}
                        disabled={!currentImageUrl.trim()}
                        size="small"
                        sx={{ minWidth: '60px' }}
                      >
                        <Add />
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              </Box>

              {/* Accordions - Images Preview */}
              <Box 
                sx={{ 
                  flex: 1,
                  overflowY: 'auto',
                  p: 2,
                  '&::-webkit-scrollbar': {
                    width: '8px'
                  },
                  '&::-webkit-scrollbar-thumb': {
                    backgroundColor: 'rgba(0,0,0,0.2)',
                    borderRadius: '4px'
                  }
                }}
              >
                {/* BASE MODEL ACCORDION */}
                <Accordion 
                  expanded={expandedAccordions.base}
                  onChange={handleAccordionChange('base')}
                  sx={{ mb: 1 }}
                >
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Box display="flex" alignItems="center" gap={1} width="100%">
                      <Home color="primary" />
                      <Typography fontWeight="bold">Base Model Images</Typography>
                      <Badge 
                        badgeContent={formData.images.exterior.length + formData.images.interior.length} 
                        color="primary"
                        sx={{ ml: 'auto', mr: 2 }}
                      />
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Stack spacing={2}>
                      {/* Exterior */}
                      <Box>
                        <Typography variant="subtitle2" fontWeight="600" gutterBottom>
                          Exterior ({formData.images.exterior.length})
                        </Typography>
                        {formData.images.exterior.length > 0 ? (
                          <Grid container spacing={1}>
                            {formData.images.exterior.map((url, index) => (
                              <Grid item xs={6} key={index}>
                                <Box sx={{ position: 'relative', pt: '75%', borderRadius: 1, overflow: 'hidden', border: '1px solid #e0e0e0' }}>
                                  <Box
                                    component="img"
                                    src={url}
                                    alt={`Exterior ${index + 1}`}
                                    sx={{
                                      position: 'absolute',
                                      top: 0,
                                      left: 0,
                                      width: '100%',
                                      height: '100%',
                                      objectFit: 'cover'
                                    }}
                                  />
                                  <IconButton
                                    size="small"
                                    onClick={() => handleRemoveImage('base', 'exterior', index)}
                                    sx={{
                                      position: 'absolute',
                                      top: 4,
                                      right: 4,
                                      bgcolor: 'rgba(255,255,255,0.9)',
                                      '&:hover': { bgcolor: 'rgba(255,255,255,1)' }
                                    }}
                                  >
                                    <Close fontSize="small" />
                                  </IconButton>
                                  {index === 0 && (
                                    <Chip 
                                      label="Primary" 
                                      size="small" 
                                      color="primary"
                                      sx={{ 
                                        position: 'absolute',
                                        bottom: 4,
                                        left: 4,
                                        height: 20,
                                        fontSize: '0.7rem'
                                      }}
                                    />
                                  )}
                                </Box>
                              </Grid>
                            ))}
                          </Grid>
                        ) : (
                          <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'grey.100' }}>
                            <Typography variant="caption" color="text.secondary">
                              No exterior images
                            </Typography>
                          </Paper>
                        )}
                      </Box>

                      {/* Interior */}
                      <Box>
                        <Typography variant="subtitle2" fontWeight="600" gutterBottom>
                          Interior ({formData.images.interior.length})
                        </Typography>
                        {formData.images.interior.length > 0 ? (
                          <Grid container spacing={1}>
                            {formData.images.interior.map((url, index) => (
                              <Grid item xs={6} key={index}>
                                <Box sx={{ position: 'relative', pt: '75%', borderRadius: 1, overflow: 'hidden', border: '1px solid #e0e0e0' }}>
                                  <Box
                                    component="img"
                                    src={url}
                                    alt={`Interior ${index + 1}`}
                                    sx={{
                                      position: 'absolute',
                                      top: 0,
                                      left: 0,
                                      width: '100%',
                                      height: '100%',
                                      objectFit: 'cover'
                                    }}
                                  />
                                  <IconButton
                                    size="small"
                                    onClick={() => handleRemoveImage('base', 'interior', index)}
                                    sx={{
                                      position: 'absolute',
                                      top: 4,
                                      right: 4,
                                      bgcolor: 'rgba(255,255,255,0.9)',
                                      '&:hover': { bgcolor: 'rgba(255,255,255,1)' }
                                    }}
                                  >
                                    <Close fontSize="small" />
                                  </IconButton>
                                </Box>
                              </Grid>
                            ))}
                          </Grid>
                        ) : (
                          <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'grey.100' }}>
                            <Typography variant="caption" color="text.secondary">
                              No interior images
                            </Typography>
                          </Paper>
                        )}
                      </Box>
                    </Stack>
                  </AccordionDetails>
                </Accordion>

                {/* BALCONY ACCORDION */}
                {formData.hasBalcony && (
                  <Accordion 
                    expanded={expandedAccordions.balcony}
                    onChange={handleAccordionChange('balcony')}
                    sx={{ mb: 1 }}
                  >
                    <AccordionSummary expandIcon={<ExpandMore />}>
                      <Box display="flex" alignItems="center" gap={1} width="100%">
                        <Balcony color="info" />
                        <Typography fontWeight="bold">With Balcony Images</Typography>
                        <Badge 
                          badgeContent={formData.balconyImages.exterior.length + formData.balconyImages.interior.length} 
                          color="info"
                          sx={{ ml: 'auto', mr: 2 }}
                        />
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Stack spacing={2}>
                        {/* Exterior */}
                        <Box>
                          <Typography variant="subtitle2" fontWeight="600" gutterBottom>
                            Exterior ({formData.balconyImages.exterior.length})
                          </Typography>
                          {formData.balconyImages.exterior.length > 0 ? (
                            <Grid container spacing={1}>
                              {formData.balconyImages.exterior.map((url, index) => (
                                <Grid item xs={6} key={index}>
                                  <Box sx={{ position: 'relative', pt: '75%', borderRadius: 1, overflow: 'hidden', border: '1px solid #e0e0e0' }}>
                                    <Box
                                      component="img"
                                      src={url}
                                      alt={`Balcony Exterior ${index + 1}`}
                                      sx={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'cover'
                                      }}
                                    />
                                    <IconButton
                                      size="small"
                                      onClick={() => handleRemoveImage('balcony', 'exterior', index)}
                                      sx={{
                                        position: 'absolute',
                                        top: 4,
                                        right: 4,
                                        bgcolor: 'rgba(255,255,255,0.9)',
                                        '&:hover': { bgcolor: 'rgba(255,255,255,1)' }
                                      }}
                                    >
                                      <Close fontSize="small" />
                                    </IconButton>
                                  </Box>
                                </Grid>
                              ))}
                            </Grid>
                          ) : (
                            <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'info.50' }}>
                              <Typography variant="caption" color="text.secondary">
                                No exterior images
                              </Typography>
                            </Paper>
                          )}
                        </Box>

                        {/* Interior */}
                        <Box>
                          <Typography variant="subtitle2" fontWeight="600" gutterBottom>
                            Interior ({formData.balconyImages.interior.length})
                          </Typography>
                          {formData.balconyImages.interior.length > 0 ? (
                            <Grid container spacing={1}>
                              {formData.balconyImages.interior.map((url, index) => (
                                <Grid item xs={6} key={index}>
                                  <Box sx={{ position: 'relative', pt: '75%', borderRadius: 1, overflow: 'hidden', border: '1px solid #e0e0e0' }}>
                                    <Box
                                      component="img"
                                      src={url}
                                      alt={`Balcony Interior ${index + 1}`}
                                      sx={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'cover'
                                      }}
                                    />
                                    <IconButton
                                      size="small"
                                      onClick={() => handleRemoveImage('balcony', 'interior', index)}
                                      sx={{
                                        position: 'absolute',
                                        top: 4,
                                        right: 4,
                                        bgcolor: 'rgba(255,255,255,0.9)',
                                        '&:hover': { bgcolor: 'rgba(255,255,255,1)' }
                                      }}
                                    >
                                      <Close fontSize="small" />
                                    </IconButton>
                                  </Box>
                                </Grid>
                              ))}
                            </Grid>
                          ) : (
                            <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'info.50' }}>
                              <Typography variant="caption" color="text.secondary">
                                No interior images
                              </Typography>
                            </Paper>
                          )}
                        </Box>
                      </Stack>
                    </AccordionDetails>
                  </Accordion>
                )}

                {/* UPGRADE ACCORDION */}
                {formData.hasUpgrade && (
                  <Accordion 
                    expanded={expandedAccordions.upgrade}
                    onChange={handleAccordionChange('upgrade')}
                    sx={{ mb: 1 }}
                  >
                    <AccordionSummary expandIcon={<ExpandMore />}>
                      <Box display="flex" alignItems="center" gap={1} width="100%">
                        <UpgradeIcon color="secondary" />
                        <Typography fontWeight="bold">With Upgrade Images</Typography>
                        <Badge 
                          badgeContent={formData.upgradeImages.exterior.length + formData.upgradeImages.interior.length} 
                          color="secondary"
                          sx={{ ml: 'auto', mr: 2 }}
                        />
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Stack spacing={2}>
                        {/* Exterior */}
                        <Box>
                          <Typography variant="subtitle2" fontWeight="600" gutterBottom>
                            Exterior ({formData.upgradeImages.exterior.length})
                          </Typography>
                          {formData.upgradeImages.exterior.length > 0 ? (
                            <Grid container spacing={1}>
                              {formData.upgradeImages.exterior.map((url, index) => (
                                <Grid item xs={6} key={index}>
                                  <Box sx={{ position: 'relative', pt: '75%', borderRadius: 1, overflow: 'hidden', border: '1px solid #e0e0e0' }}>
                                    <Box
                                      component="img"
                                      src={url}
                                      alt={`Upgrade Exterior ${index + 1}`}
                                      sx={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'cover'
                                      }}
                                    />
                                    <IconButton
                                      size="small"
                                      onClick={() => handleRemoveImage('upgrade', 'exterior', index)}
                                      sx={{
                                        position: 'absolute',
                                        top: 4,
                                        right: 4,
                                        bgcolor: 'rgba(255,255,255,0.9)',
                                        '&:hover': { bgcolor: 'rgba(255,255,255,1)' }
                                      }}
                                    >
                                      <Close fontSize="small" />
                                    </IconButton>
                                  </Box>
                                </Grid>
                              ))}
                            </Grid>
                          ) : (
                            <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'secondary.50' }}>
                              <Typography variant="caption" color="text.secondary">
                                No exterior images
                              </Typography>
                            </Paper>
                          )}
                        </Box>

                        {/* Interior */}
                        <Box>
                          <Typography variant="subtitle2" fontWeight="600" gutterBottom>
                            Interior ({formData.upgradeImages.interior.length})
                          </Typography>
                          {formData.upgradeImages.interior.length > 0 ? (
                            <Grid container spacing={1}>
                              {formData.upgradeImages.interior.map((url, index) => (
                                <Grid item xs={6} key={index}>
                                  <Box sx={{ position: 'relative', pt: '75%', borderRadius: 1, overflow: 'hidden', border: '1px solid #e0e0e0' }}>
                                    <Box
                                      component="img"
                                      src={url}
                                      alt={`Upgrade Interior ${index + 1}`}
                                      sx={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'cover'
                                      }}
                                    />
                                    <IconButton
                                      size="small"
                                      onClick={() => handleRemoveImage('upgrade', 'interior', index)}
                                      sx={{
                                        position: 'absolute',
                                        top: 4,
                                        right: 4,
                                        bgcolor: 'rgba(255,255,255,0.9)',
                                        '&:hover': { bgcolor: 'rgba(255,255,255,1)' }
                                      }}
                                    >
                                      <Close fontSize="small" />
                                    </IconButton>
                                  </Box>
                                </Grid>
                              ))}
                            </Grid>
                          ) : (
                            <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'secondary.50' }}>
                              <Typography variant="caption" color="text.secondary">
                                No interior images
                              </Typography>
                            </Paper>
                          )}
                        </Box>
                      </Stack>
                    </AccordionDetails>
                  </Accordion>
                )}

                {/* STORAGE ACCORDION */}
                {formData.hasStorage && (
                  <Accordion 
                    expanded={expandedAccordions.storage}
                    onChange={handleAccordionChange('storage')}
                    sx={{ mb: 1 }}
                  >
                    <AccordionSummary expandIcon={<ExpandMore />}>
                      <Box display="flex" alignItems="center" gap={1} width="100%">
                        <StorageIcon color="success" />
                        <Typography fontWeight="bold">With Storage Images</Typography>
                        <Badge 
                          badgeContent={formData.storageImages.exterior.length + formData.storageImages.interior.length} 
                          color="success"
                          sx={{ ml: 'auto', mr: 2 }}
                        />
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Stack spacing={2}>
                        {/* Exterior */}
                        <Box>
                          <Typography variant="subtitle2" fontWeight="600" gutterBottom>
                            Exterior ({formData.storageImages.exterior.length})
                          </Typography>
                          {formData.storageImages.exterior.length > 0 ? (
                            <Grid container spacing={1}>
                              {formData.storageImages.exterior.map((url, index) => (
                                <Grid item xs={6} key={index}>
                                  <Box sx={{ position: 'relative', pt: '75%', borderRadius: 1, overflow: 'hidden', border: '1px solid #e0e0e0' }}>
                                    <Box
                                      component="img"
                                      src={url}
                                      alt={`Storage Exterior ${index + 1}`}
                                      sx={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'cover'
                                      }}
                                    />
                                    <IconButton
                                      size="small"
                                      onClick={() => handleRemoveImage('storage', 'exterior', index)}
                                      sx={{
                                        position: 'absolute',
                                        top: 4,
                                        right: 4,
                                        bgcolor: 'rgba(255,255,255,0.9)',
                                        '&:hover': { bgcolor: 'rgba(255,255,255,1)' }
                                      }}
                                    >
                                      <Close fontSize="small" />
                                    </IconButton>
                                  </Box>
                                </Grid>
                              ))}
                            </Grid>
                          ) : (
                            <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'success.50' }}>
                              <Typography variant="caption" color="text.secondary">
                                No exterior images
                              </Typography>
                            </Paper>
                          )}
                        </Box>

                        {/* Interior */}
                        <Box>
                          <Typography variant="subtitle2" fontWeight="600" gutterBottom>
                            Interior ({formData.storageImages.interior.length})
                          </Typography>
                          {formData.storageImages.interior.length > 0 ? (
                            <Grid container spacing={1}>
                              {formData.storageImages.interior.map((url, index) => (
                                <Grid item xs={6} key={index}>
                                  <Box sx={{ position: 'relative', pt: '75%', borderRadius: 1, overflow: 'hidden', border: '1px solid #e0e0e0' }}>
                                    <Box
                                      component="img"
                                      src={url}
                                      alt={`Storage Interior ${index + 1}`}
                                      sx={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'cover'
                                      }}
                                    />
                                    <IconButton
                                      size="small"
                                      onClick={() => handleRemoveImage('storage', 'interior', index)}
                                      sx={{
                                        position: 'absolute',
                                        top: 4,
                                        right: 4,
                                        bgcolor: 'rgba(255,255,255,0.9)',
                                        '&:hover': { bgcolor: 'rgba(255,255,255,1)' }
                                      }}
                                    >
                                      <Close fontSize="small" />
                                    </IconButton>
                                  </Box>
                                </Grid>
                              ))}
                            </Grid>
                          ) : (
                            <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'success.50' }}>
                              <Typography variant="caption" color="text.secondary">
                                No interior images
                              </Typography>
                            </Paper>
                          )}
                        </Box>
                      </Stack>
                    </AccordionDetails>
                  </Accordion>
                )}
              </Box>
            </Box>
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid #e0e0e0' }}>
          <Button onClick={handleCloseDialog} variant="outlined">
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained"
            startIcon={selectedModel ? <Edit /> : <Add />}
            sx={{
              bgcolor: '#4a7c59',
              '&:hover': { bgcolor: '#3d6649' }
            }}
          >
            {selectedModel ? 'Update Model' : 'Create Model'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Facade Dialog (sin cambios) */}
      <Dialog open={openFacadeDialog} onClose={handleCloseFacadeDialog} maxWidth="lg" fullWidth>
        <DialogTitle sx={{ pb: 1 }}>
          <Box display="flex" alignItems="center" gap={1}>
            <CloudUpload color="primary" />
            <Typography variant="h6" component="span">
              {selectedFacade ? 'Edit Facade' : 'Add New Facade'}
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ height: '70vh', display: 'flex', p: 3 }}>
          <Box display="flex" gap={3} flex={1}>
            <Box 
              flex={1}
              sx={{
                overflowY: 'auto',
                pr: 2,
                '&::-webkit-scrollbar': {
                  width: '6px'
                },
                '&::-webkit-scrollbar-thumb': {
                  backgroundColor: 'rgba(0,0,0,0.2)',
                  borderRadius: '3px'
                }
              }}
            >
              <Grid container spacing={2}>
                {selectedModelForFacades && (
                  <Grid item xs={12}>
                    <Paper sx={{ p: 2, bgcolor: 'primary.50', border: '1px solid', borderColor: 'primary.200' }}>
                      <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                        Selected Model
                      </Typography>
                      <Typography variant="h6" fontWeight="bold" color="primary">
                        {selectedModelForFacades.model}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Base Price: ${selectedModelForFacades.price?.toLocaleString()} • Model #{selectedModelForFacades.modelNumber}
                      </Typography>
                    </Paper>
                  </Grid>
                )}

                <Grid item xs={12} sm={8}>
                  <TextField
                    fullWidth
                    label="Facade Title *"
                    value={facadeFormData.title}
                    onChange={(e) => setFacadeFormData({ ...facadeFormData, title: e.target.value })}
                    required
                    placeholder="e.g., Modern Colonial, Craftsman"
                    helperText="Give this facade style a descriptive name"
                  />
                </Grid>

                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Additional Price *"
                    value={facadeFormData.price}
                    onChange={(e) => setFacadeFormData({ ...facadeFormData, price: Number(e.target.value) })}
                    required
                    InputProps={{
                      startAdornment: <Typography sx={{ mr: 0.5 }}>$</Typography>
                    }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Box 
                    sx={{ 
                      p: 2, 
                      border: '2px dashed', 
                      borderColor: facadeFormData.url.length === 0 ? 'error.main' : 'grey.300',
                      borderRadius: 2,
                      bgcolor: facadeFormData.url.length === 0 ? 'error.50' : 'grey.50'
                    }}
                  >
                    <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                      Facade Images *
                    </Typography>
                    
                    <Box display="flex" gap={1}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Image URL"
                        value={currentFacadeUrl}
                        onChange={(e) => setCurrentFacadeUrl(e.target.value)}
                        placeholder="https://example.com/facade.jpg"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            handleAddFacadeUrl()
                          }
                        }}
                      />
                      <Button
                        variant="contained"
                        onClick={handleAddFacadeUrl}
                        disabled={!currentFacadeUrl.trim()}
                        startIcon={<Add />}
                      >
                        Add
                      </Button>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </Box>

            <Box 
              sx={{ 
                width: 340,
                borderLeft: '1px solid',
                borderColor: 'divider',
                pl: 3,
                display: 'flex',
                flexDirection: 'column',
                height: '100%'
              }}
            >
              <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                Images ({facadeFormData.url.length})
              </Typography>
              
              {facadeFormData.url.length > 0 ? (
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1,
                    flex: 1,
                    overflowY: 'auto',
                    pr: 1
                  }}
                >
                  {facadeFormData.url.map((url, index) => (
                    <Box
                      key={index}
                      sx={{
                        position: 'relative',
                        borderRadius: 1,
                        overflow: 'hidden',
                        border: '1px solid #e0e0e0'
                      }}
                    >
                      <Box
                        component="img"
                        src={url}
                        alt={`Preview ${index + 1}`}
                        sx={{
                          width: '100%',
                          height: 120,
                          objectFit: 'cover'
                        }}
                      />
                      <IconButton
                        onClick={() => handleRemoveFacadeUrl(index)}
                        size="small"
                        sx={{
                          position: 'absolute',
                          top: 4,
                          right: 4,
                          bgcolor: 'rgba(255,255,255,0.9)'
                        }}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </Box>
                  ))}
                </Box>
              ) : (
                <Paper sx={{ p: 4, textAlign: 'center', bgcolor: 'grey.50', flex: 1 }}>
                  <CloudUpload sx={{ fontSize: 40, color: 'grey.400', mb: 1 }} />
                  <Typography variant="caption" color="text.secondary">
                    No images added yet
                  </Typography>
                </Paper>
              )}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseFacadeDialog}>Cancel</Button>
          <Button 
            onClick={handleSubmitFacade} 
            variant="contained"
            disabled={!facadeFormData.title.trim() || facadeFormData.url.length === 0}
          >
            {selectedFacade ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Pricing Dialog (sin cambios significativos) */}
      <Dialog open={openPricingDialog} onClose={() => setOpenPricingDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <Visibility color="primary" />
            <Typography variant="h6" component="span">
              Pricing Options - {pricingOptions?.modelName}
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          {pricingOptions && (
            <Box>
              <Paper sx={{ p: 2, mb: 3, bgcolor: 'primary.50' }}>
                <Typography variant="h6" gutterBottom fontWeight="bold">
                  Base Price: ${pricingOptions.basePrice?.toLocaleString()}
                </Typography>
                <Box display="flex" gap={1} mt={2} flexWrap="wrap">
                  {pricingOptions.priceComponents.balconyPrice > 0 && (
                    <Chip 
                      label={`Balcony: +$${pricingOptions.priceComponents.balconyPrice.toLocaleString()}`}
                      color="info"
                    />
                  )}
                  {pricingOptions.priceComponents.upgradePrice > 0 && (
                    <Chip 
                      label={`Upgrade: +$${pricingOptions.priceComponents.upgradePrice.toLocaleString()}`}
                      color="secondary"
                    />
                  )}
                  {pricingOptions.priceComponents.storagePrice > 0 && (
                    <Chip 
                      label={`Storage: +$${pricingOptions.priceComponents.storagePrice.toLocaleString()}`}
                      color="success"
                    />
                  )}
                </Box>
              </Paper>

              <Accordion defaultExpanded>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Typography variant="h6">
                    Basic Options ({pricingOptions.pricingByType.basic.length})
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={2}>
                    {pricingOptions.pricingByType.basic.map((option, index) => (
                      <Grid item xs={12} sm={6} key={index}>
                        <Card variant="outlined">
                          <CardContent>
                            <Typography variant="subtitle2" fontWeight="bold">
                              {option.label}
                            </Typography>
                            <Typography variant="h6" color="primary" fontWeight="bold">
                              ${option.price.toLocaleString()}
                            </Typography>
                            <Box display="flex" gap={0.5} mt={1} flexWrap="wrap">
                              {option.hasBalcony && <Chip label="Balcony" size="small" color="info" />}
                              {option.hasStorage && <Chip label="Storage" size="small" color="success" />}
                            </Box>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </AccordionDetails>
              </Accordion>

              {pricingOptions.pricingByType.upgrade.length > 0 && (
                <Accordion defaultExpanded sx={{ mt: 2 }}>
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Typography variant="h6">
                      Upgrade Options ({pricingOptions.pricingByType.upgrade.length})
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Grid container spacing={2}>
                      {pricingOptions.pricingByType.upgrade.map((option, index) => (
                        <Grid item xs={12} sm={6} key={index}>
                          <Card variant="outlined" sx={{ bgcolor: 'secondary.50' }}>
                            <CardContent>
                              <Typography variant="subtitle2" fontWeight="bold">
                                {option.label}
                              </Typography>
                              <Typography variant="h6" color="secondary" fontWeight="bold">
                                ${option.price.toLocaleString()}
                              </Typography>
                              <Box display="flex" gap={0.5} mt={1} flexWrap="wrap">
                                <Chip label="Upgrade" size="small" color="secondary" />
                                {option.hasBalcony && <Chip label="Balcony" size="small" color="info" />}
                                {option.hasStorage && <Chip label="Storage" size="small" color="success" />}
                              </Box>
                            </CardContent>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  </AccordionDetails>
                </Accordion>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPricingDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default Models