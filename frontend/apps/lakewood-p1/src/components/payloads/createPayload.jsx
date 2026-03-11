import {
  Grid,
  TextField,
  MenuItem,
  Typography
} from '@mui/material'
import { AttachFile, CheckCircle } from '@mui/icons-material'
import { useTranslation } from 'react-i18next'
import ModalWrapper from '../../constants/ModalWrapper'
import PrimaryButton from '../../constants/PrimaryButton'

const paymentTypes = [
  'initial down payment',
  'complementary down payment',
  'monthly payment',
  'additional payment',
  'closing payment'
]

const statusOptions = ['pending', 'signed', 'rejected']

const PayloadDialog = ({
  open,
  onClose,
  onSubmit,
  formData,
  setFormData,
  properties,
  selectedPayload
}) => {
  const { t } = useTranslation(['payloads', 'common']);
  return (
    <ModalWrapper
      open={open}
      onClose={onClose}
      icon={AttachFile}
      title={selectedPayload ? t('payloads:editPayment') : t('payloads:addPayment')}
      subtitle={t('payloads:manageDetails')}
      actions={
        <>
          <PrimaryButton
            onClick={onSubmit}
            disabled={!formData.amount || !formData.property || !formData.type}
            startIcon={<CheckCircle />}
          >
            {selectedPayload ? t('payloads:update') : t('payloads:create')}
          </PrimaryButton>
        </>
      }
      maxWidth="sm"
      fullWidth
    >
      <Grid container spacing={2.5} sx={{ mt: 0.5 }}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            select
            label={t('payloads:property')}
            value={formData.property}
            onChange={(e) => setFormData({ ...formData, property: e.target.value })}
          >
            {properties.map((property) => (
              <MenuItem key={property._id} value={property._id}>
                {t('payloads:unit')} {property.lot?.number} - {property.users?.[0]?.firstName} {property.users?.[0]?.lastName}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            type="date"
            label={t('payloads:paymentDate')}
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            type="number"
            label={t('payloads:amount')}
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
            InputProps={{
              startAdornment: (
                <Typography sx={{ mr: 0.5, fontSize: "0.875rem", color: "primary.main", fontWeight: 600 }}>$</Typography>
              ),
            }}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            select
            label={t('payloads:status')}
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
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
            label={t('payloads:paymentType')}
            value={formData.type || ""}
            onChange={e => setFormData({ ...formData, type: e.target.value })}
            required
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
            label={t('payloads:notes')}
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          />
        </Grid>
      </Grid>
    </ModalWrapper>
  );
}

export default PayloadDialog