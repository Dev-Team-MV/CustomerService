// // import { useState } from 'react'
// // import { useNavigate, Link as RouterLink } from 'react-router-dom'
// // import {
// //   Box,
// //   TextField,
// //   Button,
// //   Typography,
// //   Link,
// //   Alert,
// //   InputAdornment,
// //   IconButton,
// //   useMediaQuery,
// //   useTheme,
// //   Grid
// // } from '@mui/material'
// // import { Visibility, VisibilityOff, KeyboardArrowRight, Home } from '@mui/icons-material'
// // import { useAuth } from '../context/AuthContext'
// // import { motion, AnimatePresence } from 'framer-motion'

// // const Register = () => {
// //   const [firstName, setFirstName] = useState('')
// //   const [lastName, setLastName] = useState('')
// //   const [email, setEmail] = useState('')
// //   const [phoneNumber, setPhoneNumber] = useState('')
// //   const [password, setPassword] = useState('')
// //   const [confirmPassword, setConfirmPassword] = useState('')
// //   const [showPassword, setShowPassword] = useState(false)
// //   const [error, setError] = useState('')
// //   const [loading, setLoading] = useState(false)
// //   const [focusedField, setFocusedField] = useState(null)
// //   const { register } = useAuth()
// //   const navigate = useNavigate()
// //   const theme = useTheme()
// //   const isMobile = useMediaQuery(theme.breakpoints.down('md'))

// //   const handleSubmit = async (e) => {
// //     e.preventDefault()
// //     setError('')

// //     if (password !== confirmPassword) {
// //       setError('The passwords do not match')
// //       return
// //     }

// //     if (password.length < 6) {
// //       setError('The password must be at least 6 characters long')
// //       return
// //     }

// //     setLoading(true)

// //     const result = await register(firstName, lastName, email, password, phoneNumber)
    
// //     if (result.success) {
// //       navigate('/dashboard')
// //     } else {
// //       setError(result.error || 'Error registering account')
// //     }
    
// //     setLoading(false)
// //   }

// //   return (
// //     <Box
// //       sx={{
// //         minHeight: '100vh',
// //         display: 'flex',
// //         position: 'relative',
// //         overflow: 'hidden'
// //       }}
// //     >
// //       {/* Form Side - LEFT */}
// //       <Box
// //         sx={{
// //           width: isMobile ? '100%' : '40%',
// //           display: 'flex',
// //           alignItems: 'center',
// //           justifyContent: 'center',
// //           bgcolor: 'white',
// //           position: 'relative',
// //           p: 4,
// //           overflowY: 'auto',
// //           zIndex: 2
// //         }}
// //       >
// //         <Box sx={{ width: '100%', maxWidth: '450px', py: 4 }}>
// //           <motion.div
// //             initial={{ x: -50, opacity: 0 }}
// //             animate={{ x: 0, opacity: 1 }}
// //             transition={{ duration: 0.8, delay: 0.3 }}
// //           >
// //             {/* Header */}
// //             <Box sx={{ mb: 5 }}>
// //               <Typography 
// //                 variant="h4" 
// //                 fontWeight="300"
// //                 sx={{ 
// //                   mb: 1,
// //                   color: '#1a1a1a',
// //                   letterSpacing: '1px'
// //                 }}
// //               >
// //                 Create
// //               </Typography>
// //               <Typography 
// //                 variant="h5" 
// //                 fontWeight="700"
// //                 sx={{ 
// //                   mb: 2,
// //                   color: '#4a7c59',
// //                   letterSpacing: '1px'
// //                 }}
// //               >
// //                 Your Account
// //               </Typography>
// //               <motion.div
// //                 initial={{ width: 0 }}
// //                 animate={{ width: '60px' }}
// //                 transition={{ delay: 0.8, duration: 0.8 }}
// //               >
// //                 <Box
// //                   sx={{
// //                     height: '3px',
// //                     background: 'linear-gradient(90deg, #4a7c59, #8bc34a)'
// //                   }}
// //                 />
// //               </motion.div>
// //             </Box>

// //             {error && (
// //               <AnimatePresence>
// //                 <motion.div
// //                   initial={{ height: 0, opacity: 0 }}
// //                   animate={{ height: 'auto', opacity: 1 }}
// //                   exit={{ height: 0, opacity: 0 }}
// //                 >
// //                   <Alert severity="error" sx={{ mb: 3, borderRadius: 0 }}>
// //                     {error}
// //                   </Alert>
// //                 </motion.div>
// //               </AnimatePresence>
// //             )}

// //             {/* Form */}
// //             <Box component="form" onSubmit={handleSubmit}>
// //               <Grid container spacing={2}>
// //                 {/* First Name */}
// //                 <Grid item xs={12} sm={6}>
// //                   <motion.div
// //                     animate={{ 
// //                       y: focusedField === 'firstName' ? -5 : 0
// //                     }}
// //                     transition={{ duration: 0.3 }}
// //                   >
// //                     <TextField
// //                       required
// //                       fullWidth
// //                       id="firstName"
// //                       label="First Name"
// //                       name="firstName"
// //                       autoComplete="given-name"
// //                       autoFocus
// //                       value={firstName}
// //                       onChange={(e) => setFirstName(e.target.value)}
// //                       onFocus={() => setFocusedField('firstName')}
// //                       onBlur={() => setFocusedField(null)}
// //                       sx={{
// //                         '& .MuiOutlinedInput-root': {
// //                           borderRadius: 0,
// //                           '& fieldset': {
// //                             borderWidth: '2px',
// //                             borderColor: focusedField === 'firstName' ? '#4a7c59' : '#e0e0e0',
// //                             transition: 'all 0.3s'
// //                           }
// //                         },
// //                         '& .MuiInputLabel-root.Mui-focused': {
// //                           color: '#4a7c59'
// //                         }
// //                       }}
// //                     />
// //                   </motion.div>
// //                 </Grid>

