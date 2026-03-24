// import { useState, useEffect } from 'react'
// import { Grid, TextField, MenuItem, Button, Alert, Typography } from '@mui/material'
// import { Home } from '@mui/icons-material'
// import { useTheme } from '@mui/material/styles'
// import ModalWrapper from '@shared/constants/ModalWrapper'
// import PrimaryButton from '@shared/constants/PrimaryButton'
// import FloorPlanPolygonSelectorModal from '../FloorPlanPolygonSelectorModal'

// const DEFAULT_FORM = {
//   apartmentModel: '',
//   floorNumber: '',
//   apartmentNumber: '',
//   price: '',
//   pending: '',
//   status: 'available',
// }

// const ApartmentDialog = ({
//   open,
//   onClose,
//   onSaved,
//   selectedApartment,
//   apartmentModels = [],
//   buildingFloors = 1,
//   floorPlans = [],
// }) => {
//   const theme = useTheme()
//   const [form, setForm] = useState(DEFAULT_FORM)
//   const [polygonSelectorOpen, setPolygonSelectorOpen] = useState(false)
//   const [selectedPolygonId, setSelectedPolygonId] = useState(null)


//   // --- CORRECCIÓN: floorPlans puede venir como objeto con .data ---
//   const floorPlansArray = Array.isArray(floorPlans)
//     ? floorPlans
//     : Array.isArray(floorPlans?.data)
//       ? floorPlans.data
//       : []

//   console.log('floor', floorPlansArray);
  

//   // Encuentra el floorPlan correspondiente al piso seleccionado
//   const selectedFloorPlan = floorPlansArray.find(
//     fp => Number(fp.floorNumber) === Number(form.floorNumber)
//   )

//   useEffect(() => {
//     if (open) {
//       if (selectedApartment) {
//         setForm({
//           apartmentModel: typeof selectedApartment.apartmentModel === 'object'
//             ? selectedApartment.apartmentModel._id
//             : selectedApartment.apartmentModel || '',
//           floorNumber: selectedApartment.floorNumber || '',
//           apartmentNumber: selectedApartment.apartmentNumber || '',
//           price: selectedApartment.price ?? '',
//           pending: selectedApartment.pending ?? '',
//           status: selectedApartment.status || 'available',
//         })
//         setSelectedPolygonId(selectedApartment.floorPlanPolygonId || null)
//       } else {
//         setForm(DEFAULT_FORM)
//         setSelectedPolygonId(null)
//       }
//     }
//   }, [selectedApartment, open])

//   // Cuando cambia el piso:
//   const handleChange = (field, value) => {
//     if (field === 'floorNumber') {
//       setForm(prev => ({
//         ...prev,
//         [field]: value ? Number(value) : '' // Si es vacío, deja vacío
//       }))
//       setSelectedPolygonId(null)
//     } else {
//       setForm(prev => ({
//         ...prev,
//         [field]: value
//       }))
//     }
//   }

//   const isValid =
//     form.apartmentModel &&
//     form.floorNumber &&
//     form.apartmentNumber &&
//     Number(form.price) >= 0 &&
//     Number(form.pending) >= 0 &&
//     selectedPolygonId // Ahora es obligatorio seleccionar polígono

//   const handleSubmit = () => {
//     if (!isValid) return

//     const payload = {
//       apartmentModel: form.apartmentModel,
//       floorNumber: Number(form.floorNumber),
//       apartmentNumber: form.apartmentNumber,
//       price: Number(form.price),
//       pending: Number(form.pending),
//       status: form.status,
//       floorPlanPolygonId: selectedPolygonId, // <--- CLAVE
//     }
//     if (selectedApartment?._id) {
//       payload._id = selectedApartment._id
//     }

//     onSaved(payload)
//   }

//   const fieldSx = {
//     '& .MuiOutlinedInput-root': {
//       borderRadius: 3,
//       fontFamily: '"Poppins", sans-serif',
//       bgcolor: 'white',
//       '&.Mui-focused fieldset': { borderColor: theme.palette.primary.main, borderWidth: '2px' },
//       '&:hover fieldset': { borderColor: theme.palette.secondary.main }
//     },
//     '& .MuiInputLabel-root': {
//       fontFamily: '"Poppins", sans-serif',
//       '&.Mui-focused': { color: theme.palette.primary.main }
//     }
//   }

