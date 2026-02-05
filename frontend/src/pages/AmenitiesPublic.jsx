import { Box, Container, Typography, Paper, Button } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import AmenitiesMap from '../components/property/AmenitiesMap'

const AmenitiesPublic = () => {
  const navigate = useNavigate()

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: 'white',
        p: 3
      }}
    >
      <Container maxWidth="lg">
        {/* Header Section */}

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
