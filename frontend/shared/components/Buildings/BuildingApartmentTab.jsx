import { useState, useMemo } from 'react'
import { Box, Typography, Grid, Button, Paper, Chip, TextField, MenuItem } from '@mui/material'
import { Apartment, Add, FilterList } from '@mui/icons-material'
import { useTheme } from '@mui/material/styles'
import { useTranslation } from 'react-i18next'
import ApartmentCard from '@shared/components/Buildings/ApartmentCard'
import ApartmentDialog from '@shared/components/Buildings/ApartmentDialog'

const BuildingApartmentsTab = ({
  apartments,
  apartmentModels,
  building,
  apartmentModal,
  handleOpenApartment,
  handleCloseApartment,
  onApartmentSaved,
}) => {
  const theme = useTheme()
  const { t } = useTranslation(['buildings', 'common'])
  const [floorFilter, setFloorFilter] = useState('all')

  const floors = useMemo(() => {
    const nums = [...new Set(apartments.map(a => a.floor))].sort((a, b) => a - b)
    return nums
  }, [apartments])

  const filtered = useMemo(() => {
    if (floorFilter === 'all') return apartments
    return apartments.filter(a => String(a.floor) === String(floorFilter))
  }, [apartments, floorFilter])

  const stats = useMemo(() => ({
    total: apartments.length,
    available: apartments.filter(a => a.status === 'available').length,
    reserved: apartments.filter(a => a.status === 'reserved').length,
    sold: apartments.filter(a => a.status === 'sold').length,
  }), [apartments])

  return (
    <Box>
      {/* Header */}
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2} flexWrap="wrap" gap={1}>
        <Box display="flex" alignItems="center" gap={1}>
          <Apartment sx={{ fontSize: 20, color: theme.palette.secondary.main }} />
          <Typography variant="h6" sx={{ fontWeight: 700, fontFamily: '"Poppins", sans-serif' }}>
            {t('buildings:apartments', 'Apartments')}
          </Typography>
        </Box>
        <Box display="flex" alignItems="center" gap={1.5}>
          {/* Floor filter */}
          {floors.length > 1 && (
            <TextField
              select size="small"
              value={floorFilter}
              onChange={e => setFloorFilter(e.target.value)}
              sx={{ minWidth: 130, '& .MuiOutlinedInput-root': { borderRadius: 2, fontFamily: '"Poppins", sans-serif', fontSize: '0.85rem' } }}
              InputProps={{ startAdornment: <FilterList sx={{ fontSize: 16, mr: 0.5, color: theme.palette.text.secondary }} /> }}
            >
              <MenuItem value="all" sx={{ fontFamily: '"Poppins", sans-serif' }}>{t('common:allFloors', 'All Floors')}</MenuItem>
              {floors.map(f => (
                <MenuItem key={f} value={f} sx={{ fontFamily: '"Poppins", sans-serif' }}>Floor {f}</MenuItem>
              ))}
            </TextField>
          )}
          <Button
            variant="outlined" size="small" startIcon={<Add />}
            onClick={() => handleOpenApartment(null)}
            sx={{ borderRadius: 2, textTransform: 'none', fontFamily: '"Poppins", sans-serif', fontWeight: 600 }}
          >
            {t('buildings:addApartment', 'Add Apartment')}
          </Button>
        </Box>
      </Box>

      {/* Stats chips */}
      <Box display="flex" gap={1} mb={2.5} flexWrap="wrap">
        {[
          { label: `${stats.total} total`, color: 'default' },
          { label: `${stats.available} available`, color: 'success' },
          { label: `${stats.reserved} reserved`, color: 'warning' },
          { label: `${stats.sold} sold`, color: 'error' },
        ].map(({ label, color }) => (
          <Chip key={label} label={label} size="small" color={color} variant="outlined" sx={{ fontFamily: '"Poppins", sans-serif', fontWeight: 600, fontSize: '0.75rem' }} />
        ))}
      </Box>

      {/* Grid */}
      {filtered.length === 0 ? (
        <Paper elevation={0} sx={{ p: 4, textAlign: 'center', borderRadius: 3, border: `2px dashed ${theme.palette.divider}`, bgcolor: theme.palette.background.default }}>
          <Apartment sx={{ fontSize: 48, color: theme.palette.divider, mb: 1 }} />
          <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontFamily: '"Poppins", sans-serif' }}>
            {apartments.length === 0 ? t('buildings:noApartments', 'No apartments yet') : t('buildings:noApartmentsOnFloor', 'No apartments on this floor')}
          </Typography>
          {apartments.length === 0 && (
            <Button size="small" onClick={() => handleOpenApartment(null)} sx={{ mt: 1.5, textTransform: 'none', fontFamily: '"Poppins", sans-serif', fontWeight: 600 }}>
              {t('buildings:addFirstApartment', 'Add first apartment')}
            </Button>
          )}
        </Paper>
      ) : (
        <Grid container spacing={2}>
          {filtered.map((apt, idx) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={apt._id}>
 <ApartmentCard
   apartment={apt}
   modelName={apartmentModels.find(m => m._id === (apt.apartmentModel?._id || apt.apartmentModel))?.name || 'N/A'}
   onEdit={() => handleOpenApartment(apt)}
 />            </Grid>
          ))}
        </Grid>
      )}

<ApartmentDialog
  open={apartmentModal.open}
  onClose={handleCloseApartment}
  onSaved={onApartmentSaved}
  selectedApartment={apartmentModal.data}
  buildingId={building?._id}
  floorPlans={building?.floorPlans || []}
  apartmentModels={apartmentModels}
  existingApartments={apartments} // ✅ NUEVO: Pasar lista de apartamentos
/>
    </Box>
  )
}

export default BuildingApartmentsTab