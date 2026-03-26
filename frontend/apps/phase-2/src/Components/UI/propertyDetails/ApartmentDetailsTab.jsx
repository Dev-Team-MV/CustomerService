// // @/Users/oficina/MV-CRM/CustomerService/frontend/apps/phase-2/src/Components/UI/propertyDetails/ApartmentDetailsTab.jsx

// import { useState, useEffect } from 'react'
// import {
//   Box, Paper, Typography, Chip, Alert, IconButton, Grid
// } from '@mui/material'
// import {
//   Home, Info, CheckCircle, ZoomIn, Image as ImageIcon,
//   Bed, Bathtub, SquareFoot, Apartment, LocationOn
// } from '@mui/icons-material'
// import { motion } from 'framer-motion'

// const ApartmentDetailsTab = ({ apartmentDetails }) => {
//   const [carouselIndex, setCarouselIndex] = useState(0)

//   // ✅ Usar selectedRenders del apartamento
//   const selectedRenders = apartmentDetails?.selectedRenders || []
//   const selectedRenderType = apartmentDetails?.selectedRenderType || 'basic'
//   const apartmentModel = apartmentDetails?.apartmentModel || {}
//   const building = apartmentModel?.building || {}

//   const handleThumbSelect = (idx) => setCarouselIndex(idx)

//   // Reset carousel index when images change
//   useEffect(() => {
//     setCarouselIndex(0)
//   }, [selectedRenders.length])

//   return (
//     <Paper
//       elevation={0}
//       sx={{
//         p: { xs: 2, sm: 3, md: 4 },
//         mt: 3,
//         borderRadius: 3,
//         bgcolor: 'white',
//         border: '1px solid #e0e0e0'
//       }}
//     >
//       {/* Header with render type chip */}
//       <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
//         <Box>
//           <Typography
//             variant="h5"
//             sx={{
//               fontFamily: '"Poppins", sans-serif',
//               color: '#333F1F',
//               fontWeight: 700,
//               fontSize: { xs: '1.25rem', sm: '1.5rem' },
//               mb: 0.5
//             }}
//           >
//             Apartment {apartmentDetails?.apartmentNumber || 'N/A'}
//           </Typography>
//           <Typography
//             variant="body2"
//             sx={{
//               fontFamily: '"Poppins", sans-serif',
//               color: '#706f6f',
//               fontSize: '0.9rem'
//             }}
//           >
//             {apartmentModel?.name || 'No Model'} • Floor {apartmentDetails?.floorNumber || 'N/A'}
//           </Typography>
//         </Box>

//         {/* ✅ Chip con tipo de render seleccionado */}
//         <Chip
//           icon={<Home sx={{ fontSize: 18 }} />}
//           label={selectedRenderType === 'basic' ? 'Basic Package' : 'Upgrade Package'}
//           sx={{
//             height: 36,
//             fontSize: '0.85rem',
//             fontWeight: 700,
//             fontFamily: '"Poppins", sans-serif',
//             bgcolor: selectedRenderType === 'basic' 
//               ? 'rgba(76,175,80,0.12)' 
//               : 'rgba(140,165,81,0.12)',
//             color: selectedRenderType === 'basic' ? '#4caf50' : '#8CA551',
//             border: `2px solid ${selectedRenderType === 'basic' ? '#4caf50' : '#8CA551'}`,
//             textTransform: 'uppercase',
//             letterSpacing: '0.5px'
//           }}
//         />
//       </Box>

//       {/* Gallery */}
//       <Box
//         sx={{
//           display: 'flex',
//           gap: { xs: 1.5, sm: 2 },
//           mb: 4,
//           height: { xs: 280, sm: 380, md: 460, lg: 520 },
//         }}
//       >
//         {/* Main image */}
//         <Box
//           sx={{
//             flex: 3,
//             bgcolor: '#000',
//             borderRadius: 3,
//             position: 'relative',
//             overflow: 'hidden',
//             minWidth: 0,
//             border: '2px solid #e0e0e0'
//           }}
//         >
//           {selectedRenders.length > 0 ? (
//             <motion.img
//               key={carouselIndex}
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               transition={{ duration: 0.3 }}
//               src={selectedRenders[carouselIndex]}
//               alt={`apartment-render-${carouselIndex}`}
//               style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
//             />
//           ) : (
//             <Box
//               display="flex"
//               flexDirection="column"
//               alignItems="center"
//               justifyContent="center"
//               height="100%"
//               px={2}
//             >
//               <Home sx={{ fontSize: { xs: 40, sm: 60 }, color: '#666', mb: 2 }} />
//               <Typography
//                 color="white"
//                 sx={{ fontFamily: '"Poppins", sans-serif', fontSize: { xs: '0.85rem', sm: '1rem' } }}
//               >
//                 No apartment renders available
//               </Typography>
//             </Box>
//           )}

