import { Box, Container, Typography, Paper } from '@mui/material'
import AmenitiesMap from '../components/property/AmenitiesMap'

const AmenitiesPrivate = () => {
  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4, p: 3 }}>
      {/* Header */}
      <Paper
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
      </Paper>

      {/* Map Component - Full Access */}
      <AmenitiesMap isPublicView={false} />
    </Container>
  )
}

export default AmenitiesPrivate
