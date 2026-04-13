import RegisterPage from '@shared/components/Register/RegisterPage'
import LogoMain from '../assets/logos/LOGO_MICHELANGELO_PNG_Mesa de trabajo 1.png'

const Register = () => (
  <RegisterPage
    projectName="Phase 2"
    logoMain={LogoMain}
    tagline="Phase 2"
    brandColors={{ primary: '#1A237E', secondary: '#00ACC1' }}
  />
)
export default Register