// //                 {/* Last Name */}
// //                 <Grid item xs={12} sm={6}>
// //                   <motion.div
// //                     animate={{ 
// //                       y: focusedField === 'lastName' ? -5 : 0
// //                     }}
// //                     transition={{ duration: 0.3 }}
// //                   >
// //                     <TextField
// //                       required
// //                       fullWidth
// //                       id="lastName"
// //                       label="Last Name"
// //                       name="lastName"
// //                       autoComplete="family-name"
// //                       value={lastName}
// //                       onChange={(e) => setLastName(e.target.value)}
// //                       onFocus={() => setFocusedField('lastName')}
// //                       onBlur={() => setFocusedField(null)}
// //                       sx={{
// //                         '& .MuiOutlinedInput-root': {
// //                           borderRadius: 0,
// //                           '& fieldset': {
// //                             borderWidth: '2px',
// //                             borderColor: focusedField === 'lastName' ? '#4a7c59' : '#e0e0e0',
// //                             transition: 'all 0.3s'
// //                           }
// //                         },
// //                         '& .MuiInputLabel-root.Mui-focused': {
// //                           color: '#4a7c59'
// //                         }
// //                       }}
// //                     />
// //                   </motion.div>
// //                 </Grid>

// //                 {/* Email */}
// //                 <Grid item xs={12}>
// //                   <motion.div
// //                     animate={{ 
// //                       y: focusedField === 'email' ? -5 : 0
// //                     }}
// //                     transition={{ duration: 0.3 }}
// //                   >
// //                     <TextField
// //                       required
// //                       fullWidth
// //                       id="email"
// //                       label="Email Address"
// //                       name="email"
// //                       autoComplete="email"
// //                       value={email}
// //                       onChange={(e) => setEmail(e.target.value)}
// //                       onFocus={() => setFocusedField('email')}
// //                       onBlur={() => setFocusedField(null)}
// //                       sx={{
// //                         '& .MuiOutlinedInput-root': {
// //                           borderRadius: 0,
// //                           '& fieldset': {
// //                             borderWidth: '2px',
// //                             borderColor: focusedField === 'email' ? '#4a7c59' : '#e0e0e0',
// //                             transition: 'all 0.3s'
// //                           }
// //                         },
// //                         '& .MuiInputLabel-root.Mui-focused': {
// //                           color: '#4a7c59'
// //                         }
// //                       }}
// //                     />
// //                   </motion.div>
// //                 </Grid>

// //                 {/* Phone Number */}
// //                 <Grid item xs={12}>
// //                   <motion.div
// //                     animate={{ 
// //                       y: focusedField === 'phoneNumber' ? -5 : 0
// //                     }}
// //                     transition={{ duration: 0.3 }}
// //                   >
// //                     <TextField
// //                       fullWidth
// //                       id="phoneNumber"
// //                       label="Phone Number (Optional)"
// //                       name="phoneNumber"
// //                       autoComplete="tel"
// //                       value={phoneNumber}
// //                       onChange={(e) => setPhoneNumber(e.target.value)}
// //                       onFocus={() => setFocusedField('phoneNumber')}
// //                       onBlur={() => setFocusedField(null)}
// //                       sx={{
// //                         '& .MuiOutlinedInput-root': {
// //                           borderRadius: 0,
// //                           '& fieldset': {
// //                             borderWidth: '2px',
// //                             borderColor: focusedField === 'phoneNumber' ? '#4a7c59' : '#e0e0e0',
// //                             transition: 'all 0.3s'
// //                           }
// //                         },
// //                         '& .MuiInputLabel-root.Mui-focused': {
// //                           color: '#4a7c59'
// //                         }
// //                       }}
// //                     />
// //                   </motion.div>
// //                 </Grid>

// //                 {/* Password */}
// //                 <Grid item xs={12}>
// //                   <motion.div
// //                     animate={{ 
// //                       y: focusedField === 'password' ? -5 : 0
// //                     }}
// //                     transition={{ duration: 0.3 }}
// //                   >
// //                     <TextField
// //                       required
// //                       fullWidth
// //                       name="password"
// //                       label="Password"
// //                       type={showPassword ? 'text' : 'password'}
// //                       id="password"
// //                       autoComplete="new-password"
// //                       value={password}
// //                       onChange={(e) => setPassword(e.target.value)}
// //                       onFocus={() => setFocusedField('password')}
// //                       onBlur={() => setFocusedField(null)}
// //                       sx={{
// //                         '& .MuiOutlinedInput-root': {
// //                           borderRadius: 0,
// //                           '& fieldset': {
// //                             borderWidth: '2px',
// //                             borderColor: focusedField === 'password' ? '#4a7c59' : '#e0e0e0',
// //                             transition: 'all 0.3s'
// //                           }
// //                         },
// //                         '& .MuiInputLabel-root.Mui-focused': {
// //                           color: '#4a7c59'
// //                         }
// //                       }}
// //                       InputProps={{
// //                         endAdornment: (
// //                           <InputAdornment position="end">
// //                             <IconButton
// //                               onClick={() => setShowPassword(!showPassword)}
// //                               edge="end"
// //                             >
// //                               {showPassword ? <VisibilityOff /> : <Visibility />}
// //                             </IconButton>
// //                           </InputAdornment>
// //                         ),
// //                       }}
// //                     />
// //                   </motion.div>
// //                 </Grid>

