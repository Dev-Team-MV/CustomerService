
// import { useState } from 'react'
// import { useNavigate, Link as RouterLink } from 'react-router-dom'
// import {
//   Box,
//   TextField,
//   Button,
//   Typography,
//   Link,
//   Alert,
//   InputAdornment,
//   IconButton,
//   useMediaQuery,
//   useTheme
// } from '@mui/material'
// import { Visibility, VisibilityOff, KeyboardArrowRight, Home } from '@mui/icons-material'
// import { useAuth } from '../context/AuthContext'
// import { motion, AnimatePresence } from 'framer-motion'

// const Login = () => {
//   const [email, setEmail] = useState('')
//   const [password, setPassword] = useState('')
//   const [showPassword, setShowPassword] = useState(false)
//   const [error, setError] = useState('')
//   const [loading, setLoading] = useState(false)
//   const [focusedField, setFocusedField] = useState(null)
//   const { login } = useAuth()
//   const navigate = useNavigate()
//   const theme = useTheme()
//   const isMobile = useMediaQuery(theme.breakpoints.down('md'))

//   const handleSubmit = async (e) => {
//     e.preventDefault()
//     setError('')
//     setLoading(true)

//     const result = await login(email, password)
    
//     if (result.success) {
//       navigate('/dashboard')
//     } else {
//       setError(result.error || 'Error al iniciar sesión')
//     }
    
//     setLoading(false)
//   }

//   return (
//     <Box
//       sx={{
//         minHeight: '100vh',
//         display: 'flex',
//         position: 'relative',
//         overflow: 'hidden'
//       }}
//     >
//       {/* Animated Background Side */}
//       <Box
//         sx={{
//           width: isMobile ? '0%' : '60%',
//           position: 'relative',
//           overflow: 'hidden'
//         }}
//       >
//         <motion.div
//           initial={{ opacity: 0, scale: 1.1 }}
//           animate={{ opacity: 1, scale: 1 }}
//           transition={{ duration: 1.5 }}
//           style={{
//             width: '100%',
//             height: '100%',
//             position: 'relative'
//           }}
//         >
//           <Box
//             sx={{
//               width: '100%',
//               height: '100%',
//               backgroundImage: 'url(/images/260721_001_0010_ISOMETRIA_3-1.png)',
//               backgroundSize: 'cover',
//               backgroundPosition: 'center',
//               position: 'relative'
//             }}
//           />

//           {/* Animated Gradient Overlay */}
//           <motion.div
//             animate={{
//               background: [
//                 'linear-gradient(135deg, rgba(74, 124, 89, 0.9) 0%, rgba(26, 35, 46, 0.85) 100%)',
//                 'linear-gradient(135deg, rgba(74, 124, 89, 0.85) 0%, rgba(26, 35, 46, 0.9) 100%)',
//                 'linear-gradient(135deg, rgba(74, 124, 89, 0.9) 0%, rgba(26, 35, 46, 0.85) 100%)'
//               ]
//             }}
//             transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
//             style={{
//               position: 'absolute',
//               top: 0,
//               left: 0,
//               right: 0,
//               bottom: 0
//             }}
//           />

//           {/* Floating Content */}
//           <Box
//             sx={{
//               position: 'absolute',
//               top: '50%',
//               left: '50%',
//               transform: 'translate(-50%, -50%)',
//               textAlign: 'center',
//               color: 'white',
//               width: '80%',
//               zIndex: 1
//             }}
//           >
//             <motion.div
//               initial={{ y: 30, opacity: 0 }}
//               animate={{ y: 0, opacity: 1 }}
//               transition={{ delay: 0.5, duration: 1 }}
//             >
//               <motion.div
//                 animate={{ 
//                   y: [0, -10, 0]
//                 }}
//                 transition={{ 
//                   duration: 3,
//                   repeat: Infinity,
//                   ease: "easeInOut"
//                 }}
//               >
//                 <Home sx={{ fontSize: 100, mb: 3 }} />
//               </motion.div>
              
//               <Typography 
//                 variant="h2" 
//                 fontWeight="300"
//                 sx={{ 
//                   mb: 2,
//                   letterSpacing: '3px'
//                 }}
//               >
//                 LAKEWOOD
//               </Typography>
//               <Typography 
//                 variant="h3" 
//                 fontWeight="700"
//                 sx={{ 
//                   mb: 3,
//                   letterSpacing: '5px'
//                 }}
//               >
//                 OAKS
//               </Typography>
//               <Box
//                 sx={{
//                   width: '100px',
//                   height: '1px',
//                   bgcolor: 'white',
//                   margin: '0 auto',
//                   mb: 3
//                 }}
//               />
//               <Typography 
//                 variant="h6" 
//                 fontWeight="300"
//                 sx={{ 
//                   opacity: 0.9,
//                   letterSpacing: '2px'
//                 }}
//               >
//                 Modern Living Redefined
//               </Typography>
//             </motion.div>
//           </Box>

