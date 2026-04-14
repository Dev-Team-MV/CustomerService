import {
  Box, Typography, Button
} from '@mui/material'
import { ViewModule, Business } from '@mui/icons-material'
// import ApartmentModelDialog from '../ApartmenModelDialog'
import ApartmentModelDialog from '@shared/components/Buildings/ApartmenModelDialog' 
import ModelCard from './ModelCard'
import { useTranslation } from 'react-i18next'
const BuildingModelsTab = ({
  apartmentModels,
  modelModal,
  handleOpenModelDialog,
  handleCloseModelDialog,
  onModelSaved,
  buildingId,
  buildingTotalApartments
}) => {  
  const { t } = useTranslation(['buildings', 'common'])
  return(
  <Box>
    <Typography
      variant="h6"
      sx={{
        fontWeight: 700,
        fontFamily: '"Poppins", sans-serif',
        mb: 2,
        display: 'flex',
        alignItems: 'center',
        gap: 1
      }}
    >
      <ViewModule sx={{ color: 'info.main' }} />
        {t('buildings:apartmentModels')}
    </Typography>

    <Button
      variant="outlined"
      startIcon={<Business />}
      onClick={() => handleOpenModelDialog()}
      sx={{
        mb: 2,
        borderRadius: 2,
        textTransform: 'none',
        fontFamily: '"Poppins", sans-serif',
        fontWeight: 600
      }}
    >
        {t('buildings:createApartmentModel', 'Create Apartment Model')}
    </Button>

    {apartmentModels.length === 0 ? (
      <Typography
        variant="body2"
        sx={{
          color: 'text.secondary',
          fontFamily: '"Poppins", sans-serif',
          mt: 2
        }}
      >
          {t('buildings:noApartmentModels', 'No apartment models created yet')}
      </Typography>
    ) : (
    <Box
  sx={{
    mt: 2,
    display: 'grid',
    gridTemplateColumns: {
      xs: '1fr',
      sm: 'repeat(auto-fill, minmax(320px, 1fr))',
      md: 'repeat(auto-fill, minmax(340px, 1fr))',
      lg: 'repeat(auto-fill, minmax(360px, 1fr))'
    },
    gap: { xs: 2.5, sm: 3, md: 4 },
    alignItems: 'stretch'
  }}
>
      {apartmentModels.map(model => (
        <ModelCard key={model._id} model={model} onEdit={handleOpenModelDialog} />
      ))}
    </Box>
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
)}

export default BuildingModelsTab