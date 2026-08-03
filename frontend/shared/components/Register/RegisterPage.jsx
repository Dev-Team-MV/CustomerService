// /Users/oficina/MV-CRM/CustomerService/frontend/shared/components/Register/RegisterPage.jsx
import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Box, CircularProgress, Typography, Alert, Button, useMediaQuery, useTheme } from '@mui/material'
import { useTranslation } from 'react-i18next'
import api from '../../services/api'
import LoginBackground from '../Login/LoginBackground'
import RegisterForm from './RegisterForm'

const RegisterPage = ({
  projectName   = 'Project',
  logoMain,
  logoSecondary,
  backgroundImage,
  tagline,
  brandColors   = { primary: '#1A237E', secondary: '#00ACC1' }
}) => {
  const { token }  = useParams()
  const navigate   = useNavigate()
  const { t, i18n } = useTranslation('auth')
  const theme      = useTheme()
  const isMobile   = useMediaQuery(theme.breakpoints.down('md'))

  // ✅ NUEVO: Estados adicionales para mayor robustez
  const [verifying,  setVerifying]  = useState(true)
  const [tokenError, setTokenError] = useState('')
  const [userData,   setUserData]   = useState(null)
  const [retryCount, setRetryCount] = useState(0)

  // ✅ NUEVO: Validación de token al montar el componente
  useEffect(() => {
    // Si no hay token, redirigir inmediatamente a login
    if (!token) {
      console.warn('⚠️ No token provided, redirecting to login')
      navigate('/login', { replace: true })
      return
    }

    // ✅ NUEVO: Validar formato del token (debe ser un string no vacío)
    if (typeof token !== 'string' || token.trim().length === 0) {
      console.error('❌ Invalid token format:', token)
      setTokenError(t('invalidTokenFormat', 'Invalid token format'))
      setVerifying(false)
      return
    }

    verifyToken()
  }, [token])

  // ✅ NUEVO: Función separada para verificar el token (permite retry)
  const verifyToken = async () => {
    setVerifying(true)
    setTokenError('')
    
    try {
      console.log('🔍 Verifying setup token...')
      
      // ✅ NUEVO: Timeout de 10 segundos para la verificación
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('timeout')), 10000)
      })
      
      const verifyPromise = api.get(`/auth/verify-setup-token/${token}`)
      
      const res = await Promise.race([verifyPromise, timeoutPromise])
      
      if (res.data.valid && res.data.user) {
        console.log('✅ Token valid, user data loaded')
        const u = res.data.user
        
        // ✅ NUEVO: Validar que el usuario tenga los datos mínimos requeridos
        if (!u.email) {
          console.error('❌ User data incomplete: missing email')
          setTokenError(t('incompleteUserData', 'User data is incomplete. Please contact support.'))
          setVerifying(false)
          return
        }
        
        const cleanPhone = (u.phoneNumber || '').replace(/^\+/, '').replace(/[\s\-\(\)]/g, '')
        setUserData({ ...u, phoneNumber: cleanPhone })
      } else {
        console.warn('⚠️ Token invalid or expired')
        setTokenError(t('invalidOrExpiredLink', 'The setup link is invalid or has expired.'))
      }
    } catch (err) {
      console.error('❌ Error verifying token:', err)
      
      // ✅ NUEVO: Manejar diferentes tipos de errores
      if (err.message === 'timeout') {
        setTokenError(t('verificationTimeout', 'The verification took too long. Please try again.'))
      } else if (err.response?.status === 401 || err.response?.status === 403) {
        setTokenError(t('invalidOrExpiredLink', 'The setup link is invalid or has expired.'))
      } else if (err.response?.status === 404) {
        setTokenError(t('tokenNotFound', 'The setup link was not found. Please request a new one.'))
      } else if (!err.response && err.request) {
        // Error de red
        setTokenError(t('networkError', 'Network error. Please check your connection and try again.'))
      } else {
        setTokenError(err.response?.data?.message || t('invalidOrExpiredLink', 'The setup link is invalid or has expired.'))
      }
    } finally {
      setVerifying(false)
    }
  }

  // ✅ NUEVO: Función para reintentar la verificación
  const handleRetry = () => {
    if (retryCount < 3) {
      setRetryCount(prev => prev + 1)
      verifyToken()
    } else {
      setTokenError(t('maxRetriesReached', 'Too many attempts. Please request a new setup link.'))
    }
  }

  // ✅ NUEVO: Función para solicitar nuevo link
  const handleRequestNewLink = () => {
    navigate('/login', { 
      replace: true,
      state: { requestNewLink: true }
    })
  }

  // ✅ Estado de carga mientras verifica el token
  if (verifying) {
    return (
      <Box sx={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        bgcolor: '#fafafa' 
      }}>
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress size={60} sx={{ color: brandColors.primary, mb: 2 }} />
          <Typography variant="h6" sx={{ color: '#706f6f', fontFamily: '"DM Sans", sans-serif' }}>
            {t('verifyingSetupLink', 'Verifying your setup link...')}
          </Typography>
          <Typography variant="caption" sx={{ color: '#aaa', display: 'block', mt: 1 }}>
            {t('pleaseWait', 'Please wait')}
          </Typography>
        </Box>
      </Box>
    )
  }

  // ✅ Estado de error si el token es inválido
  if (tokenError && !userData) {
    return (
      <Box sx={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        bgcolor: '#fafafa', 
        p: 3 
      }}>
        <Box sx={{ maxWidth: 500, width: '100%' }}>
          <Alert 
            severity="error" 
            sx={{ 
              mb: 3, 
              borderRadius: 3, 
              fontFamily: '"DM Sans", sans-serif',
              '& .MuiAlert-message': {
                fontSize: '0.95rem'
              }
            }}
          >
            <Typography variant="body1" sx={{ fontWeight: 600, mb: 0.5 }}>
              {t('setupError', 'Setup Error')}
            </Typography>
            <Typography variant="body2">
              {tokenError}
            </Typography>
          </Alert>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* ✅ NUEVO: Botón de reintentar (solo si no se alcanzó el máximo) */}
            {retryCount < 3 && (
              <Button 
                fullWidth 
                variant="outlined" 
                onClick={handleRetry}
                sx={{ 
                  borderRadius: 3, 
                  py: 1.5, 
                  fontFamily: '"DM Sans", sans-serif', 
                  fontWeight: 600, 
                  letterSpacing: '1px',
                  borderColor: brandColors.primary,
                  color: brandColors.primary,
                  '&:hover': { 
                    borderColor: brandColors.secondary,
                    bgcolor: `${brandColors.primary}08`
                  } 
                }}
              >
                {t('retry', 'Retry')} ({3 - retryCount} {t('attemptsLeft', 'attempts left')})
              </Button>
            )}
            
            {/* ✅ NUEVO: Botón para solicitar nuevo link */}
            <Button 
              fullWidth 
              variant="outlined" 
              onClick={handleRequestNewLink}
              sx={{ 
                borderRadius: 3, 
                py: 1.5, 
                fontFamily: '"DM Sans", sans-serif', 
                fontWeight: 600, 
                letterSpacing: '1px',
                borderColor: '#666',
                color: '#666',
                '&:hover': { 
                  borderColor: '#333',
                  bgcolor: '#f5f5f5'
                } 
              }}
            >
              {t('requestNewLink', 'Request New Setup Link')}
            </Button>
            
            {/* Botón para ir a login */}
            <Button 
              fullWidth 
              variant="contained" 
              onClick={() => navigate('/login')}
              sx={{ 
                borderRadius: 3, 
                bgcolor: brandColors.primary, 
                py: 1.5, 
                fontFamily: '"DM Sans", sans-serif', 
                fontWeight: 600, 
                letterSpacing: '1px', 
                '&:hover': { bgcolor: brandColors.secondary } 
              }}
            >
              {t('goToLogin', 'Go to Login')}
            </Button>
          </Box>
        </Box>
      </Box>
    )
  }

  // ✅ Renderizar el formulario de registro
  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', position: 'relative', overflow: 'hidden' }}>
      {!isMobile && (
        <LoginBackground
          projectName={projectName}
          logoMain={logoMain}
          logoSecondary={logoSecondary}
          backgroundImage={backgroundImage}
          brandColors={brandColors}
          tagline={tagline}
        />
      )}
      <Box sx={{
        width: isMobile ? '100%' : '40%', 
        display: 'flex', 
        alignItems: 'center',
        justifyContent: 'center', 
        bgcolor: '#fafafa', 
        position: 'relative',
        p: 4, 
        overflowY: 'auto', 
        zIndex: 2
      }}>
        <RegisterForm
          brandColors={brandColors}
          isPasswordSetup={true}
          userData={userData}
          token={token}
        />
      </Box>
    </Box>
  )
}

export default RegisterPage