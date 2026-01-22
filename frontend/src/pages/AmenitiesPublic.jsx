import { Box, Container, Typography, Paper, Button } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import AmenitiesMap from '../components/property/AmenitiesMap'

const AmenitiesPublic = () => {
  const navigate = useNavigate()

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: '#f5f5f5',
        py: 4
      }}
    >
      <Container maxWidth="lg">
        {/* Header Section */}
        <Paper
          elevation={2}
          sx={{
            p: 4,
            mb: 3,
            borderRadius: 3,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: '#fff',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 2 }}>
              Explore Our Amenities
            </Typography>
            <Typography variant="h6" sx={{ mb: 3, opacity: 0.95 }}>
              Discover luxury living with world-class facilities
            </Typography>
            <Typography variant="body1" sx={{ mb: 3, opacity: 0.9 }}>
              Click on any point on the map to explore our premium amenities. Sign in to view all photos and get full access to detailed information.
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate('/login')}
                sx={{
                  bgcolor: '#fff',
                  color: '#667eea',
                  fontWeight: 'bold',
                  px: 4,
                  borderRadius: 2,
                  '&:hover': {
                    bgcolor: '#f5f5f5'
                  }
                }}
              >
                Sign In
              </Button>
              <Button
                variant="outlined"
                size="large"
                onClick={() => navigate('/register')}
                sx={{
                  borderColor: '#fff',
                  color: '#fff',
                  fontWeight: 'bold',
                  px: 4,
                  borderRadius: 2,
                  '&:hover': {
                    borderColor: '#fff',
                    bgcolor: 'rgba(255,255,255,0.1)'
                  }
                }}
              >
                Register
              </Button>
            </Box>
          </Box>
        </Paper>

        {/* Map Component */}
        <AmenitiesMap isPublicView={true} />

        {/* Footer Info */}
        <Paper
          elevation={1}
          sx={{
            p: 3,
            mt: 3,
            borderRadius: 2,
            textAlign: 'center',
            bgcolor: '#fff3e0'
          }}
        >
          <Typography variant="body1" sx={{ fontWeight: 'bold', color: '#e65100', mb: 1 }}>
            🔒 Limited Preview Mode
          </Typography>
          <Typography variant="body2" color="text.secondary">
            You're viewing a limited preview. Sign in to unlock full access to all amenity photos and detailed information.
          </Typography>
        </Paper>
      </Container>
    </Box>
  )
}

export default AmenitiesPublic
