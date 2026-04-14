import { useState } from 'react'
import { useNavigate, Link as RouterLink } from 'react-router-dom'
import {
  Box, TextField, Button, Typography, Link, Alert,
  InputAdornment, IconButton, Grid
} from '@mui/material'
import { Visibility, VisibilityOff, KeyboardArrowRight, Gavel } from '@mui/icons-material'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../context/AuthContext'
import { motion, AnimatePresence } from 'framer-motion'
import PhoneInput from 'react-phone-input-2'
import 'react-phone-input-2/lib/style.css'
import api from '../../services/api'

const RegisterForm = ({
  brandColors = { primary: '#1A237E', secondary: '#00ACC1' },
  isPasswordSetup = false,
  userData = null,
  token = null
}) => {
  const navigate = useNavigate()
  const { register: authRegister, loginWithToken } = useAuth()
  const { t } = useTranslation('auth')

  const [firstName,       setFirstName]       = useState(userData?.firstName  || '')
  const [lastName,        setLastName]        = useState(userData?.lastName   || '')
  const [email,           setEmail]           = useState(userData?.email      || '')
  const [phoneNumber,     setPhoneNumber]     = useState(userData?.phoneNumber || '')
  const [password,        setPassword]        = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword,    setShowPassword]    = useState(false)
  const [error,           setError]           = useState('')
  const [loading,         setLoading]         = useState(false)
  const [focusedField,    setFocusedField]    = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (password !== confirmPassword) { setError(t('passwordsDoNotMatch')); return }
    if (password.length < 6)          { setError(t('passwordTooShort'));     return }
    setLoading(true)
    try {
      if (isPasswordSetup) {
        const { data } = await api.post(`/auth/setup-password/${token}`, { password })
        loginWithToken(data.token, data.user)
        setTimeout(() => navigate('/dashboard'), 300)
      } else {
        const result = await authRegister(firstName, lastName, email, password, phoneNumber)
        if (result.success) navigate('/dashboard')
        else { setError(result.error || t('errorRegistering')); setLoading(false) }
      }
    } catch (err) {
      setError(err.response?.data?.message || t('loginFailed'))
      setLoading(false)
    }
  }

  const fieldSx = (field) => ({
    '& .MuiOutlinedInput-root': {
      borderRadius: 3, bgcolor: 'white', fontFamily: '"Poppins", sans-serif',
      '& fieldset': {
        borderWidth: '2px',
        borderColor: focusedField === field ? brandColors.primary : '#e0e0e0',
        transition: 'all 0.3s'
      },
      '&:hover fieldset': { borderColor: brandColors.secondary }
    },
    '& .MuiInputLabel-root': {
      fontFamily: '"Poppins", sans-serif', color: '#706f6f',
      '&.Mui-focused': { color: brandColors.primary }
    }
  })

  return (
    <Box sx={{ width: '100%', maxWidth: '450px', py: 4 }}>
      <motion.div initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.8, delay: 0.3 }}>

        <Box sx={{ mb: 5 }}>
          <Typography variant="h4" fontWeight="300" sx={{ mb: 1, color: '#706f6f', letterSpacing: '1px', fontFamily: '"Poppins", sans-serif' }}>
            {isPasswordSetup ? t('completeYour') : t('createYour')}
          </Typography>
          <Typography variant="h5" fontWeight="700" sx={{ mb: 2, color: brandColors.primary, letterSpacing: '1px', fontFamily: '"Poppins", sans-serif' }}>
            {isPasswordSetup ? t('accountSetup') : t('account')}
          </Typography>
          <motion.div initial={{ width: 0 }} animate={{ width: '60px' }} transition={{ delay: 0.8, duration: 0.8 }}>
            <Box sx={{ height: '3px', background: `linear-gradient(90deg, ${brandColors.primary}, ${brandColors.secondary})` }} />
          </motion.div>
        </Box>

        {isPasswordSetup && firstName && (
          <Alert severity="info" sx={{ mb: 3, borderRadius: 3, border: `1px solid ${brandColors.primary}4D`, bgcolor: `${brandColors.primary}14`, fontFamily: '"Poppins", sans-serif' }}>
            {t('welcomeSetupPlain', { name: firstName })}
          </Alert>
        )}

        {error && (
          <AnimatePresence>
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
              <Alert severity="error" sx={{ mb: 3, borderRadius: 3, fontFamily: '"Poppins", sans-serif' }}>{error}</Alert>
            </motion.div>
          </AnimatePresence>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={2}>

            <Grid item xs={12} sm={6}>
              <motion.div animate={{ y: focusedField === 'firstName' ? -5 : 0 }} transition={{ duration: 0.3 }}>
                <TextField required fullWidth label={t('firstName')} autoFocus={!isPasswordSetup}
                  value={firstName} onChange={e => setFirstName(e.target.value)}
                  onFocus={() => setFocusedField('firstName')} onBlur={() => setFocusedField(null)}
                  disabled={isPasswordSetup} sx={fieldSx('firstName')} />
              </motion.div>
            </Grid>

            <Grid item xs={12} sm={6}>
              <motion.div animate={{ y: focusedField === 'lastName' ? -5 : 0 }} transition={{ duration: 0.3 }}>
                <TextField required fullWidth label={t('lastName')}
                  value={lastName} onChange={e => setLastName(e.target.value)}
                  onFocus={() => setFocusedField('lastName')} onBlur={() => setFocusedField(null)}
                  disabled={isPasswordSetup} sx={fieldSx('lastName')} />
              </motion.div>
            </Grid>

            <Grid item xs={12}>
              <motion.div animate={{ y: focusedField === 'email' ? -5 : 0 }} transition={{ duration: 0.3 }}>
                <TextField required fullWidth label={t('emailAddress')} type="email"
                  value={email} onChange={e => setEmail(e.target.value)}
                  onFocus={() => setFocusedField('email')} onBlur={() => setFocusedField(null)}
                  disabled={isPasswordSetup} sx={fieldSx('email')} />
              </motion.div>
            </Grid>

            <Grid item xs={12}>
              <Box>
                <Typography variant="caption" sx={{ mb: 0.5, display: 'block', color: '#706f6f', fontFamily: '"Poppins", sans-serif' }}>
                  {isPasswordSetup ? t('phoneNumber') : t('phoneOptional')}
                </Typography>
                <PhoneInput
                  country={'us'} value={phoneNumber} onChange={setPhoneNumber} disabled={isPasswordSetup}
                  enableSearch={false} disableSearchIcon countryCodeEditable={false}
                  inputProps={{ name: 'phone', required: false, autoComplete: 'tel' }}
                  containerStyle={{ width: '100%' }}
                  inputStyle={{
                    width: '100%', height: '56px', fontSize: '16px', borderRadius: '12px',
                    border: `2px solid ${focusedField === 'phone' ? brandColors.primary : '#e0e0e0'}`,
                    transition: 'all 0.3s', backgroundColor: isPasswordSetup ? '#f5f5f5' : 'white',
                    paddingLeft: '48px', fontFamily: '"Poppins", sans-serif'
                  }}
                  buttonStyle={{
                    borderRadius: '12px 0 0 12px',
                    border: `2px solid ${focusedField === 'phone' ? brandColors.primary : '#e0e0e0'}`,
                    borderRight: 'none', backgroundColor: isPasswordSetup ? '#f5f5f5' : 'white'
                  }}
                  dropdownStyle={{ borderRadius: '12px', fontFamily: '"Poppins", sans-serif' }}
                  onFocus={() => setFocusedField('phone')} onBlur={() => setFocusedField(null)}
                  preferredCountries={['us', 'mx', 'ca']}
                />
              </Box>
            </Grid>

            <Grid item xs={12}>
              <motion.div animate={{ y: focusedField === 'password' ? -5 : 0 }} transition={{ duration: 0.3 }}>
                <TextField required fullWidth label={t('password')} type={showPassword ? 'text' : 'password'}
                  autoFocus={isPasswordSetup} value={password} onChange={e => setPassword(e.target.value)}
                  onFocus={() => setFocusedField('password')} onBlur={() => setFocusedField(null)}
                  helperText={t('passwordMinChars')} sx={fieldSx('password')}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" sx={{ color: '#706f6f' }}>
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                />
              </motion.div>
            </Grid>

            <Grid item xs={12}>
              <motion.div animate={{ y: focusedField === 'confirmPassword' ? -5 : 0 }} transition={{ duration: 0.3 }}>
                <TextField required fullWidth label={t('confirmPassword')} type={showPassword ? 'text' : 'password'}
                  value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                  onFocus={() => setFocusedField('confirmPassword')} onBlur={() => setFocusedField(null)}
                  sx={fieldSx('confirmPassword')} />
              </motion.div>
            </Grid>

          </Grid>

          <Box sx={{ mt: 3, mb: 2, display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'center' }}>
            <Gavel sx={{ fontSize: 16, color: '#706f6f' }} />
            <Typography variant="caption" sx={{ color: '#706f6f', fontFamily: '"Poppins", sans-serif' }}>
              {t('byCreatingAccount')}{' '}
              <Link component={RouterLink} to="/terms-and-conditions" sx={{
                color: brandColors.primary, fontWeight: 600, textDecoration: 'none',
                '&:hover': { color: brandColors.secondary }
              }}>
                {t('termsAndConditions')}
              </Link>
            </Typography>
          </Box>

          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button type="submit" fullWidth variant="contained" disabled={loading} endIcon={<KeyboardArrowRight />}
              sx={{
                py: 1.8, borderRadius: 3, bgcolor: brandColors.primary, fontSize: '0.95rem', fontWeight: 600,
                textTransform: 'uppercase', letterSpacing: '2px', fontFamily: '"Poppins", sans-serif',
                boxShadow: `0 4px 12px ${brandColors.primary}4D`, position: 'relative', overflow: 'hidden',
                '&::before': { content: '""', position: 'absolute', top: 0, left: '-100%', width: '100%', height: '100%', bgcolor: brandColors.secondary, transition: 'left 0.4s ease', zIndex: 0 },
                '&:hover': { bgcolor: brandColors.primary, '&::before': { left: 0 } },
                '&:disabled': { bgcolor: '#e0e0e0', color: '#9e9e9e' },
                '& .MuiButton-endIcon': { position: 'relative', zIndex: 1 }
              }}
            >
              <span style={{ position: 'relative', zIndex: 1 }}>
                {loading
                  ? (isPasswordSetup ? t('settingPassword')  : t('creatingAccount'))
                  : (isPasswordSetup ? t('completeSetup')    : t('createAccount'))
                }
              </span>
            </Button>
          </motion.div>

          {!isPasswordSetup && (
            <Box sx={{ mt: 4, textAlign: 'center' }}>
              <Typography variant="body2" sx={{ color: '#706f6f', fontFamily: '"Poppins", sans-serif' }}>
                {t('alreadyHaveAccount')}{' '}
                <Link component={RouterLink} to="/login" sx={{ color: brandColors.primary, fontWeight: 600, textDecoration: 'none', '&:hover': { color: brandColors.secondary } }}>
                  {t('login')}
                </Link>
              </Typography>
            </Box>
          )}
        </Box>

      </motion.div>
    </Box>
  )
}

export default RegisterForm