// //                 {/* Confirm Password */}
// //                 <Grid item xs={12}>
// //                   <motion.div
// //                     animate={{ 
// //                       y: focusedField === 'confirmPassword' ? -5 : 0
// //                     }}
// //                     transition={{ duration: 0.3 }}
// //                   >
// //                     <TextField
// //                       required
// //                       fullWidth
// //                       name="confirmPassword"
// //                       label="Confirm Password"
// //                       type={showPassword ? 'text' : 'password'}
// //                       id="confirmPassword"
// //                       autoComplete="new-password"
// //                       value={confirmPassword}
// //                       onChange={(e) => setConfirmPassword(e.target.value)}
// //                       onFocus={() => setFocusedField('confirmPassword')}
// //                       onBlur={() => setFocusedField(null)}
// //                       sx={{
// //                         '& .MuiOutlinedInput-root': {
// //                           borderRadius: 0,
// //                           '& fieldset': {
// //                             borderWidth: '2px',
// //                             borderColor: focusedField === 'confirmPassword' ? '#4a7c59' : '#e0e0e0',
// //                             transition: 'all 0.3s'
// //                           }
// //                         },
// //                         '& .MuiInputLabel-root.Mui-focused': {
// //                           color: '#4a7c59'
// //                         }
// //                       }}
// //                     />
// //                   </motion.div>
// //                 </Grid>
// //               </Grid>

// //               <motion.div
// //                 whileHover={{ scale: 1.02 }}
// //                 whileTap={{ scale: 0.98 }}
// //               >
// //                 <Button
// //                   type="submit"
// //                   fullWidth
// //                   variant="contained"
// //                   disabled={loading}
// //                   endIcon={<KeyboardArrowRight />}
// //                   sx={{
// //                     mt: 4,
// //                     py: 1.8,
// //                     borderRadius: 0,
// //                     bgcolor: '#1a1a1a',
// //                     fontSize: '0.95rem',
// //                     fontWeight: 600,
// //                     textTransform: 'uppercase',
// //                     letterSpacing: '2px',
// //                     '&:hover': {
// //                       bgcolor: '#2d2d2d',
// //                     },
// //                     '&:disabled': {
// //                       bgcolor: '#ccc'
// //                     }
// //                   }}
// //                 >
// //                   {loading ? 'Creating Account...' : 'Create Account'}
// //                 </Button>
// //               </motion.div>

// //               <Box sx={{ mt: 4, textAlign: 'center' }}>
// //                 <Typography variant="body2" color="text.secondary">
// //                   Already have an account?{' '}
// //                   <Link 
// //                     component={RouterLink} 
// //                     to="/login"
// //                     sx={{
// //                       color: '#4a7c59',
// //                       fontWeight: 600,
// //                       textDecoration: 'none',
// //                       position: 'relative',
// //                       '&::after': {
// //                         content: '""',
// //                         position: 'absolute',
// //                         bottom: -2,
// //                         left: 0,
// //                         width: 0,
// //                         height: '2px',
// //                         bgcolor: '#4a7c59',
// //                         transition: 'width 0.3s'
// //                       },
// //                       '&:hover::after': {
// //                         width: '100%'
// //                       }
// //                     }}
// //                   >
// //                     Sign in
// //                   </Link>
// //                 </Typography>
// //               </Box>
// //             </Box>
// //           </motion.div>
// //         </Box>
// //       </Box>

// //       {/* Animated Background Side - RIGHT */}
// //       {!isMobile && (
// //         <Box
// //           sx={{
// //             width: '60%',
// //             position: 'relative',
// //             overflow: 'hidden'
// //           }}
// //         >
// //           <motion.div
// //             initial={{ opacity: 0, scale: 1.1 }}
// //             animate={{ opacity: 1, scale: 1 }}
// //             transition={{ duration: 1.5 }}
// //             style={{
// //               width: '100%',
// //               height: '100%',
// //               position: 'relative'
// //             }}
// //           >
// //             <Box
// //               sx={{
// //                 width: '100%',
// //                 height: '100%',
// //                 backgroundImage: 'url(/images/260721_001_0010_ISOMETRIA_3-1.png)',
// //                 backgroundSize: 'cover',
// //                 backgroundPosition: 'center',
// //                 position: 'relative'
// //               }}
// //             />

// //             {/* Animated Gradient Overlay */}
// //             <motion.div
// //               animate={{
// //                 background: [
// //                   'linear-gradient(135deg, rgba(139, 195, 74, 0.9) 0%, rgba(74, 124, 89, 0.85) 100%)',
// //                   'linear-gradient(135deg, rgba(139, 195, 74, 0.85) 0%, rgba(74, 124, 89, 0.9) 100%)',
// //                   'linear-gradient(135deg, rgba(139, 195, 74, 0.9) 0%, rgba(74, 124, 89, 0.85) 100%)'
// //                 ]
// //               }}
// //               transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
// //               style={{
// //                 position: 'absolute',
// //                 top: 0,
// //                 left: 0,
// //                 right: 0,
// //                 bottom: 0
// //               }}
// //             />

// //             {/* Floating Content */}
// //             <Box
// //               sx={{
// //                 position: 'absolute',
// //                 top: '50%',
// //                 left: '50%',
// //                 transform: 'translate(-50%, -50%)',
// //                 textAlign: 'center',
// //                 color: 'white',
// //                 width: '80%',
// //                 zIndex: 1
// //               }}
// //             >
// //               <motion.div
// //                 initial={{ y: 30, opacity: 0 }}
// //                 animate={{ y: 0, opacity: 1 }}
// //                 transition={{ delay: 0.5, duration: 1 }}
// //               >
// //              <motion.div
// //                 animate={{ 
// //                   y: [0, -10, 0]
// //                 }}
// //                 transition={{ 
// //                   duration: 3,
// //                   repeat: Infinity,
// //                   ease: "easeInOut"
// //                 }}
// //               >
// //                 <Box
// //                   component="img"
// //                   src="/images/logos/LOGO_MICHELANGELO_PNG-07.png"
// //                   alt="Michelangelo Del Valle"
// //                   sx={{
// //                     width: '35%',
// //                     height: 'auto',
// //                     filter: 'brightness(0) invert(1)',
// //                     objectFit: 'contain'
// //                   }}
// //                 />
// //               </motion.div>
              
                
// //                              <Box
// //                 component="img"
// //                 src="/images/logos/Logo_LakewoodOaks-05.png"
// //                 alt="Lakewood Oaks on Lake Conroe"
// //                 sx={{
// //                   width: '90%',
// //                   maxWidth: '500px',
// //                   height: 'auto',
// //                   mb: 3,
// //                   filter: 'brightness(0) invert(1)',
// //                   objectFit: 'contain'
// //                 }}
// //               />