//   const actions = (
//     <>
//       <Button
//         onClick={onClose}
//         sx={{
//           borderRadius: 3,
//           textTransform: 'none',
//           fontWeight: 600,
//           px: 3, py: 1.2,
//           color: theme.palette.text.secondary,
//           fontFamily: '"Poppins", sans-serif',
//           border: `2px solid ${theme.palette.divider}`,
//           '&:hover': {
//             bgcolor: theme.palette.action.hover,
//             borderColor: theme.palette.text.secondary
//           }
//         }}
//       >
//         Cancel
//       </Button>
//       <PrimaryButton onClick={handleSubmit} disabled={!isValid} startIcon={<Home />}>
//         {selectedApartment ? 'Update Apartment' : 'Create Apartment'}
//       </PrimaryButton>
//     </>
//   )

//   return (
//     <ModalWrapper
//       open={open}
//       onClose={onClose}
//       icon={Home}
//       title={selectedApartment ? 'Edit Apartment' : 'New Apartment'}
//       subtitle={selectedApartment ? `Editing Apartment #${selectedApartment.apartmentNumber}` : 'Define the apartment details'}
//       maxWidth="sm"
//       actions={actions}
//     >
//       <Alert
//         severity="info"
//         sx={{
//           mb: 2,
//           borderRadius: 3,
//           bgcolor: theme.palette.info.main + '14',
//           border: `1px solid ${theme.palette.info.main}4D`,
//           fontFamily: '"Poppins", sans-serif',
//           '& .MuiAlert-icon': { color: theme.palette.info.main }
//         }}
//       >
//         Fill in the details for this apartment unit.
//       </Alert>
//       <Grid container spacing={2} sx={{ mt: 0.5 }}>
//         <Grid item xs={12} sm={6}>
//           <TextField
//             select
//             required
//             fullWidth
//             label="Apartment Model"
//             value={form.apartmentModel}
//             onChange={e => handleChange('apartmentModel', e.target.value)}
//             sx={fieldSx}
//           >
//             {apartmentModels.map(model => (
//               <MenuItem key={model._id} value={model._id}>
//                 {model.name}
//               </MenuItem>
//             ))}
//           </TextField>
//         </Grid>
//         <Grid item xs={12} sm={3}>
//           <TextField
//             select
//             required
//             fullWidth
//             label="Floor Number"
//             value={form.floorNumber}
//             onChange={e => handleChange('floorNumber', e.target.value)}
//             sx={fieldSx}
//           >
//             {floorPlansArray.map(fp => (
//               <MenuItem key={fp.floorNumber} value={fp.floorNumber}>
//                 {fp.floorNumber}
//               </MenuItem>
//             ))}
//           </TextField>
//         </Grid>
//         <Grid item xs={12} sm={3}>
//           <TextField
//             required
//             fullWidth
//             label="Apartment Number"
//             value={form.apartmentNumber}
//             onChange={e => handleChange('apartmentNumber', e.target.value)}
//             sx={fieldSx}
//           />
//         </Grid>
//         <Grid item xs={12} sm={6}>
//           <TextField
//             required
//             fullWidth
//             type="number"
//             label="Price"
//             inputProps={{ min: 0 }}
//             value={form.price}
//             onChange={e => handleChange('price', e.target.value)}
//             sx={fieldSx}
//           />
//         </Grid>
//         <Grid item xs={12} sm={6}>
//           <TextField
//             required
//             fullWidth
//             type="number"
//             label="Pending"
//             inputProps={{ min: 0 }}
//             value={form.pending}
//             onChange={e => handleChange('pending', e.target.value)}
//             sx={fieldSx}
//           />
//         </Grid>
//         <Grid item xs={12}>
//           <TextField
//             select
//             fullWidth
//             label="Status"
//             value={form.status}
//             onChange={e => handleChange('status', e.target.value)}
//             sx={fieldSx}
//           >
//             <MenuItem value="available">Available</MenuItem>
//             <MenuItem value="sold">Sold</MenuItem>
//             <MenuItem value="pending">Pending</MenuItem>
//           </TextField>
//         </Grid>
//         <Grid item xs={12}>
//           <Button
//             variant="outlined"
//             fullWidth
//             disabled={!selectedFloorPlan}
//             onClick={() => setPolygonSelectorOpen(true)}
//             sx={{ mb: 1, borderRadius: 3, fontWeight: 600, fontFamily: '"Poppins", sans-serif' }}
//           >
//             {selectedPolygonId ? `Polígono seleccionado: ${selectedPolygonId}` : 'Seleccionar polígono en plano'}
//           </Button>
//           {!selectedPolygonId && (
//             <Typography variant="caption" color="error">
//               Debes seleccionar un polígono del plano del piso.
//             </Typography>
//           )}
//         </Grid>
//       </Grid>
//       <FloorPlanPolygonSelectorModal
//         open={polygonSelectorOpen}
//         onClose={() => setPolygonSelectorOpen(false)}
//         floorPlan={selectedFloorPlan}
//         selectedPolygonId={selectedPolygonId}
//         onSelectPolygon={id => {
//           setSelectedPolygonId(id)
//           setPolygonSelectorOpen(false)
//         }}
//       />
//     </ModalWrapper>
//   )
// }

