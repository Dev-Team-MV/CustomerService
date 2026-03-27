import {
  Box, Typography, Button, Paper
} from '@mui/material'
import { Home } from '@mui/icons-material'
import useModalState from '@shared/hooks/useModalState'
import ApartmentDialog from '../ApartmentDialog'
import ApartmentCard from './ApartmentCard'

const BuildingApartmentsTab = ({
  apartments,
  apartmentModels,
  building,
  onApartmentSaved,
  apartmentModal,
  handleOpenApartment,
  handleCloseApartment,

}) => {

  return (
    <Box>
      <Typography variant="h6" sx={{ fontWeight: 700, fontFamily: '"Poppins", sans-serif', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <Home sx={{ color: 'secondary.main' }} />
        Apartments
      </Typography>

      <Button
        variant="outlined"
        startIcon={<Home />}
        onClick={() => handleOpenApartment()}
        sx={{
          mb: 2,
          borderRadius: 2,
          textTransform: 'none',
          fontFamily: '"Poppins", sans-serif',
          fontWeight: 600
        }}
      >
        Create Apartment
      </Button>

      {apartments.length === 0 ? (
        <Typography
          variant="body2"
          sx={{ color: 'text.secondary', fontFamily: '"Poppins", sans-serif' }}
        >
          No apartments created yet. Total expected: {building.totalApartments}
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
  {apartments.map(apt => (
    <ApartmentCard
      key={apt._id}
      apartment={apt}
      modelName={
        typeof apt.apartmentModel === 'object'
          ? apt.apartmentModel?.name
          : apartmentModels.find(m => m._id === apt.apartmentModel)?.name || 'N/A'
      }
      onEdit={handleOpenApartment}
    />
  ))}
</Box>
      )}

      <ApartmentDialog
        open={apartmentModal.open}
        onClose={handleCloseApartment}
        onSaved={onApartmentSaved}
        selectedApartment={
          apartmentModal.data
            ? {
                ...apartmentModal.data,
                apartmentModel: typeof apartmentModal.data.apartmentModel === 'object'
                  ? apartmentModal.data.apartmentModel._id
                  : apartmentModal.data.apartmentModel
              }
            : null
        }
        apartmentModels={apartmentModels}
        buildingFloors={building.floors}
        floorPlans={building.floorPlans}
      />
    </Box>
  )
}

export default BuildingApartmentsTab