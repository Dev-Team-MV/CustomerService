// @sheperd/Components/Building/BuildingOverviewTab.jsx
import { Box, Grid, Card, CardContent, Typography, Chip } from '@mui/material'
import { Layers, LocalParking, Business, Deck } from '@mui/icons-material'
import { useTheme } from '@mui/material/styles'
import { useTranslation } from 'react-i18next'
import { getFloorsByType, FLOOR_TYPES } from '@shared/config/buildingConfig'

const BuildingOverviewTab = ({ building, config }) => {
  const theme = useTheme()
  const { t } = useTranslation(['buildings'])

  const parkingFloors = getFloorsByType('sheperd', FLOOR_TYPES.PARKING)
  const commercialFloors = getFloorsByType('sheperd', FLOOR_TYPES.COMMERCIAL)
  const residentialFloors = getFloorsByType('sheperd', FLOOR_TYPES.RESIDENTIAL)
  const amenityFloors = getFloorsByType('sheperd', FLOOR_TYPES.AMENITY)

  const floorSummary = [
    {
      type: 'Parking',
      floors: parkingFloors,
      icon: LocalParking,
      color: config.colors.parking,
      count: parkingFloors.length
    },
    {
      type: 'Commercial',
      floors: commercialFloors,
      icon: Business,
      color: config.colors.commercial,
      count: commercialFloors.length
    },
    {
      type: 'Residential',
      floors: residentialFloors,
      icon: Layers,
      color: config.colors.residential,
      count: residentialFloors.length
    },
    {
      type: 'Amenities',
      floors: amenityFloors,
      icon: Deck,
      color: config.colors.amenity,
      count: amenityFloors.length
    }
  ]

  return (
    <Box>
      <Typography variant="h6" fontWeight={600} mb={3} fontFamily='"Poppins", sans-serif'>
        {t('buildings:overview.title', 'Building Overview')}
      </Typography>

      <Grid container spacing={3}>
        {floorSummary.map((item) => {
          const Icon = item.icon
          return (
            <Grid item xs={12} sm={6} md={3} key={item.type}>
              <Card
                sx={{
                  borderRadius: 3,
                  border: `2px solid ${item.color}20`,
                  boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.12)'
                  }
                }}
              >
                <CardContent>
                  <Box display="flex" alignItems="center" gap={2} mb={2}>
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: 2,
                        bgcolor: `${item.color}15`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <Icon sx={{ fontSize: 28, color: item.color }} />
                    </Box>
                    <Box>
                      <Typography variant="h4" fontWeight={700} fontFamily='"Poppins", sans-serif' color={item.color}>
                        {item.count}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" fontFamily='"Poppins", sans-serif'>
                        {item.type} Floors
                      </Typography>
                    </Box>
                  </Box>
                  <Box display="flex" gap={0.5} flexWrap="wrap">
                    {item.floors.map((floor) => (
                      <Chip
                        key={floor}
                        label={`${floor}`}
                        size="small"
                        sx={{
                          bgcolor: `${item.color}10`,
                          color: item.color,
                          fontWeight: 600,
                          fontFamily: '"Poppins", sans-serif',
                          border: `1px solid ${item.color}30`
                        }}
                      />
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          )
        })}
      </Grid>

      {building?.exteriorRenders && building.exteriorRenders.length > 0 && (
        <Box mt={4}>
          <Typography variant="h6" fontWeight={600} mb={2} fontFamily='"Poppins", sans-serif'>
            {t('buildings:overview.renders', 'Exterior Renders')}
          </Typography>
          <Grid container spacing={2}>
            {building.exteriorRenders.map((url, idx) => (
              <Grid item xs={12} sm={6} md={4} key={idx}>
                <Box
                  component="img"
                  src={url}
                  alt={`Render ${idx + 1}`}
                  sx={{
                    width: '100%',
                    height: 200,
                    objectFit: 'cover',
                    borderRadius: 3,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'scale(1.02)',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.15)'
                    }
                  }}
                />
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {building && (
        <Box mt={4}>
          <Typography variant="h6" fontWeight={600} mb={2} fontFamily='"Poppins", sans-serif'>
            {t('buildings:overview.details', 'Building Details')}
          </Typography>
          <Card sx={{ borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary" fontFamily='"Poppins", sans-serif'>
                    {t('buildings:fields.name', 'Name')}
                  </Typography>
                  <Typography variant="body1" fontWeight={600} fontFamily='"Poppins", sans-serif'>
                    {building.name || '-'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary" fontFamily='"Poppins", sans-serif'>
                    {t('buildings:fields.address', 'Address')}
                  </Typography>
                  <Typography variant="body1" fontWeight={600} fontFamily='"Poppins", sans-serif'>
                    {building.address || '-'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary" fontFamily='"Poppins", sans-serif'>
                    {t('buildings:fields.totalFloors', 'Total Floors')}
                  </Typography>
                  <Typography variant="body1" fontWeight={600} fontFamily='"Poppins", sans-serif'>
                    {building.floors || config.floors.total}

                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary" fontFamily='"Poppins", sans-serif'>
                    {t('buildings:fields.totalApartments', 'Total Apartments')}
                  </Typography>
                  <Typography variant="body1" fontWeight={600} fontFamily='"Poppins", sans-serif'>
                    {building.totalApartments || 0}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary" fontFamily='"Poppins", sans-serif'>
                    {t('buildings:fields.status', 'Status')}
                  </Typography>
                  <Chip
                    label={building.status || 'active'}
                    size="small"
                    sx={{
                      mt: 0.5,
                      bgcolor: building.status === 'active' ? '#43A04710' : '#75757510',
                      color: building.status === 'active' ? '#43A047' : '#757575',
                      fontWeight: 600,
                      fontFamily: '"Poppins", sans-serif',
                      border: building.status === 'active' ? '1px solid #43A04730' : '1px solid #75757530'
                    }}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Box>
      )}
    </Box>
  )
}

export default BuildingOverviewTab