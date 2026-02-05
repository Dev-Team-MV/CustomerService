import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Container,
  Grid,
  Typography,
  Box,
  Paper,
  Card,
  CardContent,
  Button,
  IconButton,
  Avatar,
  Chip,
  Divider
} from '@mui/material'
import { motion } from 'framer-motion'
import {
  KeyboardArrowLeft,
  KeyboardArrowRight,
  Bed,
  Bathtub,
  SquareFoot,
  Home
} from '@mui/icons-material'
import api from '../services/api'

// --- Componente hijo para cada card ---
function ModelCard({ model, onGoDetail }) {
  const images = [
    ...(model.images?.exterior || []),
    ...(model.images?.interior || [])
  ]
  const [imgIdx, setImgIdx] = useState(0)

  return (
    <motion.div whileHover={{ scale: 1.03 }}>
      <Card
        sx={{
          borderRadius: 5,
          boxShadow: '0 8px 32px rgba(74,124,89,0.10)',
          cursor: 'pointer',
          overflow: 'hidden',
          transition: 'all 0.3s',
          display: 'flex',
          flexDirection: 'column',
          minHeight: 420,
          '&:hover': { boxShadow: '0 16px 48px rgba(74,124,89,0.18)' }
        }}
        onClick={() => onGoDetail(model._id)}
      >
        {/* Imagen superior con flechas */}
        <Box sx={{ position: 'relative', width: '100%', height: 300, bgcolor: '#f4f7f6' }}>
          <img
            src={images[imgIdx] || '/no-image.png'}
            alt={model.model}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block'
            }}
          />
          {images.length > 1 && (
            <>
              <IconButton
                size="small"
                onClick={e => { e.stopPropagation(); setImgIdx((imgIdx - 1 + images.length) % images.length); }}
                sx={{
                  position: 'absolute',
                  left: 8,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  bgcolor: 'rgba(255,255,255,0.85)',
                  '&:hover': { bgcolor: 'white' }
                }}
              >
                <KeyboardArrowLeft />
              </IconButton>
              <IconButton
                size="small"
                onClick={e => { e.stopPropagation(); setImgIdx((imgIdx + 1) % images.length); }}
                sx={{
                  position: 'absolute',
                  right: 8,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  bgcolor: 'rgba(255,255,255,0.85)',
                  '&:hover': { bgcolor: 'white' }
                }}
              >
                <KeyboardArrowRight />
              </IconButton>
              <Box
                sx={{
                  position: 'absolute',
                  left: 12,
                  bottom: 12,
                  bgcolor: 'rgba(0,0,0,0.6)',
                  color: 'white',
                  px: 1.5,
                  py: 0.5,
                  borderRadius: 2,
                  fontSize: 13
                }}
              >
                {imgIdx + 1}/{images.length}
              </Box>
            </>
          )}
        </Box>
        {/* Info inferior mejorada */}
        <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', p: 3 }}>
          <Box>
            <Box display="flex" alignItems="center" gap={2} mb={2}>
              <Avatar
                sx={{
                  width: 56,
                  height: 56,
                  background: 'linear-gradient(135deg, #4a7c59 0%, #8bc34a 100%)',
                  boxShadow: '0 4px 16px rgba(74,124,89,0.15)'
                }}
              >
                <Home sx={{ fontSize: 32, color: 'white' }} />
              </Avatar>
              <Box>
                <Typography variant="h6" fontWeight="bold" sx={{ color: '#2c3e50', mb: 0.5 }}>
                  {model.model}
                </Typography>
                <Typography variant="caption" sx={{ color: '#6c757d', fontWeight: 500 }}>
                  Model #{model.modelNumber}
                </Typography>
              </Box>
              <Chip
                label={model.status === 'sold' ? 'Sold' : 'Available'}
                color={model.status === 'sold' ? 'success' : 'primary'}
                sx={{ fontWeight: 700, ml: 'auto' }}
              />
            </Box>
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={4}>
                <Paper elevation={0} sx={{ p: 1.5, textAlign: 'center', bgcolor: '#f8f9fa', borderRadius: 2 }}>
                  <Bed sx={{ color: '#4a7c59', fontSize: 22 }} />
                  <Typography variant="h6" fontWeight="700" color="#2c3e50">
                    {model.bedrooms}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#6c757d' }}>
                    Beds
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={4}>
                <Paper elevation={0} sx={{ p: 1.5, textAlign: 'center', bgcolor: '#f8f9fa', borderRadius: 2 }}>
                  <Bathtub sx={{ color: '#2196f3', fontSize: 22 }} />
                  <Typography variant="h6" fontWeight="700" color="#2c3e50">
                    {model.bathrooms}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#6c757d' }}>
                    Baths
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={4}>
                <Paper elevation={0} sx={{ p: 1.5, textAlign: 'center', bgcolor: '#f8f9fa', borderRadius: 2 }}>
                  <SquareFoot sx={{ color: '#ff9800', fontSize: 22 }} />
                  <Typography variant="h6" fontWeight="700" color="#2c3e50">
                    {model.sqft?.toLocaleString()}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#6c757d' }}>
                    Sq Ft
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
            <Divider sx={{ my: 2 }} />
            <Box
              sx={{
                p: 2,
                borderRadius: 3,
                background: 'linear-gradient(135deg, rgba(74, 124, 89, 0.08) 0%, rgba(139, 195, 74, 0.08) 100%)',
                border: '1px solid rgba(74, 124, 89, 0.15)',
                textAlign: 'center',
                mb: 2
              }}
            >
              <Typography variant="caption" sx={{ color: '#6c757d', fontWeight: 600, display: 'block', mb: 0.5 }}>
                Property Value
              </Typography>
              <Typography
                variant="h5"
                fontWeight="800"
                sx={{
                  color: '#4a7c59',
                  letterSpacing: '-0.5px'
                }}
              >
                {model.price ? `$${model.price.toLocaleString()}` : 'Consult'}
              </Typography>
            </Box>
            <Typography variant="caption" color="text.secondary">
              {model.description?.slice(0, 60)}
            </Typography>
          </Box>
          <Button
            variant="contained"
            size="small"
            sx={{
              mt: 2,
              background: 'linear-gradient(135deg, #4a7c59 0%, #8bc34a 100%)',
              color: 'white',
              fontWeight: 700,
              borderRadius: 2,
              px: 3,
              py: 1,
              fontSize: '1rem',
              boxShadow: '0 4px 12px rgba(74, 124, 89, 0.12)',
              '&:hover': {
                background: 'linear-gradient(135deg, #3d664a 0%, #7ba843 100%)'
              }
            }}
            onClick={e => { e.stopPropagation(); onGoDetail(model._id); }}
          >
            View Details
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// --- Componente principal ---
const ViewModels = () => {
  const [models, setModels] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    api.get('/models').then(res => {
      setModels(res.data)
      setLoading(false)
    })
  }, [])

  if (loading) return <Box p={6} textAlign="center"><Typography>Loading models...</Typography></Box>

  return (
    <Container maxWidth="xl" sx={{ p: 4 }}>
      <Typography variant="h4" fontWeight="bold" mb={4}>All Models</Typography>
      <Grid container spacing={3}>
        {models.map((model) => (
          <Grid item xs={12} sm={6} md={4} key={model._id}>
            <ModelCard model={model} onGoDetail={(id) => navigate(`/models/${id}`)} />
          </Grid>
        ))}
      </Grid>
    </Container>
  )
}

export default ViewModels