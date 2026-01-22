// import { useState, useEffect } from 'react'
// import {
//   Box,
//   Typography,
//   Paper,
//   Grid,
//   Card,
//   CardContent,
//   CardMedia,
//   Button,
//   IconButton,
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
//   TextField,
//   MenuItem,
//   Chip
// } from '@mui/material'
// import { Add, Edit, Delete, Home } from '@mui/icons-material'
// import api from '../services/api'

// const Models = () => {
//   const [models, setModels] = useState([])
//   const [loading, setLoading] = useState(true)
//   const [openDialog, setOpenDialog] = useState(false)
//   const [selectedModel, setSelectedModel] = useState(null)
//   const [formData, setFormData] = useState({
//     model: '',
//     modelNumber: '',
//     price: 0,
//     bedrooms: 0,
//     bathrooms: 0,
//     sqft: 0,
//     description: '',
//     status: 'active'
//   })

//   useEffect(() => {
//     fetchModels()
//   }, [])

//   const fetchModels = async () => {
//     try {
//       const response = await api.get('/models')
//       setModels(response.data)
//     } catch (error) {
//       console.error('Error fetching models:', error)
//     } finally {
//       setLoading(false)
//     }
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
//         status: model.status
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
//         status: 'active'
//       })
//     }
//     setOpenDialog(true)
//   }

//   const handleCloseDialog = () => {
//     setOpenDialog(false)
//     setSelectedModel(null)
//   }

//   const handleSubmit = async () => {
//     try {
//       if (selectedModel) {
//         await api.put(`/models/${selectedModel._id}`, formData)
//       } else {
//         await api.post('/models', formData)
//       }
//       handleCloseDialog()
//       fetchModels()
//     } catch (error) {
//       console.error('Error saving model:', error)
//     }
//   }

//   const handleDelete = async (id) => {
//     if (window.confirm('Are you sure you want to delete this model?')) {
//       try {
//         await api.delete(`/models/${id}`)
//         fetchModels()
//       } catch (error) {
//         console.error('Error deleting model:', error)
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

//   return (
//     <Box>
//       <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
//         <Box>
//           <Typography variant="h4" fontWeight="bold">
//             Property Models
//           </Typography>
//           <Typography variant="body2" color="text.secondary">
//             Manage floorplans, pricing, and availability
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
//         {models.map((model) => (
//           <Grid item xs={12} sm={6} md={4} key={model._id}>
//             <Card className="hover:shadow-lg transition-shadow">
//               <CardMedia
//                 component="div"
//                 sx={{
//                   height: 200,
//                   bgcolor: 'grey.200',
//                   display: 'flex',
//                   alignItems: 'center',
//                   justifyContent: 'center'
//                 }}
//               >
//                 <Home sx={{ fontSize: 80, color: 'grey.400' }} />
//               </CardMedia>
//               <CardContent>
//                 <Box display="flex" justifyContent="space-between" alignItems="start" mb={1}>
//                   <Box>
//                     <Typography variant="h6" fontWeight="bold">
//                       {model.model}
//                     </Typography>
//                     <Typography variant="caption" color="text.secondary">
//                       Model #{model.modelNumber}
//                     </Typography>
//                   </Box>
//                   <Chip
//                     label={model.status}
//                     color={getStatusColor(model.status)}
//                     size="small"
//                   />
//                 </Box>
                
//                 <Typography variant="h5" color="primary" fontWeight="bold" mb={2}>
//                   ${model.price?.toLocaleString()}
//                 </Typography>

//                 <Grid container spacing={1} mb={2}>
//                   <Grid item xs={4}>
//                     <Typography variant="caption" color="text.secondary">
//                       Beds
//                     </Typography>
//                     <Typography variant="body2" fontWeight="500">
//                       {model.bedrooms}
//                     </Typography>
//                   </Grid>
//                   <Grid item xs={4}>
//                     <Typography variant="caption" color="text.secondary">
//                       Baths
//                     </Typography>
//                     <Typography variant="body2" fontWeight="500">
//                       {model.bathrooms}
//                     </Typography>
//                   </Grid>
//                   <Grid item xs={4}>
//                     <Typography variant="caption" color="text.secondary">
//                       SQFT
//                     </Typography>
//                     <Typography variant="body2" fontWeight="500">
//                       {model.sqft?.toLocaleString()}
//                     </Typography>
//                   </Grid>
//                 </Grid>

