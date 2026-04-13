import { Box, Typography, Grid, Button, Paper } from '@mui/material'
import { ViewModule, Add } from '@mui/icons-material'
import { useTheme } from '@mui/material/styles'
import { useTranslation } from 'react-i18next'
import ModelCard from '@shared/components/Buildings/ModelCard'
import ApartmentModelDialog from '@shared/components/Buildings/ApartmenModelDialog'

const BuildingModelsTab = ({
  apartmentModels,
  modelModal,
  handleOpenModelDialog,
  handleCloseModelDialog,
  onModelSaved,
  buildingId,
  buildingTotalApartments,
}) => {
  const theme = useTheme()
  const { t } = useTranslation(['buildings', 'common'])

  return (
    <Box>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
        <Box display="flex" alignItems="center" gap={1}>
          <ViewModule sx={{ fontSize: 20, color: theme.palette.info.main }} />
          <Typography variant="h6" sx={{ fontWeight: 700, fontFamily: '"Poppins", sans-serif' }}>
            {t('buildings:apartmentModels', 'Apartment Models')}
          </Typography>
        </Box>
        <Button
          variant="outlined"
          size="small"
          startIcon={<Add />}
          onClick={() => handleOpenModelDialog(null)}
          sx={{ borderRadius: 2, textTransform: 'none', fontFamily: '"Poppins", sans-serif', fontWeight: 600 }}
        >
          {t('buildings:addModel', 'Add Model')}
        </Button>
      </Box>

      {apartmentModels.length === 0 ? (
        <Paper elevation={0} sx={{ p: 4, textAlign: 'center', borderRadius: 3, border: `2px dashed ${theme.palette.divider}`, bgcolor: theme.palette.background.default }}>
          <ViewModule sx={{ fontSize: 48, color: theme.palette.divider, mb: 1 }} />
          <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontFamily: '"Poppins", sans-serif' }}>
            {t('buildings:noModels', 'No apartment models yet')}
          </Typography>
          <Button size="small" onClick={() => handleOpenModelDialog(null)} sx={{ mt: 1.5, textTransform: 'none', fontFamily: '"Poppins", sans-serif', fontWeight: 600 }}>
            {t('buildings:addFirstModel', 'Add first model')}
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={2.5}>
          {apartmentModels.map((model, idx) => (
            <Grid item xs={12} sm={6} md={4} key={model._id}>
              <ModelCard model={model} onEdit={() => handleOpenModelDialog(model)} />
            </Grid>
          ))}
        </Grid>
      )}

      <ApartmentModelDialog
        open={modelModal.open}
        onClose={handleCloseModelDialog}
        onSaved={onModelSaved}
        selectedModel={modelModal.data}
        buildingId={buildingId}
        buildingTotalApartments={buildingTotalApartments}
        existingModels={apartmentModels}
      />
    </Box>
  )
}

export default BuildingModelsTab