//           {selectedRenders.length > 0 && (
//             <IconButton
//               sx={{
//                 position: 'absolute',
//                 top: { xs: 8, sm: 12 },
//                 right: { xs: 8, sm: 12 },
//                 bgcolor: 'rgba(255,255,255,0.95)',
//                 width: { xs: 32, sm: 38 },
//                 height: { xs: 32, sm: 38 },
//                 '&:hover': { bgcolor: 'white', transform: 'scale(1.1)' }
//               }}
//             >
//               <ZoomIn sx={{ fontSize: { xs: 18, sm: 22 } }} />
//             </IconButton>
//           )}

//           {/* Image counter */}
//           {selectedRenders.length > 1 && (
//             <Box
//               sx={{
//                 position: 'absolute',
//                 bottom: 12,
//                 left: 12,
//                 bgcolor: 'rgba(0,0,0,0.7)',
//                 color: 'white',
//                 px: 1.5,
//                 py: 0.5,
//                 borderRadius: 2,
//                 fontFamily: '"Poppins", sans-serif',
//                 fontSize: '0.75rem',
//                 fontWeight: 600
//               }}
//             >
//               {carouselIndex + 1} / {selectedRenders.length}
//             </Box>
//           )}
//         </Box>

//         {/* Thumbnails */}
//         <Box
//           sx={{
//             flex: 1,
//             display: 'flex',
//             flexDirection: 'column',
//             gap: { xs: 0.8, sm: 1 },
//             overflowY: 'auto',
//             minWidth: 0,
//             pr: 0.5,
//             '&::-webkit-scrollbar': { width: 4 },
//             '&::-webkit-scrollbar-track': { bgcolor: 'transparent' },
//             '&::-webkit-scrollbar-thumb': {
//               bgcolor: 'rgba(51, 63, 31, 0.2)',
//               borderRadius: 2,
//             },
//           }}
//         >
//           {selectedRenders.length === 0 ? (
//             <Box
//               display="flex"
//               flexDirection="column"
//               alignItems="center"
//               justifyContent="center"
//               height="100%"
//             >
//               <ImageIcon sx={{ fontSize: 32, color: '#ccc', mb: 1 }} />
//               <Typography
//                 variant="caption"
//                 color="text.secondary"
//                 sx={{ fontFamily: '"Poppins", sans-serif', fontSize: '0.7rem', textAlign: 'center' }}
//               >
//                 No images available
//               </Typography>
//             </Box>
//           ) : (
//             selectedRenders.map((url, i) => (
//               <motion.div
//                 key={`thumb-${i}`}
//                 whileHover={{ scale: 1.03 }}
//                 whileTap={{ scale: 0.97 }}
//                 style={{ flexShrink: 0 }}
//               >
//                 <Box
//                   onClick={() => handleThumbSelect(i)}
//                   sx={{
//                     width: '100%',
//                     aspectRatio: '16/9',
//                     borderRadius: 1.5,
//                     overflow: 'hidden',
//                     cursor: 'pointer',
//                     border: i === carouselIndex
//                       ? '2.5px solid #333F1F'
//                       : '1.5px solid rgba(0,0,0,0.08)',
//                     boxShadow: i === carouselIndex
//                       ? '0 4px 16px rgba(51, 63, 31, 0.3)'
//                       : 'none',
//                     transition: 'all 0.25s ease',
//                     position: 'relative',
//                     '&:hover': {
//                       boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
//                       borderColor: i === carouselIndex ? '#333F1F' : '#8CA551',
//                     }
//                   }}
//                 >
//                   <img
//                     src={url}
//                     alt={`thumb-${i}`}
//                     loading="lazy"
//                     style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
//                   />
//                   {i === carouselIndex && (
//                     <Box
//                       sx={{
//                         position: 'absolute',
//                         top: 4,
//                         right: 4,
//                         bgcolor: '#333F1F',
//                         borderRadius: '50%',
//                         width: 18,
//                         height: 18,
//                         display: 'flex',
//                         alignItems: 'center',
//                         justifyContent: 'center',
//                         boxShadow: '0 2px 8px rgba(51, 63, 31, 0.4)'
//                       }}
//                     >
//                       <CheckCircle sx={{ fontSize: 12, color: 'white' }} />
//                     </Box>
//                   )}
//                 </Box>
//               </motion.div>
//             ))
//           )}
//         </Box>
//       </Box>

//       {/* ✅ Apartment Model Specifications */}
//       <Box sx={{ mt: 4 }}>
//         <Box mb={3}>
//           <Box display="flex" alignItems="center" gap={2} mb={1.5} flexWrap="wrap">
//             <Typography
//               variant="h6"
//               sx={{
//                 fontFamily: '"Poppins", sans-serif',
//                 color: '#333F1F',
//                 fontWeight: 700,
//                 fontSize: { xs: '1.1rem', sm: '1.25rem' },
//                 letterSpacing: '0.5px',
//               }}
//             >
//               Apartment Specifications
//             </Typography>
//           </Box>
//           <Box sx={{ width: 60, height: 3, bgcolor: '#8CA551', borderRadius: 1 }} />
//         </Box>

