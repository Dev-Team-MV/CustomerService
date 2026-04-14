import { useState, useEffect } from 'react'
import { Box, Container, Paper, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'
import AmenitiesMap from '@shared/components/Amenities/AmenitiesMap'
import uploadService from '@shared/services/uploadService'
import { OUTDOOR_AMENITIES } from '../../Constants/amenities'

const ISQ_SLUG = 'isq'

const AmenitiesPublic = () => {
  const { t } = useTranslation(['amenities'])
  const [amenitySections, setAmenitySections] = useState([])

  useEffect(() => {
    uploadService.getOutdoorAmenitiesBySlug(ISQ_SLUG)
      .then(data => setAmenitySections(data.outdoorAmenitySections || []))
      .catch(() => setAmenitySections([]))
  }, [])

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'white', p: 3 }}>
      <Container maxWidth="lg">
        <AmenitiesMap
          mapImage={null}
          amenities={OUTDOOR_AMENITIES}
          amenitySections={amenitySections}
          isPublicView={true}
        />
        <Paper elevation={1} sx={{ p: 3, mt: 3, borderRadius: 2, textAlign: 'center', bgcolor: '#fff3e0' }}>
          <Typography variant="body1" sx={{ fontWeight: 'bold', color: '#e65100', mb: 1 }}>
            🔒 {t('limitedPreview', 'Vista previa limitada')}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t('limitedPreviewDesc', 'Inicia sesión para ver todas las amenidades y sus imágenes.')}
          </Typography>
        </Paper>
      </Container>
    </Box>
  )
}

export default AmenitiesPublic