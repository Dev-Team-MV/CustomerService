import { useState } from 'react'
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

// ✅ 1. Importar el autocompletado de Google Places
import GooglePlacesAutocomplete from 'react-google-places-autocomplete'

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
      fontFamily: '"DM Sans", sans-serif',
      "&.Mui-focused fieldset": { borderColor: theme.palette.primary.main, borderWidth: "2px" },
      "&:hover fieldset": { borderColor: theme.palette.secondary.main }
    },
    "& .MuiInputLabel-root": {
      fontFamily: '"DM Sans", sans-serif',
      "&.Mui-focused": { color: theme.palette.primary.main }
    },
    "& .MuiFormHelperText-root": { fontFamily: '"DM Sans", sans-serif' }
  }

  // ✅ 2. Manejador específico para el autocompletado de Google
  const handleCountryChange = (newValue) => {
    const countryName = newValue ? newValue.label : ''
    handleFieldChange('country', countryName)
  }

  // ✅ 3. Wrapper para el envío que incluye el log del payload
  const handleSubmit = () => {
    console.log('📦 PAYLOAD COMPLETO A ENVIAR:', JSON.stringify(formData, null, 2))
    onSubmit() 
  }

  // ── Actions (con ID para el tour) ────────────────────────
  const modalActions = (
    <Box id="resident-actions" sx={{ display: 'flex', gap: 2, width: '100%' }}>
      <Button
        onClick={onClose}
        sx={{
          borderRadius: 3,
          textTransform: "none",
          fontWeight: 600,
          px: 3,
          py: 1.2,
          color: theme.palette.text.secondary,
          fontFamily: '"DM Sans", sans-serif',
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
        onClick={handleSubmit}
        disabled={!isFormValid}
        startIcon={<PersonAdd />}
      >
        {selectedUser ? t('dialog.update') : t('dialog.sendInvitation')}
      </PrimaryButton>
    </Box>
  )

  // ✅ 4. Validación robusta para asegurar que el valor sea un string válido
  const countryValue = typeof formData.country === 'string' 
    ? formData.country 
    : (formData.country?.label || '')

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
      dialogProps={{ id: 'resident-dialog' }} // ✅ ID para el contenedor principal del modal
    >
      {/* INFO ALERT */}
      <Alert
        id="resident-info-alert" // ✅ ID para el tour
        severity="info"
        sx={{
          mb: 2,
          borderRadius: 3,
          bgcolor: theme.palette.secondary.main + "14",
          border: `1px solid ${theme.palette.secondary.main}4D`,
          fontFamily: '"DM Sans", sans-serif',
          "& .MuiAlert-icon": { color: theme.palette.secondary.main }
        }}
      >
        {t('dialog.invitationMessage')}
      </Alert>

      {/* FORM FIELDS */}
      <Grid container spacing={2} sx={{ mt: 1 }}>

        {/* ✅ Nombre y Apellido agrupados con ID */}
        <Grid item xs={12} id="resident-name-fields">
          <Grid container spacing={2}>
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
          </Grid>
        </Grid>

        {/* ✅ Email con ID */}
        <Grid item xs={12} sm={6} id="resident-email-field">
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

        {/* ✅ Teléfono con ID */}
        <Grid item xs={12} sm={6} id="resident-phone-field">
          <Box>
            <PhoneInput
              country="us"
              onlyCountries={ONLY_COUNTRIES}
              preferredCountries={PREFERRED_COUNTRIES}
              value={formData.phoneNumber}
              onChange={handlePhoneChange}
              inputProps={{ 
                name: "phone", 
                required: true,
                autoFocus: false
              }}
              containerStyle={{ width: "100%" }}
              inputStyle={{
                width: "100%",
                height: "56px",
                fontSize: "16px",
                border: `2px solid ${theme.palette.divider}`,
                borderRadius: 12,
                fontFamily: '"DM Sans", sans-serif',
                transition: "all 0.3s",
                paddingLeft: "60px"
              }}
              buttonStyle={{
                border: `2px solid ${theme.palette.divider}`,
                borderRight: "none",
                borderRadius: "12px 0 0 12px",
                backgroundColor: theme.palette.background.default
              }}
              dropdownStyle={{
                borderRadius: 12,
                fontFamily: '"DM Sans", sans-serif'
              }}
            />
            <Typography
              variant="caption"
              sx={{
                mt: 0.5,
                display: "block",
                color: theme.palette.text.secondary,
                fontFamily: '"DM Sans", sans-serif'
              }}
            >
              {t('dialog.phoneNumber')} *
            </Typography>
            {e164Value && (
              <Box display="flex" justifyContent="space-between" mt={0.5}>
                <Typography variant="caption" sx={{ fontFamily: '"DM Sans", sans-serif', color: theme.palette.text.secondary }}>
                  {displayVal}
                </Typography>
                <Typography variant="caption" sx={{ fontFamily: '"DM Sans", sans-serif', fontWeight: 700, color: isPhoneValid ? theme.palette.secondary.main : theme.palette.error.main }}>
                  E.164: {e164Value}
                </Typography>
              </Box>
            )}
          </Box>
        </Grid>

        {/* ✅ País con ID */}
        <Grid item xs={12} sm={6} id="resident-country-field">
          <GooglePlacesAutocomplete
            apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
            selectProps={{
              value: countryValue ? { label: countryValue, value: countryValue } : null,
              onChange: handleCountryChange,
              placeholder: t('dialog.selectCountry', 'Selecciona un país...'),
              styles: {
                control: (provided) => ({
                  ...provided,
                  borderRadius: 12,
                  border: `2px solid ${theme.palette.divider}`,
                  fontFamily: '"DM Sans", sans-serif',
                  minHeight: 56,
                  boxShadow: 'none',
                  '&:hover': {
                    borderColor: theme.palette.secondary.main,
                  },
                  padding: '0 14px',
                  '& .MuiInputBase-input': {
                    padding: '16.5px 14px',
                  }
                }),
                placeholder: (provided) => ({
                  ...provided,
                  color: theme.palette.text.secondary,
                }),
                menu: (provided) => ({
                  ...provided,
                  fontFamily: '"DM Sans", sans-serif',
                  borderRadius: 12,
                  marginTop: 8,
                  zIndex: 9999,
                }),
                option: (provided, state) => ({
                  ...provided,
                  fontFamily: '"DM Sans", sans-serif',
                  backgroundColor: state.isSelected ? theme.palette.primary.main : state.isFocused ? theme.palette.action.hover : 'white',
                  color: state.isSelected ? 'white' : 'black',
                  '&:active': {
                    backgroundColor: theme.palette.primary.main,
                  }
                }),
                singleValue: (provided) => ({
                  ...provided,
                  fontFamily: '"DM Sans", sans-serif',
                })
              }
            }}
            autocompletionRequest={{
              types: ['country']
            }}
            className="country-autocomplete"
          />
          <Typography
            variant="caption"
            sx={{
              mt: 0.5,
              display: "block",
              color: theme.palette.text.secondary,
              fontFamily: '"DM Sans", sans-serif'
            }}
          >
            {t('dialog.country', 'País')}
          </Typography>
        </Grid>

        {/* ✅ Fecha de Nacimiento y Rol agrupados con ID */}
        <Grid item xs={12} id="resident-birthday-role">
          <Grid container spacing={2}>
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

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label={t('dialog.role')}
                value={formData.role}
                onChange={(e) => handleFieldChange('role', e.target.value)}
                sx={fieldSx}
              >
                <MenuItem value="user" sx={{ fontFamily: '"DM Sans", sans-serif' }}>
                  {t('dialog.roles.user')}
                </MenuItem>
                <MenuItem value="admin" sx={{ fontFamily: '"DM Sans", sans-serif' }}>
                  {t('dialog.roles.admin')}
                </MenuItem>
                <MenuItem value="superadmin" sx={{ fontFamily: '"DM Sans", sans-serif' }}>
                  {t('dialog.roles.superadmin')}
                </MenuItem>
                <MenuItem value="owner" sx={{ fontFamily: '"DM Sans", sans-serif' }}>
                  {t('dialog.roles.owner')}
                </MenuItem>
              </TextField>
            </Grid>
          </Grid>
        </Grid>

        {/* Password (only when editing) */}
        {selectedUser && (
          <Grid item xs={12}>
            <TextField
              fullWidth
              type="password"
              label={t('dialog.newPassword')}
              value={formData.password || ''}
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