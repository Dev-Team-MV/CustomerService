import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Container, Grid, Typography, Box, Card, CardContent, Button, Checkbox, Dialog, Chip, Divider
} from '@mui/material'
import { motion } from 'framer-motion'
import api from '../services/api'
import ModelCustomizationPanel from '../components/ModelCustomizationPanel'

// Asignación manual de imágenes por ID de modelo
const modelImages = {
  "6977c7bbd1f24768968719de": "/images/models/260207_001_0010_ISOMETRIA_4-removebg-preview (1) (1).png",
  "6977c3e7d1f247689687194a": "/images/models/260721_001_0010_ISOMETRIA_3-2-removebg-preview.png",
  "6977c547d1f2476896871969": "/images/models/251229_001_0900_EXT_ISOMETRICO1-removebg-preview (1).png",
};

// ✅ UNA SOLA DEFINICIÓN de ModelCard
function ModelCard({ model, onGoDetail, selected, onSelect }) {
  const imgSrc = modelImages[model._id] || '/no-image.png';

  return (
    <motion.div whileHover={{ scale: 1.04 }}>
      <Card
        sx={{
          borderRadius: 6,
          boxShadow: '0 12px 32px rgba(74,124,89,0.12)',
          border: '1.5px solid #e8f5ee',
          overflow: 'visible',
          height: '100%', // ✅ Altura fija para todas las cards
          minHeight: { xs: 550, sm: 500, md: 460 }, // ✅ Altura mínima responsive
          display: 'flex', // ✅ Flex para mantener estructura
          flexDirection: 'column', // ✅ Dirección vertical
          position: 'relative',
          transition: 'box-shadow 0.3s, border 0.3s',
          '&:hover': {
            boxShadow: '0 24px 48px rgba(74,124,89,0.18)',
            border: '2px solid #4a7c59',
          },
        }}
      >
        <Checkbox
          checked={selected}
          onClick={e => { e.stopPropagation(); onSelect(model._id); }}
          sx={{
            position: 'absolute',
            top: 16,
            right: 16,
            zIndex: 3,
            bgcolor: 'white',
            borderRadius: 2,
            boxShadow: 2,
            '&:hover': {
              boxShadow: '0 24px 48px rgba(74,124,89,0.18)',
              border: '2px solid #4a7c59',
              bgcolor: 'white',
            },
          }}
        />
        
        {/* ✅ Imagen flotante */}
        <Box
          sx={{
            position: 'absolute',
            top: { xs: '-115px', sm: '-140px', md: '-10pc' },
            left: '50%',
            transform: 'translateX(-50%)',
            width: '85%',
            height: { xs: 200, sm: 250, md: 300 },
            zIndex: 2,
            borderRadius: 6,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
          }}
        >
          <img
            src={imgSrc}
            alt={model.model}
            style={{
              width: '90%',
              height: '90%',
              objectFit: 'cover',
              borderBottomLeftRadius: 25,
              borderBottomRightRadius: 25,
            }}
          />
        </Box>
      
        <CardContent 
          sx={{ 
            flex: 1, // ✅ Ocupa todo el espacio disponible
            display: 'flex', 
            flexDirection: 'column', 
            p: { xs: 2, sm: 2.5, md: 3 },
            mt: { xs: 8, sm: 10, md: 13 }
          }}
        >
          {/* ✅ TÍTULO DEL MODELO */}
          <Typography
            variant="h5"
            fontWeight="bold"
            sx={{
              fontFamily: '"Playfair Display", serif',
              color: '#2c3e50',
              mb: 0.5,
              fontSize: { xs: '1.4rem', sm: '1.6rem', md: '1.8rem' },
              letterSpacing: '-0.5px',
              textAlign: 'center'
            }}
          >
            {model.model}
          </Typography>
        
          {/* ✅ PRECIO */}
          <Typography
            variant="h6"
            sx={{
              color: '#4a7c59',
              fontWeight: 700,
              mb: 2,
              fontSize: { xs: '1.1rem', sm: '1.2rem', md: '1.4rem' },
              textAlign: 'center'
            }}
          >
            ${model.price ? `${model.price.toLocaleString()}.00` : 'Consult'}
          </Typography>
        
          {/* ✅ CHIPS INFORMATIVOS - Altura fija */}
          <Box 
            sx={{ 
              display: 'flex', 
              gap: 1, 
              flexWrap: 'wrap', 
              mb: 2.5, 
              justifyContent: 'center',
              minHeight: 56, // ✅ Altura mínima fija para chips (2 filas máximo)
              alignContent: 'flex-start' // ✅ Alinear chips desde arriba
            }}
          >
            {/* ✅ MODELO 10 - Caso especial */}
            {model.modelNumber === "10" ? (
              <>
                <Chip 
                  label="🍽️ Dining Room" 
                  size="small"
                  sx={{ 
                    bgcolor: '#fce4ec', 
                    color: '#c2185b',
                    fontWeight: 700, 
                    fontSize: '0.7rem',
                    height: 24,
                    px: 0.5
                  }} 
                />
                <Chip 
                  label="📚 Study" 
                  size="small"
                  sx={{ 
                    bgcolor: '#f3e5f5', 
                    color: '#7b1fa2',
                    fontWeight: 700, 
                    fontSize: '0.7rem',
                    height: 24,
                    px: 0.5
                  }} 
                />
                {model.storages && model.storages.length > 0 && (
                  <Chip 
                    label="📦 Storage" 
                    size="small"
                    sx={{ 
                      bgcolor: '#fff3e0', 
                      color: '#f57c00',
                      fontWeight: 700, 
                      fontSize: '0.7rem',
                      height: 24,
                      px: 0.5
                    }} 
                  />
                )}
                {model.upgrades && model.upgrades.length > 0 && (
                  <Chip 
                    label="⭐ Upgrades" 
                    size="small"
                    sx={{ 
                      bgcolor: '#fff9c4', 
                      color: '#f57f17',
                      fontWeight: 700, 
                      fontSize: '0.7rem',
                      height: 24,
                      px: 0.5
                    }} 
                  />
                )}
              </>
            ) : (
              /* ✅ MODELOS 5 y 9 - Caso estándar */
              <>
                {model.balconies && model.balconies.length > 0 && (
                  <Chip 
                    label="🌿 Balcony" 
                    size="small"
                    sx={{ 
                      bgcolor: '#e3f2fd', 
                      color: '#2196f3',
                      fontWeight: 700, 
                      fontSize: '0.7rem',
                      height: 24,
                      px: 0.5
                    }} 
                  />
                )}
                {model.storages && model.storages.length > 0 && (
                  <Chip 
                    label="📦 Storage" 
                    size="small"
                    sx={{ 
                      bgcolor: '#fff3e0', 
                      color: '#f57c00',
                      fontWeight: 700, 
                      fontSize: '0.7rem',
                      height: 24,
                      px: 0.5
                    }} 
                  />
                )}
                {model.upgrades && model.upgrades.length > 0 && (
                  <Chip 
                    label="⭐ Upgrades" 
                    size="small"
                    sx={{ 
                      bgcolor: '#fff9c4', 
                      color: '#f57f17',
                      fontWeight: 700, 
                      fontSize: '0.7rem',
                      height: 24,
                      px: 0.5
                    }} 
                  />
                )}
              </>
            )}
          </Box>
        
          {/* ✅ GRID DE ESPECIFICACIONES */}
          <Box 
            sx={{ 
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: 2,
              mb: 2,
              p: 2,
              bgcolor: '#f8f9fa',
              borderRadius: 3
            }}
          >
            <Box sx={{ textAlign: 'center' }}>
              <Typography 
                variant="h6" 
                fontWeight="800" 
                sx={{ 
                  color: '#2c3e50', 
                  fontSize: { xs: '1.3rem', md: '1.5rem' },
                  mb: 0.5
                }}
              >
                {model.sqft?.toLocaleString()}
              </Typography>
              <Typography 
                variant="caption" 
                sx={{ 
                  color: '#6c757d', 
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}
              >
                sqft
              </Typography>
            </Box>
        
            <Box sx={{ textAlign: 'center' }}>
              <Typography 
                variant="h6" 
                fontWeight="800" 
                sx={{ 
                  color: '#2c3e50', 
                  fontSize: { xs: '1.3rem', md: '1.5rem' },
                  mb: 0.5
                }}
              >
                {model.stories}
              </Typography>
              <Typography 
                variant="caption" 
                sx={{ 
                  color: '#6c757d', 
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}
              >
                Stories
              </Typography>
            </Box>
        
            <Box sx={{ textAlign: 'center' }}>
              <Typography 
                variant="h6" 
                fontWeight="800" 
                sx={{ 
                  color: '#2c3e50', 
                  fontSize: { xs: '1.3rem', md: '1.5rem' },
                  mb: 0.5
                }}
              >
                {model.bedrooms}
              </Typography>
              <Typography 
                variant="caption" 
                sx={{ 
                  color: '#6c757d', 
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}
              >
                Bedrooms
              </Typography>
            </Box>
        
            <Box sx={{ textAlign: 'center' }}>
              <Typography 
                variant="h6" 
                fontWeight="800" 
                sx={{ 
                  color: '#2c3e50', 
                  fontSize: { xs: '1.3rem', md: '1.5rem' },
                  mb: 0.5
                }}
              >
                {model.bathrooms}
              </Typography>
              <Typography 
                variant="caption" 
                sx={{ 
                  color: '#6c757d', 
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}
              >
                Bathrooms
              </Typography>
            </Box>
          </Box>
        
          {/* ✅ BOTÓN VIEW DETAILS */}
          <Button
            onClick={(e) => {
              e.stopPropagation();
              onGoDetail(model._id);
            }}
            fullWidth
            sx={{
              mt: 'auto', // ✅ Empuja el botón al fondo
              borderRadius: 3,
              background: 'linear-gradient(135deg, #4a7c59 0%, #8bc34a 100%)',
              color: 'white',
              fontWeight: 700,
              fontSize: { xs: '0.85rem', md: '0.95rem' },
              boxShadow: '0 4px 16px rgba(74,124,89,0.15)',
              px: 3,
              py: { xs: 1.3, md: 1.5 },
              letterSpacing: '0.5px',
              textTransform: 'none',
              '&:hover': {
                background: 'linear-gradient(135deg, #3d664a 0%, #7ba843 100%)',
                boxShadow: '0 8px 24px rgba(74,124,89,0.25)',
                transform: 'translateY(-2px)'
              },
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          >
            View Details →
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}

const ViewModels = () => {
  const [models, setModels] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState([])
  const [compareOpen, setCompareOpen] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    api.get('/models').then(res => {
      setModels(res.data)
      setLoading(false)
    })
  }, [])

  const handleSelect = (id) => {
    setSelected(prev => {
      if (prev.includes(id)) return prev.filter(x => x !== id)
      if (prev.length < 2) return [...prev, id]
      return prev
    })
  }

  const handleCompare = () => {
    setCompareOpen(true)
  }

  const compareModels = models.filter(m => selected.includes(m._id))

  if (loading) return <Box p={6} textAlign="center"><Typography>Loading models...</Typography></Box>

  return (
    <Container maxWidth="xl" sx={{ p: 4 }}>
      <Typography variant="h4" fontWeight="bold" mb={2}>
        All Models
      </Typography>
      
      <Box sx={{ mb: 4 }}>
        <Button
          variant="contained"
          color="primary"
          disabled={selected.length !== 2}
          onClick={handleCompare}
          sx={{
            borderRadius: 3,
            background: 'linear-gradient(135deg, #4a7c59 0%, #8bc34a 100%)',
            fontWeight: 700,
            textTransform: 'none',
            px: 4,
            py: 1.5,
            '&:hover': {
              background: 'linear-gradient(135deg, #3d664a 0%, #7ba843 100%)',
            },
          }}
        >
          Compare Selected
        </Button>
        <Typography variant="caption" sx={{ ml: 2, color: '#6c757d' }}>
          Select 2 models to compare
        </Typography>
      </Box>

    <Grid 
      container 
      spacing={3}
      sx={{ 
        pt: { xs: 12, sm: 15, md: 20 }, // ✅ Padding top responsive
        rowGap: { xs: 15, sm: 12, md: 8 } // ✅ Espacio entre filas en móvil
      }}
    >
      {models.map((model) => (
        <Grid item xs={12} sm={6} md={4} key={model._id}>
          <ModelCard
            model={model}
            onGoDetail={(id) => navigate(`/models/${id}`)}
            selected={selected.includes(model._id)}
            onSelect={handleSelect}
          />
        </Grid>
      ))}
    </Grid>

      <Dialog 
        open={compareOpen} 
        onClose={() => setCompareOpen(false)} 
        maxWidth="xl"
        PaperProps={{
          sx: {
            borderRadius: 4,
            boxShadow: '0 20px 60px rgba(0,0,0,0.2)'
          }
        }}
      >
        {compareModels.length === 2 && (
          <ModelCustomizationPanel
            model={compareModels[0]}
            compareModel={compareModels[1]}
          />
        )}
      </Dialog>
    </Container>
  )
}

export default ViewModels