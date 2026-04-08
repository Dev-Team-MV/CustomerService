import { Box, Typography, Grid, Paper, Chip, Button, Divider, Stack } from '@mui/material'
import { Image as ImageIcon, Edit, InfoOutlined, Domain, Apartment, Layers, CalendarToday } from '@mui/icons-material'
import { useTheme } from '@mui/material/styles'
import { useTranslation } from 'react-i18next'
import { getBuildingConfig } from '@shared/config/buildingConfig'
import ExteriorPolygonEditor from '@shared/components/Buildings/ExteriorPolygonEditor'

const InfoRow = ({ icon: Icon, label, value }) => {
  const theme = useTheme()
  return (
    <Box display="flex" alignItems="center" gap={1.5} py={1}>
      <Icon sx={{ fontSize: 18, color: theme.palette.text.secondary }} />
      <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontFamily: '"Poppins", sans-serif', minWidth: 120 }}>
        {label}
      </Typography>
      <Typography variant="body2" sx={{ fontWeight: 600, fontFamily: '"Poppins", sans-serif' }}>
        {value ?? '—'}
      </Typography>
    </Box>
  )
}

const BuildingOverviewTab = ({
  building,
  projectSlug,
  exteriorModal,
  handleSaveExteriorPolygons,
}) => {
  const theme = useTheme()
  const { t } = useTranslation(['buildings', 'common'])
  const config = getBuildingConfig(projectSlug)

  const exteriorRenders = building?.exteriorRenders || []

  return (
    <Box>
      <Grid container spacing={3}>
        {/* Exterior Renders */}
        <Grid item xs={12} md={7}>
          <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: `1px solid ${theme.palette.cardBorder}`, bgcolor: theme.palette.cardBg, height: '100%' }}>
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
              <Box display="flex" alignItems="center" gap={1}>
                <ImageIcon sx={{ fontSize: 20, color: theme.palette.secondary.main }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 700, fontFamily: '"Poppins", sans-serif' }}>
                  {t('buildings:exteriorRenders', 'Exterior Renders')}
                </Typography>
              </Box>
              {exteriorRenders.length > 0 && (
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<Edit />}
                  onClick={exteriorModal.openModal}
                  sx={{ borderRadius: 2, textTransform: 'none', fontFamily: '"Poppins", sans-serif', fontWeight: 600 }}
                >
                  {t('buildings:editPolygons', 'Edit Polygons')}
                </Button>
              )}
            </Box>

            {exteriorRenders.length === 0 ? (
              <Box sx={{ py: 4, textAlign: 'center' }}>
                <ImageIcon sx={{ fontSize: 48, color: theme.palette.divider, mb: 1 }} />
                <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontFamily: '"Poppins", sans-serif' }}>
                  {t('buildings:noExteriorRenders', 'No exterior renders uploaded')}
                </Typography>
              </Box>
            ) : (
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 2 }}>
                {exteriorRenders.map((url, idx) => (
                  <Box key={idx} sx={{ borderRadius: 2, overflow: 'hidden', height: 160, border: `1px solid ${theme.palette.divider}` }}>
                    <img src={url} alt={`Render ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </Box>
                ))}
              </Box>
            )}

            {/* Polygon count */}
            {(building?.buildingFloorPolygons?.length > 0) && (
              <Box mt={2}>
                <Chip
                  size="small"
                  label={`${building.buildingFloorPolygons.length} ${t('buildings:polygons', 'polygons')}`}
                  sx={{ fontFamily: '"Poppins", sans-serif', fontWeight: 600, bgcolor: config.colors.primary + '18', color: config.colors.primary }}
                />
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Building Info */}
        <Grid item xs={12} md={5}>
          <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: `1px solid ${theme.palette.cardBorder}`, bgcolor: theme.palette.cardBg, height: '100%' }}>
            <Box display="flex" alignItems="center" gap={1} mb={2}>
              <InfoOutlined sx={{ fontSize: 20, color: theme.palette.secondary.main }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 700, fontFamily: '"Poppins", sans-serif' }}>
                {t('buildings:buildingInfo', 'Building Info')}
              </Typography>
            </Box>
            <Stack divider={<Divider />}>
              <InfoRow icon={Domain} label={t('buildings:project', 'Project')} value={building?.project?.name} />
              {building?.section && <InfoRow icon={Domain} label={t('buildings:section', 'Section')} value={building.section} />}
              <InfoRow icon={Layers} label={t('buildings:floors', 'Floors')} value={building?.floors} />
              <InfoRow icon={Apartment} label={t('buildings:totalApartments', 'Apartments')} value={building?.totalApartments} />
              <InfoRow icon={CalendarToday} label={t('buildings:status', 'Status')} value={building?.status} />
            </Stack>

            {/* Building type chip */}
            <Box mt={2}>
              <Chip
                label={config.buildingType?.replace('_', ' ')}
                size="small"
                sx={{ fontFamily: '"Poppins", sans-serif', fontWeight: 600, textTransform: 'capitalize', bgcolor: config.colors.accent + '22', color: config.colors.accent }}
              />
            </Box>
          </Paper>
        </Grid>
      </Grid>

      <ExteriorPolygonEditor
        open={exteriorModal.open}
        onClose={exteriorModal.closeModal}
        exteriorUrl={exteriorRenders[0] || null}
        polygons={building?.buildingFloorPolygons || []}
        onSave={handleSaveExteriorPolygons}
      />
    </Box>
  )
}

export default BuildingOverviewTab