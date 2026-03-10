import { Box, Container, Typography, Paper, Button } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import AmenitiesMap from '../components/property/AmenitiesMap'
import { useTranslation } from 'react-i18next';

const AmenitiesPublic = () => {
  const navigate = useNavigate()
  const { t } = useTranslation(['amenities']);

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
            🔒 {t('limitedPreview')}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t('limitedPreviewDesc')}
          </Typography>
        </Paper>
      </Container>
    </Box>
  )
}

export default AmenitiesPublic
