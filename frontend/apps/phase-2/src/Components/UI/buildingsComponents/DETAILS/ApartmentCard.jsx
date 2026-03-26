import { Card, CardContent, Typography, Box, Button, Chip } from '@mui/material'
import { Home, LocationOn, Domain, AttachMoney } from '@mui/icons-material'
import { motion } from 'framer-motion'
import { useTheme } from '@mui/material/styles'

const ApartmentCard = ({ apartment, modelName, onEdit }) => {
  const theme = useTheme()

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
      style={{ height: '100%', width: '100%' }}
    >
      <Card
        sx={{
          height: "100%",
          minHeight: { xs: 380, sm: 400, md: 420 },
          width: '100%',
          borderRadius: 6,
          cursor: "pointer",
          border: `1.5px solid ${theme.palette.cardBorder}`,
          boxShadow: "0 12px 32px rgba(26, 35, 126, 0.12)",
          transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
          overflow: "hidden",
          position: "relative",
          background: "linear-gradient(180deg, #ffffff 0%, #fafafa 100%)",
          display: "flex",
          flexDirection: "column",
          '&:hover': {
            boxShadow: `0 24px 60px ${theme.palette.primary.main}40`,
            borderColor: theme.palette.primary.main,
          }
        }}
      >
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 4,
            background: theme.palette.gradientSecondary,
            transition: "all 0.3s ease",
          }}
        />

        {apartment.status && (
          <Chip
            label={apartment.status}
            size="small"
            sx={{
              position: 'absolute',
              top: 16,
              right: 16,
              bgcolor: getStatusColor(apartment.status),
              color: 'white',
              fontWeight: 700,
              fontFamily: '"Poppins", sans-serif',
              textTransform: 'capitalize',
              height: 28,
              px: 1.5,
              zIndex: 1
            }}
          />
        )}

        <CardContent
          sx={{
            p: { xs: 2.5, sm: 3 },
            pt: 3.5,
            flex: 1,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Box display="flex" flexDirection="column" alignItems="center" gap={2} mb={3}>
            <motion.div
              whileHover={{
                scale: [1, 1.05, 1],
                rotate: [0, 3, -3, 0],
              }}
              transition={{ duration: 0.6 }}
            >
              <Box
                sx={{
                  width: { xs: 64, sm: 70 },
                  height: { xs: 64, sm: 70 },
                  borderRadius: '50%',
                  background: theme.palette.gradientSecondary,
                  boxShadow: theme.palette.avatarShadow,
                  border: "3px solid white",
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Home sx={{ fontSize: 32, color: "white" }} />
              </Box>
            </motion.div>

            <Box textAlign="center">
              <Typography
                variant="h6"
                sx={{
                  fontFamily: '"Poppins", sans-serif',
                  color: theme.palette.primary.main,
                  fontWeight: 700,
                  fontSize: { xs: "1.1rem", sm: "1.25rem" },
                  letterSpacing: "0.5px",
                  mb: 0.5
                }}
              >
                Apt #{apartment.apartmentNumber}
              </Typography>
              <Box display="flex" alignItems="center" justifyContent="center" gap={0.5}>
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
                  Floor {apartment.floorNumber || 'N/A'}
                </Typography>
              </Box>
            </Box>
          </Box>

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

          <Box
            sx={{
              p: 2,
              borderRadius: 2,
              bgcolor: theme.palette.cardBg,
              border: `1px solid ${theme.palette.cardBorder}`,
              mb: 2.5,
            }}
          >
            <Box display="flex" alignItems="center" justifyContent="center" gap={1} mb={0.5}>
              <Domain sx={{ fontSize: 18, color: theme.palette.chipAdmin.color }} />
              <Typography
                variant="caption"
                sx={{
                  color: "#706f6f",
                  fontWeight: 600,
                  fontFamily: '"Poppins", sans-serif',
                  fontSize: "0.7rem",
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                }}
              >
                Model
              </Typography>
            </Box>
            <Typography
              variant="body1"
              sx={{
                color: theme.palette.primary.main,
                fontWeight: 700,
                fontFamily: '"Poppins", sans-serif',
                fontSize: "1rem",
                textAlign: 'center'
              }}
            >
              {modelName || 'N/A'}
            </Typography>
          </Box>

          <Box
            sx={{
              p: 2,
              borderRadius: 3,
              background: `linear-gradient(135deg, ${theme.palette.secondary.main}14 0%, ${theme.palette.primary.main}14 100%)`,
              border: `1px solid ${theme.palette.secondary.main}33`,
              mb: 2.5,
            }}
          >
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
              <Box flex={1}>
                <Typography
                  variant="caption"
                  sx={{
                    color: "#706f6f",
                    fontWeight: 600,
                    fontFamily: '"Poppins", sans-serif',
                    display: "block",
                    fontSize: "0.65rem",
                    textTransform: "uppercase",
                    letterSpacing: "1px",
                  }}
                >
                  Price
                </Typography>
                <Typography
                  variant="h6"
                  sx={{
                    color: theme.palette.primary.main,
                    fontWeight: 700,
                    fontFamily: '"Poppins", sans-serif',
                    fontSize: "1.1rem",
                  }}
                >
                  ${apartment.price?.toLocaleString() || '0'}
                </Typography>
              </Box>
              <Box flex={1} textAlign="right">
                <Typography
                  variant="caption"
                  sx={{
                    color: "#706f6f",
                    fontWeight: 600,
                    fontFamily: '"Poppins", sans-serif',
                    display: "block",
                    fontSize: "0.65rem",
                    textTransform: "uppercase",
                    letterSpacing: "1px",
                  }}
                >
                  Pending
                </Typography>
                <Typography
                  variant="h6"
                  sx={{
                    color: theme.palette.warning.main,
                    fontWeight: 700,
                    fontFamily: '"Poppins", sans-serif',
                    fontSize: "1.1rem",
                  }}
                >
                  ${apartment.pending?.toLocaleString() || '0'}
                </Typography>
              </Box>
            </Box>
          </Box>

          <Button
            fullWidth
            onClick={() => onEdit(apartment)}
            sx={{
              mt: "auto",
              borderRadius: 3,
              bgcolor: theme.palette.secondary.main,
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
                background: theme.palette.gradientSecondary,
                transition: "left 0.4s ease",
                zIndex: 0,
              },
              "&:hover": {
                bgcolor: theme.palette.secondary.main,
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
            <span className="button-text">Edit Apartment</span>
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export default ApartmentCard