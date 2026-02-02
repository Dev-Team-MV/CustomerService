// import { useState, useEffect } from 'react'
// import { Container, Grid, Typography, Box, Paper, Card, CardContent, Button, IconButton,Avatar, Chip, Divider } from '@mui/material'
// import { motion } from 'framer-motion'
// import { KeyboardArrowLeft, KeyboardArrowRight, Bed, Bathtub, SquareFoot, Layers, Home } from '@mui/icons-material'
// import ModelCustomizationModal from '../components/property/ModelCustomizationModal'
// import api from '../services/api'
// import { ToggleButton, ToggleButtonGroup } from '@mui/material'

// // --- Componente hijo para cada card ---
// function ModelCard({ model, onSelect }) {
//   const images = [
//     ...(model.images?.exterior || []),
//     ...(model.images?.interior || [])
//   ]
//   const [imgIdx, setImgIdx] = useState(0)

//   return (
//     <motion.div whileHover={{ scale: 1.03 }}>
//       <Card
//         sx={{
//           borderRadius: 5,
//           boxShadow: '0 8px 32px rgba(74,124,89,0.10)',
//           cursor: 'pointer',
//           overflow: 'hidden',
//           transition: 'all 0.3s',
//           display: 'flex',
//           flexDirection: 'column',
//           minHeight: 420,
//           '&:hover': { boxShadow: '0 16px 48px rgba(74,124,89,0.18)' }
//         }}
//         onClick={() => onSelect(model)}
//       >
//         {/* Imagen superior con flechas */}
//         <Box sx={{ position: 'relative', width: '100%', height: 200, bgcolor: '#f4f7f6' }}>
//           <img
//             src={images[imgIdx] || '/no-image.png'}
//             alt={model.model}
//             style={{
//               width: '100%',
//               height: '100%',
//               objectFit: 'cover',
//               display: 'block'
//             }}
//           />
//           {images.length > 1 && (
//             <>
//               <IconButton
//                 size="small"
//                 onClick={e => { e.stopPropagation(); setImgIdx((imgIdx - 1 + images.length) % images.length); }}
//                 sx={{
//                   position: 'absolute',
//                   left: 8,
//                   top: '50%',
//                   transform: 'translateY(-50%)',
//                   bgcolor: 'rgba(255,255,255,0.85)',
//                   '&:hover': { bgcolor: 'white' }
//                 }}
//               >
//                 <KeyboardArrowLeft />
//               </IconButton>
//               <IconButton
//                 size="small"
//                 onClick={e => { e.stopPropagation(); setImgIdx((imgIdx + 1) % images.length); }}
//                 sx={{
//                   position: 'absolute',
//                   right: 8,
//                   top: '50%',
//                   transform: 'translateY(-50%)',
//                   bgcolor: 'rgba(255,255,255,0.85)',
//                   '&:hover': { bgcolor: 'white' }
//                 }}
//               >
//                 <KeyboardArrowRight />
//               </IconButton>
//               <Box
//                 sx={{
//                   position: 'absolute',
//                   left: 12,
//                   bottom: 12,
//                   bgcolor: 'rgba(0,0,0,0.6)',
//                   color: 'white',
//                   px: 1.5,
//                   py: 0.5,
//                   borderRadius: 2,
//                   fontSize: 13
//                 }}
//               >
//                 {imgIdx + 1}/{images.length}
//               </Box>
//             </>
//           )}
//         </Box>
//         {/* Info inferior mejorada */}
//         <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', p: 3 }}>
//           <Box>
//             <Box display="flex" alignItems="center" gap={2} mb={2}>
//               <Avatar
//                 sx={{
//                   width: 56,
//                   height: 56,
//                   background: 'linear-gradient(135deg, #4a7c59 0%, #8bc34a 100%)',
//                   boxShadow: '0 4px 16px rgba(74,124,89,0.15)'
//                 }}
//               >
//                 <Home sx={{ fontSize: 32, color: 'white' }} />
//               </Avatar>
//               <Box>
//                 <Typography variant="h6" fontWeight="bold" sx={{ color: '#2c3e50', mb: 0.5 }}>
//                   {model.model}
//                 </Typography>
//                 <Typography variant="caption" sx={{ color: '#6c757d', fontWeight: 500 }}>
//                   Model #{model.modelNumber}
//                 </Typography>
//               </Box>
//               <Chip
//                 label={model.status === 'sold' ? 'Sold' : 'Available'}
//                 color={model.status === 'sold' ? 'success' : 'primary'}
//                 sx={{ fontWeight: 700, ml: 'auto' }}
//               />
//             </Box>
//             <Grid container spacing={2} sx={{ mb: 2 }}>
//               <Grid item xs={4}>
//                 <Paper elevation={0} sx={{ p: 1.5, textAlign: 'center', bgcolor: '#f8f9fa', borderRadius: 2 }}>
//                   <Bed sx={{ color: '#4a7c59', fontSize: 22 }} />
//                   <Typography variant="h6" fontWeight="700" color="#2c3e50">
//                     {model.bedrooms}
//                   </Typography>
//                   <Typography variant="caption" sx={{ color: '#6c757d' }}>
//                     Beds
//                   </Typography>
//                 </Paper>
//               </Grid>
//               <Grid item xs={4}>
//                 <Paper elevation={0} sx={{ p: 1.5, textAlign: 'center', bgcolor: '#f8f9fa', borderRadius: 2 }}>
//                   <Bathtub sx={{ color: '#2196f3', fontSize: 22 }} />
//                   <Typography variant="h6" fontWeight="700" color="#2c3e50">
//                     {model.bathrooms}
//                   </Typography>
//                   <Typography variant="caption" sx={{ color: '#6c757d' }}>
//                     Baths
//                   </Typography>
//                 </Paper>
//               </Grid>
//               <Grid item xs={4}>
//                 <Paper elevation={0} sx={{ p: 1.5, textAlign: 'center', bgcolor: '#f8f9fa', borderRadius: 2 }}>
//                   <SquareFoot sx={{ color: '#ff9800', fontSize: 22 }} />
//                   <Typography variant="h6" fontWeight="700" color="#2c3e50">
//                     {model.sqft?.toLocaleString()}
//                   </Typography>
//                   <Typography variant="caption" sx={{ color: '#6c757d' }}>
//                     Sq Ft
//                   </Typography>
//                 </Paper>
//               </Grid>
//             </Grid>
//             <Divider sx={{ my: 2 }} />
//             <Box
//               sx={{
//                 p: 2,
//                 borderRadius: 3,
//                 background: 'linear-gradient(135deg, rgba(74, 124, 89, 0.08) 0%, rgba(139, 195, 74, 0.08) 100%)',
//                 border: '1px solid rgba(74, 124, 89, 0.15)',
//                 textAlign: 'center',
//                 mb: 2
//               }}
//             >
//               <Typography variant="caption" sx={{ color: '#6c757d', fontWeight: 600, display: 'block', mb: 0.5 }}>
//                 Property Value
//               </Typography>
//               <Typography
//                 variant="h5"
//                 fontWeight="800"
//                 sx={{
//                   color: '#4a7c59',
//                   letterSpacing: '-0.5px'
//                 }}
//               >
//                 {model.price ? `$${model.price.toLocaleString()}` : 'Consult'}
//               </Typography>
//             </Box>
//             <Typography variant="caption" color="text.secondary">
//               {model.description?.slice(0, 60)}
//             </Typography>
//           </Box>
//         </CardContent>
//       </Card>
//     </motion.div>
//   )
// }

