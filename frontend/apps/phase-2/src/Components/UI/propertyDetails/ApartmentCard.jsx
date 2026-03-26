import { Card, CardContent, Typography, Box, Chip, Button } from '@mui/material'
import { Home, LocationOn, Bed, Bathtub, SquareFoot, Person } from '@mui/icons-material'
import { motion } from 'framer-motion'
import { useTheme } from '@mui/material/styles'

const ApartmentCard = ({ apartment, hovered, onHoverStart, onHoverEnd, onClick }) => {
  const theme = useTheme()
  
  // Datos del apartamento
  const apartmentModel = apartment?.apartmentModel || {}
  const building = apartment?.building || {}
  const selectedRenders = apartment?.selectedRenders || []
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
                  background: theme.palette.gradient,
                  boxShadow: theme.palette.avatarShadow,
                  border: "3px solid white",
                  overflow: "hidden",
                  flexShrink: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {firstImage ? (
                  <Box
                    component="img"
                    src={firstImage}
                    alt={`Apartment ${apartment.apartmentNumber}`}
                    sx={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      display: "block",
                    }}
                  />
                ) : (
                  <Home sx={{ fontSize: 32, color: "white" }} />
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
                  mb: 0.5,
                  fontSize: { xs: "1.1rem", sm: "1.25rem" },
                  letterSpacing: "0.5px",
                }}
              >
                Apt {apartment.apartmentNumber}
              </Typography>
              <Box display="flex" alignItems="center" gap={0.5}>
                <LocationOn sx={{ fontSize: 16, color: theme.palette.secondary.main }} />
                <Typography
                  variant="caption"
                  sx={{
                    color: "#706f6f",
                    fontWeight: 600,
                    fontFamily: '"Poppins", sans-serif',
                    fontSize: "0.75rem",
                  }}
                >
                  {building?.name || 'N/A'} • Floor {apartment.floorNumber || 'N/A'}
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Línea decorativa */}
          <Box
            sx={{
              width: 40,
              height: 2,
              bgcolor: theme.palette.secondary.main,
              mx: "auto",
              mb: 2.5,
              opacity: 0.8,
            }}
          />

          {/* Grid de especificaciones */}
          {apartmentModel && (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: 0,
                mb: 3,
                borderTop: `1px solid ${theme.palette.cardBorder}`,
                borderBottom: `1px solid ${theme.palette.cardBorder}`,
                py: 2,
              }}
            >
              {[
                {
                  icon: <Bed />,
                  value: apartmentModel.bedrooms || 0,
                  label: 'BEDS',
                },
                {
                  icon: <Bathtub />,
                  value: apartmentModel.bathrooms || 0,
                  label: 'BATHS',
                },
                {
                  icon: <SquareFoot />,
                  value: apartmentModel.sqft || 0,
                  label: 'SQFT',
                },
              ].map((spec, idx) => (
                <Box
                  key={idx}
                  sx={{
                    textAlign: "center",
                    borderRight: idx < 2 ? `1px solid ${theme.palette.cardBorder}` : "none",
                    px: 1,
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      color: "#999999",
                      fontSize: "0.65rem",
                      fontWeight: 500,
                      textTransform: "uppercase",
                      letterSpacing: "1px",
                      fontFamily: '"Poppins", sans-serif',
                      display: "block",
                      mb: 0.8,
                    }}
                  >
                    {spec.label}
                  </Typography>
                  <Typography
                    variant="h6"
                    sx={{
                      color: theme.palette.primary.main,
                      fontSize: { xs: "1.1rem", md: "1.2rem" },
                      fontWeight: 600,
                      fontFamily: '"Poppins", sans-serif',
                      lineHeight: 1,
                    }}
                  >
                    {spec.value}
                  </Typography>
                </Box>
              ))}
            </Box>
          )}

          {/* Precio */}
          <Box
            sx={{
              p: 2.5,
              borderRadius: 3,
              background: `linear-gradient(135deg, ${theme.palette.secondary.main}14 0%, ${theme.palette.primary.main}14 100%)`,
              border: `1px solid ${theme.palette.secondary.main}33`,
              textAlign: "center",
              mb: 2.5,
            }}
          >
            <Typography
              variant="caption"
              sx={{
                color: "#706f6f",
                fontWeight: 600,
                fontFamily: '"Poppins", sans-serif',
                display: "block",
                mb: 0.5,
                fontSize: "0.7rem",
                textTransform: "uppercase",
                letterSpacing: "1px",
              }}
            >
              Apartment Value
            </Typography>
            <Typography
              variant="h4"
              sx={{
                color: theme.palette.primary.main,
                fontWeight: 800,
                fontFamily: '"Poppins", sans-serif',
                letterSpacing: "-0.5px",
                fontSize: { xs: "1.75rem", sm: "2rem" },
              }}
            >
              ${apartment.price?.toLocaleString() || 'N/A'}
            </Typography>
          </Box>

          {/* Status y Modelo Chips */}
          <Box display="flex" justifyContent="center" gap={1} mb={2.5} flexWrap="wrap">
            <Chip
              label={apartment.status || 'N/A'}
              size="small"
              sx={{
                bgcolor: getStatusColor(apartment.status),
                color: "white",
                fontWeight: 700,
                fontFamily: '"Poppins", sans-serif',
                fontSize: "0.75rem",
                height: 28,
                px: 2,
                textTransform: 'capitalize'
              }}
            />
            <Chip
              label={apartmentModel?.name || 'Model N/A'}
              size="small"
              sx={{
                bgcolor: theme.palette.chipAdmin.bg,
                color: theme.palette.chipAdmin.color,
                border: `1px solid ${theme.palette.chipAdmin.border}`,
                fontWeight: 700,
                fontFamily: '"Poppins", sans-serif',
                fontSize: "0.75rem",
                height: 28,
                px: 2,
              }}
            />
          </Box>

          {/* Resident Info */}
          {Array.isArray(apartment.users) && apartment.users.length > 0 && (
            <Box 
              display="flex" 
              alignItems="center" 
              justifyContent="center"
              gap={1} 
              mb={2.5}
              sx={{
                p: 1.5,
                borderRadius: 2,
                bgcolor: theme.palette.cardBg,
                border: `1px solid ${theme.palette.cardBorder}`
              }}
            >
              <Person sx={{ color: theme.palette.secondary.main, fontSize: 18 }} />
              <Typography 
                variant="body2" 
                sx={{ 
                  color: theme.palette.primary.main, 
                  fontWeight: 600,
                  fontFamily: '"Poppins", sans-serif',
                  fontSize: '0.85rem'
                }}
              >
                {`${apartment.users[0]?.firstName || ''} ${apartment.users[0]?.lastName || ''}`.trim()}
              </Typography>
            </Box>
          )}

          {/* Botón */}
          <Button
            fullWidth
            sx={{
              mt: "auto",
              borderRadius: 3,
              bgcolor: theme.palette.primary.main,
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
                background: theme.palette.gradient,
                transition: "left 0.4s ease",
                zIndex: 0,
              },
              "&:hover": {
                bgcolor: theme.palette.primary.main,
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
            <span className="button-text">View Full Details</span>
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export default ApartmentCard