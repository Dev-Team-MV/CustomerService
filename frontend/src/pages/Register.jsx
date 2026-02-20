import { useState, useEffect } from 'react'
import { useNavigate, useParams, Link as RouterLink } from 'react-router-dom'
import {
  Box,
  TextField,
  Button,
  Typography,
  Link,
  Alert,
  InputAdornment,
  IconButton,
  useMediaQuery,
  useTheme,
  Grid,
  CircularProgress
} from '@mui/material'
import { Visibility, VisibilityOff, KeyboardArrowRight, Gavel } from '@mui/icons-material'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../context/AuthContext'
import { motion, AnimatePresence } from 'framer-motion'
import PhoneInput from 'react-phone-input-2'
import 'react-phone-input-2/lib/style.css'
import api from '../services/api'
import TypingFooter from '../components/Footer'

const Register = () => {
  const { token } = useParams()
  const navigate = useNavigate()
  const { register: authRegister, loginWithToken } = useAuth()
  const { t } = useTranslation('auth')
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  const isPasswordSetup = !!token

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [focusedField, setFocusedField] = useState(null)

  useEffect(() => {
    if (isPasswordSetup) {
      verifyTokenAndLoadUserData()
    }
  }, [token, isPasswordSetup])

  const verifyTokenAndLoadUserData = async () => {
    try {
      setVerifying(true)
      console.log('🔍 Verifying setup token:', token)
      
      const response = await api.get(`/auth/verify-setup-token/${token}`)
      
      console.log('✅ Token verified, user data:', response.data)
      
      if (response.data.valid && response.data.user) {
        const userData = response.data.user
        
        setFirstName(userData.firstName || '')
        setLastName(userData.lastName || '')
        setEmail(userData.email || '')
        
        let cleanPhone = userData.phoneNumber || ''
        if (cleanPhone) {
          cleanPhone = cleanPhone.replace(/^\+/, '')
          cleanPhone = cleanPhone.replace(/[\s\-\(\)]/g, '')
          console.log('📱 Original phone:', userData.phoneNumber)
          console.log('📱 Cleaned phone:', cleanPhone)
        }
        
        setPhoneNumber(cleanPhone)
        console.log('📝 User data loaded into form')
      } else {
        setError(t('invalidOrExpiredLink'))
      }
    } catch (error) {
      console.error('❌ Error verifying token:', error)
      setError(error.response?.data?.message || t('invalidOrExpiredLink'))
    } finally {
      setVerifying(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError(t('passwordsDoNotMatch'))
      return
    }

    if (password.length < 6) {
      setError(t('passwordTooShort'))
      return
    }

    setLoading(true)

    try {
      if (isPasswordSetup) {
        console.log('🔐 Setting up password for token:', token)
        
        const response = await api.post(`/auth/setup-password/${token}`, {
          password
        })
        
        console.log('✅ Password setup successful:', response.data)
        
        const { token: authToken, user } = response.data
        
        loginWithToken(authToken, user)
        
        setTimeout(() => {
          navigate('/dashboard')
        }, 300)
        
      } else {
        const result = await authRegister(firstName, lastName, email, password, phoneNumber)
        
        if (result.success) {
          navigate('/dashboard')
        } else {
          setError(result.error || t('errorRegistering'))
        }
      }
    } catch (error) {
      console.error('❌ Error in form submission:', error)
      setError(error.response?.data?.message || t('loginFailed'))
      setLoading(false)
    }
  }

  if (isPasswordSetup && verifying) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: '#fafafa'
        }}
      >
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress size={60} sx={{ color: '#333F1F', mb: 2 }} />
          <Typography 
            variant="h6" 
            sx={{ 
              color: '#706f6f',
              fontFamily: '"Poppins", sans-serif'
            }}
          >
            {t('verifyingSetupLink')}
          </Typography>
        </Box>
      </Box>
    )
  }

  if (isPasswordSetup && error && !firstName) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: '#fafafa',
          p: 3
        }}
      >
        <Box sx={{ maxWidth: 500, width: '100%' }}>
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
          <Button
            fullWidth
            variant="contained"
            onClick={() => navigate('/login')}
            sx={{
              borderRadius: 3,
              bgcolor: '#333F1F',
              py: 1.5,
              fontFamily: '"Poppins", sans-serif',
              fontWeight: 600,
              letterSpacing: '1px',
              '&:hover': { bgcolor: '#4a5d3a' }
            }}
          >
            {t('goToLogin')}
          </Button>
        </Box>
      </Box>
    )
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* ✅ ANIMATED BACKGROUND - Brandbook colors */}
      {!isMobile && (
        <Box
          sx={{
            width: '60%',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.5 }}
            style={{
              width: '100%',
              height: '100%',
              position: 'relative'
            }}
          >
            <Box
              sx={{
                width: '100%',
                height: '100%',
                backgroundImage: 'url(/images/260721_001_0010_ISOMETRIA_3-1.png)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                position: 'relative'
              }}
            />

            {/* ✅ GRADIENT OVERLAY - Brandbook colors */}
            <motion.div
              animate={{
                background: [
                  'linear-gradient(135deg, rgba(51, 63, 31, 0.92) 0%, rgba(140, 165, 81, 0.88) 100%)',
                  'linear-gradient(135deg, rgba(140, 165, 81, 0.88) 0%, rgba(51, 63, 31, 0.92) 100%)',
                  'linear-gradient(135deg, rgba(51, 63, 31, 0.92) 0%, rgba(140, 165, 81, 0.88) 100%)'
                ]
              }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0
              }}
            />

            {/* ✅ FLOATING CONTENT */}
            <Box
              sx={{
                position: 'absolute',
                top: '40%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                textAlign: 'center',
                color: 'white',
                width: '80%',
                zIndex: 1,
                mt: 8
              }}
            >
              <motion.div
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5, duration: 1 }}
              >
                <motion.div
                  animate={{ 
                    y: [0, -10, 0]
                  }}
                  transition={{ 
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <Box
                    component="img"
                    src="/images/logos/Logo_LakewoodOaks-05.png"
                    alt="Lakewood Oaks on Lake Conroe"
                    sx={{
                      width: '90%',
                      height: 'auto',
                      mb: 3,
                      filter: 'brightness(0) invert(1)',
                      objectFit: 'contain'
                    }}
                  />
                </motion.div>
                
                <Box
                  component="img"
                  src="/images/logos/LOGO_MICHELANGELO_PNG_Mesa de trabajo 1.png"
                  alt="Michelangelo Del Valle"
                  sx={{
                    width: '40%',
                    height: 'auto',
                    filter: 'brightness(0) invert(1)',
                    objectFit: 'contain'
                  }}
                />
                
                <Box
                  sx={{
                    width: '120px',
                    height: '2px',
                    bgcolor: '#8CA551',
                    margin: '0 auto',
                    my: 3,
                    opacity: 0.9
                  }}
                />
                
                <Typography 
                  variant="h6" 
                  fontWeight="300"
                  sx={{ 
                    opacity: 0.95,
                    letterSpacing: '2px',
                    fontSize: { xs: '1rem', md: '1.25rem' },
                    fontFamily: '"Poppins", sans-serif'
                  }}
                >
                  {t('resortLifestyle', { ns: 'common' })}
                </Typography>
              </motion.div>
            </Box>

            <motion.div
              animate={{ 
                width: ['0%', '30%', '0%']
              }}
              transition={{ 
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              style={{
                position: 'absolute',
                bottom: '20%',
                left: 0,
                height: '2px',
                background: '#8CA551',
                opacity: 0.6
              }}
            />
          </motion.div>
        </Box>
      )}

      {/* ✅ FORM SIDE */}
      <Box
        sx={{
          width: isMobile ? '100%' : '40%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: '#fafafa',
          position: 'relative',
          p: 4,
          overflowY: 'auto',
          zIndex: 2
        }}
      >
        <Box sx={{ width: '100%', maxWidth: '450px', py: 4 }}>
          <motion.div
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            {/* ✅ HEADER - Brandbook colors */}
            <Box sx={{ mb: 5 }}>
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
                {isPasswordSetup ? t('completeYour') : t('createYour')}
              </Typography>
              <Typography 
                variant="h5" 
                fontWeight="700"
                sx={{ 
                  mb: 2,
                  color: '#333F1F',
                  letterSpacing: '1px',
                  fontFamily: '"Poppins", sans-serif'
                }}
              >
                {isPasswordSetup ? t('accountSetup') : t('account')}
              </Typography>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '60px' }}
                transition={{ delay: 0.8, duration: 0.8 }}
              >
                <Box
                  sx={{
                    height: '3px',
                    background: 'linear-gradient(90deg, #333F1F, #8CA551)'
                  }}
                />
              </motion.div>
            </Box>

            {isPasswordSetup && firstName && (
              <Alert 
                severity="info" 
                sx={{ 
                  mb: 3, 
                  borderRadius: 3,
                  border: '1px solid rgba(51, 63, 31, 0.3)',
                  bgcolor: 'rgba(140, 165, 81, 0.08)',
                  fontFamily: '"Poppins", sans-serif'
                }}
              >
                {t('welcomeSetupPlain', { name: firstName })}
              </Alert>
            )}

            {error && !verifying && (
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

            {/* ✅ FORM */}
            <Box component="form" onSubmit={handleSubmit}>
              <Grid container spacing={2}>
                {/* First Name */}
                <Grid item xs={12} sm={6}>
                  <motion.div
                    animate={{ 
                      y: focusedField === 'firstName' ? -5 : 0
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    <TextField
                      required
                      fullWidth
                      id="firstName"
                      label={t('firstName')}
                      name="firstName"
                      autoComplete="given-name"
                      autoFocus={!isPasswordSetup}
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      onFocus={() => setFocusedField('firstName')}
                      onBlur={() => setFocusedField(null)}
                      disabled={isPasswordSetup}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 3,
                          bgcolor: 'white',
                          fontFamily: '"Poppins", sans-serif',
                          '& fieldset': {
                            borderWidth: '2px',
                            borderColor: focusedField === 'firstName' ? '#333F1F' : '#e0e0e0',
                            transition: 'all 0.3s'
                          },
                          '&:hover fieldset': {
                            borderColor: '#8CA551'
                          }
                        },
                        '& .MuiInputLabel-root': {
                          fontFamily: '"Poppins", sans-serif',
                          color: '#706f6f',
                          '&.Mui-focused': {
                            color: '#333F1F'
                          }
                        }
                      }}
                    />
                  </motion.div>
                </Grid>

                {/* Last Name */}
                <Grid item xs={12} sm={6}>
                  <motion.div
                    animate={{ 
                      y: focusedField === 'lastName' ? -5 : 0
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    <TextField
                      required
                      fullWidth
                      id="lastName"
                      label={t('lastName')}
                      name="lastName"
                      autoComplete="family-name"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      onFocus={() => setFocusedField('lastName')}
                      onBlur={() => setFocusedField(null)}
                      disabled={isPasswordSetup}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 3,
                          bgcolor: 'white',
                          fontFamily: '"Poppins", sans-serif',
                          '& fieldset': {
                            borderWidth: '2px',
                            borderColor: focusedField === 'lastName' ? '#333F1F' : '#e0e0e0',
                            transition: 'all 0.3s'
                          },
                          '&:hover fieldset': {
                            borderColor: '#8CA551'
                          }
                        },
                        '& .MuiInputLabel-root': {
                          fontFamily: '"Poppins", sans-serif',
                          color: '#706f6f',
                          '&.Mui-focused': {
                            color: '#333F1F'
                          }
                        }
                      }}
                    />
                  </motion.div>
                </Grid>

                {/* Email */}
                <Grid item xs={12}>
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
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onFocus={() => setFocusedField('email')}
                      onBlur={() => setFocusedField(null)}
                      disabled={isPasswordSetup}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 3,
                          bgcolor: 'white',
                          fontFamily: '"Poppins", sans-serif',
                          '& fieldset': {
                            borderWidth: '2px',
                            borderColor: focusedField === 'email' ? '#333F1F' : '#e0e0e0',
                            transition: 'all 0.3s'
                          },
                          '&:hover fieldset': {
                            borderColor: '#8CA551'
                          }
                        },
                        '& .MuiInputLabel-root': {
                          fontFamily: '"Poppins", sans-serif',
                          color: '#706f6f',
                          '&.Mui-focused': {
                            color: '#333F1F'
                          }
                        }
                      }}
                    />
                  </motion.div>
                </Grid>

                {/* Phone Number */}
                <Grid item xs={12}>
                  <Box>
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        mb: 0.5, 
                        display: 'block',
                        color: '#706f6f',
                        fontFamily: '"Poppins", sans-serif'
                      }}
                    >
                      {isPasswordSetup ? t('phoneNumber') : t('phoneOptional')}
                    </Typography>
                    <PhoneInput
                      country={'us'}
                      value={phoneNumber}
                      onChange={(value) => {
                        console.log('📱 Phone changed to:', value)
                        setPhoneNumber(value)
                      }}
                      disabled={isPasswordSetup}
                      enableSearch={false}
                      disableSearchIcon={true}
                      countryCodeEditable={false}
                      inputProps={{
                        name: 'phone',
                        required: false,
                        autoComplete: 'tel'
                      }}
                      containerStyle={{
                        width: '100%'
                      }}
                      inputStyle={{
                        width: '100%',
                        height: '56px',
                        fontSize: '16px',
                        borderRadius: '12px',
                        border: `2px solid ${focusedField === 'phone' ? '#333F1F' : '#e0e0e0'}`,
                        transition: 'all 0.3s',
                        backgroundColor: isPasswordSetup ? '#f5f5f5' : 'white',
                        paddingLeft: '48px',
                        fontFamily: '"Poppins", sans-serif'
                      }}
                      buttonStyle={{
                        borderRadius: '12px 0 0 12px',
                        border: `2px solid ${focusedField === 'phone' ? '#333F1F' : '#e0e0e0'}`,
                        borderRight: 'none',
                        backgroundColor: isPasswordSetup ? '#f5f5f5' : 'white'
                      }}
                      dropdownStyle={{
                        borderRadius: '12px',
                        fontFamily: '"Poppins", sans-serif'
                      }}
                      onFocus={() => setFocusedField('phone')}
                      onBlur={() => setFocusedField(null)}
                      preferredCountries={['us', 'mx', 'ca']}
                    />
                  </Box>
                </Grid>

                {/* Password */}
                <Grid item xs={12}>
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
                      autoComplete="new-password"
                      autoFocus={isPasswordSetup}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onFocus={() => setFocusedField('password')}
                      onBlur={() => setFocusedField(null)}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 3,
                          bgcolor: 'white',
                          fontFamily: '"Poppins", sans-serif',
                          '& fieldset': {
                            borderWidth: '2px',
                            borderColor: focusedField === 'password' ? '#333F1F' : '#e0e0e0',
                            transition: 'all 0.3s'
                          },
                          '&:hover fieldset': {
                            borderColor: '#8CA551'
                          }
                        },
                        '& .MuiInputLabel-root': {
                          fontFamily: '"Poppins", sans-serif',
                          color: '#706f6f',
                          '&.Mui-focused': {
                            color: '#333F1F'
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
                      helperText={t('passwordMinChars')}
                    />
                  </motion.div>
                </Grid>

                {/* Confirm Password */}
                <Grid item xs={12}>
                  <motion.div
                    animate={{ 
                      y: focusedField === 'confirmPassword' ? -5 : 0
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    <TextField
                      required
                      fullWidth
                      name="confirmPassword"
                      label={t('confirmPassword')}
                      type={showPassword ? 'text' : 'password'}
                      id="confirmPassword"
                      autoComplete="new-password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      onFocus={() => setFocusedField('confirmPassword')}
                      onBlur={() => setFocusedField(null)}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 3,
                          bgcolor: 'white',
                          fontFamily: '"Poppins", sans-serif',
                          '& fieldset': {
                            borderWidth: '2px',
                            borderColor: focusedField === 'confirmPassword' ? '#333F1F' : '#e0e0e0',
                            transition: 'all 0.3s'
                          },
                          '&:hover fieldset': {
                            borderColor: '#8CA551'
                          }
                        },
                        '& .MuiInputLabel-root': {
                          fontFamily: '"Poppins", sans-serif',
                          color: '#706f6f',
                          '&.Mui-focused': {
                            color: '#333F1F'
                          }
                        }
                      }}
                    />
                  </motion.div>
                </Grid>
              </Grid>

              {/* ✅ TÉRMINOS Y CONDICIONES */}
              <Box 
                sx={{ 
                  mt: 3,
                  mb: 2, 
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
                  {t('byCreatingAccount')}{' '}
                  <Link
                    component={RouterLink}
                    to="/terms-and-conditions"
                    sx={{
                      color: '#333F1F',
                      fontWeight: 600,
                      textDecoration: 'none',
                      position: 'relative',
                      '&:hover': {
                        color: '#8CA551',
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
                        bgcolor: '#8CA551',
                        transition: 'width 0.3s ease'
                      }
                    }}
                  >
                    {t('termsAndConditions')}
                  </Link>
                </Typography>
              </Box>

              {/* ✅ SUBMIT BUTTON */}
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
                    bgcolor: '#333F1F',
                    fontSize: '0.95rem',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '2px',
                    fontFamily: '"Poppins", sans-serif',
                    boxShadow: '0 4px 12px rgba(51, 63, 31, 0.3)',
                    position: 'relative',
                    overflow: 'hidden',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: '-100%',
                      width: '100%',
                      height: '100%',
                      bgcolor: '#8CA551',
                      transition: 'left 0.4s ease',
                      zIndex: 0
                    },
                    '&:hover': {
                      bgcolor: '#333F1F',
                      boxShadow: '0 8px 20px rgba(51, 63, 31, 0.4)',
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
                    {loading 
                      ? (isPasswordSetup ? t('settingPassword') : t('creatingAccount')) 
                      : (isPasswordSetup ? t('completeSetup') : t('createAccount'))
                    }
                  </span>
                </Button>
              </motion.div>

              {!isPasswordSetup && (
                <Box sx={{ mt: 4, textAlign: 'center' }}>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: '#706f6f',
                      fontFamily: '"Poppins", sans-serif'
                    }}
                  >
                    {t('alreadyHaveAccount')}{' '}
                    <Link 
                      component={RouterLink} 
                      to="/login"
                      sx={{
                        color: '#333F1F',
                        fontWeight: 600,
                        textDecoration: 'none',
                        position: 'relative',
                        '&:hover': {
                          color: '#8CA551',
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
                          bgcolor: '#8CA551',
                          transition: 'width 0.3s ease'
                        }
                      }}
                    >
                      {t('signIn')}
                    </Link>
                  </Typography>
                </Box>
              )}
            </Box>
          </motion.div>
        </Box>
        <TypingFooter variant="dark" />
      </Box>
    </Box>
  )
}

export default Register