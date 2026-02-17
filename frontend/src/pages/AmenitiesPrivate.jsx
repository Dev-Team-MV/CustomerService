import { Box, Container, Typography, Paper } from '@mui/material'
import AmenitiesMap from '../components/property/AmenitiesMap'
import { motion, AnimatePresence } from "framer-motion";
import {
  Add,
  Edit,
  Delete,
  Home,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
  Balcony,
  Upgrade as UpgradeIcon,
  Storage as StorageIcon,
  PhotoLibrary,
  Bathtub,
  Bed,
  SquareFoot,
  Layers  
} from "@mui/icons-material";
const AmenitiesPrivate = () => {
  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4, p: 3 }}>
      {/* Header */}
      {/* <Paper
        elevation={0}
        sx={{
          // p: 3,
          mb: 3,
          borderRadius: 2,
          bgcolor: 'transparent'
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#333', mb: 1 }}>
          Amenities Map
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Explore all premium amenities available in the community. Click on any point to view detailed photos and information.
        </Typography>
      </Paper> */}
              <motion.div
                initial={{ opacity: 0, y: -30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <Paper
                  elevation={0}
                  sx={{
                    p: { xs: 3, md: 4 },
                    mb: 4,
                    borderRadius: 4,
                    border: '1px solid rgba(0,0,0,0.08)',
                    background: 'linear-gradient(135deg, #ffffff 0%, #fafafa 100%)',
                    position: 'relative',
                    overflow: 'hidden',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: 4,
                      background: 'linear-gradient(90deg, #333F1F, #8CA551, #333F1F)'
                    }
                  }}
                >
                  <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
                    <Box display="flex" alignItems="center" gap={2}>
                      <motion.div
                        animate={{
                          scale: [1, 1.1, 1],
                          rotate: [0, 5, -5, 0]
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          repeatDelay: 3
                        }}
                      >
                        <Box
                          sx={{
                            width: { xs: 56, md: 64 },
                            height: { xs: 56, md: 64 },
                            borderRadius: 3,
                            background: 'linear-gradient(135deg, #333F1F 0%, #8CA551 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 8px 24px rgba(51, 63, 31, 0.3)'
                          }}
                        >
                          <Home sx={{ fontSize: { xs: 28, md: 32 }, color: 'white' }} />
                        </Box>
                      </motion.div>
      
                      <Box>
                        <Typography
                          variant="h4"
                          sx={{
                            fontWeight: 800,
                            color: '#333F1F',
                            fontFamily: '"Poppins", sans-serif',
                            letterSpacing: '0.5px',
                            fontSize: { xs: '1.75rem', md: '2.125rem' }
                          }}
                        >
                          Amenities Map
                        </Typography>
                        <Typography
                          variant="body1"
                          sx={{
                            color: '#706f6f',
                            fontFamily: '"Poppins", sans-serif',
                            fontSize: { xs: '0.875rem', md: '1rem' }
                          }}
                        >
                          Explore all premium amenities available in the community. Click on any point to view detailed photos and information.
                        </Typography>
                      </Box>
                    </Box>

                  </Box>
                </Paper>
              </motion.div>

      {/* Map Component - Full Access */}
      <AmenitiesMap isPublicView={false} />
    </Container>
  )
}

export default AmenitiesPrivate