//           {/* Animated Lines Decoration */}
//           <motion.div
//             animate={{ 
//               width: ['0%', '30%', '0%']
//             }}
//             transition={{ 
//               duration: 4,
//               repeat: Infinity,
//               ease: "easeInOut"
//             }}
//             style={{
//               position: 'absolute',
//               bottom: '20%',
//               left: 0,
//               height: '2px',
//               background: 'white',
//               opacity: 0.5
//             }}
//           />
//         </motion.div>
//       </Box>

//       {/* Form Side */}
//       <Box
//         sx={{
//           width: isMobile ? '100%' : '40%',
//           display: 'flex',
//           alignItems: 'center',
//           justifyContent: 'center',
//           bgcolor: 'white',
//           position: 'relative',
//           p: 4
//         }}
//       >
//         <Box sx={{ width: '100%', maxWidth: '400px' }}>
//           <motion.div
//             initial={{ x: 50, opacity: 0 }}
//             animate={{ x: 0, opacity: 1 }}
//             transition={{ duration: 0.8, delay: 0.3 }}
//           >
//             {/* Header */}
//             <Box sx={{ mb: 6 }}>
//               <Typography 
//                 variant="h4" 
//                 fontWeight="300"
//                 sx={{ 
//                   mb: 1,
//                   color: '#1a1a1a',
//                   letterSpacing: '1px'
//                 }}
//               >
//                 Welcome
//               </Typography>
//               <Typography 
//                 variant="h5" 
//                 fontWeight="700"
//                 sx={{ 
//                   mb: 2,
//                   color: '#4a7c59',
//                   letterSpacing: '1px'
//                 }}
//               >
//                 Sign In
//               </Typography>
//               <motion.div
//                 initial={{ width: 0 }}
//                 animate={{ width: '60px' }}
//                 transition={{ delay: 0.8, duration: 0.8 }}
//               >
//                 <Box
//                   sx={{
//                     height: '3px',
//                     background: 'linear-gradient(90deg, #4a7c59, #8bc34a)'
//                   }}
//                 />
//               </motion.div>
//             </Box>

//             {error && (
//               <AnimatePresence>
//                 <motion.div
//                   initial={{ height: 0, opacity: 0 }}
//                   animate={{ height: 'auto', opacity: 1 }}
//                   exit={{ height: 0, opacity: 0 }}
//                 >
//                   <Alert severity="error" sx={{ mb: 3, borderRadius: 0 }}>
//                     {error}
//                   </Alert>
//                 </motion.div>
//               </AnimatePresence>
//             )}

//             {/* Form */}
//             <Box component="form" onSubmit={handleSubmit}>
//               <motion.div
//                 animate={{ 
//                   y: focusedField === 'email' ? -5 : 0
//                 }}
//                 transition={{ duration: 0.3 }}
//               >
//                 <TextField
//                   required
//                   fullWidth
//                   id="email"
//                   label="Email Address"
//                   name="email"
//                   autoComplete="email"
//                   autoFocus
//                   value={email}
//                   onChange={(e) => setEmail(e.target.value)}
//                   onFocus={() => setFocusedField('email')}
//                   onBlur={() => setFocusedField(null)}
//                   sx={{
//                     mb: 3,
//                     '& .MuiOutlinedInput-root': {
//                       borderRadius: 0,
//                       '& fieldset': {
//                         borderWidth: '2px',
//                         borderColor: focusedField === 'email' ? '#4a7c59' : '#e0e0e0',
//                         transition: 'all 0.3s'
//                       }
//                     },
//                     '& .MuiInputLabel-root.Mui-focused': {
//                       color: '#4a7c59'
//                     }
//                   }}
//                 />
//               </motion.div>

//               <motion.div
//                 animate={{ 
//                   y: focusedField === 'password' ? -5 : 0
//                 }}
//                 transition={{ duration: 0.3 }}
//               >
//                 <TextField
//                   required
//                   fullWidth
//                   name="password"
//                   label="Password"
//                   type={showPassword ? 'text' : 'password'}
//                   id="password"
//                   autoComplete="current-password"
//                   value={password}
//                   onChange={(e) => setPassword(e.target.value)}
//                   onFocus={() => setFocusedField('password')}
//                   onBlur={() => setFocusedField(null)}
//                   sx={{
//                     mb: 4,
//                     '& .MuiOutlinedInput-root': {
//                       borderRadius: 0,
//                       '& fieldset': {
//                         borderWidth: '2px',
//                         borderColor: focusedField === 'password' ? '#4a7c59' : '#e0e0e0',
//                         transition: 'all 0.3s'
//                       }
//                     },
//                     '& .MuiInputLabel-root.Mui-focused': {
//                       color: '#4a7c59'
//                     }
//                   }}
//                   InputProps={{
//                     endAdornment: (
//                       <InputAdornment position="end">
//                         <IconButton
//                           onClick={() => setShowPassword(!showPassword)}
//                           edge="end"
//                         >
//                           {showPassword ? <VisibilityOff /> : <Visibility />}
//                         </IconButton>
//                       </InputAdornment>
//                     ),
//                   }}
//                 />
//               </motion.div>

