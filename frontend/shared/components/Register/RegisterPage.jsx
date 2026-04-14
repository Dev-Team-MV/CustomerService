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
  const { t }      = useTranslation('auth')
  const theme      = useTheme()
  const isMobile   = useMediaQuery(theme.breakpoints.down('md'))

  const isPasswordSetup = !!token

  const [verifying,  setVerifying]  = useState(!!token)
  const [tokenError, setTokenError] = useState('')
  const [userData,   setUserData]   = useState(null)

  useEffect(() => {
    if (!isPasswordSetup) return
    api.get(`/auth/verify-setup-token/${token}`)
      .then(res => {
        if (res.data.valid && res.data.user) {
          const u = res.data.user
          const cleanPhone = (u.phoneNumber || '').replace(/^\+/, '').replace(/[\s\-\(\)]/g, '')
          setUserData({ ...u, phoneNumber: cleanPhone })
        } else {
          setTokenError(t('invalidOrExpiredLink'))
        }
      })
      .catch(err => setTokenError(err.response?.data?.message || t('invalidOrExpiredLink')))
      .finally(() => setVerifying(false))
  }, [token, isPasswordSetup, t])

  if (isPasswordSetup && verifying) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#fafafa' }}>
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress size={60} sx={{ color: brandColors.primary, mb: 2 }} />
          <Typography variant="h6" sx={{ color: '#706f6f', fontFamily: '"Poppins", sans-serif' }}>
            {t('verifyingSetupLink')}
          </Typography>
        </Box>
      </Box>
    )
  }

  if (isPasswordSetup && tokenError && !userData) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#fafafa', p: 3 }}>
        <Box sx={{ maxWidth: 500, width: '100%' }}>
          <Alert severity="error" sx={{ mb: 3, borderRadius: 3, fontFamily: '"Poppins", sans-serif' }}>
            {tokenError}
          </Alert>
          <Button fullWidth variant="contained" onClick={() => navigate('/login')}
            sx={{ borderRadius: 3, bgcolor: brandColors.primary, py: 1.5, fontFamily: '"Poppins", sans-serif', fontWeight: 600, letterSpacing: '1px', '&:hover': { bgcolor: brandColors.secondary } }}>
            {t('goToLogin')}
          </Button>
        </Box>
      </Box>
    )
  }

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
        width: isMobile ? '100%' : '40%', display: 'flex', alignItems: 'center',
        justifyContent: 'center', bgcolor: '#fafafa', position: 'relative',
        p: 4, overflowY: 'auto', zIndex: 2
      }}>
        <RegisterForm
          brandColors={brandColors}
          isPasswordSetup={isPasswordSetup}
          userData={userData}
          token={token}
        />
      </Box>
    </Box>
  )
}

export default RegisterPage