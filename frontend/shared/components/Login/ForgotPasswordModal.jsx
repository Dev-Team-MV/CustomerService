// /Users/oficina/MV-CRM/CustomerService/frontend/shared/components/Login/ForgotPasswordModal.jsx

import { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  CircularProgress,
  Alert,
  Stepper,
  Step,
  StepLabel,
  ToggleButton,
  ToggleButtonGroup,
  Paper,
  InputAdornment
} from '@mui/material'
import {
  Close,
  LockReset,
  Email,
  Sms,
  ArrowBack,
  ArrowForward,
  CheckCircle,
  Security,
  Timer
} from '@mui/icons-material'
import { authService } from '../../services/authService'

const STEPS = [
  'stepEmail',
  'stepCode',
  'stepNewPassword'
]

const ForgotPasswordModal = ({ 
  open, 
  onClose,
  brandColors = { primary: '#1A237E', secondary: '#00ACC1' }
}) => {
  const { t } = useTranslation('auth')
  
  const [activeStep, setActiveStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  // Datos del flujo
  const [email, setEmail] = useState('')
  const [channel, setChannel] = useState('email')
  const [code, setCode] = useState('')
  const [resetToken, setResetToken] = useState('')
  const [expiresIn, setExpiresIn] = useState(15)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  
  // Timer para resend
  const [resendCooldown, setResendCooldown] = useState(0)
  const timerRef = useRef(null)

  // Reset al abrir/cerrar
  useEffect(() => {
    if (open) {
      setActiveStep(0)
      setEmail('')
      setChannel('email')
      setCode('')
      setResetToken('')
      setNewPassword('')
      setConfirmPassword('')
      setError('')
      setSuccess('')
      setResendCooldown(0)
    }
    
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [open])

  // Cooldown timer para resend
  useEffect(() => {
    if (resendCooldown > 0) {
      timerRef.current = setInterval(() => {
        setResendCooldown(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current)
            return 0
          }
          return prev - 1
        })
      }, 1000)
      
      return () => clearInterval(timerRef.current)
    }
  }, [resendCooldown])

  // ═══════════════════════════════════════════════════════════════
  // PASO 1: Solicitar código
  // ═══════════════════════════════════════════════════════════════

  const handleSendCode = async () => {
    if (!email.trim()) {
      setError(t('forgotPassword.emailRequired', 'El email es obligatorio'))
      return
    }

    // Validación básica de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError(t('forgotPassword.invalidEmail', 'Ingresa un email válido'))
      return
    }

    setLoading(true)
    setError('')
    
    try {
      await authService.forgotPassword(email, channel)
      setSuccess(t('forgotPassword.codeSent', 'Si el email existe, hemos enviado un código'))
      setResendCooldown(60) // 60 segundos cooldown
      
      // Avanzar al siguiente paso después de un breve delay
      setTimeout(() => {
        setSuccess('')
        setActiveStep(1)
      }, 1500)
    } catch (err) {
      const errorMessage = err.response?.data?.message || 
                          t('forgotPassword.sendError', 'No se pudo enviar el código. Intenta nuevamente.')
      
      // Si es error 503 (canal no disponible), sugerir otro canal
      if (err.response?.status === 503) {
        setError(t('forgotPassword.channelUnavailable', 'Canal no disponible. Intenta con otro método.'))
        // Auto-cambiar al otro canal
        setChannel(channel === 'email' ? 'sms' : 'email')
      } else {
        setError(errorMessage)
      }
    } finally {
      setLoading(false)
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // PASO 2: Verificar código
  // ═══════════════════════════════════════════════════════════════

  const handleVerifyCode = async () => {
    if (!code.trim() || code.length !== 6) {
      setError(t('forgotPassword.codeRequired', 'Ingresa el código de 6 dígitos'))
      return
    }

    setLoading(true)
    setError('')
    
    try {
      const response = await authService.verifyResetCode(email, code)
      setResetToken(response.resetToken)
      setExpiresIn(response.expiresInMinutes || 15)
      setActiveStep(2)
    } catch (err) {
      const errorMessage = err.response?.data?.message || 
                          t('forgotPassword.invalidCode', 'Código inválido o expirado')
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleResendCode = async () => {
    if (resendCooldown > 0) return
    
    setLoading(true)
    setError('')
    
    try {
      await authService.forgotPassword(email, channel)
      setSuccess(t('forgotPassword.codeResent', 'Código reenviado'))
      setResendCooldown(60)
      setCode('') // Limpiar código anterior
      
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err.response?.data?.message || t('forgotPassword.resendError', 'Error al reenviar'))
    } finally {
      setLoading(false)
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // PASO 3: Nueva contraseña
  // ═══════════════════════════════════════════════════════════════

  const handleResetPassword = async () => {
    if (!newPassword) {
      setError(t('forgotPassword.passwordRequired', 'La contraseña es obligatoria'))
      return
    }

    if (newPassword.length < 6) {
      setError(t('forgotPassword.passwordTooShort', 'La contraseña debe tener al menos 6 caracteres'))
      return
    }

    if (newPassword !== confirmPassword) {
      setError(t('forgotPassword.passwordsDontMatch', 'Las contraseñas no coinciden'))
      return
    }

    setLoading(true)
    setError('')
    
    try {
      const response = await authService.resetPassword(resetToken, newPassword)
      
      // Si el backend devuelve JWT, hacer login automático
      if (response.token) {
        localStorage.setItem('token', response.token)
        if (response.user) {
          localStorage.setItem('user', JSON.stringify(response.user))
        }
      }
      
      setSuccess(t('forgotPassword.passwordResetSuccess', '¡Contraseña actualizada! Redirigiendo...'))
      
      // Cerrar modal después de un breve delay
      setTimeout(() => {
        onClose()
        // Forzar refresh para que el login se refleje
        window.location.reload()
      }, 2000)
    } catch (err) {
      const errorMessage = err.response?.data?.message || 
                          t('forgotPassword.resetError', 'Error al actualizar la contraseña')
      
      // Si el token expiró, volver al paso del código
      if (err.response?.status === 400 && errorMessage.toLowerCase().includes('expired')) {
        setError(t('forgotPassword.tokenExpired', 'El enlace expiró. Solicita un nuevo código.'))
        setTimeout(() => {
          setActiveStep(0)
          setCode('')
          setResetToken('')
          setError('')
        }, 2000)
      } else {
        setError(errorMessage)
      }
    } finally {
      setLoading(false)
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // NAVIGATION
  // ═══════════════════════════════════════════════════════════════

  const handleBack = () => {
    setError('')
    setActiveStep(prev => prev - 1)
  }

  const handleClose = () => {
    if (loading) return
    onClose()
  }

  // ═══════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════

  const getStepTitle = () => {
    switch (activeStep) {
      case 0: return t('forgotPassword.step1Title', 'Recuperar contraseña')
      case 1: return t('forgotPassword.step2Title', 'Verificar código')
      case 2: return t('forgotPassword.step3Title', 'Nueva contraseña')
      default: return ''
    }
  }

  const getStepDescription = () => {
    switch (activeStep) {
      case 0: return t('forgotPassword.step1Desc', 'Ingresa tu email y te enviaremos un código de verificación')
      case 1: return t('forgotPassword.step2Desc', 'Ingresa el código de 6 dígitos que recibiste')
      case 2: return t('forgotPassword.step3Desc', 'Crea tu nueva contraseña')
      default: return ''
    }
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          border: `1px solid ${brandColors.primary}20`,
          minHeight: 500
        }
      }}
    >
      {/* Header */}
      <DialogTitle
        sx={{
          borderBottom: '1px solid #ececec',
          background: `linear-gradient(135deg, ${brandColors.primary} 0%, ${brandColors.secondary} 100%)`,
          color: '#fff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          px: 3,
          py: 2.5
        }}
      >
        <Box display="flex" alignItems="center" gap={1.5}>
          <LockReset sx={{ fontSize: 24 }} />
          <Box>
            <Typography
              sx={{
                fontFamily: '"DM Sans", sans-serif',
                fontSize: '1.1rem',
                fontWeight: 700,
                letterSpacing: '0.5px'
              }}
            >
              {getStepTitle()}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                opacity: 0.9,
                fontFamily: '"DM Sans", sans-serif',
                fontSize: '0.75rem'
              }}
            >
              {getStepDescription()}
            </Typography>
          </Box>
        </Box>
        <IconButton 
          onClick={handleClose} 
          size="small" 
          disabled={loading}
          sx={{ color: '#fff' }}
        >
          <Close fontSize="small" />
        </IconButton>
      </DialogTitle>

      {/* Stepper */}
      <Box sx={{ px: 3, py: 2, bgcolor: '#fafafa', borderBottom: '1px solid #ececec' }}>
        <Stepper activeStep={activeStep} alternativeLabel>
          {[
            t('forgotPassword.stepperEmail', 'Email'),
            t('forgotPassword.stepperCode', 'Código'),
            t('forgotPassword.stepperPassword', 'Contraseña')
          ].map((label, index) => (
            <Step key={label}>
              <StepLabel
                sx={{
                  '& .MuiStepLabel-label': {
                    fontFamily: '"DM Sans", sans-serif',
                    fontSize: '0.75rem',
                    fontWeight: 600
                  },
                  '& .MuiStepIcon-root.Mui-completed': {
                    color: brandColors.primary
                  },
                  '& .MuiStepIcon-root.Mui-active': {
                    color: brandColors.primary
                  }
                }}
              >
                {label}
              </StepLabel>
            </Step>
          ))}
        </Stepper>
      </Box>

      {/* Content */}
      <DialogContent sx={{ p: 3, bgcolor: '#fff' }}>
        {/* Error Alert */}
        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              mb: 2, 
              borderRadius: 2,
              fontFamily: '"DM Sans", sans-serif'
            }}
            onClose={() => setError('')}
          >
            {error}
          </Alert>
        )}

        {/* Success Alert */}
        {success && (
          <Alert 
            severity="success" 
            sx={{ 
              mb: 2, 
              borderRadius: 2,
              fontFamily: '"DM Sans", sans-serif'
            }}
          >
            {success}
          </Alert>
        )}

        {/* ═══════════════════════════════════════════════════════ */}
        {/* PASO 1: Email + Canal */}
        {/* ═══════════════════════════════════════════════════════ */}
        {activeStep === 0 && (
          <Box display="flex" flexDirection="column" gap={2.5}>
            {/* Info box */}
            <Box
              sx={{
                p: 2,
                bgcolor: '#e3f2fd',
                borderRadius: 2,
                display: 'flex',
                alignItems: 'flex-start',
                gap: 1.5
              }}
            >
              <Security sx={{ fontSize: 20, color: '#1976d2', mt: 0.2 }} />
              <Typography
                variant="caption"
                sx={{
                  color: '#1976d2',
                  fontFamily: '"DM Sans", sans-serif',
                  fontSize: '0.8rem',
                  lineHeight: 1.5
                }}
              >
                {t('forgotPassword.securityInfo', 'Por seguridad, te enviaremos un código de verificación de un solo uso. El código expira en 15 minutos.')}
              </Typography>
            </Box>

            {/* Email input */}
            <TextField
              label={t('forgotPassword.emailLabel', 'Correo electrónico')}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              fullWidth
              required
              autoFocus
              placeholder="tu@email.com"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email sx={{ color: '#888' }} />
                  </InputAdornment>
                )
              }}
              sx={{
                '& .MuiInputBase-input': {
                  fontFamily: '"DM Sans", sans-serif'
                }
              }}
            />

            {/* Channel selector */}
            <Box>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 600,
                  mb: 1,
                  fontFamily: '"DM Sans", sans-serif',
                  color: '#555'
                }}
              >
                {t('forgotPassword.channelLabel', 'Enviar código por:')}
              </Typography>
              <ToggleButtonGroup
                value={channel}
                exclusive
                onChange={(e, newChannel) => newChannel && setChannel(newChannel)}
                fullWidth
                sx={{
                  '& .MuiToggleButton-root': {
                    py: 1.5,
                    textTransform: 'none',
                    fontFamily: '"DM Sans", sans-serif',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    borderColor: '#e0e0e0',
                    '&.Mui-selected': {
                      bgcolor: brandColors.primary,
                      color: '#fff',
                      '&:hover': {
                        bgcolor: brandColors.secondary
                      }
                    }
                  }
                }}
              >
                <ToggleButton value="email">
                  <Email sx={{ mr: 1, fontSize: 18 }} />
                  {t('forgotPassword.channelEmail', 'Email')}
                </ToggleButton>
                <ToggleButton value="sms">
                  <Sms sx={{ mr: 1, fontSize: 18 }} />
                  {t('forgotPassword.channelSms', 'SMS')}
                </ToggleButton>
              </ToggleButtonGroup>
            </Box>
          </Box>
        )}

        {/* ═══════════════════════════════════════════════════════ */}
        {/* PASO 2: Código de verificación */}
        {/* ═══════════════════════════════════════════════════════ */}
        {activeStep === 1 && (
          <Box display="flex" flexDirection="column" gap={2.5}>
            {/* Info box */}
            <Box
              sx={{
                p: 2,
                bgcolor: '#fff3e0',
                borderRadius: 2,
                display: 'flex',
                alignItems: 'flex-start',
                gap: 1.5
              }}
            >
              <Timer sx={{ fontSize: 20, color: '#e65100', mt: 0.2 }} />
              <Typography
                variant="caption"
                sx={{
                  color: '#e65100',
                  fontFamily: '"DM Sans", sans-serif',
                  fontSize: '0.8rem',
                  lineHeight: 1.5
                }}
              >
                {t('forgotPassword.codeInfo', 'Enviamos un código de 6 dígitos a {{email}} por {{channel}}. El código expira en 15 minutos.', {
                  email,
                  channel: channel === 'email' ? 'email' : 'SMS'
                })}
              </Typography>
            </Box>

            {/* Code input */}
            <TextField
              label={t('forgotPassword.codeLabel', 'Código de verificación')}
              value={code}
              onChange={(e) => {
                // Solo permitir números y máximo 6 caracteres
                const value = e.target.value.replace(/\D/g, '').slice(0, 6)
                setCode(value)
              }}
              fullWidth
              required
              autoFocus
              placeholder="000000"
              inputProps={{
                maxLength: 6,
                style: {
                  textAlign: 'center',
                  fontSize: '1.5rem',
                  fontWeight: 700,
                  letterSpacing: '0.5rem',
                  fontFamily: '"Courier New", monospace'
                }
              }}
              sx={{
                '& .MuiInputBase-input': {
                  fontFamily: '"DM Sans", sans-serif'
                }
              }}
            />

            {/* Resend button */}
            <Box display="flex" justifyContent="center">
              <Button
                onClick={handleResendCode}
                disabled={resendCooldown > 0 || loading}
                sx={{
                  fontFamily: '"DM Sans", sans-serif',
                  fontSize: '0.8rem',
                  textTransform: 'none',
                  color: resendCooldown > 0 ? '#999' : brandColors.primary
                }}
              >
                {resendCooldown > 0 
                  ? t('forgotPassword.resendCooldown', 'Reenviar en {{seconds}}s', { seconds: resendCooldown })
                  : t('forgotPassword.resendCode', 'Reenviar código')}
              </Button>
            </Box>
          </Box>
        )}

        {/* ═══════════════════════════════════════════════════════ */}
        {/* PASO 3: Nueva contraseña */}
        {/* ═══════════════════════════════════════════════════════ */}
        {activeStep === 2 && (
          <Box display="flex" flexDirection="column" gap={2.5}>
            {/* Success indicator */}
            <Box
              sx={{
                p: 2,
                bgcolor: '#e8f5e9',
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                gap: 1.5
              }}
            >
              <CheckCircle sx={{ fontSize: 20, color: '#2e7d32' }} />
              <Typography
                variant="caption"
                sx={{
                  color: '#2e7d32',
                  fontFamily: '"DM Sans", sans-serif',
                  fontSize: '0.8rem',
                  fontWeight: 600
                }}
              >
                {t('forgotPassword.codeVerified', '¡Código verificado! Ahora crea tu nueva contraseña.')}
              </Typography>
            </Box>

            {/* New password */}
            <TextField
              label={t('forgotPassword.newPasswordLabel', 'Nueva contraseña')}
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              fullWidth
              required
              autoFocus
              helperText={t('forgotPassword.passwordHelper', 'Mínimo 6 caracteres')}
              sx={{
                '& .MuiInputBase-input': {
                  fontFamily: '"DM Sans", sans-serif'
                }
              }}
            />

            {/* Confirm password */}
            <TextField
              label={t('forgotPassword.confirmPasswordLabel', 'Confirmar contraseña')}
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              fullWidth
              required
              error={confirmPassword && newPassword !== confirmPassword}
              helperText={
                confirmPassword && newPassword !== confirmPassword
                  ? t('forgotPassword.passwordsDontMatch', 'Las contraseñas no coinciden')
                  : ''
              }
              sx={{
                '& .MuiInputBase-input': {
                  fontFamily: '"DM Sans", sans-serif'
                }
              }}
            />

            {/* Password strength indicator */}
            {newPassword && (
              <Box>
                <Box
                  sx={{
                    height: 4,
                    bgcolor: '#e0e0e0',
                    borderRadius: 2,
                    overflow: 'hidden',
                    mb: 0.5
                  }}
                >
                  <Box
                    sx={{
                      height: '100%',
                      width: `${Math.min((newPassword.length / 12) * 100, 100)}%`,
                      bgcolor: newPassword.length < 6 ? '#f44336' 
                              : newPassword.length < 10 ? '#ff9800' 
                              : '#4caf50',
                      transition: 'all 0.3s'
                    }}
                  />
                </Box>
                <Typography
                  variant="caption"
                  sx={{
                    fontFamily: '"DM Sans", sans-serif',
                    fontSize: '0.7rem',
                    color: '#888'
                  }}
                >
                  {newPassword.length < 6 
                    ? t('forgotPassword.strengthWeak', 'Débil')
                    : newPassword.length < 10 
                      ? t('forgotPassword.strengthMedium', 'Media')
                      : t('forgotPassword.strengthStrong', 'Fuerte')}
                </Typography>
              </Box>
            )}
          </Box>
        )}
      </DialogContent>

      {/* Actions */}
      <DialogActions sx={{ borderTop: '1px solid #ececec', p: 2, gap: 1 }}>
        {activeStep > 0 && (
          <Button
            onClick={handleBack}
            disabled={loading}
            startIcon={<ArrowBack />}
            sx={{
              fontFamily: '"DM Sans", sans-serif',
              fontSize: '0.8rem',
              color: '#666',
              textTransform: 'none'
            }}
          >
            {t('forgotPassword.back', 'Atrás')}
          </Button>
        )}
        
        <Box sx={{ flex: 1 }} />
        
        <Button
          onClick={handleClose}
          disabled={loading}
          sx={{
            fontFamily: '"DM Sans", sans-serif',
            fontSize: '0.8rem',
            color: '#888',
            textTransform: 'none'
          }}
        >
          {t('forgotPassword.cancel', 'Cancelar')}
        </Button>

        {/* Action button según el step */}
        {activeStep === 0 && (
          <Button
            onClick={handleSendCode}
            variant="contained"
            disabled={loading || !email.trim()}
            endIcon={loading ? <CircularProgress size={16} color="inherit" /> : <ArrowForward />}
            sx={{
              fontFamily: '"DM Sans", sans-serif',
              fontSize: '0.8rem',
              textTransform: 'none',
              bgcolor: brandColors.primary,
              borderRadius: 2,
              px: 3,
              '&:hover': { bgcolor: brandColors.secondary }
            }}
          >
            {loading 
              ? t('forgotPassword.sending', 'Enviando...')
              : t('forgotPassword.sendCode', 'Enviar código')}
          </Button>
        )}

        {activeStep === 1 && (
          <Button
            onClick={handleVerifyCode}
            variant="contained"
            disabled={loading || code.length !== 6}
            endIcon={loading ? <CircularProgress size={16} color="inherit" /> : <ArrowForward />}
            sx={{
              fontFamily: '"DM Sans", sans-serif',
              fontSize: '0.8rem',
              textTransform: 'none',
              bgcolor: brandColors.primary,
              borderRadius: 2,
              px: 3,
              '&:hover': { bgcolor: brandColors.secondary }
            }}
          >
            {loading 
              ? t('forgotPassword.verifying', 'Verificando...')
              : t('forgotPassword.verifyCode', 'Verificar código')}
          </Button>
        )}

        {activeStep === 2 && (
          <Button
            onClick={handleResetPassword}
            variant="contained"
            disabled={loading || !newPassword || newPassword !== confirmPassword}
            startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <LockReset />}
            sx={{
              fontFamily: '"DM Sans", sans-serif',
              fontSize: '0.8rem',
              textTransform: 'none',
              bgcolor: brandColors.primary,
              borderRadius: 2,
              px: 3,
              '&:hover': { bgcolor: brandColors.secondary }
            }}
          >
            {loading 
              ? t('forgotPassword.updating', 'Actualizando...')
              : t('forgotPassword.resetPassword', 'Actualizar contraseña')}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  )
}

export default ForgotPasswordModal