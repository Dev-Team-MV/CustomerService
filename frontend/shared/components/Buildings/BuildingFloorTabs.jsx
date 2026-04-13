import { Box, Typography, Grid, Card, CardMedia, CardContent, Chip, Button, Paper } from '@mui/material'
import { Edit, GridOn, ImageNotSupported } from '@mui/icons-material'
import { useTheme } from '@mui/material/styles'
import { useTranslation } from 'react-i18next'
import { isCommercialFloor, getBuildingConfig } from '@shared/config/buildingConfig'
import FloorPlanEditor from '@shared/components/Buildings/FloorPlanEditor'

const BuildingFloorTabs = ({
  building,
  projectSlug,
  apartmentModels,
  floorPlanModal,
  handleOpenFloorPlanEditor,
  handleCloseFloorPlanEditor,
  onSaveFloorPlans,
}) => {
  const theme = useTheme()
  const { t } = useTranslation(['buildings', 'common'])
  const config = getBuildingConfig(projectSlug)

  const floorPlans = building?.floorPlans || []
  const totalFloors = building?.floors || 0

  const getFloorLabel = (floorNumber) => {
    if (isCommercialFloor(projectSlug, floorNumber)) {
      return { label: config.i18n.commercialLabel || 'Commercial', color: config.colors.commercial || theme.palette.warning.main }
    }
    return { label: config.i18n.residentialLabel || 'Residential', color: config.colors.residential || theme.palette.success.main }
  }

  return (
    <Box>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
        <Box display="flex" alignItems="center" gap={1}>
          <GridOn sx={{ fontSize: 20, color: theme.palette.accent?.main || theme.palette.primary.main }} />
          <Typography variant="h6" sx={{ fontWeight: 700, fontFamily: '"Poppins", sans-serif' }}>
            {t('buildings:floorPlans', 'Floor Plans')}
          </Typography>
          <Chip
            label={`${floorPlans.length} / ${totalFloors}`}
            size="small"
            sx={{ fontFamily: '"Poppins", sans-serif', fontWeight: 600, bgcolor: theme.palette.chipAdmin?.bg, color: theme.palette.chipAdmin?.color }}
          />
        </Box>
        {floorPlans.length > 0 && (
          <Button
            variant="outlined"
            size="small"
            startIcon={<Edit />}
            onClick={handleOpenFloorPlanEditor}
            sx={{ borderRadius: 2, textTransform: 'none', fontFamily: '"Poppins", sans-serif', fontWeight: 600 }}
          >
            {t('buildings:editPolygonsAllFloors', 'Edit Polygons')}
          </Button>
        )}
      </Box>

      {floorPlans.length === 0 ? (
        <Paper elevation={0} sx={{ p: 4, textAlign: 'center', borderRadius: 3, border: `2px dashed ${theme.palette.divider}`, bgcolor: theme.palette.background.default }}>
          <GridOn sx={{ fontSize: 48, color: theme.palette.divider, mb: 1 }} />
          <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontFamily: '"Poppins", sans-serif' }}>
            {t('buildings:noFloorPlans', 'No floor plans uploaded yet')}
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={2.5}>
          {floorPlans
            .sort((a, b) => a.floorNumber - b.floorNumber)
            .map((fp) => {
              const { label, color } = getFloorLabel(fp.floorNumber)
              return (
                <Grid item xs={12} sm={6} md={4} key={fp.floorNumber}>
                  <Card elevation={0} sx={{ borderRadius: 3, border: `1px solid ${theme.palette.cardBorder}`, overflow: 'hidden', transition: 'box-shadow 0.2s', '&:hover': { boxShadow: `0 4px 20px ${color}33` } }}>
                    {fp.url ? (
                      <CardMedia component="img" height="200" image={fp.url} alt={`Floor ${fp.floorNumber}`} sx={{ objectFit: 'cover' }} />
                    ) : (
                      <Box sx={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: theme.palette.background.default }}>
                        <ImageNotSupported sx={{ fontSize: 40, color: theme.palette.divider }} />
                      </Box>
                    )}
                    <CardContent sx={{ pb: '12px !important' }}>
                      <Box display="flex" alignItems="center" justifyContent="space-between">
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, fontFamily: '"Poppins", sans-serif' }}>
                          Floor {fp.floorNumber}
                        </Typography>
                        <Chip label={label} size="small" sx={{ fontFamily: '"Poppins", sans-serif', fontWeight: 600, fontSize: '0.7rem', bgcolor: color + '22', color: color }} />
                      </Box>
                      {fp.polygons?.length > 0 && (
                        <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontFamily: '"Poppins", sans-serif' }}>
                          {fp.polygons.length} {t('buildings:polygons', 'polygons')}
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              )
            })}
        </Grid>
      )}

      <FloorPlanEditor
        open={floorPlanModal.open}
        onClose={handleCloseFloorPlanEditor}
        floorPlans={floorPlans}
        apartmentModels={apartmentModels}
        onSave={onSaveFloorPlans}
      />
    </Box>
  )
}

export default BuildingFloorTabs