// // --- Componente principal ---
// const ViewModels = () => {
//   const [models, setModels] = useState([])
//   const [loading, setLoading] = useState(true)
//   const [selectedModel, setSelectedModel] = useState(null)
//   const [openCustomization, setOpenCustomization] = useState(false)
//   const [carouselIndex, setCarouselIndex] = useState(0)
//   const [thumbStart, setThumbStart] = useState(0)
//   const [filter, setFilter] = useState('all')

//   useEffect(() => {
//     api.get('/models').then(res => {
//       setModels(res.data)
//       setLoading(false)
//     })
//   }, [])

//   // Reset carousel and thumbs when model changes
//   useEffect(() => {
//     setCarouselIndex(0)
//     setThumbStart(0)
//     setFilter('all')
//   }, [selectedModel])

//   // Sincroniza thumbStart si cambia el filtro o la cantidad de imágenes
//   useEffect(() => {
//     setThumbStart(0)
//     setCarouselIndex(0)
//   }, [filter])

//   // Si el carruselIndex sale del rango visible, ajusta el thumbStart
//   useEffect(() => {
//     if (carouselIndex < thumbStart) setThumbStart(carouselIndex)
//     else if (carouselIndex >= thumbStart + 8) setThumbStart(carouselIndex - 8 + 1)
//   }, [carouselIndex, thumbStart])

//   if (loading) return <Box p={6} textAlign="center"><Typography>Loading models...</Typography></Box>

//   // Main grid of model cards
//   if (!selectedModel) {
//     return (
//       <Container maxWidth="xl" sx={{ py: 4 }}>
//         <Typography variant="h4" fontWeight="bold" mb={4}>All Models</Typography>
//         <Grid container spacing={3}>
//           {models.map((model) => (
//             <Grid item xs={12} sm={6} md={4} key={model._id}>
//               <ModelCard model={model} onSelect={setSelectedModel} />
//             </Grid>
//           ))}
//         </Grid>
//       </Container>
//     )
//   }

