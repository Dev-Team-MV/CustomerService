// import { Box, Paper, Typography, Card, CardContent, CardMedia, Chip, IconButton } from '@mui/material'
// import CheckCircleIcon from '@mui/icons-material/CheckCircle'
// import HotelIcon from '@mui/icons-material/Hotel'
// import BathtubIcon from '@mui/icons-material/Bathtub'
// import SquareFootIcon from '@mui/icons-material/SquareFoot'
// import ChevronRightIcon from '@mui/icons-material/ChevronRight'
// import { useProperty } from '../../context/PropertyContext'

// const ModelSelector = () => {
//   const { models, selectedModel, selectModel } = useProperty()

//   const handleModelClick = (model) => {
//     selectModel(model)
//   }

//   return (
//     <Paper 
//       elevation={2} 
//       sx={{ 
//         p: 3, 
//         bgcolor: '#fff', 
//         color: '#000',
//         borderRadius: 2,
//         border: '1px solid #e0e0e0'
//       }}
//     >
//       <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
//         <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#333' }}>
//           02 MODEL SELECTION
//         </Typography>
//         <Typography variant="caption" sx={{ color: '#4a7c59', fontWeight: 'bold' }}>
//           {models.length} OPTIONS
//         </Typography>
//       </Box>

//       <Box 
//         sx={{ 
//           display: 'flex', 
//           gap: { xs: 2, sm: 3 },
//           overflowX: 'auto', 
//           pb: 2,
//           pt: 2,
//           scrollbarWidth: 'thin',
//           '&::-webkit-scrollbar': { height: 6 },
//           '&::-webkit-scrollbar-thumb': { bgcolor: '#ddd', borderRadius: 3 }
//         }}
//       >
//         {models.map((model) => (
//           <Card
//             key={model._id}
//             onClick={() => handleModelClick(model)}
//             sx={{
//               minWidth: { xs: 220, sm: 260, md: 300 },
//               maxWidth: { xs: 260, sm: 280, md: 320 },
//               flexShrink: 0,
//               cursor: 'pointer',
//               bgcolor: selectedModel?._id === model._id ? '#e8f5e9' : '#fff',
//               border: selectedModel?._id === model._id ? '2px solid #4a7c59' : '1px solid #e0e0e0',
//               borderRadius: { xs: 2, sm: 3 },
//               transition: 'all 0.3s ease',
//               position: 'relative',
//               '&:hover': {
//                 transform: 'translateY(-4px)',
//                 boxShadow: '0 8px 24px rgba(0,0,0,0.1)'
//               }
//             }}
//           >
//             {selectedModel?._id === model._id && (
//               <Chip
//                 label="SELECTED"
//                 size="small"
//                 color="success"
//                 icon={<CheckCircleIcon />}
//                 sx={{
//                   position: 'absolute',
//                   top: { xs: 8, sm: 12 },
//                   right: { xs: 8, sm: 12 },
//                   zIndex: 2,
//                   fontWeight: 'bold',
//                   fontSize: { xs: '0.7rem', sm: '0.8rem' },
//                   height: { xs: 22, sm: 26 }
//                 }}
//               />
//             )}

//             <CardMedia
//               component="img"
//               height="140"
//               image={model.image || `https://via.placeholder.com/400x300?text=Model+${model.modelNumber}`}
//               alt={`Model ${model.modelNumber}`}
//               sx={{ borderBottom: '1px solid #eee', objectFit: 'cover' }}
//             />
            
