// /shared/components/Login/UniversalLogin.jsx
import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Box, useMediaQuery, useTheme, CircularProgress } from '@mui/material'
import { useAuth } from '../../context/AuthContext'
import { useTokenLogin } from '../../hooks/useTokenLogin'
import LoginBackground from './LoginBackground'
import LoginForm from './LoginForm'

const UniversalLogin = ({ 
  projectName = 'Project',
  logoMain,
  logoSecondary,
  backgroundImage,
  tagline,
  brandColors = {
    primary: '#1A237E',
    secondary: '#00ACC1',
    gradient: 'linear-gradient(135deg, #1A237E 0%, #00ACC1 100%)'
  },
  Footer
}) => {
  const { isAuthenticated, user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  
  // Auto-login con token en URL
  const { isProcessing } = useTokenLogin()

const from = location.state?.from?.pathname || '/dashboard'

useEffect(() => {
  if (isAuthenticated && user && !isProcessing) {
    navigate(from, { replace: true })
  }
}, [isAuthenticated, user, from, navigate, isProcessing])

  // Mostrar loading mientras procesa el token
  if (isProcessing) {
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
    {/* Lado izquierdo - Background animado */}
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

    {/* Lado derecho - Formulario + Footer */}
    <Box
      sx={{
        width: isMobile ? '100%' : '40%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: '#fafafa',
        position: 'relative'
      }}
    >
      {/* Formulario ocupa el espacio principal */}
      <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <LoginForm brandColors={brandColors} />
      </Box>

      {/* Footer al final de la sección derecha */}
      {Footer && (
        <Box sx={{ p: 2, borderTop: '1px solid #e0e0e0' }}>
          <Footer />
        </Box>
      )}
    </Box>
  </Box>
)
}

export default UniversalLogin