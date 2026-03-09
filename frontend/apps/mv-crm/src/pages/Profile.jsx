import { useState, useEffect } from 'react'
import {
  Box,
  Paper,
  Typography,
  Avatar,
  Grid,
  TextField,
  Button,
  Divider,
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
import { useTranslation } from 'react-i18next'
import { useAuth } from '@shared/context/AuthContext'
import { authService } from '@shared/services/authService'
import userService from '@shared/services/userService'
import PageLayout from '@shared/components/LayoutComponents/PageLayout'

export default function Profile() {
  const { user, setUser } = useAuth()
  const { t: tCommon } = useTranslation('common')
  const { t } = useTranslation('profile')
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [userId, setUserId] = useState(null)
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
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: ''
  })

  const [passwordData, setPasswordData] = useState({
    current: '',
    new: '',
    confirm: ''
  })

  // Cargar perfil del usuario al montar
  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      const profile = await authService.getProfile()
      console.log('✅ Profile loaded:', profile)
      
      setUserId(profile._id)
      setFormData({
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        email: profile.email || '',
        phoneNumber: profile.phoneNumber || ''
      })
      
      // Actualizar el contexto con el perfil completo
      setUser(profile)
    } catch (error) {
      console.error('Error loading profile:', error)
      setSnackbar({
        open: true,
        message: tCommon('status.error'),
        severity: 'error'
      })
    }
  }

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

  const handleSave = async () => {
    if (!userId) {
      setSnackbar({
        open: true,
        message: 'User ID not found',
        severity: 'error'
      })
      return
    }

    setLoading(true)
    try {
      console.log('📤 Updating profile for user:', userId)
      
      // Actualizar información personal usando userService
      await userService.updateProfile(userId, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phoneNumber: formData.phoneNumber
      })

      // Cambiar contraseña si se proporcionó usando authService
      if (passwordData.new || passwordData.confirm || passwordData.current) {
        if (!passwordData.current || !passwordData.new || !passwordData.confirm) {
          setSnackbar({
            open: true,
            message: t('passwordFillAll'),
            severity: 'error'
          })
          setLoading(false)
          return
        }
        if (passwordData.new !== passwordData.confirm) {
          setSnackbar({
            open: true,
            message: t('passwordsNoMatch'),
            severity: 'error'
          })
          setLoading(false)
          return
        }
        if (passwordData.new.length < 6) {
          setSnackbar({
            open: true,
            message: t('passwordMinLength'),
            severity: 'error'
          })
          setLoading(false)
          return
        }

        await authService.changePassword(passwordData.current, passwordData.new)
      }

      // Actualizar el contexto de usuario
      const updatedProfile = await authService.getProfile()
      setUser(updatedProfile)

      setIsEditing(false)
      setSnackbar({
        open: true,
        message: t('profileUpdated'),
        severity: 'success'
      })
      setPasswordData({ current: '', new: '', confirm: '' })
    } catch (error) {
      console.error('Error updating profile:', error)
      setSnackbar({
        open: true,
        message: error.response?.data?.message || t('passwordChangeError'),
        severity: 'error'
      })
    } finally {
      setLoading(false)
    }
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
    <PageLayout
      title={t('my')}
      titleBold={t('profile')}
      topbarLabel="PROFILE"
      subtitle={t('managePersonalInfo')}
    >
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
                border: '1px solid #e8e8e8',
                textAlign: 'center',
                background: '#fff'
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
                      bgcolor: '#000',
                      border: '4px solid #f5f5f5'
                    }}
                  >
                    {formData.firstName?.charAt(0).toUpperCase()}
                  </Avatar>
                </motion.div>

                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                  <IconButton
                    sx={{
                      position: 'absolute',
                      bottom: 0,
                      right: 0,
                      bgcolor: '#000',
                      color: 'white',
                      width: 44,
                      height: 44,
                      '&:hover': {
                        bgcolor: '#333'
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
                  color: '#000',
                  fontFamily: '"Helvetica Neue", sans-serif'
                }}
              >
                {formData.firstName} {formData.lastName}
              </Typography>

              <Typography
                variant="body2"
                sx={{
                  color: '#aaa',
                  fontFamily: '"Courier New", monospace',
                  fontSize: '0.75rem',
                  mb: 2
                }}
              >
                {formData.email}
              </Typography>

              <Chip
                label={t('activeUser')}
                size="small"
                icon={<CheckCircle />}
                sx={{
                  bgcolor: '#f5f5f5',
                  color: '#000',
                  fontWeight: 600,
                  border: '1px solid #e0e0e0',
                  fontFamily: '"Courier New", monospace',
                  fontSize: '0.65rem',
                  '& .MuiChip-icon': {
                    color: '#000'
                  }
                }}
              />

              <Divider sx={{ my: 3 }} />

              <Box sx={{ textAlign: 'left' }}>
                <Typography
                  variant="caption"
                  sx={{
                    color: '#aaa',
                    textTransform: 'uppercase',
                    letterSpacing: '2px',
                    fontWeight: 600,
                    fontFamily: '"Courier New", monospace',
                    fontSize: '0.6rem',
                    mb: 1.5,
                    display: 'block'
                  }}
                >
                  {t('accountDetails')}
                </Typography>

                <Box display="flex" alignItems="center" gap={1.5} mb={1.5}>
                  <Email sx={{ fontSize: 18, color: '#aaa' }} />
                  <Typography
                    variant="body2"
                    sx={{
                      color: '#666',
                      fontFamily: '"Courier New", monospace',
                      fontSize: '0.75rem'
                    }}
                  >
                    {formData.email}
                  </Typography>
                </Box>

                {formData.phoneNumber && (
                  <Box display="flex" alignItems="center" gap={1.5}>
                    <Phone sx={{ fontSize: 18, color: '#aaa' }} />
                    <Typography
                      variant="body2"
                      sx={{
                        color: '#666',
                        fontFamily: '"Courier New", monospace',
                        fontSize: '0.75rem'
                      }}
                    >
                      {formData.phoneNumber}
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
                border: '1px solid #e8e8e8',
                background: '#fff',
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
                      color: '#000',
                      fontFamily: '"Helvetica Neue", sans-serif',
                      fontSize: { xs: '1.1rem', md: '1.25rem' }
                    }}
                  >
                    {t('personalInformation')}
                  </Typography>
                  <Box
                    sx={{
                      width: 50,
                      height: 2,
                      bgcolor: '#000',
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
                            disabled={loading}
                            sx={{
                              borderColor: '#e0e0e0',
                              color: '#666',
                              fontFamily: '"Courier New", monospace',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              '&:hover': {
                                borderColor: '#000',
                                bgcolor: '#f5f5f5'
                              }
                            }}
                          >
                            {tCommon('actions.cancel')}
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
                            disabled={loading}
                            sx={{
                              bgcolor: '#000',
                              fontFamily: '"Courier New", monospace',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              '&:hover': {
                                bgcolor: '#333'
                              }
                            }}
                          >
                            {loading ? tCommon('status.loading') : tCommon('actions.save')}
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
                            bgcolor: '#000',
                            fontFamily: '"Courier New", monospace',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            '&:hover': {
                              bgcolor: '#333'
                            }
                          }}
                        >
                          {t('editProfile')}
                        </Button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Box>
              </Box>

              <Divider sx={{ mb: 3, borderColor: '#f0f0f0' }} />

              {/* Form Fields */}
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label={t('firstName')}
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    disabled={!isEditing}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Person sx={{ color: isEditing ? '#000' : '#ccc', fontSize: 20 }} />
                        </InputAdornment>
                      )
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        fontFamily: '"Courier New", monospace',
                        fontSize: '0.85rem',
                        '&.Mui-focused fieldset': {
                          borderColor: '#000',
                          borderWidth: 2
                        }
                      },
                      '& .MuiInputLabel-root': {
                        fontFamily: '"Courier New", monospace',
                        fontSize: '0.75rem'
                      },
                      '& .MuiInputLabel-root.Mui-focused': {
                        color: '#000'
                      }
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label={t('lastName')}
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    disabled={!isEditing}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Person sx={{ color: isEditing ? '#000' : '#ccc', fontSize: 20 }} />
                        </InputAdornment>
                      )
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        fontFamily: '"Courier New", monospace',
                        fontSize: '0.85rem',
                        '&.Mui-focused fieldset': {
                          borderColor: '#000',
                          borderWidth: 2
                        }
                      },
                      '& .MuiInputLabel-root': {
                        fontFamily: '"Courier New", monospace',
                        fontSize: '0.75rem'
                      },
                      '& .MuiInputLabel-root.Mui-focused': {
                        color: '#000'
                      }
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label={t('emailAddress')}
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={!isEditing}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Email sx={{ color: isEditing ? '#000' : '#ccc', fontSize: 20 }} />
                        </InputAdornment>
                      )
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        fontFamily: '"Courier New", monospace',
                        fontSize: '0.85rem',
                        '&.Mui-focused fieldset': {
                          borderColor: '#000',
                          borderWidth: 2
                        }
                      },
                      '& .MuiInputLabel-root': {
                        fontFamily: '"Courier New", monospace',
                        fontSize: '0.75rem'
                      },
                      '& .MuiInputLabel-root.Mui-focused': {
                        color: '#000'
                      }
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label={t('phoneNumber')}
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    disabled={!isEditing}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Phone sx={{ color: isEditing ? '#000' : '#ccc', fontSize: 20 }} />
                        </InputAdornment>
                      )
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        fontFamily: '"Courier New", monospace',
                        fontSize: '0.85rem',
                        '&.Mui-focused fieldset': {
                          borderColor: '#000',
                          borderWidth: 2
                        }
                      },
                      '& .MuiInputLabel-root': {
                        fontFamily: '"Courier New", monospace',
                        fontSize: '0.75rem'
                      },
                      '& .MuiInputLabel-root.Mui-focused': {
                        color: '#000'
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
                border: '1px solid #e8e8e8',
                background: '#fff'
              }}
            >
              <Box mb={3}>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    color: '#000',
                    fontFamily: '"Helvetica Neue", sans-serif',
                    fontSize: { xs: '1.1rem', md: '1.25rem' }
                  }}
                >
                  {t('changePassword')}
                </Typography>
                <Box
                  sx={{
                    width: 50,
                    height: 2,
                    bgcolor: '#000',
                    mt: 0.5
                  }}
                />
              </Box>

              <Divider sx={{ mb: 3, borderColor: '#f0f0f0' }} />

              {!isEditing && (
                <Alert
                  severity="info"
                  sx={{
                    mb: 3,
                    border: '1px solid #e0e0e0',
                    bgcolor: '#f9f9f9',
                    '& .MuiAlert-message': {
                      fontFamily: '"Courier New", monospace',
                      fontSize: '0.75rem'
                    }
                  }}
                >
                  {t('enableEditMode')}
                </Alert>
              )}

              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label={t('currentPassword')}
                    name="current"
                    type={showPassword.current ? 'text' : 'password'}
                    value={passwordData.current}
                    onChange={handlePasswordChange}
                    disabled={!isEditing}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Lock sx={{ color: isEditing ? '#000' : '#ccc', fontSize: 20 }} />
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
                        fontFamily: '"Courier New", monospace',
                        fontSize: '0.85rem',
                        '&.Mui-focused fieldset': {
                          borderColor: '#000',
                          borderWidth: 2
                        }
                      },
                      '& .MuiInputLabel-root': {
                        fontFamily: '"Courier New", monospace',
                        fontSize: '0.75rem'
                      },
                      '& .MuiInputLabel-root.Mui-focused': {
                        color: '#000'
                      }
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label={t('newPassword')}
                    name="new"
                    type={showPassword.new ? 'text' : 'password'}
                    value={passwordData.new}
                    onChange={handlePasswordChange}
                    disabled={!isEditing}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Lock sx={{ color: isEditing ? '#000' : '#ccc', fontSize: 20 }} />
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
                        fontFamily: '"Courier New", monospace',
                        fontSize: '0.85rem',
                        '&.Mui-focused fieldset': {
                          borderColor: '#000',
                          borderWidth: 2
                        }
                      },
                      '& .MuiInputLabel-root': {
                        fontFamily: '"Courier New", monospace',
                        fontSize: '0.75rem'
                      },
                      '& .MuiInputLabel-root.Mui-focused': {
                        color: '#000'
                      }
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label={t('confirmPassword')}
                    name="confirm"
                    type={showPassword.confirm ? 'text' : 'password'}
                    value={passwordData.confirm}
                    onChange={handlePasswordChange}
                    disabled={!isEditing}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Lock sx={{ color: isEditing ? '#000' : '#ccc', fontSize: 20 }} />
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
                        fontFamily: '"Courier New", monospace',
                        fontSize: '0.85rem',
                        '&.Mui-focused fieldset': {
                          borderColor: '#000',
                          borderWidth: 2
                        }
                      },
                      '& .MuiInputLabel-root': {
                        fontFamily: '"Courier New", monospace',
                        fontSize: '0.75rem'
                      },
                      '& .MuiInputLabel-root.Mui-focused': {
                        color: '#000'
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
            fontFamily: '"Courier New", monospace',
            fontSize: '0.75rem',
            fontWeight: 600
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </PageLayout>
  )
}