//             <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
//               <Box sx={{ 
//                 display: 'flex', 
//                 justifyContent: 'space-between', 
//                 alignItems: 'flex-start', 
//                 mb: 1,
//                 gap: 1
//               }}>
//                 <Box sx={{ flex: 1, minWidth: 0 }}>
//                   <Typography 
//                     variant="h6" 
//                     sx={{ 
//                       fontWeight: 'bold', 
//                       mb: 0.5,
//                       fontSize: { xs: '1rem', sm: '1.1rem', md: '1.25rem' },
//                       overflow: 'hidden',
//                       textOverflow: 'ellipsis',
//                       whiteSpace: 'nowrap'
//                     }}
//                   >
//                     {model.model || `Model ${model.modelNumber}`}
//                   </Typography>
//                   <Typography 
//                     variant="caption" 
//                     color="text.secondary"
//                     sx={{ 
//                       fontSize: { xs: '0.7rem', sm: '0.75rem' },
//                       display: 'block'
//                     }}
//                   >
//                     Starting at ${model.price?.toLocaleString()}
//                   </Typography>
//                 </Box>
//                 <Typography 
//                   variant="subtitle1" 
//                   sx={{ 
//                     color: '#4a7c59', 
//                     fontWeight: 'bold',
//                     fontSize: { xs: '0.9rem', sm: '1rem' },
//                     flexShrink: 0
//                   }}
//                 >
//                   ${(model.price / 1000).toFixed(0)}K
//                 </Typography>
//               </Box>

//               <Box sx={{ 
//                 display: 'flex', 
//                 gap: { xs: 1, sm: 1.5, md: 2 },
//                 mt: { xs: 1.5, sm: 2 },
//                 flexWrap: 'wrap'
//               }}>
//                 <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
//                   <HotelIcon sx={{ fontSize: { xs: 14, sm: 16 }, color: '#666' }} />
//                   <Typography variant="caption" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
//                     {model.bedrooms} Beds
//                   </Typography>
//                 </Box>
//                 <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
//                   <BathtubIcon sx={{ fontSize: { xs: 14, sm: 16 }, color: '#666' }} />
//                   <Typography variant="caption" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
//                     {model.bathrooms} Baths
//                   </Typography>
//                 </Box>
//                 <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
//                   <SquareFootIcon sx={{ fontSize: { xs: 14, sm: 16 }, color: '#666' }} />
//                   <Typography variant="caption" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
//                     {model.sqft.toLocaleString()} ft²
//                   </Typography>
//                 </Box>
//               </Box>
//             </CardContent>
//           </Card>
//         ))}
        
//         {/* Placeholder for "More" */}
//         <Box 
//           sx={{ 
//             minWidth: { xs: 80, sm: 100 },
//             display: 'flex', 
//             alignItems: 'center', 
//             justifyContent: 'center',
//             bgcolor: '#f9f9f9',
//             borderRadius: { xs: 2, sm: 3 },
//             border: '1px dashed #ddd'
//           }}
//         >
//           <IconButton 
//             sx={{ 
//               bgcolor: '#fff', 
//               boxShadow: 1,
//               width: { xs: 36, sm: 40 },
//               height: { xs: 36, sm: 40 }
//             }}
//           >
//             <ChevronRightIcon fontSize="small" />
//           </IconButton>
//         </Box>
//       </Box>
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
  IconButton
} from '@mui/material'
import { Home, Bed, Bathtub, SquareFoot, ChevronLeft, ChevronRight } from '@mui/icons-material'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import { useProperty } from '../../context/PropertyContext'
import api from '../../services/api'