//   // ...Resto del código para el detalle del modelo (sin cambios)...
//   // (Puedes dejar igual la parte del detalle/carrusel que ya tienes)

//   // Filtrado de imágenes
//   let images = []
//   if (filter === 'all') {
//     images = [
//       ...(selectedModel.images?.exterior || []),
//       ...(selectedModel.images?.interior || [])
//     ]
//   } else if (filter === 'exterior') {
//     images = selectedModel.images?.exterior || []
//   } else if (filter === 'interior') {
//     images = selectedModel.images?.interior || []
//   }
//   const hasImages = images.length > 0

//   // Mini-carrusel de miniaturas
//   const thumbsToShow = 8
//   const canThumbPrev = thumbStart > 0
//   const canThumbNext = thumbStart + thumbsToShow < images.length
//   const visibleThumbs = images.slice(thumbStart, thumbStart + thumbsToShow)

//   const handlePrev = () => setCarouselIndex(i => (i === 0 ? images.length - 1 : i - 1))
//   const handleNext = () => setCarouselIndex(i => (i === images.length - 1 ? 0 : i + 1))
//   const handleThumb = idx => setCarouselIndex(idx)

//   return (
//     <Container maxWidth="md" sx={{ py: 4 }}>
//       <Button onClick={() => setSelectedModel(null)} sx={{ mb: 3, color: '#4a7c59', fontWeight: 600, textTransform: 'none' }}>← Back to Models</Button>
//       <Paper sx={{ p: { xs: 2, md: 4 }, borderRadius: 4, mb: 4 }}>
//         {/* Filtros */}
//         <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center' }}>
//           <ToggleButtonGroup
//             value={filter}
//             exclusive
//             onChange={(_, v) => v && setFilter(v)}
//             size="small"
//             sx={{ bgcolor: '#f8f9fa', borderRadius: 2 }}
//           >
//             <ToggleButton value="all">All</ToggleButton>
//             <ToggleButton value="exterior">Exterior</ToggleButton>
//             <ToggleButton value="interior">Interior</ToggleButton>
//           </ToggleButtonGroup>
//         </Box>
//         {/* Carrusel */}
//         <Box sx={{ mb: 3 }}>
//           <Typography variant="h4" fontWeight="bold" mb={2}>{selectedModel.model}</Typography>
//           <Box sx={{ position: 'relative', bgcolor: '#000', borderRadius: 3, minHeight: 320, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
//             {hasImages ? (
//               <>
//                 <motion.img
//                   key={carouselIndex}
//                   src={images[carouselIndex]}
//                   alt={`model-img-${carouselIndex}`}
//                   initial={{ opacity: 0, scale: 0.97 }}
//                   animate={{ opacity: 1, scale: 1 }}
//                   exit={{ opacity: 0, scale: 0.97 }}
//                   transition={{ duration: 0.3 }}
//                   style={{
//                     maxWidth: '100%',
//                     maxHeight: 400,
//                     objectFit: 'contain',
//                     borderRadius: 8
//                   }}
//                 />
//                 {images.length > 1 && (
//                   <>
//                     <IconButton
//                       onClick={handlePrev}
//                       sx={{
//                         position: 'absolute',
//                         left: 12,
//                         top: '50%',
//                         transform: 'translateY(-50%)',
//                         bgcolor: 'rgba(255,255,255,0.95)',
//                         '&:hover': { bgcolor: 'white', transform: 'scale(1.1) translateY(-50%)' },
//                         boxShadow: 3,
//                         zIndex: 2
//                       }}
//                     >
//                       <KeyboardArrowLeft />
//                     </IconButton>
//                     <IconButton
//                       onClick={handleNext}
//                       sx={{
//                         position: 'absolute',
//                         right: 12,
//                         top: '50%',
//                         transform: 'translateY(-50%)',
//                         bgcolor: 'rgba(255,255,255,0.95)',
//                         '&:hover': { bgcolor: 'white', transform: 'scale(1.1) translateY(-50%)' },
//                         boxShadow: 3,
//                         zIndex: 2
//                       }}
//                     >
//                       <KeyboardArrowRight />
//                     </IconButton>
//                   </>
//                 )}
//                 {/* Miniaturas con flechas */}
//                 <Box sx={{ position: 'absolute', bottom: 12, left: 0, right: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1 }}>
//                   {canThumbPrev && (
//                     <IconButton size="small" onClick={() => setThumbStart(thumbStart - 1)}>
//                       <KeyboardArrowLeft style={{color:'white'}}  />
//                     </IconButton>
//                   )}
//                   {visibleThumbs.map((img, idx) => {
//                     const realIdx = thumbStart + idx
//                     return (
//                       <Box
//                         key={img}
//                         onClick={() => handleThumb(realIdx)}
//                         sx={{
//                           width: 48,
//                           height: 48,
//                           borderRadius: 2,
//                           border: realIdx === carouselIndex ? '2px solid #4a7c59' : '2px solid #fff',
//                           overflow: 'hidden',
//                           cursor: 'pointer',
//                           boxShadow: realIdx === carouselIndex ? 4 : 1,
//                           transition: 'all 0.2s'
//                         }}
//                       >
//                         <img src={img} alt={`thumb-${realIdx}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
//                       </Box>
//                     )
//                   })}
//                   {canThumbNext && (
//                     <IconButton size="small" onClick={() => setThumbStart(thumbStart + 1)}>
//                       <KeyboardArrowRight style={{color:'white'}} />
//                     </IconButton>
//                   )}
//                 </Box>
//               </>
//             ) : (
//               <Typography color="white" sx={{ p: 6 }}>No images available for this model</Typography>
//             )}
//           </Box>
//         </Box>

