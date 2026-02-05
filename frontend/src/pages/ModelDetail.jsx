// import { useState, useEffect, useRef } from 'react'
// import { useParams, useNavigate } from 'react-router-dom'
// import {
//   Box,
//   Typography,
//   IconButton,
//   Divider,
//   Grid,
//   Paper,
//   Chip,
//   Skeleton,
//   useTheme,
//   useMediaQuery
// } from '@mui/material'
// import {
//   ArrowBack,
//   ChevronLeft,
//   ChevronRight,
//   KingBed,
//   Bathtub,
//   SquareFoot,
//   AttachMoney,
//   Home,
//   Landscape,
//   Kitchen,
//   Garage,
//   Pool,
//   Deck
// } from '@mui/icons-material'
// import api from '../services/api'

// const ModelDetail = () => {
//   const { id } = useParams()
//   const navigate = useNavigate()
//   const theme = useTheme()
//   const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  
//   const [model, setModel] = useState(null)
//   const [loading, setLoading] = useState(true)
//   const [currentSlide, setCurrentSlide] = useState(0)
//   const [touchStart, setTouchStart] = useState(0)
//   const [touchEnd, setTouchEnd] = useState(0)
//   const sliderRef = useRef(null)

//   useEffect(() => {
//     fetchModel()
//   }, [id])

//   const fetchModel = async () => {
//     try {
//       const response = await api.get(`/models/${id}`)
//       setModel(response.data)
//     } catch (error) {
//       console.error('Error fetching model:', error)
//     } finally {
//       setLoading(false)
//     }
//   }

//   const facades = model?.facades?.filter(img => img && img.trim() !== '') || []
//   const hasFacades = facades.length > 0
//   const images = model?.images?.filter(img => img && img.url && img.url.trim() !== '') || []

//   const nextSlide = () => {
//     if (hasFacades) {
//       setCurrentSlide((prev) => (prev + 1) % facades.length)
//     }
//   }

//   const prevSlide = () => {
//     if (hasFacades) {
//       setCurrentSlide((prev) => (prev - 1 + facades.length) % facades.length)
//     }
//   }

//   const goToSlide = (index) => {
//     setCurrentSlide(index)
//   }

//   const handleTouchStart = (e) => {
//     setTouchStart(e.targetTouches[0].clientX)
//   }

//   const handleTouchMove = (e) => {
//     setTouchEnd(e.targetTouches[0].clientX)
//   }

//   const handleTouchEnd = () => {
//     if (touchStart - touchEnd > 75) {
//       nextSlide()
//     }
//     if (touchStart - touchEnd < -75) {
//       prevSlide()
//     }
//   }

//   const getIconForFeature = (title) => {
//     const lowerTitle = title?.toLowerCase() || ''
//     if (lowerTitle.includes('cocina') || lowerTitle.includes('kitchen')) return <Kitchen sx={{ fontSize: 40 }} />
//     if (lowerTitle.includes('garaje') || lowerTitle.includes('garage')) return <Garage sx={{ fontSize: 40 }} />
//     if (lowerTitle.includes('piscina') || lowerTitle.includes('pool')) return <Pool sx={{ fontSize: 40 }} />
//     if (lowerTitle.includes('terraza') || lowerTitle.includes('deck')) return <Deck sx={{ fontSize: 40 }} />
//     if (lowerTitle.includes('jardín') || lowerTitle.includes('garden')) return <Landscape sx={{ fontSize: 40 }} />
//     return <Home sx={{ fontSize: 40 }} />
//   }

//   if (loading) {
//     return (
//       <Box sx={{ maxWidth: 800, mx: 'auto', p: { xs: 0, md: 2 } }}>
//         <Skeleton variant="rectangular" height={400} />
//         <Box sx={{ p: 2 }}>
//           <Skeleton variant="text" height={40} width="60%" />
//           <Skeleton variant="text" height={30} width="40%" />
//         </Box>
//       </Box>
//     )
//   }

