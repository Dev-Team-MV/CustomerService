// import { Typography,Box, Grid, Container, CircularProgress, Alert, useMediaQuery, useTheme } from '@mui/material'
// import { PropertyProvider, useProperty } from '../context/PropertyContext'
// import { useState } from 'react'
// import InteractiveMap from '../components/property/InteractiveMap'
// import PropertyStats from '../components/property/PropertyStats'
// import ModelSelector from '../components/property/ModelSelector'
// import FacadeSelector from '../components/property/FacadeSelector'
// import ResidentAssignment from '../components/property/ResidentAssignment'
// import PriceCalculator from '../components/property/PriceCalculator'

// const PropertySelectionContent = () => {
//   const { loading, error } = useProperty()
//   const theme = useTheme()
//   const isMobile = useMediaQuery(theme.breakpoints.down('md'))
//   const [residentExpanded, setResidentExpanded] = useState(false)

//   const handleCreatePropertyClick = () => {
//     setResidentExpanded(true)
    
//     // Scroll to ResidentAssignment
//     setTimeout(() => {
//       const element = document.getElementById('resident-assignment-section')
//       if (element) {
//         element.scrollIntoView({ behavior: 'smooth', block: 'center' })
//       }
//     }, 100)
//   }

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
//     <Box sx={{ py: 3 }}>
//             <Typography variant="h4" gutterBottom fontWeight="bold">
//               Get Your Qoute
//             </Typography>
//       <Container 
// maxWidth={false}
//         sx={{ 
//           px: { xs: 2, sm: 3 },
//           py: 3
//         }}
//       >
//         <Grid container spacing={3}>
//           {/* Mobile: Show PropertyStats first */}
//           {isMobile && (
//             <Grid item xs={12}>
//               <PropertyStats />
//             </Grid>
//           )}

//           {/* Left Column - Main Content */}
//           <Grid item xs={12} md={8}>
//             <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
//               <InteractiveMap />
//               <ModelSelector />
//               <FacadeSelector />
//               <Box id="resident-assignment-section">
//                 <ResidentAssignment 
//                   expanded={residentExpanded}
//                   onToggle={() => setResidentExpanded(!residentExpanded)}
//                 />
//               </Box>
//             </Box>
//           </Grid>
          
//           {/* Right Column - Sidebar (Desktop only) */}
//           {!isMobile && (
//             <Grid item xs={12} md={4}>
//               <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
//                 <PropertyStats />
//                 <PriceCalculator onCreatePropertyClick={handleCreatePropertyClick} />
//               </Box>
//             </Grid>
//           )}

//           {/* Mobile: Show PriceCalculator at the end */}
//           {isMobile && (
//             <Grid item xs={12}>
//               <PriceCalculator onCreatePropertyClick={handleCreatePropertyClick} />
//             </Grid>
//           )}
//         </Grid>
//       </Container>
//     </Box>
//   )
// }

// const PropertySelection = () => {
//   return (
//     <PropertyProvider>
//       <PropertySelectionContent />
//     </PropertyProvider>
//   )
// }

// export default PropertySelection

import { Typography, Box, Grid, Container, CircularProgress, Alert, useMediaQuery, useTheme } from '@mui/material'
import { PropertyProvider, useProperty } from '../context/PropertyContext'
import { useState } from 'react'
import InteractiveMap from '../components/property/InteractiveMap'
import PropertyStats from '../components/property/PropertyStats'
import ModelSelector from '../components/property/ModelSelector'
import ModelPricingOptions from '../components/property/ModelPricingOptions'
import FacadeSelector from '../components/property/FacadeSelector'
import ResidentAssignment from '../components/property/ResidentAssignment'
import PriceCalculator from '../components/property/PriceCalculator'

const PropertySelectionContent = () => {
  const { loading, error } = useProperty()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const [residentExpanded, setResidentExpanded] = useState(false)

  const handleCreatePropertyClick = () => {
    setResidentExpanded(true)
    
    // Scroll to ResidentAssignment
    setTimeout(() => {
      const element = document.getElementById('resident-assignment-section')
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }, 100)
  }

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
    <Box sx={{ py: 3 }}>
      <Typography variant="h4" gutterBottom fontWeight="bold">
        Get Your Quote
      </Typography>
      <Container 
        maxWidth={false}
        sx={{ 
          px: { xs: 2, sm: 3 },
          py: 3
        }}
      >
        <Grid container spacing={3}>
          {/* Mobile: Show PropertyStats first */}
          {isMobile && (
            <Grid item xs={12}>
              <PropertyStats />
            </Grid>
          )}

          {/* Left Column - Main Content */}
          <Grid item xs={12} md={8}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <InteractiveMap />
              <ModelSelector />
              {/* <ModelPricingOptions /> ✅ Agregado aquí */}
              <FacadeSelector />
              <Box id="resident-assignment-section">
                <ResidentAssignment 
                  expanded={residentExpanded}
                  onToggle={() => setResidentExpanded(!residentExpanded)}
                />
              </Box>
            </Box>
          </Grid>
          
          {/* Right Column - Sidebar (Desktop only) */}
          {!isMobile && (
            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <PropertyStats />
                <PriceCalculator onCreatePropertyClick={handleCreatePropertyClick} />
              </Box>
            </Grid>
          )}

          {/* Mobile: Show PriceCalculator at the end */}
          {isMobile && (
            <Grid item xs={12}>
              <PriceCalculator onCreatePropertyClick={handleCreatePropertyClick} />
            </Grid>
          )}
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