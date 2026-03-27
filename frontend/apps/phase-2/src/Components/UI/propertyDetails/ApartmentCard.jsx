import { useState, useEffect } from 'react'
import { Card, CardContent, Typography, Box, Chip, Button } from '@mui/material'
import { Home, LocationOn, Bed, Bathtub, SquareFoot, Person } from '@mui/icons-material'
import { motion } from 'framer-motion'
import { useTheme } from '@mui/material/styles'
import buildingService from '../../../Services/buildingService'

const ApartmentCard = ({ apartment, hovered, onHoverStart, onHoverEnd, onClick }) => {
  const theme = useTheme()
  const [buildingData, setBuildingData] = useState(null)
  
  // Fetch building data si viene como ID
  useEffect(() => {
    const fetchBuilding = async () => {
      const buildingId = typeof apartment?.building === 'string' 
        ? apartment.building 
        : apartment?.building?._id
      
      if (buildingId && typeof buildingId === 'string') {
        try {
          const data = await buildingService.getById(buildingId)
          setBuildingData(data)
        } catch (error) {
          console.error('Error fetching building:', error)
        }
      } else if (apartment?.building && typeof apartment.building === 'object') {
        setBuildingData(apartment.building)
      }
    }
    
    fetchBuilding()
  }, [apartment?.building])
  
  // Datos del apartamento
  const apartmentModel = apartment?.apartmentModel || {}
  const building = buildingData || apartment?.apartmentModel?.building || {}
  const selectedRenders = apartment?.selectedRenders || []
  const selectedRenderType = apartment?.selectedRenderType || 'basic'
  const firstImage = selectedRenders[0] || apartmentModel?.interiorRendersBasic?.[0]

  // Status color mapping
  const getStatusColor = (status) => {
    const statusMap = {
      'available': theme.palette.success.main,
      'pending': theme.palette.warning.main,
      'sold': theme.palette.secondary.main,
      'cancelled': theme.palette.error?.main || '#f44336'
    }
    return statusMap[status] || theme.palette.info.main
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.6,
        type: "spring",
      }}
      whileHover={{ scale: 1.02 }}
      onHoverStart={onHoverStart}
      onHoverEnd={onHoverEnd}
    >
      <Card
        onClick={onClick}
        sx={{
          height: "100%",
          minHeight: { xs: 420, sm: 440, md: 460 },
          borderRadius: 6,
          cursor: "pointer",
          border: hovered
            ? `2px solid ${theme.palette.primary.main}`
            : `1.5px solid ${theme.palette.cardBorder}`,
          boxShadow: hovered
            ? `0 24px 60px ${theme.palette.primary.main}40`
            : "0 12px 32px rgba(26, 35, 126, 0.12)",
          transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
          overflow: "hidden",
          position: "relative",
          background: "linear-gradient(180deg, #ffffff 0%, #fafafa 100%)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Barra superior decorativa */}
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 4,
            background: hovered
              ? theme.palette.gradient
              : theme.palette.secondary.main,
            transition: "all 0.3s ease",
          }}
        />

        <CardContent
          sx={{
            p: { xs: 2.5, sm: 3 },
            pt: 3.5,
            flex: 1,
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Header con imagen y número de apartamento */}
          <Box display="flex" alignItems="center" gap={2} mb={3}>
            <motion.div
              animate={
                hovered
                  ? {
                      scale: [1, 1.05, 1],
                      rotate: [0, 3, -3, 0],
                    }
                  : {}
              }
              transition={{ duration: 0.6 }}
            >
              <Box
                sx={{
                  width: { xs: 64, sm: 70 },
                  height: { xs: 64, sm: 70 },
                  borderRadius: '50%',
                  background: firstImage
                    ? `url(${firstImage})`
                    : theme.palette.gradient,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  border: `3px solid ${theme.palette.primary.main}`,
                  boxShadow: `0 8px 24px ${theme.palette.primary.main}40`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden'
                }}
              >
                {!firstImage && (
                  <Home sx={{ fontSize: 32, color: 'white' }} />
                )}
              </Box>
            </motion.div>

            <Box flex={1}>
              <Typography
                variant="h6"
                sx={{
                  fontFamily: '"Poppins", sans-serif',
                  color: theme.palette.primary.main,
                  fontWeight: 700,
                  fontSize: { xs: "1.1rem", sm: "1.25rem" },
                  mb: 0.3,
                  letterSpacing: "0.5px",
                }}
              >
                Apt {apartment?.apartmentNumber || 'N/A'}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: "#706f6f",
                  fontWeight: 600,
                  fontFamily: '"Poppins", sans-serif',
                  fontSize: "0.75rem",
                }}
              >
                {building?.name || 'N/A'} • Floor {apartment?.floorNumber || 'N/A'}
              </Typography>
            </Box>

            <Chip
              label={apartment?.status || 'N/A'}
              size="small"
              sx={{
                bgcolor: `${getStatusColor(apartment?.status)}15`,
                color: getStatusColor(apartment?.status),
                fontWeight: 700,
                fontSize: "0.7rem",
                height: 24,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                border: `1.5px solid ${getStatusColor(apartment?.status)}`,
                fontFamily: '"Poppins", sans-serif',
              }}
            />
          </Box>

          {/* Model name */}
          <Box mb={2.5}>
            <Typography
              variant="body2"
              sx={{
                color: theme.palette.text.secondary,
                fontFamily: '"Poppins", sans-serif',
                fontSize: "0.8rem",
                fontWeight: 500,
                mb: 0.5,
              }}
            >
              Model
            </Typography>
            <Typography
              variant="h6"
              sx={{
                fontFamily: '"Poppins", sans-serif',
                color: theme.palette.primary.main,
                fontWeight: 700,
                fontSize: { xs: "1rem", sm: "1.1rem" },
              }}
            >
              {apartmentModel?.name || 'N/A'}
            </Typography>
          </Box>

          {/* Specs Grid */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: { xs: 1.5, sm: 2 },
              mb: 3,
            }}
          >
            {/* Bedrooms */}
            <Box
              sx={{
                textAlign: "center",
                p: { xs: 1.5, sm: 2 },
                borderRadius: 3,
                bgcolor: "rgba(67,160,71,0.08)",
                border: `1.5px solid ${theme.palette.success.main}30`,
                transition: "all 0.3s ease",
                "&:hover": {
                  bgcolor: "rgba(67,160,71,0.15)",
                  transform: "translateY(-4px)",
                  boxShadow: `0 8px 16px ${theme.palette.success.main}20`,
                },
              }}
            >
              <Bed
                sx={{
                  color: theme.palette.success.main,
                  fontSize: { xs: 20, sm: 24 },
                  mb: 0.5,
                }}
              />
              <Typography
                sx={{
                  fontFamily: '"Poppins", sans-serif',
                  fontWeight: 700,
                  fontSize: { xs: "1.1rem", sm: "1.3rem" },
                  color: theme.palette.primary.main,
                  lineHeight: 1,
                }}
              >
                {apartmentModel?.bedrooms || 0}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  fontFamily: '"Poppins", sans-serif',
                  color: theme.palette.text.secondary,
                  fontSize: { xs: "0.65rem", sm: "0.7rem" },
                  fontWeight: 600,
                }}
              >
                Beds
              </Typography>
            </Box>

            {/* Bathrooms */}
            <Box
              sx={{
                textAlign: "center",
                p: { xs: 1.5, sm: 2 },
                borderRadius: 3,
                bgcolor: "rgba(33,150,243,0.08)",
                border: `1.5px solid ${theme.palette.info.main}30`,
                transition: "all 0.3s ease",
                "&:hover": {
                  bgcolor: "rgba(33,150,243,0.15)",
                  transform: "translateY(-4px)",
                  boxShadow: `0 8px 16px ${theme.palette.info.main}20`,
                },
              }}
            >
              <Bathtub
                sx={{
                  color: theme.palette.info.main,
                  fontSize: { xs: 20, sm: 24 },
                  mb: 0.5,
                }}
              />
              <Typography
                sx={{
                  fontFamily: '"Poppins", sans-serif',
                  fontWeight: 700,
                  fontSize: { xs: "1.1rem", sm: "1.3rem" },
                  color: theme.palette.primary.main,
                  lineHeight: 1,
                }}
              >
                {apartmentModel?.bathrooms || 0}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  fontFamily: '"Poppins", sans-serif',
                  color: theme.palette.text.secondary,
                  fontSize: { xs: "0.65rem", sm: "0.7rem" },
                  fontWeight: 600,
                }}
              >
                Baths
              </Typography>
            </Box>

            {/* Square Feet */}
            <Box
              sx={{
                textAlign: "center",
                p: { xs: 1.5, sm: 2 },
                borderRadius: 3,
                bgcolor: "rgba(255,152,0,0.08)",
                border: `1.5px solid ${theme.palette.warning.main}30`,
                transition: "all 0.3s ease",
                "&:hover": {
                  bgcolor: "rgba(255,152,0,0.15)",
                  transform: "translateY(-4px)",
                  boxShadow: `0 8px 16px ${theme.palette.warning.main}20`,
                },
              }}
            >
              <SquareFoot
                sx={{
                  color: theme.palette.warning.main,
                  fontSize: { xs: 20, sm: 24 },
                  mb: 0.5,
                }}
              />
              <Typography
                sx={{
                  fontFamily: '"Poppins", sans-serif',
                  fontWeight: 700,
                  fontSize: { xs: "0.9rem", sm: "1rem" },
                  color: theme.palette.primary.main,
                  lineHeight: 1,
                }}
              >
                {apartmentModel?.sqft || 0}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  fontFamily: '"Poppins", sans-serif',
                  color: theme.palette.text.secondary,
                  fontSize: { xs: "0.65rem", sm: "0.7rem" },
                  fontWeight: 600,
                }}
              >
                sq ft
              </Typography>
            </Box>
          </Box>

          {/* Render Type Chip */}
          <Box mb={2.5} display="flex" justifyContent="center">
            <Chip
              icon={<Home sx={{ fontSize: 16 }} />}
              label={selectedRenderType === 'basic' ? 'Basic Package' : 'Upgrade Package'}
              sx={{
                height: 32,
                fontSize: '0.8rem',
                fontWeight: 700,
                fontFamily: '"Poppins", sans-serif',
                bgcolor: selectedRenderType === 'basic' 
                  ? 'rgba(67,160,71,0.12)' 
                  : theme.palette.chipAdmin.bg,
                color: selectedRenderType === 'basic' 
                  ? theme.palette.success.main 
                  : theme.palette.chipAdmin.color,
                border: `2px solid ${selectedRenderType === 'basic' ? theme.palette.success.main : theme.palette.chipAdmin.color}`,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                px: 1
              }}
            />
          </Box>

          {/* Price Section */}
          <Box
            sx={{
              mt: "auto",
              pt: 2.5,
              borderTop: `2px solid ${theme.palette.cardBorder}`,
            }}
          >
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography
                variant="caption"
                sx={{
                  fontFamily: '"Poppins", sans-serif',
                  color: theme.palette.text.secondary,
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                Price
              </Typography>
              <Typography
                variant="h5"
                sx={{
                  fontFamily: '"Poppins", sans-serif',
                  color: theme.palette.primary.main,
                  fontWeight: 800,
                  fontSize: { xs: "1.4rem", sm: "1.6rem" },
                  letterSpacing: "-0.5px",
                }}
              >
                ${apartment?.price?.toLocaleString() || '0'}
              </Typography>
            </Box>

            <Button
              fullWidth
              variant="contained"
              sx={{
                background: hovered
                  ? theme.palette.gradient
                  : theme.palette.primary.main,
                color: "white",
                fontWeight: 700,
                fontSize: { xs: "0.85rem", sm: "0.9rem" },
                py: { xs: 1.2, sm: 1.5 },
                borderRadius: 3,
                textTransform: "none",
                fontFamily: '"Poppins", sans-serif',
                boxShadow: `0 8px 20px ${theme.palette.primary.main}40`,
                transition: "all 0.3s ease",
                "&:hover": {
                  background: theme.palette.gradient,
                  transform: "translateY(-2px)",
                  boxShadow: `0 12px 28px ${theme.palette.primary.main}50`,
                },
              }}
            >
              View Details
            </Button>
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export default ApartmentCard