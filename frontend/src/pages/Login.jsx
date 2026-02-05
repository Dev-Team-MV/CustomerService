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
  Phone
} from '@mui/icons-material'
import { useAuth } from '../context/AuthContext'
import { motion, AnimatePresence } from 'framer-motion'
import PhoneInput from 'react-phone-input-2'
import 'react-phone-input-2/lib/style.css'
import TypingFooter from '../components/Footer'

const Login = () => {
  const [loginMethod, setLoginMethod] = useState('email') // 'email' o 'phone'
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

// Actualizar solo handleSubmit:
const handleSubmit = async (e) => {
  e.preventDefault()
  setError('')
  setLoading(true)

  // ✅ Preparar las credenciales según el método de login
  const credentials = loginMethod === 'email' 
    ? email
    : `+${phoneNumber}` // Agregar el + al número de teléfono

  console.log('🔐 Login with:', { 
    method: loginMethod, 
    credentials: loginMethod === 'phone' ? credentials : email,
    password: '***'
  })

  // ✅ Pasar solo el email/phone y password
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
      {/* Animated Background Side */}
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

          {/* Animated Gradient Overlay */}
          <motion.div
            animate={{
              background: [
                'linear-gradient(135deg, rgba(74, 124, 89, 0.9) 0%, rgba(26, 35, 46, 0.85) 100%)',
                'linear-gradient(135deg, rgba(74, 124, 89, 0.85) 0%, rgba(26, 35, 46, 0.9) 100%)',
                'linear-gradient(135deg, rgba(74, 124, 89, 0.9) 0%, rgba(26, 35, 46, 0.85) 100%)'
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

          {/* Floating Content */}
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
              mt:8
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
                  // maxWidth: '500px',
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
                  bgcolor: 'white',
                  margin: '0 auto',
                  mb: 3
                }}
              />
              <Typography 
                variant="h6" 
                fontWeight="300"
                sx={{ 
                  opacity: 0.9,
                  letterSpacing: '2px',
                  fontSize: { xs: '1rem', md: '1.25rem' }
                }}
              >
                Resort Lifestyle
              </Typography>
            </motion.div>
          </Box>

          {/* Animated Lines Decoration */}
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
              background: 'white',
              opacity: 0.5
            }}
          />
        </motion.div>
      </Box>

      {/* Form Side */}
      <Box
        sx={{
          width: isMobile ? '100%' : '40%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'white',
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
            {/* Header */}
            <Box sx={{ mb: 6 }}>
              <Typography 
                variant="h4" 
                fontWeight="300"
                sx={{ 
                  mb: 1,
                  color: '#1a1a1a',
                  letterSpacing: '1px'
                }}
              >
                Welcome
              </Typography>
              <Typography 
                variant="h5" 
                fontWeight="700"
                sx={{ 
                  mb: 2,
                  color: '#4a7c59',
                  letterSpacing: '1px'
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
                    background: 'linear-gradient(90deg, #4a7c59, #8bc34a)'
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
                  <Alert severity="error" sx={{ mb: 3, borderRadius: 0 }}>
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
                    borderRadius: 0,
                    border: '2px solid #e0e0e0',
                    '&.Mui-selected': {
                      bgcolor: '#4a7c59',
                      color: 'white',
                      borderColor: '#4a7c59',
                      '&:hover': {
                        bgcolor: '#3d664a'
                      }
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

            {/* Form */}
            <Box component="form" onSubmit={handleSubmit}>
              {/* Email or Phone Input */}
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
                            borderRadius: 0,
                            '& fieldset': {
                              borderWidth: '2px',
                              borderColor: focusedField === 'email' ? '#4a7c59' : '#e0e0e0',
                              transition: 'all 0.3s'
                            }
                          },
                          '& .MuiInputLabel-root.Mui-focused': {
                            color: '#4a7c59'
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
                          borderRadius: 0,
                          border: `2px solid ${focusedField === 'phone' ? '#4a7c59' : '#e0e0e0'}`,
                          transition: 'all 0.3s'
                        }}
                        buttonStyle={{
                          borderRadius: 0,
                          border: `2px solid ${focusedField === 'phone' ? '#4a7c59' : '#e0e0e0'}`,
                          borderRight: 'none'
                        }}
                        dropdownStyle={{
                          borderRadius: 0
                        }}
                        searchStyle={{
                          borderRadius: 0
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
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  sx={{
                    mb: 4,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 0,
                      '& fieldset': {
                        borderWidth: '2px',
                        borderColor: focusedField === 'password' ? '#4a7c59' : '#e0e0e0',
                        transition: 'all 0.3s'
                      }
                    },
                    '& .MuiInputLabel-root.Mui-focused': {
                      color: '#4a7c59'
                    }
                  }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </motion.div>

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
                    borderRadius: 0,
                    bgcolor: '#1a1a1a',
                    fontSize: '0.95rem',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '2px',
                    '&:hover': {
                      bgcolor: '#2d2d2d',
                    },
                    '&:disabled': {
                      bgcolor: '#ccc'
                    }
                  }}
                >
                  {loading ? 'Signing in...' : 'Sign In'}
                </Button>
              </motion.div>
            </Box>
          </motion.div>
        {/* {!isMobile && <TypingFooter variant="dark" />} */}
        </Box>
      <TypingFooter variant="dark" />
      </Box>
    </Box>
  )
}

export default Login