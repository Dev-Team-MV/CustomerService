import { useState, useMemo } from 'react'
import {
  Box, Typography, Stack, Stepper, Step,
  StepLabel, StepConnector, stepConnectorClasses,
  MenuItem, Select, InputLabel, FormControl,
  Chip, TextField, styled
} from '@mui/material'
import {
  Apartment, People, AttachMoney,
  TuneRounded, CheckCircle
} from '@mui/icons-material'
import PriceInput from '@shared/constants/PriceInput'
import ModalWrapper from '@shared/constants/ModalWrapper'
import PrimaryButton from '@shared/constants/PrimaryButton'

// Stepper styles
const BlueConnector = styled(StepConnector)(() => ({
  [`&.${stepConnectorClasses.alternativeLabel}`]: { top: 18 },
  [`&.${stepConnectorClasses.active} .${stepConnectorClasses.line}`]: {
    background: 'linear-gradient(90deg, #1976d2, #42a5f5)'
  },
  [`&.${stepConnectorClasses.completed} .${stepConnectorClasses.line}`]: {
    background: 'linear-gradient(90deg, #1976d2, #42a5f5)'
  },
  [`& .${stepConnectorClasses.line}`]: {
    height: 3,
    border: 0,
    backgroundColor: '#e0e0e0',
    borderRadius: 4
  }
}))

const StepIconRoot = styled('div')(({ ownerState }) => ({
  width: 36,
  height: 36,
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontFamily: '"Poppins", sans-serif',
  fontWeight: 700,
  fontSize: '0.85rem',
  transition: 'all 0.3s ease',
  ...(ownerState.completed ? {
    background: 'linear-gradient(135deg, #1976d2, #42a5f5)',
    color: 'white',
    boxShadow: '0 4px 12px rgba(25,118,210,0.35)'
  } : ownerState.active ? {
    background: 'linear-gradient(135deg, #1976d2, #42a5f5)',
    color: 'white',
    boxShadow: '0 4px 16px rgba(25,118,210,0.45)',
    transform: 'scale(1.1)'
  } : {
    bgcolor: '#f5f5f5',
    border: '2px solid #e0e0e0',
    color: '#706f6f'
  })
}))

const StepIcon = ({ active, completed, icon, icons }) => (
  <StepIconRoot ownerState={{ active, completed }}>
    {completed ? <CheckCircle sx={{ fontSize: 18 }} /> : icons[String(icon)]}
  </StepIconRoot>
)

const selectSx = {
  borderRadius: 3,
  fontFamily: '"Poppins", sans-serif',
  '& .MuiOutlinedInput-notchedOutline': { borderColor: '#e0e0e0' },
  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#42a5f5' },
  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#1976d2' }
}

const fieldSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: 3,
    fontFamily: '"Poppins", sans-serif',
    '& fieldset': { borderColor: '#e0e0e0' },
    '&:hover fieldset': { borderColor: '#42a5f5' },
    '&.Mui-focused fieldset': { borderColor: '#1976d2' }
  },
  '& .MuiInputLabel-root': { fontFamily: '"Poppins", sans-serif' },
  '& .MuiInputLabel-root.Mui-focused': { color: '#1976d2' }
}

const STEPS = [
  { label: 'Assignment', icon: <Apartment sx={{ fontSize: 16 }} /> },
  { label: 'Pricing', icon: <AttachMoney sx={{ fontSize: 16 }} /> },
  { label: 'Details', icon: <TuneRounded sx={{ fontSize: 16 }} /> }
]

const STEP_ICONS = {
  '1': <Apartment sx={{ fontSize: 16 }} />,
  '2': <AttachMoney sx={{ fontSize: 16 }} />,
  '3': <TuneRounded sx={{ fontSize: 16 }} />
}

