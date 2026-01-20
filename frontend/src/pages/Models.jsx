import { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Chip,
  Tabs,
  Tab,
  ImageList,
  ImageListItem,
  ImageListItemBar
} from '@mui/material'
import { Add, Edit, Delete, Home, Image as ImageIcon } from '@mui/icons-material'
import api from '../services/api'

const Models = () => {
  const [models, setModels] = useState([])
  const [facades, setFacades] = useState([])
  const [loading, setLoading] = useState(true)
  const [openDialog, setOpenDialog] = useState(false)
  const [openFacadeDialog, setOpenFacadeDialog] = useState(false)
  const [selectedModel, setSelectedModel] = useState(null)
  const [selectedFacade, setSelectedFacade] = useState(null)
  const [selectedModelForFacades, setSelectedModelForFacades] = useState(null)
  const [tabValue, setTabValue] = useState(0)
  
  const [formData, setFormData] = useState({
    model: '',
    modelNumber: '',
    price: 0,
    bedrooms: 0,
    bathrooms: 0,
    sqft: 0,
    description: '',
    status: 'active'
  })

  const [facadeFormData, setFacadeFormData] = useState({
    model: '',
    title: '',
    url: '',
    price: 0
  })

  useEffect(() => {
    fetchModels()
    fetchFacades()
  }, [])

  const fetchModels = async () => {
    try {
      const response = await api.get('/models')
      setModels(response.data)
    } catch (error) {
      console.error('Error fetching models:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchFacades = async () => {
    try {
      const response = await api.get('/facades')
      setFacades(response.data)
    } catch (error) {
      console.error('Error fetching facades:', error)
    }
  }

  const fetchFacadesByModel = async (modelId) => {
    try {
      const response = await api.get(`/facades/model/${modelId}`)
      return response.data
    } catch (error) {
      console.error('Error fetching facades by model:', error)
      return []
    }
  }

  // Model Handlers
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
        status: model.status
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
        status: 'active'
      })
    }
    setOpenDialog(true)
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
    setSelectedModel(null)
  }

  const handleSubmit = async () => {
    try {
      if (selectedModel) {
        await api.put(`/models/${selectedModel._id}`, formData)
      } else {
        await api.post('/models', formData)
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

  // Facade Handlers
  const handleOpenFacadeDialog = async (model, facade = null) => {
    setSelectedModelForFacades(model)
    
    if (facade) {
      setSelectedFacade(facade)
      setFacadeFormData({
        model: facade.model._id || facade.model,
        title: facade.title,
        url: facade.url,
        price: facade.price
      })
    } else {
      setSelectedFacade(null)
      setFacadeFormData({
        model: model._id,
        title: '',
        url: '',
        price: 0
      })
    }
    setOpenFacadeDialog(true)
  }

  const handleCloseFacadeDialog = () => {
    setOpenFacadeDialog(false)
    setSelectedFacade(null)
    setSelectedModelForFacades(null)
  }

  const handleSubmitFacade = async () => {
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
    return facades.filter(f => f.model._id === modelId || f.model === modelId)
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
                          justifyContent: 'center'
                        }}
                      >
                        <Home sx={{ fontSize: 40, color: 'grey.400' }} />
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
                      </Box>
                    </Box>
                    <Box display="flex" gap={1} alignItems="center">
                      <Chip
                        label={model.status}
                        color={getStatusColor(model.status)}
                        size="small"
                      />
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
                      <ImageList sx={{ width: '100%', height: 200 }} cols={4} rowHeight={180} gap={8}>
                        {modelFacades.map((facade) => (
                          <ImageListItem key={facade._id}>
                            <Box
                              sx={{
                                width: '100%',
                                height: 180,
                                bgcolor: 'grey.200',
                                borderRadius: 1,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                backgroundImage: facade.url ? `url(${facade.url})` : 'none',
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                                position: 'relative'
                              }}
                            >
                              {!facade.url && <ImageIcon sx={{ fontSize: 40, color: 'grey.400' }} />}
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
                                  onClick={() => handleOpenFacadeDialog(model, facade)}
                                >
                                  <Edit fontSize="small" />
                                </IconButton>
                                <IconButton
                                  size="small"
                                  sx={{ bgcolor: 'rgba(255,255,255,0.9)' }}
                                  onClick={() => handleDeleteFacade(facade._id)}
                                >
                                  <Delete fontSize="small" />
                                </IconButton>
                              </Box>
                            </Box>
                            <ImageListItemBar
                              title={facade.title}
                              subtitle={`+$${facade.price?.toLocaleString()}`}
                              sx={{
                                '& .MuiImageListItemBar-title': { fontSize: '0.875rem' },
                                '& .MuiImageListItemBar-subtitle': { fontSize: '0.75rem', fontWeight: 'bold' }
                              }}
                            />
                          </ImageListItem>
                        ))}
                      </ImageList>
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

      {/* Model Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedModel ? 'Edit Model' : 'Add New Model'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
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
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {selectedModel ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Facade Dialog */}
      <Dialog open={openFacadeDialog} onClose={handleCloseFacadeDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedFacade ? 'Edit Facade' : 'Add New Facade'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Facade Title"
                value={facadeFormData.title}
                onChange={(e) => setFacadeFormData({ ...facadeFormData, title: e.target.value })}
                required
                placeholder="e.g., Modern Colonial, Craftsman, Mediterranean"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Image URL"
                value={facadeFormData.url}
                onChange={(e) => setFacadeFormData({ ...facadeFormData, url: e.target.value })}
                placeholder="https://example.com/facade-image.jpg"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                type="number"
                label="Additional Price"
                value={facadeFormData.price}
                onChange={(e) => setFacadeFormData({ ...facadeFormData, price: Number(e.target.value) })}
                required
                helperText="Extra cost for this facade option"
              />
            </Grid>
            {selectedModelForFacades && (
              <Grid item xs={12}>
                <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Model
                  </Typography>
                  <Typography variant="body1" fontWeight="500">
                    {selectedModelForFacades.model}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Base Price: ${selectedModelForFacades.price?.toLocaleString()}
                  </Typography>
                </Paper>
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseFacadeDialog}>Cancel</Button>
          <Button 
            onClick={handleSubmitFacade} 
            variant="contained"
            disabled={!facadeFormData.title || !facadeFormData.model}
          >
            {selectedFacade ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default Models