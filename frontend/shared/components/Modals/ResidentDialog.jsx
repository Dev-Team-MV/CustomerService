import {
  Box,
  Typography,
  Grid,
  TextField,
  MenuItem,
  Button,
  Alert
} from '@mui/material'
import { PersonAdd } from '@mui/icons-material'
import PhoneInput from 'react-phone-input-2'
import 'react-phone-input-2/lib/style.css'
import { useTranslation } from 'react-i18next'
import { useTheme } from '@mui/material/styles'

import ModalWrapper from '../../constants/ModalWrapper'
import PrimaryButton from '../../constants/PrimaryButton'
import { ONLY_COUNTRIES, PREFERRED_COUNTRIES } from '../../hooks/useResidents'

const ResidentDialog = ({
  open,
  onClose,
  onSubmit,
  formData,
  setFormData,
  selectedUser,
  handleFieldChange,
  handlePhoneChange,
  isFormValid,
  e164Value,
  displayVal,
  isPhoneValid
}) => {
  const { t } = useTranslation('residents')
  const theme = useTheme()

  // ── Estilos reutilizables con theme ──────────────────────
  const fieldSx = {
    "& .MuiOutlinedInput-root": {
      borderRadius: 3,
      fontFamily: '"Poppins", sans-serif',
      "&.Mui-focused fieldset": { borderColor: theme.palette.primary.main, borderWidth: "2px" },
      "&:hover fieldset": { borderColor: theme.palette.secondary.main }
    },
    "& .MuiInputLabel-root": {
      fontFamily: '"Poppins", sans-serif',
      "&.Mui-focused": { color: theme.palette.primary.main }
    },
    "& .MuiFormHelperText-root": { fontFamily: '"Poppins", sans-serif' }
  }

  // ── Actions ───────────────────────────────────────────────
  const modalActions = (
    <>
      <Button
        onClick={onClose}
        sx={{
          borderRadius: 3,
          textTransform: "none",
          fontWeight: 600,
          px: 3,
          py: 1.2,
          color: theme.palette.text.secondary,
          fontFamily: '"Poppins", sans-serif',
          border: `2px solid ${theme.palette.divider}`,
          "&:hover": {
            bgcolor: theme.palette.action.hover,
            borderColor: theme.palette.text.secondary
          }
        }}
      >
        {t('dialog.cancel')}
      </Button>

      <PrimaryButton
        onClick={onSubmit}
        disabled={!isFormValid}
        startIcon={<PersonAdd />}
      >
        {selectedUser ? t('dialog.update') : t('dialog.sendInvitation')}
      </PrimaryButton>
    </>
  )

  // ── Render ────────────────────────────────────────────────
  return (
    <ModalWrapper
      open={open}
      onClose={onClose}
      icon={PersonAdd}
      title={selectedUser ? t('dialog.editUser') : t('dialog.inviteNewUser')}
      subtitle={t('dialog.invitationMessage')}
      maxWidth="md"
      actions={modalActions}
    >
      {/* INFO ALERT */}
      <Alert
        severity="info"
        sx={{
          mb: 2,
          borderRadius: 3,
          bgcolor: theme.palette.secondary.main + "14", // 8% opacity
          border: `1px solid ${theme.palette.secondary.main}4D`, // 30% opacity
          fontFamily: '"Poppins", sans-serif',
          "& .MuiAlert-icon": { color: theme.palette.secondary.main }
        }}
      >
        {t('dialog.invitationMessage')}
      </Alert>

      {/* FORM FIELDS */}
      <Grid container spacing={2} sx={{ mt: 1 }}>

        {/* First Name */}
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            required
            label={t('dialog.firstName')}
            value={formData.firstName}
            onChange={(e) => handleFieldChange('firstName', e.target.value)}
            sx={fieldSx}
          />
        </Grid>

        {/* Last Name */}
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            required
            label={t('dialog.lastName')}
            value={formData.lastName}
            onChange={(e) => handleFieldChange('lastName', e.target.value)}
            sx={fieldSx}
          />
        </Grid>

        {/* Email */}
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            required
            type="email"
            label={t('dialog.email')}
            value={formData.email}
            onChange={(e) => handleFieldChange('email', e.target.value)}
            sx={fieldSx}
          />
        </Grid>

        {/* Phone */}
        <Grid item xs={12} sm={6}>
          <Box>
            <Typography
              variant="caption"
              sx={{
                mb: 0.5,
                display: "block",
                color: theme.palette.text.secondary,
                fontFamily: '"Poppins", sans-serif'
              }}
            >
              {t('dialog.phoneNumber')} *
            </Typography>
            <PhoneInput
              country="us"
              onlyCountries={ONLY_COUNTRIES}
              preferredCountries={PREFERRED_COUNTRIES}
              value={formData.phoneNumber}
              onChange={handlePhoneChange}
              inputProps={{ name: "phone", required: true }}
              containerStyle={{ width: "100%" }}
              inputStyle={{
                width: "100%",
                height: "56px",
                fontSize: "16px",
                border: `2px solid ${theme.palette.divider}`,
                borderRadius: 12,
                fontFamily: '"Poppins", sans-serif',
                transition: "all 0.3s"
              }}
              buttonStyle={{
                border: `2px solid ${theme.palette.divider}`,
                borderRight: "none",
                borderRadius: "12px 0 0 12px",
                backgroundColor: theme.palette.background.default
              }}
              dropdownStyle={{
                borderRadius: 12,
                fontFamily: '"Poppins", sans-serif'
              }}
            />

            {e164Value && (
              <Box display="flex" justifyContent="space-between" mt={0.5}>
                <Typography
                  variant="caption"
                  sx={{
                    fontFamily: '"Poppins", sans-serif',
                    color: theme.palette.text.secondary
                  }}
                >
                  {displayVal}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    fontFamily: '"Poppins", sans-serif',
                    fontWeight: 700,
                    color: isPhoneValid ? theme.palette.secondary.main : theme.palette.error.main
                  }}
                >
                  E.164: {e164Value}
                </Typography>
              </Box>
            )}
          </Box>
        </Grid>

        {/* Birthday */}
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            type="date"
            label={t('dialog.birthday')}
            value={formData.birthday}
            onChange={(e) => handleFieldChange('birthday', e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={fieldSx}
          />
        </Grid>

        {/* Role */}
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            select
            label={t('dialog.role')}
            value={formData.role}
            onChange={(e) => handleFieldChange('role', e.target.value)}
            sx={fieldSx}
          >
            <MenuItem value="user" sx={{ fontFamily: '"Poppins", sans-serif' }}>
              {t('dialog.roles.user')}
            </MenuItem>
            <MenuItem value="admin" sx={{ fontFamily: '"Poppins", sans-serif' }}>
              {t('dialog.roles.admin')}
            </MenuItem>
            <MenuItem value="superadmin" sx={{ fontFamily: '"Poppins", sans-serif' }}>
              {t('dialog.roles.superadmin')}
            </MenuItem>
          </TextField>
        </Grid>

        {/* Password (only when editing) */}
        {selectedUser && (
          <Grid item xs={12}>
            <TextField
              fullWidth
              type="password"
              label={t('dialog.newPassword')}
              value={formData.password}
              onChange={(e) => handleFieldChange('password', e.target.value)}
              helperText={t('dialog.passwordHelper')}
              sx={fieldSx}
            />
          </Grid>
        )}

      </Grid>
    </ModalWrapper>
  )
}

export default ResidentDialog