//               <motion.div
//                 whileHover={{ scale: 1.02 }}
//                 whileTap={{ scale: 0.98 }}
//               >
//                 <Button
//                   type="submit"
//                   fullWidth
//                   variant="contained"
//                   disabled={loading}
//                   endIcon={<KeyboardArrowRight />}
//                   sx={{
//                     py: 1.8,
//                     borderRadius: 0,
//                     bgcolor: '#1a1a1a',
//                     fontSize: '0.95rem',
//                     fontWeight: 600,
//                     textTransform: 'uppercase',
//                     letterSpacing: '2px',
//                     '&:hover': {
//                       bgcolor: '#2d2d2d',
//                     },
//                     '&:disabled': {
//                       bgcolor: '#ccc'
//                     }
//                   }}
//                 >
//                   {loading ? 'Signing in...' : 'Sign In'}
//                 </Button>
//               </motion.div>

//               <Box sx={{ mt: 4, textAlign: 'center' }}>
//                 <Typography variant="body2" color="text.secondary">
//                   New here?{' '}
//                   <Link 
//                     component={RouterLink} 
//                     to="/register"
//                     sx={{
//                       color: '#4a7c59',
//                       fontWeight: 600,
//                       textDecoration: 'none',
//                       position: 'relative',
//                       '&::after': {
//                         content: '""',
//                         position: 'absolute',
//                         bottom: -2,
//                         left: 0,
//                         width: 0,
//                         height: '2px',
//                         bgcolor: '#4a7c59',
//                         transition: 'width 0.3s'
//                       },
//                       '&:hover::after': {
//                         width: '100%'
//                       }
//                     }}
//                   >
//                     Create an account
//                   </Link>
//                 </Typography>
//               </Box>
//             </Box>
//           </motion.div>
//         </Box>
//       </Box>
//     </Box>
//   )
// }

// export default Login


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
  useTheme
} from '@mui/material'
import { Visibility, VisibilityOff, KeyboardArrowRight, Home } from '@mui/icons-material'
import { useAuth } from '../context/AuthContext'
import { motion, AnimatePresence } from 'framer-motion'

const Login = () => {
  const [email, setEmail] = useState('')
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

  // Obtener la ruta de origen o usar '/dashboard' por defecto
  const from = location.state?.from || '/dashboard'

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const result = await login(email, password)
    
    if (result.success) {
      // Redirigir a la ruta original o al dashboard
      navigate(from, { replace: true })
    } else {
      setError(result.error || 'Error al iniciar sesión')
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
              zIndex: 1
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
                  src="/images/logos/LOGO_MICHELANGELO_PNG_Mesa de trabajo 1.png"
                  alt="Michelangelo Del Valle"
                  sx={{
                    width: '70%',
                    height: 'auto',
                    filter: 'brightness(0) invert(1)',
                    objectFit: 'contain'
                  }}
                />
              </motion.div>
              
              <Box
                component="img"
                src="/images/logos/Logo_LakewoodOaks-05.png"
                alt="Lakewood Oaks on Lake Conroe"
                sx={{
                  width: '90%',
                  maxWidth: '500px',
                  height: 'auto',
                  mb: 3,
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

            {/* Mensaje informativo si viene de una ruta protegida */}
            {/* {location.state?.from && location.state.from !== '/dashboard' && (
              <AnimatePresence>
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                >
                  <Alert severity="info" sx={{ mb: 3, borderRadius: 0 }}>
                    Please login to access <strong>{location.state.from}</strong>
                  </Alert>
                </motion.div>
              </AnimatePresence>
            )} */}

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

            {/* Form */}
            <Box component="form" onSubmit={handleSubmit}>
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

              <Box sx={{ mt: 4, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  New here?{' '}
                  <Link 
                    component={RouterLink} 
                    to="/register"
                    sx={{
                      color: '#4a7c59',
                      fontWeight: 600,
                      textDecoration: 'none',
                      position: 'relative',
                      '&::after': {
                        content: '""',
                        position: 'absolute',
                        bottom: -2,
                        left: 0,
                        width: 0,
                        height: '2px',
                        bgcolor: '#4a7c59',
                        transition: 'width 0.3s'
                      },
                      '&:hover::after': {
                        width: '100%'
                      }
                    }}
                  >
                    Create an account
                  </Link>
                </Typography>
              </Box>
            </Box>
          </motion.div>
        </Box>
      </Box>
    </Box>
  )
}

export default Login