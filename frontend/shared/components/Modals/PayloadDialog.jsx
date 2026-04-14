import {
  Grid,
  TextField,
  MenuItem,
  Typography,
  Alert
} from '@mui/material'
import { AttachFile, CheckCircle } from '@mui/icons-material'
import ModalWrapper from '@shared/constants/ModalWrapper'
import PrimaryButton from '@shared/constants/PrimaryButton'
import { useTranslation } from 'react-i18next'

const statusOptions = ['pending', 'signed', 'rejected']

const fieldSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: 3,
    fontFamily: '"Poppins", sans-serif',
    '& fieldset': { borderColor: 'rgba(140,165,81,0.3)', borderWidth: '2px' },
    '&:hover fieldset': { borderColor: '#8CA551' },
    '&.Mui-focused fieldset': { borderColor: '#333F1F', borderWidth: '2px' }
  },
  '& .MuiInputLabel-root': {
    fontFamily: '"Poppins", sans-serif',
    fontWeight: 500,
    color: '#706f6f',
    '&.Mui-focused': { color: '#333F1F', fontWeight: 600 }
  },
  '& .MuiFormHelperText-root': { fontFamily: '"Poppins", sans-serif' }
}

const PayloadDialog = ({
  open,
  onClose,
  onSubmit,
  formData,
  setFormData,
  resourceType,
  resources,
  selectedPayload,
  files,
  setFiles,
  paymentTypes = [],
  loading = false,
  error = null,
}) => {
  const { t } = useTranslation(['payloads', 'common'])
  // resources: array de propiedades o apartamentos
  // resourceType: 'property' o 'apartment'
  return (
    <ModalWrapper
      open={open}
      onClose={onClose}
      icon={AttachFile}
      title={selectedPayload ? t('payloads:edit', 'Edit Payment') : t('payloads:add', 'Add Payment')}
      subtitle={t('payloads:manageDetails', 'Manage payment details')}
      actions={
        <PrimaryButton
          onClick={onSubmit}
          disabled={loading || !formData.amount || !formData[resourceType] || !formData.type}
          startIcon={<CheckCircle />}
          loading={loading}
        >
          {selectedPayload ? t('payloads:update', 'Update') : t('payloads:create', 'Create')}
        </PrimaryButton>
      }
      maxWidth="sm"
      fullWidth
    >
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Grid container spacing={2.5} sx={{ mt: 0.5 }}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            select
            label={resourceType === 'property' ? t('payloads:property', 'Property') : t('payloads:unit', 'Apartment')}
            value={formData[resourceType] || ''}
            onChange={(e) => setFormData({ ...formData, [resourceType]: e.target.value })}
            sx={fieldSx}
          >
            {resources.map((unit) => (
              <MenuItem key={unit._id} value={unit._id}>
                {resourceType === 'property'
                  ? `${t('payloads:unit', 'Unit')} ${unit.lot?.number} - ${unit.users?.[0]?.firstName || ''} ${unit.users?.[0]?.lastName || ''}`
                  : `${t('payloads:unit', 'Apt')} ${unit.apartmentNumber} - ${unit.users?.[0]?.firstName || ''} ${unit.users?.[0]?.lastName || ''}`
                }
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            type="date"
            label={t('payloads:paymentDate', 'Payment Date')}
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            InputLabelProps={{ shrink: true }}
            sx={fieldSx}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            type="number"
            label={t('payloads:amount', 'Amount')}
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
            InputProps={{
              startAdornment: (
                <Typography sx={{ mr: 0.5, fontSize: "0.875rem", color: "primary.main", fontWeight: 600 }}>$</Typography>
              ),
            }}
            sx={fieldSx}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            select
            label={t('payloads:status', 'Status')}
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            sx={fieldSx}
          >
            {statusOptions.map((status) => (
              <MenuItem key={status} value={status} sx={{ textTransform: 'capitalize' }}>
                {status}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            select
            label={t('payloads:paymentType', 'Payment Type')}
            value={formData.type || ""}
            onChange={e => setFormData({ ...formData, type: e.target.value })}
            required
            sx={fieldSx}
          >
            {paymentTypes.map((type) => (
              <MenuItem key={type} value={type} sx={{ textTransform: 'capitalize' }}>
                {type}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            multiline
            rows={3}
            label={t('payloads:notes', 'Notes')}
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            sx={fieldSx}
          />
        </Grid>
        <Grid item xs={12}>
          <PrimaryButton
            variant="outlined"
            component="label"
            startIcon={<AttachFile />}
            color="secondary"
          >
            {t('payloads:uploadImages', 'Upload Images')}
            <input
              type="file"
              hidden
              accept="image/*,application/pdf"
              multiple
              onChange={(e) => setFiles(Array.from(e.target.files))}
            />
          </PrimaryButton>
          {files && files.length > 0 && (
            <Alert severity="success" sx={{ mt: 2 }}>
              <Typography variant="body2" fontWeight="600">
                {t('payloads:filesSelected', { count: files.length }, '{{count}} file(s) selected')}
              </Typography>
            </Alert>
          )}
        </Grid>
      </Grid>
    </ModalWrapper>
  );
}

export default PayloadDialog