const EditApartmentModal = ({
  open,
  onClose,
  apartment,
  values,
  onChange,
  onSave,
  saving,
  apartmentModels = [],
  users = []
}) => {
  const [step, setStep] = useState(0)
  const isLast = step === STEPS.length - 1
  const isFirst = step === 0

  const handleNext = () => setStep(s => Math.min(s + 1, STEPS.length - 1))
  const handleBack = () => setStep(s => Math.max(s - 1, 0))
  const handleClose = () => {
    setStep(0)
    onClose()
  }
  const handleSave = async () => {
    await onSave()
    setStep(0)
  }

  const modalActions = (
    <>
      <PrimaryButton
        variant="outlined"
        onClick={isFirst ? handleClose : handleBack}
        disabled={saving}
        sx={{
          color: '#706f6f',
          border: '1.5px solid #e0e0e0',
          '&:hover': { borderColor: '#706f6f', bgcolor: 'rgba(112,111,111,0.05)' }
        }}
      >
        {isFirst ? 'Cancel' : '← Back'}
      </PrimaryButton>

      <PrimaryButton onClick={isLast ? handleSave : handleNext} loading={isLast && saving}>
        {isLast ? 'Save Changes' : 'Next →'}
      </PrimaryButton>
    </>
  )

  const stepContent = useMemo(
    () => [
      // STEP 1 - Assignment
      <Stack key="assignment" spacing={2.5}>
        <FormControl fullWidth sx={fieldSx}>
          <InputLabel>Apartment Model</InputLabel>
          <Select
            label="Apartment Model"
            value={values.apartmentModel || apartment?.apartmentModel?._id || ''}
            onChange={e => onChange({ ...values, apartmentModel: e.target.value })}
            sx={selectSx}
            startAdornment={<Apartment sx={{ color: '#1976d2', mr: 1, fontSize: 20 }} />}
          >
            {apartmentModels.map(model => (
              <MenuItem key={model._id} value={model._id} sx={{ fontFamily: '"Poppins", sans-serif' }}>
                {model.name} — {model.sqft} sqft, {model.bedrooms}BR/{model.bathrooms}BA
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
          <TextField
            label="Floor Number"
            type="number"
            value={values.floorNumber ?? apartment?.floorNumber ?? ''}
            onChange={e => onChange({ ...values, floorNumber: Number(e.target.value) })}
            fullWidth
            sx={fieldSx}
          />
          <TextField
            label="Apartment Number"
            value={values.apartmentNumber ?? apartment?.apartmentNumber ?? ''}
            onChange={e => onChange({ ...values, apartmentNumber: e.target.value })}
            fullWidth
            sx={fieldSx}
          />
        </Box>

        <TextField
          label="Floor Plan Polygon ID"
          value={values.floorPlanPolygonId ?? apartment?.floorPlanPolygonId ?? ''}
          onChange={e => onChange({ ...values, floorPlanPolygonId: e.target.value })}
          fullWidth
          sx={fieldSx}
          helperText="ID del polígono en el floor plan SVG"
        />

        <FormControl fullWidth sx={fieldSx}>
          <InputLabel>Owners</InputLabel>
          <Select
            label="Owners"
            multiple
            value={values.users || apartment?.users?.map(u => u._id) || []}
            onChange={e => onChange({ ...values, users: e.target.value })}
            sx={selectSx}
            startAdornment={<People sx={{ color: '#1976d2', mr: 1, fontSize: 20 }} />}
            renderValue={selected => (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {selected.map(id => {
                  const user = users.find(u => u._id === id)
                  return (
                    <Chip
                      key={id}
                      label={user ? `${user.firstName} ${user.lastName}` : id}
                      size="small"
                      sx={{
                        fontFamily: '"Poppins", sans-serif',
                        fontWeight: 600,
                        bgcolor: '#e3f2fd',
                        color: '#1976d2',
                        border: '1px solid rgba(25,118,210,0.3)'
                      }}
                    />
                  )
                })}
              </Box>
            )}
          >
            {users.map(user => (
              <MenuItem key={user._id} value={user._id} sx={{ fontFamily: '"Poppins", sans-serif' }}>
                {user.firstName} {user.lastName}
                <Typography variant="caption" sx={{ ml: 1, color: '#706f6f' }}>
                  {user.email}
                </Typography>
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>,

      // STEP 2 - Pricing
      <Stack key="pricing" spacing={2.5}>
        <Box
          sx={{
            p: 3,
            borderRadius: 3,
            bgcolor: 'rgba(25,118,210,0.04)',
            border: '1.5px solid rgba(25,118,210,0.15)'
          }}
        >
          <Stack spacing={2.5}>
            <PriceInput
              label="Price"
              value={values.price ?? apartment?.price ?? ''}
              onChange={val => onChange({ ...values, price: val })}
              sx={fieldSx}
            />
            <PriceInput
              label="Initial Payment"
              value={values.initialPayment ?? apartment?.initialPayment ?? ''}
              onChange={val => onChange({ ...values, initialPayment: val })}
              sx={fieldSx}
            />
            <PriceInput
              label="Pending"
              value={values.pending ?? apartment?.pending ?? ''}
              onChange={val => onChange({ ...values, pending: val })}
              sx={fieldSx}
            />
          </Stack>
        </Box>

        {(values.price || apartment?.price) && (
          <Box
            sx={{
              p: 2.5,
              borderRadius: 3,
              background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
              color: 'white'
            }}
          >
            <Typography
              variant="caption"
              sx={{
                fontFamily: '"Poppins", sans-serif',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '1.5px',
                opacity: 0.7,
                display: 'block',
                mb: 1.5
              }}
            >
              Summary
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 2 }}>
              {[
                { label: 'Total', value: values.price ?? apartment?.price ?? 0 },
                { label: 'Paid', value: values.initialPayment ?? apartment?.initialPayment ?? 0 },
                { label: 'Pending', value: values.pending ?? apartment?.pending ?? 0 }
              ].map(item => (
                <Box key={item.label}>
                  <Typography variant="caption" sx={{ fontFamily: '"Poppins", sans-serif', opacity: 0.7 }}>
                    {item.label}
                  </Typography>
                  <Typography
                    variant="h6"
                    sx={{ fontFamily: '"Poppins", sans-serif', fontWeight: 700, fontSize: '1rem' }}
                  >
                    ${Number(item.value).toLocaleString()}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>
        )}
      </Stack>,

      // STEP 3 - Details
      <Stack key="details" spacing={2.5}>
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
          <FormControl fullWidth sx={fieldSx}>
            <InputLabel>Status</InputLabel>
            <Select
              label="Status"
              value={values.status ?? apartment?.status ?? ''}
              onChange={e => onChange({ ...values, status: e.target.value })}
              sx={selectSx}
            >
              {[
                { value: 'available', label: 'Available', color: '#8CA551' },
                { value: 'pending', label: 'Pending', color: '#E5863C' },
                { value: 'sold', label: 'Sold', color: '#1976d2' },
                { value: 'cancelled', label: 'Cancelled', color: '#d32f2f' }
              ].map(s => (
                <MenuItem key={s.value} value={s.value} sx={{ fontFamily: '"Poppins", sans-serif' }}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: s.color }} />
                    {s.label}
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth sx={fieldSx}>
            <InputLabel>Render Type</InputLabel>
            <Select
              label="Render Type"
              value={values.selectedRenderType ?? apartment?.selectedRenderType ?? ''}
              onChange={e => onChange({ ...values, selectedRenderType: e.target.value || null })}
              sx={selectSx}
            >
              <MenuItem value="" sx={{ fontFamily: '"Poppins", sans-serif' }}>
                <em>None</em>
              </MenuItem>
              <MenuItem value="basic" sx={{ fontFamily: '"Poppins", sans-serif' }}>
                Basic
              </MenuItem>
              <MenuItem value="upgrade" sx={{ fontFamily: '"Poppins", sans-serif' }}>
                Upgrade
              </MenuItem>
            </Select>
          </FormControl>
        </Box>

        <TextField
          label="Sale Date"
          type="date"
          value={
            values.saleDate
              ? values.saleDate.slice(0, 10)
              : apartment?.saleDate
              ? apartment.saleDate.slice(0, 10)
              : ''
          }
          onChange={e => onChange({ ...values, saleDate: e.target.value })}
          fullWidth
          InputLabelProps={{ shrink: true }}
          sx={fieldSx}
        />
      </Stack>
    ],
    [values, apartment, apartmentModels, users, onChange]
  )

  return (
    <ModalWrapper
      open={open}
      onClose={handleClose}
      title="Edit Apartment"
      subtitle={
        apartment?.apartmentNumber
          ? `Apt ${apartment.apartmentNumber} - Floor ${apartment.floorNumber}`
          : undefined
      }
      maxWidth="sm"
      actions={modalActions}
    >
      <Stack spacing={3} sx={{ mt: 1 }}>
        <Stepper activeStep={step} alternativeLabel connector={<BlueConnector />}>
          {STEPS.map((s, i) => (
            <Step key={s.label} completed={i < step}>
              <StepLabel
                StepIconComponent={props => <StepIcon {...props} icons={STEP_ICONS} />}
                sx={{
                  '& .MuiStepLabel-label': {
                    fontFamily: '"Poppins", sans-serif',
                    fontWeight: i === step ? 700 : 500,
                    fontSize: '0.75rem',
                    color: i === step ? '#1976d2' : '#706f6f',
                    mt: 0.5
                  }
                }}
              >
                {s.label}
              </StepLabel>
            </Step>
          ))}
        </Stepper>

        <Box sx={{ minHeight: 320 }}>{stepContent[step]}</Box>
      </Stack>
    </ModalWrapper>
  )
}

export default EditApartmentModal