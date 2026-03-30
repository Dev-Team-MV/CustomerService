import {
  Grid,
  TextField,
  MenuItem,
  Typography,
  Alert
} from '@mui/material'
import { CloudUpload, Upload, CheckCircle, Info } from '@mui/icons-material'
import { useTranslation } from 'react-i18next'
import ModalWrapper from '../../constants/ModalWrapper'
import PrimaryButton from '../../constants/PrimaryButton'

const paymentTypes = [
  "initial down payment",
  "complementary down payment",
  "monthly payment",
  "additional payment",
  "closing payment"
]
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
const UserCreatePayload = ({
  open,
  onClose,
  onSubmit,
  paymentForm,
  handlePaymentFormChange,
  uploadingPayment
}) => {
  const { t } = useTranslation(['payloads', 'common']);
  return (
    <ModalWrapper
      open={open}
      onClose={onClose}
      icon={CloudUpload}
      title={t('payloads:add')}
      subtitle={t('payloads:submitInfo')}
      actions={
        <>
          <PrimaryButton
            onClick={onSubmit}
            disabled={uploadingPayment || !paymentForm.amount || !paymentForm.type}
            startIcon={<CheckCircle />}
            loading={uploadingPayment}
          >
            {uploadingPayment ? t('payloads:uploading') : t('payloads:submit')}
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
            label={t('payloads:paymentAmount')}
            type="number"
            value={paymentForm.amount}
            onChange={(e) => handlePaymentFormChange("amount", e.target.value)}
            InputProps={{
              startAdornment: (
                <Typography sx={{ mr: 0.5, fontSize: "0.875rem", color: "primary.main", fontWeight: 600 }}>
                  $
                </Typography>
              ),
            }}
            required
            sx={fieldSx}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            select
            label={t('payloads:paymentType')}
            value={paymentForm.type || ""}
            onChange={e => handlePaymentFormChange("type", e.target.value)}
            required
            sx={fieldSx}
          >
            {paymentTypes.map((type) => (
              <MenuItem key={type} value={type} sx={{ textTransform: 'capitalize' }}>
                {type.split(' ').map(word =>
                  word.charAt(0).toUpperCase() + word.slice(1)
                ).join(' ')}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label={t('payloads:paymentDate')}
            type="date"
            value={paymentForm.date}
            onChange={(e) => handlePaymentFormChange("date", e.target.value)}
            InputLabelProps={{ shrink: true }}
            required
            sx={fieldSx}
          />
        </Grid>
        <Grid item xs={12}>
          <PrimaryButton
            variant="outlined"
            component="label"
            startIcon={<Upload />}
            color="secondary"
          >
            {t('payloads:uploadReceipt')}
            <input
              type="file"
              hidden
              accept="image/*,application/pdf"
              onChange={(e) => handlePaymentFormChange("support", e.target.files[0])}
            />
          </PrimaryButton>
          {paymentForm.support && (
            <Alert severity="success" sx={{ mt: 2 }} icon={<CheckCircle />}>
              <Typography variant="body2" fontWeight="600">
                {t('payloads:fileSelected', { name: paymentForm.support.name })}
              </Typography>
            </Alert>
          )}
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label={t('payloads:notes')}
            multiline
            rows={3}
            value={paymentForm.notes}
            onChange={(e) => handlePaymentFormChange("notes", e.target.value)}
            placeholder={t('payloads:notesPlaceholder')}
            sx={fieldSx}
          />
        </Grid>
      </Grid>
      <Alert severity="info" sx={{ mt: 3 }} icon={<Info />}>
        <Typography variant="body2">
          {t('payloads:reviewInfo')}
        </Typography>
      </Alert>
    </ModalWrapper>
  )
}

export default UserCreatePayload