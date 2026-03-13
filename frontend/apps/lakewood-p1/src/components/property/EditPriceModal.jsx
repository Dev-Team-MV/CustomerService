import { useState, useMemo }     from 'react'
import {
  Box, Typography, Stack, Stepper, Step,
  StepLabel, StepConnector, stepConnectorClasses,
  MenuItem, Select, InputLabel, FormControl,
  Chip, Checkbox, FormControlLabel, TextField, styled
} from '@mui/material'
import {
  HomeWork, People, House, Storefront,
  AttachMoney, TuneRounded, CheckCircle
} from '@mui/icons-material'
import PriceInput    from '@shared/constants/PriceInput'
import ModalWrapper  from '../../constants/ModalWrapper'
import PrimaryButton from '../../constants/PrimaryButton'

// ── stepper styles ─────────────────────────────────────────
const GreenConnector = styled(StepConnector)(() => ({
  [`&.${stepConnectorClasses.alternativeLabel}`]: { top: 18 },
  [`&.${stepConnectorClasses.active} .${stepConnectorClasses.line}`]:    { background: 'linear-gradient(90deg, #333F1F, #8CA551)' },
  [`&.${stepConnectorClasses.completed} .${stepConnectorClasses.line}`]: { background: 'linear-gradient(90deg, #333F1F, #8CA551)' },
  [`& .${stepConnectorClasses.line}`]: {
    height: 3, border: 0,
    backgroundColor: '#e0e0e0',
    borderRadius: 4
  }
}))

const StepIconRoot = styled('div')(({ ownerState }) => ({
  width: 36, height: 36, borderRadius: '50%',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  fontFamily: '"Poppins", sans-serif', fontWeight: 700, fontSize: '0.85rem',
  transition: 'all 0.3s ease',
  ...(ownerState.completed ? {
    background: 'linear-gradient(135deg, #333F1F, #8CA551)',
    color: 'white', boxShadow: '0 4px 12px rgba(140,165,81,0.35)'
  } : ownerState.active ? {
    background: 'linear-gradient(135deg, #333F1F, #8CA551)',
    color: 'white', boxShadow: '0 4px 16px rgba(140,165,81,0.45)',
    transform: 'scale(1.1)'
  } : {
    bgcolor: '#f5f5f5', border: '2px solid #e0e0e0', color: '#706f6f'
  })
}))

const StepIcon = ({ active, completed, icon, icons }) => (
  <StepIconRoot ownerState={{ active, completed }}>
    {completed
      ? <CheckCircle sx={{ fontSize: 18 }} />
      : icons[String(icon)]
    }
  </StepIconRoot>
)

// ── field styles ───────────────────────────────────────────
const selectSx = {
  borderRadius: 3,
  fontFamily: '"Poppins", sans-serif',
  '& .MuiOutlinedInput-notchedOutline': { borderColor: '#e0e0e0' },
  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#8CA551' },
  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#333F1F' }
}

const fieldSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: 3,
    fontFamily: '"Poppins", sans-serif',
    '& fieldset': { borderColor: '#e0e0e0' },
    '&:hover fieldset': { borderColor: '#8CA551' },
    '&.Mui-focused fieldset': { borderColor: '#333F1F' }
  },
  '& .MuiInputLabel-root': { fontFamily: '"Poppins", sans-serif' },
  '& .MuiInputLabel-root.Mui-focused': { color: '#333F1F' }
}

// ── step definitions ───────────────────────────────────────
const STEPS = [
  { label: 'Assignment', icon: <HomeWork sx={{ fontSize: 16 }} /> },
  { label: 'Pricing',    icon: <AttachMoney sx={{ fontSize: 16 }} /> },
  { label: 'Details',    icon: <TuneRounded sx={{ fontSize: 16 }} /> },
]

const STEP_ICONS = {
  '1': <HomeWork sx={{ fontSize: 16 }} />,
  '2': <AttachMoney sx={{ fontSize: 16 }} />,
  '3': <TuneRounded sx={{ fontSize: 16 }} />,
}

