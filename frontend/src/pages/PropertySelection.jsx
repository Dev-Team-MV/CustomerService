import { Typography, Box, Grid, Container, CircularProgress, Alert, useMediaQuery, useTheme } from '@mui/material'
import { PropertyProvider, useProperty } from '../context/PropertyContext'
import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import InteractiveMap from '../components/property/InteractiveMap'
import PropertyStats from '../components/property/PropertyStats'
import ModelSelector from '../components/property/ModelSelector'
import FacadeSelector from '../components/property/FacadeSelector'
import ResidentAssignment from '../components/property/ResidentAssignment'
import PriceCalculator from '../components/property/PriceCalculator'
import { motion } from 'framer-motion'

const PropertySelectionContent = () => {
  const { loading, error } = useProperty()
  const { isAuthenticated } = useAuth()
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
    <>
              <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom fontWeight="bold">
          Get Your Quote
        </Typography>
        {!isAuthenticated && (
          <Alert severity="info" sx={{ mt: 2 }}>
            You're browsing as a guest. Sign in to save your selections and create your property.
          </Alert>
        )}
      </Box>
      
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
              <FacadeSelector />
              
              {/* Solo mostrar ResidentAssignment si está autenticado */}
              {isAuthenticated && (
                <Box id="resident-assignment-section">
                  <ResidentAssignment 
                    expanded={residentExpanded}
                    onToggle={() => setResidentExpanded(!residentExpanded)}
                  />
                </Box>
              )}
            </Box>
          </Grid>
          
          {/* Right Column - Sidebar (Desktop only) */}
          {!isMobile && (
            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <PropertyStats />
                <PriceCalculator 
                  onCreatePropertyClick={handleCreatePropertyClick}
                  isPublic={!isAuthenticated}
                />
              </Box>
            </Grid>
          )}

          {/* Mobile: Show PriceCalculator at the end */}
          {isMobile && (
            <Grid item xs={12}>
              <PriceCalculator 
                onCreatePropertyClick={handleCreatePropertyClick}
                isPublic={!isAuthenticated}
              />
            </Grid>
          )}
        </Grid>
      </Container>
    </Box>
    </motion.div>
    </>
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