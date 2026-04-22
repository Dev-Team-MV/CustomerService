// @sheperd/Components/Building/BuildingConfigTab.jsx
import { Box, Card, CardContent, Typography, Button, Grid, Chip } from '@mui/material'
import { Edit, Info } from '@mui/icons-material'
import { useTheme } from '@mui/material/styles'
import { useTranslation } from 'react-i18next'

const BuildingConfigTab = ({ building, config, onEdit }) => {
  const theme = useTheme()
  const { t } = useTranslation(['buildings'])

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h6" fontWeight={600} fontFamily='"Poppins", sans-serif'>
          {t('buildings:config.title', 'Building Configuration')}
        </Typography>
        <Button
          variant="contained"
          startIcon={<Edit />}
          onClick={onEdit}
          sx={{
            background: theme.palette.gradient,
            fontFamily: '"Poppins", sans-serif',
            fontWeight: 600,
            textTransform: 'none',
            borderRadius: 2,
            px: 3
          }}
        >
          {t('buildings:actions.edit', 'Edit Building')}
        </Button>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
            <CardContent>
              <Typography variant="subtitle1" fontWeight={600} mb={2} fontFamily='"Poppins", sans-serif'>
                {t('buildings:config.general', 'General Information')}
              </Typography>
              <Box display="flex" flexDirection="column" gap={2}>
                <Box>
                  <Typography variant="caption" color="text.secondary" fontFamily='"Poppins", sans-serif'>
                    {t('buildings:fields.name', 'Name')}
                  </Typography>
                  <Typography variant="body1" fontWeight={600} fontFamily='"Poppins", sans-serif'>
                    {building?.name || '-'}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" fontFamily='"Poppins", sans-serif'>
                    {t('buildings:fields.address', 'Address')}
                  </Typography>
                  <Typography variant="body1" fontWeight={600} fontFamily='"Poppins", sans-serif'>
                    {building?.address || '-'}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" fontFamily='"Poppins", sans-serif'>
                    {t('buildings:fields.status', 'Status')}
                  </Typography>
                  <Chip
                    label={building?.status || 'active'}
                    size="small"
                    sx={{
                      mt: 0.5,
                      bgcolor: '#43A04710',
                      color: '#43A047',
                      fontWeight: 600,
                      fontFamily: '"Poppins", sans-serif',
                      border: '1px solid #43A04730'
                    }}
                  />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
            <CardContent>
              <Typography variant="subtitle1" fontWeight={600} mb={2} fontFamily='"Poppins", sans-serif'>
                {t('buildings:config.structure', 'Structure Configuration')}
              </Typography>
              <Box display="flex" flexDirection="column" gap={2}>
                <Box>
                  <Typography variant="caption" color="text.secondary" fontFamily='"Poppins", sans-serif'>
                    {t('buildings:fields.totalFloors', 'Total Floors')}
                  </Typography>
                  <Typography variant="body1" fontWeight={600} fontFamily='"Poppins", sans-serif'>
                    {building.floors || config.floors.total}

                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" fontFamily='"Poppins", sans-serif'>
                    {t('buildings:fields.parkingFloors', 'Parking Floors')}
                  </Typography>
                  <Typography variant="body1" fontWeight={600} fontFamily='"Poppins", sans-serif'>
                    {config.floors.parking?.floors.join(', ')}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" fontFamily='"Poppins", sans-serif'>
                    {t('buildings:fields.commercialFloors', 'Commercial Floors')}
                  </Typography>
                  <Typography variant="body1" fontWeight={600} fontFamily='"Poppins", sans-serif'>
                    {config.floors.commercial?.floors.join(', ')}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" fontFamily='"Poppins", sans-serif'>
                    {t('buildings:fields.residentialFloors', 'Residential Floors')}
                  </Typography>
                  <Typography variant="body1" fontWeight={600} fontFamily='"Poppins", sans-serif'>
                    {config.floors.residential?.floors.join(', ')}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" fontFamily='"Poppins", sans-serif'>
                    {t('buildings:fields.amenityFloors', 'Amenity Floors')}
                  </Typography>
                  <Typography variant="body1" fontWeight={600} fontFamily='"Poppins", sans-serif'>
                    {config.floors.amenities?.floors.join(', ')}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', bgcolor: '#F7931E10', border: '1px solid #F7931E30' }}>
            <CardContent>
              <Box display="flex" gap={2}>
                <Info sx={{ color: '#F7931E' }} />
                <Box>
                  <Typography variant="subtitle2" fontWeight={600} fontFamily='"Poppins", sans-serif' color="#F7931E" mb={1}>
                    {t('buildings:config.note', 'Configuration Note')}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" fontFamily='"Poppins", sans-serif'>
                    {t('buildings:config.noteDesc', 'Floor configuration is defined in the buildingConfig.js file. To modify the structure (add/remove floors, change types), update the configuration file and restart the application.')}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}

export default BuildingConfigTab