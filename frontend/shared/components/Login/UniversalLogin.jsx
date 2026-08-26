// /Users/oficina/MV-CRM/CustomerService/frontend/shared/components/Login/UniversalLogin.jsx
import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Box, useMediaQuery, useTheme, CircularProgress } from '@mui/material'
import { useAuth } from '../../context/AuthContext'
import { useTokenLogin } from '../../hooks/useTokenLogin'
import useProjectBranding, { getLocalizedValue } from '../../hooks/useProjectBranding'
import LoginBackground from './LoginBackground'
import LoginForm from './LoginForm'

// ✅ IMPORTS DEL TOUR
import TourButton from '../../tours/TourButton'
import { 
  getUniversalLoginTourSteps, 
  universalLoginTourConfig 
} from '../../tours/shared/universalLoginTour'

const loginTourOptions = {
  onNextClick: (driverObj) => driverObj.moveNext(),
  onPrevClick: (driverObj) => driverObj.movePrevious(),
}

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
  
  // ✅ Usamos 'common' que es donde pusimos las traducciones del tour
  const { i18n, t } = useTranslation('common')
  
  const { isProcessing } = useTokenLogin()
  const branding = useProjectBranding(projectSlug)

  const from = location.state?.from?.pathname || '/dashboard'

  useEffect(() => {
    if (isAuthenticated && user && !isProcessing) {
      navigate(from, { replace: true })
    }
  }, [isAuthenticated, user, from, navigate, isProcessing])

  const currentLang = i18n.language?.startsWith('es') ? 'es' : 'en'

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

  // ✅ Generamos los pasos de forma segura. Si falla, no crashea la app.
  let tourSteps = []
  try {
    tourSteps = getUniversalLoginTourSteps(t)
  } catch (error) {
    console.warn('⚠️ Error al generar pasos del tour:', error)
  }

  if (isProcessing || (branding.loading && projectSlug)) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#fafafa' }}>
        <CircularProgress sx={{ color: brandColors.primary }} />
      </Box>
    )
  }

  return (
    <Box id="universal-login-container" sx={{ minHeight: '100vh', display: 'flex', position: 'relative', overflow: 'hidden' }}>
      


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

      <Box sx={{ width: isMobile ? '100%' : '40%', display: 'flex', flexDirection: 'column', bgcolor: '#fafafa', position: 'relative' }}>
              {/* ✅ Renderizado seguro del botón del tour */}
      {tourSteps.length > 0 && (
        <Box sx={{ position: 'absolute', top: 24, left: 24, zIndex: 100 }}>
          <TourButton 
            tourId={universalLoginTourConfig.id}
            steps={tourSteps}
            label={t('tour.universalLogin.button', 'Ver guía de Inicio de Sesión')}
            options={loginTourOptions}
          />
        </Box>
      )}
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