//                 <Typography variant="body2" color="text.secondary" mb={2} sx={{
//                   overflow: 'hidden',
//                   textOverflow: 'ellipsis',
//                   display: '-webkit-box',
//                   WebkitLineClamp: 2,
//                   WebkitBoxOrient: 'vertical',
//                 }}>
//                   {model.description || 'No description available'}
//                 </Typography>

//                 <Box display="flex" justifyContent="flex-end" gap={1}>
//                   <IconButton size="small" onClick={() => handleOpenDialog(model)}>
//                     <Edit fontSize="small" />
//                   </IconButton>
//                   <IconButton size="small" onClick={() => handleDelete(model._id)}>
//                     <Delete fontSize="small" />
//                   </IconButton>
//                 </Box>
//               </CardContent>
//             </Card>
//           </Grid>
//         ))}
//       </Grid>

//       <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
//         <DialogTitle>
//           {selectedModel ? 'Edit Model' : 'Add New Model'}
//         </DialogTitle>
//         <DialogContent>
//           <Grid container spacing={2} sx={{ mt: 1 }}>
//             <Grid item xs={12} sm={6}>
//               <TextField
//                 fullWidth
//                 label="Model Name"
//                 value={formData.model}
//                 onChange={(e) => setFormData({ ...formData, model: e.target.value })}
//               />
//             </Grid>
//             <Grid item xs={12} sm={6}>
//               <TextField
//                 fullWidth
//                 label="Model Number"
//                 value={formData.modelNumber}
//                 onChange={(e) => setFormData({ ...formData, modelNumber: e.target.value })}
//               />
//             </Grid>
//             <Grid item xs={12} sm={6}>
//               <TextField
//                 fullWidth
//                 type="number"
//                 label="Base Price"
//                 value={formData.price}
//                 onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
//               />
//             </Grid>
//             <Grid item xs={12} sm={6}>
//               <TextField
//                 fullWidth
//                 select
//                 label="Status"
//                 value={formData.status}
//                 onChange={(e) => setFormData({ ...formData, status: e.target.value })}
//               >
//                 <MenuItem value="active">Active</MenuItem>
//                 <MenuItem value="draft">Draft</MenuItem>
//                 <MenuItem value="inactive">Inactive</MenuItem>
//               </TextField>
//             </Grid>
//             <Grid item xs={12} sm={4}>
//               <TextField
//                 fullWidth
//                 type="number"
//                 label="Bedrooms"
//                 value={formData.bedrooms}
//                 onChange={(e) => setFormData({ ...formData, bedrooms: Number(e.target.value) })}
//               />
//             </Grid>
//             <Grid item xs={12} sm={4}>
//               <TextField
//                 fullWidth
//                 type="number"
//                 label="Bathrooms"
//                 value={formData.bathrooms}
//                 onChange={(e) => setFormData({ ...formData, bathrooms: Number(e.target.value) })}
//               />
//             </Grid>
//             <Grid item xs={12} sm={4}>
//               <TextField
//                 fullWidth
//                 type="number"
//                 label="Square Feet"
//                 value={formData.sqft}
//                 onChange={(e) => setFormData({ ...formData, sqft: Number(e.target.value) })}
//               />
//             </Grid>
//             <Grid item xs={12}>
//               <TextField
//                 fullWidth
//                 multiline
//                 rows={4}
//                 label="Description"
//                 value={formData.description}
//                 onChange={(e) => setFormData({ ...formData, description: e.target.value })}
//               />
//             </Grid>
//           </Grid>
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={handleCloseDialog}>Cancel</Button>
//           <Button onClick={handleSubmit} variant="contained">
//             {selectedModel ? 'Update' : 'Create'}
//           </Button>
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
  AccordionDetails
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
  Visibility
} from '@mui/icons-material'
import api from '../services/api'