// //               </motion.div>
// //             </Box>

// //             {/* Animated Lines Decoration */}
// //             <motion.div
// //               animate={{ 
// //                 width: ['0%', '30%', '0%']
// //               }}
// //               transition={{ 
// //                 duration: 4,
// //                 repeat: Infinity,
// //                 ease: "easeInOut"
// //               }}
// //               style={{
// //                 position: 'absolute',
// //                 bottom: '20%',
// //                 left: 0,
// //                 height: '2px',
// //                 background: 'white',
// //                 opacity: 0.5
// //               }}
// //             />
// //           </motion.div>
// //         </Box>
// //       )}
// //     </Box>
// //   )
// // }

// // export default Register

// import { useState, useEffect } from 'react'
// import { useNavigate, useParams, Link as RouterLink } from 'react-router-dom'
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
//   useTheme,
//   Grid,
//   CircularProgress
// } from '@mui/material'
// import { Visibility, VisibilityOff, KeyboardArrowRight } from '@mui/icons-material'
// import { useAuth } from '../context/AuthContext'
// import { motion, AnimatePresence } from 'framer-motion'
// import PhoneInput from 'react-phone-input-2'
// import 'react-phone-input-2/lib/style.css'
// import api from '../services/api'
// import TypingFooter from '../components/Footer'

// const Register = () => {
//   const { token } = useParams()
//   const navigate = useNavigate()
//   const { register: authRegister, loginWithToken } = useAuth() // ✅ Usar loginWithToken
//   const theme = useTheme()
//   const isMobile = useMediaQuery(theme.breakpoints.down('md'))

//   const isPasswordSetup = !!token

//   const [firstName, setFirstName] = useState('')
//   const [lastName, setLastName] = useState('')
//   const [email, setEmail] = useState('')
//   const [phoneNumber, setPhoneNumber] = useState('')
//   const [password, setPassword] = useState('')
//   const [confirmPassword, setConfirmPassword] = useState('')
//   const [showPassword, setShowPassword] = useState(false)
//   const [error, setError] = useState('')
//   const [loading, setLoading] = useState(false)
//   const [verifying, setVerifying] = useState(false)
//   const [focusedField, setFocusedField] = useState(null)

//   useEffect(() => {
//     if (isPasswordSetup) {
//       verifyTokenAndLoadUserData()
//     }
//   }, [token, isPasswordSetup])

//   const verifyTokenAndLoadUserData = async () => {
//     try {
//       setVerifying(true)
//       console.log('🔍 Verifying setup token:', token)
      
//       const response = await api.get(`/auth/verify-setup-token/${token}`)
      
//       console.log('✅ Token verified, user data:', response.data)
      
//       if (response.data.valid && response.data.user) {
//         const userData = response.data.user
        
//         setFirstName(userData.firstName || '')
//         setLastName(userData.lastName || '')
//         setEmail(userData.email || '')
        
//         // ✅ Limpiar el número de teléfono correctamente
//         let cleanPhone = userData.phoneNumber || ''
//         if (cleanPhone) {
//           cleanPhone = cleanPhone.replace(/^\+/, '')
//           cleanPhone = cleanPhone.replace(/[\s\-\(\)]/g, '')
//         }
//         setPhoneNumber(cleanPhone)
        
//         console.log('📝 User data loaded into form')
//         console.log('📱 Phone number set to:', cleanPhone)
//       } else {
//         setError('Invalid or expired setup link')
//       }
//     } catch (error) {
//       console.error('❌ Error verifying token:', error)
//       setError(error.response?.data?.message || 'Invalid or expired setup link')
//     } finally {
//       setVerifying(false)
//     }
//   }

//   const handleSubmit = async (e) => {
//     e.preventDefault()
//     setError('')

//     if (password !== confirmPassword) {
//       setError('The passwords do not match')
//       return
//     }

//     if (password.length < 6) {
//       setError('The password must be at least 6 characters long')
//       return
//     }

//     setLoading(true)

//     try {
//       if (isPasswordSetup) {
//         // Flujo de setup password
//         console.log('🔐 Setting up password for token:', token)
        
//         const response = await api.post(`/auth/setup-password/${token}`, {
//           password
//         })
        
//         console.log('✅ Password setup successful:', response.data)
        
//         const { token: authToken, user } = response.data
        
//         // ✅ Usar loginWithToken del contexto
//         loginWithToken(authToken, user)
        
//         // Pequeño delay para asegurar que el estado se actualice
//         setTimeout(() => {
//           navigate('/dashboard')
//         }, 300)
        
//       } else {
//         // Flujo de registro normal
//         const result = await authRegister(firstName, lastName, email, password, phoneNumber)
        
//         if (result.success) {
//           navigate('/dashboard')
//         } else {
//           setError(result.error || 'Error registering account')
//         }
//       }
//     } catch (error) {
//       console.error('❌ Error in form submission:', error)
//       setError(error.response?.data?.message || 'An error occurred')
//       setLoading(false)
//     }
//   }

//   // Loading state mientras verifica el token
//   if (isPasswordSetup && verifying) {
//     return (
//       <Box
//         sx={{
//           minHeight: '100vh',
//           display: 'flex',
//           alignItems: 'center',
//           justifyContent: 'center',
//           bgcolor: '#f5f5f5'
//         }}
//       >
//         <Box sx={{ textAlign: 'center' }}>
//           <CircularProgress size={60} sx={{ color: '#4a7c59', mb: 2 }} />
//           <Typography variant="h6" color="text.secondary">
//             Verifying your setup link...
//           </Typography>
//         </Box>
//       </Box>
//     )
//   }

