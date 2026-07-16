// /Users/oficina/MV-CRM/CustomerService/frontend/shared/components/Login/UniversalLogin.jsx
import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Box, useMediaQuery, useTheme, CircularProgress } from '@mui/material'
import { useAuth } from '../../context/AuthContext'
import { useTokenLogin } from '../../hooks/useTokenLogin'
// ✅ CORREGIDO: Importar tanto el hook como el helper
import useProjectBranding, { getLocalizedValue } from '../../hooks/useProjectBranding'
import LoginBackground from './LoginBackground'
import LoginForm from './LoginForm'

const UniversalLogin = ({ 
  projectName: fallbackProjectName,
  logoMain: fallbackLogoMain,
  logoSecondary: fallbackLogoSecondary,
  backgroundImage: fallbackBackgroundImage,
  tagline: fallbackTagline,
  brandColors: fallbackBrandColors,
  showFooter = false,
  Footer
}) => {
  const { isAuthenticated, user, projectSlug } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const { i18n } = useTranslation()
  
  const { isProcessing } = useTokenLogin()
  
  // ✅ Ahora sí está importado correctamente
  const branding = useProjectBranding(projectSlug)

  const from = location.state?.from?.pathname || '/dashboard'

  useEffect(() => {
    if (isAuthenticated && user && !isProcessing) {
      navigate(from, { replace: true })
    }
  }, [isAuthenticated, user, from, navigate, isProcessing])

  // ✅ Obtener idioma actual
  const currentLang = i18n.language?.startsWith('es') ? 'es' : 'en'

  // ✅ Usar valores localizados o fallback
  const projectName = getLocalizedValue(branding.title, currentLang) || fallbackProjectName || 'Project'
  const logoMain = branding.logo || fallbackLogoMain
  const logoSecondary = branding.logoSecondary || fallbackLogoSecondary
  const backgroundImage = branding.backgroundImage || fallbackBackgroundImage
  const tagline = getLocalizedValue(branding.subtitle, currentLang) || fallbackTagline || ''
  
  const brandColors = Object.keys(branding.brandColors).length > 0 
    ? branding.brandColors 
    : fallbackBrandColors || {
        primary: '#1A237E',
        secondary: '#00ACC1',
        gradient: 'linear-gradient(135deg, #1A237E 0%, #00ACC1 100%)'
      }

  if (isProcessing || (branding.loading && projectSlug)) {
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
        <CircularProgress sx={{ color: brandColors.primary }} />
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

      <Box
        sx={{
          width: isMobile ? '100%' : '40%',
          display: 'flex',
          flexDirection: 'column',
          bgcolor: '#fafafa',
          position: 'relative'
        }}
      >
        <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <LoginForm brandColors={brandColors} />
        </Box>

        {showFooter && Footer && (
          <Box sx={{ p: 2, borderTop: '1px solid #e0e0e0' }}>
            <Footer />
          </Box>
        )}
      </Box>
    </Box>
  )
}

export default UniversalLogin