import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Container, Grid, Typography, Box, Card, CardContent, Button, Checkbox, Dialog, Chip, Divider
} from '@mui/material'
import { motion, useMotionValue, useTransform } from 'framer-motion'
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

    
  // ✅ Valores de movimiento del mouse
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  // ✅ Transformar movimiento a rotación 3D
  const rotateX = useTransform(y, [-100, 100], [15, -15]);
  const rotateY = useTransform(x, [-100, 100], [-15, 15]);

  // ✅ Manejar movimiento del mouse
  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set(e.clientX - centerX);
    y.set(e.clientY - centerY);
  };

  // ✅ Resetear al salir
  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

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
                  onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          sx={{
            position: 'absolute',
            top: { xs: '-115px', sm: '-140px', md: '-12pc' },
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
          <motion.img
            src={imgSrc}
            alt={model.model}
            style={{
              width: '90%',
              height: '90%',
              objectFit: 'cover',
              rotateX,
              rotateY,
              transition: 'transform 0.1s ease-out',
            }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          />
        </Box>
      
        <CardContent 
          sx={{ 
            flex: 1,
            display: 'flex', 
            flexDirection: 'column', 
            p: { xs: 2.5, sm: 3, md: 3.5 },
            mt: { xs: 8, sm: 10, md: 13 },
            background: 'linear-gradient(180deg, #ffffff 0%, #fafafa 100%)',
            borderRadius: 6,
          }}
        >
          {/* ✅ TÍTULO DEL MODELO - Más elegante */}
          <Typography
            variant="h5"
            sx={{
              fontFamily: '"Poppins", sans-serif',  // Fuente más elegante y formal
              color: '#1a1a1a',
              fontWeight: 600,
              mb: 0.5,
              fontSize: { xs: '1.5rem', sm: '1.7rem', md: '1.9rem' },
              letterSpacing: '1px',
              textAlign: 'center',
              textTransform: 'uppercase'
            }}
          >
            {model.model}
          </Typography>
        
          {/* ✅ LÍNEA DECORATIVA SUTIL */}
          <Box
            sx={{
              width: 60,
              height: 2,
              bgcolor: '#8CA551',
              mx: 'auto',
              mb: 2,
              opacity: 0.8
            }}
          />
        
          {/* ✅ PRECIO - Más sofisticado */}
          <Typography
            variant="h6"
            sx={{
              color: '#2c5530',
              fontWeight: 500, 
              mb: 3, 
              fontSize: { xs: '1.15rem', sm: '1.25rem', md: '1.35rem' }, 
              textAlign: 'center', 
              fontFamily: '"Poppins", sans-serif', 
              letterSpacing: '0.5px' 
            }} > 
            ${model.price ? `${model.price.toLocaleString()}` : 'Consult'} 
          </Typography> {/* ✅ CHIPS INFORMATIVOS - Diseño más sobrio */} 
          <Box sx={{ display: 'flex',
              gap: 1, 
              flexWrap: 'wrap', 
              mb: 3, 
              justifyContent: 'center',
              minHeight: 56,
              alignContent: 'flex-start'
            }}
          >
            {model.modelNumber === "10" ? (
              <>
                <Chip 
                  label="Dining Room" 
                  size="small"
                  sx={{ 
                    bgcolor: 'transparent',
                    border: '1.5px solid #E5863C ',
                    color: '#8b6f47',
                    fontWeight: 600, 
                    fontSize: '0.7rem',
                    height: 28,
                    px: 1.5,
                    fontFamily: '"Poppins", sans-serif', 
                    letterSpacing: '0.5px',
                    textTransform: 'uppercase',
                    '&:hover': {
                      bgcolor: 'rgba(212, 165, 116, 0.08)'
                    }
                  }} 
                />
                <Chip 
                  label="Study" 
                  size="small"
                  sx={{ 
                    bgcolor: 'transparent',
                    border: '1.5px solid #706f6f',
                    color: '#4a5d6f',
                    fontWeight: 600, 
                    fontSize: '0.7rem',
                    height: 28,
                    px: 1.5,
                    fontFamily: '"Poppins", sans-serif', 
                    letterSpacing: '0.5px',
                    textTransform: 'uppercase',
                    '&:hover': {
                      bgcolor: 'rgba(123, 140, 158, 0.08)'
                    }
                  }} 
                />
                {model.storages && model.storages.length > 0 && (
                  <Chip 
                    label="Storage" 
                    size="small"
                    sx={{ 
                      bgcolor: 'transparent',
                      border: '1.5px solid #706f6f',
                      color: '#5a5a5a',
                      fontWeight: 600, 
                      fontSize: '0.7rem',
                      height: 28,
                      px: 1.5,
                      fontFamily: '"Poppins", sans-serif', 
                      letterSpacing: '0.5px',
                      textTransform: 'uppercase',
                      '&:hover': {
                        bgcolor: 'rgba(158, 158, 158, 0.08)'
                      }
                    }} 
                  />
                )}
                {model.upgrades && model.upgrades.length > 0 && (
                  <Chip 
                    label="Upgrades" 
                    size="small"
                    sx={{ 
                      bgcolor: 'transparent',
                      border: '1.5px solid #333F1F',
                      color: '#2c5530',
                      fontWeight: 600, 
                      fontSize: '0.7rem',
                      height: 28,
                      px: 1.5,
                      fontFamily: '"Poppins", sans-serif', 
                      letterSpacing: '0.5px',
                      textTransform: 'uppercase',
                      '&:hover': {
                        bgcolor: 'rgba(74, 124, 89, 0.08)'
                      }
                    }} 
                  />
                )}
              </>
            ) : (
              <>
                {model.balconies && model.balconies.length > 0 && (
                  <Chip 
                    label="Balcony" 
                    size="small"
                    sx={{ 
                      bgcolor: 'transparent',
                      border: '1.5px solid #8CA551',
                      color: '#3d5a4d',
                      fontWeight: 600, 
                      fontSize: '0.7rem',
                      height: 28,
                      px: 1.5,
                      fontFamily: '"Poppins", sans-serif', 
                      letterSpacing: '0.5px',
                      textTransform: 'uppercase',
                      '&:hover': {
                        bgcolor: 'rgba(107, 144, 128, 0.08)'
                      }
                    }} 
                  />
                )}
                {model.storages && model.storages.length > 0 && (
                  <Chip 
                    label="Storage" 
                    size="small"
                    sx={{ 
                      bgcolor: 'transparent',
                      border: '1.5px solid #9e9e9e',
                      color: '#5a5a5a',
                      fontWeight: 600, 
                      fontSize: '0.7rem',
                      height: 28,
                      px: 1.5,
                      fontFamily: '"Poppins", sans-serif', 
                      letterSpacing: '0.5px',
                      textTransform: 'uppercase',
                      '&:hover': {
                        bgcolor: 'rgba(158, 158, 158, 0.08)'
                      }
                    }} 
                  />
                )}
                {model.upgrades && model.upgrades.length > 0 && (
                  <Chip 
                    label="Upgrades" 
                    size="small"
                    sx={{ 
                      bgcolor: 'transparent',
                      border: '1.5px solid #4a7c59',
                      color: '#2c5530',
                      fontWeight: 600, 
                      fontSize: '0.7rem',
                      height: 28,
                      px: 1.5,
                      fontFamily: '"Poppins", sans-serif', 
                      letterSpacing: '0.5px',
                      textTransform: 'uppercase',
                      '&:hover': {
                        bgcolor: 'rgba(74, 124, 89, 0.08)'
                      }
                    }} 
                  />
                )}
              </>
            )}
          </Box>
        
          {/* ✅ GRID DE ESPECIFICACIONES - Diseño minimalista */}
          {/* ✅ GRID DE ESPECIFICACIONES - Estilo brandbook */}
          <Box 
            sx={{ 
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: 0,
              mb: 3,
              borderTop: '1px solid #e0e0e0',
              borderBottom: '1px solid #e0e0e0',
              py: 2
            }}
          >
            <Box 
              sx={{ 
                textAlign: 'center',
                borderRight: '1px solid #e0e0e0',
                px: 1
              }}
            >
              <Typography 
                variant="caption" 
                sx={{ 
                  color: '#999999', 
                  fontSize: '0.65rem',
                  fontWeight: 500,
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  fontFamily: '"Poppins", sans-serif',
                  display: 'block',
                  mb: 0.8
                }}
              >
                SQFT
              </Typography>
              <Typography 
                variant="h6" 
                sx={{ 
                  color: '#1a1a1a', 
                  fontSize: { xs: '1.1rem', md: '1.3rem' },
                  fontWeight: 600,
                  fontFamily: '"Poppins", sans-serif',
                  lineHeight: 1
                }}
              >
                {model.sqft?.toLocaleString()}
              </Typography>
            </Box>
          
            <Box 
              sx={{ 
                textAlign: 'center',
                borderRight: '1px solid #e0e0e0',
                px: 1
              }}
            >
              <Typography 
                variant="caption" 
                sx={{ 
                  color: '#999999', 
                  fontSize: '0.65rem',
                  fontWeight: 500,
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  fontFamily: '"Poppins", sans-serif',
                  display: 'block',
                  mb: 0.8
                }}
              >
                BEDS
              </Typography>
              <Typography 
                variant="h6" 
                sx={{ 
                  color: '#1a1a1a', 
                  fontSize: { xs: '1.1rem', md: '1.3rem' },
                  fontWeight: 600,
                  fontFamily: '"Poppins", sans-serif',
                  lineHeight: 1
                }}
              >
                {model.bedrooms}
              </Typography>
            </Box>
          
            <Box 
              sx={{ 
                textAlign: 'center',
                borderRight: '1px solid #e0e0e0',
                px: 1
              }}
            >
              <Typography 
                variant="caption" 
                sx={{ 
                  color: '#999999', 
                  fontSize: '0.65rem',
                  fontWeight: 500,
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  fontFamily: '"Poppins", sans-serif',
                  display: 'block',
                  mb: 0.8
                }}
              >
                BATHS
              </Typography>
              <Typography 
                variant="h6" 
                sx={{ 
                  color: '#1a1a1a', 
                  fontSize: { xs: '1.1rem', md: '1.3rem' },
                  fontWeight: 600,
                  fontFamily: '"Poppins", sans-serif',
                  lineHeight: 1
                }}
              >
                {model.bathrooms}
              </Typography>
            </Box>
          
            <Box 
              sx={{ 
                textAlign: 'center',
                px: 1
              }}
            >
              <Typography 
                variant="caption" 
                sx={{ 
                  color: '#999999', 
                  fontSize: '0.65rem',
                  fontWeight: 500,
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  fontFamily: '"Poppins", sans-serif',
                  display: 'block',
                  mb: 0.8
                }}
              >
                STORIES
              </Typography>
              <Typography 
                variant="h6" 
                sx={{ 
                  color: '#1a1a1a', 
                  fontSize: { xs: '1.1rem', md: '1.3rem' },
                  fontWeight: 600,
                  fontFamily: '"Poppins", sans-serif',
                  lineHeight: 1
                }}
              >
                {model.stories}
              </Typography>
            </Box>
          </Box>
        
          {/* ✅ BOTÓN VIEW DETAILS - Minimalista y elegante */}
          <Button
          onClick={(e) => {
            e.stopPropagation();
            onGoDetail(model._id);
          }}
            fullWidth
            sx={{
              mt: "auto",
              borderRadius: 0,
              bgcolor: "#333F1F",
              color: "white",
              fontWeight: 600,
              fontSize: { xs: "0.85rem", md: "0.9rem" },
              px: 3,
              py: { xs: 1.5, md: 1.8 },
              letterSpacing: "1.5px",
              textTransform: "uppercase",
              fontFamily: '"Poppins", sans-serif',
              border: "none",
              position: "relative",
              overflow: "hidden",
              "&::before": {
                content: '""',
                position: "absolute",
                top: 0,
                left: "-100%",
                width: "100%",
                height: "100%",
                bgcolor: "#8CA551",
                transition: "left 0.4s ease",
                zIndex: 0,
              },
              "&:hover": {
                bgcolor: "#333F1F",
                "&::before": {
                  left: 0,
                },
                "& .button-text": {
                  color: "white",
                },
              },
              "& .button-text": {
                position: "relative",
                zIndex: 1,
                transition: "color 0.3s ease",
              },
            }}
          >
            <span className="button-text">View Details</span>
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
  disabled={selected.length !== 2}
  onClick={handleCompare}
  sx={{
    borderRadius: 3,
    bgcolor: "#333F1F",
    color: "white",
    fontWeight: 600,
    fontSize: { xs: "0.85rem", md: "0.9rem" },
    px: 4,
    py: 1.5,
    letterSpacing: "1.5px",
    textTransform: "uppercase",
    fontFamily: '"Poppins", sans-serif',
    border: "none",
    position: "relative",
    overflow: "hidden",
    boxShadow: '0 4px 12px rgba(51, 63, 31, 0.2)',
    transition: 'all 0.3s ease',
    "&::before": {
      content: '""',
      position: "absolute",
      top: 0,
      left: "-100%",
      width: "100%",
      height: "100%",
      bgcolor: "#8CA551",
      transition: "left 0.4s ease",
      zIndex: 0,
    },
    "&:hover": {
      bgcolor: "#333F1F",
      boxShadow: '0 8px 20px rgba(51, 63, 31, 0.3)',
      transform: 'translateY(-2px)',
      "&::before": {
        left: 0,
      },
      "& .button-text": {
        color: "white",
      },
    },
    "&:active": {
      transform: 'translateY(0px)',
      boxShadow: '0 4px 12px rgba(51, 63, 31, 0.2)'
    },
    "&:disabled": {
      bgcolor: '#e0e0e0',
      color: '#9e9e9e',
      boxShadow: 'none',
      transform: 'none',
      '&::before': {
        display: 'none'
      }
    },
    "& .button-text": {
      position: "relative",
      zIndex: 1,
      transition: "color 0.3s ease",
    },
  }}
>
  <span className="button-text">Compare Selected</span>
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