//   // Error state si el token es inválido
//   if (isPasswordSetup && error && !firstName) {
//     return (
//       <Box
//         sx={{
//           minHeight: '100vh',
//           display: 'flex',
//           alignItems: 'center',
//           justifyContent: 'center',
//           bgcolor: '#f5f5f5',
//           p: 3
//         }}
//       >
//         <Box sx={{ maxWidth: 500, width: '100%' }}>
//           <Alert severity="error" sx={{ mb: 3 }}>
//             {error}
//           </Alert>
//           <Button
//             fullWidth
//             variant="contained"
//             onClick={() => navigate('/login')}
//             sx={{
//               bgcolor: '#4a7c59',
//               '&:hover': { bgcolor: '#3d664a' }
//             }}
//           >
//             Go to Login
//           </Button>
//         </Box>
//       </Box>
//     )
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
//       {/* Form Side - LEFT */}
//       <Box
//         sx={{
//           width: isMobile ? '100%' : '40%',
//           display: 'flex',
//           alignItems: 'center',
//           justifyContent: 'center',
//           bgcolor: 'white',
//           position: 'relative',
//           p: 4,
//           overflowY: 'auto',
//           zIndex: 2
//         }}
//       >
//         <Box sx={{ width: '100%', maxWidth: '450px', py: 4 }}>
//           <motion.div
//             initial={{ x: -50, opacity: 0 }}
//             animate={{ x: 0, opacity: 1 }}
//             transition={{ duration: 0.8, delay: 0.3 }}
//           >
//             {/* Header */}
//             <Box sx={{ mb: 5 }}>
//               <Typography 
//                 variant="h4" 
//                 fontWeight="300"
//                 sx={{ 
//                   mb: 1,
//                   color: '#1a1a1a',
//                   letterSpacing: '1px'
//                 }}
//               >
//                 {isPasswordSetup ? 'Set Your' : 'Create'}
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
//                 {isPasswordSetup ? 'Password' : 'Your Account'}
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

//             {isPasswordSetup && firstName && (
//               <Alert severity="info" sx={{ mb: 3, borderRadius: 0 }}>
//                 Welcome, {firstName}! Please set your password to complete your account setup.
//               </Alert>
//             )}

//             {error && !verifying && (
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
//               <Grid container spacing={2}>
//                 {/* First Name */}
//                 <Grid item xs={12} sm={6}>
//                   <motion.div
//                     animate={{ 
//                       y: focusedField === 'firstName' ? -5 : 0
//                     }}
//                     transition={{ duration: 0.3 }}
//                   >
//                     <TextField
//                       required
//                       fullWidth
//                       id="firstName"
//                       label="First Name"
//                       name="firstName"
//                       autoComplete="given-name"
//                       autoFocus={!isPasswordSetup}
//                       value={firstName}
//                       onChange={(e) => setFirstName(e.target.value)}
//                       onFocus={() => setFocusedField('firstName')}
//                       onBlur={() => setFocusedField(null)}
//                       disabled={isPasswordSetup}
//                       sx={{
//                         '& .MuiOutlinedInput-root': {
//                           borderRadius: 0,
//                           '& fieldset': {
//                             borderWidth: '2px',
//                             borderColor: focusedField === 'firstName' ? '#4a7c59' : '#e0e0e0',
//                             transition: 'all 0.3s'
//                           }
//                         },
//                         '& .MuiInputLabel-root.Mui-focused': {
//                           color: '#4a7c59'
//                         }
//                       }}
//                     />
//                   </motion.div>
//                 </Grid>

//                 {/* Last Name */}
//                 <Grid item xs={12} sm={6}>
//                   <motion.div
//                     animate={{ 
//                       y: focusedField === 'lastName' ? -5 : 0
//                     }}
//                     transition={{ duration: 0.3 }}
//                   >
//                     <TextField
//                       required
//                       fullWidth
//                       id="lastName"
//                       label="Last Name"
//                       name="lastName"
//                       autoComplete="family-name"
//                       value={lastName}
//                       onChange={(e) => setLastName(e.target.value)}
//                       onFocus={() => setFocusedField('lastName')}
//                       onBlur={() => setFocusedField(null)}
//                       disabled={isPasswordSetup}
//                       sx={{
//                         '& .MuiOutlinedInput-root': {
//                           borderRadius: 0,
//                           '& fieldset': {
//                             borderWidth: '2px',
//                             borderColor: focusedField === 'lastName' ? '#4a7c59' : '#e0e0e0',
//                             transition: 'all 0.3s'
//                           }
//                         },
//                         '& .MuiInputLabel-root.Mui-focused': {
//                           color: '#4a7c59'
//                         }
//                       }}
//                     />
//                   </motion.div>
//                 </Grid>

//                 {/* Email */}
//                 <Grid item xs={12}>
//                   <motion.div
//                     animate={{ 
//                       y: focusedField === 'email' ? -5 : 0
//                     }}
//                     transition={{ duration: 0.3 }}
//                   >
//                     <TextField
//                       required
//                       fullWidth
//                       id="email"
//                       label="Email Address"
//                       name="email"
//                       autoComplete="email"
//                       value={email}
//                       onChange={(e) => setEmail(e.target.value)}
//                       onFocus={() => setFocusedField('email')}
//                       onBlur={() => setFocusedField(null)}
//                       disabled={isPasswordSetup}
//                       sx={{
//                         '& .MuiOutlinedInput-root': {
//                           borderRadius: 0,
//                           '& fieldset': {
//                             borderWidth: '2px',
//                             borderColor: focusedField === 'email' ? '#4a7c59' : '#e0e0e0',
//                             transition: 'all 0.3s'
//                           }
//                         },
//                         '& .MuiInputLabel-root.Mui-focused': {
//                           color: '#4a7c59'
//                         }
//                       }}
//                     />
//                   </motion.div>
//                 </Grid>