//         {/* ✅ Specs Grid */}
//         <Grid container spacing={3}>
//           {/* Model Info */}
//           <Grid item xs={12} sm={6} md={3}>
//             <motion.div
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ delay: 0.1 }}
//             >
//               <Paper
//                 elevation={0}
//                 sx={{
//                   p: 2.5,
//                   borderRadius: 2,
//                   border: '1px solid #e0e0e0',
//                   bgcolor: '#fafafa',
//                   height: '100%'
//                 }}
//               >
//                 <Box display="flex" alignItems="center" gap={1.5} mb={1}>
//                   <Box
//                     sx={{
//                       width: 40,
//                       height: 40,
//                       borderRadius: 2,
//                       bgcolor: 'rgba(140,165,81,0.12)',
//                       display: 'flex',
//                       alignItems: 'center',
//                       justifyContent: 'center'
//                     }}
//                   >
//                     <Apartment sx={{ color: '#8CA551', fontSize: 22 }} />
//                   </Box>
//                   <Typography
//                     variant="caption"
//                     sx={{
//                       fontFamily: '"Poppins", sans-serif',
//                       color: '#706f6f',
//                       fontSize: '0.75rem',
//                       fontWeight: 600,
//                       textTransform: 'uppercase',
//                       letterSpacing: '0.5px'
//                     }}
//                   >
//                     Model
//                   </Typography>
//                 </Box>
//                 <Typography
//                   sx={{
//                     fontFamily: '"Poppins", sans-serif',
//                     color: '#333F1F',
//                     fontSize: '1.1rem',
//                     fontWeight: 700
//                   }}
//                 >
//                   {apartmentModel?.name || 'N/A'}
//                 </Typography>
//                 <Typography
//                   variant="caption"
//                   sx={{
//                     fontFamily: '"Poppins", sans-serif',
//                     color: '#706f6f',
//                     fontSize: '0.7rem'
//                   }}
//                 >
//                   Model #{apartmentModel?.modelNumber || 'N/A'}
//                 </Typography>
//               </Paper>
//             </motion.div>
//           </Grid>

//           {/* Bedrooms */}
//           <Grid item xs={12} sm={6} md={3}>
//             <motion.div
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ delay: 0.2 }}
//             >
//               <Paper
//                 elevation={0}
//                 sx={{
//                   p: 2.5,
//                   borderRadius: 2,
//                   border: '1px solid #e0e0e0',
//                   bgcolor: '#fafafa',
//                   height: '100%'
//                 }}
//               >
//                 <Box display="flex" alignItems="center" gap={1.5} mb={1}>
//                   <Box
//                     sx={{
//                       width: 40,
//                       height: 40,
//                       borderRadius: 2,
//                       bgcolor: 'rgba(76,175,80,0.12)',
//                       display: 'flex',
//                       alignItems: 'center',
//                       justifyContent: 'center'
//                     }}
//                   >
//                     <Bed sx={{ color: '#4caf50', fontSize: 22 }} />
//                   </Box>
//                   <Typography
//                     variant="caption"
//                     sx={{
//                       fontFamily: '"Poppins", sans-serif',
//                       color: '#706f6f',
//                       fontSize: '0.75rem',
//                       fontWeight: 600,
//                       textTransform: 'uppercase',
//                       letterSpacing: '0.5px'
//                     }}
//                   >
//                     Bedrooms
//                   </Typography>
//                 </Box>
//                 <Typography
//                   sx={{
//                     fontFamily: '"Poppins", sans-serif',
//                     color: '#333F1F',
//                     fontSize: '1.8rem',
//                     fontWeight: 700
//                   }}
//                 >
//                   {apartmentModel?.bedrooms || 0}
//                 </Typography>
//               </Paper>
//             </motion.div>
//           </Grid>

//           {/* Bathrooms */}
//           <Grid item xs={12} sm={6} md={3}>
//             <motion.div
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ delay: 0.3 }}
//             >
//               <Paper
//                 elevation={0}
//                 sx={{
//                   p: 2.5,
//                   borderRadius: 2,
//                   border: '1px solid #e0e0e0',
//                   bgcolor: '#fafafa',
//                   height: '100%'
//                 }}
//               >
//                 <Box display="flex" alignItems="center" gap={1.5} mb={1}>
//                   <Box
//                     sx={{
//                       width: 40,
//                       height: 40,
//                       borderRadius: 2,
//                       bgcolor: 'rgba(33,150,243,0.12)',
//                       display: 'flex',
//                       alignItems: 'center',
//                       justifyContent: 'center'
//                     }}
//                   >
//                     <Bathtub sx={{ color: '#2196f3', fontSize: 22 }} />
//                   </Box>
//                   <Typography
//                     variant="caption"
//                     sx={{
//                       fontFamily: '"Poppins", sans-serif',
//                       color: '#706f6f',
//                       fontSize: '0.75rem',
//                       fontWeight: 600,
//                       textTransform: 'uppercase',
//                       letterSpacing: '0.5px'
//                     }}
//                   >
//                     Bathrooms
//                   </Typography>
//                 </Box>
//                 <Typography
//                   sx={{
//                     fontFamily: '"Poppins", sans-serif',
//                     color: '#333F1F',
//                     fontSize: '1.8rem',
//                     fontWeight: 700
//                   }}
//                 >
//                   {apartmentModel?.bathrooms || 0}
//                 </Typography>
//               </Paper>
//             </motion.div>
//           </Grid>

