import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
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
  Chip
} from '@mui/material'
import { Add, Edit, Delete, Home } from '@mui/icons-material'
import api from '../services/api'

const Models = () => {
  const navigate = useNavigate()
  const [models, setModels] = useState([])
  const [loading, setLoading] = useState(true)
  const [openDialog, setOpenDialog] = useState(false)
  const [selectedModel, setSelectedModel] = useState(null)
  const [formData, setFormData] = useState({
    model: '',
    modelNumber: '',
    price: 0,
    bedrooms: 0,
    bathrooms: 0,
    sqft: 0,
    description: '',
    status: 'active',
    facades: ['', '', '', ''],
    images: [
      { url: '', title: '' },
      { url: '', title: '' },
      { url: '', title: '' },
      { url: '', title: '' },
      { url: '', title: '' },
      { url: '', title: '' }
    ]
  })

  useEffect(() => {
    fetchModels()
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

  const handleOpenDialog = (model = null) => {
    if (model) {
      setSelectedModel(model)
      const existingFacades = model.facades || []
      const facadesArray = [...existingFacades, ...Array(4 - existingFacades.length).fill('')].slice(0, 4)
      
      const existingImages = model.images || []
      const imagesArray = [...existingImages, ...Array(6 - existingImages.length).fill({ url: '', title: '' })].slice(0, 6)
      
      setFormData({
        model: model.model,
        modelNumber: model.modelNumber || '',
        price: model.price,
        bedrooms: model.bedrooms,
        bathrooms: model.bathrooms,
        sqft: model.sqft,
        description: model.description || '',
        status: model.status,
        facades: facadesArray,
        images: imagesArray
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
        facades: ['', '', '', ''],
        images: [
          { url: '', title: '' },
          { url: '', title: '' },
          { url: '', title: '' },
          { url: '', title: '' },
          { url: '', title: '' },
          { url: '', title: '' }
        ]
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
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this model?')) {
      try {
        await api.delete(`/models/${id}`)
        fetchModels()
      } catch (error) {
        console.error('Error deleting model:', error)
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

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" fontWeight="bold">
            Property Models
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage floorplans, pricing, and availability
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
        {models.map((model) => (
          <Grid item xs={12} sm={6} md={4} key={model._id}>
            <Card 
              className="hover:shadow-lg transition-shadow"
              sx={{ cursor: 'pointer' }}
              onClick={() => navigate(`/models/${model._id}`)}
            >
              <CardMedia
                component="div"
                sx={{
                  height: 200,
                  bgcolor: 'grey.200',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundImage: model.facades?.[0] ? `url(${model.facades[0]})` : 'none',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              >
                {!model.facades?.[0] && <Home sx={{ fontSize: 80, color: 'grey.400' }} />}
              </CardMedia>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="start" mb={1}>
                  <Box>
                    <Typography variant="h6" fontWeight="bold">
                      {model.model}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Model #{model.modelNumber}
                    </Typography>
                  </Box>
                  <Chip
                    label={model.status}
                    color={getStatusColor(model.status)}
                    size="small"
                  />
                </Box>
                
                <Typography variant="h5" color="primary" fontWeight="bold" mb={2}>
                  ${model.price?.toLocaleString()}
                </Typography>

                <Grid container spacing={1} mb={2}>
                  <Grid item xs={4}>
                    <Typography variant="caption" color="text.secondary">
                      Beds
                    </Typography>
                    <Typography variant="body2" fontWeight="500">
                      {model.bedrooms}
                    </Typography>
                  </Grid>
                  <Grid item xs={4}>
                    <Typography variant="caption" color="text.secondary">
                      Baths
                    </Typography>
                    <Typography variant="body2" fontWeight="500">
                      {model.bathrooms}
                    </Typography>
                  </Grid>
                  <Grid item xs={4}>
                    <Typography variant="caption" color="text.secondary">
                      SQFT
                    </Typography>
                    <Typography variant="body2" fontWeight="500">
                      {model.sqft?.toLocaleString()}
                    </Typography>
                  </Grid>
                </Grid>

                <Typography variant="body2" color="text.secondary" mb={2} sx={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                }}>
                  {model.description || 'No description available'}
                </Typography>

                <Box display="flex" justifyContent="flex-end" gap={1}>
                  <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleOpenDialog(model); }}>
                    <Edit fontSize="small" />
                  </IconButton>
                  <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleDelete(model._id); }}>
                    <Delete fontSize="small" />
                  </IconButton>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

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
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                type="number"
                label="Bathrooms"
                value={formData.bathrooms}
                onChange={(e) => setFormData({ ...formData, bathrooms: Number(e.target.value) })}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                type="number"
                label="Square Feet"
                value={formData.sqft}
                onChange={(e) => setFormData({ ...formData, sqft: Number(e.target.value) })}
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
            <Grid item xs={12}>
              <Typography variant="subtitle1" fontWeight="bold" sx={{ mt: 2, mb: 1 }}>
                Facades (4 ángulos de la casa)
              </Typography>
            </Grid>
            {formData.facades.map((url, index) => (
              <Grid item xs={12} sm={6} key={index}>
                <TextField
                  fullWidth
                  label={`Facade ${index + 1}`}
                  value={url}
                  onChange={(e) => {
                    const newFacades = [...formData.facades]
                    newFacades[index] = e.target.value
                    setFormData({ ...formData, facades: newFacades })
                  }}
                  placeholder="https://example.com/facade.jpg"
                />
              </Grid>
            ))}
            <Grid item xs={12}>
              <Typography variant="subtitle1" fontWeight="bold" sx={{ mt: 2, mb: 1 }}>
                Características (6 imágenes con título)
              </Typography>
            </Grid>
            {formData.images.map((img, index) => (
              <Grid item xs={12} key={index}>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <TextField
                    fullWidth
                    label={`Título ${index + 1}`}
                    value={img.title}
                    onChange={(e) => {
                      const newImages = [...formData.images]
                      newImages[index] = { ...newImages[index], title: e.target.value }
                      setFormData({ ...formData, images: newImages })
                    }}
                    placeholder="Ej: Cocina Moderna"
                    sx={{ flex: 1 }}
                  />
                  <TextField
                    fullWidth
                    label={`URL Imagen ${index + 1}`}
                    value={img.url}
                    onChange={(e) => {
                      const newImages = [...formData.images]
                      newImages[index] = { ...newImages[index], url: e.target.value }
                      setFormData({ ...formData, images: newImages })
                    }}
                    placeholder="https://example.com/image.jpg"
                    sx={{ flex: 2 }}
                  />
                </Box>
              </Grid>
            ))}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {selectedModel ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default Models