//                 {/* Phone Number */}
//                 <Grid item xs={12}>
//                   <Box>
//                     <Typography 
//                       variant="caption" 
//                       color="text.secondary" 
//                       sx={{ mb: 0.5, display: 'block' }}
//                     >
//                       Phone Number {!isPasswordSetup && '(Optional)'}
//                     </Typography>
//                     <PhoneInput
//                       country={'us'}
//                       value={phoneNumber}
//                       onChange={(value) => {
//                         console.log('📱 Phone changed to:', value)
//                         setPhoneNumber(value)
//                       }}
//                       disabled={isPasswordSetup}
//                       inputProps={{
//                         name: 'phone',
//                         required: false
//                       }}
//                       containerStyle={{
//                         width: '100%'
//                       }}
//                       inputStyle={{
//                         width: '100%',
//                         height: '56px',
//                         fontSize: '16px',
//                         border: `2px solid ${focusedField === 'phone' ? '#4a7c59' : '#e0e0e0'}`,
//                         borderRadius: 0,
//                         backgroundColor: isPasswordSetup ? '#f5f5f5' : 'white'
//                       }}
//                       buttonStyle={{
//                         border: `2px solid ${focusedField === 'phone' ? '#4a7c59' : '#e0e0e0'}`,
//                         borderRight: 'none',
//                         borderRadius: 0,
//                         backgroundColor: isPasswordSetup ? '#f5f5f5' : 'white'
//                       }}
//                       onFocus={() => setFocusedField('phone')}
//                       onBlur={() => setFocusedField(null)}
//                     />
//                   </Box>
//                 </Grid>

//                 {/* Password */}
//                 <Grid item xs={12}>
//                   <motion.div
//                     animate={{ 
//                       y: focusedField === 'password' ? -5 : 0
//                     }}
//                     transition={{ duration: 0.3 }}
//                   >
//                     <TextField
//                       required
//                       fullWidth
//                       name="password"
//                       label="Password"
//                       type={showPassword ? 'text' : 'password'}
//                       id="password"
//                       autoComplete="new-password"
//                       autoFocus={isPasswordSetup}
//                       value={password}
//                       onChange={(e) => setPassword(e.target.value)}
//                       onFocus={() => setFocusedField('password')}
//                       onBlur={() => setFocusedField(null)}
//                       sx={{
//                         '& .MuiOutlinedInput-root': {
//                           borderRadius: 0,
//                           '& fieldset': {
//                             borderWidth: '2px',
//                             borderColor: focusedField === 'password' ? '#4a7c59' : '#e0e0e0',
//                             transition: 'all 0.3s'
//                           }
//                         },
//                         '& .MuiInputLabel-root.Mui-focused': {
//                           color: '#4a7c59'
//                         }
//                       }}
//                       InputProps={{
//                         endAdornment: (
//                           <InputAdornment position="end">
//                             <IconButton
//                               onClick={() => setShowPassword(!showPassword)}
//                               edge="end"
//                             >
//                               {showPassword ? <VisibilityOff /> : <Visibility />}
//                             </IconButton>
//                           </InputAdornment>
//                         ),
//                       }}
//                       helperText="Must be at least 6 characters"
//                     />
//                   </motion.div>
//                 </Grid>

//                 {/* Confirm Password */}
//                 <Grid item xs={12}>
//                   <motion.div
//                     animate={{ 
//                       y: focusedField === 'confirmPassword' ? -5 : 0
//                     }}
//                     transition={{ duration: 0.3 }}
//                   >
//                     <TextField
//                       required
//                       fullWidth
//                       name="confirmPassword"
//                       label="Confirm Password"
//                       type={showPassword ? 'text' : 'password'}
//                       id="confirmPassword"
//                       autoComplete="new-password"
//                       value={confirmPassword}
//                       onChange={(e) => setConfirmPassword(e.target.value)}
//                       onFocus={() => setFocusedField('confirmPassword')}
//                       onBlur={() => setFocusedField(null)}
//                       sx={{
//                         '& .MuiOutlinedInput-root': {
//                           borderRadius: 0,
//                           '& fieldset': {
//                             borderWidth: '2px',
//                             borderColor: focusedField === 'confirmPassword' ? '#4a7c59' : '#e0e0e0',
//                             transition: 'all 0.3s'
//                           }
//                         },
//                         '& .MuiInputLabel-root.Mui-focused': {
//                           color: '#4a7c59'
//                         }
//                       }}
//                     />
//                   </motion.div>
//                 </Grid>
//               </Grid>

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
//                     mt: 4,
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
//                   {loading 
//                     ? (isPasswordSetup ? 'Setting Password...' : 'Creating Account...') 
//                     : (isPasswordSetup ? 'Complete Setup' : 'Create Account')
//                   }
//                 </Button>
//               </motion.div>

//               {!isPasswordSetup && (
//                 <Box sx={{ mt: 4, textAlign: 'center' }}>
//                   <Typography variant="body2" color="text.secondary">
//                     Already have an account?{' '}
//                     <Link 
//                       component={RouterLink} 
//                       to="/login"
//                       sx={{
//                         color: '#4a7c59',
//                         fontWeight: 600,
//                         textDecoration: 'none',
//                         position: 'relative',
//                         '&::after': {
//                           content: '""',
//                           position: 'absolute',
//                           bottom: -2,
//                           left: 0,
//                           width: 0,
//                           height: '2px',
//                           bgcolor: '#4a7c59',
//                           transition: 'width 0.3s'
//                         },
//                         '&:hover::after': {
//                           width: '100%'
//                         }
//                       }}
//                     >
//                       Sign in
//                     </Link>
//                   </Typography>
//                 </Box>
//               )}
//             </Box>
//           </motion.div>
//         </Box>
//                   {!isMobile && <TypingFooter variant="dark" />}

//       </Box>