//           {/* Square Feet */}
//           <Grid item xs={12} sm={6} md={3}>
//             <motion.div
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ delay: 0.4 }}
//             >
//               <Paper
//                 elevation={0}
//                 sx={{
//                   p: 2.5,
//                   borderRadius: 2,
//                   border: '1px solid #e0e0e0',
//                   bgcolor: '#fafafa',
//                   height: '100%'
//                 }}
//               >
//                 <Box display="flex" alignItems="center" gap={1.5} mb={1}>
//                   <Box
//                     sx={{
//                       width: 40,
//                       height: 40,
//                       borderRadius: 2,
//                       bgcolor: 'rgba(255,152,0,0.12)',
//                       display: 'flex',
//                       alignItems: 'center',
//                       justifyContent: 'center'
//                     }}
//                   >
//                     <SquareFoot sx={{ color: '#ff9800', fontSize: 22 }} />
//                   </Box>
//                   <Typography
//                     variant="caption"
//                     sx={{
//                       fontFamily: '"Poppins", sans-serif',
//                       color: '#706f6f',
//                       fontSize: '0.75rem',
//                       fontWeight: 600,
//                       textTransform: 'uppercase',
//                       letterSpacing: '0.5px'
//                     }}
//                   >
//                     Area
//                   </Typography>
//                 </Box>
//                 <Typography
//                   sx={{
//                     fontFamily: '"Poppins", sans-serif',
//                     color: '#333F1F',
//                     fontSize: '1.5rem',
//                     fontWeight: 700
//                   }}
//                 >
//                   {apartmentModel?.sqft || 0}
//                 </Typography>
//                 <Typography
//                   variant="caption"
//                   sx={{
//                     fontFamily: '"Poppins", sans-serif',
//                     color: '#706f6f',
//                     fontSize: '0.7rem'
//                   }}
//                 >
//                   sq ft
//                 </Typography>
//               </Paper>
//             </motion.div>
//           </Grid>
//         </Grid>

//         {/* ✅ Building & Location Info */}
//         <Box sx={{ mt: 3 }}>
//           <Paper
//             elevation={0}
//             sx={{
//               p: 2.5,
//               borderRadius: 2,
//               border: '1px solid #e0e0e0',
//               bgcolor: '#fafafa'
//             }}
//           >
//             <Box display="flex" alignItems="center" gap={1.5} mb={2}>
//               <LocationOn sx={{ color: '#8CA551', fontSize: 22 }} />
//               <Typography
//                 variant="subtitle2"
//                 sx={{
//                   fontFamily: '"Poppins", sans-serif',
//                   color: '#333F1F',
//                   fontWeight: 700,
//                   fontSize: '0.95rem'
//                 }}
//               >
//                 Location Details
//               </Typography>
//             </Box>
//             <Grid container spacing={2}>
//               <Grid item xs={12} sm={4}>
//                 <Typography
//                   variant="caption"
//                   sx={{
//                     fontFamily: '"Poppins", sans-serif',
//                     color: '#706f6f',
//                     fontSize: '0.7rem',
//                     display: 'block',
//                     mb: 0.5
//                   }}
//                 >
//                   Building
//                 </Typography>
//                 <Typography
//                   sx={{
//                     fontFamily: '"Poppins", sans-serif',
//                     color: '#333F1F',
//                     fontSize: '0.9rem',
//                     fontWeight: 600
//                   }}
//                 >
//                   {building?.name || 'N/A'}
//                 </Typography>
//               </Grid>
//               <Grid item xs={12} sm={4}>
//                 <Typography
//                   variant="caption"
//                   sx={{
//                     fontFamily: '"Poppins", sans-serif',
//                     color: '#706f6f',
//                     fontSize: '0.7rem',
//                     display: 'block',
//                     mb: 0.5
//                   }}
//                 >
//                   Section
//                 </Typography>
//                 <Typography
//                   sx={{
//                     fontFamily: '"Poppins", sans-serif',
//                     color: '#333F1F',
//                     fontSize: '0.9rem',
//                     fontWeight: 600
//                   }}
//                 >
//                   {building?.section || 'N/A'}
//                 </Typography>
//               </Grid>
//               <Grid item xs={12} sm={4}>
//                 <Typography
//                   variant="caption"
//                   sx={{
//                     fontFamily: '"Poppins", sans-serif',
//                     color: '#706f6f',
//                     fontSize: '0.7rem',
//                     display: 'block',
//                     mb: 0.5
//                   }}
//                 >
//                   Total Floors
//                 </Typography>
//                 <Typography
//                   sx={{
//                     fontFamily: '"Poppins", sans-serif',
//                     color: '#333F1F',
//                     fontSize: '0.9rem',
//                     fontWeight: 600
//                   }}
//                 >
//                   {building?.floors || 'N/A'}
//                 </Typography>
//               </Grid>
//             </Grid>
//           </Paper>
//         </Box>
//       </Box>
//     </Paper>
//   )
// }