// export default ApartmentDialog

import { useState, useEffect } from 'react'
import { Grid, TextField, MenuItem, Button, Alert, Typography,Box, IconButton } from '@mui/material'
import { Home } from '@mui/icons-material'
import { useTheme } from '@mui/material/styles'
import ModalWrapper from '@shared/constants/ModalWrapper'
import PrimaryButton from '@shared/constants/PrimaryButton'
import FloorPlanPolygonSelectorModal from '../FloorPlanPolygonSelectorModal'
  import uploadService from '../../../Services/uploadService'
import CloseIcon from '@mui/icons-material/Close'


const DEFAULT_FORM = {
  apartmentModel: '',
  floorNumber: '',
  apartmentNumber: '',
  price: '',
  status: 'available',
  interiorRendersBasic: [],
}

const ApartmentDialog = ({
  open,
  onClose,
  onSaved,
  selectedApartment,
  apartmentModels = [],
  buildingFloors = 1,
  floorPlans = [],
}) => {
  const theme = useTheme()
  const [form, setForm] = useState(DEFAULT_FORM)
  const [polygonSelectorOpen, setPolygonSelectorOpen] = useState(false)
  const [selectedPolygonId, setSelectedPolygonId] = useState(null)
  const [basicRenders, setBasicRenders] = useState([])

    const [upgradeRenders, setUpgradeRenders] = useState([])

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
        })
        setSelectedPolygonId(selectedApartment.floorPlanPolygonId || null)
        setBasicRenders(selectedApartment.interiorRendersBasic || [])
        setUpgradeRenders(selectedApartment.interiorRendersUpgrade || [])
      } else {
        setForm(DEFAULT_FORM)
        setSelectedPolygonId(null)
        setBasicRenders([])
        setUpgradeRenders([])
      }
    }
  }, [selectedApartment, open])

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
      interiorRendersUpgrade: upgradeRenders, // <--- NUEVO
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
        Cancel
      </Button>
      <PrimaryButton onClick={handleSubmit} disabled={!isValid} startIcon={<Home />}>
        {selectedApartment ? 'Update Apartment' : 'Create Apartment'}
      </PrimaryButton>
    </>
  )

  return (
    <ModalWrapper
      open={open}
      onClose={onClose}
      icon={Home}
      title={selectedApartment ? 'Edit Apartment' : 'New Apartment'}
      subtitle={selectedApartment ? `Editing Apartment #${selectedApartment.apartmentNumber}` : 'Define the apartment details'}
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
        Fill in the details for this apartment unit.
      </Alert>
      <Grid container spacing={2} sx={{ mt: 0.5 }}>
        <Grid item xs={12} sm={6}>
          <TextField
            select
            required
            fullWidth
            label="Apartment Model"
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
            label="Floor Number"
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
            label="Apartment Number"
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
            label="Price"
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
            label="Status"
            value={form.status}
            onChange={e => handleChange('status', e.target.value)}
            sx={fieldSx}
          >
            <MenuItem value="available">Available</MenuItem>
            <MenuItem value="sold">Sold</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
          </TextField>
        </Grid>
        <Grid item xs={12}>
          <Button
            variant="outlined"
            fullWidth
            disabled={!selectedFloorPlan}
            onClick={() => setPolygonSelectorOpen(true)}
            sx={{ mb: 1, borderRadius: 3, fontWeight: 600, fontFamily: '"Poppins", sans-serif' }}
          >
            {selectedPolygonId ? `Polígono seleccionado: ${selectedPolygonId}` : 'Seleccionar polígono en plano'}
          </Button>
          {!selectedPolygonId && (
            <Typography variant="caption" color="error">
              Debes seleccionar un polígono del plano del piso.
            </Typography>
          )}
        </Grid>
        <Grid item xs={12}>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
            Interior Renders (Basic)
          </Typography>
          <Button
            variant="contained"
            component="label"
            sx={{ mb: 1, borderRadius: 3, fontWeight: 600, fontFamily: '"Poppins", sans-serif' }}
          >
            Upload Images
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
            Interior Renders (Upgrade)
          </Typography>
          <Button
            variant="contained"
            component="label"
            sx={{ mb: 1, borderRadius: 3, fontWeight: 600, fontFamily: '"Poppins", sans-serif' }}
          >
            Upload Images
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
      />
    </ModalWrapper>
  )
}

export default ApartmentDialog