//       {/* Animated Background Side - RIGHT */}
//       {!isMobile && (
//         <Box
//           sx={{
//             width: '60%',
//             position: 'relative',
//             overflow: 'hidden'
//           }}
//         >
//           <motion.div
//             initial={{ opacity: 0, scale: 1.1 }}
//             animate={{ opacity: 1, scale: 1 }}
//             transition={{ duration: 1.5 }}
//             style={{
//               width: '100%',
//               height: '100%',
//               position: 'relative'
//             }}
//           >
//             <Box
//               sx={{
//                 width: '100%',
//                 height: '100%',
//                 backgroundImage: 'url(/images/260721_001_0010_ISOMETRIA_3-1.png)',
//                 backgroundSize: 'cover',
//                 backgroundPosition: 'center',
//                 position: 'relative'
//               }}
//             />

//             <motion.div
//               animate={{
//                 background: [
//                   'linear-gradient(135deg, rgba(139, 195, 74, 0.9) 0%, rgba(74, 124, 89, 0.85) 100%)',
//                   'linear-gradient(135deg, rgba(139, 195, 74, 0.85) 0%, rgba(74, 124, 89, 0.9) 100%)',
//                   'linear-gradient(135deg, rgba(139, 195, 74, 0.9) 0%, rgba(74, 124, 89, 0.85) 100%)'
//                 ]
//               }}
//               transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
//               style={{
//                 position: 'absolute',
//                 top: 0,
//                 left: 0,
//                 right: 0,
//                 bottom: 0
//               }}
//             />

//             <Box
//               sx={{
//                 position: 'absolute',
//                 top: '50%',
//                 left: '50%',
//                 transform: 'translate(-50%, -50%)',
//                 textAlign: 'center',
//                 color: 'white',
//                 width: '80%',
//                 zIndex: 1
//               }}
//             >
//               <motion.div
//                 initial={{ y: 30, opacity: 0 }}
//                 animate={{ y: 0, opacity: 1 }}
//                 transition={{ delay: 0.5, duration: 1 }}
//               >
//                 <motion.div
//                   animate={{ 
//                     y: [0, -10, 0]
//                   }}
//                   transition={{ 
//                     duration: 3,
//                     repeat: Infinity,
//                     ease: "easeInOut"
//                   }}
//                 >
//                   <Box
//                     component="img"
//                     src="/images/logos/LOGO_MICHELANGELO_PNG-07.png"
//                     alt="Michelangelo Del Valle"
//                     sx={{
//                       width: '35%',
//                       height: 'auto',
//                       filter: 'brightness(0) invert(1)',
//                       objectFit: 'contain'
//                     }}
//                   />
//                 </motion.div>
                
//                 <Box
//                   component="img"
//                   src="/images/logos/Logo_LakewoodOaks-05.png"
//                   alt="Lakewood Oaks on Lake Conroe"
//                   sx={{
//                     width: '90%',
//                     maxWidth: '500px',
//                     height: 'auto',
//                     mb: 3,
//                     filter: 'brightness(0) invert(1)',
//                     objectFit: 'contain'
//                   }}
//                 />
//               </motion.div>
//             </Box>

//             <motion.div
//               animate={{ 
//                 width: ['0%', '30%', '0%']
//               }}
//               transition={{ 
//                 duration: 4,
//                 repeat: Infinity,
//                 ease: "easeInOut"
//               }}
//               style={{
//                 position: 'absolute',
//                 bottom: '20%',
//                 left: 0,
//                 height: '2px',
//                 background: 'white',
//                 opacity: 0.5
//               }}
//             />
//           </motion.div>
//         </Box>
//       )}
//     </Box>
//   )
// }

