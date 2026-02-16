import { useState } from 'react'
import {
  Box,
  Paper,
  Typography,
  Avatar,
  Grid,
  TextField,
  Button,
  Divider,
  Container,
  IconButton,
  Alert,
  Snackbar,
  InputAdornment,
  Chip
} from '@mui/material'
import {
  Edit,
  Save,
  Person,
  Email,
  Phone,
  Lock,
  Visibility,
  VisibilityOff,
  CameraAlt,
  CheckCircle,
  Cancel
} from '@mui/icons-material'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'

const Profile = () => {
  const { user, token } = useAuth()  
  const [isEditing, setIsEditing] = useState(false)
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false
  })
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  })

  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phoneNumber: user?.phoneNumber || ''
  })

  const [passwordData, setPasswordData] = useState({
    current: '',
    new: '',
    confirm: ''
  })

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value
    })
  }

  // Cambiar contraseña llamando al backend
  const handleSave = async () => {
    // Validación de contraseña
    if (
      passwordData.new ||
      passwordData.confirm ||
      passwordData.current
    ) {
      if (!passwordData.current || !passwordData.new || !passwordData.confirm) {
        setSnackbar({
          open: true,
          message: 'Please fill all password fields.',
          severity: 'error'
        })
        return
      }
      if (passwordData.new !== passwordData.confirm) {
        setSnackbar({
          open: true,
          message: 'New passwords do not match.',
          severity: 'error'
        })
        return
      }
      if (passwordData.new.length < 6) {
        setSnackbar({
          open: true,
          message: 'New password must be at least 6 characters.',
          severity: 'error'
        })
        return
      }
      try {
        await axios.post(
          '/api/auth/change-password',
          {
            currentPassword: passwordData.current,
            newPassword: passwordData.new
          },
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        )
        setSnackbar({
          open: true,
          message: 'Password changed successfully!',
          severity: 'success'
        })
        setPasswordData({ current: '', new: '', confirm: '' })
      } catch (err) {
        setSnackbar({
          open: true,
          message:
            err.response?.data?.message ||
            'Error changing password. Please try again.',
          severity: 'error'
        })
        return
      }
    }

    // Aquí iría la lógica de guardado de datos personales si aplica
    setIsEditing(false)
    setSnackbar({
      open: true,
      message: 'Profile updated successfully!',
      severity: 'success'
    })
  }

  const handleCancel = () => {
    setIsEditing(false)
    setFormData({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      phoneNumber: user?.phoneNumber || ''
    })
    setPasswordData({
      current: '',
      new: '',
      confirm: ''
    })
  }

  const togglePasswordVisibility = (field) => {
    setShowPassword(prev => ({
      ...prev,
      [field]: !prev[field]
    }))
  }

  return (
    <Box
      sx={{
        minHeight: '90vh',
        background: 'linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%)',
        p: { xs: 2, sm: 2 },
      }}
    >
      <Container maxWidth="xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Paper
            elevation={0}
            sx={{
              p: { xs: 3, md: 4 },
              mb: 4,
              borderRadius: 4,
              border: '1px solid rgba(0,0,0,0.08)',
              background: 'linear-gradient(135deg, #ffffff 0%, #fafafa 100%)',
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: 4,
                background: 'linear-gradient(90deg, #333F1F, #8CA551, #333F1F)'
              }
            }}
          >
            <Box display="flex" alignItems="center" gap={2}>
              <motion.div
                animate={{
                  scale: [1, 1.05, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatDelay: 3
                }}
              >
                <Box
                  sx={{
                    width: { xs: 56, md: 64 },
                    height: { xs: 56, md: 64 },
                    borderRadius: 3,
                    background: 'linear-gradient(135deg, #333F1F 0%, #8CA551 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 8px 24px rgba(51, 63, 31, 0.3)'
                  }}
                >
                  <Person sx={{ fontSize: { xs: 28, md: 32 }, color: 'white' }} />
                </Box>
              </motion.div>

              <Box flex={1}>
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 800,
                    color: '#333F1F',
                    fontFamily: '"Poppins", sans-serif',
                    letterSpacing: '0.5px',
                    fontSize: { xs: '1.75rem', md: '2.125rem' }
                  }}
                >
                  My Profile
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    color: '#706f6f',
                    fontFamily: '"Poppins", sans-serif',
                    fontSize: { xs: '0.875rem', md: '1rem' }
                  }}
                >
                  Manage your personal information and security settings
                </Typography>
              </Box>
            </Box>
          </Paper>
        </motion.div>

        <Grid container spacing={3}>
          {/* Avatar & Basic Info Card */}
          <Grid item xs={12} md={4}>
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              <Paper
                elevation={0}
                sx={{
                  p: 4,
                  borderRadius: 4,
                  border: '1px solid rgba(0,0,0,0.08)',
                  textAlign: 'center',
                  background: 'linear-gradient(180deg, #ffffff 0%, #fafafa 100%)',
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 3,
                    background: 'linear-gradient(90deg, #333F1F, #8CA551, #333F1F)',
                  }
                }}
              >
                <Box sx={{ position: 'relative', display: 'inline-block', mb: 2 }}>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    <Avatar
                      sx={{
                        width: { xs: 120, md: 140 },
                        height: { xs: 120, md: 140 },
                        margin: '0 auto',
                        fontSize: '3.5rem',
                        fontWeight: 700,
                        background: 'linear-gradient(135deg, #333F1F 0%, #8CA551 100%)',
                        boxShadow: '0 8px 24px rgba(51, 63, 31, 0.3)',
                        border: '4px solid white'
                      }}
                    >
                      {user?.firstName?.charAt(0).toUpperCase()}
                    </Avatar>
                  </motion.div>
                  
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <IconButton
                      sx={{
                        position: 'absolute',
                        bottom: 0,
                        right: 0,
                        bgcolor: '#8CA551',
                        color: 'white',
                        width: 44,
                        height: 44,
                        boxShadow: '0 4px 12px rgba(140, 165, 81, 0.4)',
                        '&:hover': {
                          bgcolor: '#333F1F',
                          boxShadow: '0 6px 20px rgba(51, 63, 31, 0.5)'
                        }
                      }}
                    >
                      <CameraAlt sx={{ fontSize: 20 }} />
                    </IconButton>
                  </motion.div>
                </Box>

                <Typography
                  variant="h5"
                  sx={{
                    mt: 2,
                    fontWeight: 700,
                    color: '#333F1F',
                    fontFamily: '"Poppins", sans-serif'
                  }}
                >
                  {user?.firstName} {user?.lastName}
                </Typography>
                
                <Typography
                  variant="body2"
                  sx={{
                    color: '#706f6f',
                    fontFamily: '"Poppins", sans-serif',
                    mb: 2
                  }}
                >
                  {user?.email}
                </Typography>

                <Chip
                  label="Active User"
                  size="small"
                  icon={<CheckCircle />}
                  sx={{
                    bgcolor: 'rgba(140, 165, 81, 0.15)',
                    color: '#333F1F',
                    fontWeight: 600,
                    border: '1px solid #8CA551',
                    fontFamily: '"Poppins", sans-serif',
                    '& .MuiChip-icon': {
                      color: '#8CA551'
                    }
                  }}
                />

                <Divider sx={{ my: 3 }} />

                <Box sx={{ textAlign: 'left' }}>
                  <Typography
                    variant="caption"
                    sx={{
                      color: '#999',
                      textTransform: 'uppercase',
                      letterSpacing: '1px',
                      fontWeight: 600,
                      fontFamily: '"Poppins", sans-serif',
                      mb: 1,
                      display: 'block'
                    }}
                  >
                    Account Details
                  </Typography>
                  
                  <Box display="flex" alignItems="center" gap={1.5} mb={1.5}>
                    <Email sx={{ fontSize: 18, color: '#706f6f' }} />
                    <Typography
                      variant="body2"
                      sx={{
                        color: '#706f6f',
                        fontFamily: '"Poppins", sans-serif',
                        fontSize: '0.85rem'
                      }}
                    >
                      {user?.email}
                    </Typography>
                  </Box>

                  {user?.phoneNumber && (
                    <Box display="flex" alignItems="center" gap={1.5}>
                      <Phone sx={{ fontSize: 18, color: '#706f6f' }} />
                      <Typography
                        variant="body2"
                        sx={{
                          color: '#706f6f',
                          fontFamily: '"Poppins", sans-serif',
                          fontSize: '0.85rem'
                        }}
                      >
                        {user.phoneNumber}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Paper>
            </motion.div>
          </Grid>

          {/* Personal Information & Password */}
          <Grid item xs={12} md={8}>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              <Paper
                elevation={0}
                sx={{
                  p: { xs: 3, md: 4 },
                  borderRadius: 4,
                  border: '1px solid rgba(0,0,0,0.08)',
                  background: '#ffffff',
                  mb: 3
                }}
              >
                {/* Personal Info Header */}
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                  <Box>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 700,
                        color: '#333F1F',
                        fontFamily: '"Poppins", sans-serif',
                        fontSize: { xs: '1.1rem', md: '1.25rem' }
                      }}
                    >
                      Personal Information
                    </Typography>
                    <Box
                      sx={{
                        width: 50,
                        height: 3,
                        bgcolor: '#8CA551',
                        borderRadius: 3,
                        mt: 0.5
                      }}
                    />
                  </Box>

                  <Box display="flex" gap={1}>
                    <AnimatePresence mode="wait">
                      {isEditing ? (
                        <>
                          <motion.div
                            key="cancel"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                          >
                            <Button
                              variant="outlined"
                              startIcon={<Cancel />}
                              onClick={handleCancel}
                              sx={{
                                borderColor: '#706f6f',
                                color: '#706f6f',
                                fontFamily: '"Poppins", sans-serif',
                                fontWeight: 600,
                                '&:hover': {
                                  borderColor: '#333F1F',
                                  bgcolor: 'rgba(51, 63, 31, 0.05)'
                                }
                              }}
                            >
                              Cancel
                            </Button>
                          </motion.div>
                          <motion.div
                            key="save"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                          >
                            <Button
                              variant="contained"
                              startIcon={<Save />}
                              onClick={handleSave}
                              sx={{
                                bgcolor: '#8CA551',
                                fontFamily: '"Poppins", sans-serif',
                                fontWeight: 600,
                                boxShadow: '0 4px 12px rgba(140, 165, 81, 0.3)',
                                '&:hover': {
                                  bgcolor: '#333F1F',
                                  boxShadow: '0 6px 20px rgba(51, 63, 31, 0.4)'
                                }
                              }}
                            >
                              Save
                            </Button>
                          </motion.div>
                        </>
                      ) : (
                        <motion.div
                          key="edit"
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                        >
                          <Button
                            variant="contained"
                            startIcon={<Edit />}
                            onClick={() => setIsEditing(true)}
                            sx={{
                              bgcolor: '#333F1F',
                              fontFamily: '"Poppins", sans-serif',
                              fontWeight: 600,
                              boxShadow: '0 4px 12px rgba(51, 63, 31, 0.3)',
                              '&:hover': {
                                bgcolor: '#8CA551',
                                boxShadow: '0 6px 20px rgba(140, 165, 81, 0.4)'
                              }
                            }}
                          >
                            Edit Profile
                          </Button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Box>
                </Box>

                <Divider sx={{ mb: 3 }} />

                {/* Form Fields */}
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="First Name"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      disabled={!isEditing}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Person sx={{ color: isEditing ? '#8CA551' : '#999' }} />
                          </InputAdornment>
                        )
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          fontFamily: '"Poppins", sans-serif',
                          '&.Mui-focused fieldset': {
                            borderColor: '#8CA551',
                            borderWidth: 2
                          }
                        },
                        '& .MuiInputLabel-root.Mui-focused': {
                          color: '#8CA551'
                        }
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Last Name"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      disabled={!isEditing}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Person sx={{ color: isEditing ? '#8CA551' : '#999' }} />
                          </InputAdornment>
                        )
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          fontFamily: '"Poppins", sans-serif',
                          '&.Mui-focused fieldset': {
                            borderColor: '#8CA551',
                            borderWidth: 2
                          }
                        },
                        '& .MuiInputLabel-root.Mui-focused': {
                          color: '#8CA551'
                        }
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Email Address"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      disabled={!isEditing}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Email sx={{ color: isEditing ? '#8CA551' : '#999' }} />
                          </InputAdornment>
                        )
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          fontFamily: '"Poppins", sans-serif',
                          '&.Mui-focused fieldset': {
                            borderColor: '#8CA551',
                            borderWidth: 2
                          }
                        },
                        '& .MuiInputLabel-root.Mui-focused': {
                          color: '#8CA551'
                        }
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Phone Number"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleChange}
                      disabled={!isEditing}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Phone sx={{ color: isEditing ? '#8CA551' : '#999' }} />
                          </InputAdornment>
                        )
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          fontFamily: '"Poppins", sans-serif',
                          '&.Mui-focused fieldset': {
                            borderColor: '#8CA551',
                            borderWidth: 2
                          }
                        },
                        '& .MuiInputLabel-root.Mui-focused': {
                          color: '#8CA551'
                        }
                      }}
                    />
                  </Grid>
                </Grid>
              </Paper>

              {/* Password Section */}
              <Paper
                elevation={0}
                sx={{
                  p: { xs: 3, md: 4 },
                  borderRadius: 4,
                  border: '1px solid rgba(0,0,0,0.08)',
                  background: '#ffffff'
                }}
              >
                <Box mb={3}>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 700,
                      color: '#333F1F',
                      fontFamily: '"Poppins", sans-serif',
                      fontSize: { xs: '1.1rem', md: '1.25rem' }
                    }}
                  >
                    Change Password
                  </Typography>
                  <Box
                    sx={{
                      width: 50,
                      height: 3,
                      bgcolor: '#8CA551',
                      borderRadius: 3,
                      mt: 0.5
                    }}
                  />
                </Box>

                <Divider sx={{ mb: 3 }} />

                {!isEditing && (
                  <Alert 
                    severity="info"
                    sx={{
                      mb: 3,
                      borderRadius: 2,
                      '& .MuiAlert-message': {
                        fontFamily: '"Poppins", sans-serif'
                      }
                    }}
                  >
                    Enable edit mode to change your password
                  </Alert>
                )}

                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Current Password"
                      name="current"
                      type={showPassword.current ? 'text' : 'password'}
                      value={passwordData.current}
                      onChange={handlePasswordChange}
                      disabled={!isEditing}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Lock sx={{ color: isEditing ? '#8CA551' : '#999' }} />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => togglePasswordVisibility('current')}
                              disabled={!isEditing}
                              edge="end"
                            >
                              {showPassword.current ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        )
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          fontFamily: '"Poppins", sans-serif',
                          '&.Mui-focused fieldset': {
                            borderColor: '#8CA551',
                            borderWidth: 2
                          }
                        },
                        '& .MuiInputLabel-root.Mui-focused': {
                          color: '#8CA551'
                        }
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="New Password"
                      name="new"
                      type={showPassword.new ? 'text' : 'password'}
                      value={passwordData.new}
                      onChange={handlePasswordChange}
                      disabled={!isEditing}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Lock sx={{ color: isEditing ? '#8CA551' : '#999' }} />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => togglePasswordVisibility('new')}
                              disabled={!isEditing}
                              edge="end"
                            >
                              {showPassword.new ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        )
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          fontFamily: '"Poppins", sans-serif',
                          '&.Mui-focused fieldset': {
                            borderColor: '#8CA551',
                            borderWidth: 2
                          }
                        },
                        '& .MuiInputLabel-root.Mui-focused': {
                          color: '#8CA551'
                        }
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Confirm Password"
                      name="confirm"
                      type={showPassword.confirm ? 'text' : 'password'}
                      value={passwordData.confirm}
                      onChange={handlePasswordChange}
                      disabled={!isEditing}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Lock sx={{ color: isEditing ? '#8CA551' : '#999' }} />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => togglePasswordVisibility('confirm')}
                              disabled={!isEditing}
                              edge="end"
                            >
                              {showPassword.confirm ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        )
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          fontFamily: '"Poppins", sans-serif',
                          '&.Mui-focused fieldset': {
                            borderColor: '#8CA551',
                            borderWidth: 2
                          }
                        },
                        '& .MuiInputLabel-root.Mui-focused': {
                          color: '#8CA551'
                        }
                      }}
                    />
                  </Grid>
                </Grid>
              </Paper>
            </motion.div>
          </Grid>
        </Grid>

        {/* Snackbar for notifications */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            severity={snackbar.severity}
            variant="filled"
            sx={{
              fontFamily: '"Poppins", sans-serif',
              fontWeight: 600
            }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  )
}

export default Profile