import RegisterPage from '@shared/components/Register/RegisterPage'
import LogoMain from '../assets/logos/LOGO_MICHELANGELO_PNG_Mesa de trabajo 1.png'

const Register = () => (
  <RegisterPage
    projectName="ISQ"
    logoMain={LogoMain}
    tagline="ISQ"
    brandColors={{ primary: '#6A1B9A', secondary: '#AB47BC' }}
  />
)
export default Register