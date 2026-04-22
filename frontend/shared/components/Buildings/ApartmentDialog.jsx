import { useState, useEffect } from 'react'
import { Grid, TextField, MenuItem, Button, Alert, Typography, Box, IconButton, Chip } from '@mui/material'
import { Home, LocalParking } from '@mui/icons-material' // ✅ Agregar LocalParking
import { useTheme } from '@mui/material/styles'
import ModalWrapper from '@shared/constants/ModalWrapper'
import PrimaryButton from '@shared/constants/PrimaryButton'
import FloorPlanPolygonSelectorModal from '@shared/components/Buildings/FloorPlanPolygonSelectorModal'
import ParkingSpotSelectorDialog from '@shared/components/Buildings/Parking/ParkingSpotSelectorDialog' // ✅ NUEVO
import uploadService from '@shared/services/uploadService'
import parkingSpotService from '@shared/services/parkingSpotService' // ✅ NUEVO
import CloseIcon from '@mui/icons-material/Close'
import { useTranslation } from 'react-i18next'

const DEFAULT_FORM = {
  apartmentModel: '',
  floorNumber: '',
  apartmentNumber: '',
  price: '',
  status: 'available',
  interiorRendersBasic: [],
  parkingSpot: null, // ✅ NUEVO
}

const ApartmentDialog = ({
  open,
  onClose,
  onSaved,
  selectedApartment,
  apartmentModels = [],
  buildingId, // ✅ Asegurarse que esté aquí
  buildingFloors = 1,
  floorPlans = [],
  existingApartments = [], 
}) => {
  const { t } = useTranslation(['buildings', 'common'])
  const theme = useTheme()
  const [form, setForm] = useState(DEFAULT_FORM)
  const [polygonSelectorOpen, setPolygonSelectorOpen] = useState(false)
  const [selectedPolygonId, setSelectedPolygonId] = useState(null)

const [basicRenders, setBasicRenders] = useState([])
const [upgradeRenders, setUpgradeRenders] = useState([])
const [parkingSpots, setParkingSpots] = useState([]) // ✅ NUEVO
const [selectedParkingSpot, setSelectedParkingSpot] = useState(null) // ✅ NUEVO
const [parkingSelectorOpen, setParkingSelectorOpen] = useState(false) // ✅ NUEVO

  const floorPlansArray = Array.isArray(floorPlans)
    ? floorPlans
    : Array.isArray(floorPlans?.data)
      ? floorPlans.data
      : []

  const selectedFloorPlan = floorPlansArray.find(
    fp => Number(fp.floorNumber) === Number(form.floorNumber)
  )

useEffect(() => {
  if (open) {
    if (selectedApartment) {
      // ✅ ACTUALIZADO: Obtener parking spot del array parkingSpots
      const parkingSpotData = selectedApartment.parkingSpots?.[0] || selectedApartment.parkingSpot
      const parkingSpotId = parkingSpotData?._id || parkingSpotData || null
      
      setForm({
        apartmentModel: typeof selectedApartment.apartmentModel === 'object'
          ? selectedApartment.apartmentModel._id
          : selectedApartment.apartmentModel || '',
        floorNumber: selectedApartment.floorNumber || '',
        apartmentNumber: selectedApartment.apartmentNumber || '',
        price: selectedApartment.price ?? '',
        status: selectedApartment.status || 'available',
        interiorRendersBasic: selectedApartment.interiorRendersBasic || [],
        interiorRendersUpgrade: selectedApartment.interiorRendersUpgrade || [],
        parkingSpot: parkingSpotId, // ✅ ACTUALIZADO
      })
      setSelectedPolygonId(selectedApartment.floorPlanPolygonId || null)
      setBasicRenders(selectedApartment.interiorRendersBasic || [])
      setUpgradeRenders(selectedApartment.interiorRendersUpgrade || [])
      setSelectedParkingSpot(parkingSpotData || null) // ✅ ACTUALIZADO: Guardar el objeto completo
    } else {
      setForm(DEFAULT_FORM)
      setSelectedPolygonId(null)
      setBasicRenders([])
      setUpgradeRenders([])
      setSelectedParkingSpot(null)
    }
  }
}, [selectedApartment, open])

  // ✅ NUEVO: Fetch available parking spots
useEffect(() => {
  const fetchParkingSpots = async () => {
    if (open && buildingId) {
      try {
        const spots = await parkingSpotService.getByBuilding(buildingId)
        setParkingSpots(spots)
      } catch (error) {
        console.error('Error fetching parking spots:', error)
      }
    }
  }
  fetchParkingSpots()
}, [open, buildingId])

  const handleChange = (field, value) => {
    if (field === 'floorNumber') {
      setForm(prev => ({
        ...prev,
        [field]: value ? Number(value) : ''
      }))
      setSelectedPolygonId(null)
    } else {
      setForm(prev => ({
        ...prev,
        [field]: value
      }))
    }
  }

  // ✅ NUEVO: Handler para seleccionar parking spot
const handleSelectParkingSpot = (spotId) => {
  const spot = parkingSpots.find(s => s._id === spotId)
  setSelectedParkingSpot(spot)
  setForm(prev => ({ ...prev, parkingSpot: spotId }))
  setParkingSelectorOpen(false)
}

  // Manejo de subida de renders básicos
  
  const handleUpgradeRendersChange = async (e) => {
    const files = Array.from(e.target.files)
    const urls = await uploadService.uploadApartmentInteriorImages(files, 'upgrade')
    setUpgradeRenders(urls)
    setForm(prev => ({
      ...prev,
      interiorRendersUpgrade: urls
    }))
  }

  
  const handleBasicRendersChange = async (e) => {
    const files = Array.from(e.target.files)
    // Sube las imágenes al bucket y obtén las URLs
    const urls = await uploadService.uploadApartmentInteriorImages(files, 'basic')
    setBasicRenders(urls)
    setForm(prev => ({
      ...prev,
      interiorRendersBasic: urls
    }))
  }

  const isValid =
    form.apartmentModel &&
    form.floorNumber &&
    form.apartmentNumber &&
    Number(form.price) >= 0 &&
    selectedPolygonId

const handleSubmit = () => {
  if (!isValid) return

  const payload = {
    apartmentModel: form.apartmentModel,
    floorNumber: Number(form.floorNumber),
    apartmentNumber: form.apartmentNumber,
    price: Number(form.price),
    status: form.status,
    floorPlanPolygonId: selectedPolygonId,
    interiorRendersBasic: basicRenders,
    interiorRendersUpgrade: upgradeRenders,
    parkingSpot: form.parkingSpot || null, // ✅ NUEVO
  }
  if (selectedApartment?._id) {
    payload._id = selectedApartment._id
  }

  onSaved(payload)
}

  const fieldSx = {
    '& .MuiOutlinedInput-root': {
      borderRadius: 3,
      fontFamily: '"Poppins", sans-serif',
      bgcolor: 'white',
      '&.Mui-focused fieldset': { borderColor: theme.palette.primary.main, borderWidth: '2px' },
      '&:hover fieldset': { borderColor: theme.palette.secondary.main }
    },
    '& .MuiInputLabel-root': {
      fontFamily: '"Poppins", sans-serif',
      '&.Mui-focused': { color: theme.palette.primary.main }
    }
  }

  const actions = (
    <>
      <Button
        onClick={onClose}
        sx={{
          borderRadius: 3,
          textTransform: 'none',
          fontWeight: 600,
          px: 3, py: 1.2,
          color: theme.palette.text.secondary,
          fontFamily: '"Poppins", sans-serif',
          border: `2px solid ${theme.palette.divider}`,
          '&:hover': {
            bgcolor: theme.palette.action.hover,
            borderColor: theme.palette.text.secondary
          }
        }}
      >
                {t('common:cancel', 'Cancelar')}

      </Button>
      <PrimaryButton onClick={handleSubmit} disabled={!isValid} startIcon={<Home />}>
        {selectedApartment ? t('buildings:updateApartment', 'Actualizar Departamento') : t('buildings:createApartment', 'Crear Departamento')}
      </PrimaryButton>
    </>
  )

  return (
    <ModalWrapper
      open={open}
      onClose={onClose}
      icon={Home}
      title={selectedApartment ? t('buildings:editApartment', 'Editar Departamento') : t('buildings:newApartment', 'Nuevo Departamento')}
      subtitle={selectedApartment ? t('buildings:editingApartment', { num: selectedApartment.apartmentNumber }, 'Editando Departamento #{{num}}') : t('buildings:defineApartment', 'Define los detalles del departamento')}
      maxWidth="sm"
      actions={actions}
    
    >
      <Alert
        severity="info"
        sx={{
          mb: 2,
          borderRadius: 3,
          bgcolor: theme.palette.info.main + '14',
          border: `1px solid ${theme.palette.info.main}4D`,
          fontFamily: '"Poppins", sans-serif',
          '& .MuiAlert-icon': { color: theme.palette.info.main }
        }}
      >
        {t('buildings:fillApartmentDetails', 'Completa los detalles para esta unidad de departamento.')}
      </Alert>
      <Grid container spacing={2} sx={{ mt: 0.5 }}>
        <Grid item xs={12} sm={6}>
          <TextField
            select
            required
            fullWidth
            label={t('buildings:apartmentModel', 'Modelo de Departamento')}
            value={form.apartmentModel}
            onChange={e => handleChange('apartmentModel', e.target.value)}
            sx={fieldSx}
          >
            {apartmentModels.map(model => (
              <MenuItem key={model._id} value={model._id}>
                {model.name}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid item xs={12} sm={3}>
          <TextField
            select
            required
            fullWidth
            label={t('buildings:floorNumber', 'Número de Piso')}
            value={form.floorNumber}
            onChange={e => handleChange('floorNumber', e.target.value)}
            sx={fieldSx}
          >
            {floorPlansArray.map(fp => (
              <MenuItem key={fp.floorNumber} value={fp.floorNumber}>
                {fp.floorNumber}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid item xs={12} sm={3}>
          <TextField
            required
            fullWidth
            label={t('buildings:apartmentNumber', 'Número de Departamento')}
            value={form.apartmentNumber}
            onChange={e => handleChange('apartmentNumber', e.target.value)}
            sx={fieldSx}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            required
            fullWidth
            type="number"
            label={t('buildings:price', 'Precio')}
            inputProps={{ min: 0 }}
            value={form.price}
            onChange={e => handleChange('price', e.target.value)}
            sx={fieldSx}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            select
            fullWidth
            label={t('buildings:status', 'Estatus')}
            value={form.status}
            onChange={e => handleChange('status', e.target.value)}
            sx={fieldSx}
          >
            <MenuItem value="available">{t('buildings:available', 'Disponible')}</MenuItem>
            <MenuItem value="sold">{t('buildings:sold', 'Vendido')}</MenuItem>
            <MenuItem value="pending">{t('buildings:pending', 'Pendiente')}</MenuItem>
          </TextField>
        </Grid>

{/* Sección informativa de Parking Spot */}
<Grid item xs={12}>
  <Box
    sx={{
      p: 2,
      borderRadius: 2,
      border: '1px solid',
      borderColor: selectedParkingSpot ? theme.palette.success.main + '40' : theme.palette.divider,
      bgcolor: selectedParkingSpot ? theme.palette.success.main + '08' : theme.palette.background.default,
    }}
  >
    <Box display="flex" alignItems="center" gap={1} mb={selectedParkingSpot ? 1 : 0}>
      <LocalParking 
        sx={{ 
          fontSize: 20, 
          color: selectedParkingSpot ? theme.palette.success.main : theme.palette.text.secondary 
        }} 
      />
      <Typography 
        variant="subtitle2" 
        sx={{ 
          fontWeight: 600, 
          fontFamily: '"Poppins", sans-serif',
          color: selectedParkingSpot ? theme.palette.success.main : theme.palette.text.secondary
        }}
      >
        {t('buildings:parkingSpot', 'Parqueadero')}
      </Typography>
    </Box>
    
    {selectedParkingSpot ? (
      <Box sx={{ pl: 4 }}>
        <Box display="flex" gap={2} flexWrap="wrap">
          <Box>
            <Typography variant="caption" color="text.secondary" fontFamily='"Poppins", sans-serif'>
              {t('buildings:code', 'Código')}
            </Typography>
            <Typography variant="body2" fontWeight={600} fontFamily='"Poppins", sans-serif'>
              {selectedParkingSpot.code}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary" fontFamily='"Poppins", sans-serif'>
              {t('buildings:type', 'Tipo')}
            </Typography>
            <Typography variant="body2" fontWeight={600} fontFamily='"Poppins", sans-serif' sx={{ textTransform: 'capitalize' }}>
              {selectedParkingSpot.spotType}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary" fontFamily='"Poppins", sans-serif'>
              {t('buildings:floor', 'Piso')}
            </Typography>
            <Typography variant="body2" fontWeight={600} fontFamily='"Poppins", sans-serif'>
              {selectedParkingSpot.floorNumber}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary" fontFamily='"Poppins", sans-serif'>
              {t('buildings:status', 'Estado')}
            </Typography>
            <Chip 
              label={selectedParkingSpot.status} 
              size="small"
              sx={{
                height: 20,
                fontSize: '0.7rem',
                fontWeight: 600,
                fontFamily: '"Poppins", sans-serif',
                bgcolor: theme.palette.success.main + '20',
                color: theme.palette.success.main
              }}
            />
          </Box>
        </Box>
        {selectedParkingSpot.notes && (
          <Box mt={1}>
            <Typography variant="caption" color="text.secondary" fontFamily='"Poppins", sans-serif'>
              {t('buildings:notes', 'Notas')}
            </Typography>
            <Typography variant="body2" fontFamily='"Poppins", sans-serif'>
              {selectedParkingSpot.notes}
            </Typography>
          </Box>
        )}
      </Box>
    ) : (
      <Typography 
        variant="body2" 
        color="text.secondary" 
        fontFamily='"Poppins", sans-serif'
        sx={{ pl: 4 }}
      >
        {t('buildings:noParkingAssigned', 'No hay parqueadero asignado. Asigna desde la pestaña de Parking.')}
      </Typography>
    )}
  </Box>
</Grid>

<Grid item xs={12}>
  <Button
    variant="outlined"
    fullWidth
    disabled={!selectedFloorPlan}
    onClick={() => setPolygonSelectorOpen(true)}
    sx={{ mb: 1, borderRadius: 3, fontWeight: 600, fontFamily: '"Poppins", sans-serif' }}
  >
    {selectedPolygonId
      ? t('buildings:selectedPolygon', { id: selectedPolygonId }, 'Polígono seleccionado: {{id}}')
      : t('buildings:selectPolygon', 'Seleccionar polígono en plano')}
  </Button>
  {!selectedPolygonId && (
    <Typography variant="caption" color="error">
      {t('buildings:mustSelectPolygon', 'Debes seleccionar un polígono del plano del piso.')}
    </Typography>
  )}
</Grid>
<Grid item xs={12}>
  <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
    {t('buildings:interiorRendersBasic', 'Interior Renders (Básico)')}
  </Typography>
  <Button
    variant="contained"
    component="label"
    sx={{ mb: 1, borderRadius: 3, fontWeight: 600, fontFamily: '"Poppins", sans-serif' }}
  >
    {t('buildings:uploadImages', 'Subir Imágenes')}
    <input
      type="file"
      accept="image/*"
      multiple
      hidden
      onChange={handleBasicRendersChange}
    />
  </Button>
  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
    {basicRenders.map((url, idx) => (
      <Box key={idx} sx={{ position: 'relative', width: 60, height: 60, borderRadius: 2, overflow: 'hidden', border: '1px solid #e0e0e0' }}>
        <img src={url} alt={`render-basic-${idx}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        <IconButton
          size="small"
          sx={{ position: 'absolute', top: 2, right: 2, bgcolor: '#fff8', zIndex: 1 }}
          onClick={() => {
            const newRenders = basicRenders.filter((_, i) => i !== idx)
            setBasicRenders(newRenders)
            setForm(prev => ({ ...prev, interiorRendersBasic: newRenders }))
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>
    ))}
  </Box>
</Grid>
<Grid item xs={12}>
  <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
    {t('buildings:interiorRendersUpgrade', 'Interior Renders (Upgrade)')}
  </Typography>
  <Button
    variant="contained"
    component="label"
    sx={{ mb: 1, borderRadius: 3, fontWeight: 600, fontFamily: '"Poppins", sans-serif' }}
  >
    {t('buildings:uploadImages', 'Subir Imágenes')}
    <input
      type="file"
      accept="image/*"
      multiple
      hidden
      onChange={handleUpgradeRendersChange}
    />
  </Button>
  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
    {upgradeRenders.map((url, idx) => (
      <Box key={idx} sx={{ position: 'relative', width: 60, height: 60, borderRadius: 2, overflow: 'hidden', border: '1px solid #e0e0e0' }}>
        <img src={url} alt={`render-upgrade-${idx}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        <IconButton
          size="small"
          sx={{ position: 'absolute', top: 2, right: 2, bgcolor: '#fff8', zIndex: 1 }}
          onClick={() => {
            const newRenders = upgradeRenders.filter((_, i) => i !== idx)
            setUpgradeRenders(newRenders)
            setForm(prev => ({ ...prev, interiorRendersUpgrade: newRenders }))
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>
    ))}
  </Box>
</Grid>
      </Grid>
      <FloorPlanPolygonSelectorModal
        open={polygonSelectorOpen}
        onClose={() => setPolygonSelectorOpen(false)}
        floorPlan={selectedFloorPlan}
        selectedPolygonId={selectedPolygonId}
        onSelectPolygon={id => {
          setSelectedPolygonId(id)
          setPolygonSelectorOpen(false)
        }}
        existingApartments={existingApartments} // ✅ NUEVO
        currentApartmentId={selectedApartment?._id} // ✅ NUEVO
      />

      <ParkingSpotSelectorDialog
        open={parkingSelectorOpen}
        onClose={() => setParkingSelectorOpen(false)}
        parkingSpots={parkingSpots}
        currentSpotId={selectedParkingSpot?._id}
        onSelect={handleSelectParkingSpot}
      />
    </ModalWrapper>
  )
}

export default ApartmentDialog