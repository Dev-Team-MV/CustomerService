import UniversalLogin from '@shared/components/Login/UniversalLogin'
import LogoMain from '../assets/logos/LOGO_MICHELANGELO_PNG_Mesa de trabajo 1.png'  // Ajusta según tus assets

const Login = () => {
  return (
    <UniversalLogin
      projectName="Phase 2"
      logoMain={LogoMain}  // Ajusta según tus assets
      logoSecondary="../assets/logos/logo-phase2-secondary.png"  // Ajusta según tus assets
      backgroundImage="../assets/images/phase2-background.png"  // Ajusta según tus assets
      tagline="Modern Living"
      brandColors={{
        primary: '#1A237E',
        secondary: '#00ACC1',
        gradient: 'linear-gradient(135deg, #1A237E 0%, #00ACC1 100%)'
      }}
    />
  )
}

export default Login