// export default ApartmentDetailsTab

// @/Users/oficina/MV-CRM/CustomerService/frontend/apps/phase-2/src/Components/UI/propertyDetails/ApartmentDetailsTab.jsx

import { useState, useEffect } from 'react'
import {
  Box, Paper, Typography, Chip, IconButton, Grid
} from '@mui/material'
import {
  Home, CheckCircle, ZoomIn, Image as ImageIcon,
  Bed, Bathtub, SquareFoot, Apartment, LocationOn, Map
} from '@mui/icons-material'
import { motion } from 'framer-motion'
import { useTheme } from '@mui/material/styles'
import PolygonImagePreview from '../PolygonImagePreview'
import buildingService from '../../../Services/buildingService'

const ApartmentDetailsTab = ({ apartmentDetails }) => {
  const theme = useTheme()
  const [carouselIndex, setCarouselIndex] = useState(0)
  const [buildingData, setBuildingData] = useState(null)
  const [loadingBuilding, setLoadingBuilding] = useState(false)

  // ✅ Usar selectedRenders del apartamento
  const selectedRenders = apartmentDetails?.selectedRenders || []
  const selectedRenderType = apartmentDetails?.selectedRenderType || 'basic'
  const apartmentModel = apartmentDetails?.apartmentModel || {}
  const building = apartmentModel?.building || {}
  const floorPlanPolygonId = apartmentDetails?.floorPlanPolygonId
  const floorNumber = apartmentDetails?.floorNumber
  const buildingId = building?._id

  // ✅ Fetch building data con floorPlans
  useEffect(() => {
    const fetchBuildingData = async () => {
      if (!buildingId) return
      
      setLoadingBuilding(true)
      try {
        const data = await buildingService.getById(buildingId)
        console.log('🏢 Building data:', data)
        console.log('📋 FloorPlans:', data?.floorPlans)
        console.log('📋 FloorPlans type:', typeof data?.floorPlans)
        console.log('📋 Is array?:', Array.isArray(data?.floorPlans))
        setBuildingData(data)
      } catch (error) {
        console.error('Error fetching building data:', error)
      } finally {
        setLoadingBuilding(false)
      }
    }

    fetchBuildingData()
  }, [buildingId])

  // ✅ Obtener floor plan del edificio - con validación de array
const floorPlansArray = Array.isArray(buildingData?.floorPlans?.data) 
  ? buildingData.floorPlans.data 
  : []
const floorPlan = floorPlansArray.find(fp => fp.floorNumber === floorNumber)
  const handleThumbSelect = (idx) => setCarouselIndex(idx)

  // Reset carousel index when images change
  useEffect(() => {
    setCarouselIndex(0)
  }, [selectedRenders.length])

  // ✅ Preparar polígono del apartamento para visualización
  const apartmentPolygon = floorPlan?.polygons?.find(poly => poly.id === floorPlanPolygonId)
  
  console.log('🔍 Debug polygon search:')
  console.log('  - floorNumber:', floorNumber)
  console.log('  - floorPlan:', floorPlan)
  console.log('  - floorPlanPolygonId:', floorPlanPolygonId)
  console.log('  - apartmentPolygon:', apartmentPolygon)
  
  const previewPolygons = apartmentPolygon ? [{
    ...apartmentPolygon,
    points: apartmentPolygon.points,
    fill: (apartmentPolygon.color || theme.palette.success.main) + 'BB',
    stroke: theme.palette.primary.main,
    strokeWidth: 3,
    isAvailable: true,
    isSel: true
  }] : []

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2, sm: 3, md: 4 },
        mt: 3,
        borderRadius: 3,
        bgcolor: 'white',
        border: `1px solid ${theme.palette.cardBorder}`
      }}
    >
      {/* Header with render type chip */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography
            variant="h5"
            sx={{
              fontFamily: '"Poppins", sans-serif',
              color: theme.palette.primary.main,
              fontWeight: 700,
              fontSize: { xs: '1.25rem', sm: '1.5rem' },
              mb: 0.5
            }}
          >
            Apartment {apartmentDetails?.apartmentNumber || 'N/A'}
          </Typography>
          <Typography
            variant="body2"
            sx={{
              fontFamily: '"Poppins", sans-serif',
              color: theme.palette.text.secondary,
              fontSize: '0.9rem'
            }}
          >
            {apartmentModel?.name || 'No Model'} • Floor {apartmentDetails?.floorNumber || 'N/A'}
          </Typography>
        </Box>

        {/* ✅ Chip con tipo de render seleccionado usando theme */}
        <Chip
          icon={<Home sx={{ fontSize: 18 }} />}
          label={selectedRenderType === 'basic' ? 'Basic Package' : 'Upgrade Package'}
          sx={{
            height: 36,
            fontSize: '0.85rem',
            fontWeight: 700,
            fontFamily: '"Poppins", sans-serif',
            bgcolor: selectedRenderType === 'basic' 
              ? 'rgba(67,160,71,0.12)' 
              : theme.palette.chipAdmin.bg,
            color: selectedRenderType === 'basic' ? theme.palette.success.main : theme.palette.chipAdmin.color,
            border: `2px solid ${selectedRenderType === 'basic' ? theme.palette.success.main : theme.palette.chipAdmin.color}`,
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}
        />
      </Box>

      {/* Gallery */}
      <Box
        sx={{
          display: 'flex',
          gap: { xs: 1.5, sm: 2 },
          mb: 4,
          height: { xs: 280, sm: 380, md: 460, lg: 520 },
        }}
      >
        {/* Main image */}
        <Box
          sx={{
            flex: 3,
            bgcolor: '#000',
            borderRadius: 3,
            position: 'relative',
            overflow: 'hidden',
            minWidth: 0,
            border: `2px solid ${theme.palette.cardBorder}`
          }}
        >
          {selectedRenders.length > 0 ? (
            <motion.img
              key={carouselIndex}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              src={selectedRenders[carouselIndex]}
              alt={`apartment-render-${carouselIndex}`}
              style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
            />
          ) : (
            <Box
              display="flex"
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
              height="100%"
              px={2}
            >
              <Home sx={{ fontSize: { xs: 40, sm: 60 }, color: '#666', mb: 2 }} />
              <Typography
                color="white"
                sx={{ fontFamily: '"Poppins", sans-serif', fontSize: { xs: '0.85rem', sm: '1rem' } }}
              >
                No apartment renders available
              </Typography>
            </Box>
          )}

          {selectedRenders.length > 0 && (
            <IconButton
              sx={{
                position: 'absolute',
                top: { xs: 8, sm: 12 },
                right: { xs: 8, sm: 12 },
                bgcolor: 'rgba(255,255,255,0.95)',
                width: { xs: 32, sm: 38 },
                height: { xs: 32, sm: 38 },
                '&:hover': { bgcolor: 'white', transform: 'scale(1.1)' }
              }}
            >
              <ZoomIn sx={{ fontSize: { xs: 18, sm: 22 } }} />
            </IconButton>
          )}

          {/* Image counter */}
          {selectedRenders.length > 1 && (
            <Box
              sx={{
                position: 'absolute',
                bottom: 12,
                left: 12,
                bgcolor: 'rgba(0,0,0,0.7)',
                color: 'white',
                px: 1.5,
                py: 0.5,
                borderRadius: 2,
                fontFamily: '"Poppins", sans-serif',
                fontSize: '0.75rem',
                fontWeight: 600
              }}
            >
              {carouselIndex + 1} / {selectedRenders.length}
            </Box>
          )}
        </Box>

        {/* Thumbnails */}
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: { xs: 0.8, sm: 1 },
            overflowY: 'auto',
            minWidth: 0,
            pr: 0.5,
            '&::-webkit-scrollbar': { width: 4 },
            '&::-webkit-scrollbar-track': { bgcolor: 'transparent' },
            '&::-webkit-scrollbar-thumb': {
              bgcolor: theme.palette.primary.main + '33',
              borderRadius: 2,
            },
          }}
        >
          {selectedRenders.length === 0 ? (
            <Box
              display="flex"
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
              height="100%"
            >
              <ImageIcon sx={{ fontSize: 32, color: '#ccc', mb: 1 }} />
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ fontFamily: '"Poppins", sans-serif', fontSize: '0.7rem', textAlign: 'center' }}
              >
                No images available
              </Typography>
            </Box>
          ) : (
            selectedRenders.map((url, i) => (
              <motion.div
                key={`thumb-${i}`}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                style={{ flexShrink: 0 }}
              >
                <Box
                  onClick={() => handleThumbSelect(i)}
                  sx={{
                    width: '100%',
                    aspectRatio: '16/9',
                    borderRadius: 1.5,
                    overflow: 'hidden',
                    cursor: 'pointer',
                    border: i === carouselIndex
                      ? `2.5px solid ${theme.palette.primary.main}`
                      : `1.5px solid ${theme.palette.cardBorder}`,
                    boxShadow: i === carouselIndex
                      ? `0 4px 16px ${theme.palette.primary.main}4D`
                      : 'none',
                    transition: 'all 0.25s ease',
                    position: 'relative',
                    '&:hover': {
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                      borderColor: i === carouselIndex ? theme.palette.primary.main : theme.palette.secondary.main,
                    }
                  }}
                >
                  <img
                    src={url}
                    alt={`thumb-${i}`}
                    loading="lazy"
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  />
                  {i === carouselIndex && (
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 4,
                        right: 4,
                        bgcolor: theme.palette.primary.main,
                        borderRadius: '50%',
                        width: 18,
                        height: 18,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: `0 2px 8px ${theme.palette.primary.main}66`
                      }}
                    >
                      <CheckCircle sx={{ fontSize: 12, color: 'white' }} />
                    </Box>
                  )}
                </Box>
              </motion.div>
            ))
          )}
        </Box>
      </Box>

      {/* ✅ Floor Plan Location View */}
      {!loadingBuilding && floorPlan && apartmentPolygon && (
        <Box sx={{ mb: 4 }}>
          <Box mb={2}>
            <Box display="flex" alignItems="center" gap={1.5} mb={1}>
              <Map sx={{ color: theme.palette.secondary.main, fontSize: 24 }} />
              <Typography
                variant="h6"
                sx={{
                  fontFamily: '"Poppins", sans-serif',
                  color: theme.palette.primary.main,
                  fontWeight: 700,
                  fontSize: { xs: '1.1rem', sm: '1.25rem' },
                  letterSpacing: '0.5px',
                }}
              >
                Floor Plan Location
              </Typography>
            </Box>
            <Box sx={{ width: 60, height: 3, bgcolor: theme.palette.secondary.main, borderRadius: 1 }} />
          </Box>

          <Paper
            elevation={0}
            sx={{
              p: 2,
              borderRadius: 3,
              border: `1px solid ${theme.palette.cardBorder}`,
              bgcolor: theme.palette.cardBg,
              overflow: 'hidden'
            }}
          >
            <Box
              sx={{
                width: '100%',
                mx: 'auto',
                position: 'relative',
                bgcolor: '#f5f5f5',
                borderRadius: 2,
                overflow: 'hidden',
                minHeight: 400,
                maxHeight: 600
              }}
            >
              <PolygonImagePreview
                imageUrl={floorPlan.url}
                polygons={previewPolygons}
                maxWidth={1000}
                maxHeight={700}
                highlightPolygonId={floorPlanPolygonId}
                showLabels={false}
                onPolygonClick={() => {}}
                onPolygonHover={() => {}}
              />
            </Box>
            <Typography
              variant="caption"
              sx={{
                display: 'block',
                textAlign: 'center',
                mt: 1.5,
                color: theme.palette.text.secondary,
                fontFamily: '"Poppins", sans-serif',
                fontSize: '0.75rem'
              }}
            >
              Your apartment location on Floor {floorNumber}
            </Typography>
          </Paper>
        </Box>
      )}

      {/* ✅ Apartment Model Specifications */}
      <Box sx={{ mt: 4 }}>
        <Box mb={3}>
          <Box display="flex" alignItems="center" gap={2} mb={1.5} flexWrap="wrap">
            <Typography
              variant="h6"
              sx={{
                fontFamily: '"Poppins", sans-serif',
                color: theme.palette.primary.main,
                fontWeight: 700,
                fontSize: { xs: '1.1rem', sm: '1.25rem' },
                letterSpacing: '0.5px',
              }}
            >
              Apartment Specifications
            </Typography>
          </Box>
          <Box sx={{ width: 60, height: 3, bgcolor: theme.palette.secondary.main, borderRadius: 1 }} />
        </Box>

        {/* ✅ Specs Grid con colores del theme */}
        <Grid container spacing={3}>
          {/* Model Info */}
          <Grid item xs={12} sm={6} md={3}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Paper
                elevation={0}
                sx={{
                  p: 2.5,
                  borderRadius: 2,
                  border: `1px solid ${theme.palette.cardBorder}`,
                  bgcolor: theme.palette.cardBg,
                  height: '100%'
                }}
              >
                <Box display="flex" alignItems="center" gap={1.5} mb={1}>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: 2,
                      bgcolor: theme.palette.chipAdmin.bg,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Apartment sx={{ color: theme.palette.chipAdmin.color, fontSize: 22 }} />
                  </Box>
                  <Typography
                    variant="caption"
                    sx={{
                      fontFamily: '"Poppins", sans-serif',
                      color: theme.palette.text.secondary,
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}
                  >
                    Model
                  </Typography>
                </Box>
                <Typography
                  sx={{
                    fontFamily: '"Poppins", sans-serif',
                    color: theme.palette.primary.main,
                    fontSize: '1.1rem',
                    fontWeight: 700
                  }}
                >
                  {apartmentModel?.name || 'N/A'}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    fontFamily: '"Poppins", sans-serif',
                    color: theme.palette.text.secondary,
                    fontSize: '0.7rem'
                  }}
                >
                  Model #{apartmentModel?.modelNumber || 'N/A'}
                </Typography>
              </Paper>
            </motion.div>
          </Grid>

          {/* Bedrooms */}
          <Grid item xs={12} sm={6} md={3}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Paper
                elevation={0}
                sx={{
                  p: 2.5,
                  borderRadius: 2,
                  border: `1px solid ${theme.palette.cardBorder}`,
                  bgcolor: theme.palette.cardBg,
                  height: '100%'
                }}
              >
                <Box display="flex" alignItems="center" gap={1.5} mb={1}>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: 2,
                      bgcolor: 'rgba(67,160,71,0.12)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Bed sx={{ color: theme.palette.success.main, fontSize: 22 }} />
                  </Box>
                  <Typography
                    variant="caption"
                    sx={{
                      fontFamily: '"Poppins", sans-serif',
                      color: theme.palette.text.secondary,
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}
                  >
                    Bedrooms
                  </Typography>
                </Box>
                <Typography
                  sx={{
                    fontFamily: '"Poppins", sans-serif',
                    color: theme.palette.primary.main,
                    fontSize: '1.8rem',
                    fontWeight: 700
                  }}
                >
                  {apartmentModel?.bedrooms || 0}
                </Typography>
              </Paper>
            </motion.div>
          </Grid>

          {/* Bathrooms */}
          <Grid item xs={12} sm={6} md={3}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Paper
                elevation={0}
                sx={{
                  p: 2.5,
                  borderRadius: 2,
                  border: `1px solid ${theme.palette.cardBorder}`,
                  bgcolor: theme.palette.cardBg,
                  height: '100%'
                }}
              >
                <Box display="flex" alignItems="center" gap={1.5} mb={1}>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: 2,
                      bgcolor: 'rgba(33,150,243,0.12)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Bathtub sx={{ color: theme.palette.info.main, fontSize: 22 }} />
                  </Box>
                  <Typography
                    variant="caption"
                    sx={{
                      fontFamily: '"Poppins", sans-serif',
                      color: theme.palette.text.secondary,
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}
                  >
                    Bathrooms
                  </Typography>
                </Box>
                <Typography
                  sx={{
                    fontFamily: '"Poppins", sans-serif',
                    color: theme.palette.primary.main,
                    fontSize: '1.8rem',
                    fontWeight: 700
                  }}
                >
                  {apartmentModel?.bathrooms || 0}
                </Typography>
              </Paper>
            </motion.div>
          </Grid>

          {/* Square Feet */}
          <Grid item xs={12} sm={6} md={3}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Paper
                elevation={0}
                sx={{
                  p: 2.5,
                  borderRadius: 2,
                  border: `1px solid ${theme.palette.cardBorder}`,
                  bgcolor: theme.palette.cardBg,
                  height: '100%'
                }}
              >
                <Box display="flex" alignItems="center" gap={1.5} mb={1}>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: 2,
                      bgcolor: 'rgba(255,152,0,0.12)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <SquareFoot sx={{ color: theme.palette.warning.main, fontSize: 22 }} />
                  </Box>
                  <Typography
                    variant="caption"
                    sx={{
                      fontFamily: '"Poppins", sans-serif',
                      color: theme.palette.text.secondary,
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}
                  >
                    Area
                  </Typography>
                </Box>
                <Typography
                  sx={{
                    fontFamily: '"Poppins", sans-serif',
                    color: theme.palette.primary.main,
                    fontSize: '1.5rem',
                    fontWeight: 700
                  }}
                >
                  {apartmentModel?.sqft || 0}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    fontFamily: '"Poppins", sans-serif',
                    color: theme.palette.text.secondary,
                    fontSize: '0.7rem'
                  }}
                >
                  sq ft
                </Typography>
              </Paper>
            </motion.div>
          </Grid>
        </Grid>

        {/* ✅ Building & Location Info con colores del theme */}
        <Box sx={{ mt: 3 }}>
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: 2,
              border: `1px solid ${theme.palette.cardBorder}`,
              bgcolor: theme.palette.cardBg
            }}
          >
            <Box display="flex" alignItems="center" gap={1.5} mb={2}>
              <LocationOn sx={{ color: theme.palette.secondary.main, fontSize: 22 }} />
              <Typography
                variant="subtitle2"
                sx={{
                  fontFamily: '"Poppins", sans-serif',
                  color: theme.palette.primary.main,
                  fontWeight: 700,
                  fontSize: '0.95rem'
                }}
              >
                Location Details
              </Typography>
            </Box>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <Typography
                  variant="caption"
                  sx={{
                    fontFamily: '"Poppins", sans-serif',
                    color: theme.palette.text.secondary,
                    fontSize: '0.7rem',
                    display: 'block',
                    mb: 0.5
                  }}
                >
                  Building
                </Typography>
                <Typography
                  sx={{
                    fontFamily: '"Poppins", sans-serif',
                    color: theme.palette.primary.main,
                    fontSize: '0.9rem',
                    fontWeight: 600
                  }}
                >
                  {building?.name || 'N/A'}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Typography
                  variant="caption"
                  sx={{
                    fontFamily: '"Poppins", sans-serif',
                    color: theme.palette.text.secondary,
                    fontSize: '0.7rem',
                    display: 'block',
                    mb: 0.5
                  }}
                >
                  Section
                </Typography>
                <Typography
                  sx={{
                    fontFamily: '"Poppins", sans-serif',
                    color: theme.palette.primary.main,
                    fontSize: '0.9rem',
                    fontWeight: 600
                  }}
                >
                  {building?.section || 'N/A'}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Typography
                  variant="caption"
                  sx={{
                    fontFamily: '"Poppins", sans-serif',
                    color: theme.palette.text.secondary,
                    fontSize: '0.7rem',
                    display: 'block',
                    mb: 0.5
                  }}
                >
                  Total Floors
                </Typography>
                <Typography
                  sx={{
                    fontFamily: '"Poppins", sans-serif',
                    color: theme.palette.primary.main,
                    fontSize: '0.9rem',
                    fontWeight: 600
                  }}
                >
                  {building?.floors || 'N/A'}
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        </Box>
      </Box>
    </Paper>
  )
}

export default ApartmentDetailsTab