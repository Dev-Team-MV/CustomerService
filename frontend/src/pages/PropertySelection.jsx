// import { Box, Grid, Container, CircularProgress, Alert } from '@mui/material'
// import { PropertyProvider, useProperty } from '../context/PropertyContext'
// import { useAuth } from '../context/AuthContext'
// import InteractiveMap from '../components/property/InteractiveMap'
// import PropertyStats from '../components/property/PropertyStats'
// import ModelSelector from '../components/property/ModelSelector'
// import FacadeSelector from '../components/property/FacadeSelector'
// import PriceCalculator from '../components/property/PriceCalculator'

// const PropertySelectionContent = () => {
//   const { loading, error } = useProperty()

//   if (loading) {
//     return (
//       <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
//         <CircularProgress sx={{ color: '#4a7c59' }} />
//       </Box>
//     )
//   }

//   if (error) {
//     return (
//       <Box sx={{ p: 3 }}>
//         <Alert severity="error">
//           Error loading property data: {error}
//         </Alert>
//       </Box>
//     )
//   }

//   return (
//     <Box sx={{ bgcolor: 'white', minHeight: '100vh', py: 3 }}>
//       <Container maxWidth="xl">
//         <Grid container spacing={3}>
//           {/* Left Column - Main Content (8/12) */}
//           <Grid item xs={12} lg={8.5}>
//             <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
//               {/* Map Section */}
//               <InteractiveMap />
              
//               {/* Model Selection */}
//               <ModelSelector />
              
//               {/* Facade Selection */}
//               <FacadeSelector />
//             </Box>
//           </Grid>
          
//           {/* Right Column - Sidebar (4/12) */}
//           <Grid item xs={12} lg={3.5}>
//             <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, position: { lg: 'sticky' }, top: 24 }}>
//               {/* Lot Select & House Information */}
//               <PropertyStats />
              
//               {/* Financial Calculator */}
//               <PriceCalculator />
//             </Box>
//           </Grid>
//         </Grid>
//       </Container>
//     </Box>
//   )
// }

// const PropertySelection = () => {
//   const { isAuthenticated } = useAuth()

//   return (
//     <PropertyProvider>
//       {isAuthenticated ? (
//         // User is authenticated - content will be wrapped by Layout component via routing
//         <PropertySelectionContent />
//       ) : (
//         // User is not authenticated - show fullscreen
//         <Box sx={{ bgcolor: '#f5f5f5', minHeight: '100vh' }}>
//           <PropertySelectionContent />
//         </Box>
//       )}
//     </PropertyProvider>
//   )
// }

// export default PropertySelection


import { Box, Grid, Container, CircularProgress, Alert } from '@mui/material'
import { PropertyProvider, useProperty } from '../context/PropertyContext'
import InteractiveMap from '../components/property/InteractiveMap'
import PropertyStats from '../components/property/PropertyStats'
import ModelSelector from '../components/property/ModelSelector'
import FacadeSelector from '../components/property/FacadeSelector'
import PriceCalculator from '../components/property/PriceCalculator'

const PropertySelectionContent = () => {
  const { loading, error } = useProperty()

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress sx={{ color: '#4a7c59' }} />
      </Box>
    )
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          Error loading property data: {error}
        </Alert>
      </Box>
    )
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'white', py: 3, sm: { p: 0 } }}>
      <Container maxWidth="lg">
        <Grid container spacing={3}>
          {/* Left Column - Main Content */}
          <Grid item xs={12} md={8}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {/* Map Section */}
              <InteractiveMap />
              
              {/* Model Selection */}
              <ModelSelector />
              
              {/* Facade Selection */}
              <FacadeSelector />
            </Box>
          </Grid>
          
          {/* Right Column - Sidebar */}
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {/* Lot Select & House Information */}
              <PropertyStats />
              
              {/* Financial Calculator */}
              <PriceCalculator />
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  )
}

const PropertySelection = () => {
  return (
    <PropertyProvider>
      <PropertySelectionContent />
    </PropertyProvider>
  )
}

export default PropertySelection