//   if (!model) {
//     return (
//       <Box sx={{ p: 4, textAlign: 'center' }}>
//         <Typography variant="h5">Modelo no encontrado</Typography>
//       </Box>
//     )
//   }

//   return (
//     <Box sx={{ 
//       maxWidth: 900, 
//       mx: 'auto', 
//       bgcolor: 'background.default',
//       minHeight: '100vh'
//     }}>
//       {/* Header */}
//       <Box sx={{ 
//         display: 'flex', 
//         alignItems: 'center', 
//         p: 2,
//         position: 'sticky',
//         top: 0,
//         bgcolor: 'background.paper',
//         zIndex: 10,
//         borderBottom: 1,
//         borderColor: 'divider'
//       }}>
//         <IconButton onClick={() => navigate('/models')} sx={{ mr: 2 }}>
//           <ArrowBack />
//         </IconButton>
//         <Typography variant="h6" fontWeight="600" noWrap sx={{ flex: 1 }}>
//           {model.model}
//         </Typography>
//         <Chip 
//           label={model.status} 
//           color={model.status === 'active' ? 'success' : 'default'}
//           size="small"
//         />
//       </Box>

//       {/* Image Slider */}
//       <Box
//         ref={sliderRef}
//         onTouchStart={handleTouchStart}
//         onTouchMove={handleTouchMove}
//         onTouchEnd={handleTouchEnd}
//         sx={{
//           position: 'relative',
//           width: '100%',
//           height: { xs: 300, sm: 400, md: 450 },
//           bgcolor: 'grey.100',
//           overflow: 'hidden'
//         }}
//       >
//         {hasFacades ? (
//           <>
//             <Box
//               sx={{
//                 display: 'flex',
//                 transition: 'transform 0.4s ease-in-out',
//                 transform: `translateX(-${currentSlide * 100}%)`,
//                 height: '100%'
//               }}
//             >
//               {facades.map((img, index) => (
//                 <Box
//                   key={index}
//                   sx={{
//                     minWidth: '100%',
//                     height: '100%',
//                     display: 'flex',
//                     alignItems: 'center',
//                     justifyContent: 'center',
//                     bgcolor: 'grey.100'
//                   }}
//                 >
//                   <Box
//                     component="img"
//                     src={img}
//                     alt={`${model.model} - Vista ${index + 1}`}
//                     sx={{
//                       maxWidth: '100%',
//                       maxHeight: '100%',
//                       objectFit: 'contain'
//                     }}
//                     onError={(e) => {
//                       e.target.style.display = 'none'
//                     }}
//                   />
//                 </Box>
//               ))}
//             </Box>

//             {/* Navigation Arrows - Desktop */}
//             {!isMobile && facades.length > 1 && (
//               <>
//                 <IconButton
//                   onClick={prevSlide}
//                   sx={{
//                     position: 'absolute',
//                     left: 8,
//                     top: '50%',
//                     transform: 'translateY(-50%)',
//                     bgcolor: 'rgba(255,255,255,0.9)',
//                     '&:hover': { bgcolor: 'white' }
//                   }}
//                 >
//                   <ChevronLeft />
//                 </IconButton>
//                 <IconButton
//                   onClick={nextSlide}
//                   sx={{
//                     position: 'absolute',
//                     right: 8,
//                     top: '50%',
//                     transform: 'translateY(-50%)',
//                     bgcolor: 'rgba(255,255,255,0.9)',
//                     '&:hover': { bgcolor: 'white' }
//                   }}
//                 >
//                   <ChevronRight />
//                 </IconButton>
//               </>
//             )}
//           </>
//         ) : (
//           <Box
//             sx={{
//               height: '100%',
//               display: 'flex',
//               alignItems: 'center',
//               justifyContent: 'center',
//               flexDirection: 'column',
//               color: 'grey.400'
//             }}
//           >
//             <Home sx={{ fontSize: 100 }} />
//             <Typography variant="body2" color="text.secondary">
//               Sin imágenes disponibles
//             </Typography>
//           </Box>
//         )}
//       </Box>

