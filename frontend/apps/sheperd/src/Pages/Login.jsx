import UniversalLogin from '@shared/components/Login/UniversalLogin'
import logoSheperd from '../assets/react.svg'
import { BRAND } from '../theme'

const Login = () => {
  return (
    <UniversalLogin
      projectName="Sheperd"
      logoMain={logoSheperd}
      brandColors={{
        primary: BRAND.PRIMARY,
        secondary: BRAND.SECONDARY,
        gradient: BRAND.GRADIENT
      }}
      tagline="Property Management System"
    />
  )
}

export default Login