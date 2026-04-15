// @sheperd/Components/Building/AmenitiesTab.jsx
import { Box, Grid, Card, CardContent, Typography, Chip } from '@mui/material'
import { FitnessCenter, Pool, Deck, Work, MeetingRoom } from '@mui/icons-material'
import { useTheme } from '@mui/material/styles'
import { useTranslation } from 'react-i18next'

const AmenitiesTab = ({ building, config }) => {
  const theme = useTheme()
  const { t } = useTranslation(['buildings'])

  const amenityIcons = {
    FitnessCenter,
    Pool,
    Deck,
    Work,
    MeetingRoom
  }

  const amenities = config.floors.amenities?.types || []

  return (
    <Box>
      <Typography variant="h6" fontWeight={600} mb={3} fontFamily='"Poppins", sans-serif'>
        {t('buildings:amenities.title', 'Building Amenities')}
      </Typography>

      <Grid container spacing={3}>
        {amenities.map((amenity) => {
          const IconComponent = amenityIcons[amenity.icon] || Deck
          return (
            <Grid item xs={12} sm={6} md={4} key={amenity.id}>
              <Card
                sx={{
                  borderRadius: 3,
                  border: `2px solid ${config.colors.amenity}20`,
                  boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                    borderColor: `${config.colors.amenity}40`
                  }
                }}
              >
                <CardContent>
                  <Box display="flex" alignItems="center" gap={2} mb={2}>
                    <Box
                      sx={{
                        width: 56,
                        height: 56,
                        borderRadius: 2,
                        bgcolor: `${config.colors.amenity}15`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <IconComponent sx={{ fontSize: 32, color: config.colors.amenity }} />
                    </Box>
                    <Box flex={1}>
                      <Typography variant="h6" fontWeight={600} fontFamily='"Poppins", sans-serif'>
                        {amenity.label}
                      </Typography>
                      <Chip
                        label={`Floor ${amenity.defaultFloor}`}
                        size="small"
                        sx={{
                          mt: 0.5,
                          bgcolor: `${config.colors.amenity}10`,
                          color: config.colors.amenity,
                          fontWeight: 600,
                          fontFamily: '"Poppins", sans-serif',
                          border: `1px solid ${config.colors.amenity}30`
                        }}
                      />
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          )
        })}
      </Grid>
    </Box>
  )
}

export default AmenitiesTab