// ── component ──────────────────────────────────────────────
const EditPropertyModal = ({
  open, onClose,
  property, values, onChange, onSave, saving,
  lots = [], models = [], facades = [], users = [],
}) => {
  const [step, setStep] = useState(0)
  const isLast  = step === STEPS.length - 1
  const isFirst = step === 0

  const handleNext = () => setStep(s => Math.min(s + 1, STEPS.length - 1))
  const handleBack = () => setStep(s => Math.max(s - 1, 0))

  const handleClose = () => { setStep(0); onClose() }
  const handleSave  = async () => { await onSave(); setStep(0) }

  // ── actions ──────────────────────────────────────────────
  const modalActions = (
    <>
      <PrimaryButton
        variant="outlined"
        onClick={isFirst ? handleClose : handleBack}
        disabled={saving}
        sx={{
          color: '#706f6f', border: '1.5px solid #e0e0e0',
          '&:hover': { borderColor: '#706f6f', bgcolor: 'rgba(112,111,111,0.05)' }
        }}
      >
        {isFirst ? 'Cancel' : '← Back'}
      </PrimaryButton>

      <PrimaryButton
        onClick={isLast ? handleSave : handleNext}
        loading={isLast && saving}
      >
        {isLast ? 'Save Changes' : 'Next →'}
      </PrimaryButton>
    </>
  )

  // ── step content ─────────────────────────────────────────
  const stepContent = useMemo(() => [

    // STEP 1 — Assignment
    <Stack key="assignment" spacing={2.5}>
      <FormControl fullWidth sx={fieldSx}>
        <InputLabel>Lot</InputLabel>
        <Select
          label="Lot"
          value={values.lot || property?.lot?._id || ''}
          onChange={e => onChange({ ...values, lot: e.target.value })}
          sx={selectSx}
          startAdornment={<HomeWork sx={{ color: '#8CA551', mr: 1, fontSize: 20 }} />}
        >
          {lots
            .filter(l => l.status === 'available' || l._id === property?.lot?._id)
            .sort((a, b) => Number(a.number) - Number(b.number))
            .map(lot => (
              <MenuItem key={lot._id} value={lot._id} sx={{ fontFamily: '"Poppins", sans-serif' }}>
                Lot {lot.number} — ${lot.price?.toLocaleString()}
              </MenuItem>
            ))}
        </Select>
      </FormControl>

      <FormControl fullWidth sx={fieldSx}>
        <InputLabel>Model</InputLabel>
        <Select
          label="Model"
          value={values.model || property?.model?._id || ''}
          onChange={e => onChange({ ...values, model: e.target.value })}
          sx={selectSx}
          startAdornment={<House sx={{ color: '#8CA551', mr: 1, fontSize: 20 }} />}
        >
          {models.map(model => (
            <MenuItem key={model._id} value={model._id} sx={{ fontFamily: '"Poppins", sans-serif' }}>
              {model.model} — {model.sqft} sqft
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl fullWidth sx={fieldSx}>
        <InputLabel>Facade</InputLabel>
        <Select
          label="Facade"
          value={values.facade || ''}
          onChange={e => onChange({ ...values, facade: e.target.value })}
          sx={selectSx}
          startAdornment={<Storefront sx={{ color: '#8CA551', mr: 1, fontSize: 20 }} />}
        >
          {facades.map(facade => (
            <MenuItem key={facade._id} value={facade._id} sx={{ fontFamily: '"Poppins", sans-serif' }}>
              {facade.title}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl fullWidth sx={fieldSx}>
        <InputLabel>Owners</InputLabel>
        <Select
          label="Owners" multiple
          value={values.users || property?.users?.map(u => u._id) || []}
          onChange={e => onChange({ ...values, users: e.target.value })}
          sx={selectSx}
          startAdornment={<People sx={{ color: '#8CA551', mr: 1, fontSize: 20 }} />}
          renderValue={selected => (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {selected.map(id => {
                const user = users.find(u => u._id === id)
                return (
                  <Chip key={id}
                    label={user ? `${user.firstName} ${user.lastName}` : id}
                    size="small"
                    sx={{
                      fontFamily: '"Poppins", sans-serif', fontWeight: 600,
                      bgcolor: '#e8f5ee', color: '#333F1F',
                      border: '1px solid rgba(140,165,81,0.3)'
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
              <Typography variant="caption" sx={{ ml: 1, color: '#706f6f' }}>{user.email}</Typography>
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Stack>,

    // STEP 2 — Pricing
    <Stack key="pricing" spacing={2.5}>
      <Box sx={{
        p: 3, borderRadius: 3,
        bgcolor: 'rgba(140,165,81,0.04)',
        border: '1.5px solid rgba(140,165,81,0.15)'
      }}>
        <Stack spacing={2.5}>
          <PriceInput
            label="Price"
            value={values.price ?? property?.price ?? ''}
            onChange={val => onChange({ ...values, price: val })}
            sx={fieldSx}
          />
          <PriceInput
            label="Initial Payment"
            value={values.initialPayment ?? property?.initialPayment ?? ''}
            onChange={val => onChange({ ...values, initialPayment: val })}
            sx={fieldSx}
          />
          <PriceInput
            label="Pending"
            value={values.pending ?? property?.pending ?? ''}
            onChange={val => onChange({ ...values, pending: val })}
            sx={fieldSx}
          />
        </Stack>
      </Box>

      {/* Live summary */}
      {(values.price || property?.price) && (
        <Box sx={{
          p: 2.5, borderRadius: 3,
          background: 'linear-gradient(135deg, #333F1F 0%, #4a5d3a 100%)',
          color: 'white'
        }}>
          <Typography variant="caption" sx={{
            fontFamily: '"Poppins", sans-serif', fontWeight: 600,
            textTransform: 'uppercase', letterSpacing: '1.5px',
            opacity: 0.7, display: 'block', mb: 1.5
          }}>
            Summary
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 2 }}>
            {[
              { label: 'Total',    value: values.price           ?? property?.price           ?? 0 },
              { label: 'Paid',     value: values.initialPayment  ?? property?.initialPayment  ?? 0 },
              { label: 'Pending',  value: values.pending         ?? property?.pending         ?? 0 },
            ].map(item => (
              <Box key={item.label}>
                <Typography variant="caption" sx={{ fontFamily: '"Poppins", sans-serif', opacity: 0.7 }}>
                  {item.label}
                </Typography>
                <Typography variant="h6" sx={{ fontFamily: '"Poppins", sans-serif', fontWeight: 700, fontSize: '1rem' }}>
                  ${Number(item.value).toLocaleString()}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      )}
    </Stack>,

    // STEP 3 — Details
    <Stack key="details" spacing={2.5}>
      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
        <FormControl fullWidth sx={fieldSx}>
          <InputLabel>Status</InputLabel>
          <Select
            label="Status"
            value={values.status ?? property?.status ?? ''}
            onChange={e => onChange({ ...values, status: e.target.value })}
            sx={selectSx}
          >
            {[
              { value: 'active',    label: 'Active',    color: '#8CA551' },
              { value: 'pending',   label: 'Pending',   color: '#E5863C' },
              { value: 'sold',      label: 'Sold',      color: '#333F1F' },
              { value: 'cancelled', label: 'Cancelled', color: '#d32f2f' },
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
          <InputLabel>Model Type</InputLabel>
          <Select
            label="Model Type"
            value={values.modelType ?? property?.modelType ?? 'basic'}
            onChange={e => onChange({ ...values, modelType: e.target.value })}
            sx={selectSx}
          >
            <MenuItem value="basic"   sx={{ fontFamily: '"Poppins", sans-serif' }}>Basic</MenuItem>
            <MenuItem value="upgrade" sx={{ fontFamily: '"Poppins", sans-serif' }}>Upgrade</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <TextField
        label="Sale Date"
        type="date"
        value={
          values.saleDate      ? values.saleDate.slice(0, 10)
          : property?.saleDate ? property.saleDate.slice(0, 10)
          : ''
        }
        onChange={e => onChange({ ...values, saleDate: e.target.value })}
        fullWidth
        InputLabelProps={{ shrink: true }}
        sx={fieldSx}
      />

      <Box sx={{
        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2,
        p: 2.5, borderRadius: 3,
        bgcolor: '#fafafa', border: '1.5px solid #f0f0f0'
      }}>
        {[
          { key: 'hasBalcony', label: 'Has Balcony' },
          { key: 'hasStorage', label: 'Has Storage' },
        ].map(opt => (
          <FormControlLabel
            key={opt.key}
            control={
              <Checkbox
                checked={values[opt.key] ?? property?.[opt.key] ?? false}
                onChange={e => onChange({ ...values, [opt.key]: e.target.checked })}
                sx={{ color: '#8CA551', '&.Mui-checked': { color: '#333F1F' } }}
              />
            }
            label={
              <Typography sx={{ fontFamily: '"Poppins", sans-serif', fontWeight: 600, fontSize: '0.875rem', color: '#333F1F' }}>
                {opt.label}
              </Typography>
            }
          />
        ))}
      </Box>
    </Stack>,

  // eslint-disable-next-line react-hooks/exhaustive-deps
  ], [values, property, lots, models, facades, users])

  // ── render ────────────────────────────────────────────────
  return (
    <ModalWrapper
      open={open}
      onClose={handleClose}
      title="Edit Property"
      subtitle={property?.lot?.number ? `Lot #${property.lot.number}` : undefined}
      maxWidth="sm"
      actions={modalActions}
    >
      <Stack spacing={3} sx={{ mt: 1 }}>

        {/* STEPPER */}
        <Stepper
          activeStep={step}
          alternativeLabel
          connector={<GreenConnector />}
        >
          {STEPS.map((s, i) => (
            <Step key={s.label} completed={i < step}>
              <StepLabel
                StepIconComponent={(props) => (
                  <StepIcon {...props} icons={STEP_ICONS} />
                )}
                sx={{
                  '& .MuiStepLabel-label': {
                    fontFamily: '"Poppins", sans-serif',
                    fontWeight: i === step ? 700 : 500,
                    fontSize: '0.75rem',
                    color: i === step ? '#333F1F' : '#706f6f',
                    mt: 0.5
                  }
                }}
              >
                {s.label}
              </StepLabel>
            </Step>
          ))}
        </Stepper>

        {/* STEP CONTENT */}
        <Box sx={{ minHeight: 320 }}>
          {stepContent[step]}
        </Box>

      </Stack>
    </ModalWrapper>
  )
}

export default EditPropertyModal