const ModelSelector = () => {
  const { selectedModel, selectModel, selectedLot } = useProperty()
  const [models, setModels] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [imageIndices, setImageIndices] = useState({})
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
      
      // Inicializar índices de imágenes para cada modelo
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
      const scrollAmount = 320 // Ancho de la card + gap
      const newScrollLeft = scrollContainerRef.current.scrollLeft + (direction === 'left' ? -scrollAmount : scrollAmount)
      scrollContainerRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      })
    }
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
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="subtitle1" fontWeight="bold">
          02 MODEL SELECTION
        </Typography>
        <Typography variant="caption" color="success.main" fontWeight="bold">
          {models.length} OPTIONS
        </Typography>
      </Box>

      {/* Scroll Container */}
      <Box sx={{ position: 'relative', mx: -1 }}>
        <Box
          ref={scrollContainerRef}
          sx={{
            display: 'flex',
            gap: 2,
            overflowX: 'auto',
            px: 1,
            pb: 2,
            pt: 2,
            scrollbarWidth: 'none',
            '&::-webkit-scrollbar': {
              display: 'none'
            }
          }}
        >
          {models.map((model) => {
            const isSelected = selectedModel?._id === model._id
            const modelImages = model.images && model.images.length > 0 ? model.images : []
            const currentImageIndex = imageIndices[model._id] || 0
            const currentImage = modelImages[currentImageIndex]
            
            return (
              <Card
                key={model._id}
                onClick={() => handleSelectModel(model)}
                sx={{
                  minWidth: 300,
                  maxWidth: 300,
                  flexShrink: 0,
                  cursor: 'pointer',
                  bgcolor: isSelected ? '#e8f5e9' : '#fff',
                  border: isSelected ? '2px solid #4a7c59' : '1px solid #e0e0e0',
                  borderRadius: 2,
                  transition: 'all 0.2s',
                  position: 'relative',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 2
                  }
                }}
              >
                {/* Selected Icon Badge */}
                {isSelected && (
                  <CheckCircleIcon 
                    color="success" 
                    sx={{ 
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      bgcolor: '#fff',
                      borderRadius: '50%',
                      zIndex: 2
                    }} 
                  />
                )}

                {/* Model Image with Gallery Controls */}
                <Box
                  sx={{
                    width: '100%',
                    height: 180,
                    bgcolor: 'grey.200',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundImage: currentImage ? `url(${currentImage})` : 'none',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    position: 'relative',
                    filter: isSelected ? 'none' : 'grayscale(0.3)'
                  }}
                >
                  {!currentImage && <Home sx={{ fontSize: 60, color: 'grey.400' }} />}
                  
                  {/* Navigation arrows for multiple images */}
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
                          width: 32,
                          height: 32,
                          '&:hover': { bgcolor: 'rgba(255,255,255,1)' }
                        }}
                      >
                        <ChevronLeft fontSize="small" />
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
                          width: 32,
                          height: 32,
                          '&:hover': { bgcolor: 'rgba(255,255,255,1)' }
                        }}
                      >
                        <ChevronRight fontSize="small" />
                      </IconButton>
                    </>
                  )}
                  
                  {/* Image counter */}
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

                <CardContent sx={{ p: 2 }}>
                  <Box display="flex" justifyContent="space-between" alignItems="start" mb={1}>
                    <Typography variant="h6" fontWeight="bold" sx={{ flex: 1, minWidth: 0 }}>
                      {model.model}
                    </Typography>
                    <Typography variant="h6" sx={{ color: '#4a7c59', fontWeight: 'bold', ml: 1 }}>
                      ${(model.price / 1000).toFixed(0)}K
                    </Typography>
                  </Box>

                  <Typography variant="caption" color="text.secondary" display="block" mb={2}>
                    Model #{model.modelNumber}
                  </Typography>

                  <Box display="flex" gap={2} flexWrap="wrap">
                    <Box display="flex" alignItems="center" gap={0.5}>
                      <Bed fontSize="small" color="action" />
                      <Typography variant="body2">{model.bedrooms}</Typography>
                    </Box>
                    <Box display="flex" alignItems="center" gap={0.5}>
                      <Bathtub fontSize="small" color="action" />
                      <Typography variant="body2">{model.bathrooms}</Typography>
                    </Box>
                    <Box display="flex" alignItems="center" gap={0.5}>
                      <SquareFoot fontSize="small" color="action" />
                      <Typography variant="body2">{model.sqft?.toLocaleString()}</Typography>
                    </Box>
                  </Box>

                  {model.description && (
                    <Typography 
                      variant="caption" 
                      color="text.secondary" 
                      sx={{ 
                        mt: 1.5,
                        display: '-webkit-box',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        lineHeight: 1.4
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

        {/* Navigation Arrows */}
        {models.length > 3 && (
          <>
            <IconButton
              onClick={() => scrollModels('left')}
              sx={{
                position: 'absolute',
                left: -8,
                top: '50%',
                transform: 'translateY(-50%)',
                bgcolor: '#fff',
                boxShadow: 1,
                '&:hover': { bgcolor: 'grey.100' }
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
                boxShadow: 1,
                '&:hover': { bgcolor: 'grey.100' }
              }}
            >
              <ChevronRight />
            </IconButton>
          </>
        )}
      </Box>

      {models.length === 0 && (
        <Box py={4} textAlign="center">
          <Typography variant="body2" color="text.secondary">
            No models available
          </Typography>
        </Box>
      )}
    </Paper>
  )
}

export default ModelSelector