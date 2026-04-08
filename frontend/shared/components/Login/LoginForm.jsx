// /shared/components/Login/LoginForm.jsx
import { useState } from 'react'
import { useNavigate, useLocation, Link as RouterLink } from 'react-router-dom'
import {
  Box,
  TextField,
  Button,
  Typography,
  Link,
  Alert,
  InputAdornment,
  IconButton,
  ToggleButtonGroup,
  ToggleButton
} from '@mui/material'
import { 
  Visibility, 
  VisibilityOff, 
  KeyboardArrowRight, 
  Email,
  Phone,
  Gavel
} from '@mui/icons-material'
import { useAuth } from '../../context/AuthContext'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import PhoneInput from 'react-phone-input-2'
import 'react-phone-input-2/lib/style.css'
import LanguageSwitcher from '../LanguageSwitcher'

const LoginForm = ({ brandColors }) => {
  const [loginMethod, setLoginMethod] = useState('email')
  const [email, setEmail] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [focusedField, setFocusedField] = useState(null)
  
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const { t } = useTranslation('auth')

  const from = location.state?.from || '/dashboard'

  const handleLoginMethodChange = (event, newMethod) => {
    if (newMethod !== null) {
      setLoginMethod(newMethod)
      setError('')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const credentials = loginMethod === 'email' 
      ? email
      : `+${phoneNumber}`

// Línea 64-76
const result = await login(credentials, password)

if (result.success) {
  navigate(from, { replace: true })
} else {
  if (result.noProjects) {
    setError(t('noProjectsAccess', 'No tienes acceso a ningún proyecto. Contacta al administrador.'))
  } else if (result.requiresPasswordSetup) {
    setError(t('passwordNotSet'))
  } else {
    setError(result.error || t('loginFailed'))
  }
}
    
    setLoading(false)
  }

  return (
<Box
  sx={{
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    p: 4,
    height: '100%'
  }}
>
      {/* Language Switcher - Top Right */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        style={{
          position: 'absolute',
          top: 24,
          right: 24,
          zIndex: 10
        }}
      >
        <LanguageSwitcher variant="default" />
      </motion.div>

      <Box sx={{ width: '100%', maxWidth: '480px' }}>
        <motion.div
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          {/* Header */}
          <Box sx={{ mb: 6 }}>
            <Typography 
              variant="h4" 
              fontWeight="300"
              sx={{ 
                mb: 1,
                color: '#706f6f',
                letterSpacing: '1px',
                fontFamily: '"Poppins", sans-serif'
              }}
            >
              {t('welcome')}
            </Typography>
            <Typography 
              variant="h5" 
              fontWeight="700"
              sx={{ 
                mb: 2,
                color: brandColors.primary,
                letterSpacing: '1px',
                fontFamily: '"Poppins", sans-serif'
              }}
            >
              {t('signIn')}
            </Typography>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '60px' }}
              transition={{ delay: 0.8, duration: 0.8 }}
            >
              <Box
                sx={{
                  height: '3px',
                  background: brandColors.gradient
                }}
              />
            </motion.div>
          </Box>

          {/* Error Alert */}
          {error && (
            <AnimatePresence>
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
              >
                <Alert 
                  severity="error" 
                  sx={{ 
                    mb: 3, 
                    borderRadius: 3,
                    border: '1px solid #d32f2f',
                    bgcolor: '#ffebee',
                    fontFamily: '"Poppins", sans-serif'
                  }}
                >
                  {error}
                </Alert>
              </motion.div>
            </AnimatePresence>
          )}

          {/* Login Method Toggle */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
            <ToggleButtonGroup
              value={loginMethod}
              exclusive
              onChange={handleLoginMethodChange}
              aria-label="login method"
              sx={{
    '& .MuiToggleButton-root': {
      px: 3,              // Agregar padding horizontal
      py: 1.5,            // Agregar padding vertical
      minWidth: '140px',  // Ancho mínimo para cada botón
      borderRadius: 3,
      border: '2px solid #e0e0e0',
      fontFamily: '"Poppins", sans-serif',
      fontWeight: 600,
      letterSpacing: '0.5px',
      color: '#706f6f',
                  '&.Mui-selected': {
                    bgcolor: brandColors.primary,
                    color: 'white',
                    borderColor: brandColors.primary,
                    '&:hover': {
                      bgcolor: brandColors.secondary
                    }
                  },
                  '&:hover': {
                    bgcolor: `${brandColors.primary}11`
                  }
                }
              }}
            >
              <ToggleButton value="email" aria-label="email login">
                <Email sx={{ mr: 1 }} />
                Email
              </ToggleButton>
              <ToggleButton value="phone" aria-label="phone login">
                <Phone sx={{ mr: 1 }} />
                {t('phone')}
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>

          {/* Form */}
          <Box component="form" onSubmit={handleSubmit}>
            <AnimatePresence mode="wait">
              {loginMethod === 'email' ? (
                <motion.div
                  key="email"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                >
                  <motion.div
                    animate={{ 
                      y: focusedField === 'email' ? -5 : 0
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    <TextField
                      required
                      fullWidth
                      id="email"
                      label={t('emailAddress')}
                      name="email"
                      autoComplete="email"
                      autoFocus
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onFocus={() => setFocusedField('email')}
                      onBlur={() => setFocusedField(null)}
                      sx={{
                        mb: 3,
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 3,
                          bgcolor: 'white',
                          fontFamily: '"Poppins", sans-serif',
                          '& fieldset': {
                            borderWidth: '2px',
                            borderColor: focusedField === 'email' ? brandColors.primary : '#e0e0e0',
                            transition: 'all 0.3s'
                          },
                          '&:hover fieldset': {
                            borderColor: brandColors.secondary
                          }
                        },
                        '& .MuiInputLabel-root': {
                          fontFamily: '"Poppins", sans-serif',
                          color: '#706f6f',
                          '&.Mui-focused': {
                            color: brandColors.primary
                          }
                        }
                      }}
                    />
                  </motion.div>
                </motion.div>
              ) : (
                <motion.div
                  key="phone"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <Box sx={{ mb: 3 }}>
                    <PhoneInput
                      country={'us'}
                      value={phoneNumber}
                      onChange={setPhoneNumber}
                      onFocus={() => setFocusedField('phone')}
                      onBlur={() => setFocusedField(null)}
                      inputProps={{
                        name: 'phone',
                        required: true,
                        autoFocus: true
                      }}
                      containerStyle={{
                        width: '100%'
                      }}
                      inputStyle={{
                        width: '100%',
                        height: '56px',
                        fontSize: '16px',
                        borderRadius: '12px',
                        border: `2px solid ${focusedField === 'phone' ? brandColors.primary : '#e0e0e0'}`,
                        transition: 'all 0.3s',
                        backgroundColor: 'white',
                        fontFamily: '"Poppins", sans-serif'
                      }}
                      buttonStyle={{
                        borderRadius: '12px 0 0 12px',
                        border: `2px solid ${focusedField === 'phone' ? brandColors.primary : '#e0e0e0'}`,
                        borderRight: 'none',
                        backgroundColor: 'white'
                      }}
                      dropdownStyle={{
                        borderRadius: '12px',
                        fontFamily: '"Poppins", sans-serif'
                      }}
                    />
                  </Box>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Password Input */}
            <motion.div
              animate={{ 
                y: focusedField === 'password' ? -5 : 0
              }}
              transition={{ duration: 0.3 }}
            >
              <TextField
                required
                fullWidth
                name="password"
                label={t('password')}
                type={showPassword ? 'text' : 'password'}
                id="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField(null)}
                sx={{
                  mb: 2,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 3,
                    bgcolor: 'white',
                    fontFamily: '"Poppins", sans-serif',
                    '& fieldset': {
                      borderWidth: '2px',
                      borderColor: focusedField === 'password' ? brandColors.primary : '#e0e0e0',
                      transition: 'all 0.3s'
                    },
                    '&:hover fieldset': {
                      borderColor: brandColors.secondary
                    }
                  },
                  '& .MuiInputLabel-root': {
                    fontFamily: '"Poppins", sans-serif',
                    color: '#706f6f',
                    '&.Mui-focused': {
                      color: brandColors.primary
                    }
                  }
                }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        sx={{ color: '#706f6f' }}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </motion.div>

            {/* Terms and Conditions */}
            <Box 
              sx={{ 
                mb: 3, 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1,
                justifyContent: 'center'
              }}
            >
              <Gavel sx={{ fontSize: 16, color: '#706f6f' }} />
              <Typography 
                variant="caption" 
                sx={{ 
                  color: '#706f6f',
                  fontFamily: '"Poppins", sans-serif'
                }}
              >
                {t('termsAgreement')}{' '}
                <Link
                  component={RouterLink}
                  to="/terms-and-conditions"
                  sx={{
                    color: brandColors.primary,
                    fontWeight: 600,
                    textDecoration: 'none',
                    position: 'relative',
                    '&:hover': {
                      color: brandColors.secondary,
                      '&::after': {
                        width: '100%'
                      }
                    },
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      bottom: -2,
                      left: 0,
                      width: 0,
                      height: '2px',
                      bgcolor: brandColors.secondary,
                      transition: 'width 0.3s ease'
                    }
                  }}
                >
                  {t('termsAndConditions')}
                </Link>
              </Typography>
            </Box>

            {/* Submit Button */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={loading}
                endIcon={<KeyboardArrowRight />}
                sx={{
                  py: 1.8,
                  borderRadius: 3,
                  bgcolor: brandColors.primary,
                  fontSize: '0.95rem',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '2px',
                  fontFamily: '"Poppins", sans-serif',
                  boxShadow: `0 4px 12px ${brandColors.primary}44`,
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: '-100%',
                    width: '100%',
                    height: '100%',
                    bgcolor: brandColors.secondary,
                    transition: 'left 0.4s ease',
                    zIndex: 0
                  },
                  '&:hover': {
                    bgcolor: brandColors.primary,
                    boxShadow: `0 8px 20px ${brandColors.primary}66`,
                    '&::before': {
                      left: 0
                    }
                  },
                  '&:disabled': {
                    bgcolor: '#e0e0e0',
                    color: '#9e9e9e'
                  },
                  '& .MuiButton-endIcon': {
                    position: 'relative',
                    zIndex: 1
                  }
                }}
              >
                <span style={{ position: 'relative', zIndex: 1 }}>
                  {loading ? t('signingIn') : t('signIn')}
                </span>
              </Button>
            </motion.div>
          </Box>
        </motion.div>
      </Box>
    </Box>
  )
}

export default LoginForm