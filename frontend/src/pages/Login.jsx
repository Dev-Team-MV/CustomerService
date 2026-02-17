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
  useMediaQuery,
  useTheme,
  ToggleButtonGroup,
  ToggleButton
} from '@mui/material'
import { 
  Visibility, 
  VisibilityOff, 
  KeyboardArrowRight, 
  Home,
  Email,
  Phone,
  Gavel
} from '@mui/icons-material'
import { useAuth } from '../context/AuthContext'
import { motion, AnimatePresence } from 'framer-motion'
import PhoneInput from 'react-phone-input-2'
import 'react-phone-input-2/lib/style.css'
import TypingFooter from '../components/Footer'

const Login = () => {
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
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

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

    const result = await login(credentials, password)
    
    if (result.success) {
      navigate(from, { replace: true })
    } else {
      if (result.requiresPasswordSetup) {
        setError('Password not set. Please check your phone for the setup link.')
      } else {
        setError(result.error || 'Login failed')
      }
    }
    
    setLoading(false)
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
      {/* ✅ ANIMATED BACKGROUND SIDE - Colores brandbook */}
      <Box
        sx={{
          width: isMobile ? '0%' : '60%',
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
              
              {/* ✅ LÍNEA DECORATIVA - Color brandbook */}
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
                Resort Lifestyle
              </Typography>
            </motion.div>
          </Box>

          {/* ✅ ANIMATED LINE - Color brandbook */}
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

      {/* ✅ FORM SIDE */}
      <Box
        sx={{
          width: isMobile ? '100%' : '40%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: '#fafafa',
          position: 'relative',
          p: 4
        }}
      >
        <Box sx={{ width: '100%', maxWidth: '400px' }}>
          <motion.div
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            {/* ✅ HEADER - Colores brandbook */}
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
                Welcome
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
                Sign In
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

            {/* ✅ LOGIN METHOD TOGGLE - Brandbook colors */}
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
              <ToggleButtonGroup
                value={loginMethod}
                exclusive
                onChange={handleLoginMethodChange}
                aria-label="login method"
                sx={{
                  '& .MuiToggleButton-root': {
                    borderRadius: 3,
                    border: '2px solid #e0e0e0',
                    fontFamily: '"Poppins", sans-serif',
                    fontWeight: 600,
                    letterSpacing: '0.5px',
                    color: '#706f6f',
                    '&.Mui-selected': {
                      bgcolor: '#333F1F',
                      color: 'white',
                      borderColor: '#333F1F',
                      '&:hover': {
                        bgcolor: '#4a5d3a'
                      }
                    },
                    '&:hover': {
                      bgcolor: 'rgba(51, 63, 31, 0.05)'
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
                  Phone
                </ToggleButton>
              </ToggleButtonGroup>
            </Box>

            {/* ✅ FORM */}
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
                        label="Email Address"
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
                          border: `2px solid ${focusedField === 'phone' ? '#333F1F' : '#e0e0e0'}`,
                          transition: 'all 0.3s',
                          backgroundColor: 'white',
                          fontFamily: '"Poppins", sans-serif'
                        }}
                        buttonStyle={{
                          borderRadius: '12px 0 0 12px',
                          border: `2px solid ${focusedField === 'phone' ? '#333F1F' : '#e0e0e0'}`,
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

              {/* ✅ PASSWORD INPUT */}
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
                  label="Password"
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
                />
              </motion.div>

              {/* ✅ TÉRMINOS Y CONDICIONES LINK */}
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
                  By signing in, you agree to our{' '}
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
                    Terms & Conditions
                  </Link>
                </Typography>
              </Box>

              {/* ✅ SUBMIT BUTTON - Brandbook style */}
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
                    {loading ? 'Signing in...' : 'Sign In'}
                  </span>
                </Button>
              </motion.div>
            </Box>
          </motion.div>
        </Box>
        <TypingFooter variant="dark" />
      </Box>
    </Box>
  )
}

export default Login