// export default Register

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
import { Visibility, VisibilityOff, KeyboardArrowRight } from '@mui/icons-material'
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
        
        // ✅ CORREGIDO: Limpiar y formatear el número de teléfono
        let cleanPhone = userData.phoneNumber || ''
        if (cleanPhone) {
          // Remover cualquier símbolo + al inicio
          cleanPhone = cleanPhone.replace(/^\+/, '')
          // Remover espacios, guiones, paréntesis
          cleanPhone = cleanPhone.replace(/[\s\-\(\)]/g, '')
          
          console.log('📱 Original phone:', userData.phoneNumber)
          console.log('📱 Cleaned phone:', cleanPhone)
        }
        
        // Setear el número limpio (PhoneInput espera solo dígitos)
        setPhoneNumber(cleanPhone)
        
        console.log('📝 User data loaded into form')
      } else {
        setError('Invalid or expired setup link')
      }
    } catch (error) {
      console.error('❌ Error verifying token:', error)
      setError(error.response?.data?.message || 'Invalid or expired setup link')
    } finally {
      setVerifying(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('The passwords do not match')
      return
    }

    if (password.length < 6) {
      setError('The password must be at least 6 characters long')
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
          setError(result.error || 'Error registering account')
        }
      }
    } catch (error) {
      console.error('❌ Error in form submission:', error)
      setError(error.response?.data?.message || 'An error occurred')
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
          bgcolor: '#f5f5f5'
        }}
      >
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress size={60} sx={{ color: '#4a7c59', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            Verifying your setup link...
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
          bgcolor: '#f5f5f5',
          p: 3
        }}
      >
        <Box sx={{ maxWidth: 500, width: '100%' }}>
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
          <Button
            fullWidth
            variant="contained"
            onClick={() => navigate('/login')}
            sx={{
              bgcolor: '#4a7c59',
              '&:hover': { bgcolor: '#3d664a' }
            }}
          >
            Go to Login
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
      <Box
        sx={{
          width: isMobile ? '100%' : '40%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'white',
          position: 'relative',
          p: 4,
          overflowY: 'auto',
          zIndex: 2
        }}
      >
        <Box sx={{ width: '100%', maxWidth: '450px', py: 4 }}>
          <motion.div
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <Box sx={{ mb: 5 }}>
              <Typography 
                variant="h4" 
                fontWeight="300"
                sx={{ 
                  mb: 1,
                  color: '#1a1a1a',
                  letterSpacing: '1px'
                }}
              >
                {isPasswordSetup ? 'Set Your' : 'Create'}
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
                {isPasswordSetup ? 'Password' : 'Your Account'}
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

            {isPasswordSetup && firstName && (
              <Alert severity="info" sx={{ mb: 3, borderRadius: 0 }}>
                Welcome, {firstName}! Please set your password to complete your account setup.
              </Alert>
            )}

            {error && !verifying && (
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

            <Box component="form" onSubmit={handleSubmit}>
              <Grid container spacing={2}>
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
                      label="First Name"
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
                          borderRadius: 0,
                          '& fieldset': {
                            borderWidth: '2px',
                            borderColor: focusedField === 'firstName' ? '#4a7c59' : '#e0e0e0',
                            transition: 'all 0.3s'
                          }
                        },
                        '& .MuiInputLabel-root.Mui-focused': {
                          color: '#4a7c59'
                        }
                      }}
                    />
                  </motion.div>
                </Grid>

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
                      label="Last Name"
                      name="lastName"
                      autoComplete="family-name"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      onFocus={() => setFocusedField('lastName')}
                      onBlur={() => setFocusedField(null)}
                      disabled={isPasswordSetup}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 0,
                          '& fieldset': {
                            borderWidth: '2px',
                            borderColor: focusedField === 'lastName' ? '#4a7c59' : '#e0e0e0',
                            transition: 'all 0.3s'
                          }
                        },
                        '& .MuiInputLabel-root.Mui-focused': {
                          color: '#4a7c59'
                        }
                      }}
                    />
                  </motion.div>
                </Grid>

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
                      label="Email Address"
                      name="email"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onFocus={() => setFocusedField('email')}
                      onBlur={() => setFocusedField(null)}
                      disabled={isPasswordSetup}
                      sx={{
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
                </Grid>

                {/* ✅ PHONE INPUT CORREGIDO */}
                <Grid item xs={12}>
                  <Box>
                    <Typography 
                      variant="caption" 
                      color="text.secondary" 
                      sx={{ mb: 0.5, display: 'block' }}
                    >
                      Phone Number {!isPasswordSetup && '(Optional)'}
                    </Typography>
                    <PhoneInput
                      country={'us'}
                      value={phoneNumber}
                      onChange={(value) => {
                        console.log('📱 Phone changed to:', value)
                        setPhoneNumber(value)
                      }}
                      disabled={isPasswordSetup}
                      // ✅ Permitir auto-detección del país basado en el número
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
                        border: `2px solid ${focusedField === 'phone' ? '#4a7c59' : '#e0e0e0'}`,
                        borderRadius: 0,
                        backgroundColor: isPasswordSetup ? '#f5f5f5' : 'white',
                        paddingLeft: '48px'
                      }}
                      buttonStyle={{
                        border: `2px solid ${focusedField === 'phone' ? '#4a7c59' : '#e0e0e0'}`,
                        borderRight: 'none',
                        borderRadius: 0,
                        backgroundColor: isPasswordSetup ? '#f5f5f5' : 'white'
                      }}
                      onFocus={() => setFocusedField('phone')}
                      onBlur={() => setFocusedField(null)}
                      // ✅ Preferir el país del número guardado
                      preferredCountries={['us', 'mx', 'ca']}
                    />
                  </Box>
                </Grid>

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
                      label="Password"
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
                      helperText="Must be at least 6 characters"
                    />
                  </motion.div>
                </Grid>

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
                      label="Confirm Password"
                      type={showPassword ? 'text' : 'password'}
                      id="confirmPassword"
                      autoComplete="new-password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      onFocus={() => setFocusedField('confirmPassword')}
                      onBlur={() => setFocusedField(null)}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 0,
                          '& fieldset': {
                            borderWidth: '2px',
                            borderColor: focusedField === 'confirmPassword' ? '#4a7c59' : '#e0e0e0',
                            transition: 'all 0.3s'
                          }
                        },
                        '& .MuiInputLabel-root.Mui-focused': {
                          color: '#4a7c59'
                        }
                      }}
                    />
                  </motion.div>
                </Grid>
              </Grid>

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
                    mt: 4,
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
                  {loading 
                    ? (isPasswordSetup ? 'Setting Password...' : 'Creating Account...') 
                    : (isPasswordSetup ? 'Complete Setup' : 'Create Account')
                  }
                </Button>
              </motion.div>

              {!isPasswordSetup && (
                <Box sx={{ mt: 4, textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    Already have an account?{' '}
                    <Link 
                      component={RouterLink} 
                      to="/login"
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
                      Sign in
                    </Link>
                  </Typography>
                </Box>
              )}
            </Box>
          </motion.div>
        </Box>
        {!isMobile && <TypingFooter variant="dark" />}
      </Box>

      {/* Animated Background Side - RIGHT */}
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

            <motion.div
              animate={{
                background: [
                  'linear-gradient(135deg, rgba(139, 195, 74, 0.9) 0%, rgba(74, 124, 89, 0.85) 100%)',
                  'linear-gradient(135deg, rgba(139, 195, 74, 0.85) 0%, rgba(74, 124, 89, 0.9) 100%)',
                  'linear-gradient(135deg, rgba(139, 195, 74, 0.9) 0%, rgba(74, 124, 89, 0.85) 100%)'
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

            <Box
              sx={{
                position: 'absolute',
                top: '50%',
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
                    src="/images/logos/LOGO_MICHELANGELO_PNG-07.png"
                    alt="Michelangelo Del Valle"
                    sx={{
                      width: '35%',
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
                background: 'white',
                opacity: 0.5
              }}
            />
          </motion.div>
        </Box>
      )}
    </Box>
  )
}

export default Register