//         {/* Info principal */}
//         <Box sx={{ mb: 3 }}>
//           <Typography variant="body1" color="text.secondary" mb={2}>{selectedModel.description}</Typography>
//           <Grid container spacing={2} sx={{ mb: 2 }}>
//             <Grid item xs={6} sm={3}>
//               <Paper sx={{ p: 2, textAlign: 'center', borderRadius: 2, bgcolor: '#f8f9fa' }}>
//                 <Bed sx={{ color: '#4a7c59', fontSize: 32 }} />
//                 <Typography variant="h6" fontWeight="bold">{selectedModel.bedrooms}</Typography>
//                 <Typography variant="caption" color="text.secondary">Bedrooms</Typography>
//               </Paper>
//             </Grid>
//             <Grid item xs={6} sm={3}>
//               <Paper sx={{ p: 2, textAlign: 'center', borderRadius: 2, bgcolor: '#f8f9fa' }}>
//                 <Bathtub sx={{ color: '#2196f3', fontSize: 32 }} />
//                 <Typography variant="h6" fontWeight="bold">{selectedModel.bathrooms}</Typography>
//                 <Typography variant="caption" color="text.secondary">Bathrooms</Typography>
//               </Paper>
//             </Grid>
//             <Grid item xs={6} sm={3}>
//               <Paper sx={{ p: 2, textAlign: 'center', borderRadius: 2, bgcolor: '#f8f9fa' }}>
//                 <SquareFoot sx={{ color: '#ff9800', fontSize: 32 }} />
//                 <Typography variant="h6" fontWeight="bold">{selectedModel.sqft}</Typography>
//                 <Typography variant="caption" color="text.secondary">Sq Ft</Typography>
//               </Paper>
//             </Grid>
//             <Grid item xs={6} sm={3}>
//               <Paper sx={{ p: 2, textAlign: 'center', borderRadius: 2, bgcolor: '#f8f9fa' }}>
//                 <Layers sx={{ color: '#9c27b0', fontSize: 32 }} />
//                 <Typography variant="h6" fontWeight="bold">{selectedModel.stories || 1}</Typography>
//                 <Typography variant="caption" color="text.secondary">Stories</Typography>
//               </Paper>
//             </Grid>
//           </Grid>
//         </Box>

//         {/* Botón de customización */}
//         <Box sx={{ textAlign: 'center', mt: 4 }}>
//           <Button
//             variant="contained"
//             size="large"
//             sx={{
//               background: 'linear-gradient(135deg, #4a7c59 0%, #8bc34a 100%)',
//               color: 'white',
//               fontWeight: 700,
//               borderRadius: 3,
//               px: 5,
//               py: 2,
//               fontSize: '1.1rem',
//               boxShadow: '0 8px 20px rgba(74, 124, 89, 0.2)',
//               '&:hover': {
//                 background: 'linear-gradient(135deg, #3d664a 0%, #7ba843 100%)',
//                 boxShadow: '0 12px 28px rgba(74, 124, 89, 0.3)'
//               }
//             }}
//             onClick={() => setOpenCustomization(true)}
//           >
//             Customize & Compare This Model
//           </Button>
//         </Box>

//         <ModelCustomizationModal
//           open={openCustomization}
//           model={selectedModel}
//           onClose={() => setOpenCustomization(false)}
//           onConfirm={() => setOpenCustomization(false)}
//         />
//       </Paper>
//     </Container>
//   )
// }

// export default ViewModels


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
        <Box sx={{ position: 'relative', width: '100%', height: 200, bgcolor: '#f4f7f6' }}>
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
    <Container maxWidth="xl" sx={{ py: 4 }}>
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