//       {/* Slide Indicators */}
//       {hasFacades && facades.length > 1 && (
//         <Box sx={{ 
//           display: 'flex', 
//           justifyContent: 'center', 
//           gap: 1, 
//           py: 2,
//           bgcolor: 'background.paper'
//         }}>
//           {facades.map((_, index) => (
//             <Box
//               key={index}
//               onClick={() => goToSlide(index)}
//               sx={{
//                 width: currentSlide === index ? 24 : 8,
//                 height: 8,
//                 borderRadius: 4,
//                 bgcolor: currentSlide === index ? 'text.primary' : 'grey.300',
//                 cursor: 'pointer',
//                 transition: 'all 0.3s ease'
//               }}
//             />
//           ))}
//         </Box>
//       )}

//       {/* Specifications */}
//       <Box sx={{ px: 2, py: 3, bgcolor: 'background.paper' }}>
//         <Typography variant="h4" fontWeight="bold" color="primary" gutterBottom>
//           ${model.price?.toLocaleString()}
//         </Typography>
//         <Typography variant="body2" color="text.secondary" gutterBottom>
//           Precio base
//         </Typography>

//         <Divider sx={{ my: 2 }} />

//         <Box sx={{ mb: 2 }}>
//           <Typography variant="h5" fontWeight="bold">
//             {model.sqft?.toLocaleString()} sqft
//           </Typography>
//           <Typography variant="body2" color="text.secondary">
//             Área total de construcción
//           </Typography>
//         </Box>

//         <Divider sx={{ my: 2 }} />

//         <Grid container spacing={2}>
//           <Grid item xs={6}>
//             <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
//               <KingBed color="action" />
//               <Box>
//                 <Typography variant="h6" fontWeight="bold">
//                   {model.bedrooms}
//                 </Typography>
//                 <Typography variant="caption" color="text.secondary">
//                   Habitaciones
//                 </Typography>
//               </Box>
//             </Box>
//           </Grid>
//           <Grid item xs={6}>
//             <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
//               <Bathtub color="action" />
//               <Box>
//                 <Typography variant="h6" fontWeight="bold">
//                   {model.bathrooms}
//                 </Typography>
//                 <Typography variant="caption" color="text.secondary">
//                   Baños
//                 </Typography>
//               </Box>
//             </Box>
//           </Grid>
//         </Grid>
//       </Box>

//       {/* Description */}
//       {model.description && (
//         <Box sx={{ px: 2, py: 3, bgcolor: 'background.paper', mt: 1 }}>
//           <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
//             Descripción
//           </Typography>
//           <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
//             {model.description}
//           </Typography>
//         </Box>
//       )}

//       {/* Features Grid */}
//       {images.length > 0 && (
//         <Box sx={{ px: 2, py: 3, bgcolor: 'background.paper', mt: 1 }}>
//           <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{ mb: 2 }}>
//             Características
//           </Typography>
//           <Grid container spacing={2}>
//             {images.map((feature, index) => (
//               <Grid item xs={6} key={index}>
//                 <Paper
//                   elevation={0}
//                   sx={{
//                     position: 'relative',
//                     height: { xs: 120, sm: 150 },
//                     borderRadius: 2,
//                     overflow: 'hidden',
//                     bgcolor: 'grey.900',
//                     display: 'flex',
//                     alignItems: 'flex-end',
//                     cursor: 'pointer',
//                     '&:hover': {
//                       '& .feature-overlay': {
//                         bgcolor: 'rgba(0,0,0,0.5)'
//                       }
//                     }
//                   }}
//                 >
//                   {feature.url ? (
//                     <Box
//                       component="img"
//                       src={feature.url}
//                       alt={feature.title || `Característica ${index + 1}`}
//                       sx={{
//                         position: 'absolute',
//                         width: '100%',
//                         height: '100%',
//                         objectFit: 'cover'
//                       }}
//                       onError={(e) => {
//                         e.target.style.display = 'none'
//                       }}
//                     />
//                   ) : (
//                     <Box
//                       sx={{
//                         position: 'absolute',
//                         width: '100%',
//                         height: '100%',
//                         display: 'flex',
//                         alignItems: 'center',
//                         justifyContent: 'center',
//                         color: 'grey.600'
//                       }}
//                     >
//                       {getIconForFeature(feature.title)}
//                     </Box>
//                   )}
//                   <Box
//                     className="feature-overlay"
//                     sx={{
//                       position: 'absolute',
//                       bottom: 0,
//                       left: 0,
//                       right: 0,
//                       p: 1.5,
//                       background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
//                       transition: 'background 0.3s'
//                     }}
//                   >
//                     <Typography
//                       variant="body2"
//                       fontWeight="600"
//                       sx={{ color: 'white' }}
//                     >
//                       {feature.title || `Característica ${index + 1}`}
//                     </Typography>
//                   </Box>
//                 </Paper>
//               </Grid>
//             ))}
//           </Grid>
//         </Box>
//       )}