const Models = () => {
  const navigate = useNavigate()
  const [models, setModels] = useState([])
  const [facades, setFacades] = useState([])
  const [loading, setLoading] = useState(true)
  const [openDialog, setOpenDialog] = useState(false)
  const [openFacadeDialog, setOpenFacadeDialog] = useState(false)
  const [openPricingDialog, setOpenPricingDialog] = useState(false)
  const [selectedModel, setSelectedModel] = useState(null)
  const [selectedFacade, setSelectedFacade] = useState(null)
  const [selectedModelForFacades, setSelectedModelForFacades] = useState(null)
  const [pricingOptions, setPricingOptions] = useState(null)
  
  const [modelImageIndices, setModelImageIndices] = useState({})
  const [facadeImageIndices, setFacadeImageIndices] = useState({})
  
  const [formData, setFormData] = useState({
    model: '',
    modelNumber: '',
    price: 0,
    bedrooms: 0,
    bathrooms: 0,
    sqft: 0,
    description: '',
    status: 'active',
    images: [],
    // Pricing options
    hasBalcony: false,
    balconyPrice: 0,
    hasUpgrade: false,
    upgradePrice: 0,
    hasStorage: false,
    storagePrice: 0
  })

  const [currentImageUrl, setCurrentImageUrl] = useState('')

  const [facadeFormData, setFacadeFormData] = useState({
    model: '',
    title: '',
    url: [],
    price: 0
  })

  const [currentFacadeUrl, setCurrentFacadeUrl] = useState('')

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

  const handleOpenDialog = (model = null) => {
    if (model) {
      setSelectedModel(model)
      setFormData({
        model: model.model,
        modelNumber: model.modelNumber || '',
        price: model.price,
        bedrooms: model.bedrooms,
        bathrooms: model.bathrooms,
        sqft: model.sqft,
        description: model.description || '',
        status: model.status,
        images: Array.isArray(model.images) ? model.images : [],
        hasBalcony: (model.balconyPrice || 0) > 0,
        balconyPrice: model.balconyPrice || 0,
        hasUpgrade: (model.upgradePrice || 0) > 0,
        upgradePrice: model.upgradePrice || 0,
        hasStorage: (model.storagePrice || 0) > 0,
        storagePrice: model.storagePrice || 0
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
        description: '',
        status: 'active',
        images: [],
        hasBalcony: false,
        balconyPrice: 0,
        hasUpgrade: false,
        upgradePrice: 0,
        hasStorage: false,
        storagePrice: 0
      })
    }
    setCurrentImageUrl('')
    setOpenDialog(true)
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
    setSelectedModel(null)
    setCurrentImageUrl('')
  }

  const handleAddImage = () => {
    if (currentImageUrl.trim()) {
      setFormData({
        ...formData,
        images: [...formData.images, currentImageUrl.trim()]
      })
      setCurrentImageUrl('')
    }
  }

  const handleRemoveImage = (index) => {
    setFormData({
      ...formData,
      images: formData.images.filter((_, i) => i !== index)
    })
  }

  const handleSubmit = async () => {
    try {
      const dataToSend = {
        model: formData.model,
        modelNumber: formData.modelNumber,
        price: formData.price,
        bedrooms: formData.bedrooms,
        bathrooms: formData.bathrooms,
        sqft: formData.sqft,
        description: formData.description,
        status: formData.status,
        images: formData.images,
        balconyPrice: formData.hasBalcony ? formData.balconyPrice : 0,
        upgradePrice: formData.hasUpgrade ? formData.upgradePrice : 0,
        storagePrice: formData.hasStorage ? formData.storagePrice : 0
      }

      if (selectedModel) {
        await api.put(`/models/${selectedModel._id}`, dataToSend)
      } else {
        await api.post('/models', dataToSend)
      }
      handleCloseDialog()
      fetchModels()
    } catch (error) {
      console.error('Error saving model:', error)
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
    return (model.balconyPrice > 0 || model.upgradePrice > 0 || model.storagePrice > 0)
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
        >
          Add New Model
        </Button>
      </Box>

      <Grid container spacing={3}>
        {models.map((model) => {
          const modelFacades = getModelFacades(model._id)
          const modelImages = model.images && model.images.length > 0 ? model.images : []
          const currentModelImageIndex = modelImageIndices[model._id] || 0
          const currentModelImage = modelImages[currentModelImageIndex]
          
          return (
            <Grid item xs={12} key={model._id}>
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
                        
                        {modelImages.length > 1 && (
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
                              onClick={(e) => handlePrevModelImage(e, model._id, modelImages.length)}
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
                              onClick={(e) => handleNextModelImage(e, model._id, modelImages.length)}
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
                        
                        {modelImages.length > 1 && (
                          <Chip
                            label={`${currentModelImageIndex + 1}/${modelImages.length}`}
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
                        <Box display="flex" gap={2} mb={1}>
                          <Typography variant="body2">
                            <strong>{model.bedrooms}</strong> beds
                          </Typography>
                          <Typography variant="body2">
                            <strong>{model.bathrooms}</strong> baths
                          </Typography>
                          <Typography variant="body2">
                            <strong>{model.sqft?.toLocaleString()}</strong> sqft
                          </Typography>
                        </Box>
                        <Typography variant="h6" color="primary" fontWeight="bold">
                          Base: ${model.price?.toLocaleString()}
                        </Typography>
                        
                        {/* Pricing Options Badges */}
                        {hasPricingOptions(model) && (
                          <Box display="flex" gap={0.5} mt={1} flexWrap="wrap">
                            {model.balconyPrice > 0 && (
                              <Chip 
                                label={`Balcony: +$${model.balconyPrice.toLocaleString()}`}
                                size="small"
                                color="info"
                                variant="outlined"
                              />
                            )}
                            {model.upgradePrice > 0 && (
                              <Chip 
                                label={`Upgrade: +$${model.upgradePrice.toLocaleString()}`}
                                size="small"
                                color="secondary"
                                variant="outlined"
                              />
                            )}
                            {model.storagePrice > 0 && (
                              <Chip 
                                label={`Storage: +$${model.storagePrice.toLocaleString()}`}
                                size="small"
                                color="success"
                                variant="outlined"
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
            </Grid>
          )
        })}
      </Grid>

      {/* Model Dialog - CON PRICING OPTIONS */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="lg" fullWidth>
        <DialogTitle>
          {selectedModel ? 'Edit Model' : 'Add New Model'}
        </DialogTitle>
        <DialogContent sx={{ height: '70vh', display: 'flex', p: 3 }}>
          <Box display="flex" gap={3} flex={1}>
            {/* Left Side - Form Fields */}
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
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Base Price"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
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
                    rows={4}
                    label="Description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </Grid>

                {/* PRICING OPTIONS SECTION */}
                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    Pricing Options
                  </Typography>
                  <Alert severity="info" sx={{ mb: 2 }}>
                    Enable options to create different pricing combinations for this model
                  </Alert>
                </Grid>

                {/* Balcony Option */}
                <Grid item xs={12} sm={6}>
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
                        }}
                      />
                    }
                    label="Balcony Available"
                  />
                </Grid>

                {formData.hasBalcony && (
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Balcony Additional Price"
                      value={formData.balconyPrice}
                      onChange={(e) => setFormData({ ...formData, balconyPrice: Number(e.target.value) })}
                      required
                      InputProps={{
                        startAdornment: <Typography sx={{ mr: 0.5 }}>$</Typography>
                      }}
                      helperText="Extra cost for balcony option"
                    />
                  </Grid>
                )}

                {/* Upgrade Option */}
                <Grid item xs={12} sm={6}>
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
                        }}
                      />
                    }
                    label="Upgrade Version Available"
                  />
                </Grid>

                {formData.hasUpgrade && (
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Upgrade Additional Price"
                      value={formData.upgradePrice}
                      onChange={(e) => setFormData({ ...formData, upgradePrice: Number(e.target.value) })}
                      required
                      InputProps={{
                        startAdornment: <Typography sx={{ mr: 0.5 }}>$</Typography>
                      }}
                      helperText="Extra cost for upgraded model"
                    />
                  </Grid>
                )}

                {/* Storage Option */}
                <Grid item xs={12} sm={6}>
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
                        }}
                      />
                    }
                    label="Storage Available"
                  />
                </Grid>

                {formData.hasStorage && (
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Storage Additional Price"
                      value={formData.storagePrice}
                      onChange={(e) => setFormData({ ...formData, storagePrice: Number(e.target.value) })}
                      required
                      InputProps={{
                        startAdornment: <Typography sx={{ mr: 0.5 }}>$</Typography>
                      }}
                      helperText="Extra cost for storage"
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
                          Minimum Price: <strong>${formData.price.toLocaleString()}</strong>
                        </Typography>
                        <Typography variant="body2">
                          Maximum Price: <strong>${calculateMaxPrice().toLocaleString()}</strong>
                        </Typography>
                      </Box>
                      <Typography variant="caption" color="text.secondary" display="block">
                        This model will have <strong>{calculatePricingCombinations()}</strong> pricing combinations available
                      </Typography>
                    </Paper>
                  </Grid>
                )}

                <Grid item xs={12}>
                  <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                    Add Model Images
                  </Typography>
                  <Box display="flex" gap={1}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Image URL"
                      value={currentImageUrl}
                      onChange={(e) => setCurrentImageUrl(e.target.value)}
                      placeholder="https://example.com/model-image.jpg"
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
                      sx={{ minWidth: '100px' }}
                    >
                      Add
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </Box>

            {/* Right Side - Images Preview */}
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
                Added Images ({formData.images.length})
              </Typography>
              
              {formData.images.length > 0 ? (
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1,
                    flex: 1,
                    overflowY: 'auto',
                    pr: 1,
                    '&::-webkit-scrollbar': {
                      width: '6px'
                    },
                    '&::-webkit-scrollbar-thumb': {
                      backgroundColor: 'rgba(0,0,0,0.2)',
                      borderRadius: '3px'
                    }
                  }}
                >
                  {formData.images.map((url, index) => (
                    <Box
                      key={index}
                      sx={{
                        position: 'relative',
                        borderRadius: 1,
                        overflow: 'hidden',
                        border: '1px solid',
                        borderColor: 'grey.200',
                        bgcolor: 'grey.50',
                        flexShrink: 0
                      }}
                    >
                      <Box
                        component="img"
                        src={url}
                        alt={`Preview ${index + 1}`}
                        sx={{
                          width: '100%',
                          height: 120,
                          objectFit: 'cover',
                          bgcolor: 'grey.200'
                        }}
                        onError={(e) => {
                          e.target.style.display = 'none'
                        }}
                      />
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 4,
                          right: 4,
                          display: 'flex',
                          gap: 0.5
                        }}
                      >
                        {index === 0 && (
                          <Chip 
                            label="Primary" 
                            size="small" 
                            color="primary"
                            sx={{ height: 20, fontSize: '0.7rem' }}
                          />
                        )}
                        <IconButton
                          size="small"
                          onClick={() => handleRemoveImage(index)}
                          sx={{
                            bgcolor: 'rgba(255,255,255,0.9)',
                            '&:hover': { bgcolor: 'rgba(255,255,255,1)' }
                          }}
                        >
                          <Close fontSize="small" />
                        </IconButton>
                      </Box>
                      <Box sx={{ p: 1 }}>
                        <Typography variant="caption" color="text.secondary" noWrap>
                          Image {index + 1}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>
              ) : (
                <Paper
                  sx={{
                    p: 4,
                    textAlign: 'center',
                    bgcolor: 'grey.50',
                    border: '2px dashed',
                    borderColor: 'grey.300',
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <ImageIcon sx={{ fontSize: 40, color: 'grey.400', mb: 1 }} />
                  <Typography variant="caption" color="text.secondary">
                    No images added yet
                  </Typography>
                </Paper>
              )}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {selectedModel ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Facade Dialog */}
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
            {/* Left Side - Form Fields */}
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
                    placeholder="e.g., Modern Colonial, Craftsman, Mediterranean"
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
                    helperText="Extra cost"
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
                      Facade Images * {facadeFormData.url.length === 0 && (
                        <Chip label="Required" size="small" color="error" sx={{ ml: 1 }} />
                      )}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block" mb={2}>
                      Add at least one image URL. You can add multiple views.
                    </Typography>
                    
                    <Box display="flex" gap={1}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Image URL"
                        value={currentFacadeUrl}
                        onChange={(e) => setCurrentFacadeUrl(e.target.value)}
                        placeholder="https://example.com/facade-image.jpg"
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
                        sx={{ minWidth: '120px' }}
                      >
                        Add URL
                      </Button>
                    </Box>
                  </Box>
                </Grid>

                {facadeFormData.url.length === 0 && (
                  <Grid item xs={12}>
                    <Alert severity="warning" icon={<CloudUpload />}>
                      Please add at least one image URL before saving this facade
                    </Alert>
                  </Grid>
                )}
              </Grid>
            </Box>

            {/* Right Side - Images Preview */}
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
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="subtitle2" fontWeight="bold">
                  Added Images
                </Typography>
                <Chip 
                  label={facadeFormData.url.length} 
                  size="small" 
                  color={facadeFormData.url.length > 0 ? 'success' : 'default'}
                />
              </Box>
              
              {facadeFormData.url.length > 0 ? (
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1,
                    flex: 1,
                    overflowY: 'auto',
                    pr: 1,
                    '&::-webkit-scrollbar': {
                      width: '6px'
                    },
                    '&::-webkit-scrollbar-thumb': {
                      backgroundColor: 'rgba(0,0,0,0.2)',
                      borderRadius: '3px'
                    }
                  }}
                >
                  {facadeFormData.url.map((url, index) => (
                    <Box
                      key={index}
                      sx={{
                        position: 'relative',
                        borderRadius: 1,
                        overflow: 'hidden',
                        border: '1px solid',
                        borderColor: 'grey.200',
                        bgcolor: 'white',
                        flexShrink: 0
                      }}
                    >
                      <Box
                        component="img"
                        src={url}
                        alt={`Preview ${index + 1}`}
                        sx={{
                          width: '100%',
                          height: 120,
                          objectFit: 'cover',
                          bgcolor: 'grey.200'
                        }}
                        onError={(e) => {
                          e.target.style.display = 'none'
                        }}
                      />
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 4,
                          right: 4,
                          display: 'flex',
                          gap: 0.5
                        }}
                      >
                        {index === 0 && (
                          <Chip 
                            label="Primary" 
                            size="small" 
                            color="primary"
                            sx={{ height: 20, fontSize: '0.7rem' }}
                          />
                        )}
                        <IconButton
                          onClick={() => handleRemoveFacadeUrl(index)}
                          size="small"
                          sx={{
                            bgcolor: 'rgba(255,255,255,0.9)',
                            '&:hover': { bgcolor: 'rgba(255,255,255,1)' }
                          }}
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </Box>
                      <Box sx={{ p: 1 }}>
                        <Typography variant="caption" color="text.secondary" noWrap>
                          Image {index + 1}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>
              ) : (
                <Paper
                  sx={{
                    p: 4,
                    textAlign: 'center',
                    bgcolor: 'grey.50',
                    border: '2px dashed',
                    borderColor: 'grey.300',
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <CloudUpload sx={{ fontSize: 40, color: 'grey.400', mb: 1 }} />
                  <Typography variant="caption" color="text.secondary">
                    No images added yet
                  </Typography>
                </Paper>
              )}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={handleCloseFacadeDialog} variant="outlined">
            Cancel
          </Button>
          <Button 
            onClick={handleSubmitFacade} 
            variant="contained"
            disabled={!facadeFormData.title.trim() || !facadeFormData.model || facadeFormData.url.length === 0}
            startIcon={selectedFacade ? <Edit /> : <Add />}
          >
            {selectedFacade ? 'Update Facade' : 'Create Facade'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Pricing Options Dialog */}
      <Dialog 
        open={openPricingDialog} 
        onClose={() => setOpenPricingDialog(false)} 
        maxWidth="md" 
        fullWidth
      >
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
              <Paper sx={{ p: 2, mb: 3, bgcolor: 'primary.50', border: '1px solid', borderColor: 'primary.200' }}>
                <Typography variant="h6" gutterBottom fontWeight="bold">
                  Base Price: ${pricingOptions.basePrice?.toLocaleString()}
                </Typography>
                <Box display="flex" gap={1} mt={2} flexWrap="wrap">
                  {pricingOptions.priceComponents.balconyPrice > 0 && (
                    <Chip 
                      label={`Balcony: +$${pricingOptions.priceComponents.balconyPrice.toLocaleString()}`}
                      color="info"
                      size="small"
                    />
                  )}
                  {pricingOptions.priceComponents.upgradePrice > 0 && (
                    <Chip 
                      label={`Upgrade: +$${pricingOptions.priceComponents.upgradePrice.toLocaleString()}`}
                      color="secondary"
                      size="small"
                    />
                  )}
                  {pricingOptions.priceComponents.storagePrice > 0 && (
                    <Chip 
                      label={`Storage: +$${pricingOptions.priceComponents.storagePrice.toLocaleString()}`}
                      color="success"
                      size="small"
                    />
                  )}
                </Box>
                <Box display="flex" justifyContent="space-between" mt={2}>
                  <Typography variant="body2" fontWeight="600">
                    Min: ${pricingOptions.minPrice?.toLocaleString()}
                  </Typography>
                  <Typography variant="body2" fontWeight="600">
                    Max: ${pricingOptions.maxPrice?.toLocaleString()}
                  </Typography>
                </Box>
              </Paper>

              {/* Basic Options */}
              <Accordion defaultExpanded>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Typography variant="h6">
                    Basic Model Options ({pricingOptions.pricingByType.basic.length})
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={2}>
                    {pricingOptions.pricingByType.basic.map((option, index) => (
                      <Grid item xs={12} sm={6} key={index}>
                        <Card variant="outlined">
                          <CardContent>
                            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                              {option.label}
                            </Typography>
                            <Typography variant="h6" color="primary" fontWeight="bold">
                              ${option.price.toLocaleString()}
                            </Typography>
                            <Box display="flex" gap={0.5} mt={1} flexWrap="wrap">
                              {option.hasBalcony && <Chip label="Balcony" size="small" color="info" />}
                              {option.hasStorage && <Chip label="Storage" size="small" color="success" />}
                              {!option.hasBalcony && !option.hasStorage && (
                                <Chip label="Base Configuration" size="small" variant="outlined" />
                              )}
                            </Box>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </AccordionDetails>
              </Accordion>

              {/* Upgrade Options */}
              {pricingOptions.pricingByType.upgrade.length > 0 && (
                <Accordion defaultExpanded sx={{ mt: 2 }}>
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Typography variant="h6">
                      Upgrade Model Options ({pricingOptions.pricingByType.upgrade.length})
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Grid container spacing={2}>
                      {pricingOptions.pricingByType.upgrade.map((option, index) => (
                        <Grid item xs={12} sm={6} key={index}>
                          <Card variant="outlined" sx={{ bgcolor: 'secondary.50' }}>
                            <CardContent>
                              <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
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