//       {/* Model Number Footer */}
//       <Box sx={{ px: 2, py: 3, textAlign: 'center' }}>
//         <Typography variant="caption" color="text.secondary">
//           Modelo #{model.modelNumber} • Las imágenes son de referencia
//         </Typography>
//       </Box>
//     </Box>
//   )
// }

// export default ModelDetail




import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Box,
  Typography,
  IconButton,
  Divider,
  Grid,
  Paper,
  Chip,
  Skeleton,
  useTheme,
  useMediaQuery,
  Slide,
  Fade
} from '@mui/material'
import {
  ArrowBack,
  ChevronLeft,
  ChevronRight,
  KingBed,
  Bathtub,
  SquareFoot,
  AttachMoney,
  Home,
  Landscape,
  Kitchen,
  Garage,
  Pool,
  Deck,
} from '@mui/icons-material'

import api from '../services/api'
import ModelCustomizationPanel from '../components/ModelCustomizationPanel'
import TuneIcon from '@mui/icons-material/Tune'
import CloseIcon from '@mui/icons-material/Close'
const ModelDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  const [model, setModel] = useState(null)
  const [loading, setLoading] = useState(true)

    const [showCustomization, setShowCustomization] = useState(false)

  // Exterior (fachada) carousel
  const [exteriorSlide, setExteriorSlide] = useState(0)
  const [exteriorTouchStart, setExteriorTouchStart] = useState(0)
  const [exteriorTouchEnd, setExteriorTouchEnd] = useState(0)
  const exteriorRef = useRef(null)

  // Interior carousel
  const [interiorSlide, setInteriorSlide] = useState(0)
  const [interiorTouchStart, setInteriorTouchStart] = useState(0)
  const [interiorTouchEnd, setInteriorTouchEnd] = useState(0)
  const interiorRef = useRef(null)

  useEffect(() => {
    fetchModel()
    setExteriorSlide(0)
    setInteriorSlide(0)
  }, [id])

  const fetchModel = async () => {
    try {
      const response = await api.get(`/models/${id}`)
      console.log('modelo selected', response);
      
      setModel(response.data)
      // console.log('modelo', model);
      // console.log('modelo', model.images.exterior[0]);

      
    } catch (error) {
      console.error('Error fetching model:', error)
    } finally {
      setLoading(false)
    }
  }

  let exteriorImages = []
  let interiorImages = []
  
  if (model) {
    const extractImagesFromOptions = (options, type) =>
      Array.isArray(options)
        ? options.flatMap(opt =>
            Array.isArray(opt.images?.[type])
              ? opt.images[type]
                  .map(img => typeof img === 'string' ? { url: img } : img)
                  .filter(img => img && img.url && img.url.trim() !== '')
              : []
          )
        : []
  
    exteriorImages = Array.isArray(model.images?.exterior)
      ? model.images.exterior
          .map(img => typeof img === 'string' ? { url: img } : img)
          .filter(img => img && img.url && img.url.trim() !== '')
      : []
  
    interiorImages = Array.isArray(model.images?.interior)
      ? model.images.interior
          .map(img => typeof img === 'string' ? { url: img } : img)
          .filter(img => img && img.url && img.url.trim() !== '')
      : []
  
    if (exteriorImages.length === 0) {
      exteriorImages = [
        ...extractImagesFromOptions(model.upgrades, 'exterior'),
        ...extractImagesFromOptions(model.storages, 'exterior'),
        ...extractImagesFromOptions(model.balconies, 'exterior')
      ]
    }
    if (interiorImages.length === 0) {
      interiorImages = [
        ...extractImagesFromOptions(model.upgrades, 'interior'),
        ...extractImagesFromOptions(model.storages, 'interior'),
        ...extractImagesFromOptions(model.balconies, 'interior')
      ]
    }
  
    console.log('exteriorImages:', exteriorImages)
    console.log('interiorImages:', interiorImages)
  }
  // Carrusel exterior
  const nextExterior = () => {
    if (exteriorImages.length > 0) {
      setExteriorSlide((prev) => (prev + 1) % exteriorImages.length)
    }
  }
  const prevExterior = () => {
    if (exteriorImages.length > 0) {
      setExteriorSlide((prev) => (prev - 1 + exteriorImages.length) % exteriorImages.length)
    }
  }
  const goToExterior = (idx) => setExteriorSlide(idx)
  const handleExteriorTouchStart = (e) => setExteriorTouchStart(e.targetTouches[0].clientX)
  const handleExteriorTouchMove = (e) => setExteriorTouchEnd(e.targetTouches[0].clientX)
  const handleExteriorTouchEnd = () => {
    if (exteriorTouchStart - exteriorTouchEnd > 75) nextExterior()
    if (exteriorTouchStart - exteriorTouchEnd < -75) prevExterior()
  }

  // Carrusel interior
  const nextInterior = () => {
    if (interiorImages.length > 0) {
      setInteriorSlide((prev) => (prev + 1) % interiorImages.length)
    }
  }
  const prevInterior = () => {
    if (interiorImages.length > 0) {
      setInteriorSlide((prev) => (prev - 1 + interiorImages.length) % interiorImages.length)
    }
  }
  const goToInterior = (idx) => setInteriorSlide(idx)
  const handleInteriorTouchStart = (e) => setInteriorTouchStart(e.targetTouches[0].clientX)
  const handleInteriorTouchMove = (e) => setInteriorTouchEnd(e.targetTouches[0].clientX)
  const handleInteriorTouchEnd = () => {
    if (interiorTouchStart - interiorTouchEnd > 75) nextInterior()
    if (interiorTouchStart - interiorTouchEnd < -75) prevInterior()
  }

  // Características (features)
  const features =
    Array.isArray(model?.features) && model.features.length > 0
      ? model.features
      : []

  const getIconForFeature = (title) => {
    const lowerTitle = title?.toLowerCase() || ''
    if (lowerTitle.includes('cocina') || lowerTitle.includes('kitchen')) return <Kitchen sx={{ fontSize: 40 }} />
    if (lowerTitle.includes('garaje') || lowerTitle.includes('garage')) return <Garage sx={{ fontSize: 40 }} />
    if (lowerTitle.includes('piscina') || lowerTitle.includes('pool')) return <Pool sx={{ fontSize: 40 }} />
    if (lowerTitle.includes('terraza') || lowerTitle.includes('deck')) return <Deck sx={{ fontSize: 40 }} />
    if (lowerTitle.includes('jardín') || lowerTitle.includes('garden')) return <Landscape sx={{ fontSize: 40 }} />
    return <Home sx={{ fontSize: 40 }} />
  }

  if (loading) {
    return (
      <Box sx={{ maxWidth: 800, mx: 'auto', p: { xs: 0, md: 2 } }}>
        <Skeleton variant="rectangular" height={400} />
        <Box sx={{ p: 2 }}>
          <Skeleton variant="text" height={40} width="60%" />
          <Skeleton variant="text" height={30} width="40%" />
        </Box>
      </Box>
    )
  }

  if (!model) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h5">Modelo no encontrado</Typography>
      </Box>
    )
  }

  return (
<Box
  sx={{
    maxWidth: 900,
    mx: 'auto',
    // bgcolor: 'background.paper',
    minHeight: '100vh',
    borderRadius: { xs: 0, md: 4 },
    // boxShadow: { xs: 0, md: 4 },
    mt: { xs: 0, md: 4 },
    mb: 4,
    overflow: 'hidden'
  }}
>
      {/* Header */}
    <Paper
      elevation={2}
      sx={{
        display: 'flex',
        alignItems: 'center',
        p: 2,
        borderRadius: 3,
        position: 'sticky',
        top: 0,
        zIndex: 10,
        borderBottom: 1,
        borderColor: 'divider',
        bgcolor: 'background.paper',
      }}
    >
      <IconButton
        onClick={() => {
          if (window.history.length > 2) {
            navigate(-1)
          } else {
            navigate('/models')
          }
        }}
        sx={{ mr: 2 }}
      >
        <ArrowBack />
      </IconButton>
      <Typography variant="h6" fontWeight="600" noWrap sx={{ flex: 1 }}>
        {model.model}
      </Typography>
      <Chip
        label={model.status}
        color={model.status === 'active' ? 'success' : 'default'}
        size="small"
      />
    </Paper>

      {/* Carrusel Exterior */}
      <Box
        ref={exteriorRef}
        onTouchStart={handleExteriorTouchStart}
        onTouchMove={handleExteriorTouchMove}
        onTouchEnd={handleExteriorTouchEnd}
        sx={{
          position: 'relative',
          width: '100%',
          height: { xs: 300, sm: 400, md: 450 },
          bgcolor: 'grey.100',
          overflow: 'hidden',
          borderRadius: 3,
          mt: 0.5
        }}
      >
        {exteriorImages.length > 0 ? (
          <>
            <Box
              sx={{
                display: 'flex',
                transition: 'transform 0.4s ease-in-out',
                transform: `translateX(-${exteriorSlide * 100}%)`,
                height: '100%'
              }}
            >
              {exteriorImages.map((img, index) => (
                <Box
                  key={index}
                  sx={{
                    minWidth: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: 'grey.100'
                  }}
                >
                  <Box
                    component="img"
                    src={img.url}
                    alt={img.title || `${model.model} - Exterior ${index + 1}`}
                    sx={{
                      maxWidth: '100%',
                      maxHeight: '100%',
                      objectFit: 'contain'
                    }}
                    onError={(e) => {
                      e.target.style.display = 'none'
                    }}
                  />
                </Box>
              ))}
            </Box>
            {/* Navigation Arrows - Desktop */}
            {!isMobile && exteriorImages.length > 1 && (
              <>
                <IconButton
                  onClick={prevExterior}
                  sx={{
                    position: 'absolute',
                    left: 8,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    bgcolor: 'rgba(255,255,255,0.9)',
                    '&:hover': { bgcolor: 'white' }
                  }}
                >
                  <ChevronLeft />
                </IconButton>
                <IconButton
                  onClick={nextExterior}
                  sx={{
                    position: 'absolute',
                    right: 8,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    bgcolor: 'rgba(255,255,255,0.9)',
                    '&:hover': { bgcolor: 'white' }
                  }}
                >
                  <ChevronRight />
                </IconButton>
              </>
            )}
            {/* Slide Indicators */}
            {exteriorImages.length > 1 && (
              <Box sx={{
                display: 'flex',
                justifyContent: 'center',
                gap: 1,
                py: 2,
                bgcolor: 'background.paper'
              }}>
                {exteriorImages.map((_, index) => (
                  <Box
                    key={index}
                    onClick={() => goToExterior(index)}
                    sx={{
                      width: exteriorSlide === index ? 24 : 8,
                      height: 8,
                      borderRadius: 4,
                      bgcolor: exteriorSlide === index ? 'text.primary' : 'grey.300',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease'
                    }}
                  />
                ))}
              </Box>
            )}
          </>
        ) : (
          <Box
            sx={{
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              color: 'grey.400'
            }}
          >
            <Home sx={{ fontSize: 100 }} />
            <Typography variant="body2" color="text.secondary">
              Sin imágenes de fachada disponibles
            </Typography>
          </Box>
        )}
      </Box>

      {/* Carrusel Interior */}
      {interiorImages.length > 0 && (
        <Box
          ref={interiorRef}
          onTouchStart={handleInteriorTouchStart}
          onTouchMove={handleInteriorTouchMove}
          onTouchEnd={handleInteriorTouchEnd}
          sx={{
            position: 'relative',
            width: '100%',
            height: { xs: 220, sm: 300, md: 340 },
            bgcolor: 'grey.100',
            overflow: 'hidden',
            mt: 2,
            borderRadius: 3
          }}
        >
          {/* <Typography variant="subtitle1" fontWeight="bold" sx={{ p: 1, pb: 0 }}>
            Interior
          </Typography> */}
          <Box
            sx={{
              display: 'flex',
              transition: 'transform 0.4s ease-in-out',
              transform: `translateX(-${interiorSlide * 100}%)`,
              height: '100%'
            }}
          >
            {interiorImages.map((img, index) => (
              <Box
                key={index}
                sx={{
                  minWidth: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: 'grey.100'
                }}
              >
                <Box
                  component="img"
                  src={img.url}
                  alt={img.title || `${model.model} - Interior ${index + 1}`}
                  sx={{
                    maxWidth: '100%',
                    maxHeight: '100%',
                    objectFit: 'contain'
                  }}
                  onError={(e) => {
                    e.target.style.display = 'none'
                  }}
                />
              </Box>
            ))}
          </Box>
          {/* Navigation Arrows - Desktop */}
          {!isMobile && interiorImages.length > 1 && (
            <>
              <IconButton
                onClick={prevInterior}
                sx={{
                  position: 'absolute',
                  left: 8,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  bgcolor: 'rgba(255,255,255,0.9)',
                  '&:hover': { bgcolor: 'white' }
                }}
              >
                <ChevronLeft />
              </IconButton>
              <IconButton
                onClick={nextInterior}
                sx={{
                  position: 'absolute',
                  right: 8,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  bgcolor: 'rgba(255,255,255,0.9)',
                  '&:hover': { bgcolor: 'white' }
                }}
              >
                <ChevronRight />
              </IconButton>
            </>
          )}
          {/* Slide Indicators */}
          {interiorImages.length > 1 && (
            <Box sx={{
              display: 'flex',
              justifyContent: 'center',
              gap: 1,
              py: 2,
              bgcolor: 'background.paper'
            }}>
              {interiorImages.map((_, index) => (
                <Box
                  key={index}
                  onClick={() => goToInterior(index)}
                  sx={{
                    width: interiorSlide === index ? 24 : 8,
                    height: 8,
                    borderRadius: 4,
                    bgcolor: interiorSlide === index ? 'text.primary' : 'grey.300',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                />
              ))}
            </Box>
          )}
        </Box>
      )}

{/* Especificaciones */}
    <Paper
      elevation={1}
      sx={{
        mb: 3,
        borderRadius: 3,
        p: { xs: 2, md: 3 },
        bgcolor: 'background.paper'
      }}
    >
      <Typography variant="h4" fontWeight="bold" color="primary" gutterBottom>
        ${model.price?.toLocaleString()}
      </Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        Base price
      </Typography>
      <Divider sx={{ my: 2 }} />
      <Box sx={{ mb: 2 }}>
        <Typography variant="h5" fontWeight="bold">
          {model.sqft?.toLocaleString()} sqft
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Total construction area
        </Typography>
      </Box>
      <Divider sx={{ my: 2 }} />
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <KingBed color="action" />
            <Box>
              <Typography variant="h6" fontWeight="bold">
                {model.bedrooms}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Bedrooms
              </Typography>
            </Box>
          </Box>
        </Grid>
        <Grid item xs={6}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Bathtub color="action" />
            <Box>
              <Typography variant="h6" fontWeight="bold">
                {model.bathrooms}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Bathrooms
              </Typography>
            </Box>
          </Box>
        </Grid>
        <Grid item xs={6}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Bathtub color="action" />
            <Box>
              <Typography variant="h6" fontWeight="bold">
                {model.stories}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Stories
              </Typography>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Paper>

    {/* Descripción */}
    {model.description && (
      <Paper
        elevation={1}
        sx={{
          mb: 3,
          borderRadius: 3,
          p: { xs: 2, md: 3 },
          bgcolor: 'background.paper'
        }}
      >
        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
          Descripción
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
          {model.description}
        </Typography>
      </Paper>
    )}

    {/* Características */}
    {features.length > 0 && (
      <Paper
        elevation={1}
        sx={{
          mb: 3,
          borderRadius: 3,
          p: { xs: 2, md: 3 },
          bgcolor: 'background.paper'
        }}
      >
        <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{ mb: 2 }}>
          Características
        </Typography>
        <Grid container spacing={2}>
          {features.map((feature, index) => (
            <Grid item xs={6} key={index}>
              <Paper
                elevation={0}
                sx={{
                  position: 'relative',
                  height: { xs: 120, sm: 150 },
                  borderRadius: 2,
                  overflow: 'hidden',
                  bgcolor: 'grey.900',
                  display: 'flex',
                  alignItems: 'flex-end',
                  cursor: 'pointer',
                  '&:hover': {
                    '& .feature-overlay': {
                      bgcolor: 'rgba(0,0,0,0.5)'
                    }
                  }
                }}
              >
                {feature.url ? (
                  <Box
                    component="img"
                    src={feature.url}
                    alt={feature.title || `Característica ${index + 1}`}
                    sx={{
                      position: 'absolute',
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                    onError={(e) => {
                      e.target.style.display = 'none'
                    }}
                  />
                ) : (
                  <Box
                    sx={{
                      position: 'absolute',
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'grey.600'
                    }}
                  >
                    {getIconForFeature(feature.title)}
                  </Box>
                )}
                <Box
                  className="feature-overlay"
                  sx={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    p: 1.5,
                    background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
                    transition: 'background 0.3s'
                  }}
                >
                  <Typography
                    variant="body2"
                    fontWeight="600"
                    sx={{ color: 'white' }}
                  >
                    {feature.title || `Característica ${index + 1}`}
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Paper>
    )}

    {/* Footer */}
    <Box sx={{ px: 2, py: 3, textAlign: 'center', mb: 3 }}>
      <Typography variant="caption" color="text.secondary">
        Model #{model.modelNumber} • Images are for reference only
      </Typography>
    </Box>

    {/* Botón de personalización */}
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        mb: 3,
      }}
    >
      <IconButton
        color="primary"
        size="large"
        sx={{
          bgcolor: 'white',
          boxShadow: 2,
          '&:hover': { bgcolor: 'grey.100' }
        }}
        onClick={() => setShowCustomization((v) => !v)}
      >
        <TuneIcon fontSize="large" />
        <Typography sx={{ ml: 1, fontWeight: 600 }}>Personalizar y comparar</Typography>
      </IconButton>
    </Box>

    {/* Panel de personalización */}
    <Slide direction="left" in={showCustomization} mountOnEnter unmountOnExit>
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', pr: 2 }}>
          <IconButton onClick={() => setShowCustomization(false)}>
            <CloseIcon />
          </IconButton>
        </Box>
        <ModelCustomizationPanel model={model} />
      </Box>
    </Slide>
  </Box>
    
  )
}

export default ModelDetail